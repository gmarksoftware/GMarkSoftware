import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import { CATEGORIES, fmtDuration, totalMinutes, extractYoutubeId, getYoutubeThumbnailUrl } from '../lib/courses.js';
import { assetUrl } from '../lib/api.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { useAuth } from '../lib/AuthContext.jsx';

/** Udemy-style course card: artwork, title, level, lessons/duration and a FREE price tag. */
export default function CourseCard({ course }) {
  const { lang } = useLanguage();
  const { user } = useAuth();
  // safely handle both plain strings and {en, mr} objects
  const pick = (o) => {
    if (!o) return '';
    if (typeof o === 'string') return o;
    return o[lang] || o.en || '';
  };
  const cat = CATEGORIES.find((c) => c.key === course.category);

  // Course rating calculation from database values
  const avgRating = Number(course.averageRating ?? course.rating ?? 0);
  const totalCount = Number(course.totalRatings ?? course.ratingCount ?? 0);
  const formattedRating = avgRating > 0 ? avgRating.toFixed(1) : '0';

  // Resolve thumbnail: custom thumbnail -> if available; otherwise YouTube thumbnail -> course image
  const firstLessonWithYt = (course.lessons || []).find((l) => l.youtubeVideoId || l.youtube || l.youtubeUrl);
  const ytId = extractYoutubeId(course.youtubeVideoId || course.youtube || course.youtubeUrl || firstLessonWithYt?.youtubeVideoId || firstLessonWithYt?.youtube);
  const displayThumbnail = course.thumbnailUrl || (ytId ? getYoutubeThumbnailUrl(ytId, 'maxresdefault') : null) || course.image || null;

  const targetId = encodeURIComponent(String(course.slug || course.id || '').trim());

  return (
    <Link
      to={`/courses/${targetId}`}
      state={{ course, itemType: 'course' }}
      className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 h-full">
      <div className="relative h-44 bg-gradient-to-br from-[#EFF6FF] to-indigo-50 overflow-hidden">
        {displayThumbnail ? (
          <img
            src={displayThumbnail.startsWith('/uploads') ? assetUrl(displayThumbnail) : displayThumbnail}
            alt={pick(course.title)}
            onError={(e) => {
              if (ytId && e.target.src.includes('maxresdefault.jpg')) {
                e.target.src = getYoutubeThumbnailUrl(ytId, 'hqdefault');
              } else if (course.image && e.target.src !== assetUrl(course.image)) {
                e.target.src = assetUrl(course.image);
              } else {
                e.target.style.display = 'none';
              }
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100/70 relative">
            <Icon name={course.icon || 'school'} className="absolute -left-4 -bottom-4 text-[100px] text-[#2563EB]/15 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500" />
          </div>
        )}
        <div className="absolute right-0 top-3 px-3 py-1 rounded-l-full bg-white/95 border-y border-l border-slate-200 backdrop-blur-xs text-[10px] font-bold text-[#2563EB] shadow-sm z-10 group-hover:bg-[#2563EB] group-hover:text-white transition-colors duration-300">
          {pick(cat)}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1 relative bg-white z-10">
        <div className="flex items-center gap-2 text-[10px] font-bold text-[#475569] uppercase tracking-wider mb-2">
          <span className="bg-blue-50 text-[#2563EB] border border-blue-200 px-2 py-0.5 rounded">• {pick(course.level)}</span>
          <span className="text-slate-500">{(course.lessons || []).length} Lessons</span>
          {((course.lessons || []).some(l => l.youtube || l.file) || course.videoUrl || course.youtube) && (
            <span className="ml-auto bg-teal-50 text-[#0D9488] border border-teal-200 px-2 py-0.5 rounded text-[9px] font-extrabold flex items-center gap-0.5">
              <Icon name="smart_display" className="text-[12px]" /> Video
            </span>
          )}
        </div>
        <h3 className="font-bold text-[#0F172A] text-base leading-snug mb-2 group-hover:text-[#2563EB] transition-colors duration-300 line-clamp-2">{pick(course.title)}</h3>
        <p className="text-xs text-[#475569] mb-4 line-clamp-2">{pick(course.short)}</p>

        {/* Learners and Rating */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-[#475569] mb-4">
          <div className="flex items-center gap-1 text-slate-600">
            <Icon name="person" className="text-[14px] text-[#2563EB]" />
            <span>
              {Number(course.learners) || 0} {(Number(course.learners) || 0) === 1 ? 'learner' : 'learners'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Icon name="star" filled className="text-[14px] text-amber-400" />
            <span className="text-[#0F172A]">{formattedRating}</span>
            {totalCount > 0 && <span className="text-[10px] text-slate-400 font-normal">({totalCount})</span>}
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
          <span className="text-sm font-extrabold text-[#0D9488] uppercase tracking-wider">FREE</span>
          <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#2563EB] to-[#4F46E5] text-white text-xs font-bold group-hover:from-[#1D4ED8] group-hover:to-[#4338CA] shadow-sm transition-all duration-300">
            Start Learning <Icon name="arrow_forward" className="text-[14px] group-hover:translate-x-1 transition-transform duration-300" />
          </span>
        </div>
      </div>
    </Link>
  );
}
