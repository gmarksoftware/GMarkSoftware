import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import Icon from '../../components/Icon.jsx';
import {
  isValidYoutubeUrl,
  extractYoutubeId,
  getYoutubeThumbnailUrl,
  getYoutubeEmbedUrl,
} from '../../lib/youtube.js';
import { adminApi, assetUrl, resolveApiPath } from '../../lib/api.js';
import { getToken } from '../../lib/AuthContext.jsx';
import { parseTimeToSeconds } from '../../lib/time.js';
import InlineVideoTasksSection from '../../components/admin/InlineVideoTasksSection.jsx';

export const PLAYLIST_CATEGORIES = [
  { key: 'entrepreneurship', label: 'Entrepreneurship' },
  { key: 'business', label: 'Business Guidance' },
  { key: 'digital', label: 'Digital Skills' },
  { key: 'education', label: 'Education & Skills' },
  { key: 'youth', label: 'Youth Development' },
  { key: 'social', label: 'Social Development' },
];

export const PLAYLIST_LEVELS = [
  { key: 'Beginner', label: 'Beginner' },
  { key: 'Intermediate', label: 'Intermediate' },
  { key: 'Advanced', label: 'Advanced' },
  { key: 'All levels', label: 'All Levels' },
];

function safeStr(o) {
  if (!o) return '';
  if (typeof o === 'string') return o;
  return o.en || o.mr || '';
}

const parseSecondsFromTime = parseTimeToSeconds;

export default function PlaylistBuilderModal({
  isOpen,
  onClose,
  playlist = null,
  api = null,
  onSuccess = null,
}) {
  const { t } = useLanguage();

  // Active section tab: only 3 sections
  // 'details' = Playlist Details & Video Management
  // 'materials' = Study Materials
  // 'quiz' = Assessment & Quiz
  // 'tasks' = Tasks & Assignments
  const [activeTab, setActiveTab] = useState('details');
  const [taskTargetVideoIndex, setTaskTargetVideoIndex] = useState('general');
  const [generalDraftTasks, setGeneralDraftTasks] = useState([]);

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. PLAYLIST BASIC INFORMATION
  // ─────────────────────────────────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('entrepreneurship');
  const [level, setLevel] = useState('Beginner');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [isTrending, setIsTrending] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const thumbInputRef = useRef(null);

  // Dynamic Learning Outcomes
  const [learningOutcomes, setLearningOutcomes] = useState([]);
  const [newOutcomeInput, setNewOutcomeInput] = useState('');

  // Dynamic Prerequisites / Requirements
  const [requirements, setRequirements] = useState([]);
  const [newReqInput, setNewReqInput] = useState('');

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. MULTIPLE PLAYLIST VIDEO BUILDER & CHAPTERS
  // ─────────────────────────────────────────────────────────────────────────────
  const [videos, setVideos] = useState([]);

  // Form for adding new video to playlist
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoTitleInput, setVideoTitleInput] = useState('');
  const [videoDurationInput, setVideoDurationInput] = useState('');
  const [videoDescInput, setVideoDescInput] = useState('');

  // Individual Video Management: which video card is currently expanded for editing
  const [expandedVideoIndex, setExpandedVideoIndex] = useState(null);

  // New chapter inputs for expanded video card
  const [newChapterTitle, setNewChapterTitle] = useState('');
  const [newChapterMin, setNewChapterMin] = useState('');
  const [newChapterSec, setNewChapterSec] = useState('');
  const [newChapterNote, setNewChapterNote] = useState(null); // { url, name, size, ext }
  const [uploadingNewChapterNote, setUploadingNewChapterNote] = useState(false);

  // Inline editing state for existing chapters
  const [editingChapterId, setEditingChapterId] = useState(null);
  const [editChapterTitle, setEditChapterTitle] = useState('');
  const [editChapterMin, setEditChapterMin] = useState('');
  const [editChapterSec, setEditChapterSec] = useState('');

  // Note uploading states for video and chapter
  const [uploadingVideoNoteIndex, setUploadingVideoNoteIndex] = useState(null);
  const [uploadingChapterNoteKey, setUploadingChapterNoteKey] = useState(null);

  // Video Preview modal state
  const [previewVideoItem, setPreviewVideoItem] = useState(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. STUDY MATERIALS & NOTES
  // ─────────────────────────────────────────────────────────────────────────────
  const [resources, setResources] = useState([]);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDesc, setMaterialDesc] = useState('');
  const [materialTargetVideo, setMaterialTargetVideo] = useState('all'); // 'all' or video index (0, 1, ...)
  const [materialFile, setMaterialFile] = useState(null);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const [materialError, setMaterialError] = useState('');
  const materialFileInputRef = useRef(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. ASSESSMENT & QUIZ BUILDER
  // ─────────────────────────────────────────────────────────────────────────────
  const [quizEnabled, setQuizEnabled] = useState(true);
  const [passingScore, setPassingScore] = useState(70);
  const [assessments, setAssessments] = useState([]);

  // New question form state
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizType, setQuizType] = useState('mcq'); // 'mcq' | 'true_false'
  const [quizTargetVideo, setQuizTargetVideo] = useState('all');
  const [quizOptions, setQuizOptions] = useState(['', '', '', '']);
  const [quizCorrectAnswer, setQuizCorrectAnswer] = useState(0); // 0-3 for mcq, 'True'|'False' for tf
  const [quizExplanation, setQuizExplanation] = useState('');
  const [quizTriggerType, setQuizTriggerType] = useState('end'); // 'end' | 'timestamp'
  const [quizTriggerMinutes, setQuizTriggerMinutes] = useState(1);
  const [quizTriggerSeconds, setQuizTriggerSeconds] = useState(0);
  const [quizError, setQuizError] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [selectedQuizFilterVideo, setSelectedQuizFilterVideo] = useState('all'); // 'all' | video index '0', '1'... | 'entire_playlist'

  // General Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // ─────────────────────────────────────────────────────────────────────────────
  // PREFILL OR RESET ON OPEN
  // ─────────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    setActiveTab('details');
    setError(null);
    setSubmitting(false);
    setExpandedVideoIndex(null);
    setPreviewVideoItem(null);
    setEditingQuestionId(null);
    setMaterialError('');
    setQuizError('');

    if (playlist) {
      // Editing existing playlist
      setTitle(playlist.title || '');
      setCategory(playlist.category || 'entrepreneurship');
      setLevel(playlist.level || 'Beginner');
      setShortDescription(playlist.shortDescription || '');
      setDescription(playlist.description || '');
      setIsFree(playlist.isFree !== undefined ? Boolean(playlist.isFree) : true);
      setIsTrending(Boolean(playlist.isTrending));
      setThumbnailUrl(playlist.thumbnailUrl || '');

      // Learning outcomes
      let outcomes = [];
      if (Array.isArray(playlist.learn)) {
        outcomes = playlist.learn;
      } else if (typeof playlist.learn === 'string' && playlist.learn.trim()) {
        outcomes = playlist.learn.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
      }
      setLearningOutcomes(outcomes);

      // Requirements
      let reqs = [];
      if (Array.isArray(playlist.requirements)) {
        reqs = playlist.requirements;
      } else if (typeof playlist.requirements === 'string' && playlist.requirements.trim()) {
        reqs = playlist.requirements.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
      }
      setRequirements(reqs);

      // Videos
      const rawVideos = Array.isArray(playlist.videos) ? playlist.videos : [];
      setVideos(
        rawVideos.map((v, idx) => ({
          id: v.id || `vid_${Date.now()}_${idx}`,
          title: v.title || `Video ${idx + 1}`,
          youtubeUrl: v.youtubeUrl || (v.youtubeVideoId ? `https://www.youtube.com/watch?v=${v.youtubeVideoId}` : ''),
          youtubeVideoId: v.youtubeVideoId || extractYoutubeId(v.youtubeUrl || ''),
          thumbnailUrl: v.thumbnailUrl || (v.youtubeVideoId ? getYoutubeThumbnailUrl(v.youtubeVideoId, 'hqdefault') : ''),
          duration: v.duration || '',
          description: v.description || '',
          displayOrder: typeof v.displayOrder === 'number' ? v.displayOrder : idx,
          chapters: Array.isArray(v.chapters) ? [...v.chapters] : [],
          notesUrl: v.notesUrl || null,
          notesName: v.notesName || null,
          notesSize: v.notesSize || null,
          notesExt: v.notesExt || null,
        }))
      );

      // Resources / Study materials
      setResources(Array.isArray(playlist.resources) ? [...playlist.resources] : []);

      // Assessments / Quizzes
      let initialAssessments = Array.isArray(playlist.assessments) ? [...playlist.assessments] : [];
      if (Array.isArray(playlist.videos)) {
        playlist.videos.forEach((v, vIdx) => {
          if (Array.isArray(v.assessments)) {
            v.assessments.forEach((vq) => {
              if (!initialAssessments.some((existing) => existing.id === vq.id)) {
                initialAssessments.push({
                  ...vq,
                  videoIndex: vq.videoIndex !== undefined && vq.videoIndex !== null ? vq.videoIndex : vIdx,
                  videoTitle: vq.videoTitle || v.title,
                });
              }
            });
          }
        });
      }
      setAssessments(initialAssessments);
      setQuizEnabled(playlist.assessmentSettings?.enabled !== false);
      setPassingScore(Number(playlist.assessmentSettings?.passingScore ?? 70));
      setSelectedQuizFilterVideo('all');
      setQuizTargetVideo(rawVideos.length > 0 ? '0' : 'all');
      setTaskTargetVideoIndex(rawVideos.length > 0 ? '0' : 'general');
      setGeneralDraftTasks([]);
    } else {
      // Creating fresh new playlist
      setTitle('');
      setCategory('entrepreneurship');
      setLevel('Beginner');
      setShortDescription('');
      setDescription('');
      setIsFree(true);
      setIsTrending(false);
      setThumbnailUrl('');
      setLearningOutcomes([]);
      setNewOutcomeInput('');
      setRequirements([]);
      setNewReqInput('');
      setVideos([]);
      setVideoUrlInput('');
      setVideoTitleInput('');
      setVideoDurationInput('');
      setVideoDescInput('');
      setResources([]);
      setMaterialTitle('');
      setMaterialDesc('');
      setMaterialTargetVideo('all');
      setMaterialFile(null);
      setAssessments([]);
      setQuizEnabled(true);
      setPassingScore(70);
      setQuizQuestion('');
      setQuizType('mcq');
      setQuizTargetVideo('all');
      setSelectedQuizFilterVideo('all');
      setTaskTargetVideoIndex('general');
      setGeneralDraftTasks([]);
      setQuizOptions(['', '', '', '']);
      setQuizCorrectAnswer(0);
      setQuizExplanation('');
      setQuizTriggerType('end');
      setQuizTriggerMinutes(1);
      setQuizTriggerSeconds(0);
    }
  }, [isOpen, playlist]);

  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLERS: THUMBNAIL
  // ─────────────────────────────────────────────────────────────────────────────
  const handleUploadThumbnailFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
      return;
    }
    setUploadingThumb(true);
    try {
      const client = api || adminApi(getToken());
      let uploadedUrl = null;
      if (typeof client?.uploadThumbnail === 'function') {
        const res = await client.uploadThumbnail(file);
        if (res?.thumbnailUrl || res?.url) uploadedUrl = res.thumbnailUrl || res.url;
      }
      if (!uploadedUrl) {
        uploadedUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      }
      setThumbnailUrl(uploadedUrl);
    } catch (err) {
      console.warn('Thumbnail upload fallback:', err);
      try {
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        setThumbnailUrl(dataUrl);
      } catch (e2) {
        alert('Failed to upload thumbnail: ' + err.message);
      }
    } finally {
      setUploadingThumb(false);
      if (e.target) e.target.value = '';
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLERS: LEARNING OUTCOMES & PREREQUISITES
  // ─────────────────────────────────────────────────────────────────────────────
  const handleAddOutcome = (e) => {
    if (e) e.preventDefault();
    const clean = newOutcomeInput.trim();
    if (!clean) return;
    if (!learningOutcomes.includes(clean)) {
      setLearningOutcomes((prev) => [...prev, clean]);
    }
    setNewOutcomeInput('');
  };

  const handleRemoveOutcome = (indexToRemove) => {
    setLearningOutcomes((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleAddRequirement = (e) => {
    if (e) e.preventDefault();
    const clean = newReqInput.trim();
    if (!clean) return;
    if (!requirements.includes(clean)) {
      setRequirements((prev) => [...prev, clean]);
    }
    setNewReqInput('');
  };

  const handleRemoveRequirement = (indexToRemove) => {
    setRequirements((prev) => prev.filter((_, i) => i !== indexToRemove));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLERS: MULTIPLE VIDEOS BUILDER
  // ─────────────────────────────────────────────────────────────────────────────
  const handleAddVideo = () => {
    const trimmedUrl = videoUrlInput.trim();
    if (!trimmedUrl) {
      setError('Please enter a YouTube video URL');
      return;
    }
    if (!isValidYoutubeUrl(trimmedUrl)) {
      setError('Please enter a valid YouTube video URL (e.g. https://www.youtube.com/watch?v=...)');
      return;
    }
    const ytId = extractYoutubeId(trimmedUrl);
    const vTitle = videoTitleInput.trim() || `Video ${videos.length + 1}`;
    const thumb = ytId ? getYoutubeThumbnailUrl(ytId, 'hqdefault') : '';

    const newVid = {
      id: `vid_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      title: vTitle,
      youtubeUrl: trimmedUrl,
      youtubeVideoId: ytId,
      thumbnailUrl: thumb,
      duration: videoDurationInput.trim() || '10:00',
      description: videoDescInput.trim() || '',
      displayOrder: videos.length,
      chapters: [],
      notesUrl: null,
      notesName: null,
      notesSize: null,
      notesExt: null,
    };

    setVideos((prev) => [...prev, newVid]);
    setVideoUrlInput('');
    setVideoTitleInput('');
    setVideoDurationInput('');
    setVideoDescInput('');
    if (error) setError(null);
  };

  const handleRemoveVideo = (indexToRemove) => {
    setVideos((prev) => {
      const filtered = prev.filter((_, i) => i !== indexToRemove);
      return filtered.map((v, i) => ({ ...v, displayOrder: i }));
    });
    if (expandedVideoIndex === indexToRemove) {
      setExpandedVideoIndex(null);
    } else if (expandedVideoIndex > indexToRemove) {
      setExpandedVideoIndex(expandedVideoIndex - 1);
    }
  };

  const handleMoveVideo = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= videos.length) return;
    setVideos((prev) => {
      const copy = [...prev];
      const item = copy.splice(index, 1)[0];
      copy.splice(targetIndex, 0, item);
      return copy.map((v, i) => ({ ...v, displayOrder: i }));
    });
    if (expandedVideoIndex === index) {
      setExpandedVideoIndex(targetIndex);
    } else if (expandedVideoIndex === targetIndex) {
      setExpandedVideoIndex(index);
    }
  };

  const handleUpdateVideoField = (index, field, value) => {
    setVideos((prev) => {
      const copy = [...prev];
      const updated = { ...copy[index], [field]: value };
      if (field === 'youtubeUrl') {
        const newYtId = extractYoutubeId(value || '');
        if (newYtId) {
          updated.youtubeVideoId = newYtId;
          updated.thumbnailUrl = getYoutubeThumbnailUrl(newYtId, 'hqdefault');
        }
      }
      copy[index] = updated;
      return copy;
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLERS: INDIVIDUAL VIDEO CHAPTERS & NOTES
  // ─────────────────────────────────────────────────────────────────────────────
  const handleUploadNewChapterNote = async (file) => {
    if (!file) return;
    const allowed = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i.test(file.name);
    if (!allowed) {
      alert('Only PDF, DOC, DOCX, XLS, XLSX, PPT, and PPTX files are allowed.');
      return;
    }
    setUploadingNewChapterNote(true);
    try {
      const client = api || adminApi(getToken());
      let uploadedData = null;
      if (typeof client?.uploadCourseNote === 'function') {
        uploadedData = await client.uploadCourseNote(file);
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

      setNewChapterNote({
        url: fileUrl,
        name: fileName,
        size: fileSize,
        ext: fileExt,
      });
    } catch (err) {
      console.error('Failed to upload chapter note:', err);
      alert(err.message || 'Failed to upload note');
    } finally {
      setUploadingNewChapterNote(false);
    }
  };

  const handleChapterTimePaste = (e) => {
    const pasted = e.clipboardData.getData('text').trim();
    if (pasted.includes(':')) {
      e.preventDefault();
      const parts = pasted.split(':').map((p) => p.replace(/[^\d]/g, ''));
      if (parts.length === 2) {
        setNewChapterMin(parts[0]);
        setNewChapterSec(String(Math.min(59, parseInt(parts[1] || '0', 10))));
      } else if (parts.length === 3) {
        const h = parseInt(parts[0] || '0', 10);
        const m = parseInt(parts[1] || '0', 10);
        setNewChapterMin(String(h * 60 + m));
        setNewChapterSec(String(Math.min(59, parseInt(parts[2] || '0', 10))));
      }
    }
  };

  const handleToggleExpandVideo = (idx) => {
    if (expandedVideoIndex === idx) {
      setExpandedVideoIndex(null);
      setEditingChapterId(null);
    } else {
      setExpandedVideoIndex(idx);
      const chCount = videos[idx]?.chapters?.length || 0;
      setNewChapterTitle(`Chapter ${chCount + 1}`);
      setNewChapterMin('');
      setNewChapterSec('');
      setNewChapterNote(null);
      setEditingChapterId(null);
    }
  };

  const handleAddChapterToVideo = (videoIndex) => {
    const currentVideo = videos[videoIndex];
    const existingChapters = Array.isArray(currentVideo?.chapters) ? [...currentVideo.chapters] : [];
    const fallbackTitle = `Chapter ${existingChapters.length + 1}`;
    const finalTitle = newChapterTitle.trim() || fallbackTitle;

    const m = Math.max(0, parseInt(newChapterMin || '0', 10));
    const s = Math.min(59, Math.max(0, parseInt(newChapterSec || '0', 10)));
    const formattedTime = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const seconds = m * 60 + s;

    const newChapter = {
      id: `ch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: finalTitle,
      timestamp: formattedTime,
      seconds,
      startTime: seconds,
      notesUrl: newChapterNote?.url || null,
      notesName: newChapterNote?.name || null,
      notesSize: newChapterNote?.size || null,
      notesExt: newChapterNote?.ext || null,
    };

    const updatedChapters = [...existingChapters, newChapter];
    updatedChapters.sort((a, b) => (a.seconds || 0) - (b.seconds || 0));

    setVideos((prev) => {
      const copy = [...prev];
      copy[videoIndex] = { ...currentVideo, chapters: updatedChapters };
      return copy;
    });

    setNewChapterTitle(`Chapter ${updatedChapters.length + 1}`);
    setNewChapterMin('');
    setNewChapterSec('');
    setNewChapterNote(null);
  };

  const handleRemoveChapterFromVideo = (videoIndex, chapterId) => {
    setVideos((prev) => {
      const copy = [...prev];
      const currentVideo = copy[videoIndex];
      const existingChapters = Array.isArray(currentVideo.chapters) ? currentVideo.chapters : [];
      const updatedChapters = existingChapters.filter((c) => c.id !== chapterId);
      copy[videoIndex] = {
        ...currentVideo,
        chapters: updatedChapters,
      };
      setNewChapterTitle(`Chapter ${updatedChapters.length + 1}`);
      return copy;
    });
    if (editingChapterId === chapterId) {
      setEditingChapterId(null);
    }
  };

  const handleStartEditChapter = (ch) => {
    setEditingChapterId(ch.id);
    setEditChapterTitle(ch.title || '');
    const totalSec = typeof ch.seconds === 'number'
      ? ch.seconds
      : (typeof ch.startTime === 'number' ? ch.startTime : parseSecondsFromTime(ch.timestamp || '00:00'));
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    setEditChapterMin(String(m));
    setEditChapterSec(String(s).padStart(2, '0'));
  };

  const handleSaveEditChapter = (videoIndex, chapterId) => {
    const m = Math.max(0, parseInt(editChapterMin || '0', 10));
    const s = Math.min(59, Math.max(0, parseInt(editChapterSec || '0', 10)));
    const formattedTime = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const seconds = m * 60 + s;

    setVideos((prev) => {
      const copy = [...prev];
      const currentVideo = copy[videoIndex];
      const existingChapters = Array.isArray(currentVideo.chapters) ? [...currentVideo.chapters] : [];
      const updated = existingChapters.map((c) => {
        if (c.id === chapterId) {
          return {
            ...c,
            title: editChapterTitle.trim() || c.title,
            timestamp: formattedTime,
            seconds,
            startTime: seconds,
          };
        }
        return c;
      });
      updated.sort((a, b) => (a.seconds || 0) - (b.seconds || 0));
      copy[videoIndex] = { ...currentVideo, chapters: updated };
      return copy;
    });
    setEditingChapterId(null);
  };

  const handleUploadVideoNote = async (videoIndex, file) => {
    if (!file) return;
    const allowed = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i.test(file.name);
    if (!allowed) {
      alert('Only PDF, DOC, DOCX, XLS, XLSX, PPT, and PPTX files are allowed.');
      return;
    }
    setUploadingVideoNoteIndex(videoIndex);
    try {
      const client = api || adminApi(getToken());
      let uploadedData = null;
      if (typeof client?.uploadCourseNote === 'function') {
        uploadedData = await client.uploadCourseNote(file);
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

      setVideos((prev) => {
        const copy = [...prev];
        copy[videoIndex] = {
          ...copy[videoIndex],
          notesUrl: fileUrl,
          notesName: fileName,
          notesSize: fileSize,
          notesExt: fileExt,
        };
        return copy;
      });
    } catch (err) {
      console.error('Failed to upload video note:', err);
      alert(err.message || 'Failed to upload note');
    } finally {
      setUploadingVideoNoteIndex(null);
    }
  };

  const handleRemoveVideoNote = (videoIndex) => {
    setVideos((prev) => {
      const copy = [...prev];
      copy[videoIndex] = {
        ...copy[videoIndex],
        notesUrl: null,
        notesName: null,
        notesSize: null,
        notesExt: null,
      };
      return copy;
    });
  };

  const handleUploadChapterNote = async (videoIndex, chapterId, file) => {
    if (!file) return;
    const allowed = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i.test(file.name);
    if (!allowed) {
      alert('Only PDF, DOC, DOCX, XLS, XLSX, PPT, and PPTX files are allowed.');
      return;
    }
    const key = `${videoIndex}_${chapterId}`;
    setUploadingChapterNoteKey(key);
    try {
      const client = api || adminApi(getToken());
      let uploadedData = null;
      if (typeof client?.uploadCourseNote === 'function') {
        uploadedData = await client.uploadCourseNote(file);
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

      setVideos((prev) => {
        const copy = [...prev];
        const v = copy[videoIndex];
        const chapters = (v.chapters || []).map((ch) => {
          if (ch.id === chapterId) {
            return {
              ...ch,
              notesUrl: fileUrl,
              notesName: fileName,
              notesSize: fileSize,
              notesExt: fileExt,
            };
          }
          return ch;
        });
        copy[videoIndex] = { ...v, chapters };
        return copy;
      });
    } catch (err) {
      console.error('Failed to upload chapter note:', err);
      alert(err.message || 'Failed to upload note');
    } finally {
      setUploadingChapterNoteKey(null);
    }
  };

  const handleRemoveChapterNote = (videoIndex, chapterId) => {
    setVideos((prev) => {
      const copy = [...prev];
      const v = copy[videoIndex];
      const chapters = (v.chapters || []).map((ch) => {
        if (ch.id === chapterId) {
          return {
            ...ch,
            notesUrl: null,
            notesName: null,
            notesSize: null,
            notesExt: null,
          };
        }
        return ch;
      });
      copy[videoIndex] = { ...v, chapters };
      return copy;
    });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLERS: STUDY MATERIALS
  // ─────────────────────────────────────────────────────────────────────────────
  const cleanTitleFromFile = (file) => {
    if (!file?.name) return 'Study Material';
    const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    return nameWithoutExt.replace(/[-_]+/g, ' ').trim() || 'Study Material';
  };

  const executeMaterialUpload = async (fileToUpload, explicitTitle) => {
    const targetFile = fileToUpload || materialFile;
    if (!targetFile) {
      if (materialFileInputRef.current) {
        materialFileInputRef.current.click();
      }
      return;
    }

    const titleToUse = (explicitTitle || materialTitle).trim() || cleanTitleFromFile(targetFile);

    setUploadingMaterial(true);
    setMaterialError('');

    try {
      const client = api || adminApi(getToken());
      let uploadedData = null;
      if (typeof client?.uploadCourseNote === 'function') {
        uploadedData = await client.uploadCourseNote(targetFile);
      } else if (typeof client?.uploadStudyMaterial === 'function') {
        uploadedData = await client.uploadStudyMaterial(targetFile);
      } else {
        const fd = new FormData();
        fd.append('file', targetFile);
        const token = getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        let res = await fetch('/admin/courses/upload-note', {
          method: 'POST',
          headers,
          body: fd,
        });
        if (!res.ok) {
          res = await fetch('/api/admin/courses/upload-note', {
            method: 'POST',
            headers,
            body: fd,
          });
        }
        if (!res.ok) throw new Error('Failed to upload study note');
        uploadedData = await res.json();
      }

      const ext = targetFile.name.split('.').pop()?.toUpperCase() || 'PDF';

      const newResource = {
        id: `res_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        title: titleToUse,
        description: materialDesc.trim() || '',
        file: uploadedData?.file || uploadedData?.url || `/uploads/notes/${targetFile.name}`,
        url: uploadedData?.file || uploadedData?.url || `/uploads/notes/${targetFile.name}`,
        name: uploadedData?.name || targetFile.name,
        size: uploadedData?.size || `${(targetFile.size / (1024 * 1024)).toFixed(1)} MB`,
        ext,
        videoTarget: 'all',
        videoTitle: 'Entire Playlist',
        createdAt: new Date().toISOString(),
      };

      setResources((prev) => [...prev, newResource]);
      setMaterialTitle('');
      setMaterialDesc('');
      setMaterialFile(null);
      setMaterialTargetVideo('all');
    } catch (err) {
      setMaterialError(err.message || 'Failed to upload study note');
    } finally {
      if (materialFileInputRef.current) materialFileInputRef.current.value = '';
      setUploadingMaterial(false);
    }
  };

  const handleMaterialFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const titleToUse = materialTitle.trim() || cleanTitleFromFile(file);
    if (!materialTitle.trim()) {
      setMaterialTitle(titleToUse);
    }
    setMaterialFile(file);
    if (materialError) setMaterialError('');
    executeMaterialUpload(file, titleToUse);
  };

  const handleUploadStudyMaterial = async (e) => {
    if (e) e.preventDefault();
    if (!materialFile) {
      if (materialFileInputRef.current) {
        materialFileInputRef.current.click();
      }
      return;
    }
    await executeMaterialUpload(materialFile, materialTitle);
  };

  const handleRemoveMaterial = (resId) => {
    setResources((prev) => prev.filter((r) => r.id !== resId));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLERS: ASSESSMENTS & QUIZZES
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSaveQuizQuestion = (e) => {
    if (e) e.preventDefault();
    setQuizError('');
    if (!quizQuestion.trim()) {
      setQuizError('Please enter the question text.');
      return;
    }
    if (quizType === 'mcq') {
      const emptyIdx = quizOptions.findIndex((opt) => !opt || !opt.trim());
      if (emptyIdx !== -1) {
        setQuizError(`Please fill in option ${String.fromCharCode(65 + emptyIdx)}.`);
        return;
      }
    }

    const isEntirePlaylist = quizTargetVideo === 'all';
    const targetIdx = isEntirePlaylist ? null : Number(quizTargetVideo);
    const targetVid = targetIdx !== null ? videos[targetIdx] : null;
    const assignedVideoTitle = isEntirePlaylist
      ? 'Entire Playlist (Final Quiz)'
      : (targetVid?.title || `Video ${targetIdx + 1}`);
    const assignedVideoId = targetVid ? (targetVid.id || targetVid.youtubeVideoId || null) : null;

    // Validate mid-video timestamp if triggerType is 'timestamp'
    const trigMin = Number(quizTriggerMinutes) || 0;
    const trigSec = Number(quizTriggerSeconds) || 0;
    const totalTrigSec = trigMin * 60 + trigSec;

    if (quizTriggerType === 'timestamp') {
      if (totalTrigSec <= 0) {
        setQuizError('Please enter a valid mid-video timestamp greater than 00:00.');
        return;
      }
      if (targetVid?.duration) {
        const durSec = parseSecondsFromTime(targetVid.duration);
        if (durSec > 0 && totalTrigSec > durSec) {
          setQuizError(
            `Quiz timestamp (${String(trigMin).padStart(2, '0')}:${String(trigSec).padStart(2, '0')}) cannot exceed Video ${targetIdx + 1} duration (${targetVid.duration}).`
          );
          return;
        }
      }
    }

    const questionObj = {
      id: editingQuestionId || `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      videoIndex: targetIdx,
      videoId: assignedVideoId,
      videoTitle: assignedVideoTitle,
      type: quizType,
      question: quizQuestion.trim(),
      options: quizType === 'mcq' ? quizOptions.map((o) => o.trim()) : ['True', 'False'],
      answer: quizType === 'mcq' ? Number(quizCorrectAnswer) : quizCorrectAnswer,
      explanation: quizExplanation.trim(),
      triggerType: quizTriggerType,
      triggerMinutes: trigMin,
      triggerSeconds: trigSec,
    };

    if (editingQuestionId) {
      setAssessments((prev) => prev.map((q) => (q.id === editingQuestionId ? questionObj : q)));
      setEditingQuestionId(null);
    } else {
      setAssessments((prev) => [...prev, questionObj]);
    }

    setQuizQuestion('');
    setQuizOptions(['', '', '', '']);
    setQuizCorrectAnswer(quizType === 'true_false' ? 'True' : 0);
    setQuizExplanation('');
    setQuizTriggerType('end');
    setQuizTriggerMinutes(1);
    setQuizTriggerSeconds(0);
    setQuizError('');
  };

  const handleEditQuizQuestion = (q) => {
    setEditingQuestionId(q.id);
    setQuizQuestion(q.question || '');
    setQuizType(q.type || 'mcq');
    const targetVal = q.videoIndex !== null && q.videoIndex !== undefined ? String(q.videoIndex) : 'all';
    setQuizTargetVideo(targetVal);
    if (targetVal !== 'all') {
      setSelectedQuizFilterVideo(targetVal);
    }
    if (q.type === 'mcq') {
      setQuizOptions(Array.isArray(q.options) && q.options.length >= 4 ? q.options : ['', '', '', '']);
      setQuizCorrectAnswer(Number(q.answer) || 0);
    } else {
      setQuizCorrectAnswer(q.answer === 'False' ? 'False' : 'True');
    }
    setQuizExplanation(q.explanation || '');
    setQuizTriggerType(q.triggerType || 'end');
    setQuizTriggerMinutes(q.triggerMinutes || 1);
    setQuizTriggerSeconds(q.triggerSeconds || 0);
    setQuizError('');
    const formEl = document.getElementById('quiz-question-card');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleCancelEditQuestion = () => {
    setEditingQuestionId(null);
    setQuizQuestion('');
    setQuizOptions(['', '', '', '']);
    setQuizCorrectAnswer(quizType === 'true_false' ? 'True' : 0);
    setQuizExplanation('');
    setQuizTriggerType('end');
    setQuizTriggerMinutes(1);
    setQuizTriggerSeconds(0);
    setQuizError('');
  };

  const handleRemoveQuizQuestion = (qId) => {
    setAssessments((prev) => prev.filter((q) => q.id !== qId));
    if (editingQuestionId === qId) {
      handleCancelEditQuestion();
    }
  };

  const currentTargetVideoObj = useMemo(() => {
    if (quizTargetVideo === 'all') return null;
    return videos[Number(quizTargetVideo)] || null;
  }, [videos, quizTargetVideo]);

  // Keep target video selection in sync when videos array changes (added, removed, reordered)
  useEffect(() => {
    if (videos.length === 0) {
      if (quizTargetVideo !== 'all') {
        setQuizTargetVideo('all');
      }
    } else {
      if (quizTargetVideo === 'all' && selectedQuizFilterVideo !== 'entire_playlist') {
        setQuizTargetVideo('0');
      } else if (quizTargetVideo !== 'all' && Number(quizTargetVideo) >= videos.length) {
        setQuizTargetVideo(String(Math.max(0, videos.length - 1)));
      }
    }
  }, [videos.length]);

  const currentTargetVideoDurationSec = useMemo(() => {
    if (!currentTargetVideoObj?.duration) return 0;
    return parseSecondsFromTime(currentTargetVideoObj.duration);
  }, [currentTargetVideoObj]);

  const groupedVideoSections = useMemo(() => {
    let targetIndices = [];
    if (selectedQuizFilterVideo === 'all') {
      targetIndices = videos.map((_, i) => i);
    } else if (selectedQuizFilterVideo === 'entire_playlist') {
      targetIndices = [];
    } else {
      targetIndices = [Number(selectedQuizFilterVideo)];
    }

    const groups = [];

    targetIndices.forEach((vIdx) => {
      const v = videos[vIdx];
      if (!v) return;
      const vQuestions = assessments.filter(
        (q) => q.videoIndex !== null && q.videoIndex !== undefined && Number(q.videoIndex) === vIdx
      );
      if (selectedQuizFilterVideo !== 'all' || vQuestions.length > 0) {
        groups.push({
          key: `video_${vIdx}`,
          videoIndex: vIdx,
          badgeLabel: `Video ${vIdx + 1}`,
          title: v.title || `Video ${vIdx + 1}`,
          duration: v.duration || '',
          questions: vQuestions,
          isFinalQuiz: false,
        });
      }
    });

    if (selectedQuizFilterVideo === 'all' || selectedQuizFilterVideo === 'entire_playlist') {
      const generalQuestions = assessments.filter(
        (q) => q.videoIndex === null || q.videoIndex === undefined || q.videoIndex === 'all'
      );
      if (generalQuestions.length > 0) {
        groups.push({
          key: 'entire_playlist',
          videoIndex: null,
          badgeLabel: 'Final Playlist Quiz',
          title: 'Entire Playlist (Final Assessment)',
          duration: '',
          questions: generalQuestions,
          isFinalQuiz: true,
        });
      }
    }

    return groups;
  }, [assessments, videos, selectedQuizFilterVideo]);

  const displayedQuestionsCount = useMemo(() => {
    return groupedVideoSections.reduce((acc, g) => acc + g.questions.length, 0);
  }, [groupedVideoSections]);

  // ─────────────────────────────────────────────────────────────────────────────
  // SUBMISSION: SAVE PLAYLIST (CREATE OR UPDATE)
  // ─────────────────────────────────────────────────────────────────────────────
  const handleSubmit = async (e, saveAsDraft = false) => {
    if (e) e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle && videos.length === 0) {
      setError('Please add the Playlist Title and at least one video in Tab 1 before creating the playlist.');
      setActiveTab('details');
      return;
    }
    if (!trimmedTitle || trimmedTitle.length < 2) {
      setError('Please add the Playlist Title (at least 2 characters) in Tab 1 before creating the playlist.');
      setActiveTab('details');
      return;
    }
    if (videos.length === 0) {
      setError('Please add at least one video in Tab 1 before creating the playlist.');
      setActiveTab('details');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const client = api || adminApi(getToken());

      // If user did not upload a thumbnail, fallback to first video's YouTube thumbnail
      let autoThumb = thumbnailUrl?.trim();
      if (!autoThumb && videos.length > 0 && videos[0].thumbnailUrl) {
        autoThumb = videos[0].thumbnailUrl;
      }

      const payload = {
        courseId: 'general',
        courseSlug: 'general',
        title: trimmedTitle,
        category: category || 'entrepreneurship',
        level: level || 'Beginner',
        shortDescription: shortDescription.trim() || null,
        description: description.trim() || null,
        thumbnailUrl: autoThumb || null,
        displayOrder: playlist?.displayOrder ?? 0,
        isTrending: Boolean(isTrending),
        isFree: saveAsDraft ? false : Boolean(isFree),
        learn: learningOutcomes,
        requirements: requirements,
        resources: resources,
        assessments: assessments,
        assessmentSettings: {
          enabled: Boolean(quizEnabled),
          passingScore: Number(passingScore) || 70,
        },
        videos: videos.map((v, i) => {
          const videoQuestions = assessments.filter(
            (q) => q.videoIndex !== null && q.videoIndex !== undefined && Number(q.videoIndex) === i
          );
          return {
            title: v.title,
            youtubeUrl: v.youtubeUrl,
            youtubeVideoId: v.youtubeVideoId,
            thumbnailUrl: v.thumbnailUrl,
            duration: v.duration || null,
            description: v.description || null,
            displayOrder: i,
            chapters: Array.isArray(v.chapters) ? v.chapters : null,
            notesUrl: v.notesUrl || null,
            notesName: v.notesName || null,
            notesSize: v.notesSize || null,
            notesExt: v.notesExt || null,
            assessments: videoQuestions,
          };
        }),
      };

      let saved = null;
      if (playlist && playlist.id && !playlist.id.startsWith('pl-temp')) {
        // Update existing playlist
        if (typeof client?.updatePlaylist === 'function') {
          saved = await client.updatePlaylist(playlist.id, payload);
        } else {
          const res = await fetch(resolveApiPath(`/admin/playlists/${encodeURIComponent(playlist.id)}`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to update playlist');
          }
          saved = await res.json();
        }
      } else {
        // Create new playlist
        if (typeof client?.createPlaylist === 'function') {
          saved = await client.createPlaylist(payload);
        } else {
          const res = await fetch(resolveApiPath('/admin/playlists'), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
            body: JSON.stringify(payload),
          });
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || 'Failed to create playlist');
          }
          saved = await res.json();
        }
      }

      // Persist any draft tasks queued for playlist videos
      if (saved && (saved.id || playlist?.id)) {
        const targetPlaylistId = saved.id || playlist?.id;
        const savedVideos = Array.isArray(saved.videos) ? saved.videos : [];
        for (let i = 0; i < videos.length; i++) {
          const v = videos[i];
          const queued = v.draftTasks || [];
          if (queued.length > 0 && client?.createAdminTask) {
            const matchedSavedVid =
              savedVideos.find((sv, sIdx) => sIdx === i || sv.youtubeVideoId === v.youtubeVideoId) ||
              savedVideos[i];
            const targetVidId = matchedSavedVid?.id || v.id || v.youtubeVideoId || `${targetPlaylistId}-v${i}`;
            for (const dt of queued) {
              try {
                await client.createAdminTask({
                  title: dt.title,
                  description: dt.description || '',
                  instructions: dt.instructions || '',
                  dueDate: dt.dueDate ? new Date(dt.dueDate).toISOString() : null,
                  videoId: targetVidId,
                  videoTitle: dt.videoTitle || v.title || `Playlist Video ${i + 1}`,
                  playlistId: targetPlaylistId,
                  attachmentUrl: dt.attachmentUrl || null,
                  attachmentName: dt.attachmentName || null,
                  attachmentSize: dt.attachmentSize || null,
                  attachmentExt: dt.attachmentExt || null,
                  assignToType: 'all',
                });
              } catch (taskErr) {
                console.warn('Failed to auto-create task for playlist video:', taskErr);
              }
            }
          }
        }

        // Persist any general draft tasks queued for the playlist
        if (generalDraftTasks.length > 0 && client?.createAdminTask) {
          const fallbackVidId = savedVideos[0]?.id || savedVideos[0]?.youtubeVideoId || `${targetPlaylistId}-v0`;
          const fallbackVidTitle = savedVideos[0]?.title || trimmedTitle || 'Playlist General Task';
          for (const dt of generalDraftTasks) {
            try {
              await client.createAdminTask({
                title: dt.title,
                description: dt.description || '',
                instructions: dt.instructions || '',
                dueDate: dt.dueDate ? new Date(dt.dueDate).toISOString() : null,
                videoId: dt.videoId && dt.videoId !== 'playlist-general' ? dt.videoId : fallbackVidId,
                videoTitle: dt.videoTitle || fallbackVidTitle,
                playlistId: targetPlaylistId,
                attachmentUrl: dt.attachmentUrl || null,
                attachmentName: dt.attachmentName || null,
                attachmentSize: dt.attachmentSize || null,
                attachmentExt: dt.attachmentExt || null,
                assignToType: 'all',
              });
            } catch (taskErr) {
              console.warn('Failed to auto-create general task for playlist:', taskErr);
            }
          }
        }
      }

      if (onSuccess) {
        onSuccess(saved);
      }
      onClose();
    } catch (err) {
      console.error('Error saving playlist:', err);
      setError(err?.message || 'Failed to save playlist. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto"
      onClick={submitting ? undefined : onClose}
    >
      <div
        className="bg-white rounded-3xl w-full max-w-5xl xl:max-w-6xl p-6 sm:p-8 border border-slate-200 shadow-2xl relative my-auto transition-all duration-200 flex flex-col max-h-[94vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── MODAL HEADER ── */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 gap-2 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs shrink-0">
              <Icon name={playlist ? 'edit_note' : 'playlist_add'} className="text-xl" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-black text-[#0F172A] truncate">
                {playlist ? 'Edit Playlist' : 'Create New Playlist'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="w-9 h-9 rounded-full hover:bg-slate-100 flex items-center justify-center text-[#475569] hover:text-[#0F172A] transition cursor-pointer"
              title="Close modal"
            >
              <Icon name="close" className="text-xl" />
            </button>
          </div>
        </div>

        {/* ── THREE MAIN NAVIGATION TABS ── */}
        <div className="flex items-center gap-2 border-b border-slate-200 pt-3 pb-2 shrink-0 overflow-x-auto">
          {/* TAB 1 */}
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'details'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#475569] hover:bg-slate-100 hover:text-white'
              }`}
          >
            <Icon name="movie" className="text-sm" />
            <span>1. Playlist Details & Video Management</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'details' ? 'bg-white/20 text-[#0F172A]' : 'bg-slate-50 text-[#0F172A]'
                }`}
            >
              {videos.length} {videos.length === 1 ? 'Video' : 'Videos'}
            </span>
          </button>

          {/* TAB 2 */}
          <button
            type="button"
            onClick={() => setActiveTab('materials')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'materials'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#475569] hover:bg-slate-100 hover:text-white'
              }`}
          >
            <Icon name="folder_open" className="text-sm" />
            <span>2. Study Materials</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'materials' ? 'bg-white/20 text-[#0F172A]' : 'bg-slate-50 text-[#0F172A]'
                }`}
            >
              {resources.length}
            </span>
          </button>

          {/* TAB 3 */}
          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'quiz'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#475569] hover:bg-slate-100 hover:text-white'
              }`}
          >
            <Icon name="quiz" className="text-sm" />
            <span>3. Assessment & Quiz</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${activeTab === 'quiz' ? 'bg-white/20 text-[#0F172A]' : 'bg-slate-50 text-[#0F172A]'
                }`}
            >
              {assessments.length}
            </span>
          </button>

          {/* TAB 4: TASKS & ASSIGNMENTS */}
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${activeTab === 'tasks'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'text-[#475569] hover:bg-slate-100 hover:text-white'
              }`}
          >
            <Icon name="assignment" className="text-sm" />
            <span>4. Tasks & Assignments</span>
          </button>
        </div>

        {/* ── ERROR NOTICE ── */}
        {error && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2 shrink-0">
            <Icon name="error_outline" className="text-base shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ── FORM CONTENT ── */}
        <form onSubmit={(e) => handleSubmit(e, false)} className="mt-3 overflow-y-auto pr-1 py-1 flex-1 space-y-5">
          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 1: PLAYLIST DETAILS & VIDEO MANAGEMENT
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* ── PART A: PLAYLIST INFORMATION ── */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                    <Icon name="info" className="text-sm text-[#0F172A]" />
                    <span>Playlist Information</span>
                  </h4>
                </div>

                {/* Playlist Title */}
                <div>
                  <label className="block text-xs font-black text-[#0F172A] uppercase tracking-wider mb-1.5">
                    Playlist Title <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter playlist title (e.g. Rural Business Setup Mastery)..."
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (error) setError(null);
                    }}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-black text-[#0F172A] uppercase tracking-wider mb-1.5">
                    Category <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 cursor-pointer"
                  >
                    {PLAYLIST_CATEGORIES.map((cat) => (
                      <option key={cat.key} value={cat.key}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Short Description */}
                <div>
                  <label className="block text-xs font-black text-[#0F172A] uppercase tracking-wider mb-1.5">
                    Short Description
                  </label>
                  <input
                    type="text"
                    placeholder="Quick 1-2 sentence overview shown on playlist cards..."
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                  />
                </div>

                {/* Full Description */}
                <div>
                  <label className="block text-xs font-black text-[#0F172A] uppercase tracking-wider mb-1.5">
                    Full Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Comprehensive description of what this playlist teaches and includes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                  />
                </div>

                {/* Free Playlist & Trending Toggles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isFree}
                      onClick={() => setIsFree(!isFree)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${isFree ? 'bg-[#2563EB]' : 'bg-gray-300'
                        }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white shadow-md transition-transform transform ${isFree ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-[#0F172A] uppercase tracking-wider block">
                        100% Free Playlist
                      </span>
                      <span className="text-[11px] text-[#475569] block">Available at no cost to all learners</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isTrending}
                      onClick={() => setIsTrending(!isTrending)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${isTrending ? 'bg-[#2563EB]' : 'bg-gray-300'
                        }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white shadow-md transition-transform transform ${isTrending ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                    <div className="space-y-0.5">
                      <span className="text-xs font-black text-[#0F172A] uppercase tracking-wider block">
                        ⭐ Trending Playlist
                      </span>
                      <span className="text-[11px] text-[#475569] block">Feature in Trending section on Home</span>
                    </div>
                  </div>
                </div>

                {/* Playlist Thumbnail */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-black text-[#0F172A] uppercase tracking-wider">
                      Playlist Thumbnail
                    </label>
                    {uploadingThumb && (
                      <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1 animate-pulse">
                        <Icon name="sync" className="animate-spin text-xs" /> Uploading image...
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={thumbInputRef}
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleUploadThumbnailFile}
                    className="hidden"
                  />

                  {thumbnailUrl ? (
                    <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center gap-3.5">
                      <div className="relative w-28 aspect-video rounded-xl overflow-hidden border border-slate-200 bg-black/10 shrink-0">
                        <img
                          src={assetUrl(thumbnailUrl)}
                          alt="Thumbnail Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1 text-xs font-black text-[#0F172A]">
                          <Icon name="check_circle" className="text-sm text-emerald-600" />
                          <span>Custom Thumbnail Loaded</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => thumbInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-lg bg-slate-50 text-[#0F172A] font-bold text-xs hover:bg-brand-border transition cursor-pointer"
                          >
                            Change
                          </button>
                          <button
                            type="button"
                            onClick={() => setThumbnailUrl('')}
                            className="px-2.5 py-1 rounded-lg text-red-600 hover:bg-red-50 font-bold text-xs transition cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-[#0F172A] shrink-0">
                          <Icon name="image" className="text-xl" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#0F172A]">No Custom Thumbnail Uploaded</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => thumbInputRef.current?.click()}
                        className="px-3.5 py-2 bg-slate-50 hover:bg-emerald-500/25 text-[#0F172A] border border-slate-200 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0"
                      >
                        Upload Thumbnail
                      </button>
                    </div>
                  )}
                </div>

                {/* Learning Outcomes – Dynamic list with Add button */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-[#0F172A] uppercase tracking-wider">
                    Learning Outcomes
                    <span className="font-normal text-[#475569] normal-case ml-1">
                      (What will learners achieve after completing this playlist?)
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Master financial record keeping and daily cash flow..."
                      value={newOutcomeInput}
                      onChange={(e) => setNewOutcomeInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddOutcome();
                        }
                      }}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30"
                    />
                    <button
                      type="button"
                      onClick={handleAddOutcome}
                      className="px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Icon name="add" className="text-sm" />
                      <span>Add Outcome</span>
                    </button>
                  </div>

                  {learningOutcomes.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {learningOutcomes.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-[#0F172A] shadow-2xs font-medium"
                        >
                          <Icon name="check_circle" className="text-xs text-emerald-600 shrink-0" />
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveOutcome(idx)}
                            className="text-[#475569] hover:text-red-700 transition ml-1 cursor-pointer"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Requirements / Prerequisites – Dynamic list with Add button */}
                <div className="space-y-2">
                  <label className="block text-xs font-black text-[#0F172A] uppercase tracking-wider">
                    Requirements & Prerequisites
                    <span className="font-normal text-[#475569] normal-case ml-1">
                      (What should learners know beforehand?)
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Basic smartphone or computer operation knowledge..."
                      value={newReqInput}
                      onChange={(e) => setNewReqInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddRequirement();
                        }
                      }}
                      className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30"
                    />
                    <button
                      type="button"
                      onClick={handleAddRequirement}
                      className="px-3.5 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <Icon name="add" className="text-sm" />
                      <span>Add Requirement</span>
                    </button>
                  </div>

                  {requirements.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {requirements.map((item, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-[#0F172A] shadow-2xs font-medium"
                        >
                          <Icon name="arrow_forward" className="text-xs text-[#0F172A] shrink-0" />
                          <span>{item}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(idx)}
                            className="text-[#475569] hover:text-red-700 transition ml-1 cursor-pointer"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── PART B & C: MULTIPLE PLAYLIST VIDEO BUILDER & INDIVIDUAL VIDEO MANAGEMENT ── */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                      <Icon name="video_library" className="text-sm text-[#0F172A]" />
                      <span>Multiple Playlist Video Builder</span>
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black">
                      {videos.length} {videos.length === 1 ? 'Video' : 'Videos'} Added
                    </span>
                  </div>
                  <span className="text-[11px] text-[#475569] font-medium">Add, reorder & manage video chapters</span>
                </div>

                {/* Add Video Form Card */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                  <div className="text-xs font-black text-[#0F172A] flex items-center gap-1.5">
                    <Icon name="add_circle" className="text-base text-emerald-600" />
                    <span>Add New YouTube Video to Playlist</span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                        YouTube Video URL <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="url"
                        value={videoUrlInput}
                        onChange={(e) => setVideoUrlInput(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-blue-200 focus:ring-1 focus:ring-[#2563EB]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                        Video Title <span className="text-red-600">*</span>
                      </label>
                      <input
                        type="text"
                        value={videoTitleInput}
                        onChange={(e) => setVideoTitleInput(e.target.value)}
                        placeholder="e.g. Lesson 1: Introduction to Business Planning"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-blue-200 focus:ring-1 focus:ring-[#2563EB]/30"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                        Duration (e.g. 14:30)
                      </label>
                      <input
                        type="text"
                        value={videoDurationInput}
                        onChange={(e) => setVideoDurationInput(e.target.value)}
                        placeholder="e.g. 14:30"
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-blue-200 focus:ring-1 focus:ring-[#2563EB]/30"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                        Video Description / Notes
                      </label>
                      <input
                        type="text"
                        value={videoDescInput}
                        onChange={(e) => setVideoDescInput(e.target.value)}
                        placeholder="Brief summary of what is taught in this video..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-blue-200 focus:ring-1 focus:ring-[#2563EB]/30"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleAddVideo}
                      disabled={!videoUrlInput.trim()}
                      className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
                    >
                      <Icon name="add" className="text-sm text-[#2563EB]" />
                      <span>Add Video to Playlist</span>
                    </button>
                  </div>
                </div>

                {/* ── PART C: INDIVIDUAL VIDEO CARDS & CHAPTERS ── */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black uppercase tracking-wider text-[#0F172A]">
                      Playlist Videos ({videos.length})
                    </h5>
                  </div>

                  {videos.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white space-y-2">
                      <Icon name="smart_display" className="text-3xl text-emerald-400 mx-auto" />
                      <p className="text-xs font-extrabold text-[#0F172A]">No videos added to playlist yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {videos.map((vid, idx) => {
                        const isExpanded = expandedVideoIndex === idx;
                        const vidChapters = Array.isArray(vid.chapters) ? vid.chapters : [];

                        return (
                          <div
                            key={vid.id || idx}
                            className={`rounded-2xl border transition-all duration-200 overflow-hidden ${isExpanded
                                ? 'bg-white border-emerald-500 shadow-md ring-1 ring-emerald-500/20'
                                : 'bg-white border-slate-200 shadow-2xs hover:border-emerald-300'
                              }`}
                          >
                            {/* Card Header Summary */}
                            <div className="p-3.5 flex items-center justify-between gap-3">
                              {/* Reorder Controls & Order Badge */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    type="button"
                                    onClick={() => handleMoveVideo(idx, -1)}
                                    disabled={idx === 0}
                                    className="p-1 rounded hover:bg-slate-100 text-[#475569] hover:text-[#0F172A] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition"
                                    title="Move video up"
                                  >
                                    <Icon name="arrow_drop_up" className="text-base" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveVideo(idx, 1)}
                                    disabled={idx === videos.length - 1}
                                    className="p-1 rounded hover:bg-slate-100 text-[#475569] hover:text-[#0F172A] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed transition"
                                    title="Move video down"
                                  >
                                    <Icon name="arrow_drop_down" className="text-base" />
                                  </button>
                                </div>

                                <span className="w-7 h-7 rounded-xl bg-slate-50 text-[#0F172A] font-black flex items-center justify-center text-xs shrink-0 border border-slate-200">
                                  #{idx + 1}
                                </span>
                              </div>

                              {/* Thumbnail with duration */}
                              <div className="relative w-16 h-11 rounded-xl overflow-hidden bg-black/10 shrink-0 border border-slate-200">
                                {vid.thumbnailUrl ? (
                                  <img
                                    src={vid.thumbnailUrl}
                                    alt="thumb"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-100 text-[#475569]">
                                    <Icon name="movie" className="text-base" />
                                  </div>
                                )}
                                {vid.duration && (
                                  <span className="absolute bottom-0.5 right-0.5 px-1 py-0.2 rounded bg-black/80 text-[#0F172A] font-mono text-[9px] font-bold">
                                    {vid.duration}
                                  </span>
                                )}
                              </div>

                              {/* Title & Info */}
                              <div className="min-w-0 flex-1">
                                <div className="font-extrabold text-xs sm:text-sm text-[#0F172A] truncate flex items-center gap-2">
                                  <span>{vid.title}</span>
                                  {vidChapters.length > 0 && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black shrink-0">
                                      {vidChapters.length} {vidChapters.length === 1 ? 'Chapter' : 'Chapters'}
                                    </span>
                                  )}
                                  {vid.notesUrl && (
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black shrink-0 flex items-center gap-1" title={vid.notesName || 'Notes'}>
                                      <Icon name="description" className="text-xs" />
                                      <span>Notes</span>
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-[#475569] font-mono truncate mt-0.5">
                                  {vid.youtubeUrl}
                                </div>
                              </div>

                              {/* Card Action Buttons */}
                              <div className="flex items-center gap-1.5 shrink-0">
                                {/* Preview Video */}
                                <button
                                  type="button"
                                  onClick={() => setPreviewVideoItem(vid)}
                                  className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-500/25 text-[#0F172A] text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                  title="Preview video"
                                >
                                  <Icon name="play_arrow" className="text-sm text-emerald-700" />
                                  <span className="hidden sm:inline">Preview</span>
                                </button>

                                {/* Expand / Collapse */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleExpandVideo(idx)}
                                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${isExpanded
                                      ? 'bg-emerald-700 text-[#0F172A] shadow-2xs'
                                      : 'bg-slate-50 hover:bg-brand-border text-[#0F172A]'
                                    }`}
                                  title={isExpanded ? 'Collapse video details' : 'Edit video details & chapters'}
                                >
                                  <Icon name={isExpanded ? 'expand_less' : 'edit'} className="text-sm" />
                                  <span>{isExpanded ? 'Done' : 'Edit'}</span>
                                </button>

                                {/* Delete Video */}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveVideo(idx)}
                                  className="p-1.5 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                                  title="Delete video from playlist"
                                >
                                  <Icon name="delete" className="text-base" />
                                </button>
                              </div>
                            </div>

                            {/* Expanded Video Details & Chapters Form */}
                            {isExpanded && (
                              <div className="p-4 bg-[#fbfcf9] border-t border-slate-200 space-y-4 animate-in fade-in duration-150">
                                <div className="grid sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                                      Video Title *
                                    </label>
                                    <input
                                      type="text"
                                      value={vid.title}
                                      onChange={(e) => handleUpdateVideoField(idx, 'title', e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                                      YouTube URL *
                                    </label>
                                    <input
                                      type="url"
                                      value={vid.youtubeUrl}
                                      onChange={(e) => handleUpdateVideoField(idx, 'youtubeUrl', e.target.value)}
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30"
                                    />
                                  </div>
                                </div>

                                <div className="grid sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                                      Duration (HH:MM:SS or MM:SS)
                                    </label>
                                    <input
                                      type="text"
                                      value={vid.duration || ''}
                                      onChange={(e) => handleUpdateVideoField(idx, 'duration', e.target.value)}
                                      placeholder="e.g. 12:45"
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                                      Video Summary
                                    </label>
                                    <input
                                      type="text"
                                      value={vid.description || ''}
                                      onChange={(e) => handleUpdateVideoField(idx, 'description', e.target.value)}
                                      placeholder="Brief summary of this video lesson..."
                                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30"
                                    />
                                  </div>
                                </div>

                                {/* ── PART D: INDIVIDUAL VIDEO CHAPTERS ── */}
                                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                                    <div className="flex items-center gap-1.5">
                                      <Icon name="schedule" className="text-sm text-emerald-700" />
                                      <span className="text-xs font-black uppercase tracking-wider text-[#0F172A]">
                                        Video Chapters & Timestamps
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-[#475569] font-medium">
                                      Chapters strictly belong to this video
                                    </span>
                                  </div>

                                  {/* Add chapter inputs: Title, Structured MM:SS Timestamp, Add Button */}
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                                      <div className="sm:col-span-6">
                                        <input
                                          type="text"
                                          placeholder="Chapter Title (e.g. Setting Up Workshop)"
                                          value={newChapterTitle}
                                          onChange={(e) => setNewChapterTitle(e.target.value)}
                                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30 font-semibold"
                                        />
                                      </div>
                                      <div className="sm:col-span-4">
                                        <div className="flex items-center justify-center gap-1 bg-white border border-slate-200 rounded-xl px-2 py-1 text-xs text-[#0F172A] focus-within:ring-1 focus-within:ring-brand-forest/20">
                                          <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            placeholder="MM"
                                            value={newChapterMin}
                                            onPaste={handleChapterTimePaste}
                                            onChange={(e) => setNewChapterMin(e.target.value.replace(/[^\d]/g, ''))}
                                            className="w-10 text-center font-mono font-bold text-xs focus:outline-none"
                                            title="Minutes (Numeric only)"
                                          />
                                          <span className="font-mono font-bold text-[#475569] select-none">:</span>
                                          <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            placeholder="SS"
                                            value={newChapterSec}
                                            onPaste={handleChapterTimePaste}
                                            onChange={(e) => {
                                              const digits = e.target.value.replace(/[^\d]/g, '');
                                              const num = parseInt(digits, 10);
                                              if (!digits) setNewChapterSec('');
                                              else if (num > 59) setNewChapterSec('59');
                                              else setNewChapterSec(digits.slice(0, 2));
                                            }}
                                            className="w-10 text-center font-mono font-bold text-xs focus:outline-none"
                                            title="Seconds (00-59 Numeric only)"
                                          />
                                          <span className="text-[10px] text-[#475569] font-mono select-none px-1 border-l border-slate-200">
                                            MM:SS
                                          </span>
                                        </div>
                                      </div>
                                      <div className="sm:col-span-2">
                                        <button
                                          type="button"
                                          onClick={() => handleAddChapterToVideo(idx)}
                                          className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-[#0F172A] rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                                        >
                                          <Icon name="add" className="text-xs" />
                                          <span>Add</span>
                                        </button>
                                      </div>
                                    </div>

                                    {/* Optional Note for New Chapter */}
                                    <div className="flex items-center gap-2 text-xs">
                                      <span className="text-[11px] text-[#475569] font-medium">Chapter Note (Optional):</span>
                                      {newChapterNote ? (
                                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                                          <Icon name="description" className="text-xs text-emerald-700" />
                                          <span className="truncate max-w-[180px]">{newChapterNote.name}</span>
                                          {newChapterNote.ext && (
                                            <span className="text-[9px] uppercase font-mono px-1 py-0.2 rounded bg-emerald-200 text-emerald-100 font-bold">
                                              {newChapterNote.ext}
                                            </span>
                                          )}
                                          <button
                                            type="button"
                                            onClick={() => setNewChapterNote(null)}
                                            className="text-emerald-700 hover:text-red-700 font-bold ml-1 cursor-pointer"
                                            title="Remove attached note"
                                          >
                                            ✕
                                          </button>
                                        </div>
                                      ) : (
                                        <label className="cursor-pointer px-2.5 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-500/25 text-emerald-700 border border-emerald-200 text-[11px] font-bold transition flex items-center gap-1">
                                          {uploadingNewChapterNote ? (
                                            <>
                                              <Icon name="sync" className="animate-spin text-xs text-emerald-700" />
                                              <span>Uploading Note...</span>
                                            </>
                                          ) : (
                                            <>
                                              <Icon name="attach_file" className="text-xs text-emerald-700" />
                                              <span>Attach Note (PDF/DOCX)</span>
                                            </>
                                          )}
                                          <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                            className="hidden"
                                            disabled={uploadingNewChapterNote}
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) handleUploadNewChapterNote(file);
                                              e.target.value = '';
                                            }}
                                          />
                                        </label>
                                      )}
                                    </div>
                                  </div>

                                  {/* Chapters list for this video */}
                                  {vidChapters.length > 0 ? (
                                    <div className="space-y-1.5 pt-1">
                                      {vidChapters.map((ch) => {
                                        const isEditingThis = editingChapterId === ch.id;
                                        if (isEditingThis) {
                                          return (
                                            <div
                                              key={ch.id}
                                              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs shadow-2xs"
                                            >
                                              <input
                                                type="text"
                                                value={editChapterTitle}
                                                onChange={(e) => setEditChapterTitle(e.target.value)}
                                                className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#0F172A] focus:outline-none"
                                                placeholder="Chapter Title"
                                              />
                                              <div className="flex items-center justify-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-[#0F172A] shrink-0">
                                                <input
                                                  type="text"
                                                  inputMode="numeric"
                                                  pattern="[0-9]*"
                                                  placeholder="MM"
                                                  value={editChapterMin}
                                                  onChange={(e) => setEditChapterMin(e.target.value.replace(/[^\d]/g, ''))}
                                                  className="w-8 text-center font-mono font-bold text-xs focus:outline-none"
                                                  title="Minutes"
                                                />
                                                <span className="font-mono font-bold text-[#475569] select-none">:</span>
                                                <input
                                                  type="text"
                                                  inputMode="numeric"
                                                  pattern="[0-9]*"
                                                  placeholder="SS"
                                                  value={editChapterSec}
                                                  onChange={(e) => {
                                                    const digits = e.target.value.replace(/[^\d]/g, '');
                                                    const num = parseInt(digits, 10);
                                                    if (!digits) setEditChapterSec('');
                                                    else if (num > 59) setEditChapterSec('59');
                                                    else setEditChapterSec(digits.slice(0, 2));
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
                                                  onClick={() => handleSaveEditChapter(idx, ch.id)}
                                                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-[#0F172A] rounded-lg text-xs font-bold transition cursor-pointer"
                                                  title="Save chapter update"
                                                >
                                                  ✓ Save
                                                </button>
                                                <button
                                                  type="button"
                                                  onClick={() => setEditingChapterId(null)}
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
                                            className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs gap-2"
                                          >
                                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                              <span className="font-mono px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold text-[11px] shrink-0">
                                                {ch.timestamp}
                                              </span>
                                              <span
                                                onClick={() => handleStartEditChapter(ch)}
                                                className="font-bold text-[#0F172A] truncate cursor-pointer hover:underline hover:text-emerald-800"
                                                title="Click to edit chapter"
                                              >
                                                {ch.title}
                                              </span>
                                              <button
                                                type="button"
                                                onClick={() => handleStartEditChapter(ch)}
                                                className="text-[#475569] hover:text-[#0F172A] transition p-0.5 cursor-pointer shrink-0"
                                                title="Edit chapter title & timestamp"
                                              >
                                                <Icon name="edit" className="text-xs" />
                                              </button>
                                            </div>

                                            {/* Chapter Note badge / Add Note button */}
                                            <div className="flex items-center gap-2 shrink-0">
                                              {ch.notesUrl ? (
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                                                  <Icon name="description" className="text-xs text-emerald-600" />
                                                  <a
                                                    href={assetUrl(ch.notesUrl)}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="hover:underline truncate max-w-[120px]"
                                                    title={ch.notesName || 'View attached note'}
                                                  >
                                                    {ch.notesName || 'Study Note'}
                                                  </a>
                                                  {ch.notesExt && (
                                                    <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-emerald-200 text-emerald-700 font-mono">
                                                      {ch.notesExt}
                                                    </span>
                                                  )}
                                                  <button
                                                    type="button"
                                                    onClick={() => handleRemoveChapterNote(idx, ch.id)}
                                                    className="text-emerald-700 hover:text-red-700 font-bold ml-1 cursor-pointer"
                                                    title="Remove note from chapter"
                                                  >
                                                    ✕
                                                  </button>
                                                </div>
                                              ) : (
                                                <label className="cursor-pointer px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-emerald-500/25 border border-dashed border-slate-200 hover:border-emerald-400 text-[#475569] hover:text-emerald-800 text-[11px] font-semibold transition flex items-center gap-1">
                                                  {uploadingChapterNoteKey === `${idx}_${ch.id}` ? (
                                                    <>
                                                      <Icon name="sync" className="animate-spin text-xs text-emerald-600" />
                                                      <span>Uploading...</span>
                                                    </>
                                                  ) : (
                                                    <>
                                                      <Icon name="attach_file" className="text-xs" />
                                                      <span>Attach Note (PDF/DOCX)</span>
                                                    </>
                                                  )}
                                                  <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                                    className="hidden"
                                                    disabled={uploadingChapterNoteKey === `${idx}_${ch.id}`}
                                                    onChange={(e) => {
                                                      const file = e.target.files?.[0];
                                                      if (file) handleUploadChapterNote(idx, ch.id, file);
                                                      e.target.value = '';
                                                    }}
                                                  />
                                                </label>
                                              )}

                                              <button
                                                type="button"
                                                onClick={() => handleRemoveChapterFromVideo(idx, ch.id)}
                                                className="text-[#475569] hover:text-red-700 transition p-1 cursor-pointer shrink-0 ml-1"
                                                title="Delete chapter"
                                              >
                                                ✕
                                              </button>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-[11px] text-[#475569] font-medium pt-1">
                                      No chapters added yet for this video. Add timestamps above to create clickable video sections.
                                    </div>
                                  )}
                                </div>

                                {/* ── PART E: VIDEO STUDY NOTES / MATERIAL ── */}
                                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-3 shadow-2xs">
                                  <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                                    <div className="flex items-center gap-1.5">
                                      <Icon name="description" className="text-sm text-emerald-700" />
                                      <span className="text-xs font-black uppercase tracking-wider text-[#0F172A]">
                                        Study Notes / Material (PDF, DOC, DOCX)
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-[#475569] font-medium">
                                      Downloadable notes attached directly to this video
                                    </span>
                                  </div>

                                  {vid.notesUrl ? (
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 gap-3">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                          <Icon name="description" className="text-base" />
                                        </div>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-[#0F172A] truncate max-w-xs sm:max-w-md">
                                              {vid.notesName || 'Attached Study Note'}
                                            </span>
                                            {vid.notesExt && (
                                              <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-700 font-bold shrink-0">
                                                {vid.notesExt}
                                              </span>
                                            )}
                                          </div>
                                          {vid.notesSize && (
                                            <span className="text-[10px] text-[#475569] font-medium">
                                              {vid.notesSize}
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                                        <a
                                          href={assetUrl(vid.notesUrl)}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1"
                                        >
                                          <Icon name="visibility" className="text-xs" />
                                          <span>Preview</span>
                                        </a>

                                        <label className="cursor-pointer px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1">
                                          {uploadingVideoNoteIndex === idx ? (
                                            <Icon name="sync" className="animate-spin text-xs" />
                                          ) : (
                                            <Icon name="refresh" className="text-xs" />
                                          )}
                                          <span>Replace</span>
                                          <input
                                            type="file"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                            className="hidden"
                                            disabled={uploadingVideoNoteIndex === idx}
                                            onChange={(e) => {
                                              const file = e.target.files?.[0];
                                              if (file) handleUploadVideoNote(idx, file);
                                              e.target.value = '';
                                            }}
                                          />
                                        </label>

                                        <button
                                          type="button"
                                          onClick={() => handleRemoveVideoNote(idx)}
                                          className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-50 text-red-600 text-xs font-bold transition cursor-pointer"
                                          title="Remove study notes from this video"
                                        >
                                          Remove
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col sm:flex-row items-center justify-between p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 gap-3">
                                      <div className="flex items-center gap-2 text-[#475569] text-xs">
                                        <Icon name="upload_file" className="text-base text-[#475569]" />
                                        <span>No study note attached to this video yet. Upload a PDF, Word doc, or slides.</span>
                                      </div>

                                      <label className="cursor-pointer px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-[#0F172A] rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0">
                                        {uploadingVideoNoteIndex === idx ? (
                                          <>
                                            <Icon name="sync" className="animate-spin text-xs" />
                                            <span>Uploading...</span>
                                          </>
                                        ) : (
                                          <>
                                            <Icon name="upload_file" className="text-xs" />
                                            <span>Upload Video Note (PDF/DOCX)</span>
                                          </>
                                        )}
                                        <input
                                          type="file"
                                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                          className="hidden"
                                          disabled={uploadingVideoNoteIndex === idx}
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleUploadVideoNote(idx, file);
                                            e.target.value = '';
                                          }}
                                        />
                                      </label>
                                    </div>
                                  )}
                                </div>

                                {/* ── PART F: TASKS & QUESTION PAPERS FOR THIS VIDEO ── */}
                                <div className="pt-2">
                                  <InlineVideoTasksSection
                                    mode={
                                      playlist?.id &&
                                      !playlist.id.startsWith('pl-temp') &&
                                      (vid.id || vid.youtubeVideoId)
                                        ? 'live'
                                        : 'draft'
                                    }
                                    videoId={vid.id || vid.youtubeVideoId}
                                    videoTitle={vid.title || `Playlist Video ${idx + 1}`}
                                    playlistId={playlist?.id}
                                    draftTasks={vid.draftTasks || []}
                                    onChangeDraftTasks={(updatedDrafts) => {
                                      setVideos((prev) => {
                                        const copy = [...prev];
                                        copy[idx] = { ...copy[idx], draftTasks: updatedDrafts };
                                        return copy;
                                      });
                                    }}
                                    api={api || adminApi(getToken())}
                                  />
                                </div>

                                <div className="flex justify-end pt-1">
                                  <button
                                    type="button"
                                    onClick={() => setExpandedVideoIndex(null)}
                                    className="px-4 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition cursor-pointer"
                                  >
                                    ✓ Done Editing Video
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 2: STUDY MATERIALS
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'materials' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-4 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                      <Icon name="upload_file" className="text-sm text-[#0F172A]" />
                      <span>Upload Study Materials & Notes</span>
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black">
                      {resources.length} {resources.length === 1 ? 'Item' : 'Items'}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#475569] font-medium">PDF, DOC, DOCX, XLS, PPT</span>
                </div>

                {materialError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                    <Icon name="error_outline" className="text-base shrink-0" />
                    <span>{materialError}</span>
                  </div>
                )}

                {/* Upload Form Card */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3.5 shadow-2xs">
                  <div>
                    <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                      Material Title <span className="text-brand-forest/50 font-normal">(optional, auto-filled from file)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chapter 1 Summary & Financial Worksheets"
                      value={materialTitle}
                      onChange={(e) => {
                        setMaterialTitle(e.target.value);
                        if (materialError) setMaterialError('');
                      }}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                      Material Description (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Brief description of what this material contains..."
                      value={materialDesc}
                      onChange={(e) => setMaterialDesc(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30"
                    />
                  </div>

                  <input
                    type="file"
                    ref={materialFileInputRef}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    onChange={handleMaterialFileChange}
                    className="hidden"
                  />

                  <div className="flex items-center justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleUploadStudyMaterial}
                      disabled={uploadingMaterial}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-[#0F172A] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs transition"
                    >
                      {uploadingMaterial ? (
                        <>
                          <Icon name="sync" className="animate-spin text-sm" />
                          <span>Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Icon name="upload" className="text-sm" />
                          <span>Upload & Add Material</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Uploaded Materials List */}
                <div className="space-y-2 pt-2">
                  <h5 className="text-xs font-black uppercase tracking-wider text-[#0F172A]">
                    Playlist Study Materials ({resources.length})
                  </h5>

                  {resources.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white space-y-2">
                      <Icon name="description" className="text-3xl text-emerald-400 mx-auto" />
                      <p className="text-xs font-extrabold text-[#0F172A]">No study materials uploaded yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {resources.map((res) => (
                        <div
                          key={res.id}
                          className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 text-xs shadow-2xs hover:border-emerald-300 transition"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0 border border-emerald-200">
                              {res.ext || 'DOC'}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-extrabold text-[#0F172A] truncate">{res.title}</div>
                              <div className="text-[11px] text-[#475569] flex items-center gap-2 mt-0.5">
                                <span className="truncate">{res.name}</span>
                                <span>·</span>
                                <span>{res.size || 'File'}</span>
                                <span>·</span>
                                <span className="px-2 py-0.2 rounded-full bg-slate-50 text-[#0F172A] font-bold text-[10px]">
                                  {res.videoTitle || 'Entire Playlist'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {res.file && (
                              <a
                                href={assetUrl(res.file)}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-500/25 text-[#0F172A] font-bold text-xs flex items-center gap-1 transition"
                              >
                                <Icon name="visibility" className="text-sm" />
                                <span>View</span>
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveMaterial(res.id)}
                              className="text-red-600 hover:text-red-700 p-1.5 rounded-xl hover:bg-red-50 transition cursor-pointer"
                              title="Delete material"
                            >
                              <Icon name="delete" className="text-base" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 3: ASSESSMENT & QUIZ
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'quiz' && (
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-4 shadow-2xs">
                {/* Header & Settings Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={quizEnabled}
                      onClick={() => setQuizEnabled(!quizEnabled)}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${quizEnabled ? 'bg-[#2563EB]' : 'bg-gray-300'
                        }`}
                    >
                      <span
                        className={`block w-4 h-4 rounded-full bg-white shadow-md transition-transform transform ${quizEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                      />
                    </button>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                        <Icon name="quiz" className="text-sm text-[#0F172A]" />
                        <span>Interactive Assessments & Quizzes</span>
                      </h4>
                      <span className="text-[11px] text-[#475569] font-medium">
                        MCQs & True/False with video timestamp triggers
                      </span>
                    </div>
                  </div>
                </div>

                {quizError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                    <Icon name="error_outline" className="text-base shrink-0" />
                    <span>{quizError}</span>
                  </div>
                )}

                {/* ── QUICK VIDEO SWITCHER STRIP ── */}
                <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-[#0F172A]">
                      <Icon name="tune" className="text-sm text-emerald-700" />
                      <span>Filter & Target Video:</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-[#475569] whitespace-nowrap">
                        Target Video:
                      </label>
                      <select
                        value={quizTargetVideo}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuizTargetVideo(val);
                          setSelectedQuizFilterVideo(val === 'all' ? 'entire_playlist' : val);
                        }}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-[#0F172A] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30 shadow-2xs"
                      >
                        <option value="all">Entire Playlist (Final Quiz)</option>
                        {videos.map((v, i) => (
                          <option key={v.id || i} value={String(i)}>
                            Video #{i + 1}: {v.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin pt-1 border-t border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedQuizFilterVideo('all');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${selectedQuizFilterVideo === 'all'
                          ? 'bg-[#2563EB] text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-white hover:bg-slate-100'
                        }`}
                    >
                      <span>All Questions</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${selectedQuizFilterVideo === 'all' ? 'bg-white/20 text-[#0F172A]' : 'bg-slate-50 text-[#0F172A]'
                        }`}>
                        {assessments.length} Qs
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedQuizFilterVideo('entire_playlist');
                        setQuizTargetVideo('all');
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${selectedQuizFilterVideo === 'entire_playlist'
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-amber-700 hover:bg-amber-500/25'
                        }`}
                    >
                      <span>Entire Playlist (Final Quiz)</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 font-bold">
                        {assessments.filter((q) => q.videoIndex === null || q.videoIndex === undefined || q.videoIndex === 'all').length} Qs
                      </span>
                    </button>

                    {videos.map((v, idx) => {
                      const vCount = assessments.filter((q) => q.videoIndex !== null && q.videoIndex !== undefined && Number(q.videoIndex) === idx).length;
                      const isSelected = selectedQuizFilterVideo === String(idx);
                      return (
                        <button
                          key={v.id || idx}
                          type="button"
                          onClick={() => {
                            setSelectedQuizFilterVideo(String(idx));
                            setQuizTargetVideo(String(idx));
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${isSelected
                              ? 'bg-emerald-700 text-[#0F172A] shadow-2xs'
                              : 'bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-100'
                            }`}
                        >
                          <span className="truncate max-w-[140px]">
                            Video {idx + 1}: {v.title || `Video ${idx + 1}`}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-white/20 text-[#0F172A]' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                            {vCount} Qs
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add / Edit Question Card */}
                <div id="quiz-question-card" className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black text-[#0F172A] flex items-center gap-1.5">
                      <Icon name={editingQuestionId ? 'edit' : 'add_circle'} className="text-base text-emerald-600" />
                      <span>{editingQuestionId ? 'Edit Quiz Question' : 'Add New Quiz Question'}</span>
                    </div>
                    {editingQuestionId && (
                      <button
                        type="button"
                        onClick={handleCancelEditQuestion}
                        className="text-xs font-bold text-[#475569] hover:text-[#0F172A] underline cursor-pointer"
                      >
                        Cancel Editing
                      </button>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                        Question Type
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setQuizType('mcq');
                            setQuizCorrectAnswer(0);
                          }}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${quizType === 'mcq'
                              ? 'bg-[#2563EB] text-white border-blue-200 shadow-2xs'
                              : 'bg-slate-50 text-white border-slate-200'
                            }`}
                        >
                          Multiple Choice (MCQ)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setQuizType('true_false');
                            setQuizCorrectAnswer('True');
                          }}
                          className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${quizType === 'true_false'
                              ? 'bg-[#2563EB] text-white border-blue-200 shadow-2xs'
                              : 'bg-slate-50 text-white border-slate-200'
                            }`}
                        >
                          True / False
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                        Target Video Lesson
                      </label>
                      <select
                        value={quizTargetVideo}
                        onChange={(e) => {
                          const val = e.target.value;
                          setQuizTargetVideo(val);
                          if (val !== 'all') {
                            setSelectedQuizFilterVideo(val);
                          } else {
                            setSelectedQuizFilterVideo('entire_playlist');
                          }
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-[#0F172A] cursor-pointer focus:outline-none focus:border-blue-200 focus:ring-1 focus:ring-[#2563EB]/30"
                      >
                        <option value="all">Entire Playlist (Final Quiz)</option>
                        {videos.map((v, i) => (
                          <option key={v.id || i} value={String(i)}>
                            Video {i + 1}: {v.title || `Video ${i + 1}`} {v.duration ? `(${v.duration})` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                      Question Prompt <span className="text-red-600">*</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Which document is most important when applying for a small business loan?"
                      value={quizQuestion}
                      onChange={(e) => setQuizQuestion(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30"
                    />
                  </div>

                  {/* Options: MCQ vs True/False */}
                  {quizType === 'mcq' ? (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-[#0F172A]">
                        Answer Options
                      </label>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {quizOptions.map((opt, oIdx) => (
                          <div
                            key={oIdx}
                            className={`p-2 rounded-xl border flex items-center gap-2 transition ${quizCorrectAnswer === oIdx
                                ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-400'
                                : 'bg-slate-50 border-slate-200'
                              }`}
                          >
                            <input
                              type="radio"
                              name="mcq-correct-answer"
                              checked={quizCorrectAnswer === oIdx}
                              onChange={() => setQuizCorrectAnswer(oIdx)}
                              className="accent-emerald-700 cursor-pointer"
                            />
                            <span className="font-black text-xs text-[#0F172A]">{String.fromCharCode(65 + oIdx)}.</span>
                            <input
                              type="text"
                              placeholder={`Option ${String.fromCharCode(65 + oIdx)} text`}
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...quizOptions];
                                newOpts[oIdx] = e.target.value;
                                setQuizOptions(newOpts);
                              }}
                              className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                        Correct Answer <span className="text-red-600">*</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <label
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black cursor-pointer transition ${quizCorrectAnswer === 'True'
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs'
                              : 'bg-white border-slate-200 text-[#0F172A] hover:bg-slate-100'
                            }`}
                        >
                          <input
                            type="radio"
                            name="tf-correct-answer"
                            checked={quizCorrectAnswer === 'True'}
                            onChange={() => setQuizCorrectAnswer('True')}
                            className="accent-emerald-700"
                          />
                          <span>True</span>
                        </label>
                        <label
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-black cursor-pointer transition ${quizCorrectAnswer === 'False'
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-2xs'
                              : 'bg-white border-slate-200 text-[#0F172A] hover:bg-slate-100'
                            }`}
                        >
                          <input
                            type="radio"
                            name="tf-correct-answer"
                            checked={quizCorrectAnswer === 'False'}
                            onChange={() => setQuizCorrectAnswer('False')}
                            className="accent-emerald-700"
                          />
                          <span>False</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Explanation & Trigger Point */}
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                        Answer Explanation
                      </label>
                      <input
                        type="text"
                        placeholder="Explanation shown to students after answering..."
                        value={quizExplanation}
                        onChange={(e) => setQuizExplanation(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0F172A] mb-1">
                        Quiz Popup Trigger Point
                      </label>
                      <div className="flex items-center gap-2">
                        <select
                          value={quizTriggerType}
                          onChange={(e) => setQuizTriggerType(e.target.value)}
                          className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-[#0F172A] cursor-pointer"
                        >
                          <option value="end">At Video End</option>
                          <option value="timestamp">Mid-Video (Custom Timestamp)</option>
                        </select>

                        {quizTriggerType === 'timestamp' && (
                          <div className="flex items-center gap-1.5 text-xs">
                            <div className="flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                placeholder="Min"
                                value={quizTriggerMinutes}
                                onChange={(e) => setQuizTriggerMinutes(e.target.value)}
                                className="w-14 text-center bg-white border border-slate-200 rounded-lg py-1 text-xs font-semibold"
                                title="Minutes"
                              />
                              <span className="font-bold">:</span>
                              <input
                                type="number"
                                min="0"
                                max="59"
                                placeholder="Sec"
                                value={quizTriggerSeconds}
                                onChange={(e) => setQuizTriggerSeconds(e.target.value)}
                                className="w-14 text-center bg-white border border-slate-200 rounded-lg py-1 text-xs font-semibold"
                                title="Seconds"
                              />
                            </div>
                            {currentTargetVideoDurationSec > 0 && (
                              <span className={`text-[10px] font-bold ${(Number(quizTriggerMinutes) || 0) * 60 + (Number(quizTriggerSeconds) || 0) > currentTargetVideoDurationSec
                                  ? 'text-red-600'
                                  : 'text-[#475569]'
                                }`}>
                                {(Number(quizTriggerMinutes) || 0) * 60 + (Number(quizTriggerSeconds) || 0) > currentTargetVideoDurationSec
                                  ? `⚠️ Exceeds duration (${currentTargetVideoObj?.duration})`
                                  : `(Max: ${currentTargetVideoObj?.duration})`}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={handleSaveQuizQuestion}
                      disabled={!quizQuestion.trim()}
                      className="px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs transition"
                    >
                      <Icon name="check" className="text-sm text-[#2563EB]" />
                      <span>{editingQuestionId ? 'Update Question' : 'Add Question to Quiz'}</span>
                    </button>
                  </div>
                </div>

                {/* ── GROUPED QUIZ QUESTIONS LIST BELOW FORM ── */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-black uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
                      <Icon name="assignment" className="text-sm text-emerald-700" />
                      <span>Quiz Questions ({displayedQuestionsCount})</span>
                    </h5>
                    {selectedQuizFilterVideo !== 'all' && (
                      <button
                        type="button"
                        onClick={() => setSelectedQuizFilterVideo('all')}
                        className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        View All Videos' Questions
                      </button>
                    )}
                  </div>

                  {assessments.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-white space-y-2">
                      <Icon name="assignment" className="text-3xl text-emerald-400 mx-auto" />
                      <p className="text-xs font-extrabold text-[#0F172A]">No quiz questions created yet</p>
                    </div>
                  ) : groupedVideoSections.length === 0 ? (
                    <div className="p-6 text-center rounded-2xl border border-slate-200 bg-white space-y-1">
                      <p className="text-xs font-extrabold text-[#0F172A]">No questions for this selected video yet</p>
                      <p className="text-[11px] text-[#475569]">Use the form above to add an assessment for this video.</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {groupedVideoSections.map((group) => (
                        <div key={group.key} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                          {/* Group Header */}
                          <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${group.isFinalQuiz ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                {group.badgeLabel}
                              </span>
                              <h6 className="text-xs font-extrabold text-[#0F172A] truncate">
                                {group.title}
                              </h6>
                              {group.duration && (
                                <span className="text-[10px] text-[#475569] font-medium shrink-0">
                                  ({group.duration})
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] font-extrabold text-[#475569] shrink-0">
                              {group.questions.length} {group.questions.length === 1 ? 'Question' : 'Questions'}
                            </span>
                          </div>

                          {/* Questions inside this video group */}
                          {group.questions.length === 0 ? (
                            <div className="p-4 text-center text-xs text-[#475569] font-medium">
                              No questions added for this video yet. Fill out the form above to add one.
                            </div>
                          ) : (
                            <div className="p-3 space-y-3 divide-y divide-slate-200">
                              {group.questions.map((q, idxInGroup) => (
                                <div key={q.id || idxInGroup} className={`${idxInGroup > 0 ? 'pt-3' : ''} space-y-2`}>
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                      <span className="w-6 h-6 rounded-lg bg-slate-50 text-[#0F172A] font-black flex items-center justify-center text-xs shrink-0 border border-slate-200 mt-0.5">
                                        Q{idxInGroup + 1}
                                      </span>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-purple-900 border border-indigo-200 text-[10px] font-black">
                                            {q.videoIndex !== null && q.videoIndex !== undefined ? `Video ${Number(q.videoIndex) + 1}` : 'Entire Playlist'}
                                          </span>
                                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase">
                                            {q.type === 'mcq' ? 'MCQ' : 'True/False'}
                                          </span>
                                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold flex items-center gap-1 ${q.triggerType === 'timestamp'
                                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                                            }`}>
                                            <Icon name={q.triggerType === 'timestamp' ? 'timer' : 'flag'} className="text-[10px]" />
                                            <span>
                                              {q.triggerType === 'timestamp'
                                                ? `At ${String(q.triggerMinutes || 0).padStart(2, '0')}:${String(q.triggerSeconds || 0).padStart(2, '0')}`
                                                : 'At Video End'}
                                            </span>
                                          </span>
                                        </div>
                                        <p className="text-xs font-extrabold text-[#0F172A] leading-relaxed">
                                          {q.question}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => handleEditQuizQuestion(q)}
                                        className="p-1.5 rounded-lg text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition cursor-pointer"
                                        title="Edit question"
                                      >
                                        <Icon name="edit" className="text-sm" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveQuizQuestion(q.id)}
                                        className="p-1.5 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                                        title="Delete question"
                                      >
                                        <Icon name="delete" className="text-sm" />
                                      </button>
                                    </div>
                                  </div>

                                  {/* Answer Options with green radio / highlight for correct answer */}
                                  {q.type === 'mcq' && Array.isArray(q.options) && (
                                    <div className="grid sm:grid-cols-2 gap-1.5 pl-8">
                                      {q.options.map((opt, oIdx) => {
                                        const isCorrect = Number(q.answer) === oIdx;
                                        return (
                                          <div
                                            key={oIdx}
                                            className={`px-2.5 py-1.5 rounded-xl border text-[11px] flex items-center gap-2 transition ${isCorrect
                                                ? 'bg-emerald-50 border-emerald-400 text-emerald-100 font-bold shadow-2xs'
                                                : 'bg-white border-slate-200 text-[#475569]'
                                              }`}
                                          >
                                            <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-black ${isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-[#475569]'
                                              }`}>
                                              {isCorrect ? '✓' : String.fromCharCode(65 + oIdx)}
                                            </span>
                                            <span className="truncate">{opt}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {q.type === 'true_false' && (
                                    <div className="flex items-center gap-2 pl-8">
                                      {['True', 'False'].map((tfVal) => {
                                        const isCorrect = String(q.answer) === tfVal;
                                        return (
                                          <div
                                            key={tfVal}
                                            className={`px-3 py-1 rounded-xl border text-[11px] flex items-center gap-1.5 ${isCorrect
                                                ? 'bg-emerald-50 border-emerald-400 text-emerald-100 font-bold shadow-2xs'
                                                : 'bg-white border-slate-200 text-[#475569]'
                                              }`}
                                          >
                                            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-black ${isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-[#475569]'
                                              }`}>
                                              {isCorrect ? '✓' : '•'}
                                            </span>
                                            <span>{tfVal}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}

                                  {/* Explanation note if present */}
                                  {q.explanation && (
                                    <div className="pl-8 pt-1 text-[11px] text-emerald-700 bg-emerald-50 rounded-xl p-2 border border-emerald-100/80 flex items-start gap-1.5">
                                      <Icon name="lightbulb" className="text-xs text-emerald-600 mt-0.5 shrink-0" />
                                      <span><strong>Explanation:</strong> {q.explanation}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════════
              SECTION 4: TASKS & ASSIGNMENTS
          ═══════════════════════════════════════════════════════════════════ */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
                  <label className="text-xs font-extrabold text-[#0F172A] flex items-center gap-1.5">
                    <Icon name="assignment" className="text-sm text-emerald-700" />
                    <span>Target Video for Tasks & Question Materials:</span>
                  </label>
                  {videos.length === 0 ? (
                    <div className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 self-start sm:self-auto">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Playlist General / First Video</span>
                    </div>
                  ) : (
                    <select
                      value={String(taskTargetVideoIndex)}
                      onChange={(e) => setTaskTargetVideoIndex(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-[#0F172A] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#2563EB]/30 shadow-2xs"
                    >
                      <option value="general">Playlist General Task</option>
                      {videos.map((v, i) => (
                        <option key={v.id || i} value={String(i)}>
                          Video #{i + 1}: {v.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {taskTargetVideoIndex === 'general' || videos.length === 0 || !videos[Number(taskTargetVideoIndex)] ? (
                  <InlineVideoTasksSection
                    mode="draft"
                    videoId={playlist?.id ? `${playlist.id}-general` : 'playlist-general'}
                    videoTitle={title || 'Playlist General Task'}
                    playlistId={playlist?.id}
                    draftTasks={generalDraftTasks}
                    onChangeDraftTasks={setGeneralDraftTasks}
                    api={api || adminApi(getToken())}
                  />
                ) : (
                  <InlineVideoTasksSection
                    mode={
                      playlist?.id &&
                      !playlist.id.startsWith('pl-temp') &&
                      (videos[Number(taskTargetVideoIndex)].id || videos[Number(taskTargetVideoIndex)].youtubeVideoId)
                        ? 'live'
                        : 'draft'
                    }
                    videoId={videos[Number(taskTargetVideoIndex)].id || videos[Number(taskTargetVideoIndex)].youtubeVideoId}
                    videoTitle={videos[Number(taskTargetVideoIndex)].title || `Video ${Number(taskTargetVideoIndex) + 1}`}
                    playlistId={playlist?.id}
                    draftTasks={videos[Number(taskTargetVideoIndex)].draftTasks || []}
                    onChangeDraftTasks={(updatedDrafts) => {
                      setVideos((prev) => {
                        const copy = [...prev];
                        const idx = Number(taskTargetVideoIndex);
                        if (copy[idx]) {
                          copy[idx] = {
                            ...copy[idx],
                            draftTasks: updatedDrafts,
                          };
                        }
                        return copy;
                      });
                    }}
                    api={api || adminApi(getToken())}
                  />
                )}
              </div>
            </div>
          )}

          {/* ── FOOTER ACTIONS ── */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 shrink-0">
            <div className="flex items-center gap-2.5 justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-[#475569] hover:bg-slate-100 text-xs sm:text-sm font-bold transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={(e) => handleSubmit(e, true)}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-brand-border border border-slate-200 text-[#0F172A] text-xs sm:text-sm font-extrabold transition cursor-pointer disabled:opacity-50 shadow-2xs"
                title="Save as inactive / draft playlist"
              >
                Save Draft
              </button>

              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-[#0F172A] text-xs sm:text-sm font-black transition flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Icon name="sync" className="animate-spin text-base" />
                    <span>Saving Playlist...</span>
                  </>
                ) : (
                  <>
                    <Icon name={playlist ? 'check' : 'playlist_add'} className="text-base" />
                    <span>
                      {playlist
                        ? `Save Changes (${videos.length} Videos)`
                        : `Create Playlist (${videos.length} Videos)`}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* ── VIDEO PREVIEW MODAL ── */}
      {previewVideoItem && (
        <div
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setPreviewVideoItem(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative border border-slate-200 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-3.5 bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon name="play_circle" className="text-white text-xl shrink-0" />
                <span className="font-extrabold text-sm text-white truncate">{previewVideoItem.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVideoItem(null)}
                className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer transition shrink-0"
              >
                <Icon name="close" className="text-lg" />
              </button>
            </div>

            {/* Video Player */}
            <div className="aspect-video bg-black w-full">
              {previewVideoItem.youtubeVideoId ? (
                <iframe
                  src={
                    getYoutubeEmbedUrl(previewVideoItem.youtubeVideoId, true) ||
                    `https://www.youtube.com/embed/${previewVideoItem.youtubeVideoId}?autoplay=1&rel=0&modestbranding=1`
                  }
                  title={previewVideoItem.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#0F172A] text-xs">
                  Invalid YouTube Video ID
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 flex items-center justify-between text-xs">
              <span className="font-mono text-[#475569] text-[11px]">
                {previewVideoItem.youtubeUrl}
              </span>
              <button
                type="button"
                onClick={() => setPreviewVideoItem(null)}
                className="px-4 py-1.5 rounded-xl bg-[#2563EB] text-white font-bold cursor-pointer hover:bg-[#1D4ED8] transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
