import PlaylistBuilderModal from './PlaylistBuilderModal.jsx';
import { useState, useEffect, useMemo, useCallback, useRef, memo } from 'react';
import Icon from '../../components/Icon.jsx';
import { extractYoutubeId, isValidYoutubeUrl, getYoutubeThumbnailUrl } from '../../lib/youtube.js';
import { getCourses, COURSES, DEFAULT_COURSES, getPlaylists, syncPlaylistsFromServer } from '../../lib/courses.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import { assetUrl, adminApi } from '../../lib/api.js';
import { getToken, useAuth } from '../../lib/AuthContext.jsx';

// Helper to safely render strings or localized {en, mr} objects without React child errors
function safeStr(o) {
  if (!o) return '';
  if (typeof o === 'string') return o;
  if (typeof o === 'object') return o.en || o.mr || Object.values(o)[0] || '';
  return String(o);
}

export const SUGGESTED_PLAYLIST_TITLES = [
  'Business Ideas & Market Research',
  'Complete Business Planning Video Series',
  'Financial Management & Expense Tracking',
  'Digital Marketing & Social Media for Small Business',
  'Customer Sales & Repeat Business Mastery',
  'Computer & Excel Basics for Work and Business',
  'Spoken English for Confidence & Career',
  'Youth Leadership & Positive Mindset',
  'Rural Entrepreneurship & Government Schemes',
  'Practical Project & Task Guidelines',
  'WhatsApp Business & Online Selling',
  'Bookkeeping & Daily Accounts',
  'Interview Preparation & Communication Skills',
  'Social Media Branding & Content Creation',
];

export const PLAYLIST_CATEGORIES = [
  { key: 'entrepreneurship', label: 'Entrepreneurship' },
  { key: 'business', label: 'Business Guidance' },
  { key: 'digital', label: 'Digital Skills' },
  { key: 'education', label: 'Education & Skills' },
  { key: 'youth', label: 'Youth Development' },
  { key: 'social', label: 'Social Development' },
];

export const normalizeCourseCatKey = (rawCat) => {
  if (!rawCat) return 'entrepreneurship';
  const clean = String(rawCat).toLowerCase().trim();
  if (clean.includes('entrepreneur')) return 'entrepreneurship';
  if (clean.includes('business')) return 'business';
  if (clean.includes('digital')) return 'digital';
  if (clean.includes('education') || clean.includes('skill')) return 'education';
  if (clean.includes('youth')) return 'youth';
  if (clean.includes('social')) return 'social';
  return 'entrepreneurship';
};

// Small clean editable sequence number input for video cards
const VideoOrderInput = memo(function VideoOrderInput({
  value,
  total,
  onCommit,
  disabled = false,
}) {
  const [localVal, setLocalVal] = useState(String(value));

  useEffect(() => {
    setLocalVal(String(value));
  }, [value]);

  const commitChange = () => {
    const trimmed = String(localVal).trim();
    const parsed = parseInt(trimmed, 10);
    if (!trimmed || isNaN(parsed) || parsed < 1) {
      setLocalVal(String(value));
      return;
    }
    if (parsed === value) {
      setLocalVal(String(value));
      return;
    }
    onCommit(parsed);
  };

  const handleBlur = () => {
    commitChange();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      setLocalVal(String(value));
      e.currentTarget.blur();
    }
  };

  const handleChange = (e) => {
    const cleaned = e.target.value.replace(/[^0-9]/g, '');
    setLocalVal(cleaned);
  };

  return (
    <input
      type="text"
      inputMode="numeric"
      pattern="[0-9]*"
      disabled={disabled}
      value={localVal}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      title="Click to change video order number"
      aria-label="Video order number"
      className="w-10 h-8 sm:w-11 sm:h-8 text-center font-black text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 text-[#0F172A] hover:border-[#2563EB]/60 focus:bg-slate-50 focus:border-blue-200 focus:ring-2 focus:ring-[#2563EB]/30 focus:outline-none transition shrink-0 cursor-text shadow-2xs select-text"
    />
  );
});

export default function AdminPlaylistsPanel({
  api,
  course = null,
  courseId = null,
  onBack = null,
  isSubAdmin: propIsSubAdmin,
  isSuperAdmin: propIsSuperAdmin,
}) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const isSubAdmin = propIsSubAdmin !== undefined ? propIsSubAdmin : (user?.role === 'admin');
  const isSuperAdmin = propIsSuperAdmin !== undefined ? propIsSuperAdmin : (user?.role === 'super_admin');
  const clientApi = useMemo(() => api || adminApi(getToken()), [api]);

  const currentCourse = course || null;
  const currentCourseId = String(currentCourse?.id || currentCourse?.slug || courseId || '').trim();
  const currentCourseSlug = String(currentCourse?.slug || currentCourse?.id || courseId || '').trim();
  const currentCourseName = safeStr(currentCourse?.courseName || currentCourse?.title) || currentCourseSlug;
  const isScopedCourse = Boolean(currentCourseId || currentCourseSlug);

  // ── 1. MAIN STATE ──────────────────────────────────────────────────────────
  const [playlists, setPlaylists] = useState(() => {
    if (isSubAdmin) return [];
    return getPlaylists(isScopedCourse ? currentCourseSlug : undefined);
  });
  const [coursesList, setCoursesList] = useState(() => {
    if (isSubAdmin) return [];
    const local = typeof getCourses === 'function' ? getCourses() : [];
    return Array.isArray(local) && local.length > 0 ? local : (DEFAULT_COURSES || []);
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState(isScopedCourse ? currentCourseSlug : 'all');

  // Currently opened playlist for managing videos (null means showing playlists grid)
  const [activePlaylist, setActivePlaylist] = useState(null);

  // ── 2. MODAL & FORM STATES ────────────────────────────────────────────────
  // Playlist Create / Edit Modal (Unified with Videos Management)
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);

  // Width adjustable state: 'standard' (580px), 'wide' (840px), or 'full' (1080px)
  const [modalWidth, setModalWidth] = useState(() => {
    try {
      return localStorage.getItem('admin_create_playlist_modal_width') || 'wide';
    } catch {
      return 'wide';
    }
  });

  const handleWidthChange = (w) => {
    setModalWidth(w);
    try {
      localStorage.setItem('admin_create_playlist_modal_width', w);
    } catch { }
  };
  const [playlistModalTab, setPlaylistModalTab] = useState('basic'); // 'basic' | 'videos' | 'materials' | 'quiz'
  const [playlistForm, setPlaylistForm] = useState({
    courseId: '',
    title: '',
    category: 'entrepreneurship',
    level: 'Beginner',
    shortDescription: '',
    description: '',
    thumbnailUrl: '',
    isTrending: false,
    isFree: true,
    learn: '',
    requirements: '',
    resources: [],
    assessments: [],
    assessmentSettings: { enabled: true },
    videos: [],
  });
  const [uploadingPlaylistThumb, setUploadingPlaylistThumb] = useState(false);
  const playlistFileInputRef = useRef(null);
  const [isManualCourse, setIsManualCourse] = useState(false);
  const [manualCourseInput, setManualCourseInput] = useState('');

  // Study Materials state in modal
  const [panelNoteTitle, setPanelNoteTitle] = useState('');
  const [panelNoteTargetVideo, setPanelNoteTargetVideo] = useState('all');
  const [panelNoteFile, setPanelNoteFile] = useState(null);
  const [uploadingPanelNote, setUploadingPanelNote] = useState(false);
  const [panelNoteError, setPanelNoteError] = useState('');
  const panelNoteInputRef = useRef(null);

  // Quiz Builder state in modal
  const [panelQuizQuestion, setPanelQuizQuestion] = useState('');
  const [panelQuizType, setPanelQuizType] = useState('mcq');
  const [panelQuizTargetVideo, setPanelQuizTargetVideo] = useState('all');
  const [panelQuizOptions, setPanelQuizOptions] = useState(['', '', '', '']);
  const [panelQuizCorrectAnswer, setPanelQuizCorrectAnswer] = useState(0);
  const [panelQuizExplanation, setPanelQuizExplanation] = useState('');
  const [panelQuizTriggerType, setPanelQuizTriggerType] = useState('end');
  const [panelQuizTriggerMinutes, setPanelQuizTriggerMinutes] = useState(1);
  const [panelQuizTriggerSeconds, setPanelQuizTriggerSeconds] = useState(0);
  const [panelQuizError, setPanelQuizError] = useState('');

  // Video Add / Edit Modal
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [videoFormContext, setVideoFormContext] = useState('activePlaylist'); // 'activePlaylist' | 'playlistModal'
  const [videoFormChapters, setVideoFormChapters] = useState([]);
  const [newVideoChapterTitle, setNewVideoChapterTitle] = useState('');
  const [newVideoChapterTime, setNewVideoChapterTime] = useState('');
  const [newVideoChapterMin, setNewVideoChapterMin] = useState('');
  const [newVideoChapterSec, setNewVideoChapterSec] = useState('');
  const [editingVideoChapterId, setEditingVideoChapterId] = useState(null);
  const [editVideoChapterTitle, setEditVideoChapterTitle] = useState('');
  const [editVideoChapterMin, setEditVideoChapterMin] = useState('');
  const [editVideoChapterSec, setEditVideoChapterSec] = useState('');
  const [videoForm, setVideoForm] = useState({
    title: '',
    youtubeUrl: '',
    description: '',
    duration: '',
    thumbnailUrl: '',
    chapters: [],
    notesUrl: null,
    notesName: null,
    notesSize: null,
    notesExt: null,
  });

  // Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [modalDraggedIndex, setModalDraggedIndex] = useState(null);
  const [modalDragOverIndex, setModalDragOverIndex] = useState(null);

  // View mode when at the root level (Playlists vs Video Library)
  const [activeMainTab, setActiveMainTab] = useState('playlists'); // 'playlists' | 'library'
  const [librarySearch, setLibrarySearch] = useState('');

  // Add Existing Video to Playlist Modal State
  const [addToPlaylistModalOpen, setAddToPlaylistModalOpen] = useState(false);
  const [targetVideoForPlaylist, setTargetVideoForPlaylist] = useState(null);
  const [selectedTargetPlaylistId, setSelectedTargetPlaylistId] = useState('');
  const [targetVideoPosition, setTargetVideoPosition] = useState(1);
  const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);

  // Add Existing Videos (Bulk / Picker) to Active Playlist Modal State
  const [addExistingModalOpen, setAddExistingModalOpen] = useState(false);
  const [selectedExistingVideoIds, setSelectedExistingVideoIds] = useState([]);
  const [existingVideosSearch, setExistingVideosSearch] = useState('');
  const [existingVideosInsertPos, setExistingVideosInsertPos] = useState(1);
  const [isSubmittingExisting, setIsSubmittingExisting] = useState(false);

  // Video Answer Submissions Modal State
  const [submissionsModalOpen, setSubmissionsModalOpen] = useState(false);
  const [submissionVideoTarget, setSubmissionVideoTarget] = useState(null);
  const [videoSubmissions, setVideoSubmissions] = useState([]);
  const [loadingVideoSubmissions, setLoadingVideoSubmissions] = useState(false);

  // Reviewing Submission State inside Video Submissions Modal
  const [reviewingVideoSubmission, setReviewingVideoSubmission] = useState(null);
  const [videoReviewFeedback, setVideoReviewFeedback] = useState('');
  const [savingVideoReview, setSavingVideoReview] = useState(false);

  // In-app preview for submissions
  const [previewSubmissionFile, setPreviewSubmissionFile] = useState(null); // { url, name, type }

  // Saving & Feedback
  const [isSaving, setIsSaving] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  const showFeedback = (message, type = 'success') => {
    setActionFeedback({ message, type });
    setTimeout(() => setActionFeedback(null), 3800);
  };

  const panelMatchingCourses = useMemo(() => {
    const cat = playlistForm.category;
    if (!cat) return [];
    return coursesList.filter(
      (c) => normalizeCourseCatKey(c.category) === cat
    );
  }, [coursesList, playlistForm.category]);

  const handlePanelCategoryChange = (newCat) => {
    setPlaylistForm((prev) => ({
      ...prev,
      category: newCat,
      courseId: '',
    }));
  };

  const handlePanelCourseChange = (courseIdVal) => {
    const chosen = coursesList.find((c) => (c.id && c.id === courseIdVal) || (c.slug && c.slug === courseIdVal));
    setPlaylistForm((prev) => ({
      ...prev,
      courseId: courseIdVal,
      category: chosen?.category ? normalizeCourseCatKey(chosen.category) : prev.category,
    }));
  };

  // ── 3. DATA LOADING ────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Load courses
      let remoteCourses = null;
      try {
        if (typeof clientApi?.getCourses === 'function') {
          remoteCourses = await clientApi.getCourses().catch(() => null);
        }
        if (!Array.isArray(remoteCourses) && !isSubAdmin) {
          const res = await fetch('/api/courses').catch(() => null);
          if (res?.ok) {
            const data = await res.json().catch(() => null);
            if (Array.isArray(data)) remoteCourses = data;
          }
        }
      } catch (e) {
        console.warn('Courses fetch notice:', e?.message);
      }

      const courseMap = new Map();

      if (!isSubAdmin) {
        // (a) First, seed all built-in standard courses for super admins
        (DEFAULT_COURSES || []).forEach((c) => {
          if (!c) return;
          const key = String(c.id || c.slug || c._id || '').toLowerCase();
          if (key) courseMap.set(key, c);
        });

        // (b) Next, add stored courses from localStorage
        try {
          const localCourses = typeof getCourses === 'function' ? getCourses() : [];
          (localCourses || []).forEach((c) => {
            if (!c) return;
            const key = String(c.id || c.slug || c._id || '').toLowerCase();
            if (key) {
              courseMap.set(key, { ...(courseMap.get(key) || {}), ...c });
            }
          });
        } catch { }
      }

      // (c) Merge remote courses from database if loaded
      if (Array.isArray(remoteCourses)) {
        remoteCourses.forEach((c) => {
          if (!c) return;
          const key = String(c.id || c.slug || c._id || '').toLowerCase();
          if (key) {
            courseMap.set(key, { ...(courseMap.get(key) || {}), ...c });
          }
        });
      }

      // (d) Seed currently scoped course if provided
      if (currentCourse) {
        const key = String(currentCourseId || currentCourseSlug).toLowerCase();
        if (key) {
          courseMap.set(key, {
            ...(courseMap.get(key) || {}),
            ...currentCourse,
            id: currentCourseId,
            slug: currentCourseSlug,
            courseName: currentCourseName,
          });
        }
      }

      if (!isSubAdmin) {
        // (e) Also include any courses already referenced in existing playlists
        try {
          const existingPls = getPlaylists() || [];
          existingPls.forEach((pl) => {
            const key = String(pl.courseId || pl.courseSlug || '').toLowerCase();
            if (key && !courseMap.has(key)) {
              courseMap.set(key, {
                id: pl.courseId || pl.courseSlug,
                slug: pl.courseSlug || pl.courseId,
                title: pl.courseName || pl.courseId,
                courseName: pl.courseName || pl.courseId,
              });
            }
          });
        } catch { }
      }

      const allCourses = Array.from(courseMap.values()).filter(c => {
        const s = String(c?.slug || '').toLowerCase().trim();
        const n = String(safeStr(c?.courseName || c?.title)).toLowerCase().trim();
        return s !== 'xcfgh' && s !== 'learning-videos' && n !== 'xcfgh' && n !== 'learning videos';
      });
      setCoursesList(isSubAdmin ? allCourses : (allCourses.length > 0 ? allCourses : (DEFAULT_COURSES || [])));

      // 2. Load playlists
      try {
        let pls = null;
        if (typeof clientApi?.getPlaylists === 'function') {
          pls = await clientApi.getPlaylists(isScopedCourse ? currentCourseSlug : undefined).catch(() => null);
        }
        if (!Array.isArray(pls) && !isSubAdmin) {
          if (isScopedCourse) {
            const res = await fetch(`/api/courses/${encodeURIComponent(currentCourseSlug)}/playlists`).catch(() => null);
            if (res?.ok) {
              const data = await res.json().catch(() => null);
              if (Array.isArray(data)) pls = data;
            }
          }
        }

        if (Array.isArray(pls)) {
          if (!isSubAdmin) {
            syncPlaylistsFromServer(pls, isScopedCourse ? currentCourseSlug : null);
          }
          setPlaylists(pls);
          if (activePlaylist) {
            const updated = pls.find((p) => p.id === activePlaylist.id);
            if (updated) setActivePlaylist(updated);
          }
        } else if (!isSubAdmin) {
          const local = getPlaylists(isScopedCourse ? currentCourseSlug : undefined);
          setPlaylists(local);
          if (activePlaylist) {
            const updated = local.find((p) => p.id === activePlaylist.id);
            if (updated) setActivePlaylist(updated);
          }
        } else {
          setPlaylists([]);
        }
      } catch (err) {
        console.warn('Backend getPlaylists notice:', err?.message);
        if (isSubAdmin) {
          setPlaylists([]);
        } else {
          const local = getPlaylists(isScopedCourse ? currentCourseSlug : undefined);
          setPlaylists(local);
        }
      }
    } catch (err) {
      console.warn('Playlist load notice:', err);
      if (isSubAdmin) {
        setPlaylists([]);
      } else {
        const local = getPlaylists(isScopedCourse ? currentCourseSlug : undefined);
        setPlaylists(local);
      }
    } finally {
      setLoading(false);
    }
  }, [clientApi, activePlaylist?.id, isScopedCourse, currentCourseSlug, currentCourseId, currentCourseName, currentCourse, isSubAdmin]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Total stats
  const stats = useMemo(() => {
    const list = Array.isArray(playlists) ? playlists : [];
    const totalPlaylists = list.length;
    const totalVideos = list.reduce((acc, p) => acc + (p?.videos?.length || p?.videoCount || 0), 0);
    const uniqueCourses = new Set(list.map((p) => p?.courseSlug || p?.courseId).filter(Boolean)).size;
    return { totalPlaylists, totalVideos, uniqueCourses };
  }, [playlists]);

  // Filtered playlists
  const filteredPlaylists = useMemo(() => {
    if (!Array.isArray(playlists)) return [];
    return playlists.filter((pl) => {
      if (!pl) return false;
      if (isScopedCourse) {
        const pId = String(pl.courseId || '').toLowerCase().trim();
        const pSlug = String(pl.courseSlug || '').toLowerCase().trim();
        const cId = currentCourseId.toLowerCase();
        const cSlug = currentCourseSlug.toLowerCase();
        const matchCourse =
          pId === cId ||
          pSlug === cSlug ||
          pId === cSlug ||
          pSlug === cId;
        if (!matchCourse) return false;
      } else if (selectedCourseFilter !== 'all') {
        const matchCourse =
          pl.courseId === selectedCourseFilter ||
          pl.courseSlug === selectedCourseFilter;
        if (!matchCourse) return false;
      }
      const s = search.toLowerCase().trim();
      const pTitle = safeStr(pl.title).toLowerCase();
      const pDesc = safeStr(pl.description).toLowerCase();
      const pCourse = safeStr(pl.courseName || pl.courseSlug).toLowerCase();
      const matchSearch = !s || pTitle.includes(s) || pDesc.includes(s) || pCourse.includes(s);
      return matchSearch;
    });
  }, [playlists, selectedCourseFilter, search, isScopedCourse, currentCourseId, currentCourseSlug]);

  // Compute all unique existing videos across playlists and course lessons (The Video Library)
  const allLibraryVideos = useMemo(() => {
    const videoMap = new Map();

    // 1. Gather all videos from all playlists
    (playlists || []).forEach((pl) => {
      (pl.videos || []).forEach((v) => {
        const key = v.youtubeVideoId || v.youtubeUrl || v.id;
        if (!key) return;
        const normalizedKey = String(key).trim().toLowerCase();
        if (!videoMap.has(normalizedKey)) {
          videoMap.set(normalizedKey, {
            id: v.id,
            title: safeStr(v.title),
            description: safeStr(v.description) || '',
            youtubeUrl: v.youtubeUrl,
            youtubeVideoId: v.youtubeVideoId,
            thumbnailUrl:
              v.thumbnailUrl ||
              (v.youtubeVideoId ? `https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg` : ''),
            duration: v.duration || '',
            playlists: [pl],
          });
        } else {
          const entry = videoMap.get(normalizedKey);
          if (!entry.playlists.some((p) => p.id === pl.id)) {
            entry.playlists.push(pl);
          }
        }
      });
    });

    // 2. Also gather any lessons from coursesList that have YouTube videos
    (coursesList || []).forEach((c) => {
      (c.lessons || []).forEach((l) => {
        const ytId = l.youtubeVideoId || extractYoutubeId(l.youtubeUrl || l.youtube);
        if (!ytId) return;
        const normalizedKey = String(ytId).trim().toLowerCase();
        if (!videoMap.has(normalizedKey)) {
          videoMap.set(normalizedKey, {
            id: l.id || `lesson-${ytId}`,
            title: safeStr(l.title || l.t),
            description: safeStr(l.description || l.desc) || '',
            youtubeUrl: l.youtubeUrl || `https://www.youtube.com/watch?v=${ytId}`,
            youtubeVideoId: ytId,
            thumbnailUrl: l.thumbnailUrl || l.thumbnail || `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
            duration: l.duration || (l.min ? `${l.min}:00` : ''),
            playlists: [],
          });
        }
      });
    });

    return Array.from(videoMap.values());
  }, [playlists, coursesList]);

  // Filtered Video Library
  const filteredLibraryVideos = useMemo(() => {
    if (!librarySearch.trim()) return allLibraryVideos;
    const s = librarySearch.toLowerCase().trim();
    return allLibraryVideos.filter(
      (v) =>
        v.title.toLowerCase().includes(s) ||
        v.description.toLowerCase().includes(s) ||
        v.youtubeVideoId.toLowerCase().includes(s) ||
        v.playlists.some((p) => safeStr(p.title).toLowerCase().includes(s))
    );
  }, [allLibraryVideos, librarySearch]);

  // All videos in library not yet added to activePlaylist
  const availableVideosForActive = useMemo(() => {
    if (!activePlaylist) return [];
    const activeKeys = new Set(
      (activePlaylist.videos || []).map((v) =>
        String(v.youtubeVideoId || v.youtubeUrl || v.id).trim().toLowerCase()
      )
    );
    return allLibraryVideos.filter((v) => {
      const k = String(v.youtubeVideoId || v.youtubeUrl || v.id).trim().toLowerCase();
      return !activeKeys.has(k);
    });
  }, [activePlaylist, allLibraryVideos]);

  // Filtered available videos by search inside Add Existing modal
  const filteredAvailableVideos = useMemo(() => {
    if (!existingVideosSearch.trim()) return availableVideosForActive;
    const s = existingVideosSearch.toLowerCase().trim();
    return availableVideosForActive.filter(
      (v) =>
        safeStr(v.title).toLowerCase().includes(s) ||
        safeStr(v.description).toLowerCase().includes(s) ||
        String(v.youtubeVideoId || '').toLowerCase().includes(s)
    );
  }, [availableVideosForActive, existingVideosSearch]);

  const targetPlaylistObj = useMemo(
    () => playlists.find((p) => p.id === selectedTargetPlaylistId),
    [playlists, selectedTargetPlaylistId]
  );

  const isAlreadyInSelectedPlaylist = useMemo(() => {
    if (!targetPlaylistObj || !targetVideoForPlaylist) return false;
    return Boolean(
      targetPlaylistObj.videos?.some(
        (v) =>
          (v.youtubeVideoId && v.youtubeVideoId === targetVideoForPlaylist.youtubeVideoId) ||
          (v.youtubeUrl && v.youtubeUrl === targetVideoForPlaylist.youtubeUrl) ||
          v.id === targetVideoForPlaylist.id
      )
    );
  }, [targetPlaylistObj, targetVideoForPlaylist]);

  const suggestedNextPosition = (targetPlaylistObj?.videos?.length || 0) + 1;

  // ── 4. PLAYLIST CREATION & EDITING ─────────────────────────────────────────
  const handleOpenCreatePlaylist = () => {
    setEditingPlaylist(null);
    setPlaylistModalTab('basic');
    setIsManualCourse(false);
    setManualCourseInput(isScopedCourse ? currentCourseName : '');
    const defaultCourse = isScopedCourse
      ? (currentCourse || { id: currentCourseId, slug: currentCourseSlug, title: currentCourseName })
      : coursesList.find((c) => /business|bussiness|finance/i.test(String(c.slug || c.id || c.courseName || ''))) ||
      coursesList[0];
    setPlaylistForm({
      courseId: isScopedCourse ? (currentCourseId || currentCourseSlug) : '',
      title: '',
      category: defaultCourse?.category || 'entrepreneurship',
      level: defaultCourse?.level || 'Beginner',
      shortDescription: '',
      description: '',
      thumbnailUrl: '',
      isTrending: false,
      isFree: true,
      learn: '',
      requirements: '',
      resources: [],
      assessments: [],
      assessmentSettings: { enabled: true },
      videos: [],
    });
    setPanelNoteTitle('');
    setPanelNoteTargetVideo('all');
    setPanelNoteFile(null);
    setPanelNoteError('');
    setPanelQuizQuestion('');
    setPanelQuizOptions(['', '', '', '']);
    setPanelQuizCorrectAnswer(0);
    setPanelQuizExplanation('');
    setPanelQuizTriggerType('end');
    setPanelQuizError('');
    setPlaylistModalOpen(true);
  };

  const handleOpenEditPlaylist = (pl) => {
    setEditingPlaylist(pl);
    setPlaylistModalTab('basic');
    const matched = coursesList.find(
      (c) =>
        (c.id && c.id === pl.courseId) ||
        (c.slug && (c.slug === pl.courseId || c.slug === pl.courseSlug)) ||
        (pl.courseName && safeStr(c.courseName || c.title).toLowerCase() === String(pl.courseName).toLowerCase())
    );

    const plLearn = Array.isArray(pl.learn) ? pl.learn.join('\n') : (typeof pl.learn === 'string' ? pl.learn : '');
    const plReqs = Array.isArray(pl.requirements) ? pl.requirements.join('\n') : (typeof pl.requirements === 'string' ? pl.requirements : '');

    const baseData = {
      courseId: matched ? (matched.id || matched.slug) : (pl.courseId || pl.courseSlug || ''),
      title: safeStr(pl.title) || '',
      category: pl.category || matched?.category || 'entrepreneurship',
      level: pl.level || (typeof matched?.level === 'string' ? matched.level : 'Beginner') || 'Beginner',
      shortDescription: pl.shortDescription || matched?.shortDescription || '',
      description: safeStr(pl.description) || '',
      thumbnailUrl: pl.thumbnailUrl || '',
      isTrending: Boolean(pl.isTrending),
      isFree: pl.isFree !== undefined ? Boolean(pl.isFree) : true,
      learn: plLearn,
      requirements: plReqs,
      resources: Array.isArray(pl.resources) ? [...pl.resources] : [],
      assessments: Array.isArray(pl.assessments) ? [...pl.assessments] : [],
      assessmentSettings: pl.assessmentSettings || { enabled: true },
      videos: Array.isArray(pl.videos) ? [...pl.videos] : [],
    };

    if (matched) {
      setIsManualCourse(false);
      setManualCourseInput(safeStr(matched.courseName || matched.title) || matched.slug);
    } else {
      const cLabel = pl.courseName || pl.courseId || pl.courseSlug || '';
      setIsManualCourse(true);
      setManualCourseInput(cLabel);
    }
    setPlaylistForm(baseData);
    setPanelNoteTitle('');
    setPanelNoteTargetVideo('all');
    setPanelNoteFile(null);
    setPanelNoteError('');
    setPanelQuizQuestion('');
    setPanelQuizOptions(['', '', '', '']);
    setPanelQuizCorrectAnswer(0);
    setPanelQuizExplanation('');
    setPanelQuizTriggerType('end');
    setPanelQuizError('');
    setPlaylistModalOpen(true);
  };

  // Upload custom thumbnail image from device for playlist
  const handleUploadPlaylistThumbnail = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP, GIF).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Image file size must be less than 10MB.');
      return;
    }

    setUploadingPlaylistThumb(true);
    try {
      let uploadedUrl = null;
      if (typeof clientApi?.uploadThumbnail === 'function') {
        const res = await clientApi.uploadThumbnail(file);
        if (res?.thumbnailUrl || res?.url) {
          uploadedUrl = res.thumbnailUrl || res.url;
        }
      }

      // If no backend endpoint or upload failed, create local Data URL fallback
      if (!uploadedUrl) {
        uploadedUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }

      setPlaylistForm((prev) => ({ ...prev, thumbnailUrl: uploadedUrl }));
      showFeedback('Playlist thumbnail uploaded successfully!');
    } catch (err) {
      console.warn('Backend upload failed, attempting local preview fallback:', err);
      try {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        setPlaylistForm((prev) => ({ ...prev, thumbnailUrl: dataUrl }));
        showFeedback('Thumbnail loaded from device!');
      } catch (fallbackErr) {
        alert('Failed to upload thumbnail: ' + (err.message || 'Unknown error'));
      }
    } finally {
      setUploadingPlaylistThumb(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleSavePlaylist = async (e) => {
    if (e) e.preventDefault();
    if (!playlistForm.title.trim()) {
      alert('Playlist title is required');
      return;
    }

    let finalCourseId = '';
    let finalCourseSlug = '';
    let finalCourseName = '';

    if (isScopedCourse) {
      finalCourseId = currentCourseId || currentCourseSlug;
      finalCourseSlug = currentCourseSlug || currentCourseId;
      finalCourseName = currentCourseName;
    } else if (isManualCourse) {
      const typed = manualCourseInput.trim();
      if (!typed) {
        alert('Please enter an associated course name');
        return;
      }

      // Check if typed course matches any existing course in coursesList
      const matched = coursesList.find(
        (c) =>
          safeStr(c.courseName || c.title).toLowerCase() === typed.toLowerCase() ||
          String(c.slug || '').toLowerCase() === typed.toLowerCase() ||
          String(c.id || '').toLowerCase() === typed.toLowerCase()
      );

      if (matched) {
        finalCourseId = matched.id || matched.slug;
        finalCourseSlug = matched.slug || finalCourseId;
        finalCourseName = safeStr(matched.courseName || matched.title) || typed;
      } else {
        finalCourseSlug =
          typed
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '') || 'custom-course';
        finalCourseId = finalCourseSlug;
        finalCourseName = typed;

        // Register new course object into coursesList immediately with appropriate business metadata if applicable
        const isBiz = /business|bussiness|finance/i.test(typed);
        const newCourseObj = {
          id: finalCourseId,
          _id: finalCourseId,
          slug: finalCourseSlug,
          title: { en: typed, mr: typed },
          courseName: typed,
          category: isBiz ? 'business' : 'custom',
          shortDescription: isBiz
            ? 'Plan, budget, track expenses and manage cash flow with simple practical tools to reduce costs, increase profitability, and grow your business.'
            : '',
          learn: isBiz
            ? [
              'Understand the importance of tracking business expenses.',
              'Identify and reduce unnecessary costs.',
              'Improve resource utilization and operational efficiency.',
              'Apply basic cost management techniques.',
              'Understand how expense control helps increase business profitability.',
            ]
            : [],
          requirements: isBiz
            ? [
              'An interest in entrepreneurship and business growth is recommended.',
              'A willingness to learn about expense management and profitability.',
              'Students should watch the complete video and attempt the assessment questions.',
            ]
            : [],
          lessons: [],
        };
        setCoursesList((prev) => [newCourseObj, ...prev.filter((c) => c.slug !== finalCourseSlug)]);
      }
    } else {
      if (!playlistForm.courseId) {
        const fallbackCourse = coursesList[0] || null;
        finalCourseName = safeStr(fallbackCourse?.courseName || fallbackCourse?.title) || 'General';
        finalCourseSlug = fallbackCourse?.slug || fallbackCourse?.id || 'general';
        finalCourseId = fallbackCourse?.id || fallbackCourse?.slug || 'general';
      } else {
        const selectedCourse = coursesList.find(
          (c) => (c.id && c.id === playlistForm.courseId) || (c.slug && c.slug === playlistForm.courseId)
        );
        finalCourseName = selectedCourse ? safeStr(selectedCourse.courseName || selectedCourse.title) : playlistForm.courseId;
        finalCourseSlug = selectedCourse?.slug || playlistForm.courseId;
        finalCourseId = playlistForm.courseId;
      }
    }

    setIsSaving(true);
    try {
      // Auto thumbnail from first video if blank
      let autoThumb = playlistForm.thumbnailUrl?.trim();
      if (!autoThumb && playlistForm.videos.length > 0) {
        autoThumb = playlistForm.videos[0].thumbnailUrl;
      }

      const parsedLearn = typeof playlistForm.learn === 'string'
        ? playlistForm.learn.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
        : (Array.isArray(playlistForm.learn) ? playlistForm.learn : []);

      const parsedRequirements = typeof playlistForm.requirements === 'string'
        ? playlistForm.requirements.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean)
        : (Array.isArray(playlistForm.requirements) ? playlistForm.requirements : []);

      const payload = {
        courseId: finalCourseId,
        courseSlug: finalCourseSlug,
        title: playlistForm.title.trim(),
        category: playlistForm.category || 'entrepreneurship',
        level: playlistForm.level || 'Beginner',
        shortDescription: playlistForm.shortDescription?.trim() || null,
        description: playlistForm.description?.trim() || null,
        thumbnailUrl: autoThumb || null,
        isTrending: Boolean(playlistForm.isTrending),
        isFree: Boolean(playlistForm.isFree),
        learn: parsedLearn,
        requirements: parsedRequirements,
        resources: Array.isArray(playlistForm.resources) ? playlistForm.resources : [],
        assessments: Array.isArray(playlistForm.assessments) ? playlistForm.assessments : [],
        assessmentSettings: playlistForm.assessmentSettings || { enabled: true },
        videos: playlistForm.videos.map((v, i) => ({
          title: v.title,
          youtubeUrl: v.youtubeUrl,
          description: v.description || null,
          thumbnailUrl: v.thumbnailUrl || null,
          duration: v.duration || null,
          displayOrder: i,
          chapters: Array.isArray(v.chapters) ? v.chapters : null,
        })),
      };

      let saved = null;
      if (typeof clientApi?.createPlaylist === 'function') {
        if (editingPlaylist && editingPlaylist.id && !editingPlaylist.id.startsWith('pl-')) {
          saved = await clientApi.updatePlaylist(editingPlaylist.id, payload);
        } else {
          saved = await clientApi.createPlaylist(payload);
        }
      }

      if (saved && saved.id) {
        await loadData();
        showFeedback(editingPlaylist ? 'Playlist updated successfully!' : 'New playlist created with videos!');
        setPlaylistModalOpen(false);
        return;
      }

      // Update local storage & state fallback
      const currentList = getPlaylists();
      let updatedList = [];
      const plId = editingPlaylist?.id || 'pl-' + Date.now();

      const finalPlaylistObj = {
        ...(editingPlaylist || {}),
        ...(saved || {}),
        id: plId,
        courseId: finalCourseId,
        courseSlug: finalCourseSlug,
        courseName: finalCourseName,
        title: playlistForm.title.trim(),
        category: playlistForm.category || 'entrepreneurship',
        level: playlistForm.level || 'Beginner',
        shortDescription: playlistForm.shortDescription?.trim() || '',
        description: playlistForm.description?.trim() || '',
        thumbnailUrl: autoThumb || '',
        isTrending: Boolean(playlistForm.isTrending),
        isFree: Boolean(playlistForm.isFree),
        learn: parsedLearn,
        requirements: parsedRequirements,
        resources: Array.isArray(playlistForm.resources) ? playlistForm.resources : [],
        assessments: Array.isArray(playlistForm.assessments) ? playlistForm.assessments : [],
        assessmentSettings: playlistForm.assessmentSettings || { enabled: true },
        videoCount: playlistForm.videos.length,
        videos: playlistForm.videos.map((v, i) => ({
          ...v,
          id: v.id || `vid-${plId}-${i}`,
          playlistId: plId,
          displayOrder: i,
        })),
      };

      if (editingPlaylist) {
        updatedList = currentList.map((p) => (p.id === editingPlaylist.id ? finalPlaylistObj : p));
      } else {
        updatedList = [...currentList, finalPlaylistObj];
      }

      syncPlaylistsFromServer(updatedList, isScopedCourse ? currentCourseSlug : null);
      setPlaylists(updatedList);

      if (activePlaylist?.id === finalPlaylistObj.id) {
        setActivePlaylist(finalPlaylistObj);
      }

      showFeedback(editingPlaylist ? 'Playlist updated successfully!' : 'New playlist created with videos!');
      setPlaylistModalOpen(false);
    } catch (err) {
      console.error('Save playlist error:', err);
      alert('Failed to save playlist: ' + (err?.message || 'Server error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePlaylist = async (pl) => {
    const confirmMsg =
      t('admin.playlists.confirmDeletePlaylist') ||
      `Are you sure you want to delete playlist "${safeStr(pl.title)}"? All its videos will also be deleted.`;
    if (!window.confirm(confirmMsg)) return;

    try {
      if (typeof clientApi?.deletePlaylist === 'function' && pl.id && !pl.id.startsWith('pl-')) {
        await clientApi.deletePlaylist(pl.id);
      }
      await loadData();
      if (!isSubAdmin) {
        const updatedList = getPlaylists(isScopedCourse ? currentCourseSlug : undefined).filter((p) => p.id !== pl.id);
        syncPlaylistsFromServer(updatedList, isScopedCourse ? currentCourseSlug : null);
        setPlaylists(updatedList);
      } else {
        setPlaylists((prev) => prev.filter((p) => p.id !== pl.id));
      }
      if (activePlaylist?.id === pl.id) {
        setActivePlaylist(null);
      }
      showFeedback('Playlist deleted successfully.');
    } catch (err) {
      console.error('Delete playlist error:', err);
      alert('Failed to delete playlist: ' + (err?.message || 'Server error'));
    }
  };

  // 1-Click Trending Toggle on Playlist Cards
  const handleToggleTrending = async (pl) => {
    const nextState = !pl.isTrending;
    // Optimistic update
    setPlaylists((prev) =>
      prev.map((item) => (item.id === pl.id ? { ...item, isTrending: nextState } : item))
    );
    try {
      const client = api || adminApi(getToken());
      if (typeof client?.updatePlaylist === 'function') {
        await client.updatePlaylist(pl.id, { isTrending: nextState });
      } else {
        await fetch(resolveApiPath(`/admin/playlists/${encodeURIComponent(pl.id)}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ isTrending: nextState }),
        });
      }
      showFeedback(nextState ? '✓ Playlist featured in Homepage Trending!' : 'Playlist removed from Trending.');
    } catch (err) {
      console.error('Failed to toggle playlist trending:', err);
      // Revert on error
      setPlaylists((prev) =>
        prev.map((item) => (item.id === pl.id ? { ...item, isTrending: pl.isTrending } : item))
      );
      alert('Failed to update trending status.');
    }
  };

  const [uploadingVideoThumb, setUploadingVideoThumb] = useState(false);
  const handleUploadCustomVideoThumb = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WEBP).');
      return;
    }
    setUploadingVideoThumb(true);
    try {
      const fd = new FormData();
      fd.append('thumbnail', file);
      const res = await fetch(resolveApiPath('/admin/upload-thumbnail'), {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: fd,
      });
      if (!res.ok) throw new Error('Failed to upload thumbnail');
      const data = await res.json();
      const uploadedUrl = data.thumbnailUrl || data.url;
      setVideoForm((prev) => ({ ...prev, thumbnailUrl: uploadedUrl }));
      showFeedback('✓ Custom thumbnail uploaded successfully!');
    } catch (err) {
      alert(err.message || 'Failed to upload thumbnail');
    } finally {
      setUploadingVideoThumb(false);
      e.target.value = '';
    }
  };

  const [uploadingVideoNote, setUploadingVideoNote] = useState(false);
  const handleUploadVideoNote = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i.test(file.name);
    if (!allowed) {
      alert('Only PDF, DOC, DOCX, XLS, XLSX, PPT, and PPTX files are allowed.');
      e.target.value = '';
      return;
    }
    setUploadingVideoNote(true);
    try {
      let uploadedData = null;
      if (typeof clientApi?.uploadCourseNote === 'function') {
        uploadedData = await clientApi.uploadCourseNote(file);
      } else {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(resolveApiPath('/admin/courses/upload-note'), {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
          body: fd,
        });
        if (!res.ok) throw new Error('Upload failed');
        uploadedData = await res.json();
      }
      const fileUrl = uploadedData?.file || uploadedData?.url;
      const fileName = uploadedData?.name || uploadedData?.title || file.name;
      const fileSize = uploadedData?.size || `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      const fileExt = uploadedData?.ext || file.name.split('.').pop()?.toUpperCase() || 'PDF';

      setVideoForm((prev) => ({
        ...prev,
        notesUrl: fileUrl,
        notesName: fileName,
        notesSize: fileSize,
        notesExt: fileExt,
      }));
      showFeedback('✓ Study note uploaded successfully!');
    } catch (err) {
      console.error('Failed to upload video note:', err);
      alert(err.message || 'Failed to upload note');
    } finally {
      setUploadingVideoNote(false);
      e.target.value = '';
    }
  };

  const handleRemoveVideoNote = () => {
    setVideoForm((prev) => ({
      ...prev,
      notesUrl: null,
      notesName: null,
      notesSize: null,
      notesExt: null,
    }));
  };

  // ── 5. VIDEO ADD & EDIT OPERATIONS ─────────────────────────────────────────
  const handleOpenAddVideo = (context = 'activePlaylist') => {
    setVideoFormContext(context);
    setEditingVideo(null);
    setVideoFormChapters([]);
    setNewVideoChapterTitle('Chapter 1');
    setNewVideoChapterMin('');
    setNewVideoChapterSec('');
    setNewVideoChapterTime('');
    setEditingVideoChapterId(null);
    setVideoForm({
      title: '',
      youtubeUrl: '',
      description: '',
      duration: '',
      thumbnailUrl: '',
      chapters: [],
      notesUrl: null,
      notesName: null,
      notesSize: null,
      notesExt: null,
    });
    setVideoModalOpen(true);
  };

  const handleOpenEditVideo = (v, context = 'activePlaylist') => {
    setVideoFormContext(context);
    setEditingVideo(v);
    const chapters = Array.isArray(v.chapters) ? [...v.chapters] : [];
    setVideoFormChapters(chapters);
    setNewVideoChapterTitle(`Chapter ${chapters.length + 1}`);
    setNewVideoChapterMin('');
    setNewVideoChapterSec('');
    setNewVideoChapterTime('');
    setEditingVideoChapterId(null);
    setVideoForm({
      title: safeStr(v.title) || '',
      youtubeUrl: v.youtubeUrl || (v.youtubeVideoId ? `https://www.youtube.com/watch?v=${v.youtubeVideoId}` : ''),
      description: safeStr(v.description) || '',
      duration: v.duration || '',
      thumbnailUrl: v.thumbnailUrl || '',
      chapters: chapters,
      notesUrl: v.notesUrl || null,
      notesName: v.notesName || null,
      notesSize: v.notesSize || null,
      notesExt: v.notesExt || null,
    });
    setVideoModalOpen(true);
  };

  const handleVideoChapterTimePaste = (e) => {
    const pasted = e.clipboardData.getData('text').trim();
    if (pasted.includes(':')) {
      e.preventDefault();
      const parts = pasted.split(':').map((p) => p.replace(/[^\d]/g, ''));
      if (parts.length === 2) {
        setNewVideoChapterMin(parts[0]);
        setNewVideoChapterSec(String(Math.min(59, parseInt(parts[1] || '0', 10))));
      } else if (parts.length === 3) {
        const h = parseInt(parts[0] || '0', 10);
        const m = parseInt(parts[1] || '0', 10);
        setNewVideoChapterMin(String(h * 60 + m));
        setNewVideoChapterSec(String(Math.min(59, parseInt(parts[2] || '0', 10))));
      }
    }
  };

  const handleAddVideoFormChapter = () => {
    const fallbackTitle = `Chapter ${videoFormChapters.length + 1}`;
    const finalTitle = newVideoChapterTitle.trim() || fallbackTitle;
    const m = Math.max(0, parseInt(newVideoChapterMin || '0', 10));
    const s = Math.min(59, Math.max(0, parseInt(newVideoChapterSec || '0', 10)));
    const cleanTime = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const seconds = m * 60 + s;

    const newCh = {
      id: `ch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: finalTitle,
      timestamp: cleanTime,
      seconds,
      startTime: seconds,
    };

    const updated = [...videoFormChapters, newCh].sort((a, b) => (a.seconds || 0) - (b.seconds || 0));
    setVideoFormChapters(updated);
    setNewVideoChapterTitle(`Chapter ${updated.length + 1}`);
    setNewVideoChapterMin('');
    setNewVideoChapterSec('');
    setNewVideoChapterTime('');
  };

  const handleRemoveVideoFormChapter = (chId) => {
    const updated = videoFormChapters.filter((c) => c.id !== chId);
    setVideoFormChapters(updated);
    setNewVideoChapterTitle(`Chapter ${updated.length + 1}`);
    if (editingVideoChapterId === chId) {
      setEditingVideoChapterId(null);
    }
  };

  const handleStartEditVideoChapter = (ch) => {
    setEditingVideoChapterId(ch.id);
    setEditVideoChapterTitle(ch.title || '');
    const totalSec = typeof ch.seconds === 'number'
      ? ch.seconds
      : (typeof ch.startTime === 'number'
        ? ch.startTime
        : (ch.timestamp ? ch.timestamp.split(':').reduce((acc, time) => (60 * acc) + +time, 0) : 0));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    setEditVideoChapterMin(String(m));
    setEditVideoChapterSec(String(s).padStart(2, '0'));
  };

  const handleSaveEditVideoChapter = (chId) => {
    const m = Math.max(0, parseInt(editVideoChapterMin || '0', 10));
    const s = Math.min(59, Math.max(0, parseInt(editVideoChapterSec || '0', 10)));
    const cleanTime = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const seconds = m * 60 + s;

    setVideoFormChapters((prev) => {
      const updated = prev.map((c) => {
        if (c.id === chId) {
          return {
            ...c,
            title: editVideoChapterTitle.trim() || c.title,
            timestamp: cleanTime,
            seconds,
            startTime: seconds,
          };
        }
        return c;
      });
      return updated.sort((a, b) => (a.seconds || 0) - (b.seconds || 0));
    });
    setEditingVideoChapterId(null);
  };

  // Save Video (supports "Save & Done" and "Save & Add Another")
  const handleSaveVideo = async (e, addAnother = false) => {
    if (e) e.preventDefault();

    if (!videoForm.title.trim()) {
      alert('Video title is required');
      return;
    }
    if (!isValidYoutubeUrl(videoForm.youtubeUrl)) {
      alert('Please enter a valid YouTube video URL (e.g. https://www.youtube.com/watch?v=...)');
      return;
    }

    const vId = extractYoutubeId(videoForm.youtubeUrl);
    const autoThumb = videoForm.thumbnailUrl?.trim() || (vId ? getYoutubeThumbnailUrl(vId, 'hqdefault') : '');

    // A) If adding/editing inside Create/Edit Playlist Modal
    if (videoFormContext === 'playlistModal') {
      const currentVideos = [...(playlistForm.videos || [])];
      if (editingVideo) {
        const updated = currentVideos.map((v, i) => {
          if (v === editingVideo || v.id === editingVideo.id) {
            return {
              ...v,
              title: videoForm.title.trim(),
              youtubeUrl: videoForm.youtubeUrl.trim(),
              youtubeVideoId: vId || 'dQw4w9WgXcQ',
              thumbnailUrl: autoThumb,
              duration: videoDurationInput?.trim?.() || videoForm.duration?.trim() || v.duration || '',
              description: videoForm.description?.trim() || '',
              chapters: [...videoFormChapters],
              notesUrl: videoForm.notesUrl || null,
              notesName: videoForm.notesName || null,
              notesSize: videoForm.notesSize || null,
              notesExt: videoForm.notesExt || null,
            };
          }
          return v;
        });
        setPlaylistForm({ ...playlistForm, videos: updated });
        showFeedback('Video updated in playlist.');
      } else {
        const newVideoObj = {
          id: 'temp-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
          title: videoForm.title.trim(),
          youtubeUrl: videoForm.youtubeUrl.trim(),
          youtubeVideoId: vId || 'dQw4w9WgXcQ',
          thumbnailUrl: autoThumb,
          duration: videoForm.duration?.trim() || '10:00',
          description: videoForm.description?.trim() || '',
          displayOrder: currentVideos.length,
          chapters: [...videoFormChapters],
          notesUrl: videoForm.notesUrl || null,
          notesName: videoForm.notesName || null,
          notesSize: videoForm.notesSize || null,
          notesExt: videoForm.notesExt || null,
        };
        setPlaylistForm({ ...playlistForm, videos: [...currentVideos, newVideoObj] });
        showFeedback(addAnother ? 'Video added! Ready for next video.' : 'Video added to playlist.');
      }

      if (addAnother) {
        setVideoFormChapters([]);
        setNewVideoChapterTitle('');
        setNewVideoChapterTime('');
        setVideoForm({
          title: '',
          youtubeUrl: '',
          description: '',
          duration: '',
          thumbnailUrl: '',
          chapters: [],
          notesUrl: null,
          notesName: null,
          notesSize: null,
          notesExt: null,
        });
        setEditingVideo(null);
      } else {
        setVideoModalOpen(false);
      }
      return;
    }

    // B) If editing from Video Library grid
    if (videoFormContext === 'library' && editingVideo) {
      setIsSaving(true);
      try {
        const updatePayload = {
          title: videoForm.title.trim(),
          youtubeUrl: videoForm.youtubeUrl.trim(),
          description: videoForm.description?.trim() || null,
          duration: videoForm.duration?.trim() || null,
          thumbnailUrl: autoThumb || null,
          chapters: [...videoFormChapters],
          notesUrl: videoForm.notesUrl || null,
          notesName: videoForm.notesName || null,
          notesSize: videoForm.notesSize || null,
          notesExt: videoForm.notesExt || null,
        };

        try {
          if (editingVideo.id && !editingVideo.id.startsWith('vid-auto-') && !editingVideo.id.startsWith('temp-')) {
            if (typeof api?.updateVideo === 'function') {
              await api.updateVideo(editingVideo.id, updatePayload);
            } else if (editingVideo.playlistId && typeof api?.updatePlaylistVideo === 'function') {
              await api.updatePlaylistVideo(editingVideo.playlistId, editingVideo.id, updatePayload);
            }
          }
        } catch (apiErr) {
          console.warn('API update video notice:', apiErr?.message);
        }

        const oldYtId = editingVideo.youtubeVideoId;
        const currentList = getPlaylists();
        const updatedList = currentList.map((p) => {
          const currentVideos = p.videos || [];
          const hasMatchingVideo = currentVideos.some(
            (v) => v.id === editingVideo.id || (oldYtId && v.youtubeVideoId === oldYtId)
          );
          if (!hasMatchingVideo) return p;

          const newVideos = currentVideos.map((v) => {
            if (v.id === editingVideo.id || (oldYtId && v.youtubeVideoId === oldYtId)) {
              return {
                ...v,
                title: videoForm.title.trim(),
                description: videoForm.description?.trim() || '',
                youtubeUrl: videoForm.youtubeUrl.trim(),
                youtubeVideoId: vId || v.youtubeVideoId,
                thumbnailUrl: autoThumb || v.thumbnailUrl,
                duration: videoForm.duration?.trim() || v.duration || '10:00',
                chapters: [...videoFormChapters],
                notesUrl: videoForm.notesUrl || null,
                notesName: videoForm.notesName || null,
                notesSize: videoForm.notesSize || null,
                notesExt: videoForm.notesExt || null,
              };
            }
            return v;
          });

          return {
            ...p,
            videos: newVideos,
          };
        });

        syncPlaylistsFromServer(updatedList);
        setPlaylists(updatedList);
        if (activePlaylist) {
          const updatedActive = updatedList.find((p) => p.id === activePlaylist.id);
          if (updatedActive) setActivePlaylist(updatedActive);
        }

        showFeedback('Video details updated successfully.');
        setVideoModalOpen(false);
        setEditingVideo(null);
      } catch (err) {
        console.error('Save video error:', err);
        alert(err?.message || 'Failed to update video.');
      } finally {
        setIsSaving(false);
      }
      return;
    }

    // C) If adding/editing in Active Playlist (Dedicated Manage Videos View)
    if (!activePlaylist) return;

    setIsSaving(true);
    try {
      let savedVid = null;
      try {
        if (editingVideo && editingVideo.id && !editingVideo.id.startsWith('vid-auto-') && !editingVideo.id.startsWith('temp-')) {
          if (typeof api?.updatePlaylistVideo === 'function') {
            savedVid = await api.updatePlaylistVideo(activePlaylist.id, editingVideo.id, {
              title: videoForm.title.trim(),
              youtubeUrl: videoForm.youtubeUrl.trim(),
              description: videoForm.description?.trim() || null,
              duration: videoForm.duration?.trim() || null,
              thumbnailUrl: autoThumb || null,
              chapters: [...videoFormChapters],
              notesUrl: videoForm.notesUrl || null,
              notesName: videoForm.notesName || null,
              notesSize: videoForm.notesSize || null,
              notesExt: videoForm.notesExt || null,
            });
          }
        } else {
          if (typeof api?.addPlaylistVideo === 'function') {
            savedVid = await api.addPlaylistVideo(activePlaylist.id, {
              title: videoForm.title.trim(),
              youtubeUrl: videoForm.youtubeUrl.trim(),
              description: videoForm.description?.trim() || null,
              duration: videoForm.duration?.trim() || null,
              thumbnailUrl: autoThumb || null,
              displayOrder: activePlaylist.videos?.length || 0,
              chapters: [...videoFormChapters],
              notesUrl: videoForm.notesUrl || null,
              notesName: videoForm.notesName || null,
              notesSize: videoForm.notesSize || null,
              notesExt: videoForm.notesExt || null,
            });
          }
        }
      } catch (apiErr) {
        console.warn('API save video notice:', apiErr?.message);
      }

      const newVideo = savedVid || {
        id: editingVideo ? editingVideo.id : 'vid-' + Date.now(),
        playlistId: activePlaylist.id,
        title: videoForm.title.trim(),
        description: videoForm.description?.trim() || '',
        youtubeUrl: videoForm.youtubeUrl.trim(),
        youtubeVideoId: vId || 'dQw4w9WgXcQ',
        thumbnailUrl: autoThumb,
        duration: videoForm.duration?.trim() || '10:00',
        displayOrder: editingVideo ? editingVideo.displayOrder : (activePlaylist.videos?.length || 0),
        chapters: [...videoFormChapters],
        notesUrl: videoForm.notesUrl || null,
        notesName: videoForm.notesName || null,
        notesSize: videoForm.notesSize || null,
        notesExt: videoForm.notesExt || null,
      };

      const currentList = getPlaylists();
      const updatedList = currentList.map((p) => {
        if (p.id !== activePlaylist.id) return p;
        const currentVideos = p.videos || [];
        let newVideos = [];
        if (editingVideo) {
          newVideos = currentVideos.map((v) => (v.id === editingVideo.id ? { ...v, ...newVideo } : v));
        } else {
          newVideos = [...currentVideos, newVideo];
        }
        return {
          ...p,
          videos: newVideos,
          thumbnailUrl: p.thumbnailUrl || newVideo.thumbnailUrl,
        };
      });

      syncPlaylistsFromServer(updatedList);
      setPlaylists(updatedList);
      const updatedActive = updatedList.find((p) => p.id === activePlaylist.id);
      if (updatedActive) setActivePlaylist(updatedActive);

      showFeedback(
        addAnother
          ? 'Video saved! Enter details for the next video.'
          : editingVideo
            ? 'Video details updated successfully.'
            : 'Video added to playlist successfully.'
      );

      if (addAnother) {
        setVideoFormChapters([]);
        setNewVideoChapterTitle('');
        setNewVideoChapterTime('');
        setVideoForm({
          title: '',
          youtubeUrl: '',
          description: '',
          duration: '',
          thumbnailUrl: '',
          chapters: [],
          notesUrl: null,
          notesName: null,
          notesSize: null,
          notesExt: null,
        });
        setEditingVideo(null);
      } else {
        setVideoModalOpen(false);
      }
    } catch (err) {
      console.error('Save video error:', err);
      alert(err?.message || 'Failed to save video.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteVideo = async (video, context = 'activePlaylist') => {
    if (context === 'library') {
      const confirmMsg = `Are you sure you want to delete "${safeStr(video.title)}"? This will remove it from any playlists it belongs to.`;
      if (!window.confirm(confirmMsg)) return;

      try {
        const oldYtId = video.youtubeVideoId;
        const currentList = getPlaylists();
        for (const pl of currentList) {
          const match = (pl.videos || []).find((v) => v.id === video.id || (oldYtId && v.youtubeVideoId === oldYtId));
          if (match && typeof api?.deletePlaylistVideo === 'function') {
            try {
              await api.deletePlaylistVideo(pl.id, match.id);
            } catch (delErr) {
              console.warn('API delete video notice:', delErr?.message);
            }
          }
        }
        const updatedList = currentList.map((p) => {
          const filtered = (p.videos || []).filter((v) => v.id !== video.id && (!oldYtId || v.youtubeVideoId !== oldYtId));
          return {
            ...p,
            videos: filtered.map((v, i) => ({ ...v, displayOrder: i })),
          };
        });
        syncPlaylistsFromServer(updatedList);
        setPlaylists(updatedList);
        if (activePlaylist) {
          const updatedActive = updatedList.find((p) => p.id === activePlaylist.id);
          if (updatedActive) setActivePlaylist(updatedActive);
        }
        showFeedback('Video deleted successfully.');
      } catch (err) {
        console.error('Delete video error:', err);
        alert(err?.message || 'Failed to delete video.');
      }
      return;
    }

    const confirmMsg =
      t('admin.playlists.confirmDeleteVideo') ||
      `Are you sure you want to remove "${safeStr(video.title)}" from this playlist?`;
    if (!window.confirm(confirmMsg)) return;

    if (context === 'playlistModal') {
      const updated = playlistForm.videos.filter((v) => v !== video && v.id !== video.id);
      setPlaylistForm({ ...playlistForm, videos: updated });
      showFeedback('Video removed from playlist.');
      return;
    }

    if (!activePlaylist) return;

    try {
      try {
        if (typeof api?.deletePlaylistVideo === 'function') {
          await api.deletePlaylistVideo(activePlaylist.id, video.id);
        }
      } catch (apiErr) {
        console.warn('API delete video notice:', apiErr?.message);
      }
      const currentList = getPlaylists();
      const updatedList = currentList.map((p) => {
        if (p.id !== activePlaylist.id) return p;
        const filtered = (p.videos || []).filter((v) => v.id !== video.id);
        return {
          ...p,
          videos: filtered.map((v, i) => ({ ...v, displayOrder: i })),
        };
      });
      syncPlaylistsFromServer(updatedList);
      setPlaylists(updatedList);
      const updatedActive = updatedList.find((p) => p.id === activePlaylist.id);
      if (updatedActive) setActivePlaylist(updatedActive);
      showFeedback('Video removed from playlist.');
    } catch (err) {
      console.error('Delete video error:', err);
      alert(err?.message || 'Failed to remove video.');
    }
  };

  // ── 5B. ADD EXISTING VIDEO TO PLAYLIST OPERATIONS ─────────────────────────
  const handleOpenAddToPlaylist = (video, defaultPlaylistId = '') => {
    if (!video) return;
    setTargetVideoForPlaylist(video);

    const candidateId = defaultPlaylistId || activePlaylist?.id || playlists[0]?.id || '';
    setSelectedTargetPlaylistId(candidateId);

    const targetPl = playlists.find((p) => p.id === candidateId);
    if (targetPl) {
      const alreadyIn = targetPl.videos?.find(
        (v) =>
          (v.youtubeVideoId && v.youtubeVideoId === video.youtubeVideoId) ||
          (v.youtubeUrl && v.youtubeUrl === video.youtubeUrl) ||
          v.id === video.id
      );
      if (alreadyIn) {
        setTargetVideoPosition(alreadyIn.displayOrder !== undefined ? alreadyIn.displayOrder + 1 : 1);
      } else {
        setTargetVideoPosition((targetPl.videos?.length || 0) + 1);
      }
    } else {
      setTargetVideoPosition(1);
    }

    setAddToPlaylistModalOpen(true);
  };

  const handleTargetPlaylistChange = (newPlId) => {
    setSelectedTargetPlaylistId(newPlId);
    if (!targetVideoForPlaylist) return;

    const targetPl = playlists.find((p) => p.id === newPlId);
    if (targetPl) {
      const alreadyIn = targetPl.videos?.find(
        (v) =>
          (v.youtubeVideoId && v.youtubeVideoId === targetVideoForPlaylist.youtubeVideoId) ||
          (v.youtubeUrl && v.youtubeUrl === targetVideoForPlaylist.youtubeUrl) ||
          v.id === targetVideoForPlaylist.id
      );
      if (alreadyIn) {
        setTargetVideoPosition(alreadyIn.displayOrder !== undefined ? alreadyIn.displayOrder + 1 : 1);
      } else {
        // Automatically set next available position
        setTargetVideoPosition((targetPl.videos?.length || 0) + 1);
      }
    } else {
      setTargetVideoPosition(1);
    }
  };

  const handleOpenAddExistingToActivePlaylist = () => {
    if (!activePlaylist) return;
    setExistingVideosSearch('');
    setSelectedExistingVideoIds([]);
    setExistingVideosInsertPos((activePlaylist.videos?.length || 0) + 1);
    setAddExistingModalOpen(true);
  };

  const handleToggleSelectVideo = (videoKey) => {
    setSelectedExistingVideoIds((prev) => {
      if (prev.includes(videoKey)) {
        return prev.filter((k) => k !== videoKey);
      } else {
        return [...prev, videoKey];
      }
    });
  };

  const handleToggleSelectAllAvailable = () => {
    const allFilteredKeys = filteredAvailableVideos.map((v) => v.id || v.youtubeVideoId);
    const areAllSelected =
      allFilteredKeys.length > 0 && allFilteredKeys.every((k) => selectedExistingVideoIds.includes(k));
    if (areAllSelected) {
      setSelectedExistingVideoIds((prev) => prev.filter((k) => !allFilteredKeys.includes(k)));
    } else {
      setSelectedExistingVideoIds((prev) => Array.from(new Set([...prev, ...allFilteredKeys])));
    }
  };

  const handleConfirmAddExistingVideos = async () => {
    if (!activePlaylist || selectedExistingVideoIds.length === 0) return;

    const toAdd = availableVideosForActive.filter((v) =>
      selectedExistingVideoIds.includes(v.id || v.youtubeVideoId)
    );

    if (toAdd.length === 0) return;

    let parsedPos = parseInt(existingVideosInsertPos, 10);
    const maxPos = (activePlaylist.videos?.length || 0) + 1;
    if (isNaN(parsedPos) || parsedPos < 1) parsedPos = maxPos;
    if (parsedPos > maxPos) parsedPos = maxPos;
    const insertIndex = parsedPos - 1;

    setIsSubmittingExisting(true);
    try {
      const newVideoRecords = toAdd.map((vid, idx) => ({
        id: 'vid-' + Date.now() + '-' + idx + '-' + Math.random().toString(36).slice(2, 6),
        playlistId: activePlaylist.id,
        title: safeStr(vid.title),
        description: safeStr(vid.description) || '',
        youtubeUrl: vid.youtubeUrl,
        youtubeVideoId: vid.youtubeVideoId,
        thumbnailUrl: vid.thumbnailUrl,
        duration: vid.duration || '10:00',
        displayOrder: insertIndex + idx,
      }));

      // 1. Splice all new records into playlist videos at insertIndex
      const currentVideos = [...(activePlaylist.videos || [])];
      currentVideos.splice(insertIndex, 0, ...newVideoRecords);
      const reordered = currentVideos.map((v, i) => ({ ...v, displayOrder: i }));

      // 2. Persist each new video to backend API
      for (let i = 0; i < newVideoRecords.length; i++) {
        const rec = newVideoRecords[i];
        try {
          if (typeof api?.addPlaylistVideo === 'function') {
            const saved = await api.addPlaylistVideo(activePlaylist.id, {
              title: rec.title,
              youtubeUrl: rec.youtubeUrl,
              description: rec.description || null,
              thumbnailUrl: rec.thumbnailUrl || null,
              duration: rec.duration || null,
              displayOrder: insertIndex + i,
            });
            if (saved && saved.id) {
              rec.id = saved.id;
            }
          }
        } catch (apiErr) {
          console.warn('Backend addPlaylistVideo notice:', apiErr?.message);
        }
      }

      // 3. Sync full order on backend
      if (typeof api?.reorderPlaylistVideos === 'function') {
        try {
          await api.reorderPlaylistVideos(activePlaylist.id, reordered.map((v) => v.id));
        } catch { }
      }

      // 4. Update local state and localStorage
      const allCurrent = getPlaylists();
      const updatedList = allCurrent.map((p) => {
        if (p.id !== activePlaylist.id) return p;
        return {
          ...p,
          videos: reordered,
          videoCount: reordered.length,
          thumbnailUrl: p.thumbnailUrl || newVideoRecords[0]?.thumbnailUrl,
        };
      });

      syncPlaylistsFromServer(updatedList);
      setPlaylists(updatedList);
      setActivePlaylist({
        ...activePlaylist,
        videos: reordered,
        videoCount: reordered.length,
        thumbnailUrl: activePlaylist.thumbnailUrl || newVideoRecords[0]?.thumbnailUrl,
      });

      showFeedback(
        `${newVideoRecords.length} ${newVideoRecords.length === 1 ? 'video' : 'videos'} successfully added to "${safeStr(activePlaylist.title)}"`
      );
      setAddExistingModalOpen(false);
      setSelectedExistingVideoIds([]);
    } catch (err) {
      console.error('Failed to add existing videos to playlist:', err);
      alert(err?.message || 'Failed to add videos.');
    } finally {
      setIsSubmittingExisting(false);
    }
  };

  const handleConfirmAddToPlaylist = async () => {
    if (!targetVideoForPlaylist || !selectedTargetPlaylistId) return;

    const targetPl = playlists.find((p) => p.id === selectedTargetPlaylistId);
    if (!targetPl) {
      alert('Selected playlist could not be found.');
      return;
    }

    if (isAlreadyInSelectedPlaylist) {
      alert(`"${targetVideoForPlaylist.title}" already exists in "${safeStr(targetPl.title)}".`);
      return;
    }

    let parsedPos = parseInt(targetVideoPosition, 10);
    const maxPos = (targetPl.videos?.length || 0) + 1;
    if (isNaN(parsedPos) || parsedPos < 1) parsedPos = maxPos;
    if (parsedPos > maxPos) parsedPos = maxPos;

    const insertIndex = parsedPos - 1;

    setIsAddingToPlaylist(true);
    try {
      const newVideoId = 'vid-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
      const newVideoRecord = {
        id: newVideoId,
        playlistId: targetPl.id,
        title: safeStr(targetVideoForPlaylist.title),
        description: safeStr(targetVideoForPlaylist.description) || '',
        youtubeUrl: targetVideoForPlaylist.youtubeUrl,
        youtubeVideoId: targetVideoForPlaylist.youtubeVideoId,
        thumbnailUrl: targetVideoForPlaylist.thumbnailUrl,
        duration: targetVideoForPlaylist.duration || '10:00',
        displayOrder: insertIndex,
      };

      // 1. Shift existing videos to accommodate the new video at the chosen position
      const currentVideos = [...(targetPl.videos || [])];
      currentVideos.splice(insertIndex, 0, newVideoRecord);
      const reorderedVideos = currentVideos.map((v, idx) => ({
        ...v,
        displayOrder: idx,
      }));

      // 2. Persist via backend API
      let savedApiVid = null;
      try {
        if (typeof api?.addPlaylistVideo === 'function') {
          savedApiVid = await api.addPlaylistVideo(targetPl.id, {
            title: newVideoRecord.title,
            youtubeUrl: newVideoRecord.youtubeUrl,
            description: newVideoRecord.description || null,
            thumbnailUrl: newVideoRecord.thumbnailUrl || null,
            duration: newVideoRecord.duration || null,
            displayOrder: insertIndex,
          });
        }
      } catch (apiErr) {
        console.warn('Backend addPlaylistVideo notice:', apiErr?.message);
      }

      if (savedApiVid && savedApiVid.id) {
        newVideoRecord.id = savedApiVid.id;
      }

      // If inserted in the middle, sync order on server
      if (insertIndex < currentVideos.length - 1 && typeof api?.reorderPlaylistVideos === 'function') {
        try {
          await api.reorderPlaylistVideos(targetPl.id, reorderedVideos.map((v) => v.id));
        } catch { }
      }

      // 3. Update local state & localStorage
      const allCurrent = getPlaylists();
      const updatedPlaylists = allCurrent.map((p) => {
        if (p.id !== targetPl.id) return p;
        return {
          ...p,
          videos: reorderedVideos,
          videoCount: reorderedVideos.length,
          thumbnailUrl: p.thumbnailUrl || newVideoRecord.thumbnailUrl,
        };
      });

      syncPlaylistsFromServer(updatedPlaylists);
      setPlaylists(updatedPlaylists);

      if (activePlaylist && activePlaylist.id === targetPl.id) {
        setActivePlaylist({
          ...activePlaylist,
          videos: reorderedVideos,
          videoCount: reorderedVideos.length,
          thumbnailUrl: activePlaylist.thumbnailUrl || newVideoRecord.thumbnailUrl,
        });
      }

      showFeedback(
        `"${newVideoRecord.title}" successfully added to "${safeStr(targetPl.title)}" at Position ${parsedPos}!`
      );
      setAddToPlaylistModalOpen(false);
    } catch (err) {
      console.error('Add video to playlist error:', err);
      alert(err?.message || 'Failed to add video to playlist.');
    } finally {
      setIsAddingToPlaylist(false);
    }
  };

  // ── 6. DRAG-AND-DROP & REORDERING OPERATIONS ───────────────────────────────
  // Apply reorder for Active Playlist
  const applyVideoReorder = async (updatedVideos) => {
    if (!activePlaylist) return;

    const indexedVideos = updatedVideos.map((v, i) => ({ ...v, displayOrder: i }));

    // 1. Optimistic local update
    const updatedActive = { ...activePlaylist, videos: indexedVideos };
    setActivePlaylist(updatedActive);

    const currentList = getPlaylists();
    const updatedList = currentList.map((p) => (p.id === activePlaylist.id ? updatedActive : p));
    syncPlaylistsFromServer(updatedList);
    setPlaylists(updatedList);

    // 2. Persist to server
    try {
      if (typeof api?.reorderPlaylistVideos === 'function') {
        const videoIds = indexedVideos.map((v) => v.id).filter(Boolean);
        if (videoIds.length > 0) {
          await api.reorderPlaylistVideos(activePlaylist.id, videoIds);
        }
      }
      showFeedback('✓ Video sequence updated and saved to database.');
    } catch (err) {
      console.warn('API reorder notice:', err?.message);
      showFeedback('Video order updated locally.');
    }
  };

  // Set video position manually from editable number input
  const handleSetVideoPosition = async (currentIndex, newPosition) => {
    const videos = [...(activePlaylist?.videos || [])];
    if (videos.length <= 1) return;

    let target = parseInt(newPosition, 10);
    if (isNaN(target) || target < 1) target = 1;
    if (target > videos.length) target = videos.length;

    const targetIndex = target - 1;
    if (targetIndex === currentIndex) return;

    const [moved] = videos.splice(currentIndex, 1);
    videos.splice(targetIndex, 0, moved);

    await applyVideoReorder(videos);
    showFeedback(`✓ Video moved to position #${target}`);
  };

  // Native HTML5 Drag Handlers for Active Playlist
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    try {
      e.dataTransfer.setData('text/plain', String(index));
    } catch { }
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const videos = [...(activePlaylist?.videos || [])];
    const [moved] = videos.splice(draggedIndex, 1);
    videos.splice(targetIndex, 0, moved);

    setDraggedIndex(null);
    setDragOverIndex(null);

    await applyVideoReorder(videos);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Drag Handlers inside Playlist Modal
  const handleModalDragStart = (e, index) => {
    setModalDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleModalDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (modalDragOverIndex !== index) {
      setModalDragOverIndex(index);
    }
  };

  const handleModalDrop = (e, targetIndex) => {
    e.preventDefault();
    if (modalDraggedIndex === null || modalDraggedIndex === targetIndex) {
      setModalDraggedIndex(null);
      setModalDragOverIndex(null);
      return;
    }

    const videos = [...(playlistForm.videos || [])];
    const [moved] = videos.splice(modalDraggedIndex, 1);
    videos.splice(targetIndex, 0, moved);

    setModalDraggedIndex(null);
    setModalDragOverIndex(null);
    setPlaylistForm({ ...playlistForm, videos: videos.map((v, i) => ({ ...v, displayOrder: i })) });
    showFeedback(`Reordered video to position #${targetIndex + 1}`);
  };

  const handleModalSetVideoPosition = (currentIndex, newPosition) => {
    const videos = [...(playlistForm.videos || [])];
    if (videos.length <= 1) return;

    let target = parseInt(newPosition, 10);
    if (isNaN(target) || target < 1) target = 1;
    if (target > videos.length) target = videos.length;

    const targetIndex = target - 1;
    if (targetIndex === currentIndex) return;

    const [moved] = videos.splice(currentIndex, 1);
    videos.splice(targetIndex, 0, moved);

    setPlaylistForm({ ...playlistForm, videos: videos.map((v, i) => ({ ...v, displayOrder: i })) });
    showFeedback(`Video moved to position #${target}`);
  };

  // ── 6.5 VIDEO ANSWER SUBMISSIONS OPERATIONS ─────────────────────────────────
  const handleOpenAnswerSubmissions = async (video) => {
    setSubmissionVideoTarget(video);
    setSubmissionsModalOpen(true);
    setLoadingVideoSubmissions(true);
    setReviewingVideoSubmission(null);
    setVideoReviewFeedback('');

    const targetId = video.id || video.youtubeVideoId;
    try {
      let data = null;
      if (typeof api?.getVideoAdminTaskSubmissions === 'function') {
        data = await api.getVideoAdminTaskSubmissions(targetId);
      } else {
        const res = await fetch(`/api/admin/tasks/by-video/${encodeURIComponent(targetId)}/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        data = await res.json();
      }
      setVideoSubmissions(Array.isArray(data?.submissions) ? data.submissions : Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load video answer submissions:', err);
      showFeedback('Could not load submissions for this video', 'error');
      setVideoSubmissions([]);
    } finally {
      setLoadingVideoSubmissions(false);
    }
  };

  const handleSubmitVideoReview = async (submissionId, newStatus) => {
    if (!submissionId) return;
    if (newStatus === 'needs_revision' && !videoReviewFeedback.trim()) {
      alert('Please provide feedback explaining what needs update or revision.');
      return;
    }

    setSavingVideoReview(true);
    try {
      if (typeof api?.reviewAdminTaskSubmission === 'function') {
        await api.reviewAdminTaskSubmission(submissionId, {
          status: newStatus,
          feedback: videoReviewFeedback.trim() || undefined,
        });
      } else {
        await fetch(`/api/admin/tasks/submissions/${encodeURIComponent(submissionId)}/review`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            status: newStatus,
            feedback: videoReviewFeedback.trim() || undefined,
          }),
        });
      }

      showFeedback(newStatus === 'reviewed' ? 'Submission marked as Reviewed!' : 'Update requested with feedback.');
      setReviewingVideoSubmission(null);
      setVideoReviewFeedback('');

      // Refresh list
      const targetId = submissionVideoTarget.id || submissionVideoTarget.youtubeVideoId;
      const res = await (typeof api?.getVideoAdminTaskSubmissions === 'function'
        ? api.getVideoAdminTaskSubmissions(targetId)
        : fetch(`/api/admin/tasks/by-video/${encodeURIComponent(targetId)}/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()));
      setVideoSubmissions(Array.isArray(res?.submissions) ? res.submissions : Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Review submission error:', err);
      alert(err?.message || 'Failed to submit review.');
    } finally {
      setSavingVideoReview(false);
    }
  };

  // Handle uploading study material inside AdminPlaylistsPanel
  const handleUploadPanelStudyMaterial = async (e) => {
    if (e) e.preventDefault();
    if (!panelNoteTitle.trim()) {
      setPanelNoteError('Please provide a title for the study material.');
      return;
    }
    if (!panelNoteFile) {
      setPanelNoteError('Please select a PDF, DOC, DOCX, XLS, XLSX, PPT, or PPTX file.');
      return;
    }

    setUploadingPanelNote(true);
    setPanelNoteError('');

    try {
      let uploadedData = null;
      if (typeof clientApi?.uploadCourseNote === 'function') {
        uploadedData = await clientApi.uploadCourseNote(panelNoteFile);
      } else {
        const fd = new FormData();
        fd.append('file', panelNoteFile);
        const res = await fetch('/api/admin/courses/upload-note', {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
          body: fd,
        });
        if (!res.ok) throw new Error('Upload failed');
        uploadedData = await res.json();
      }

      const assignedVideo = panelNoteTargetVideo === 'all'
        ? 'All Videos / General'
        : (playlistForm.videos[Number(panelNoteTargetVideo)]?.title || 'Video Resource');

      const newResource = {
        id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title: panelNoteTitle.trim(),
        file: uploadedData?.file || uploadedData?.url || `/uploads/notes/${panelNoteFile.name}`,
        name: panelNoteFile.name,
        size: uploadedData?.size || `${(panelNoteFile.size / (1024 * 1024)).toFixed(1)} MB`,
        ext: panelNoteFile.name.split('.').pop()?.toUpperCase() || 'PDF',
        videoTarget: panelNoteTargetVideo,
        videoTitle: assignedVideo,
        createdAt: new Date().toISOString(),
      };

      setPlaylistForm((prev) => ({
        ...prev,
        resources: [...(prev.resources || []), newResource],
      }));

      setPanelNoteTitle('');
      setPanelNoteFile(null);
      setPanelNoteTargetVideo('all');
      showFeedback('✓ Study material uploaded successfully!');
    } catch (err) {
      setPanelNoteError(err.message || 'Failed to upload study note');
    } finally {
      setUploadingPanelNote(false);
    }
  };

  const handleRemovePanelStudyMaterial = (resId) => {
    setPlaylistForm((prev) => ({
      ...prev,
      resources: (prev.resources || []).filter((r) => r.id !== resId),
    }));
    showFeedback('Study material removed.');
  };

  // Handle adding quiz question inside AdminPlaylistsPanel
  const handleAddPanelQuizQuestion = (e) => {
    if (e) e.preventDefault();
    setPanelQuizError('');
    if (!panelQuizQuestion.trim()) {
      setPanelQuizError('Please enter the question prompt.');
      return;
    }
    if (panelQuizType === 'mcq') {
      const emptyIdx = panelQuizOptions.findIndex((opt) => !opt || !opt.trim());
      if (emptyIdx !== -1) {
        setPanelQuizError(`Please fill in option ${String.fromCharCode(65 + emptyIdx)}.`);
        return;
      }
    }

    const assignedVideoTitle = panelQuizTargetVideo === 'all'
      ? 'Whole Playlist'
      : (playlistForm.videos[Number(panelQuizTargetVideo)]?.title || 'Video');

    const newQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      videoIndex: panelQuizTargetVideo === 'all' ? null : Number(panelQuizTargetVideo),
      videoTitle: assignedVideoTitle,
      type: panelQuizType,
      question: panelQuizQuestion.trim(),
      options: panelQuizType === 'mcq' ? panelQuizOptions.map((o) => o.trim()) : ['True', 'False'],
      answer: panelQuizType === 'mcq' ? Number(panelQuizCorrectAnswer) : panelQuizCorrectAnswer,
      explanation: panelQuizExplanation.trim(),
      triggerType: panelQuizTriggerType,
      triggerMinutes: Number(panelQuizTriggerMinutes) || 0,
      triggerSeconds: Number(panelQuizTriggerSeconds) || 0,
    };

    setPlaylistForm((prev) => ({
      ...prev,
      assessments: [...(prev.assessments || []), newQuestion],
    }));

    setPanelQuizQuestion('');
    setPanelQuizOptions(['', '', '', '']);
    setPanelQuizCorrectAnswer(0);
    setPanelQuizExplanation('');
    setPanelQuizTriggerType('end');
    setPanelQuizTriggerMinutes(1);
    setPanelQuizTriggerSeconds(0);
    showFeedback('✓ Quiz question added to playlist!');
  };

  const handleRemovePanelQuizQuestion = (qId) => {
    setPlaylistForm((prev) => ({
      ...prev,
      assessments: (prev.assessments || []).filter((q) => q.id !== qId),
    }));
    showFeedback('Quiz question removed.');
  };

  // Live YouTube thumbnail preview
  const liveVideoId = extractYoutubeId(videoForm.youtubeUrl);

  // ── 7. RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {actionFeedback && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-sm font-bold animate-in fade-in slide-in-from-bottom-4 duration-200 ${actionFeedback.type === 'error'
            ? 'bg-red-600 text-white'
            : 'bg-[#2563EB] text-[#2563EB] border border-brand-lime/30'
            }`}
        >
          <Icon name={actionFeedback.type === 'error' ? 'error' : 'check_circle'} className="text-xl" />
          <span>{actionFeedback.message}</span>
        </div>
      )}

      {/* VIEW 1: DEDICATED MANAGE VIDEOS & REORDERING VIEW */}
      {activePlaylist ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top navigation toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => setActivePlaylist(null)}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 text-[#0F172A] hover:bg-slate-100 font-bold text-xs sm:text-sm flex items-center gap-2 transition cursor-pointer"
            >
              <Icon name="arrow_back" className="text-base" />
              <span>Back to All Playlists</span>
            </button>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleOpenEditPlaylist(activePlaylist)}
                className="px-4 py-2.5 rounded-2xl border border-slate-200 text-[#0F172A] hover:bg-slate-100 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Icon name="edit" className="text-base" />
                <span>Edit Playlist Details</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddExistingToActivePlaylist}
                className="px-4 py-2.5 rounded-2xl border border-blue-200 bg-slate-50 hover:bg-slate-100 text-[#0F172A] font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
                title="Add an existing video from your library into this playlist"
              >
                <Icon name="video_library" className="text-base text-[#0F172A]" />
                <span>Add Existing Video</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenAddVideo('activePlaylist')}
                className="px-5 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs sm:text-sm flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer"
              >
                <Icon name="add" className="text-lg text-[#2563EB]" />
                <span>Add Video</span>
              </button>
            </div>
          </div>

          {/* Active Playlist Header Banner */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-[#1E3A8A] via-[#0F172A] to-slate-50 text-white shadow-soft-card relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2.5 max-w-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-white/15 text-[#2563EB] text-xs font-black uppercase tracking-wider backdrop-blur-sm">
                    {safeStr(activePlaylist.courseName || activePlaylist.courseSlug) || 'Course Playlist'}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-blue-50 text-[#0F172A] text-xs font-black">
                    {activePlaylist.videos?.length || 0} Videos
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-black text-[#0F172A]">{safeStr(activePlaylist.title)}</h1>
                {activePlaylist.description && (
                  <p className="text-[#475569] text-xs sm:text-sm leading-relaxed line-clamp-2">
                    {safeStr(activePlaylist.description)}
                  </p>
                )}
              </div>

              {activePlaylist.thumbnailUrl && (
                <div className="shrink-0 w-44 aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-md bg-black">
                  <img
                    src={assetUrl(activePlaylist.thumbnailUrl)}
                    alt={safeStr(activePlaylist.title)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Video List & Drag-and-Drop Reorder Panel */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-soft-card space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-200 pb-4 gap-3">
              <div>
                <h2 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-[#2563EB] text-[#2563EB] flex items-center justify-center">
                    <Icon name="drag_indicator" className="text-lg" />
                  </span>
                  <span>Drag & Drop Video Ordering ({activePlaylist.videos?.length || 0} Videos)</span>
                </h2>
                <p className="text-xs text-[#475569] mt-1">
                  Click and hold the <strong className="text-[#0F172A]">grip handle (⠿)</strong> to drag videos up or down, or edit the sequence number directly. The sequence updates instantly.
                </p>
              </div>
            </div>

            {(!activePlaylist.videos || activePlaylist.videos.length === 0) ? (
              <div className="py-16 text-center rounded-2xl border-2 border-dashed border-slate-200 p-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 text-[#0F172A] flex items-center justify-center mx-auto">
                  <Icon name="video_library" className="text-3xl" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#0F172A] text-base">This playlist has no videos yet</h3>
                  <p className="text-xs text-[#475569] mt-1 max-w-md mx-auto">
                    Add your first YouTube video to start building this playlist. You can drag and drop to reorder anytime.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddVideo('activePlaylist')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#2563EB] text-white text-xs font-black hover:bg-[#1D4ED8] transition shadow-sm cursor-pointer active:scale-95"
                >
                  <Icon name="add" className="text-base text-[#2563EB]" />
                  <span>Add First Video</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {activePlaylist.videos.map((video, idx) => {
                  const isBeingDragged = draggedIndex === idx;
                  const isOver = dragOverIndex === idx && draggedIndex !== idx;

                  const thumb =
                    video.thumbnailUrl ||
                    (video.youtubeVideoId
                      ? `https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`
                      : '');

                  return (
                    <div
                      key={video.id || idx}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={(e) => handleDragOver(e, idx)}
                      onDrop={(e) => handleDrop(e, idx)}
                      onDragEnd={handleDragEnd}
                      className={`p-3 sm:p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group select-none ${isBeingDragged
                        ? 'opacity-40 bg-slate-50 border-blue-200 scale-[0.99]'
                        : isOver
                          ? 'bg-blue-50 border-blue-200 ring-2 ring-brand-forest shadow-md'
                          : 'bg-white hover:bg-white border-slate-200 shadow-2xs'
                        }`}
                    >
                      {/* Left: Drag Grip Handle, Editable Number Input & Thumbnail */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* 1. Drag Grip Handle */}
                        <div
                          className="p-2 -ml-1 text-zinc-400 hover:text-[#0F172A] cursor-grab active:cursor-grabbing rounded-lg hover:bg-slate-100 transition"
                          title="Click and drag to reorder video"
                        >
                          <Icon name="drag_indicator" className="text-xl" />
                        </div>

                        {/* 2. Editable Sequence Number Input */}
                        <VideoOrderInput
                          value={idx + 1}
                          total={activePlaylist.videos.length}
                          onCommit={(newPos) => handleSetVideoPosition(idx, newPos)}
                        />

                        {/* 3. Thumbnail Preview */}
                        <div className="relative w-24 sm:w-28 aspect-video rounded-xl overflow-hidden bg-black shrink-0 border border-slate-200 shadow-xs">
                          {thumb ? (
                            <img src={thumb} alt={safeStr(video.title)} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#475569]">
                              <Icon name="smart_display" className="text-2xl" />
                            </div>
                          )}
                          {video.duration && (
                            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/80 text-[#0F172A] text-[10px] font-bold">
                              {video.duration}
                            </span>
                          )}
                        </div>

                        {/* 5. Title & Info */}
                        <div className="space-y-1 min-w-0 flex-1">
                          <h4 className="font-extrabold text-sm text-[#0F172A] line-clamp-1">
                            {safeStr(video.title)}
                          </h4>
                          {video.description && (
                            <p className="text-xs text-[#475569] line-clamp-1">{safeStr(video.description)}</p>
                          )}
                          <div className="flex items-center gap-2 text-[11px] text-[#475569] flex-wrap">
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                              {video.youtubeVideoId}
                            </span>
                            {video.youtubeUrl && (
                              <a
                                href={video.youtubeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-emerald-700 hover:underline flex items-center gap-0.5 font-semibold"
                              >
                                <span>Preview on YouTube</span>
                                <Icon name="open_in_new" className="text-[12px]" />
                              </a>
                            )}
                            {Array.isArray(video.chapters) && video.chapters.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                <Icon name="format_list_numbered" className="text-xs" />
                                <span>{video.chapters.length} {video.chapters.length === 1 ? 'Chapter' : 'Chapters'}</span>
                              </span>
                            )}
                            {(video.notesUrl || video.notesName) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold" title={video.notesName || 'Notes'}>
                                <Icon name="description" className="text-xs text-purple-600" />
                                <span className="truncate max-w-[120px]">{video.notesName || 'Notes'}</span>
                                {video.notesSize && <span className="text-[9px] opacity-75">({video.notesSize})</span>}
                              </span>
                            )}
                            {video.notesUrl && (
                              <a
                                href={video.notesUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-700 hover:underline flex items-center gap-0.5 font-semibold text-[11px]"
                                title="Download / Preview Attached Note"
                              >
                                <Icon name="download" className="text-[12px]" />
                                <span>Note</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleOpenAnswerSubmissions(video)}
                          className="px-3 py-1.5 rounded-xl border border-blue-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-[#0F172A] flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                          title="View student answer submissions for this video"
                        >
                          <Icon name="folder_shared" className="text-sm text-[#0F172A]" />
                          <span>Answer Submissions</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAddToPlaylist(video)}
                          className="px-3 py-1.5 rounded-xl border border-blue-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-[#0F172A] flex items-center gap-1 transition cursor-pointer shadow-2xs"
                          title="Add this existing video to another playlist"
                        >
                          <Icon name="playlist_add" className="text-sm text-[#0F172A]" />
                          <span>Add to Playlist</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditVideo(video, 'activePlaylist')}
                          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-[#0F172A] hover:bg-slate-100 flex items-center gap-1 transition cursor-pointer"
                        >
                          <Icon name="edit" className="text-sm" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteVideo(video, 'activePlaylist')}
                          className="px-3.5 py-1.5 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-1 transition cursor-pointer"
                        >
                          <Icon name="delete" className="text-sm" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* VIEW 2: ALL PLAYLISTS MANAGEMENT GRID */
        <div className="space-y-6">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-slate-200 shadow-soft-card">
            <div>
              {isScopedCourse ? (
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Icon name="school" className="text-sm text-emerald-700" />
                      <span>Course Playlists</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-50 text-[#0F172A] text-[11px] font-black">
                      {filteredPlaylists.length} {filteredPlaylists.length === 1 ? 'Playlist' : 'Playlists'}
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-[#0F172A]">
                    Playlists for {currentCourseName}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#475569] mt-1">
                    Manage existing structured video playlists for this course. To create a new course-linked playlist, use Add New Course or Edit Course.
                  </p>
                </div>
              ) : (
                <div>
                  <h1 className="text-2xl font-black text-[#0F172A] flex items-center gap-2.5">
                    <span className="p-2 rounded-2xl bg-[#2563EB] text-[#2563EB] flex items-center justify-center">
                      <Icon name="playlist_play" className="text-2xl" />
                    </span>
                    {t('admin.playlists.title') || 'Course Video Playlists'}
                  </h1>
                  <p className="text-xs sm:text-sm text-[#475569] mt-1">
                    {t('admin.playlists.subtitle') ||
                      'Create and organize YouTube video playlists associated with courses, arrange playback order, and manage lessons.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {!isScopedCourse && (
            /* Stats Bar */
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-[#0F172A] flex items-center justify-center shrink-0">
                  <Icon name="playlist_play" className="text-2xl text-[#0F172A]" />
                </div>
                <div>
                  <span className="text-2xl font-black text-[#0F172A] block">{stats.totalPlaylists}</span>
                  <span className="text-xs text-[#475569] font-bold">Total Playlists</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Icon name="smart_display" className="text-2xl text-emerald-700" />
                </div>
                <div>
                  <span className="text-2xl font-black text-[#0F172A] block">{stats.totalVideos}</span>
                  <span className="text-xs text-[#475569] font-bold">Total Videos Across Playlists</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-lime-50 text-lime-800 flex items-center justify-center shrink-0">
                  <Icon name="school" className="text-2xl text-lime-700" />
                </div>
                <div>
                  <span className="text-2xl font-black text-[#0F172A] block">{stats.uniqueCourses}</span>
                  <span className="text-xs text-[#475569] font-bold">Courses Covered</span>
                </div>
              </div>
            </div>
          )}

          {/* Main Navigation Tabs: Playlists vs Video Library */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
            <button
              type="button"
              onClick={() => setActiveMainTab('playlists')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition cursor-pointer ${activeMainTab === 'playlists'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-[#475569] border border-slate-200'
                }`}
            >
              <Icon name="playlist_play" className="text-base" />
              <span>Course Playlists ({filteredPlaylists.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMainTab('library')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 transition cursor-pointer ${activeMainTab === 'library'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-[#475569] border border-slate-200'
                }`}
            >
              <Icon name="video_library" className="text-base" />
              <span>Video Library ({allLibraryVideos.length})</span>
            </button>
          </div>

          {activeMainTab === 'playlists' ? (
            <div className="space-y-6">
              {/* Search & Filter Bar */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569] text-base" />
                  <input
                    type="text"
                    placeholder={t('admin.playlists.searchPlaceholder') || 'Search playlists by title or course...'}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#0F172A] font-medium placeholder:text-brand-textMuted/60 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#0F172A] text-xs"
                    >
                      <Icon name="close" className="text-xs" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {isScopedCourse ? (
                    <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#0F172A] font-bold flex items-center gap-1.5">
                      <Icon name="school" className="text-emerald-700 text-base" />
                      <span className="truncate max-w-[220px]">{currentCourseName}</span>
                    </div>
                  ) : (
                    <>
                      <Icon name="filter_alt" className="text-[#475569] text-base hidden sm:inline" />
                      <select
                        value={selectedCourseFilter}
                        onChange={(e) => setSelectedCourseFilter(e.target.value)}
                        className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#0F172A] font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 w-full sm:w-auto"
                      >
                        <option value="all">{t('admin.playlists.allCourses') || 'All Courses'}</option>
                        {coursesList.map((c) => (
                          <option key={c.id || c.slug} value={c.id || c.slug}>
                            {safeStr(c.courseName || c.title || c.slug)}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>
              </div>

              {/* Playlists List / Cards Grid */}
              {loading ? (
                <div className="p-16 text-center text-[#0F172A] bg-white rounded-3xl border border-slate-200">
                  <Icon name="sync" className="animate-spin text-3xl mx-auto mb-2 text-[#0F172A]" />
                  <p className="text-sm font-bold">Loading playlists...</p>
                </div>
              ) : filteredPlaylists.length === 0 ? (
                <div className="py-16 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 text-[#0F172A] flex items-center justify-center mx-auto">
                    <Icon name="playlist_play" className="text-3xl" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-[#0F172A] text-base">
                      {t('admin.playlists.emptyTitle') || 'No playlists found'}
                    </h3>
                    <p className="text-xs text-[#475569] mt-1 max-w-md mx-auto">
                      {isSubAdmin
                        ? 'Video playlists linked to your courses or assigned to your account will appear here. Add playlist lessons inside Add New Course or Edit Course.'
                        : 'Create and link course video playlists directly inside Add New Course or Edit Course.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPlaylists.map((pl) => {
                    const count = pl.videos?.length ?? pl.videoCount ?? 0;
                    const thumb =
                      pl.thumbnailUrl ||
                      pl.videos?.[0]?.thumbnailUrl ||
                      (pl.videos?.[0]?.youtubeVideoId
                        ? `https://img.youtube.com/vi/${pl.videos[0].youtubeVideoId}/hqdefault.jpg`
                        : '');

                    return (
                      <div
                        key={pl.id}
                        className="flex flex-col rounded-3xl border border-slate-200 bg-white shadow-soft-card overflow-hidden hover:shadow-lg transition-all group"
                      >
                        {/* Thumbnail Image Header */}
                        <div className="relative aspect-video bg-zinc-900 overflow-hidden">
                          {thumb ? (
                            <img
                              src={assetUrl(thumb)}
                              alt={safeStr(pl.title)}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[#475569] bg-gradient-to-br from-zinc-800 to-zinc-900">
                              <Icon name="playlist_play" className="text-4xl text-zinc-400" />
                              <span className="text-xs font-bold text-zinc-400 mt-1">G-Mark Software Playlist</span>
                            </div>
                          )}

                          {/* Trending 1-Click Toggle Overlay */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTrending(pl);
                            }}
                            className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-black flex items-center gap-1 shadow-md transition-all cursor-pointer ${pl.isTrending
                              ? 'bg-amber-500 text-white hover:bg-amber-600'
                              : 'bg-black/60 text-white/80 hover:bg-amber-500 hover:text-[#0F172A]'
                              }`}
                            title={pl.isTrending ? 'Click to remove from Homepage Trending' : 'Click to feature on Homepage Trending'}
                          >
                            <span>⭐</span>
                            <span>{pl.isTrending ? 'Trending' : 'Add Trending'}</span>
                          </button>

                          {/* Video Count Overlay Pill */}
                          <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[#0F172A] text-xs font-black flex items-center gap-1.5 shadow-md">
                            <Icon name="smart_display" className="text-sm text-[#2563EB]" />
                            <span>{count} Videos</span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-1.5 text-xs text-[#0F172A] font-black uppercase tracking-wider">
                              <Icon name="school" className="text-xs shrink-0" />
                              <span className="truncate">{safeStr(pl.courseName || pl.courseSlug)}</span>
                            </div>

                            <h3 className="font-extrabold text-base text-[#0F172A] line-clamp-2 leading-snug">
                              {safeStr(pl.title)}
                            </h3>

                            <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                              {safeStr(pl.description) || 'No description provided.'}
                            </p>
                          </div>

                          {/* Card Actions */}
                          <div className="pt-3 border-t border-slate-200 flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setActivePlaylist(pl)}
                              className="flex-1 px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer shadow-xs"
                            >
                              <Icon name="video_library" className="text-sm text-white" />
                              <span>Manage Videos ({count})</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleTrending(pl)}
                              className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-1 text-xs font-bold ${pl.isTrending
                                ? 'bg-amber-500 border-amber-600 text-white shadow-2xs'
                                : 'border-slate-200 hover:bg-slate-100 text-[#475569] hover:text-[#0F172A]'
                                }`}
                              title={pl.isTrending ? 'Remove from Homepage Trending' : 'Feature in Homepage Trending'}
                            >
                              <span>⭐</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditPlaylist(pl)}
                              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-[#0F172A] transition cursor-pointer"
                              title="Edit Playlist & Videos"
                            >
                              <Icon name="edit" className="text-base" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeletePlaylist(pl)}
                              className="p-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition cursor-pointer"
                              title="Delete Playlist"
                            >
                              <Icon name="delete" className="text-base" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* TAB 2: VIDEO LIBRARY VIEW */
            <div className="space-y-6">
              {/* Library Search Bar */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:w-80">
                  <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569] text-base" />
                  <input
                    type="text"
                    placeholder="Search existing videos by title, description..."
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#0F172A] font-medium placeholder:text-brand-textMuted/60 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                  />
                  {librarySearch && (
                    <button
                      type="button"
                      onClick={() => setLibrarySearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#0F172A] text-xs"
                    >
                      <Icon name="close" className="text-xs" />
                    </button>
                  )}
                </div>

                <div className="text-xs text-[#475569] font-bold">
                  Showing {filteredLibraryVideos.length} of {allLibraryVideos.length} unique videos
                </div>
              </div>

              {/* Library Videos Grid */}
              {filteredLibraryVideos.length === 0 ? (
                <div className="py-16 text-center rounded-3xl border-2 border-dashed border-slate-200 bg-white p-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-slate-50 text-[#0F172A] flex items-center justify-center mx-auto">
                    <Icon name="video_library" className="text-3xl" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1">
                    <h3 className="font-black text-[#0F172A] text-base">No Videos Found</h3>
                    <p className="text-xs text-[#475569]">
                      {librarySearch ? 'Try a different search query.' : 'Videos added to playlists or course lessons appear here in your library.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredLibraryVideos.map((video) => (
                    <div
                      key={video.id || video.youtubeVideoId}
                      className="rounded-3xl border border-slate-200 bg-white shadow-soft-card hover:shadow-hover transition overflow-hidden flex flex-col group"
                    >
                      {/* Video Thumbnail */}
                      <div className="relative aspect-video bg-black/90 overflow-hidden">
                        {video.thumbnailUrl ? (
                          <img
                            src={assetUrl(video.thumbnailUrl)}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                            onError={(e) => {
                              if (video.youtubeVideoId) {
                                e.currentTarget.src = `https://img.youtube.com/vi/${video.youtubeVideoId}/hqdefault.jpg`;
                              }
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#475569]">
                            <Icon name="play_circle" className="text-4xl" />
                          </div>
                        )}
                        {video.duration && (
                          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 text-[#0F172A] text-[11px] font-mono font-bold">
                            {video.duration}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <h4 className="font-extrabold text-sm sm:text-base text-[#0F172A] line-clamp-2 leading-snug">
                            {safeStr(video.title)}
                          </h4>
                          {video.description && (
                            <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                              {safeStr(video.description)}
                            </p>
                          )}

                          {/* Chapters & Notes Indicators */}
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            {Array.isArray(video.chapters) && video.chapters.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold">
                                <Icon name="format_list_numbered" className="text-xs" />
                                <span>{video.chapters.length} {video.chapters.length === 1 ? 'Chapter' : 'Chapters'}</span>
                              </span>
                            )}
                            {(video.notesUrl || video.notesName) && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-purple-200/60 text-[10px] font-bold" title={video.notesName || 'Notes'}>
                                <Icon name="description" className="text-xs text-purple-600" />
                                <span className="truncate max-w-[120px]">{video.notesName || 'Notes'}</span>
                              </span>
                            )}
                            {video.notesUrl && (
                              <a
                                href={video.notesUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-700 hover:underline flex items-center gap-0.5 font-semibold text-[10px]"
                                title="Download / Preview Note"
                              >
                                <Icon name="download" className="text-[11px]" />
                                <span>Note</span>
                              </a>
                            )}
                          </div>

                          {/* In Playlists badges */}
                          <div className="pt-2 flex flex-wrap gap-1 items-center">
                            {video.playlists && video.playlists.length > 0 ? (
                              video.playlists.map((pl) => (
                                <span
                                  key={pl.id}
                                  className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-bold"
                                >
                                  {safeStr(pl.title)}
                                </span>
                              ))
                            ) : (
                              <span className="text-[11px] text-zinc-400 italic font-medium">
                                Not in any playlist yet
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Action Bar */}
                        <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenAnswerSubmissions(video)}
                              className="px-3 py-1.5 rounded-xl border border-blue-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-[#0F172A] flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                              title="View student answer submissions for this video"
                            >
                              <Icon name="folder_shared" className="text-sm text-[#0F172A]" />
                              <span>Answer Submissions</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenEditVideo(video, 'library')}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-[#0F172A] hover:bg-slate-100 flex items-center gap-1 transition cursor-pointer"
                              title="Edit Video Details"
                            >
                              <Icon name="edit" className="text-sm text-[#0F172A]" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteVideo(video, 'library')}
                              className="px-3 py-1.5 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-1 transition cursor-pointer"
                              title="Delete Video"
                            >
                              <Icon name="delete" className="text-sm text-red-600" />
                              <span>Delete</span>
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            {video.youtubeUrl && (
                              <a
                                href={video.youtubeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-[#475569] hover:text-[#0F172A] flex items-center gap-1 font-semibold"
                                title="Watch on YouTube"
                              >
                                <span>Watch</span>
                                <Icon name="open_in_new" className="text-[12px]" />
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => handleOpenAddToPlaylist(video)}
                              className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                            >
                              <Icon name="playlist_add" className="text-sm text-[#2563EB]" />
                              <span>Add to Playlist</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL 1: COMPREHENSIVE CREATE / EDIT PLAYLIST MODAL ──────────────── */}
      {playlistModalOpen && (
        <PlaylistBuilderModal
          isOpen={playlistModalOpen}
          onClose={() => {
            setPlaylistModalOpen(false);
            setEditingPlaylist(null);
          }}
          playlist={editingPlaylist}
          api={api}
          onSuccess={(saved) => {
            showFeedback(
              editingPlaylist
                ? `Playlist "${saved?.title || 'Playlist'}" updated successfully.`
                : `Playlist "${saved?.title || 'Playlist'}" created successfully.`
            );
            setPlaylistModalOpen(false);
            setEditingPlaylist(null);
            loadData();
          }}
        />
      )}

      {/* ── MODAL 2: ADD / EDIT VIDEO MODAL (With "Save & Add Another"!) ──────── */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
                <Icon name={editingVideo ? 'edit' : 'video_library'} className="text-xl text-[#0F172A]" />
                <span>{editingVideo ? 'Edit Video' : 'Add Video to Playlist'}</span>
              </h2>
              <button
                type="button"
                onClick={() => setVideoModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-[#475569] cursor-pointer"
              >
                <Icon name="close" className="text-xl" />
              </button>
            </div>

            <form onSubmit={(e) => handleSaveVideo(e, false)} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#0F172A] uppercase tracking-wider mb-1.5">
                  YouTube Video URL or ID *
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                  value={videoForm.youtubeUrl}
                  onChange={(e) => setVideoForm({ ...videoForm, youtubeUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#0F172A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                />
              </div>

              {/* Automatic YouTube thumbnail preview */}
              {liveVideoId && (
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                  <div className="relative w-24 aspect-video rounded-xl overflow-hidden bg-black shrink-0 border border-slate-200">
                    <img
                      src={`https://img.youtube.com/vi/${liveVideoId}/hqdefault.jpg`}
                      alt="Detected Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-xs min-w-0">
                    <span className="font-extrabold text-emerald-700 flex items-center gap-1">
                      <Icon name="check_circle" className="text-sm" /> Thumbnail Auto-Detected
                    </span>
                    <span className="font-mono text-[#475569] text-[10px] block truncate">
                      ID: {liveVideoId}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Video Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Episode 1: How Modern Entrepreneurship Works"
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#0F172A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Video Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Short summary of what this video lesson covers..."
                  value={videoForm.description}
                  onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#0F172A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#0F172A] uppercase tracking-wider mb-1.5">
                  Duration (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 12:45"
                  value={videoForm.duration}
                  onChange={(e) => setVideoForm({ ...videoForm, duration: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#0F172A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#0F172A] uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Custom Thumbnail (Optional)</span>
                  {uploadingVideoThumb && (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <Icon name="sync" className="animate-spin text-xs" /> Uploading image...
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="https://... or upload custom image"
                    value={videoForm.thumbnailUrl}
                    onChange={(e) => setVideoForm({ ...videoForm, thumbnailUrl: e.target.value })}
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#0F172A] font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                  />
                  <label className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 text-[#0F172A] text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0">
                    <Icon name="upload" className="text-sm" />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadCustomVideoThumb}
                      disabled={uploadingVideoThumb}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Video Chapters & Timestamps Section */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                    <Icon name="schedule" className="text-sm" />
                    <span>Video Chapters & Timestamps</span>
                  </span>
                  <span className="text-[10px] text-[#475569] font-medium">Add clickable video sections</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Chapter Title (e.g. 01. Introduction)"
                    value={newVideoChapterTitle}
                    onChange={(e) => setNewVideoChapterTitle(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#0F172A] font-semibold"
                  />
                  <div className="flex items-center justify-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 text-xs text-[#0F172A] focus-within:ring-1 focus-within:ring-brand-forest/20 shrink-0">
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="MM"
                      value={newVideoChapterMin}
                      onPaste={handleVideoChapterTimePaste}
                      onChange={(e) => setNewVideoChapterMin(e.target.value.replace(/[^\d]/g, ''))}
                      className="w-8 text-center font-mono font-bold text-xs focus:outline-none"
                      title="Minutes (Numeric only)"
                    />
                    <span className="font-mono font-bold text-[#475569] select-none">:</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="SS"
                      value={newVideoChapterSec}
                      onPaste={handleVideoChapterTimePaste}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/[^\d]/g, '');
                        const num = parseInt(digits, 10);
                        if (!digits) setNewVideoChapterSec('');
                        else if (num > 59) setNewVideoChapterSec('59');
                        else setNewVideoChapterSec(digits.slice(0, 2));
                      }}
                      className="w-8 text-center font-mono font-bold text-xs focus:outline-none"
                      title="Seconds (00-59 Numeric only)"
                    />
                    <span className="text-[10px] text-[#475569] font-mono select-none px-1 border-l border-slate-200">
                      MM:SS
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVideoFormChapter}
                    className="px-3 py-1.5 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] cursor-pointer"
                  >
                    + Add
                  </button>
                </div>

                {videoFormChapters.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {videoFormChapters.map((ch) => {
                      const isEditingThis = editingVideoChapterId === ch.id;
                      if (isEditingThis) {
                        return (
                          <div
                            key={ch.id}
                            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs shadow-2xs"
                          >
                            <input
                              type="text"
                              value={editVideoChapterTitle}
                              onChange={(e) => setEditVideoChapterTitle(e.target.value)}
                              className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#0F172A] focus:outline-none"
                              placeholder="Chapter Title"
                            />
                            <div className="flex items-center justify-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-[#0F172A] shrink-0">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="MM"
                                value={editVideoChapterMin}
                                onChange={(e) => setEditVideoChapterMin(e.target.value.replace(/[^\d]/g, ''))}
                                className="w-8 text-center font-mono font-bold text-xs focus:outline-none"
                                title="Minutes"
                              />
                              <span className="font-mono font-bold text-[#475569] select-none">:</span>
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="SS"
                                value={editVideoChapterSec}
                                onChange={(e) => {
                                  const digits = e.target.value.replace(/[^\d]/g, '');
                                  const num = parseInt(digits, 10);
                                  if (!digits) setEditVideoChapterSec('');
                                  else if (num > 59) setEditVideoChapterSec('59');
                                  else setEditVideoChapterSec(digits.slice(0, 2));
                                }}
                                className="w-8 text-center font-mono font-bold text-xs focus:outline-none"
                                title="Seconds (00-59)"
                              />
                              <span className="text-[10px] text-[#475569] font-mono select-none px-1 border-l border-slate-200">
                                MM:SS
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 justify-end">
                              <button
                                type="button"
                                onClick={() => handleSaveEditVideoChapter(ch.id)}
                                className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-[#0F172A] rounded-lg text-xs font-bold transition cursor-pointer"
                                title="Save chapter update"
                              >
                                ✓ Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingVideoChapterId(null)}
                                className="px-2 py-1 bg-white hover:bg-slate-100 text-[#475569] rounded-lg text-xs font-bold border border-slate-200 transition cursor-pointer"
                                title="Cancel editing"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={ch.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 text-xs gap-2 shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="font-mono px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold text-[11px] shrink-0">
                              {ch.timestamp}
                            </span>
                            <span
                              onClick={() => handleStartEditVideoChapter(ch)}
                              className="font-bold text-[#0F172A] truncate cursor-pointer hover:underline hover:text-emerald-800"
                              title="Click to edit chapter title"
                            >
                              {ch.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartEditVideoChapter(ch)}
                              className="text-[#475569] hover:text-[#0F172A] transition p-0.5 cursor-pointer shrink-0"
                              title="Edit chapter title & timestamp"
                            >
                              <Icon name="edit" className="text-xs" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVideoFormChapter(ch.id)}
                            className="text-red-600 hover:text-red-700 transition p-1 cursor-pointer font-bold shrink-0"
                            title="Remove chapter"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-[#475569] italic">
                    Optional: Add timestamps like 00:00, 02:45 to help learners jump to chapters.
                  </p>
                )}
              </div>

              {/* Downloadable Study Notes Section */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                    <Icon name="description" className="text-sm text-[#0F172A]" />
                    <span>Downloadable Study Notes (Optional)</span>
                  </span>
                  {uploadingVideoNote && (
                    <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                      <Icon name="sync" className="animate-spin text-xs" /> Uploading note...
                    </span>
                  )}
                </div>

                {videoForm.notesUrl || videoForm.notesName ? (
                  <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200/80 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                        <Icon name="description" className="text-base" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-purple-900 truncate" title={videoForm.notesName || 'Notes'}>
                          {videoForm.notesName || 'Study Notes.pdf'}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-indigo-700">
                          {videoForm.notesSize && <span>{videoForm.notesSize}</span>}
                          {videoForm.notesExt && <span>• {videoForm.notesExt}</span>}
                          {videoForm.notesUrl && (
                            <a
                              href={videoForm.notesUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="font-bold underline hover:text-purple-900"
                            >
                              Preview
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <label className="px-2.5 py-1 rounded-lg bg-white border border-indigo-200 text-indigo-700 hover:bg-purple-100 text-xs font-bold transition cursor-pointer">
                        Replace
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                          onChange={handleUploadVideoNote}
                          disabled={uploadingVideoNote}
                          className="hidden"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleRemoveVideoNote}
                        className="px-2.5 py-1 rounded-lg bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition cursor-pointer"
                        title="Remove note"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <p className="text-xs font-semibold text-[#0F172A]">Attach PDF or Document notes</p>
                      <p className="text-[10px] text-[#475569]">Supports PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX (max 30MB)</p>
                    </div>
                    <label className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-500/25 border border-emerald-200 text-emerald-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0">
                      <Icon name={uploadingVideoNote ? 'sync' : 'upload_file'} className={uploadingVideoNote ? 'animate-spin text-sm' : 'text-sm'} />
                      <span>{uploadingVideoNote ? 'Uploading...' : 'Upload Video Note (PDF/DOCX)'}</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                        onChange={handleUploadVideoNote}
                        disabled={uploadingVideoNote}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Action Buttons: Cancel, Save & Add Another, Save Video */}
              <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-[#0F172A] font-bold text-xs hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-2">
                  {!editingVideo && (
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={(e) => handleSaveVideo(e, true)}
                      className="px-4 py-2 rounded-xl border border-blue-200 text-white hover:bg-brand-forest hover:text-white font-bold text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <Icon name="add" className="text-sm" />
                      <span>Save & Add Another</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {isSaving && <Icon name="sync" className="animate-spin text-sm" />}
                    <span>{editingVideo ? 'Save Changes' : 'Save & Done'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: ADD EXISTING VIDEO TO PLAYLIST MODAL ─────────────────── */}
      {addToPlaylistModalOpen && targetVideoForPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
                <Icon name="playlist_add" className="text-xl text-[#0F172A]" />
                <span>Add Video to Playlist</span>
              </h2>
              <button
                type="button"
                onClick={() => setAddToPlaylistModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-[#475569] hover:text-[#0F172A] flex items-center justify-center cursor-pointer transition"
              >
                <Icon name="close" className="text-base" />
              </button>
            </div>

            {/* Video Preview Card */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-20 aspect-video rounded-xl bg-black overflow-hidden shrink-0">
                {targetVideoForPlaylist.thumbnailUrl ? (
                  <img
                    src={assetUrl(targetVideoForPlaylist.thumbnailUrl)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#475569]">
                    <Icon name="play_circle" className="text-xl" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-bold text-[#475569] uppercase tracking-wider">Video</div>
                <h4 className="font-extrabold text-sm text-[#0F172A] line-clamp-1">
                  {safeStr(targetVideoForPlaylist.title)}
                </h4>
                {targetVideoForPlaylist.duration && (
                  <span className="text-[11px] font-mono text-[#475569] font-bold">
                    {targetVideoForPlaylist.duration}
                  </span>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Select Playlist */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-[#0F172A] tracking-wide uppercase">
                  Select Course / Playlist <span className="text-red-600">*</span>
                </label>
                <select
                  value={selectedTargetPlaylistId}
                  onChange={(e) => handleTargetPlaylistChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-[#0F172A] font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                >
                  {playlists.map((pl) => (
                    <option key={pl.id} value={pl.id}>
                      {safeStr(pl.title)} {pl.courseName ? `(${safeStr(pl.courseName)})` : ''} — {pl.videos?.length || 0} videos
                    </option>
                  ))}
                </select>
              </div>

              {/* Position Number Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-[#0F172A] tracking-wide uppercase">
                    Position <span className="text-red-600">*</span>
                  </label>
                  <span className="text-[11px] text-[#475569] font-semibold">
                    1 to {suggestedNextPosition}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max={suggestedNextPosition}
                    value={targetVideoPosition}
                    onChange={(e) => setTargetVideoPosition(e.target.value)}
                    disabled={isAlreadyInSelectedPlaylist}
                    className="w-24 px-3.5 py-2.5 rounded-xl border border-slate-200 text-center text-sm text-[#0F172A] font-black focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 disabled:opacity-50 disabled:bg-slate-100"
                  />
                  <div className="text-xs text-[#475569] font-medium leading-tight">
                    {isAlreadyInSelectedPlaylist ? (
                      <span className="text-amber-700 font-bold flex items-center gap-1">
                        <Icon name="warning" className="text-sm" />
                        This video is already in this playlist.
                      </span>
                    ) : parseInt(targetVideoPosition, 10) < suggestedNextPosition ? (
                      <span className="text-emerald-700 font-semibold">
                        Existing videos at #{targetVideoPosition} and after will automatically shift down.
                      </span>
                    ) : (
                      <span>Will be added as the last video in the playlist.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons: Cancel and Add to Playlist */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAddToPlaylistModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-[#0F172A] font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isAlreadyInSelectedPlaylist || isAddingToPlaylist}
                onClick={handleConfirmAddToPlaylist}
                className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingToPlaylist ? (
                  <>
                    <Icon name="sync" className="animate-spin text-sm" />
                    <span>Adding...</span>
                  </>
                ) : isAlreadyInSelectedPlaylist ? (
                  <>
                    <Icon name="check" className="text-sm" />
                    <span>Already Added</span>
                  </>
                ) : (
                  <>
                    <Icon name="playlist_add" className="text-sm text-[#2563EB]" />
                    <span>Add to Playlist</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ── MODAL 4: ADD ALL/ANY AVAILABLE VIDEOS TO ACTIVE PLAYLIST ──────── */}
      {addExistingModalOpen && activePlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 shrink-0">
              <div className="space-y-0.5">
                <h2 className="text-lg font-black text-[#0F172A] flex items-center gap-2">
                  <Icon name="video_library" className="text-xl text-[#0F172A]" />
                  <span>Add Existing Videos to Playlist</span>
                </h2>
                <p className="text-xs text-[#475569] font-medium">
                  Adding to <span className="font-bold text-[#0F172A]">"{safeStr(activePlaylist.title)}"</span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAddExistingModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-[#475569] hover:text-[#0F172A] flex items-center justify-center cursor-pointer transition shrink-0"
              >
                <Icon name="close" className="text-base" />
              </button>
            </div>

            {/* Filter & Selection Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div className="relative w-full sm:w-72">
                <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569] text-sm" />
                <input
                  type="text"
                  placeholder="Filter available videos..."
                  value={existingVideosSearch}
                  onChange={(e) => setExistingVideosSearch(e.target.value)}
                  className="w-full pl-8 pr-8 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] font-medium placeholder:text-brand-textMuted/60 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                />
                {existingVideosSearch && (
                  <button
                    type="button"
                    onClick={() => setExistingVideosSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#0F172A] text-xs"
                  >
                    <Icon name="close" className="text-xs" />
                  </button>
                )}
              </div>

              {availableVideosForActive.length > 0 && (
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  <button
                    type="button"
                    onClick={handleToggleSelectAllAvailable}
                    className="px-3 py-1.5 rounded-xl border border-brand-forest/30 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-[#0F172A] transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Icon
                      name={
                        filteredAvailableVideos.length > 0 &&
                          filteredAvailableVideos.every((v) =>
                            selectedExistingVideoIds.includes(v.id || v.youtubeVideoId)
                          )
                          ? 'check_box'
                          : 'check_box_outline_blank'
                      }
                      className="text-sm"
                    />
                    <span>
                      {filteredAvailableVideos.length > 0 &&
                        filteredAvailableVideos.every((v) =>
                          selectedExistingVideoIds.includes(v.id || v.youtubeVideoId)
                        )
                        ? 'Deselect All'
                        : `Select All (${filteredAvailableVideos.length})`}
                    </span>
                  </button>

                  <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {selectedExistingVideoIds.length} selected
                  </span>
                </div>
              )}
            </div>

            {/* Video List (Scrollable) */}
            <div className="flex-1 overflow-y-auto min-h-[220px] max-h-[360px] pr-1 space-y-2.5">
              {availableVideosForActive.length === 0 ? (
                <div className="py-12 text-center rounded-2xl border-2 border-dashed border-slate-200 p-6 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                    <Icon name="check" className="text-2xl" />
                  </div>
                  <h4 className="font-black text-[#0F172A] text-sm">All Library Videos Already Added!</h4>
                  <p className="text-xs text-[#475569] max-w-sm mx-auto">
                    Every video currently in your library is already in this playlist. Use the "+ Add Video" button to add a new YouTube video.
                  </p>
                </div>
              ) : filteredAvailableVideos.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#475569] font-bold">
                  No available videos match "{existingVideosSearch}".
                </div>
              ) : (
                filteredAvailableVideos.map((vid) => {
                  const key = vid.id || vid.youtubeVideoId;
                  const isSelected = selectedExistingVideoIds.includes(key);

                  return (
                    <div
                      key={key}
                      onClick={() => handleToggleSelectVideo(key)}
                      className={`p-3 rounded-2xl border transition flex items-center gap-3.5 cursor-pointer ${isSelected
                        ? 'border-blue-200 bg-slate-50 shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-white'
                        }`}
                    >
                      {/* Checkbox */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => { }} // Handled by parent div onClick
                        className="w-4 h-4 rounded text-[#0F172A] accent-brand-forest cursor-pointer shrink-0"
                      />

                      {/* Video Thumbnail */}
                      <div className="w-20 aspect-video rounded-xl bg-black overflow-hidden shrink-0 relative">
                        {vid.thumbnailUrl ? (
                          <img
                            src={assetUrl(vid.thumbnailUrl)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[#475569]">
                            <Icon name="play_circle" className="text-xl" />
                          </div>
                        )}
                        {vid.duration && (
                          <span className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/85 text-[#0F172A] text-[9px] font-mono font-bold">
                            {vid.duration}
                          </span>
                        )}
                      </div>

                      {/* Video Title & Meta */}
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <h4 className="font-extrabold text-xs sm:text-sm text-[#0F172A] line-clamp-1">
                          {safeStr(vid.title)}
                        </h4>
                        {vid.description && (
                          <p className="text-[11px] text-[#475569] line-clamp-1">
                            {safeStr(vid.description)}
                          </p>
                        )}
                        <div className="flex items-center gap-2 pt-0.5 flex-wrap">
                          {vid.playlists && vid.playlists.length > 0 ? (
                            <span className="text-[10px] text-[#475569]">
                              From: {vid.playlists.map((p) => safeStr(p.title)).join(', ')}
                            </span>
                          ) : (
                            <span className="text-[10px] text-zinc-400 italic">Library video</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Insertion Position & Summary */}
            {availableVideosForActive.length > 0 && (
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-black text-[#0F172A] uppercase tracking-wider">
                    Add At Position:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={(activePlaylist.videos?.length || 0) + 1}
                    value={existingVideosInsertPos}
                    onChange={(e) => setExistingVideosInsertPos(e.target.value)}
                    className="w-20 px-3 py-1.5 rounded-xl border border-slate-200 text-center text-xs font-black text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                  />
                  <span className="text-[11px] text-[#475569] font-medium">
                    (1 to {(activePlaylist.videos?.length || 0) + 1})
                  </span>
                </div>

                <div className="text-[11px] text-[#475569] text-right">
                  {selectedExistingVideoIds.length > 0 ? (
                    <span className="text-emerald-700 font-bold">
                      {selectedExistingVideoIds.length} {selectedExistingVideoIds.length === 1 ? 'video' : 'videos'} ready to add
                    </span>
                  ) : (
                    <span>Select videos above to add them</span>
                  )}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setAddExistingModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-[#0F172A] font-bold text-xs hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={selectedExistingVideoIds.length === 0 || isSubmittingExisting}
                onClick={handleConfirmAddExistingVideos}
                className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingExisting ? (
                  <>
                    <Icon name="sync" className="animate-spin text-sm" />
                    <span>Adding Videos...</span>
                  </>
                ) : (
                  <>
                    <Icon name="playlist_add" className="text-sm text-[#2563EB]" />
                    <span>
                      {selectedExistingVideoIds.length === 0
                        ? 'Select Videos to Add'
                        : selectedExistingVideoIds.length === 1
                          ? 'Add 1 Video to Playlist'
                          : selectedExistingVideoIds.length === availableVideosForActive.length
                            ? `Add All (${selectedExistingVideoIds.length}) Videos`
                            : `Add ${selectedExistingVideoIds.length} Videos to Playlist`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 5: VIDEO ANSWER SUBMISSIONS MODAL ───────────────────────── */}
      {submissionsModalOpen && submissionVideoTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-[#2563EB] flex items-center justify-center shrink-0 shadow-xs">
                  <Icon name="folder_shared" className="text-xl" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-[#0F172A]">
                      Answer Submissions
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {videoSubmissions.length} Submissions
                    </span>
                  </div>
                  <p className="text-xs text-[#475569] flex items-center gap-1.5 mt-0.5 truncate">
                    <Icon name="smart_display" className="text-xs text-[#0F172A] shrink-0" />
                    <span className="truncate">
                      Video: <strong className="text-[#0F172A]">{safeStr(submissionVideoTarget.title)}</strong>
                    </span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSubmissionsModalOpen(false);
                  setSubmissionVideoTarget(null);
                  setReviewingVideoSubmission(null);
                }}
                className="p-2 rounded-xl text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition cursor-pointer"
              >
                <Icon name="close" className="text-lg" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Info banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-2.5 text-[#0F172A]">
                <Icon name="ondemand_video" className="text-base text-[#0F172A] shrink-0" />
                <p className="text-xs font-medium leading-relaxed">
                  The questions are asked inside the YouTube video. Below are all answers uploaded by learners who watched this video.
                </p>
              </div>

              {/* Review Section */}
              {reviewingVideoSubmission && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 animate-scale-up">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                    <div className="flex items-center gap-2 font-black text-xs text-emerald-700">
                      <Icon name="rate_review" className="text-base text-emerald-700" />
                      <span>Review Submission: {reviewingVideoSubmission.userName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReviewingVideoSubmission(null)}
                      className="text-[#475569] hover:text-[#0F172A] cursor-pointer"
                    >
                      <Icon name="close" className="text-sm" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#475569]">Learner:</span>
                      <div className="font-bold text-[#0F172A]">
                        {reviewingVideoSubmission.userName} ({reviewingVideoSubmission.userEmail})
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#475569]">Answer File:</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <button
                          type="button"
                          onClick={() => setPreviewSubmissionFile({
                            url: reviewingVideoSubmission.fileUrl,
                            name: reviewingVideoSubmission.fileName || 'Answer Document',
                            type: reviewingVideoSubmission.fileType || 'FILE',
                          })}
                          className="text-[#0F172A] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Icon name="visibility" className="text-xs" />
                          <span>{reviewingVideoSubmission.fileName || 'View File'}</span>
                        </button>
                        <a
                          href={assetUrl(reviewingVideoSubmission.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          download
                          className="text-[#475569] hover:text-[#0F172A]"
                          title="Download"
                        >
                          <Icon name="download" className="text-xs" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-[#0F172A]">
                      Admin Feedback / Update Instructions (Required when requesting update):
                    </label>
                    <textarea
                      rows={2}
                      value={videoReviewFeedback}
                      onChange={(e) => setVideoReviewFeedback(e.target.value)}
                      placeholder="e.g. Please correct the second answer and upload the updated document."
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setReviewingVideoSubmission(null)}
                      className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#475569] hover:bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={savingVideoReview}
                      onClick={() => handleSubmitVideoReview(reviewingVideoSubmission.submissionId || reviewingVideoSubmission.id, 'needs_revision')}
                      className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-1 disabled:opacity-50"
                    >
                      <Icon name="replay" className="text-xs" />
                      <span>Request Update</span>
                    </button>
                    <button
                      type="button"
                      disabled={savingVideoReview}
                      onClick={() => handleSubmitVideoReview(reviewingVideoSubmission.submissionId || reviewingVideoSubmission.id, 'reviewed')}
                      className="px-4 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-2xs cursor-pointer flex items-center gap-1 disabled:opacity-50"
                    >
                      <Icon name="check_circle" className="text-xs text-[#2563EB]" />
                      <span>Mark Reviewed</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submissions Table */}
              {loadingVideoSubmissions ? (
                <div className="py-12 text-center space-y-2">
                  <Icon name="sync" className="animate-spin text-2xl text-[#0F172A] mx-auto" />
                  <p className="text-xs text-[#475569] font-bold">Loading submissions for this video...</p>
                </div>
              ) : videoSubmissions.length === 0 ? (
                <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-2xl p-6 space-y-2">
                  <Icon name="folder_open" className="text-4xl text-[#475569] mx-auto" />
                  <h4 className="font-extrabold text-sm text-[#0F172A]">No Answer Submissions Yet</h4>
                  <p className="text-xs text-[#475569] max-w-sm mx-auto">
                    When learners watch this video and submit their answers, their files will appear here for you to view, download, and review.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-[#475569]">
                        <th className="py-2.5 px-3">User</th>
                        <th className="py-2.5 px-3">File</th>
                        <th className="py-2.5 px-3">Submitted</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {videoSubmissions.map((sub) => {
                        const sId = sub.submissionId || sub.id;
                        const ext = sub.fileType || (sub.fileName ? sub.fileName.split('.').pop()?.toUpperCase() : 'FILE');
                        return (
                          <tr key={sId || sub.userId} className="hover:bg-white transition">
                            <td className="py-3 px-3">
                              <div className="font-bold text-[#0F172A]">{sub.userName || 'Learner'}</div>
                              <div className="text-[10px] text-[#475569]">{sub.userEmail || ''}</div>
                            </td>

                            <td className="py-3 px-3">
                              {sub.fileUrl ? (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    {ext}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setPreviewSubmissionFile({
                                      url: sub.fileUrl,
                                      name: sub.fileName || 'Answer Document',
                                      type: ext,
                                    })}
                                    className="font-bold text-[#0F172A] hover:underline truncate max-w-[140px] cursor-pointer"
                                    title={sub.fileName}
                                  >
                                    {sub.fileName || 'Answer File'}
                                  </button>
                                </div>
                              ) : (
                                <span className="text-[#475569] italic">No file</span>
                              )}
                            </td>

                            <td className="py-3 px-3 text-[#475569] text-[11px] whitespace-nowrap">
                              {sub.submittedAt
                                ? new Date(sub.submittedAt).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                                : '—'}
                            </td>

                            <td className="py-3 px-3">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${sub.status === 'reviewed'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : sub.status === 'needs_revision'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : sub.status === 'resubmitted'
                                      ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-300'
                                      : sub.status === 'submitted'
                                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                        : 'bg-slate-100 text-[#475569] border border-slate-200'
                                  }`}
                              >
                                {sub.status === 'needs_revision' ? 'Revision Required' : sub.status}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                {sub.fileUrl && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setPreviewSubmissionFile({
                                        url: sub.fileUrl,
                                        name: sub.fileName || 'Answer Document',
                                        type: ext,
                                      })}
                                      className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-[#0F172A] font-bold text-xs inline-flex items-center gap-1 transition cursor-pointer"
                                      title="View File"
                                    >
                                      <Icon name="visibility" className="text-xs" />
                                      <span>View</span>
                                    </button>

                                    <a
                                      href={assetUrl(sub.fileUrl)}
                                      target="_blank"
                                      rel="noreferrer"
                                      download
                                      className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#0F172A] font-bold text-xs inline-flex items-center gap-1 transition"
                                      title="Download"
                                    >
                                      <Icon name="download" className="text-xs" />
                                      <span>Download</span>
                                    </a>
                                  </>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    setReviewingVideoSubmission(sub);
                                    setVideoReviewFeedback(sub.adminFeedback || '');
                                  }}
                                  className="px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition cursor-pointer shadow-2xs"
                                >
                                  Review
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-end bg-slate-50">
              <button
                type="button"
                onClick={() => {
                  setSubmissionsModalOpen(false);
                  setSubmissionVideoTarget(null);
                  setReviewingVideoSubmission(null);
                }}
                className="px-5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0F172A] hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── IN-APP FILE PREVIEW MODAL ───────────────────────── */}
      {previewSubmissionFile && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-[#2563EB] text-[#2563EB] flex items-center justify-center shrink-0">
                  <Icon name="description" className="text-base" />
                </span>
                <div className="min-w-0">
                  <h4 className="text-sm font-extrabold text-[#0F172A] truncate">{previewSubmissionFile.name}</h4>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#475569]">{previewSubmissionFile.type || 'DOCUMENT'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={assetUrl(previewSubmissionFile.url)}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-1 transition"
                >
                  <Icon name="download" className="text-xs" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewSubmissionFile(null)}
                  className="p-1.5 rounded-xl text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 cursor-pointer"
                >
                  <Icon name="close" className="text-base" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 flex items-center justify-center min-h-[55vh]">
              {previewSubmissionFile.type === 'PDF' ? (
                <iframe
                  src={assetUrl(previewSubmissionFile.url)}
                  title={previewSubmissionFile.name}
                  className="w-full h-[70vh] rounded-2xl border border-slate-200 bg-white shadow-sm"
                />
              ) : ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF'].includes(previewSubmissionFile.type) ? (
                <img
                  src={assetUrl(previewSubmissionFile.url)}
                  alt={previewSubmissionFile.name}
                  className="max-h-[70vh] max-w-full rounded-2xl shadow-sm object-contain"
                />
              ) : (
                <div className="text-center p-8 space-y-4 max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <Icon name="file_present" className="text-5xl text-[#475569] mx-auto" />
                  <div>
                    <h5 className="font-extrabold text-sm text-[#0F172A]">{previewSubmissionFile.name}</h5>
                    <p className="text-xs text-[#475569] mt-1">
                      Direct viewing is available by downloading or opening with your local office viewer ({previewSubmissionFile.type}).
                    </p>
                  </div>
                  <a
                    href={assetUrl(previewSubmissionFile.url)}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black shadow-xs transition"
                  >
                    <Icon name="download" className="text-sm" />
                    <span>Download File</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
