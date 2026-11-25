import React, { useState, useEffect, useMemo } from 'react';
import Icon from '../../components/Icon.jsx';
import { useLanguage } from '../../i18n/LanguageContext.jsx';

function formatExactDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
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
    hour12: true,
  });
}

export default function AdminQueriesPanel({ api }) {
  const { t, lang } = useLanguage();
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'Pending' | 'Answered' | 'Closed'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  
  // Reply handling state
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Notification
  const [notice, setNotice] = useState(null);

  const showNotice = (msg, type = 'success') => {
    setNotice({ msg, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const loadQueries = async () => {
    setLoading(true);
    try {
      const data = await api.getQueries('all');
      setQueries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load queries:', err);
      showNotice(err.message || 'Failed to load student queries', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueries();
  }, []);

  // Compute status counts for tabs
  const counts = useMemo(() => {
    let pending = 0;
    let answered = 0;
    let closed = 0;

    queries.forEach((q) => {
      const s = (q.status || '').toLowerCase();
      if (s === 'closed') {
        closed++;
      } else if (s === 'answered' || s === 'resolved' || !!q.adminReply) {
        answered++;
      } else {
        pending++;
      }
    });

    return {
      all: queries.length,
      pending,
      answered,
      closed,
    };
  }, [queries]);

  // Unique course list for filtering
  const coursesList = useMemo(() => {
    const map = new Map();
    queries.forEach((q) => {
      if (q.courseSlug) {
        map.set(q.courseSlug, q.courseName || q.courseSlug);
      }
    });
    return Array.from(map.entries()).map(([slug, name]) => ({ slug, name }));
  }, [queries]);

  // Filtered queries based on tabs, course, and search
  const filteredQueries = useMemo(() => {
    return queries.filter((q) => {
      const s = (q.status || '').toLowerCase();
      const isAns = s === 'answered' || s === 'resolved' || !!q.adminReply;
      const isClo = s === 'closed';
      const isPen = !isAns && !isClo;

      // Status tab filter
      if (statusFilter === 'Pending' && !isPen) return false;
      if (statusFilter === 'Answered' && !isAns) return false;
      if (statusFilter === 'Closed' && !isClo) return false;

      // Course filter
      if (selectedCourse !== 'all' && q.courseSlug !== selectedCourse) return false;

      // Search query filter (matches student name, email, subject, message, course)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = (q.userName || '').toLowerCase().includes(query);
        const matchesEmail = (q.userEmail || '').toLowerCase().includes(query);
        const matchesSubject = (q.subject || '').toLowerCase().includes(query);
        const matchesMessage = (q.message || '').toLowerCase().includes(query);
        const matchesCourse = (q.courseName || q.courseSlug || '').toLowerCase().includes(query);
        if (!matchesName && !matchesEmail && !matchesSubject && !matchesMessage && !matchesCourse) {
          return false;
        }
      }

      return true;
    });
  }, [queries, statusFilter, selectedCourse, searchQuery]);

  // Handle submitting an answer
  const handleSendAnswer = async (queryId) => {
    if (!replyText.trim()) {
      showNotice(lang === 'mr' ? 'कृपया पाठवण्यापूर्वी उत्तर लिहा.' : 'Please write an answer before sending.', 'error');
      return;
    }
    setSubmittingReply(true);
    try {
      const answer = replyText.trim();
      const updated = await api.replyQuery(queryId, answer, 'Answered');
      
      // Update local state
      setQueries((prev) =>
        prev.map((q) =>
          q.id === queryId
            ? {
                ...q,
                adminReply: answer,
                status: 'Answered',
                resolvedAt: updated?.resolvedAt || new Date().toISOString(),
              }
            : q
        )
      );

      setReplyingId(null);
      setReplyText('');
      showNotice(
        lang === 'mr'
          ? 'उत्तर यशस्वीरित्या पाठवले गेले! विद्यार्थी आता त्यांच्या डॅशबोर्डवर हे पाहू शकतात.'
          : 'Answer sent successfully! The student can now see it in their dashboard.'
      );
    } catch (err) {
      console.error('Error replying to query:', err);
      showNotice(err.message || (lang === 'mr' ? 'उत्तर पाठवण्यात अयशस्वी. कृपया पुन्हा प्रयत्न करा.' : 'Failed to send answer. Please try again.'), 'error');
    } finally {
      setSubmittingReply(false);
    }
  };

  // Handle status update (Pending / Answered / Closed)
  const handleUpdateStatus = async (queryId, newStatus) => {
    setActionLoadingId(queryId);
    try {
      await api.updateQueryStatus(queryId, newStatus);
      setQueries((prev) =>
        prev.map((q) =>
          q.id === queryId
            ? {
                ...q,
                status: newStatus,
                resolvedAt:
                  newStatus === 'Answered' || newStatus === 'Resolved'
                    ? q.resolvedAt || new Date().toISOString()
                    : newStatus === 'Pending'
                    ? null
                    : q.resolvedAt,
              }
            : q
        )
      );
      showNotice(lang === 'mr' ? `प्रश्नाची स्थिती ${newStatus} वर अद्यतनित झाली` : `Query status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating query status:', err);
      showNotice(err.message || (lang === 'mr' ? 'स्थिती अद्यतनित करण्यात अयशस्वी' : 'Failed to update query status'), 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle delete query
  const handleDeleteQuery = async (queryId) => {
    if (!confirm(t('admin.queries.confirmDelete', 'Are you sure you want to delete this student query?'))) return;
    setActionLoadingId(queryId);
    try {
      await api.deleteQuery(queryId);
      setQueries((prev) => prev.filter((q) => q.id !== queryId));
      showNotice(lang === 'mr' ? 'प्रश्न यशस्वीरित्या हटवला' : 'Query deleted successfully');
    } catch (err) {
      console.error('Error deleting query:', err);
      showNotice(err.message || (lang === 'mr' ? 'प्रश्न हटवण्यात अयशस्वी' : 'Failed to delete query'), 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notice && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between shadow-md transition-all ${
            notice.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-700'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-700'
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon
              name={notice.type === 'error' ? 'error_outline' : 'check_circle'}
              className="text-base"
            />
            <span>{notice.msg}</span>
          </div>
          <button
            onClick={() => setNotice(null)}
            className="text-[#475569] hover:text-gray-600 cursor-pointer"
          >
            <Icon name="close" className="text-sm" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-soft-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-slate-50 text-[#0F172A] flex items-center justify-center">
              <Icon name="help_outline" className="text-2xl text-[#0F172A]" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-[#0F172A] tracking-tight">
                {t('admin.queries.title', 'Queries & Support')}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadQueries}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[#0F172A] text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer disabled:opacity-50"
          >
            <Icon name="refresh" className={`text-sm ${loading ? 'animate-spin' : ''}`} />
            {t('admin.common.refresh', 'Refresh Queries')}
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setStatusFilter('all')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'all'
              ? 'bg-slate-50 border-blue-200 shadow-xs ring-1 ring-brand-forest'
              : 'bg-white border-slate-200 hover:bg-slate-100'
          }`}
        >
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">
            {lang === 'mr' ? 'एकूण प्रश्न' : 'Total Queries'}
          </div>
          <div className="text-2xl font-black text-[#0F172A] mt-1">{counts.all}</div>
        </div>

        <div
          onClick={() => setStatusFilter('Pending')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'Pending'
              ? 'bg-amber-50 border-amber-400 shadow-xs ring-1 ring-amber-400'
              : 'bg-white border-slate-200 hover:bg-amber-50/50'
          }`}
        >
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            {t('admin.queries.statusPending', 'Pending')}
          </div>
          <div className="text-2xl font-black text-amber-700 mt-1">{counts.pending}</div>
        </div>

        <div
          onClick={() => setStatusFilter('Answered')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'Answered'
              ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
              : 'bg-white border-slate-200 hover:bg-emerald-50/50'
          }`}
        >
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700">
            {t('admin.queries.statusAnswered', 'Answered')}
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1">{counts.answered}</div>
        </div>

        <div
          onClick={() => setStatusFilter('Closed')}
          className={`p-4 rounded-2xl border transition cursor-pointer ${
            statusFilter === 'Closed'
              ? 'bg-slate-100 border-gray-400 shadow-xs ring-1 ring-gray-400'
              : 'bg-white border-slate-200 hover:bg-slate-100'
          }`}
        >
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">
            {t('admin.queries.statusClosed', 'Closed')}
          </div>
          <div className="text-2xl font-black text-[#0F172A] mt-1">{counts.closed}</div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-soft-card space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs: [ All ] [ Pending ] [ Answered ] [ Closed ] */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-[#F8FAFC] text-[#475569] hover:bg-slate-100 hover:text-white'
              }`}
            >
              {t('admin.common.all', 'All')} ({counts.all})
            </button>

            <button
              onClick={() => setStatusFilter('Pending')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                statusFilter === 'Pending'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-500/25'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              {t('admin.queries.statusPending', 'Pending')} ({counts.pending})
            </button>

            <button
              onClick={() => setStatusFilter('Answered')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                statusFilter === 'Answered'
                  ? 'bg-emerald-700 text-[#0F172A] shadow-2xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-500/25'
              }`}
            >
              <Icon name="check_circle" className="text-xs" />
              {t('admin.queries.statusAnswered', 'Answered')} ({counts.answered})
            </button>

            <button
              onClick={() => setStatusFilter('Closed')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 ${
                statusFilter === 'Closed'
                  ? 'bg-gray-700 text-[#0F172A] shadow-2xs'
                  : 'bg-slate-100 text-[#0F172A] hover:bg-slate-200'
              }`}
            >
              {t('admin.queries.statusClosed', 'Closed')} ({counts.closed})
            </button>
          </div>

          {/* Search Input & Course Filter */}
          <div className="flex items-center gap-2 flex-wrap">
            {coursesList.length > 0 && (
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="p-2 rounded-xl border border-slate-200 text-xs font-bold text-[#0F172A] bg-white focus:outline-none focus:border-blue-200 cursor-pointer"
              >
                <option value="all">
                  {lang === 'mr' ? `सर्व अभ्यासक्रम (${coursesList.length})` : `All Courses (${coursesList.length})`}
                </option>
                {coursesList.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}

            <div className="relative min-w-[220px]">
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#475569] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('admin.queries.searchPlaceholder', 'Search student, course, question...')}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-[#0F172A] focus:outline-none focus:border-blue-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#475569] hover:text-gray-600"
                >
                  <Icon name="close" className="text-xs" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Query List */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-soft-card">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-[#475569]">
            {lang === 'mr' ? 'विद्यार्थी प्रश्न लोड होत आहेत...' : 'Loading student queries...'}
          </p>
        </div>
      ) : filteredQueries.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-soft-card">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 text-[#0F172A] flex items-center justify-center mx-auto mb-3">
            <Icon name="search_off" className="text-3xl text-[#0F172A]" />
          </div>
          <h3 className="text-base font-extrabold text-[#0F172A]">
            {t('admin.queries.noQueriesFound', 'No queries found')}
          </h3>
          {(searchQuery || statusFilter !== 'all' || selectedCourse !== 'all') && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setSelectedCourse('all');
                setSearchQuery('');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] cursor-pointer"
            >
              {lang === 'mr' ? 'सर्व फिल्टर साफ करा' : 'Clear All Filters'}
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQueries.map((q) => {
            const isClosed = (q.status || '').toLowerCase() === 'closed';
            const isAnswered =
              (q.status || '').toLowerCase() === 'answered' ||
              (q.status || '').toLowerCase() === 'resolved' ||
              !!q.adminReply;
            const isPending = !isClosed && !isAnswered;
            const isCurrentlyReplying = replyingId === q.id;

            return (
              <div
                key={q.id}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-soft-card space-y-4 transition hover:border-gray-300"
              >
                {/* Top Row: Student, Course, Date, and Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-extrabold text-sm uppercase shrink-0">
                      {(q.userName || 'S').charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-extrabold text-[#0F172A]">
                          {t('admin.queries.student', 'Student')}: {q.userName || (lang === 'mr' ? 'अनामित विद्यार्थी' : 'Anonymous Student')}
                        </span>
                        {q.userEmail && (
                          <span className="text-xs text-[#475569] font-medium">
                            · {q.userEmail}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap text-[11px] text-[#475569] mt-0.5">
                        <span className="font-extrabold text-[#0F172A] bg-slate-50 px-2 py-0.5 rounded-md">
                          {t('admin.queries.course', 'Course')}: {q.courseName || q.courseSlug || (lang === 'mr' ? 'सामान्य' : 'General')}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Icon name="event" className="text-xs text-[#475569]" />
                          {lang === 'mr' ? 'सादर केले' : 'Submitted'}: {formatExactDate(q.createdAt)} {lang === 'mr' ? 'रोजी' : 'at'} {formatExactTime(q.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge & Status Selector */}
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    {isPending ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                        {t('admin.common.status', 'Status')}: {t('admin.queries.statusPending', 'Pending')}
                      </span>
                    ) : isAnswered ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Icon name="check_circle" className="text-xs text-emerald-600" />
                        {t('admin.common.status', 'Status')}: {t('admin.queries.statusAnswered', 'Answered')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-[#0F172A] border border-slate-200">
                        <Icon name="lock" className="text-xs text-[#475569]" />
                        {t('admin.common.status', 'Status')}: {t('admin.queries.statusClosed', 'Closed')}
                      </span>
                    )}

                    {/* Quick status selector */}
                    <select
                      value={isClosed ? 'Closed' : isAnswered ? 'Answered' : 'Pending'}
                      disabled={actionLoadingId === q.id}
                      onChange={(e) => handleUpdateStatus(q.id, e.target.value)}
                      className="text-[11px] font-bold p-1 rounded-lg border border-slate-200 bg-white text-[#0F172A] focus:outline-none cursor-pointer"
                      title={lang === 'mr' ? 'स्थिती बदला' : 'Change status'}
                    >
                      <option value="Pending">{t('admin.queries.statusPending', 'Pending')}</option>
                      <option value="Answered">{t('admin.queries.statusAnswered', 'Answered')}</option>
                      <option value="Closed">{t('admin.queries.statusClosed', 'Closed')}</option>
                    </select>

                    <button
                      onClick={() => handleDeleteQuery(q.id)}
                      disabled={actionLoadingId === q.id}
                      title={lang === 'mr' ? 'प्रश्न हटवा' : 'Delete query'}
                      className="p-1.5 rounded-lg text-[#475569] hover:text-rose-600 hover:bg-rose-500/25 transition cursor-pointer"
                    >
                      <Icon name="delete_outline" className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Question Section */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-1.5">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569] flex items-center gap-1">
                    <Icon name="help" className="text-xs text-[#0F172A]" />
                    {t('admin.queries.question', 'Question')}:
                  </div>
                  <h3 className="text-sm font-extrabold text-[#0F172A] leading-snug">
                    {q.subject}
                  </h3>
                  {q.message && q.message !== q.subject && (
                    <p className="text-xs text-[#0F172A] whitespace-pre-wrap leading-relaxed pt-1">
                      {q.message}
                    </p>
                  )}
                </div>

                {/* Existing Answer Block (if answered) */}
                {q.adminReply && !isCurrentlyReplying && (
                  <div className="bg-emerald-50 border border-emerald-200/90 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-700">
                        <Icon name="verified" className="text-sm text-emerald-700" />
                        {lang === 'mr' ? 'ॲडमिन उत्तर:' : 'Admin Answer:'}
                      </div>
                      <button
                        onClick={() => {
                          setReplyingId(q.id);
                          setReplyText(q.adminReply || '');
                        }}
                        className="text-[11px] font-extrabold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                      >
                        <Icon name="edit" className="text-xs" /> {lang === 'mr' ? 'उत्तर संपादित करा' : 'Edit Answer'}
                      </button>
                    </div>

                    <p className="text-xs text-emerald-100 whitespace-pre-wrap leading-relaxed font-medium">
                      {q.adminReply}
                    </p>

                    {q.resolvedAt && (
                      <div className="text-[10px] text-emerald-700 font-semibold">
                        {lang === 'mr' ? 'उत्तर दिले' : 'Answered on'} {formatExactDate(q.resolvedAt)} {lang === 'mr' ? 'रोजी' : 'at'} {formatExactTime(q.resolvedAt)}
                      </div>
                    )}
                  </div>
                )}

                {/* Answer Form for Pending (or when editing) */}
                {(isCurrentlyReplying || (isPending && !q.adminReply)) && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-extrabold text-[#0F172A] flex items-center gap-1.5">
                        <Icon name="reply" className="text-sm text-[#0F172A]" />
                        {lang === 'mr' ? 'ॲडमिन उत्तर' : 'Admin Answer'}
                      </label>
                      {isCurrentlyReplying && (
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingId(null);
                            setReplyText('');
                          }}
                          className="text-[11px] font-bold text-[#475569] hover:text-[#0F172A] cursor-pointer"
                        >
                          {t('admin.common.cancel', 'Cancel')}
                        </button>
                      )}
                    </div>

                    <textarea
                      rows={3}
                      value={isCurrentlyReplying ? replyText : replyingId === null ? replyText : ''}
                      onChange={(e) => {
                        setReplyingId(q.id);
                        setReplyText(e.target.value);
                      }}
                      onFocus={() => {
                        if (replyingId !== q.id) {
                          setReplyingId(q.id);
                          setReplyText(q.adminReply || '');
                        }
                      }}
                      placeholder={t('admin.queries.replyPlaceholder', 'Write your answer clearly for the student...')}
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs text-[#0F172A] bg-white focus:outline-none focus:border-blue-200 focus:ring-1 focus:ring-[#2563EB] resize-none"
                    />

                    <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                      <div className="text-[11px] text-[#475569]">
                        {lang === 'mr'
                          ? 'उत्तर दिल्यास स्थिती Pending वरून Answered होईल.'
                          : 'Submitting an answer will change status from Pending to Answered.'}
                      </div>

                      <div className="flex items-center gap-2">
                        {isCurrentlyReplying && (
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingId(null);
                              setReplyText('');
                            }}
                            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-[#475569] hover:bg-slate-100 cursor-pointer"
                          >
                            {t('admin.common.cancel', 'Cancel')}
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={submittingReply || (replyingId === q.id && !replyText.trim())}
                          onClick={() => handleSendAnswer(q.id)}
                          className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Icon name="send" className="text-xs text-[#2563EB]" />
                          {submittingReply && replyingId === q.id
                            ? (lang === 'mr' ? 'पाठवत आहे...' : 'Sending...')
                            : t('admin.queries.sendReply', 'Send Answer')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
