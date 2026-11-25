import React, { useState, useEffect } from 'react';
import Icon from './Icon.jsx';

export const HTML_QUIZ_QUESTIONS = [];

export default function VideoQuizModal({
  part, // 1 | 2 | 'final'
  checkpointTitle,
  isEndCheckpoint = false,
  showSummaryDirectly = false,
  onComplete,
  onClose,
  userAnswers,
  setUserAnswers,
  onRetake,
  questions,
}) {
  const isFinalScore = part === 'final';
  const isPart1 = part === 1 && !isEndCheckpoint;
  const isPart2 = part === 2 || isEndCheckpoint;

  const allQuestions = Array.isArray(questions) ? questions : [];

  const currentPartQuestions = (part !== undefined && !checkpointTitle)
    ? (isFinalScore ? allQuestions : allQuestions.filter((q) => Number(q.part) === Number(part)))
    : allQuestions;

  // If no questions are configured for this video/course, do not show dummy questions
  if (currentPartQuestions.length === 0 && !isFinalScore) {
    return null;
  }

  const [currentIdx, setCurrentIdx] = useState(0);
  const [showSummary, setShowSummary] = useState(Boolean(part === 'final'));

  // Prevent Escape key from closing or dismissing the mandatory assessment
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  const currentQ = currentPartQuestions[currentIdx] || currentPartQuestions[0];
  const selectedOption = currentQ ? userAnswers[currentQ.id] : undefined;

  const handleSelect = (qId, optionIdx) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const answeredCount = currentPartQuestions.filter((q) => userAnswers[q.id] !== undefined).length;
  const isPartAnsweredAll = currentPartQuestions.length > 0 && answeredCount === currentPartQuestions.length;

  const calculatePartScore = (p) => {
    const partQs = allQuestions.filter((q) => Number(q.part) === Number(p));
    let correct = 0;
    partQs.forEach((q) => {
      if (Number(userAnswers[q.id]) === Number(q.correct)) correct++;
    });
    return { correct, total: partQs.length };
  };

  const calculateTotalScore = () => {
    let correct = 0;
    allQuestions.forEach((q) => {
      if (Number(userAnswers[q.id]) === Number(q.correct)) correct++;
    });
    return correct;
  };

  const part1Stats = calculatePartScore(1);
  const part2Stats = calculatePartScore(2);
  const totalScore = calculateTotalScore();

  const checkpointCorrect = currentPartQuestions.filter(
    (q) => Number(userAnswers[q.id]) === Number(q.correct)
  ).length;

  const isShowingAllTotals = isEndCheckpoint || isFinalScore;

  const activeDisplayScore = isShowingAllTotals
    ? totalScore
    : checkpointTitle
      ? checkpointCorrect
      : isPart1
        ? part1Stats.correct
        : isPart2
          ? part2Stats.correct
          : totalScore;

  const activeDisplayTotal = isShowingAllTotals
    ? (allQuestions.length || 1)
    : checkpointTitle
      ? (currentPartQuestions.length || 1)
      : isPart1
        ? (part1Stats.total || 1)
        : isPart2
          ? (part2Stats.total || 1)
          : (allQuestions.length || 1);

  const activePct = Math.round((activeDisplayScore / activeDisplayTotal) * 100);

  // Review list items
  const reviewQuestions = showSummary
    ? isShowingAllTotals
      ? allQuestions
      : checkpointTitle
        ? currentPartQuestions
        : isPart1
          ? allQuestions.filter((q) => Number(q.part) === 1)
          : isPart2
            ? allQuestions.filter((q) => Number(q.part) === 2)
            : allQuestions
    : [];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className="absolute inset-0 z-30 w-full h-full bg-white/98 backdrop-blur-md flex flex-col justify-between p-3.5 sm:p-5 text-[#0F172A] overflow-hidden select-none animate-fadeIn"
    >
      {/* Top Bar inside Player Frame */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center">
            <Icon name={showSummary ? 'emoji_events' : 'quiz'} className="text-lg" />
          </span>
          <div>
            <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A] leading-tight">
              {showSummary
                ? isShowingAllTotals
                  ? '🏆 Total Score Achieved: Video Completion Scorecard'
                  : 'Checkpoint Assessment Result'
                : checkpointTitle
                  ? `${checkpointTitle} (${currentPartQuestions.length} Question${currentPartQuestions.length !== 1 ? 's' : ''})`
                  : isPart1
                    ? `Mid-Video Assessment (${currentPartQuestions.length} Question${currentPartQuestions.length !== 1 ? 's' : ''})`
                    : `End-of-Video Assessment (${currentPartQuestions.length} Question${currentPartQuestions.length !== 1 ? 's' : ''})`}
            </h3>
            <p className="text-[10px] text-[#475569] leading-none mt-0.5">
              {showSummary
                ? 'Instant performance scorecard'
                : `Complete all ${currentPartQuestions.length} question${currentPartQuestions.length !== 1 ? 's' : ''} to continue`}
            </p>
          </div>
        </div>
      </div>

      {showSummary ? (
        /* Instant Result / Scorecard View */
        <div className="flex-1 flex flex-col justify-between py-2 overflow-hidden">
          <div className="bg-gradient-to-br from-[#EFF6FF] via-white to-teal-50/70 border border-blue-200 rounded-2xl p-3 text-center shrink-0">
            <div className="flex items-center justify-center gap-4">
              <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-[#2563EB] text-[#2563EB] flex items-center justify-center font-black text-xl shadow-xs">
                {activePct}%
              </div>
              <div className="text-left">
                <h4 className="text-base sm:text-lg font-black text-[#0F172A]">
                  {isShowingAllTotals ? 'Total Score Achieved: ' : isPart1 ? 'Mid-Video Score: ' : 'Total Marks: '}
                  <span className="text-[#2563EB]">
                    {activeDisplayScore} / {activeDisplayTotal} Marks
                  </span>
                </h4>
                <p className="text-xs text-[#0D9488] font-semibold">
                  {activePct >= 80 ? '🎉 Excellent Performance!' : activePct >= 50 ? '👍 Good Job! Passed!' : 'Need Review'}
                </p>
                <div className="flex gap-2 mt-1 text-[10px] text-[#475569]">
                  {part1Stats.total > 0 && (
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-semibold">Part 1: {part1Stats.correct}/{part1Stats.total}</span>
                  )}
                  {(isPart2 || isFinalScore) && part2Stats.total > 0 && (
                    <span className="bg-white border border-slate-200 px-2 py-0.5 rounded font-semibold">Part 2: {part2Stats.correct}/{part2Stats.total}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Question-by-Question Review with instant feedback */}
          <div className="flex-1 overflow-y-auto space-y-1.5 my-2 pr-1 text-[11px] max-h-[140px] sm:max-h-[160px]">
            {reviewQuestions.map((q, idx) => {
              const isCorrect = userAnswers[q.id] === q.correct;
              return (
                <div
                  key={q.id}
                  className={`p-2 rounded-xl border flex items-start gap-2 ${isCorrect
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-rose-50 border-rose-200'
                    }`}
                >
                  <Icon
                    name={isCorrect ? 'check_circle' : 'cancel'}
                    className={`text-sm shrink-0 mt-0.5 ${isCorrect ? 'text-[#0D9488]' : 'text-rose-600'}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[#0F172A] truncate">Q{idx + 1}. {q.question}</p>
                    <p className={isCorrect ? 'text-emerald-800' : 'text-rose-800'}>
                      Your Answer: {userAnswers[q.id] !== undefined ? q.options[userAnswers[q.id]] : 'None'}
                      <span className={`font-bold ml-2 ${isCorrect ? 'text-[#0D9488]' : 'text-rose-600'}`}>
                        ({isCorrect ? '✓ Correct' : '✗ Wrong'})
                      </span>
                    </p>
                    {isCorrect && q.explanation && (
                      <p className="text-[10px] text-emerald-900 bg-white border border-emerald-200 rounded-lg px-2 py-1 mt-1 leading-relaxed">
                        <strong className="text-[#0D9488] font-bold">💡 Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (typeof onRetake === 'function') {
                  onRetake();
                }
                if (typeof setUserAnswers === 'function') {
                  setUserAnswers((prev) => {
                    const next = { ...(prev || {}) };
                    currentPartQuestions.forEach((q) => {
                      delete next[q.id];
                    });
                    return next;
                  });
                }
                setShowSummary(false);
                setCurrentIdx(0);
              }}
              className="px-3.5 py-1.5 rounded-full border border-blue-200 bg-blue-50 text-[#2563EB] text-xs font-bold hover:bg-[#2563EB] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Icon name="replay" className="text-sm" /> Re-attempt
            </button>

            {!isEndCheckpoint && !isFinalScore ? (
              <button
                type="button"
                onClick={onComplete}
                className="px-5 py-1.5 rounded-full bg-[#2563EB] text-white text-xs font-extrabold shadow-sm hover:bg-[#1D4ED8] transition-all flex items-center gap-1 cursor-pointer"
              >
                <Icon name="play_arrow" className="text-sm" /> Resume Video Playback
              </button>
            ) : (
              <button
                type="button"
                onClick={onComplete}
                className="px-5 py-1.5 rounded-full bg-[#2563EB] text-white text-xs font-extrabold shadow-sm hover:bg-[#1D4ED8] transition-all flex items-center gap-1 cursor-pointer"
              >
                Finish Module <Icon name="arrow_forward" className="text-sm" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Questions View */
        <div className="flex-1 flex flex-col justify-between py-1 overflow-hidden">
          {/* Progress bar */}
          <div className="shrink-0 my-1">
            <div className="flex items-center justify-between text-[10px] text-[#2563EB] font-bold mb-1">
              <span>Question {currentIdx + 1} of {currentPartQuestions.length}</span>
              <span>{answeredCount}/{currentPartQuestions.length} Answered</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2563EB] transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / currentPartQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="shrink-0 my-1">
            <h4 className="text-xs sm:text-sm md:text-base font-bold text-[#0F172A] leading-snug line-clamp-2">
              <span className="text-[#2563EB] font-black mr-1.5">Q{currentIdx + 1}.</span>
              {currentQ.question}
            </h4>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-1 overflow-hidden">
            {currentQ.options.map((opt, oIdx) => {
              const isSelected = selectedOption === oIdx;
              const letter = String.fromCharCode(65 + oIdx);
              return (
                <button
                  key={oIdx}
                  type="button"
                  onClick={() => handleSelect(currentQ.id, oIdx)}
                  className={`text-left p-2 sm:p-2.5 rounded-xl border transition-all flex items-center gap-2 cursor-pointer ${isSelected
                      ? 'bg-blue-50 border-[#2563EB] text-[#0F172A] shadow-xs ring-1 ring-[#2563EB]'
                      : 'bg-[#F8FAFC] border-slate-200 hover:bg-slate-100 text-[#0F172A] hover:border-slate-300'
                    }`}
                >
                  <span
                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${isSelected ? 'bg-[#2563EB] text-white' : 'bg-white border border-slate-200 text-[#475569]'
                      }`}
                  >
                    {letter}
                  </span>
                  <span className="text-xs font-medium leading-tight line-clamp-2">{opt}</span>
                </button>
              );
            })}
          </div>



          {/* Bottom Controls */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 shrink-0">
            <button
              type="button"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx((i) => i - 1)}
              className="px-3 py-1 rounded-full border border-slate-200 bg-white text-xs font-bold text-[#475569] disabled:opacity-40 hover:bg-slate-50 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Icon name="arrow_back" className="text-xs" /> Prev
            </button>

            {currentIdx < currentPartQuestions.length - 1 ? (
              <button
                type="button"
                disabled={selectedOption === undefined}
                onClick={() => setCurrentIdx((i) => i + 1)}
                className="px-4 py-1.5 rounded-full bg-[#2563EB] text-white text-xs font-bold disabled:opacity-40 hover:bg-[#1D4ED8] transition-all flex items-center gap-1 cursor-pointer"
              >
                Next <Icon name="arrow_forward" className="text-xs" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!isPartAnsweredAll}
                onClick={() => setShowSummary(true)}
                className="px-4 py-1.5 rounded-full bg-[#2563EB] text-white text-xs font-extrabold disabled:opacity-40 hover:bg-[#1D4ED8] shadow-sm transition-all flex items-center gap-1 cursor-pointer"
              >
                Submit & View Marks <Icon name="check" className="text-sm" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
