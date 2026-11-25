import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';
import CourseCard from './CourseCard.jsx';
import PlaylistCard from './PlaylistCard.jsx';
import { CATEGORIES, fetchCourses, getCourses, getPlaylists } from '../lib/courses.js';
import { api, assetUrl } from '../lib/api.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

/** "Trending Courses" strip shown on the Home page, with category tabs between header and videos. */
export default function TrendingCourses() {
  const { t, lang } = useLanguage();
  const [allCourses, setAllCourses] = useState(() => getCourses());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [trendingPlaylists, setTrendingPlaylists] = useState(() => {
    try {
      const pls = getPlaylists('all');
      return Array.isArray(pls) ? pls.filter((p) => p.isTrending) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    fetchCourses().then((data) => {
      if (Array.isArray(data)) setAllCourses(data);
    });

    if (typeof api?.getTrendingPlaylists === 'function') {
      api.getTrendingPlaylists()
        .then((res) => {
          if (Array.isArray(res)) {
            setTrendingPlaylists(res.filter((p) => p.isTrending));
          }
        })
        .catch(() => {
          const pls = getPlaylists('all');
          if (Array.isArray(pls)) {
            setTrendingPlaylists(pls.filter((p) => p.isTrending));
          }
        });
    }
  }, []);

  // Dynamically extract categories from all available courses and CATEGORIES
  const dynamicCategories = useMemo(() => {
    const map = new Map();
    CATEGORIES.forEach((c) => {
      map.set(c.key.toLowerCase(), c[lang] || c.en);
    });

    allCourses.forEach((c) => {
      if (c.category) {
        const key = c.category.toLowerCase().trim();
        if (!map.has(key)) {
          map.set(key, c.category.charAt(0).toUpperCase() + c.category.slice(1));
        }
      }
    });

    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, [allCourses, lang]);

  // Filter courses by category
  const filteredCourses = useMemo(() => {
    if (selectedCategory === 'all') {
      const trending = allCourses.filter((c) => c.trending);
      return trending.length > 0 ? trending : allCourses;
    }
    if (selectedCategory === 'playlists') {
      return [];
    }
    return allCourses.filter(
      (c) => (c.category || '').toLowerCase() === selectedCategory.toLowerCase()
    );
  }, [allCourses, selectedCategory]);

  const displayCourses = filteredCourses.slice(0, 8);

  const tab = (active) =>
    `px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${active
      ? 'border-[#2563EB] text-[#2563EB] font-extrabold'
      : 'border-transparent text-[#475569] hover:text-[#0F172A]'
    }`;

  return (
    <section className="w-full bg-[#F8FAFC] py-16 px-4 md:px-8 lg:px-16 border-t border-slate-200" id="trending">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] mb-3">
            <Icon name="local_fire_department" className="text-[14px]" />
            <span className="text-[10px] font-extrabold uppercase tracking-widest">{t('courses.freeForAll')}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F172A] tracking-tight">{t('courses.trendingTitle')}</h2>
        </div>
        <Link to="/courses" className="inline-flex items-center gap-1 text-sm font-bold text-[#2563EB] hover:underline shrink-0">
          {t('courses.viewAll')} <Icon name="arrow_forward" className="text-[16px]" />
        </Link>
      </div>

      {/* ── CATEGORY TABS (BETWEEN TRENDING HEADER AND VIDEO COURSES) ── */}
      <div className="flex items-center gap-3 border-b border-slate-200 mb-8 pb-1 -mx-1 px-1">
        <div className="flex gap-1 overflow-x-auto min-w-0">
          <button
            type="button"
            className={tab(selectedCategory === 'all')}
            onClick={() => setSelectedCategory('all')}
          >
            {t('courses.all') || 'All'}
          </button>
          {trendingPlaylists.length > 0 && (
            <button
              type="button"
              className={tab(selectedCategory === 'playlists')}
              onClick={() => setSelectedCategory('playlists')}
            >
              Playlists
            </button>
          )}
          {dynamicCategories.map((c) => (
            <button
              key={c.key}
              type="button"
              className={tab(selectedCategory.toLowerCase() === c.key.toLowerCase())}
              onClick={() => setSelectedCategory(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── TRENDING PLAYLISTS (MANUALLY SELECTED BY ADMIN) ── */}
      {(selectedCategory === 'all' || selectedCategory === 'playlists') && trendingPlaylists.length > 0 && (
        <div className="mb-10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <Icon name="playlist_play" className="text-xl" />
              </span>
              <span>Trending Playlists</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-wider">
                ⭐ Trending
              </span>
            </h3>

            <Link
              to="/courses?tab=playlists"
              className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1"
            >
              <span>All Playlists</span>
              <Icon name="arrow_forward" className="text-xs" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {trendingPlaylists.map((pl) => (
              <PlaylistCard key={pl.id} playlist={pl} />
            ))}
          </div>
        </div>
      )}

      {/* ── COURSE VIDEO CARDS GRID ── */}
      {selectedCategory !== 'playlists' && (
        displayCourses.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-xs text-[#475569] shadow-sm">
            No courses found in this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {displayCourses.map((c) => (
              <CourseCard key={c._id || c.slug} course={c} />
            ))}
          </div>
        )
      )}
    </section>
  );
}
