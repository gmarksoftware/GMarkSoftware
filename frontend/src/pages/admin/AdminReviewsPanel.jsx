import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../components/Icon.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

function formatDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatExactDateTime(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export default function AdminReviewsPanel({ api }) {
  const { t, lang } = useLanguage();
  const [reviews, setReviews] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);
  const [notification, setNotification] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedRating, setSelectedRating] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'highest' | 'lowest'

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadReviewsData = async () => {
    setLoading(true);
    try {
      const [revs, sum] = await Promise.all([
        api.getReviews({
          courseId: selectedCourse !== 'all' ? selectedCourse : undefined,
          rating: selectedRating !== 'all' ? selectedRating : undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
          search: searchQuery.trim() || undefined,
        }).catch(() => []),
        api.getReviewsSummary(selectedCourse !== 'all' ? selectedCourse : undefined).catch(() => null),
      ]);
      setReviews(Array.isArray(revs) ? revs : []);
      setSummary(sum);
    } catch (err) {
      console.warn('Failed to load reviews data:', err);
      showNotification('Failed to load reviews data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviewsData();
  }, [selectedCourse, selectedRating, selectedStatus]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      loadReviewsData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleToggleStatus = async (review) => {
    const newStatus = review.status === 'hidden' ? 'published' : 'hidden';
    setUpdatingId(review.id);
    try {
      await api.updateReviewStatus(review.id, newStatus);
      showNotification(
        newStatus === 'hidden'
          ? (lang === 'mr' ? 'पुनरावलोकन लपवले गेले. हे आता अभ्यासक्रम पृष्ठावर दिसणार नाही.' : 'Review hidden successfully. It is now excluded from student course page.')
          : (lang === 'mr' ? 'पुनरावलोकन यशस्वीरित्या प्रकाशित केले गेले.' : 'Review published successfully. It is now visible on student course page.')
      );
      // Update local review state immediately
      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, status: newStatus } : r))
      );
      if (selectedReview && selectedReview.id === review.id) {
        setSelectedReview((prev) => ({ ...prev, status: newStatus }));
      }
      // Refresh summary in background to update real averages
      api.getReviewsSummary(selectedCourse !== 'all' ? selectedCourse : undefined).then((sum) => {
        if (sum) setSummary(sum);
      });
    } catch (err) {
      console.error('Failed to update review status:', err);
      showNotification(err.message || (lang === 'mr' ? 'पुनरावलोकन स्थिती अपडेट करण्यात अयशस्वी' : 'Failed to update review status'), 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCourse('all');
    setSelectedRating('all');
    setSelectedStatus('all');
    setSortBy('newest');
  };

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    selectedCourse !== 'all' ||
    selectedRating !== 'all' ||
    selectedStatus !== 'all' ||
    sortBy !== 'newest'
  );

  // Sorted reviews
  const displayedReviews = useMemo(() => {
    return [...reviews].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === 'highest') {
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      }
      if (sortBy === 'lowest') {
        return (Number(a.rating) || 0) - (Number(b.rating) || 0);
      }
      return 0;
    });
  }, [reviews, sortBy]);

  // Course list options from summary
  const courseOptions = useMemo(() => {
    if (summary && Array.isArray(summary.courses)) {
      return summary.courses;
    }
    return [];
  }, [summary]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-xs font-bold transition-all ${
            notification.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          <Icon name={notification.type === 'error' ? 'error' : 'check_circle'} className="text-base" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* ── 1. COURSE RATING SUMMARY SECTION ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Overall Rating Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">
                {lang === 'mr' ? 'अभ्यासक्रम रेटिंग सारांश' : 'Course Rating Summary'}
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-50 text-[#0F172A]">
                {selectedCourse === 'all'
                  ? (lang === 'mr' ? 'सर्व अभ्यासक्रम' : 'All Courses')
                  : (lang === 'mr' ? 'निवडलेला अभ्यासक्रम' : 'Selected Course')}
              </span>
            </div>

            <div className="flex items-baseline gap-3 my-2">
              <span className="text-4xl font-black text-[#0F172A]">
                {summary ? summary.averageRating.toFixed(1) : '0.0'}
              </span>
              <div className="flex flex-col">
                <div className="flex items-center text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Icon
                      key={s}
                      name="star"
                      filled={s <= Math.round(summary?.averageRating || 0)}
                      className={`text-base ${
                        s <= Math.round(summary?.averageRating || 0)
                          ? 'text-amber-400'
                          : 'text-[#0F172A]'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[11px] text-[#475569] mt-0.5">
                  {lang === 'mr' ? '५.० पैकी तारे' : 'out of 5.0 stars'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 mt-2 border-t border-slate-200 text-center">
            <div className="bg-slate-50 rounded-xl p-2.5">
              <span className="block text-base font-extrabold text-[#0F172A]">
                {summary ? summary.totalReviews : 0}
              </span>
              <span className="text-[10px] font-medium text-[#475569]">
                {lang === 'mr' ? 'एकूण अभिप्राय' : 'Active Reviews'}
              </span>
            </div>
            <div className="bg-emerald-50 rounded-xl p-2.5">
              <span className="block text-base font-extrabold text-emerald-700">
                {summary ? summary.publishedCount : 0}
              </span>
              <span className="text-[10px] font-medium text-emerald-600">
                {t('admin.common.published', 'Published')}
              </span>
            </div>
            <div className="bg-slate-100 rounded-xl p-2.5">
              <span className="block text-base font-extrabold text-[#475569]">
                {summary ? summary.hiddenCount : 0}
              </span>
              <span className="text-[10px] font-medium text-[#475569]">
                {lang === 'mr' ? 'लपवलेले' : 'Hidden'}
              </span>
            </div>
          </div>
        </div>

        {/* Rating Breakdown Distribution (Real values) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">
              {lang === 'mr' ? 'रेटिंग वितरण' : 'Rating Distribution'}
            </span>
          </div>

          <div className="space-y-2 mt-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = summary?.distribution?.[star] || 0;
              const pct = summary?.percentages?.[star] || 0;
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1 w-12 font-bold text-[#0F172A] shrink-0">
                    <span>{star}</span>
                    <Icon name="star" filled className="text-amber-400 text-xs" />
                  </div>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-bold text-[#0F172A] shrink-0">
                    {pct}%
                  </span>
                  <span className="w-12 text-right text-[11px] text-[#475569] shrink-0">
                    ({count})
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 2. FILTERS & SEARCH ROW ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Icon
              name="search"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569] text-sm pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('admin.reviews.searchPlaceholder', 'Search course, student or review...')}
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-blue-200 transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#0F172A] p-0.5"
                title={lang === 'mr' ? 'शोध साफ करा' : 'Clear search'}
              >
                <Icon name="close" className="text-xs" />
              </button>
            )}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-[#475569] whitespace-nowrap">
              {lang === 'mr' ? 'क्रमवारी:' : 'Sort:'}
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-2.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-[#0F172A] bg-white focus:outline-none focus:border-blue-200 cursor-pointer"
            >
              <option value="newest">{lang === 'mr' ? 'नवीनतम प्रथम' : 'Newest First'}</option>
              <option value="oldest">{lang === 'mr' ? 'जुने प्रथम' : 'Oldest First'}</option>
              <option value="highest">{lang === 'mr' ? 'उच्च रेटिंग' : 'Highest Rating'}</option>
              <option value="lowest">{lang === 'mr' ? 'कमी रेटिंग' : 'Lowest Rating'}</option>
            </select>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-200">
          {/* Course Filter */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
              {t('admin.courseEditor.courseTitle', 'Course')}
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-blue-200 cursor-pointer"
            >
              <option value="all">{t('admin.reviews.filterCourse', 'All Courses')}</option>
              {courseOptions.map((c) => (
                <option key={c.id || c.slug} value={c.slug}>
                  {c.name} ({c.totalReviews || 0})
                </option>
              ))}
            </select>
          </div>

          {/* Rating Filter */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
              {lang === 'mr' ? 'रेटिंग' : 'Rating'}
            </label>
            <select
              value={selectedRating}
              onChange={(e) => setSelectedRating(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-blue-200 cursor-pointer"
            >
              <option value="all">{t('admin.reviews.filterRating', 'All Ratings')}</option>
              <option value="5">{lang === 'mr' ? '५ तारे' : '5 Stars'}</option>
              <option value="4">{lang === 'mr' ? '४ तारे' : '4 Stars'}</option>
              <option value="3">{lang === 'mr' ? '३ तारे' : '3 Stars'}</option>
              <option value="2">{lang === 'mr' ? '२ तारे' : '2 Stars'}</option>
              <option value="1">{lang === 'mr' ? '१ तारा' : '1 Star'}</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
              {t('admin.common.status', 'Status')}
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-blue-200 cursor-pointer"
            >
              <option value="all">{t('admin.reviews.filterStatus', 'All Statuses')}</option>
              <option value="published">{lang === 'mr' ? 'प्रकाशित / सक्रिय' : 'Published / Active'}</option>
              <option value="hidden">{lang === 'mr' ? 'लपवलेले' : 'Hidden'}</option>
            </select>
          </div>
        </div>

        {/* Results Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
          <span className="font-bold text-[#475569]">
            {lang === 'mr'
              ? `${displayedReviews.length} अभिप्राय दाखवत आहे`
              : `Showing ${displayedReviews.length} ${displayedReviews.length === 1 ? 'review' : 'reviews'}`}
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-50 border border-red-200 text-xs font-bold transition cursor-pointer"
            >
              <Icon name="filter_alt_off" className="text-xs" />
              {lang === 'mr' ? 'फिल्टर साफ करा' : 'Clear Filters'}
            </button>
          )}
        </div>
      </div>

      {/* ── 3. REVIEWS TABLE ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#475569] flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-blue-200 border-t-transparent rounded-full animate-spin" />
            {lang === 'mr' ? 'अभ्यासक्रम अभिप्राय लोड होत आहेत...' : 'Loading course reviews...'}
          </div>
        ) : displayedReviews.length === 0 ? (
          <div className="p-12 text-center">
            <Icon name="star_outline" className="text-4xl text-[#475569] mx-auto mb-2" />
            <h4 className="text-sm font-bold text-[#0F172A]">
              {t('admin.reviews.noReviewsFound', 'No reviews found')}
            </h4>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="mt-3 px-3 py-1.5 rounded-lg bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition cursor-pointer"
              >
                {lang === 'mr' ? 'फिल्टर साफ करा' : 'Clear Filters'}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">
                  <th className="py-3 px-4">{t('admin.courseEditor.courseTitle', 'Course')}</th>
                  <th className="py-3 px-4">{t('admin.users.tableHeaders.user', 'Student')}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'रेटिंग' : 'Rating'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'अभिप्राय' : 'Review'}</th>
                  <th className="py-3 px-4">{lang === 'mr' ? 'दिनांक' : 'Date'}</th>
                  <th className="py-3 px-4">{t('admin.common.status', 'Status')}</th>
                  <th className="py-3 px-4 text-right">{t('admin.common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {displayedReviews.map((rev) => {
                  const isHidden = rev.status === 'hidden';
                  const isUpdating = updatingId === rev.id;

                  return (
                    <tr
                      key={rev.id}
                      className={`hover:bg-slate-100 transition-colors ${
                        isHidden ? 'bg-slate-50 opacity-75' : ''
                      }`}
                    >
                      {/* Course */}
                      <td className="py-3.5 px-4 font-bold text-[#0F172A] max-w-[180px]">
                        <span className="block truncate" title={rev.courseName}>
                          {rev.courseName}
                        </span>
                        <span className="text-[10px] text-[#475569] font-normal">
                          {rev.courseSlug}
                        </span>
                      </td>

                      {/* Student */}
                      <td className="py-3.5 px-4 font-semibold text-[#0F172A] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-50 text-[#0F172A] text-xs font-bold flex items-center justify-center shrink-0">
                            {(rev.userName || 'S').charAt(0).toUpperCase()}
                          </div>
                          <span>{rev.userName || (lang === 'mr' ? 'विद्यार्थी' : 'Student')}</span>
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <div className="flex text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Icon
                                key={s}
                                name="star"
                                filled={s <= rev.rating}
                                className={`text-xs ${
                                  s <= rev.rating ? 'text-amber-400' : 'text-[#0F172A]'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="font-extrabold text-[#0F172A] ml-1">
                            {rev.rating}.0
                          </span>
                        </div>
                      </td>

                      {/* Review snippet */}
                      <td className="py-3.5 px-4 text-[#475569] max-w-[260px]">
                        {rev.review ? (
                          <p
                            className="truncate italic cursor-pointer hover:text-[#0F172A]"
                            onClick={() => setSelectedReview(rev)}
                            title={lang === 'mr' ? 'संपूर्ण अभिप्राय पाहण्यासाठी क्लिक करा' : 'Click to view full review'}
                          >
                            "{rev.review}"
                          </p>
                        ) : (
                          <span className="text-[#475569] italic">
                            {lang === 'mr' ? 'कोणताही लेखी अभिप्राय नाही' : 'No written feedback'}
                          </span>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#475569] whitespace-nowrap">
                        {formatDate(rev.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isHidden ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-100 text-[#475569] border border-slate-200">
                            <Icon name="visibility_off" className="text-xs" />
                            {lang === 'mr' ? 'लपवलेले' : 'Hidden'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Icon name="check_circle" className="text-xs" />
                            {t('admin.common.published', 'Published')}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {/* View Button */}
                          <button
                            type="button"
                            onClick={() => setSelectedReview(rev)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 text-[#0F172A] hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
                            title={lang === 'mr' ? 'अभिप्राय तपशील पहा' : 'View review details'}
                          >
                            {t('admin.common.view', 'View')}
                          </button>

                          {/* Hide / Publish Button */}
                          <button
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleToggleStatus(rev)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50 ${
                              isHidden
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-500/25 border border-emerald-200'
                                : 'bg-amber-50 text-amber-700 hover:bg-amber-500/25 border border-amber-200'
                            }`}
                            title={
                              isHidden
                                ? (lang === 'mr' ? 'हा अभिप्राय प्रकाशित करा' : 'Publish this review')
                                : (lang === 'mr' ? 'हा अभिप्राय लपवा' : 'Hide this review from student view')
                            }
                          >
                            <Icon name={isHidden ? 'visibility' : 'visibility_off'} className="text-xs" />
                            {isUpdating ? '...' : isHidden ? (lang === 'mr' ? 'प्रकाशित करा' : 'Publish') : (lang === 'mr' ? 'लपवा' : 'Hide')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 4. VIEW REVIEW MODAL ── */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] block">
                  {lang === 'mr' ? 'विद्यार्थी अभिप्राय तपशील' : 'Learner Review Details'}
                </span>
                <h3 className="text-base font-extrabold text-[#0F172A] mt-0.5">
                  {selectedReview.courseName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-[#475569] flex items-center justify-center transition cursor-pointer"
              >
                <Icon name="close" className="text-base" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0F172A] font-bold text-sm flex items-center justify-center">
                    {(selectedReview.userName || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <span className="font-extrabold text-[#0F172A] block text-sm">
                      {selectedReview.userName || (lang === 'mr' ? 'विद्यार्थी' : 'Student')}
                    </span>
                    <span className="text-[11px] text-[#475569]">
                      User ID: {selectedReview.userId}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Icon
                        key={s}
                        name="star"
                        filled={s <= selectedReview.rating}
                        className={`text-sm ${
                          s <= selectedReview.rating ? 'text-amber-400' : 'text-[#0F172A]'
                        }`}
                      />
                    ))}
                    <span className="font-black text-[#0F172A] text-sm ml-1">
                      {selectedReview.rating}.0
                    </span>
                  </div>
                  <span className="text-[10px] text-[#475569]">
                    {formatExactDateTime(selectedReview.createdAt)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                  {lang === 'mr' ? 'अभिप्राय मजकूर:' : 'Review Content:'}
                </label>
                {selectedReview.review ? (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-[#0F172A] text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                    "{selectedReview.review}"
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-[#475569] italic">
                    {lang === 'mr' ? 'कोणताही लेखी अभिप्राय जोडलेला नाही.' : 'Student rated this course without submitting written feedback.'}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <div>
                  <span className="text-[#475569] font-medium mr-2">
                    {lang === 'mr' ? 'सध्याची स्थिती:' : 'Current Status:'}
                  </span>
                  {selectedReview.status === 'hidden' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-[#475569] border border-slate-200">
                      <Icon name="visibility_off" className="text-xs" />
                      {lang === 'mr' ? 'अभ्यासक्रम पृष्ठावरून लपवलेले' : 'Hidden from Course Page'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Icon name="check_circle" className="text-xs" />
                      {lang === 'mr' ? 'अभ्यासक्रम पृष्ठावर प्रकाशित' : 'Published on Course Page'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => handleToggleStatus(selectedReview)}
                disabled={updatingId === selectedReview.id}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  selectedReview.status === 'hidden'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-[#0F172A]'
                    : 'bg-amber-600 hover:bg-amber-700 text-[#0F172A]'
                }`}
              >
                <Icon
                  name={selectedReview.status === 'hidden' ? 'visibility' : 'visibility_off'}
                  className="text-sm"
                />
                {updatingId === selectedReview.id
                  ? '...'
                  : selectedReview.status === 'hidden'
                  ? (lang === 'mr' ? 'अभिप्राय प्रकाशित करा' : 'Publish Review')
                  : (lang === 'mr' ? 'अभिप्राय लपवा' : 'Hide Review')}
              </button>

              <button
                type="button"
                onClick={() => setSelectedReview(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-[#0F172A] hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
              >
                {t('admin.common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
