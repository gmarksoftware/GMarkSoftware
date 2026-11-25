/**
 * ALL COURSES  –  every course on the site is FREE.
 *
 * How to add real videos to a lesson (edit the lesson line):
 *   { t: 'Lesson title', min: 8, youtube: 'dQw4w9WgXcQ' }      ← YouTube video ID (the part after ?v=)
 *   { t: 'Lesson title', min: 8, file: '/videos/lesson1.mp4' } ← your own file placed in /public/videos
 * Lessons without a video show a friendly "video coming soon" screen.
 *
 * To add a new course, copy one block below. `trending: true` shows it in the
 * "Trending Courses" strip on the Home page (above "Our Areas of Focus").
 */
import { extractYoutubeId as parseYoutubeId, getYoutubeThumbnailUrl, getLessonThumbnailUrl } from './youtube.js';
import { resolveApiPath } from './api.js';
import { formatTime, parseTimeToSeconds } from './time.js';

export { getYoutubeThumbnailUrl, getLessonThumbnailUrl, formatTime, parseTimeToSeconds };

export const CATEGORIES = [
  { key: 'entrepreneurship', en: 'Entrepreneurship', mr: 'उद्योजकता', icon: 'rocket_launch' },
  { key: 'business', en: 'Business Guidance', mr: 'व्यवसाय मार्गदर्शन', icon: 'business_center' },
  { key: 'digital', en: 'Digital Skills', mr: 'डिजिटल कौशल्ये', icon: 'campaign' },
  { key: 'education', en: 'Education & Skills', mr: 'शिक्षण व कौशल्य', icon: 'school' },
  { key: 'youth', en: 'Youth Development', mr: 'युवा विकास', icon: 'groups' },
  { key: 'social', en: 'Social Development', mr: 'सामाजिक विकास', icon: 'diversity_3' },
];

export const GALLERY_CATEGORIES = [
  'workshops',
  'training',
  'social',
  'community',
  'awareness',
  'events',
  'entrepreneurship',
  'education',
];

export const GALLERY_CATEGORY_MAP = [
  { key: 'workshops', label: 'Workshops' },
  { key: 'training', label: 'Training Programs' },
  { key: 'social', label: 'Social Activities' },
  { key: 'community', label: 'Community Programs' },
  { key: 'awareness', label: 'Awareness Programs' },
  { key: 'events', label: 'Events' },
  { key: 'entrepreneurship', label: 'Entrepreneurship Programs' },
  { key: 'education', label: 'Education & Skill Programs' },
];

export function getGalleryCategoryLabel(key) {
  const match = GALLERY_CATEGORY_MAP.find((c) => c.key === key);
  return match ? match.label : key;
}

export function toGalleryCategoryKey(val) {
  if (!val) return 'education';
  const clean = String(val).trim().toLowerCase();
  const match = GALLERY_CATEGORY_MAP.find(
    (c) => c.key.toLowerCase() === clean || c.label.toLowerCase() === clean
  );
  return match ? match.key : clean;
}

export const DUMMY_COURSE_SLUGS = new Set([
  'html-fundamentals',
  'xcfgh',
  'learning-videos',
  'start-your-own-business',
  'business-planning-and-finance',
  'digital-marketing-for-small-business',
  'customer-management-and-sales',
  'computer-and-excel-basics',
  'spoken-english-for-confidence',
  'youth-leadership-and-mindset',
  'communication-and-public-speaking',
  'social-awareness-and-community-leadership',
  'leadership-and-community-development',
]);

export const DEFAULT_COURSES = [];

export const extractYoutubeId = (urlOrId) => {
  return parseYoutubeId(urlOrId) || '';
};

export const getCourses = () => {
  try {
    // Clear legacy placeholder/dummy default courses so only authentic courses remain
    if (typeof localStorage !== 'undefined' && !localStorage.getItem('admin_courses_clean_v4')) {
      localStorage.removeItem('admin_courses');
      localStorage.setItem('admin_courses_clean_v4', 'true');
    }
    const stored = JSON.parse(localStorage.getItem('admin_courses'));
    if (stored && Array.isArray(stored) && stored.length > 0) {
      const filtered = stored
        .filter(c => {
          if (!c) return false;
          const s = String(c.slug || '').toLowerCase().trim();
          const n = String(c.courseName || (typeof c.title === 'string' ? c.title : c.title?.en) || '').toLowerCase().trim();
          if (n === 'xcfgh' || n === 'learning videos') return false;
          if (DUMMY_COURSE_SLUGS.has(s)) {
            const hasRealLessons = Array.isArray(c.lessons) && c.lessons.length > 0;
            const hasRealVideo = Boolean(c.youtubeVideoId || c.youtubeUrl || c.videoUrl);
            if (!hasRealLessons && !hasRealVideo) return false;
          }
          return true;
        })
        .map(c => {
          // If a course only has legacy sample template lessons, clear them so they never appear
          if (Array.isArray(c.lessons) && c.lessons.length > 0) {
            const hasLegacySample = c.lessons.some(l => {
              const t = l?.t || l?.title;
              return [
                'Welcome & how entrepreneurship works',
                'Finding a business idea that fits you',
                'Why every business needs a plan',
                'One-page business plan',
                'Digital marketing basics',
                'WhatsApp Business & catalogue',
              ].includes(t);
            });
            if (hasLegacySample) {
              return { ...c, lessons: [] };
            }
          }
          return {
            ...c,
            id: c.id || c._id || c.slug,
            _id: c.id || c._id || c.slug,
            courseName: c.courseName || (typeof c.title === 'string' ? c.title : c.title?.en) || c.slug,
          };
        });
      return filtered;
    }
  } catch (e) {}
  return [];
};

export const COURSES = DEFAULT_COURSES;

export const getCourse = (slug) => {
  if (!slug) return undefined;
  const decoded = decodeURIComponent(String(slug)).trim().toLowerCase();
  const normalized = decoded.replace(/[\s_]+/g, '-');
  const list = getCourses();
  const matchCourse = (c) => {
    if (!c) return false;
    const cSlug = String(c.slug || '').toLowerCase();
    const cId = String(c.id || c._id || '').toLowerCase();
    const cTitle = (typeof c.title === 'string' ? c.title : (c.title?.en || c.courseName || '')).toLowerCase();
    return (
      cSlug === decoded ||
      cSlug === normalized ||
      cSlug.replace(/[\s_]+/g, '-') === normalized ||
      cId === decoded ||
      cTitle === decoded
    );
  };
  const found = list.find(matchCourse);
  if (found) return found;
  return DEFAULT_COURSES.find(matchCourse);
};
export const totalMinutes = (c) => (Array.isArray(c?.lessons) ? c.lessons : []).reduce((s, l) => s + (Number(l?.min) || 0), 0);
export const fmtDuration = (m) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m || 0}m`);

export const syncCoursesFromServer = (serverCourses) => {
  if (!Array.isArray(serverCourses)) return getCourses();
  const defaultMap = new Map((DEFAULT_COURSES || []).map(c => [c.slug, c]));
  const merged = serverCourses
    .filter(sc => {
      if (!sc || !sc.slug) return false;
      const s = String(sc.slug).toLowerCase().trim();
      const n = String(sc.courseName || (typeof sc.title === 'string' ? sc.title : sc.title?.en) || '').toLowerCase().trim();
      if (n === 'xcfgh' || n === 'learning videos') return false;
      if (DUMMY_COURSE_SLUGS.has(s)) {
        const hasRealLessons = Array.isArray(sc.lessons) && sc.lessons.length > 0;
        const hasRealVideo = Boolean(sc.youtubeVideoId || sc.youtubeUrl || sc.videoUrl);
        if (!hasRealLessons && !hasRealVideo) return false;
      }
      return true;
    })
    .map(sc => {
    const defaultData = defaultMap.get(sc.slug) || {};
    const localPlaylists = getPlaylists(sc.slug || sc.id) || [];
    const playlistVideos = localPlaylists.flatMap(p => p.videos || []);

    // Only use lessons if actually provided/added by Admin on the course; do not fall back to default template lessons
    let rawLessons = (Array.isArray(sc.lessons) && sc.lessons.length > 0)
      ? sc.lessons.filter(l => {
          const t = l?.t || l?.title;
          return ![
            'Welcome & how entrepreneurship works',
            'Finding a business idea that fits you',
            'Why every business needs a plan',
            'One-page business plan',
          ].includes(t);
        })
      : [];

    if (rawLessons.length === 0 && playlistVideos.length > 0) {
      rawLessons = playlistVideos.map((v, idx) => ({
        id: v.id,
        title: v.title,
        t: v.title,
        youtubeUrl: v.youtubeUrl,
        youtubeVideoId: v.youtubeVideoId,
        youtube: v.youtubeUrl || v.youtubeVideoId,
        thumbnailUrl: v.thumbnailUrl || (v.youtubeVideoId ? `https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg` : null),
        poster: v.thumbnailUrl || (v.youtubeVideoId ? `https://img.youtube.com/vi/${v.youtubeVideoId}/hqdefault.jpg` : null),
        duration: v.duration || '10:00',
        order: idx + 1,
      }));
    }

    const resolvedYtVidId = sc.youtubeVideoId || rawLessons[0]?.youtubeVideoId || playlistVideos[0]?.youtubeVideoId || null;
    const resolvedYtUrl = sc.youtubeUrl || rawLessons[0]?.youtubeUrl || playlistVideos[0]?.youtubeUrl || (resolvedYtVidId ? `https://www.youtube.com/watch?v=${resolvedYtVidId}` : null);

    const syncedLessons = rawLessons.map((l, lIdx) => {
      const ytVidId = l.youtubeVideoId || (lIdx === 0 ? resolvedYtVidId : null) || null;
      const ytUrl = l.youtubeUrl || (lIdx === 0 ? resolvedYtUrl : null) || null;
      const ytDefaultThumb = ytVidId ? `https://img.youtube.com/vi/${ytVidId}/hqdefault.jpg` : null;
      const thumb = l.thumbnailUrl || l.thumbnail || l.poster || ytDefaultThumb || null;
      return {
        ...l,
        title: l.title || l.t || `Lesson ${lIdx + 1}`,
        t: l.t || l.title || `Lesson ${lIdx + 1}`,
        youtube: l.youtubeVideoId || l.youtubeUrl || l.youtube || (lIdx === 0 ? (resolvedYtVidId || resolvedYtUrl) : null) || null,
        youtubeVideoId: ytVidId,
        youtubeUrl: ytUrl,
        thumbnail: thumb,
        thumbnailUrl: thumb,
        poster: thumb,
      };
    });

    const courseYtThumb = resolvedYtVidId ? `https://img.youtube.com/vi/${resolvedYtVidId}/hqdefault.jpg` : null;
    const courseThumbnail = sc.thumbnailUrl || courseYtThumb || syncedLessons[0]?.thumbnailUrl || defaultData.thumbnailUrl || null;

    return {
      ...defaultData,
      ...sc,
      id: sc.id || sc._id || sc.slug,
      _id: sc.id || sc._id || sc.slug,
      courseName: sc.courseName || (typeof sc.title === 'string' ? sc.title : sc.title?.en) || defaultData.courseName || sc.slug,
      title: sc.title || sc.courseName || defaultData.title,
      short: sc.short || sc.shortDescription || defaultData.short,
      category: sc.category || defaultData.category,
      level: sc.level || defaultData.level,
      trending: sc.trending ?? defaultData.trending ?? false,
      status: sc.status || 'Active',
      image: sc.image || courseThumbnail || defaultData.image || null,
      thumbnailUrl: courseThumbnail,
      gradient: sc.gradient || defaultData.gradient || 'from-brand-forest via-brand-deep to-brand-darker',
      videoUrl: sc.videoUrl || resolvedYtUrl || defaultData.videoUrl || null,
      youtubeUrl: resolvedYtUrl || defaultData.youtubeUrl || null,
      youtubeVideoId: resolvedYtVidId || defaultData.youtubeVideoId || null,
      youtube: resolvedYtVidId || resolvedYtUrl || defaultData.youtube || null,
      lessons: syncedLessons,
      learn: (Array.isArray(sc.learn) && sc.learn.length > 0) ? sc.learn : (defaultData.learn || []),
      excelFileName: sc.excelFileName || defaultData.excelFileName || null,
      excelFileUrl: sc.excelFileUrl || defaultData.excelFileUrl || null,
      assessments: Array.isArray(sc.assessments) ? sc.assessments : (defaultData.assessments || []),
      assessmentSettings: sc.assessmentSettings || defaultData.assessmentSettings || {},
    };
  });

  try {
    localStorage.setItem('admin_courses', JSON.stringify(merged));
  } catch {}
  return merged;
};

export const fetchCourses = async () => {
  try {
    const res = await fetch(resolveApiPath('/courses'));
    if (!res.ok) return getCourses();
    const data = await res.json();
    if (Array.isArray(data)) {
      return syncCoursesFromServer(data);
    }
  } catch {}
  return getCourses();
};



export const DEFAULT_PLAYLISTS = [];

export const getPlaylists = (courseSlugOrId) => {
  let list = [];
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('admin_playlists') : null;
    if (raw) list = JSON.parse(raw);
  } catch {}
  if (!Array.isArray(list) || list.length === 0) {
    list = DEFAULT_PLAYLISTS;
  }

  // Filter out legacy dummy playlists and any placeholder videos
  const DUMMY_IDS = new Set([
    'pl-start-biz-masterclass',
    'pl-finance-cashflow',
    'pl-digital-marketing-rural',
    'pl-customer-sales-mastery',
  ]);

  list = list
    .filter((p) => {
      if (!p || DUMMY_IDS.has(p.id)) return false;
      if (p.id && typeof p.id === 'string' && p.id.endsWith('-series') && (!p.videos || p.videos.some((v) => v.youtubeVideoId === 'dQw4w9WgXcQ'))) {
        return false;
      }
      return true;
    })
    .map((p) => {
      const cleanVideos = (Array.isArray(p.videos) ? p.videos : [])
        .filter((v) => v && v.youtubeVideoId !== 'dQw4w9WgXcQ')
        .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
      return {
        ...p,
        videos: cleanVideos,
      };
    });

  if (!courseSlugOrId || courseSlugOrId === 'all') return list;
  const matchTerm = String(courseSlugOrId).toLowerCase().trim();
  return list.filter(
    (p) =>
      String(p.courseSlug || '').toLowerCase().trim() === matchTerm ||
      String(p.courseId || '').toLowerCase().trim() === matchTerm
  );
};

export const syncPlaylistsFromServer = (serverPlaylists, forCourseSlug = null) => {
  if (!Array.isArray(serverPlaylists)) return getPlaylists();
  try {
    if (typeof window !== 'undefined') {
      if (forCourseSlug) {
        const matchTerm = String(forCourseSlug).toLowerCase().trim();
        const current = getPlaylists();
        const remaining = current.filter(
          (p) =>
            String(p.courseSlug || '').toLowerCase().trim() !== matchTerm &&
            String(p.courseId || '').toLowerCase().trim() !== matchTerm
        );
        const merged = [...remaining, ...serverPlaylists];
        localStorage.setItem('admin_playlists', JSON.stringify(merged));
        return merged;
      } else {
        localStorage.setItem('admin_playlists', JSON.stringify(serverPlaylists));
      }
    }
  } catch {}
  return serverPlaylists;
};
