import { useEffect, useMemo, useRef, useState, useCallback, Component } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { adminApi, assetUrl, resolveApiPath } from '../../lib/api.js';
import { getToken, useAuth } from '../../lib/AuthContext.jsx';
import { CATEGORIES, COURSES, DEFAULT_COURSES, DUMMY_COURSE_SLUGS, extractYoutubeId, getCourses, syncCoursesFromServer, totalMinutes, getYoutubeThumbnailUrl, getLessonThumbnailUrl, getPlaylists, syncPlaylistsFromServer } from '../../lib/courses.js';
import { isValidYoutubeUrl, getYoutubeEmbedUrl } from '../../lib/youtube.js';
import { useLanguage } from '../../i18n/LanguageContext.jsx';
import CourseAssessmentModal from '../../components/CourseAssessmentModal.jsx';
import ManageCourseNotesModal from '../../components/ManageCourseNotesModal.jsx';
import LmsReportsPanel from './LmsReportsPanel.jsx';
import SinglePageEditCourse from './SinglePageEditCourse.jsx';
import AdminReviewsPanel from './AdminReviewsPanel.jsx';
import AdminQueriesPanel from './AdminQueriesPanel.jsx';
import AdminPlaylistsPanel from './AdminPlaylistsPanel.jsx';
import PlaylistBuilderModal from './PlaylistBuilderModal.jsx';
import AdminTasksPanel from './AdminTasksPanel.jsx';
import AdminUserActivityDashboard from './AdminUserActivityDashboard.jsx';
import AdminManagementPanel from './AdminManagementPanel.jsx';
import InlineVideoTasksSection from '../../components/admin/InlineVideoTasksSection.jsx';
import gmarkLogo from '@/assets/G Mark-black.png';

function formatDate(v) {
  if (!v) return '—';
  return new Date(v).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

function formatExactDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatExactTime(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function formatDateTime(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

function formatRelativeTime(v) {
  if (!v) return '';
  const d = new Date(v);
  const now = new Date();
  const diffSec = Math.floor((now - d) / 1000);
  if (isNaN(diffSec)) return '';
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  return `${Math.floor(diffMonths / 12)}y ago`;
}

function formatWatchDuration(sec) {
  const s = Math.max(0, Number(sec) || 0);
  const hrs = Math.floor(s / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const remSec = s % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m ${remSec}s`;
  return `${remSec}s`;
}

function titleCase(s) {
  return s.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
}

class PanelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('PanelErrorBoundary caught error:', error, errorInfo);
  }
  componentDidUpdate(prevProps) {
    if (prevProps.panelName !== this.props.panelName && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 rounded-3xl bg-white border border-red-200 shadow-sm max-w-xl mx-auto my-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-xs">
            <Icon name="error_outline" className="text-3xl text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-[#0F172A]">
              Something went wrong in {this.props.panelName || 'this section'}
            </h3>
            <p className="text-xs text-red-600 mt-1.5 font-medium">
              {this.state.error?.message || 'An unexpected runtime error occurred.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition cursor-pointer shadow-xs"
            >
              Try Again
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl border border-slate-200 text-[#0F172A] bg-white hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

class AdminErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('AdminErrorBoundary caught unhandled error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 text-[#0F172A]">
          <div className="p-8 sm:p-10 rounded-3xl bg-white border border-red-200 shadow-xl max-w-xl w-full text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto shadow-xs">
              <Icon name="error_outline" className="text-4xl text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#0F172A]">
                Admin Panel Error
              </h2>
              <p className="text-xs sm:text-sm text-red-600 mt-2 font-medium bg-red-50 p-3 rounded-xl border border-red-200 break-words text-left font-mono">
                {this.state.error?.message || 'An unexpected error occurred while loading the Admin Panel.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-3">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-5 py-2.5 rounded-xl bg-[#2563EB] text-white text-xs sm:text-sm font-bold hover:bg-[#1D4ED8] transition cursor-pointer shadow-xs"
              >
                Try Again
              </button>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-[#0F172A] bg-white hover:bg-slate-100 text-xs sm:text-sm font-bold transition cursor-pointer"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AdminContent({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const token = getToken();
  const api = useMemo(() => adminApi(token), [token]);
  const langCtx = useLanguage();
  const t = langCtx?.t || ((k, fallback) => fallback || k);
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'super_admin';
  const isSubAdmin = user?.role === 'admin';

  const [stats, setStats] = useState({});

  // Role-scoped admin navigation items
  const navItems = useMemo(() => {
    if (isSubAdmin) {
      return [
        ['dashboard', 'Overview', 'dashboard'],
        ['courses', 'Allocated Courses & Playlists', 'school'],
        ['playlists', 'Video Playlists', 'playlist_play'],
        ['tasks', 'Tasks & Submissions', 'assignment'],
        ['assessments', 'Assessments / Quizzes', 'quiz'],
        ['users', 'Learner Activity', 'group'],
        ['queries', 'Contact / Inquiries', 'help_outline'],
      ];
    }
    // Super Admin gets all G-Mark Software Academy & Enterprise Operations sections
    return [
      ['dashboard', 'Overview', 'dashboard'],
      ['courses', 'Courses & Embedded Playlists', 'school'],
      ['playlists', 'Video Playlists', 'playlist_play'],
      ['tasks', 'Tasks & Submissions', 'assignment'],
      ['assessments', 'Assessments / Quizzes', 'quiz'],
      ['reviews', 'Reviews & Ratings', 'star_rate'],
      ['users', 'Learner Activity', 'group'],
      ['lms-reports', 'LMS Reports', 'analytics'],
      ['manage-admins', 'Sub-Admin Management', 'admin_panel_settings'],
      ['queries', 'Contact / Inquiries', 'help_outline'],
    ];
  }, [isSubAdmin]);

  // Read section from URL, e.g. /admin/users -> 'users'
  const getSectionFromPath = (pathname) => {
    const raw = (pathname || '').replace(/^\/admin\/?/, '').split('/')[0]?.toLowerCase();
    if (!raw) return 'dashboard';
    if (raw === 'sub-admins' || raw === 'manage-admins') return isSubAdmin ? 'dashboard' : 'manage-admins';
    if (navItems?.some(([id]) => id === raw)) return raw;
    return 'dashboard';
  };

  const [section, setSectionState] = useState(() => getSectionFromPath(location.pathname));

  useEffect(() => {
    const s = getSectionFromPath(location.pathname);
    if (s !== section) {
      setSectionState(s);
    }
  }, [location.pathname]);

  const setSection = (nextSection) => {
    setSectionState(nextSection);
    const target = nextSection === 'dashboard' ? '/admin' : `/admin/${nextSection}`;
    if (location.pathname !== target) {
      navigate(target);
    }
  };

  const [userCourseFilter, setUserCourseFilter] = useState('all');
  const handleNavigateToLearners = (courseSlug = 'all') => {
    setUserCourseFilter(courseSlug);
    setSection('users');
  };

  useEffect(() => {
    let cancelled = false;
    const fetchDashboardStats = async () => {
      try {
        const res = await api.get('/dashboard');
        if (!cancelled && res) {
          setStats(res || {});
        }
      } catch (e) {
        console.warn('Could not load dashboard stats on mount:', e);
      }
    };
    fetchDashboardStats();
    return () => { cancelled = true; };
  }, [api]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const load = async (name = section) => {
    setLoading(true); setNotice('');
    try {
      if (name === 'dashboard') setStats(await api.get('/dashboard'));
    } catch (e) {
      if (e.status === 401 || e.status === 403) onLogout();
      else setNotice(e.message || 'Could not load data');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (section === 'dashboard') load('dashboard');
  }, [section]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <header className="h-16 bg-white/95 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-5 lg:px-7 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img src={gmarkLogo} alt="G-Mark Software" className="h-10 w-auto object-contain" />
          <div className="text-[10px] font-extrabold text-[#475569] tracking-widest uppercase">
            {t('admin.panelTitle', 'Admin Panel')}
          </div>
          {isSuperAdmin && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 shadow-2xs">
              <Icon name="verified_user" className="text-xs text-amber-700" /> Super Admin
            </span>
          )}
          {isSubAdmin && (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shadow-2xs">
              <Icon name="assignment_ind" className="text-xs text-emerald-700" /> Sub-Admin · Assigned Videos
            </span>
          )}
        </div>
        <div className="flex items-center gap-2.5">
          {!isSubAdmin && (
            <Link to="/" className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[#0F172A] text-sm font-bold transition">
              <Icon name="open_in_new" /> {t('admin.website', 'Website')}
            </Link>
          )}
          <button onClick={onLogout} className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-slate-700 text-sm font-bold flex items-center gap-2 cursor-pointer transition shadow-2xs">
            <Icon name="logout" /> {t('admin.logout', 'Logout')}
          </button>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden lg:block w-64 bg-white border-r border-slate-200 p-4">
          <div className="text-[11px] uppercase tracking-wider font-extrabold text-slate-400 px-3 mb-2">
            {t('admin.management', 'Management')}
          </div>
          <nav className="space-y-1">
            {navItems.map(([id, labelKey, icon]) => (
              <button key={id} onClick={() => setSection(id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center justify-between text-sm font-bold transition cursor-pointer ${section === id ? 'bg-blue-50 text-blue-700 border border-blue-200/70 shadow-2xs' : 'text-slate-600 hover:bg-slate-100 hover:text-[#0F172A] border border-transparent'}`}>
                <div className="flex items-center gap-3">
                  <Icon name={icon} className={`text-[20px] ${section === id ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{t(labelKey, labelKey)}</span>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-5 lg:p-8 max-w-[1500px]">
          <div className="lg:hidden overflow-x-auto flex gap-2 pb-4">
            {navItems.map(([id, labelKey, icon]) => (
              <button key={id} onClick={() => setSection(id)} className={`shrink-0 px-3 py-2 rounded-full text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${section === id ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-white border border-slate-200 text-slate-600 hover:text-[#0F172A]'}`}>
                <Icon name={icon} className="text-xs" />
                <span>{t(labelKey, labelKey)}</span>
              </button>
            ))}
          </div>

          {notice && <div className="mb-5 rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 text-sm font-bold">{notice}</div>}
          {loading && <div className="mb-5 text-sm font-semibold text-[#475569]">{t('admin.common.loading', 'Loading…')}</div>}

          <PanelErrorBoundary panelName={section}>
            {section === 'dashboard' && <Dashboard stats={stats} api={api} setSection={setSection} isSubAdmin={isSubAdmin} />}
            {section === 'manage-admins' && !isSubAdmin && <AdminManagementPanel api={api} />}
            {section === 'users' && (
              <UsersPanel
                api={api}
                isSubAdmin={isSubAdmin}
                initialCourseFilter={userCourseFilter}
                onClearCourseFilter={() => setUserCourseFilter('all')}
              />
            )}
            {section === 'lms-reports' && !isSubAdmin && <LmsReportsPanel api={api} />}
            {section === 'courses' && (
              <CoursesPanel
                api={api}
                isSubAdmin={isSubAdmin}
                isSuperAdmin={isSuperAdmin}
                setSection={setSection}
                onNavigateToLearners={handleNavigateToLearners}
                initialSectionFilter="all"
              />
            )}
            {section === 'playlists' && (
              <CoursesPanel
                api={api}
                isSubAdmin={isSubAdmin}
                isSuperAdmin={isSuperAdmin}
                setSection={setSection}
                onNavigateToLearners={handleNavigateToLearners}
                initialSectionFilter="playlist"
              />
            )}
            {section === 'tasks' && <AdminTasksPanel />}
            {section === 'assessments' && <AssessmentsPanel api={api} isSubAdmin={isSubAdmin} />}
            {section === 'reviews' && !isSubAdmin && <AdminReviewsPanel api={api} />}
            {section === 'queries' && <AdminQueriesPanel api={api} />}
          </PanelErrorBoundary>
        </main>
      </div>
    </div>
  );
}

export default function Admin(props) {
  return (
    <AdminErrorBoundary>
      <AdminContent {...props} />
    </AdminErrorBoundary>
  );
}

function Dashboard({ stats = {}, api, setSection, isSubAdmin }) {
  const langCtx = useLanguage();
  const t = langCtx?.t || ((k, fallback) => fallback || k);

  const [extraCounts, setExtraCounts] = useState({
    courses: null,
    tasks: null,
    reviews: null,
    queries: null,
  });

  useEffect(() => {
    let isMounted = true;
    if (isSubAdmin) return;
    const fetchExtraData = async () => {
      try {
        const [coursesRes, playlistsRes, tasksRes, reviewsRes, queriesRes] = await Promise.allSettled([
          api?.getCourses ? api.getCourses() : fetch(resolveApiPath('/courses')).then((r) => r.json()),
          fetch(resolveApiPath('/playlists')).then((r) => r.json()),
          api?.getAllAdminTaskSubmissions ? api.getAllAdminTaskSubmissions() : Promise.resolve([]),
          api?.getReviews ? api.getReviews() : Promise.resolve([]),
          api?.getQueries ? api.getQueries('all') : Promise.resolve([]),
        ]);

        if (!isMounted) return;

        // Calculate combined courses & playlists total
        let totalCourses = 0;
        if (coursesRes.status === 'fulfilled' && Array.isArray(coursesRes.value)) {
          totalCourses += coursesRes.value.length;
        }
        if (playlistsRes.status === 'fulfilled' && Array.isArray(playlistsRes.value)) {
          totalCourses += playlistsRes.value.length;
        }

        // Calculate total tasks / submitted assignments
        let totalTasks = 0;
        if (tasksRes.status === 'fulfilled' && Array.isArray(tasksRes.value)) {
          totalTasks = tasksRes.value.length;
        }

        // Calculate total reviews
        let totalReviews = 0;
        if (reviewsRes.status === 'fulfilled') {
          if (Array.isArray(reviewsRes.value)) {
            totalReviews = reviewsRes.value.length;
          } else if (Array.isArray(reviewsRes.value?.reviews)) {
            totalReviews = reviewsRes.value.reviews.length;
          } else if (typeof reviewsRes.value?.total === 'number') {
            totalReviews = reviewsRes.value.total;
          }
        }

        // Calculate total queries
        let totalQueries = 0;
        if (queriesRes.status === 'fulfilled' && Array.isArray(queriesRes.value)) {
          totalQueries = queriesRes.value.length;
        }

        setExtraCounts({
          courses: totalCourses,
          tasks: totalTasks,
          reviews: totalReviews,
          queries: totalQueries,
        });
      } catch (err) {
        console.warn('Could not fetch extra dashboard metrics:', err);
      }
    };

    fetchExtraData();
    return () => {
      isMounted = false;
    };
  }, [api, isSubAdmin]);

  if (isSubAdmin) {
    const subAdminCards = [
      ['Allocated Courses & Playlists', stats?.allocatedTotalCount ?? stats?.assignedVideosCount ?? 0, 'school', 'courses'],
      ['Registered Users', stats?.learnersCount ?? stats?.users ?? 0, 'group', 'users'],
      ['Pending Task Submissions', stats?.pendingTasksCount ?? 0, 'assignment', 'tasks'],
    ];

    return (
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-[#0F172A]">Sub-Admin Dashboard</h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
              Instructor / Content Reviewer
            </span>
          </div>
          <p className="text-[#475569] mt-1">Overview of your assigned courses, video materials, and student submissions.</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          {subAdminCards.map(([name, value, icon, target]) => (
            <button key={name} onClick={() => setSection(target)} className="bg-white rounded-2xl border border-slate-200 p-5 text-left hover:shadow-md transition cursor-pointer">
              <div className="flex justify-between">
                <span className="w-10 h-10 rounded-xl bg-slate-50 text-[#0F172A] flex items-center justify-center">
                  <Icon name={icon} />
                </span>
                <Icon name="arrow_forward" className="text-[#475569]" />
              </div>
              <div className="text-3xl font-extrabold text-[#0F172A] mt-5">{value ?? 0}</div>
              <div className="text-sm font-semibold text-[#475569]">{name}</div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <h2 className="font-extrabold text-[#0F172A] text-lg flex items-center gap-2">
            <Icon name="info" className="text-emerald-700" /> Assigned Scope Responsibilities
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-[#475569]">
            <li className="flex gap-2">
              <Icon name="check_circle" className="text-[#0F172A] shrink-0 mt-0.5" />
              Manage and review only the courses and video lessons explicitly assigned to you by Super Admins.
            </li>
            <li className="flex gap-2">
              <Icon name="check_circle" className="text-[#0F172A] shrink-0 mt-0.5" />
              Inspect learner progress and engagement metrics for students who watch your assigned videos.
            </li>
            <li className="flex gap-2">
              <Icon name="check_circle" className="text-[#0F172A] shrink-0 mt-0.5" />
              Grade, comment, and provide feedback on student homework and task submissions for your videos.
            </li>
            <li className="flex gap-2">
              <Icon name="check_circle" className="text-[#0F172A] shrink-0 mt-0.5" />
              Answer queries and support inquiries submitted on your assigned courses.
            </li>
          </ul>
        </div>
      </div>
    );
  }

  const cards = [
    ['Registered Learners', stats?.users, 'group', 'users', 'bg-blue-50 text-blue-600 border-blue-100'],
    ['Courses & Playlists', extraCounts.courses, 'school', 'courses', 'bg-teal-50 text-teal-600 border-teal-100'],
    ['Tasks & Submissions', extraCounts.tasks, 'assignment', 'tasks', 'bg-violet-50 text-violet-600 border-violet-100'],
    ['Reviews & Ratings', extraCounts.reviews, 'star_rate', 'reviews', 'bg-amber-50 text-amber-600 border-amber-100'],
    ['Contact / Inquiries', extraCounts.queries, 'help_outline', 'queries', 'bg-emerald-50 text-emerald-600 border-emerald-100'],
    ['Assessments / Quizzes', 'Manage Quizzes', 'quiz', 'assessments', 'bg-indigo-50 text-indigo-600 border-indigo-100'],
    ['LMS Reports', 'View Analytics', 'analytics', 'lms-reports', 'bg-sky-50 text-sky-600 border-sky-100'],
    ['Sub-Admin Management', 'Manage Team', 'admin_panel_settings', 'manage-admins', 'bg-slate-100 text-slate-700 border-slate-200'],
  ];

  const capsList = [
    'View all registered learners, completion progress, and watch timestamps',
    'Manage courses, non-skippable video lessons, playlists, and certificates',
    'Create and update course assessments and quizzes',
    'Review auto-verified project submissions, ratings, and enterprise inquiries',
  ];

  return (
    <div>
      <h1 className="text-3xl font-extrabold text-[#0F172A] mb-6">Admin Overview</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cards.map(([name, value, icon, target, iconCls]) => {
          const isActionCard = target === 'assessments' || target === 'lms-reports' || target === 'manage-admins';
          return (
            <button key={name} onClick={() => setSection(target)} className="bg-white rounded-2xl border border-slate-200 p-5 text-left hover:shadow-md hover:border-blue-300 transition cursor-pointer flex flex-col justify-between shadow-sm">
              <div className="flex justify-between items-center"><span className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${iconCls}`}><Icon name={icon} /></span><Icon name="arrow_forward" className="text-slate-400" /></div>
              <div className="mt-5">
                <div className={`${isActionCard ? 'text-lg sm:text-xl font-bold leading-tight mb-1' : 'text-3xl font-extrabold'} text-[#0F172A]`}>
                  {value ?? '—'}
                </div>
                <div className="text-sm font-semibold text-[#475569]">{name}</div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-6 grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-extrabold text-[#0F172A] text-lg">{t('admin.dashboard.capabilitiesTitle', 'Admin capabilities')}</h2>
          <ul className="mt-4 space-y-2.5 text-sm text-[#475569]">
            {capsList.map(x => <li key={x} className="flex gap-2 items-start"><Icon name="check_circle" className="text-[#0D9488] shrink-0 mt-0.5" /><span>{x}</span></li>)}
          </ul>
        </div>
        <div className="bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-extrabold text-lg flex items-center gap-2 text-white">
              <Icon name="verified_user" className="text-blue-100" /> {t('admin.dashboard.communityTitle', 'Registered Community')}
            </h2>
            <button
              onClick={() => setSection('users')}
              className="text-xs font-bold px-3.5 py-1.5 bg-white text-[#2563EB] hover:bg-blue-50 rounded-lg transition cursor-pointer shadow-xs"
            >
              {t('admin.dashboard.viewAllUsers', 'View All Users →')}
            </button>
          </div>
          <p className="text-sm text-blue-50 mt-2 leading-relaxed">
            {t('admin.dashboard.communityText1', 'G-Mark Software currently has')} <strong className="text-white font-black">{stats?.users ?? 0} {t('admin.dashboard.cards.users', 'registered users')}</strong>. {t('admin.dashboard.communityText2', 'You can view their profiles, exact registration timestamps, and learning progress in the Registered Users section.')}
          </p>
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// COURSES PANEL with Analytics
// ─────────────────────────────────────────────────────────────────────────────
// safely extract text from a string or {en, mr} object
function safeStr(o) {
  if (!o) return '';
  if (typeof o === 'string') return o;
  return o.en || o.mr || '';
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

export const STANDARD_SUGGESTED_COURSES = [
  'Start Your Own Business: The Complete Beginner Guide',
  'Business Planning & Financial Management for Small Business',
  'Digital Marketing for Small Business: WhatsApp, Facebook, Instagram & Google',
  'Customer Management & Selling Skills',
  'Computer & Excel Basics for Work and Business',
  'Spoken English for Confidence & Career',
  'Youth Leadership & Positive Mindset',
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

function EditPlaylistModal({ isOpen, onClose, playlist, course, api, onSuccess }) {
  return (
    <PlaylistBuilderModal
      isOpen={isOpen}
      onClose={onClose}
      playlist={playlist}
      api={api}
      onSuccess={onSuccess}
    />
  );
}

function CourseViewsAndLearnersModal({ course, api, isSubAdmin, onClose, onSelectUser, onOpenInUsersTab }) {
  const [modalSearch, setModalSearch] = useState('');
  const [activeTab, setActiveTab] = useState('subviews'); // 'subviews' | 'learners'
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const courseTitle = course?.title || course?.courseName || course?.playlistTitle || 'Course';
  const courseSlug = course?.slug || course?.courseSlug || course?.id || '';

  const fetchBreakdown = useCallback(async (silent = false) => {
    if (!courseSlug) return;
    if (!silent) setLoading(true);
    setError(null);
    try {
      const client = api || adminApi(getToken());
      const data = client?.getCourseViewsBreakdown
        ? await client.getCourseViewsBreakdown(courseSlug)
        : await client?.get?.(`/courses/${encodeURIComponent(courseSlug)}/views-breakdown`);
      if (data) {
        setBreakdown(data);
      }
    } catch (err) {
      console.warn('Failed to load views breakdown:', err);
      if (!silent) setError(err?.message || 'Could not load views breakdown');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [courseSlug, api]);

  useEffect(() => {
    fetchBreakdown(false);
  }, [fetchBreakdown]);

  // Real-time automatic polling every 10 seconds while modal is open
  useEffect(() => {
    const timer = setInterval(() => {
      fetchBreakdown(true);
    }, 10000);
    return () => clearInterval(timer);
  }, [fetchBreakdown]);

  const subViewsList = useMemo(() => {
    return Array.isArray(breakdown?.subViews) ? breakdown.subViews : [];
  }, [breakdown]);

  const maxSubViewViews = useMemo(() => {
    if (subViewsList.length === 0) return 1;
    return Math.max(1, ...subViewsList.map((sv) => sv.viewsCount || 0));
  }, [subViewsList]);

  const learnersList = useMemo(() => {
    return Array.isArray(breakdown?.learners) ? breakdown.learners : [];
  }, [breakdown]);

  const filteredLearners = useMemo(() => {
    if (!modalSearch.trim()) return learnersList;
    const q = modalSearch.trim().toLowerCase();
    return learnersList.filter((u) =>
      (u.fullName || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  }, [learnersList, modalSearch]);

  const totalViews = breakdown?.totalViews ?? 0;
  const uniqueLearners = breakdown?.uniqueLearners ?? learnersList.length;
  const totalWatchSec = breakdown?.totalWatchSeconds ?? 0;

  const handleExportCSV = () => {
    if (activeTab === 'subviews') {
      if (subViewsList.length === 0) return;
      const headers = ['Chapter / Video', 'Lesson Index', 'Total Views', 'Unique Viewers', 'Completions (>=80%)', 'Avg Watch Time (Mins)'];
      const rows = subViewsList.map((sv) => [
        `"${String(sv.chapterTitle || '').replace(/"/g, '""')}"`,
        sv.lessonIndex ?? '—',
        sv.viewsCount || 0,
        sv.uniqueViewers || 0,
        sv.completedCount || 0,
        Math.round((sv.avgWatchSeconds || 0) / 60),
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${courseTitle.replace(/\s+/g, '_')}_SubViews_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      if (learnersList.length === 0) return;
      const headers = ['Course / Playlist', 'Learner Name', 'Email Address', 'Total Views', 'Watch Duration (Mins)', 'Videos Watched', 'Last Watched Date'];
      const rows = learnersList.map((u) => [
        `"${String(courseTitle).replace(/"/g, '""')}"`,
        `"${String(u.fullName || '').replace(/"/g, '""')}"`,
        `"${String(u.email || '').replace(/"/g, '""')}"`,
        u.totalViews || 0,
        Math.round((u.totalWatchSeconds || 0) / 60),
        `"${(u.videosWatched || []).join('; ').replace(/"/g, '""')}"`,
        `"${u.lastWatchedAt ? new Date(u.lastWatchedAt).toLocaleDateString('en-IN') : '—'}"`,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${courseTitle.replace(/\s+/g, '_')}_Learners_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white p-5 sm:p-6 shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center text-white shrink-0 shadow-inner">
              <Icon name="analytics" className="text-2xl" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                  {courseTitle}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-white/20 text-white border border-white/25">
                  {course?.isPlaylist || course?.videos ? 'Playlist' : 'Course'}
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Detailed views, chapter-level sub-views, and registered learner engagement metrics.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => fetchBreakdown(false)}
              disabled={loading}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
              title="Refresh views and learners in real time"
            >
              <Icon name="refresh" className={`text-xs ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            {learnersList.length > 0 && (
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#0F172A] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="Download CSV report"
              >
                <Icon name="download" className="text-xs text-[#2563EB]" />
                <span>Export CSV</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-[#0F172A] transition cursor-pointer ml-1"
              title="Close modal"
            >
              <Icon name="close" className="text-lg" />
            </button>
          </div>
        </div>

        {/* 2 Header Stats Cards Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Icon name="visibility" className="text-2xl" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] block">Total Views</span>
              <span className="text-2xl font-black text-[#0F172A]">{loading ? '...' : totalViews}</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-3.5 shadow-2xs">
            <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
              <Icon name="schedule" className="text-2xl" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] block">Total Watch Time</span>
              <span className="text-2xl font-black text-sky-700">{loading ? '...' : formatWatchDuration(totalWatchSec)}</span>
            </div>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="px-5 pt-3 pb-2 bg-white border-b border-slate-200 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('subviews')}
              className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${activeTab === 'subviews'
                  ? 'bg-[#2563EB] text-white font-extrabold shadow-2xs'
                  : 'text-[#475569] hover:text-white'
                }`}
            >
              <Icon name="view_list" className="text-xs" />
              <span>Sub-Views Breakdown ({subViewsList.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('learners')}
              className={`px-3.5 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${activeTab === 'learners'
                  ? 'bg-[#2563EB] text-white font-extrabold shadow-2xs'
                  : 'text-[#475569] hover:text-white'
                }`}
            >
              <Icon name="group" className="text-xs" />
              <span>Registered Learners ({learnersList.length})</span>
            </button>
          </div>

          {activeTab === 'learners' && (
            <div className="relative min-w-[220px]">
              <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569] text-xs" />
              <input
                type="search"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder="Search registered learners..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-[#f9faf7]">
          {loading ? (
            <div className="py-16 text-center">
              <Icon name="sync" className="animate-spin text-3xl text-[#0F172A] mb-2" />
              <p className="text-xs font-bold text-[#0F172A]">Loading sub-views and analytics...</p>
            </div>
          ) : error ? (
            <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center text-red-700 space-y-2">
              <Icon name="error" className="text-3xl text-red-600" />
              <h4 className="font-extrabold text-sm">{error}</h4>
            </div>
          ) : activeTab === 'subviews' ? (
            <div className="space-y-3">
              {subViewsList.length === 0 ? (
                <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-[#475569] text-xs font-semibold">
                  No individual chapters or videos found for this item.
                </div>
              ) : (
                subViewsList.map((sv, idx) => {
                  const percent = Math.min(100, Math.round(((sv.viewsCount || 0) / maxSubViewViews) * 100));
                  return (
                    <div key={sv.videoId || idx} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-sm transition">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-7 h-7 rounded-lg bg-slate-50 text-[#0F172A] font-black text-xs flex items-center justify-center shrink-0 border border-slate-200">
                            {idx + 1}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-sm text-[#0F172A] truncate">
                              {sv.chapterTitle || `Lesson ${sv.lessonIndex + 1}`}
                            </h4>
                            <div className="text-[11px] text-[#475569] flex items-center gap-2 mt-0.5">
                              {sv.duration && <span>⏱️ {sv.duration}</span>}
                              {sv.youtubeVideoId && !sv.youtubeVideoId.startsWith('ch-') && !sv.youtubeVideoId.startsWith('v_') && /^[a-zA-Z0-9_-]{11}$/.test(sv.youtubeVideoId) && (
                                <span className="font-mono text-[10px] text-[#475569]">YT: {sv.youtubeVideoId}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Metric Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold flex items-center gap-1">
                            <Icon name="visibility" className="text-xs text-emerald-600" />
                            <span>{sv.viewsCount || 0} Views</span>
                          </span>
                          <span className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 text-xs font-extrabold flex items-center gap-1">
                            <Icon name="check_circle" className="text-xs text-amber-600" />
                            <span>{sv.completedCount || 0} Completed</span>
                          </span>
                          <span className="px-2.5 py-1 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 text-xs font-extrabold flex items-center gap-1">
                            <Icon name="schedule" className="text-xs text-teal-600" />
                            <span>{formatWatchDuration(sv.avgWatchSeconds)} avg</span>
                          </span>
                        </div>
                      </div>

                      {/* Visual Relative Engagement Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mt-1">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-brand-forest h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(6, percent)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLearners.length === 0 ? (
                <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center text-[#475569] text-xs font-semibold">
                  {modalSearch ? 'No matching registered learners found.' : 'No learners have interacted with this course yet.'}
                </div>
              ) : (
                filteredLearners.map((u) => {
                  const initials = (u.fullName || u.email || 'U')
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'U';

                  return (
                    <div key={u.userId} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:shadow-sm transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#1E3A8A] to-emerald-600 flex items-center justify-center font-black text-xs text-white shrink-0 shadow-2xs">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-[#0F172A] truncate">
                            {u.fullName || 'Anonymous User'}
                          </h4>
                          <p className="text-xs text-[#475569] truncate">{u.email}</p>
                          {Array.isArray(u.videosWatched) && u.videosWatched.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {u.videosWatched.slice(0, 2).map((vTitle, idx) => (
                                <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                  <Icon name="play_circle" className="text-[10px]" />
                                  <span className="truncate max-w-[140px]">{vTitle}</span>
                                </span>
                              ))}
                              {u.videosWatched.length > 2 && (
                                <span className="text-[10px] text-[#475569] font-bold self-center">
                                  +{u.videosWatched.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 flex-wrap justify-between sm:justify-end">
                        <div className="text-right text-xs">
                          <div className="font-extrabold text-[#0F172A]">
                            {u.totalViews || 1} Views · {formatWatchDuration(u.totalWatchSeconds)}
                          </div>
                          <div className="text-[10px] text-[#475569] font-medium mt-0.5">
                            Last watched: {u.lastWatchedAt ? formatDateTime(u.lastWatchedAt) : 'Recent'}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectUser) {
                              onSelectUser({ id: u.userId, fullName: u.fullName, email: u.email });
                            }
                          }}
                          className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-brand-forest text-white hover:text-white border border-slate-200 text-xs font-black transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                          title="View full learner activity and watch history"
                        >
                          <span>View Full Activity</span>
                          <Icon name="arrow_forward" className="text-xs" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-200 text-[#0F172A] bg-white hover:bg-slate-100 text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

const CourseLearnersModal = CourseViewsAndLearnersModal;

function CoursesPanel({ api, isSubAdmin, isSuperAdmin, setSection, onNavigateToLearners, initialSectionFilter = 'all' }) {
  const { t, lang } = useLanguage();
  const [courses, setCourses] = useState(() => {
    if (isSubAdmin) return [];
    return getCourses().map(c => ({ ...c, _id: c.id || c._id || c.slug }));
  });
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [selectedCourseForPlaylists, setSelectedCourseForPlaylists] = useState(null);
  const [editingPlaylistCourse, setEditingPlaylistCourse] = useState(null);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [courseSectionFilter, setCourseSectionFilter] = useState(initialSectionFilter || 'all'); // 'all' | 'single' | 'playlist'

  useEffect(() => {
    setCourseSectionFilter(initialSectionFilter || 'all');
  }, [initialSectionFilter]);
  const [playlists, setPlaylists] = useState(() => {
    if (isSubAdmin) return [];
    return getPlaylists('all');
  });

  // Scoped Learners state for Sub-Admin
  const [learners, setLearners] = useState([]);
  const [loadingLearners, setLoadingLearners] = useState(false);
  const [viewingCourseLearners, setViewingCourseLearners] = useState(null);
  const [selectedUserForActivity, setSelectedUserForActivity] = useState(null);

  const loadLearners = async () => {
    try {
      setLoadingLearners(true);
      const data = api?.getUsers ? await api.getUsers() : await api.get('/users');
      if (Array.isArray(data)) setLearners(data);
    } catch (err) {
      console.warn('Could not load learners in courses panel:', err);
    } finally {
      setLoadingLearners(false);
    }
  };

  useEffect(() => {
    loadLearners();
  }, []);

  const getLearnersForCourse = (c) => {
    if (!c) return [];
    const slug = (c.slug || '').trim().toLowerCase();
    const title = (c.title || c.courseName || '').trim().toLowerCase();
    return learners.filter((u) => {
      if (Array.isArray(u.engagedCourseSlugs) && u.engagedCourseSlugs.includes(slug)) return true;
      if (Array.isArray(u.coursesDetail) && u.coursesDetail.some((cd) => (cd.courseSlug || '').trim().toLowerCase() === slug)) return true;
      if (Array.isArray(u.assignedVideosWatched) && u.assignedVideosWatched.some((vt) => {
        const clean = vt.toLowerCase();
        return clean.includes(title) || clean.includes(slug);
      })) return true;
      return false;
    });
  };

  const getLearnersForPlaylist = (pl) => {
    if (!pl) return [];
    const plTitle = (pl.title || '').trim().toLowerCase();
    const cSlug = (pl.courseSlug || '').trim().toLowerCase();
    const plVideos = Array.isArray(pl.videos) ? pl.videos : [];
    const videoTitles = plVideos.map((v) => (v.title || '').trim().toLowerCase()).filter(Boolean);

    return learners.filter((u) => {
      if (cSlug && Array.isArray(u.engagedCourseSlugs) && u.engagedCourseSlugs.includes(cSlug)) return true;
      if (Array.isArray(u.assignedVideosWatched) && u.assignedVideosWatched.some((vt) => {
        const clean = vt.toLowerCase();
        if (clean.includes(plTitle)) return true;
        if (videoTitles.some((vtName) => clean.includes(vtName))) return true;
        return false;
      })) return true;
      return false;
    });
  };

  // Reliable filter: any course fetched that is NOT a playlist is a single video course
  const singleVideoCourses = useMemo(() => {
    return courses.filter((c) => !c?.isPlaylist && c?.type !== 'playlist');
  }, [courses]);

  const hasMultipleContentTypes = singleVideoCourses.length > 0 && playlists.length > 0;

  useEffect(() => {
    if (isSubAdmin && playlists.length === 0 && courseSectionFilter === 'playlist') {
      setCourseSectionFilter('all');
    }
  }, [isSubAdmin, playlists.length, courseSectionFilter]);

  const totalAssignedVideosCount = useMemo(() => {
    return singleVideoCourses.length + playlists.reduce((acc, pl) => acc + (pl.videos?.length || pl.videoCount || 1), 0);
  }, [singleVideoCourses, playlists]);

  const totalUniqueLearnersCount = learners.length;
  const totalAssignedWatchTimeSec = useMemo(() => {
    return learners.reduce((acc, u) => acc + (u.watchDurationSec || 0), 0);
  }, [learners]);

  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const client = api || adminApi(getToken());

      // 1. Fetch playlists using authenticated admin API
      try {
        let pData = null;
        if (client?.getPlaylists) {
          pData = await client.getPlaylists();
        } else {
          const pRes = await fetch(resolveApiPath('/admin/playlists'), {
            headers: { Authorization: `Bearer ${getToken()}` },
          });
          if (pRes.ok) pData = await pRes.json();
        }

        if (Array.isArray(pData)) {
          if (!isSubAdmin) {
            syncPlaylistsFromServer(pData);
          }
          setPlaylists(pData);
        } else if (!isSubAdmin) {
          const local = getPlaylists('all');
          if (Array.isArray(local)) setPlaylists(local);
        } else {
          setPlaylists([]);
        }
      } catch (pErr) {
        console.warn('Could not sync playlists:', pErr?.message);
        if (isSubAdmin) setPlaylists([]);
      }

      // 2. Fetch courses using authenticated admin API
      let serverCourses = null;
      if (client?.getCourses) {
        try {
          serverCourses = await client.getCourses();
        } catch (adminErr) {
          console.warn('Admin getCourses failed:', adminErr?.message);
        }
      }

      if (Array.isArray(serverCourses)) {
        if (!isSubAdmin) {
          syncCoursesFromServer(serverCourses);
        }
        setCourses(serverCourses.map(c => ({ ...c, _id: c.id || c._id || c.slug })));
        return serverCourses;
      }

      // If public fallback needed, ONLY do so for Super Admin
      if (!isSubAdmin) {
        try {
          const res = await fetch(resolveApiPath('/courses'));
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              syncCoursesFromServer(data);
              setCourses(data.map(c => ({ ...c, _id: c.id || c._id || c.slug })));
              return data;
            }
          }
        } catch (pubErr) {
          console.warn('Public getCourses fetch failed:', pubErr?.message);
        }
        const fallback = getCourses().map(c => ({ ...c, _id: c.id || c._id || c.slug }));
        setCourses(fallback);
        return fallback;
      } else {
        setCourses([]);
        return [];
      }
    } catch (err) {
      console.warn('Could not load courses from backend:', err?.message);
      if (isSubAdmin) {
        setCourses([]);
        setPlaylists([]);
      }
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const [form, setForm] = useState({
    title: '',
    category: 'entrepreneurship',
    level: 'Beginner',
    short: '',
    trending: true,
    price: 0,
    validityDays: 365,
    learn: '',
    requirements: '',
  });

  const resolvedCourseSlug = useMemo(() => {
    return (form?.title || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }, [form?.title]);
  const generatedSlug = resolvedCourseSlug;
  const [courseVideos, setCourseVideos] = useState([
    {
      id: 'v_1',
      youtubeUrl: '',
      title: '',
      section: '',
      shortDescription: '',
      isPreview: true,
      customThumbnailFile: null,
      customThumbnailPreview: '',
    }
  ]);

  function handleVideoFieldChange(index, field, value) {
    setCourseVideos(prev =>
      prev.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  }

  function handleVideoThumbnailFile(index, file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setCourseVideos(prev =>
      prev.map((v, i) =>
        i === index
          ? { ...v, customThumbnailFile: file, customThumbnailPreview: previewUrl }
          : v
      )
    );
  }

  function handleClearVideoThumbnail(index) {
    setCourseVideos(prev =>
      prev.map((v, i) => {
        if (i !== index) return v;
        if (v.customThumbnailPreview && v.customThumbnailPreview.startsWith('blob:')) {
          try { URL.revokeObjectURL(v.customThumbnailPreview); } catch { }
        }
        return { ...v, customThumbnailFile: null, customThumbnailPreview: '' };
      })
    );
  }

  function handleAddAnotherVideo() {
    setCourseVideos(prev => [
      ...prev,
      {
        id: `v_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        youtubeUrl: '',
        title: '',
        section: '',
        shortDescription: '',
        isPreview: false,
        customThumbnailFile: null,
        customThumbnailPreview: '',
      }
    ]);
  }

  function handleRemoveVideo(index) {
    setCourseVideos(prev => {
      const target = prev[index];
      if (target?.customThumbnailPreview && target.customThumbnailPreview.startsWith('blob:')) {
        try { URL.revokeObjectURL(target.customThumbnailPreview); } catch { }
      }
      if (prev.length <= 1) {
        return [
          {
            id: `v_${Date.now()}`,
            youtubeUrl: '',
            title: '',
            shortDescription: '',
            isPreview: true,
            customThumbnailFile: null,
            customThumbnailPreview: '',
          }
        ];
      }
      return prev.filter((_, i) => i !== index);
    });
  }
  const [formUploading, setFormUploading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addCourseDraftTasks, setAddCourseDraftTasks] = useState([]);
  const [tab, setTab] = useState('list'); // 'list' | 'analytics'
  const [managingCourse, setManagingCourse] = useState(null);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingCourseTab, setEditingCourseTab] = useState('details');
  const [managingAssessmentCourse, setManagingAssessmentCourse] = useState(null);
  const [managingAssessmentVideoIndex, setManagingAssessmentVideoIndex] = useState(0);
  const [managingNotesCourse, setManagingNotesCourse] = useState(null);

  // Auto-refresh courses list when returning from Add/Edit Course views
  useEffect(() => {
    if (!editingCourse && !adding) {
      loadCourses();
    }
  }, [editingCourse, adding]);

  // Quick video bar state
  const [quickCourseSlug, setQuickCourseSlug] = useState('');
  const [quickManualCourse, setQuickManualCourse] = useState(false);
  const [quickManualCourseName, setQuickManualCourseName] = useState('');
  const [quickYoutubeUrl, setQuickYoutubeUrl] = useState('');
  const [quickTitle, setQuickTitle] = useState('');
  const [quickDuration, setQuickDuration] = useState(10);
  const [uploadingQuick, setUploadingQuick] = useState(false);
  const [actionNotice, setActionNotice] = useState('');
  const [quickCustomThumbnailFile, setQuickCustomThumbnailFile] = useState(null);
  const [quickCustomThumbnailPreview, setQuickCustomThumbnailPreview] = useState('');
  const quickCustomThumbInputRef = useRef(null);

  const quickVideoId = extractYoutubeId(quickYoutubeUrl);
  const quickYoutubeValid = !!quickVideoId;
  const quickYoutubeTouched = !!quickYoutubeUrl.trim();

  function handleQuickCustomThumbChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
      return;
    }
    setQuickCustomThumbnailFile(file);
    const previewUrl = URL.createObjectURL(file);
    setQuickCustomThumbnailPreview(previewUrl);
  }

  function clearQuickCustomThumbnail() {
    setQuickCustomThumbnailFile(null);
    if (quickCustomThumbnailPreview && quickCustomThumbnailPreview.startsWith('blob:')) {
      try { URL.revokeObjectURL(quickCustomThumbnailPreview); } catch { }
    }
    setQuickCustomThumbnailPreview('');
    if (quickCustomThumbInputRef.current) {
      quickCustomThumbInputRef.current.value = '';
    }
  }

  const formYoutubeId = '';
  const formYoutubeValid = false;
  const formYoutubeTouched = false;

  // Course views loaded from backend database and real-time live sync
  const [serverViews, setServerViews] = useState([]);
  const [lastLiveSync, setLastLiveSync] = useState(Date.now());

  const loadViews = async () => {
    try {
      const res = await fetch(resolveApiPath('/courses/views'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setServerViews(data);
          setLastLiveSync(Date.now());
          return data;
        }
      }
    } catch (e) {
      console.warn('Could not load course views:', e?.message);
    }
    return [];
  };

  const handleRefreshCourses = async () => {
    try {
      setLoadingCourses(true);
      await Promise.allSettled([loadCourses(), loadViews()]);
      setActionNotice('✓ Courses and analytics updated successfully.');
      setTimeout(() => setActionNotice(''), 3500);
    } finally {
      setLoadingCourses(false);
    }
  };

  // High-frequency real-time live synchronization (polling every 2.5s & cross-tab events)
  useEffect(() => {
    let isMounted = true;
    let pollTimer = null;
    let coursesTimer = null;

    const silentSyncViews = async () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      try {
        const res = await fetch(resolveApiPath('/courses/views'));
        if (res.ok && isMounted) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setServerViews(data);
            setLastLiveSync(Date.now());
          }
        }
      } catch { }
    };

    // Initial immediate load
    silentSyncViews();

    // High frequency 2.5-second live views poll
    pollTimer = setInterval(silentSyncViews, 2500);

    // Background courses refresh every 12 seconds so new courses/database counts stay updated
    coursesTimer = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden && !loadingCourses) {
        loadCourses();
      }
    }, 12000);

    // Cross-tab and local storage listeners for 0ms instantaneous updates
    const handleStorageChange = (e) => {
      if (!e || !e.key || e.key === 'course_views' || e.key.startsWith('gg-actual-watchtime') || e.key === 'admin_courses') {
        silentSyncViews();
        setLastLiveSync(Date.now());
      }
    };

    const handleCustomViewEvent = () => {
      silentSyncViews();
      setLastLiveSync(Date.now());
    };

    const handleVisibility = () => {
      if (typeof document !== 'undefined' && !document.hidden) {
        silentSyncViews();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('gg-course-view-updated', handleCustomViewEvent);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isMounted = false;
      if (pollTimer) clearInterval(pollTimer);
      if (coursesTimer) clearInterval(coursesTimer);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('gg-course-view-updated', handleCustomViewEvent);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [tab]);

  // Compute analytics based on authoritative database views, local browser updates, and courses
  const analytics = useMemo(() => {
    const map = {};
    // Seed directly with authoritative backend database course view statistics
    courses.forEach((c) => {
      if (c && c.slug) {
        map[c.slug] = {
          views: Number(c.views) || 0,
          totalTime: Number(c.totalTime) || 0,
          avgTime: Number(c.avgTime) || 0,
        };
      }
    });

    // Merge server views with any active local browser sessions for 0ms latency live preview
    const localViews = (() => {
      try {
        const parsed = JSON.parse(localStorage.getItem('course_views') || '[]');
        return Array.isArray(parsed) ? parsed.filter((v) => (v?.slug || '').toLowerCase().trim() !== 'aaaaaaaaaaaa') : [];
      } catch { return []; }
    })();

    const allViews = [...(Array.isArray(serverViews) ? serverViews : [])];

    if (Array.isArray(localViews) && localViews.length > 0) {
      localViews.forEach((lv) => {
        if (!lv || !lv.slug) return;
        const existingIdx = allViews.findIndex((sv) =>
          (sv.id && lv.id && sv.id === lv.id) ||
          (sv.slug === lv.slug && sv.userId && lv.userId && sv.userId === lv.userId)
        );
        if (existingIdx !== -1) {
          if ((Number(lv.timeSpent) || 0) > (Number(allViews[existingIdx].timeSpent) || 0)) {
            allViews[existingIdx] = {
              ...allViews[existingIdx],
              timeSpent: Number(lv.timeSpent) || 0,
              updatedAt: new Date().toISOString(),
            };
          }
        } else {
          allViews.push(lv);
        }
      });
    }

    if (allViews.length > 0) {
      const viewerMap = {};
      allViews.forEach((v) => {
        if (!v || !v.slug) return;
        const s = v.slug.toLowerCase().trim();
        if (!viewerMap[s]) viewerMap[s] = new Map();
        const viewerKey = (v.userId && String(v.userId).trim()) || String(v.id || '').trim();
        if (viewerKey) {
          const prev = viewerMap[s].get(viewerKey) || 0;
          viewerMap[s].set(viewerKey, Math.max(prev, Number(v.timeSpent) || 0));
        }
      });

      Object.keys(viewerMap).forEach((s) => {
        const times = Array.from(viewerMap[s].values());
        const viewsCount = times.length;
        const total = times.reduce((acc, t) => acc + t, 0);
        const avg = viewsCount > 0 ? Math.round(total / viewsCount) : 0;
        map[s] = {
          views: viewsCount,
          totalTime: total,
          avgTime: avg,
        };
      });
    }

    return map;
  }, [courses, serverViews, lastLiveSync]);

  const rawViews = useMemo(() => {
    const localViews = (() => {
      try {
        const parsed = JSON.parse(localStorage.getItem('course_views') || '[]');
        return Array.isArray(parsed) ? parsed.filter((v) => (v?.slug || '').toLowerCase().trim() !== 'aaaaaaaaaaaa') : [];
      } catch { return []; }
    })();
    const allViews = [...(Array.isArray(serverViews) ? serverViews : [])];
    if (Array.isArray(localViews) && localViews.length > 0) {
      localViews.forEach((lv) => {
        if (!lv || !lv.slug) return;
        const exists = allViews.some((sv) =>
          (sv.id && lv.id && sv.id === lv.id) ||
          (sv.slug === lv.slug && sv.userId && lv.userId && sv.userId === lv.userId)
        );
        if (!exists) allViews.push(lv);
      });
    }
    return allViews;
  }, [serverViews, lastLiveSync]);

  const coursesWithStats = useMemo(() =>
    courses.map((c) => ({
      ...c,
      views: analytics[c.slug]?.views !== undefined ? analytics[c.slug].views : (Number(c.views) || 0),
      totalTime: analytics[c.slug]?.totalTime !== undefined ? analytics[c.slug].totalTime : (Number(c.totalTime) || 0),
      avgTime: analytics[c.slug]?.avgTime !== undefined ? analytics[c.slug].avgTime : (Number(c.avgTime) || 0),
    })).sort((a, b) => b.views - a.views)
    , [courses, analytics]);

  const maxViews = Math.max(1, ...coursesWithStats.map(c => c.views));
  const totalViews = coursesWithStats.reduce((s, c) => s + c.views, 0);
  const totalTime = coursesWithStats.reduce((s, c) => s + c.totalTime, 0);
  const mostWatched = coursesWithStats[0];
  const mostTime = [...coursesWithStats].sort((a, b) => b.totalTime - a.totalTime)[0];

  function fmtSec(s) {
    const sec = Math.max(0, Math.round(Number(s) || 0));
    if (sec === 0) return '0m';
    if (sec < 60) return `${sec}s`;
    const m = Math.round(sec / 60);
    if (m < 60) return `${m}m`;
    const hrs = Math.floor(m / 60);
    const remMins = m % 60;
    return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
  }

  function save(updatedCourses) {
    setCourses(updatedCourses);
    localStorage.setItem('admin_courses', JSON.stringify(updatedCourses));
    try { window.dispatchEvent(new Event('storage')); } catch { }
  }

  async function handleDownloadTemplate() {
    setDownloadingTemplate(true);
    try {
      if (api?.downloadTemplate) {
        await api.downloadTemplate();
      } else {
        alert('Template download is available for authenticated administrators.');
      }
    } catch (err) {
      alert('Failed to download template: ' + (err.message || 'Error'));
    } finally {
      setDownloadingTemplate(false);
    }
  }

  async function handleExportExcel() {
    setExporting(true);
    try {
      if (api?.exportCourses) {
        await api.exportCourses();
      } else {
        alert('Course export is available for authenticated administrators.');
      }
    } catch (err) {
      alert('Failed to export courses: ' + (err.message || 'Error'));
    } finally {
      setExporting(false);
    }
  }

  async function addCourse(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Please enter a course title.');
      return;
    }

    // Validate course videos (each filled video must have a valid YouTube URL and title)
    const filledVideos = courseVideos.filter(
      v => v.youtubeUrl.trim() || v.title.trim() || (v.shortDescription || '').trim()
    );

    for (let i = 0; i < filledVideos.length; i++) {
      const v = filledVideos[i];
      const ytId = extractYoutubeId(v.youtubeUrl);
      if (!v.youtubeUrl.trim()) {
        alert(`Please enter a YouTube video URL for Video ${i + 1}.`);
        return;
      }
      if (!ytId) {
        alert(`Invalid YouTube URL for Video ${i + 1}. Please enter a valid YouTube video URL, short link, or Shorts link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)`);
        return;
      }
      if (!v.title.trim()) {
        alert(`Please enter a Video Title for Video ${i + 1}.`);
        return;
      }
    }

    setFormUploading(true);
    setActionNotice('');

    try {
      const client = api || adminApi(getToken());
      const initialLessons = [];

      for (let i = 0; i < filledVideos.length; i++) {
        const v = filledVideos[i];
        const ytId = extractYoutubeId(v.youtubeUrl);
        let finalThumbnail = null;
        if (v.customThumbnailFile && client?.uploadThumbnail) {
          try {
            const upRes = await client.uploadThumbnail(v.customThumbnailFile);
            if (upRes?.thumbnailUrl) {
              finalThumbnail = upRes.thumbnailUrl;
            }
          } catch (thumbErr) {
            console.warn(`Custom thumbnail upload failed for Video ${i + 1}:`, thumbErr.message);
          }
        }
        if (!finalThumbnail) {
          finalThumbnail = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
        }

        initialLessons.push({
          t: v.title.trim(),
          section: (v.section || '').trim(),
          shortDescription: (v.shortDescription || '').trim(),
          min: 10,
          isPreview: v.isPreview !== undefined ? !!v.isPreview : (i === 0),
          youtube: v.youtubeUrl.trim(),
          youtubeVideoId: ytId,
          youtubeUrl: v.youtubeUrl.trim(),
          thumbnail: finalThumbnail,
          thumbnailUrl: finalThumbnail,
        });
      }

      const firstVideo = initialLessons[0] || null;
      const courseSlug = form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `course-${Date.now()}`;
      const courseThumbnail = firstVideo ? (firstVideo.thumbnailUrl || firstVideo.thumbnail) : null;
      const courseYoutubeUrl = firstVideo ? firstVideo.youtubeUrl : null;
      const courseYoutubeId = firstVideo ? firstVideo.youtubeVideoId : null;

      const parsedLearn = form.learn && form.learn.trim()
        ? form.learn.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean)
        : ['Practical real-world skills', 'Step-by-step video guidance', 'Hands-on examples and techniques'];

      const parsedRequirements = form.requirements && form.requirements.trim()
        ? form.requirements.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean)
        : [];

      const newCourse = {
        _id: Date.now().toString(),
        slug: courseSlug,
        category: form.category,
        icon: 'school',
        trending: !!form.trending,
        gradient: 'from-[#1E3A8A] via-[#0F172A] to-slate-50',
        level: { en: form.level, mr: form.level },
        title: { en: form.title.trim(), mr: form.title.trim() },
        short: { en: form.short?.trim() || 'Complete video learning course.', mr: form.short?.trim() || 'Complete video learning course.' },
        learn: parsedLearn,
        requirements: parsedRequirements,
        resources: [],
        lessons: initialLessons,
        videoUrl: '',
        youtubeUrl: courseYoutubeUrl,
        youtubeVideoId: courseYoutubeId,
        thumbnailUrl: courseThumbnail,
        assessments: [],
        assessmentSettings: { enabled: true },
      };

      let createdCourse = newCourse;
      if (client?.createCourse) {
        try {
          const res = await client.createCourse({
            courseName: form.title.trim(),
            slug: courseSlug,
            category: form.category,
            level: form.level,
            shortDescription: form.short?.trim() || 'Complete video learning course.',
            trending: !!form.trending,
            price: Number(form.price) || 0,
            isFree: Number(form.price) === 0,
            validityDays: Number(form.validityDays) || 365,
            youtubeUrl: courseYoutubeUrl,
            youtubeVideoId: courseYoutubeId,
            thumbnailUrl: courseThumbnail,
            learn: parsedLearn,
            requirements: parsedRequirements,
            resources: [],
            sections: Array.from(new Set(initialLessons.map(l => l.section).filter(Boolean))),
            lessons: initialLessons,
            assessments: [],
            assessmentSettings: { enabled: true },
          });
          if (res) {
            createdCourse = {
              ...newCourse,
              ...res,
              _id: res.id || res._id || res.slug || newCourse._id,
              id: res.id || res._id,
              slug: res.slug || newCourse.slug,
              title: res.title || res.courseName || newCourse.title,
              short: res.short || res.shortDescription || newCourse.short,
              lessons: (Array.isArray(res.lessons) && res.lessons.length > 0) ? res.lessons : initialLessons,
            };
          }
        } catch (apiErr) {
          console.warn('Backend course save error, fallback to local:', apiErr.message);
        }
      }

      // Persist any queued draft tasks for this course/video
      if (addCourseDraftTasks.length > 0 && client?.createAdminTask) {
        const targetVideoId = createdCourse?.videos?.[0]?.id || courseYoutubeId || firstVideo?.youtubeVideoId || `${courseSlug}-v1`;
        for (const dt of addCourseDraftTasks) {
          try {
            await client.createAdminTask({
              title: dt.title,
              description: dt.description || '',
              instructions: dt.instructions || '',
              dueDate: dt.dueDate ? new Date(dt.dueDate).toISOString() : null,
              videoId: dt.videoId || targetVideoId,
              videoTitle: dt.videoTitle || firstVideo?.t || form.title.trim(),
              courseSlug: createdCourse.slug,
              courseId: createdCourse.id,
              attachmentUrl: dt.attachmentUrl || null,
              attachmentName: dt.attachmentName || null,
              attachmentSize: dt.attachmentSize || null,
              attachmentExt: dt.attachmentExt || null,
              assignToType: 'all',
            });
          } catch (taskErr) {
            console.warn('Failed to auto-create queued task for course:', taskErr);
          }
        }
      }
      setAddCourseDraftTasks([]);

      save([createdCourse, ...courses.filter(c => c.slug !== createdCourse.slug)]);
      await loadCourses();

      setForm({
        title: '',
        category: 'entrepreneurship',
        level: 'Beginner',
        short: '',
        trending: true,
        price: 0,
        validityDays: 365,
        learn: '',
        requirements: '',
      });
      setCourseVideos([
        {
          id: `v_${Date.now()}`,
          youtubeUrl: '',
          title: '',
          shortDescription: '',
          customThumbnailFile: null,
          customThumbnailPreview: '',
        }
      ]);
      setAdding(false);
      setActionNotice(`✓ Course "${form.title.trim()}" with ${initialLessons.length} video${initialLessons.length === 1 ? '' : 's'} created successfully!`);
    } catch (err) {
      alert('Error saving course: ' + (err.message || 'Failed'));
    } finally {
      setFormUploading(false);
    }
  }

  async function handleQuickUpload(e) {
    e.preventDefault();

    const isManual = quickManualCourse || quickCourseSlug === '__new__';
    const manualName = quickManualCourseName.trim();

    if (isManual && !manualName) {
      alert('Please enter a course name or switch to select an existing course.');
      return;
    }
    if (!isManual && !quickCourseSlug) {
      alert('Please select a course to add this video to, or type a new course name.');
      return;
    }

    const ytUrl = (quickYoutubeUrl || '').trim();
    const ytId = ytUrl ? extractYoutubeId(ytUrl) : '';

    if (!ytUrl || !ytId) {
      alert('Invalid YouTube URL. Please enter a valid YouTube video URL, short link, or Shorts link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)');
      return;
    }

    const lessonName = quickTitle.trim();
    if (!lessonName) {
      alert('Please enter a manual Lesson / Video Title for this video.');
      return;
    }

    setUploadingQuick(true);
    setActionNotice('');

    try {
      // 1. Resolve thumbnail: custom uploaded thumbnail if provided; otherwise automatic YouTube thumbnail
      let finalThumbnail = null;
      if (quickCustomThumbnailFile && api?.uploadThumbnail) {
        try {
          const upRes = await api.uploadThumbnail(quickCustomThumbnailFile);
          if (upRes?.thumbnailUrl) {
            finalThumbnail = upRes.thumbnailUrl;
          }
        } catch (upErr) {
          console.warn('Custom thumbnail upload failed, falling back to YouTube thumbnail:', upErr.message);
        }
      }
      if (!finalThumbnail) {
        finalThumbnail = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
      }

      const newLesson = {
        t: lessonName,
        min: Number(quickDuration) || 10,
        youtube: ytUrl,
        youtubeVideoId: ytId,
        youtubeUrl: ytUrl,
        thumbnail: finalThumbnail,
        thumbnailUrl: finalThumbnail,
      };

      if (isManual) {
        // Check if course already exists by this slug or title
        const targetSlug = manualName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `course-${Date.now()}`;
        const existing = courses.find(
          c => c.slug === targetSlug || safeStr(c.title).toLowerCase() === manualName.toLowerCase()
        );

        if (existing) {
          // Append to existing course
          const prevLessons = existing?.lessons || [];
          const updatedLessons = [...prevLessons, newLesson];
          const identifier = existing?.id || existing?.slug || existing?._id;

          if (identifier && api?.updateCourse) {
            await api.updateCourse(identifier, {
              lessons: updatedLessons,
              youtubeUrl: existing.youtubeUrl || ytUrl,
              youtubeVideoId: existing.youtubeVideoId || ytId,
              thumbnailUrl: existing.thumbnailUrl || finalThumbnail,
            });
          }
          await loadCourses();
          setActionNotice(`✓ Video with thumbnail added to existing course "${safeStr(existing.title)}" successfully!`);
        } else {
          // Create new course with this video
          if (api?.createCourse) {
            await api.createCourse({
              courseName: manualName,
              slug: targetSlug,
              category: 'entrepreneurship',
              level: 'Beginner',
              shortDescription: 'Complete video learning course.',
              trending: true,
              youtubeUrl: ytUrl,
              youtubeVideoId: ytId,
              thumbnailUrl: finalThumbnail,
              lessons: [newLesson],
            });
          }
          await loadCourses();
          setActionNotice(`✓ New course "${manualName}" created with video & thumbnail attached successfully!`);
        }

        setQuickManualCourse(false);
        setQuickManualCourseName('');
        setQuickCourseSlug('');
      } else {
        const targetCourse = courses.find(c => c.slug === quickCourseSlug);
        const prevLessons = targetCourse?.lessons || [];
        const updatedLessons = [...prevLessons, newLesson];
        const identifier = targetCourse?.id || targetCourse?.slug || quickCourseSlug;

        if (identifier && api?.updateCourse) {
          await api.updateCourse(identifier, {
            lessons: updatedLessons,
            youtubeUrl: ytUrl,
            youtubeVideoId: ytId,
            thumbnailUrl: targetCourse?.thumbnailUrl || finalThumbnail,
          });
          await loadCourses();
        } else {
          const updated = courses.map(c => c.slug === quickCourseSlug ? {
            ...c,
            lessons: updatedLessons,
            youtubeUrl: ytUrl,
            youtubeVideoId: ytId,
            thumbnailUrl: c.thumbnailUrl || finalThumbnail,
          } : c);
          save(updated);
        }
        setActionNotice(`✓ Video with thumbnail added to "${safeStr(targetCourse?.title)}" successfully!`);
      }

      setQuickYoutubeUrl('');
      setQuickTitle('');
      setQuickDuration(10);
      clearQuickCustomThumbnail();
    } catch (err) {
      alert('Adding video failed: ' + (err.message || 'Error'));
    } finally {
      setUploadingQuick(false);
    }
  }

  async function deleteCourse(id) {
    if (!confirm('Delete this course?')) return;
    const target = courses.find(c => (c._id || c.slug || c.id) === id || c.slug === id || c.id === id);
    const identifier = target?.id || target?.slug || id;
    const client = api || adminApi(getToken());
    try {
      if (!client?.deleteCourse) {
        throw new Error('Course deletion service is currently unavailable.');
      }
      await client.deleteCourse(identifier);
      try {
        const stored = JSON.parse(localStorage.getItem('admin_courses') || '[]');
        const updatedStored = stored.filter(c => (c._id || c.slug || c.id) !== id && c.slug !== identifier && c.id !== identifier);
        localStorage.setItem('admin_courses', JSON.stringify(updatedStored));
      } catch { }
      await loadCourses();
      setActionNotice(`✓ Course "${safeStr(target?.title || identifier)}" deleted successfully.`);
    } catch (err) {
      alert('Failed to delete course: ' + (err.message || 'Server error'));
    }
  }

  async function deletePlaylist(playlistId, playlistTitle) {
    if (!confirm(`Are you sure you want to delete the playlist "${playlistTitle || 'this playlist'}"? This action cannot be undone.`)) return;
    const client = api || adminApi(getToken());
    try {
      if (typeof client?.deletePlaylist === 'function') {
        await client.deletePlaylist(playlistId);
      } else {
        const res = await fetch(resolveApiPath(`/admin/playlists/${encodeURIComponent(playlistId)}`), {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.message || 'Failed to delete playlist');
        }
      }
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
      await loadCourses();
      setActionNotice(`✓ Playlist "${playlistTitle || 'Playlist'}" deleted successfully.`);
      setTimeout(() => setActionNotice(''), 4000);
    } catch (err) {
      alert('Failed to delete playlist: ' + (err.message || 'Server error'));
    }
  }

  async function updateCourseVideos(courseId, newLessons) {
    const target = courses.find(c => (c._id || c.slug || c.id) === courseId || c.slug === courseId || c.id === courseId);
    const firstYt = newLessons.find(l => l.youtubeVideoId || l.youtube);
    const identifier = target?.id || target?.slug || courseId;
    const client = api || adminApi(getToken());
    try {
      if (!client?.updateCourse) {
        throw new Error('Course update service is currently unavailable.');
      }
      const updatedSections = Array.from(new Set(newLessons.map(l => l.section).filter(Boolean)));
      await client.updateCourse(identifier, {
        lessons: newLessons,
        sections: updatedSections,
        videoUrl: newLessons[0]?.file || (newLessons.length === 0 ? '' : target?.videoUrl),
        youtubeUrl: firstYt ? (firstYt.youtubeUrl || firstYt.youtube) : (newLessons.length === 0 ? '' : target?.youtubeUrl),
        youtubeVideoId: firstYt ? (firstYt.youtubeVideoId || extractYoutubeId(firstYt.youtube)) : (newLessons.length === 0 ? '' : target?.youtubeVideoId),
      });
      await loadCourses();
      if (managingCourse && ((managingCourse._id || managingCourse.slug || managingCourse.id) === courseId || managingCourse.slug === courseId || managingCourse.id === courseId)) {
        setManagingCourse(prev => prev ? { ...prev, lessons: newLessons } : null);
      }
      setActionNotice('✓ Video lessons updated successfully.');
    } catch (err) {
      alert('Failed to update course videos: ' + (err.message || 'Server error'));
    }
  }

  const [uploadingExcelCourseId, setUploadingExcelCourseId] = useState(null);

  async function handleUploadExcelForCourse(courseId, file) {
    if (!file) return;
    setUploadingExcelCourseId(courseId);
    const client = api || adminApi(getToken());
    try {
      if (!client?.uploadCourseExcel) throw new Error('Excel upload service not available');
      const updated = await client.uploadCourseExcel(courseId, file);
      setCourses(prev =>
        prev.map(c =>
          (c._id || c.slug || c.id) === courseId
            ? { ...c, excelFileName: updated.excelFileName, excelFileUrl: updated.excelFileUrl }
            : c
        )
      );
      setActionNotice(`✓ Excel file "${file.name}" associated with course successfully.`);
    } catch (err) {
      alert('Failed to upload Excel file: ' + (err.message || 'Unknown error'));
    } finally {
      setUploadingExcelCourseId(null);
    }
  }

  async function handleRemoveExcelForCourse(courseId) {
    if (!confirm('Dissociate and remove the Excel file from this course?')) return;
    const client = api || adminApi(getToken());
    try {
      if (!client?.removeCourseExcel) throw new Error('Excel service not available');
      await client.removeCourseExcel(courseId);
      setCourses(prev =>
        prev.map(c =>
          (c._id || c.slug || c.id) === courseId
            ? { ...c, excelFileName: null, excelFileUrl: null }
            : c
        )
      );
      setActionNotice('✓ Excel file dissociated from course.');
    } catch (err) {
      alert('Failed to remove Excel file: ' + (err.message || 'Unknown error'));
    }
  }

  // ── Render AdminPlaylistsPanel if a course was selected for Playlists ──
  if (selectedCourseForPlaylists) {
    return (
      <AdminPlaylistsPanel
        api={api}
        course={selectedCourseForPlaylists}
        isSubAdmin={isSubAdmin}
        isSuperAdmin={isSuperAdmin}
        onBack={() => {
          setSelectedCourseForPlaylists(null);
          loadCourses();
        }}
      />
    );
  }

  // ── Render Single-Page Vertical Course Editor for Edit or Add Course ──
  if (editingCourse || adding) {
    return (
      <SinglePageEditCourse
        api={api}
        course={editingCourse || null}
        isNew={!editingCourse}
        initialTab={editingCourseTab || 'details'}
        onClose={() => {
          setEditingCourse(null);
          setAdding(false);
          setEditingCourseTab('details');
          loadCourses();
        }}
        onSave={(updated, options = {}) => {
          if (options.keepOpen) {
            setCourses((prev) => {
              const exists = prev.some((c) => (c.id && c.id === updated.id) || (c.slug && c.slug === updated.slug));
              if (exists) {
                return prev.map((c) =>
                  (c.id && c.id === updated.id) || (c.slug && c.slug === updated.slug) ? { ...c, ...updated } : c
                );
              }
              return [{ ...updated, _id: updated.id || updated.slug }, ...prev];
            });
            setEditingCourse((prev) => (prev ? { ...prev, ...updated } : updated));
            loadCourses();
            return;
          }
          setEditingCourse(null);
          setAdding(false);
          setEditingCourseTab('details');
          loadCourses();
          const name = safeStr(updated?.title?.en || updated?.title || updated?.courseName || 'Course');
          setActionNotice(
            editingCourse
              ? 'All changes saved successfully.'
              : `✓ Course "${name}" created successfully!`
          );
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A]">
            {isSubAdmin ? 'Allocated Courses & Playlists' : t('admin.courses.title', 'Course Management')}
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <button
            type="button"
            onClick={handleRefreshCourses}
            disabled={loadingCourses}
            title="Refresh Courses and Playlists from Server"
            className="flex items-center gap-1.5 bg-white border border-slate-200 text-[#0F172A] px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Icon name="sync" className={`text-base ${loadingCourses ? 'animate-spin' : ''}`} />
            <span>{loadingCourses ? 'Refreshing...' : t('admin.common.refresh', 'Refresh')}</span>
          </button>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer"
            title="Create a new course with embedded video lessons & playlist"
          >
            <Icon name="add" /> {t('admin.courses.addCourse', 'Add New Course')}
          </button>
        </div>
      </div>

      {/* Sub-Admin Top Summary Strip (No Duplication) */}
      {isSubAdmin && (
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] block">Allocated Courses</span>
              <span className="text-2xl font-black text-[#0F172A] mt-1 block">{singleVideoCourses.length}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-[#0F172A] flex items-center justify-center shadow-2xs">
              <Icon name="school" className="text-2xl" />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] block">Allocated Playlists</span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block">{playlists.length}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shadow-2xs">
              <Icon name="playlist_play" className="text-2xl" />
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] block">Total Views Across Allocated Content</span>
              <span className="text-2xl font-black text-sky-700 mt-1 block">{totalViews}</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center shadow-2xs">
              <Icon name="visibility" className="text-2xl" />
            </div>
          </div>
        </div>
      )}

      {actionNotice && (
        <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-700 text-sm font-bold flex items-center gap-2 shadow-xs">
          <Icon name="check_circle" className="text-emerald-600 text-xl shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Add Course Form */}
      {adding && (
        <form onSubmit={addCourse} className="bg-white border-2 border-blue-200 shadow-xl rounded-3xl p-6 md:p-8 mb-8 space-y-8 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#0F172A] flex items-center justify-center shrink-0">
                <Icon name="school" className="text-3xl" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-[#0F172A]">Add New Course & YouTube Videos</h2>
                <p className="text-xs text-[#475569] mt-0.5">
                  Create a new course with multiple embedded YouTube videos streamed directly inside G-Mark Software.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setForm({
                  title: '',
                  category: 'entrepreneurship',
                  level: 'Beginner',
                  short: '',
                  trending: true,
                });
                setCourseVideos([
                  {
                    id: `v_${Date.now()}`,
                    youtubeUrl: '',
                    title: '',
                    shortDescription: '',
                    customThumbnailFile: null,
                    customThumbnailPreview: '',
                  }
                ]);
              }}
              className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition cursor-pointer"
              title="Close form"
            >
              <Icon name="close" className="text-xl" />
            </button>
          </div>

          {/* ── SECTION 1: COURSE INFORMATION ── */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <span className="w-6 h-6 rounded-lg bg-[#2563EB] text-white flex items-center justify-center text-xs font-black">
                1
              </span>
              <h3 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wider">
                Course Information
              </h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label htmlFor="add-course-title" className="text-xs font-extrabold text-[#0F172A] block mb-1">
                  Course Name / Title *
                </label>
                <input
                  id="add-course-title"
                  name="title"
                  required
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm font-medium"
                  placeholder="e.g. Complete Organic Farming & Business Guide"
                />
              </div>

              <div>
                <label htmlFor="add-course-category" className="text-xs font-extrabold text-[#0F172A] block mb-1">
                  Category *
                </label>
                <select
                  id="add-course-category"
                  name="category"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm font-medium cursor-pointer"
                >
                  {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.en}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="add-course-level" className="text-xs font-extrabold text-[#0F172A] block mb-1">
                  Difficulty Level *
                </label>
                <select
                  id="add-course-level"
                  name="level"
                  value={form.level}
                  onChange={e => setForm({ ...form, level: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm font-medium cursor-pointer"
                >
                  {['Beginner', 'Intermediate', 'Advanced', 'All levels'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div>
                <label htmlFor="add-course-price" className="text-xs font-extrabold text-[#0F172A] block mb-1">
                  Price (₹) — 0 for Free
                </label>
                <input
                  id="add-course-price"
                  type="number"
                  min="0"
                  name="price"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm font-medium"
                  placeholder="0"
                />
              </div>

              <div>
                <label htmlFor="add-course-validity" className="text-xs font-extrabold text-[#0F172A] block mb-1">
                  Access Validity (Days)
                </label>
                <input
                  id="add-course-validity"
                  type="number"
                  min="1"
                  name="validityDays"
                  value={form.validityDays}
                  onChange={e => setForm({ ...form, validityDays: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm font-medium"
                  placeholder="365"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="add-course-short" className="text-xs font-extrabold text-[#0F172A] block mb-1">
                  Short Description
                </label>
                <textarea
                  id="add-course-short"
                  name="short"
                  value={form.short}
                  onChange={e => setForm({ ...form, short: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm font-medium"
                  rows={2}
                  placeholder="Brief overview of what students will achieve in this course..."
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="add-course-learn" className="text-xs font-extrabold text-[#0F172A] block mb-1">
                  Learning Outcomes (What Students Will Learn) <span className="font-normal text-[#475569]">(One per line or comma-separated)</span>
                </label>
                <textarea
                  id="add-course-learn"
                  name="learn"
                  value={form.learn || ''}
                  onChange={e => setForm({ ...form, learn: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm font-medium"
                  rows={2}
                  placeholder="e.g. Master financial management fundamentals&#10;Learn to use automated accounting tools&#10;Create balance sheets and profit & loss statements"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="add-course-requirements" className="text-xs font-extrabold text-[#0F172A] block mb-1">
                  Course Requirements & Prerequisites <span className="font-normal text-[#475569]">(One per line or comma-separated)</span>
                </label>
                <textarea
                  id="add-course-requirements"
                  name="requirements"
                  value={form.requirements || ''}
                  onChange={e => setForm({ ...form, requirements: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#2563EB] text-sm font-medium"
                  rows={2}
                  placeholder="e.g. Basic understanding of computers or smartphone&#10;Interest in starting or scaling a local enterprise"
                />
              </div>

              {/* Trending Yes / No selector */}
              <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <label className="text-xs font-extrabold text-[#0F172A] block mb-2">
                  ⭐ Trending Course (Display in Home Page Trending Section)?
                </label>
                <div className="flex items-center gap-3">
                  <label
                    className={`px-4 py-2 rounded-xl border text-xs font-extrabold flex items-center gap-2 cursor-pointer transition ${form.trending === true
                      ? 'bg-[#2563EB] text-white border-blue-200 shadow-xs'
                      : 'bg-white text-white border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <input
                      type="radio"
                      name="course-trending"
                      checked={form.trending === true}
                      onChange={() => setForm({ ...form, trending: true })}
                      className="accent-brand-forest w-3.5 h-3.5"
                    />
                    <span>Yes (Featured in Trending Strip)</span>
                  </label>

                  <label
                    className={`px-4 py-2 rounded-xl border text-xs font-extrabold flex items-center gap-2 cursor-pointer transition ${form.trending === false
                      ? 'bg-[#2563EB] text-white border-blue-200 shadow-xs'
                      : 'bg-white text-white border-slate-200 hover:bg-slate-100'
                      }`}
                  >
                    <input
                      type="radio"
                      name="course-trending"
                      checked={form.trending === false}
                      onChange={() => setForm({ ...form, trending: false })}
                      className="accent-brand-forest w-3.5 h-3.5"
                    />
                    <span>No (Regular Course)</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* ── SECTION 2: COURSE VIDEOS ── */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-red-600 text-white flex items-center justify-center text-xs font-black">
                  2
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-2">
                    <span>Course Videos</span>
                    <span className="text-xs font-bold text-[#475569] lowercase tracking-normal">
                      ({courseVideos.length} video{courseVideos.length === 1 ? '' : 's'})
                    </span>
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAddAnotherVideo}
                className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] text-white text-xs font-extrabold flex items-center gap-1.5 hover:bg-[#1D4ED8] transition shadow-2xs cursor-pointer"
              >
                <Icon name="add" className="text-sm" /> Add Another Video
              </button>
            </div>

            <p className="text-xs text-[#475569]">
              Embed one or more YouTube videos. Each video will be saved as an individual lesson under this course with its own title, description, and automatic thumbnail.
            </p>

            {/* Multiple Video Items */}
            <div className="space-y-5">
              {courseVideos.map((v, vIndex) => {
                const vYtId = extractYoutubeId(v.youtubeUrl);
                const vYtTouched = !!(v.youtubeUrl && v.youtubeUrl.trim());
                const vYtValid = !!vYtId;
                const vThumbSrc = v.customThumbnailPreview || (vYtValid ? getYoutubeThumbnailUrl(vYtId, 'maxresdefault') : null);

                return (
                  <div
                    key={v.id || vIndex}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-brand-forest/30 transition shadow-2xs"
                  >
                    {/* Video Card Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-red-50 text-red-700 flex items-center justify-center text-xs font-black">
                          {vIndex + 1}
                        </span>
                        <span className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wide">
                          Video {vIndex + 1}
                        </span>
                        {vYtTouched && (
                          vYtValid ? (
                            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                              <Icon name="check_circle" className="text-xs text-emerald-600" /> Valid ID: {vYtId}
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-red-200">
                              <Icon name="error" className="text-xs text-red-600" /> Invalid YouTube link
                            </span>
                          )
                        )}
                      </div>

                      {courseVideos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveVideo(vIndex)}
                          className="text-xs font-bold text-red-600 hover:text-red-800 hover:bg-red-50 px-2.5 py-1 rounded-lg flex items-center gap-1 transition cursor-pointer"
                          title="Remove this video"
                        >
                          <Icon name="delete" className="text-sm" /> Remove Video
                        </button>
                      )}
                    </div>

                    {/* Video Fields Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* YouTube URL */}
                      <div>
                        <label htmlFor={`video-url-${vIndex}`} className="text-xs font-extrabold text-[#0F172A] block mb-1">
                          YouTube Video URL * <span className="font-normal text-[#475569]">(watch, Shorts, or youtu.be)</span>
                        </label>
                        <input
                          id={`video-url-${vIndex}`}
                          type="url"
                          value={v.youtubeUrl}
                          onChange={e => handleVideoFieldChange(vIndex, 'youtubeUrl', e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-medium"
                        />
                      </div>

                      {/* Video Title */}
                      <div>
                        <label htmlFor={`video-title-${vIndex}`} className="text-xs font-extrabold text-[#0F172A] block mb-1">
                          Video Title * <span className="font-semibold text-[#0F172A]">(Shown in Player)</span>
                        </label>
                        <input
                          id={`video-title-${vIndex}`}
                          type="text"
                          value={v.title}
                          onChange={e => handleVideoFieldChange(vIndex, 'title', e.target.value)}
                          placeholder={`e.g. Lesson ${vIndex + 1}: Introduction & Core Concepts`}
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-medium"
                        />
                      </div>

                      {/* Section Name */}
                      <div>
                        <label htmlFor={`video-section-${vIndex}`} className="text-xs font-extrabold text-[#0F172A] block mb-1">
                          Section / Chapter Name <span className="font-normal text-[#475569]">(Optional, e.g. Introduction to APIs)</span>
                        </label>
                        <input
                          id={`video-section-${vIndex}`}
                          type="text"
                          value={v.section || ''}
                          onChange={e => handleVideoFieldChange(vIndex, 'section', e.target.value)}
                          placeholder="e.g. Introduction to APIs"
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-medium"
                        />
                      </div>

                      {/* Video Short Description */}
                      <div className="md:col-span-2">
                        <label htmlFor={`video-desc-${vIndex}`} className="text-xs font-extrabold text-[#0F172A] block mb-1">
                          Video Short Description <span className="font-normal text-[#475569]">(Optional)</span>
                        </label>
                        <input
                          id={`video-desc-${vIndex}`}
                          type="text"
                          value={v.shortDescription || ''}
                          onChange={e => handleVideoFieldChange(vIndex, 'shortDescription', e.target.value)}
                          placeholder="Brief summary of what this specific video explains..."
                          className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-medium"
                        />
                      </div>

                      {/* Free Preview Option */}
                      <div className="md:col-span-2 flex items-center gap-2 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition">
                          <input
                            type="checkbox"
                            checked={v.isPreview !== undefined ? !!v.isPreview : (vIndex === 0)}
                            onChange={e => handleVideoFieldChange(vIndex, 'isPreview', e.target.checked)}
                            className="w-4 h-4 rounded text-[#0F172A] accent-brand-forest"
                          />
                          <span className="text-xs font-bold text-[#0F172A] flex items-center gap-1.5">
                            <Icon name="visibility" className="text-sm text-emerald-600" />
                            Allow Free Preview (Accessible to all visitors before course enrollment)
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Automatic Thumbnail Preview & Optional Custom Thumbnail */}
                    {vYtTouched && (
                      vYtValid ? (
                        <div className="pt-3 border-t border-slate-200">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
                            {/* Thumbnail preview card */}
                            <div className="relative w-44 aspect-video rounded-xl overflow-hidden bg-black shadow-sm shrink-0 border border-slate-200 group">
                              <img
                                src={vThumbSrc}
                                alt={`Video ${vIndex + 1} Thumbnail`}
                                onError={(e) => {
                                  if (!v.customThumbnailPreview && e.target.src.includes('maxresdefault.jpg')) {
                                    e.target.src = getYoutubeThumbnailUrl(vYtId, 'hqdefault');
                                  }
                                }}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-red-600/90 text-[#0F172A] flex items-center justify-center shadow-md">
                                  <Icon name="play_arrow" className="text-xl" />
                                </div>
                              </div>
                            </div>

                            {/* Thumbnail Info & Controls */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-extrabold text-[#0F172A]">
                                  {v.customThumbnailFile ? 'Custom Thumbnail Active' : 'Automatic YouTube Thumbnail Active'}
                                </span>
                                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${v.customThumbnailFile
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}>
                                  {v.customThumbnailFile ? '🎨 Custom Thumbnail' : '⚡ Auto-Generated from YouTube'}
                                </span>
                              </div>

                              <p className="text-xs text-[#475569]">
                                {v.customThumbnailFile
                                  ? 'This custom image will be used as the thumbnail for this video across G-Mark Software.'
                                  : 'Extracted automatically from YouTube. No manual image upload is required.'}
                              </p>

                              <div className="flex items-center gap-3 pt-1 flex-wrap">
                                <input
                                  type="file"
                                  id={`video-custom-thumb-${vIndex}`}
                                  accept="image/jpeg,image/png,image/webp,image/gif"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleVideoThumbnailFile(vIndex, file);
                                  }}
                                  className="hidden"
                                />
                                <label
                                  htmlFor={`video-custom-thumb-${vIndex}`}
                                  className="text-xs font-bold text-[#0F172A] hover:text-[#1D4ED8] bg-white border border-slate-200 hover:border-[#2563EB] px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                                >
                                  <Icon name="add_photo_alternate" className="text-sm text-[#0F172A]" />
                                  {v.customThumbnailFile ? 'Change Custom Thumbnail' : 'Upload Custom Thumbnail (Optional)'}
                                </label>

                                {v.customThumbnailFile && (
                                  <button
                                    type="button"
                                    onClick={() => handleClearVideoThumbnail(vIndex)}
                                    className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline flex items-center gap-1 cursor-pointer"
                                  >
                                    <Icon name="close" className="text-sm" /> Revert to YouTube Thumbnail
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold text-red-700">
                          <Icon name="error" className="text-base text-red-600 shrink-0" />
                          <span>Invalid YouTube URL. Please enter a valid YouTube video URL, short link, or Shorts URL.</span>
                        </div>
                      )
                    )}
                  </div>
                );
              })}
            </div>

            {/* Add Another Video Button */}
            <button
              type="button"
              onClick={handleAddAnotherVideo}
              className="w-full py-3.5 rounded-2xl border-2 border-dashed border-brand-forest/30 hover:border-[#2563EB] hover:bg-[#F8FAFC] text-[#0F172A] font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Icon name="add_circle" className="text-lg" /> Add Another Video
            </button>
          </div>

          {/* ── SECTION: VIDEO TASK / ASSIGNMENT (OPTIONAL) ── */}
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-700 text-[#0F172A] flex items-center justify-center text-xs font-black">
                  <Icon name="assignment" className="text-xs" />
                </span>
                <h3 className="text-sm font-extrabold text-[#0F172A] uppercase tracking-wider">
                  Video Task / Assignment (Optional)
                </h3>
              </div>
              <span className="text-[11px] text-[#475569] font-bold">
                {addCourseDraftTasks.length} Queued
              </span>
            </div>
            <p className="text-xs text-[#475569] leading-relaxed">
              Attach question papers (DOCX, PDF, etc.) and instructions for this course video. Tasks will be automatically created when you save this course.
            </p>
            <InlineVideoTasksSection
              mode="draft"
              draftTasks={addCourseDraftTasks}
              onChangeDraftTasks={setAddCourseDraftTasks}
              videoTitle={form.title || 'Course Video Lesson'}
              courseSlug={resolvedCourseSlug}
            />
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setAddCourseDraftTasks([]);
                setForm({
                  title: '',
                  category: 'entrepreneurship',
                  level: 'Beginner',
                  short: '',
                  trending: true,
                });
                setCourseVideos([
                  {
                    id: `v_${Date.now()}`,
                    youtubeUrl: '',
                    title: '',
                    shortDescription: '',
                    customThumbnailFile: null,
                    customThumbnailPreview: '',
                  }
                ]);
              }}
              className="px-6 py-2.5 rounded-xl border border-slate-200 font-bold text-[#475569] hover:bg-slate-100 transition cursor-pointer text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={formUploading}
              className="bg-[#2563EB] text-white px-8 py-2.5 rounded-xl font-extrabold hover:bg-[#1D4ED8] shadow-md flex items-center gap-2 disabled:opacity-50 transition cursor-pointer text-sm"
            >
              {formUploading ? (
                <><Icon name="sync" className="animate-spin text-base" /> Saving Course & Videos...</>
              ) : (
                <><Icon name="check" className="text-base" /> Save Course</>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Courses & Playlists Sections */}
      {courses.length === 0 && playlists.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 p-8 my-4">
          <Icon name={isSubAdmin ? 'assignment_ind' : 'school'} className="text-5xl text-brand-forest/30 mx-auto mb-3" />
          <h3 className="text-lg font-extrabold text-[#0F172A]">
            {isSubAdmin ? 'No Courses or Playlists Yet' : 'No Courses Added Yet'}
          </h3>
          <p className="text-xs sm:text-sm text-[#475569] mt-2 max-w-md mx-auto">
            {isSubAdmin ? (
              <>Courses and playlists assigned to you or created by you will appear here. Use <strong>Add New Course</strong> above to create a course with its embedded video playlist.</>
            ) : (
              <>Use the <strong>Add New Course</strong> button in the top right to create courses and embedded video playlists.</>
            )}
          </p>
        </div>
      ) : (() => {

        const resolveCourseVideo = (c, isPlaylist = false) => {
          if (!c) return { hasVideo: false, title: 'No Video' };

          const pl = getPlaylists(c.slug || c.id) || [];
          const activePl = c.activePlaylist || pl[0];
          const plVideos = Array.isArray(activePl?.videos) && activePl.videos.length > 0
            ? activePl.videos
            : pl.flatMap(p => (Array.isArray(p.videos) ? p.videos : []));

          const directLessons = Array.isArray(c.lessons) ? c.lessons : [];
          const sectionLessons = Array.isArray(c.sections)
            ? c.sections.flatMap(s => (Array.isArray(s?.lessons) ? s.lessons : []))
            : [];
          const courseLessons = directLessons.length > 0 ? directLessons : sectionLessons;

          // Priority list of items to inspect
          const candidates = [];

          if (isPlaylist) {
            // For playlists, prioritize playlist videos
            for (const v of plVideos) {
              if (v) candidates.push({ item: v, source: 'playlist', title: v.title });
            }
            for (const l of courseLessons) {
              if (l) candidates.push({ item: l, source: 'lesson', title: l.title || l.t });
            }
          } else {
            // For single courses, prioritize direct lessons
            for (const l of courseLessons) {
              if (l) candidates.push({ item: l, source: 'lesson', title: l.title || l.t });
            }
            for (const v of plVideos) {
              if (v) candidates.push({ item: v, source: 'playlist', title: v.title });
            }
          }

          // Also check course root object
          candidates.push({ item: c, source: 'course', title: c.videoTitle || safeStr(c.title) });

          let foundYtId = null;
          let foundDirectUrl = null;
          let chosenTitle = '';
          let chosenThumb = null;

          for (const cand of candidates) {
            const it = cand.item;
            if (!it) continue;

            const rawYt = it.youtubeVideoId || it.youtubeUrl || it.youtube || it.url || (typeof it.videoUrl === 'string' && it.videoUrl.includes('youtu') ? it.videoUrl : null);
            const parsedYt = extractYoutubeId(rawYt);

            if (parsedYt) {
              foundYtId = parsedYt;
              chosenTitle = cand.title || it.title || it.t || safeStr(c.title);
              chosenThumb = it.thumbnailUrl || it.thumbnail || it.poster || getYoutubeThumbnailUrl(parsedYt, 'hqdefault');
              break;
            }

            const direct = it.videoUrl || it.file || (typeof it.url === 'string' && !it.url.includes('youtu') ? it.url : null);
            if (direct && typeof direct === 'string' && (direct.startsWith('http') || direct.startsWith('/') || direct.startsWith('blob:'))) {
              if (!foundDirectUrl) {
                foundDirectUrl = direct;
                chosenTitle = cand.title || it.title || it.t || safeStr(c.title);
                chosenThumb = it.thumbnailUrl || it.thumbnail || it.poster || null;
              }
            }
          }

          const courseTitleStr = safeStr(c.title) || safeStr(c.courseName) || 'Course';
          if (!chosenTitle) {
            chosenTitle = isPlaylist ? (activePl?.title || `${courseTitleStr} Playlist`) : courseTitleStr;
          }

          if (!chosenThumb) {
            if (foundYtId) {
              chosenThumb = getYoutubeThumbnailUrl(foundYtId, 'hqdefault');
            } else {
              chosenThumb = (isPlaylist && activePl?.thumbnailUrl) || c.thumbnailUrl || c.image || null;
            }
          }

          const hasVideo = Boolean(foundYtId || foundDirectUrl);
          const videoPlayUrl = foundDirectUrl || (foundYtId ? `https://www.youtube.com/watch?v=${foundYtId}` : null);

          return {
            hasVideo,
            youtubeVideoId: foundYtId,
            videoUrl: videoPlayUrl,
            directVideoUrl: foundDirectUrl,
            title: chosenTitle,
            thumbnailUrl: chosenThumb,
            courseSlug: c.slug || c.id || '',
            courseTitle: courseTitleStr,
            isPlaylist,
            playlistTitle: activePl?.title || null,
            totalVideos: isPlaylist ? (plVideos.length || 1) : Math.max(1, courseLessons.length),
          };
        };

        const handleOpenVideo = (videoData) => {
          if (!videoData || !videoData.hasVideo) {
            setActionNotice('ℹ️ No playable video found for this course yet. Use "Edit Course" or "Edit Playlist" to add a video URL.');
            setTimeout(() => setActionNotice(''), 5000);
            return;
          }
          setPreviewVideo(videoData);
        };

        const renderSingleCourseCard = (c) => {
          const stats = analytics[c.slug] || { views: 0, avgTime: 0 };
          const videoData = resolveCourseVideo(c, false);
          const cardThumb = videoData.thumbnailUrl || c.thumbnailUrl || c.image;
          const courseLearners = getLearnersForCourse(c);
          const courseLearnersCount = courseLearners.length > 0 ? courseLearners.length : (Number(c.learners) || 0);

          return (
            <div key={c._id || c.slug} className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <div className="flex justify-between items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-slate-50 text-[#0F172A] text-xs font-bold">
                    {CATEGORIES.find(x => x.key === c.category)?.[lang === 'mr' ? 'mr' : 'en'] || c.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {videoData.hasVideo ? (
                      <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shadow-2xs">
                        <Icon name="movie" className="text-[13px] text-emerald-700" />
                        <span>Single Video</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-[#475569]">
                        No Video
                      </span>
                    )}
                    {c.trending && <span className="text-xs font-bold text-orange-500">⭐ Home</span>}
                  </div>
                </div>

                {cardThumb ? (
                  <div
                    onClick={() => handleOpenVideo(videoData)}
                    className="w-full h-36 rounded-2xl overflow-hidden mb-3 bg-slate-100 border border-slate-200 relative group shadow-2xs cursor-pointer"
                    title={videoData.hasVideo ? `Click to watch: ${videoData.title}` : `Click to view video`}
                  >
                    <img
                      src={cardThumb}
                      alt={safeStr(c.title)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/10 transition-all">
                      <div className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Icon name="play_arrow" className="text-2xl translate-x-0.5" />
                      </div>
                    </div>
                    {videoData.title && (
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 py-1.5 text-[#0F172A] text-[11px] font-bold truncate flex items-center gap-1.5">
                        <Icon name="movie" className="text-xs text-[#2563EB] shrink-0" />
                        <span className="truncate">{videoData.title}</span>
                      </div>
                    )}
                  </div>
                ) : null}

                <h3 className="font-extrabold text-[#0F172A] text-lg leading-snug">{safeStr(c.title)}</h3>
                <p className="text-sm text-[#475569] mt-1 line-clamp-2">{safeStr(c.short)}</p>

                {videoData.hasVideo && (
                  <div
                    onClick={() => handleOpenVideo(videoData)}
                    className="mt-2.5 p-2 rounded-xl bg-emerald-50/90 border border-emerald-200 flex items-center justify-between gap-2 text-xs cursor-pointer hover:bg-emerald-100/90 transition shadow-2xs"
                    title="Click to play video"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Icon name="check_circle" className="text-emerald-700 text-sm shrink-0" />
                      <span className="text-[#0F172A] truncate font-medium">
                        Video: <strong className="text-emerald-100 font-bold">{videoData.title || 'Lesson Video'}</strong>
                      </span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200 text-emerald-700 shrink-0">
                      Active
                    </span>
                  </div>
                )}

                <p className="text-xs text-[#475569] mt-2 font-medium">
                  {safeStr(c.level)} · 1 Video
                </p>

                <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewingCourseLearners(c)}
                    className="flex items-center gap-1 text-xs text-[#475569] hover:text-[#0F172A] transition cursor-pointer"
                    title="View registered learners for this course"
                  >
                    <Icon name="groups" className="text-[15px] text-[#0F172A]" />
                    <span className="font-bold text-[#0F172A]">{courseLearnersCount}</span>
                    <span className="font-semibold underline decoration-dotted">{courseLearnersCount === 1 ? 'Learner' : 'Learners'}</span>
                  </button>
                  <div className="flex items-center gap-1 text-xs text-[#475569]">
                    <Icon name="visibility" className="text-[15px] text-[#0F172A]" />
                    <span className="font-bold text-[#0F172A]">{stats.views}</span> {t('admin.lmsReports.stats.views', 'views')}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#475569]">
                    <Icon name="schedule" className="text-[15px] text-teal-600" />
                    <span className="font-bold text-teal-600">{fmtSec(stats.avgTime)}</span> avg
                  </div>
                </div>
              </div>

              {/* Distinct Course Functions - Single Video Courses */}
              <div className="mt-5 pt-3 border-t border-slate-200 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenVideo(videoData)}
                    className={`w-full rounded-xl py-2.5 text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${videoData.hasVideo
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-[#0F172A]'
                        : 'bg-slate-100 text-[#475569] hover:bg-slate-200'
                      }`}
                    title="Watch / preview course video"
                  >
                    <Icon name="play_circle" className="text-[18px]" /> Watch Video
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingCourse(c)}
                    className="w-full bg-[#2563EB] text-white hover:bg-[#1D4ED8] rounded-xl py-2.5 text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    title="Edit this single video course (details, video, material, assessments)"
                  >
                    <Icon name="edit" className="text-[17px]" /> Edit Course
                  </button>
                </div>
                {isSubAdmin && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingCourseLearners(c)}
                      className="w-full bg-slate-50 text-[#0F172A] border border-blue-200 hover:bg-blue-50 rounded-xl py-2 text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      title="View sub-views breakdown and registered learners"
                    >
                      <Icon name="analytics" className="text-base text-[#0F172A]" />
                      <span>📊 View Sub-Views & Learners</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSection && setSection('tasks')}
                      className="w-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-500/25 rounded-xl py-2 text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      title="View student tasks & submissions"
                    >
                      <Icon name="assignment" className="text-base text-amber-700" />
                      <span>Tasks</span>
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => deleteCourse(c._id || c.slug)}
                  className="w-full text-red-600 border border-red-200 hover:border-red-300 rounded-xl py-2 text-xs font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Icon name="delete" className="text-[14px]" /> {t('admin.common.delete', 'Delete Course')}
                </button>
              </div>
            </div>
          );
        };

        const renderPlaylistCard = (pl) => {
          const plVideos = Array.isArray(pl.videos) ? pl.videos : [];
          const videoCount = pl.videoCount !== undefined ? pl.videoCount : plVideos.length;
          const plLearners = getLearnersForPlaylist(pl);
          const plLearnersCount = plLearners.length;
          const firstVid = plVideos[0];
          const cardThumb =
            pl.thumbnailUrl ||
            firstVid?.thumbnailUrl ||
            (firstVid?.youtubeVideoId
              ? getYoutubeThumbnailUrl(firstVid.youtubeVideoId, 'hqdefault')
              : null);
          const playlistTitle = pl.title || 'Untitled Playlist';
          const parentCourse = courses.find(
            (c) =>
              (c.id && (c.id === pl.courseId || c._id === pl.courseId)) ||
              (c.slug && c.slug === pl.courseSlug),
          );

          const videoData = {
            hasVideo: Boolean(firstVid?.youtubeUrl || firstVid?.youtubeVideoId),
            title: firstVid?.title || playlistTitle,
            youtubeUrl:
              firstVid?.youtubeUrl ||
              (firstVid?.youtubeVideoId
                ? `https://www.youtube.com/watch?v=${firstVid.youtubeVideoId}`
                : ''),
            isPlaylist: true,
            courseTitle: playlistTitle,
            totalVideos: videoCount,
          };

          return (
            <div key={`playlist-${pl.id}`} className="bg-white border border-slate-200 rounded-3xl p-5 flex flex-col justify-between hover:shadow-lg transition-all">
              <div>
                <div className="flex justify-between items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-full bg-slate-50 text-[#0F172A] text-xs font-bold truncate max-w-[170px]" title={parentCourse ? safeStr(parentCourse.title) : (pl.courseName || 'Standalone Playlist')}>
                    {parentCourse ? `Course: ${safeStr(parentCourse.title)}` : (pl.courseName ? `Course: ${pl.courseName}` : 'Standalone Playlist')}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#E6F4EA] text-[#15803D] border border-emerald-200 flex items-center gap-1 shadow-2xs">
                      <Icon name="playlist_play" className="text-[14px] text-[#15803D]" />
                      <span>Playlist · {videoCount} {videoCount === 1 ? 'Video' : 'Videos'}</span>
                    </span>
                    {pl.isTrending && (
                      <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                        ⭐ Trending
                      </span>
                    )}
                  </div>
                </div>

                {cardThumb ? (
                  <div
                    onClick={() => handleOpenVideo(videoData)}
                    className="w-full h-36 rounded-2xl overflow-hidden mb-3 bg-slate-100 border border-slate-200 relative group shadow-2xs cursor-pointer"
                    title={videoData.hasVideo ? `Click to watch: ${videoData.title}` : `Click to view video`}
                  >
                    <img
                      src={cardThumb}
                      alt={playlistTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                    <div className="absolute inset-0 bg-black/25 flex items-center justify-center group-hover:bg-black/10 transition-all">
                      <div className="w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                        <Icon name="play_arrow" className="text-2xl translate-x-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent px-3 py-1.5 text-[#0F172A] text-[11px] font-bold truncate flex items-center gap-1.5">
                      <Icon name="playlist_play" className="text-xs text-[#2563EB] shrink-0" />
                      <span className="truncate">{videoData.title ? `Playing: ${videoData.title}` : playlistTitle}</span>
                    </div>
                  </div>
                ) : null}

                <h3 className="font-extrabold text-[#0F172A] text-lg leading-snug">{playlistTitle}</h3>
                <p className="text-xs font-bold text-[#475569] mt-0.5 truncate">
                  {parentCourse ? (
                    <>Under Course: <span className="text-[#0F172A] underline">{safeStr(parentCourse.title)}</span></>
                  ) : (
                    <span className="text-emerald-700 font-semibold">{pl.courseName ? `Under Course: ${pl.courseName}` : 'Standalone Playlist'}</span>
                  )}
                </p>
                <p className="text-sm text-[#475569] mt-1 line-clamp-2">{pl.description || (parentCourse ? safeStr(parentCourse.short) : '')}</p>

                {videoData.hasVideo && (
                  <div
                    onClick={() => handleOpenVideo(videoData)}
                    className="mt-2.5 p-2 rounded-xl bg-[#E6F4EA]/90 border border-emerald-200 flex items-center justify-between gap-2 text-xs cursor-pointer hover:bg-[#DCFCE7]/90 transition shadow-2xs"
                    title="Click to play playlist video"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Icon name="check_circle" className="text-[#15803D] text-sm shrink-0" />
                      <span className="text-[#0F172A] truncate font-medium">
                        Video: <strong className="text-emerald-100 font-bold">{videoData.title || 'Playlist Video'}</strong>
                      </span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-[#DCFCE7] text-[#15803D] shrink-0">
                      Active
                    </span>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setViewingCourseLearners(pl)}
                    className="flex items-center gap-1 text-xs text-[#475569] hover:text-[#0F172A] transition cursor-pointer"
                    title="View registered learners for this playlist"
                  >
                    <Icon name="groups" className="text-[15px] text-[#0F172A]" />
                    <span className="font-bold text-[#0F172A]">{plLearnersCount}</span>
                    <span className="font-semibold underline decoration-dotted">{plLearnersCount === 1 ? 'Learner' : 'Learners'}</span>
                  </button>
                  <p className="text-xs text-[#475569] font-medium">
                    Structured Playlist · {videoCount} {videoCount === 1 ? 'Video' : 'Videos'}
                  </p>
                </div>
              </div>

              {/* Distinct Playlist Functions */}
              <div className="mt-5 pt-3 border-t border-slate-200 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenVideo(videoData)}
                    className={`w-full rounded-xl py-2.5 text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${videoData.hasVideo
                        ? 'bg-[#16A34A] hover:bg-[#15803D] text-white'
                        : 'bg-slate-100 text-[#475569] hover:bg-slate-200'
                      }`}
                    title="Watch / preview playlist video"
                  >
                    <Icon name="play_circle" className="text-[18px]" /> Watch Video
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPlaylist(pl);
                      setEditingPlaylistCourse(parentCourse || { id: pl.courseId, slug: pl.courseSlug, title: pl.courseName || pl.title });
                    }}
                    className="w-full bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-xl py-2.5 text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                    title="Edit playlist title, description, and manage playlist videos"
                  >
                    <Icon name="playlist_add_check" className="text-[18px]" /> Edit Playlist
                  </button>
                </div>
                {isSubAdmin && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setViewingCourseLearners(pl)}
                      className="w-full bg-slate-50 text-[#0F172A] border border-blue-200 hover:bg-blue-50 rounded-xl py-2 text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      title="View sub-views breakdown and registered learners"
                    >
                      <Icon name="analytics" className="text-base text-[#0F172A]" />
                      <span>📊 View Sub-Views & Learners</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSection && setSection('tasks')}
                      className="w-full bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-500/25 rounded-xl py-2 text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      title="View student tasks & submissions"
                    >
                      <Icon name="assignment" className="text-base text-amber-700" />
                      <span>Tasks</span>
                    </button>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {parentCourse && (
                    <button
                      type="button"
                      onClick={() => setSelectedCourseForPlaylists(parentCourse)}
                      className="w-full bg-[#E6F4EA] text-[#15803D] border border-emerald-200 hover:bg-[#DCFCE7] rounded-xl py-2 text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      title="View all playlists under this course"
                    >
                      <Icon name="playlist_play" className="text-[17px] text-[#15803D]" /> Playlists
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => deletePlaylist(pl.id, playlistTitle)}
                    className={`w-full text-red-600 border border-red-200 hover:border-red-300 rounded-xl py-2 text-xs font-bold hover:bg-red-50 transition-all flex items-center justify-center gap-1 cursor-pointer ${!parentCourse ? 'col-span-2' : ''}`}
                  >
                    <Icon name="delete" className="text-[14px]" /> {t('admin.common.delete', 'Delete')}
                  </button>
                </div>
              </div>
            </div>
          );
        };

        return (
          <div className="space-y-8">
            {/* Section Filter Tabs */}
            {(!isSubAdmin || hasMultipleContentTypes) && (
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setCourseSectionFilter('all')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${courseSectionFilter === 'all'
                        ? 'bg-white text-[#0F172A] shadow-xs'
                        : 'text-[#475569] hover:text-[#0F172A]'
                      }`}
                  >
                    🗂️ All Items ({singleVideoCourses.length + playlists.length})
                  </button>
                  {singleVideoCourses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCourseSectionFilter('single')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${courseSectionFilter === 'single'
                          ? 'bg-white text-[#0F172A] shadow-xs'
                          : 'text-[#475569] hover:text-[#0F172A]'
                        }`}
                    >
                      <Icon name="movie" className="text-sm text-emerald-600" />
                      <span>Single Video Courses ({singleVideoCourses.length})</span>
                    </button>
                  )}
                  {playlists.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCourseSectionFilter('playlist')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${courseSectionFilter === 'playlist'
                          ? 'bg-white text-[#0F172A] shadow-xs'
                          : 'text-[#475569] hover:text-[#0F172A]'
                        }`}
                    >
                      <Icon name="playlist_play" className="text-base text-[#16A34A]" />
                      <span>Video Playlists ({playlists.length})</span>
                    </button>
                  )}
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-[#475569] px-2">
                  {singleVideoCourses.length > 0 && (
                    <>
                      <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Single Video Courses</span>
                    </>
                  )}
                  {singleVideoCourses.length > 0 && playlists.length > 0 && (
                    <span className="text-[#475569]">|</span>
                  )}
                  {playlists.length > 0 && (
                    <>
                      <span className="inline-block w-2 h-2 rounded-full bg-[#16A34A]"></span>
                      <span>Video Playlists</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── SECTION 1: SINGLE VIDEO COURSES ── */}
            {(courseSectionFilter === 'single' || courseSectionFilter === 'all') && (
              <section className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-2xs">
                      <Icon name="movie" className="text-xl" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-[#0F172A] flex items-center gap-2">
                        Single Video Courses
                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {singleVideoCourses.length} {singleVideoCourses.length === 1 ? 'Course' : 'Courses'}
                        </span>
                      </h2>
                    </div>
                  </div>
                </div>

                {singleVideoCourses.length === 0 ? (
                  <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/60 p-6">
                    <Icon name="movie" className="text-4xl text-[#475569] mx-auto mb-2" />
                    <p className="text-sm font-bold text-[#0F172A]">
                      No Single Video Courses Yet
                    </p>
                    <p className="text-xs text-[#475569] mt-1">
                      Use "Add New Course" above to create a single video course.
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {singleVideoCourses.map(renderSingleCourseCard)}
                  </div>
                )}
              </section>
            )}

            {/* ── SECTION 2: VIDEO PLAYLISTS ── */}
            {(courseSectionFilter === 'playlist' || courseSectionFilter === 'all') && (
              <section className="bg-slate-50 border border-slate-200 rounded-3xl p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#E6F4EA] text-[#115E3B] flex items-center justify-center shadow-2xs">
                      <Icon name="playlist_play" className="text-2xl text-[#115E3B]" />
                    </div>
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-[#0F172A] flex items-center gap-2">
                        Video Playlists
                        <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#DCFCE7] text-[#15803D] border border-emerald-200">
                          {playlists.length} {playlists.length === 1 ? 'Playlist' : 'Playlists'}
                        </span>
                      </h2>
                    </div>
                  </div>
                </div>

                {playlists.length === 0 ? (
                  <div className="py-10 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white/60 p-6">
                    <Icon name="playlist_play" className="text-4xl text-emerald-700 mx-auto mb-2" />
                    <p className="text-sm font-bold text-[#0F172A]">
                      No Video Playlists Yet
                    </p>
                    <p className="text-xs text-[#475569] mt-1">
                      Create and link a video playlist inside "Add New Course" or "Edit Course".
                    </p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {playlists.map(renderPlaylistCard)}
                  </div>
                )}
              </section>
            )}
          </div>
        );
      })()}

      {/* ── EXCEL IMPORT MODAL ── */}
      {importModalOpen && (
        <ImportCoursesModal
          api={api}
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onSuccess={async (count) => {
            await loadCourses();
            setActionNotice(`✓ ${count} courses imported successfully from Excel into PostgreSQL.`);
          }}
          onDownloadTemplate={handleDownloadTemplate}
          downloadingTemplate={downloadingTemplate}
        />
      )}

      {/* ── EDIT PLAYLIST MODAL ── */}
      {(editingPlaylist || editingPlaylistCourse) && (
        <EditPlaylistModal
          isOpen={Boolean(editingPlaylist || editingPlaylistCourse)}
          onClose={() => {
            setEditingPlaylist(null);
            setEditingPlaylistCourse(null);
          }}
          playlist={editingPlaylist}
          course={editingPlaylistCourse}
          api={api}
          onSuccess={(saved) => {
            const plTitle = saved?.title || 'Playlist';
            if (saved && saved.id) {
              setPlaylists((prev) => prev.map((p) => (p.id === saved.id ? { ...p, ...saved } : p)));
            }
            setActionNotice(`✓ Playlist "${plTitle}" updated successfully!`);
            setTimeout(() => setActionNotice(''), 6000);
            loadCourses();
          }}
        />
      )}

      {/* ── VIDEO PREVIEW MODAL ── */}
      {previewVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setPreviewVideo(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative border border-slate-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                  <Icon name={previewVideo.isPlaylist ? "playlist_play" : "movie"} className="text-white text-xl" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-sm sm:text-base text-white truncate leading-tight">
                    {previewVideo.title}
                  </h3>
                  <p className="text-[11px] text-blue-100 truncate mt-0.5">
                    {previewVideo.isPlaylist ? `Playlist: ${previewVideo.playlistTitle || previewVideo.courseTitle}` : `Course: ${previewVideo.courseTitle}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white cursor-pointer transition shrink-0"
                title="Close"
              >
                <Icon name="close" className="text-xl" />
              </button>
            </div>

            {/* Video Viewport */}
            <div className="aspect-video w-full bg-black relative flex items-center justify-center">
              {previewVideo.youtubeVideoId ? (
                <iframe
                  src={getYoutubeEmbedUrl(previewVideo.youtubeVideoId, true) || `https://www.youtube.com/embed/${previewVideo.youtubeVideoId}?autoplay=1&enablejsapi=1&rel=0&modestbranding=1&playsinline=1`}
                  title={previewVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : previewVideo.directVideoUrl ? (
                <video
                  src={previewVideo.directVideoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                >
                  Your browser does not support HTML5 video streaming.
                </video>
              ) : (
                <div className="p-8 text-center text-[#0F172A]">
                  <Icon name="videocam_off" className="text-5xl text-[#475569] mx-auto mb-2" />
                  <p className="text-sm font-bold">Video stream unavailable</p>
                  <p className="text-xs text-[#475569] mt-1">No supported video source found.</p>
                </div>
              )}
            </div>

            {/* Modal Footer Controls & Fail-Safe Links */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex flex-wrap items-center gap-2">
                {previewVideo.youtubeVideoId && (
                  <a
                    href={`https://www.youtube.com/watch?v=${previewVideo.youtubeVideoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-700 hover:bg-red-50 border border-red-200 font-bold transition"
                    title="Open on YouTube in new tab"
                  >
                    <Icon name="open_in_new" className="text-sm text-red-600" />
                    <span>Watch on YouTube</span>
                  </a>
                )}
                {previewVideo.courseSlug && (
                  <a
                    href={`/courses/${previewVideo.courseSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-[#0F172A] hover:bg-slate-100 border border-blue-200 font-bold transition"
                    title="Open learner course player view"
                  >
                    <Icon name="school" className="text-sm text-[#0F172A]" />
                    <span>Open in Course Player</span>
                  </a>
                )}
                {previewVideo.youtubeVideoId && (
                  <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] text-[#475569] bg-gray-200/80 px-2.5 py-1 rounded-lg">
                    ID: {previewVideo.youtubeVideoId}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 text-[#0F172A] hover:bg-slate-300 font-extrabold transition cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COURSE SUB-VIEWS & LEARNERS MODAL ── */}
      {viewingCourseLearners && (
        <CourseViewsAndLearnersModal
          course={viewingCourseLearners}
          api={api}
          isSubAdmin={isSubAdmin}
          onClose={() => setViewingCourseLearners(null)}
          onSelectUser={(u) => setSelectedUserForActivity(u)}
          onOpenInUsersTab={() => {
            const cSlug = viewingCourseLearners.slug || viewingCourseLearners.courseSlug || 'all';
            setViewingCourseLearners(null);
            if (onNavigateToLearners) onNavigateToLearners(cSlug);
          }}
        />
      )}

      {/* ── USER ACTIVITY DASHBOARD (IN-APP MODAL OVERLAY) ── */}
      {selectedUserForActivity && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl border border-slate-200 max-h-[94vh] flex flex-col overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
                  <Icon name="account_circle" className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Learner Activity: {selectedUserForActivity.fullName || selectedUserForActivity.email}
                  </h3>
                  <p className="text-xs text-blue-100">
                    Detailed video progress, completions, and submissions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserForActivity(null)}
                className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
                title="Close"
              >
                <Icon name="close" className="text-xl" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8FAFC]">
              <AdminUserActivityDashboard
                user={selectedUserForActivity}
                api={api}
                isSubAdmin={isSubAdmin}
                onBack={() => setSelectedUserForActivity(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EditCourseModal({ course, onClose, onSave, api }) {
  const [activeTab, setActiveTab] = useState('content');
  const [courseName, setCourseName] = useState(typeof course.title === 'string' ? course.title : course.title?.en || course.courseName || '');
  const [category, setCategory] = useState(course.category || 'entrepreneurship');
  const [level, setLevel] = useState(typeof course.level === 'string' ? course.level : course.level?.en || 'Beginner');
  const [shortDescription, setShortDescription] = useState(typeof course.short === 'string' ? course.short : course.short?.en || course.shortDescription || '');
  const [trending, setTrending] = useState(!!course.trending);
  const [price, setPrice] = useState(course.price !== undefined && course.price !== null ? course.price : 0);
  const [validityDays, setValidityDays] = useState(course.validityDays || 365);
  const [status, setStatus] = useState(course.status || 'Active');
  const [gradient, setGradient] = useState(course.gradient || 'from-[#1E3A8A] via-[#0F172A] to-slate-50');
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnailUrl || course.image || '');

  // Learning Outcomes
  const [learnList, setLearnList] = useState(() => {
    if (Array.isArray(course.learn)) return course.learn;
    if (typeof course.learn === 'string' && course.learn.trim()) return course.learn.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
    return ['Hands-on practical skills', 'Real-world examples & step-by-step tutorial'];
  });
  const [newLearnInput, setNewLearnInput] = useState('');

  // Requirements
  const [reqList, setReqList] = useState(() => {
    if (Array.isArray(course.requirements)) return course.requirements;
    if (typeof course.requirements === 'string' && course.requirements.trim()) return course.requirements.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
    return ['Basic understanding of smartphone / computer'];
  });
  const [newReqInput, setNewReqInput] = useState('');

  // Course Description
  const [description, setDescription] = useState(course.description || shortDescription);

  // Sections and Lessons
  const [sections, setSections] = useState(() => {
    if (Array.isArray(course.sections) && course.sections.length > 0) {
      return course.sections.map((s, idx) => ({
        id: s.id || `sec-${idx + 1}`,
        title: typeof s === 'string' ? s : (s.title || s.name || `Section ${idx + 1}`),
        displayOrder: idx + 1,
      }));
    }
    // derive from existing lessons if present
    if (Array.isArray(course.lessons) && course.lessons.length > 0) {
      const distinct = Array.from(new Set(course.lessons.map(l => l.section || l.chapter).filter(Boolean)));
      if (distinct.length > 0) {
        return distinct.map((title, idx) => ({ id: `sec-${idx + 1}`, title, displayOrder: idx + 1 }));
      }
    }
    return [
      { id: 'sec-1', title: 'Section 1 — Introduction & Setup', displayOrder: 1 },
      { id: 'sec-2', title: 'Section 2 — Core Concepts & Fundamentals', displayOrder: 2 },
    ];
  });

  const [lessons, setLessons] = useState(() => {
    if (Array.isArray(course.lessons) && course.lessons.length > 0) {
      return course.lessons.map((l, idx) => ({
        id: l.id || `lesson-${idx + 1}`,
        title: l.t || l.title || `Lesson ${idx + 1}`,
        section: l.section || (sections[0]?.title || 'Section 1 — Introduction & Setup'),
        youtubeUrl: l.youtube || l.youtubeUrl || (l.youtubeVideoId ? `https://www.youtube.com/watch?v=${l.youtubeVideoId}` : ''),
        youtubeVideoId: l.youtubeVideoId || extractYoutubeId(l.youtube || l.youtubeUrl) || '',
        duration: l.duration || (l.min ? `${l.min}:00` : '10:00'),
        durationMinutes: Number(l.min) || 10,
        isFreePreview: l.isPreview !== undefined ? !!l.isPreview : (idx === 0),
        notesName: l.notesName || (l.notesUrl ? 'Lesson Notes.pdf' : null),
        notesUrl: l.notesUrl || null,
        thumbnail: l.thumbnail || l.thumbnailUrl || (l.youtubeVideoId ? `https://img.youtube.com/vi/${l.youtubeVideoId}/hqdefault.jpg` : null),
      }));
    }
    // Default initial lesson if course has a main youtube video
    if (course.youtubeVideoId || course.youtubeUrl) {
      const yt = course.youtubeVideoId || extractYoutubeId(course.youtubeUrl);
      return [
        {
          id: 'lesson-1',
          title: '1. Introduction & Overview',
          section: 'Section 1 — Introduction & Setup',
          youtubeUrl: course.youtubeUrl || `https://www.youtube.com/watch?v=${yt}`,
          youtubeVideoId: yt,
          duration: '10:00',
          durationMinutes: 10,
          isFreePreview: true,
          thumbnail: yt ? `https://img.youtube.com/vi/${yt}/hqdefault.jpg` : null,
        }
      ];
    }
    return [];
  });

  const [expandedSections, setExpandedSections] = useState({ 'sec-1': true, 'sec-2': true, 'sec-3': true });
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);

  // Lesson Form State
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [formSection, setFormSection] = useState(sections[0]?.title || '');
  const [formTitle, setFormTitle] = useState('');
  const [formVideoType, setFormVideoType] = useState('youtube');
  const [formYoutubeUrl, setFormYoutubeUrl] = useState('');
  const [formDuration, setFormDuration] = useState('10:00');
  const [formIsPreview, setFormIsPreview] = useState(false);
  const [formNotesFile, setFormNotesFile] = useState(null);
  const [formNotesName, setFormNotesName] = useState('');
  const [formNotesUrl, setFormNotesUrl] = useState('');
  const [uploadingNotes, setUploadingNotes] = useState(false);
  const [activeLessonMenu, setActiveLessonMenu] = useState(null);

  const [saving, setSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Keep formSection updated if sections change
  useEffect(() => {
    if (!formSection && sections.length > 0) {
      setFormSection(sections[0].title);
    }
  }, [sections, formSection]);

  const formYtId = extractYoutubeId(formYoutubeUrl);
  const formYtValid = !!formYtId;

  // Toggle Section Expand
  const toggleSection = (sId) => {
    setExpandedSections(prev => ({ ...prev, [sId]: !prev[sId] }));
  };

  // Add New Section
  const handleAddSection = () => {
    const trimmed = newSectionName.trim();
    if (!trimmed) {
      alert('Please enter a section name.');
      return;
    }
    const newSec = {
      id: `sec-${Date.now()}`,
      title: trimmed,
      displayOrder: sections.length + 1,
    };
    setSections(prev => [...prev, newSec]);
    setExpandedSections(prev => ({ ...prev, [newSec.id]: true }));
    setFormSection(trimmed);
    setNewSectionName('');
    setShowAddSectionModal(false);
  };

  // Rename Section
  const handleSaveRenameSection = (sId) => {
    const trimmed = editingSectionTitle.trim();
    if (!trimmed) return;
    const oldTitle = sections.find(s => s.id === sId)?.title;
    setSections(prev => prev.map(s => s.id === sId ? { ...s, title: trimmed } : s));
    if (oldTitle) {
      setLessons(prev => prev.map(l => l.section === oldTitle ? { ...l, section: trimmed } : l));
      if (formSection === oldTitle) setFormSection(trimmed);
    }
    setEditingSectionId(null);
    setEditingSectionTitle('');
  };

  // Delete Section
  const handleDeleteSection = (sId) => {
    const target = sections.find(s => s.id === sId);
    if (!target) return;
    if (!confirm(`Delete section "${target.title}"? All lessons inside this section will also be removed.`)) return;
    setSections(prev => prev.filter(s => s.id !== sId));
    setLessons(prev => prev.filter(l => l.section !== target.title));
  };

  // Move Section Up/Down
  const handleMoveSection = (idx, dir) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const next = [...sections];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setSections(next.map((s, i) => ({ ...s, displayOrder: i + 1 })));
  };

  // Handle Edit Lesson Click
  const handleStartEditLesson = (lesson) => {
    setEditingLessonId(lesson.id);
    setFormSection(lesson.section || sections[0]?.title || '');
    setFormTitle(lesson.title || '');
    setFormYoutubeUrl(lesson.youtubeUrl || '');
    setFormDuration(lesson.duration || '10:00');
    setFormIsPreview(!!lesson.isFreePreview);
    setFormNotesName(lesson.notesName || '');
    setFormNotesUrl(lesson.notesUrl || '');
    setFormNotesFile(null);
    setActiveLessonMenu(null);
  };

  // Cancel Editing Lesson
  const handleCancelLessonForm = () => {
    setEditingLessonId(null);
    setFormTitle('');
    setFormYoutubeUrl('');
    setFormDuration('10:00');
    setFormIsPreview(false);
    setFormNotesFile(null);
    setFormNotesName('');
    setFormNotesUrl('');
  };

  // Handle Notes Upload
  const handleUploadNotes = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = /\.(pdf|doc|docx)$/i.test(file.name);
    if (!allowed) {
      alert('Please upload a PDF, DOC, or DOCX document.');
      return;
    }
    setUploadingNotes(true);
    try {
      const client = api || adminApi(getToken());
      if (client?.uploadCourseNote) {
        const res = await client.uploadCourseNote(file);
        setFormNotesUrl(res.url || res.file || '');
        setFormNotesName(file.name);
      } else {
        setFormNotesName(file.name);
        setFormNotesUrl(URL.createObjectURL(file));
      }
    } catch (err) {
      setFormNotesName(file.name);
    } finally {
      setUploadingNotes(false);
    }
  };

  // Save Lesson Form (Add or Update)
  const handleSaveLessonForm = (e) => {
    e.preventDefault();
    const trimmedTitle = formTitle.trim();
    if (!trimmedTitle) {
      alert('Please enter a lesson title.');
      return;
    }
    const sec = formSection || sections[0]?.title || 'Section 1 — Introduction & Setup';
    const ytId = extractYoutubeId(formYoutubeUrl);
    const thumb = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

    let durationMins = 10;
    if (formDuration.includes(':')) {
      const parts = formDuration.split(':');
      durationMins = Math.max(1, Math.round(Number(parts[0]) + (Number(parts[1]) || 0) / 60));
    } else {
      durationMins = Number(formDuration) || 10;
    }

    if (editingLessonId) {
      // Update existing
      setLessons(prev => prev.map(l => l.id === editingLessonId ? {
        ...l,
        title: trimmedTitle,
        section: sec,
        youtubeUrl: formYoutubeUrl.trim(),
        youtubeVideoId: ytId || '',
        duration: formDuration.trim() || `${durationMins}:00`,
        durationMinutes: durationMins,
        isFreePreview: formIsPreview,
        notesName: formNotesName || null,
        notesUrl: formNotesUrl || null,
        thumbnail: thumb || l.thumbnail,
      } : l));
    } else {
      // Add new
      const newLesson = {
        id: `lesson-${Date.now()}`,
        title: trimmedTitle,
        section: sec,
        youtubeUrl: formYoutubeUrl.trim(),
        youtubeVideoId: ytId || '',
        duration: formDuration.trim() || `${durationMins}:00`,
        durationMinutes: durationMins,
        isFreePreview: formIsPreview,
        notesName: formNotesName || null,
        notesUrl: formNotesUrl || null,
        thumbnail: thumb,
      };
      setLessons(prev => [...prev, newLesson]);
    }

    handleCancelLessonForm();
  };

  // Delete Lesson
  const handleDeleteLesson = (lessonId) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    setLessons(prev => prev.filter(l => l.id !== lessonId));
    setActiveLessonMenu(null);
    if (editingLessonId === lessonId) handleCancelLessonForm();
  };

  // Move Lesson Up/Down within section
  const handleMoveLesson = (lessonId, dir) => {
    const idx = lessons.findIndex(l => l.id === lessonId);
    if (idx === -1) return;
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= lessons.length) return;
    const next = [...lessons];
    const temp = next[idx];
    next[idx] = next[targetIdx];
    next[targetIdx] = temp;
    setLessons(next);
    setActiveLessonMenu(null);
  };

  // Total duration formatted
  const totalDurationMinutes = lessons.reduce((acc, l) => acc + (Number(l.durationMinutes) || 10), 0);
  const totalHours = Math.floor(totalDurationMinutes / 60);
  const remMinutes = totalDurationMinutes % 60;
  const totalDurationFormatted = totalHours > 0 ? `${totalHours}h ${remMinutes}m` : `${remMinutes}m`;

  // Submit All Course Changes
  const handleSaveAll = async () => {
    if (!courseName.trim()) {
      alert('Course title is required.');
      setActiveTab('basic');
      return;
    }

    setSaving(true);
    setSaveSuccessMsg('');
    try {
      // format lessons for backend
      const formattedLessons = lessons.map((l, idx) => ({
        t: l.title,
        title: l.title,
        section: l.section,
        min: Number(l.durationMinutes) || 10,
        duration: l.duration || `${l.durationMinutes || 10}:00`,
        isPreview: !!l.isFreePreview,
        isFreePreview: !!l.isFreePreview,
        youtube: l.youtubeUrl || '',
        youtubeUrl: l.youtubeUrl || '',
        youtubeVideoId: l.youtubeVideoId || '',
        thumbnail: l.thumbnail || (l.youtubeVideoId ? `https://img.youtube.com/vi/${l.youtubeVideoId}/hqdefault.jpg` : null),
        thumbnailUrl: l.thumbnail || (l.youtubeVideoId ? `https://img.youtube.com/vi/${l.youtubeVideoId}/hqdefault.jpg` : null),
        notesName: l.notesName || null,
        notesUrl: l.notesUrl || null,
      }));

      // Synchronize primary course video
      const firstYt = formattedLessons.find(l => l.youtubeVideoId);
      const primaryYoutubeUrl = firstYt ? firstYt.youtubeUrl : (course.youtubeUrl || '');
      const primaryYoutubeVideoId = firstYt ? firstYt.youtubeVideoId : (course.youtubeVideoId || '');
      const primaryThumbnail = thumbnailUrl || (firstYt ? firstYt.thumbnail : null) || course.image || null;

      const payload = {
        courseName: courseName.trim(),
        category,
        level,
        shortDescription: shortDescription.trim(),
        description: (description || '').trim(),
        trending,
        price: Number(price) || 0,
        isFree: Number(price) === 0,
        validityDays: Number(validityDays) || 365,
        status,
        gradient,
        thumbnailUrl: primaryThumbnail,
        youtubeUrl: primaryYoutubeUrl,
        youtubeVideoId: primaryYoutubeVideoId,
        sections: sections.map(s => s.title),
        lessons: formattedLessons,
        learn: learnList,
        requirements: reqList,
      };

      const identifier = course.id || course.slug || course._id;
      const client = api || adminApi(getToken());
      if (identifier && client?.updateCourse) {
        await client.updateCourse(identifier, payload);
      }

      const updated = {
        ...course,
        ...payload,
        title: { en: courseName.trim(), mr: course.title?.mr || courseName.trim() },
        short: { en: shortDescription.trim(), mr: course.short?.mr || shortDescription.trim() },
        level: { en: level, mr: course.level?.mr || level },
      };

      onSave(updated);
      setSaveSuccessMsg('All course changes saved successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err) {
      alert('Failed to save course: ' + (err.message || 'Server error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8FAF9] flex flex-col overflow-hidden animate-in fade-in duration-150">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition cursor-pointer"
            title="Back to Courses"
          >
            <Icon name="arrow_back" className="text-lg" />
          </button>
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#475569] font-medium">
              <span onClick={onClose} className="hover:underline cursor-pointer">Courses</span>
              <span>&gt;</span>
              <span className="text-[#0F172A] font-bold">Edit Course</span>
            </div>
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight leading-tight">Edit Course</h1>
            <p className="text-xs text-[#475569]">Manage your course content, sections, lessons, and settings</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccessMsg && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl flex items-center gap-1 animate-in fade-in">
              <Icon name="check_circle" className="text-sm" /> {saveSuccessMsg}
            </span>
          )}
          <button
            type="button"
            onClick={() => window.open(`/courses/${course.slug || ''}?preview=true`, '_blank')}
            className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-[#0F172A] bg-white hover:bg-slate-100 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Icon name="visibility" className="text-base text-[#475569]" /> Preview Course
          </button>
          <button
            type="button"
            onClick={() => window.open(`/courses/${course.slug || ''}`, '_blank')}
            className="px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-bold text-[#0F172A] bg-white hover:bg-slate-100 flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Icon name="open_in_new" className="text-base text-[#475569]" /> View on Website
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-xs font-black text-white bg-[#2563EB] hover:bg-[#1D4ED8] flex items-center gap-1.5 shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <><Icon name="sync" className="animate-spin text-base" /> Saving...</>
            ) : (
              <><Icon name="save" className="text-base" /> Save Changes</>
            )}
          </button>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 flex items-center justify-center transition cursor-pointer ml-1"
          >
            <Icon name="close" className="text-xl" />
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 shadow-xs">
        {[
          { id: 'basic', label: 'Basic Information' },
          { id: 'content', label: 'Course Content' },
          { id: 'price', label: 'Price & Access' },
          { id: 'learn', label: "What You'll Learn" },
          { id: 'requirements', label: 'Requirements' },
          { id: 'description', label: 'Description' },
          { id: 'thumbnail', label: 'Thumbnail' },
          { id: 'settings', label: 'More Settings' },
        ].map(t => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${isActive
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-100'
                }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#F8FAF9]">
        {/* ======================================================== */}
        {/* TAB 1: COURSE CONTENT (MATCHING SCREENSHOT) */}
        {/* ======================================================== */}
        {activeTab === 'content' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto items-start">
            {/* Left Column: Sections & Lessons List */}
            <div className="lg:col-span-6 xl:col-span-6 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                  <div>
                    <h2 className="text-lg font-black text-[#0F172A]">Course Content</h2>
                    <p className="text-xs text-[#475569]">Create sections and add lessons/videos to build your course curriculum.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddSectionModal(true)}
                      className="px-3 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-500/25 flex items-center gap-1 transition cursor-pointer"
                    >
                      <Icon name="add" className="text-sm font-bold" /> Add Section
                    </button>
                  </div>
                </div>

                {/* Inline Add Section Form if open */}
                {showAddSectionModal && (
                  <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-in fade-in">
                    <label className="text-xs font-bold text-emerald-800 block">New Section Name</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Section 1 — Introduction to Python"
                        value={newSectionName}
                        onChange={e => setNewSectionName(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                      />
                      <button
                        onClick={handleAddSection}
                        className="px-3.5 py-1.5 bg-[#0D9488] text-white rounded-lg text-xs font-bold hover:bg-[#0F766E] cursor-pointer"
                      >
                        Add
                      </button>
                      <button
                        onClick={() => { setShowAddSectionModal(false); setNewSectionName(''); }}
                        className="px-3 py-1.5 bg-white border border-slate-200 text-[#475569] rounded-lg text-xs font-bold hover:bg-slate-100 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Section Accordions */}
                <div className="space-y-4">
                  {sections.map((sec, secIdx) => {
                    const secLessons = lessons.filter(l => l.section === sec.title);
                    const secDuration = secLessons.reduce((acc, l) => acc + (Number(l.durationMinutes) || 10), 0);
                    const isExpanded = !!expandedSections[sec.id];
                    const isEditing = editingSectionId === sec.id;

                    return (
                      <div key={sec.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                        {/* Section Header */}
                        <div className="bg-gray-50/80 px-4 py-3 flex items-center justify-between border-b border-slate-200 select-none">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-[#475569] cursor-grab">
                              <Icon name="drag_indicator" className="text-base" />
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleSection(sec.id)}
                              className="text-[#475569] hover:text-[#0F172A] cursor-pointer"
                            >
                              <Icon name={isExpanded ? 'expand_less' : 'expand_more'} className="text-xl" />
                            </button>

                            {isEditing ? (
                              <div className="flex items-center gap-1.5 flex-1">
                                <input
                                  type="text"
                                  value={editingSectionTitle}
                                  onChange={e => setEditingSectionTitle(e.target.value)}
                                  className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold w-full"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveRenameSection(sec.id)}
                                  className="p-1 bg-[#0D9488] text-white rounded hover:bg-[#0F766E]"
                                >
                                  <Icon name="check" className="text-xs" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingSectionId(null)}
                                  className="p-1 bg-slate-100 text-[#475569] rounded hover:bg-gray-300"
                                >
                                  <Icon name="close" className="text-xs" />
                                </button>
                              </div>
                            ) : (
                              <span
                                onClick={() => toggleSection(sec.id)}
                                className="font-extrabold text-sm text-[#0F172A] truncate cursor-pointer hover:text-emerald-900"
                              >
                                {sec.title}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 shrink-0 ml-2">
                            <span className="text-xs font-medium text-[#475569]">
                              {secLessons.length} lessons • {secDuration}m
                            </span>
                            <button
                              type="button"
                              onClick={() => { setEditingSectionId(sec.id); setEditingSectionTitle(sec.title); }}
                              className="w-7 h-7 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-[#475569] hover:text-[#0F172A] hover:border-gray-400 transition cursor-pointer"
                              title="Rename Section"
                            >
                              <Icon name="edit" className="text-xs" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSection(sec.id)}
                              className="w-7 h-7 rounded-lg border border-red-200 bg-red-50/50 flex items-center justify-center text-red-600 hover:bg-red-50 transition cursor-pointer"
                              title="Delete Section"
                            >
                              <Icon name="delete" className="text-xs" />
                            </button>
                            <div className="flex items-center">
                              <button
                                type="button"
                                disabled={secIdx === 0}
                                onClick={() => handleMoveSection(secIdx, -1)}
                                className="text-[#475569] hover:text-[#0F172A] disabled:opacity-20 cursor-pointer p-0.5"
                              >
                                <Icon name="keyboard_arrow_up" className="text-base" />
                              </button>
                              <button
                                type="button"
                                disabled={secIdx === sections.length - 1}
                                onClick={() => handleMoveSection(secIdx, 1)}
                                className="text-[#475569] hover:text-[#0F172A] disabled:opacity-20 cursor-pointer p-0.5"
                              >
                                <Icon name="keyboard_arrow_down" className="text-base" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Section Body (Lessons List) */}
                        {isExpanded && (
                          <div className="p-3 space-y-2 bg-white">
                            {secLessons.length === 0 ? (
                              <div className="py-6 text-center text-xs text-[#475569] italic">
                                No lessons in this section yet. Click below to add your first video lesson.
                              </div>
                            ) : (
                              secLessons.map((l, lIdx) => {
                                const globalIdx = lessons.findIndex(item => item.id === l.id);
                                const isCurrentEditing = editingLessonId === l.id;
                                const isMenuOpen = activeLessonMenu === l.id;

                                return (
                                  <div
                                    key={l.id}
                                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition ${isCurrentEditing
                                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-300'
                                      : 'bg-white border-slate-200 hover:border-gray-300'
                                      }`}
                                  >
                                    <span className="text-xs font-bold text-[#475569] w-5 shrink-0 text-center">
                                      {globalIdx + 1}.
                                    </span>

                                    {/* Video Thumbnail */}
                                    <div className="w-24 h-14 rounded-lg bg-slate-100 overflow-hidden relative shrink-0 border border-slate-200 shadow-2xs">
                                      {l.thumbnail ? (
                                        <img src={l.thumbnail} alt="" className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#475569] bg-gray-800">
                                          <Icon name="smart_display" className="text-xl" />
                                        </div>
                                      )}
                                      <span className="absolute bottom-1 right-1 bg-black/85 text-[#0F172A] font-mono text-[10px] font-bold px-1 py-0.2 rounded-xs">
                                        {l.duration}
                                      </span>
                                    </div>

                                    {/* Lesson Info */}
                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-xs font-bold text-[#0F172A] truncate">{l.title}</h3>
                                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                                        <span className="text-[11px] font-semibold text-[#475569] flex items-center gap-0.5">
                                          <Icon name="smart_display" className="text-xs text-[#475569]" /> Video
                                        </span>
                                        <span className="text-[11px] font-semibold text-[#475569] flex items-center gap-0.5">
                                          <Icon name="schedule" className="text-xs text-[#475569]" /> {l.duration}
                                        </span>
                                        {l.isFreePreview && (
                                          <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                            Free Preview
                                          </span>
                                        )}
                                        {l.notesName && (
                                          <span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                            <Icon name="attach_file" className="text-xs" /> Notes
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-1.5 shrink-0 relative">
                                      <button
                                        type="button"
                                        onClick={() => handleStartEditLesson(l)}
                                        className="px-2.5 py-1 border border-slate-200 rounded-lg text-xs font-bold text-[#0F172A] bg-white hover:bg-slate-100 flex items-center gap-1 transition cursor-pointer"
                                      >
                                        <Icon name="edit" className="text-xs text-[#475569]" /> Edit
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setActiveLessonMenu(isMenuOpen ? null : l.id)}
                                        className="w-7 h-7 rounded-lg text-[#475569] hover:bg-slate-100 flex items-center justify-center cursor-pointer"
                                      >
                                        <Icon name="more_vert" className="text-base" />
                                      </button>

                                      {/* Dropdown Menu */}
                                      {isMenuOpen && (
                                        <div className="absolute right-0 top-8 z-30 bg-white border border-slate-200 rounded-xl shadow-xl py-1.5 w-36 text-xs font-bold text-[#0F172A] animate-in fade-in">
                                          <button
                                            type="button"
                                            onClick={() => handleMoveLesson(l.id, -1)}
                                            className="w-full px-3 py-1.5 text-left hover:bg-slate-100 flex items-center gap-1.5"
                                          >
                                            <Icon name="arrow_upward" className="text-xs text-[#475569]" /> Move Up
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleMoveLesson(l.id, 1)}
                                            className="w-full px-3 py-1.5 text-left hover:bg-slate-100 flex items-center gap-1.5"
                                          >
                                            <Icon name="arrow_downward" className="text-xs text-[#475569]" /> Move Down
                                          </button>
                                          <div className="border-t border-slate-200 my-1"></div>
                                          <button
                                            type="button"
                                            onClick={() => handleDeleteLesson(l.id)}
                                            className="w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-1.5"
                                          >
                                            <Icon name="delete" className="text-xs text-red-600" /> Delete Lesson
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })
                            )}

                            {/* Add Lesson to this section button */}
                            <button
                              type="button"
                              onClick={() => {
                                handleCancelLessonForm();
                                setFormSection(sec.title);
                              }}
                              className="w-full py-2.5 mt-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100/80 border border-emerald-200/90 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition cursor-pointer"
                            >
                              <Icon name="add" className="text-sm font-bold" /> Add Lesson to this Section
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Middle Column: Add New Lesson / Edit Lesson Card */}
            <div className="lg:col-span-3 xl:col-span-3">
              <form onSubmit={handleSaveLessonForm} className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4 sticky top-6">
                <div>
                  <h2 className="text-base font-black text-[#0F172A]">
                    {editingLessonId ? 'Edit Lesson' : 'Add New Lesson'}
                  </h2>
                  <p className="text-xs text-[#475569]">
                    {editingLessonId ? 'Update details and settings for this lesson.' : 'Add a new video lesson to this section.'}
                  </p>
                </div>

                {/* Section dropdown */}
                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">Section *</label>
                  <select
                    value={formSection}
                    onChange={e => setFormSection(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white"
                  >
                    {sections.map(s => (
                      <option key={s.id} value={s.title}>{s.title}</option>
                    ))}
                  </select>
                </div>

                {/* Lesson Title */}
                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">Lesson Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter lesson title"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                {/* Video Type radio */}
                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1.5">Video Type *</label>
                  <div className="flex items-center gap-4 text-xs font-bold text-[#0F172A]">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="videoType"
                        value="youtube"
                        checked={formVideoType === 'youtube'}
                        onChange={() => setFormVideoType('youtube')}
                        className="accent-[#0A4D2E]"
                      />
                      <span>YouTube URL</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="videoType"
                        value="upload"
                        checked={formVideoType === 'upload'}
                        onChange={() => setFormVideoType('upload')}
                        className="accent-[#0A4D2E]"
                      />
                      <span>Upload Video</span>
                    </label>
                  </div>
                </div>

                {/* YouTube URL input */}
                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">
                    {formVideoType === 'youtube' ? 'YouTube URL *' : 'Video URL / Embed *'}
                  </label>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={formYoutubeUrl}
                    onChange={e => setFormYoutubeUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                  {formYoutubeUrl && (
                    <div className="mt-1 text-[11px]">
                      {formYtValid ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Icon name="check_circle" className="text-xs" /> Valid ID: {formYtId}
                        </span>
                      ) : (
                        <span className="text-red-600 font-bold flex items-center gap-1">
                          <Icon name="error" className="text-xs" /> Invalid YouTube link
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Duration */}
                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">Duration *</label>
                  <input
                    type="text"
                    placeholder="e.g. 10:00"
                    value={formDuration}
                    onChange={e => setFormDuration(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  />
                </div>

                {/* Free Preview Toggle */}
                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">Free Preview</label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formIsPreview}
                      onChange={e => setFormIsPreview(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-gray-300 peer-checked:bg-[#2563EB] rounded-full transition relative">
                      <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 left-0.5 peer-checked:translate-x-5 transition shadow-xs"></div>
                    </div>
                    <span className="text-xs font-semibold text-[#0F172A]">Allow free preview for this lesson</span>
                  </label>
                </div>

                {/* Lesson Notes (Optional) */}
                <div>
                  <label className="text-xs font-bold text-[#0F172A] block mb-1">Lesson Notes (Optional)</label>
                  <div className="border border-dashed border-slate-200 rounded-xl p-3 text-center bg-gray-50/50 hover:bg-slate-100 transition relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleUploadNotes}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="flex flex-col items-center justify-center gap-1">
                      <span className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#475569] shadow-2xs">
                        <Icon name="attach_file" className="text-base" />
                      </span>
                      <span className="text-xs font-bold text-[#0F172A]">
                        {uploadingNotes ? 'Uploading document...' : (formNotesName || 'Upload Notes (PDF, DOC, DOCX)')}
                      </span>
                    </div>
                  </div>
                  {formNotesName && (
                    <div className="mt-1 flex items-center justify-between text-xs bg-emerald-50 px-2.5 py-1 rounded-lg text-emerald-700">
                      <span className="truncate font-semibold">{formNotesName}</span>
                      <button
                        type="button"
                        onClick={() => { setFormNotesName(''); setFormNotesUrl(''); }}
                        className="text-[#475569] hover:text-red-700 ml-1"
                      >
                        <Icon name="close" className="text-xs" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Form Action Buttons */}
                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleCancelLessonForm}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#475569] hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-sm transition cursor-pointer"
                  >
                    {editingLessonId ? 'Save Lesson' : 'Add Lesson'}
                  </button>
                </div>
              </form>
            </div>

            {/* Right Column: Preview, Stats, and Quick Actions */}
            <div className="lg:col-span-3 xl:col-span-3 space-y-4">
              {/* Course Preview Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <h3 className="text-xs font-black text-[#475569] uppercase tracking-wider mb-3">Course Preview</h3>
                <div className="rounded-xl overflow-hidden aspect-video bg-slate-100 relative shadow-inner mb-3">
                  {thumbnailUrl || lessons[0]?.thumbnail ? (
                    <img src={thumbnailUrl || lessons[0]?.thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#475569] bg-gray-800">
                      <Icon name="smart_display" className="text-4xl text-[#475569]" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <span className="w-12 h-12 rounded-full bg-white text-[#0F172A] flex items-center justify-center shadow-lg">
                      <Icon name="play_arrow" className="text-2xl" />
                    </span>
                  </div>
                </div>

                <h2 className="text-sm font-black text-[#0F172A] leading-snug">{courseName || 'Python for Beginners'}</h2>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {level}
                  </span>
                  <span className="text-[10px] font-bold text-[#475569] bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Icon name="menu_book" className="text-xs" /> {lessons.length} Lessons
                  </span>
                  <span className="text-[10px] font-bold text-[#475569] bg-slate-100 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Icon name="schedule" className="text-xs" /> {totalDurationFormatted}
                  </span>
                </div>
                <p className="text-xs text-[#475569] mt-2 line-clamp-3">
                  {shortDescription || 'Learn from scratch with real examples and hands-on practice.'}
                </p>
              </div>

              {/* Course Stats Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <h3 className="text-xs font-black text-[#475569] uppercase tracking-wider mb-3">Course Stats</h3>
                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-1.5 text-emerald-700 mb-1">
                      <Icon name="description" className="text-sm" />
                      <span className="text-base font-black text-[#0F172A]">{lessons.length}</span>
                    </div>
                    <span className="text-[11px] font-medium text-[#475569]">Total Lessons</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-1.5 text-emerald-700 mb-1">
                      <Icon name="list" className="text-sm" />
                      <span className="text-base font-black text-[#0F172A]">{sections.length}</span>
                    </div>
                    <span className="text-[11px] font-medium text-[#475569]">Sections</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-1.5 text-emerald-700 mb-1">
                      <Icon name="schedule" className="text-sm" />
                      <span className="text-base font-black text-[#0F172A]">{totalDurationFormatted}</span>
                    </div>
                    <span className="text-[11px] font-medium text-[#475569]">Total Duration</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-1.5 text-emerald-700 mb-1">
                      <Icon name="people" className="text-sm" />
                      <span className="text-base font-black text-[#0F172A]">{course.learners || 1}</span>
                    </div>
                    <span className="text-[11px] font-medium text-[#475569]">Enrollments</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                      <Icon name="star" className="text-sm" />
                      <span className="text-base font-black text-[#0F172A]">{course.rating || '4.8'}</span>
                    </div>
                    <span className="text-[11px] font-medium text-[#475569]">Average Rating</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center gap-1.5 text-emerald-700 mb-1">
                      <Icon name="chat" className="text-sm" />
                      <span className="text-base font-black text-[#0F172A]">{course.reviewCount || 12}</span>
                    </div>
                    <span className="text-[11px] font-medium text-[#475569]">Total Reviews</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-2">
                <h3 className="text-xs font-black text-[#475569] uppercase tracking-wider mb-2">Quick Actions</h3>
                <button
                  type="button"
                  onClick={() => window.open(`/courses/${course.slug || ''}?preview=true`, '_blank')}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-[#0F172A] flex items-center gap-2 transition cursor-pointer"
                >
                  <Icon name="visibility" className="text-base text-[#475569]" /> Preview Course
                </button>
                <button
                  type="button"
                  onClick={() => window.open(`/courses/${course.slug || ''}`, '_blank')}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-[#0F172A] flex items-center gap-2 transition cursor-pointer"
                >
                  <Icon name="open_in_new" className="text-base text-[#475569]" /> View on Website
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCourseName(prev => `${prev} (Copy)`);
                    alert('Course cloned in editor. Click "Save Changes" to save as new course copy.');
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-[#0F172A] flex items-center gap-2 transition cursor-pointer"
                >
                  <Icon name="content_copy" className="text-base text-[#475569]" /> Duplicate Course
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!confirm(`Delete course "${courseName}"?`)) return;
                    try {
                      const client = api || adminApi(getToken());
                      const id = course.id || course.slug;
                      if (client?.deleteCourse && id) {
                        await client.deleteCourse(id);
                      }
                      onClose();
                    } catch (e) {
                      alert('Could not delete course: ' + e.message);
                    }
                  }}
                  className="w-full px-3.5 py-2 rounded-xl border border-red-200 bg-red-50/40 hover:bg-red-50 text-xs font-bold text-red-600 flex items-center gap-2 transition cursor-pointer"
                >
                  <Icon name="delete" className="text-base text-red-600" /> Delete Course
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: BASIC INFORMATION */}
        {/* ======================================================== */}
        {activeTab === 'basic' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-lg font-black text-[#0F172A] border-b border-slate-200 pb-3">Basic Information</h2>
            <div>
              <label className="text-xs font-bold text-[#0F172A] block mb-1">Course Title *</label>
              <input
                type="text"
                required
                value={courseName}
                onChange={e => setCourseName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white"
                >
                  {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.en}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">Difficulty Level</label>
                <select
                  value={level}
                  onChange={e => setLevel(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white"
                >
                  {['Beginner', 'Intermediate', 'Advanced', 'All levels'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-[#0F172A] block mb-1">Short Description</label>
              <textarea
                rows={3}
                value={shortDescription}
                onChange={e => setShortDescription(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                placeholder="Brief summary of the course shown on cards and headers..."
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer bg-amber-50/70 border border-amber-200 px-4 py-3 rounded-xl">
              <input
                type="checkbox"
                checked={trending}
                onChange={e => setTrending(e.target.checked)}
                className="w-4 h-4 accent-[#0A4D2E]"
              />
              <span className="text-xs font-bold text-[#0F172A]">⭐ Display on Home Page (Trending Section)</span>
            </label>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PRICE & ACCESS */}
        {/* ======================================================== */}
        {activeTab === 'price' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-lg font-black text-[#0F172A] border-b border-slate-200 pb-3">Price & Access Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">Course Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <p className="text-[11px] text-[#475569] mt-1">Set to 0 for a 100% Free course.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-[#0F172A] block mb-1">Access Validity (Days)</label>
                <input
                  type="number"
                  min="1"
                  value={validityDays}
                  onChange={e => setValidityDays(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <p className="text-[11px] text-[#475569] mt-1">Standard default is 365 days (1 year).</p>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: WHAT YOU'LL LEARN */}
        {/* ======================================================== */}
        {activeTab === 'learn' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-lg font-black text-[#0F172A] border-b border-slate-200 pb-3">What Students Will Learn</h2>
            <p className="text-xs text-[#475569]">Add the key learning outcomes and practical takeaways from this course.</p>

            <div className="space-y-2">
              {learnList.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">
                  <Icon name="check_circle" className="text-emerald-700 text-sm shrink-0" />
                  <span className="text-xs font-semibold text-[#0F172A] flex-1">{item}</span>
                  <button
                    type="button"
                    onClick={() => setLearnList(prev => prev.filter((_, i) => i !== idx))}
                    className="text-[#475569] hover:text-red-700 transition"
                  >
                    <Icon name="close" className="text-sm" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="e.g. Master financial reporting with Excel"
                value={newLearnInput}
                onChange={e => setNewLearnInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newLearnInput.trim()) {
                      setLearnList(prev => [...prev, newLearnInput.trim()]);
                      setNewLearnInput('');
                    }
                  }
                }}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
              <button
                type="button"
                onClick={() => {
                  if (newLearnInput.trim()) {
                    setLearnList(prev => [...prev, newLearnInput.trim()]);
                    setNewLearnInput('');
                  }
                }}
                className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] cursor-pointer"
              >
                Add Outcome
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: REQUIREMENTS */}
        {/* ======================================================== */}
        {activeTab === 'requirements' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-lg font-black text-[#0F172A] border-b border-slate-200 pb-3">Course Requirements & Prerequisites</h2>
            <p className="text-xs text-[#475569]">Prerequisites needed before taking this course.</p>

            <div className="space-y-2">
              {reqList.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-slate-50 px-3.5 py-2.5 rounded-xl border border-slate-200">
                  <Icon name="info" className="text-[#0F172A] text-sm shrink-0" />
                  <span className="text-xs font-semibold text-[#0F172A] flex-1">{item}</span>
                  <button
                    type="button"
                    onClick={() => setReqList(prev => prev.filter((_, i) => i !== idx))}
                    className="text-[#475569] hover:text-red-700 transition"
                  >
                    <Icon name="close" className="text-sm" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="e.g. Basic knowledge of computer operations"
                value={newReqInput}
                onChange={e => setNewReqInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newReqInput.trim()) {
                      setReqList(prev => [...prev, newReqInput.trim()]);
                      setNewReqInput('');
                    }
                  }
                }}
                className="flex-1 border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
              <button
                type="button"
                onClick={() => {
                  if (newReqInput.trim()) {
                    setReqList(prev => [...prev, newReqInput.trim()]);
                    setNewReqInput('');
                  }
                }}
                className="px-4 py-2 bg-[#2563EB] text-white rounded-xl text-xs font-bold hover:bg-[#1D4ED8] cursor-pointer"
              >
                Add Requirement
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 6: DESCRIPTION */}
        {/* ======================================================== */}
        {activeTab === 'description' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-lg font-black text-[#0F172A] border-b border-slate-200 pb-3">Course Detailed Description</h2>
            <textarea
              rows={8}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Provide a comprehensive syllabus and description of the course..."
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB] leading-relaxed"
            />
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 7: THUMBNAIL */}
        {/* ======================================================== */}
        {activeTab === 'thumbnail' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-lg font-black text-[#0F172A] border-b border-slate-200 pb-3">Course Thumbnail & Banner</h2>
            <div>
              <label className="text-xs font-bold text-[#0F172A] block mb-1">Image URL</label>
              <input
                type="text"
                placeholder="https://... or /images/..."
                value={thumbnailUrl}
                onChange={e => setThumbnailUrl(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
            </div>

            {thumbnailUrl && (
              <div>
                <span className="text-xs font-bold text-[#0F172A] block mb-2">Live Thumbnail Preview</span>
                <div className="aspect-video max-w-md rounded-2xl overflow-hidden border border-slate-200 bg-black">
                  <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 8: MORE SETTINGS */}
        {/* ======================================================== */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <h2 className="text-lg font-black text-[#0F172A] border-b border-slate-200 pb-3">More Course Settings</h2>
            <div>
              <label className="text-xs font-bold text-[#0F172A] block mb-1">Publication Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB] bg-white"
              >
                {['Active', 'Draft', 'Archived'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


function ManageVideosModal({ api, course, onClose, onSaveLessons, onOpenAssessment }) {
  const [lessons, setLessons] = useState(() => (course.lessons && course.lessons.length > 0) ? course.lessons : []);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [sectionName, setSectionName] = useState('');
  const [duration, setDuration] = useState(10);
  const [isPreview, setIsPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editSection, setEditSection] = useState('');
  const [customThumbnailFile, setCustomThumbnailFile] = useState(null);
  const [customThumbnailPreview, setCustomThumbnailPreview] = useState('');
  const customThumbInputRef = useRef(null);

  const existingSections = useMemo(() => {
    const fromLessons = lessons.map(l => l.section).filter(Boolean);
    const fromCourse = Array.isArray(course.sections) ? course.sections.map(s => typeof s === 'string' ? s : (s.title || s.name)).filter(Boolean) : [];
    return Array.from(new Set([...fromCourse, ...fromLessons]));
  }, [lessons, course.sections]);

  const ytId = extractYoutubeId(youtubeUrl);
  const ytTouched = !!youtubeUrl.trim();
  const ytValid = !!ytId;

  function handleCustomThumbChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
      return;
    }
    setCustomThumbnailFile(file);
    setCustomThumbnailPreview(URL.createObjectURL(file));
  }

  function clearCustomThumbnail() {
    setCustomThumbnailFile(null);
    if (customThumbnailPreview && customThumbnailPreview.startsWith('blob:')) {
      try { URL.revokeObjectURL(customThumbnailPreview); } catch { }
    }
    setCustomThumbnailPreview('');
    if (customThumbInputRef.current) customThumbInputRef.current.value = '';
  }

  function startEditing(i, currentTitle, currentSection) {
    setEditingIndex(i);
    setEditTitle(currentTitle || '');
    setEditSection(currentSection || '');
  }

  function saveEditing(i) {
    const trimmed = editTitle.trim();
    if (!trimmed) {
      alert('Lesson title cannot be empty.');
      return;
    }
    const updated = lessons.map((l, idx) => (idx === i ? { ...l, t: trimmed, section: (editSection || '').trim() } : l));
    setLessons(updated);
    onSaveLessons(updated);
    setEditingIndex(null);
  }

  async function addYouTubeLesson(e) {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      alert('Please enter a YouTube video URL.');
      return;
    }
    if (!ytValid) {
      alert('Invalid YouTube URL. Please enter a valid YouTube video URL, short link, or Shorts link (e.g. https://www.youtube.com/watch?v=... or https://youtu.be/...)');
      return;
    }
    if (!caption.trim()) {
      alert('Please enter a manual Lesson Title for this video.');
      return;
    }

    setUploading(true);
    const client = api || adminApi(getToken());
    try {
      let finalThumbnail = null;
      if (customThumbnailFile && client?.uploadThumbnail) {
        try {
          const upRes = await client.uploadThumbnail(customThumbnailFile);
          if (upRes?.thumbnailUrl) {
            finalThumbnail = upRes.thumbnailUrl;
          }
        } catch (upErr) {
          console.warn('Custom thumbnail upload failed, falling back to YouTube thumbnail:', upErr.message);
        }
      }
      if (!finalThumbnail) {
        finalThumbnail = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
      }

      const newLesson = {
        t: caption.trim(),
        section: (sectionName || '').trim(),
        min: Number(duration) || 10,
        isPreview: !!isPreview,
        youtube: youtubeUrl.trim(),
        youtubeVideoId: ytId,
        youtubeUrl: youtubeUrl.trim(),
        thumbnail: finalThumbnail,
        thumbnailUrl: finalThumbnail,
      };

      const updated = [...lessons, newLesson];
      setLessons(updated);
      onSaveLessons(updated);
      setYoutubeUrl('');
      setCaption('');
      setSectionName('');
      setDuration(10);
      setIsPreview(false);
      clearCustomThumbnail();
    } catch (err) {
      alert('Failed to add lesson: ' + (err.message || 'Error'));
    } finally {
      setUploading(false);
    }
  }

  async function removeLesson(index) {
    if (!confirm('Remove this video lesson?')) return;
    const client = api || adminApi(getToken());
    const courseId = course.id || course.slug || course._id;
    try {
      if (client?.deleteCourseLesson) {
        const updatedCourse = await client.deleteCourseLesson(courseId, index);
        const updatedLessons = updatedCourse?.lessons || lessons.filter((_, i) => i !== index);
        setLessons(updatedLessons);
        onSaveLessons(updatedLessons);
      } else {
        const updated = lessons.filter((_, i) => i !== index);
        setLessons(updated);
        onSaveLessons(updated);
      }
    } catch (err) {
      alert('Failed to remove video lesson: ' + (err.message || 'Server error'));
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
              <Icon name="smart_display" className="text-red-600 text-2xl" /> Manage YouTube Course Lessons
            </h2>
            <p className="text-xs text-[#475569] mt-0.5">{safeStr(course.title)}</p>
          </div>
          <div className="flex items-center gap-2">
            {onOpenAssessment && (
              <button
                type="button"
                onClick={onOpenAssessment}
                className="px-3 py-1.5 rounded-xl bg-[#2563EB] text-white text-xs font-bold flex items-center gap-1 hover:bg-[#1D4ED8] transition shadow-xs cursor-pointer"
              >
                <Icon name="assignment" className="text-sm" /> Add/Edit Assessment
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#475569] hover:text-[#0F172A] cursor-pointer">
              <Icon name="close" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Add YouTube Video Lesson Form */}
          <form onSubmit={addYouTubeLesson} className="bg-white border-2 border-blue-200 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                <Icon name="add_circle" className="text-red-600" /> Add YouTube Video Lesson
              </div>
              {ytTouched && (
                ytValid ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Icon name="check_circle" className="text-xs" /> Valid ID: {ytId}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Icon name="error" className="text-xs" /> Invalid YouTube URL
                  </span>
                )
              )}
            </div>

            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="modal-lesson-youtube-url" className="text-xs font-bold text-[#0F172A] block mb-1">
                  YouTube URL
                </label>
                <input
                  id="modal-lesson-youtube-url"
                  name="modalYoutubeUrl"
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=... or Shorts"
                  value={youtubeUrl}
                  onChange={e => setYoutubeUrl(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div className="flex-1 min-w-[180px]">
                <label htmlFor="modal-lesson-caption" className="text-xs font-bold text-[#0F172A] block mb-1">
                  Manual Video / Lesson Title *
                </label>
                <input
                  id="modal-lesson-caption"
                  name="modalCaption"
                  required
                  placeholder="e.g. Chapter 1: Introduction (Manual Name)"
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div className="flex-1 min-w-[160px]">
                <label htmlFor="modal-lesson-section" className="text-xs font-bold text-[#0F172A] block mb-1">
                  Section / Chapter Name
                </label>
                <input
                  id="modal-lesson-section"
                  name="modalSection"
                  list="modal-existing-sections-list"
                  placeholder="e.g. Introduction to APIs"
                  value={sectionName}
                  onChange={e => setSectionName(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
                <datalist id="modal-existing-sections-list">
                  {existingSections.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>

              <div className="w-20">
                <label htmlFor="modal-lesson-duration" className="text-xs font-bold text-[#0F172A] block mb-1">
                  Duration
                </label>
                <input
                  id="modal-lesson-duration"
                  name="modalDuration"
                  type="number"
                  min="1"
                  value={duration}
                  onChange={e => setDuration(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-[#0F172A] h-[38px] shrink-0">
                <input
                  type="checkbox"
                  checked={isPreview}
                  onChange={e => setIsPreview(e.target.checked)}
                  className="w-4 h-4 rounded text-[#0F172A] accent-brand-forest"
                />
                <Icon name="visibility" className="text-xs text-emerald-600" /> Free Preview
              </label>

              <button
                type="submit"
                disabled={uploading || !ytValid || !caption.trim()}
                className="bg-[#2563EB] text-white rounded-xl px-5 py-2 font-bold hover:bg-[#1D4ED8] disabled:opacity-50 flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Icon name="add" className="text-[16px]" /> Add Lesson
              </button>
            </div>

            {/* Thumbnail Preview in Modal Form */}
            {ytTouched && (
              <div className="mt-2 pt-2 border-t border-slate-200">
                {ytValid ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-emerald-50/50 border border-blue-200 rounded-xl p-3">
                    <div className="relative w-36 aspect-video rounded-lg overflow-hidden bg-black shadow-xs shrink-0 border border-slate-200">
                      <img
                        src={customThumbnailPreview || getYoutubeThumbnailUrl(ytId, 'maxresdefault')}
                        alt="Lesson Thumbnail Preview"
                        onError={(e) => {
                          if (!customThumbnailPreview && e.target.src.includes('maxresdefault.jpg')) {
                            e.target.src = getYoutubeThumbnailUrl(ytId, 'hqdefault');
                          }
                        }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <Icon name="play_arrow" className="text-[#0F172A] text-xl drop-shadow-xs" />
                      </div>
                      <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[9px] font-bold text-[#0F172A]">
                        {duration || 10}m
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0F172A]">
                          {customThumbnailFile ? '🎨 Custom Thumbnail' : '⚡ Auto YouTube Thumbnail'}
                        </span>
                        <span className="text-[10px] text-[#475569]">
                          {customThumbnailFile ? 'Custom image will be saved' : 'Extracted automatically'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <input
                          type="file"
                          ref={customThumbInputRef}
                          accept="image/*"
                          onChange={handleCustomThumbChange}
                          className="hidden"
                          id="modal-custom-thumbnail-input"
                        />
                        <button
                          type="button"
                          onClick={() => customThumbInputRef.current?.click()}
                          className="text-[11px] font-bold text-[#0F172A] hover:text-[#1D4ED8] bg-white border border-slate-200 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Icon name="add_photo_alternate" className="text-xs" />
                          {customThumbnailFile ? 'Change Custom Thumbnail' : 'Upload Custom Thumbnail (Optional)'}
                        </button>
                        {customThumbnailFile && (
                          <button
                            type="button"
                            onClick={clearCustomThumbnail}
                            className="text-[11px] font-semibold text-red-600 hover:underline cursor-pointer"
                          >
                            Revert
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
                    <Icon name="error" className="text-sm text-red-600" /> Invalid YouTube URL
                  </div>
                )}
              </div>
            )}
          </form>

          {/* List of Lessons */}
          <div>
            <h3 className="font-extrabold text-[#0F172A] text-sm mb-3 flex items-center justify-between">
              <span>Course Lessons & Videos ({lessons.length})</span>
            </h3>

            {lessons.length === 0 ? (
              <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 rounded-2xl text-[#475569] text-sm">
                <Icon name="smart_display" className="text-4xl mb-2 text-[#475569]" />
                <p>No video lessons attached to this course yet.</p>
                <p className="text-xs mt-1">Paste a YouTube URL above to add the first lesson!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {lessons.map((l, i) => {
                  const lessonYtId = l.youtubeVideoId || extractYoutubeId(l.youtube || l.youtubeUrl);
                  const thumb = l.thumbnailUrl || l.thumbnail || (lessonYtId ? getYoutubeThumbnailUrl(lessonYtId, 'maxresdefault') : null);

                  return (
                    <div key={i} className="flex items-center justify-between gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-[#F8FAFC] transition-all">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="w-7 h-7 rounded-lg bg-slate-50 text-[#0F172A] font-extrabold text-xs flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>

                        {/* Lesson Thumbnail with Play Overlay */}
                        <div className="relative w-16 h-11 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          {thumb ? (
                            <img
                              src={thumb.startsWith('/uploads') ? assetUrl(thumb) : thumb}
                              alt={l.t}
                              onError={(e) => {
                                if (lessonYtId && e.target.src.includes('maxresdefault.jpg')) {
                                  e.target.src = getYoutubeThumbnailUrl(lessonYtId, 'hqdefault');
                                } else {
                                  e.target.style.display = 'none';
                                }
                              }}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-50 flex items-center justify-center">
                              <Icon name="smart_display" className="text-[#475569] text-base" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <Icon name="play_arrow" className="text-[#0F172A] text-xs drop-shadow-xs" />
                          </div>
                        </div>

                        {editingIndex === i ? (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 mr-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Lesson title..."
                              className="border-2 border-blue-200 rounded-lg px-2.5 py-1 text-xs font-bold text-[#0F172A] flex-1 focus:outline-none"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEditing(i);
                                if (e.key === 'Escape') setEditingIndex(null);
                              }}
                            />
                            <input
                              type="text"
                              value={editSection}
                              list="modal-existing-sections-list"
                              onChange={(e) => setEditSection(e.target.value)}
                              placeholder="Section (e.g. Introduction)"
                              className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-[#0F172A] w-44 focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                            />
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => saveEditing(i)}
                                className="px-2.5 py-1 rounded-lg bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] cursor-pointer shrink-0"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingIndex(null)}
                                className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-100 cursor-pointer shrink-0"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <div className="font-bold text-[#0F172A] text-sm truncate">{l.t}</div>
                              {l.section && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-[#0F172A] border border-blue-200">
                                  Section: {l.section}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => startEditing(i, l.t, l.section)}
                                className="text-[#475569] hover:text-[#0F172A] text-xs p-0.5 rounded cursor-pointer transition hover:bg-emerald-500/25"
                                title="Edit Lesson Title and Section"
                              >
                                <Icon name="edit" className="text-[14px]" />
                              </button>
                            </div>
                            <div className="text-xs text-[#475569] flex items-center gap-2 mt-0.5">
                              <span>{l.min || 10} mins</span>
                              <span>•</span>
                              {lessonYtId ? (
                                <span className="text-red-700 font-bold flex items-center gap-1 truncate">
                                  <Icon name="smart_display" className="text-[13px] text-red-600" /> YouTube ID: {lessonYtId}
                                </span>
                              ) : l.file ? (
                                <span className="text-emerald-700 font-bold flex items-center gap-0.5 truncate">
                                  <Icon name="videocam" className="text-[13px]" /> File: {l.file.split('/').pop()}
                                </span>
                              ) : (
                                <span className="text-[#475569]">Placeholder (No video attached)</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = lessons.map((item, idx) => (idx === i ? { ...item, isPreview: !item.isPreview } : item));
                            setLessons(updated);
                            onSaveLessons(updated);
                          }}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 border transition cursor-pointer ${l.isPreview || (i === 0 && l.isPreview !== false)
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-[#475569] border-slate-200 hover:bg-slate-200'
                            }`}
                          title="Click to toggle Free Preview for this lesson"
                        >
                          <Icon name={l.isPreview || (i === 0 && l.isPreview !== false) ? "visibility" : "lock"} className="text-xs" />
                          <span>{l.isPreview || (i === 0 && l.isPreview !== false) ? 'Preview' : 'Locked'}</span>
                        </button>
                        {onOpenAssessment && (() => {
                          const courseAssessments = (() => {
                            try {
                              const local = JSON.parse(localStorage.getItem(`course_assessments_${course.slug}`));
                              if (Array.isArray(local)) return local;
                            } catch { }
                            return Array.isArray(course.assessments) ? course.assessments : [];
                          })();
                          const qCount = courseAssessments.filter((q) => (
                            q.videoIndex !== undefined && q.videoIndex !== null
                              ? Number(q.videoIndex) === i
                              : (q.videoTitle && l.t && q.videoTitle.toLowerCase().trim() === l.t.toLowerCase().trim())
                          )).length;
                          return (
                            <button
                              type="button"
                              onClick={() => onOpenAssessment(i)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-2xs border ${qCount > 0
                                ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                                : 'bg-blue-50 hover:bg-brand-forest hover:text-[#0F172A] text-[#0F172A] border-blue-200'
                                }`}
                              title={`Manage questions for Video ${i + 1}`}
                            >
                              <Icon name="assignment" className="text-[16px]" />
                              <span>{qCount > 0 ? `${qCount} Questions` : '+ Add Questions'}</span>
                            </button>
                          );
                        })()}
                        <button
                          type="button"
                          onClick={() => removeLesson(i)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-xl transition-all cursor-pointer"
                          title="Delete Lesson"
                        >
                          <Icon name="delete" className="text-[18px]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-200 flex justify-between items-center bg-slate-50">
          <Link
            to={`/courses/${course.slug}`}
            target="_blank"
            className="text-[#0F172A] text-sm font-bold hover:underline flex items-center gap-1"
          >
            <Icon name="open_in_new" className="text-[16px]" /> Open Course Player
          </Link>
          <button
            onClick={onClose}
            className="bg-[#2563EB] text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-[#1D4ED8] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

function ImportCoursesModal({ api, isOpen, onClose, onSuccess, onDownloadTemplate, downloadingTemplate }) {
  const [file, setFile] = useState(null);
  const [validating, setValidating] = useState(false);
  const [validation, setValidation] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [importing, setImporting] = useState(false);
  const [successCount, setSuccessCount] = useState(null);

  if (!isOpen) return null;

  async function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setValidation(null);
    setErrorMsg('');
    setSuccessCount(null);

    setValidating(true);
    try {
      if (!api?.validateImportCourses) throw new Error('Validation service unavailable');
      const res = await api.validateImportCourses(f);
      setValidation(res);
    } catch (err) {
      setErrorMsg(err.message || 'Validation failed. Please make sure the file is a valid Excel document (.xlsx or .xls).');
    } finally {
      setValidating(false);
    }
  }

  async function handleExecuteImport() {
    if (!validation || !validation.valid || validation.errorCount > 0 || !validation.validRows?.length) return;
    setImporting(true);
    setErrorMsg('');
    try {
      const res = await api.importCourses(validation.validRows, file);
      const count = res?.importedCount || validation.validRows.length;
      setSuccessCount(count);
      if (onSuccess) onSuccess(count);
    } catch (err) {
      setErrorMsg(err.message || 'Import failed. Slugs may already exist or database error.');
    } finally {
      setImporting(false);
    }
  }

  function handleReset() {
    setFile(null);
    setValidation(null);
    setErrorMsg('');
    setSuccessCount(null);
    const input = document.getElementById('excel-file-import-input');
    if (input) input.value = '';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 md:p-8 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0F172A] flex items-center justify-center">
              <Icon name="upload_file" className="text-2xl" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#0F172A]">Import Courses</h2>
              <p className="text-xs text-[#475569]">Upload course master data to database via Excel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#475569] hover:bg-slate-100 hover:text-[#0F172A] transition-colors cursor-pointer"
          >
            <Icon name="close" className="text-xl" />
          </button>
        </div>

        {successCount !== null ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto text-3xl font-bold">
              ✓
            </div>
            <div>
              <h3 className="text-xl font-black text-[#0F172A]">✓ {successCount} courses imported successfully.</h3>
              <p className="text-xs text-[#475569] mt-1">
                The course catalogue and database have been updated with the imported master records.
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-[#2563EB] text-white px-8 py-2.5 rounded-xl font-extrabold text-sm hover:bg-[#1D4ED8] transition-all shadow-md cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            {/* Step 1: Download Template */}
            <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200">
              <div className="flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap">
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-[#0F172A] mb-1">Step 1 — Download the Excel template</div>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    Download the blank Excel template with column headings: <code className="bg-white px-1.5 py-0.5 rounded text-[11px] font-bold text-[#0F172A] border border-slate-200">course_name, category, level, short_description, status, trending</code>. Fill in your course rows below the headers. If a course already exists, its details will be updated.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onDownloadTemplate}
                  disabled={downloadingTemplate}
                  className="shrink-0 flex items-center gap-1.5 bg-white border border-slate-200 text-[#0F172A] px-4 py-2 rounded-xl text-xs font-bold hover:bg-white/80 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Icon name="download" className="text-sm" />
                  {downloadingTemplate ? 'Downloading...' : 'Download Template'}
                </button>
              </div>
            </div>

            {/* Step 2: Upload Excel File */}
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#0F172A] mb-2">Step 2 — Upload Excel (.xlsx, .xls)</div>
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-brand-forest/40 transition-colors bg-white">
                <input
                  type="file"
                  id="excel-file-import-input"
                  accept=".xlsx, .xls, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="excel-file-import-input" className="cursor-pointer flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-[#0F172A] flex items-center justify-center mb-3">
                    <Icon name="cloud_upload" className="text-2xl" />
                  </div>
                  <span className="text-sm font-bold text-[#0F172A]">
                    {file ? file.name : 'Choose Excel File'}
                  </span>
                  <span className="text-xs text-[#475569] mt-1">
                    {file ? `${(file.size / 1024).toFixed(1)} KB — Click to choose different file` : 'Accepts .xlsx and .xls (Max 10MB)'}
                  </span>
                </label>
              </div>
            </div>

            {/* Loading / Validating State */}
            {validating && (
              <div className="flex items-center justify-center gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-200 text-[#0F172A] text-sm font-bold">
                <Icon name="sync" className="animate-spin text-xl text-[#0F172A]" />
                <span>Parsing and validating every Excel row against database...</span>
              </div>
            )}

            {/* General Error Banner */}
            {errorMsg && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-start gap-2.5">
                <Icon name="error" className="text-red-600 text-lg shrink-0 mt-0.5" />
                <div>
                  <div className="font-extrabold text-sm text-red-700">Validation Notice</div>
                  <div className="mt-0.5 text-red-700 leading-relaxed">{errorMsg}</div>
                </div>
              </div>
            )}

            {/* Step 3: Validate & Preview */}
            {validation && (
              <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-black uppercase tracking-wider text-[#0F172A]">Step 3 — Import Preview</div>
                  <span className="text-xs text-[#475569] font-mono truncate max-w-[200px]">{validation.fileName}</span>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <div className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider">Total rows</div>
                    <div className="text-2xl font-black text-[#0F172A] mt-0.5">{validation.totalRows}</div>
                  </div>
                  <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200">
                    <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Valid</div>
                    <div className="text-2xl font-black text-emerald-700 mt-0.5">✓ {validation.validCount} rows</div>
                  </div>
                  <div className={`rounded-xl p-3 border ${validation.errorCount > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div className={`text-[11px] font-semibold uppercase tracking-wider ${validation.errorCount > 0 ? 'text-red-700' : 'text-[#475569]'}`}>Errors</div>
                    <div className={`text-2xl font-black mt-0.5 ${validation.errorCount > 0 ? 'text-red-600' : 'text-[#475569]'}`}>
                      {validation.errorCount > 0 ? `✕ ${validation.errorCount}` : '0'}
                    </div>
                  </div>
                </div>

                {validation.errorCount > 0 ? (
                  <div className="space-y-3">
                    <div className="text-xs font-bold text-red-700 flex items-center gap-1.5">
                      <Icon name="warning" className="text-base text-red-600" />
                      Errors detected: You must fix all row errors before importing. Partial imports are disabled.
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1.5 p-3 rounded-xl bg-red-50/70 border border-red-200 text-xs font-mono">
                      {validation.errors.map((e, idx) => (
                        <div key={idx} className="flex items-start gap-1.5 text-red-700">
                          <span className="text-red-600 font-bold shrink-0">✕</span>
                          <span>Row {e.row} — {e.error}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-[#475569]">Fix errors in your spreadsheet and choose the file again.</span>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="text-xs font-bold text-[#0F172A] hover:underline cursor-pointer"
                      >
                        Clear Selection
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 flex items-center gap-2">
                      <Icon name="check_circle" className="text-emerald-600 text-base" />
                      <span>Ready to import {validation.validCount} valid courses into the database.</span>
                    </div>

                    <div className="max-h-44 overflow-y-auto border border-slate-200 rounded-xl text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-[#0F172A] sticky top-0">
                          <tr>
                            <th className="p-2">Course Name</th>
                            <th className="p-2">Category</th>
                            <th className="p-2">Level</th>
                            <th className="p-2">Status</th>
                            <th className="p-2">Trending</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {validation.validRows.map((r, i) => (
                            <tr key={i} className="hover:bg-slate-100">
                              <td className="p-2 font-semibold text-[#0F172A] truncate max-w-[170px]">{r.courseName}</td>
                              <td className="p-2 capitalize">{r.category}</td>
                              <td className="p-2">{r.level}</td>
                              <td className="p-2">
                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${r.status === 'Active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-[#0F172A]'}`}>
                                  {r.status || 'Active'}
                                </span>
                              </td>
                              <td className="p-2">{r.trending ? '⭐ Yes' : 'No'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-[#0F172A] font-bold text-sm hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={!validation || validation.errorCount > 0 || !validation.validRows?.length || importing}
                className="flex items-center gap-2 bg-[#2563EB] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#1D4ED8] transition-all shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <>
                    <Icon name="sync" className="animate-spin text-base" /> Importing...
                  </>
                ) : (
                  <>
                    <Icon name="check" />
                    Import {validation?.validCount || 0} Courses
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UsersPanel({ api, isSubAdmin, initialCourseFilter = 'all', onClearCourseFilter }) {
  const langCtx = useLanguage();
  const t = langCtx?.t || ((k, fallback) => fallback || k);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'user' | 'admin'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'name'
  const [notice, setNotice] = useState('');
  const [courseFilter, setCourseFilter] = useState(initialCourseFilter || 'all');
  const [assignedCoursesList, setAssignedCoursesList] = useState([]);

  useEffect(() => {
    if (initialCourseFilter) {
      setCourseFilter(initialCourseFilter);
    }
  }, [initialCourseFilter]);

  useEffect(() => {
    const fetchCoursesForFilter = async () => {
      try {
        const client = api || adminApi(getToken());
        const data = client?.getCourses ? await client.getCourses() : await client?.get?.('/courses');
        if (Array.isArray(data)) setAssignedCoursesList(data);
      } catch (e) {
        console.warn('Could not load courses for filter:', e);
      }
    };
    fetchCoursesForFilter();
  }, [api]);

  // Selected User for View Profile Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Add User Form
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', role: 'user', password: '' });

  const loadUsers = async () => {
    setLoading(true);
    setNotice('');
    try {
      let data = null;
      if (api?.getUsers) {
        data = await api.getUsers();
      } else if (api?.get) {
        data = await api.get('/users');
      }
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.warn('Failed to fetch users from server:', err);
      try {
        const local = JSON.parse(localStorage.getItem('admin_users') || '[]');
        if (Array.isArray(local)) setUsers(local);
        else setUsers([]);
      } catch {
        setUsers([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // When a user is selected to view profile, load their deep activity data
  useEffect(() => {
    if (!selectedUser) {
      setProfileData(null);
      return;
    }
    let cancelled = false;
    setLoadingProfile(true);

    const fetchProfile = async () => {
      try {
        const data = api?.getUserProfile
          ? await api.getUserProfile(selectedUser.id)
          : await api.get(`/users/${selectedUser.id}`);
        if (!cancelled && data) {
          setProfileData(data);
        }
      } catch (err) {
        console.warn('Could not load user profile details:', err);
        if (!cancelled) setProfileData(selectedUser);
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [selectedUser]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.email.trim()) return;
    setSubmitting(true);
    setNotice('');

    try {
      const payload = {
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        role: form.role || 'user',
        password: form.password || 'User@123',
      };

      let created = null;
      if (api?.createUser) {
        created = await api.createUser(payload);
      } else {
        created = await api.post('/users', payload);
      }

      setNotice(`✓ Registered account created for ${created.fullName || payload.fullName}.`);
      setForm({ fullName: '', email: '', role: 'user', password: '' });
      setAdding(false);
      await loadUsers();
    } catch (err) {
      setNotice(`Error adding user: ${err.message || 'Failed'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to delete the registered account for "${userName}"?`)) return;
    try {
      if (api?.deleteUser) {
        await api.deleteUser(userId);
      } else {
        await api.del(`/users/${userId}`);
      }
      setNotice(`✓ Account for "${userName}" has been deleted.`);
      if (selectedUser?.id === userId) setSelectedUser(null);
      setUsers((prev) => (Array.isArray(prev) ? prev.filter((u) => u?.id !== userId) : []));
    } catch (err) {
      setNotice(`Failed to delete user: ${err.message || 'Error'}`);
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : 'admin';
    const confirmMsg = nextRole === 'admin'
      ? 'Promote this user to Administrator?'
      : 'Demote this user to standard Learner?';
    if (!confirm(confirmMsg)) return;

    try {
      let updated = null;
      if (api?.updateUserRole) {
        updated = await api.updateUserRole(userId, nextRole);
      } else {
        updated = await api.put(`/users/${userId}/role`, { role: nextRole });
      }

      setNotice(`✓ User role updated to "${nextRole}".`);
      setUsers((prev) =>
        Array.isArray(prev) ? prev.map((u) => (u?.id === userId ? { ...u, role: nextRole } : u)) : []
      );
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser((prev) => ({ ...prev, role: nextRole }));
        setProfileData((prev) => (prev ? { ...prev, role: nextRole } : prev));
      }
    } catch (err) {
      setNotice(`Failed to update role: ${err.message || 'Error'}`);
    }
  };

  // Safe Users Array & Filter/Sort
  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = useMemo(() => {
    let result = [...safeUsers];

    // Role Filter
    if (roleFilter && roleFilter !== 'all') {
      result = result.filter((u) => u?.role === roleFilter);
    }

    // Course Engagement Filter
    if (courseFilter && courseFilter !== 'all') {
      const cf = String(courseFilter).toLowerCase().trim();
      result = result.filter((u) => {
        if (!u) return false;
        if (Array.isArray(u.engagedCourseSlugs) && u.engagedCourseSlugs.some((s) => String(s || '').toLowerCase() === cf)) return true;
        if (Array.isArray(u.coursesDetail) && u.coursesDetail.some((cd) => String(cd?.courseSlug || '').toLowerCase() === cf)) return true;
        if (Array.isArray(u.assignedVideosWatched) && u.assignedVideosWatched.some((vt) => {
          const vtStr = typeof vt === 'string' ? vt : (safeStr(vt) || String(vt || ''));
          return vtStr.toLowerCase().includes(cf);
        })) return true;
        return false;
      });
    }

    // Search Query
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (u) =>
          String(u?.fullName || '').toLowerCase().includes(q) ||
          String(u?.email || '').toLowerCase().includes(q) ||
          String(u?.id || '').toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'newest') {
      result.sort((a, b) => {
        const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      });
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => {
        const timeA = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return (isNaN(timeA) ? 0 : timeA) - (isNaN(timeB) ? 0 : timeB);
      });
    } else if (sortBy === 'name') {
      result.sort((a, b) => String(a?.fullName || '').localeCompare(String(b?.fullName || '')));
    }

    return result;
  }, [safeUsers, roleFilter, search, sortBy, courseFilter]);

  const learnersCount = safeUsers.filter((u) => u?.role === 'user').length;
  const adminsCount = safeUsers.filter((u) => u?.role === 'admin').length;
  const recent24hCount = safeUsers.filter((u) => {
    if (!u?.createdAt) return false;
    const t = new Date(u.createdAt).getTime();
    if (isNaN(t)) return false;
    const diff = Date.now() - t;
    return diff <= 24 * 60 * 60 * 1000;
  }).length;

  const handleExportCSV = () => {
    const safeList = Array.isArray(filteredUsers) ? filteredUsers : [];
    if (safeList.length === 0) return;
    const headers = [
      'Full Name',
      'Email Address',
      'Role',
      'Watch Duration (Mins)',
      'Completion %',
      'Last Watched Date',
      'Registration Date',
      'Engaged Content',
    ];

    const csvRows = safeList.map((u) => {
      const watchMins = Math.round((Number(u?.watchDurationSec) || 0) / 60);
      const completion = `${Number(u?.completionPercent) || 0}%`;
      const lastWatched = u?.lastWatchedAt ? new Date(u.lastWatchedAt).toLocaleDateString('en-IN') : '—';
      const regDate = u?.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—';
      const engaged = (Array.isArray(u?.assignedVideosWatched) ? u.assignedVideosWatched.map(v => typeof v === 'string' ? v : safeStr(v)).join('; ') : '') ||
        (Array.isArray(u?.engagedCourseSlugs) ? u.engagedCourseSlugs.join('; ') : '');

      return [
        `"${String(u?.fullName || '').replace(/"/g, '""')}"`,
        `"${String(u?.email || '').replace(/"/g, '""')}"`,
        `"${u?.role || 'user'}"`,
        watchMins,
        `"${completion}"`,
        `"${lastWatched}"`,
        `"${regDate}"`,
        `"${engaged.replace(/"/g, '""')}"`,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GMark_Software_Learners_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Section Header with Stats Strip */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-3xl font-extrabold text-[#0F172A]">
              {t('admin.users.title', 'Registered Users')}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-[#2563EB] text-white">
              {Array.isArray(users) ? users.length : 0} {isSubAdmin ? 'Learners' : t('admin.users.totalRegistered', 'Total Registered')}
            </span>
          </div>
          <p className="text-[#475569] text-sm mt-1">
            {isSubAdmin
              ? 'Learners who have watched your allocated course and playlist lessons, completed quizzes, or submitted video assignments.'
              : t('admin.users.subtitle', 'View all registered platform members, their exact registration dates & times, and detailed user profiles.')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-[#0F172A] hover:bg-slate-100 text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
            title="Refresh Users List from Database"
          >
            <Icon name="refresh" className={`text-sm ${loading ? 'animate-spin' : ''}`} />
            {t('admin.common.refresh', 'Refresh')}
          </button>

          {!isSubAdmin && (
            <button
              type="button"
              onClick={() => setAdding((a) => !a)}
              className="flex items-center gap-1.5 bg-[#2563EB] text-white px-5 py-2.5 rounded-xl text-xs font-extrabold hover:bg-[#1D4ED8] transition-all shadow-sm cursor-pointer"
            >
              <Icon name={adding ? 'close' : 'person_add'} className="text-sm text-[#2563EB]" />
              {adding ? t('admin.common.cancel', 'Cancel') : t('admin.users.addUser', 'Add User')}
            </button>
          )}
        </div>
      </div>

      {isSubAdmin && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-700 flex items-start gap-3 shadow-2xs">
          <Icon name="verified" className="text-emerald-700 text-lg mt-0.5 shrink-0" />
          <div>
            <strong className="font-black text-emerald-100 block text-sm">Scoped Learner Directory</strong>
            <span>You are viewing learners who have actively watched your assigned video lessons, completed video quizzes, or submitted video assignments. Account creation and deletion are restricted to Super Admins.</span>
          </div>
        </div>
      )}

      {/* Global Notice Banner */}
      {notice && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-xs font-bold text-emerald-700 flex items-center justify-between animate-in fade-in">
          <span>{notice}</span>
          <button onClick={() => setNotice('')} className="text-emerald-700 font-black cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Quick Summary Metric Cards */}
      {isSubAdmin ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-1">
              <span>Scoped Learners</span>
              <Icon name="groups" className="text-[#0F172A] text-lg" />
            </div>
            <div className="text-2xl font-black text-[#0F172A]">{Array.isArray(users) ? users.length : 0}</div>
            <div className="text-[11px] text-[#475569] mt-0.5">Engaged with assigned content</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-1">
              <span>Active Past 24h</span>
              <Icon name="electric_bolt" className="text-amber-500 text-lg" />
            </div>
            <div className="text-2xl font-black text-amber-700">{recent24hCount}</div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">Recent student activity</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-1">
              <span>Administrative Scope</span>
              <Icon name="assignment_ind" className="text-emerald-600 text-lg" />
            </div>
            <div className="text-base font-black text-emerald-700">Assigned Videos Only</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Video-level access enforced</div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-1">
              <span>Total Accounts</span>
              <Icon name="groups" className="text-[#0F172A] text-lg" />
            </div>
            <div className="text-2xl font-black text-[#0F172A]">{Array.isArray(users) ? users.length : 0}</div>
            <div className="text-[11px] text-[#475569] mt-0.5">Registered members</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-1">
              <span>Learners</span>
              <Icon name="school" className="text-teal-600 text-lg" />
            </div>
            <div className="text-2xl font-black text-sky-700">{learnersCount}</div>
            <div className="text-[11px] text-teal-600 font-medium mt-0.5">Community students</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-1">
              <span>Administrators</span>
              <Icon name="verified_user" className="text-purple-600 text-lg" />
            </div>
            <div className="text-2xl font-black text-indigo-700">{adminsCount}</div>
            <div className="text-[11px] text-purple-600 font-medium mt-0.5">Platform managers</div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
            <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-1">
              <span>Recent Signups</span>
              <Icon name="electric_bolt" className="text-amber-500 text-lg" />
            </div>
            <div className="text-2xl font-black text-amber-700">{recent24hCount}</div>
            <div className="text-[11px] text-amber-600 font-medium mt-0.5">Past 24 hours</div>
          </div>
        </div>
      )}

      {/* Add User Drawer / Form */}
      {adding && !isSubAdmin && (
        <form
          onSubmit={handleAddUser}
          className="bg-white border-2 border-blue-200 rounded-3xl p-6 shadow-md grid md:grid-cols-2 gap-4 animate-in fade-in zoom-in-95"
        >
          <div className="md:col-span-2 flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
              <Icon name="person_add" className="text-[#0F172A] text-lg" /> Register New Account
            </h3>
            <span className="text-xs text-[#475569]">Admin-created account</span>
          </div>

          <div>
            <label htmlFor="admin-user-fullname" className="text-xs font-extrabold text-[#0F172A] block mb-1">Full Name *</label>
            <input
              required
              id="admin-user-fullname"
              name="fullName"
              autoComplete="name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              placeholder="e.g. Rahul Sharma"
            />
          </div>

          <div>
            <label htmlFor="admin-user-email" className="text-xs font-extrabold text-[#0F172A] block mb-1">Email Address *</label>
            <input
              required
              id="admin-user-email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              placeholder="rahul@example.com"
            />
          </div>

          <div>
            <label htmlFor="admin-user-role" className="text-xs font-extrabold text-[#0F172A] block mb-1">Account Role *</label>
            <select
              id="admin-user-role"
              name="role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] cursor-pointer"
            >
              <option value="user">Learner (Standard User)</option>
              <option value="admin">Platform Administrator</option>
            </select>
          </div>

          <div>
            <label htmlFor="admin-user-password" className="text-xs font-extrabold text-[#0F172A] block mb-1">
              Temporary Password <span className="font-normal text-[#475569]">(Default: User@123)</span>
            </label>
            <input
              id="admin-user-password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              placeholder="Minimum 6 characters"
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#475569] hover:bg-slate-100 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#2563EB] text-white px-6 py-2 rounded-xl text-xs font-extrabold hover:bg-[#1D4ED8] transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Register User'}
            </button>
          </div>
        </form>
      )}

      {/* Search, Filter, and Sort Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569] text-base" />
          <input
            id="admin-user-search"
            name="userSearch"
            type="search"
            autoComplete="off"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('admin.users.searchPlaceholder', 'Search by full name or email address...')}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-gray-600 text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Pills & Sort Dropdown */}
        <div className="flex flex-wrap items-center gap-2">
          {!isSubAdmin && (
            <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${roleFilter === 'all'
                  ? 'bg-[#2563EB] text-white shadow-2xs font-extrabold'
                  : 'text-[#475569] hover:text-white'
                  }`}
              >
                {t('admin.common.all', 'All')} ({Array.isArray(users) ? users.length : 0})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('user')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${roleFilter === 'user'
                  ? 'bg-[#2563EB] text-white shadow-2xs font-extrabold'
                  : 'text-[#475569] hover:text-white'
                  }`}
              >
                {t('admin.users.roleLearner', 'Learners')} ({learnersCount})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('admin')}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${roleFilter === 'admin'
                  ? 'bg-[#2563EB] text-white shadow-2xs font-extrabold'
                  : 'text-[#475569] hover:text-white'
                  }`}
              >
                {t('admin.users.roleAdmin', 'Admins')} ({adminsCount})
              </button>
            </div>
          )}

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#475569] font-bold hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] cursor-pointer"
            >
              <option value="newest">Newest Registered</option>
              <option value="oldest">Oldest Registered</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>

          {/* Course Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-[#475569] font-bold hidden sm:inline">Course:</span>
            <select
              value={courseFilter}
              onChange={(e) => {
                setCourseFilter(e.target.value);
                if (e.target.value === 'all' && onClearCourseFilter) {
                  onClearCourseFilter();
                }
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] cursor-pointer max-w-[190px] truncate"
              title="Filter learners by course / video engagement"
            >
              <option value="all">All Content</option>
              {Array.isArray(assignedCoursesList) && assignedCoursesList.map((c) => {
                const title = safeStr(c?.title) || (typeof c?.courseName === 'string' ? c.courseName : safeStr(c?.courseName)) || c?.slug || 'Course';
                return (
                  <option key={c?.slug || c?.id || Math.random()} value={c?.slug || ''}>
                    {title}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-[#0F172A] hover:bg-slate-100 text-xs font-bold transition shadow-2xs cursor-pointer"
            title="Export filtered learners list to CSV"
          >
            <Icon name="download" className="text-xs text-[#0F172A]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Registered Users Table */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-16 text-center shadow-soft-card">
          <Icon name="sync" className="animate-spin text-4xl text-[#0F172A] mb-3" />
          <h3 className="font-extrabold text-base text-[#0F172A]">Loading Registered Users...</h3>
          <p className="text-xs text-[#475569] mt-1">Retrieving account records and registration timestamps.</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-soft-card">
          <Icon name="person_search" className="text-5xl text-[#475569] mb-3" />
          <h3 className="font-extrabold text-lg text-[#0F172A]">No matching users found</h3>
          <p className="text-xs text-[#475569] mt-1 max-w-md mx-auto">
            {search || roleFilter !== 'all'
              ? 'Try modifying your search or filter settings.'
              : 'No registered user accounts found in the database yet.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-soft-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[#0F172A] font-extrabold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">{t('admin.users.tableHeaders.user', 'User / Member')}</th>
                  <th className="py-3.5 px-4">{t('admin.users.tableHeaders.role', 'Role')}</th>
                  <th className="py-3.5 px-4">
                    <div className="flex items-center gap-1">
                      <Icon name="schedule" className="text-xs" />
                      <span>{t('admin.users.tableHeaders.registeredOn', 'Registration Date & Time')}</span>
                    </div>
                  </th>
                  <th className="py-3.5 px-4 text-right">{t('admin.common.actions', 'Actions')}</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredUsers.map((u) => {
                  const displayName = typeof u?.fullName === 'string' && u.fullName.trim()
                    ? u.fullName
                    : (typeof u?.email === 'string' && u.email.trim() ? u.email : 'User');
                  const initials = displayName
                    .split(' ')
                    .filter(Boolean)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2) || 'U';

                  const isAdmin = u?.role === 'admin';

                  return (
                    <tr
                      key={u?.id || Math.random()}
                      onClick={() => setSelectedUser(u)}
                      className="hover:bg-[#F8FAFC] transition cursor-pointer group"
                    >
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs text-[#0F172A] shrink-0 shadow-2xs ${isAdmin
                              ? 'bg-gradient-to-tr from-purple-700 to-indigo-600'
                              : 'bg-gradient-to-tr from-[#1E3A8A] to-emerald-600'
                              }`}
                          >
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => setSelectedUser(u)}
                              className="font-extrabold text-[#0F172A] group-hover:text-brand-forest hover:underline transition flex items-center gap-1.5 cursor-pointer text-left"
                            >
                              <span>{displayName}</span>
                            </button>
                            <div className="text-[11px] text-[#475569] font-medium truncate max-w-xs">
                              {typeof u?.email === 'string' ? u.email : ''}
                            </div>
                            {Array.isArray(u?.assignedVideosWatched) && u.assignedVideosWatched.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                {u.assignedVideosWatched.slice(0, 2).map((vt, idx) => {
                                  const vtStr = typeof vt === 'string' ? vt : (safeStr(vt) || String(vt || ''));
                                  return (
                                    <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                      <Icon name="play_circle" className="text-[10px]" />
                                      <span className="truncate max-w-[130px]">{vtStr}</span>
                                    </span>
                                  );
                                })}
                                {u.assignedVideosWatched.length > 2 && (
                                  <span className="text-[10px] text-[#475569] font-bold self-center">
                                    +{u.assignedVideosWatched.length - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black ${isAdmin
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                        >
                          <Icon name={isAdmin ? 'verified_user' : 'school'} className="text-xs" />
                          <span>{isAdmin ? 'Admin' : 'Learner'}</span>
                        </span>
                      </td>

                      {/* Registration Date & Exact Time */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-extrabold text-[#0F172A] flex items-center gap-1">
                            <Icon name="event" className="text-[#475569] text-xs" />
                            {formatDateTime(u?.createdAt)}
                          </span>
                          <span className="text-[10px] text-[#475569] font-semibold mt-0.5">
                            {formatRelativeTime(u?.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-brand-forest text-white hover:text-white border border-slate-200 text-xs font-black transition cursor-pointer shadow-2xs"
                            title="View full learner activity, watch history, and progress"
                          >
                            <span>{isSubAdmin ? 'View Full Activity' : t('admin.users.viewProfile', 'View Profile')}</span>
                            <Icon name="arrow_forward" className="text-xs" />
                          </button>

                          {!isSubAdmin && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u?.id, typeof u?.fullName === 'string' ? u.fullName : (typeof u?.email === 'string' ? u.email : 'User'))}
                              className="p-1.5 rounded-xl text-[#475569] hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                              title={t('admin.users.delete', 'Delete User')}
                            >
                              <Icon name="delete" className="text-base" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-[#475569] font-bold">
            <span>Showing {Array.isArray(filteredUsers) ? filteredUsers.length : 0} of {Array.isArray(users) ? users.length : 0} registered accounts</span>
            <span>Click any user row or "View Profile" to view full details</span>
          </div>
        </div>
      )}

      {/* ── USER ACTIVITY DASHBOARD (IN-APP MODAL OVERLAY) ── */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-6xl shadow-2xl border border-slate-200 max-h-[94vh] flex flex-col overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-white">
                  <Icon name="account_circle" className="text-2xl" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Learner Activity: {typeof selectedUser?.fullName === 'string' && selectedUser.fullName.trim() ? selectedUser.fullName : (typeof selectedUser?.email === 'string' ? selectedUser.email : 'Learner')}
                  </h3>
                  <p className="text-xs text-blue-100">
                    Detailed video progress, completions, and submissions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
                title="Close"
              >
                <Icon name="close" className="text-xl" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#F8FAFC]">
              <PanelErrorBoundary panelName="Learner Activity Dashboard">
                <AdminUserActivityDashboard
                  user={selectedUser}
                  api={api}
                  isSubAdmin={isSubAdmin}
                  onBack={() => setSelectedUser(null)}
                />
              </PanelErrorBoundary>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function AssessmentsPanel({ api, isSubAdmin }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState(null);

  const loadCourses = async () => {
    setLoading(true);
    try {
      const list = api?.getCourses ? await api.getCourses() : [];
      setCourses(Array.isArray(list) ? list : []);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [api]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((c) => {
      const title = safeStr(c.title || c.courseName || '').toLowerCase();
      return title.includes(q) || (c.slug || '').toLowerCase().includes(q) || (c.category || '').toLowerCase().includes(q);
    });
  }, [courses, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#0F172A]">Assessments / Quizzes</h1>
          <p className="text-sm text-[#475569] mt-1">
            {isSubAdmin
              ? 'Manage MCQ assessments for your allocated and created courses.'
              : 'Configure mandatory MCQ checkpoints and final quizzes across all courses.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search courses..."
            className="w-56 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          />
          <button
            type="button"
            onClick={loadCourses}
            className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-[#0F172A] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Icon name="sync" className={`text-sm ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-[#475569]">
          <Icon name="sync" className="animate-spin text-2xl text-[#2563EB] mx-auto mb-2" />
          <p className="text-xs font-bold">Loading courses and assessments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center text-[#475569]">
          <Icon name="quiz" className="text-3xl text-slate-400 mx-auto mb-2" />
          <p className="font-bold text-[#0F172A]">No courses found</p>
          <p className="text-xs mt-1">Create a course in Courses & Embedded Playlists to attach assessments.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => {
            let localQuestions = [];
            try {
              const saved = JSON.parse(localStorage.getItem(`course_assessments_${course.slug}`));
              if (Array.isArray(saved)) localQuestions = saved;
            } catch {}
            const questions =
              Array.isArray(course.assessments) && course.assessments.length > 0
                ? course.assessments
                : localQuestions;

            return (
              <div
                key={course.id || course.slug}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-[10px] font-black uppercase">
                      {course.category || 'Course'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold">
                      {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-[#0F172A] line-clamp-2">
                    {safeStr(course.title || course.courseName || course.slug)}
                  </h3>
                  <p className="text-xs text-[#475569] font-mono truncate">{course.slug}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setSelectedCourse(course)}
                    className="w-full px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Icon name="quiz" className="text-sm" />
                    Manage Assessments
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedCourse && (
        <CourseAssessmentModal
          isOpen={Boolean(selectedCourse)}
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onSaved={(updatedCourse) => {
            if (updatedCourse) {
              setCourses((prev) =>
                prev.map((c) =>
                  (c.id && c.id === updatedCourse.id) || (c.slug && c.slug === updatedCourse.slug)
                    ? { ...c, ...updatedCourse }
                    : c
                )
              );
            }
            loadCourses();
          }}
        />
      )}
    </div>
  );
}
