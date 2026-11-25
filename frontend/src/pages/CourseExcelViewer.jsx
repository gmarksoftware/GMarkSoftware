import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Icon from '../components/Icon.jsx';
import { publicApi } from '../lib/api.js';

export default function CourseExcelViewer() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [activeSheetIdx, setActiveSheetIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    publicApi
      .getCourseExcelData(slug)
      .then((res) => {
        if (!isMounted) return;
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Unable to load course Excel data.');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const sheets = data?.sheets || [];
  const currentSheet = sheets[activeSheetIdx] || { name: 'Courses', headers: [], rows: [] };
  const headers = currentSheet.headers || [];
  const allRows = currentSheet.rows || [];

  // Extract metadata from the dataset row or fallback
  const courseMetadata = useMemo(() => {
    let courseName = data?.courseName || 'Course Curriculum Preview';
    let shortDescription =
      'Explore the structured syllabus, learning outcomes, module breakdown, and video lessons for this program.';
    let category = 'Web Development';
    let level = 'Beginner';

    if (allRows && allRows.length > 0) {
      const headerLower = headers.map((h) => String(h || '').toLowerCase().replace(/[^a-z0-9]/g, ''));
      const nameIdx = headerLower.findIndex((h) => h.includes('course') || h.includes('name') || h.includes('title'));
      const shortIdx = headerLower.findIndex((h) => h.includes('short') || h.includes('desc'));
      const catIdx = headerLower.findIndex((h) => h.includes('cat'));
      const levelIdx = headerLower.findIndex((h) => h.includes('level'));

      const firstRow = allRows[0] || [];
      if (nameIdx !== -1 && firstRow[nameIdx]) courseName = String(firstRow[nameIdx]);
      if (shortIdx !== -1 && firstRow[shortIdx]) shortDescription = String(firstRow[shortIdx]);
      if (catIdx !== -1 && firstRow[catIdx]) {
        const catStr = String(firstRow[catIdx]).toLowerCase();
        category = catStr === 'digital' ? 'Web Development' : catStr.charAt(0).toUpperCase() + catStr.slice(1);
      }
      if (levelIdx !== -1 && firstRow[levelIdx]) level = String(firstRow[levelIdx]);
    }

    return { courseName, shortDescription, category, level };
  }, [allRows, headers, data]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 text-[#2563EB] font-bold text-lg">
          <Icon name="sync" className="animate-spin text-2xl" />
          <span>Opening Excel data...</span>
        </div>
        <p className="text-xs text-[#475569] mt-2">Loading sheets and dataset structure</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 text-red-600 flex items-center justify-center mx-auto mb-4">
          <Icon name="error_outline" className="text-3xl" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] mb-2">Excel Data Unavailable</h1>
        <p className="text-[#475569] text-sm mb-6">{error || 'No Excel data found for this course.'}</p>
        <Link
          to={`/courses/${slug}`}
          className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#2563EB] text-white font-bold hover:bg-[#1D4ED8] transition-all shadow-sm"
        >
          <Icon name="arrow_back" /> Back to Course
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4 sm:px-6 lg:px-8 text-[#0F172A]">
      <div className="max-w-4xl mx-auto space-y-5">
        {/* TOP HEADER BANNER */}
        <div className="bg-gradient-to-br from-[#EFF6FF] via-white to-indigo-50/70 border border-slate-200 text-[#0F172A] rounded-3xl p-6 sm:p-8 shadow-sm">
          <Link
            to={`/courses/${slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold text-[#2563EB] hover:border-blue-300 mb-3 transition"
          >
            <Icon name="arrow_back" className="text-sm" /> Back to Course
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {courseMetadata.courseName} – Course Material
          </h1>
        </div>

        {/* SHEETS TABS & SEARCH BAR */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-[#475569] uppercase tracking-wider">
              SHEETS ({sheets.length}):
            </span>
            {sheets.map((s, idx) => {
              const active = idx === activeSheetIdx;
              const count = s.totalRows || (s.rows ? s.rows.length : 1);
              return (
                <button
                  key={s.name || idx}
                  onClick={() => {
                    setActiveSheetIdx(idx);
                    setSearchQuery('');
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${active
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'bg-slate-100 border border-slate-200 text-[#475569] hover:bg-slate-200/70 hover:text-[#0F172A]'
                    }`}
                >
                  <span>{s.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${active ? 'bg-white/20 text-white' : 'bg-white text-[#475569] border border-slate-200'
                      }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[220px] w-full sm:w-64">
            <Icon
              name="search"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"
            />
            <input
              id="sheet-search-input"
              name="searchQuery"
              type="search"
              autoComplete="off"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${currentSheet.name || 'Courses'}...`}
              className="w-full bg-white border border-slate-300 rounded-xl pl-8 pr-7 py-1.5 text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0F172A] text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* OVERVIEW CARDS */}
        <div className="space-y-5">
          {/* 1. About the Course */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-4">
              <h2 className="text-xl font-black text-[#0F172A]">
                1. About the Course
              </h2>
              <span className="text-xs font-mono font-semibold text-[#2563EB] bg-blue-50 border border-blue-200 px-3 py-1 rounded-md">
                COURSE_NAME: {courseMetadata.courseName}
              </span>
            </div>

            <p className="text-sm text-[#475569] leading-relaxed font-medium">
              <strong className="text-[#0F172A] font-black">{courseMetadata.courseName}</strong> is the foundational entry point for anyone starting their journey into web creation. It introduces core markup concepts, enabling you to build semantic and accessible web documents.
            </p>

            <div className="mt-4 p-4 rounded-xl bg-blue-50/70 border-l-4 border-[#2563EB] text-xs font-medium">
              <div className="font-black text-[#2563EB] uppercase tracking-wider mb-1">
                SHORT_DESCRIPTION (FROM DATASET):
              </div>
              <div className="text-[#0F172A] leading-relaxed">
                {courseMetadata.shortDescription}
              </div>
            </div>
          </div>

          {/* 2. Course Details & Metadata */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
            <h2 className="text-xl font-black text-[#0F172A] mb-4">
              2. Course Details & Metadata
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#475569] block mb-1">
                  CATEGORY
                </span>
                <div className="flex items-center gap-2 text-sm font-extrabold text-[#0F172A]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] inline-block shrink-0"></span>
                  <span>{courseMetadata.category}</span>
                </div>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-4">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#475569] block mb-1">
                  LEVEL
                </span>
                <div className="flex items-center gap-2 text-sm font-extrabold text-[#0F172A]">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shrink-0"></span>
                  <span>{courseMetadata.level}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Visual Media & Learning Overview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
            <h2 className="text-xl font-black text-[#0F172A] mb-2">
              3. Visual Media & Learning Overview
            </h2>
            <p className="text-sm text-[#475569] mb-4">
              Explore official resources and community guidelines:{' '}
              <Link to="/courses" className="text-[#2563EB] font-semibold underline hover:text-[#1D4ED8]">
                G-Mark Software Courses Catalogue
              </Link>
            </p>

            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
              <img
                src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80"
                alt={courseMetadata.courseName}
                className="w-full h-auto max-h-[460px] object-cover object-center"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
