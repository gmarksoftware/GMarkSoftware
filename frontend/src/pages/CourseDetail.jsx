import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import CourseCard from '../components/CourseCard.jsx';
import VideoQuizModal, { HTML_QUIZ_QUESTIONS } from '../components/VideoQuizModal.jsx';
import CourseAssessmentModal from '../components/CourseAssessmentModal.jsx';
import YouTubePlayer from '../components/YouTubePlayer.jsx';
import { Section } from '../components/ui.jsx';
import { api, assetUrl, resolveApiPath } from '../lib/api.js';
import { COURSES, DEFAULT_COURSES, getPlaylists, syncPlaylistsFromServer, extractYoutubeId, fmtDuration, getCourse, getCourses, totalMinutes, getYoutubeThumbnailUrl, getLessonThumbnailUrl } from '../lib/courses.js';
import { formatTime, parseTimeToSeconds } from '../lib/time.js';

import { useAuth } from '../lib/AuthContext.jsx';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import ChapterNotesDownloadModal from '../components/ChapterNotesDownloadModal.jsx';
import UserTaskModal from '../components/UserTaskModal.jsx';
import VideoAssignmentBox from '../components/VideoAssignmentBox.jsx';
import CertificateView, { CertificationIntroModal, CertificationSuccessModal } from '../components/CertificateView.jsx';
import ExpertModal from '../components/ExpertModal.jsx';

const fmtTime = formatTime;
const formatChapterTime = formatTime;
const parseSecondsFromTime = parseTimeToSeconds;

function formatMainVideoDuration(courseDuration, videoDurationSeconds) {
  let sec = 0;
  if (videoDurationSeconds && !isNaN(videoDurationSeconds) && videoDurationSeconds > 0) {
    sec = videoDurationSeconds;
  } else if (courseDuration) {
    sec = parseTimeToSeconds(courseDuration);
  }
  return formatTime(sec);
}

function formatExactDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function Player({
  lesson,
  course,
  videoRef,
  ytPlayerRef,
  activeCheckpoint,
  setActiveCheckpoint,
  onCheckpointComplete,
  onCheckpointClose,
  userAnswers,
  setUserAnswers,
  checkpoints = [],
  completedCheckpoints = {},
  onCheckpointSelect,
  onTimeUpdate,
  onDurationChange,
  onSeekingOrSeeked,
  onVideoEnded,
  onPlay,
  onPause,
  initialSeekTime = 0,
  activePlaylistVideo = null,
  playlistMode = false,
  onSkipToNext = null,
  strictNonSkippable = false,
  maxWatchedSeconds = 0,
  onSkipBlocked = null,
}) {
  const { t } = useLanguage();
  const htmlMaxWatchedRef = useRef(
    Math.max(Number(maxWatchedSeconds) || 0, Number(initialSeekTime) || 0)
  );
  const htmlSkipToastAtRef = useRef(0);

  useEffect(() => {
    const floor = Math.max(Number(maxWatchedSeconds) || 0, Number(initialSeekTime) || 0);
    if (floor > htmlMaxWatchedRef.current) {
      htmlMaxWatchedRef.current = floor;
    }
  }, [maxWatchedSeconds, initialSeekTime]);
  // ONE COURSE → ONE MAIN VIDEO (or Active Playlist Video)
  const ytVideoId =
    (activePlaylistVideo && (extractYoutubeId(activePlaylistVideo.youtubeVideoId) || extractYoutubeId(activePlaylistVideo.youtubeUrl))) ||
    extractYoutubeId(course?.youtubeVideoId) ||
    extractYoutubeId(course?.youtube) ||
    extractYoutubeId(course?.youtubeUrl) ||
    extractYoutubeId(lesson?.youtubeVideoId) ||
    extractYoutubeId(lesson?.youtube) ||
    extractYoutubeId(lesson?.youtubeUrl);

  const fileSrc = (!activePlaylistVideo && !ytVideoId && (course?.file || course?.videoUrl || lesson?.file || lesson?.videoUrl))
    ? (course?.file || course?.videoUrl || lesson?.file || lesson?.videoUrl)
    : null;

  const playerTitle =
    activePlaylistVideo?.title ||
    lesson?.t ||
    (typeof course?.title === 'string' ? course.title : course?.title?.en) ||
    'Course Video Lesson';

  const initialEstimatedDuration =
    parseTimeToSeconds(activePlaylistVideo?.duration || lesson?.duration || lesson?.d || course?.duration) || 0;

  if (ytVideoId) {
    return (
      <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
        <YouTubePlayer
          key={ytVideoId}
          videoId={ytVideoId}
          title={playerTitle}
          courseName={typeof course?.title === 'string' ? course.title : course?.title?.en || ''}
          className="w-full h-full"
          autoPlay={playlistMode}
          checkpoints={checkpoints}
          completedCheckpoints={completedCheckpoints}
          onCheckpointSelect={onCheckpointSelect}
          onTimeUpdate={onTimeUpdate}
          onDurationChange={onDurationChange}
          onSeekingOrSeeked={onSeekingOrSeeked}
          onVideoEnded={onVideoEnded}
          onPlay={onPlay}
          onPause={onPause}
          playerRef={ytPlayerRef}
          initialSeekTime={initialSeekTime}
          onSkipToNext={onSkipToNext}
          duration={initialEstimatedDuration}
          strictNonSkippable={strictNonSkippable}
          initialMaxWatched={maxWatchedSeconds}
          onSkipBlocked={onSkipBlocked}
        />

        {activeCheckpoint && (
          <VideoQuizModal
            key={activeCheckpoint.id}
            checkpointTitle={activeCheckpoint.label}
            isEndCheckpoint={activeCheckpoint.isEnd}
            showSummaryDirectly={false}
            questions={activeCheckpoint.questions}
            onComplete={() => onCheckpointComplete(activeCheckpoint)}
            userAnswers={userAnswers}
            setUserAnswers={setUserAnswers}
            onRetake={() => {
              setUserAnswers((prev) => {
                const next = { ...(prev || {}) };
                if (Array.isArray(activeCheckpoint.questions)) {
                  activeCheckpoint.questions.forEach((q) => {
                    delete next[q.id];
                  });
                }
                return next;
              });
            }}
          />
        )}
      </div>
    );
  }

  if (fileSrc) {
    const finalUrl = assetUrl(fileSrc);
    return (
      <div className="relative w-full h-full bg-black overflow-hidden flex items-center justify-center">
        <video
          ref={videoRef}
          key={finalUrl}
          poster={course?.image || lesson?.poster}
          className="w-full h-full bg-black object-contain"
          src={finalUrl}
          controls
          controlsList="nodownload"
          playsInline
          autoPlay={false}
          onLoadedMetadata={(e) => {
            const dur = e.currentTarget.duration;
            if (onDurationChange && dur) onDurationChange(dur);
            if (initialSeekTime > 0 && e.currentTarget.currentTime === 0) {
              try {
                e.currentTarget.currentTime = initialSeekTime;
              } catch { }
            }
          }}
          onRateChange={(e) => {
            if (strictNonSkippable && e.currentTarget.playbackRate > 1.5) {
              e.currentTarget.playbackRate = 1.5;
            }
          }}
          onTimeUpdate={(e) => {
            const t = e.currentTarget.currentTime;
            if (!strictNonSkippable || t <= htmlMaxWatchedRef.current + 3) {
              if (t > htmlMaxWatchedRef.current) htmlMaxWatchedRef.current = t;
            }
            if (typeof onTimeUpdate === 'function') onTimeUpdate(t);
          }}
          onPlay={onPlay}
          onPause={onPause}
          onSeeking={(e) => {
            const vidEl = e.currentTarget;
            if (strictNonSkippable && vidEl.currentTime > htmlMaxWatchedRef.current + 3) {
              vidEl.currentTime = htmlMaxWatchedRef.current;
              const nowMs = Date.now();
              if (nowMs - htmlSkipToastAtRef.current > 2000) {
                htmlSkipToastAtRef.current = nowMs;
                if (typeof onSkipBlocked === 'function') onSkipBlocked(htmlMaxWatchedRef.current);
              }
              return;
            }
            if (typeof onSeekingOrSeeked === 'function') onSeekingOrSeeked(vidEl.currentTime);
          }}
          onSeeked={(e) => {
            const vidEl = e.currentTarget;
            if (strictNonSkippable && vidEl.currentTime > htmlMaxWatchedRef.current + 3) {
              vidEl.currentTime = htmlMaxWatchedRef.current;
              return;
            }
            if (typeof onSeekingOrSeeked === 'function') onSeekingOrSeeked(vidEl.currentTime);
          }}
          onEnded={onVideoEnded}
        />

        {activeCheckpoint && (
          <VideoQuizModal
            key={activeCheckpoint.id}
            checkpointTitle={activeCheckpoint.label}
            isEndCheckpoint={activeCheckpoint.isEnd}
            showSummaryDirectly={false}
            questions={activeCheckpoint.questions}
            onComplete={() => onCheckpointComplete(activeCheckpoint)}
            userAnswers={userAnswers}
            setUserAnswers={setUserAnswers}
            onRetake={() => {
              setUserAnswers((prev) => {
                const next = { ...(prev || {}) };
                if (Array.isArray(activeCheckpoint.questions)) {
                  activeCheckpoint.questions.forEach((q) => {
                    delete next[q.id];
                  });
                }
                return next;
              });
            }}
          />
        )}
      </div>
    );
  }
  return (
    <div className={`w-full h-full flex flex-col items-center justify-center text-center text-white p-6 bg-gradient-to-br ${course?.gradient || 'from-[#1E3A8A] via-[#0F172A] to-[#090D16]'}`}>
      <Icon name="smart_display" className="text-[64px] text-[#38BDF8] mb-3" />
      <p className="font-extrabold text-lg">{lesson?.t || (typeof course?.title === 'string' ? course.title : course?.title?.en) || 'Course Lesson'}</p>
      <p className="text-brand-lightGreen text-sm mt-1">{t('courses.videoSoon')}</p>
    </div>
  );
}

export default function CourseDetail() {
  const { slug, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { user } = useAuth();

  const isPlaylistRoute = location.pathname.startsWith('/playlists/');
  const currentPlaylistId = isPlaylistRoute ? (id || slug) : null;
  const currentCourseSlug = !isPlaylistRoute ? (slug || id) : null;

  const [course, setCourse] = useState(() => (isPlaylistRoute ? null : getCourse(currentCourseSlug)));
  const [loading, setLoading] = useState(true);

  const userKey = user ? (user.id || user.email || 'user') : 'guest';

  const [idx, setIdx] = useState(0);
  const [done, setDone] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`gg-done-${userKey}-${currentCourseSlug || currentPlaylistId}`)) || []; } catch { return []; }
  });

  const [activeCheckpoint, setActiveCheckpoint] = useState(null); // active checkpoint object { id, isEnd, seconds, questions, label }
  const [adminAssessmentModalOpen, setAdminAssessmentModalOpen] = useState(false);
  const [completedCheckpoints, setCompletedCheckpoints] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`gg-checkpoints-${userKey}-${currentCourseSlug || currentPlaylistId}`)) || {};
    } catch {
      return {};
    }
  });
  const [userAnswers, setUserAnswers] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`gg-quiz-ans-${userKey}-${currentCourseSlug || currentPlaylistId}`)) || {};
    } catch {
      return {};
    }
  });

  const [courseValidity, setCourseValidity] = useState(null);
  const [lmsAssignments, setLmsAssignments] = useState([]);
  // Playlist Management State
  const [playlists, setPlaylists] = useState(() => (isPlaylistRoute ? [] : getPlaylists(currentCourseSlug)));
  const [expandedPlaylistId, setExpandedPlaylistId] = useState(null);
  const [activePlaylist, setActivePlaylist] = useState(() => {
    try {
      if (isPlaylistRoute) return location.state?.playlist || null;
      const sp = new URLSearchParams(window.location.search);
      const targetPlId = sp.get('playlist');
      if (targetPlId) {
        const initialList = getPlaylists(currentCourseSlug);
        return initialList.find((p) => p.id === targetPlId) || null;
      }
    } catch { }
    return null;
  });
  const [activePlaylistVideoIndex, setActivePlaylistVideoIndex] = useState(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const targetPlId = sp.get('playlist');
      const targetVidId = sp.get('video');
      if (targetPlId && targetVidId) {
        const initialList = getPlaylists(currentCourseSlug || slug);
        const matched = initialList.find((p) => p.id === targetPlId);
        if (matched?.videos) {
          const vIdx = matched.videos.findIndex((v) => v.id === targetVidId || v.youtubeVideoId === targetVidId);
          if (vIdx >= 0) return vIdx;
        }
      }
    } catch { }
    return 0;
  });
  const [playlistWatched, setPlaylistWatched] = useState({});
  const [isPlaylistCompleted, setIsPlaylistCompleted] = useState(false);
  const [expandedPlaylistVideoIndices, setExpandedPlaylistVideoIndices] = useState({});

  const activePlaylistRef = useRef(activePlaylist);
  const activePlaylistVideoIndexRef = useRef(activePlaylistVideoIndex);

  useEffect(() => {
    activePlaylistRef.current = activePlaylist;
  }, [activePlaylist]);

  useEffect(() => {
    activePlaylistVideoIndexRef.current = activePlaylistVideoIndex;
  }, [activePlaylistVideoIndex]);

  // View session tracking for Admin Analytics
  const sessionIdRef = useRef(null);
  const lastSyncTimeRef = useRef(0);
  const isSyncingRef = useRef(false);
  const pendingSpentRef = useRef(null);
  const lessonWatchTimeRef = useRef({});
  const hasTrackedOpenRef = useRef(false);

  // Actual Playback Watch Time Tracking
  const lastPlaybackPosRef = useRef(null);
  const lastPlaybackWallTimeRef = useRef(null);
  const accumulatedWatchDeltaRef = useRef(0);
  const isUserSeekingRef = useRef(false);
  const lastProgressSyncWallTimeRef = useRef(Date.now());
  const actualWatchedSecRef = useRef(0);
  const watchSessionIdRef = useRef(null);
  const hasFiredSessionStartRef = useRef(false);

  useEffect(() => {
    watchSessionIdRef.current = 'ws_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    hasFiredSessionStartRef.current = false;
  }, [slug, idx, activePlaylistVideoIndex]);

  useEffect(() => {
    if (activePlaylist?.id) {
      try {
        const saved = JSON.parse(localStorage.getItem(`gg-playlist-done-${userKey}-${activePlaylist.id}`)) || {};
        setPlaylistWatched(saved);
      } catch {
        setPlaylistWatched({});
      }
    }
  }, [activePlaylist?.id, userKey]);

  const explicitPlaylistId = useMemo(() => {
    try {
      return new URLSearchParams(location.search).get('playlist');
    } catch {
      return null;
    }
  }, [location.search]);
  const activePlaylistVideo = activePlaylist?.videos?.[activePlaylistVideoIndex] || null;
  const isPlaylistMode = Boolean((isPlaylistRoute || explicitPlaylistId) && activePlaylist && activePlaylistVideo);

  // Per-video resume position inside playlist
  const playlistResumePosition = useMemo(() => {
    if (!isPlaylistMode || !activePlaylistVideo) return 0;
    const vidKey = activePlaylistVideo.id || activePlaylistVideoIndex;
    if (playlistWatched[vidKey]) return 0;
    try {
      const saved = Number(localStorage.getItem(`gg-pl-pos-${userKey}-${vidKey}`));
      if (typeof saved === 'number' && !isNaN(saved) && saved > 5) {
        return saved;
      }
    } catch { }
    return 0;
  }, [isPlaylistMode, activePlaylistVideo, activePlaylistVideoIndex, playlistWatched, userKey]);

  const savePlaylistPosition = useCallback((timeSec) => {
    if (!isPlaylistMode || !activePlaylistVideo || typeof timeSec !== 'number' || timeSec <= 0) return;
    const vidKey = activePlaylistVideo.id || activePlaylistVideoIndex;
    if (playlistWatched[vidKey]) return;
    try {
      localStorage.setItem(`gg-pl-pos-${userKey}-${vidKey}`, String(Math.round(timeSec)));
    } catch { }
  }, [isPlaylistMode, activePlaylistVideo, activePlaylistVideoIndex, playlistWatched, userKey]);

  // Video-wise Task / Assignment State
  const [videoAssignedTask, setVideoAssignedTask] = useState(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [lessonMaxWatched, setLessonMaxWatched] = useState({});
  const [unlockedLessonIndex, setUnlockedLessonIndex] = useState(0);
  const [skipBlockedToast, setSkipBlockedToast] = useState('');
  const [certificateStatus, setCertificateStatus] = useState(null);
  const [courseCertificate, setCourseCertificate] = useState(null);
  const [certContactOpen, setCertContactOpen] = useState(false);
  const [certIntroOpen, setCertIntroOpen] = useState(false);
  const [certCongratsOpen, setCertCongratsOpen] = useState(false);
  const skipToastTimerRef = useRef(null);

  const isStrictNonSkippable =
    certificateStatus?.strictNonSkippable !== undefined
      ? Boolean(certificateStatus.strictNonSkippable)
      : course?.strictNonSkippable !== undefined
        ? Boolean(course.strictNonSkippable)
        : true;

  const triggerSkipBlockedToast = useCallback((customMsg) => {
    setSkipBlockedToast(
      customMsg || 'Skipping ahead is disabled. Please watch the full lesson to unlock the next step.'
    );
    if (skipToastTimerRef.current) clearTimeout(skipToastTimerRef.current);
    skipToastTimerRef.current = setTimeout(() => {
      setSkipBlockedToast('');
    }, 4000);
  }, []);

  const refreshCertificateStatus = useCallback(() => {
    const targetSlug = currentCourseSlug || slug;
    if (!user?.id || !targetSlug || typeof api?.getCourseCertificateStatus !== 'function') return;
    api.getCourseCertificateStatus(targetSlug)
      .then((res) => {
        if (!res) return;
        setCertificateStatus(res);
        if (res.certificate) {
          setCourseCertificate(res.certificate);
        }
      })
      .catch(() => { });
  }, [user?.id, currentCourseSlug, slug]);

  // Show first-time Course-Start Certification Info Pop-up when learner opens the course
  useEffect(() => {
    const targetSlug = currentCourseSlug || slug;
    if (!user?.id || !targetSlug || loading || !course) return;
    if (courseCertificate || certificateStatus?.certificate) return;
    const introKey = `gmark-cert-intro-${userKey}-${targetSlug}`;
    try {
      if (!localStorage.getItem(introKey)) {
        localStorage.setItem(introKey, '1');
        setCertIntroOpen(true);
      }
    } catch { }
  }, [user?.id, userKey, currentCourseSlug, slug, loading, course, courseCertificate, certificateStatus?.certificate]);

  // Auto-trigger celebratory pop-up once per newly unlocked certificateCode
  useEffect(() => {
    const issued = courseCertificate || certificateStatus?.certificate;
    const isEligible = certificateStatus?.eligible !== undefined ? Boolean(certificateStatus.eligible) : Boolean(issued);
    if (!user?.id || !issued?.certificateCode || !isEligible) return;
    const celebratedKey = `gmark-cert-celebrated-${userKey}-${issued.certificateCode}`;
    try {
      if (!localStorage.getItem(celebratedKey)) {
        localStorage.setItem(celebratedKey, '1');
        setCertIntroOpen(false);
        setCertCongratsOpen(true);
      }
    } catch { }
  }, [user?.id, userKey, courseCertificate, certificateStatus?.eligible, certificateStatus?.certificate]);

  const playlistWatchedCount = useMemo(() => {
    if (!activePlaylist?.videos) return 0;
    return activePlaylist.videos.filter((v, i) => playlistWatched[v.id || i]).length;
  }, [activePlaylist, playlistWatched]);

  const playlistProgressPercent = useMemo(() => {
    if (!activePlaylist?.videos?.length) return 0;
    return Math.round((playlistWatchedCount / activePlaylist.videos.length) * 100);
  }, [activePlaylist, playlistWatchedCount]);

  const activePlaylistItemRef = useRef(null);
  const playlistScrollContainerRef = useRef(null);

  useEffect(() => {
    if (isPlaylistMode && activePlaylistItemRef.current) {
      activePlaylistItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activePlaylistVideoIndex, isPlaylistMode]);

  const videoRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const prevTimeRef = useRef(0);
  const midQuizAutoShownRef = useRef(false);

  const [initialSeekTime, setInitialSeekTime] = useState(0);
  const hasAppliedResumeRef = useRef(false);
  const lastResumeSaveRef = useRef(0);

  useEffect(() => {
    hasAppliedResumeRef.current = false;
    const activeEntityKey = currentCourseSlug || currentPlaylistId || 'default';
    let savedPos = 0;
    try {
      const savedResume = localStorage.getItem(`gg-resume-${userKey}-${activeEntityKey}`);
      if (savedResume) {
        const parsed = JSON.parse(savedResume);
        savedPos = typeof parsed === 'number' ? parsed : (parsed?.position || 0);
      }
    } catch { }
    if (savedPos > 0) {
      setInitialSeekTime(savedPos);
    } else {
      setInitialSeekTime(0);
      setIdx(0);
    }

    try {
      const localDone = JSON.parse(localStorage.getItem(`gg-done-${userKey}-${activeEntityKey}`)) || [];
      setDone(localDone);
    } catch {
      setDone([]);
    }
    try {
      const localCp = JSON.parse(localStorage.getItem(`gg-checkpoints-${userKey}-${activeEntityKey}`)) || {};
      setCompletedCheckpoints(localCp);
    } catch {
      setCompletedCheckpoints({});
    }
    try {
      const localAns = JSON.parse(localStorage.getItem(`gg-quiz-ans-${userKey}-${activeEntityKey}`)) || {};
      setUserAnswers(localAns);
    } catch {
      setUserAnswers({});
    }

    // 1. If this is a Playlist Route (/playlists/:id), fetch strictly from playlists endpoint
    if (isPlaylistRoute && currentPlaylistId) {
      setCourse(null);
      setLoading(true);
      api.getPlaylist(currentPlaylistId)
        .then((serverPl) => {
          if (serverPl) {
            setActivePlaylist(serverPl);
            setExpandedPlaylistId(serverPl.id);
            setPlaylists([serverPl]);
            setCourse({
              id: serverPl.id,
              slug: serverPl.id,
              title: serverPl.title,
              description: serverPl.description,
              category: serverPl.category || 'business',
              lessons: (serverPl.videos || []).map((v, i) => ({
                id: v.id,
                t: v.title || `Video ${i + 1}`,
                title: v.title || `Video ${i + 1}`,
                youtubeVideoId: v.youtubeVideoId,
                youtubeUrl: v.youtubeUrl,
                youtube: v.youtubeVideoId,
                duration: v.duration,
              })),
              videos: serverPl.videos || [],
              isPlaylist: true,
            });
            const sp = new URLSearchParams(window.location.search);
            const vidId = sp.get('video');
            if (vidId && Array.isArray(serverPl.videos)) {
              const vIdx = serverPl.videos.findIndex((v) => v.id === vidId || v.youtubeVideoId === vidId);
              if (vIdx >= 0) setActivePlaylistVideoIndex(vIdx);
            }

            // Auto-enroll playlist for logged in user and sync to local storage
            if (user?.id) {
              if (typeof api?.enrollCourse === 'function') {
                api.enrollCourse(serverPl.id).catch(() => { });
              }
              try {
                const enrKey = `gg-enrolled-${userKey}`;
                const storedList = JSON.parse(localStorage.getItem(enrKey) || '[]');
                if (!storedList.includes(serverPl.id)) {
                  storedList.push(serverPl.id);
                  localStorage.setItem(enrKey, JSON.stringify(storedList));
                }
              } catch { }
            }
          }
        })
        .catch(() => { })
        .finally(() => setLoading(false));
      return;
    }

    // 2. Normal Course Route: Clear any lingering playlist state immediately
    const sp = new URLSearchParams(window.location.search);
    const targetPlId = sp.get('playlist');
    if (!targetPlId) {
      setActivePlaylist(null);
      setExpandedPlaylistId(null);
      setIsPlaylistCompleted(false);
    }

    const local = getCourse(currentCourseSlug);
    if (local) {
      setCourse(local);
      setLoading(false);
    }
    if (currentCourseSlug) {
      if (typeof api?.getCoursePlaylists === 'function') {
        api.getCoursePlaylists(currentCourseSlug)
          .then((pls) => {
            if (Array.isArray(pls) && pls.length > 0) {
              setPlaylists(pls);
              syncPlaylistsFromServer(pls, currentCourseSlug);
              try {
                const spInner = new URLSearchParams(window.location.search);
                const targetPlIdInner = spInner.get('playlist');
                const vidId = spInner.get('video');

                let matched = null;
                if (targetPlIdInner) {
                  matched = pls.find((p) => p.id === targetPlIdInner);
                }

                if (matched) {
                  setActivePlaylist(matched);
                  setExpandedPlaylistId(matched.id);
                  if (vidId && matched.videos) {
                    const vIndex = matched.videos.findIndex((v) => v.id === vidId || v.youtubeVideoId === vidId);
                    if (vIndex >= 0) setActivePlaylistVideoIndex(vIndex);
                  }
                } else {
                  setActivePlaylist(null);
                }
              } catch { }
            } else if (Array.isArray(pls)) {
              setPlaylists(pls);
              syncPlaylistsFromServer(pls, currentCourseSlug);
            } else {
              const fallback = getPlaylists(currentCourseSlug);
              setPlaylists(Array.isArray(fallback) ? fallback : []);
            }
          })
          .catch(() => {
            const fallback = getPlaylists(currentCourseSlug);
            setPlaylists(Array.isArray(fallback) ? fallback : []);
          });
      } else {
        const fallback = getPlaylists(currentCourseSlug);
        setPlaylists(Array.isArray(fallback) ? fallback : []);
      }

      api.getCourse(currentCourseSlug)
        .then((serverData) => {
          if (serverData) {
            setCourse((prev) => ({ ...(prev || {}), ...serverData }));
            try {
              const spVid = new URLSearchParams(window.location.search);
              const vidId = spVid.get('video');
              if (vidId && Array.isArray(serverData.lessons) && serverData.lessons.length > 0) {
                const lIndex = serverData.lessons.findIndex(
                  (l, i) => l.id === vidId || l.youtubeVideoId === vidId || String(i) === vidId
                );
                if (lIndex >= 0) {
                  setIdx(lIndex);
                  setActivePlaylist(null);
                }
              }
            } catch { }
          }
        })
        .catch(() => { })
        .finally(() => setLoading(false));

      if (user?.id) {
        if (typeof api?.getCourseVideoAccess === 'function') {
          api.getCourseVideoAccess(currentCourseSlug)
            .then((videoAccess) => {
              if (videoAccess) {
                setCourse((prev) => ({ ...(prev || {}), ...videoAccess }));
              }
            })
            .catch(() => { });
        }

        if (typeof api?.enrollCourse === 'function') {
          api.enrollCourse(slug)
            .then((res) => {
              if (res?.learners !== undefined) {
                setCourse((prev) => prev ? { ...prev, learners: res.learners } : prev);
              }
              if (res?.expiryDate) {
                setCourseValidity(res);
              }
            })
            .catch(() => { });

          try {
            const enrKey = `gg-enrolled-${userKey}`;
            const storedList = JSON.parse(localStorage.getItem(enrKey) || '[]');
            if (!storedList.includes(slug)) {
              storedList.push(slug);
              localStorage.setItem(enrKey, JSON.stringify(storedList));
            }
          } catch { }
        }

        if (typeof api?.getCourseValidity === 'function') {
          api.getCourseValidity(slug)
            .then((val) => setCourseValidity(val))
            .catch(() => { });
        }

        if (typeof api?.getCourseProgress === 'function') {
          api.getCourseProgress(slug)
            .then((prog) => {
              if (prog && Array.isArray(prog.completedLessons)) {
                const intIndices = prog.completedLessons.map(Number).filter((n) => !isNaN(n));
                setDone(intIndices);
              }
              if (prog?.checkpointsPassed) {
                setCompletedCheckpoints(prog.checkpointsPassed);
              }
              if (prog?.lessonMaxWatched && typeof prog.lessonMaxWatched === 'object') {
                setLessonMaxWatched(prog.lessonMaxWatched);
              }
              if (typeof prog?.unlockedLessonIndex === 'number') {
                setUnlockedLessonIndex(prog.unlockedLessonIndex);
              }
              if (prog?.certificate) {
                setCourseCertificate(prog.certificate);
              }
              if (prog?.watchTimeSec !== undefined) {
                const storageKey = `gg-actual-watchtime-${userKey}-${slug}`;
                const curLocal = Number(localStorage.getItem(storageKey)) || 0;
                const best = Math.max(curLocal, Number(prog.watchTimeSec) || 0);
                try { localStorage.setItem(storageKey, String(best)); } catch { }
                actualWatchedSecRef.current = best;
              }
            })
            .catch(() => { });
        }

        refreshCertificateStatus();

        if (typeof api?.getCourseAssignments === 'function') {
          try {
            api.getCourseAssignments(slug)
              .then((assigns) => {
                if (Array.isArray(assigns)) {
                  setLmsAssignments(assigns);
                } else {
                  setLmsAssignments([]);
                }
              })
              .catch(() => {
                setLmsAssignments([]);
              });
          } catch {
            setLmsAssignments([]);
          }
        } else {
          setLmsAssignments([]);
        }
      }
    } else {
      setLoading(false);
    }
  }, [currentCourseSlug, currentPlaylistId, isPlaylistRoute, location.pathname, location.search, user?.id, userKey]);

  // Course Rating state (connected to backend database)
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    totalRatings: 0,
    reviews: [],
    userRating: null,
  });
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [userReview, setUserReview] = useState('');
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingError, setRatingError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [descExpanded, setDescExpanded] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ 0: true, 1: true, 2: true });

  // Reset to 'overview' tab by default when navigating between courses or playlists
  useEffect(() => {
    if (location.hash) {
      const cleanHash = location.hash.replace('#', '').toLowerCase();
      if (cleanHash === 'reviews') {
        setActiveTab('reviews');
        return;
      }
      if (cleanHash === 'requirements' || cleanHash === 'learn_req') {
        setActiveTab('learn');
        return;
      }
      const validTabs = ['overview', 'curriculum', 'tasks', 'materials', 'quiz', 'learn', 'reviews'];
      if (validTabs.includes(cleanHash)) {
        setActiveTab(cleanHash);
        return;
      }
    }
    setActiveTab('overview');
  }, [slug, id, location.pathname, location.search]);

  // Chapter-specific Notes Modal State
  const [notesModalChapter, setNotesModalChapter] = useState(null);
  const [notesModalIndex, setNotesModalIndex] = useState(0);

  const handleOpenChapterNotesModal = (ch, chapterIdx) => {
    setNotesModalChapter(ch);
    setNotesModalIndex(chapterIdx !== undefined ? chapterIdx : idx);
  };

  const handleDirectFileDownload = async (rawUrl, desiredFileName) => {
    if (!rawUrl) return;
    const fullUrl = rawUrl.startsWith('http') ? rawUrl : assetUrl(rawUrl);
    const fileName = desiredFileName || rawUrl.split('/').pop()?.split('?')[0] || 'study-material.pdf';

    try {
      const response = await fetch(fullUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Network response not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
    } catch (err) {
      // Fallback direct trigger
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const hasLessonNotes = (l) =>
    Boolean(
      l &&
      (l.notesUrl ||
        l.noteUrl ||
        l.notesName ||
        l.noteName ||
        (typeof l.file === 'string' && l.file.toLowerCase().endsWith('.pdf')))
    );

  const loadRatings = async () => {
    if (!slug) return;
    try {
      const data = await api.getCourseRatings(slug);
      if (data) {
        setRatingStats({
          averageRating: Number(data.averageRating) || 0,
          totalRatings: Number(data.totalRatings) || 0,
          reviews: Array.isArray(data.reviews) ? data.reviews : [],
          userRating: data.userRating || null,
        });
        if (data.userRating) {
          setUserRating(Number(data.userRating.rating) || 0);
          setUserReview(data.userRating.review || '');
          setRatingSubmitted(true);
        } else {
          setUserRating(0);
          setUserReview('');
          setRatingSubmitted(false);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch course ratings:', err);
    }
  };

  useEffect(() => {
    loadRatings();
  }, [slug, user?.id]);

  const handleSelectRating = (star) => {
    setUserRating(star);
    setRatingError('');
  };

  const handleRatingSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!user) {
      setRatingError('Please log in to submit a course rating.');
      return;
    }
    if (!userRating || userRating < 1 || userRating > 5) {
      setRatingError('Please select 1 to 5 stars before submitting.');
      return;
    }
    setRatingError('');
    setIsSubmittingRating(true);
    try {
      await api.submitCourseRating(slug, {
        rating: userRating,
        review: userReview ? userReview.trim() : undefined,
      });
      setRatingSubmitted(true);
      await loadRatings();
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      setRatingError(err.message || 'Failed to submit rating. Please try again.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const getOrCreateSessionId = (courseSlug) => {
    if (!courseSlug) return null;
    try {
      const key = `gg_view_session_${courseSlug}`;
      let sid = sessionStorage.getItem(key);
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!sid || !uuidRegex.test(sid)) {
        sid = (typeof crypto !== 'undefined' && crypto.randomUUID)
          ? crypto.randomUUID()
          : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
          });
        sessionStorage.setItem(key, sid);
      }
      return sid;
    } catch {
      return null;
    }
  };

  const syncCourseView = (currentSeconds) => {
    if (!slug) return;
    const spent = Math.max(0, Math.round(currentSeconds || 0));

    if (!sessionIdRef.current) {
      sessionIdRef.current = getOrCreateSessionId(slug);
    }
    const currentSessionId = sessionIdRef.current;

    // 1. Sync to local storage 'course_views' without duplicate entries
    try {
      const views = JSON.parse(localStorage.getItem('course_views') || '[]');
      const existingIdx = currentSessionId
        ? views.findIndex((v) => v.id === currentSessionId || (v.slug === slug && Math.abs(Date.now() - (v.timestamp || 0)) < 2 * 3600 * 1000))
        : -1;

      if (existingIdx !== -1) {
        views[existingIdx].timeSpent = Math.max(views[existingIdx].timeSpent || 0, spent);
        views[existingIdx].timestamp = Date.now();
        if (currentSessionId && views[existingIdx].id !== currentSessionId) {
          views[existingIdx].id = currentSessionId;
        }
        if (user?.fullName || user?.email) {
          views[existingIdx].user = user.fullName || user.email;
        }
        if (user?.id) {
          views[existingIdx].userId = user.id;
        }
      } else {
        views.unshift({
          id: currentSessionId,
          slug,
          timeSpent: spent,
          timestamp: Date.now(),
          user: user?.fullName || user?.email || 'Visitor',
          userId: user?.id || null,
        });
      }
      localStorage.setItem('course_views', JSON.stringify(views.slice(0, 500)));
      try {
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('gg-course-view-updated', {
          detail: { slug, timeSpent: spent, sessionId: currentSessionId, userId: user?.id || null }
        }));
      } catch { }
    } catch { }

    // 2. Sync to Backend Database API with concurrency lock
    if (isSyncingRef.current) {
      pendingSpentRef.current = Math.max(pendingSpentRef.current || 0, spent);
      return;
    }

    isSyncingRef.current = true;
    try {
      fetch(resolveApiPath('/courses/track-view'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          timeSpent: spent,
          sessionId: currentSessionId,
          userId: user?.id || null,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.session?.id) {
            sessionIdRef.current = data.session.id;
            try {
              sessionStorage.setItem(`gg_view_session_${slug}`, data.session.id);
              const views = JSON.parse(localStorage.getItem('course_views') || '[]');
              const idx = views.findIndex((v) => v.id === currentSessionId || v.id === data.session.id);
              if (idx !== -1) {
                views[idx].id = data.session.id;
                views[idx].timeSpent = Math.max(views[idx].timeSpent || 0, data.session.timeSpent || 0);
                localStorage.setItem('course_views', JSON.stringify(views));
              }
            } catch { }
          }
        })
        .catch(() => { })
        .finally(() => {
          isSyncingRef.current = false;
          if (pendingSpentRef.current !== null && pendingSpentRef.current > spent) {
            const nextSpent = pendingSpentRef.current;
            pendingSpentRef.current = null;
            syncCourseView(nextSpent);
          }
        });
    } catch {
      isSyncingRef.current = false;
    }
  };

  useEffect(() => {
    setIdx(0);
    sessionIdRef.current = getOrCreateSessionId(slug);
    lastSyncTimeRef.current = 0;
    lessonWatchTimeRef.current = {};
    lastPlaybackPosRef.current = null;
    lastPlaybackWallTimeRef.current = null;
    accumulatedWatchDeltaRef.current = 0;

    // Load actual watch time for this user and course
    try {
      const storedWatch = Number(localStorage.getItem(`gg-actual-watchtime-${userKey}-${slug}`)) || 0;
      actualWatchedSecRef.current = storedWatch;
    } catch {
      actualWatchedSecRef.current = 0;
    }

    if (slug === 'aaaaaaaaaaaa') {
      try {
        localStorage.removeItem(`gg-actual-watchtime-${userKey}-${slug}`);
        const views = JSON.parse(localStorage.getItem('course_views') || '[]');
        if (Array.isArray(views)) {
          const filtered = views.filter((v) => (v?.slug || '').toLowerCase() !== 'aaaaaaaaaaaa');
          localStorage.setItem('course_views', JSON.stringify(filtered));
        }
      } catch { }
      actualWatchedSecRef.current = 0;
    }

    if (!hasTrackedOpenRef.current) {
      hasTrackedOpenRef.current = true;
      syncCourseView(actualWatchedSecRef.current);
    }

    try { setDone(JSON.parse(localStorage.getItem(`gg-done-${userKey}-${slug}`)) || []); } catch { setDone([]); }
    try { setCompletedCheckpoints(JSON.parse(localStorage.getItem(`gg-checkpoints-${userKey}-${slug}`)) || {}); } catch { setCompletedCheckpoints({}); }
    try { setUserAnswers(JSON.parse(localStorage.getItem(`gg-quiz-ans-${userKey}-${slug}`)) || {}); } catch { setUserAnswers({}); }
    try {
      // Check current userKey first; fall back to 'guest' key so ratings saved
      // before login (or when auth resolves after mount) are not lost.
      const ratingKey = `gg-rating-${userKey}-${slug}`;
      const guestRatingKey = `gg-rating-guest-${slug}`;
      const directKey = `gg-rating-${slug}`;
      const savedR = Number(localStorage.getItem(ratingKey))
        || Number(localStorage.getItem(guestRatingKey))
        || Number(localStorage.getItem(directKey))
        || 0;
      // Only overwrite state if we found a persisted value; avoids blanking a
      // rating that was just submitted before the effect re-ran.
      if (savedR > 0) {
        setUserRating(savedR);
        setRatingSubmitted(true);
      }
      const savedReview = localStorage.getItem(`gg-review-${userKey}-${slug}`)
        || localStorage.getItem(`gg-review-guest-${slug}`)
        || localStorage.getItem(`gg-review-${slug}`)
        || '';
      setUserReview(savedReview);
    } catch { }
  }, [slug, userKey]);

  useEffect(() => {
    if (slug) {
      try {
        localStorage.setItem(`gg-checkpoints-${userKey}-${slug}`, JSON.stringify(completedCheckpoints));
        localStorage.setItem(`gg-quiz-ans-${userKey}-${slug}`, JSON.stringify(userAnswers));
      } catch { }
    }
  }, [completedCheckpoints, userAnswers, slug, userKey]);

  const pick = (o) => {
    if (!o) return '';
    if (typeof o === 'string') return o;
    if (typeof o === 'object') return o[lang] || o.en || o.mr || Object.values(o)[0] || '';
    return String(o);
  };

  const defaultCourse = DEFAULT_COURSES.find(c => c && c.slug === (course?.slug || slug));
  const rawLessons = (Array.isArray(course?.lessons) && course.lessons.length > 0)
    ? course.lessons.filter(l => {
      const t = l?.t || l?.title;
      return ![
        'Welcome & how entrepreneurship works',
        'Finding a business idea that fits you',
        'Why every business needs a plan',
        'One-page business plan',
      ].includes(t);
    })
    : [];

  const sectionLessons = Array.isArray(course?.sections)
    ? course.sections.flatMap(s => (Array.isArray(s?.lessons) ? s.lessons : []))
    : [];

  const courseHasVideo = Boolean(
    course?.youtubeVideoId || course?.youtubeUrl || course?.youtube || course?.videoUrl || course?.file
  );

  const effectiveLessonsSource = rawLessons.length > 0
    ? rawLessons
    : (sectionLessons.length > 0
      ? sectionLessons
      : (courseHasVideo ? [{
        title: typeof course?.title === 'string' ? course.title : (course?.title?.en || 'Course Video Lesson'),
        t: typeof course?.title === 'string' ? course.title : (course?.title?.en || 'Course Video Lesson'),
        youtubeVideoId: course?.youtubeVideoId || extractYoutubeId(course?.youtubeUrl),
        youtubeUrl: course?.youtubeUrl || '',
        videoUrl: course?.videoUrl || course?.file || '',
        startTime: '00:00:00',
        min: 15,
        section: 'Course Content',
      }] : []));

  const lessonsList = effectiveLessonsSource.length > 0 ? effectiveLessonsSource.map((l, globalIdx) => ({
    ...l,
    globalIndex: globalIdx,
    t: l?.title || l?.t || `Chapter ${globalIdx + 1}`,
    section: (l?.section || l?.chapter || 'Course Content').trim(),
    file: course?.videoUrl || course?.file || l?.file || l?.videoUrl || defaultCourse?.lessons?.find(dl => dl?.t === l?.t)?.file || '',
    youtube: course?.youtubeUrl || course?.youtubeVideoId || course?.youtube || l?.youtube || l?.youtubeVideoId || l?.youtubeUrl || defaultCourse?.lessons?.find(dl => dl?.t === l?.t)?.youtube || '',
    youtubeVideoId: course?.youtubeVideoId || extractYoutubeId(course?.youtubeUrl) || l?.youtubeVideoId || extractYoutubeId(l?.youtube) || '',
    youtubeUrl: course?.youtubeUrl || l?.youtubeUrl || '',
    thumbnail: l?.thumbnail || l?.thumbnailUrl || course?.thumbnailUrl || course?.image || null,
    thumbnailUrl: l?.thumbnailUrl || l?.thumbnail || course?.thumbnailUrl || course?.image || null,
    min: Number(l?.min) || 10,
    startTime: l?.startTime !== undefined ? parseTimeToSeconds(l.startTime) : (globalIdx * 600),
    endTime: l?.endTime !== undefined ? parseTimeToSeconds(l.endTime) : (effectiveLessonsSource[globalIdx + 1]?.startTime !== undefined ? parseTimeToSeconds(effectiveLessonsSource[globalIdx + 1].startTime) : 999999),
    isPreview: l?.isPreview !== undefined ? !!l.isPreview : (course?.isFree || globalIdx === 0),
    notesUrl: l?.notesUrl || l?.noteUrl || null,
    noteUrl: l?.notesUrl || l?.noteUrl || null,
    notesName: (() => {
      const raw = l?.notesName || l?.noteName;
      if (raw && !/^note_[0-9a-z_-]+/i.test(String(raw).trim()) && !/[0-9a-f]{8}-[0-9a-f]{4}/i.test(String(raw).trim())) {
        return String(raw).trim();
      }
      return (l?.notesUrl || l?.noteUrl) ? `Chapter-${globalIdx + 1}-Notes.pdf` : null;
    })(),
    noteName: (() => {
      const raw = l?.notesName || l?.noteName;
      if (raw && !/^note_[0-9a-z_-]+/i.test(String(raw).trim()) && !/[0-9a-f]{8}-[0-9a-f]{4}/i.test(String(raw).trim())) {
        return String(raw).trim();
      }
      return (l?.notesUrl || l?.noteUrl) ? `Chapter-${globalIdx + 1}-Notes.pdf` : null;
    })(),
    notesSize: l?.notesSize || null,
    notesExt: l?.notesExt || null,
  })) : [];

  // Resume position: auto-select active chapter corresponding to initialSeekTime
  useEffect(() => {
    if (initialSeekTime > 0 && lessonsList.length > 0 && !hasAppliedResumeRef.current) {
      hasAppliedResumeRef.current = true;
      for (let i = 0; i < lessonsList.length; i++) {
        const start = parseTimeToSeconds(lessonsList[i].startTime);
        const next = lessonsList[i + 1];
        const end = next && next.startTime !== undefined ? parseTimeToSeconds(next.startTime) : 999999;
        if (initialSeekTime >= start && initialSeekTime < end) {
          setIdx(i);
          break;
        }
      }
    }
  }, [initialSeekTime, lessonsList]);

  // Default business curriculum data (as shown in business planning & financial management)
  const BUSINESS_DEFAULT_LEARN = useMemo(() => [
    'Understand the importance of tracking business expenses.',
    'Identify and reduce unnecessary costs.',
    'Improve resource utilization and operational efficiency.',
    'Apply basic cost management techniques.',
    'Understand how expense control helps increase business profitability.',
  ], []);

  const BUSINESS_DEFAULT_REQUIREMENTS = useMemo(() => [
    'An interest in entrepreneurship and business growth is recommended.',
    'A willingness to learn about expense management and profitability.',
    'Students should watch the complete video and attempt the assessment questions.',
  ], []);

  const BUSINESS_DEFAULT_DESC =
    'Plan, budget, track expenses and manage cash flow with simple practical tools to reduce costs, increase profitability, and grow your business.';

  // Detect whether current course or active playlist belongs to Business / Financial Management
  const isBusinessContext = useMemo(() => {
    const courseTitles = course?.title
      ? (typeof course.title === 'string' ? [course.title] : Object.values(course.title))
      : [];

    const playlistVideoTitles = Array.isArray(activePlaylist?.videos)
      ? activePlaylist.videos.flatMap((v) => [v?.title, v?.description])
      : [];

    const textsToCheck = [
      slug,
      course?.slug,
      course?.category,
      course?.courseName,
      ...courseTitles,
      activePlaylist?.title,
      activePlaylist?.category,
      activePlaylist?.courseName,
      activePlaylist?.courseSlug,
      activePlaylist?.description,
      activePlaylistVideo?.title,
      activePlaylistVideo?.description,
      ...playlistVideoTitles,
    ]
      .filter(Boolean)
      .map((s) => String(s).toLowerCase());

    const businessRegex = /(business|bussiness|bussines|busines|finance|financial|entrepreneur|startup)/i;
    return textsToCheck.some((s) => businessRegex.test(s));
  }, [slug, course, activePlaylist, activePlaylistVideo]);

  const effectiveDescription = useMemo(() => {
    const rawDesc = pick(course?.description) || pick(course?.shortDescription) || pick(course?.short);
    if (isBusinessContext) {
      if (!rawDesc || /confidence|leadership|mindset|no course description/i.test(rawDesc)) {
        return BUSINESS_DEFAULT_DESC;
      }
    }
    return rawDesc || 'No course description available.';
  }, [course, isBusinessContext, lang]);

  const rawLearn = course?.learn || defaultCourse?.learn;
  const learnList = useMemo(() => {
    let list = Array.isArray(rawLearn)
      ? rawLearn
      : typeof rawLearn === 'string'
        ? rawLearn.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
        : [];

    if (isBusinessContext) {
      const hasLeadershipItems = list.some((item) =>
        /set goals|discipline|lead and work|failure positively|leadership|confidence/i.test(String(item))
      );
      if (list.length === 0 || hasLeadershipItems || list.includes('Hands-on practical skills')) {
        return BUSINESS_DEFAULT_LEARN;
      }
    }
    return list.length > 0 ? list : ['Hands-on practical skills', 'Real-world examples & step-by-step tutorial'];
  }, [rawLearn, isBusinessContext, BUSINESS_DEFAULT_LEARN]);

  const rawRequirements = course?.requirements || defaultCourse?.requirements;
  const requirementsList = useMemo(() => {
    let list = Array.isArray(rawRequirements)
      ? rawRequirements
      : typeof rawRequirements === 'string'
        ? rawRequirements.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
        : [];

    if (isBusinessContext) {
      if (list.length === 0 || list.some((item) => /no specific prerequisites/i.test(item))) {
        return BUSINESS_DEFAULT_REQUIREMENTS;
      }
    }
    return list;
  }, [rawRequirements, isBusinessContext, BUSINESS_DEFAULT_REQUIREMENTS]);

  const rawResources = course?.resources || defaultCourse?.resources || [];
  const resourcesList = Array.isArray(rawResources) ? rawResources : [];

  // Notes ONLY (PDF, DOC, DOCX) as required by LMS specification, aggregated from course resources & lesson notes (or playlist videos & chapters)
  const notesList = useMemo(() => {
    if (isPlaylistMode && activePlaylist?.videos) {
      const list = [];
      const seenUrls = new Set();

      activePlaylist.videos.forEach((vid, vIdx) => {
        const videoNum = vIdx + 1;
        const videoTitle = vid?.title || `Video ${videoNum}`;

        // 1. Video-level notes
        const vUrl = (vid?.notesUrl || vid?.noteUrl || vid?.file || vid?.url || '').trim();
        if (vUrl) {
          const normUrl = vUrl.toLowerCase().split('?')[0];
          if (!seenUrls.has(normUrl)) {
            seenUrls.add(normUrl);
            const vName = vid?.notesName || vid?.noteName || vUrl.split('/').pop()?.split('?')[0] || `Video ${videoNum} Notes.pdf`;
            const vExt = (vid?.notesExt || vid?.ext || vName.split('.').pop() || 'PDF').toUpperCase();
            const vSize = vid?.notesSize || vid?.size || '';
            const contextLabel = `Video ${videoNum} · ${videoTitle}`;

            list.push({
              title: videoTitle,
              t: videoTitle,
              name: vName,
              notesName: vName,
              noteName: vName,
              url: vUrl,
              notesUrl: vUrl,
              noteUrl: vUrl,
              file: vUrl,
              size: vSize,
              notesSize: vSize,
              ext: vExt,
              notesExt: vExt,
              contextLabel,
              chapterTitle: contextLabel,
              type: 'video_note',
              videoIndex: vIdx,
            });
          }
        }

        // 2. Chapter-level notes in video.chapters
        if (Array.isArray(vid?.chapters)) {
          vid.chapters.forEach((ch, chIdx) => {
            const chUrl = (ch?.notesUrl || ch?.noteUrl || ch?.file || ch?.url || '').trim();
            if (chUrl) {
              const normChUrl = chUrl.toLowerCase().split('?')[0];
              if (!seenUrls.has(normChUrl)) {
                seenUrls.add(normChUrl);
                const chapterNum = chIdx + 1;
                const chapterTitle = ch?.title || ch?.t || `Chapter ${chapterNum}`;
                const chName = ch?.notesName || ch?.noteName || chUrl.split('/').pop()?.split('?')[0] || `Chapter ${chapterNum} Notes.pdf`;
                const chExt = (ch?.notesExt || ch?.ext || chName.split('.').pop() || 'PDF').toUpperCase();
                const chSize = ch?.notesSize || ch?.size || '';
                const contextLabel = `Video ${videoNum} · Chapter ${chapterNum}: ${chapterTitle}`;

                list.push({
                  title: chapterTitle,
                  t: chapterTitle,
                  name: chName,
                  notesName: chName,
                  noteName: chName,
                  url: chUrl,
                  notesUrl: chUrl,
                  noteUrl: chUrl,
                  file: chUrl,
                  size: chSize,
                  notesSize: chSize,
                  ext: chExt,
                  notesExt: chExt,
                  contextLabel,
                  chapterTitle: contextLabel,
                  type: 'chapter_note',
                  videoIndex: vIdx,
                  chapterIndex: chIdx,
                });
              }
            }
          });
        }
      });

      // 3. Optional General Playlist Resources (if attached to activePlaylist.resources)
      if (Array.isArray(activePlaylist?.resources)) {
        activePlaylist.resources.forEach((res, rIdx) => {
          const rUrl = (typeof res === 'string' ? res : (res?.url || res?.file || '')).trim();
          if (rUrl) {
            const normRUrl = rUrl.toLowerCase().split('?')[0];
            if (!seenUrls.has(normRUrl)) {
              seenUrls.add(normRUrl);
              const rName = typeof res === 'string' ? rUrl.split('/').pop()?.split('?')[0] : (res?.name || res?.title || `Playlist Resource ${rIdx + 1}`);
              const rExt = (res?.ext || rName.split('.').pop() || 'PDF').toUpperCase();
              const rSize = res?.size || '';
              const contextLabel = 'Playlist Resource';

              list.push({
                title: rName,
                t: rName,
                name: rName,
                notesName: rName,
                noteName: rName,
                url: rUrl,
                notesUrl: rUrl,
                noteUrl: rUrl,
                file: rUrl,
                size: rSize,
                notesSize: rSize,
                ext: rExt,
                notesExt: rExt,
                contextLabel,
                chapterTitle: contextLabel,
                type: 'playlist_resource',
              });
            }
          }
        });
      }

      return list;
    }

    // Standard Course Mode (when not in playlist mode)
    const list = [];
    const seenUrls = new Set();
    const rawRes = Array.isArray(course?.resources) ? course.resources : (Array.isArray(defaultCourse?.resources) ? defaultCourse.resources : []);
    rawRes.forEach((r, idx) => {
      if (!r) return;
      const url = (typeof r === 'string' ? r : (r.url || r.file || '')).trim();
      if (!url) return;
      const normUrl = url.toLowerCase().split('?')[0];
      if (!seenUrls.has(normUrl)) {
        seenUrls.add(normUrl);
        const name = typeof r === 'string' ? url.split('/').pop()?.split('?')[0] : (r.name || r.title || `Course Notes ${idx + 1}`);
        const ext = (r.ext || name.split('.').pop() || 'PDF').toUpperCase();
        list.push({
          name,
          title: name,
          t: name,
          notesName: name,
          chapterTitle: r.chapterTitle || 'Course Resource',
          contextLabel: r.chapterTitle || 'Course Resource',
          url,
          notesUrl: url,
          file: url,
          size: r.size || '',
          notesSize: r.size || '',
          ext,
          notesExt: ext,
          type: 'course_note',
        });
      }
    });

    lessonsList.forEach((l, lIdx) => {
      const lUrl = (l?.notesUrl || l?.noteUrl || l?.note || '').trim();
      if (!lUrl) return;
      const normUrl = lUrl.toLowerCase().split('?')[0];
      const lName = l?.notesName || l?.noteName || lUrl.split('/').pop()?.split('?')[0] || `Chapter ${lIdx + 1} Notes.pdf`;
      const chapterTitle = `Chapter ${lIdx + 1} — ${l.t || l.title || `Chapter ${lIdx + 1}`}`;
      const ext = (l.notesExt || l.ext || lName.split('.').pop() || 'PDF').toUpperCase();
      const sizeInfo = l.notesSize || l.size || '';

      const existingIndex = list.findIndex((r) => r.url.toLowerCase().split('?')[0] === normUrl);
      if (existingIndex >= 0) {
        if (!list[existingIndex].chapterTitle || list[existingIndex].chapterTitle === 'Course Resource') {
          list[existingIndex].chapterTitle = chapterTitle;
          list[existingIndex].contextLabel = chapterTitle;
        }
        if (lName && (!list[existingIndex].name || list[existingIndex].name.startsWith('Course Notes'))) {
          list[existingIndex].name = lName;
          list[existingIndex].title = lName;
          list[existingIndex].t = lName;
          list[existingIndex].notesName = lName;
        }
        if (l.notesSize) {
          list[existingIndex].size = sizeInfo;
          list[existingIndex].notesSize = sizeInfo;
        }
      } else {
        seenUrls.add(normUrl);
        list.push({
          name: lName,
          title: lName,
          t: lName,
          notesName: lName,
          chapterTitle,
          contextLabel: chapterTitle,
          url: lUrl,
          notesUrl: lUrl,
          file: lUrl,
          size: sizeInfo,
          notesSize: sizeInfo,
          ext,
          notesExt: ext,
          type: 'chapter_note',
        });
      }
    });

    return list.filter((r) => {
      const name = typeof r === 'string' ? r : (r?.name || r?.title || r?.file || '');
      return /\.(pdf|docx?|xlsx?|pptx?|txt)$/i.test(name) || (typeof r === 'object' && (['PDF', 'DOC', 'DOCX', 'XLS', 'XLSX', 'PPT', 'PPTX'].includes(r?.ext?.toUpperCase()) || r?.type === 'note' || r?.type === 'chapter_note' || r?.type === 'course_note' || r?.url));
    });
  }, [course?.resources, defaultCourse?.resources, lessonsList, isPlaylistMode, activePlaylist]);

  const isPreviewLesson = (l, i) => Boolean(user && (course?.isFree || l?.isPreview || l?.freePreview));
  const isEnrolledAndValid = Boolean(user && (!courseValidity || !courseValidity.isExpired));

  const handleRenewOrEnroll = async () => {
    if (!user) {
      navigate(`/login?redirect=/courses/${encodeURIComponent(slug)}`);
      return;
    }
    try {
      const res = await api.enrollCourse(slug);
      if (res) {
        setCourseValidity(res);
        if (res.learners !== undefined) {
          setCourse((prev) => prev ? { ...prev, learners: res.learners } : prev);
        }
      }
    } catch (err) {
      console.error('Enrollment error:', err);
    }
  };

  const lesson = lessonsList[idx] || lessonsList[0] || null;
  const isLessonLocked = !user || Boolean(lesson && !isEnrolledAndValid && !isPreviewLesson(lesson, idx));

  // Dynamically resolve active video ID & title for both playlist and single-video/chapter courses
  const activeVideoId = useMemo(() => {
    if (isPlaylistMode) {
      return (
        activePlaylistVideo?.id ||
        activePlaylistVideo?.videoId ||
        (activePlaylist?.id ? `${activePlaylist.id}-v${activePlaylistVideoIndex}` : null)
      );
    }
    return (
      lesson?.id ||
      lesson?.youtubeVideoId ||
      lesson?.chapterId ||
      course?.videos?.[0]?.id ||
      course?.youtubeVideoId ||
      (course?.slug ? `${course.slug}-v1` : null) ||
      course?.id
    );
  }, [isPlaylistMode, activePlaylistVideo, activePlaylist, activePlaylistVideoIndex, lesson, course]);

  const activeVideoTitle = useMemo(() => {
    if (isPlaylistMode) {
      return activePlaylistVideo?.title || 'Playlist Video';
    }
    return (
      lesson?.t ||
      lesson?.title ||
      course?.videos?.[0]?.title ||
      (typeof course?.title === 'string' ? course?.title : course?.title?.en) ||
      'Course Video'
    );
  }, [isPlaylistMode, activePlaylistVideo, lesson, course]);

  const activeYoutubeVideoId = useMemo(() => {
    if (isPlaylistMode) {
      return (
        extractYoutubeId(activePlaylistVideo?.youtubeVideoId) ||
        extractYoutubeId(activePlaylistVideo?.youtubeUrl) ||
        extractYoutubeId(activePlaylistVideo?.videoId) ||
        null
      );
    }
    return (
      extractYoutubeId(lesson?.youtubeVideoId) ||
      extractYoutubeId(lesson?.youtubeUrl) ||
      extractYoutubeId(lesson?.youtube) ||
      extractYoutubeId(course?.youtubeVideoId) ||
      extractYoutubeId(course?.youtubeUrl) ||
      extractYoutubeId(course?.youtube) ||
      extractYoutubeId(course?.videos?.[0]?.youtubeVideoId) ||
      null
    );
  }, [isPlaylistMode, activePlaylistVideo, lesson, course]);

  useEffect(() => {
    if (!activeVideoId || !user) {
      setVideoAssignedTask(null);
      return;
    }
    let isMounted = true;
    api.getTaskByVideo(activeVideoId, {
      courseSlug: course?.slug,
      playlistId: activePlaylist?.id,
      videoTitle: activeVideoTitle,
      youtubeVideoId: activeYoutubeVideoId,
    })
      .then((task) => {
        if (isMounted) setVideoAssignedTask(task || null);
      })
      .catch(() => {
        if (isMounted) setVideoAssignedTask(null);
      });
    return () => {
      isMounted = false;
    };
  }, [activeVideoId, user?.id, activePlaylist?.id, activeVideoTitle, course?.slug, isPlaylistMode, activeYoutubeVideoId]);

  const activeLessonProgressKey = isPlaylistMode ? String(activePlaylistVideoIndex) : String(idx);
  const activeMaxWatchedSec = useMemo(() => {
    const byIdx = Number(lessonMaxWatched?.[activeLessonProgressKey]) || 0;
    const byVid = activeVideoId ? (Number(lessonMaxWatched?.[String(activeVideoId)]) || 0) : 0;
    return Math.max(byIdx, byVid, 0);
  }, [lessonMaxWatched, activeLessonProgressKey, activeVideoId]);

  const totalVideosCount = useMemo(() => {
    if (isPlaylistMode) return Math.max(activePlaylist?.videos?.length || 1, 1);
    return Math.max(lessonsList.length || 1, 1);
  }, [isPlaylistMode, activePlaylist, lessonsList.length]);

  const completedVideosCount = useMemo(() => {
    if (isPlaylistMode) return playlistWatchedCount;
    return done.length;
  }, [isPlaylistMode, playlistWatchedCount, done.length]);

  const allVideosCompleted = useMemo(() => {
    if (certificateStatus?.allVideosCompleted) return true;
    return totalVideosCount > 0 && completedVideosCount >= totalVideosCount;
  }, [certificateStatus?.allVideosCompleted, totalVideosCount, completedVideosCount]);

  const mcqsRequiredForCert = useMemo(() => {
    if (certificateStatus?.mcqsRequired !== undefined) return Boolean(certificateStatus.mcqsRequired);
    return allQuestions.length > 0 && assessmentSettings?.enabled !== false;
  }, [certificateStatus?.mcqsRequired, allQuestions.length, assessmentSettings?.enabled]);

  const mcqsPassedForCert = useMemo(() => {
    if (!mcqsRequiredForCert) return true;
    if (certificateStatus?.mcqsPassed) return true;
    const entityKey = isPlaylistMode ? `pl_${activePlaylist?.id || 'pl'}_v${activePlaylistVideoIndex}_end` : `${slug}_v${idx}_end`;
    return Boolean(completedCheckpoints[entityKey]);
  }, [mcqsRequiredForCert, certificateStatus?.mcqsPassed, isPlaylistMode, activePlaylist?.id, activePlaylistVideoIndex, slug, idx, completedCheckpoints]);

  const projectRequiredForCert = useMemo(() => {
    if (certificateStatus?.projectRequired !== undefined) return Boolean(certificateStatus.projectRequired);
    return course?.requireProjectForCertificate !== false;
  }, [certificateStatus?.projectRequired, course?.requireProjectForCertificate]);

  const projectVerifiedForCert = useMemo(() => {
    if (!projectRequiredForCert) return true;
    if (certificateStatus?.projectVerified) return true;
    const st = videoAssignedTask?.status;
    return (
      st === 'APPROVED' ||
      st === 'VERIFIED' ||
      st === 'approved' ||
      st === 'verified' ||
      st === 'reviewed' ||
      videoAssignedTask?.verifiedBy === 'SYSTEM_AUTO_VERIFY'
    );
  }, [projectRequiredForCert, certificateStatus?.projectVerified, videoAssignedTask]);

  const isTaskTabUnlocked = allVideosCompleted && mcqsPassedForCert;
  const isCertificateUnlocked = Boolean(
    courseCertificate ||
    certificateStatus?.certificate ||
    (allVideosCompleted && mcqsPassedForCert && projectVerifiedForCert)
  );

  const toggleDone = (i) => {
    const isNowDone = !done.includes(i);
    const next = done.includes(i) ? done.filter((d) => d !== i) : [...done, i];
    setDone(next);
    try { localStorage.setItem(`gg-done-${userKey}-${slug}`, JSON.stringify(next)); } catch { /* ignore */ }

    if (user?.id && slug) {
      api.saveCourseProgress(slug, {
        lessonIndex: i,
        lessonTitle: lessonsList[i]?.t || `Lesson ${i + 1}`,
        markLessonDone: isNowDone,
      })
        .then((res) => {
          if (res?.certificate) setCourseCertificate(res.certificate);
          if (res?.certificateStatus) setCertificateStatus(res.certificateStatus);
        })
        .catch(() => { });
    }
  };

  const handlePrevLesson = () => {
    if (!user) {
      navigate(`/login?redirect=/courses/${encodeURIComponent(slug)}`);
      return;
    }
    if (idx > 0) {
      handleChapterClick(idx - 1);
    }
  };

  const handleNextLesson = () => {
    if (!user) {
      navigate(`/login?redirect=/courses/${encodeURIComponent(slug)}`);
      return;
    }
    if (idx < lessonsList.length - 1) {
      const nextLesson = lessonsList[idx + 1];
      if (!isEnrolledAndValid && !isPreviewLesson(nextLesson, idx + 1)) {
        alert('This lesson is locked. Please enroll to access all lessons.');
        return;
      }
      if (isStrictNonSkippable && !done.includes(idx) && idx + 1 > unlockedLessonIndex) {
        triggerSkipBlockedToast('Skipping ahead is disabled. Please watch the full lesson to unlock the next step.');
        return;
      }
      handleChapterClick(idx + 1);
    }
  };

  const handleCompleteAndNext = () => {
    if (!user) {
      navigate(`/login?redirect=/courses/${encodeURIComponent(slug)}`);
      return;
    }
    if (!done.includes(idx)) {
      toggleDone(idx);
    }
    if (idx < lessonsList.length - 1) {
      const nextLesson = lessonsList[idx + 1];
      if (!isEnrolledAndValid && !isPreviewLesson(nextLesson, idx + 1)) {
        alert('Lesson marked completed! Next lesson is locked. Please enroll to continue.');
        return;
      }
      handleChapterClick(idx + 1);
    }
  };

  const scrollToTab = (tabId, elementId) => {
    setActiveTab(tabId);
    const el = document.getElementById(elementId);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth',
      });
    }
  };

  const pct = lessonsList.length > 0 ? Math.round((done.length / lessonsList.length) * 100) : 0;
  const allCourses = getCourses() || DEFAULT_COURSES;
  const related = (allCourses || []).filter((c) => c && c.slug !== slug && course && c.category === course.category)
    .concat((allCourses || []).filter((c) => c && c.slug !== slug && (!course || c.category !== course.category)))
    .slice(0, 3);

  // Group actual course lessons into sections for dynamic curriculum panel
  const curriculumSections = useMemo(() => {
    if (!lessonsList || lessonsList.length === 0) return [];

    // 1. Check if course has explicit sections array
    if (Array.isArray(course?.sections) && course.sections.length > 0) {
      return course.sections.map((sec, sIdx) => {
        const rawSecName = typeof sec === 'string' ? sec : (sec.title || sec.name || `Section ${sIdx + 1}`);
        const isNumbered = /^section\s+\d+/i.test(rawSecName.trim());
        const displayTitle = isNumbered ? rawSecName.trim() : `Section ${sIdx + 1} — ${rawSecName.trim()}`;

        let secLessons = [];
        if (Array.isArray(sec.lessons) && sec.lessons.length > 0) {
          secLessons = sec.lessons.map((sl) => {
            const foundIdx = lessonsList.findIndex((l) => l.t === sl.t || (sl.file && l.file === sl.file) || (sl.youtubeVideoId && l.youtubeVideoId === sl.youtubeVideoId));
            return { ...(foundIdx >= 0 ? lessonsList[foundIdx] : sl), globalIndex: foundIdx >= 0 ? foundIdx : 0 };
          });
        } else {
          secLessons = lessonsList.filter((l) => l.section && l.section.toLowerCase().trim() === rawSecName.toLowerCase().trim());
        }

        return {
          id: sec.id || `section-${sIdx + 1}`,
          title: displayTitle,
          rawTitle: rawSecName,
          lessons: secLessons,
        };
      });
    }

    // 2. Check if lessons have section property
    const hasSectionProp = lessonsList.some((l) => Boolean(l.section));
    if (hasSectionProp) {
      const map = new Map();
      lessonsList.forEach((l, globalIdx) => {
        const secName = (l.section || 'General Lessons').trim();
        if (!map.has(secName)) {
          map.set(secName, []);
        }
        map.get(secName).push({ ...l, globalIndex: globalIdx });
      });

      const sections = [];
      let sNum = 1;
      for (const [secName, sLessons] of map.entries()) {
        const isNumbered = /^section\s+\d+/i.test(secName);
        const displayTitle = isNumbered ? secName : `Section ${sNum} — ${secName}`;
        sections.push({
          id: `sec-${sNum}`,
          title: displayTitle,
          rawTitle: secName,
          lessons: sLessons,
        });
        sNum++;
      }
      return sections;
    }

    // 3. Fallback for courses without sections: group under single clean section
    return [
      {
        id: 'section-1',
        title: 'Section 1 — Course Content',
        rawTitle: 'Course Content',
        lessons: lessonsList.map((l, globalIdx) => ({ ...l, globalIndex: globalIdx })),
      },
    ];
  }, [lessonsList, course?.sections]);

  // Rating breakdown 5-star to 1-star
  const ratingDistribution = useMemo(() => {
    const reviews = Array.isArray(ratingStats?.reviews) ? ratingStats.reviews : [];
    const total = reviews.length;
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rounded = Math.min(5, Math.max(1, Math.round(Number(r.rating) || 5)));
      counts[rounded] = (counts[rounded] || 0) + 1;
    });
    return [5, 4, 3, 2, 1].map((star) => ({
      star,
      count: counts[star],
      pct: total > 0 ? Math.round((counts[star] / total) * 100) : 0,
    }));
  }, [ratingStats.reviews]);

  // Flexible assessment configuration for this course / playlist
  const allQuestions = useMemo(() => {
    if (isPlaylistMode) {
      if (Array.isArray(activePlaylistVideo?.assessments) && activePlaylistVideo.assessments.length > 0) {
        return activePlaylistVideo.assessments;
      }
      if (Array.isArray(activePlaylist?.assessments) && activePlaylist.assessments.length > 0) {
        return activePlaylist.assessments;
      }
      return [];
    }
    try {
      const local = JSON.parse(localStorage.getItem(`course_assessments_${slug}`));
      if (Array.isArray(local) && local.length > 0) return local;
    } catch { }
    if (Array.isArray(course?.assessments) && course.assessments.length > 0) {
      return course.assessments;
    }
    return [];
  }, [course, slug, isPlaylistMode, activePlaylist, activePlaylistVideo]);

  const assessmentSettings = useMemo(() => {
    if (isPlaylistMode) {
      return activePlaylist?.assessmentSettings || { enabled: true, passingScore: 70 };
    }
    try {
      const local = JSON.parse(localStorage.getItem(`course_assessment_settings_${slug}`));
      if (local && typeof local === 'object') return local;
    } catch { }
    return course?.assessmentSettings || { enabled: true };
  }, [course, slug, isPlaylistMode, activePlaylist]);


  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    setVideoDuration(0);
  }, [slug]);

  // Duration in seconds for the currently active lesson / video
  const currentLessonDuration = useMemo(() => {
    if (isPlaylistMode && activePlaylistVideo?.duration) {
      const sec = parseTimeToSeconds(activePlaylistVideo.duration);
      if (sec > 0) return sec;
    }
    if (lesson?.endTime && lesson?.startTime !== undefined && lesson.endTime > lesson.startTime) {
      return lesson.endTime - lesson.startTime;
    }
    return (Number(lesson?.min) || 10) * 60;
  }, [lesson, isPlaylistMode, activePlaylistVideo]);

  // Determine if this course uses a single continuous video with chapters,
  // or distinct video files per lesson
  const isContinuousVideo = useMemo(() => {
    const hasTimestamps = lessonsList.length > 1 && lessonsList.every((l) => l.startTime !== undefined && l.endTime !== undefined);
    if (!hasTimestamps) return false;
    const firstFile = lessonsList[0]?.file || lessonsList[0]?.videoUrl;
    return !!firstFile && lessonsList.every((l) => (l.file || l.videoUrl) === firstFile);
  }, [lessonsList, course?.slug]);

  // Active questions for the current video player - only exists if admin created assessments for this video
  const activeQuestions = useMemo(() => {
    if (assessmentSettings?.enabled === false) return [];

    if (isPlaylistMode) {
      // If active video has its own assessments array, return all of them
      if (Array.isArray(activePlaylistVideo?.assessments) && activePlaylistVideo.assessments.length > 0) {
        return activePlaylistVideo.assessments;
      }
      // Otherwise, filter from activePlaylist assessments for this specific video
      return allQuestions.filter((q) => {
        if (q.videoIndex !== undefined && q.videoIndex !== null) {
          return Number(q.videoIndex) === Number(activePlaylistVideoIndex);
        }
        if (q.videoId && activePlaylistVideo?.id) {
          return String(q.videoId) === String(activePlaylistVideo.id);
        }
        if (q.videoTitle && activePlaylistVideo?.title) {
          return q.videoTitle.toLowerCase().trim() === activePlaylistVideo.title.toLowerCase().trim();
        }
        return false;
      });
    }

    return allQuestions.filter((q) => {
      // If course uses single continuous video (all chapters share 1 video) or has 1 lesson, all questions apply
      if (isContinuousVideo || lessonsList.length <= 1) {
        return true;
      }
      if (q.videoIndex !== undefined && q.videoIndex !== null) {
        return Number(q.videoIndex) === Number(idx);
      }
      if (q.videoTitle && lesson?.t) {
        return q.videoTitle.toLowerCase().trim() === lesson.t.toLowerCase().trim();
      }
      return true;
    });
  }, [allQuestions, assessmentSettings, idx, lesson, isContinuousVideo, lessonsList.length, isPlaylistMode, activePlaylistVideo, activePlaylistVideoIndex]);

  const endQuestions = useMemo(() => {
    return activeQuestions.filter((q) => q.triggerType === 'end' || q.part === 2);
  }, [activeQuestions]);

  const midQuestions = useMemo(() => {
    return activeQuestions.filter((q) => q.triggerType !== 'end' && q.part !== 2);
  }, [activeQuestions]);

  const hasAssessment = activeQuestions.length > 0 && assessmentSettings?.enabled !== false;

  const pauseAllPlayers = () => {
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch { }
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
      try { ytPlayerRef.current.pauseVideo(); } catch { }
    }
  };

  const seekAllPlayers = (seconds) => {
    if (videoRef.current) {
      try { videoRef.current.currentTime = seconds; } catch { }
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
      try { ytPlayerRef.current.seekTo(seconds); } catch { }
    }
  };

  const playAllPlayers = () => {
    if (videoRef.current) {
      try { videoRef.current.play().catch(() => { }); } catch { }
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
      try { ytPlayerRef.current.playVideo(); } catch { }
    }
  };

  const saveResumePosition = useCallback((timeSec) => {
    if (!slug || typeof timeSec !== 'number' || isNaN(timeSec) || timeSec < 0) return;
    try {
      const rKey = `gg-resume-${userKey}-${slug}`;
      localStorage.setItem(rKey, JSON.stringify({
        position: Math.round(timeSec),
        chapterIndex: idx,
        updatedAt: Date.now(),
      }));
    } catch { }
  }, [slug, userKey, idx]);

  const flushActualWatchTime = useCallback((force = false) => {
    if (!slug) return;
    const delta = accumulatedWatchDeltaRef.current;
    if (delta < 0.8 && !force) return;
    const roundedDelta = Math.round(delta);
    if (roundedDelta <= 0 && !force) return;

    accumulatedWatchDeltaRef.current = Math.max(0, delta - roundedDelta);
    lastProgressSyncWallTimeRef.current = Date.now();

    // 1. Update user-scoped localStorage
    const storageKey = `gg-actual-watchtime-${userKey}-${slug}`;
    const prev = Number(localStorage.getItem(storageKey)) || actualWatchedSecRef.current || 0;
    const updated = prev + roundedDelta;
    actualWatchedSecRef.current = updated;
    try {
      localStorage.setItem(storageKey, String(updated));
    } catch { }

    // 2. Sync to Backend Database if logged in
    if (user?.id) {
      const isPlMode = Boolean(activePlaylistRef.current && activePlaylistRef.current.videos);
      const curPlVid = isPlMode ? activePlaylistRef.current.videos[activePlaylistVideoIndexRef.current] : null;

      api.saveCourseProgress(slug, {
        sessionId: watchSessionIdRef.current,
        isNewSession: false,
        watchTimeDeltaSec: roundedDelta,
        watchTimeSec: updated,
        lastPositionSec: Math.round(prevTimeRef.current || 0),
        watchedSeconds: Math.round(prevTimeRef.current || 0),
        durationSeconds: Math.round(videoDuration || currentLessonDuration || 0),
        lessonIndex: isPlMode ? activePlaylistVideoIndexRef.current : idx,
        lessonTitle: isPlMode ? (curPlVid?.title || `Video ${activePlaylistVideoIndexRef.current + 1}`) : (lessonsList[idx]?.t || ''),
        videoId: isPlMode ? (curPlVid?.id || curPlVid?.videoId || `${activePlaylistRef.current.id}_v${activePlaylistVideoIndexRef.current}`) : `${slug}_v${idx}`,
      })
        .then((res) => {
          if (res?.certificate) setCourseCertificate(res.certificate);
          if (res?.certificateStatus) setCertificateStatus(res.certificateStatus);
          if (typeof res?.unlockedLessonIndex === 'number') setUnlockedLessonIndex(res.unlockedLessonIndex);
        })
        .catch(() => { });
    }

    // 3. Keep course_views updated with ACTUAL watch time (NOT video duration!)
    syncCourseView(updated);
  }, [slug, user?.id, userKey, idx, lessonsList, syncCourseView]);

  const handlePlayerPlay = useCallback(() => {
    if (!hasFiredSessionStartRef.current) {
      hasFiredSessionStartRef.current = true;
      if (!watchSessionIdRef.current) {
        watchSessionIdRef.current = 'ws_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      }
      if (user?.id && slug) {
        const isPlMode = Boolean(activePlaylistRef.current && activePlaylistRef.current.videos);
        const curPlVid = isPlMode ? activePlaylistRef.current.videos[activePlaylistVideoIndexRef.current] : null;
        const vId = isPlMode
          ? (curPlVid?.id || curPlVid?.videoId || `${activePlaylistRef.current.id}_v${activePlaylistVideoIndexRef.current}`)
          : `${slug}_v${idx}`;
        const vTitle = isPlMode
          ? (curPlVid?.title || `Video ${activePlaylistVideoIndexRef.current + 1}`)
          : (lessonsList[idx]?.t || '');

        api.saveCourseProgress(slug, {
          sessionId: watchSessionIdRef.current,
          isNewSession: true,
          videoId: vId,
          lessonIndex: isPlMode ? activePlaylistVideoIndexRef.current : idx,
          lessonTitle: vTitle,
          watchTimeDeltaSec: 0,
          watchTimeSec: actualWatchedSecRef.current || 0,
          lastPositionSec: Math.round(prevTimeRef.current || 0),
        }).catch(() => { });
      }
    }
  }, [slug, user?.id, idx, lessonsList]);

  const handlePlayerPause = () => {
    flushActualWatchTime(true);
    lastPlaybackPosRef.current = null;
    lastPlaybackWallTimeRef.current = null;

    let cur = 0;
    if (videoRef.current) cur = videoRef.current.currentTime;
    else if (ytPlayerRef.current?.getCurrentTime) {
      try { cur = ytPlayerRef.current.getCurrentTime(); } catch { }
    }
    if (cur > 0) {
      if (activePlaylistRef.current) {
        savePlaylistPosition(cur);
      } else {
        saveResumePosition(cur);
      }
    }
  };

  useEffect(() => {
    const handleBeforeUnload = () => {
      flushActualWatchTime(true);
      let cur = 0;
      if (videoRef.current) cur = videoRef.current.currentTime;
      else if (ytPlayerRef.current?.getCurrentTime) {
        try { cur = ytPlayerRef.current.getCurrentTime(); } catch { }
      }
      if (cur > 0) {
        if (activePlaylistRef.current) {
          savePlaylistPosition(cur);
        } else {
          saveResumePosition(cur);
        }
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [saveResumePosition, flushActualWatchTime]);

  // Playlist Navigation and Playback Handlers (defined after flushActualWatchTime)
  const handleSelectPlaylist = (pl, videoIdx = 0) => {
    flushActualWatchTime(true);
    accumulatedWatchDeltaRef.current = 0;
    lastPlaybackPosRef.current = null;
    lastPlaybackWallTimeRef.current = null;

    setActivePlaylist(pl);
    setActivePlaylistVideoIndex(videoIdx);
    setIsPlaylistCompleted(false);
    setExpandedPlaylistId(pl?.id || null);

    // Auto enroll playlist when learner selects or starts it
    if (user?.id && pl?.id) {
      if (typeof api?.enrollCourse === 'function') {
        api.enrollCourse(pl.id).catch(() => { });
      }
      try {
        const enrKey = `gg-enrolled-${userKey}`;
        const storedList = JSON.parse(localStorage.getItem(enrKey) || '[]');
        if (!storedList.includes(pl.id)) {
          storedList.push(pl.id);
          localStorage.setItem(enrKey, JSON.stringify(storedList));
        }
      } catch { }
    }

    try {
      const vid = pl?.videos?.[videoIdx];
      const target = vid?.id || vid?.youtubeVideoId || videoIdx;
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.set('playlist', pl.id);
      currentUrl.searchParams.set('video', target);
      window.history.replaceState({}, '', currentUrl.toString());
    } catch { }

    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleToggleExpandPlaylist = (plId) => {
    setExpandedPlaylistId((prev) => (prev === plId ? null : plId));
  };

  const handleSelectPlaylistVideo = (vIdx) => {
    if (isStrictNonSkippable && vIdx > 0 && activePlaylist?.videos) {
      const prevVid = activePlaylist.videos[vIdx - 1];
      const prevKey = prevVid?.id || (vIdx - 1);
      if (!playlistWatched[prevKey] && !playlistWatched[activePlaylist.videos[vIdx]?.id || vIdx]) {
        triggerSkipBlockedToast('Skipping ahead is disabled. Please watch the current video completely to unlock the next video.');
        return;
      }
    }
    setExpandedPlaylistVideoIndices((prev) => ({ ...prev, [vIdx]: true }));
    if (vIdx === activePlaylistVideoIndex && !isPlaylistCompleted) return;
    flushActualWatchTime(true);
    accumulatedWatchDeltaRef.current = 0;
    lastPlaybackPosRef.current = null;
    lastPlaybackWallTimeRef.current = null;

    setIsPlaylistCompleted(false);
    setActivePlaylistVideoIndex(vIdx);

    try {
      if (activePlaylist?.videos?.[vIdx]) {
        const vid = activePlaylist.videos[vIdx];
        const target = vid.id || vid.youtubeVideoId || vIdx;
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('playlist', activePlaylist.id);
        currentUrl.searchParams.set('video', target);
        window.history.replaceState({}, '', currentUrl.toString());
      }
    } catch { }
  };

  const handlePrevPlaylistVideo = () => {
    if (!activePlaylist?.videos) return;
    const prevIdx = Math.max(0, activePlaylistVideoIndex - 1);
    handleSelectPlaylistVideo(prevIdx);
  };

  const handleNextPlaylistVideo = () => {
    if (!activePlaylist?.videos) return;
    const nextIdx = Math.min(activePlaylist.videos.length - 1, activePlaylistVideoIndex + 1);
    handleSelectPlaylistVideo(nextIdx);
  };

  const handlePlaylistVideoEnded = useCallback(() => {
    const pl = activePlaylistRef.current;
    const curIdx = activePlaylistVideoIndexRef.current;
    if (!pl?.videos || !pl.videos[curIdx]) return;

    const currentVid = pl.videos[curIdx];
    const vidKey = currentVid.id || curIdx;

    // 1. Flush watch time delta before advancing
    flushActualWatchTime(true);

    // 2. Mark this video as completed in state and localStorage
    setPlaylistWatched((prev) => {
      const next = { ...prev, [vidKey]: true };
      try {
        localStorage.setItem(`gg-playlist-done-${userKey}-${pl.id}`, JSON.stringify(next));
      } catch { }
      return next;
    });

    // 3. Clear partial position for this completed video
    try {
      localStorage.removeItem(`gg-pl-pos-${userKey}-${vidKey}`);
    } catch { }

    // 4. Reset watch-time delta trackers
    accumulatedWatchDeltaRef.current = 0;
    lastPlaybackPosRef.current = null;
    lastPlaybackWallTimeRef.current = null;

    // 5. Sync completion to Backend
    if (user?.id && slug) {
      api.saveCourseProgress(slug, {
        videoId: currentVid.id || currentVid.videoId || `${pl.id}_v${curIdx}`,
        lessonTitle: currentVid.title || `Video ${curIdx + 1}`,
        lessonIndex: curIdx,
        markLessonDone: true,
        ended: true,
        watchedSeconds: Math.round(videoDuration || currentLessonDuration || 0),
        durationSeconds: Math.round(videoDuration || currentLessonDuration || 0),
      })
        .then((res) => {
          if (res?.certificate) setCourseCertificate(res.certificate);
          if (res?.certificateStatus) setCertificateStatus(res.certificateStatus);
          if (typeof res?.unlockedLessonIndex === 'number') setUnlockedLessonIndex(res.unlockedLessonIndex);
          refreshCertificateStatus();
        })
        .catch(() => { });
    }

    // 6. Advance to next video in sequential order or mark playlist complete
    const nextIdx = curIdx + 1;
    if (nextIdx < pl.videos.length) {
      setActivePlaylistVideoIndex(nextIdx);
      setIsPlaylistCompleted(false);

      try {
        const nextVid = pl.videos[nextIdx];
        const nextTarget = nextVid.id || nextVid.youtubeVideoId || nextIdx;
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('playlist', pl.id);
        currentUrl.searchParams.set('video', nextTarget);
        window.history.replaceState({}, '', currentUrl.toString());
      } catch { }
    } else {
      // All playlist videos ended
      setIsPlaylistCompleted(true);

      if (user?.id && slug) {
        api.saveCourseProgress(slug, {
          lessonTitle: `${pl.title} (Complete)`,
          markLessonDone: true,
        }).catch(() => { });
      }
    }
  }, [userKey, slug, user?.id, flushActualWatchTime]);

  const handleSkipPlaylistVideo = useCallback(() => {
    const pl = activePlaylistRef.current;
    const curIdx = activePlaylistVideoIndexRef.current;
    if (!pl?.videos) return;

    flushActualWatchTime(true);
    accumulatedWatchDeltaRef.current = 0;
    lastPlaybackPosRef.current = null;
    lastPlaybackWallTimeRef.current = null;

    const nextIdx = curIdx + 1;
    if (nextIdx < pl.videos.length) {
      setActivePlaylistVideoIndex(nextIdx);
      setIsPlaylistCompleted(false);
      try {
        const nextVid = pl.videos[nextIdx];
        const nextTarget = nextVid.id || nextVid.youtubeVideoId || nextIdx;
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('playlist', pl.id);
        currentUrl.searchParams.set('video', nextTarget);
        window.history.replaceState({}, '', currentUrl.toString());
      } catch { }
    } else {
      setIsPlaylistCompleted(true);
    }
  }, [flushActualWatchTime]);

  const handleReplayPlaylist = () => {
    setIsPlaylistCompleted(false);
    handleSelectPlaylistVideo(0);
  };

  const handleExitPlaylist = () => {
    flushActualWatchTime(true);
    setActivePlaylist(null);
    setIsPlaylistCompleted(false);
    if (isPlaylistRoute) {
      const parentCourse = activePlaylist?.courseSlug || activePlaylist?.courseId;
      if (parentCourse && parentCourse !== 'general') {
        navigate(`/courses/${encodeURIComponent(parentCourse)}`);
      } else {
        navigate('/courses');
      }
      return;
    }
    try {
      const currentUrl = new URL(window.location.href);
      currentUrl.searchParams.delete('playlist');
      currentUrl.searchParams.delete('video');
      window.history.replaceState({}, '', currentUrl.toString());
    } catch { }
  };

  // Group active questions into checkpoints (timestamp-based or end)
  const videoCheckpoints = useMemo(() => {
    const map = new Map();
    const effectiveDur = videoDuration || currentLessonDuration || 180;
    const midSec = Math.max(15, Math.floor(effectiveDur / 2));
    const entityKey = isPlaylistMode ? `pl_${activePlaylist?.id || 'pl'}` : slug;
    const curVidIdx = isPlaylistMode ? activePlaylistVideoIndex : idx;

    midQuestions.forEach((q) => {
      let sec = q.triggerType === 'timestamp' && Number(q.triggerSeconds) > 0
        ? Math.round(Number(q.triggerSeconds))
        : (q.triggerMinutes ? Math.round(Number(q.triggerMinutes) * 60 + (Number(q.triggerSeconds) || 0)) : midSec);

      const checkpointKey = `${entityKey}_v${curVidIdx}_t_${sec}`;
      const label = `⏰ Video Assessment at ${fmtTime(sec)}`;

      if (!map.has(checkpointKey)) {
        map.set(checkpointKey, {
          id: checkpointKey,
          key: checkpointKey,
          isEnd: false,
          seconds: sec,
          label,
          questions: [],
        });
      }
      map.get(checkpointKey).questions.push(q);
    });

    if (endQuestions.length > 0) {
      const endKey = `${entityKey}_v${curVidIdx}_end`;
      map.set(endKey, {
        id: endKey,
        key: endKey,
        isEnd: true,
        seconds: 999999,
        label: isPlaylistMode
          ? `🏁 Video ${curVidIdx + 1} Assessment: ${activePlaylistVideo?.title || 'Quiz'}`
          : `🏁 End-of-Video Assessment`,
        questions: endQuestions,
      });
    }

    return Array.from(map.values()).sort((a, b) => a.seconds - b.seconds);
  }, [midQuestions, endQuestions, videoDuration, currentLessonDuration, slug, idx, isPlaylistMode, activePlaylist?.id, activePlaylistVideoIndex, activePlaylistVideo?.title]);

  const sessionTriggeredRef = useRef({});
  const seekTimeoutRef = useRef(null);

  useEffect(() => {
    sessionTriggeredRef.current = {};
  }, [activePlaylistVideoIndex, isPlaylistMode]);

  const handleCheckpointClose = () => {
    // Assessments are mandatory: cannot bypass or dismiss before completion
    return;
  };

  const handleTimeUpdate = (time) => {
    const currentTime = typeof time === 'number' ? time : (videoRef.current ? videoRef.current.currentTime : 0);
    if (activeCheckpoint) return; // Prevent re-trigger while modal is visible

    if (
      !isUserSeekingRef.current &&
      (!isStrictNonSkippable || currentTime <= activeMaxWatchedSec + 5) &&
      currentTime > activeMaxWatchedSec + 1.5
    ) {
      setLessonMaxWatched((prev) => ({
        ...prev,
        [activeLessonProgressKey]: Math.floor(currentTime),
      }));
    }

    const now = Date.now();

    // Actual Playback Watch Time Tracking:
    // Only accumulate when actively playing forward in normal speed (0.05s to 3.5s per tick)
    if (!isUserSeekingRef.current) {
      if (lastPlaybackPosRef.current !== null && lastPlaybackWallTimeRef.current !== null) {
        const playDelta = currentTime - lastPlaybackPosRef.current;
        const wallDelta = (now - lastPlaybackWallTimeRef.current) / 1000;

        // Verify genuine forward playback (not a seek jump, not a tab sleep)
        if (playDelta > 0.05 && playDelta < 3.5 && wallDelta > 0.05 && wallDelta < 8.0 && playDelta <= wallDelta * 2.5) {
          accumulatedWatchDeltaRef.current += playDelta;
        }
      }
      lastPlaybackPosRef.current = currentTime;
      lastPlaybackWallTimeRef.current = now;

      // Real-time periodic flush every 2 seconds of accumulated watch time or after 3 seconds of wall time
      if (accumulatedWatchDeltaRef.current >= 2 || (now - lastProgressSyncWallTimeRef.current >= 3000 && accumulatedWatchDeltaRef.current >= 1)) {
        flushActualWatchTime();
      }
    } else {
      // If user was seeking, do NOT count time; reset markers
      lastPlaybackPosRef.current = currentTime;
      lastPlaybackWallTimeRef.current = now;
    }

    const prev = prevTimeRef.current;
    prevTimeRef.current = currentTime;

    const entityKey = isPlaylistMode ? `pl_${activePlaylist?.id || 'pl'}` : slug;
    const curVidIdx = isPlaylistMode ? activePlaylistVideoIndex : idx;
    const endTriggerKey = `${entityKey}_v${curVidIdx}_end_triggered`;

    // Reset checkpoints if user rewound or restarted before checkpoint timestamp
    const effectiveTotalDur = videoDuration || currentLessonDuration;
    videoCheckpoints.forEach((cp) => {
      if (!cp.isEnd && currentTime < cp.seconds - 15) {
        sessionTriggeredRef.current[cp.id] = false;
      }
    });
    if (currentTime < (effectiveTotalDur - 15)) {
      sessionTriggeredRef.current[endTriggerKey] = false;
    }

    // In-video checkpoint trigger:
    // Triggers when currentTime crosses or reaches cp.seconds during natural playback or forward seek
    const targetCp = videoCheckpoints.find(
      (cp) => !cp.isEnd && cp.seconds > 5 && currentTime >= cp.seconds && !sessionTriggeredRef.current[cp.id]
    );

    if (targetCp) {
      sessionTriggeredRef.current[targetCp.id] = true;
      pauseAllPlayers();
      setActiveCheckpoint(targetCp);
      return;
    }

    // End-of-Video Assessment trigger (when video reaches within 1.5s of the end):
    const isNearVideoEnd = effectiveTotalDur > 10 && currentTime >= effectiveTotalDur - 1.5;
    const questionsForEnd = endQuestions.length > 0 ? endQuestions : allQuestions.filter((q) => q.triggerType === 'end');
    if (isNearVideoEnd && questionsForEnd.length > 0 && !sessionTriggeredRef.current[endTriggerKey]) {
      sessionTriggeredRef.current[endTriggerKey] = true;
      pauseAllPlayers();
      setActiveCheckpoint({
        id: `${entityKey}_v${curVidIdx}_end`,
        label: isPlaylistMode
          ? `🏁 Video ${curVidIdx + 1} Assessment: ${activePlaylistVideo?.title || 'Quiz'}`
          : `🏁 End-of-Video Assessment`,
        isEnd: true,
        showSummaryDirectly: false,
        questions: questionsForEnd,
      });
      return;
    }

    // Throttled resume position save (every 10-15 seconds)
    if (Math.abs(currentTime - lastResumeSaveRef.current) >= 10) {
      lastResumeSaveRef.current = currentTime;
      saveResumePosition(currentTime);
    }

    // Real-time chapter sync: Highlight active chapter based on video's currentTime
    if (lessonsList.length > 0) {
      let activeChapter = -1;
      for (let i = 0; i < lessonsList.length; i++) {
        const start = parseTimeToSeconds(lessonsList[i].startTime);
        const next = lessonsList[i + 1];
        const end = next && next.startTime !== undefined ? parseTimeToSeconds(next.startTime) : 999999;
        if (currentTime >= start && currentTime < end) {
          activeChapter = i;
          break;
        }
      }
      if (activeChapter === -1 && currentTime >= (parseTimeToSeconds(lessonsList[lessonsList.length - 1]?.startTime) || 0)) {
        activeChapter = lessonsList.length - 1;
      }
      if (activeChapter !== -1 && activeChapter !== idx) {
        setIdx(activeChapter);
      }
    }

    // Automatically mark chapters as done as the user watches them through the timeline
    setDone((prevDone) => {
      let updated = [...prevDone];
      lessonsList.forEach((l, i) => {
        if (l.endTime && currentTime >= l.endTime - 2 && !updated.includes(i)) {
          updated.push(i);
        }
      });
      if (updated.length !== prevDone.length) {
        try { localStorage.setItem(`gg-done-${userKey}-${slug}`, JSON.stringify(updated)); } catch { }
        return updated;
      }
      return prevDone;
    });
  };

  const handleSeekingOrSeeked = (time) => {
    const currentTime = typeof time === 'number' ? time : (videoRef.current ? videoRef.current.currentTime : 0);
    // Flush any accumulated playback BEFORE the seek occurred
    flushActualWatchTime(true);

    isUserSeekingRef.current = true;
    lastPlaybackPosRef.current = null;
    lastPlaybackWallTimeRef.current = null;
    prevTimeRef.current = currentTime;

    if (seekTimeoutRef.current) clearTimeout(seekTimeoutRef.current);
    seekTimeoutRef.current = setTimeout(() => {
      isUserSeekingRef.current = false;
      lastPlaybackPosRef.current = null;
      lastPlaybackWallTimeRef.current = null;
    }, 1200);

    // Save resume position without adding seek jump to watch time
    saveResumePosition(currentTime);
  };

  const handleVideoEnded = () => {
    flushActualWatchTime(true);
    lastPlaybackPosRef.current = null;
    lastPlaybackWallTimeRef.current = null;

    // Mark current lesson as done
    if (!done.includes(idx)) {
      toggleDone(idx);
    }
    if (lessonsList.length > 0 && !done.includes(lessonsList.length - 1)) {
      toggleDone(lessonsList.length - 1);
    }
    if (user?.id && slug) {
      api.saveCourseProgress(slug, {
        lessonIndex: Math.max(0, lessonsList.length - 1),
        lessonTitle: lessonsList[Math.max(0, lessonsList.length - 1)]?.t || 'Course Video Completed',
        markLessonDone: true,
        ended: true,
        watchedSeconds: Math.round(videoDuration || currentLessonDuration || 0),
        durationSeconds: Math.round(videoDuration || currentLessonDuration || 0),
      })
        .then((res) => {
          if (res?.certificate) setCourseCertificate(res.certificate);
          if (res?.certificateStatus) setCertificateStatus(res.certificateStatus);
          if (typeof res?.unlockedLessonIndex === 'number') setUnlockedLessonIndex(res.unlockedLessonIndex);
          refreshCertificateStatus();
        })
        .catch(() => { });
    }

    // At the end of the video, trigger the End-of-Video Assessment:
    const targetEndQuestions = endQuestions.length > 0 ? endQuestions : allQuestions.filter((q) => q.triggerType === 'end');
    const allRelevantQuestions = targetEndQuestions.length > 0 ? targetEndQuestions : activeQuestions;

    if (allRelevantQuestions.length > 0) {
      pauseAllPlayers();
      setActiveCheckpoint({
        id: `${slug}_v${idx}_end`,
        label: `🏁 End-of-Video Assessment`,
        isEnd: true,
        showSummaryDirectly: false,
        questions: allRelevantQuestions,
      });
      return;
    }

    // Auto-advance to next video lesson if available
    if (idx < lessonsList.length - 1) {
      const nextIdx = idx + 1;
      setIdx(nextIdx);
      setTimeout(() => {
        const nextStart = parseTimeToSeconds(lessonsList[nextIdx]?.startTime || 0);
        seekAllPlayers(nextStart);
        playAllPlayers();
      }, 400);
    }
  };

  const handleCheckpointComplete = (checkpoint) => {
    const updated = { ...completedCheckpoints, [checkpoint.id]: true };
    setCompletedCheckpoints(updated);
    sessionTriggeredRef.current[checkpoint.id] = true;
    const activeEntityKey = isPlaylistMode ? `pl_${activePlaylist?.id || 'pl'}` : slug;
    try {
      localStorage.setItem(`gg-checkpoints-${userKey}-${activeEntityKey}`, JSON.stringify(updated));
    } catch { }
    setActiveCheckpoint(null);

    if (user?.id && slug) {
      api.saveCourseProgress(slug, {
        checkpointKey: checkpoint.id,
        checkpointPassed: true,
      }).catch(() => { });

      if (Array.isArray(checkpoint.questions) && checkpoint.questions.length > 0 && typeof api?.submitAssessment === 'function') {
        api.submitAssessment(slug, {
          assessmentId: checkpoint.id,
          lessonIndex: isPlaylistMode ? activePlaylistVideoIndex : idx,
          answers: userAnswers,
        })
          .then((res) => {
            if (res?.certificate) setCourseCertificate(res.certificate);
            if (res?.certificateStatus) setCertificateStatus(res.certificateStatus);
            refreshCertificateStatus();
          })
          .catch(() => { });
      }
    }

    if (checkpoint.isEnd) {
      if (isPlaylistMode) {
        const pl = activePlaylistRef.current;
        const curIdx = activePlaylistVideoIndexRef.current;
        if (pl?.videos && pl.videos[curIdx]) {
          const currentVid = pl.videos[curIdx];
          const vidKey = currentVid.id || curIdx;
          setPlaylistWatched((prev) => {
            const next = { ...prev, [vidKey]: true };
            try {
              localStorage.setItem(`gg-playlist-done-${userKey}-${pl.id}`, JSON.stringify(next));
            } catch { }
            return next;
          });
        }
      } else {
        if (!done.includes(idx)) {
          toggleDone(idx);
        }
        // If there is another lesson in this course, advance to it!
        if (idx < lessonsList.length - 1) {
          const nextIdx = idx + 1;
          setIdx(nextIdx);
          setTimeout(() => {
            const nextStart = parseTimeToSeconds(lessonsList[nextIdx]?.startTime || 0);
            seekAllPlayers(nextStart);
            playAllPlayers();
          }, 400);
        }
      }
    } else {
      // Resume further playback of the current video seamlessly from where it stopped!
      playAllPlayers();
    }
  };

  const handleChapterClick = (chapterIndex) => {
    if (!user) {
      navigate(`/login?redirect=/courses/${encodeURIComponent(slug)}`);
      return;
    }
    if (
      isStrictNonSkippable &&
      chapterIndex > 0 &&
      !done.includes(chapterIndex - 1) &&
      !done.includes(chapterIndex) &&
      chapterIndex > unlockedLessonIndex
    ) {
      triggerSkipBlockedToast('Skipping ahead is disabled. Please watch the full lesson to unlock the next step.');
      return;
    }
    setActiveCheckpoint(null);
    if (chapterIndex !== idx) {
      setIdx(chapterIndex);
    }
    const targetTime = parseTimeToSeconds(lessonsList[chapterIndex]?.startTime || 0);
    seekAllPlayers(targetTime);
    playAllPlayers();
    saveResumePosition(targetTime);
  };

  if (loading && !course) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-[#2563EB]">
        <Icon name="sync" className="animate-spin text-4xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-xl mx-auto px-6 py-32 text-center">
        <h1 className="text-4xl font-extrabold text-[#0F172A] mb-4">404</h1>
        <p className="text-[#475569] mb-6">Course not found.</p>
        <Link to="/courses" className="text-[#2563EB] font-bold underline">{t('courses.viewAll')} →</Link>
      </div>
    );
  }

  const renderPlaylistPanel = (isSidebar = false) => {
    if (!activePlaylist) return null;
    return (
      <div id="curriculum" className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden w-full scroll-mt-28">
        {/* Light-Slate Header */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 text-[#0F172A] shrink-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <Icon name="playlist_play" className="text-xs" /> Playlist
            </span>
            <span className="text-xs font-black text-[#2563EB]">
              {activePlaylistVideoIndex + 1} / {activePlaylist.videos?.length || 0}
            </span>
          </div>
          <h3 className="font-extrabold text-base text-[#0F172A] line-clamp-1" title={activePlaylist.title}>
            {activePlaylist.title}
          </h3>
          <div className="flex items-center justify-between mt-2 text-[11px] text-[#475569] font-semibold">
            <span className="truncate pr-2">{typeof course?.title === 'string' ? course.title : course?.title?.en || ''}</span>
            <span className="shrink-0 text-[#0D9488] font-bold">{playlistWatchedCount} / {activePlaylist.videos?.length || 0} completed</span>
          </div>
          <div className="mt-2.5 h-2 rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0D9488] to-[#2563EB] transition-all duration-300"
              style={{ width: `${playlistProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Scrollable Video List */}
        <div
          ref={playlistScrollContainerRef}
          className={`overflow-y-auto divide-y divide-slate-200/80 ${isSidebar ? 'max-h-[520px]' : 'max-h-[600px]'}`}
        >
          {activePlaylist.videos?.map((vid, vIdx) => {
            const isCurrent = vIdx === activePlaylistVideoIndex;
            const isDone = Boolean(playlistWatched[vid.id || vIdx]);
            const prevVid = vIdx > 0 ? activePlaylist.videos?.[vIdx - 1] : null;
            const prevVidKey = prevVid ? (prevVid.id || (vIdx - 1)) : null;
            const isSeqLocked = Boolean(
              isStrictNonSkippable && vIdx > 0 && !isDone && !isCurrent && !playlistWatched[prevVidKey]
            );
            const thumb = vid.thumbnailUrl || (vid.youtubeVideoId ? `https://img.youtube.com/vi/${vid.youtubeVideoId}/hqdefault.jpg` : '');
            const hasChapters = Array.isArray(vid.chapters) && vid.chapters.length > 0;
            const isExpanded = expandedPlaylistVideoIndices[vIdx] !== undefined
              ? Boolean(expandedPlaylistVideoIndices[vIdx])
              : isCurrent;
            const videoHasNotes = hasLessonNotes(vid);

            return (
              <div key={vid.id || vIdx} className="flex flex-col">
                {/* Main Video Row */}
                <div
                  ref={isCurrent ? activePlaylistItemRef : null}
                  onClick={() => handleSelectPlaylistVideo(vIdx)}
                  className={`p-3 sm:p-3.5 flex items-center gap-3 transition-all cursor-pointer group select-none ${isCurrent
                      ? 'bg-blue-50/90 border-l-4 border-[#2563EB] text-[#0F172A] font-semibold'
                      : isSeqLocked
                        ? 'bg-slate-50/70 text-slate-400 opacity-75 hover:bg-slate-100/80'
                        : 'hover:bg-slate-50 text-[#0F172A]'
                    }`}
                >
                  <div className="shrink-0 w-6 text-center">
                    {isCurrent ? (
                      <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center mx-auto">
                        <Icon name="play_arrow" className="text-xs" />
                      </div>
                    ) : isDone ? (
                      <div className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[10px] mx-auto shadow-2xs">
                        <Icon name="check" className="text-xs font-bold" />
                      </div>
                    ) : isSeqLocked ? (
                      <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center text-[10px] mx-auto">
                        <Icon name="lock" className="text-xs font-bold" />
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 group-hover:text-[#2563EB]">
                        {vIdx + 1}
                      </span>
                    )}
                  </div>

                  <div className="relative w-24 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-2xs">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={vid.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <Icon name="smart_display" className="text-base" />
                      </div>
                    )}
                    {vid.duration && (
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-[9px] font-bold">
                        {vid.duration}
                      </span>
                    )}
                    {isCurrent && (
                      <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                        <span className="px-1.5 py-0.5 rounded bg-[#2563EB] text-white text-[9px] font-black uppercase shadow-xs">
                          Playing
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className={`text-xs sm:text-sm font-bold line-clamp-2 leading-snug ${isCurrent ? 'text-[#2563EB]' : 'text-[#0F172A] group-hover:text-[#2563EB]'}`}>
                      {vid.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-[10px] flex-wrap">
                      {isCurrent ? (
                        <span className="text-[#2563EB] font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-ping" /> Now Playing
                        </span>
                      ) : isDone ? (
                        <span className="text-[#0D9488] font-bold flex items-center gap-0.5">
                          <Icon name="check_circle" className="text-xs text-[#10B981]" /> Completed
                        </span>
                      ) : (
                        <span className="text-[#475569]">Click to play</span>
                      )}

                      {hasChapters && (
                        <span className="flex items-center gap-0.5 font-medium text-slate-500">
                          <Icon name="format_list_numbered" className="text-[11px]" />
                          <span>{vid.chapters.length} {vid.chapters.length === 1 ? 'ch' : 'chs'}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right Actions: Video Download Notes & Expand/Collapse Chapters */}
                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    {videoHasNotes && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenChapterNotesModal(vid, vIdx);
                        }}
                        className="shrink-0 px-2.5 py-1.5 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-xs flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer"
                        title={`Download Notes for ${vid.title}`}
                      >
                        <Icon name="description" className="text-xs" />
                        <span className="whitespace-nowrap text-[11px]">Notes</span>
                      </button>
                    )}

                    {hasChapters && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedPlaylistVideoIndices((prev) => ({
                            ...prev,
                            [vIdx]: !isExpanded,
                          }));
                        }}
                        className="p-1.5 rounded-lg transition-colors cursor-pointer text-slate-500 hover:text-[#0F172A] hover:bg-slate-200/70"
                        title={isExpanded ? 'Hide chapters' : 'Show chapters'}
                      >
                        <Icon name={isExpanded ? 'expand_less' : 'expand_more'} className="text-lg" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable Chapters List for this Video */}
                {isExpanded && hasChapters && (
                  <div className="bg-slate-50 border-t border-slate-200 divide-y divide-slate-200/70 pl-3 pr-2 py-1">
                    {vid.chapters.map((ch, chIdx) => {
                      const timestampStr = ch.timestamp || (ch.seconds !== undefined ? `${Math.floor(ch.seconds / 60)}:${String(ch.seconds % 60).padStart(2, '0')}` : (ch.startTime !== undefined ? `${Math.floor(ch.startTime / 60)}:${String(ch.startTime % 60).padStart(2, '0')}` : '00:00'));
                      const targetSeconds = typeof ch.seconds === 'number'
                        ? ch.seconds
                        : (typeof ch.startTime === 'number' ? ch.startTime : parseTimeToSeconds(timestampStr));

                      const chapterHasNotes = Boolean(ch.notesUrl || ch.noteUrl || ch.notesName || ch.noteName);
                      const noteTarget = chapterHasNotes ? ch : vid;
                      const canDownloadNotes = chapterHasNotes || videoHasNotes;

                      return (
                        <div
                          key={ch.id || chIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isCurrent) {
                              handleSelectPlaylistVideo(vIdx);
                              setTimeout(() => {
                                seekAllPlayers(targetSeconds);
                                playAllPlayers();
                              }, 400);
                            } else {
                              seekAllPlayers(targetSeconds);
                              playAllPlayers();
                            }
                          }}
                          className="py-2 px-2.5 rounded-xl flex items-center justify-between gap-2.5 hover:bg-blue-50 transition-colors cursor-pointer group/ch"
                          title={`Click to jump to ${ch.title} (${timestampStr})`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <div className="w-5 h-5 rounded-md bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center shrink-0 group-hover/ch:bg-[#2563EB] group-hover/ch:text-white transition-colors">
                              <Icon name="play_arrow" className="text-xs" />
                            </div>
                            <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                              <span className="font-mono text-[#0D9488] font-bold text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                                {timestampStr}
                              </span>
                              <span className="text-xs font-semibold text-[#0F172A] truncate group-hover/ch:text-[#2563EB]">
                                {ch.title}
                              </span>
                            </div>
                          </div>

                          {canDownloadNotes && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenChapterNotesModal(noteTarget, chIdx);
                              }}
                              className="shrink-0 px-2.5 py-1 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-[11px] flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer ml-1"
                              title={`Download Notes for ${ch.title || vid.title}`}
                            >
                              <Icon name="description" className="text-xs" />
                              <span className="whitespace-nowrap">Notes</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Switch */}
        {playlists.length > 1 && (
          <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-center shrink-0">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-[#475569]">Switch:</span>
              {playlists.map((pl, pIdx) => {
                const isActive = pl.id === activePlaylist?.id;
                return (
                  <button
                    key={pl.id}
                    type="button"
                    onClick={() => handleSelectPlaylist(pl, 0)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${isActive
                        ? 'bg-[#2563EB] text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-100'
                      }`}
                  >
                    {pl.title || `Playlist ${pIdx + 1}`}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCurriculumPanel = (isSidebar = false) => {
    if (lessonsList.length === 0) return null;
    return (
      <div id="curriculum" className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden w-full">
        {/* Clean Light-Slate Course Content Header */}
        <div className="bg-slate-50 border-b border-slate-200 text-[#0F172A] p-5 shrink-0">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="bg-blue-50 border border-blue-200 text-[#2563EB] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Icon name="menu_book" className="text-xs" /> COURSE CONTENT
            </span>
            <span className="text-xs font-black text-[#2563EB]">
              {Math.min(idx + 1, lessonsList.length || 1)} / {lessonsList.length || 0}
            </span>
          </div>
          <h3 className="text-lg font-extrabold text-[#0F172A] mt-1.5 line-clamp-1" title={typeof course?.title === 'string' ? course.title : course?.title?.en || ''}>
            {typeof course?.title === 'string' ? course.title : course?.title?.en || 'Course Content'}
          </h3>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-[#475569] truncate pr-2 font-medium">
              {course?.category || 'Course Modules'}
            </span>
            <span className="shrink-0 text-[#0D9488] font-bold">
              {done.length} / {lessonsList.length} completed
            </span>
          </div>
          <div className="h-2 bg-slate-200 rounded-full mt-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0D9488] to-[#2563EB] transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {/* Sections Accordion / Chapter List */}
        <div className={`${isSidebar ? 'max-h-[520px]' : 'max-h-[600px]'} overflow-y-auto divide-y divide-slate-200`}>
          {curriculumSections.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#475569]">
              <Icon name="menu_book" className="text-3xl text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-[#0F172A] text-sm">No chapters available yet.</p>
              <p className="text-xs text-[#475569] mt-1">Chapters will appear here once added by the instructor.</p>
            </div>
          ) : (
            curriculumSections.map((sec, sIdx) => {
              const isSecExpanded = expandedSections[sIdx] !== false;
              const secLessons = sec.lessons || [];
              return (
                <div key={sec.id || sIdx} className="border-b last:border-b-0 border-slate-200">
                  <button
                    type="button"
                    onClick={() => setExpandedSections((prev) => ({ ...prev, [sIdx]: !isSecExpanded }))}
                    className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors cursor-pointer border-b border-slate-200"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs sm:text-sm font-extrabold text-[#0F172A] truncate">{sec.title}</p>
                      <p className="text-[10px] text-[#475569] mt-0.5">
                        {secLessons.length} {secLessons.length === 1 ? 'chapter' : 'chapters'} • {formatMainVideoDuration(course?.duration, videoDuration)}
                      </p>
                    </div>
                    <Icon name={isSecExpanded ? 'expand_less' : 'expand_more'} className="text-slate-500 text-lg shrink-0" />
                  </button>

                  {isSecExpanded && (
                    <ol className="divide-y divide-slate-100 bg-white">
                      {secLessons.map((l) => {
                        const i = l.globalIndex !== undefined ? l.globalIndex : idx;
                        const isCompleted = done.includes(i);
                        const isUnlocked = Boolean(user && (isEnrolledAndValid || isPreviewLesson(l, i)));
                        const isSeqLocked = Boolean(
                          isStrictNonSkippable &&
                          i > 0 &&
                          !isCompleted &&
                          !done.includes(i - 1) &&
                          i > unlockedLessonIndex
                        );
                        const isActive = i === idx;
                        const isLocked = !isUnlocked || isSeqLocked;
                        const thumb = getLessonThumbnailUrl(l, course);

                        return (
                          <li
                            key={(l.t || 'chapter') + i}
                            onClick={() => {
                              if (!user) {
                                navigate(`/login?redirect=/courses/${encodeURIComponent(slug)}`);
                                return;
                              }
                              if (!isUnlocked) {
                                alert('This chapter is locked. Please enroll to access all chapters.');
                                return;
                              }
                              if (isSeqLocked) {
                                triggerSkipBlockedToast('Skipping ahead is disabled. Please watch the full lesson to unlock the next step.');
                                return;
                              }
                              handleChapterClick(i);
                            }}
                            className={`p-3.5 sm:p-4 flex items-center justify-between gap-3 transition-colors cursor-pointer select-none ${isActive
                                ? 'bg-blue-50/90 border-l-4 border-[#2563EB] text-[#0F172A]'
                                : isLocked
                                  ? 'bg-slate-50/70 text-slate-400 opacity-75 hover:bg-slate-100/70'
                                  : 'bg-white hover:bg-slate-50 text-[#0F172A]'
                              }`}
                          >
                            {/* Left Index / Status Icon */}
                            <div className="shrink-0 w-6 text-center">
                              {isActive ? (
                                <div className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center mx-auto">
                                  <Icon name="play_arrow" className="text-xs" />
                                </div>
                              ) : isCompleted ? (
                                <div className="w-5 h-5 rounded-full bg-[#10B981] text-white flex items-center justify-center text-[10px] mx-auto shadow-2xs">
                                  <Icon name="check" className="text-xs font-bold" />
                                </div>
                              ) : isLocked ? (
                                <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center text-[10px] mx-auto">
                                  <Icon name="lock" className="text-xs font-bold" />
                                </div>
                              ) : (
                                <span className="text-xs font-bold text-slate-500 w-5 text-center block mx-auto">
                                  {i + 1}
                                </span>
                              )}
                            </div>

                            {/* 16:9 Video Thumbnail Card */}
                            <div className="relative w-24 h-14 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200 shadow-2xs">
                              {thumb ? (
                                <img
                                  src={thumb}
                                  alt={l.t || `Chapter ${i + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400">
                                  <Icon name="smart_display" className="text-base" />
                                </div>
                              )}
                              {l.startTime !== undefined && (
                                <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-semibold font-mono">
                                  {formatChapterTime(l.startTime)}
                                </span>
                              )}
                              {isActive && (
                                <div className="absolute inset-0 bg-blue-600/20 flex items-center justify-center">
                                  <span className="px-2 py-0.5 rounded bg-[#2563EB] text-white text-[9px] font-bold uppercase tracking-wider shadow-xs">
                                    Playing
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Middle Text Info */}
                            <div className="min-w-0 flex-1">
                              <h4 className={`text-xs sm:text-sm font-bold line-clamp-2 leading-snug ${isActive ? 'text-[#2563EB]' : 'text-[#0F172A]'}`}>
                                {l.t}
                              </h4>
                              <div className="flex items-center gap-2 mt-1 text-xs">
                                {isActive ? (
                                  <span className="text-[#2563EB] text-[11px] font-semibold flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-ping" /> Now Playing
                                  </span>
                                ) : isCompleted ? (
                                  <span className="text-[#0D9488] text-[11px] font-bold flex items-center gap-1">
                                    <Icon name="check_circle" className="text-xs text-[#10B981]" /> Completed
                                  </span>
                                ) : isLocked ? (
                                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                                    <Icon name="lock" className="text-xs" /> Locked
                                  </span>
                                ) : (
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[11px] text-[#475569]">Click to play</span>
                                    {isPreviewLesson(l, i) && (
                                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-50 text-[#0D9488] border border-emerald-200">
                                        Free Preview
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right Action ("Download Notes") */}
                            {hasLessonNotes(l) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (isLocked) {
                                    alert('This chapter is locked. Please enroll to access all chapters and download notes.');
                                    return;
                                  }
                                  handleOpenChapterNotesModal(l, i);
                                }}
                                className="shrink-0 px-3 py-1.5 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-semibold text-xs flex items-center gap-1 shadow-2xs transition-all active:scale-95 cursor-pointer ml-1"
                                title={`Download Notes for ${l.t || `Chapter ${i + 1}`}`}
                              >
                                <Icon name="description" className="text-xs" />
                                <span className="whitespace-nowrap text-[11px]">Notes</span>
                              </button>
                            )}
                          </li>
                        );
                      })}
                    </ol>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const renderLearnTab = () => (
    <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <h3 className="text-base font-extrabold uppercase tracking-wider text-[#0F172A] mb-4 flex items-center gap-2">
        <Icon name="check_circle" className="text-[#10B981] text-xl" /> What You&apos;ll Learn
      </h3>
      <ul className="grid sm:grid-cols-2 gap-3">
        {learnList.map((l, i) => (
          <li key={l + i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl border bg-[#F8FAFC] border-slate-200 text-xs sm:text-sm font-semibold text-[#0F172A]">
            <Icon name="check_circle" filled className="text-[18px] mt-0.5 text-[#10B981] shrink-0" />
            <span>{l}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderRequirementsTab = () => (
    <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
      <h3 className="text-base font-extrabold uppercase tracking-wider text-[#0F172A] mb-4 flex items-center gap-2">
        <Icon name="fact_check" className="text-[#2563EB] text-xl" /> Course Requirements &amp; Prerequisites
      </h3>
      {requirementsList.length > 0 ? (
        <ul className="space-y-2.5">
          {requirementsList.map((req, i) => (
            <li key={i} className="flex items-start gap-2.5 px-4 py-3 rounded-xl border bg-[#F8FAFC] border-slate-200 text-xs sm:text-sm font-medium text-[#0F172A]">
              <Icon name="chevron_right" className="text-[#2563EB] text-base mt-0.5 shrink-0" />
              <span>{req}</span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 text-[#475569] text-xs sm:text-sm font-medium flex items-center gap-2">
          <Icon name="check" className="text-[#10B981] text-lg" />
          <span>No specific prerequisites required.</span>
        </div>
      )}
    </div>
  );

  const renderLearnAndRequirementsTab = () => (
    <div className="space-y-6">
      {renderLearnTab()}
      {renderRequirementsTab()}
    </div>
  );

  const renderMaterialsTab = () => (
    <div className="space-y-6">
      {/* Card 1: Study Materials & Notes */}
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-5">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D9488] border border-teal-200 flex items-center justify-center shrink-0">
              <Icon name="description" className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">
                Chapter Notes &amp; Study Materials
              </h3>
              <p className="text-sm text-[#475569] mt-0.5">
                Downloadable lecture notes, worksheets, and resources attached to this {isPlaylistMode ? 'playlist' : 'course'}.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#0D9488] border border-emerald-200 text-xs font-bold self-start sm:self-auto shrink-0">
            {notesList.length} {notesList.length === 1 ? 'File Available' : 'Files Available'}
          </span>
        </div>

        {notesList.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-[#F8FAFC] flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center mb-2">
              <Icon name="note_add" className="text-2xl" />
            </div>
            <p className="font-bold text-[#0F172A] text-sm">
              {isPlaylistMode ? 'No study materials attached to this playlist yet.' : 'No Chapter Notes Attached'}
            </p>
            <p className="text-xs text-[#475569] mt-1 max-w-sm">
              Study notes or lesson worksheets will appear here once published by the instructor.
            </p>
          </div>
        ) : !user ? (
          <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Icon name="lock" className="text-xl" />
              </div>
              <div>
                <div className="text-sm font-bold text-amber-900">
                  Log in to Access Chapter Notes
                </div>
                <p className="text-xs text-amber-800 mt-0.5">
                  {notesList.length} downloadable {notesList.length === 1 ? 'document is' : 'documents are'} available for enrolled learners.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)}
              className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shrink-0 cursor-pointer shadow-xs"
            >
              Log In to Access
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {notesList.map((item, nIdx) => {
              const itemName = item.name || item.notesName || item.noteName || item.title || `Resource ${nIdx + 1}`;
              const itemExt = (item.ext || item.notesExt || itemName.split('.').pop() || 'PDF').toUpperCase();
              const isPdf = itemExt === 'PDF' || /\.pdf$/i.test(itemName);
              const itemUrl = item.file || item.url || item.notesUrl || item.noteUrl;
              const context = item.contextLabel || item.chapterTitle || 'Course Resource';
              const sizeLabel = item.size || item.notesSize ? ` · ${item.size || item.notesSize}` : '';

              return (
                <div
                  key={nIdx}
                  className="rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white shadow-2xs"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-teal-50 text-[#0D9488] border border-teal-200 flex items-center justify-center shrink-0">
                      <Icon name={isPdf ? "picture_as_pdf" : "description"} className="text-2xl" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#0D9488] border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                          {itemExt}
                        </span>
                        <span className="text-xs text-[#475569] font-semibold truncate">
                          {context}{sizeLabel}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0F172A] truncate" title={itemName}>
                        {itemName}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenChapterNotesModal(item, nIdx)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-[#F8FAFC] hover:bg-slate-100 text-[#0F172A] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Icon name="visibility" className="text-sm text-[#2563EB]" />
                      <span>Preview</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDirectFileDownload(itemUrl, itemName)}
                      className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
                    >
                      <Icon name="download" className="text-sm" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const renderReviewsTab = () => (
    <div id="reviews" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center shrink-0">
          <Icon name="star" filled className="text-base" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-[#0F172A]">Reviews &amp; Ratings</h3>
          <p className="text-xs text-[#475569]">Learner feedback and course evaluation</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="text-center p-4 rounded-2xl bg-amber-50 border border-amber-200 min-w-[110px]">
            <div className="text-3xl sm:text-4xl font-black text-amber-600 leading-tight">
              {ratingStats.averageRating > 0 ? ratingStats.averageRating.toFixed(1) : (course.rating > 0 ? Number(course.rating).toFixed(1) : '5.0')}
            </div>
            <div className="flex items-center justify-center gap-0.5 text-amber-400 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon key={star} name="star" filled className="text-xs text-amber-400" />
              ))}
            </div>
            <div className="text-[10px] font-bold text-amber-700 mt-1">Course Rating</div>
          </div>

          <div className="flex-1 min-w-[180px] space-y-1.5">
            {ratingDistribution.map((row) => (
              <div key={row.star} className="flex items-center gap-2 text-xs">
                <span className="w-10 font-bold text-[#0F172A] flex items-center gap-0.5">
                  {row.star} <Icon name="star" filled className="text-[11px] text-amber-400" />
                </span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-300" style={{ width: `${row.pct}%` }} />
                </div>
                <span className="w-8 text-right font-medium text-[#475569] text-[11px]">{row.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="text-left md:text-right">
          <div className="text-sm font-extrabold text-[#0F172A]">Student Feedback</div>
          <p className="text-xs text-[#475569] mt-0.5">
            Based on {ratingStats.totalRatings} verified learner {ratingStats.totalRatings === 1 ? 'rating' : 'ratings'}
          </p>
        </div>
      </div>

      {!user ? null : ratingSubmitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#0D9488] font-extrabold text-sm mb-1.5">
              <Icon name="verified" filled className="text-[#10B981] text-xl" />
              Thank you! You rated this course:
            </div>
            <div className="flex items-center gap-1.5 text-amber-500">
              {[1, 2, 3, 4, 5].map((star) => (
                <Icon
                  key={star}
                  name="star"
                  filled={star <= userRating}
                  className={`text-xl ${star <= userRating ? 'text-amber-400' : 'text-slate-300'}`}
                />
              ))}
              <span className="text-xs font-bold text-[#0F172A] ml-2">({userRating} of 5 stars)</span>
            </div>
            {userReview && <p className="text-xs text-[#0F172A] italic mt-2.5 bg-white p-2.5 rounded-xl border border-emerald-200">&quot;{userReview}&quot;</p>}
          </div>
          <button
            type="button"
            onClick={() => setRatingSubmitted(false)}
            className="text-xs font-bold text-[#0F172A] bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2 rounded-full transition-all shrink-0 shadow-2xs cursor-pointer"
          >
            Edit Your Rating
          </button>
        </div>
      ) : (
        <form onSubmit={handleRatingSubmit} className="space-y-4">
          {ratingError && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl p-3 flex items-center gap-2">
              <Icon name="error" className="text-base text-rose-500 shrink-0" />
              <span>{ratingError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Your Rating (Select 1 to 5 Stars):
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled = star <= (hoverRating || userRating);
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => handleSelectRating(star)}
                    className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                    aria-label={`Rate ${star} star`}
                  >
                    <Icon
                      name="star"
                      filled={isFilled}
                      className={`text-2xl sm:text-3xl ${isFilled ? 'text-amber-400 drop-shadow-xs' : 'text-slate-300'}`}
                    />
                  </button>
                );
              })}
              <span className="text-xs font-bold text-[#475569] ml-2">
                {(hoverRating || userRating) === 5 ? '⭐⭐⭐⭐⭐ 5 - Excellent!' :
                  (hoverRating || userRating) === 4 ? '⭐⭐⭐⭐ 4 - Very Good' :
                    (hoverRating || userRating) === 3 ? '⭐⭐⭐ 3 - Good' :
                      (hoverRating || userRating) === 2 ? '⭐⭐ 2 - Fair' :
                        (hoverRating || userRating) === 1 ? '⭐ 1 - Needs Improvement' : 'Click to rate'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Feedback / Review (Optional):
            </label>
            <textarea
              rows={3}
              value={userReview}
              onChange={(e) => setUserReview(e.target.value)}
              placeholder="Write what you liked or how we can improve this course..."
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-sm text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!userRating || isSubmittingRating}
              className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-[#1D4ED8] hover:to-[#4338CA] text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-full transition-all shadow-sm active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              <Icon name="send" className="text-sm" />
              {isSubmittingRating ? 'Submitting...' : 'Submit Course Rating'}
            </button>
          </div>
        </form>
      )}

      {/* Course Reviews List */}
      <div className="mt-8 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
            <Icon name="comment" className="text-[#2563EB] text-base" />
            Learner Reviews ({ratingStats.reviews.length})
          </h4>
        </div>

        {ratingStats.reviews.length === 0 ? (
          <p className="text-xs text-[#475569] italic py-2">
            No reviews yet. Be the first to rate and review this course!
          </p>
        ) : (
          <div className="space-y-3">
            {ratingStats.reviews.map((rev) => (
              <div key={rev.id} className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 transition-all">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] font-bold text-xs flex items-center justify-center">
                      {(rev.userName || 'S').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#0F172A] block leading-tight">{rev.userName || 'Student'}</span>
                      <span className="text-[10px] text-slate-500">
                        {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Icon key={s} name="star" filled={s <= rev.rating} className={`text-xs ${s <= rev.rating ? 'text-amber-400' : 'text-slate-300'}`} />
                    ))}
                    <span className="text-xs font-extrabold text-amber-600 ml-1">{rev.rating}.0</span>
                  </div>
                </div>
                {rev.review && (
                  <p className="text-xs text-[#475569] leading-relaxed whitespace-pre-wrap pl-10">
                    {rev.review}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderTasksTab = () => {
    if (isStrictNonSkippable && !isTaskTabUnlocked && !projectVerifiedForCert) {
      return (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
            <Icon name="lock" className="text-3xl" />
          </div>
          <h3 className="text-lg font-extrabold text-[#0F172A]">
            Project Submission Locked
          </h3>
          <p className="text-xs sm:text-sm text-[#475569] max-w-md mx-auto leading-relaxed">
            {!allVideosCompleted
              ? `Please finish watching all required course videos (${completedVideosCount}/${totalVideosCount} completed) without skipping ahead to unlock project submission.`
              : 'Please complete and pass the required lesson MCQ assessment before submitting your project.'}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {!allVideosCompleted ? (
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold cursor-pointer"
              >
                Continue Watching Videos
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('quiz')}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold cursor-pointer"
              >
                Go to MCQ Assessment
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <VideoAssignmentBox
          task={videoAssignedTask}
          videoId={activeVideoId}
          youtubeVideoId={activeYoutubeVideoId}
          videoTitle={activeVideoTitle}
          courseSlug={course?.slug}
          playlistId={isPlaylistMode ? activePlaylist?.id : null}
          user={user}
          onTaskUpdated={(updated) => {
            setVideoAssignedTask((prev) => {
              if (!prev) return updated;
              if (Array.isArray(prev.tasks)) {
                const updatedTasks = prev.tasks.map((t) =>
                  (t.id === updated.id || t.taskId === updated.taskId) ? { ...t, ...updated } : t
                );
                return { ...prev, ...updated, tasks: updatedTasks };
              }
              return { ...prev, ...updated };
            });
            if (updated?.certificate) setCourseCertificate(updated.certificate);
            if (updated?.certificateStatus) setCertificateStatus(updated.certificateStatus);
            refreshCertificateStatus();
          }}
        />
      </div>
    );
  };

  const renderCertificateTab = () => {
    const activeCert = courseCertificate || certificateStatus?.certificate;
    if (activeCert) {
      return (
        <div className="space-y-4">
          <CertificateView
            certificate={activeCert}
            onContactCompany={() => setCertContactOpen(true)}
          />
        </div>
      );
    }

    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
          <Icon name="workspace_premium" className="text-4xl" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-[#0F172A]">
            Official G-Mark Certificate Checklist
          </h3>
          <p className="text-xs sm:text-sm text-[#475569] max-w-lg mx-auto mt-1">
            Complete all required steps below to automatically issue and verify your official G-Mark Software certificate.
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3 text-left max-w-3xl mx-auto">
          <div className={`p-4 rounded-xl border ${allVideosCompleted ? 'bg-emerald-50 border-emerald-200' : 'bg-[#F8FAFC] border-slate-200'}`}>
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className={allVideosCompleted ? 'text-emerald-800' : 'text-[#0F172A]'}>
                1. Watch All Videos
              </span>
              <Icon
                name={allVideosCompleted ? 'check_circle' : 'lock_clock'}
                className={`text-base ${allVideosCompleted ? 'text-emerald-600' : 'text-[#2563EB]'}`}
              />
            </div>
            <p className="text-[11px] text-[#475569] mt-1">
              {completedVideosCount} of {totalVideosCount} lessons completed
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${mcqsPassedForCert ? 'bg-emerald-50 border-emerald-200' : 'bg-[#F8FAFC] border-slate-200'}`}>
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className={mcqsPassedForCert ? 'text-emerald-800' : 'text-[#0F172A]'}>
                2. Pass All MCQs
              </span>
              <Icon
                name={mcqsPassedForCert ? 'check_circle' : 'quiz'}
                className={`text-base ${mcqsPassedForCert ? 'text-emerald-600' : 'text-[#2563EB]'}`}
              />
            </div>
            <p className="text-[11px] text-[#475569] mt-1">
              {!mcqsRequiredForCert ? 'No quiz required' : mcqsPassedForCert ? 'Assessment passed ✓' : 'Complete lesson assessment'}
            </p>
          </div>

          <div className={`p-4 rounded-xl border ${projectVerifiedForCert ? 'bg-emerald-50 border-emerald-200' : 'bg-[#F8FAFC] border-slate-200'}`}>
            <div className="flex items-center justify-between text-xs font-extrabold">
              <span className={projectVerifiedForCert ? 'text-emerald-800' : 'text-[#0F172A]'}>
                3. Submit Project
              </span>
              <Icon
                name={projectVerifiedForCert ? 'verified' : 'assignment'}
                className={`text-base ${projectVerifiedForCert ? 'text-emerald-600' : 'text-[#2563EB]'}`}
              />
            </div>
            <p className="text-[11px] text-[#475569] mt-1">
              {!projectRequiredForCert ? 'Optional for this course' : projectVerifiedForCert ? 'System Verified ✓' : 'Submit for instant auto-verification'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          {!allVideosCompleted ? (
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold cursor-pointer"
            >
              Resume Lessons
            </button>
          ) : !mcqsPassedForCert ? (
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold cursor-pointer"
            >
              Take Assessment Quiz
            </button>
          ) : !projectVerifiedForCert ? (
            <button
              type="button"
              onClick={() => setActiveTab('tasks')}
              className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold cursor-pointer"
            >
              Submit Course Project
            </button>
          ) : (
            <button
              type="button"
              onClick={refreshCertificateStatus}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
            >
              Refresh Certificate Status
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderQuizTab = () => {
    const entityKey = isPlaylistMode ? `pl_${activePlaylist?.id || 'pl'}_v${activePlaylistVideoIndex}_end` : `${slug}_v${idx}_end`;
    const isCompleted = Boolean(completedCheckpoints[entityKey]);

    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center justify-center shrink-0">
              <Icon name="quiz" className="text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0F172A]">Lesson Assessment Quiz</h3>
              <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
                Test your understanding of {isPlaylistMode ? activePlaylistVideo?.title || 'this video' : lesson?.t || 'this chapter'}.
              </p>
            </div>
          </div>

          {isCompleted && (
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#0D9488] border border-emerald-200 text-xs font-bold inline-flex items-center gap-1 self-start sm:self-auto">
              <Icon name="check_circle" className="text-sm text-[#10B981]" /> Completed
            </span>
          )}
        </div>

        {activeQuestions.length > 0 ? (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#EFF6FF] via-white to-teal-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white border border-blue-200 text-[#2563EB] text-[11px] font-bold">
                {activeQuestions.length} {activeQuestions.length === 1 ? 'Question' : 'Questions'}
              </span>
              <h4 className="text-base font-extrabold text-[#0F172A]">
                {isCompleted ? 'Quiz Completed — Ready to Review or Retake' : 'Ready to take the lesson quiz?'}
              </h4>
              <p className="text-xs text-[#475569]">
                Launch the interactive quiz overlay right inside your lesson workspace.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                pauseAllPlayers();
                setActiveCheckpoint({
                  id: entityKey,
                  label: isPlaylistMode
                    ? `Video ${activePlaylistVideoIndex + 1} Assessment: ${activePlaylistVideo?.title || 'Quiz'}`
                    : `Lesson ${idx + 1} Assessment: ${lesson?.t || 'Quiz'}`,
                  isEnd: true,
                  questions: activeQuestions,
                });
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-[#1D4ED8] hover:to-[#4338CA] text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 shadow-sm transition cursor-pointer shrink-0"
            >
              <Icon name="play_arrow" className="text-base" />
              <span>{isCompleted ? 'Retake Quiz' : 'Start Quiz'}</span>
            </button>
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl border-2 border-dashed border-slate-200 bg-[#F8FAFC]">
            <Icon name="quiz" className="text-3xl text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-[#0F172A]">No quiz configured for this lesson yet</p>
            <p className="text-xs text-[#475569] mt-1 max-w-md mx-auto">
              Check the Overview or Video Task Submission tabs for exercises, notes, and practice materials.
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderNavTabs = (isForSidebarLayout = false) => (
    <div className="space-y-3">
      {/* 4-Step Certificate Progression Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2.5">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB] flex items-center gap-1.5">
            <Icon name="workspace_premium" className="text-sm text-amber-500" />
            <span>Certification Roadmap</span>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setCertIntroOpen(true)}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-[10px] font-extrabold transition cursor-pointer"
            >
              <Icon name="info" className="text-xs text-amber-600" />
              <span>How to Get Certified</span>
            </button>
            {(courseCertificate || certificateStatus?.certificate) && (
              <button
                type="button"
                onClick={() => setCertCongratsOpen(true)}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#059669] text-[10px] font-extrabold transition cursor-pointer"
              >
                <Icon name="verified" className="text-xs" />
                <span>Certificate Earned ✓</span>
              </button>
            )}
            {isStrictNonSkippable && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-[10px] font-bold">
                <Icon name="lock_clock" className="text-xs" />
                Strict Non-Skippable Mode Active
              </span>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            {
              step: 'Step 1',
              label: 'Watch All Videos',
              done: allVideosCompleted,
              active: !allVideosCompleted,
              tab: 'overview',
            },
            {
              step: 'Step 2',
              label: 'Pass All MCQs',
              done: mcqsPassedForCert,
              active: allVideosCompleted && !mcqsPassedForCert,
              tab: 'quiz',
            },
            {
              step: 'Step 3',
              label: 'Submit Project (Auto-Verified)',
              done: projectVerifiedForCert,
              active: allVideosCompleted && mcqsPassedForCert && !projectVerifiedForCert,
              tab: 'tasks',
            },
            {
              step: 'Step 4',
              label: 'Claim Certificate',
              done: Boolean(courseCertificate || certificateStatus?.certificate),
              active: isCertificateUnlocked,
              tab: 'certificate',
            },
          ].map((s) => (
            <button
              key={s.step}
              type="button"
              onClick={() => setActiveTab(s.tab)}
              className={`p-2.5 rounded-xl border text-left transition cursor-pointer flex items-center gap-2 ${s.done
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                  : s.active
                    ? 'bg-blue-50/90 border-blue-300 text-[#0F172A] ring-1 ring-blue-400/30'
                    : 'bg-[#F8FAFC] border-slate-200 text-[#475569]'
                }`}
            >
              <Icon
                name={s.done ? 'check_circle' : s.active ? 'radio_button_checked' : 'lock'}
                className={`text-base shrink-0 ${s.done ? 'text-emerald-600' : s.active ? 'text-[#2563EB]' : 'text-slate-400'
                  }`}
              />
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-wider opacity-75">
                  {s.step}
                </div>
                <div className="text-[11px] font-bold truncate">{s.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full flex items-center justify-between gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-sm sticky top-4 z-20 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Overview', icon: 'info' },
          { id: 'curriculum', label: isPlaylistMode ? 'Playlist' : 'Course Content', icon: isPlaylistMode ? 'playlist_play' : 'menu_book' },
          { id: 'materials', label: 'Chapter Notes', icon: 'description' },
          { id: 'tasks', label: 'Project Submission', icon: 'assignment', locked: isStrictNonSkippable && !isTaskTabUnlocked && !projectVerifiedForCert },
          { id: 'quiz', label: 'Quiz', icon: 'quiz' },
          { id: 'certificate', label: 'Certificate', icon: 'workspace_premium', locked: !isCertificateUnlocked },
          { id: 'learn', label: 'Learn & Requirements', icon: 'fact_check' },
          { id: 'reviews', label: 'Reviews', icon: 'star' },
        ].map((tabItem) => (
          <button
            key={tabItem.id}
            type="button"
            onClick={() => {
              setActiveTab(tabItem.id);
              if (isForSidebarLayout && tabItem.id === 'curriculum') {
                const el = document.getElementById('curriculum');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className={`flex-1 justify-center px-3 py-2 text-xs xl:text-[13px] font-bold whitespace-nowrap rounded-full transition-all flex items-center gap-1.5 cursor-pointer shrink-0 xl:shrink ${activeTab === tabItem.id
                ? 'bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white shadow-xs'
                : 'text-[#475569] hover:bg-slate-100 hover:text-[#0F172A]'
              }`}
          >
            <Icon name={tabItem.icon} className="text-sm xl:text-base shrink-0" />
            <span>{tabItem.label}</span>
            {tabItem.locked && (
              <Icon name="lock" className="text-[12px] opacity-75 shrink-0" />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Course / Playlist Header and Information */}
      <section className="bg-gradient-to-br from-[#EFF6FF] via-slate-50 to-indigo-50/70 border-b border-slate-200 text-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
          <div className="flex items-center gap-2.5 mb-4 flex-wrap">
            <Link to="/courses" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-[#2563EB] hover:border-blue-300 shadow-2xs transition">
              <Icon name="arrow_back" className="text-[16px]" /> {t('courses.title')}
            </Link>
            <Link to="/dashboard" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-[#475569] hover:text-[#2563EB] hover:border-blue-300 shadow-2xs transition">
              <Icon name="space_dashboard" className="text-[15px] text-[#2563EB]" /> My Learning
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight max-w-4xl text-[#0F172A]">
                {isPlaylistMode && activePlaylist?.title ? activePlaylist.title : pick(course.title)}
              </h1>
              <p className="mt-3 text-base md:text-lg text-[#475569] max-w-3xl">
                {isPlaylistMode && activePlaylist?.description ? activePlaylist.description : pick(course.short)}
              </p>
              <div className="flex flex-wrap gap-2.5 mt-5 text-xs font-bold">
                <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-[#0D9488] border border-emerald-200">{t('courses.free')}</span>
                <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[#0F172A] flex items-center gap-1.5 shadow-2xs">
                  <Icon name="person" className="text-[14px] text-[#2563EB]" /> {Number(course.learners) || 0} {(Number(course.learners) || 0) === 1 ? 'Learner' : 'Learners'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('reviews')}
                  className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 flex items-center gap-1 font-bold cursor-pointer transition"
                  title="View reviews and ratings"
                >
                  <Icon name="star" filled className="text-[14px] text-amber-400" />
                  {ratingStats.totalRatings > 0
                    ? `${ratingStats.averageRating.toFixed(1)} ★ (${ratingStats.totalRatings} ${ratingStats.totalRatings === 1 ? 'rating' : 'ratings'})`
                    : course.rating
                      ? `${course.rating} ★ (Rating)`
                      : 'Not yet rated'}
                </button>
                <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[#475569] shadow-2xs">{pick(course.level)}</span>

                {/* Playlist Video Count Badge */}
                {isPlaylistMode && activePlaylist?.videos && (
                  <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[#0F172A] flex items-center gap-1 shadow-2xs">
                    <Icon name="smart_display" className="text-[14px] text-[#2563EB]" />
                    {activePlaylist.videos.length} {activePlaylist.videos.length === 1 ? 'Video' : 'Videos'}
                  </span>
                )}

                {/* Single Course Chapter Count & Duration Badges */}
                {!isPlaylistMode && lessonsList.length > 0 && (
                  <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[#0F172A] shadow-2xs">
                    {lessonsList.length} {lessonsList.length === 1 ? 'Chapter' : 'Chapters'}
                  </span>
                )}
                {!isPlaylistMode && lessonsList.length > 0 && formatMainVideoDuration(course.duration, videoDuration) !== '00:00:00' && (
                  <span className="px-3 py-1.5 rounded-full bg-white border border-slate-200 text-[#475569] shadow-2xs">
                    {formatMainVideoDuration(course.duration, videoDuration)}
                  </span>
                )}

                {/* Playlists Button if Single Course has attached playlists */}
                {!isPlaylistMode && playlists.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSelectPlaylist(playlists[0], 0);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white hover:from-[#1D4ED8] hover:to-[#4338CA] transition-all flex items-center gap-1.5 font-bold cursor-pointer shadow-sm active:scale-95"
                  >
                    <Icon name="playlist_play" className="text-base" />
                    <span>{playlists.length} {playlists.length === 1 ? 'Playlist' : 'Playlists'}</span>
                  </button>
                )}

                {/* Exit Playlist button in Playlist mode */}
                {isPlaylistMode && (
                  <button
                    type="button"
                    onClick={handleExitPlaylist}
                    className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-100 border border-slate-300 text-[#0F172A] transition-all flex items-center gap-1.5 font-bold cursor-pointer active:scale-95 shadow-2xs"
                  >
                    <Icon name="arrow_back" className="text-base" />
                    <span>Exit Playlist</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Section className={isPlaylistMode ? '!pt-6 sm:!pt-8' : '!pt-6 sm:!pt-8'}>
        {isPlaylistMode ? (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (lg:col-span-8): Video Player, Tabs, Tab Content */}
            <div className="lg:col-span-8 space-y-6">
              {/* 2. Playlist Video Player */}
              <div>
                {isPlaylistCompleted ? (
                  <div className="aspect-video rounded-2xl overflow-hidden bg-gradient-to-br from-[#EFF6FF] via-white to-teal-50/70 shadow-lg relative flex flex-col items-center justify-center p-6 sm:p-8 text-center text-[#0F172A] border border-blue-200">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center text-[#2563EB] mb-3 shadow-sm">
                      <Icon name="emoji_events" className="text-3xl sm:text-4xl animate-bounce" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-[#0D9488] text-xs font-black uppercase tracking-wider mb-2 border border-emerald-200">
                      Playlist Completed 🎉
                    </span>
                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] mb-2 max-w-lg">
                      {activePlaylist.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#475569] max-w-md mb-6 leading-relaxed">
                      Congratulations! You have completed all {activePlaylist.videos?.length || 0} videos in this playlist.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleReplayPlaylist}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white font-bold text-xs sm:text-sm flex items-center gap-2 hover:from-[#1D4ED8] hover:to-[#4338CA] transition shadow-sm active:scale-95 cursor-pointer"
                      >
                        <Icon name="replay" className="text-base" />
                        <span>Replay Playlist</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleExitPlaylist}
                        className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-[#0F172A] font-bold text-xs sm:text-sm flex items-center gap-2 transition border border-slate-200 active:scale-95 cursor-pointer"
                      >
                        <Icon name="arrow_back" className="text-base" />
                        <span>Course Overview</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xl relative">
                    <Player
                      lesson={lesson}
                      course={course}
                      videoRef={videoRef}
                      ytPlayerRef={ytPlayerRef}
                      activeCheckpoint={activeCheckpoint}
                      setActiveCheckpoint={setActiveCheckpoint}
                      onCheckpointComplete={handleCheckpointComplete}
                      userAnswers={userAnswers}
                      setUserAnswers={setUserAnswers}
                      checkpoints={videoCheckpoints}
                      completedCheckpoints={completedCheckpoints}
                      onCheckpointSelect={(checkpoint) => {
                        pauseAllPlayers();
                        seekAllPlayers(checkpoint.seconds);
                        setActiveCheckpoint(checkpoint);
                      }}
                      onCheckpointClose={handleCheckpointClose}
                      onTimeUpdate={handleTimeUpdate}
                      onDurationChange={(d) => setVideoDuration(d)}
                      onSeekingOrSeeked={handleSeekingOrSeeked}
                      onVideoEnded={handlePlaylistVideoEnded}
                      onSkipToNext={handleSkipPlaylistVideo}
                      activePlaylistVideo={activePlaylistVideo}
                      playlistMode={true}
                      onPlay={handlePlayerPlay}
                      onPause={handlePlayerPause}
                      initialSeekTime={playlistResumePosition}
                      strictNonSkippable={isStrictNonSkippable}
                      maxWatchedSeconds={activeMaxWatchedSec}
                      onSkipBlocked={triggerSkipBlockedToast}
                    />
                    {skipBlockedToast && (
                      <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-extrabold shadow-lg flex items-center gap-2 max-w-[92%]">
                        <Icon name="lock_clock" className="text-base text-amber-600 shrink-0" />
                        <span>{skipBlockedToast}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Horizontal Pill Navigation Tabs */}
              {renderNavTabs(true)}

              {/* 4. Selected Tab Content */}
              <div className="w-full pt-1 pb-4">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Video Info Header */}
                    <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                      <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-[11px] font-black uppercase tracking-wider flex items-center gap-1">
                            <Icon name="playlist_play" className="text-sm" />
                            {activePlaylist.title}
                          </span>
                          <span className="text-xs text-[#475569] font-bold">
                            Video {activePlaylistVideoIndex + 1} of {activePlaylist.videos?.length || 0}
                          </span>
                          {playlistWatched[activePlaylistVideo?.id || activePlaylistVideoIndex] && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#0D9488] text-[10px] font-black flex items-center gap-0.5">
                              <Icon name="check" className="text-xs text-[#10B981]" /> Watched
                            </span>
                          )}
                        </div>

                        {/* Quick Playlist Video Prev / Next Navigation */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={activePlaylistVideoIndex === 0}
                            onClick={handlePrevPlaylistVideo}
                            className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#0F172A] disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                          >
                            <Icon name="arrow_back" className="text-sm" /> Prev Video
                          </button>
                          <button
                            type="button"
                            disabled={activePlaylistVideoIndex >= (activePlaylist.videos?.length || 1) - 1}
                            onClick={handleNextPlaylistVideo}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-[#1D4ED8] hover:to-[#4338CA] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            Next Video <Icon name="arrow_forward" className="text-sm" />
                          </button>
                        </div>
                      </div>

                      <h2 className="text-lg sm:text-2xl font-extrabold text-[#0F172A] leading-tight">
                        {activePlaylistVideoIndex + 1}. {activePlaylistVideo?.title}
                      </h2>
                      {activePlaylistVideo?.description && (
                        <p className="text-xs sm:text-sm text-[#475569] leading-relaxed mt-2">
                          {activePlaylistVideo.description}
                        </p>
                      )}

                      {/* Video Actions (Download Notes, Assessment, etc.) */}
                      {(hasLessonNotes(activePlaylistVideo) || hasAssessment) && (
                        <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            {hasLessonNotes(activePlaylistVideo) && (
                              <button
                                type="button"
                                onClick={() => handleOpenChapterNotesModal(activePlaylistVideo, activePlaylistVideoIndex)}
                                className="px-4 py-2 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                                title={`Download Notes for ${activePlaylistVideo?.title || `Video ${activePlaylistVideoIndex + 1}`}`}
                              >
                                <Icon name="description" className="text-base" />
                                <span>Download Notes</span>
                                <Icon name="arrow_downward" className="text-sm ml-0.5" />
                              </button>
                            )}
                            {hasAssessment && (
                              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                                <Icon name="quiz" className="text-sm text-amber-600" />
                                <span>Assessment ({activeQuestions.length} Qs)</span>
                              </div>
                            )}
                          </div>

                          {hasAssessment && (
                            <button
                              type="button"
                              onClick={() => {
                                pauseAllPlayers();
                                const entityKey = `pl_${activePlaylist?.id || 'pl'}`;
                                const curVidIdx = activePlaylistVideoIndex;
                                setActiveCheckpoint({
                                  id: `${entityKey}_v${curVidIdx}_end`,
                                  label: `Video ${curVidIdx + 1} Assessment: ${activePlaylistVideo?.title || 'Quiz'}`,
                                  isEnd: true,
                                  questions: activeQuestions,
                                });
                              }}
                              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                            >
                              <Icon name="assignment" className="text-base" />
                              <span>Take Video Assessment</span>
                              {completedCheckpoints[`pl_${activePlaylist?.id || 'pl'}_v${activePlaylistVideoIndex}_end`] && (
                                <span className="bg-white/25 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5">
                                  ✓ Done
                                </span>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Playlist Description */}
                    <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <h3 className="text-base font-extrabold uppercase tracking-wider text-[#0F172A] mb-3 flex items-center gap-2">
                        <Icon name="info" className="text-[#2563EB] text-xl" /> Playlist Description
                      </h3>
                      <div className="text-[#475569] text-sm leading-relaxed">
                        <div className={`overflow-hidden transition-all ${descExpanded ? 'block' : 'line-clamp-6'}`}>
                          <p className="whitespace-pre-line leading-relaxed">
                            {effectiveDescription}
                          </p>
                        </div>
                      </div>
                      {effectiveDescription.length > 250 && (
                        <button
                          type="button"
                          onClick={() => setDescExpanded(!descExpanded)}
                          className="mt-4 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>{descExpanded ? 'Show less' : 'Show more'}</span>
                          <Icon name={descExpanded ? 'expand_less' : 'expand_more'} className="text-base" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div className="block lg:hidden">
                    {renderPlaylistPanel(false)}
                  </div>
                )}

                {activeTab === 'tasks' && renderTasksTab()}
                {activeTab === 'materials' && renderMaterialsTab()}
                {activeTab === 'quiz' && renderQuizTab()}
                {activeTab === 'certificate' && renderCertificateTab()}
                {activeTab === 'learn' && renderLearnAndRequirementsTab()}
                {activeTab === 'reviews' && renderReviewsTab()}
              </div>
            </div>

            {/* Right Column (lg:col-span-4): Playlist Panel Sidebar */}
            <aside className="lg:col-span-4 space-y-6">
              {renderPlaylistPanel(true)}
            </aside>
          </div>
        ) : (
          /* Single Course: Two-Column Layout (Course Content on Right) */
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (lg:col-span-8): Video Player, Tabs, Tab Content */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                {courseValidity?.isExpired && (
                  <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Icon name="error" className="text-xl text-amber-600 shrink-0" />
                      <span>
                        Your course validity expired on {formatExactDate(courseValidity.expiryDate)}. Re-enroll to renew your validity and access full assessments.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        api.enrollCourse(slug).then((res) => setCourseValidity(res));
                      }}
                      className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                    >
                      Renew Access
                    </button>
                  </div>
                )}
                <div className="aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xl">
                  {lessonsList.length === 0 && !Boolean(extractYoutubeId(course?.youtubeVideoId) || extractYoutubeId(course?.youtubeUrl) || course?.videoUrl || course?.file) && !isPlaylistMode ? (
                    <div className="w-full h-full bg-gradient-to-br from-[#EFF6FF] via-white to-indigo-50 flex flex-col items-center justify-center text-center p-6 sm:p-10 text-[#0F172A] relative">
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] mb-4 shadow-sm">
                        <Icon name="smart_display" className="text-3xl" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-extrabold max-w-md">No Video Lessons Available Yet</h3>
                      <p className="text-xs sm:text-sm text-[#475569] max-w-lg mt-2 leading-relaxed">
                        The instructor has not added video lessons to this course yet. Lessons will appear here once added.
                      </p>
                    </div>
                  ) : isLessonLocked ? (
                    <div
                      className="w-full h-full bg-gradient-to-br from-[#EFF6FF] via-white to-indigo-50 flex flex-col items-center justify-center text-center p-6 sm:p-10 text-[#0F172A] relative cursor-pointer"
                      onClick={() => {
                        if (!user) {
                          navigate(`/login?redirect=/courses/${encodeURIComponent(slug)}`);
                        }
                      }}
                    >
                      <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-[#2563EB] mb-4 shadow-sm">
                        <Icon name="lock" className="text-3xl" />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB] mb-1">
                        {courseValidity?.isExpired ? 'Validity Expired' : 'Enrolled Learners Only'}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-extrabold max-w-md text-[#0F172A]">
                        {courseValidity?.isExpired
                          ? 'Your Course Validity Has Expired'
                          : !user
                            ? 'Login Required to Watch Video'
                            : `${lesson?.t || 'This Lesson'} is Locked`}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#475569] max-w-lg mt-2 mb-6 leading-relaxed">
                        {courseValidity?.isExpired
                          ? 'Your access period for this course has ended. Renew your enrollment to restore full access to all video lessons, quizzes, and resources.'
                          : !user
                            ? 'You must be logged in to watch course video lessons, track your progress, and take interactive quizzes.'
                            : 'Enroll in this course to get instant, full access to all lessons, interactive quizzes, and downloadable worksheets.'}
                      </p>
                      {courseValidity?.isExpired ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenewOrEnroll();
                          }}
                          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white font-bold text-sm hover:from-[#1D4ED8] hover:to-[#4338CA] transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                        >
                          <Icon name="refresh" className="text-base" /> Renew Access Now
                        </button>
                      ) : !user ? (
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          <Link
                            to={`/login?redirect=/courses/${encodeURIComponent(slug)}`}
                            onClick={(e) => e.stopPropagation()}
                            className="px-6 py-3 rounded-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white font-bold text-sm hover:from-[#1D4ED8] hover:to-[#4338CA] transition-all shadow-md active:scale-95 flex items-center gap-2"
                          >
                            <Icon name="login" className="text-base" /> Log In to Watch Video
                          </Link>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenewOrEnroll();
                          }}
                          className="px-6 py-3 rounded-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white font-bold text-sm hover:from-[#1D4ED8] hover:to-[#4338CA] transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-2"
                        >
                          <Icon name="school" className="text-base" /> Enroll Now (Free Access)
                        </button>
                      )}
                    </div>
                  ) : (
                    <Player
                      lesson={lesson}
                      course={course}
                      videoRef={videoRef}
                      ytPlayerRef={ytPlayerRef}
                      activeCheckpoint={activeCheckpoint}
                      setActiveCheckpoint={setActiveCheckpoint}
                      onCheckpointComplete={handleCheckpointComplete}
                      userAnswers={userAnswers}
                      setUserAnswers={setUserAnswers}
                      checkpoints={videoCheckpoints}
                      completedCheckpoints={completedCheckpoints}
                      onCheckpointSelect={(checkpoint) => {
                        pauseAllPlayers();
                        seekAllPlayers(checkpoint.seconds);
                        setActiveCheckpoint(checkpoint);
                      }}
                      onCheckpointClose={handleCheckpointClose}
                      onTimeUpdate={handleTimeUpdate}
                      onDurationChange={(d) => setVideoDuration(d)}
                      onSeekingOrSeeked={handleSeekingOrSeeked}
                      onVideoEnded={handleVideoEnded}
                      activePlaylistVideo={null}
                      playlistMode={false}
                      onPlay={handlePlayerPlay}
                      onPause={handlePlayerPause}
                      initialSeekTime={initialSeekTime}
                      strictNonSkippable={isStrictNonSkippable}
                      maxWatchedSeconds={activeMaxWatchedSec}
                      onSkipBlocked={triggerSkipBlockedToast}
                    />
                  )}
                  {skipBlockedToast && (
                    <div className="relative z-40 mt-2 px-4 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-extrabold shadow-sm flex items-center gap-2">
                      <Icon name="lock_clock" className="text-base text-amber-600 shrink-0" />
                      <span>{skipBlockedToast}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Horizontal Pill Navigation Tabs */}
              {renderNavTabs(true)}

              {/* Selected Tab Content */}
              <div className="w-full pt-1 pb-4">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Single Course Lesson Controls */}
                    {lessonsList.length > 0 && (
                      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex flex-col gap-1 max-w-xl">
                            <span className="text-[11px] font-black uppercase tracking-wider text-[#2563EB]">
                              Current Lesson ({idx + 1} of {lessonsList.length})
                            </span>
                            <h2 className="text-lg md:text-xl font-extrabold text-[#0F172A]">
                              {idx + 1}. {lesson?.t}
                            </h2>
                            {lesson?.description && (
                              <p className="text-xs sm:text-sm text-[#475569] leading-relaxed mt-0.5">
                                {lesson.description}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2.5">
                            {hasLessonNotes(lesson) && (
                              <button
                                type="button"
                                onClick={() => handleOpenChapterNotesModal(lesson, idx)}
                                className="px-4 py-2 rounded-full bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                                title={`Download Notes for ${lesson?.t || `Chapter ${idx + 1}`}`}
                              >
                                <Icon name="description" className="text-base" />
                                <span>Download Notes</span>
                                <Icon name="arrow_downward" className="text-sm ml-0.5" />
                              </button>
                            )}
                            {activeQuestions.length > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveCheckpoint({
                                    id: `${slug}_v${idx}_end`,
                                    label: `Lesson ${idx + 1} Assignment: ${lesson?.t || 'Quiz'}`,
                                    isEnd: true,
                                    questions: activeQuestions,
                                  });
                                }}
                                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 cursor-pointer"
                              >
                                <Icon name="assignment" className="text-base" />
                                <span>Take Assignment ({activeQuestions.length} Qs)</span>
                                {completedCheckpoints[`${slug}_v${idx}_end`] && (
                                  <span className="bg-white/25 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5">
                                    ✓ Done
                                  </span>
                                )}
                              </button>
                            )}
                            {user?.role === 'admin' && (
                              <button
                                type="button"
                                onClick={() => setAdminAssessmentModalOpen(true)}
                                className="px-3.5 py-1.5 rounded-xl bg-blue-50 text-[#2563EB] hover:bg-blue-100 text-xs font-bold flex items-center gap-1.5 transition border border-blue-200 cursor-pointer"
                              >
                                <Icon name="tune" className="text-base" />
                                Admin: Manage Assignments ({allQuestions.length} Qs)
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={handlePrevLesson}
                            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-bold text-[#0F172A] disabled:opacity-40 hover:bg-slate-50 transition-all flex items-center gap-1 cursor-pointer disabled:cursor-not-allowed"
                          >
                            <Icon name="arrow_back" className="text-base" />
                            {t('courses.prev')}
                          </button>

                          <button
                            type="button"
                            onClick={handleCompleteAndNext}
                            className="px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
                          >
                            <Icon name="check_circle" className="text-base" />
                            {done.includes(idx) ? 'Next Chapter' : 'Complete & Next'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Course Description */}
                    <div className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <h3 className="text-base font-extrabold uppercase tracking-wider text-[#0F172A] mb-3 flex items-center gap-2">
                        <Icon name="info" className="text-[#2563EB] text-xl" /> Course Description
                      </h3>
                      <div className="text-[#475569] text-sm leading-relaxed">
                        <div className={`overflow-hidden transition-all ${descExpanded ? 'block' : 'line-clamp-6'}`}>
                          <p className="whitespace-pre-line leading-relaxed">
                            {effectiveDescription}
                          </p>
                        </div>
                      </div>
                      {effectiveDescription.length > 250 && (
                        <button
                          type="button"
                          onClick={() => setDescExpanded(!descExpanded)}
                          className="mt-4 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>{descExpanded ? 'Show less' : 'Show more'}</span>
                          <Icon name={descExpanded ? 'expand_less' : 'expand_more'} className="text-base" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div className="block lg:hidden">
                    {renderCurriculumPanel(false)}
                  </div>
                )}

                {activeTab === 'tasks' && renderTasksTab()}
                {activeTab === 'materials' && renderMaterialsTab()}
                {activeTab === 'quiz' && renderQuizTab()}
                {activeTab === 'certificate' && renderCertificateTab()}
                {activeTab === 'learn' && renderLearnAndRequirementsTab()}
                {activeTab === 'reviews' && renderReviewsTab()}
              </div>
            </div>

            {/* Right Column (lg:col-span-4): Course Content on the right side of the video */}
            <aside className="lg:col-span-4 space-y-6">
              {renderCurriculumPanel(true)}
            </aside>
          </div>
        )}
      </Section>

      <Section tint title={t('courses.more')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">{related.map((c) => <CourseCard key={c.slug} course={c} />)}</div>
      </Section>

      {adminAssessmentModalOpen && (
        <CourseAssessmentModal
          isOpen={adminAssessmentModalOpen}
          course={course}
          initialVideoIndex={idx}
          onClose={() => setAdminAssessmentModalOpen(false)}
          onSaved={(updatedCourse) => {
            setCourse((prev) => ({ ...(prev || {}), ...updatedCourse }));
            setCompletedCheckpoints({});
            setUserAnswers({});
            try {
              localStorage.removeItem(`gg-checkpoints-${userKey}-${slug}`);
              localStorage.removeItem(`gg-quiz-ans-${userKey}-${slug}`);
            } catch { }
          }}
        />
      )}

      {notesModalChapter && (
        <ChapterNotesDownloadModal
          isOpen={Boolean(notesModalChapter)}
          chapter={notesModalChapter}
          chapterIndex={notesModalIndex}
          courseTitle={isPlaylistMode ? (activePlaylist?.title || pick(course.title)) : pick(course.title)}
          onClose={() => setNotesModalChapter(null)}
        />
      )}

      {taskModalOpen && videoAssignedTask && (
        <UserTaskModal
          task={videoAssignedTask}
          onClose={() => setTaskModalOpen(false)}
          onTaskUpdated={(updated) => {
            setVideoAssignedTask((prev) => ({ ...prev, ...updated }));
            if (updated?.certificate) setCourseCertificate(updated.certificate);
            if (updated?.certificateStatus) setCertificateStatus(updated.certificateStatus);
            refreshCertificateStatus();
          }}
        />
      )}

      <ExpertModal
        isOpen={certContactOpen}
        onClose={() => setCertContactOpen(false)}
        initialName={(courseCertificate || certificateStatus?.certificate)?.learnerName || user?.name || ''}
        initialWorkEmail={user?.email || ''}
        initialSolutionArea="G-Mark Certified Academy"
        initialMessage={
          (courseCertificate || certificateStatus?.certificate)
            ? `Hello G-Mark Software Team,\n\nI have earned a verified certification credential and would like to connect / apply:\n• Certificate ID: ${(courseCertificate || certificateStatus?.certificate).certificateCode}\n• Course: ${(courseCertificate || certificateStatus?.certificate).courseTitle}\n• Learner: ${(courseCertificate || certificateStatus?.certificate).learnerName || user?.name || ''}\n• Verification Link: ${typeof window !== 'undefined' ? `${window.location.origin}/verify-certificate/${(courseCertificate || certificateStatus?.certificate).certificateCode}` : ''}`
            : ''
        }
      />

      <CertificationIntroModal
        isOpen={certIntroOpen}
        courseTitle={isPlaylistMode && activePlaylist?.title ? activePlaylist.title : pick(course?.title)}
        strictNonSkippable={isStrictNonSkippable}
        requireProject={projectRequiredForCert}
        onStartWatching={() => {
          playAllPlayers();
        }}
        onClose={() => setCertIntroOpen(false)}
      />

      <CertificationSuccessModal
        isOpen={certCongratsOpen}
        certificate={courseCertificate || certificateStatus?.certificate}
        learnerNameFallback={user?.name || 'Verified Learner'}
        courseTitleFallback={isPlaylistMode && activePlaylist?.title ? activePlaylist.title : pick(course?.title)}
        onViewCertificate={(cert) => {
          setCertCongratsOpen(false);
          if (cert?.certificateCode) {
            navigate(`/certificates/${encodeURIComponent(cert.certificateCode)}`);
          } else {
            setActiveTab('certificate');
          }
        }}
        onContactCompany={() => {
          setCertCongratsOpen(false);
          setCertContactOpen(true);
        }}
        onClose={() => setCertCongratsOpen(false)}
      />
    </>
  );
}
