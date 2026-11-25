import { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import CourseCard from '../components/CourseCard.jsx';
import PlaylistCard from '../components/PlaylistCard.jsx';
import { PageHeader, Paras, Section } from '../components/ui.jsx';
import { CATEGORIES, fetchCourses, getCourses, getPlaylists, syncPlaylistsFromServer } from '../lib/courses.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';
import { api } from '../lib/api.js';

// Reliable item type discriminator
export function getItemType(item) {
  if (!item) return 'course';
  if (item.itemType === 'playlist') return 'playlist';
  if (item.itemType === 'course') return 'course';
  if (item.isPlaylist === true || item.isPlaylistVirtualCourse === true) return 'playlist';
  if (Array.isArray(item.videos) && (!Array.isArray(item.lessons) || item.lessons.length === 0)) {
    return 'playlist';
  }
  if (item.videoCount !== undefined && item.lessons === undefined) {
    return 'playlist';
  }
  return 'course';
}

export default function Courses() {
  const { t, lang } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allCourses, setAllCourses] = useState(() => getCourses());
  const [allPlaylists, setAllPlaylists] = useState(() => getPlaylists('all'));

  // Search & Category States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return searchParams.get('tab') === 'playlists' ? 'playlists' : (searchParams.get('category') || 'all');
  });

  useEffect(() => {
    if (searchParams.get('tab') === 'playlists') {
      setSelectedCategory('playlists');
    } else if (searchParams.get('category')) {
      setSelectedCategory(searchParams.get('category'));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchCourses().then((data) => {
      if (Array.isArray(data)) setAllCourses(data);
    });
    if (api?.getAllPlaylists) {
      api.getAllPlaylists()
        .then((data) => {
          if (Array.isArray(data)) {
            setAllPlaylists(data);
            syncPlaylistsFromServer(data);
          }
        })
        .catch(() => {
          setAllPlaylists(getPlaylists('all'));
        });
    }
  }, []);

  // Normalize courses with discriminator
  const normalizedCourses = useMemo(() => {
    const raw = Array.isArray(allCourses) ? allCourses : [];
    return raw
      .filter((c) => getItemType(c) === 'course')
      .map((c) => ({
        ...c,
        itemType: 'course',
        isPlaylist: false,
        id: c.id || c.slug,
        targetId: c.slug || c.id,
      }));
  }, [allCourses]);

  // Normalize playlists with discriminator
  const normalizedPlaylists = useMemo(() => {
    const raw = Array.isArray(allPlaylists) ? allPlaylists : [];
    const rawCourses = Array.isArray(allCourses) ? allCourses : [];
    const playlistsInCourses = rawCourses.filter((c) => getItemType(c) === 'playlist');
    const combined = [...raw, ...playlistsInCourses];

    const seen = new Set();
    const result = [];
    for (const pl of combined) {
      if (!pl) continue;
      const key = String(pl.id || pl.slug || '');
      if (!key || seen.has(key)) continue;
      seen.add(key);
      result.push({
        ...pl,
        itemType: 'playlist',
        isPlaylist: true,
        id: pl.id || key,
        targetId: pl.id || key,
      });
    }
    return result;
  }, [allPlaylists, allCourses]);

  // Combined single list of courses and playlists
  const combinedItems = useMemo(() => {
    return [...normalizedCourses, ...normalizedPlaylists];
  }, [normalizedCourses, normalizedPlaylists]);

  // Dynamically extract categories from all available courses and playlists
  const dynamicCategories = useMemo(() => {
    const map = new Map();
    // Pre-populate with known CATEGORIES for nice localized labels
    CATEGORIES.forEach((c) => {
      map.set(c.key.toLowerCase(), c[lang] || c.en);
    });

    // Add any existing database course or playlist categories
    combinedItems.forEach((item) => {
      if (item.category) {
        const key = item.category.toLowerCase().trim();
        if (!map.has(key)) {
          map.set(key, item.category.charAt(0).toUpperCase() + item.category.slice(1));
        }
      }
    });

    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, [combinedItems, lang]);

  // Single unified filter for both courses and playlists
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return combinedItems.filter((item) => {
      // 1. Tab / Category Filter
      if (selectedCategory === 'playlists') {
        if (item.itemType !== 'playlist') return false;
      } else if (selectedCategory !== 'all') {
        const itemCat = (item.category || '').toLowerCase().trim();
        const targetCat = selectedCategory.toLowerCase().trim();
        if (itemCat !== targetCat) return false;
      }

      // 2. Search Query Filter
      if (q) {
        const title = (typeof item.title === 'string' ? item.title : (item.title?.en || item.title?.mr || '')).toLowerCase();
        const courseName = (item.courseName || '').toLowerCase();
        const desc = (typeof item.description === 'string' ? item.description : (item.description?.en || item.description?.mr || '')).toLowerCase();
        const matches = title.includes(q) || courseName.includes(q) || desc.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [combinedItems, selectedCategory, searchQuery]);

  const tab = (active) =>
    `px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${active
      ? 'border-[#2563EB] text-[#2563EB] font-extrabold'
      : 'border-transparent text-[#475569] hover:text-[#0F172A]'
    }`;

  return (
    <>
      <PageHeader title={t('courses.title')} tagline={t('courses.tagline')} icon="school" />

      <Section id="all-courses" title={t('courses.catalogTitle')}>
        {/* ── COURSE SEARCH BAR ── */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 mb-6 shadow-sm">
          <div className="relative">
            <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2563EB] text-lg pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses by name..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 bg-[#F8FAFC] text-xs sm:text-sm font-medium text-[#0F172A] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A] p-1 cursor-pointer"
                title="Clear search"
              >
                <Icon name="close" className="text-sm" />
              </button>
            )}
          </div>

          {searchQuery.trim() && (
            <div className="flex items-center justify-between text-xs font-bold text-[#475569] pt-2.5 mt-2.5 border-t border-slate-200">
              <span>
                Showing {filteredItems.length} {filteredItems.length === 1 ? 'result' : 'results'} for &quot;{searchQuery}&quot;
              </span>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold transition cursor-pointer"
              >
                <Icon name="close" className="text-xs" />
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-200 mb-8 pb-1 -mx-1 px-1">
          <div className="flex gap-1 overflow-x-auto min-w-0">
            <button
              className={tab(selectedCategory === 'all')}
              onClick={() => { setSelectedCategory('all'); setSearchParams({}); }}
            >
              {t('courses.all')}
            </button>
            <button
              className={`${tab(selectedCategory === 'playlists')} flex items-center gap-1.5`}
              onClick={() => { setSelectedCategory('playlists'); setSearchParams({ tab: 'playlists' }); }}
            >
              <Icon name="playlist_play" className="text-base text-[#0D9488]" />
              <span>{t('nav.coursePlaylists', 'Course Video Playlists')}</span>
            </button>
            {dynamicCategories.map((c) => (
              <button
                key={c.key}
                className={tab(selectedCategory.toLowerCase() === c.key.toLowerCase())}
                onClick={() => { setSelectedCategory(c.key); setSearchParams({ category: c.key }); }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Single Unified Responsive Grid for Both Courses and Playlists (No Vertical Stacking) */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => {
              const isPlaylist = item.itemType === 'playlist' || getItemType(item) === 'playlist';
              return isPlaylist ? (
                <PlaylistCard key={`pl-${item.id}`} playlist={item} />
              ) : (
                <CourseCard key={`course-${item.id || item.slug}`} course={item} />
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-sm">
            <Icon name="search_off" className="text-4xl text-slate-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#0F172A] mb-1">
              {selectedCategory === 'playlists' ? 'No playlists found' : 'No courses found'}
            </h3>
            <p className="text-xs text-[#475569] max-w-md mx-auto mb-4">
              {searchQuery.trim()
                ? `We couldn't find any results matching "${searchQuery}".`
                : selectedCategory === 'playlists'
                  ? 'Playlists will appear here once added by administrators.'
                  : 'No courses available in this category.'}
            </p>
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition cursor-pointer shadow-sm"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </Section>
    </>
  );
}
