import React, { useState, useEffect, useMemo, useRef } from 'react';
import Icon from '../../components/Icon.jsx';
import YouTubePlayer from '../../components/YouTubePlayer.jsx';
import { adminApi, assetUrl } from '../../lib/api.js';
import { getToken } from '../../lib/AuthContext.jsx';
import { CATEGORIES, extractYoutubeId, getYoutubeThumbnailUrl } from '../../lib/courses.js';
import { formatTime, parseTimeToSeconds } from '../../lib/time.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import AdminPlaylistsPanel from './AdminPlaylistsPanel.jsx';
import InlineVideoTasksSection from '../../components/admin/InlineVideoTasksSection.jsx';

const fmtTime = formatTime;
const formatSecondsToTime = (sec) => formatTime(sec);

// Compute end times dynamically based on chapter sequence and video duration
function computeChapterEndTimes(list, totalDur) {
    return list.map((ch, idx) => {
        const next = list[idx + 1];
        const eTime = next ? next.startTime : (totalDur || ch.startTime || '00:00:00');
        return {
            ...ch,
            endTime: eTime,
        };
    });
}

// Dynamic duration detection for direct video file or URL
function detectVideoFileDuration(fileOrUrl) {
    return new Promise((resolve) => {
        try {
            const v = document.createElement('video');
            v.preload = 'metadata';
            const isBlob = typeof fileOrUrl === 'object' && fileOrUrl instanceof Blob;
            const src = isBlob ? URL.createObjectURL(fileOrUrl) : fileOrUrl;
            v.src = src;
            const cleanup = () => {
                if (isBlob) {
                    try { URL.revokeObjectURL(src); } catch { }
                }
            };
            v.onloadedmetadata = () => {
                cleanup();
                const d = v.duration;
                if (d && !isNaN(d) && d > 0 && isFinite(d)) {
                    resolve(d);
                } else {
                    resolve(null);
                }
            };
            v.onerror = () => {
                cleanup();
                resolve(null);
            };
            setTimeout(() => {
                cleanup();
                resolve(null);
            }, 8000);
        } catch {
            resolve(null);
        }
    });
}

// Dynamic duration detection for YouTube video ID
function detectYouTubeDuration(videoId) {
    return new Promise((resolve) => {
        if (!videoId) return resolve(null);
        const initPlayer = () => {
            const div = document.createElement('div');
            div.id = `yt-probe-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
            div.style.position = 'fixed';
            div.style.top = '-9999px';
            div.style.left = '-9999px';
            div.style.width = '1px';
            div.style.height = '1px';
            document.body.appendChild(div);

            let playerInstance = null;
            let done = false;

            const finish = (dur) => {
                if (done) return;
                done = true;
                try { if (playerInstance && typeof playerInstance.destroy === 'function') playerInstance.destroy(); } catch { }
                try { if (div.parentNode) div.parentNode.removeChild(div); } catch { }
                resolve(dur);
            };

            try {
                playerInstance = new window.YT.Player(div.id, {
                    videoId,
                    playerVars: {
                        autoplay: 0,
                        controls: 0,
                        origin: typeof window !== 'undefined' && window.location ? window.location.origin : '',
                    },
                    events: {
                        onReady: (e) => {
                            try {
                                const dur = e.target.getDuration();
                                if (dur && dur > 0) {
                                    finish(dur);
                                } else {
                                    setTimeout(() => {
                                        const d2 = e.target ? e.target.getDuration() : 0;
                                        finish(d2 && d2 > 0 ? d2 : null);
                                    }, 800);
                                }
                            } catch {
                                finish(null);
                            }
                        },
                        onError: () => finish(null),
                    },
                });
            } catch {
                finish(null);
            }

            setTimeout(() => finish(null), 8000);
        };

        if (window.YT && window.YT.Player) {
            initPlayer();
        } else {
            if (!document.getElementById('yt-iframe-api-script')) {
                const tag = document.createElement('script');
                tag.id = 'yt-iframe-api-script';
                tag.src = 'https://www.youtube.com/iframe_api';
                document.head.appendChild(tag);
            }
            const prevCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (typeof prevCallback === 'function') prevCallback();
                initPlayer();
            };
            setTimeout(() => resolve(null), 8000);
        }
    });
}

export default function SinglePageEditCourse({ course = null, onClose, onSave, api: parentApi, isNew = false, initialTab = 'details' }) {
    const { t, lang } = useLanguage();
    const token = getToken();
    const api = useMemo(() => parentApi || adminApi(token), [parentApi, token]);
    const initialCourse = course || {};
    course = initialCourse;

    // Tabs: 'details' | 'playlists' | 'materials' | 'assessments'
    const [activeTab, setActiveTab] = useState(initialTab || 'details');

    // =========================================================================
    // SECTION 1: BASIC DETAILS STATE
    // =========================================================================
    const [courseName, setCourseName] = useState(
        typeof initialCourse.title === 'string' ? initialCourse.title : initialCourse.title?.en || initialCourse.courseName || ''
    );
    const [category, setCategory] = useState(initialCourse.category || 'entrepreneurship');
    const [level, setLevel] = useState(
        typeof initialCourse.level === 'string' ? initialCourse.level : initialCourse.level?.en || 'Beginner'
    );
    const [shortDescription, setShortDescription] = useState(
        typeof initialCourse.short === 'string' ? initialCourse.short : initialCourse.short?.en || initialCourse.shortDescription || ''
    );
    const [description, setDescription] = useState(
        initialCourse.description !== undefined && initialCourse.description !== null
            ? initialCourse.description
            : (typeof initialCourse.short === 'string' ? initialCourse.short : initialCourse.short?.en || initialCourse.shortDescription || '')
    );

    const resolvedCourseSlug = useMemo(() => {
        const raw = (course?.slug || initialCourse?.slug || courseName || '')
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
        return raw || '';
    }, [course?.slug, initialCourse?.slug, courseName]);
    const generatedSlug = resolvedCourseSlug;

    const [trending, setTrending] = useState(() => {
        return (
            initialCourse.trending === true ||
            initialCourse.trending === 1 ||
            initialCourse.trending === 'true' ||
            initialCourse.trending === 'Yes' ||
            initialCourse.trending === 'yes'
        );
    });

    useEffect(() => {
        if (initialCourse && initialCourse.trending !== undefined) {
            setTrending(
                initialCourse.trending === true ||
                initialCourse.trending === 1 ||
                initialCourse.trending === 'true' ||
                initialCourse.trending === 'Yes' ||
                initialCourse.trending === 'yes'
            );
        }
    }, [initialCourse.trending]);

    const [isFree, setIsFree] = useState(() => {
        if (isNew) return true;
        if (initialCourse.isFree !== undefined) return !!initialCourse.isFree;
        if (initialCourse.price !== undefined && initialCourse.price !== null) return Number(initialCourse.price) === 0;
        return true;
    });
    const [price, setPrice] = useState(() => {
        if (isNew) return 0;
        return initialCourse.price !== undefined && initialCourse.price !== null ? initialCourse.price : 0;
    });
    const [validityDays, setValidityDays] = useState(initialCourse.validityDays || 365);
    const [status, setStatus] = useState(initialCourse.status || 'Active');
    const [strictNonSkippable, setStrictNonSkippable] = useState(
        initialCourse.strictNonSkippable !== undefined ? Boolean(initialCourse.strictNonSkippable) : true
    );
    const [requireProjectForCertificate, setRequireProjectForCertificate] = useState(
        initialCourse.requireProjectForCertificate !== undefined ? Boolean(initialCourse.requireProjectForCertificate) : true
    );
    const [gradient, setGradient] = useState(initialCourse.gradient || 'from-[#1E3A8A] via-[#0F172A] to-slate-50');
    const [thumbnailUrl, setThumbnailUrl] = useState(initialCourse.thumbnailUrl || initialCourse.image || '');
    const [uploadingCourseThumb, setUploadingCourseThumb] = useState(false);

    // Learning Outcomes
    const [learnList, setLearnList] = useState(() => {
        if (Array.isArray(initialCourse.learn) && initialCourse.learn.length > 0) return initialCourse.learn;
        if (typeof initialCourse.learn === 'string' && initialCourse.learn.trim()) {
            return initialCourse.learn.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
        }
        return isNew ? [] : ['Practical real-world skills', 'Step-by-step tutorial & actionable guidance'];
    });
    const [newLearnInput, setNewLearnInput] = useState('');

    // Requirements / Prerequisites
    const [reqList, setReqList] = useState(() => {
        if (Array.isArray(initialCourse.requirements) && initialCourse.requirements.length > 0) return initialCourse.requirements;
        if (typeof initialCourse.requirements === 'string' && initialCourse.requirements.trim()) {
            return initialCourse.requirements.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
        }
        return isNew ? [] : ['Basic understanding of smartphone / computer'];
    });
    const [newReqInput, setNewReqInput] = useState('');

    const [draftTasks, setDraftTasks] = useState([]);

    // =========================================================================
    // EMBEDDED COURSE PLAYLIST & VIDEO LESSONS STATE
    // =========================================================================
    const initialLinkedPlaylist = Array.isArray(initialCourse.playlists) && initialCourse.playlists.length > 0
        ? initialCourse.playlists[0]
        : (initialCourse.linkedPlaylist || null);

    const [playlistEnabled, setPlaylistEnabled] = useState(() => Boolean(initialLinkedPlaylist));
    const [linkedPlaylistId, setLinkedPlaylistId] = useState(() => initialLinkedPlaylist?.id || null);
    const [playlistTitle, setPlaylistTitle] = useState(() => initialLinkedPlaylist?.title || '');
    const [playlistDescription, setPlaylistDescription] = useState(() => initialLinkedPlaylist?.description || '');
    const [playlistTrending, setPlaylistTrending] = useState(() => Boolean(initialLinkedPlaylist?.isTrending));
    const [playlistVideos, setPlaylistVideos] = useState(() =>
        Array.isArray(initialLinkedPlaylist?.videos)
            ? initialLinkedPlaylist.videos.map((v, idx) => ({
                id: v.id || `plv-${idx + 1}`,
                title: v.title || `Video ${idx + 1}`,
                youtubeUrl: v.youtubeUrl || (v.youtubeVideoId ? `https://www.youtube.com/watch?v=${v.youtubeVideoId}` : ''),
                youtubeVideoId: v.youtubeVideoId || extractYoutubeId(v.youtubeUrl) || '',
                videoUrl: v.videoUrl || (v.youtubeUrl && !extractYoutubeId(v.youtubeUrl) ? v.youtubeUrl : ''),
                thumbnailUrl: v.thumbnailUrl || '',
                duration: v.duration || '',
                description: v.description || '',
                notesUrl: v.notesUrl || null,
                notesName: v.notesName || null,
                notesSize: v.notesSize || null,
                notesExt: v.notesExt || null,
                assessments: Array.isArray(v.assessments) ? v.assessments : [],
                draftTasks: [],
            }))
            : []
    );
    const [loadingLinkedPlaylist, setLoadingLinkedPlaylist] = useState(false);
    const [editingPlVideoIndex, setEditingPlVideoIndex] = useState(null);
    const [uploadingPlVideoFile, setUploadingPlVideoFile] = useState(false);
    const [plVideoUploadProgress, setPlVideoUploadProgress] = useState(0);
    const [uploadingPlVideoNote, setUploadingPlVideoNote] = useState(false);
    const [expandedPlVideoIdx, setExpandedPlVideoIdx] = useState(null);
    const [plVideoForm, setPlVideoForm] = useState({
        title: '',
        sourceType: 'youtube',
        youtubeUrl: '',
        videoUrl: '',
        duration: '',
        description: '',
        thumbnailUrl: '',
        notesUrl: '',
        notesName: '',
        notesSize: '',
        notesExt: '',
        quizQuestion: '',
        quizOptions: ['', '', '', ''],
        quizCorrect: 0,
    });

    useEffect(() => {
        if (isNew) return;
        const cId = initialCourse.id || initialCourse._id;
        const cSlug = initialCourse.slug || resolvedCourseSlug;
        if (!cId && !cSlug) return;
        let cancelled = false;
        setLoadingLinkedPlaylist(true);
        (async () => {
            try {
                let pls = null;
                if (typeof api?.getPlaylists === 'function') {
                    pls = await api.getPlaylists(cSlug ? { courseSlug: cSlug } : { courseId: cId }).catch(() => null);
                }
                if (!cancelled && Array.isArray(pls) && pls.length > 0) {
                    const primary = pls.find((p) => p.id === linkedPlaylistId) || pls[0];
                    setLinkedPlaylistId(primary.id || null);
                    setPlaylistEnabled(true);
                    setPlaylistTitle((prev) => prev || primary.title || '');
                    setPlaylistDescription((prev) => prev || primary.description || '');
                    setPlaylistTrending(Boolean(primary.isTrending));
                    if (Array.isArray(primary.videos)) {
                        setPlaylistVideos(
                            primary.videos.map((v, idx) => ({
                                id: v.id || `plv-${idx + 1}`,
                                title: v.title || `Video ${idx + 1}`,
                                youtubeUrl: v.youtubeUrl || (v.youtubeVideoId ? `https://www.youtube.com/watch?v=${v.youtubeVideoId}` : ''),
                                youtubeVideoId: v.youtubeVideoId || extractYoutubeId(v.youtubeUrl) || '',
                                videoUrl: v.videoUrl || (v.youtubeUrl && !extractYoutubeId(v.youtubeUrl) ? v.youtubeUrl : ''),
                                thumbnailUrl: v.thumbnailUrl || '',
                                duration: v.duration || '',
                                description: v.description || '',
                                notesUrl: v.notesUrl || null,
                                notesName: v.notesName || null,
                                notesSize: v.notesSize || null,
                                notesExt: v.notesExt || null,
                                assessments: Array.isArray(v.assessments) ? v.assessments : [],
                                draftTasks: [],
                            }))
                        );
                    }
                }
            } catch (e) {
                console.warn('Could not load linked course playlist:', e?.message);
            } finally {
                if (!cancelled) setLoadingLinkedPlaylist(false);
            }
        })();
        return () => { cancelled = true; };
    }, [isNew, initialCourse.id, initialCourse.slug]);

    // =========================================================================
    // SECTION 2: MANAGE VIDEOS & SECTIONS STATE
    // =========================================================================
    const [sections, setSections] = useState(() => {
        if (Array.isArray(initialCourse.sections) && initialCourse.sections.length > 0) {
            return initialCourse.sections.map((s, idx) => ({
                id: typeof s === 'object' && s?.id ? s.id : `sec-${idx + 1}`,
                title: typeof s === 'object' ? (s.title || s.name || `Section ${idx + 1}`) : s,
                description: typeof s === 'object' ? (s.description || '') : '',
                displayOrder: typeof s === 'object' && s?.displayOrder ? s.displayOrder : idx + 1,
            }));
        }
        return [
            { id: 'sec-1', title: 'Course Content', description: 'Course video chapters and learning curriculum', displayOrder: 1 }
        ];
    });

    // =========================================================================
    // SECTION 2: SINGLE COURSE VIDEO & CHAPTERS STATE
    // =========================================================================
    const [courseVideoTitle, setCourseVideoTitle] = useState(() => {
        if (initialCourse.videoTitle) return initialCourse.videoTitle;
        if (initialCourse.videoUrl) return initialCourse.videoUrl.split('/').pop();
        if (initialCourse.file) return initialCourse.file.split('/').pop();
        if (initialCourse.youtubeUrl) return 'YouTube Course Video';
        if (initialCourse.lessons?.[0]?.videoUrl) return initialCourse.lessons[0].videoUrl.split('/').pop();
        if (initialCourse.lessons?.[0]?.file) return initialCourse.lessons[0].file.split('/').pop();
        if (initialCourse.lessons?.[0]?.youtubeUrl) return 'YouTube Course Video';
        return '';
    });

    const [courseVideoSourceType, setCourseVideoSourceType] = useState('youtube');

    const [courseYoutubeUrl, setCourseYoutubeUrl] = useState(() => {
        return initialCourse.youtubeUrl || (initialCourse.youtubeVideoId ? `https://www.youtube.com/watch?v=${initialCourse.youtubeVideoId}` : '') || initialCourse.lessons?.[0]?.youtubeUrl || '';
    });

    const [courseYoutubeVideoId, setCourseYoutubeVideoId] = useState(() => {
        return initialCourse.youtubeVideoId || extractYoutubeId(initialCourse.youtubeUrl) || initialCourse.lessons?.[0]?.youtubeVideoId || '';
    });

    const [courseVideoUrl, setCourseVideoUrl] = useState(() => {
        return initialCourse.videoUrl || initialCourse.file || initialCourse.lessons?.[0]?.videoUrl || initialCourse.lessons?.[0]?.file || '';
    });

    // Dynamic real video duration
    const [courseDuration, setCourseDuration] = useState(() => {
        return initialCourse.duration || (initialCourse.totalDuration ? formatSecondsToTime(initialCourse.totalDuration, true) : '00:00:00');
    });
    const [detectingDuration, setDetectingDuration] = useState(false);
    const [durationWarning, setDurationWarning] = useState('');

    const [courseVideoThumbUrl, setCourseVideoThumbUrl] = useState(() => {
        return initialCourse.thumbnailUrl || initialCourse.image || initialCourse.lessons?.[0]?.thumbnail || '';
    });

    const [courseNotesName, setCourseNotesName] = useState(() => {
        return initialCourse.notesName || initialCourse.lessons?.[0]?.notesName || (initialCourse.resources?.[0]?.name) || '';
    });

    const [courseNotesUrl, setCourseNotesUrl] = useState(() => {
        return initialCourse.notesUrl || initialCourse.lessons?.[0]?.notesUrl || (initialCourse.resources?.[0]?.url || initialCourse.resources?.[0]?.file) || '';
    });

    const [courseIsPreview, setCourseIsPreview] = useState(() => {
        return initialCourse.isFree !== undefined ? !!initialCourse.isFree : true;
    });

    // Upload progress and drawer state
    const [showVideoConfig, setShowVideoConfig] = useState(false);
    const [uploadingDirectVideo, setUploadingDirectVideo] = useState(false);
    const [videoUploadProgress, setVideoUploadProgress] = useState(0);
    const [uploadingVideoThumb, setUploadingVideoThumb] = useState(false);
    const [uploadingNotes, setUploadingNotes] = useState(false);
    const [notesUploadProgress, setNotesUploadProgress] = useState(0);

    // Preview Video Player Modal
    const [previewPlayerOpen, setPreviewPlayerOpen] = useState(false);
    const [previewCurrentTime, setPreviewCurrentTime] = useState(0);
    const previewVideoRef = useRef(null);
    const previewYtRef = useRef(null);

    // CHAPTERS STATE - Clean initialization from existing course lessons without fake data
    const [chapters, setChapters] = useState(() => {
        if (Array.isArray(initialCourse.lessons) && initialCourse.lessons.length > 0) {
            return initialCourse.lessons.map((l, idx) => {
                const startSec = l.startTime !== undefined ? Number(l.startTime) : (idx * 60);
                const nextLesson = initialCourse.lessons[idx + 1];
                const endSec = l.endTime !== undefined ? Number(l.endTime) : (nextLesson?.startTime !== undefined ? Number(nextLesson.startTime) : startSec + 60);
                const notePath = l.notesUrl || l.noteUrl || l.note || null;
                const noteFileName = l.notesName || l.noteName || (notePath ? notePath.split('/').pop() : null);
                return {
                    id: l.id || `chapter-${idx + 1}`,
                    title: l.title || l.t || `Chapter ${idx + 1}`,
                    startTime: formatSecondsToTime(startSec, true),
                    endTime: formatSecondsToTime(endSec, true),
                    description: l.description || l.short || '',
                    points: Array.isArray(l.points) ? l.points : (Array.isArray(l.learn) ? l.learn : []),
                    notesUrl: notePath,
                    notesName: noteFileName,
                    notesSize: l.notesSize || l.size || null,
                    notesExt: l.notesExt || l.ext || (noteFileName?.includes('.') ? noteFileName.split('.').pop()?.toUpperCase() : 'PDF'),
                };
            });
        }
        return [
            {
                id: 'ch-1',
                title: 'Chapter 1',
                startTime: '00:00:00',
                endTime: courseDuration || '00:10:00',
                description: '',
                points: [],
                notesUrl: null,
                notesName: null,
                notesSize: null,
                notesExt: null,
            },
        ];
    });

    const [uploadingChapterNotes, setUploadingChapterNotes] = useState({});
    const [chapterNotesProgress, setChapterNotesProgress] = useState({});

    const handleUploadChapterNote = async (chapterId, file) => {
        if (!file) return;
        const allowed = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i.test(file.name);
        if (!allowed) {
            alert('Only PDF, DOC, DOCX, XLS, XLSX, PPT, and PPTX files are allowed.');
            return;
        }
        if (file.size > 30 * 1024 * 1024) {
            alert('File size exceeds the 30 MB limit.');
            return;
        }

        setUploadingChapterNotes((prev) => ({ ...prev, [chapterId]: true }));
        setChapterNotesProgress((prev) => ({ ...prev, [chapterId]: 0 }));

        try {
            const client = adminApi(getToken());
            const res = await client.uploadCourseNote(file, (pct) => {
                setChapterNotesProgress((prev) => ({ ...prev, [chapterId]: pct }));
            });

            if (!res || (!res.file && !res.url)) {
                throw new Error('Upload succeeded but server did not return a valid file path.');
            }

            const fileUrl = res.file || res.url;
            const fileName = res.name || res.title || file.name;
            const fileSize = res.size || `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
            const fileExt = res.ext || file.name.split('.').pop()?.toUpperCase() || 'PDF';

            setChapters((prev) =>
                prev.map((ch) =>
                    ch.id === chapterId
                        ? {
                            ...ch,
                            notesUrl: fileUrl,
                            notesName: fileName,
                            notesSize: fileSize,
                            notesExt: fileExt,
                            noteUrl: fileUrl,
                            noteName: fileName,
                        }
                        : ch
                )
            );
        } catch (err) {
            console.error('Failed to upload chapter note:', err);
            alert(err.message || 'Failed to upload chapter note. Please try again.');
        } finally {
            setUploadingChapterNotes((prev) => {
                const copy = { ...prev };
                delete copy[chapterId];
                return copy;
            });
            setChapterNotesProgress((prev) => {
                const copy = { ...prev };
                delete copy[chapterId];
                return copy;
            });
        }
    };

    const handleRemoveChapterNote = (chapterId) => {
        if (!window.confirm('Are you sure you want to remove the notes for this chapter?')) return;
        setChapters((prev) =>
            prev.map((ch) =>
                ch.id === chapterId
                    ? {
                        ...ch,
                        notesUrl: null,
                        notesName: null,
                        notesSize: null,
                        notesExt: null,
                        noteUrl: null,
                        noteName: null,
                    }
                    : ch
            )
        );
    };

    // Dynamic seconds duration and validation check
    const durationSec = useMemo(() => parseTimeToSeconds(courseDuration), [courseDuration]);

    // List of chapter IDs whose start times exceed the video duration
    const invalidChapterIds = useMemo(() => {
        if (!durationSec || durationSec <= 0) return [];
        return chapters
            .filter((ch) => parseTimeToSeconds(ch.startTime) > durationSec)
            .map((ch) => ch.id);
    }, [chapters, durationSec]);

    // Chapter Detail Modal State (for editing title, start time, description & bullet points)
    const [chapterModalOpen, setChapterModalOpen] = useState(false);
    const [modalChapterData, setModalChapterData] = useState(null);
    const [modalNewPoint, setModalNewPoint] = useState('');

    // =========================================================================
    // SECTION 3: MANAGE ASSESSMENT STATE
    // =========================================================================
    const [assessmentEnabled, setAssessmentEnabled] = useState(
        initialCourse.assessmentSettings?.enabled !== false
    );
    const [passingScore, setPassingScore] = useState(
        Number(initialCourse.assessmentSettings?.passingScore ?? 70)
    );

    const [questions, setQuestions] = useState(() => {
        if (Array.isArray(initialCourse.assessments) && initialCourse.assessments.length > 0) {
            return initialCourse.assessments;
        }
        if (initialCourse.slug) {
            try {
                const local = JSON.parse(localStorage.getItem(`course_assessments_${initialCourse.slug}`));
                if (Array.isArray(local) && local.length > 0) return local;
            } catch { }
        }
        return [];
    });

    // Question Form State
    const [editingQuestionId, setEditingQuestionId] = useState(null);
    const [qTargetVideoIdx, setQTargetVideoIdx] = useState(0);

    useEffect(() => {
        if (chapters.length > 0 && qTargetVideoIdx >= chapters.length) {
            setQTargetVideoIdx(0);
        }
    }, [chapters.length, qTargetVideoIdx]);
    const [qTriggerType, setQTriggerType] = useState('end'); // 'end' | 'timestamp'
    const [qTriggerMin, setQTriggerMin] = useState(1);
    const [qTriggerSec, setQTriggerSec] = useState(0);
    const [qType, setQType] = useState('mcq'); // 'mcq' | 'tf'
    const [qPrompt, setQPrompt] = useState('');
    const [qOptions, setQOptions] = useState(['', '', '', '']);
    const [qCorrectIdx, setQCorrectIdx] = useState(0);
    const [qExplanation, setQExplanation] = useState('');
    const [qFormError, setQFormError] = useState('');

    // Inline Question Card Editing State
    const [inlineEditingQId, setInlineEditingQId] = useState(null);
    const [inlineForm, setInlineForm] = useState(null);
    const [inlineFormError, setInlineFormError] = useState('');
    const [assessmentNotice, setAssessmentNotice] = useState('');

    // Global Save & Notice State
    const [saving, setSaving] = useState(false);
    const [toastNotice, setToastNotice] = useState(null);

    // Auto-scroll anchor ref helper
    const scrollTo = (id) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    // =========================================================================
    // HANDLERS: EMBEDDED COURSE PLAYLIST & VIDEO LESSONS
    // =========================================================================
    const resetPlVideoForm = () => {
        setEditingPlVideoIndex(null);
        setPlVideoForm({
            title: '',
            sourceType: 'youtube',
            youtubeUrl: '',
            videoUrl: '',
            duration: '',
            description: '',
            thumbnailUrl: '',
            notesUrl: '',
            notesName: '',
            notesSize: '',
            notesExt: '',
            quizQuestion: '',
            quizOptions: ['', '', '', ''],
            quizCorrect: 0,
        });
    };

    const handleUploadPlaylistLessonVideo = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingPlVideoFile(true);
        setPlVideoUploadProgress(0);
        try {
            const dur = await detectVideoFileDuration(file);
            const fd = new FormData();
            fd.append('video', file);
            const res = await api.upload('/upload-video', fd, (prog) => {
                setPlVideoUploadProgress(prog?.percent || 0);
            });
            if (res?.videoUrl) {
                setPlVideoForm((prev) => ({
                    ...prev,
                    sourceType: 'upload',
                    videoUrl: res.videoUrl,
                    youtubeUrl: res.videoUrl,
                    title: prev.title || file.name.replace(/\.[^/.]+$/, ''),
                    duration: prev.duration || (dur ? formatSecondsToTime(dur, false) : ''),
                }));
            }
        } catch (err) {
            alert('Failed to upload video file: ' + (err?.message || 'Error'));
        } finally {
            setUploadingPlVideoFile(false);
            setPlVideoUploadProgress(0);
            e.target.value = '';
        }
    };

    const handleUploadPlaylistLessonNote = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const allowed = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i.test(file.name);
        if (!allowed) {
            alert('Only PDF, DOC, DOCX, XLS, XLSX, PPT, and PPTX files are allowed.');
            return;
        }
        setUploadingPlVideoNote(true);
        try {
            const client = api || adminApi(getToken());
            const res = await client.uploadCourseNote(file);
            if (res?.url || res?.file) {
                setPlVideoForm((prev) => ({
                    ...prev,
                    notesUrl: res.url || res.file,
                    notesName: res.name || file.name,
                    notesSize: res.size || `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                    notesExt: res.ext || file.name.split('.').pop()?.toUpperCase() || 'PDF',
                }));
            }
        } catch (err) {
            alert('Failed to upload lesson note: ' + (err?.message || 'Error'));
        } finally {
            setUploadingPlVideoNote(false);
            e.target.value = '';
        }
    };

    const handleSavePlaylistVideoItem = () => {
        const cleanTitle = (plVideoForm.title || '').trim();
        if (!cleanTitle) {
            alert('Please enter a video lesson title.');
            return;
        }
        const rawMedia = (plVideoForm.sourceType === 'upload' ? (plVideoForm.videoUrl || plVideoForm.youtubeUrl) : plVideoForm.youtubeUrl || '').trim();
        const ytId = extractYoutubeId(rawMedia);
        const isDirectMedia = rawMedia.startsWith('/uploads/') || /^https?:\/\//i.test(rawMedia);

        if (!ytId && !isDirectMedia) {
            alert('Please enter a valid YouTube URL/Video ID or upload a video file.');
            return;
        }

        const existingAssessments =
            editingPlVideoIndex !== null && Array.isArray(playlistVideos[editingPlVideoIndex]?.assessments)
                ? [...playlistVideos[editingPlVideoIndex].assessments]
                : [];
        const trimmedQ = (plVideoForm.quizQuestion || '').trim();
        const trimmedOpts = (plVideoForm.quizOptions || []).map((o) => o.trim()).filter(Boolean);
        let updatedAssessments = existingAssessments;
        if (trimmedQ && trimmedOpts.length >= 2) {
            const qObj = {
                id: `plq-${Date.now()}`,
                question: trimmedQ,
                options: trimmedOpts,
                correct: Math.min(Number(plVideoForm.quizCorrect) || 0, trimmedOpts.length - 1),
                triggerType: 'end',
            };
            updatedAssessments = [...existingAssessments, qObj];
        }

        const itemObj = {
            id: editingPlVideoIndex !== null ? (playlistVideos[editingPlVideoIndex]?.id || `plv-${Date.now()}`) : `plv-${Date.now()}`,
            title: cleanTitle,
            youtubeUrl: ytId ? `https://www.youtube.com/watch?v=${ytId}` : rawMedia,
            youtubeVideoId: ytId || '',
            videoUrl: ytId ? '' : rawMedia,
            thumbnailUrl: plVideoForm.thumbnailUrl?.trim() || (ytId ? getYoutubeThumbnailUrl(ytId, 'hqdefault') : ''),
            duration: (plVideoForm.duration || '').trim(),
            description: (plVideoForm.description || '').trim(),
            notesUrl: plVideoForm.notesUrl || null,
            notesName: plVideoForm.notesName || null,
            notesSize: plVideoForm.notesSize || null,
            notesExt: plVideoForm.notesExt || null,
            assessments: updatedAssessments,
            draftTasks: editingPlVideoIndex !== null ? (playlistVideos[editingPlVideoIndex]?.draftTasks || []) : [],
        };

        setPlaylistEnabled(true);
        if (editingPlVideoIndex !== null) {
            setPlaylistVideos((prev) => prev.map((it, idx) => (idx === editingPlVideoIndex ? itemObj : it)));
        } else {
            setPlaylistVideos((prev) => [...prev, itemObj]);
        }
        resetPlVideoForm();
    };

    const handleEditPlaylistVideo = (idx) => {
        const v = playlistVideos[idx];
        if (!v) return;
        setEditingPlVideoIndex(idx);
        setPlVideoForm({
            title: v.title || '',
            sourceType: v.youtubeVideoId ? 'youtube' : (v.videoUrl || (v.youtubeUrl || '').startsWith('/uploads/') ? 'upload' : 'youtube'),
            youtubeUrl: v.youtubeUrl || (v.youtubeVideoId ? `https://www.youtube.com/watch?v=${v.youtubeVideoId}` : ''),
            videoUrl: v.videoUrl || (!v.youtubeVideoId ? v.youtubeUrl || '' : ''),
            duration: v.duration || '',
            description: v.description || '',
            thumbnailUrl: v.thumbnailUrl || '',
            notesUrl: v.notesUrl || '',
            notesName: v.notesName || '',
            notesSize: v.notesSize || '',
            notesExt: v.notesExt || '',
            quizQuestion: '',
            quizOptions: ['', '', '', ''],
            quizCorrect: 0,
        });
    };

    const handleMovePlaylistVideo = (idx, dir) => {
        const target = idx + dir;
        if (target < 0 || target >= playlistVideos.length) return;
        setPlaylistVideos((prev) => {
            const copy = [...prev];
            const tmp = copy[idx];
            copy[idx] = copy[target];
            copy[target] = tmp;
            return copy;
        });
    };

    const handleRemovePlaylistVideo = (idx) => {
        if (!window.confirm('Remove this video lesson from the course playlist?')) return;
        setPlaylistVideos((prev) => prev.filter((_, i) => i !== idx));
        if (editingPlVideoIndex === idx) resetPlVideoForm();
    };

    // =========================================================================
    // HANDLERS: SECTION 1 (BASIC DETAILS)
    // =========================================================================
    const handleUploadCourseThumbnail = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file (JPG, PNG, WebP).');
            return;
        }
        setUploadingCourseThumb(true);
        try {
            const res = await api.uploadThumbnail(file);
            if (res?.thumbnailUrl) {
                setThumbnailUrl(res.thumbnailUrl);
            }
        } catch (err) {
            alert('Failed to upload course thumbnail: ' + (err.message || 'Error'));
        } finally {
            setUploadingCourseThumb(false);
        }
    };

    const handleAddLearnItem = () => {
        const trimmed = newLearnInput.trim();
        if (!trimmed) return;
        setLearnList((prev) => [...prev, trimmed]);
        setNewLearnInput('');
    };

    const handleRemoveLearnItem = (idx) => {
        setLearnList((prev) => prev.filter((_, i) => i !== idx));
    };

    const handleAddReqItem = () => {
        const trimmed = newReqInput.trim();
        if (!trimmed) return;
        setReqList((prev) => [...prev, trimmed]);
        setNewReqInput('');
    };

    const handleRemoveReqItem = (idx) => {
        setReqList((prev) => prev.filter((_, i) => i !== idx));
    };

    // =========================================================================
    // HANDLERS: SECTION 2 (SINGLE COURSE VIDEO & CHAPTERS)
    // =========================================================================

    // Handle detection and updating of real video duration with chapter revalidation
    const handleNewVideoDuration = (newDurSeconds) => {
        if (!newDurSeconds || isNaN(newDurSeconds) || newDurSeconds <= 0) return;
        const formatted = formatSecondsToTime(newDurSeconds, true);
        setCourseDuration(formatted);

        // Revalidate existing chapters against the new real duration
        const invalidList = chapters.filter(
            (ch) => parseTimeToSeconds(ch.startTime) > newDurSeconds
        );
        if (invalidList.length > 0) {
            setDurationWarning(
                `Warning: ${invalidList.length} chapter(s) have timestamps beyond the new video duration (${formatted}). Please adjust their start times.`
            );
        } else {
            setDurationWarning('');
        }

        // Keep final chapter end time aligned with new duration
        setChapters((prev) => {
            if (prev.length === 0) return prev;
            const copy = [...prev];
            for (let i = 0; i < copy.length - 1; i++) {
                copy[i].endTime = copy[i + 1].startTime;
            }
            copy[copy.length - 1].endTime = formatted;
            return copy;
        });
    };

    // Initial duration detection for existing course video on mount
    useEffect(() => {
        let active = true;
        const probeInitialDuration = async () => {
            try {
                if (courseVideoSourceType === 'direct' && courseVideoUrl) {
                    const dur = await detectVideoFileDuration(assetUrl(courseVideoUrl));
                    if (active && dur && dur > 0) {
                        handleNewVideoDuration(dur);
                    }
                } else if (courseYoutubeVideoId) {
                    const dur = await detectYouTubeDuration(courseYoutubeVideoId);
                    if (active && dur && dur > 0) {
                        handleNewVideoDuration(dur);
                    }
                }
            } catch (err) {
                console.warn('Initial duration probe:', err);
            }
        };
        probeInitialDuration();
        return () => { active = false; };
    }, [courseVideoUrl, courseYoutubeVideoId, courseVideoSourceType]);

    // Upload MP4 / WebM Direct Video with immediate duration detection
    const handleUploadDirectVideo = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingDirectVideo(true);
        setVideoUploadProgress(0);
        setDetectingDuration(true);
        try {
            // 1. Detect duration directly from file object before or during upload
            const dur = await detectVideoFileDuration(file);
            if (dur && dur > 0) {
                handleNewVideoDuration(dur);
            }

            const fd = new FormData();
            fd.append('video', file);
            const res = await api.upload('/upload-video', fd, (prog) => {
                setVideoUploadProgress(prog?.percent || 0);
            });
            if (res?.videoUrl) {
                setCourseVideoUrl(res.videoUrl);
                setCourseVideoTitle(file.name);
                setCourseVideoSourceType('direct');

                // If duration was not detected from Blob, probe server url
                if (!dur || dur <= 0) {
                    const probeDur = await detectVideoFileDuration(assetUrl(res.videoUrl));
                    if (probeDur && probeDur > 0) {
                        handleNewVideoDuration(probeDur);
                    }
                }
            }
        } catch (err) {
            alert('Failed to upload video file: ' + (err.message || 'Error'));
        } finally {
            setUploadingDirectVideo(false);
            setVideoUploadProgress(0);
            setDetectingDuration(false);
        }
    };

    // Handle YouTube URL change and auto-detect duration
    const handleYoutubeUrlChange = async (url) => {
        setCourseYoutubeUrl(url);
        const ytId = extractYoutubeId(url);
        setCourseYoutubeVideoId(ytId || '');
        if (ytId) {
            if (!courseVideoThumbUrl) {
                setCourseVideoThumbUrl(getYoutubeThumbnailUrl(ytId, 'hqdefault'));
            }
            setDetectingDuration(true);
            try {
                const dur = await detectYouTubeDuration(ytId);
                if (dur && dur > 0) {
                    handleNewVideoDuration(dur);
                }
            } catch (err) {
                console.warn('Could not detect YT duration:', err);
            } finally {
                setDetectingDuration(false);
            }
        }
    };

    // Upload Video Thumbnail
    const handleUploadCourseVideoThumb = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingVideoThumb(true);
        try {
            const res = await api.uploadThumbnail(file);
            if (res?.thumbnailUrl) {
                setCourseVideoThumbUrl(res.thumbnailUrl);
                if (!thumbnailUrl) setThumbnailUrl(res.thumbnailUrl);
            }
        } catch (err) {
            alert('Failed to upload thumbnail: ' + (err.message || 'Error'));
        } finally {
            setUploadingVideoThumb(false);
        }
    };

    // Upload PDF / Notes for the Course Video
    const handleUploadCourseVideoNotes = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const allowed = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i.test(file.name);
        if (!allowed) {
            alert('Please upload a PDF, DOC, DOCX, XLS, XLSX, PPT, or PPTX document.');
            return;
        }
        if (file.size > 30 * 1024 * 1024) {
            alert('File size exceeds the 30 MB limit.');
            return;
        }
        setUploadingNotes(true);
        setNotesUploadProgress(0);
        try {
            const client = api || adminApi(getToken());
            const res = await client.uploadCourseNote(file, (pct) => {
                setNotesUploadProgress(pct);
            });
            setCourseNotesUrl(res.url || res.file || '');
            setCourseNotesName(file.name);
        } catch (err) {
            alert('Failed to upload notes: ' + (err.message || 'Error'));
        } finally {
            setUploadingNotes(false);
            setNotesUploadProgress(0);
        }
    };

    const handleRemoveCourseNotes = () => {
        if (!confirm('Remove attached Notes/PDF from this course?')) return;
        setCourseNotesName('');
        setCourseNotesUrl('');
    };

    const handleClearCourseVideo = () => {
        if (!confirm('Clear the current course video?')) return;
        setCourseVideoUrl('');
        setCourseYoutubeUrl('');
        setCourseYoutubeVideoId('');
        setCourseVideoTitle('');
    };

    // ── Chapters Handlers ──
    const handleUpdateChapterField = (id, field, value) => {
        setChapters((prev) => {
            const updated = prev.map((ch) => (ch.id === id ? { ...ch, [field]: value } : ch));
            // Automatically keep end times aligned with next chapter start time
            if (field === 'startTime') {
                for (let i = 0; i < updated.length - 1; i++) {
                    updated[i].endTime = updated[i + 1].startTime;
                }
                if (updated.length > 0) {
                    updated[updated.length - 1].endTime = courseDuration;
                }
            }
            return updated;
        });
    };

    const handleMoveChapter = (idx, dir) => {
        const targetIdx = idx + dir;
        if (targetIdx < 0 || targetIdx >= chapters.length) return;
        const copy = [...chapters];
        const temp = copy[idx];
        copy[idx] = copy[targetIdx];
        copy[targetIdx] = temp;
        // Keep end times flowing cleanly
        for (let i = 0; i < copy.length - 1; i++) {
            copy[i].endTime = copy[i + 1].startTime;
        }
        copy[copy.length - 1].endTime = courseDuration;
        setChapters(copy);
    };

    const handleDeleteChapter = (id) => {
        if (!confirm('Delete this chapter?')) return;
        setChapters((prev) => {
            const filtered = prev.filter((ch) => ch.id !== id);
            for (let i = 0; i < filtered.length - 1; i++) {
                filtered[i].endTime = filtered[i + 1].startTime;
            }
            if (filtered.length > 0) {
                filtered[filtered.length - 1].endTime = courseDuration;
            }
            return filtered;
        });
    };

    const handleAddChapter = (customStartTime) => {
        const lastChapter = chapters[chapters.length - 1];
        let newStart = '00:00:00';
        if (customStartTime) {
            newStart = customStartTime;
        } else if (lastChapter) {
            let lastSec = parseTimeToSeconds(lastChapter.startTime) + 600; // +10 minutes
            if (durationSec > 0 && lastSec > durationSec) {
                lastSec = durationSec;
            }
            newStart = formatSecondsToTime(lastSec);
        }

        const newCh = {
            id: `ch-${Date.now()}`,
            title: `Chapter ${chapters.length + 1}`,
            startTime: newStart,
            endTime: courseDuration,
            description: '',
            points: [],
            notesUrl: null,
            notesName: null,
            notesSize: null,
            notesExt: null,
        };
        setChapters((prev) => {
            const nextList = [...prev, newCh];
            for (let i = 0; i < nextList.length - 1; i++) {
                nextList[i].endTime = nextList[i + 1].startTime;
            }
            return nextList;
        });
    };

    const handleOpenEditChapterModal = (chapter) => {
        setModalChapterData({
            ...chapter,
            points: Array.isArray(chapter.points) ? [...chapter.points] : [],
        });
        setModalNewPoint('');
        setChapterModalOpen(true);
    };

    const handleSaveChapterModal = (e) => {
        if (e) e.preventDefault();
        if (!modalChapterData?.title?.trim()) {
            alert('Chapter title cannot be empty.');
            return;
        }
        const sSec = parseTimeToSeconds(modalChapterData.startTime);
        if (durationSec > 0 && sSec > durationSec) {
            alert(`Chapter time cannot exceed video duration (${courseDuration}).`);
            return;
        }
        setChapters((prev) => {
            const updated = prev.map((ch) => (ch.id === modalChapterData.id ? { ...modalChapterData } : ch));
            for (let i = 0; i < updated.length - 1; i++) {
                updated[i].endTime = updated[i + 1].startTime;
            }
            if (updated.length > 0) {
                updated[updated.length - 1].endTime = courseDuration;
            }
            return updated;
        });
        setChapterModalOpen(false);
        setModalChapterData(null);
    };

    const handleAddPointToModal = () => {
        const trimmed = modalNewPoint.trim();
        if (!trimmed) return;
        setModalChapterData((prev) => ({
            ...prev,
            points: [...(prev.points || []), trimmed],
        }));
        setModalNewPoint('');
    };

    const handleRemovePointFromModal = (pIdx) => {
        setModalChapterData((prev) => ({
            ...prev,
            points: (prev.points || []).filter((_, i) => i !== pIdx),
        }));
    };

    const handleAddChapterAtCurrentTime = () => {
        let sec = Math.round(previewCurrentTime || 0);
        if (durationSec > 0 && sec > durationSec) {
            sec = durationSec;
        }
        const formatted = formatSecondsToTime(sec);
        handleAddChapter(formatted);
    };

    // =========================================================================
    // HANDLERS: SECTION 3 (MANAGE ASSESSMENT)
    // =========================================================================
    const handleSaveQuestion = (e) => {
        if (e) e.preventDefault();
        setQFormError('');

        const promptText = qPrompt.trim();
        if (!promptText) {
            setQFormError('Please enter the question text.');
            return;
        }

        let trimmedOptions = [];
        if (qType === 'tf') {
            trimmedOptions = ['True', 'False'];
        } else {
            trimmedOptions = qOptions.map((o) => o.trim()).filter(Boolean);
            if (trimmedOptions.length < 2) {
                setQFormError('Please enter at least 2 answer choices.');
                return;
            }
        }

        const totalSeconds = qTriggerType === 'end'
            ? 999999
            : Math.max(5, (Number(qTriggerMin) || 0) * 60 + (Number(qTriggerSec) || 0));

        const triggerFormatted = qTriggerType === 'end' ? 'At Video End' : fmtTime(totalSeconds);
        const targetChapter = chapters[qTargetVideoIdx];
        const targetTitle = targetChapter?.title?.trim() || targetChapter?.t?.trim() || (chapters.length > 0 ? `Chapter ${qTargetVideoIdx + 1}` : 'Course Video');

        const questionObj = {
            id: editingQuestionId || `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            videoIndex: qTargetVideoIdx,
            videoTitle: targetTitle,
            triggerType: qTriggerType,
            triggerSeconds: totalSeconds,
            triggerFormatted,
            part: qTriggerType === 'end' ? 2 : 1,
            question: promptText,
            options: trimmedOptions,
            correct: qCorrectIdx,
            explanation: qExplanation.trim(),
        };

        if (editingQuestionId) {
            setQuestions((prev) =>
                prev.map((q) => (q.id === editingQuestionId ? questionObj : q))
            );
        } else {
            setQuestions((prev) => [...prev, questionObj]);
        }

        // Reset Question Form
        setEditingQuestionId(null);
        setQPrompt('');
        setQOptions(['', '', '', '']);
        setQCorrectIdx(0);
        setQTriggerType('end');
        setQTriggerMin(1);
        setQTriggerSec(0);
        setQExplanation('');
        setQFormError('');
    };

    // ── INLINE CARD EDIT HANDLERS (Same card editing, no scrolling, no popups) ──
    const handleStartInlineEdit = (q) => {
        const rawOpts = Array.isArray(q.options) ? [...q.options] : [];
        while (rawOpts.length < 4) rawOpts.push('');

        setInlineEditingQId(q.id);
        setInlineForm({
            id: q.id,
            question: q.question || '',
            options: [rawOpts[0] || '', rawOpts[1] || '', rawOpts[2] || '', rawOpts[3] || ''],
            correct: typeof q.correct === 'number' ? q.correct : 0,
            explanation: q.explanation || '',
        });
        setInlineFormError('');
    };

    const handleCancelInlineEdit = () => {
        setInlineEditingQId(null);
        setInlineForm(null);
        setInlineFormError('');
    };

    const handleSaveInlineQuestion = (qId) => {
        if (!inlineForm) return;
        setInlineFormError('');

        const promptText = (inlineForm.question || '').trim();
        if (!promptText) {
            setInlineFormError('Please enter the question text.');
            return;
        }

        const trimmedOpts = inlineForm.options.map((o) => (o || '').trim()).filter(Boolean);
        if (trimmedOpts.length < 2) {
            setInlineFormError('Please enter at least 2 answer choices.');
            return;
        }

        setQuestions((prev) =>
            prev.map((item) => {
                if (item.id === qId) {
                    return {
                        ...item,
                        question: promptText,
                        options: trimmedOpts,
                        correct: Math.min(Number(inlineForm.correct) || 0, Math.max(0, trimmedOpts.length - 1)),
                        explanation: (inlineForm.explanation || '').trim(),
                    };
                }
                return item;
            })
        );

        setInlineEditingQId(null);
        setInlineForm(null);
        setInlineFormError('');
        setAssessmentNotice('Assessment question updated successfully.');
        setTimeout(() => setAssessmentNotice(''), 4000);
    };

    const handleStartEditQuestion = (q) => {
        setEditingQuestionId(q.id);
        setQTargetVideoIdx(Number(q.videoIndex) || 0);
        setQTriggerType(q.triggerType || 'end');
        if (q.triggerSeconds && q.triggerSeconds < 999999) {
            setQTriggerMin(Math.floor(q.triggerSeconds / 60));
            setQTriggerSec(q.triggerSeconds % 60);
        }
        setQPrompt(q.question || '');
        if (Array.isArray(q.options) && q.options.length === 2 && q.options[0] === 'True' && q.options[1] === 'False') {
            setQType('tf');
        } else {
            setQType('mcq');
            setQOptions(
                Array.isArray(q.options) && q.options.length >= 4
                    ? [...q.options]
                    : [q.options?.[0] || '', q.options?.[1] || '', q.options?.[2] || '', q.options?.[3] || '']
            );
        }
        setQCorrectIdx(Number(q.correct) || 0);
        setQExplanation(q.explanation || '');
        scrollTo('question-builder-box');
    };

    const handleDeleteQuestion = (qId) => {
        if (!confirm(t('admin.courseEditor.confirmDeleteQuestion', 'Are you sure you want to delete this question?'))) return;
        setQuestions((prev) => prev.filter((q) => q.id !== qId));
        if (editingQuestionId === qId) {
            setEditingQuestionId(null);
            setQPrompt('');
        }
    };

    // =========================================================================
    // GLOBAL SAVE: SAVE ALL THREE SECTIONS TO POSTGRESQL IN ONE GO
    // =========================================================================
    const handleSaveCourse = async () => {
        if (saving) return; // Prevent duplicate save requests while saving is in progress

        if (!courseName.trim() || courseName.trim().length < 2) {
            setToastNotice({
                type: 'error',
                message: lang === 'mr' ? 'अभ्यासक्रमाचे नाव किमान २ अक्षरांचे असणे आवश्यक आहे.' : 'Course name must be at least 2 characters.',
            });
            setTimeout(() => setToastNotice(null), 4000);
            scrollTo('section-basic');
            return;
        }

        // Dynamic chapter timestamp validation against real video duration
        if (durationSec > 0) {
            const invalidChapter = chapters.find(
                (ch) => parseTimeToSeconds(ch.startTime) > durationSec
            );
            if (invalidChapter) {
                setToastNotice({
                    type: 'error',
                    message: `Chapter "${invalidChapter.title || invalidChapter.t}" start time (${invalidChapter.startTime}) exceeds the video duration (${courseDuration}).`,
                });
                setTimeout(() => setToastNotice(null), 5000);
                scrollTo('section-curriculum');
                return;
            }
        }

        // If YouTube mode is selected and input is provided, ensure it's a valid YouTube video
        const primaryYtId = courseYoutubeVideoId || extractYoutubeId(courseYoutubeUrl) || null;
        if (courseVideoSourceType === 'youtube' && courseYoutubeUrl.trim() && !primaryYtId) {
            setToastNotice({
                type: 'error',
                message: 'Please enter a valid YouTube video URL or 11-character video ID.',
            });
            setTimeout(() => setToastNotice(null), 5000);
            scrollTo('section-configure-video');
            return;
        }

        setSaving(true);
        setToastNotice(null);

        try {
            // 1. Prepare lessons from chapters for the single course video
            const validYtUrl = primaryYtId ? (courseYoutubeUrl.trim() || `https://www.youtube.com/watch?v=${primaryYtId}`) : null;
            const primaryThumb = courseVideoThumbUrl || thumbnailUrl || (primaryYtId ? getYoutubeThumbnailUrl(primaryYtId, 'hqdefault') : null) || initialCourse.image || null;

            const formattedLessons = chapters.map((ch, idx) => {
                const sSec = parseTimeToSeconds(ch.startTime);
                const nextChapter = chapters[idx + 1];
                const eSec = ch.endTime ? parseTimeToSeconds(ch.endTime) : (nextChapter ? parseTimeToSeconds(nextChapter.startTime) : sSec + 900);
                const durSec = Math.max(1, eSec - sSec);
                const durMins = Math.max(1, Math.round(durSec / 60));

                return {
                    id: ch.id || `chapter-${idx + 1}`,
                    title: ch.title || `Chapter ${idx + 1}`,
                    t: ch.title || `Chapter ${idx + 1}`,
                    startTime: sSec,
                    endTime: eSec,
                    start: ch.startTime,
                    end: ch.endTime || formatSecondsToTime(eSec),
                    min: durMins,
                    duration: formatSecondsToTime(durSec, false),
                    description: ch.description || '',
                    short: ch.description || '',
                    points: Array.isArray(ch.points) ? ch.points : [],
                    learn: Array.isArray(ch.points) ? ch.points : [],
                    section: 'Course Content',
                    youtube: primaryYtId || null,
                    youtubeUrl: validYtUrl,
                    youtubeVideoId: primaryYtId || null,
                    file: courseVideoSourceType === 'direct' && courseVideoUrl ? courseVideoUrl : null,
                    videoUrl: courseVideoSourceType === 'direct' && courseVideoUrl ? courseVideoUrl : null,
                    thumbnail: primaryThumb,
                    thumbnailUrl: primaryThumb,
                    notesName: ch.notesName || ch.noteName || null,
                    notesUrl: ch.notesUrl || ch.noteUrl || null,
                    noteName: ch.notesName || ch.noteName || null,
                    noteUrl: ch.notesUrl || ch.noteUrl || null,
                    notesSize: ch.notesSize || ch.size || null,
                    notesExt: ch.notesExt || ch.ext || null,
                    isPreview: !!courseIsPreview,
                    isFreePreview: !!courseIsPreview,
                };
            });

            // 2. Keep course-level resources separate from chapter notes
            let allResources = Array.isArray(initialCourse.resources)
                ? initialCourse.resources.filter((r) => {
                    const isChapterResource = typeof r === 'object' && (r?.type === 'chapter_note' || r?.chapterTitle?.startsWith('Chapter '));
                    return !isChapterResource;
                })
                : [];
            if (courseNotesUrl) {
                const existingIdx = allResources.findIndex((r) => (typeof r === 'object' ? r.url === courseNotesUrl || r.file === courseNotesUrl : r === courseNotesUrl));
                const courseNoteObj = {
                    name: courseNotesName || `${courseName} Notes.pdf`,
                    title: courseNotesName || `${courseName} Notes.pdf`,
                    chapterTitle: 'Course Resource',
                    url: courseNotesUrl,
                    file: courseNotesUrl,
                    ext: 'PDF',
                    type: 'note',
                };
                if (existingIdx >= 0) {
                    allResources[existingIdx] = courseNoteObj;
                } else {
                    allResources.unshift(courseNoteObj);
                }
            }

            // 3. Assessment Settings & Questions
            const assessmentSettingsObj = {
                enabled: assessmentEnabled,
                passingScore: Number(passingScore) || 70,
            };

            // Strict slug formatting for backend CreateCourseDto regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
            const rawSlug = (initialCourse.slug || courseName)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            const generatedSlug = (rawSlug.length >= 2 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(rawSlug))
                ? rawSlug
                : `course-${Date.now()}`;

            // Ensure shortDescription is at least 5 characters to pass CreateCourseDto @MinLength(5)
            let cleanShortDesc = (shortDescription || description || courseName).trim();
            if (cleanShortDesc.length < 5) {
                cleanShortDesc = `${cleanShortDesc} - Comprehensive Course`;
            }

            // 4. Optional Embedded Course-Bound Playlist Payload (created/updated in same backend transaction)
            const shouldPersistPlaylist =
                playlistEnabled && (playlistVideos.length > 0 || Boolean(linkedPlaylistId));
            const playlistPayload = shouldPersistPlaylist
                ? {
                    id: linkedPlaylistId || undefined,
                    enabled: true,
                    title: (playlistTitle || `${courseName.trim()} - Video Playlist`).trim(),
                    description: (playlistDescription || cleanShortDesc).trim(),
                    isTrending: !!playlistTrending,
                    thumbnailUrl: primaryThumb || playlistVideos[0]?.thumbnailUrl || null,
                    videos: playlistVideos.map((v, vIdx) => ({
                        title: v.title.trim(),
                        youtubeUrl: (v.youtubeUrl || v.videoUrl || '').trim(),
                        videoUrl: (v.videoUrl || '').trim(),
                        thumbnailUrl: v.thumbnailUrl || '',
                        duration: (v.duration || '').trim(),
                        description: (v.description || '').trim(),
                        notesUrl: v.notesUrl || undefined,
                        notesName: v.notesName || undefined,
                        notesSize: v.notesSize || undefined,
                        notesExt: v.notesExt || undefined,
                        assessments: Array.isArray(v.assessments) && v.assessments.length > 0 ? v.assessments : undefined,
                        displayOrder: vIdx,
                    })),
                }
                : undefined;

            const payload = {
                courseName: courseName.trim(),
                slug: generatedSlug,
                category: category || 'entrepreneurship',
                level: level || 'Beginner',
                shortDescription: cleanShortDesc,
                description: (description || cleanShortDesc).trim(),
                status: status || 'Active',
                trending: !!trending,
                price: isFree ? 0 : (Number(price) || 0),
                isFree: !!isFree,
                validityDays: Number(validityDays) || 365,
                strictNonSkippable: Boolean(strictNonSkippable),
                requireProjectForCertificate: Boolean(requireProjectForCertificate),
                gradient: gradient || 'from-[#1E3A8A] via-[#0F172A] to-slate-50',
                thumbnailUrl: primaryThumb,
                image: primaryThumb,
                duration: courseDuration || '00:00:00',
                youtubeUrl: validYtUrl,
                youtubeVideoId: primaryYtId || null,
                videoUrl: courseVideoSourceType === 'direct' && courseVideoUrl ? courseVideoUrl : null,
                sections: [
                    {
                        id: 'sec-1',
                        title: 'Course Content',
                        description: 'Course chapters and learning curriculum',
                        displayOrder: 1,
                    },
                ],
                lessons: formattedLessons,
                learn: learnList,
                requirements: reqList,
                resources: allResources,
                assessments: questions,
                assessmentSettings: assessmentSettingsObj,
                ...(playlistPayload ? { playlist: playlistPayload } : {}),
            };

            const identifier = initialCourse.id || initialCourse.slug || initialCourse._id;
            let savedResult = null;
            if (!isNew && identifier && api?.updateCourse) {
                savedResult = await api.updateCourse(identifier, payload);
            } else if (api?.createCourse) {
                savedResult = await api.createCourse(payload);
            }

            if (savedResult?.linkedPlaylist?.id) {
                setLinkedPlaylistId(savedResult.linkedPlaylist.id);
                if (Array.isArray(savedResult.linkedPlaylist.videos)) {
                    setPlaylistVideos((prev) =>
                        savedResult.linkedPlaylist.videos.map((sv, idx) => ({
                            ...sv,
                            videoUrl: sv.youtubeVideoId ? '' : sv.youtubeUrl,
                            assessments: Array.isArray(sv.assessments) ? sv.assessments : (prev[idx]?.assessments || []),
                            draftTasks: prev[idx]?.draftTasks || [],
                        }))
                    );
                }
            }

            const effectiveSlug = savedResult?.slug || identifier || generatedSlug;
            if (effectiveSlug && api?.saveCourseAssessment && questions.length > 0) {
                await api.saveCourseAssessment(effectiveSlug, questions, assessmentSettingsObj);
            }

            // Persist any queued draft tasks for course video OR playlist lessons
            const savedPlaylistObj = savedResult?.linkedPlaylist || null;
            if (effectiveSlug && api?.createAdminTask) {
                if (isNew && draftTasks.length > 0) {
                    const targetVidId = savedResult?.videos?.[0]?.id || courseYoutubeVideoId || `${effectiveSlug}-v1`;
                    for (const dt of draftTasks) {
                        try {
                            await api.createAdminTask({
                                title: dt.title,
                                description: dt.description || '',
                                instructions: dt.instructions || '',
                                dueDate: dt.dueDate ? new Date(dt.dueDate).toISOString() : null,
                                videoId: dt.videoId || targetVidId,
                                videoTitle: dt.videoTitle || courseVideoTitle || courseName.trim(),
                                courseSlug: effectiveSlug,
                                courseId: savedResult?.id || savedResult?._id,
                                attachmentUrl: dt.attachmentUrl || null,
                                attachmentName: dt.attachmentName || null,
                                attachmentSize: dt.attachmentSize || null,
                                attachmentExt: dt.attachmentExt || null,
                                assignToType: 'all',
                            });
                        } catch (taskErr) {
                            console.warn('Failed to auto-create queued task for course in SinglePageEditCourse:', taskErr);
                        }
                    }
                    setDraftTasks([]);
                }

                // Persist draft tasks queued on embedded playlist video lessons
                const savedPlVideos = Array.isArray(savedPlaylistObj?.videos) ? savedPlaylistObj.videos : [];
                for (let pvIdx = 0; pvIdx < playlistVideos.length; pvIdx++) {
                    const localPv = playlistVideos[pvIdx];
                    const queued = Array.isArray(localPv?.draftTasks) ? localPv.draftTasks : [];
                    if (!queued.length) continue;
                    const persistedVid = savedPlVideos[pvIdx];
                    const targetVidId = persistedVid?.id || localPv.youtubeVideoId || localPv.id;
                    for (const dt of queued) {
                        try {
                            await api.createAdminTask({
                                title: dt.title,
                                description: dt.description || '',
                                instructions: dt.instructions || '',
                                dueDate: dt.dueDate ? new Date(dt.dueDate).toISOString() : null,
                                videoId: targetVidId,
                                videoTitle: localPv.title,
                                courseSlug: effectiveSlug,
                                courseId: savedResult?.id || savedResult?._id,
                                playlistId: savedPlaylistObj?.id || linkedPlaylistId || undefined,
                                attachmentUrl: dt.attachmentUrl || null,
                                attachmentName: dt.attachmentName || null,
                                attachmentSize: dt.attachmentSize || null,
                                attachmentExt: dt.attachmentExt || null,
                                assignToType: 'all',
                            });
                        } catch (plTaskErr) {
                            console.warn('Failed to auto-create playlist lesson task:', plTaskErr);
                        }
                    }
                }
                setPlaylistVideos((prev) => prev.map((v) => ({ ...v, draftTasks: [] })));
            }

            // Update localStorage backup for instant offline sync
            try {
                if (effectiveSlug) {
                    localStorage.setItem(`course_assessments_${effectiveSlug}`, JSON.stringify(questions));
                }
                const stored = JSON.parse(localStorage.getItem('admin_courses') || '[]');
                const mIdx = stored.findIndex((c) => c.slug === effectiveSlug || c.id === identifier || c._id === identifier);
                if (mIdx !== -1) {
                    stored[mIdx] = { ...stored[mIdx], ...payload, ...(savedResult || {}) };
                    localStorage.setItem('admin_courses', JSON.stringify(stored));
                } else if (savedResult) {
                    stored.unshift(savedResult);
                    localStorage.setItem('admin_courses', JSON.stringify(stored));
                }
            } catch { }

            const updatedCourseObj = {
                ...initialCourse,
                ...(savedResult || {}),
                ...payload,
                title: { en: courseName.trim(), mr: initialCourse.title?.mr || courseName.trim() },
                short: { en: cleanShortDesc, mr: initialCourse.short?.mr || cleanShortDesc },
                level: { en: level, mr: initialCourse.level?.mr || level },
            };

            if (onSave) {
                onSave(updatedCourseObj, { keepOpen: true });
            }

            // Show success notification ONLY after API/database save succeeds
            setToastNotice({
                type: 'success',
                message: t('admin.courseEditor.allChangesSaved', 'All changes saved successfully.'),
            });
            setTimeout(() => setToastNotice(null), 4500);
        } catch (err) {
            console.error('Failed to save course changes:', err);
            const errorMsg =
                err?.message ||
                (Array.isArray(err?.data?.message) ? err.data.message[0] : err?.data?.message) ||
                t('admin.courseEditor.saveFailed', 'Failed to save changes. Please try again.');
            setToastNotice({
                type: 'error',
                message: errorMsg,
            });
            setTimeout(() => setToastNotice(null), 6000);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 pb-20 relative">
            {/* Toast Notification */}
            {toastNotice && (
                <div
                    className={`fixed top-20 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-xs font-bold transition-all duration-300 animate-in fade-in slide-in-from-top-4 border ${toastNotice.type === 'error'
                        ? 'bg-red-600 border-red-700 text-white shadow-red-600/30'
                        : 'bg-emerald-700 border-emerald-800 text-[#0F172A] shadow-emerald-700/30'
                        }`}
                >
                    <Icon name={toastNotice.type === 'error' ? 'error' : 'check_circle'} className="text-lg shrink-0" />
                    <span className="text-sm font-bold tracking-wide">{toastNotice.message}</span>
                </div>
            )}

            {/* ── TOP STICKY HEADER & BREADCRUMB ── */}
            <div className="sticky top-16 z-30 bg-[#f4f7f2]/95 backdrop-blur-md pt-3 pb-3 border-b border-slate-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-[#0F172A] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                        >
                            <Icon name="arrow_back" className="text-sm" /> {t('admin.courseEditor.backToCourses', 'Back to Courses')}
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] leading-tight">
                                    {isNew ? (
                                        t('admin.courseEditor.newTitle', 'Add New Course')
                                    ) : (
                                        <>
                                            {t('admin.courseEditor.editTitle', 'Edit Course')}: <span className="text-[#0F172A]">{courseName || (lang === 'mr' ? 'नाव नसलेला अभ्यासक्रम' : 'Untitled Course')}</span>
                                        </>
                                    )}
                                </h1>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                    {status}
                                </span>
                                {trending && (
                                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-0.5 shadow-2xs">
                                        ⭐ {lang === 'mr' ? 'ट्रेंडिंग' : 'Trending'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleSaveCourse}
                            disabled={saving}
                            className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <Icon name={saving ? 'sync' : (isNew ? 'add_circle' : 'save')} className={saving ? 'animate-spin text-sm' : 'text-sm'} />
                            {saving
                                ? (isNew ? (lang === 'mr' ? 'तयार होत आहे...' : 'Creating Course...') : t('admin.courseEditor.savingChanges', 'Saving Changes...'))
                                : (isNew ? (lang === 'mr' ? 'अभ्यासक्रम तयार करा' : 'Create Course') : t('admin.courseEditor.saveAllChanges', 'Save All Changes'))}
                        </button>
                    </div>
                </div>

                {/* Quick Jump Navigation */}
                <div className="flex items-center gap-1.5 sm:gap-2 mt-3 pt-2 border-t border-slate-200 overflow-x-auto pb-0.5">
                    <button
                        type="button"
                        onClick={() => document.getElementById('section-basic')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition cursor-pointer shrink-0 bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-100 shadow-2xs"
                    >
                        <Icon name="info" className="text-base" />
                        <span>1. Course Details</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => document.getElementById('section-videos')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition cursor-pointer shrink-0 bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-100 shadow-2xs"
                    >
                        <Icon name="description" className="text-base" />
                        <span>2. Course Material</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => document.getElementById('section-playlist')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition cursor-pointer shrink-0 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 shadow-2xs"
                    >
                        <Icon name="playlist_play" className="text-base text-[#2563EB]" />
                        <span>3. Playlist &amp; Video Lessons</span>
                        {playlistVideos.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#2563EB] text-white font-black">
                                {playlistVideos.length}
                            </span>
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={() => document.getElementById('section-assessment')?.scrollIntoView({ behavior: 'smooth' })}
                        className="px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition cursor-pointer shrink-0 bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-100 shadow-2xs"
                    >
                        <Icon name="quiz" className="text-base" />
                        <span>4. Assessments</span>
                        {questions.length > 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-50 text-[#0F172A] font-bold">
                                {questions.length}
                            </span>
                        )}
                    </button>

                    {!isNew && (
                        <button
                            type="button"
                            onClick={() => {
                                const el = document.getElementById('section-playlists');
                                if (el) {
                                    el.scrollIntoView({ behavior: 'smooth' });
                                } else {
                                    setActiveTab(activeTab === 'playlists' ? 'all' : 'playlists');
                                }
                            }}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1.5 transition cursor-pointer shrink-0 ml-auto ${activeTab === 'playlists'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs'
                                : 'bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-100'
                                }`}
                        >
                            <Icon name="video_library" className="text-base" />
                            <span>{activeTab === 'playlists' ? 'Hide Extra Playlists' : 'Manage All Course Playlists'}</span>
                        </button>
                    )}
                </div>
            </div>

            {toastNotice && (
                <div className={`p-4 rounded-2xl border text-sm font-bold flex items-center gap-2.5 shadow-xs animate-in fade-in ${toastNotice.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    }`}>
                    <Icon name={toastNotice.type === 'error' ? 'error' : 'check_circle'} className={`text-lg ${toastNotice.type === 'error' ? 'text-red-600' : 'text-emerald-600'}`} />
                    {toastNotice.message}
                </div>
            )}

            {/* =================================================================== */}
            {/* SECTION 1: BASIC DETAILS                                            */}
            {/* =================================================================== */}
            <section id="section-basic" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-card space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl bg-slate-50 text-[#0F172A] flex items-center justify-center font-black">
                            1
                        </span>
                        <div>
                            <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A]">
                                {t('admin.courseEditor.section1Title', 'Basic Details')}
                            </h2>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-[#475569]">
                        {lang === 'mr' ? 'विभाग १ / ३' : 'Section 1 of 3'}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Course Name */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-[#475569] mb-1.5">
                            {t('admin.courseEditor.courseTitle', 'Course Name')} <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            placeholder={t('admin.courseEditor.courseTitlePlaceholder', 'Enter descriptive course title...')}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[#0F172A] text-sm font-semibold focus:outline-none focus:border-blue-200 focus:ring-1 focus:ring-[#2563EB] transition"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-[#475569] mb-1.5">
                            {t('admin.courseEditor.category', 'Category')}
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[#0F172A] text-sm font-semibold focus:outline-none focus:border-blue-200 transition"
                        >
                            {CATEGORIES.map((c) => (
                                <option key={c.key} value={c.key}>{lang === 'mr' ? (c.mr || c.en) : c.en}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Level */}
                    <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-[#475569] mb-1.5">
                            {t('admin.courseEditor.level', 'Difficulty Level')}
                        </label>
                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[#0F172A] text-sm font-semibold focus:outline-none focus:border-blue-200 transition"
                        >
                            <option value="Beginner">{t('admin.courseEditor.levelBeginner', 'Beginner')}</option>
                            <option value="Intermediate">{t('admin.courseEditor.levelIntermediate', 'Intermediate')}</option>
                            <option value="Advanced">{t('admin.courseEditor.levelAdvanced', 'Advanced')}</option>
                            <option value="All levels">{lang === 'mr' ? 'सर्व पातळ्यांसाठी' : 'All levels'}</option>
                        </select>
                    </div>
                </div>

                {/* Descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-[#475569] mb-1.5">
                            {lang === 'mr' ? 'संक्षिप्त वर्णन (कार्ड सारांश)' : 'Short Description (Card Summary)'}
                        </label>
                        <textarea
                            rows={3}
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                            placeholder={lang === 'mr' ? 'अभ्यासक्रम कार्डावर दिसणारा संक्षिप्त सारांश...' : 'Brief summary visible on course cards...'}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-[#0F172A] text-sm font-medium focus:outline-none focus:border-blue-200 transition resize-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-[#475569] mb-1.5">
                            {t('admin.courseEditor.description', 'Full Description (Course Overview)')}
                        </label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder={t('admin.courseEditor.descriptionPlaceholder', 'Detailed syllabus overview shown on course landing page...')}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-white text-[#0F172A] text-sm font-medium focus:outline-none focus:border-blue-200 transition resize-none"
                        />
                    </div>
                </div>

                {/* Pricing & Free Toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-6 sm:gap-10">
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsFree(!isFree)}
                            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${isFree ? 'bg-[#2563EB]' : 'bg-gray-300'}`}
                        >
                            <span className={`block w-5 h-5 rounded-full bg-white shadow-md transition-transform transform ${isFree ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <span className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                            {isFree ? (lang === 'mr' ? '१००% मोफत अभ्यासक्रम' : '100% Free Course') : (lang === 'mr' ? 'सशुल्क अभ्यासक्रम' : 'Paid Course')}
                        </span>
                    </div>

                    {!isFree && (
                        <div className="w-44 shrink-0">
                            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                                {t('admin.courseEditor.price', 'Course Price (INR ₹)')}
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value) || 0)}
                                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-sm font-bold"
                            />
                        </div>
                    )}
                </div>

                {/* Trending Course Toggle */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-10">
                    <div className="flex items-center gap-3 shrink-0">
                        <button
                            type="button"
                            onClick={() => setTrending(!trending)}
                            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${trending ? 'bg-amber-500' : 'bg-gray-300'}`}
                        >
                            <span className={`block w-5 h-5 rounded-full bg-white shadow-md transition-transform transform ${trending ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <span className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                            <span>⭐</span>
                            {trending
                                ? (lang === 'mr' ? 'ट्रेंडिंग अभ्यासक्रम' : 'Trending Course')
                                : (lang === 'mr' ? 'ट्रेंडिंगमध्ये जोडा' : 'Add to Trending Course')}
                        </span>
                    </div>

                    {trending && (
                        <span className="self-start sm:self-auto px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-extrabold uppercase flex items-center gap-1 shrink-0">
                            ⭐ {lang === 'mr' ? 'ट्रेंडिंग सक्रिय' : 'Trending Active'}
                        </span>
                    )}
                </div>

                {/* Strict Non-Skippable & Certificate Rules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`flex items-start justify-between gap-3 p-4 rounded-xl border transition-all cursor-pointer ${strictNonSkippable ? 'bg-blue-50/70 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div>
                            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-blue-600">lock_clock</span>
                                Strict Non-Skippable Videos (Enforce 100% Watch)
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                                Prevents forward seeking, caps speed at 1.5x, and unlocks lessons sequentially.
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={strictNonSkippable}
                            onChange={(e) => setStrictNonSkippable(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer shrink-0"
                        />
                    </label>

                    <label className={`flex items-start justify-between gap-3 p-4 rounded-xl border transition-all cursor-pointer ${requireProjectForCertificate ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                        <div>
                            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
                                Require Project Submission for Certificate
                            </div>
                            <p className="text-xs text-slate-600 mt-1">
                                Requires learners to submit and auto-verify their course project before earning a certificate.
                            </p>
                        </div>
                        <input
                            type="checkbox"
                            checked={requireProjectForCertificate}
                            onChange={(e) => setRequireProjectForCertificate(e.target.checked)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0"
                        />
                    </label>
                </div>

                {/* Course Thumbnail Image */}
                <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-[#475569] mb-2">
                        {t('admin.courseEditor.thumbnail', 'Course Banner / Thumbnail Image')}
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-32 h-20 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shrink-0">
                            {thumbnailUrl ? (
                                <img
                                    src={thumbnailUrl.startsWith('/uploads') ? assetUrl(thumbnailUrl) : thumbnailUrl}
                                    alt="Course Thumbnail"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[#475569]">
                                    <Icon name="image" className="text-2xl" />
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-[#0F172A] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs">
                                    <Icon name={uploadingCourseThumb ? 'sync' : 'upload'} className={uploadingCourseThumb ? 'animate-spin text-sm' : 'text-sm'} />
                                    {uploadingCourseThumb ? (lang === 'mr' ? 'अपलोड होत आहे...' : 'Uploading...') : t('admin.courseEditor.uploadImage', 'Upload Image (JPG, PNG)')}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleUploadCourseThumbnail}
                                        disabled={uploadingCourseThumb}
                                        className="hidden"
                                    />
                                </label>
                                {thumbnailUrl && (
                                    <button
                                        type="button"
                                        onClick={() => setThumbnailUrl('')}
                                        className="text-xs text-red-600 hover:underline font-bold"
                                    >
                                        {lang === 'mr' ? 'प्रतिमा काढा' : 'Clear Image'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Learning Outcomes & Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {/* What You'll Learn */}
                    <div className="space-y-3">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
                            {t('admin.courseEditor.outcomes', "What You'll Learn (Outcomes)")}
                        </label>
                        <div className="space-y-2">
                            {learnList.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium">
                                    <span className="flex items-center gap-1.5 text-[#0F172A]">
                                        <Icon name="check" className="text-emerald-600 text-sm" />
                                        {item}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveLearnItem(idx)}
                                        className="text-red-600 hover:text-red-700 p-1"
                                    >
                                        <Icon name="delete" className="text-sm" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newLearnInput}
                                onChange={(e) => setNewLearnInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLearnItem(); } }}
                                placeholder={t('admin.courseEditor.outcomesPlaceholder', 'Add a new outcome...')}
                                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                            />
                            <button
                                type="button"
                                onClick={handleAddLearnItem}
                                className="px-3 py-1.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] cursor-pointer"
                            >
                                {t('admin.common.add', 'Add')}
                            </button>
                        </div>
                    </div>

                    {/* Requirements / Prerequisites */}
                    <div className="space-y-3">
                        <label className="block text-xs font-extrabold uppercase tracking-wider text-[#0F172A]">
                            {t('admin.courseEditor.requirements', 'Requirements & Prerequisites')}
                        </label>
                        <div className="space-y-2">
                            {reqList.map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium">
                                    <span className="flex items-center gap-1.5 text-[#0F172A]">
                                        <Icon name="arrow_forward" className="text-amber-600 text-sm" />
                                        {item}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveReqItem(idx)}
                                        className="text-red-600 hover:text-red-700 p-1"
                                    >
                                        <Icon name="delete" className="text-sm" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newReqInput}
                                onChange={(e) => setNewReqInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddReqItem(); } }}
                                placeholder={t('admin.courseEditor.requirementsPlaceholder', 'Add a requirement...')}
                                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                            />
                            <button
                                type="button"
                                onClick={handleAddReqItem}
                                className="px-3 py-1.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] cursor-pointer"
                            >
                                {t('admin.common.add', 'Add')}
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* =================================================================== */}
            {/* SECTION: COURSE PLAYLISTS (OPTIONAL FOR EXISTING COURSES)           */}
            {/* =================================================================== */}
            {!isNew && activeTab === 'playlists' && (
                <div id="section-playlists" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-card">
                    <AdminPlaylistsPanel api={api} course={initialCourse} />
                </div>
            )}

            {/* =================================================================== */}
            {/* SECTION 2: MANAGE VIDEO & COURSE CONTENT                             */}
            {/* =================================================================== */}
            <section id="section-videos" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-card space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl bg-slate-50 text-[#0F172A] flex items-center justify-center font-black">
                            2
                        </span>
                        <div>
                            <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A]">Course Material & Video Chapters</h2>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-[#475569]">Course Material</span>
                </div>

                {/* ── CARD 1: CONFIGURE COURSE VIDEO & ADD YOUTUBE LINK ── */}
                <div id="section-configure-video" className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200">
                        <div>
                            <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                                <Icon name="smart_display" className="text-base text-[#0F172A]" />
                                Configure Course Video & YouTube Link
                            </h3>
                            <p className="text-[11px] text-[#475569] mt-0.5">
                                Add YouTube video link or Video ID. This video stream will be used for all chapters.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="self-start sm:self-auto px-3 py-1 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0F172A] shadow-2xs">
                                YouTube Stream Mode
                            </span>
                        </div>
                    </div>

                    {/* YouTube Video URL Input */}
                    <div className="space-y-1.5">
                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">
                            YouTube Video URL or Video ID <span className="text-red-600">*</span>
                        </label>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={courseYoutubeUrl}
                                onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                                placeholder="e.g. https://www.youtube.com/watch?v=... or ID"
                                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-white focus:outline-none focus:border-blue-200 focus:ring-1 focus:ring-[#2563EB] transition"
                            />
                            {courseYoutubeVideoId ? (
                                <span className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-extrabold shrink-0 flex items-center gap-1.5 shadow-2xs">
                                    <Icon name="check_circle" className="text-sm" /> ID: {courseYoutubeVideoId}
                                </span>
                            ) : (
                                <span className="px-3 py-2 rounded-xl bg-slate-100 text-[#475569] text-xs font-bold shrink-0 hidden sm:inline-flex">
                                    Paste link or ID
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Video Duration in Video Section */}
                    <div className="pt-3 border-t border-slate-200">
                        {/* Real Video Duration (Automatically Detected) */}
                        <div className="w-full sm:max-w-xs">
                            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1 flex items-center justify-between">
                                <span>Video Duration</span>
                                {detectingDuration ? (
                                    <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                                        <Icon name="sync" className="animate-spin text-xs" /> Detecting...
                                    </span>
                                ) : (
                                    <span className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-0.5">
                                        <Icon name="check_circle" className="text-[11px]" /> Auto-detected
                                    </span>
                                )}
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    readOnly
                                    value={courseDuration || '00:00:00'}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-extrabold bg-white text-[#0F172A] cursor-default"
                                    title="Duration is detected automatically from the video file or YouTube stream."
                                />
                                <Icon name="timer" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#475569] text-sm pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── CARD 2: MAIN COURSE VIDEO PREVIEW BAR ── */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-1.5">
                                Main Course Video Preview & Stream
                                <span className="w-4 h-4 rounded-full bg-blue-50 text-[#0F172A] flex items-center justify-center text-[10px] font-bold" title="Single video used for all chapters">
                                    i
                                </span>
                            </h3>
                        </div>
                    </div>

                    {/* Video Display Bar */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
                        {/* Thumbnail Box */}
                        <div className="flex items-center gap-3.5 min-w-0">
                            <div className="relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 flex items-center justify-center shadow-xs">
                                {courseVideoThumbUrl || thumbnailUrl || (courseYoutubeVideoId ? getYoutubeThumbnailUrl(courseYoutubeVideoId, 'hqdefault') : null) || initialCourse.image ? (
                                    <img
                                        src={courseVideoThumbUrl || thumbnailUrl || (courseYoutubeVideoId ? getYoutubeThumbnailUrl(courseYoutubeVideoId, 'hqdefault') : null) || initialCourse.image}
                                        alt="Course Video"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[#2563EB] bg-gradient-to-br from-[#1E3A8A] to-brand-deep">
                                        <Icon name="smart_display" className="text-2xl" />
                                    </div>
                                )}
                                {(courseYoutubeVideoId || courseVideoUrl) && (
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                        <div className="w-7 h-7 rounded-full bg-black/60 text-[#0F172A] flex items-center justify-center shadow-sm">
                                            <Icon name="play_arrow" className="text-sm" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Title & Duration details */}
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0">
                                        <Icon name="play_arrow" className="text-xs" />
                                    </div>
                                    <h4 className="text-xs sm:text-sm font-extrabold text-[#0F172A] truncate">
                                        {courseVideoTitle || (courseYoutubeUrl ? 'YouTube Course Video' : 'No Video Configured')}
                                    </h4>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-[#475569] mt-1">
                                    <span>Duration: <strong className="text-[#0F172A]">{courseDuration || '00:00:00'}</strong></span>
                                    <span>•</span>
                                    <span>{courseYoutubeVideoId ? 'YouTube Stream' : 'YouTube Mode'}</span>
                                </div>
                            </div>
                        </div>

                        {/* ── TASKS & QUESTION PAPERS FOR THIS VIDEO ── */}
                        <div id="section-tasks" className="pt-2">
                            <InlineVideoTasksSection
                                mode={isNew ? 'draft' : 'live'}
                                videoId={course?.videos?.[0]?.id || courseYoutubeVideoId || (course?.slug ? `${course.slug}-v1` : 'course-v1')}
                                videoTitle={courseVideoTitle || course?.title || 'Course Video Lesson'}
                                courseSlug={course?.slug || resolvedCourseSlug || ''}
                                draftTasks={draftTasks}
                                onChangeDraftTasks={setDraftTasks}
                                api={parentApi || adminApi(getToken())}
                            />
                        </div>

                        {/* Action Buttons: Preview, Delete */}
                        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                            {(courseYoutubeVideoId || courseVideoUrl) && (
                                <button
                                    type="button"
                                    onClick={() => setPreviewPlayerOpen(true)}
                                    className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-[#0F172A] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
                                >
                                    <Icon name="play_circle" className="text-sm text-emerald-600" />
                                    <span>Preview</span>
                                </button>
                            )}

                            {(courseYoutubeVideoId || courseVideoUrl || courseYoutubeUrl) && (
                                <button
                                    type="button"
                                    onClick={handleClearCourseVideo}
                                    className="p-2 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-500/25 hover:text-rose-700 transition cursor-pointer"
                                    title="Clear Course Video"
                                >
                                    <Icon name="delete" className="text-sm" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── CARD: COURSE-WIDE STUDY MATERIALS & NOTES ── */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-1.5">
                                <Icon name="description" className="text-emerald-700 text-lg" />
                                Course Study Materials & Notes (PDF, DOC, DOCX, XLS, PPT)
                            </h3>
                        </div>
                        <div>
                            <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-500/25 text-emerald-700 border border-emerald-200 font-bold text-xs cursor-pointer transition shadow-2xs">
                                <Icon name={uploadingNotes ? "sync" : "upload_file"} className={uploadingNotes ? "animate-spin text-sm" : "text-sm"} />
                                <span>{uploadingNotes ? `Uploading (${notesUploadProgress}%)...` : 'Upload Course Material'}</span>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                    onChange={handleUploadCourseVideoNotes}
                                    disabled={uploadingNotes}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {courseNotesUrl ? (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                                    <Icon name="description" className="text-xl" />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-xs font-extrabold text-[#0F172A] truncate">
                                        {courseNotesName || 'Course Study Notes'}
                                    </div>
                                    <div className="text-[11px] text-emerald-800/80 font-medium">
                                        Attached to course resources · Accessible to students
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <a
                                    href={assetUrl(courseNotesUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-1 rounded-lg border border-slate-200 bg-white text-xs font-bold text-[#0F172A] hover:bg-slate-100 transition"
                                >
                                    View
                                </a>
                                <button
                                    type="button"
                                    onClick={handleRemoveCourseNotes}
                                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/25 hover:text-rose-700 transition cursor-pointer"
                                    title="Remove Course Material"
                                >
                                    <Icon name="delete" className="text-sm" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                            <p className="text-xs text-[#475569]">
                                No course-wide study material attached yet. You can attach a master note above or add chapter-specific notes in the table below.
                            </p>
                        </div>
                    )}
                </div>

                {/* ── CARD 2: COURSE CHAPTERS TABLE ── */}
                <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                                <Icon name="segment" className="text-[#0F172A] text-lg" /> Course Chapters
                            </h3>
                        </div>

                        <button
                            type="button"
                            onClick={() => handleAddChapter()}
                            className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-extrabold hover:bg-[#1D4ED8] transition flex items-center gap-1.5 cursor-pointer shadow-sm self-start sm:self-auto"
                        >
                            <Icon name="add" className="text-sm font-bold" />
                            <span>Add Chapter</span>
                        </button>
                    </div>

                    {/* Duration Warning Banner if any chapters exceed video duration */}
                    {durationWarning && (
                        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold flex items-center gap-2">
                            <Icon name="warning" className="text-amber-600 text-lg shrink-0" />
                            <span>{durationWarning}</span>
                        </div>
                    )}

                    {/* Chapters Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[700px]">
                            <thead>
                                <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">
                                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                                    <th className="py-2.5 px-3 w-56">Chapter Title</th>
                                    <th className="py-2.5 px-3 w-36">Start Time</th>
                                    <th className="py-2.5 px-3">Description (Optional)</th>
                                    <th className="py-2.5 px-3 w-52">Notes</th>
                                    <th className="py-2.5 px-3 w-28 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {chapters.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-xs text-[#475569]">
                                            No chapters added yet. Click "+ Add Chapter" to create your first chapter.
                                        </td>
                                    </tr>
                                ) : (
                                    chapters.map((ch, idx) => {
                                        const isInvalid = invalidChapterIds.includes(ch.id);
                                        return (
                                            <tr key={ch.id} className={`hover:bg-white transition-colors ${isInvalid ? 'bg-red-50/50' : ''}`}>
                                                {/* # Number */}
                                                <td className="py-3 px-3 text-center align-middle">
                                                    <span className={`w-7 h-7 rounded-full font-extrabold text-xs inline-flex items-center justify-center ${isInvalid ? 'bg-red-200 text-red-700' : 'bg-slate-50 text-[#0F172A]'
                                                        }`}>
                                                        {idx + 1}
                                                    </span>
                                                </td>

                                                {/* Chapter Title Input */}
                                                <td className="py-3 px-3 align-middle">
                                                    <input
                                                        type="text"
                                                        value={ch.title || ''}
                                                        onChange={(e) => handleUpdateChapterField(ch.id, 'title', e.target.value)}
                                                        placeholder="Chapter title..."
                                                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#0F172A] focus:ring-1 focus:ring-[#2563EB]"
                                                    />
                                                </td>

                                                {/* Start Time Input with Clock Icon & Dynamic Validation */}
                                                <td className="py-3 px-3 align-top">
                                                    <div className="relative">
                                                        <input
                                                            type="text"
                                                            value={ch.startTime || ''}
                                                            onChange={(e) => handleUpdateChapterField(ch.id, 'startTime', e.target.value)}
                                                            placeholder="00:00:00"
                                                            className={`w-full px-3 py-1.5 pr-8 rounded-xl border text-xs font-mono font-bold focus:ring-1 text-center ${isInvalid
                                                                ? 'border-red-500 bg-red-50 text-red-700 focus:ring-red-500'
                                                                : 'border-slate-200 bg-white text-[#0F172A] focus:ring-[#2563EB]'
                                                                }`}
                                                        />
                                                        <Icon name="schedule" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#475569] text-sm pointer-events-none" />
                                                    </div>
                                                    {isInvalid && (
                                                        <p className="text-[10px] text-red-600 font-bold mt-1 text-left leading-tight">
                                                            Chapter time cannot exceed video duration ({courseDuration}).
                                                        </p>
                                                    )}
                                                </td>

                                                {/* Description Input */}
                                                <td className="py-3 px-3 align-middle">
                                                    <input
                                                        type="text"
                                                        value={ch.description || ''}
                                                        onChange={(e) => handleUpdateChapterField(ch.id, 'description', e.target.value)}
                                                        placeholder="What is this chapter about..."
                                                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-[#0F172A] focus:ring-1 focus:ring-[#2563EB]"
                                                    />
                                                </td>

                                                {/* Chapter Notes (Upload, Replace, Remove) */}
                                                <td className="py-3 px-3 align-middle">
                                                    {ch.notesUrl || ch.notesName ? (
                                                        <div className="flex flex-col gap-1 p-2 rounded-xl bg-purple-50/80 border border-purple-200/80 max-w-[200px]">
                                                            <div className="flex items-center gap-1.5 min-w-0" title={ch.notesName || 'Chapter Note'}>
                                                                <Icon name="description" className="text-indigo-700 text-xs shrink-0" />
                                                                <span className="text-xs font-bold text-purple-900 truncate">
                                                                    {ch.notesName || 'Note.pdf'}
                                                                </span>
                                                            </div>
                                                            {ch.notesSize && (
                                                                <span className="text-[10px] text-purple-600 font-medium">
                                                                    {ch.notesSize} {ch.notesExt ? `• ${ch.notesExt}` : ''}
                                                                </span>
                                                            )}
                                                            <div className="flex items-center gap-2.5 text-[11px] font-bold pt-0.5">
                                                                <label className="text-indigo-700 hover:text-purple-900 hover:underline cursor-pointer">
                                                                    Replace
                                                                    <input
                                                                        type="file"
                                                                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                                                        onChange={(e) => {
                                                                            const f = e.target.files?.[0];
                                                                            if (f) handleUploadChapterNote(ch.id, f);
                                                                            e.target.value = '';
                                                                        }}
                                                                        disabled={uploadingChapterNotes[ch.id]}
                                                                        className="hidden"
                                                                    />
                                                                </label>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveChapterNote(ch.id)}
                                                                    className="text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[11px] text-[#475569] font-medium">No notes uploaded</span>
                                                            <label className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-500/25 border border-emerald-300/80 px-2.5 py-1 rounded-lg cursor-pointer transition w-fit shadow-2xs">
                                                                <Icon name={uploadingChapterNotes[ch.id] ? "sync" : "add"} className={uploadingChapterNotes[ch.id] ? "animate-spin text-xs text-emerald-700" : "text-xs text-emerald-700"} />
                                                                <span>{uploadingChapterNotes[ch.id] ? `Uploading (${chapterNotesProgress[ch.id] || 0}%)...` : 'Upload Notes'}</span>
                                                                <input
                                                                    type="file"
                                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                                                    onChange={(e) => {
                                                                        const f = e.target.files?.[0];
                                                                        if (f) handleUploadChapterNote(ch.id, f);
                                                                        e.target.value = '';
                                                                    }}
                                                                    disabled={uploadingChapterNotes[ch.id]}
                                                                    className="hidden"
                                                                />
                                                            </label>
                                                        </div>
                                                    )}
                                                </td>

                                                {/* Actions: Up, Down, Edit Details, Delete */}
                                                <td className="py-3 px-3 text-right align-middle">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button
                                                            type="button"
                                                            disabled={idx === 0}
                                                            onClick={() => handleMoveChapter(idx, -1)}
                                                            className="p-1 rounded text-[#475569] hover:text-[#0F172A] disabled:opacity-20 cursor-pointer"
                                                            title="Move Chapter Up"
                                                        >
                                                            <Icon name="arrow_upward" className="text-sm" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={idx === chapters.length - 1}
                                                            onClick={() => handleMoveChapter(idx, 1)}
                                                            className="p-1 rounded text-[#475569] hover:text-[#0F172A] disabled:opacity-20 cursor-pointer"
                                                            title="Move Chapter Down"
                                                        >
                                                            <Icon name="arrow_downward" className="text-sm" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenEditChapterModal(ch)}
                                                            className="p-1 rounded text-[#475569] hover:text-[#0F172A] cursor-pointer"
                                                            title="Edit Chapter Details & Learning Points"
                                                        >
                                                            <Icon name="edit" className="text-sm" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteChapter(ch.id)}
                                                            className="p-1 rounded text-rose-500 hover:text-rose-700 cursor-pointer"
                                                            title="Delete Chapter"
                                                        >
                                                            <Icon name="delete" className="text-sm" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom Tip Banner matching Screenshot */}
                    <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-medium text-emerald-700">
                            <span className="text-base">💡</span>
                            <span>
                                <strong>Tip:</strong> You can also play the video, pause at the desired time and click 'Add Chapter at Current Time' to automatically set the timestamp.
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                if (!previewPlayerOpen) {
                                    setPreviewPlayerOpen(true);
                                } else {
                                    handleAddChapterAtCurrentTime();
                                }
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-[#0F172A] text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition cursor-pointer shrink-0"
                        >
                            <Icon name="schedule" className="text-sm text-[#0F172A]" />
                            <span>Add Chapter at Current Time</span>
                        </button>
                    </div>
                </div>

                {/* ── CHAPTER DETAIL EDIT MODAL ── */}
                {chapterModalOpen && modalChapterData && (
                    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                                <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                                    <Icon name="edit_note" className="text-lg text-emerald-600" />
                                    Edit Chapter Details
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setChapterModalOpen(false)}
                                    className="p-1.5 rounded-lg text-[#475569] hover:text-[#0F172A] cursor-pointer"
                                >
                                    <Icon name="close" className="text-base" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveChapterModal} className="space-y-4">
                                {/* Title */}
                                <div>
                                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                                        Chapter Title <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={modalChapterData.title}
                                        onChange={(e) => setModalChapterData((prev) => ({ ...prev, title: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                                        placeholder="e.g. Introduction to Python"
                                        autoFocus
                                    />
                                </div>

                                {/* Start Time Only (End Time is Automatically Determined) */}
                                <div>
                                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1 flex items-center justify-between">
                                        <span>Start Time (HH:MM:SS)</span>
                                        <span className="text-[10px] text-[#475569] font-normal lowercase">end time is automatic</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={modalChapterData.startTime}
                                        onChange={(e) => setModalChapterData((prev) => ({ ...prev, startTime: e.target.value }))}
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono font-bold"
                                        placeholder="00:00:00"
                                    />
                                    {durationSec > 0 && parseTimeToSeconds(modalChapterData.startTime) > durationSec && (
                                        <p className="text-[10px] text-red-600 font-bold mt-1">
                                            Chapter time cannot exceed video duration ({courseDuration}).
                                        </p>
                                    )}
                                </div>

                                {/* Content description */}
                                <div>
                                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                                        What You'll Learn / Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={modalChapterData.description || ''}
                                        onChange={(e) => setModalChapterData((prev) => ({ ...prev, description: e.target.value }))}
                                        placeholder="Key concepts covered in this chapter..."
                                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                                    />
                                </div>

                                {/* Bullet Points */}
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">
                                        What You'll Learn (Bullet Points)
                                    </label>
                                    <div className="space-y-1.5">
                                        {(modalChapterData.points || []).map((pt, pIdx) => (
                                            <div key={pIdx} className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                                                <span className="flex items-center gap-1.5 text-[#0F172A]">
                                                    <span className="text-emerald-600 font-black">•</span> {pt}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePointFromModal(pIdx)}
                                                    className="text-red-600 hover:text-red-700 p-0.5 cursor-pointer"
                                                >
                                                    <Icon name="delete" className="text-xs" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={modalNewPoint}
                                            onChange={(e) => setModalNewPoint(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPointToModal(); } }}
                                            placeholder="Add bullet point (e.g. Basic syntax)..."
                                            className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddPointToModal}
                                            className="px-3 py-1.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] cursor-pointer"
                                        >
                                            + Add
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                                    <button
                                        type="button"
                                        onClick={() => setChapterModalOpen(false)}
                                        className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-bold cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold shadow-sm cursor-pointer"
                                    >
                                        Save Chapter
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* ── VIDEO PREVIEW PLAYER MODAL ── */}
                {previewPlayerOpen && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
                        <div className="bg-black border border-slate-200 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl flex flex-col">
                            <div className="p-4 bg-slate-100 flex items-center justify-between border-b border-slate-200 text-[#0F172A]">
                                <div className="flex items-center gap-2">
                                    <Icon name="smart_display" className="text-[#2563EB] text-xl" />
                                    <h3 className="text-sm font-extrabold truncate max-w-md">
                                        {courseVideoTitle || 'Course Video Player'}
                                    </h3>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleAddChapterAtCurrentTime}
                                        className="px-3 py-1 rounded-xl bg-blue-50 text-[#0F172A] font-extrabold text-xs flex items-center gap-1.5 hover:bg-slate-100 cursor-pointer transition"
                                    >
                                        <Icon name="add" className="text-xs" />
                                        <span>Add Chapter at Current Time ({formatSecondsToTime(previewCurrentTime || 0)})</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPreviewPlayerOpen(false)}
                                        className="p-1 rounded-lg text-[#475569] hover:text-[#0F172A] cursor-pointer"
                                    >
                                        <Icon name="close" className="text-base" />
                                    </button>
                                </div>
                            </div>

                            <div className="aspect-video bg-black flex items-center justify-center relative">
                                {courseYoutubeVideoId ? (
                                    <YouTubePlayer
                                        videoId={courseYoutubeVideoId}
                                        title={courseVideoTitle || 'Course Video Preview'}
                                        courseName={courseName}
                                        className="w-full h-full"
                                        onDurationChange={(d) => handleNewVideoDuration(d)}
                                        onTimeUpdate={(t) => setPreviewCurrentTime(t)}
                                        playerRef={previewYtRef}
                                    />
                                ) : courseVideoUrl ? (
                                    <video
                                        ref={previewVideoRef}
                                        src={assetUrl(courseVideoUrl)}
                                        controls
                                        className="w-full h-full object-contain"
                                        onLoadedMetadata={(e) => handleNewVideoDuration(e.currentTarget.duration)}
                                        onTimeUpdate={(e) => setPreviewCurrentTime(e.currentTarget.currentTime)}
                                    />
                                ) : (
                                    <div className="text-center text-[#0F172A] p-8">
                                        <Icon name="videocam_off" className="text-4xl text-[#475569] mb-2" />
                                        <p className="text-sm font-bold">No video configured yet.</p>
                                        <p className="text-xs text-[#475569] mt-1">Paste a YouTube link or upload an MP4 file in video settings.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </section>

            {/* =================================================================== */}
            {/* SECTION 3: COURSE PLAYLIST & VIDEO LESSONS                          */}
            {/* =================================================================== */}
            <section id="section-playlist" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-card space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-black">
                            3
                        </span>
                        <div>
                            <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A]">
                                Course Playlist &amp; Video Lessons
                            </h2>
                            <p className="text-xs text-[#475569] mt-0.5">
                                Build and reorder multi-video lessons linked directly to this course in one save action.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setPlaylistEnabled((v) => !v)}
                            className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${playlistEnabled ? 'bg-[#2563EB]' : 'bg-slate-300'}`}
                            aria-label="Toggle course playlist"
                        >
                            <span className={`block w-5 h-5 rounded-full bg-white shadow-md transition-transform transform ${playlistEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                        <span className="text-xs font-extrabold text-[#0F172A]">
                            {playlistEnabled ? 'Playlist Enabled (Linked to Course)' : 'Enable Multi-Video Playlist'}
                        </span>
                    </div>
                </div>

                {loadingLinkedPlaylist ? (
                    <div className="py-8 text-center text-xs font-bold text-[#475569] flex items-center justify-center gap-2">
                        <Icon name="sync" className="animate-spin text-base text-[#2563EB]" />
                        <span>Loading linked course playlist...</span>
                    </div>
                ) : (
                    <>
                        {playlistEnabled && (
                            <div className="p-4 sm:p-5 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        <Icon name="link" className="text-base text-[#2563EB]" />
                                        <span className="text-xs font-extrabold text-[#0F172A]">
                                            {linkedPlaylistId
                                                ? 'Linked to existing course playlist (updates in-place, no duplicates)'
                                                : 'Will create and link a course-bound playlist automatically when saving'}
                                        </span>
                                    </div>
                                    <label className="inline-flex items-center gap-2 text-xs font-bold text-[#0F172A] cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={playlistTrending}
                                            onChange={(e) => setPlaylistTrending(e.target.checked)}
                                            className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]"
                                        />
                                        <span>Feature Playlist in Trending ⭐</span>
                                    </label>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                                            Playlist Title
                                        </label>
                                        <input
                                            type="text"
                                            value={playlistTitle}
                                            onChange={(e) => setPlaylistTitle(e.target.value)}
                                            placeholder={courseName ? `${courseName} - Video Playlist` : 'e.g. Complete Module Series'}
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                                            Playlist Description
                                        </label>
                                        <input
                                            type="text"
                                            value={playlistDescription}
                                            onChange={(e) => setPlaylistDescription(e.target.value)}
                                            placeholder="Brief overview of this course playlist..."
                                            className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Add / Edit Playlist Video Lesson Box */}
                        <div className="p-5 rounded-2xl bg-white border-2 border-blue-200/80 shadow-xs space-y-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                                <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                                    <Icon name={editingPlVideoIndex !== null ? 'edit' : 'playlist_add'} className="text-lg text-[#2563EB]" />
                                    <span>
                                        {editingPlVideoIndex !== null
                                            ? `Editing Playlist Video #${editingPlVideoIndex + 1}`
                                            : 'Add Video Lesson to Course Playlist'}
                                    </span>
                                </h3>
                                {editingPlVideoIndex !== null && (
                                    <button
                                        type="button"
                                        onClick={resetPlVideoForm}
                                        className="text-xs font-bold text-[#475569] hover:text-[#0F172A] cursor-pointer"
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                                        Video Lesson Title <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={plVideoForm.title}
                                        onChange={(e) => setPlVideoForm((prev) => ({ ...prev, title: e.target.value }))}
                                        placeholder="e.g. Lesson 1: Getting Started with ERP Setup"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                                        Duration (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={plVideoForm.duration}
                                        onChange={(e) => setPlVideoForm((prev) => ({ ...prev, duration: e.target.value }))}
                                        placeholder="e.g. 12:45"
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm font-mono font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                                    />
                                </div>
                            </div>

                            {/* Video Source: YouTube OR Direct Video Upload */}
                            <div className="space-y-2.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">
                                        Video Source:
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setPlVideoForm((prev) => ({ ...prev, sourceType: 'youtube' }))}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${plVideoForm.sourceType === 'youtube'
                                            ? 'bg-blue-50 border-blue-200 text-[#2563EB]'
                                            : 'bg-white border-slate-200 text-[#475569]'
                                            }`}
                                    >
                                        YouTube URL / ID
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPlVideoForm((prev) => ({ ...prev, sourceType: 'upload' }))}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold border transition cursor-pointer ${plVideoForm.sourceType === 'upload'
                                            ? 'bg-blue-50 border-blue-200 text-[#2563EB]'
                                            : 'bg-white border-slate-200 text-[#475569]'
                                            }`}
                                    >
                                        Upload Video / Direct URL
                                    </button>
                                </div>

                                {plVideoForm.sourceType === 'youtube' ? (
                                    <div className="flex flex-col sm:flex-row gap-2">
                                        <input
                                            type="text"
                                            value={plVideoForm.youtubeUrl}
                                            onChange={(e) => setPlVideoForm((prev) => ({ ...prev, youtubeUrl: e.target.value }))}
                                            placeholder="https://www.youtube.com/watch?v=... or 11-char ID"
                                            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                                        />
                                        {extractYoutubeId(plVideoForm.youtubeUrl) && (
                                            <span className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold shrink-0">
                                                <Icon name="check_circle" className="text-sm" />
                                                YT: {extractYoutubeId(plVideoForm.youtubeUrl)}
                                            </span>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                                        <input
                                            type="text"
                                            value={plVideoForm.videoUrl || plVideoForm.youtubeUrl}
                                            onChange={(e) => setPlVideoForm((prev) => ({ ...prev, videoUrl: e.target.value, youtubeUrl: e.target.value }))}
                                            placeholder="/uploads/video.mp4 or direct MP4/WebM URL"
                                            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs sm:text-sm font-medium text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                                        />
                                        <label className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-[#0F172A] cursor-pointer shrink-0 transition">
                                            <Icon name={uploadingPlVideoFile ? 'sync' : 'upload'} className={uploadingPlVideoFile ? 'animate-spin text-sm' : 'text-sm'} />
                                            <span>{uploadingPlVideoFile ? `Uploading (${plVideoUploadProgress}%)` : 'Upload Video'}</span>
                                            <input
                                                type="file"
                                                accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.mkv"
                                                onChange={handleUploadPlaylistLessonVideo}
                                                disabled={uploadingPlVideoFile}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                                        Lesson Description (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={plVideoForm.description}
                                        onChange={(e) => setPlVideoForm((prev) => ({ ...prev, description: e.target.value }))}
                                        placeholder="What learners will master in this video lesson..."
                                        className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-medium text-[#0F172A]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                                        Lesson Study Material / Notes (Optional)
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-[#0F172A] cursor-pointer">
                                            <Icon name={uploadingPlVideoNote ? 'sync' : 'attach_file'} className={uploadingPlVideoNote ? 'animate-spin text-sm' : 'text-sm text-[#2563EB]'} />
                                            <span>{uploadingPlVideoNote ? 'Uploading...' : (plVideoForm.notesName ? plVideoForm.notesName : 'Attach Notes (PDF/DOC)')}</span>
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                                onChange={handleUploadPlaylistLessonNote}
                                                disabled={uploadingPlVideoNote}
                                                className="hidden"
                                            />
                                        </label>
                                        {plVideoForm.notesUrl && (
                                            <button
                                                type="button"
                                                onClick={() => setPlVideoForm((prev) => ({ ...prev, notesUrl: '', notesName: '', notesSize: '', notesExt: '' }))}
                                                className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                                            >
                                                Clear
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Optional Quick Quiz Question on Video Lesson */}
                            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-2.5">
                                <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
                                    <Icon name="quiz" className="text-sm text-[#2563EB]" />
                                    <span>Optional Lesson Quiz Question (Added to this video)</span>
                                </div>
                                <input
                                    type="text"
                                    value={plVideoForm.quizQuestion}
                                    onChange={(e) => setPlVideoForm((prev) => ({ ...prev, quizQuestion: e.target.value }))}
                                    placeholder="Optional check-your-understanding question for this video lesson..."
                                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-medium text-[#0F172A]"
                                />
                                {plVideoForm.quizQuestion.trim() && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {['A', 'B', 'C', 'D'].map((ltr, oIdx) => (
                                            <div key={ltr} className="flex items-center gap-1.5">
                                                <input
                                                    type="radio"
                                                    name="pl-vid-quiz-correct"
                                                    checked={Number(plVideoForm.quizCorrect) === oIdx}
                                                    onChange={() => setPlVideoForm((prev) => ({ ...prev, quizCorrect: oIdx }))}
                                                    className="text-[#2563EB] cursor-pointer"
                                                />
                                                <input
                                                    type="text"
                                                    value={plVideoForm.quizOptions[oIdx] || ''}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        setPlVideoForm((prev) => {
                                                            const nextOpts = [...(prev.quizOptions || ['', '', '', ''])];
                                                            nextOpts[oIdx] = val;
                                                            return { ...prev, quizOptions: nextOpts };
                                                        });
                                                    }}
                                                    placeholder={`Option ${ltr}`}
                                                    className="flex-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleSavePlaylistVideoItem}
                                    className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                                >
                                    <Icon name={editingPlVideoIndex !== null ? 'check' : 'add'} className="text-sm" />
                                    <span>{editingPlVideoIndex !== null ? 'Update Playlist Lesson' : 'Add Lesson to Course Playlist'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Ordered Playlist Video Lessons List */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                                    <Icon name="format_list_numbered" className="text-base text-[#2563EB]" />
                                    <span>Playlist Video Sequence ({playlistVideos.length})</span>
                                </h3>
                            </div>

                            {playlistVideos.length === 0 ? (
                                <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 bg-[#F8FAFC] text-center text-xs text-[#475569]">
                                    No playlist video lessons added yet. Use the form above to add lessons — they will save together with this course.
                                </div>
                            ) : (
                                <div className="space-y-2.5">
                                    {playlistVideos.map((pv, idx) => {
                                        const thumb = pv.thumbnailUrl || (pv.youtubeVideoId ? getYoutubeThumbnailUrl(pv.youtubeVideoId, 'hqdefault') : '');
                                        const taskExpanded = expandedPlVideoIdx === idx;
                                        return (
                                            <div key={pv.id || idx} className="rounded-2xl border border-slate-200 bg-[#F8FAFC] p-3.5 space-y-3">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <span className="w-7 h-7 rounded-full bg-blue-50 text-[#2563EB] border border-blue-200 text-xs font-black flex items-center justify-center shrink-0">
                                                            {idx + 1}
                                                        </span>
                                                        {thumb ? (
                                                            <img src={thumb} alt={pv.title} className="w-20 h-12 rounded-lg object-cover border border-slate-200 shrink-0" />
                                                        ) : (
                                                            <div className="w-20 h-12 rounded-lg bg-slate-200 flex items-center justify-center shrink-0">
                                                                <Icon name="smart_display" className="text-lg text-[#475569]" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <h4 className="text-xs sm:text-sm font-extrabold text-[#0F172A] truncate">
                                                                {pv.title}
                                                            </h4>
                                                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#475569] mt-0.5">
                                                                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-[#0F172A]">
                                                                    {pv.youtubeVideoId ? `YouTube: ${pv.youtubeVideoId}` : 'Uploaded Video'}
                                                                </span>
                                                                {pv.duration && <span className="font-mono">{pv.duration}</span>}
                                                                {pv.notesName && (
                                                                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold">
                                                                        Notes: {pv.notesName}
                                                                    </span>
                                                                )}
                                                                {Array.isArray(pv.assessments) && pv.assessments.length > 0 && (
                                                                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold">
                                                                        {pv.assessments.length} Quiz Q(s)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <button
                                                            type="button"
                                                            disabled={idx === 0}
                                                            onClick={() => handleMovePlaylistVideo(idx, -1)}
                                                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-[#475569] hover:text-[#0F172A] disabled:opacity-30 cursor-pointer"
                                                            title="Move Up"
                                                        >
                                                            <Icon name="arrow_upward" className="text-sm" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={idx === playlistVideos.length - 1}
                                                            onClick={() => handleMovePlaylistVideo(idx, 1)}
                                                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-[#475569] hover:text-[#0F172A] disabled:opacity-30 cursor-pointer"
                                                            title="Move Down"
                                                        >
                                                            <Icon name="arrow_downward" className="text-sm" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setExpandedPlVideoIdx(taskExpanded ? null : idx)}
                                                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-bold text-[#0F172A] hover:bg-slate-100 cursor-pointer flex items-center gap-1"
                                                            title="Manage video task / assignment"
                                                        >
                                                            <Icon name="assignment" className="text-sm text-emerald-700" />
                                                            <span>Task</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditPlaylistVideo(idx)}
                                                            className="p-1.5 rounded-lg bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-100 cursor-pointer"
                                                            title="Edit Lesson"
                                                        >
                                                            <Icon name="edit" className="text-sm" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemovePlaylistVideo(idx)}
                                                            className="p-1.5 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 cursor-pointer"
                                                            title="Remove Lesson"
                                                        >
                                                            <Icon name="delete" className="text-sm" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {taskExpanded && (
                                                    <div className="pt-2 border-t border-slate-200">
                                                        <InlineVideoTasksSection
                                                            mode={isNew || String(pv.id || '').startsWith('plv-') ? 'draft' : 'live'}
                                                            videoId={pv.id || pv.youtubeVideoId || `plv-${idx + 1}`}
                                                            videoTitle={pv.title}
                                                            courseSlug={resolvedCourseSlug || ''}
                                                            playlistId={linkedPlaylistId || undefined}
                                                            draftTasks={Array.isArray(pv.draftTasks) ? pv.draftTasks : []}
                                                            onChangeDraftTasks={(nextTasks) => {
                                                                setPlaylistVideos((prev) =>
                                                                    prev.map((item, i) =>
                                                                        i === idx
                                                                            ? {
                                                                                ...item,
                                                                                draftTasks: typeof nextTasks === 'function'
                                                                                    ? nextTasks(item.draftTasks || [])
                                                                                    : nextTasks,
                                                                            }
                                                                            : item
                                                                    )
                                                                );
                                                            }}
                                                            api={parentApi || adminApi(getToken())}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </section>

            {/* =================================================================== */}
            {/* SECTION 4: MANAGE ASSESSMENT                                         */}
            {/* =================================================================== */}
            <section id="section-assessment" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-soft-card space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl bg-slate-50 text-[#0F172A] flex items-center justify-center font-black">
                            4
                        </span>
                        <div>
                            <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A]">Manage Assessment & Quizzes</h2>
                        </div>
                    </div>
                    <span className="text-xs font-bold text-[#475569]">Section 4 of 4</span>
                </div>


                {/* ── PART B: QUESTION BUILDER FORM ── */}
                <form
                    id="question-builder-box"
                    onSubmit={handleSaveQuestion}
                    className="p-5 rounded-2xl bg-white border-2 border-blue-200 shadow-xs space-y-4"
                >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-1.5">
                            <Icon name={editingQuestionId ? 'edit' : 'quiz'} className="text-sky-700 text-lg" />
                            {editingQuestionId ? 'Edit Assessment Question' : 'Add New Assessment Question'}
                        </h3>
                        {editingQuestionId && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingQuestionId(null);
                                    setQPrompt('');
                                    setQOptions(['', '', '', '']);
                                }}
                                className="text-xs text-[#475569] hover:text-[#0F172A] font-bold"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    {qFormError && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold">
                            {qFormError}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Trigger Point */}
                        <div>
                            <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                                Trigger Point
                            </label>
                            <div className="flex items-center gap-3 pt-1">
                                <label className="flex items-center gap-1 text-xs font-bold cursor-pointer">
                                    <input
                                        type="radio"
                                        name="qTriggerRadio"
                                        checked={qTriggerType === 'end'}
                                        onChange={() => setQTriggerType('end')}
                                    />
                                    <span>At Video End</span>
                                </label>
                                <label className="flex items-center gap-1 text-xs font-bold cursor-pointer">
                                    <input
                                        type="radio"
                                        name="qTriggerRadio"
                                        checked={qTriggerType === 'timestamp'}
                                        onChange={() => setQTriggerType('timestamp')}
                                    />
                                    <span>Mid-Video</span>
                                </label>
                            </div>
                        </div>

                        {/* Timestamp input if mid-video */}
                        {qTriggerType === 'timestamp' && (
                            <div className="flex items-center gap-2">
                                <div>
                                    <label className="block text-[10px] text-[#475569]">Min</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={qTriggerMin}
                                        onChange={(e) => setQTriggerMin(Number(e.target.value) || 0)}
                                        className="w-16 px-2 py-1.5 rounded-lg border text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] text-[#475569]">Sec</label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="59"
                                        value={qTriggerSec}
                                        onChange={(e) => setQTriggerSec(Number(e.target.value) || 0)}
                                        className="w-16 px-2 py-1.5 rounded-lg border text-xs"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Question Text */}
                    <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                            Question Text <span className="text-red-600">*</span>
                        </label>
                        <textarea
                            rows={2}
                            value={qPrompt}
                            onChange={(e) => setQPrompt(e.target.value)}
                            placeholder="e.g. Which HTML element wraps all content on a standard web page?"
                            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium resize-none"
                        />
                    </div>

                    {/* Question Type */}
                    <div className="flex items-center gap-4 text-xs font-bold">
                        <span className="text-[#475569]">Type:</span>
                        <label className="flex items-center gap-1 cursor-pointer">
                            <input
                                type="radio"
                                name="qTypeRadio"
                                checked={qType === 'mcq'}
                                onChange={() => setQType('mcq')}
                            />
                            <span>Multiple Choice (4 options)</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                            <input
                                type="radio"
                                name="qTypeRadio"
                                checked={qType === 'tf'}
                                onChange={() => setQType('tf')}
                            />
                            <span>True / False</span>
                        </label>
                    </div>

                    {/* Options with Correct Answer Selector */}
                    <div className="space-y-2">
                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">
                            Answer Options & Mark the Correct Answer
                        </label>

                        {qType === 'tf' ? (
                            <div className="grid grid-cols-2 gap-3">
                                {['True', 'False'].map((tf, i) => (
                                    <label
                                        key={tf}
                                        className={`p-3 rounded-xl border flex items-center gap-2 cursor-pointer transition ${qCorrectIdx === i ? 'bg-emerald-50 border-emerald-500 text-emerald-700 font-bold' : 'bg-slate-50 border-slate-200 text-[#0F172A]'}`}
                                    >
                                        <input
                                            type="radio"
                                            name="tfCorrectRadio"
                                            checked={qCorrectIdx === i}
                                            onChange={() => setQCorrectIdx(i)}
                                        />
                                        <span>{tf}</span>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {qOptions.map((opt, i) => {
                                    const letter = String.fromCharCode(65 + i);
                                    return (
                                        <div
                                            key={i}
                                            className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${qCorrectIdx === i ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-white border-slate-200'}`}
                                        >
                                            <input
                                                type="radio"
                                                name="mcqCorrectRadio"
                                                checked={qCorrectIdx === i}
                                                onChange={() => setQCorrectIdx(i)}
                                                title="Mark as correct answer"
                                                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                                            />
                                            <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] font-black text-[#0F172A] shrink-0">
                                                {letter}
                                            </span>
                                            <input
                                                type="text"
                                                value={opt}
                                                onChange={(e) => {
                                                    const copy = [...qOptions];
                                                    copy[i] = e.target.value;
                                                    setQOptions(copy);
                                                }}
                                                placeholder={`Option ${letter}...`}
                                                className="w-full text-xs font-medium focus:outline-none bg-transparent"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Explanation / Hint */}
                    <div>
                        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                            Explanation / Feedback
                        </label>
                        <input
                            type="text"
                            value={qExplanation}
                            onChange={(e) => setQExplanation(e.target.value)}
                            placeholder="e.g. <html> is the top-level container that encloses the <head> and <body> elements."
                            className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-medium"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-xl bg-teal-800 text-[#0F172A] text-xs font-extrabold hover:bg-teal-900 transition shadow-sm cursor-pointer"
                        >
                            {editingQuestionId ? '✓ Update Question' : '+ Add Question to Assessment'}
                        </button>
                    </div>
                </form>

                {/* ── PART C: EXISTING QUESTIONS LIST ── */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-extrabold text-[#0F172A]">
                            Existing Questions ({questions.length})
                        </h3>
                        <span className="text-xs text-[#475569]">Passing threshold: {passingScore}%</span>
                    </div>

                    {/* Assessment inline update notification */}
                    {assessmentNotice && (
                        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 shadow-2xs">
                            <Icon name="check_circle" className="text-base text-emerald-600 shrink-0" />
                            <span>{assessmentNotice}</span>
                        </div>
                    )}

                    {/* Assessment section save notification */}
                    {toastNotice && (
                        <div
                            className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 shadow-2xs transition-all ${toastNotice.type === 'error'
                                ? 'bg-red-50 border-red-200 text-red-700'
                                : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                }`}
                        >
                            <Icon name={toastNotice.type === 'error' ? 'error' : 'check_circle'} className="text-base shrink-0" />
                            <span>{toastNotice.message}</span>
                        </div>
                    )}

                    {questions.length === 0 ? (
                        <div className="p-8 text-center text-xs text-[#475569] bg-slate-50 rounded-2xl border border-slate-200">
                            No questions created yet.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {questions.map((q, qIdx) => {
                                const targetChapter = chapters[q.videoIndex];
                                const isInlineEditing = inlineEditingQId === q.id;

                                // ── INLINE EDITABLE CARD VIEW ──
                                if (isInlineEditing && inlineForm) {
                                    return (
                                        <div
                                            key={q.id || qIdx}
                                            className="p-4 sm:p-5 rounded-2xl bg-white border-2 border-blue-200 shadow-md space-y-4 transition"
                                        >
                                            {/* Header with question number and badges */}
                                            <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-black flex items-center justify-center">
                                                        {qIdx + 1}
                                                    </span>
                                                    <span className="text-xs font-black text-[#0F172A]">
                                                        Editing Question #{qIdx + 1}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[#0F172A] font-bold text-[10px]">
                                                        {targetChapter ? `Chapter ${Number(q.videoIndex) + 1}: ${targetChapter.title || targetChapter.t}` : (q.videoTitle || 'Course Final')}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-[#475569] bg-slate-100 px-2 py-0.5 rounded-md">
                                                    Inline Editor
                                                </span>
                                            </div>

                                            {inlineFormError && (
                                                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                                                    <Icon name="error" className="text-sm shrink-0" />
                                                    <span>{inlineFormError}</span>
                                                </div>
                                            )}

                                            {/* Question Text */}
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-extrabold text-[#0F172A]">
                                                    Question Text <span className="text-red-600">*</span>
                                                </label>
                                                <textarea
                                                    rows={2}
                                                    value={inlineForm.question}
                                                    onChange={(e) => setInlineForm(prev => ({ ...prev, question: e.target.value }))}
                                                    placeholder="Enter question text..."
                                                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-blue-200 bg-white"
                                                />
                                            </div>

                                            {/* Options A, B, C, D with radio for Correct Answer */}
                                            <div className="space-y-1.5">
                                                <label className="text-[11px] font-extrabold text-[#0F172A] flex items-center justify-between">
                                                    <span>Answer Options & Correct Answer</span>
                                                    <span className="text-[10px] font-normal text-[#475569]">Select the radio button for the correct answer</span>
                                                </label>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                    {['A', 'B', 'C', 'D'].map((letter, optIdx) => {
                                                        const isCorrect = Number(inlineForm.correct) === optIdx;
                                                        return (
                                                            <div
                                                                key={letter}
                                                                className={`p-2 rounded-xl border transition flex items-center gap-2 ${isCorrect
                                                                    ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500/30'
                                                                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                                                                    }`}
                                                            >
                                                                <label className="flex items-center gap-1.5 cursor-pointer shrink-0">
                                                                    <input
                                                                        type="radio"
                                                                        name={`inline-correct-${q.id}`}
                                                                        checked={isCorrect}
                                                                        onChange={() => setInlineForm(prev => ({ ...prev, correct: optIdx }))}
                                                                        className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                                                                    />
                                                                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-[#0F172A]'
                                                                        }`}>
                                                                        {letter}
                                                                    </span>
                                                                </label>
                                                                <input
                                                                    type="text"
                                                                    value={inlineForm.options[optIdx] || ''}
                                                                    onChange={(e) => {
                                                                        const val = e.target.value;
                                                                        setInlineForm(prev => {
                                                                            const newOpts = [...prev.options];
                                                                            newOpts[optIdx] = val;
                                                                            return { ...prev, options: newOpts };
                                                                        });
                                                                    }}
                                                                    placeholder={`Option ${letter}...`}
                                                                    className="flex-1 px-2.5 py-1 text-xs bg-white rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-blue-200"
                                                                />
                                                                {isCorrect && (
                                                                    <span className="text-[10px] font-bold text-emerald-700 shrink-0 px-1.5 py-0.5 rounded bg-emerald-50">
                                                                        Correct
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Explanation / Feedback */}
                                            <div className="space-y-1">
                                                <label className="text-[11px] font-extrabold text-[#475569]">
                                                    Explanation / Feedback (Optional)
                                                </label>
                                                <input
                                                    type="text"
                                                    value={inlineForm.explanation || ''}
                                                    onChange={(e) => setInlineForm(prev => ({ ...prev, explanation: e.target.value }))}
                                                    placeholder="Explain why this answer is correct..."
                                                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus:border-blue-200 bg-white"
                                                />
                                            </div>

                                            {/* Inline Card Actions: Cancel and Save Question */}
                                            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200">
                                                <button
                                                    type="button"
                                                    onClick={handleCancelInlineEdit}
                                                    className="px-4 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-[#0F172A] hover:bg-slate-100 transition cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleSaveInlineQuestion(q.id)}
                                                    className="px-5 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-[#0F172A] text-xs font-extrabold shadow-sm transition flex items-center gap-1.5 cursor-pointer"
                                                >
                                                    <Icon name="check" className="text-xs" />
                                                    Save Question
                                                </button>
                                            </div>
                                        </div>
                                    );
                                }

                                // ── NORMAL STATIC CARD VIEW ──
                                return (
                                    <div key={q.id || qIdx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2.5">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-black flex items-center justify-center">
                                                        {qIdx + 1}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[#0F172A] font-bold text-[10px]">
                                                        {targetChapter ? `Chapter ${Number(q.videoIndex) + 1}: ${targetChapter.title || targetChapter.t}` : (q.videoTitle || 'Course Final')}
                                                    </span>
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[#0F172A] font-bold text-[10px]">
                                                        {q.triggerFormatted || (q.triggerType === 'end' ? 'At Video End' : 'Timestamp')}
                                                    </span>
                                                </div>
                                                <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] pt-1">
                                                    {q.question}
                                                </h4>
                                            </div>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => handleStartInlineEdit(q)}
                                                    className="p-1.5 rounded-lg text-[#0F172A] hover:bg-slate-100 cursor-pointer"
                                                    title="Edit Question"
                                                >
                                                    <Icon name="edit" className="text-sm" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteQuestion(q.id)}
                                                    className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                                                    title="Delete Question"
                                                >
                                                    <Icon name="delete" className="text-sm" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Options list */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                            {Array.isArray(q.options) && q.options.map((opt, oIdx) => {
                                                const isCorrect = Number(q.correct) === oIdx;
                                                const letter = String.fromCharCode(65 + oIdx);
                                                return (
                                                    <div
                                                        key={oIdx}
                                                        className={`p-2 rounded-lg text-xs flex items-center gap-2 ${isCorrect ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200' : 'bg-slate-50 text-[#475569]'}`}
                                                    >
                                                        <span className={`w-4 h-4 rounded flex items-center justify-center text-[10px] font-black ${isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-[#0F172A]'}`}>
                                                            {letter}
                                                        </span>
                                                        <span className="truncate">{opt}</span>
                                                        {isCorrect && <Icon name="check" className="text-xs text-emerald-700 ml-auto" />}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {q.explanation && (
                                            <div className="text-[11px] text-[#475569] bg-slate-50 p-2 rounded-lg">
                                                <strong>Explanation:</strong> {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Global Course Save Feedback Banner */}
            {toastNotice && (
                <div
                    className={`sticky bottom-20 z-20 p-4 rounded-xl border text-xs font-bold flex items-center gap-2.5 shadow-lg transition-all ${toastNotice.type === 'error'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        }`}
                >
                    <Icon name={toastNotice.type === 'error' ? 'error' : 'check_circle'} className="text-base shrink-0" />
                    <span>{toastNotice.message}</span>
                </div>
            )}

            {/* ── BOTTOM STICKY SAVE BAR ── */}
            <div className="sticky bottom-4 z-20 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl flex items-center justify-end">
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#0F172A] hover:bg-slate-100 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSaveCourse}
                        disabled={saving}
                        className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Icon name={saving ? 'sync' : (isNew ? 'add_circle' : 'save')} className={saving ? 'animate-spin text-sm' : 'text-sm'} />
                        {saving ? (isNew ? 'Creating Course...' : 'Saving Changes...') : (isNew ? 'Create Course' : 'Save All Changes')}
                    </button>
                </div>
            </div>
        </div>
    );
}
