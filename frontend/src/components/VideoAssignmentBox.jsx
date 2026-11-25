import { useState } from 'react';
import Icon from './Icon.jsx';
import { api, assetUrl } from '../lib/api.js';

const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'jpg', 'jpeg', 'png',
];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

function getFileType(fileName, fileUrl) {
  if (fileName) {
    const parts = fileName.split('.');
    if (parts.length > 1) return parts.pop().toUpperCase();
  }
  if (fileUrl) {
    const parts = fileUrl.split('.');
    if (parts.length > 1) return parts.pop().split('?')[0].toUpperCase();
  }
  return 'FILE';
}

function formatFileSize(bytes) {
  if (!bytes || isNaN(bytes)) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getBadgeType(ext) {
  const e = (ext || '').toUpperCase();
  if (['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF', 'SVG'].includes(e)) return 'IMAGE';
  if (e === 'DOCX') return 'DOCX';
  if (e === 'DOC') return 'DOC';
  if (e === 'XLSX' || e === 'XLS' || e === 'CSV') return 'XLSX';
  if (e === 'PPTX' || e === 'PPT') return 'PPTX';
  if (e === 'PDF') return 'PDF';
  if (e === 'TXT') return 'TXT';
  return e || 'DOCUMENT';
}

function resolveFullUrl(rawUrl) {
  if (!rawUrl) return '';
  if (/^(https?:|data:|blob:)/i.test(rawUrl)) return rawUrl;
  const resolved = assetUrl(rawUrl);
  if (/^https?:/i.test(resolved)) return resolved;
  if (typeof window !== 'undefined') {
    const path = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`;
    return `${window.location.origin}${path}`;
  }
  return resolved;
}

function SingleTaskCard({
  task,
  videoId,
  user,
  onTaskUpdated,
  onPreviewFile,
  taskIndex = 0,
  totalTasks = 1,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showUpdateMode, setShowUpdateMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Status computation
  const status = task?.status || 'pending';
  const isApproved =
    status === 'APPROVED' ||
    status === 'VERIFIED' ||
    status === 'approved' ||
    status === 'verified' ||
    task?.verifiedBy === 'SYSTEM_AUTO_VERIFY';
  const isReviewed = status === 'reviewed' || isApproved;
  const isNeedsRevision = status === 'needs_revision';
  const isResubmitted = status === 'resubmitted';
  const isSubmitted = status === 'submitted' && !isApproved;
  const hasExistingSubmission = Boolean(task?.fileUrl);

  const processFile = (file) => {
    setErrorMessage('');
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMessage(
        `Unsupported format (.${ext || 'unknown'}). Supported formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, JPEG, PNG.`
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(
        `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 25MB.`
      );
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!user) {
      setErrorMessage('Please sign in to submit your answers.');
      return;
    }
    if (!selectedFile) {
      setErrorMessage('Please choose your answer file before submitting.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      setUploading(true);
      const uploadRes = await api.uploadTaskWork(selectedFile);
      setUploading(false);

      if (!uploadRes?.url) {
        throw new Error('Upload failed. Could not obtain file URL.');
      }

      const targetId = task?.taskId || task?.id || videoId;
      const res = await api.submitVideoAnswer(targetId, {
        fileUrl: uploadRes.url,
        fileName: selectedFile.name,
      });

      const returnedStatus = res?.status || res?.submission?.status;
      const nextStatus =
        returnedStatus || (isNeedsRevision ? 'resubmitted' : 'APPROVED');
      const updated = {
        ...(task || {}),
        taskId: task?.taskId || task?.id || res?.task?.id || res?.submission?.taskId,
        id: task?.id || res?.task?.id || res?.submission?.id,
        videoId: videoId || task?.videoId,
        status: nextStatus,
        verifiedBy: res?.verifiedBy || res?.submission?.verifiedBy || 'SYSTEM_AUTO_VERIFY',
        autoVerified: Boolean(res?.autoVerified ?? (nextStatus === 'APPROVED' || nextStatus === 'VERIFIED')),
        fileUrl: uploadRes.url,
        fileName: selectedFile.name,
        submittedAt: new Date().toISOString(),
        adminFeedback: null,
        certificate: res?.certificate || null,
        certificateStatus: res?.certificateStatus || null,
      };

      if (typeof onTaskUpdated === 'function') {
        onTaskUpdated(updated);
      }

      setSelectedFile(null);
      setShowUpdateMode(false);
      setSuccessMessage(
        isNeedsRevision
          ? 'Updated answers submitted successfully! 🎉'
          : 'Answers submitted successfully! 🎉'
      );
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error('Submission failed:', err);
      setErrorMessage(err?.message || 'Failed to submit answers. Please try again.');
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    if (selectedFile) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>File Ready</span>
        </span>
      );
    }
    if (isApproved) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1.5 shadow-2xs">
          <Icon name="verified" className="text-xs text-emerald-600" />
          <span>System Verified ✓</span>
        </span>
      );
    }
    if (isReviewed) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#0D9488] border border-emerald-200 inline-flex items-center gap-1.5">
          <Icon name="check_circle" className="text-xs text-[#10B981]" />
          <span>Reviewed</span>
        </span>
      );
    }
    if (isNeedsRevision) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1.5 animate-pulse">
          <Icon name="replay" className="text-xs text-amber-600" />
          <span>Revision Required</span>
        </span>
      );
    }
    if (isResubmitted || isSubmitted || hasExistingSubmission) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#0D9488] border border-emerald-200 inline-flex items-center gap-1.5">
          <Icon name="check_circle" className="text-xs text-[#10B981]" />
          <span>Submitted</span>
          {task?.submittedAt && (
            <span className="text-[10px] text-emerald-700/80 font-normal ml-0.5">
              • {new Date(task.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 inline-flex items-center gap-1.5">
        <Icon name="assignment_late" className="text-xs text-slate-500" />
        <span>Not Submitted</span>
      </span>
    );
  };

  const fileType = getFileType(task?.fileName, task?.fileUrl);

  const questionPaperUrl = task?.attachmentUrl || task?.referenceAttachmentUrl;
  const questionPaperName = task?.attachmentName || task?.referenceAttachmentName || 'Question-Material';
  const questionPaperSize = task?.attachmentSize || task?.referenceAttachmentSize || '';
  const questionPaperExt = task?.attachmentExt || task?.referenceAttachmentExt || getFileType(questionPaperName, questionPaperUrl);
  const badgeType = getBadgeType(questionPaperExt);
  const hasQuestionPaper = Boolean(questionPaperUrl);

  const handleViewInNewTab = (e) => {
    if (e) e.preventDefault();
    if (!questionPaperUrl) return;
    const resolvedUrl = resolveFullUrl(questionPaperUrl);
    const ext = (questionPaperName || '').split('.').pop()?.toLowerCase() || '';
    const isLocal =
      typeof window !== 'undefined' &&
      (/localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(window.location.hostname) ||
        /localhost|127\.0\.0\.1/i.test(resolvedUrl));

    if (['docx', 'doc', 'xlsx', 'xls', 'pptx', 'ppt'].includes(ext)) {
      if (!isLocal && /^https?:\/\//i.test(resolvedUrl)) {
        const gviewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(resolvedUrl)}&embedded=true`;
        window.open(gviewUrl, '_blank', 'noopener,noreferrer');
        return;
      }
    }
    // For .pdf, .txt, and image files (.png, .jpg, .jpeg, .webp), or local Office files, open resolvedUrl directly in a new tab
    window.open(resolvedUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadQuestionFile = async (e) => {
    if (e) e.preventDefault();
    if (!questionPaperUrl) return;
    const resolvedUrl = resolveFullUrl(questionPaperUrl);
    const fileName = questionPaperName || 'question-material';

    try {
      const response = await fetch(resolvedUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
    } catch {
      const link = document.createElement('a');
      link.href = resolvedUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm">
      {/* Multiple tasks indicator banner if more than 1 task */}
      {totalTasks > 1 && (
        <div className="mb-4 flex items-center justify-between pb-3 border-b border-slate-200">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-[#0D9488] border border-emerald-200">
            <Icon name="task_alt" className="text-xs text-[#10B981]" />
            Task {taskIndex + 1} of {totalTasks}
          </span>
          <span className="text-xs font-bold text-[#0F172A] truncate max-w-xs">
            {task?.title || 'Assignment'}
          </span>
        </div>
      )}

      {/* Unified Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-5">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center justify-center shrink-0">
            <Icon name="assignment" className="text-xl" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">
              {showUpdateMode ? 'Update Your Answers' : (task?.title || 'Submit Your Answers')}
            </h3>
            <p className="text-xs sm:text-sm text-[#475569] mt-0.5">
              {hasQuestionPaper
                ? 'Review the attached question material below, solve the exercises, and upload your answers.'
                : (task?.description || 'Watch the complete video and answer the questions provided in the video.')}
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 self-start sm:self-auto">
          {showUpdateMode && (
            <button
              type="button"
              onClick={() => {
                setShowUpdateMode(false);
                setSelectedFile(null);
              }}
              className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition cursor-pointer"
            >
              Cancel
            </button>
          )}
          {getStatusBadge()}
        </div>
      </div>

      {/* ── QUESTION MATERIAL & TASK DETAILS CARD ── */}
      {(hasQuestionPaper || task?.title || task?.instructions) && (
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-blue-50/70 via-white to-teal-50/70 border border-blue-200 p-4 sm:p-5 shadow-2xs animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-200/70 pb-3 mb-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Icon name="description" className="text-base" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  Question Material &amp; Task Details
                </span>
                <h4 className="text-sm font-extrabold text-[#0F172A] mt-0.5">
                  {task?.title || 'Assignment Question Material'}
                </h4>
              </div>
            </div>

            {task?.dueDate && (
              <span className="text-[11px] font-semibold text-[#0D9488] bg-white px-2.5 py-1 rounded-lg border border-teal-200 flex items-center gap-1 self-start sm:self-auto">
                <Icon name="event" className="text-xs text-[#0D9488]" />
                <span>Due: {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </span>
            )}
          </div>

          {/* Description & Instructions if provided */}
          {task?.description && (
            <p className="text-xs text-[#475569] mb-2 leading-relaxed font-medium">
              {task.description}
            </p>
          )}
          {task?.instructions && (
            <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-[#0F172A] mb-3.5 whitespace-pre-wrap leading-relaxed shadow-2xs">
              <strong className="text-[#2563EB] font-bold block mb-1">Instructions:</strong>
              {task.instructions}
            </div>
          )}

          {/* Question Material Document File Card */}
          {hasQuestionPaper && (
            <div className="p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center justify-center shrink-0 font-black text-xs">
                  {badgeType}
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs sm:text-sm font-bold text-[#0F172A] truncate" title={questionPaperName}>
                    {questionPaperName}
                  </h5>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#475569]">
                    <span className="font-semibold text-[#0D9488]">{badgeType} Document</span>
                    {questionPaperSize && <span>• {questionPaperSize}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleViewInNewTab}
                  className="px-4 py-2 rounded-xl bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 text-[#0F172A] text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                  title="View in new tab"
                >
                  <Icon name="open_in_new" className="text-sm text-[#2563EB]" />
                  <span>View</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadQuestionFile}
                  className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
                  title="Download Question File"
                >
                  <Icon name="download" className="text-xs" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CASE 1: REVISION REQUIRED ── */}
      {isNeedsRevision && (
        <div className="space-y-4">
          {task?.adminFeedback && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1">
                <Icon name="rate_review" className="text-sm" />
                Instructor Feedback:
              </span>
              <p className="text-xs sm:text-sm font-semibold text-amber-900 whitespace-pre-wrap leading-relaxed mt-1">
                {task.adminFeedback}
              </p>
            </div>
          )}

          {/* Upload Updated Answers Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragging
                  ? 'border-[#2563EB] bg-blue-50 ring-2 ring-blue-500/20'
                  : 'border-amber-300 hover:border-[#2563EB] hover:bg-blue-50/40 bg-amber-50/40'
                }`}
            >
              {!selectedFile ? (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mb-3">
                    <Icon name="upload_file" className="text-3xl" />
                  </div>
                  <p className="text-sm font-bold text-[#0F172A]">
                    Drag and drop your updated file here, or{' '}
                    <span className="text-[#2563EB] underline underline-offset-2">browse</span>
                  </p>
                  <p className="text-xs text-[#475569] mt-1 max-w-md">
                    Accepted common formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, JPEG, PNG (Max 25MB)
                  </p>
                  <div className="mt-4 flex justify-center">
                    <label className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm transition active:scale-95">
                      <Icon name="folder_open" className="text-sm" />
                      <span>Choose File</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        disabled={uploading || submitting}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-white border border-emerald-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 max-w-xl mx-auto">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0D9488] flex items-center justify-center shrink-0">
                      <Icon name="description" className="text-2xl" />
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-50 text-[#0D9488]">
                          {selectedFile.name.split('.').pop()?.toUpperCase()}
                        </span>
                        <span className="text-xs text-[#475569] font-medium">
                          {formatFileSize(selectedFile.size)}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0F172A] truncate mt-0.5 max-w-xs" title={selectedFile.name}>
                        {selectedFile.name}
                      </h4>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <label className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#0F172A] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition">
                      <Icon name="folder_open" className="text-xs" />
                      <span>Change</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png"
                        onChange={handleFileChange}
                        disabled={uploading || submitting}
                        className="hidden"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition"
                    >
                      <Icon name="close" className="text-xs" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <Icon name="error" className="text-sm shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={submitting || uploading || !selectedFile}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm ${submitting || uploading || !selectedFile
                    ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                    : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer active:scale-95'
                  }`}
              >
                {submitting || uploading ? (
                  <>
                    <Icon name="sync" className="animate-spin text-sm" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Icon name="check_circle" className="text-sm" />
                    <span>Resubmit Updated Answers</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── CASE 2: ALREADY SUBMITTED (Submitted / Resubmitted / Reviewed) ── */}
      {!isNeedsRevision && hasExistingSubmission && !showUpdateMode && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-[#F8FAFC] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0D9488] border border-emerald-200 flex items-center justify-center shrink-0">
                <Icon name="verified" className="text-2xl text-[#10B981]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-50 text-[#0D9488] border border-emerald-200">
                    {fileType}
                  </span>
                  <span className="text-xs text-[#475569] font-medium">
                    Submitted on{' '}
                    {task.submittedAt
                      ? new Date(task.submittedAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      : 'Recently'}
                  </span>
                </div>
                <div className="text-sm font-bold text-[#0F172A] truncate">
                  {task.fileName || 'answers.pdf'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={() =>
                  onPreviewFile({
                    url: task.fileUrl,
                    name: task.fileName || 'Answers Document',
                    type: fileType,
                  })
                }
                className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs inline-flex items-center gap-1 transition cursor-pointer shadow-xs"
              >
                <Icon name="visibility" className="text-xs" />
                <span>View File</span>
              </button>

              <a
                href={assetUrl(task.fileUrl)}
                target="_blank"
                rel="noreferrer"
                download
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[#0F172A] font-bold text-xs inline-flex items-center gap-1 transition"
              >
                <Icon name="download" className="text-xs" />
                <span>Download</span>
              </a>

              {!isReviewed && (
                <button
                  type="button"
                  onClick={() => setShowUpdateMode(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-[#0F172A] font-bold text-xs inline-flex items-center gap-1 transition cursor-pointer"
                >
                  <Icon name="edit" className="text-xs" />
                  <span>Update Submission</span>
                </button>
              )}
            </div>
          </div>

          {/* Instant System Auto-Verification Banner */}
          {isApproved && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Icon name="verified" className="text-base" />
                </span>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-emerald-800">
                    System Verified ✓
                  </div>
                  <p className="text-xs font-medium text-emerald-700 mt-0.5">
                    Your project submission passed automated verification and counts toward your official certificate.
                  </p>
                </div>
              </div>
              {task?.certificate?.certificateCode && (
                <span className="px-3 py-1 rounded-full bg-white border border-emerald-300 text-emerald-800 font-mono text-[11px] font-bold">
                  Certificate Ready: {task.certificate.certificateCode}
                </span>
              )}
            </div>
          )}

          {/* If reviewed and has score / feedback, display grading box */}
          {isReviewed && (task?.marksObtained !== null && task?.marksObtained !== undefined || task?.adminFeedback) && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0F172A] space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[#0D9488] flex items-center gap-1.5">
                  <Icon name="military_tech" className="text-base text-amber-500" />
                  Assessment Result:
                </span>
                {task?.marksObtained !== null && task?.marksObtained !== undefined && (
                  <span className="px-3 py-1 rounded-full bg-white text-[#0D9488] border border-emerald-200 font-black text-xs">
                    Awarded: {task.marksObtained} / {task.maxMarks || 100} ({Math.round((Number(task.marksObtained) / (Number(task.maxMarks) || 100)) * 100)}%)
                  </span>
                )}
              </div>

              {task?.adminFeedback && (
                <div className="pt-2 border-t border-emerald-200/70">
                  <span className="text-[11px] font-bold text-[#0F172A]">Admin Feedback:</span>
                  <p className="text-xs sm:text-sm font-medium text-[#475569] whitespace-pre-wrap leading-relaxed mt-0.5">
                    {task.adminFeedback}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── CASE 3: NOT YET SUBMITTED OR UPDATE MODE ── */}
      {!isNeedsRevision && (!hasExistingSubmission || showUpdateMode) && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${isDragging
                ? 'border-[#2563EB] bg-blue-50 ring-2 ring-blue-500/20'
                : 'border-slate-300 hover:border-[#2563EB] hover:bg-blue-50/40 bg-[#F8FAFC]'
              }`}
          >
            {!selectedFile ? (
              <div className="flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center justify-center mb-3">
                  <Icon name="upload_file" className="text-3xl" />
                </div>
                <p className="text-sm font-bold text-[#0F172A]">
                  Drag and drop your file here, or{' '}
                  <span className="text-[#2563EB] underline underline-offset-2">browse</span>
                </p>
                <p className="text-xs text-[#475569] mt-1 max-w-md">
                  Accepted common formats: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, JPEG, PNG (Max 25MB)
                </p>

                <div className="mt-4 flex justify-center">
                  <label className="px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer shadow-sm transition active:scale-95">
                    <Icon name="folder_open" className="text-sm" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      disabled={uploading || submitting}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ) : (
              /* Interactive File Selected State */
              <div className="p-4 rounded-xl bg-white border border-emerald-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 max-w-xl mx-auto">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#0D9488] flex items-center justify-center shrink-0">
                    <Icon name="description" className="text-2xl" />
                  </div>
                  <div className="min-w-0 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-50 text-[#0D9488]">
                        {selectedFile.name.split('.').pop()?.toUpperCase()}
                      </span>
                      <span className="text-xs text-[#475569] font-medium">
                        {formatFileSize(selectedFile.size)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-[#0F172A] truncate mt-0.5 max-w-xs" title={selectedFile.name}>
                      {selectedFile.name}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <label className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-[#0F172A] text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition">
                    <Icon name="folder_open" className="text-xs" />
                    <span>Change</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      disabled={uploading || submitting}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    className="px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition"
                  >
                    <Icon name="close" className="text-xs" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
              <Icon name="error" className="text-sm shrink-0 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting || uploading || !selectedFile}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm ${submitting || uploading || !selectedFile
                  ? 'bg-slate-300 text-slate-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-[#1D4ED8] hover:to-[#4338CA] text-white cursor-pointer active:scale-95'
                }`}
            >
              {submitting || uploading ? (
                <>
                  <Icon name="sync" className="animate-spin text-sm" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Icon name="send" className="text-sm" />
                  <span>{showUpdateMode ? 'Update Answers' : 'Submit Answers'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0D9488] text-xs font-bold flex items-center gap-2 animate-fade-in">
          <Icon name="check_circle" className="text-base shrink-0 text-[#10B981]" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function VideoAssignmentBox({
  task,
  videoId,
  youtubeVideoId,
  videoTitle,
  courseSlug,
  playlistId,
  user,
  onTaskUpdated,
}) {
  const [previewFileModal, setPreviewFileModal] = useState(null);

  // Extract all matching tasks (support both array res.tasks and single res.task / res)
  const tasksList =
    Array.isArray(task?.tasks) && task.tasks.length > 0
      ? task.tasks
      : task
        ? [task]
        : [];

  if (tasksList.length === 0) {
    return (
      <div className="w-full bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center justify-center mx-auto mb-3">
          <Icon name="assignment" className="text-2xl" />
        </div>
        <h3 className="text-base font-bold text-[#0F172A]">Questions &amp; Tasks</h3>
        <p className="text-xs text-[#475569] mt-1 max-w-sm mx-auto">
          No tasks or assignments found for this course chapter yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tasksList.map((t, idx) => (
        <SingleTaskCard
          key={t.id || t.taskId || `${videoId}-${idx}`}
          task={t}
          videoId={videoId}
          user={user}
          onTaskUpdated={onTaskUpdated}
          onPreviewFile={setPreviewFileModal}
          taskIndex={idx}
          totalTasks={tasksList.length}
        />
      ))}

      {/* In-app Preview Modal */}
      {previewFileModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-[#0F172A]">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center shrink-0">
                  <Icon name="description" className="text-base" />
                </span>
                <span className="text-xs sm:text-sm font-extrabold text-[#0F172A] truncate">
                  {previewFileModal.name}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={assetUrl(previewFileModal.url)}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-1 transition"
                >
                  <Icon name="download" className="text-xs" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewFileModal(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-[#0F172A] hover:bg-slate-200/70 cursor-pointer"
                >
                  <Icon name="close" className="text-base" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 flex items-center justify-center min-h-[50vh]">
              {previewFileModal.type === 'PDF' ? (
                <iframe
                  src={assetUrl(previewFileModal.url)}
                  title={previewFileModal.name}
                  className="w-full h-[65vh] rounded-2xl border border-slate-200 bg-white shadow-sm"
                />
              ) : ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF'].includes(previewFileModal.type) ? (
                <img
                  src={assetUrl(previewFileModal.url)}
                  alt={previewFileModal.name}
                  className="max-h-[65vh] max-w-full rounded-2xl shadow-sm object-contain"
                />
              ) : (
                <div className="text-center p-8 space-y-4 max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <Icon name="file_present" className="text-5xl text-[#2563EB] mx-auto" />
                  <h5 className="font-extrabold text-sm text-[#0F172A]">{previewFileModal.name}</h5>
                  <p className="text-xs text-[#475569]">
                    This file format is best viewed with your local application ({previewFileModal.type}).
                  </p>
                  <a
                    href={assetUrl(previewFileModal.url)}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition"
                  >
                    <Icon name="download" className="text-sm" />
                    <span>Download File</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
