import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { useAuth } from '../lib/AuthContext.jsx';
import { getCourses, getPlaylists, DEFAULT_COURSES } from '../lib/courses.js';
import { api } from '../lib/api.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import UserTasksSection from '../components/UserTasksSection.jsx';
import CertificateView from '../components/CertificateView.jsx';
import ExpertModal from '../components/ExpertModal.jsx';

function formatExactDate(v, lang = 'en') {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(lang === 'mr' ? 'mr-IN' : 'en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatExactTime(v, lang = 'en') {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString(lang === 'mr' ? 'mr-IN' : 'en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function formatRelativeTime(v, lang = 'en') {
  if (!v) return '';
  const d = new Date(v);
  const now = new Date();
  const diffSec = Math.floor((now - d) / 1000);
  if (isNaN(diffSec)) return '';
  const isMr = lang === 'mr';
  if (diffSec < 60) return isMr ? 'आत्ताच' : 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return isMr ? `${diffMin} मि. पूर्वी` : `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return isMr ? `${diffHrs} ता. पूर्वी` : `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return isMr ? `${diffDays} दि. पूर्वी` : `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return isMr ? `${diffMonths} महि. पूर्वी` : `${diffMonths}mo ago`;
  return isMr ? `${Math.floor(diffMonths / 12)} वर्ष पूर्वी` : `${Math.floor(diffMonths / 12)}y ago`;
}

function formatVideoPosition(sec) {
  if (!sec || isNaN(sec) || sec <= 0) return null;
  const s = Math.round(sec);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function formatWatchTime(totalSec) {
  const totalMins = Math.floor(Math.max(0, Number(totalSec) || 0) / 60);
  if (totalMins < 60) {
    return `${totalMins}m`;
  }
  const hrs = Math.floor(totalMins / 60);
  const remMins = totalMins % 60;
  if (remMins === 0) {
    return `${hrs}h`;
  }
  return `${hrs}h ${remMins}m`;
}

export default function UserDashboard() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const isMr = lang === 'mr';

  // Active dashboard tab: 'learning' | 'tasks' | 'queries' | 'activity' | 'purpose'
  const [activeTab, setActiveTab] = useState('learning');
  const [tasksCount, setTasksCount] = useState(0);
  const [submittedTasksCount, setSubmittedTasksCount] = useState(0);
  const [certificates, setCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(false);
  const [previewCertificate, setPreviewCertificate] = useState(null);
  const [certContactTarget, setCertContactTarget] = useState(null);

  // Backend live states
  const [serverEnrolled, setServerEnrolled] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [queries, setQueries] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loadingQueries, setLoadingQueries] = useState(false);
  const [loadingActivities, setLoadingActivities] = useState(false);

  // New Query Form State
  const [showNewQueryForm, setShowNewQueryForm] = useState(false);
  const [querySubject, setQuerySubject] = useState('');
  const [queryMessage, setQueryMessage] = useState('');
  const [queryCourseSlug, setQueryCourseSlug] = useState('');
  const [submittingQuery, setSubmittingQuery] = useState(false);
  const [queryNotice, setQueryNotice] = useState('');

  // Course deletion state from My Learning
  const [deletingSlug, setDeletingSlug] = useState(null);
  const [deletedSlugs, setDeletedSlugs] = useState(() => new Set());

  const handleDeleteCourse = async (item) => {
    if (!item?.slug) return;
    const courseTitle = item.title || 'this course';
    const confirmed = window.confirm(`Are you sure you want to remove "${courseTitle}" from My Learning?`);
    if (!confirmed) return;

    setDeletingSlug(item.slug);

    try {
      await api.deleteMyLearningCourse(item.slug);
    } catch (err) {
      console.warn('Failed to delete course from server:', err);
    }

    try {
      localStorage.removeItem(`gg-done-${userKey}-${item.slug}`);
      localStorage.removeItem(`gg-checkpoints-${userKey}-${item.slug}`);
      localStorage.removeItem(`gg-resume-${userKey}-${item.slug}`);
      localStorage.removeItem(`gg-actual-watchtime-${userKey}-${item.slug}`);
    } catch (e) {
      console.warn('Error clearing local storage for course:', e);
    }

    setDeletedSlugs((prev) => new Set([...prev, item.slug]));
    setServerEnrolled((prev) => (Array.isArray(prev) ? prev.filter((c) => c.courseSlug !== item.slug) : []));
    setDeletingSlug(null);
  };


  const allCourses = useMemo(() => {
    try {
      const list = getCourses();
      if (Array.isArray(list) && list.length > 0) return list;
    } catch { }
    return DEFAULT_COURSES;
  }, []);

  const userKey = user ? (user.id || user.email || 'user') : 'guest';

  // Load live PostgreSQL LMS data
  const loadDashboardData = () => {
    if (!user?.id) return;

    // 1. Fetch live enrolled courses and progress
    api.getMyLearning()
      .then((data) => {
        if (Array.isArray(data)) setServerEnrolled(data);
      })
      .catch(() => { });

    // 2. Fetch student profile
    api.getStudentProfile()
      .then((prof) => {
        if (prof) setProfileData(prof);
      })
      .catch(() => { });

    // 3. Fetch student queries
    setLoadingQueries(true);
    api.getMyQueries()
      .then((qList) => {
        if (Array.isArray(qList)) setQueries(qList);
      })
      .catch(() => { })
      .finally(() => setLoadingQueries(false));

    // 4. Fetch student recent activities
    setLoadingActivities(true);
    api.getMyActivity()
      .then((actList) => {
        if (Array.isArray(actList)) setActivities(actList);
      })
      .catch(() => { })
      .finally(() => setLoadingActivities(false));

    // 5. Fetch assigned video tasks count
    api.getMyTasks()
      .then((tList) => {
        if (Array.isArray(tList)) {
          setTasksCount(tList.length);
          setSubmittedTasksCount(tList.filter((t) => t.status && t.status !== 'pending').length);
        }
      })
      .catch(() => { });

    // 6. Fetch earned certificates
    if (typeof api?.getMyCertificates === 'function') {
      setLoadingCertificates(true);
      api.getMyCertificates()
        .then((certList) => {
          if (Array.isArray(certList)) setCertificates(certList);
        })
        .catch(() => { })
        .finally(() => setLoadingCertificates(false));
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user?.id]);

  // Read local user progress as fallback or blend with server
  const localProgressData = useMemo(() => {
    if (!user) return { enrolled: [], totalDone: 0, totalWatchTimeSec: 0, checkpointsPassedCount: 0 };

    let totalDone = 0;
    let checkpointsPassedCount = 0;
    const enrolled = [];

    // 1. Process standard courses
    allCourses.forEach((c) => {
      let doneLessons = [];
      try {
        doneLessons = JSON.parse(localStorage.getItem(`gg-done-${userKey}-${c.slug}`)) || [];
      } catch { }

      let checkpoints = {};
      try {
        checkpoints = JSON.parse(localStorage.getItem(`gg-checkpoints-${userKey}-${c.slug}`)) || {};
      } catch { }

      const cpPassed = Object.keys(checkpoints).filter((k) => checkpoints[k]).length;
      checkpointsPassedCount += cpPassed;
      totalDone += doneLessons.length;

      const totalLessons = Array.isArray(c.lessons) && c.lessons.length > 0 ? c.lessons.length : 1;
      const pct = Math.min(100, Math.round((doneLessons.length / totalLessons) * 100));

      let isEnrolledExplicitly = false;
      try {
        const enrList = JSON.parse(localStorage.getItem(`gg-enrolled-${userKey}`) || '[]');
        if (enrList.includes(c.slug)) isEnrolledExplicitly = true;
      } catch { }

      if (doneLessons.length > 0 || cpPassed > 0 || isEnrolledExplicitly) {
        enrolled.push({
          itemType: 'course',
          course: c,
          slug: c.slug,
          doneLessons,
          totalLessons,
          pct,
          checkpointsPassed: cpPassed,
        });
      }
    });

    // 2. Process playlists from localStorage fallback
    const allPlaylists = getPlaylists() || [];
    allPlaylists.forEach((pl) => {
      let playlistWatched = {};
      try {
        playlistWatched = JSON.parse(localStorage.getItem(`gg-playlist-done-${userKey}-${pl.id}`)) || {};
      } catch { }

      const watchedCount = Object.keys(playlistWatched).filter((k) => playlistWatched[k]).length;
      totalDone += watchedCount;

      const totalVideos = Array.isArray(pl.videos) && pl.videos.length > 0 ? pl.videos.length : 1;
      const pct = Math.min(100, Math.round((watchedCount / totalVideos) * 100));

      let isEnrolledExplicitly = false;
      try {
        const enrList = JSON.parse(localStorage.getItem(`gg-enrolled-${userKey}`) || '[]');
        if (enrList.includes(pl.id)) isEnrolledExplicitly = true;
      } catch { }

      if (watchedCount > 0 || isEnrolledExplicitly) {
        enrolled.push({
          itemType: 'playlist',
          playlist: pl,
          slug: pl.id,
          doneLessons: Object.keys(playlistWatched).filter((k) => playlistWatched[k]),
          totalLessons: totalVideos,
          pct,
          checkpointsPassed: 0,
        });
      }
    });

    let totalWatchTimeSec = 0;
    allCourses.forEach((c) => {
      try {
        const stored = localStorage.getItem(`gg-actual-watchtime-${userKey}-${c.slug}`);
        if (stored) {
          totalWatchTimeSec += Math.max(0, Number(stored) || 0);
        }
      } catch { }
    });

    allPlaylists.forEach((pl) => {
      try {
        const stored = localStorage.getItem(`gg-actual-watchtime-${userKey}-${pl.id}`);
        if (stored) {
          totalWatchTimeSec += Math.max(0, Number(stored) || 0);
        }
      } catch { }
    });

    return {
      enrolled,
      totalDone,
      totalWatchTimeSec,
      checkpointsPassedCount,
    };
  }, [allCourses, user, userKey]);

  // Helper to read saved resume position from localStorage fallback if not in server response
  const getResumeInfo = (item) => {
    let pos = item.lastPositionSec || 0;
    let chTitle = item.lastAccessedLessonTitle || '';

    try {
      const targetSlug = item.courseSlug || item.slug || item.id;
      const raw = localStorage.getItem(`gg-resume-${userKey}-${targetSlug}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'number' && parsed > pos) {
          pos = parsed;
        } else if (parsed && typeof parsed.position === 'number' && parsed.position > pos) {
          pos = parsed.position;
        }
      }
    } catch { }

    return {
      positionSec: pos,
      formattedPos: formatVideoPosition(pos),
      chapterTitle: chTitle,
    };
  };

  // Final consolidated learning courses and playlists list
  const displayEnrolledCourses = useMemo(() => {
    let list = [];
    const allPlaylists = getPlaylists() || [];

    if (Array.isArray(serverEnrolled) && serverEnrolled.length > 0) {
      list = serverEnrolled.map((item) => {
        const matchingLocalCourse = allCourses.find((c) => c.slug === item.courseSlug);
        const matchingLocalPlaylist = allPlaylists.find((p) => p.id === item.courseSlug || p.id === item.playlistId);
        const resume = getResumeInfo(item);
        const isPlaylist = item.itemType === 'playlist' || Boolean(matchingLocalPlaylist);

        const title = isPlaylist
          ? (item.courseName || matchingLocalPlaylist?.title || 'Playlist')
          : (item.courseName || (typeof matchingLocalCourse?.title === 'string' ? matchingLocalCourse.title : matchingLocalCourse?.title?.en) || 'Course');

        const category = isPlaylist
          ? (item.category || matchingLocalPlaylist?.category || 'general')
          : (item.category || matchingLocalCourse?.category || 'General');

        const image = isPlaylist
          ? (item.image || item.thumbnailUrl || matchingLocalPlaylist?.thumbnailUrl || null)
          : (item.image || item.thumbnailUrl || matchingLocalCourse?.image || matchingLocalCourse?.thumbnailUrl || null);

        const shortDescription = isPlaylist
          ? (item.shortDescription || matchingLocalPlaylist?.description || matchingLocalPlaylist?.shortDescription || '')
          : (item.shortDescription || (typeof matchingLocalCourse?.short === 'string' ? matchingLocalCourse.short : matchingLocalCourse?.shortDescription) || '');

        const totalItems = isPlaylist
          ? (item.videosCount || item.totalLessons || matchingLocalPlaylist?.videos?.length || 1)
          : (item.totalLessons || matchingLocalCourse?.lessons?.length || 1);

        const doneCount = isPlaylist
          ? (item.completedVideosCount || item.completedLessonsCount || 0)
          : (item.completedLessonsCount ?? 0);

        return {
          itemType: isPlaylist ? 'playlist' : 'course',
          slug: item.courseSlug,
          playlistId: item.playlistId || (isPlaylist ? item.courseSlug : null),
          title,
          shortDescription,
          category,
          image,
          pct: item.progressPercent ?? 0,
          doneCount,
          totalLessons: totalItems,
          lastWatchedChapter: item.lastAccessedLessonTitle || resume.chapterTitle || null,
          lastWatchedPosition: resume.formattedPos,
          isCompleted: item.isCompleted,
          validityDays: item.validityDays || 365,
          expiryDate: item.expiryDate,
          isExpired: item.isExpired,
          daysRemaining: item.daysRemaining,
          status: item.status,
          rawCourse: matchingLocalCourse || matchingLocalPlaylist || item,
        };
      });
    } else {
      // Fallback to local progress
      list = localProgressData.enrolled.map((item) => {
        const isPlaylist = item.itemType === 'playlist';
        if (isPlaylist) {
          const pl = item.playlist;
          const resume = getResumeInfo({ courseSlug: pl.id });
          return {
            itemType: 'playlist',
            slug: pl.id,
            playlistId: pl.id,
            title: pl.title || 'Playlist',
            shortDescription: pl.description || pl.shortDescription || '',
            category: pl.category || 'general',
            image: pl.thumbnailUrl || null,
            pct: item.pct,
            doneCount: item.doneLessons.length,
            totalLessons: item.totalLessons,
            lastWatchedChapter: resume.chapterTitle || null,
            lastWatchedPosition: resume.formattedPos,
            isCompleted: item.pct === 100,
            validityDays: 365,
            expiryDate: null,
            isExpired: false,
            daysRemaining: 365,
            status: 'active',
            rawCourse: pl,
          };
        } else {
          const c = item.course;
          const resume = getResumeInfo(c);
          return {
            itemType: 'course',
            slug: c.slug,
            title: typeof c.title === 'string' ? c.title : c.title?.en || c.courseName || 'Course',
            shortDescription: typeof c.short === 'string' ? c.short : c.shortDescription || '',
            category: c.category,
            image: c.image || c.thumbnailUrl || null,
            pct: item.pct,
            doneCount: item.doneLessons.length,
            totalLessons: item.totalLessons,
            lastWatchedChapter: resume.chapterTitle || null,
            lastWatchedPosition: resume.formattedPos,
            isCompleted: item.pct === 100,
            validityDays: 365,
            expiryDate: null,
            isExpired: false,
            daysRemaining: 365,
            status: 'active',
            rawCourse: c,
          };
        }
      });
    }
    return list.filter((item) => !deletedSlugs.has(item.slug));
  }, [serverEnrolled, localProgressData, allCourses, userKey, deletedSlugs]);

  const totalCompletedLessons = useMemo(() => {
    if (serverEnrolled && serverEnrolled.length > 0) {
      return serverEnrolled.reduce((sum, c) => {
        const isPlaylist = c.itemType === 'playlist';
        const done = isPlaylist
          ? Math.max(c.completedVideosCount || 0, c.completedLessonsCount || 0)
          : (c.completedLessonsCount || 0);
        return sum + done;
      }, 0);
    }
    return localProgressData.totalDone;
  }, [serverEnrolled, localProgressData]);

  const totalWatchTimeSec = useMemo(() => {
    const itemSlugs = new Set();
    if (Array.isArray(serverEnrolled)) {
      serverEnrolled.forEach((item) => {
        if (item.courseSlug) itemSlugs.add(item.courseSlug);
      });
    }
    allCourses.forEach((c) => {
      if (c.slug) itemSlugs.add(c.slug);
    });
    const allPlaylists = getPlaylists() || [];
    allPlaylists.forEach((pl) => {
      if (pl.id) itemSlugs.add(pl.id);
    });

    let total = 0;
    itemSlugs.forEach((slug) => {
      let serverTime = 0;
      if (Array.isArray(serverEnrolled)) {
        const item = serverEnrolled.find((s) => s.courseSlug === slug);
        if (item) {
          serverTime = Math.max(0, Number(item.watchTimeSec) || 0);
        }
      }

      let localTime = 0;
      try {
        const stored = localStorage.getItem(`gg-actual-watchtime-${userKey}-${slug}`);
        if (stored) {
          localTime = Math.max(0, Number(stored) || 0);
        }
      } catch { }

      total += Math.max(serverTime, localTime);
    });

    return total;
  }, [serverEnrolled, allCourses, userKey]);

  // Handle submitting a student query
  const handleQuerySubmit = async (e) => {
    if (e) e.preventDefault();
    const effectiveSubject = (querySubject || '').trim() || (queryMessage || '').trim();
    const effectiveMessage = (queryMessage || '').trim() || (querySubject || '').trim();
    if (!effectiveSubject && !effectiveMessage) {
      setQueryNotice('Please enter your question or doubt.');
      return;
    }
    setSubmittingQuery(true);
    setQueryNotice('');
    try {
      await api.submitQuery({
        subject: effectiveSubject,
        message: effectiveMessage,
        courseSlug: queryCourseSlug || undefined,
      });
      setQueryNotice('Query submitted successfully! Our mentors will review and answer it shortly.');
      setQuerySubject('');
      setQueryMessage('');
      setQueryCourseSlug('');
      setShowNewQueryForm(false);
      // Reload queries
      const updated = await api.getMyQueries();
      if (Array.isArray(updated)) setQueries(updated);
      setTimeout(() => setQueryNotice(''), 4000);
    } catch (err) {
      setQueryNotice(err.message || 'Failed to submit query. Please try again.');
    } finally {
      setSubmittingQuery(false);
    }
  };



  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center text-[#2563EB]">
        <Icon name="sync" className="animate-spin text-4xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white border border-slate-200 rounded-2xl shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center mx-auto mb-4">
          <Icon name="lock" className="text-3xl" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#0F172A] mb-2">
          {isMr ? 'साइन इन आवश्यक आहे' : 'Sign In Required'}
        </h2>
        <p className="text-xs text-[#475569] mb-6">
          {isMr
            ? 'आपल्या नोंदणीकृत विद्यार्थी डॅशबोर्डमध्ये प्रवेश करण्यासाठी आणि कोर्सेस ट्रॅक करण्यासाठी कृपया साइन इन करा.'
            : 'Please sign in to access your registered learner dashboard and track your courses.'}
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/login"
            state={{ from: '/dashboard' }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white font-bold text-xs hover:from-[#1D4ED8] hover:to-[#4338CA] transition shadow-md shadow-blue-600/20"
          >
            {isMr ? 'साइन इन करा' : 'Sign In'}
          </Link>
          <Link
            to="/register"
            className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-[#0F172A] font-bold text-xs hover:bg-slate-50 transition"
          >
            {isMr ? 'खाते तयार करा' : 'Create Account'}
          </Link>
        </div>
      </div>
    );
  }

  const initials = (user.fullName || user.email || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isAdmin = user.role === 'admin' || user.role === 'super_admin';

  const resumeItem =
    displayEnrolledCourses.find((c) => c.pct > 0 && c.pct < 100) ||
    displayEnrolledCourses.find((c) => !c.isCompleted) ||
    displayEnrolledCourses[0] ||
    null;

  const resumeTargetLink = resumeItem
    ? resumeItem.itemType === 'playlist'
      ? `/playlists/${encodeURIComponent(resumeItem.playlistId || resumeItem.slug)}`
      : `/courses/${encodeURIComponent(resumeItem.slug)}`
    : '/courses';

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-6 sm:py-8 px-4 sm:px-6 lg:px-12 text-[#0F172A]">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Quick Top Navigation Strip */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-[#475569] hover:text-[#2563EB] hover:border-blue-300 shadow-2xs transition"
            >
              <Icon name="arrow_back" className="text-sm" /> Back to Website
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-[#475569] hover:text-[#2563EB] hover:border-blue-300 shadow-2xs transition"
            >
              <Icon name="school" className="text-sm text-[#2563EB]" /> Browse Courses
            </Link>
          </div>
          <span className="text-xs font-semibold text-[#0D9488] bg-teal-50 border border-teal-200 px-3 py-1 rounded-full">
            G-Mark Learner Portal
          </span>
        </div>

        {/* Top Profile Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-center gap-4 sm:gap-5">
            <div
              className={`w-16 sm:w-18 h-16 sm:h-18 rounded-2xl flex items-center justify-center text-xl sm:text-2xl font-black text-white shadow-md shrink-0 ${isAdmin
                  ? 'bg-gradient-to-tr from-[#4F46E5] to-[#2563EB]'
                  : 'bg-gradient-to-tr from-[#2563EB] to-[#0D9488]'
                }`}
            >
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">
                  {user.fullName || (isMr ? 'नोंदणीकृत विद्यार्थी' : 'Registered Learner')}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1 ${isAdmin
                      ? 'bg-indigo-50 text-[#4F46E5] border border-indigo-200'
                      : 'bg-blue-50 text-[#2563EB] border border-blue-200'
                    }`}
                >
                  <Icon name={isAdmin ? 'verified_user' : 'school'} className="text-xs" />
                  {isAdmin
                    ? (isMr ? 'प्लॅटफॉर्म ॲडमिनिस्ट्रेटर' : 'Platform Administrator')
                    : (isMr ? 'नोंदणीकृत विद्यार्थी' : 'Registered Learner')}
                </span>
              </div>

              <p className="text-xs text-[#475569] font-medium mt-1.5 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1">
                  <Icon name="mail" className="text-xs text-slate-400" />
                  {user.email}
                </span>
                <span>·</span>
                <span className="flex items-center gap-1 font-semibold text-slate-600">
                  <Icon name="event" className="text-xs text-[#2563EB]" />
                  {isMr ? 'सामील झाल्याची तारीख: ' : 'Joined on '}
                  {formatExactDate(user.createdAt, lang)}
                </span>
                {user.createdAt && (
                  <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-[#2563EB]">
                    {formatRelativeTime(user.createdAt, lang)}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-[#1D4ED8] hover:to-[#4338CA] text-white text-xs font-bold transition shadow-sm"
              >
                <Icon name="admin_panel_settings" className="text-base text-white" />
                {isMr ? 'ॲडमिन पॅनेल →' : 'Admin Panel →'}
              </Link>
            )}

            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-red-50 text-slate-700 hover:text-red-600 hover:border-red-200 text-xs font-bold transition shadow-2xs cursor-pointer"
            >
              <Icon name="logout" className="text-sm" />
              {isMr ? 'साइन आउट' : 'Sign Out'}
            </button>
          </div>
        </div>

        {/* Bright "Continue Learning" Hero Card */}
        <div className="bg-gradient-to-br from-[#EFF6FF] via-white to-teal-50/70 border border-blue-200 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-all">
          {resumeItem ? (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 flex-1 min-w-0">
                <div className="w-full sm:w-44 aspect-video rounded-xl overflow-hidden bg-blue-100 border border-slate-200 shadow-xs shrink-0 relative">
                  {resumeItem.image ? (
                    <img src={resumeItem.image} alt={resumeItem.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100 text-[#2563EB]">
                      <Icon name={resumeItem.itemType === 'playlist' ? 'playlist_play' : 'school'} className="text-4xl" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-[#2563EB]">
                      {isMr ? 'शिकणे सुरू ठेवा' : 'Continue Learning'}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border inline-flex items-center gap-1 ${
                        resumeItem.pct === 100
                          ? 'bg-emerald-50 text-[#0D9488] border-emerald-200'
                          : resumeItem.pct > 0
                            ? 'bg-blue-50 text-[#2563EB] border-blue-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <Icon
                        name={resumeItem.pct === 100 ? 'check_circle' : 'play_circle'}
                        className="text-xs"
                      />
                      {resumeItem.pct === 100
                        ? (isMr ? 'पूर्ण झाले' : 'Lesson Completed')
                        : resumeItem.pct > 0
                          ? (isMr ? `प्रगतीपथावर • ${resumeItem.pct}%` : `In Progress • ${resumeItem.pct}%`)
                          : (isMr ? 'सुरू करण्यासाठी सज्ज' : 'Ready to Start')}
                    </span>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] truncate" title={resumeItem.title}>
                    {resumeItem.title}
                  </h2>

                  <p className="text-xs sm:text-sm text-[#475569] mt-1 flex items-center gap-2 flex-wrap">
                    <span>
                      {resumeItem.doneCount} of {resumeItem.totalLessons}{' '}
                      {resumeItem.itemType === 'playlist' ? 'videos' : 'lessons'} completed
                    </span>
                    {resumeItem.lastWatchedChapter && (
                      <>
                        <span>·</span>
                        <span className="truncate font-semibold text-[#0F172A]">
                          Up next: {resumeItem.lastWatchedChapter}
                        </span>
                      </>
                    )}
                  </p>

                  {/* Smooth Teal-to-Blue Gradient Progress Bar */}
                  <div className="mt-3.5 max-w-xl">
                    <div className="w-full h-2.5 rounded-full bg-slate-200/80 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#0D9488] to-[#2563EB] transition-all duration-500"
                        style={{ width: `${Math.max(resumeItem.pct, resumeItem.pct === 0 ? 4 : 6)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  to={resumeTargetLink}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-[#1D4ED8] hover:to-[#4338CA] text-white text-sm font-bold shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98]"
                >
                  <Icon name="play_arrow" className="text-lg" />
                  <span>{isMr ? 'धडा पुन्हा सुरू करा' : 'Resume Lesson'}</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold mb-2">
                  <Icon name="rocket_launch" className="text-sm text-[#0D9488]" />
                  Continue Learning
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A]">
                  {isMr ? 'शिकायला तयार आहात का?' : 'Start your first G-Mark Academy course'}
                </h2>
                <p className="text-xs sm:text-sm text-[#475569] mt-1 max-w-2xl">
                  {isMr
                    ? 'आपली कौशल्ये वाढवण्यासाठी आमच्या मोफत कोर्सेस आणि व्हिडिओ प्लेलिस्ट एक्सप्लोर करा.'
                    : 'Explore free video courses, downloadable chapter notes, and guided practice tasks tailored for industry.'}
                </p>
              </div>
              <Link
                to="/courses"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-[#1D4ED8] hover:to-[#4338CA] text-white text-sm font-bold shadow-lg shadow-blue-600/25 shrink-0 transition"
              >
                <Icon name="explore" className="text-lg" />
                <span>{isMr ? 'कोर्सेस पहा' : 'Explore Courses'}</span>
              </Link>
            </div>
          )}
        </div>

        {/* Summary Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-2">
              <span>{isMr ? 'नोंदणीकृत कोर्सेस' : 'Enrolled Courses'}</span>
              <span className="w-8 h-8 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-100 flex items-center justify-center">
                <Icon name="school" className="text-lg" />
              </span>
            </div>
            <div className="text-3xl font-black text-[#0F172A]">
              {displayEnrolledCourses.length}
            </div>
            <div className="text-[11px] text-[#475569] mt-1">
              {isMr ? 'सक्रिय कोर्सेस आणि प्लेलिस्ट' : 'Active courses & playlists'}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-2">
              <span>{isMr ? 'पूर्ण झालेले धडे' : 'Completed Lessons'}</span>
              <span className="w-8 h-8 rounded-xl bg-teal-50 text-[#0D9488] border border-teal-100 flex items-center justify-center">
                <Icon name="check_circle" className="text-lg" />
              </span>
            </div>
            <div className="text-3xl font-black text-[#0D9488]">
              {totalCompletedLessons}
            </div>
            <div className="text-[11px] text-[#0D9488] font-medium mt-1">
              {isMr ? 'धडे पूर्ण झाले' : 'Lessons finished'}
            </div>
          </div>

          <div
            onClick={() => setActiveTab('tasks')}
            className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition ${activeTab === 'tasks' ? 'border-[#2563EB] ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-blue-300'
              }`}
          >
            <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-2">
              <span>{isMr ? 'सबमिट केलेले उपक्रम' : 'Tasks Submitted'}</span>
              <span className="w-8 h-8 rounded-xl bg-indigo-50 text-[#4F46E5] border border-indigo-100 flex items-center justify-center">
                <Icon name="assignment_turned_in" className="text-lg" />
              </span>
            </div>
            <div className="text-3xl font-black text-[#4F46E5]">
              {submittedTasksCount}
            </div>
            <div className="text-[11px] text-[#475569] font-medium mt-1">
              {isMr ? `${tasksCount} पैकी असाइनमेंट्स` : `of ${tasksCount} assigned tasks`}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-2">
              <span>{isMr ? 'पाहिलेला वेळ' : 'Watch Time'}</span>
              <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                <Icon name="schedule" className="text-lg" />
              </span>
            </div>
            <div className="text-3xl font-black text-amber-600">
              {formatWatchTime(totalWatchTimeSec)}
            </div>
            <div className="text-[11px] text-[#475569] font-medium mt-1">
              {isMr ? 'एकूण अभ्यास वेळ' : 'Total study time'}
            </div>
          </div>

          <div
            onClick={() => setActiveTab('queries')}
            className={`bg-white border rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition col-span-2 sm:col-span-1 ${activeTab === 'queries' ? 'border-[#2563EB] ring-2 ring-blue-500/20' : 'border-slate-200 hover:border-blue-300'
              }`}
          >
            <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-2">
              <span>{isMr ? 'माझे प्रश्न' : 'My Queries'}</span>
              <span className="w-8 h-8 rounded-xl bg-sky-50 text-[#0284C7] border border-sky-100 flex items-center justify-center">
                <Icon name="help_outline" className="text-lg" />
              </span>
            </div>
            <div className="text-3xl font-black text-[#0284C7]">
              {queries.length}
            </div>
            <div className="text-[11px] text-[#475569] font-medium mt-1">
              {isMr ? 'सबमिट केलेले मदत तिकिटे' : 'Support tickets submitted'}
            </div>
          </div>
        </div>

        {/* LMS Functional Navigation Bar */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('learning')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${activeTab === 'learning'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-[#475569] hover:bg-slate-100 hover:text-[#0F172A]'
              }`}
          >
            <Icon name="menu_book" className="text-sm" />
            {isMr ? `माझे शिक्षण (${displayEnrolledCourses.length})` : `My Learning (${displayEnrolledCourses.length})`}
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${activeTab === 'tasks'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-[#475569] hover:bg-slate-100 hover:text-[#0F172A]'
              }`}
          >
            <Icon name="assignment" className="text-sm" />
            {isMr ? `माझे उपक्रम (${tasksCount})` : `My Tasks (${tasksCount})`}
          </button>

          <button
            onClick={() => setActiveTab('queries')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${activeTab === 'queries'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-[#475569] hover:bg-slate-100 hover:text-[#0F172A]'
              }`}
          >
            <Icon name="help_outline" className="text-sm" />
            {isMr ? `माझे प्रश्न / मदत (${queries.length})` : `My Queries / Support (${queries.length})`}
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${activeTab === 'activity'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-[#475569] hover:bg-slate-100 hover:text-[#0F172A]'
              }`}
          >
            <Icon name="history" className="text-sm" />
            {isMr ? 'अलीकडील घडामोडी' : 'Recent Activity'}
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition cursor-pointer shrink-0 ${activeTab === 'certificates'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-[#475569] hover:bg-slate-100 hover:text-[#0F172A]'
              }`}
          >
            <Icon name="workspace_premium" className="text-sm text-amber-500" />
            {`My Certificates (${certificates.length})`}
          </button>
        </div>

        {/* ── TAB 1: MY LEARNING ── */}
        {activeTab === 'learning' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
                  <Icon name="menu_book" className="text-[#2563EB]" />
                  {isMr ? 'माझे शिक्षण' : 'My Learning'}
                </h2>
              </div>

              <Link
                to="/courses"
                className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1"
              >
                {isMr ? 'कोर्स सूची पहा →' : 'Browse Catalogue →'}
              </Link>
            </div>

            {displayEnrolledCourses.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center mx-auto mb-3">
                  <Icon name="school" className="text-3xl text-[#2563EB]" />
                </div>
                <h3 className="text-base font-extrabold text-[#0F172A]">
                  {isMr ? 'अद्याप कोणत्याही कोर्समध्ये नोंदणी केलेली नाही' : 'No courses enrolled yet'}
                </h3>
                <p className="text-xs text-[#475569] mt-1 max-w-md mx-auto">
                  {isMr
                    ? 'शिकण्यास सुरुवात करण्यासाठी उद्योजकता, डिजिटल कौशल्ये आणि समुदाय विकासातील आमचे कोर्सेस एक्सप्लोर करा.'
                    : 'Explore our courses in Entrepreneurship, Digital Skills, and Community Leadership to start learning.'}
                </p>
                <div className="mt-5">
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white font-bold text-xs hover:from-[#1D4ED8] hover:to-[#4338CA] transition shadow-md shadow-blue-600/20"
                  >
                    <Icon name="explore" className="text-base text-white" />
                    {isMr ? 'कोर्स सूची एक्सप्लोर करा' : 'Browse Courses Catalogue'}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayEnrolledCourses.map((item, idx) => {
                  const isZeroProgress = item.pct === 0;
                  const isPlaylist = item.itemType === 'playlist';
                  const targetLink = isPlaylist
                    ? `/playlists/${encodeURIComponent(item.playlistId || item.slug)}`
                    : `/courses/${encodeURIComponent(item.slug)}`;

                  return (
                    <div
                      key={item.slug || idx}
                      className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-0.5 transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* 16:9 Thumbnail Header with Badges */}
                        <div className="aspect-video w-full bg-gradient-to-br from-[#EFF6FF] to-indigo-50 relative overflow-hidden group">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-50 to-indigo-100/70 text-[#2563EB]">
                              <Icon name={isPlaylist ? "playlist_play" : "school"} className="text-4xl text-[#2563EB]/70" />
                            </div>
                          )}

                          {/* Top-left Type Badge */}
                          <div className="absolute top-2.5 left-2.5">
                            {isPlaylist ? (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/95 text-[#0D9488] border border-teal-200 shadow-xs flex items-center gap-1">
                                <Icon name="playlist_play" className="text-xs" />
                                {isMr
                                  ? `प्लेलिस्ट • ${item.totalLessons} व्हिडिओ`
                                  : `PLAYLIST • ${item.totalLessons} ${item.totalLessons === 1 ? 'Video' : 'Videos'}`}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/95 text-[#2563EB] shadow-xs flex items-center gap-1 border border-blue-200">
                                <Icon name="school" className="text-xs text-[#2563EB]" />
                                {isMr ? 'कोर्स' : 'COURSE'}
                              </span>
                            )}
                          </div>

                          {/* Top-right Completion Pill */}
                          <div className="absolute top-2.5 right-2.5">
                            {item.pct === 100 ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-[#0D9488] text-white shadow-xs flex items-center gap-1">
                                <Icon name="check" className="text-xs" /> {isMr ? 'पूर्ण झाले' : 'Completed'}
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-white/95 backdrop-blur-xs text-[#0F172A] shadow-xs border border-slate-200">
                                {isMr ? `${item.pct}% पूर्ण` : `${item.pct}% Complete`}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 sm:p-5">
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#475569] uppercase tracking-wider mb-1">
                            <span className="truncate text-[#2563EB]">{item.category}</span>
                            <span className="shrink-0 text-[10px]">
                              {isPlaylist
                                ? (isMr ? `${item.totalLessons} व्हिडिओ` : `${item.totalLessons} videos`)
                                : (isMr ? `${item.totalLessons} धडे` : `${item.totalLessons} chapters`)}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-base text-[#0F172A] leading-snug line-clamp-2 mb-2" title={item.title}>
                            {item.title}
                          </h4>

                          {/* Progress summary & Bar */}
                          <div className="mt-3 pt-3 border-t border-slate-100">
                            <div className="flex items-center justify-between text-xs font-bold text-[#475569] mb-1.5">
                              <span className="text-[#0D9488] font-black">
                                {isMr ? `${item.pct}%` : `${item.pct}%`}
                              </span>
                              <span className="text-slate-500 font-semibold text-[11px]">
                                {isPlaylist
                                  ? (isMr
                                    ? `${item.totalLessons} पैकी ${item.doneCount} व्हिडिओ पूर्ण`
                                    : `${item.doneCount} of ${item.totalLessons} ${item.totalLessons === 1 ? 'Video' : 'Videos'} completed`)
                                  : (isMr
                                    ? `${item.totalLessons} पैकी ${item.doneCount} धडे पूर्ण`
                                    : `${item.doneCount} of ${item.totalLessons} ${item.totalLessons === 1 ? 'Chapter' : 'Chapters'} completed`)}
                              </span>
                            </div>

                            {/* Sleek Progress Bar */}
                            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden border border-slate-200/70">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-[#0D9488] to-[#2563EB] transition-all duration-500"
                                style={{ width: `${Math.max(item.pct, isZeroProgress ? 0 : 5)}%` }}
                              />
                            </div>
                          </div>

                          {/* Last Watched Info */}
                          {item.lastWatchedChapter && (
                            <div className="mt-3 text-[11px] text-[#475569] flex items-center gap-1.5 truncate">
                              <Icon name="play_lesson" className="text-xs text-[#2563EB] shrink-0" />
                              <span className="truncate">
                                {isMr ? 'शेवटचे: ' : 'Last: '}
                                <strong className="text-[#0F172A]">{item.lastWatchedChapter}</strong>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Card Action Row */}
                      <div className="p-4 sm:p-5 pt-0 flex items-center gap-2">
                        <Link
                          to={targetLink}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-[#1D4ED8] hover:to-[#4338CA] text-white transition shadow-sm cursor-pointer"
                        >
                          <span>
                            {isZeroProgress
                              ? (isMr ? 'शिकण्यास सुरुवात करा' : 'Start Learning')
                              : item.pct === 100
                              ? (isMr ? 'पुनरावलोकन करा' : 'Review')
                              : (isMr ? 'शिकणे सुरू ठेवा' : 'Continue Learning')}
                          </span>
                          <span className="text-blue-100">→</span>
                        </Link>

                        <button
                          type="button"
                          disabled={deletingSlug === item.slug}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteCourse(item);
                          }}
                          title={isMr ? 'माझे शिक्षणमधून काढून टाका' : 'Remove from My Learning'}
                          className="w-9 h-9 rounded-xl border border-rose-200 bg-rose-50 text-rose-500 hover:bg-rose-100 hover:text-rose-700 disabled:opacity-50 flex items-center justify-center transition cursor-pointer shadow-2xs shrink-0"
                          aria-label="Remove from My Learning"
                        >
                          <Icon
                            name={deletingSlug === item.slug ? "hourglass_empty" : "delete"}
                            className={`text-base ${deletingSlug === item.slug ? 'animate-spin' : ''}`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: MY TASKS & ASSIGNMENTS ── */}
        {activeTab === 'tasks' && (
          <UserTasksSection user={user} />
        )}

        {/* ── TAB 2: MY QUERIES / SUPPORT ── */}
        {activeTab === 'queries' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
                  <Icon name="help_outline" className="text-[#2563EB]" />
                  {isMr ? 'माझे प्रश्न आणि मदत' : 'My Queries & Support'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowNewQueryForm((v) => !v)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-sm cursor-pointer"
              >
                <Icon name="add" className="text-sm" />
                {isMr ? 'नवीन प्रश्न विचारा' : 'Ask a Question'}
              </button>
            </div>

            {queryNotice && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-[#2563EB]">
                {queryNotice}
              </div>
            )}

            {/* New Query Form */}
            {showNewQueryForm && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <h3 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-2">
                  <Icon name="edit_note" className="text-[#2563EB]" />
                  {isMr ? 'प्रश्न किंवा मदत विनंती सबमिट करा' : 'Submit a Doubt or Support Request'}
                </h3>

                <form onSubmit={handleQuerySubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                      {isMr ? 'संबंधित कोर्स (ऐच्छिक)' : 'Related Course (Optional)'}
                    </label>
                    <select
                      value={queryCourseSlug}
                      onChange={(e) => setQueryCourseSlug(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-[#0F172A] bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] cursor-pointer"
                    >
                      <option value="">
                        {isMr ? 'सामान्य मदत / कोणताही विशिष्ट कोर्स नाही' : 'General Support / No Specific Course'}
                      </option>
                      {displayEnrolledCourses.map((c) => (
                        <option key={c.slug} value={c.slug}>{c.title}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                      {isMr ? 'प्रश्नाचा विषय *' : 'Question Subject *'}
                    </label>
                    <input
                      type="text"
                      value={querySubject}
                      onChange={(e) => setQuerySubject(e.target.value)}
                      placeholder={isMr ? 'उदा. प्रकरण ३ मधील लूप्स सिंटॅक्सबाबत शंका' : 'e.g. Doubt in Chapter 3 regarding Loops syntax'}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1">
                      {isMr ? 'तपशीलवार संदेश / प्रश्न *' : 'Detailed Message / Question *'}
                    </label>
                    <textarea
                      rows={4}
                      value={queryMessage}
                      onChange={(e) => setQueryMessage(e.target.value)}
                      placeholder={isMr ? 'आपली शंका तपशीलवार सांगा जेणेकरून मार्गदर्शक तुम्हाला मदत करू शकतील...' : 'Explain your doubt or issue in detail so mentors can help you effectively...'}
                      className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewQueryForm(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-[#475569] text-xs font-bold hover:bg-slate-50 cursor-pointer"
                    >
                      {isMr ? 'रद्द करा' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={submittingQuery}
                      className="px-5 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                      {submittingQuery
                        ? (isMr ? 'सबमिट करत आहे...' : 'Submitting...')
                        : (isMr ? 'प्रश्न सबमिट करा' : 'Submit Query')}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Queries List */}
            {loadingQueries ? (
              <div className="p-10 text-center text-xs text-[#475569] flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                {isMr ? 'आपले प्रश्न लोड होत आहेत...' : 'Loading your queries...'}
              </div>
            ) : queries.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center mx-auto mb-3">
                  <Icon name="help_outline" className="text-3xl text-[#2563EB]" />
                </div>
                <h3 className="text-base font-extrabold text-[#0F172A]">
                  {isMr ? 'अद्याप कोणतेही प्रश्न सबमिट केलेले नाहीत' : 'No queries submitted yet'}
                </h3>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => setShowNewQueryForm(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2563EB] text-white font-bold text-xs hover:bg-[#1D4ED8] transition shadow-sm cursor-pointer"
                  >
                    <Icon name="add" className="text-sm text-white" />
                    {isMr ? 'आपला पहिला प्रश्न विचारा' : 'Ask Your First Question'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {queries.map((q) => {
                  const isClosed = q.status === 'Closed';
                  const isAnswered = q.status === 'Answered' || q.status === 'Resolved' || !!q.adminReply;

                  return (
                    <div
                      key={q.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-blue-50 text-[#2563EB] border border-blue-200">
                              {q.courseName || (isMr ? 'सामान्य मदत' : 'General Support')}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {formatExactDate(q.createdAt, lang)} · {formatExactTime(q.createdAt, lang)}
                            </span>
                          </div>
                          <h4 className="font-extrabold text-sm text-[#0F172A]">
                            {q.subject}
                          </h4>
                        </div>

                        <div>
                          {isClosed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-600 border border-slate-200">
                              <Icon name="lock" className="text-xs text-slate-500" />
                              {isMr ? 'बंद केले' : 'Closed'}
                            </span>
                          ) : isAnswered ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-50 text-[#0D9488] border border-emerald-200">
                              <Icon name="check_circle" className="text-xs text-[#10B981]" />
                              {isMr ? 'उत्तर दिले' : 'Answered'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                              <Icon name="schedule" className="text-xs text-amber-600" />
                              {isMr ? 'प्रलंबित' : 'Pending'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Student question */}
                      <p className="text-xs text-[#475569] leading-relaxed whitespace-pre-wrap bg-[#F8FAFC] p-3 rounded-xl border border-slate-200">
                        &quot;{q.message}&quot;
                      </p>

                      {/* Admin Answer when available */}
                      {q.adminReply && (
                        <div className="mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#0D9488] mb-1">
                            <Icon name="verified" className="text-sm text-[#10B981]" />
                            {isMr ? 'ॲडमिन / मार्गदर्शकांचे उत्तर:' : 'Admin / Mentor Answer:'}
                          </div>
                          <p className="text-xs text-[#0F172A] whitespace-pre-wrap leading-relaxed">
                            {q.adminReply}
                          </p>
                          {q.resolvedAt && (
                            <span className="text-[10px] text-[#0D9488] font-semibold block mt-1.5">
                              {isMr ? 'उत्तर दिल्याचा दिनांक: ' : 'Answered on '}
                              {formatExactDate(q.resolvedAt, lang)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: RECENT ACTIVITY ── */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
                <Icon name="history" className="text-[#2563EB]" />
                {isMr ? 'अलीकडील घडामोडी' : 'Recent Learning Activity'}
              </h2>
            </div>

            {loadingActivities ? (
              <div className="p-10 text-center text-xs text-[#475569] flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                {isMr ? 'आपल्या घडामोडी लोड होत आहेत...' : 'Loading your learning activity...'}
              </div>
            ) : activities.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center mx-auto mb-3">
                  <Icon name="history_toggle_off" className="text-3xl text-[#2563EB]" />
                </div>
                <h3 className="text-base font-extrabold text-[#0F172A]">
                  {isMr ? 'कोणतीही अलीकडील घडामोड नाही' : 'No recent activity yet'}
                </h3>
                <p className="text-xs text-[#475569] mt-1 max-w-md mx-auto">
                  {isMr
                    ? 'तुम्ही धडे शिकल्यावर, चाचण्या पूर्ण केल्यावर किंवा प्रश्न विचारल्यावर तुमचा इतिहास येथे दिसेल.'
                    : 'Your activity history will appear here as you study chapters, finish assessments, or ask questions.'}
                </p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {activities.map((act) => (
                    <div key={act.id} className="relative flex items-start gap-3">
                      <div className="absolute -left-6 top-0 w-5 h-5 rounded-full flex items-center justify-center text-xs bg-blue-50 text-[#2563EB] border border-blue-200">
                        <Icon name={act.icon || 'check'} className="text-[11px]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <p className="text-xs font-bold text-[#0F172A]">{act.title}</p>
                          <span className="text-[10px] text-slate-500">
                            {formatRelativeTime(act.date, lang) || formatExactDate(act.date, lang)}
                          </span>
                        </div>
                        {act.detail && (
                          <p className="text-[11px] text-[#475569] mt-0.5">
                            {act.detail}
                          </p>
                        )}
                        {act.courseSlug && (
                          <Link
                            to={`/courses/${act.courseSlug}`}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2563EB] hover:text-[#1D4ED8] mt-1"
                          >
                            {isMr ? 'कोर्स उघडा →' : 'Open Course →'}
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB 5: MY CERTIFICATES ── */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
                  <Icon name="workspace_premium" className="text-amber-500" />
                  My Official G-Mark Certificates
                </h2>
                <p className="text-xs text-[#475569] mt-0.5">
                  Verified credentials earned upon 100% video completion, assessment pass, and project verification.
                </p>
              </div>
              <Link
                to="/verify-certificate"
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:border-blue-300 text-xs font-bold text-[#2563EB] inline-flex items-center gap-1.5 shadow-2xs transition"
              >
                <Icon name="verified_user" className="text-sm" />
                Verify Any Certificate ID
              </Link>
            </div>

            {loadingCertificates ? (
              <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 shadow-sm">
                <Icon name="sync" className="animate-spin text-2xl text-[#2563EB] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#475569]">Loading your earned certificates...</p>
              </div>
            ) : certificates.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto">
                  <Icon name="workspace_premium" className="text-3xl" />
                </div>
                <h3 className="font-extrabold text-[#0F172A] text-base">No Certificates Earned Yet</h3>
                <p className="text-xs text-[#475569] max-w-md mx-auto">
                  Complete 100% of a course's lessons without skipping, pass all assessments, and submit your project to unlock your official certificate.
                </p>
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition"
                >
                  <Icon name="school" className="text-sm" />
                  Explore Courses
                </Link>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {certificates.map((cert) => (
                  <div
                    key={cert.id || cert.certificateCode}
                    className="bg-white border border-amber-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-extrabold">
                          <Icon name="verified" className="text-xs text-emerald-600" />
                          System Verified ✓
                        </span>
                        <span className="font-mono text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {cert.certificateCode}
                        </span>
                      </div>

                      <h3 className="font-extrabold text-sm sm:text-base text-[#0F172A] leading-snug">
                        {cert.courseTitle}
                      </h3>

                      <p className="text-xs text-[#475569]">
                        Issued on{' '}
                        <strong className="text-[#0F172A]">
                          {cert.completedAt
                            ? new Date(cert.completedAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'Recently'}
                        </strong>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewCertificate(cert)}
                        className="flex-1 px-3 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Icon name="workspace_premium" className="text-sm" />
                        View & Print PDF
                      </button>
                      <button
                        type="button"
                        onClick={() => navigate(`/verify-certificate/${encodeURIComponent(cert.certificateCode)}`)}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                      >
                        <Icon name="verified_user" className="text-sm text-[#2563EB]" />
                        Verify
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}


        {/* Featured Courses to Explore */}
        {(() => {
          const enrolledSlugs = new Set(displayEnrolledCourses.map((item) => (item.slug || '').toLowerCase()));
          const exploreCandidates = allCourses.filter((c) => c && !enrolledSlugs.has((c.slug || '').toLowerCase())).slice(0, 3);
          if (exploreCandidates.length === 0) return null;

          return (
            <div className="space-y-4">
              <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
                <Icon name="explore" className="text-[#2563EB]" />
                {isMr ? 'अधिक मोफत कोर्सेस एक्सप्लोर करा' : 'Explore More Free Courses'}
              </h2>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {exploreCandidates.map((c, idx) => {
                  const titleStr = typeof c.title === 'string'
                    ? c.title
                    : isMr && c.title?.mr ? c.title.mr : c.title?.en || c.courseName || 'Course';
                  const shortStr = typeof c.short === 'string'
                    ? c.short
                    : isMr && c.short?.mr ? c.short.mr : c.short?.en || c.shortDescription || '';

                  return (
                    <div
                      key={c.slug || idx}
                      className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-0.5 transition flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-blue-50 text-[#2563EB] border border-blue-200">
                            {c.category}
                          </span>
                          <span className="text-[10px] font-bold text-[#0D9488]">
                            {isMr
                              ? `मोफत · ${Array.isArray(c.lessons) ? c.lessons.length : 1} धडे`
                              : `Free · ${Array.isArray(c.lessons) ? c.lessons.length : 1} Lessons`}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm text-[#0F172A] leading-snug line-clamp-2">
                          {titleStr}
                        </h4>

                        <p className="text-xs text-[#475569] mt-1.5 line-clamp-2">
                          {shortStr}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
                        <Link
                          to={`/courses/${c.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-extrabold text-[#2563EB] hover:text-[#1D4ED8]"
                        >
                          {isMr ? 'कोर्स सुरू करा' : 'Start Course'} <Icon name="arrow_forward" className="text-sm" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

      </div>

      {/* Certificate Modal Preview */}
      {previewCertificate && (
        <div
          onClick={() => setPreviewCertificate(null)}
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#F8FAFC] rounded-3xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 my-auto"
          >
            <div className="no-print flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#0F172A]">
                Official G-Mark Software Certificate
              </h3>
              <button
                type="button"
                onClick={() => setPreviewCertificate(null)}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-[#0F172A] cursor-pointer"
              >
                <Icon name="close" className="text-base" />
              </button>
            </div>
            <CertificateView
              certificate={previewCertificate}
              compact
              onContactCompany={(cert) => {
                setPreviewCertificate(null);
                setCertContactTarget(cert);
              }}
            />
          </div>
        </div>
      )}

      <ExpertModal
        isOpen={Boolean(certContactTarget)}
        onClose={() => setCertContactTarget(null)}
        initialName={certContactTarget?.learnerName || certContactTarget?.userName || user?.name || ''}
        initialWorkEmail={user?.email || ''}
        initialSolutionArea="G-Mark Certified Academy"
        initialMessage={
          certContactTarget
            ? `Hello G-Mark Software Team,\n\nI have earned a verified certification and would like to connect / apply:\n• Certificate ID: ${certContactTarget.certificateCode}\n• Course: ${certContactTarget.courseTitle}\n• Learner: ${certContactTarget.learnerName || certContactTarget.userName || user?.name || ''}\n• Verification Link: ${typeof window !== 'undefined' ? `${window.location.origin}/verify-certificate/${certContactTarget.certificateCode}` : ''}`
            : ''
        }
      />
    </div>
  );
}
