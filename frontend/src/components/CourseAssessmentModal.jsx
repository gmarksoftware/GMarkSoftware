import React, { useState, useEffect, useMemo } from 'react';
import Icon from './Icon.jsx';
import { adminApi } from '../lib/api.js';
import { getToken } from '../lib/AuthContext.jsx';

import { formatTime } from '../lib/time.js';

const fmtTime = formatTime;

export default function CourseAssessmentModal({
  isOpen,
  onClose,
  course,
  initialVideoIndex = 0,
  onSaved,
}) {
  if (!isOpen || !course) return null;

  const token = getToken();
  const api = adminApi(token);

  // Normalize lessons / videos list for this course
  const courseLessons = useMemo(() => {
    const raw = Array.isArray(course.lessons) && course.lessons.length > 0 ? course.lessons : [];
    if (raw.length > 0) {
      return raw.map((l, i) => ({
        index: i,
        t: l.t || `Video ${i + 1}`,
        min: Number(l.min) || 10,
        youtube: l.youtubeVideoId || l.youtube || l.youtubeUrl || '',
      }));
    }
    return [
      {
        index: 0,
        t: typeof course.title === 'string' ? course.title : course.title?.en || course.courseName || 'Main Video Lesson',
        min: 10,
        youtube: course.youtubeVideoId || course.youtube || '',
      },
    ];
  }, [course]);

  // Load existing questions
  const loadExistingQuestions = () => {
    try {
      const local = JSON.parse(localStorage.getItem(`course_assessments_${course.slug}`));
      if (Array.isArray(local) && local.length > 0) return local;
    } catch {}
    if (Array.isArray(course.assessments) && course.assessments.length > 0) {
      return course.assessments;
    }
    return [];
  };

  const [questions, setQuestions] = useState(loadExistingQuestions);
  const [selectedVideoIdx, setSelectedVideoIdx] = useState(() => {
    const idx = Number(initialVideoIndex);
    return !isNaN(idx) && idx >= 0 && idx < courseLessons.length ? idx : 0;
  });
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctIdx, setCorrectIdx] = useState(0);
  const [triggerType, setTriggerType] = useState('end'); // 'end' | 'timestamp'
  const [triggerMinutes, setTriggerMinutes] = useState(1);
  const [triggerSeconds, setTriggerSeconds] = useState(0);
  const [formError, setFormError] = useState('');

  const activeVideo = courseLessons[selectedVideoIdx] || courseLessons[0];

  useEffect(() => {
    setQuestions(loadExistingQuestions());
    if (typeof initialVideoIndex === 'number' && initialVideoIndex >= 0 && initialVideoIndex < courseLessons.length) {
      setSelectedVideoIdx(initialVideoIndex);
    }
    resetForm();
    setNotice('');
  }, [course, initialVideoIndex, courseLessons.length]);

  const resetForm = () => {
    setEditingId(null);
    setQuestionText('');
    setOptions(['', '', '', '']);
    setCorrectIdx(0);
    setTriggerType('end');
    setTriggerMinutes(1);
    setTriggerSeconds(0);
    setFormError('');
  };

  // Questions specifically for the selected video
  const videoQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (q.videoIndex !== undefined && q.videoIndex !== null) {
        return Number(q.videoIndex) === Number(selectedVideoIdx);
      }
      if (q.videoTitle && activeVideo?.t) {
        return q.videoTitle.toLowerCase().trim() === activeVideo.t.toLowerCase().trim();
      }
      return false;
    });
  }, [questions, selectedVideoIdx, activeVideo]);

  // Questions count map per video
  const questionsCountByVideo = useMemo(() => {
    const map = {};
    questions.forEach((q) => {
      if (q.videoIndex !== undefined && q.videoIndex !== null) {
        const idx = Number(q.videoIndex);
        map[idx] = (map[idx] || 0) + 1;
      } else if (q.videoTitle) {
        const matchIdx = courseLessons.findIndex(
          (l) => l.t && l.t.toLowerCase().trim() === q.videoTitle.toLowerCase().trim()
        );
        if (matchIdx !== -1) {
          map[matchIdx] = (map[matchIdx] || 0) + 1;
        }
      }
    });
    return map;
  }, [questions, courseLessons]);

  // Persist to Backend API and localStorage
  const persist = async (updatedQuestions) => {
    setSaving(true);
    const targetCourseId = course.id || course.slug || course._id;
    const settings = course.assessmentSettings || { enabled: true };

    try {
      // 1. LocalStorage for instant UI sync
      localStorage.setItem(`course_assessments_${course.slug}`, JSON.stringify(updatedQuestions));

      const stored = JSON.parse(localStorage.getItem('admin_courses') || '[]');
      const matchIdx = stored.findIndex(
        (c) => c.slug === course.slug || c.id === targetCourseId || (c._id && c._id === targetCourseId)
      );
      if (matchIdx !== -1) {
        stored[matchIdx] = {
          ...stored[matchIdx],
          assessments: updatedQuestions,
          assessmentSettings: settings,
        };
        localStorage.setItem('admin_courses', JSON.stringify(stored));
      }

      // 2. Clear progress locks so tests can be run immediately
      Object.keys(localStorage).forEach((key) => {
        if ((key.includes('checkpoints-') || key.includes('quiz-ans-')) && key.includes(course.slug)) {
          localStorage.removeItem(key);
        }
      });

      // 3. Update parent React component state
      if (onSaved) {
        onSaved({
          ...course,
          assessments: updatedQuestions,
          assessmentSettings: settings,
        });
      }

      // 4. Save to Backend Database
      if (api?.saveCourseAssessment) {
        await api.saveCourseAssessment(targetCourseId, updatedQuestions, settings);
      } else if (api?.updateCourse) {
        await api.updateCourse(targetCourseId, {
          assessments: updatedQuestions,
          assessmentSettings: settings,
        });
      }
    } catch (err) {
      console.warn('API save warning:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleOptionChange = (idx, value) => {
    setOptions((prev) => {
      const copy = [...prev];
      copy[idx] = value;
      return copy;
    });
  };

  const handleSaveQuestion = async (e) => {
    if (e) e.preventDefault();
    setFormError('');

    const qText = questionText.trim();
    if (!qText) {
      setFormError('Please enter the question text.');
      return;
    }

    const trimmedOpts = options.map((o) => o.trim());
    const validCount = trimmedOpts.filter(Boolean).length;
    if (validCount < 2) {
      setFormError('Please enter at least 2 answer choices.');
      return;
    }

    if (!trimmedOpts[correctIdx]) {
      setFormError('Please select a non-empty option as the correct answer.');
      return;
    }

    const totalSeconds = triggerType === 'end'
      ? 999999
      : Math.max(5, (Number(triggerMinutes) || 0) * 60 + (Number(triggerSeconds) || 0));

    const triggerFormatted = triggerType === 'end' ? 'At Video End' : fmtTime(totalSeconds);

    const questionObj = {
      id: editingId || `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      videoIndex: selectedVideoIdx,
      videoTitle: activeVideo.t,
      triggerType,
      triggerSeconds: totalSeconds,
      triggerFormatted,
      part: triggerType === 'end' ? 2 : 1,
      question: qText,
      options: trimmedOpts,
      correct: correctIdx,
      explanation: editingId ? (questions.find((q) => q.id === editingId)?.explanation || '') : '',
    };

    let updated = [];
    if (editingId) {
      updated = questions.map((q) => (q.id === editingId ? questionObj : q));
    } else {
      updated = [...questions, questionObj];
    }

    setQuestions(updated);
    resetForm();

    await persist(updated);
    setNotice(
      editingId
        ? `✓ Question updated for Video ${selectedVideoIdx + 1}!`
        : `✓ Question added to Video ${selectedVideoIdx + 1} (${triggerFormatted})!`
    );

    setTimeout(() => setNotice(''), 4000);
  };

  const handleEditQuestion = (q) => {
    setEditingId(q.id);
    setQuestionText(q.question || '');
    setOptions(Array.isArray(q.options) && q.options.length >= 4 ? [...q.options] : [
      q.options?.[0] || '',
      q.options?.[1] || '',
      q.options?.[2] || '',
      q.options?.[3] || '',
    ]);
    setCorrectIdx(typeof q.correct === 'number' ? q.correct : 0);

    if (q.triggerType === 'end' || q.part === 2 || q.triggerSeconds >= 999999) {
      setTriggerType('end');
    } else {
      setTriggerType('timestamp');
      const sec = Number(q.triggerSeconds || 0);
      setTriggerMinutes(Math.floor(sec / 60));
      setTriggerSeconds(sec % 60);
    }
    setFormError('');

    // Scroll form into view
    const formEl = document.getElementById('assignment-question-form');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleDeleteQuestion = async (id) => {
    if (!confirm('Delete this question?')) return;
    const updated = questions.filter((q) => q.id !== id);
    setQuestions(updated);
    if (editingId === id) resetForm();

    await persist(updated);
    setNotice('✓ Question deleted.');
    setTimeout(() => setNotice(''), 3000);
  };

  const handleAddSampleQuestions = async () => {
    const samples = [
      {
        id: `q-${Date.now()}-1`,
        videoIndex: selectedVideoIdx,
        videoTitle: activeVideo.t,
        triggerType: 'end',
        triggerSeconds: 999999,
        triggerFormatted: 'At Video End',
        part: 2,
        question: `What was the primary key takeaway explained in "${activeVideo.t}"?`,
        options: ['Core practical principle', 'Advanced theory only', 'Unrelated topic', 'Optional skip'],
        correct: 0,
        explanation: '',
      },
      {
        id: `q-${Date.now()}-2`,
        videoIndex: selectedVideoIdx,
        videoTitle: activeVideo.t,
        triggerType: 'end',
        triggerSeconds: 999999,
        triggerFormatted: 'At Video End',
        part: 2,
        question: `Which step should be followed after completing "${activeVideo.t}"?`,
        options: ['Practice hands-on application', 'Close without action', 'Skip to final chapter', 'Ignore instructions'],
        correct: 0,
        explanation: '',
      },
    ];

    const updated = [...questions, ...samples];
    setQuestions(updated);
    await persist(updated);
    setNotice(`✓ Added 2 sample questions to Video ${selectedVideoIdx + 1}!`);
    setTimeout(() => setNotice(''), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-brand-surface via-white to-brand-surface shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-sm">
              <Icon name="assignment" className="text-xl text-[#2563EB]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-[#0F172A]">
                  Manage Video Assignments
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 text-[#0F172A]">
                  {questions.length} Total Question{questions.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-[#475569] font-medium truncate max-w-md">
                Course: {course.title?.en || course.title || course.courseName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition cursor-pointer"
            title="Close"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        {/* Global Notice Toast */}
        {notice && (
          <div className="px-6 py-2.5 bg-emerald-50 border-b border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-between animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <Icon name="check_circle" className="text-emerald-600 text-base" />
              <span>{notice}</span>
            </div>
            <button
              onClick={() => setNotice('')}
              className="text-emerald-700 hover:text-emerald-900 text-xs font-black cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">

          {/* STEP 1: Select Target Video */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                <Icon name="smart_display" className="text-red-600 text-base" />
                Select Which Video to Add Questions To:
              </label>
              <span className="text-xs text-[#475569]">
                {courseLessons.length} Video{courseLessons.length !== 1 ? 's' : ''} in course
              </span>
            </div>

            {/* Video Selector Tabs */}
            <div className="flex flex-wrap gap-2">
              {courseLessons.map((les, idx) => {
                const count = questionsCountByVideo[idx] || 0;
                const isSelected = selectedVideoIdx === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedVideoIdx(idx);
                      resetForm();
                    }}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition cursor-pointer border ${
                      isSelected
                        ? 'bg-[#2563EB] text-white border-blue-200 shadow-sm'
                        : 'bg-white hover:bg-slate-100 text-white border-slate-200'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black ${
                      isSelected ? 'bg-white/20 text-[#0F172A]' : 'bg-slate-100 text-[#0F172A]'
                    }`}>
                      {idx + 1}
                    </span>
                    <span className="truncate max-w-[150px]">{les.t}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? 'bg-blue-50 text-[#0F172A]'
                        : count > 0
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-[#475569]'
                    }`}>
                      {count} Qs
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Video Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-[#0F172A] uppercase tracking-wide">
                Currently Editing Questions For:
              </div>
              <div className="text-sm font-extrabold text-[#0F172A] mt-0.5 flex items-center gap-2">
                <Icon name="smart_display" className="text-red-600 text-base" />
                <span>Video {selectedVideoIdx + 1}: {activeVideo.t}</span>
                <span className="text-xs font-normal text-[#475569]">({activeVideo.min} mins)</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddSampleQuestions}
              disabled={saving}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-50 text-[#0F172A] text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              title="Add 2 sample questions to this video quickly"
            >
              <Icon name="auto_fix_high" className="text-sm" /> Add 2 Quick Samples
            </button>
          </div>

          {/* Existing Questions List for Active Video */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A] flex items-center gap-1">
                <span>Questions on Video {selectedVideoIdx + 1}</span>
                <span className="text-[#475569] font-normal">({videoQuestions.length})</span>
              </h3>
            </div>

            {videoQuestions.length === 0 ? (
              <div className="text-center py-6 px-4 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-[#475569] text-xs">
                <Icon name="quiz" className="text-3xl mb-1.5 text-[#475569]" />
                <p className="font-bold text-[#0F172A]">No questions added to this video yet.</p>
                <p className="text-[11px] text-[#475569] mt-0.5">Use the simple form below to add the first question!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {videoQuestions.map((q, qIndex) => (
                  <div
                    key={q.id || qIndex}
                    className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-brand-forest/40 transition"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="text-xs font-black px-2 py-0.5 rounded-md bg-slate-50 text-[#0F172A]">
                            Q{qIndex + 1}
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ⏱️ {q.triggerFormatted || (q.triggerType === 'end' ? 'At Video End' : 'Timed')}
                          </span>
                        </div>
                        <p className="text-sm font-extrabold text-[#0F172A] mb-2">
                          {q.question}
                        </p>

                        {/* Options preview */}
                        <div className="grid sm:grid-cols-2 gap-1.5 text-xs">
                          {q.options?.map((opt, oIdx) => {
                            const isCorrect = Number(q.correct) === oIdx;
                            return (
                              <div
                                key={oIdx}
                                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-medium ${
                                  isCorrect
                                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold'
                                    : 'bg-slate-50 text-[#475569]'
                                }`}
                              >
                                <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${
                                  isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-[#475569]'
                                }`}>
                                  {isCorrect ? '✓' : String.fromCharCode(65 + oIdx)}
                                </span>
                                <span className="truncate">{opt}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditQuestion(q)}
                          className="p-1.5 rounded-lg text-[#0F172A] hover:bg-slate-100 transition cursor-pointer"
                          title="Edit question"
                        >
                          <Icon name="edit" className="text-base" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer"
                          title="Delete question"
                        >
                          <Icon name="delete" className="text-base" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* STEP 2: Add or Edit Question Form */}
          <form
            id="assignment-question-form"
            onSubmit={handleSaveQuestion}
            className="bg-slate-50 border-2 border-blue-200 rounded-3xl p-5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-[#2563EB] text-white flex items-center justify-center text-xs font-black">
                  {editingId ? '✏️' : '+'}
                </span>
                <h4 className="text-sm font-extrabold text-[#0F172A]">
                  {editingId ? `Edit Question on Video ${selectedVideoIdx + 1}` : `Add New Question to Video ${selectedVideoIdx + 1}`}
                </h4>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-2.5 py-1 rounded-xl border border-slate-200 text-xs font-bold text-[#475569] hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            {formError && (
              <div className="px-3.5 py-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-1.5">
                <Icon name="error" className="text-sm" />
                <span>{formError}</span>
              </div>
            )}

            {/* Question Text */}
            <div>
              <label htmlFor="question-input" className="text-xs font-extrabold text-[#0F172A] block mb-1">
                Question Prompt *
              </label>
              <textarea
                id="question-input"
                rows={2}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="e.g. What is the most important concept explained in this video lesson?"
                className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none"
              />
            </div>

            {/* Answer Options & Correct Indicator */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-extrabold text-[#0F172A] block">
                  Answer Choices (Click the green radio to select Correct Answer) *
                </label>
                <span className="text-[11px] text-emerald-700 font-bold">
                  ✓ Option {String.fromCharCode(65 + correctIdx)} is marked correct
                </span>
              </div>

              <div className="space-y-2">
                {options.map((opt, oIdx) => {
                  const isCorrect = correctIdx === oIdx;
                  const letter = String.fromCharCode(65 + oIdx);

                  return (
                    <div
                      key={oIdx}
                      className={`flex items-center gap-2 p-1.5 rounded-xl border transition ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-400'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setCorrectIdx(oIdx)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 cursor-pointer transition ${
                          isCorrect
                            ? 'bg-emerald-600 text-white shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-[#0F172A]'
                        }`}
                        title={`Click to set Option ${letter} as correct answer`}
                      >
                        {isCorrect ? '✓' : letter}
                      </button>

                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(oIdx, e.target.value)}
                        placeholder={`Option ${letter} ${oIdx === 0 ? '(e.g. Correct answer explanation)' : '(e.g. Incorrect choice)'}`}
                        className="flex-1 bg-transparent border-0 px-2 py-1 text-xs font-medium text-[#0F172A] focus:outline-none"
                      />

                      <button
                        type="button"
                        onClick={() => setCorrectIdx(oIdx)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg shrink-0 cursor-pointer ${
                          isCorrect
                            ? 'bg-emerald-600 text-white font-extrabold'
                            : 'text-[#475569] hover:text-emerald-700 hover:bg-emerald-500/25'
                        }`}
                      >
                        {isCorrect ? 'Correct' : 'Mark Correct'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* When to Show Question */}
            <div>
              <label className="text-xs font-extrabold text-[#0F172A] block mb-1.5">
                When Should This Question Appear? *
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-xs font-bold transition ${
                  triggerType === 'end'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                    : 'bg-white text-[#0F172A] border-slate-200 hover:bg-slate-100'
                }`}>
                  <input
                    type="radio"
                    name="triggerType"
                    checked={triggerType === 'end'}
                    onChange={() => setTriggerType('end')}
                    className="accent-white"
                  />
                  <span>🏁 At Video End (Recommended)</span>
                </label>

                <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer text-xs font-bold transition ${
                  triggerType === 'timestamp'
                    ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                    : 'bg-white text-[#0F172A] border-slate-200 hover:bg-slate-100'
                }`}>
                  <input
                    type="radio"
                    name="triggerType"
                    checked={triggerType === 'timestamp'}
                    onChange={() => setTriggerType('timestamp')}
                    className="accent-white"
                  />
                  <span>⏱️ At Specific Time (Pause video)</span>
                </label>

                {triggerType === 'timestamp' && (
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-[#0F172A]">
                    <span>At:</span>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={triggerMinutes}
                      onChange={(e) => setTriggerMinutes(Math.max(0, Number(e.target.value)))}
                      className="w-12 border border-slate-200 rounded px-1.5 py-0.5 text-center text-xs"
                      placeholder="Min"
                    />
                    <span>min</span>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={triggerSeconds}
                      onChange={(e) => setTriggerSeconds(Math.max(0, Math.min(59, Number(e.target.value))))}
                      className="w-12 border border-slate-200 rounded px-1.5 py-0.5 text-center text-xs"
                      placeholder="Sec"
                    />
                    <span>sec</span>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
              <button
                type="submit"
                disabled={saving || !questionText.trim()}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md disabled:opacity-50 transition cursor-pointer"
              >
                {saving ? (
                  <><Icon name="sync" className="animate-spin text-sm" /> Saving Question...</>
                ) : editingId ? (
                  <><Icon name="check" className="text-sm" /> Update Question</>
                ) : (
                  <><Icon name="add" className="text-sm" /> Save Question to Video {selectedVideoIdx + 1}</>
                )}
              </button>
            </div>
          </form>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-[#475569] flex items-center gap-1.5">
            <Icon name="check_circle" className="text-emerald-600 text-sm" />
            <span>Questions are immediately saved to database and live for students.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2563EB] text-white font-extrabold text-xs hover:bg-[#1D4ED8] transition cursor-pointer shadow-sm"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
