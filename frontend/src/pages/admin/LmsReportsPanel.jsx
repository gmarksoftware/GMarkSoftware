import React, { useState, useEffect } from 'react';
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

function exportToCsv(filename, rows) {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => headers.map(fieldName => JSON.stringify(row[fieldName] ?? '')).join(',')),
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export default function LmsReportsPanel({ api }) {
  const { t, lang } = useLanguage();
  const [analytics, setAnalytics] = useState(null);
  const [studentReports, setStudentReports] = useState([]);
  const [courseReports, setCourseReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportTab, setReportTab] = useState('students'); // 'students' | 'courses'
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [an, st, cr] = await Promise.all([
        api.getLmsAnalytics().catch(() => null),
        api.getStudentReports().catch(() => []),
        api.getCourseReports().catch(() => []),
      ]);
      setAnalytics(an);
      setStudentReports(Array.isArray(st) ? st : []);
      setCourseReports(Array.isArray(cr) ? cr : []);
    } catch (e) {
      console.warn('Could not load LMS analytics:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredStudents = studentReports.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      (s.fullName && s.fullName.toLowerCase().includes(q)) ||
      (s.email && s.email.toLowerCase().includes(q)) ||
      (s.learningPurpose && s.learningPurpose.toLowerCase().includes(q))
    );
  });

  const filteredCourses = courseReports.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      (c.courseName && c.courseName.toLowerCase().includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q)) ||
      (c.level && c.level.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">
            {t('admin.lmsReports.title', 'Analytics & Reports')}
          </h1>
          <p className="text-[#475569] text-xs sm:text-sm mt-0.5">
            {t('admin.lmsReports.subtitle', 'Real-time learner progress, assessment results, enrollments, and course performance.')}
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-[#0F172A] text-xs font-bold transition flex items-center gap-1.5 self-start cursor-pointer shadow-2xs"
        >
          <Icon name="sync" className={loading ? 'animate-spin text-sm' : 'text-sm'} />
          {t('admin.common.refreshData', 'Refresh Data')}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-2">
            <span>{t('admin.dashboard.cards.users', 'Registered Students')}</span>
            <span className="w-8 h-8 rounded-xl bg-slate-50 text-[#0F172A] flex items-center justify-center">
              <Icon name="group" className="text-lg" />
            </span>
          </div>
          <div className="text-3xl font-black text-[#0F172A]">{analytics?.registeredStudents ?? 0}</div>
          <div className="text-[11px] text-[#475569] mt-1">
            {lang === 'mr' ? 'प्लॅटफॉर्म विद्यार्थी' : 'Platform learners'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-2">
            <span>{t('admin.lmsReports.stats.enrollments', 'Total Enrollments')}</span>
            <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Icon name="school" className="text-lg" />
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-700">{analytics?.totalEnrollments ?? 0}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">
            {analytics?.totalCompleted ?? 0} {lang === 'mr' ? 'पूर्ण' : 'completed'} ({analytics?.completionRate ?? 0}%)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-2">
            <span>{lang === 'mr' ? 'चाचणी निकाल' : 'Quiz Pass Rate'}</span>
            <span className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center">
              <Icon name="verified" className="text-lg" />
            </span>
          </div>
          <div className="text-3xl font-black text-sky-700">{analytics?.assessmentPassRate ?? 0}%</div>
          <div className="text-[11px] text-teal-600 font-medium mt-1">
            {lang === 'mr' ? 'सरासरी गुण' : 'Avg Score'}: {analytics?.assessmentAvgScore ?? 0}% ({analytics?.totalAssessmentsTaken ?? 0} {lang === 'mr' ? 'प्रयत्न' : 'attempts'})
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-2">
            <span>{lang === 'mr' ? 'अभ्यासक्रम उत्पन्न' : 'Course Revenue'}</span>
            <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <Icon name="payments" className="text-lg" />
            </span>
          </div>
          <div className="text-3xl font-black text-amber-700">₹{analytics?.totalRevenue ?? 0}</div>
          <div className="text-[11px] text-amber-600 font-medium mt-1">
            {lang === 'mr' ? 'सरासरी रेटिंग' : 'Avg Rating'}: ⭐ {analytics?.averageRating ?? 0} ({analytics?.totalReviews ?? 0} {lang === 'mr' ? 'अभिप्राय' : 'reviews'})
          </div>
        </div>
      </div>

      {/* Reports Navigation Switcher */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setReportTab('students'); setSearchQuery(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${reportTab === 'students'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-slate-50 text-white hover:bg-slate-100'
                }`}
            >
              <Icon name="person" className="text-sm" />
              {t('admin.lmsReports.tabStudents', 'Student Reports')} ({studentReports.length})
            </button>

            <button
              onClick={() => { setReportTab('courses'); setSearchQuery(''); }}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-2 ${reportTab === 'courses'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-slate-50 text-white hover:bg-slate-100'
                }`}
            >
              <Icon name="menu_book" className="text-sm" />
              {t('admin.lmsReports.tabCourses', 'Course Reports')} ({courseReports.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  reportTab === 'students'
                    ? (lang === 'mr' ? 'विद्यार्थ्याचे नाव, ईमेल शोधा...' : 'Search student name, email...')
                    : (lang === 'mr' ? 'अभ्यासक्रमाचे नाव, श्रेणी शोधा...' : 'Search course name, category...')
                }
                className="text-xs pl-8 pr-3 py-2 border border-slate-200 rounded-xl focus:border-blue-200 outline-hidden w-64"
              />
              <Icon name="search" className="absolute left-2.5 top-2.5 text-[#475569] text-xs" />
            </div>

            <button
              onClick={() => {
                if (reportTab === 'students') {
                  exportToCsv(`gmark_student_reports_${new Date().toISOString().split('T')[0]}.csv`, filteredStudents);
                } else {
                  exportToCsv(`gmark_course_reports_${new Date().toISOString().split('T')[0]}.csv`, filteredCourses);
                }
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-[#0F172A] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Icon name="download" className="text-sm" />
              {t('admin.common.exportCsv', 'Export CSV')}
            </button>
          </div>
        </div>

        {/* Tab 1: Student-Wise Report Table */}
        {reportTab === 'students' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#0F172A] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">{t('admin.lmsReports.studentHeaders.student', 'Learner')}</th>
                  <th className="p-3">{lang === 'mr' ? 'नोंदणी तारीख' : 'Joined On'}</th>
                  <th className="p-3">{t('admin.lmsReports.studentHeaders.purpose', 'Learning Purpose')}</th>
                  <th className="p-3">{t('admin.lmsReports.studentHeaders.enrolledCourses', 'Courses Enrolled')}</th>
                  <th className="p-3">{t('admin.lmsReports.studentHeaders.completed', 'Completed')}</th>
                  <th className="p-3">{t('admin.lmsReports.studentHeaders.watchTime', 'Watch Time')}</th>
                  <th className="p-3">{lang === 'mr' ? 'उत्तीर्ण चाचण्या' : 'Assessments Passed'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-[#475569]">
                      {lang === 'mr' ? 'कोणताही विद्यार्थी आढळला नाही.' : 'No student records found.'}
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-white transition">
                      <td className="p-3">
                        <div className="font-extrabold text-[#0F172A]">{s.fullName || (lang === 'mr' ? 'नोंदणीकृत विद्यार्थी' : 'Registered Student')}</div>
                        <div className="text-[11px] text-[#475569]">{s.email}</div>
                        {s.phone && <div className="text-[10px] text-sky-700 font-semibold">{s.phone}</div>}
                      </td>
                      <td className="p-3 whitespace-nowrap text-[#475569]">{formatDate(s.joinedAt)}</td>
                      <td className="p-3 max-w-xs text-[#0F172A] truncate" title={s.learningPurpose || ''}>
                        {s.learningPurpose || <span className="text-[#475569] italic">{lang === 'mr' ? 'नमूद केलेले नाही' : 'None specified'}</span>}
                      </td>
                      <td className="p-3 font-extrabold text-[#0F172A]">{s.enrolledCount}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${s.completedCount > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-[#475569]'
                          }`}>
                          {s.completedCount} {lang === 'mr' ? 'पूर्ण' : 'completed'}
                        </span>
                      </td>
                      <td className="p-3 text-amber-700 font-bold">
                        {Math.round((s.totalWatchTimeSec || 0) / 60)} {lang === 'mr' ? 'मिनिटे' : 'mins'}
                      </td>
                      <td className="p-3">
                        <span className="font-black text-sky-700">
                          {s.assessmentsPassed} / {s.assessmentsAttempted}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Course-Wise Report Table */}
        {reportTab === 'courses' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[#0F172A] font-extrabold border-b border-slate-200">
                <tr>
                  <th className="p-3">{t('admin.lmsReports.courseHeaders.course', 'Course')}</th>
                  <th className="p-3">{lang === 'mr' ? 'श्रेणी / पातळी' : 'Category / Level'}</th>
                  <th className="p-3">{t('admin.lmsReports.courseHeaders.enrollments', 'Enrolled Learners')}</th>
                  <th className="p-3">{t('admin.lmsReports.courseHeaders.completions', 'Completions')}</th>
                  <th className="p-3">{lang === 'mr' ? 'सरासरी प्रगती' : 'Avg Progress'}</th>
                  <th className="p-3">{t('admin.nav.reviews', 'Ratings & Reviews')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-[#475569]">
                      {lang === 'mr' ? 'कोणताही अभ्यासक्रम आढळला नाही.' : 'No course records found.'}
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((c) => (
                    <tr key={c.id || c.slug} className="hover:bg-white transition">
                      <td className="p-3">
                        <div className="font-extrabold text-[#0F172A]">{c.courseName}</div>
                        <div className="text-[10px] text-[#475569]">/{c.slug}</div>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-50 text-[#0F172A] block w-max">
                          {c.category}
                        </span>
                        <span className="text-[10px] text-[#475569] font-medium mt-0.5 block">{c.level}</span>
                      </td>
                      <td className="p-3 font-extrabold text-[#0F172A]">{c.enrolledStudents}</td>
                      <td className="p-3 font-bold text-emerald-700">{c.completionsCount}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                            <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${c.avgProgressPct || 0}%` }} />
                          </div>
                          <span className="font-bold text-[#0F172A]">{c.avgProgressPct || 0}%</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 font-bold text-amber-700">
                          <Icon name="star" filled className="text-amber-400 text-xs" />
                          <span>{c.avgRating > 0 ? Number(c.avgRating).toFixed(1) : (lang === 'mr' ? 'रेटिंग नाही' : 'Not rated')}</span>
                          <span className="text-[10px] text-[#475569]">({c.reviewsCount || 0})</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
