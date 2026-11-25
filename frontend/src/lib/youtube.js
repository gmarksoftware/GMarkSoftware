/**
 * Utility functions for YouTube URL validation, video ID extraction, and embed URLs.
 */

const ALLOWED_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtube-nocookie.com',
]);

export const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

/**
 * Extracts an 11-character YouTube video ID from a URL, embed string, or raw ID.
 * Returns null if the input is not a valid YouTube ID or URL.
 */
export function extractYoutubeId(input) {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // Guard against HTML tags or script injection
  if (trimmed.startsWith('<') || trimmed.toLowerCase().includes('javascript:') || trimmed.toLowerCase().includes('<iframe')) {
    return null;
  }

  // Raw 11-char ID
  if (YOUTUBE_ID_REGEX.test(trimmed)) {
    return trimmed;
  }

  try {
    const urlString = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(urlString);
    const host = parsed.hostname.toLowerCase();

    if (!ALLOWED_HOSTS.has(host)) {
      return null;
    }

    if (host === 'youtu.be') {
      const id = parsed.pathname.replace(/^\/+/, '').split('/')[0];
      return YOUTUBE_ID_REGEX.test(id) ? id : null;
    }

    if (parsed.pathname.startsWith('/shorts/')) {
      const id = parsed.pathname.split('/')[2];
      return id && YOUTUBE_ID_REGEX.test(id) ? id : null;
    }

    if (parsed.pathname.startsWith('/live/')) {
      const id = parsed.pathname.split('/')[2];
      return id && YOUTUBE_ID_REGEX.test(id) ? id : null;
    }

    if (parsed.pathname.startsWith('/embed/')) {
      const id = parsed.pathname.split('/')[2];
      return id && YOUTUBE_ID_REGEX.test(id) ? id : null;
    }

    if (parsed.pathname === '/watch' || parsed.searchParams.has('v')) {
      const id = parsed.searchParams.get('v');
      return id && YOUTUBE_ID_REGEX.test(id) ? id : null;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Checks if a string is a valid YouTube URL or video ID.
 */
export function isValidYoutubeUrl(input) {
  return !!extractYoutubeId(input);
}

/**
 * Returns optimized embed URL for YouTube.
 * Disables native YouTube controls, branding, and cross-origin mismatches.
 */
export function getYoutubeEmbedUrl(idOrUrl, autoPlay = false, startSeconds = 0) {
  const id = extractYoutubeId(idOrUrl);
  if (!id) return '';
  const origin = typeof window !== 'undefined' && window.location ? window.location.origin : '';
  const params = new URLSearchParams({
    enablejsapi: '1',
    rel: '0',
    modestbranding: '1',
    controls: '0',
    disablekb: '1',
    iv_load_policy: '3',
    playsinline: '1',
    fs: '0',
    autoplay: autoPlay ? '1' : '0',
    cc_lang_pref: 'en',
    cc_load_policy: '1',
  });
  if (origin) {
    params.set('origin', origin);
  }
  if (typeof startSeconds === 'number' && startSeconds > 0) {
    params.set('start', String(Math.floor(startSeconds)));
  }
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}

/**
 * Returns standard high-resolution YouTube thumbnail.
 * Defaults to maxresdefault.jpg with fallback support.
 */
export function getYoutubeThumbnailUrl(idOrUrl, quality = 'maxresdefault') {
  const id = extractYoutubeId(idOrUrl);
  return id ? `https://img.youtube.com/vi/${id}/${quality}.jpg` : '';
}

/**
 * Resolves the display thumbnail for a lesson or course.
 * Uses custom thumbnail if available; otherwise falls back to automatic YouTube thumbnail.
 */
export function getLessonThumbnailUrl(lesson, course) {
  if (lesson?.thumbnailUrl) return lesson.thumbnailUrl;
  if (lesson?.thumbnail) return lesson.thumbnail;
  const lessonYtId = extractYoutubeId(lesson?.youtubeVideoId || lesson?.youtube || lesson?.youtubeUrl || lesson?.file);
  if (lessonYtId) return getYoutubeThumbnailUrl(lessonYtId);
  if (course?.thumbnailUrl) return course.thumbnailUrl;
  if (course?.image) return course.image;
  const courseYtId = extractYoutubeId(course?.youtubeVideoId || course?.youtube || course?.youtubeUrl || course?.videoUrl);
  if (courseYtId) return getYoutubeThumbnailUrl(courseYtId);
  return '';
}

