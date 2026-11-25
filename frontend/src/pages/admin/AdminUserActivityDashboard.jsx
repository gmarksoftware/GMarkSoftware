import { useEffect, useState, useMemo } from 'react';
import Icon from '../../components/Icon.jsx';
import { assetUrl } from '../../lib/api.js';
import { useAuth } from '../../lib/AuthContext.jsx';

function formatDuration(sec) {
  const s = Math.max(0, Number(sec) || 0);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const remSec = s % 60;
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${remSec}s`;
  }
  return `${remSec}s`;
}

function formatDate(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(d) {
  if (!d) return '—';
  const date = new Date(d);
  if (isNaN(date.getTime())) return '—';
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatRelativeTime(d) {
  if (!d) return '';
  const date = new Date(d);
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (isNaN(diffSec)) return '';
  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86400 * 30) return `${Math.floor(diffSec / 86400)}d ago`;
  return formatDate(d);
}

export default function AdminUserActivityDashboard({ user, api, onBack, isSubAdmin: propIsSubAdmin }) {
  const { user: authUser } = useAuth();
  const isSubAdmin = propIsSubAdmin !== undefined ? propIsSubAdmin : (authUser?.role === 'admin');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isSubAdmin && (activeTab === 'reviews_payments' || activeTab === 'logins')) {
      setActiveTab('overview');
    }
  }, [isSubAdmin, activeTab]);

  // Watch History filtering
  const [historySearch, setHistorySearch] = useState('');
  const [historyCourseFilter, setHistoryCourseFilter] = useState('all');
  const [historyStatusFilter, setHistoryStatusFilter] = useState('all');
  const [historySortBy, setHistorySortBy] = useState('recent');

  // Expanded courses in Curriculum / Progress
  const [expandedCourses, setExpandedCourses] = useState({});

  // View Assessment Answers Modal
  const [viewingAssessment, setViewingAssessment] = useState(null);

  const fetchUserDetails = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.getUserDetails(user.id);
      setData(res);
    } catch (err) {
      console.error('Failed to load user details:', err);
      setError(err?.message || 'Failed to retrieve user activity records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, [user?.id]);

  const toggleCourseExpand = (slug) => {
    setExpandedCourses((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  // Filtered and sorted watch history
  const filteredWatchHistory = useMemo(() => {
    if (!data?.watchHistory) return [];
    return (data?.watchHistory || [])
      .filter((w) => {
        const q = (historySearch || '').toLowerCase();
        const matchesQuery =
          !q ||
          w?.videoTitle?.toLowerCase().includes(q) ||
          w?.courseTitle?.toLowerCase().includes(q) ||
          w?.playlistTitle?.toLowerCase().includes(q);

        if (!matchesQuery) return false;
        if (historyCourseFilter !== 'all' && w?.courseSlug !== historyCourseFilter) return false;
        if (historyStatusFilter === 'completed' && !w?.isCompleted) return false;
        if (historyStatusFilter === 'in_progress' && w?.isCompleted) return false;
        return true;
      })
      .sort((a, b) => {
        if (historySortBy === 'highest_time') return (b?.watchTimeSec || 0) - (a?.watchTimeSec || 0);
        if (historySortBy === 'progress') return (b?.progressPercent || 0) - (a?.progressPercent || 0);
        const timeA = a?.lastWatchedAt ? new Date(a.lastWatchedAt).getTime() : 0;
        const timeB = b?.lastWatchedAt ? new Date(b.lastWatchedAt).getTime() : 0;
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      });
  }, [data?.watchHistory, historySearch, historyCourseFilter, historyStatusFilter, historySortBy]);

  const coursesList = data?.courses || [];
  const watchHistoryList = data?.watchHistory || [];
  const scopedAssessments = data?.assessments || [];
  const scopedTasks = data?.tasks || [];
  const assessmentsList = scopedAssessments;
  const tasksList = scopedTasks;
  const ratingsList = data?.ratings || [];
  const paymentsList = data?.payments || [];
  const loginsLogs = data?.logins?.logs || [];
  const watchAnalytics = data?.watchAnalytics || {};
  const watchTimeByDay = watchAnalytics.watchTimeByDay || [];
  const watchTimeByCourse = watchAnalytics.watchTimeByCourse || [];
  const activityTimeline = data?.activityTimeline || [];

  const coursesCount = coursesList.length;
  const historyCount = watchHistoryList.length;
  const testsAndTasksCount = scopedAssessments.length + scopedTasks.length;
  const assessmentsCount = scopedAssessments.length;
  const tasksCount = scopedTasks.length;
  const ratingsCount = ratingsList.length;
  const paymentsCount = paymentsList.length;
  const loginsCount = loginsLogs.length;

  const totalAssignedVideos = useMemo(() => {
    if (coursesList.length > 0) {
      const sum = coursesList.reduce((acc, c) => acc + (Number(c?.totalVideos) || 0), 0);
      if (sum > 0) return sum;
    }
    return Number(watchAnalytics.videosWatchedCount) || 0;
  }, [coursesList, watchAnalytics]);

  const completedAssignedVideos = useMemo(() => {
    if (coursesList.length > 0) {
      const sum = coursesList.reduce((acc, c) => acc + (Number(c?.completedVideos) || 0), 0);
      if (sum > 0) return sum;
    }
    return Number(watchAnalytics.videosCompletedCount) || 0;
  }, [coursesList, watchAnalytics]);

  const completionRatePercent = useMemo(() => {
    if (totalAssignedVideos > 0) {
      return Math.min(100, Math.max(0, Math.round((completedAssignedVideos / totalAssignedVideos) * 100)));
    }
    if (coursesList.length > 0) {
      const avg = coursesList.reduce((acc, c) => acc + (Number(c?.progressPercent) || 0), 0) / coursesList.length;
      return Math.min(100, Math.max(0, Math.round(avg)));
    }
    return 0;
  }, [totalAssignedVideos, completedAssignedVideos, coursesList]);

  const maxDaySec = useMemo(() => {
    if (!watchTimeByDay.length) return 3600;
    const max = Math.max(...watchTimeByDay.map((d) => Number(d?.seconds) || 0), 0);
    return max > 0 ? max : 3600;
  }, [watchTimeByDay]);

  const profile = data?.user || user || {};
  const summary = data?.summary || {};

  const displayName = typeof profile?.fullName === 'string' && profile.fullName.trim()
    ? profile.fullName
    : (typeof profile?.email === 'string' && profile.email.trim() ? profile.email : 'User');

  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  const isAdmin = profile?.role === 'admin';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-[#0F172A] hover:bg-slate-100 font-extrabold text-xs transition cursor-pointer"
          >
            <Icon name="arrow_back" className="text-sm" />
            <span>Back to Registered Users</span>
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-soft-card">
          <Icon name="sync" className="animate-spin text-4xl text-[#0F172A] mb-3" />
          <h3 className="font-extrabold text-base text-[#0F172A]">
            Loading Activity Dashboard for {user?.fullName || user?.email || 'Learner'}...
          </h3>
          <p className="text-xs text-[#475569] mt-1">
            Aggregating enrollments, watch sessions, assessments, tasks, and login history from database.
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    const displayName = user?.fullName || user?.email || 'User';
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-[#0F172A] hover:bg-slate-100 font-extrabold text-xs transition cursor-pointer"
          >
            <Icon name="arrow_back" className="text-sm" />
            <span>Back to Registered Users</span>
          </button>
        </div>

        <div className="bg-white border border-red-200 rounded-3xl p-12 text-center shadow-soft-card text-red-700 space-y-4 max-w-xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-xs">
            <Icon name="error" className="text-3xl text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A]">
              Failed to load activity details for {displayName}
            </h3>
            <p className="text-xs text-red-600 mt-1">
              {error || 'Could not find user activity data or network request failed.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={fetchUserDetails}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition cursor-pointer shadow-sm"
            >
              <Icon name="refresh" className="text-sm" />
              <span>Retry</span>
            </button>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-[#0F172A] bg-white hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
            >
              <span>Close</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* ── TOP BAR: BACK & BREADCRUMB ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white text-[#0F172A] hover:bg-slate-100 hover:border-[#2563EB] font-extrabold text-xs transition shadow-2xs cursor-pointer"
          >
            <Icon name="arrow_back" className="text-sm" />
            <span>Back to Registered Users</span>
          </button>

          <div className="text-xs text-[#475569] flex items-center gap-1.5 flex-wrap">
            <span>Registered Users</span>
            <span>/</span>
            <span className="font-extrabold text-[#0F172A]">{profile.fullName || profile.email}</span>
            <span className="text-[10px] bg-slate-50 px-2 py-0.5 rounded font-mono text-[#0F172A]">
              ID: {profile.id?.slice(0, 8)}...
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchUserDetails}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-[#0F172A] hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
            title="Refresh User Data"
          >
            <Icon name="refresh" className="text-xs" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── COMPACT USER PROFILE HEADER CARD (NO DUPLICATE KPI GRID) ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-soft-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            <div
              className={`w-14 sm:w-16 h-14 sm:h-16 rounded-2xl flex items-center justify-center text-lg sm:text-xl font-black text-[#0F172A] shadow-md shrink-0 ${
                isAdmin
                  ? 'bg-gradient-to-tr from-purple-700 via-indigo-600 to-brand-forest'
                  : 'bg-gradient-to-tr from-[#1E3A8A] via-emerald-700 to-teal-600'
              }`}
            >
              {initials}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] truncate">
                  {profile.fullName || 'Registered User'}
                </h1>
                {isSubAdmin ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black inline-flex items-center gap-1 shadow-2xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Icon name="check_circle" className="text-xs text-emerald-700" />
                    <span>
                      {totalAssignedVideos > 0
                        ? `${completedAssignedVideos} / ${totalAssignedVideos} Videos Completed`
                        : `${completedAssignedVideos} Videos Completed`}
                    </span>
                  </span>
                ) : (
                  <>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-black inline-flex items-center gap-1 shadow-2xs ${
                        isAdmin
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-blue-50 text-[#0F172A] border border-blue-200'
                      }`}
                    >
                      <Icon name={isAdmin ? 'verified_user' : 'school'} className="text-xs" />
                      {isAdmin ? 'Platform Administrator' : 'Community Learner'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Active Account
                    </span>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-xs text-[#475569] font-medium mt-1">
                <span className="flex items-center gap-1 text-[#0F172A] font-semibold">
                  <Icon name="mail" className="text-xs text-[#475569]" />
                  {profile.email}
                </span>

                {profile.phone && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-[#0F172A]">
                      <Icon name="call" className="text-xs text-[#475569]" />
                      {profile.phone}
                    </span>
                  </>
                )}

                <span>·</span>
                <span className="flex items-center gap-1">
                  <Icon name="event" className="text-xs text-[#0F172A]" />
                  Joined <strong>{formatDate(profile.createdAt)}</strong>
                </span>

                <span>·</span>
                <span className="flex items-center gap-1">
                  <Icon name="schedule" className="text-xs text-purple-600" />
                  Last Login: <strong>{profile.lastLoginAt ? formatDateTime(profile.lastLoginAt) : 'Recent'}</strong>
                  {profile.lastLoginIp && !isSubAdmin && (
                    <span className="font-mono text-[10px] text-[#475569]">({profile.lastLoginIp})</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONSOLIDATED 5 CLEAN, NON-SCROLLING TABS ── */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'overview', label: 'Overview & Analytics', icon: 'dashboard' },
          { id: 'courses_history', label: `Courses & Watch History (${coursesCount})`, icon: 'school' },
          { id: 'assessments_tasks', label: `Assessments & Tasks (${testsAndTasksCount})`, icon: 'assignment' },
          ...(!isSubAdmin
            ? [
                { id: 'reviews_payments', label: `Reviews & Payments (${ratingsCount + paymentsCount})`, icon: 'star' },
                { id: 'logins', label: `Login Logs (${loginsCount})`, icon: 'login' },
              ]
            : []),
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-[#475569] hover:bg-slate-100 hover:text-white'
            }`}
          >
            <Icon name={tab.icon} className="text-sm" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── TAB 1: OVERVIEW & ANALYTICS ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Unified KPI Strip (6 Cards, Zero Duplication) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#475569]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Enrolled</span>
                <Icon name="school" className="text-sm text-[#0F172A]" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-[#0F172A] block leading-none">
                  {summary.totalCoursesEnrolled || 0}
                </span>
                <span className="text-[11px] text-[#475569] font-medium mt-1 block">Courses</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-700">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Completed</span>
                <Icon name="task_alt" className="text-sm text-emerald-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-emerald-700 block leading-none">
                  {summary.totalCompletedCourses || 0}
                </span>
                <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Finished 100%</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-[#2563EB]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Watch Time</span>
                <Icon name="schedule" className="text-sm text-[#2563EB]" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-blue-700 block leading-none truncate">
                  {formatDuration(watchAnalytics.totalWatchTimeSec)}
                </span>
                <span className="text-[10px] text-[#2563EB] font-medium mt-1 block truncate" title={`This week: ${formatDuration(watchAnalytics.watchTimeThisWeekSec)} · Avg: ${formatDuration(watchAnalytics.avgWatchTimePerVideoSec)}/vid`}>
                  {formatDuration(watchAnalytics.watchTimeThisWeekSec)} this wk
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-indigo-700">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Watched</span>
                <Icon name="smart_display" className="text-sm text-purple-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-indigo-700 block leading-none">
                  {watchAnalytics.videosWatchedCount || 0}
                </span>
                <span className="text-[11px] text-purple-600 font-medium mt-1 block">
                  {watchAnalytics.videosCompletedCount || 0} completed
                </span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-700">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Tests & Tasks</span>
                <Icon name="assignment_turned_in" className="text-sm text-amber-600" />
              </div>
              <div className="mt-2">
                <span className="text-2xl font-black text-amber-700 block leading-none">
                  {testsAndTasksCount}
                </span>
                <span className="text-[10px] text-amber-700 font-medium mt-1 block truncate">
                  {scopedAssessments.length} quiz · {scopedTasks.length} task{scopedTasks.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {isSubAdmin ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-emerald-700">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Completion Rate</span>
                  <Icon name="check_circle" className="text-sm text-emerald-600" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-black text-emerald-700 block leading-none">
                    {completionRatePercent}%
                  </span>
                  <span className="text-[10px] text-emerald-700 font-medium mt-1 block truncate">
                    {completedAssignedVideos} / {totalAssignedVideos} videos completed
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col justify-between">
                <div className="flex items-center justify-between text-indigo-300">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider">Logins</span>
                  <Icon name="devices" className="text-sm text-indigo-600" />
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-black text-indigo-200 block leading-none">
                    {summary.totalLoginsCount || loginsCount || 1}
                  </span>
                  <span className="text-[10px] text-indigo-600 font-medium mt-1 block truncate">
                    {profile.lastLoginAt ? formatRelativeTime(profile.lastLoginAt) : 'Active'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2-Column Overview Layout */}
          <div className="grid lg:grid-cols-12 gap-6 items-start">
            {/* Left Column (7 cols): Watch Time by Day, Course Distribution & Learning Purpose */}
            <div className="lg:col-span-7 space-y-6">
              {/* Watch Time by Day (Past 7 Days) */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-soft-card space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-[#0F172A] flex items-center gap-2">
                    <Icon name="bar_chart" className="text-[#0F172A]" />
                    <span>Watch Time by Day (Past 7 Days)</span>
                  </h3>
                  <span className="text-xs text-[#475569] font-bold">
                    This Week: {formatDuration(watchAnalytics.watchTimeThisWeekSec)}
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-44 pt-4 border-b border-slate-200">
                  {watchTimeByDay.map((day, i) => {
                    const heightPct = Math.max(8, Math.round(((Number(day?.seconds) || 0) / maxDaySec) * 100));

                    return (
                      <div key={i} className="flex flex-col items-center h-full justify-end group">
                        <div className="text-[10px] font-bold text-[#0F172A] opacity-0 group-hover:opacity-100 transition mb-1 whitespace-nowrap">
                          {formatDuration(day?.seconds)}
                        </div>
                        <div
                          className={`w-full max-w-[42px] rounded-t-xl transition-all duration-300 ${
                            (Number(day?.seconds) || 0) > 0
                              ? 'bg-gradient-to-t from-[#1E3A8A] to-emerald-500'
                              : 'bg-slate-100'
                          }`}
                          style={{ height: `${heightPct}%` }}
                        />
                        <span className="text-[11px] font-bold text-[#475569] mt-2">{day?.label || ''}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[11px] text-[#475569] text-center">
                  Hover over bars to inspect daily study durations. Average: {formatDuration(watchAnalytics.avgWatchTimePerVideoSec)} per video.
                </p>
              </div>

              {/* Course-Wise Watch Time Distribution */}
              {((isSubAdmin && watchTimeByCourse.length > 1) ||
                (!isSubAdmin && watchTimeByCourse.length > 0)) && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-soft-card space-y-4">
                  <h3 className="font-extrabold text-base text-[#0F172A] flex items-center gap-2">
                    <Icon name="pie_chart" className="text-[#0F172A]" />
                    <span>Watch Time by Course</span>
                  </h3>

                  <div className="space-y-3">
                    {watchTimeByCourse.map((c, i) => {
                      const clampedPercent = Math.min(100, Math.max(0, Number(c?.percent) || 0));
                      return (
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="text-[#0F172A] truncate max-w-xs">{c?.courseTitle || 'Course'}</span>
                            <span className="text-[#0F172A] shrink-0">
                              {formatDuration(c?.seconds)} ({clampedPercent}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#2563EB] h-full rounded-full transition-all duration-300"
                              style={{ width: `${clampedPercent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {!isSubAdmin && !watchTimeByCourse.length && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-[#475569] flex items-center justify-center gap-2">
                  <Icon name="pie_chart" className="text-[#475569]" />
                  <span>No course watch time recorded yet.</span>
                </div>
              )}

              {/* Learning Purpose & Interests (if present) */}
              {(profile.learningPurpose || (profile.interests && profile.interests.length > 0)) && (
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-soft-card space-y-3">
                  <h3 className="font-extrabold text-sm text-[#0F172A] flex items-center gap-2">
                    <Icon name="psychology" className="text-[#0F172A]" />
                    <span>Learning Purpose & Interests</span>
                  </h3>

                  {profile.learningPurpose && (
                    <div className="text-xs text-[#0F172A] bg-slate-50 border border-slate-200 p-3 rounded-2xl font-medium">
                      <strong className="text-[#0F172A] block mb-0.5">Primary Learning Goal:</strong>
                      {profile.learningPurpose}
                    </div>
                  )}

                  {profile.interests && profile.interests.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-[#475569] block">Selected Topics:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {profile.interests.map((it, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-xl bg-slate-50 text-[#0F172A] border border-slate-200 text-xs font-bold"
                          >
                            {it}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column (5 cols): Unified Recent Activity Timeline */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-soft-card space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-[#0F172A] flex items-center gap-2">
                  <Icon name="history" className="text-[#0F172A]" />
                  <span>Recent Activity Timeline</span>
                </h3>
                <span className="text-[11px] font-bold text-[#475569]">
                  {activityTimeline.length} events
                </span>
              </div>

              {activityTimeline.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#475569] flex flex-col items-center justify-center gap-1">
                  <Icon name="history" className="text-2xl text-[#475569]" />
                  <span>No recent activity recorded yet.</span>
                </div>
              ) : (
                <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                  {activityTimeline.map((act) => (
                    <div
                      key={act?.id || Math.random()}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs"
                    >
                      <span
                        className={`w-7 h-7 rounded-xl ${act?.bgColor || 'bg-slate-50'} ${
                          act?.color || 'text-[#0F172A]'
                        } flex items-center justify-center shrink-0 shadow-2xs mt-0.5`}
                      >
                        <Icon name={act?.icon || 'circle'} className="text-sm" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-extrabold text-[#0F172A] truncate">{act?.title}</div>
                        <div className="text-[11px] text-[#475569] line-clamp-2 mt-0.5">{act?.detail}</div>
                        <div className="text-[10px] text-[#475569] mt-1 font-semibold">
                          {formatDateTime(act?.date)} ({formatRelativeTime(act?.date)})
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: COURSES & WATCH HISTORY ── */}
      {activeTab === 'courses_history' && (
        <div className="space-y-8">
          {/* SECTION A: ENROLLED COURSES */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-[#0F172A] flex items-center gap-2">
                  <Icon name="school" className="text-[#0F172A]" />
                  <span>Enrolled Courses & Curriculum Progress</span>
                </h3>
                <p className="text-xs text-[#475569]">
                  Course enrollments, chapter-by-chapter completion status, and certificates.
                </p>
              </div>
              <span className="text-xs text-[#475569] font-bold">
                {coursesCount} Enrolled
              </span>
            </div>

            {coursesCount === 0 ? (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-[#475569] flex items-center justify-center gap-2">
                <Icon name="school" className="text-[#475569]" />
                <span>This user has not enrolled in any courses yet.</span>
              </div>
            ) : (
              <div className="space-y-4">
                {coursesList.map((c) => {
                  const isExpanded = !!expandedCourses[c.courseSlug];
                  return (
                    <div
                      key={c.id}
                      className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-soft-card space-y-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h4 className="font-black text-base sm:text-lg text-[#0F172A]">{c.courseTitle}</h4>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                                c.isCompleted
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-slate-50 text-[#0F172A] border border-slate-200'
                              }`}
                            >
                              {c.isCompleted ? '✓ Completed' : `${c.progressPercent}% In Progress`}
                            </span>
                            {c.certificateStatus && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Certificate: {c.certificateStatus}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-xs text-[#475569] font-medium">
                            <span>Enrolled: <strong>{formatDate(c.enrollmentDate)}</strong></span>
                            <span>•</span>
                            <span>Videos: <strong>{c.completedVideos} / {c.totalVideos}</strong> completed</span>
                            <span>•</span>
                            <span>Watch Time: <strong>{formatDuration(c.watchTimeSec)}</strong></span>
                            {c.lastWatchedVideo && (
                              <>
                                <span>•</span>
                                <span>Last Chapter: <strong className="text-[#0F172A]">{c.lastWatchedVideo}</strong></span>
                              </>
                            )}
                            {(c.validityStart || c.validityEnd) && (
                              <>
                                <span>•</span>
                                <span>Validity: <strong>{formatDate(c.validityStart)} - {formatDate(c.validityEnd)}</strong></span>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleCourseExpand(c.courseSlug)}
                          className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[#0F172A] font-extrabold text-xs transition flex items-center gap-1.5 shrink-0 self-start md:self-center cursor-pointer"
                        >
                          <Icon name={isExpanded ? 'expand_less' : 'expand_more'} className="text-base" />
                          <span>{isExpanded ? 'Hide Chapters' : 'View Chapters Breakdown'}</span>
                        </button>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            c.isCompleted ? 'bg-emerald-600' : 'bg-[#2563EB]'
                          }`}
                          style={{ width: `${c.progressPercent}%` }}
                        />
                      </div>

                      {/* Expandable Chapters Breakdown */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-slate-200 space-y-2">
                          <div className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider mb-2">
                            Course Curriculum & Video Status:
                          </div>

                          {c.lessonsDetail && c.lessonsDetail.length > 0 ? (
                            <div className="grid sm:grid-cols-2 gap-2">
                              {c.lessonsDetail.map((l) => (
                                <div
                                  key={l.index}
                                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
                                    l.status === 'completed'
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-100 font-bold'
                                      : l.status === 'in_progress'
                                      ? 'bg-blue-50/60 border-blue-200 text-blue-100 font-bold'
                                      : 'bg-slate-50 border-slate-200 text-[#475569] font-medium'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    <span className="shrink-0">
                                      {l.status === 'completed' ? (
                                        <Icon name="check_circle" className="text-base text-emerald-600" />
                                      ) : l.status === 'in_progress' ? (
                                        <Icon name="play_circle" className="text-base text-[#2563EB]" />
                                      ) : (
                                        <Icon name="radio_button_unchecked" className="text-base text-[#475569]" />
                                      )}
                                    </span>
                                    <span className="truncate">{l.index + 1}. {l.title}</span>
                                  </div>

                                  <span className="text-[10px] font-black uppercase tracking-wider shrink-0">
                                    {l.status === 'completed' ? 'Completed' : l.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-[#475569] italic">No chapter details available.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* SECTION B: DETAILED VIDEO WATCH HISTORY */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold text-lg text-[#0F172A] flex items-center gap-2">
                  <Icon name="smart_display" className="text-[#0F172A]" />
                  <span>Video Watch History</span>
                </h3>
                <p className="text-xs text-[#475569]">
                  Exact log of video playback sessions, watch durations, and completion statuses.
                </p>
              </div>
              <span className="text-xs text-[#475569] font-bold">
                {historyCount} Total Records
              </span>
            </div>

            {/* Filter Bar */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
              <div className="relative flex-1">
                <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569] text-sm" />
                <input
                  type="text"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search by video title or course..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                />
                {historySearch && (
                  <button
                    type="button"
                    onClick={() => setHistorySearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#475569] hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={historyCourseFilter}
                  onChange={(e) => setHistoryCourseFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#0F172A]"
                >
                  <option value="all">All Courses</option>
                  {coursesList.map((c) => (
                    <option key={c.courseSlug} value={c.courseSlug}>{c.courseTitle}</option>
                  ))}
                </select>

                <select
                  value={historyStatusFilter}
                  onChange={(e) => setHistoryStatusFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#0F172A]"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed (100%)</option>
                  <option value="in_progress">In Progress</option>
                </select>

                <select
                  value={historySortBy}
                  onChange={(e) => setHistorySortBy(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-[#0F172A]"
                >
                  <option value="recent">Most Recent</option>
                  <option value="highest_time">Highest Time</option>
                  <option value="progress">Highest Progress %</option>
                </select>
              </div>
            </div>

            {/* Watch History Table */}
            {filteredWatchHistory.length === 0 ? (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-[#475569] flex items-center justify-center gap-2">
                <Icon name="smart_display" className="text-[#475569]" />
                <span>
                  {historySearch || historyCourseFilter !== 'all' || historyStatusFilter !== 'all'
                    ? 'No videos match your active filter criteria.'
                    : 'This user has not watched any videos yet.'}
                </span>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-soft-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-[#0F172A] font-extrabold uppercase text-[11px] tracking-wider">
                      <tr>
                        <th className="py-3.5 px-4">Video Title</th>
                        <th className="py-3.5 px-4">Course / Playlist</th>
                        <th className="py-3.5 px-4">Last Watched</th>
                        <th className="py-3.5 px-4">Watch Duration</th>
                        <th className="py-3.5 px-4">Progress %</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-center">Sessions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {filteredWatchHistory.map((item, idx) => (
                        <tr key={idx} className="hover:bg-[#F8FAFC] transition">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#0F172A] flex items-center gap-2">
                              <Icon name="play_circle" className="text-sm text-[#0F172A] shrink-0" />
                              <span className="line-clamp-1">{item.videoTitle}</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-[#0F172A] font-semibold">{item.courseTitle}</div>
                            <div className="text-[10px] text-[#475569]">{item.playlistTitle}</div>
                          </td>

                          <td className="py-3.5 px-4 text-[#0F172A]">
                            <div>{formatDate(item.lastWatchedAt)}</div>
                            <div className="text-[10px] text-[#475569]">{formatRelativeTime(item.lastWatchedAt)}</div>
                          </td>

                          <td className="py-3.5 px-4 font-bold text-[#0F172A]">
                            {formatDuration(item.watchTimeSec)}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    item.isCompleted ? 'bg-emerald-600' : 'bg-[#2563EB]'
                                  }`}
                                  style={{ width: `${Math.min(100, item.progressPercent)}%` }}
                                />
                              </div>
                              <span className="font-bold text-xs">{item.progressPercent}%</span>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                item.isCompleted
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {item.isCompleted ? '✓ Completed' : 'In Progress'}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center font-bold text-[#0F172A]">
                            {item.timesWatched || 1}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-[#475569] font-bold flex items-center justify-between">
                  <span>Showing {filteredWatchHistory.length} watched video records</span>
                  <span>Tracked via player playback heartbeats</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 3: ASSESSMENTS & TASKS ── */}
      {activeTab === 'assessments_tasks' && (
        <div className="space-y-8">
          {/* SECTION A: QUIZZES & ASSESSMENTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-[#0F172A] flex items-center gap-2">
                  <Icon name="quiz" className="text-[#0F172A]" />
                  <span>Quiz & Assessment Attempts</span>
                </h3>
                <p className="text-xs text-[#475569]">
                  User scores, completion percentages, pass/fail status, and submitted answers.
                </p>
              </div>
              <span className="text-xs text-[#475569] font-bold">
                {assessmentsCount} Attempt{assessmentsCount !== 1 ? 's' : ''}
              </span>
            </div>

            {assessmentsCount === 0 ? (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-[#475569] flex items-center justify-center gap-2">
                <Icon name="quiz" className="text-[#475569]" />
                <span>This user has not submitted any quizzes or assessments yet.</span>
              </div>
            ) : (
              <div className="grid gap-3">
                {assessmentsList.map((att) => (
                  <div
                    key={att.id}
                    className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-[#0F172A]">{att.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded bg-slate-50 text-[#0F172A] font-bold">
                          {att.courseTitle}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                            att.passed
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {att.passed ? '✓ Passed' : 'Needs Review'}
                        </span>
                      </div>

                      <div className="text-xs text-[#475569] mt-1">
                        Attempted on <strong>{formatDateTime(att.attemptDate)}</strong>
                        {att.score !== null && (
                          <span> · Score: <strong className="text-[#0F172A]">{att.score} / {att.totalMarks}</strong> ({att.percentage}%)</span>
                        )}
                      </div>

                      {att.feedback && (
                        <div className="mt-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-700">
                          <strong>Feedback:</strong> {att.feedback}
                        </div>
                      )}
                    </div>

                    {att.answers && (
                      <button
                        type="button"
                        onClick={() => setViewingAssessment(att)}
                        className="px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#0F172A] text-xs font-bold transition cursor-pointer self-start sm:self-center shrink-0"
                      >
                        View Answers
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECTION B: VIDEO TASKS & ASSIGNMENTS */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-[#0F172A] flex items-center gap-2">
                  <Icon name="assignment" className="text-[#0F172A]" />
                  <span>Video Tasks & Assignments</span>
                </h3>
                <p className="text-xs text-[#475569]">
                  Student submissions, uploaded documents, status, and mentor reviews.
                </p>
              </div>
              <span className="text-xs text-[#475569] font-bold">
                {tasksCount} Assigned Task{tasksCount !== 1 ? 's' : ''}
              </span>
            </div>

            {tasksCount === 0 ? (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-[#475569] flex items-center justify-center gap-2">
                <Icon name="assignment" className="text-[#475569]" />
                <span>No video tasks assigned to this user.</span>
              </div>
            ) : (
              <div className="grid gap-3">
                {tasksList.map((t, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-sm text-[#0F172A]">{t.title}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              t.status === 'reviewed'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : t.status === 'needs_revision'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : t.status === 'submitted'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>
                        <div className="text-xs text-[#475569] mt-0.5">
                          Related Video: <strong className="text-[#0F172A]">{t.videoTitle}</strong>
                        </div>
                      </div>

                      <div className="text-xs text-[#475569]">
                        {t.dueDate ? (
                          <span>Due: <strong>{formatDate(t.dueDate)}</strong></span>
                        ) : (
                          <span className="italic">No due date</span>
                        )}
                      </div>
                    </div>

                    {t.workDescription && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="text-[10px] uppercase font-bold text-[#475569] block mb-1">Submitted Work:</span>
                        <p className="text-[#0F172A] whitespace-pre-wrap font-medium">{t.workDescription}</p>
                      </div>
                    )}

                    {t.fileUrl && (
                      <div>
                        <a
                          href={assetUrl(t.fileUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs hover:bg-emerald-500/25 transition"
                        >
                          <Icon name="download" className="text-sm text-emerald-700" />
                          <span>{t.fileName || 'Download Submitted File'}</span>
                        </a>
                      </div>
                    )}

                    {t.adminFeedback && (
                      <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-100">
                        <strong>Mentor Feedback:</strong> {t.adminFeedback}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: REVIEWS & PAYMENTS ── */}
      {!isSubAdmin && activeTab === 'reviews_payments' && (
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Column A: Ratings & Reviews */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-[#0F172A] flex items-center gap-2">
                  <Icon name="star" className="text-amber-500" />
                  <span>Course Ratings & Reviews</span>
                </h3>
                <p className="text-xs text-[#475569]">Student feedback on completed courses.</p>
              </div>
              <span className="text-xs text-[#475569] font-bold">
                {ratingsCount} Submitted
              </span>
            </div>

            {ratingsCount === 0 ? (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-[#475569] flex items-center justify-center gap-2">
                <Icon name="star_outline" className="text-[#475569]" />
                <span>No ratings or reviews submitted yet.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {ratingsList.map((r) => (
                  <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-[#0F172A]">{r.courseTitle}</span>
                      <span className="text-xs text-[#475569] font-semibold">{formatDate(r.date)}</span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-500 text-sm">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Icon
                          key={i}
                          name={i < r.rating ? 'star' : 'star_border'}
                          className="text-base"
                        />
                      ))}
                      <span className="ml-1 text-xs font-bold text-[#0F172A]">({r.rating} / 5)</span>
                    </div>

                    {r.review && (
                      <p className="text-xs text-[#0F172A] bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
                        "{r.review}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Column B: Payment / Subscription History */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-[#0F172A] flex items-center gap-2">
                  <Icon name="receipt_long" className="text-[#0F172A]" />
                  <span>Payment & Subscription History</span>
                </h3>
                <p className="text-xs text-[#475569]">Transaction records and paid course enrollments.</p>
              </div>
              <span className="text-xs text-[#475569] font-bold">
                {paymentsCount} Record{paymentsCount !== 1 ? 's' : ''}
              </span>
            </div>

            {paymentsCount === 0 ? (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-[#475569] flex items-center justify-center gap-2">
                <Icon name="receipt_long" className="text-[#475569]" />
                <span>No payment or subscription transactions recorded.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {paymentsList.map((p) => (
                  <div key={p.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-sm text-[#0F172A] truncate">{p.courseTitle}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          p.status === 'success'
                            ? 'bg-emerald-50 text-emerald-700'
                            : p.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {p.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-semibold text-[#0F172A]">
                      <span className="text-sm font-black text-[#0F172A]">
                        {p.currency || 'INR'} {p.amount}
                      </span>
                      <span className="text-[#475569]">{formatDateTime(p.date)}</span>
                    </div>

                    <div className="text-[11px] text-[#475569] flex items-center gap-2 pt-1 border-t border-slate-200">
                      <span>Method: <strong className="text-[#0F172A]">{p.paymentMethod || 'Online'}</strong></span>
                      {p.transactionId && (
                        <>
                          <span>•</span>
                          <span>Txn: <code className="font-mono text-[#475569]">{p.transactionId}</code></span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 5: LOGIN LOGS ── */}
      {!isSubAdmin && activeTab === 'logins' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-lg text-[#0F172A] flex items-center gap-2">
                <Icon name="login" className="text-[#0F172A]" />
                <span>Authentication & Login Sessions</span>
              </h3>
              <p className="text-xs text-[#475569]">
                Real-time tracking of user authentication events, devices, and IP addresses.
              </p>
            </div>
            <span className="text-xs text-[#475569] font-bold">
              {loginsCount} Recorded Session{loginsCount !== 1 ? 's' : ''}
            </span>
          </div>

          {loginsCount === 0 ? (
            <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center text-xs text-[#475569] flex items-center justify-center gap-2">
              <Icon name="login" className="text-[#475569]" />
              <span>No login records found for this account.</span>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-soft-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[#0F172A] font-extrabold uppercase text-[11px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Login Date & Time</th>
                      <th className="py-3.5 px-4">Device Category</th>
                      <th className="py-3.5 px-4">IP Address</th>
                      <th className="py-3.5 px-4">Client User Agent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-medium">
                    {loginsLogs.map((l) => (
                      <tr key={l.id} className="hover:bg-[#F8FAFC] transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#0F172A]">{formatDateTime(l.date)}</div>
                          <div className="text-[10px] text-[#475569]">{formatRelativeTime(l.date)}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 text-[#0F172A] font-bold text-xs border border-slate-200">
                            <Icon
                              name={l.device === 'Mobile' ? 'smartphone' : l.device === 'Tablet' ? 'tablet' : 'computer'}
                              className="text-xs"
                            />
                            <span>{l.device}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#0F172A]">
                          {l.ipAddress}
                        </td>

                        <td className="py-3.5 px-4 max-w-sm truncate text-[11px] text-[#475569] font-mono" title={l.userAgent}>
                          {l.userAgent}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── MODAL: VIEW ASSESSMENT ANSWERS ── */}
      {viewingAssessment && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h4 className="font-extrabold text-base text-[#0F172A] flex items-center gap-2">
                <Icon name="quiz" className="text-[#0F172A] text-lg" />
                <span>Assessment Answers: {viewingAssessment.name}</span>
              </h4>
              <button
                type="button"
                onClick={() => setViewingAssessment(null)}
                className="p-1 rounded-lg text-[#475569] hover:text-[#0F172A]"
              >
                <Icon name="close" className="text-base" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div>Course: <strong>{viewingAssessment.courseTitle}</strong></div>
              <div>Attempt Date: <strong>{formatDateTime(viewingAssessment.attemptDate)}</strong></div>
              {viewingAssessment.score !== null && (
                <div>
                  Score: <strong>{viewingAssessment.score} / {viewingAssessment.totalMarks} ({viewingAssessment.percentage}%)</strong>
                </div>
              )}
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              <span className="text-[10px] font-extrabold uppercase text-[#475569] block">Recorded Answers:</span>
              <pre className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-[#0F172A] font-mono whitespace-pre-wrap">
                {typeof viewingAssessment.answers === 'object'
                  ? JSON.stringify(viewingAssessment.answers, null, 2)
                  : String(viewingAssessment.answers)}
              </pre>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setViewingAssessment(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0F172A] hover:bg-slate-100 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
