import { BadRequestException } from '@nestjs/common';

const ALLOWED_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
  'www.youtube-nocookie.com',
]);

const YOUTUBE_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/;

export interface YoutubeValidationResult {
  valid: boolean;
  videoId: string | null;
  normalizedUrl: string | null;
  error?: string;
}

/**
 * Validates and extracts an 11-character YouTube video ID from a URL or raw ID.
 * Rejects arbitrary iframe HTML, javascript URLs, unsupported domains, or malformed strings.
 */
export function validateYoutubeUrlOrId(input?: string | null): YoutubeValidationResult {
  if (!input || typeof input !== 'string') {
    return { valid: false, videoId: null, normalizedUrl: null, error: 'YouTube URL or Video ID is required' };
  }

  const trimmed = input.trim();

  // Reject dangerous schemes or HTML
  if (
    trimmed.startsWith('<') ||
    trimmed.includes('<iframe') ||
    trimmed.toLowerCase().startsWith('javascript:') ||
    trimmed.toLowerCase().startsWith('data:')
  ) {
    return {
      valid: false,
      videoId: null,
      normalizedUrl: null,
      error: 'Invalid YouTube input: HTML embed codes, javascript, or script tags are not allowed.',
    };
  }

  // 1. Check if raw 11-char ID was provided
  if (YOUTUBE_ID_REGEX.test(trimmed)) {
    return {
      valid: true,
      videoId: trimmed,
      normalizedUrl: `https://www.youtube.com/watch?v=${trimmed}`,
    };
  }

  // 2. Parse URL
  let parsedUrl: URL;
  try {
    const urlString = trimmed.startsWith('http://') || trimmed.startsWith('https://')
      ? trimmed
      : `https://${trimmed}`;
    parsedUrl = new URL(urlString);
  } catch {
    return {
      valid: false,
      videoId: null,
      normalizedUrl: null,
      error: 'Invalid URL format. Please provide a valid YouTube URL.',
    };
  }

  // Verify hostname is strictly on the allowlist
  const hostname = parsedUrl.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.has(hostname)) {
    return {
      valid: false,
      videoId: null,
      normalizedUrl: null,
      error: `Unsupported host "${hostname}". Only official YouTube URLs are accepted (youtube.com, youtu.be).`,
    };
  }

  let extractedId: string | null = null;

  // Short link: https://youtu.be/VIDEO_ID
  if (hostname === 'youtu.be') {
    const path = parsedUrl.pathname.replace(/^\/+/, '');
    const firstSegment = path.split('/')[0];
    if (firstSegment && YOUTUBE_ID_REGEX.test(firstSegment)) {
      extractedId = firstSegment;
    }
  } else {
    // Shorts: /shorts/VIDEO_ID
    if (parsedUrl.pathname.startsWith('/shorts/')) {
      const parts = parsedUrl.pathname.split('/');
      const id = parts[2];
      if (id && YOUTUBE_ID_REGEX.test(id)) {
        extractedId = id;
      }
    }
    // Live stream: /live/VIDEO_ID
    else if (parsedUrl.pathname.startsWith('/live/')) {
      const parts = parsedUrl.pathname.split('/');
      const id = parts[2];
      if (id && YOUTUBE_ID_REGEX.test(id)) {
        extractedId = id;
      }
    }
    // Embed: /embed/VIDEO_ID
    else if (parsedUrl.pathname.startsWith('/embed/')) {
      const parts = parsedUrl.pathname.split('/');
      const id = parts[2];
      if (id && YOUTUBE_ID_REGEX.test(id)) {
        extractedId = id;
      }
    }
    // Standard watch: /watch?v=VIDEO_ID
    else if (parsedUrl.pathname === '/watch' || parsedUrl.searchParams.has('v')) {
      const v = parsedUrl.searchParams.get('v');
      if (v && YOUTUBE_ID_REGEX.test(v)) {
        extractedId = v;
      }
    }
  }

  if (!extractedId || !YOUTUBE_ID_REGEX.test(extractedId)) {
    return {
      valid: false,
      videoId: null,
      normalizedUrl: null,
      error: 'Could not find a valid 11-character YouTube video ID in the provided URL.',
    };
  }

  return {
    valid: true,
    videoId: extractedId,
    normalizedUrl: `https://www.youtube.com/watch?v=${extractedId}`,
  };
}

/**
 * Throws BadRequestException if the provided URL is not a valid YouTube URL.
 */
export function assertValidYoutubeUrl(urlOrId?: string | null): { videoId: string; normalizedUrl: string } {
  const res = validateYoutubeUrlOrId(urlOrId);
  if (!res.valid || !res.videoId || !res.normalizedUrl) {
    throw new BadRequestException(res.error || 'Invalid YouTube video URL.');
  }
  return { videoId: res.videoId, normalizedUrl: res.normalizedUrl };
}

/**
 * Returns standard high-resolution YouTube thumbnail URL with hqdefault fallback.
 */
export function getYoutubeThumbnailUrl(idOrUrl?: string | null, quality: 'maxresdefault' | 'hqdefault' = 'maxresdefault'): string {
  const res = validateYoutubeUrlOrId(idOrUrl);
  return res.valid && res.videoId ? `https://img.youtube.com/vi/${res.videoId}/${quality}.jpg` : '';
}

