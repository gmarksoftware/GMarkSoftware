import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import CertificateView from '../components/CertificateView.jsx';
import ExpertModal from '../components/ExpertModal.jsx';
import Icon from '../components/Icon.jsx';

export default function CertificateVerification() {
  const { code } = useParams();
  const navigate = useNavigate();

  const [lookupInput, setLookupInput] = useState(code || '');
  const [loading, setLoading] = useState(Boolean(code));
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState('');
  const [contactOpen, setContactOpen] = useState(false);

  useEffect(() => {
    setLookupInput(code || '');
    if (!code) {
      setCertificate(null);
      setError('');
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError('');

    api
      .verifyCertificate(code.trim())
      .then((res) => {
        if (cancelled) return;
        setCertificate(res);
      })
      .catch((err) => {
        if (cancelled) return;
        setCertificate(null);
        setError(err?.message || 'Certificate not found or invalid verification code.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [code]);

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    const cleaned = lookupInput.trim();
    if (!cleaned) return;
    navigate(`/verify-certificate/${encodeURIComponent(cleaned)}`);
  };

  const prefilledInquiryMessage = certificate
    ? `Hello G-Mark Software Team,\n\nI am reaching out regarding my verified certification credential:\n• Certificate ID: ${certificate.certificateCode}\n• Course Completed: ${certificate.courseTitle}\n• Learner Name: ${certificate.learnerName || certificate.userName || ''}\n• Verification Link: ${typeof window !== 'undefined' ? `${window.location.origin}/verify-certificate/${certificate.certificateCode}` : ''}\n\nI would like to apply / connect with your engineering & placement team.`
    : '';

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Navigation & Verification Search */}
        <div className="no-print bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#2563EB] mb-1">
              <Icon name="verified_user" className="text-base" />
              <span>G-Mark Credential Registry</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0F172A]">
              Verify Certificate Authenticity
            </h1>
            <p className="text-sm text-[#475569] mt-1">
              Enter a G-Mark Certificate ID (e.g. GMARK-2026-XXXXXX) to verify completion and project status.
            </p>
          </div>

          <form onSubmit={handleLookupSubmit} className="flex items-center gap-2 w-full md:w-auto">
            <input
              type="text"
              value={lookupInput}
              onChange={(e) => setLookupInput(e.target.value)}
              placeholder="GMARK-2026-XXXXXX"
              className="w-full md:w-64 px-4 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-sm font-mono font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-bold shrink-0 cursor-pointer transition"
            >
              Verify
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-xs">
            <Icon name="progress_activity" className="text-3xl text-[#2563EB] animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-[#475569]">
              Verifying certificate against G-Mark Software registry...
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white border border-rose-200 rounded-2xl p-8 text-center shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Icon name="gpp_bad" className="text-2xl" />
            </div>
            <h2 className="text-lg font-extrabold text-[#0F172A]">Certificate Not Verified</h2>
            <p className="text-sm text-[#475569] max-w-md mx-auto">{error}</p>
            <div className="pt-2">
              <Link
                to="/courses"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-[#1D4ED8] transition"
              >
                <Icon name="school" className="text-sm" />
                Browse G-Mark Courses
              </Link>
            </div>
          </div>
        )}

        {/* Valid Certificate View */}
        {!loading && certificate && (
          <div className="space-y-6">
            <CertificateView
              certificate={certificate}
              onContactCompany={() => setContactOpen(true)}
            />

            {(certificate.projectTitle || certificate.projectUrl) && (
              <div className="no-print bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                    <Icon name="task_alt" className="text-base text-emerald-600" />
                    Verified Capstone Project
                  </div>
                  <div className="text-sm font-bold text-[#0F172A] mt-1">
                    {certificate.projectTitle || 'Course Project Submission'}
                  </div>
                </div>
                {certificate.projectUrl && (
                  <a
                    href={certificate.projectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-bold inline-flex items-center gap-1.5 transition"
                  >
                    <Icon name="open_in_new" className="text-sm text-[#2563EB]" />
                    Inspect Submitted Project
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <ExpertModal
        isOpen={contactOpen}
        onClose={() => setContactOpen(false)}
        initialSolutionArea="G-Mark Certified Academy"
        initialMessage={prefilledInquiryMessage}
        initialName={certificate?.learnerName || certificate?.userName || ''}
      />
    </div>
  );
}
