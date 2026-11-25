import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { extractYoutubeId, getYoutubeThumbnailUrl } from '../lib/courses.js';
import { assetUrl } from '../lib/api.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

/**
 * Course Video Playlist Card matching CourseCard 1:1 in dimensions,
 * typography, badges, spacing, and footer CTA.
 */
export default function PlaylistCard({ playlist }) {
  const { lang } = useLanguage();

  const pick = (o) => {
    if (!o) return '';
    if (typeof o === 'string') return o;
    return o[lang] || o.en || '';
  };

  const videoCount = playlist.videos?.length || playlist.videoCount || 0;
  const firstVideo = playlist.videos?.[0];
  const ytId = extractYoutubeId(
    playlist.youtubeVideoId ||
    playlist.youtubeUrl ||
    firstVideo?.youtubeVideoId ||
    firstVideo?.youtubeUrl ||
    firstVideo?.youtube ||
    ''
  );

  const rawThumb =
    playlist.thumbnailUrl ||
    firstVideo?.thumbnailUrl ||
    (ytId ? getYoutubeThumbnailUrl(ytId, 'hqdefault') : '') ||
    '';

  const displayThumb = rawThumb.startsWith('/uploads') ? assetUrl(rawThumb) : rawThumb;
  const targetUrl = `/playlists/${encodeURIComponent(playlist.id)}`;
  const titleText = pick(playlist.title) || 'Untitled Playlist';
  const descText = pick(playlist.description) || (playlist.courseName ? `Curated playlist for ${playlist.courseName}` : 'Explore this video playlist to master practical skills.');

  return (
    <Link
      to={targetUrl}
      state={{ playlist, itemType: 'playlist' }}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 h-full"
    >
      {/* 16:9 Thumbnail Header */}
      <div className="relative h-44 aspect-video w-full bg-gradient-to-br from-[#EFF6FF] to-indigo-50 overflow-hidden">
        {displayThumb ? (
          <img
            src={displayThumb}
            alt={titleText}
            onError={(e) => {
              if (ytId && !e.currentTarget.src.includes('hqdefault.jpg')) {
                e.currentTarget.src = getYoutubeThumbnailUrl(ytId, 'hqdefault');
              } else {
                e.currentTarget.style.display = 'none';
              }
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100/70 text-[#2563EB]/40">
            <Icon name="smart_display" className="text-5xl group-hover:scale-110 transition-transform duration-500" />
          </div>
        )}

        {/* Top-Left Trending Badge if applicable */}
        {playlist.isTrending && (
          <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black flex items-center gap-1 shadow-sm z-10">
            <span>⭐</span>
            <span>Trending</span>
          </div>
        )}

        {/* Top-Right Badge matching Course Card category pill */}
        <div className="absolute right-0 top-3 px-3 py-1 rounded-l-full bg-white/95 border-y border-l border-slate-200 text-[11px] font-bold text-[#2563EB] shadow-sm z-10 group-hover:bg-[#2563EB] group-hover:text-white transition-colors duration-300 flex items-center gap-1">
          <span>{videoCount} {videoCount === 1 ? 'Video' : 'Videos'}</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex flex-col flex-1 relative bg-white z-10">
        {/* Metadata Row: Left Tag + Video Count | Right PLAYLIST pill */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 overflow-hidden text-[11px] font-bold">
            <span className="text-[#2563EB] bg-blue-50 border border-blue-200 px-2 py-0.5 rounded uppercase tracking-wider truncate max-w-[150px]">
              • {playlist.courseName ? playlist.courseName : 'FREE COURSE'}
            </span>
            <span className="text-slate-500 uppercase tracking-wider shrink-0">
              {videoCount} {videoCount === 1 ? 'VIDEO' : 'VIDEOS'}
            </span>
          </div>

          <span className="bg-teal-50 text-[#0D9488] border border-teal-200 px-2 py-0.5 rounded text-[10px] font-extrabold flex items-center gap-1 uppercase tracking-wider shrink-0">
            <Icon name="playlist_play" className="text-[13px]" />
            <span>PLAYLIST</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-[#0F172A] text-[16px] leading-snug mb-2 group-hover:text-[#2563EB] transition-colors duration-300 line-clamp-2">
          {titleText}
        </h3>

        {/* Subtitle / Description */}
        <p className="text-[12.5px] text-[#475569] mb-4 line-clamp-2 leading-relaxed min-h-[38px]">
          {descText}
        </p>

        {/* Stats Line matching Course Card learners/stars row */}
        <div className="flex items-center gap-3 text-[12px] font-semibold text-[#475569] mb-4 min-h-[20px]">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Icon name="smart_display" className="text-[14px] text-[#2563EB]" />
            <span>{videoCount} {videoCount === 1 ? 'video' : 'videos'}</span>
          </div>
          {playlist.isTrending ? (
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Icon name="star" filled className="text-[14px] text-amber-400" />
              <span className="text-[#0F172A]">Trending</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-[#0D9488] font-semibold text-[11px]">
              <Icon name="check_circle" className="text-[13px]" />
              <span>Self-Paced</span>
            </div>
          )}
        </div>

        {/* Divider & Footer CTA */}
        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-[13px] font-bold text-[#0D9488] uppercase tracking-wider">
            FREE
          </span>
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white text-xs font-semibold group-hover:from-[#1D4ED8] group-hover:to-[#4338CA] shadow-sm transition-all duration-300">
            Watch Playlist <Icon name="arrow_forward" className="text-[13px] group-hover:translate-x-1 transition-transform duration-300" />
          </span>
        </div>
      </div>
    </Link>
  );
}

