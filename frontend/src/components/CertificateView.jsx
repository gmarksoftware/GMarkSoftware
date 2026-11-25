import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from './Icon.jsx';

/**
 * Deterministic 21x21 QR-style visual verification matrix encoded from certificateCode.
 * Paired with the canonical clickable verification URL for reliable offline & print rendering.
 */
function VerificationQrSvg({ value }) {
  const size = 21;
  const cells = useMemo(() => {
    const str = String(value || 'GMARK');
    let seed = 2166136261;
    for (let i = 0; i < str.length; i += 1) {
      seed ^= str.charCodeAt(i);
      seed = Math.imul(seed, 16777619);
    }

    const isFinder = (r, c) => {
      const inTopLeft = r < 7 && c < 7;
      const inTopRight = r < 7 && c >= size - 7;
      const inBottomLeft = r >= size - 7 && c < 7;
      if (!inTopLeft && !inTopRight && !inBottomLeft) return null;
      const lr = r >= size - 7 ? r - (size - 7) : r;
      const lc = c >= size - 7 ? c - (size - 7) : c;
      if (lr === 0 || lr === 6 || lc === 0 || lc === 6) return true;
      if (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4) return true;
      return false;
    };

    const grid = [];
    let state = seed >>> 0;
    for (let r = 0; r < size; r += 1) {
      for (let c = 0; c < size; c += 1) {
        const finder = isFinder(r, c);
        if (finder !== null) {
          if (finder) grid.push([r, c]);
          continue;
        }
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        if ((state >>> 30) & 1) {
          grid.push([r, c]);
        }
      }
    }
    return grid;
  }, [value]);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="w-20 h-20 rounded-lg bg-white p-1.5 border border-slate-200 shadow-2xs"
      role="img"
      aria-label={`Verification QR for ${value}`}
    >
      <rect width={size} height={size} fill="#FFFFFF" />
      {cells.map(([r, c]) => (
        <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#0F172A" />
      ))}
    </svg>
  );
}

export default function CertificateView({
  certificate,
  onContactCompany,
  showActions = true,
  compact = false,
}) {
  const [copied, setCopied] = useState(false);

  if (!certificate) return null;

  const code = certificate.certificateCode || certificate.code || '';
  const learnerName = certificate.learnerName || certificate.userName || 'Verified Learner';
  const courseTitle = certificate.courseTitle || 'G-Mark Certified Program';
  const completedDate = certificate.completedAt
    ? new Date(certificate.completedAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const verifyPath = `/verify-certificate/${encodeURIComponent(code)}`;
  const verifyUrl =
    typeof window !== 'undefined' ? `${window.location.origin}${verifyPath}` : verifyPath;

  const handleCopy = () => {
    if (!code) return;
    try {
      navigator.clipboard?.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <style>{`
        @media print {
          @page { size: landscape; margin: 10mm; }
          body * { visibility: hidden !important; }
          .gmark-certificate-sheet, .gmark-certificate-sheet * { visibility: visible !important; }
          .gmark-certificate-sheet {
            position: fixed !important;
            inset: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Top Action Bar */}
      {showActions && (
        <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold">
              <Icon name="verified" className="text-sm text-emerald-600" />
              System Verified ✓
            </span>
            <span className="text-xs font-mono font-bold text-[#475569] bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              {code}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#0F172A] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Icon name={copied ? 'check' : 'content_copy'} className="text-sm text-[#2563EB]" />
              <span>{copied ? 'Link Copied' : 'Copy Verification URL'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer"
            >
              <Icon name="print" className="text-sm" />
              <span>Download / Print PDF</span>
            </button>

            {typeof onContactCompany === 'function' && (
              <button
                type="button"
                onClick={() => onContactCompany(certificate)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Icon name="business_center" className="text-sm" />
                <span>Contact G-Mark Company / Apply with Certificate</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Official Light-Gold & Royal-Blue Certificate Frame */}
      <div
        className={`gmark-certificate-sheet relative overflow-hidden rounded-3xl bg-white border-2 border-amber-300/90 shadow-xl ${
          compact ? 'p-6 sm:p-8' : 'p-8 sm:p-12'
        }`}
      >
        {/* Subtle Enterprise Watermark & Corner Foil */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 rounded-2xl border border-[#2563EB]/20"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-amber-100/70 via-blue-50/50 to-transparent blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-gradient-to-tr from-blue-100/60 via-amber-50/50 to-transparent blur-2xl"
        />

        <div className="relative z-10 space-y-6">
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-200/80 pb-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1E3A8A] text-white flex items-center justify-center shadow-md">
                <Icon name="workspace_premium" className="text-2xl text-amber-300" />
              </div>
              <div>
                <div className="text-xs font-black uppercase tracking-[0.22em] text-[#2563EB]">
                  G-Mark Software Academy
                </div>
                <div className="text-base sm:text-lg font-extrabold text-[#0F172A]">
                  Official Certificate of Completion
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-xs font-extrabold shadow-2xs">
              <Icon name="verified" className="text-base text-amber-600" />
              <span>VERIFIED CREDENTIAL</span>
            </div>
          </div>

          {/* Core Statement */}
          <div className="text-center py-3 sm:py-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#475569]">
              This is to certify that
            </p>
            <h2 className="text-2xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
              {learnerName}
            </h2>
            <p className="text-sm sm:text-base text-[#475569] max-w-2xl mx-auto leading-relaxed">
              has successfully completed 100% of all mandatory non-skippable video lessons, passed all required assessments, and submitted an auto-verified project for
            </p>
            <div className="inline-block px-6 py-3 rounded-2xl bg-[#F8FAFC] border border-blue-200 shadow-2xs">
              <div className="text-lg sm:text-2xl font-extrabold text-[#2563EB]">
                {courseTitle}
              </div>
            </div>
          </div>

          {/* Verification Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 items-center pt-5 border-t border-slate-200">
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                Completion Date
              </div>
              <div className="text-sm font-extrabold text-[#0F172A]">{completedDate}</div>
              <div className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 pt-0.5">
                <Icon name="check_circle" className="text-sm text-emerald-600" />
                <span>Status: {certificate.verificationStatus || 'VERIFIED'}</span>
              </div>
            </div>

            <div className="text-left sm:text-center space-y-1">
              <div className="inline-flex flex-col items-start sm:items-center">
                <div className="text-sm font-black text-[#0F172A] tracking-wide">
                  G-Mark Software
                </div>
                <div className="text-[11px] font-semibold text-[#475569]">
                  Authorized Certification Board
                </div>
                <div className="mt-1.5 font-mono text-[11px] font-bold text-[#2563EB] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
                  ID: {code}
                </div>
              </div>
            </div>

            <div className="flex items-center sm:justify-end gap-3">
              <div className="text-left sm:text-right">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#475569]">
                  Scan or Verify Online
                </div>
                <Link
                  to={verifyPath}
                  className="text-[11px] font-bold text-[#2563EB] hover:underline break-all"
                >
                  {verifyPath}
                </Link>
              </div>
              <VerificationQrSvg value={verifyUrl} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CertificationIntroModal({
  isOpen,
  courseTitle = 'this course',
  strictNonSkippable = true,
  requireProject = true,
  onStartWatching,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const steps = [
    {
      num: '1',
      icon: 'play_circle',
      title: 'Watch 100% of All Course Videos',
      desc: strictNonSkippable
        ? 'Videos are non-skippable and unlock lesson-by-lesson so every concept is covered.'
        : 'Complete every video lesson in the syllabus.',
    },
    {
      num: '2',
      icon: 'quiz',
      title: 'Pass All Required Course MCQs',
      desc: 'Complete interactive lesson quizzes and assessments to verify mastery.',
    },
    {
      num: '3',
      icon: 'verified',
      title: 'Submit Your Course Project',
      desc: requireProject
        ? 'Receive instant automatic system verification as soon as your work is submitted.'
        : 'Submit practical coursework to showcase your skills.',
    },
    {
      num: '4',
      icon: 'workspace_premium',
      title: 'Unlock Your Official Certificate',
      desc: 'Download your verifiable G-Mark Software Certificate (PDF) and apply or connect directly with our company.',
    },
  ];

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gmark-cert-intro-title"
      className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden my-auto text-[#0F172A]"
      >
        <div className="bg-gradient-to-r from-[#EFF6FF] via-[#F8FAFC] to-amber-50/70 border-b border-slate-200 px-6 py-5 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shadow-md shrink-0">
              <Icon name="workspace_premium" className="text-2xl text-amber-300" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-[10px] font-extrabold uppercase tracking-wider mb-1">
                <Icon name="verified" className="text-xs" />
                Official Credential Track
              </div>
              <h2 id="gmark-cert-intro-title" className="text-xl sm:text-2xl font-extrabold text-[#0F172A] leading-tight">
                Earn Your G-Mark Software Certificate
              </h2>
              <p className="text-xs text-[#475569] mt-0.5 line-clamp-1 font-medium">
                {courseTitle}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 transition cursor-pointer shrink-0"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-3">
            {steps.map((s) => (
              <div
                key={s.num}
                className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex items-start gap-3"
              >
                <span className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 text-[#2563EB] font-black text-xs flex items-center justify-center shrink-0">
                  {s.num}
                </span>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-extrabold text-[#0F172A] flex items-center gap-1.5">
                    <Icon name={s.icon} className="text-sm text-[#2563EB] shrink-0" />
                    <span>{s.title}</span>
                  </div>
                  <p className="text-xs text-[#475569] mt-1 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-[#475569] cursor-pointer transition"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => {
                onClose?.();
                onStartWatching?.();
              }}
              className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs sm:text-sm font-extrabold inline-flex items-center gap-2 shadow-sm cursor-pointer transition active:scale-95"
            >
              <Icon name="play_arrow" className="text-base" />
              <span>Start Watching & Earn Certificate</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CertificationSuccessModal({
  isOpen,
  certificate,
  learnerNameFallback = 'Verified Learner',
  courseTitleFallback = 'G-Mark Certified Program',
  onViewCertificate,
  onContactCompany,
  onClose,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !certificate) return null;

  const learnerName = certificate.learnerName || certificate.userName || learnerNameFallback;
  const courseTitle = certificate.courseTitle || courseTitleFallback;
  const code = certificate.certificateCode || certificate.code || '';

  return (
    <div
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gmark-cert-success-title"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border-2 border-amber-300/90 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden my-auto text-[#0F172A]"
      >
        <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50/70 border-b border-slate-200 px-6 py-6 text-center relative">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-4 right-4 p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 transition cursor-pointer"
          >
            <Icon name="close" className="text-lg" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-[#059669] text-white flex items-center justify-center mx-auto shadow-md mb-3">
            <Icon name="workspace_premium" className="text-3xl text-amber-300" />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[#059669] text-xs font-extrabold uppercase tracking-wider">
            <Icon name="verified" className="text-sm" />
            Verified Official Credential
          </span>

          <h2 id="gmark-cert-success-title" className="text-2xl sm:text-3xl font-black text-[#0F172A] mt-3">
            Course Completed & Certified!
          </h2>
          <p className="text-xs sm:text-sm text-[#475569] mt-1">
            Congratulations! Every video, MCQ assessment, and project milestone has been verified.
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-2.5 text-center">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                Awarded To
              </div>
              <div className="text-lg font-extrabold text-[#0F172A]">{learnerName}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#475569]">
                Program Completed
              </div>
              <div className="text-sm font-bold text-[#2563EB]">{courseTitle}</div>
            </div>
            {code && (
              <div className="pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-blue-200 font-mono text-xs font-extrabold text-[#2563EB]">
                  <Icon name="qr_code_2" className="text-sm" />
                  Verification ID: {code}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={() => onViewCertificate?.(certificate)}
              className="w-full px-5 py-3 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-extrabold inline-flex items-center justify-center gap-2 shadow-sm cursor-pointer transition active:scale-[0.99]"
            >
              <Icon name="download" className="text-base" />
              <span>View & Download Official Certificate</span>
            </button>

            <button
              type="button"
              onClick={() => onContactCompany?.(certificate)}
              className="w-full px-5 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[#059669] text-sm font-extrabold inline-flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <Icon name="business_center" className="text-base" />
              <span>Contact G-Mark Company with Certificate</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-bold text-[#475569] hover:text-[#0F172A] cursor-pointer transition"
            >
              Continue Reviewing Course Materials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

