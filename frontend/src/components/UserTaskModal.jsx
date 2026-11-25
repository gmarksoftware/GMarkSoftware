import { useState } from 'react';
import Icon from './Icon.jsx';
import { api, assetUrl } from '../lib/api.js';

const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'jpg', 'jpeg', 'png',
];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

export default function UserTaskModal({ task, onClose, onSuccess, onTaskUpdated }) {
  if (!task) return null;

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(task.fileUrl || '');
  const [fileName, setFileName] = useState(task.fileName || '');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [previewFileModal, setPreviewFileModal] = useState(null);

  const questionPaperUrl = task?.attachmentUrl || task?.referenceAttachmentUrl;
  const questionPaperName = task?.attachmentName || task?.referenceAttachmentName || 'Question-Paper';
  const questionPaperSize = task?.attachmentSize || task?.referenceAttachmentSize || '';
  const questionPaperExt = task?.attachmentExt || task?.referenceAttachmentExt || (questionPaperName.includes('.') ? questionPaperName.split('.').pop().toUpperCase() : 'DOC');
  const hasQuestionPaper = Boolean(questionPaperUrl);

  const handleDownloadFile = async (rawUrl, name = 'Question-Paper') => {
    if (!rawUrl) return;
    try {
      const fullUrl = rawUrl.startsWith('http') ? rawUrl : assetUrl(rawUrl);
      try {
        const response = await fetch(fullUrl, { mode: 'cors' });
        if (!response.ok) throw new Error('Download failed');
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
      } catch {
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = name;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('File download error:', err);
    }
  };

  const currentStatus = task.status || 'pending';
  const isNeedsRevision = currentStatus === 'needs_revision';
  const isSystemApproved =
    currentStatus === 'APPROVED' ||
    currentStatus === 'VERIFIED' ||
    currentStatus === 'approved' ||
    currentStatus === 'verified' ||
    task?.verifiedBy === 'SYSTEM_AUTO_VERIFY';
  const isSubmitted = !isSystemApproved && (currentStatus === 'submitted' || currentStatus === 'resubmitted');
  const isReviewed = currentStatus === 'reviewed' || isSystemApproved;

  const handleFileChange = (e) => {
    setErrorMessage('');
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      setErrorMessage(`Unsupported file format (.${ext || 'unknown'}). Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, JPEG, PNG.`);
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrorMessage(`File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed size is 25MB.`);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!selectedFile && !fileUrl) {
      setErrorMessage('Please choose your completed answers file before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      let finalUrl = fileUrl;
      let finalName = fileName;

      // If user selected a new file, upload it first
      if (selectedFile) {
        setUploadingFile(true);
        const uploadRes = await api.uploadTaskWork(selectedFile);
        if (!uploadRes?.url) {
          throw new Error('Upload failed. Could not retrieve uploaded file URL.');
        }
        finalUrl = uploadRes.url;
        finalName = selectedFile.name;
        setFileUrl(finalUrl);
        setFileName(finalName);
        setUploadingFile(false);
      }

      // Submit answer file for the task / video
      const targetId = task.taskId || task.id || task.videoId;
      const res = await api.submitVideoAnswer(targetId, {
        fileUrl: finalUrl,
        fileName: finalName,
      });

      const returnedStatus = res?.status || res?.submission?.status;
      const nextStatus = returnedStatus || (isNeedsRevision ? 'resubmitted' : 'APPROVED');
      const isAutoVerified =
        nextStatus === 'APPROVED' ||
        nextStatus === 'VERIFIED' ||
        res?.verifiedBy === 'SYSTEM_AUTO_VERIFY' ||
        res?.autoVerified;
      setSuccessMessage(
        isAutoVerified
          ? 'System Verified ✓ Your project submission has been verified!'
          : 'Answers submitted successfully! 🎉'
      );

      const updatedTask = {
        ...task,
        status: nextStatus,
        verifiedBy: res?.verifiedBy || res?.submission?.verifiedBy || 'SYSTEM_AUTO_VERIFY',
        autoVerified: Boolean(isAutoVerified),
        fileUrl: finalUrl,
        fileName: finalName,
        submittedAt: new Date().toISOString(),
        adminFeedback: null,
        submission: res?.submission,
        certificate: res?.certificate || null,
        certificateStatus: res?.certificateStatus || null,
      };

      if (typeof onSuccess === 'function') onSuccess(updatedTask);
      if (typeof onTaskUpdated === 'function') onTaskUpdated(updatedTask);

      setTimeout(() => {
        onClose();
      }, 1400);
    } catch (err) {
      console.error('Submission error:', err);
      setErrorMessage(err?.message || 'Failed to submit answers. Please try again.');
    } finally {
      setUploadingFile(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-[#0F172A]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center shrink-0">
              <Icon name="assignment" className="text-xl" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                Video Assignment / Answer Submission
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-[#0F172A] mt-1">
                {task.title || 'Video Assignment'}
              </h3>
              {task.videoTitle && (
                <p className="text-xs text-[#475569] flex items-center gap-1 mt-0.5">
                  <Icon name="smart_display" className="text-xs text-[#2563EB]" />
                  <span>Video: <strong className="text-[#0F172A]">{task.videoTitle}</strong></span>
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-[#0F172A] hover:bg-slate-200/70 transition cursor-pointer"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Question Paper Box or Video Instructions */}
          {hasQuestionPaper ? (
            <div className="p-4 rounded-2xl bg-[#EFF6FF]/60 border border-blue-200 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-200/70 pb-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#2563EB] bg-white px-2 py-0.5 rounded-md border border-blue-200">
                  Question Paper / Assignment Worksheet
                </span>
                {task?.dueDate && (
                  <span className="text-[10px] font-bold text-[#475569] flex items-center gap-1">
                    <Icon name="event" className="text-xs text-[#2563EB]" />
                    <span>Due: {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </span>
                )}
              </div>

              {task.description && (
                <p className="text-xs text-[#475569] font-medium leading-relaxed">
                  {task.description}
                </p>
              )}
              {task.instructions && (
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-[#0F172A] whitespace-pre-wrap leading-relaxed">
                  <strong className="text-[#2563EB] font-bold block mb-0.5">Instructions:</strong>
                  {task.instructions}
                </div>
              )}

              <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="px-2 py-1 rounded bg-blue-50 text-[#2563EB] font-black text-[10px] uppercase shrink-0 border border-blue-200">
                    {questionPaperExt}
                  </span>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-[#0F172A] truncate" title={questionPaperName}>
                      {questionPaperName}
                    </h5>
                    {questionPaperSize && (
                      <p className="text-[10px] text-[#475569]">{questionPaperSize}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setPreviewFileModal({
                      url: questionPaperUrl,
                      name: questionPaperName,
                      type: questionPaperExt,
                    })}
                    className="px-2.5 py-1.5 rounded-lg bg-[#F8FAFC] hover:bg-slate-100 text-[#2563EB] border border-slate-200 text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                  >
                    <Icon name="visibility" className="text-xs" />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadFile(questionPaperUrl, questionPaperName)}
                    className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer shadow-2xs"
                  >
                    <Icon name="download" className="text-xs" />
                    <span>Download Question File</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-[#0F172A] space-y-1">
              <div className="flex items-center gap-2 font-black text-xs text-[#2563EB]">
                <Icon name="ondemand_video" className="text-base" />
                <span>Questions are in the Video</span>
              </div>
              <p className="text-xs text-[#475569] leading-relaxed font-medium">
                Watch the complete video and answer the questions provided in the video. Prepare your answers and upload your completed document below.
              </p>
            </div>
          )}

          {/* Status Badges & Banners */}
          {isReviewed && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0F172A] space-y-1.5">
              <div className="flex items-center gap-1.5 font-black text-sm text-[#0D9488]">
                <Icon name="verified" className="text-base text-[#10B981]" />
                <span>Reviewed &amp; Approved! 🎉</span>
              </div>
              {task.adminFeedback && (
                <p className="text-xs text-[#0F172A] font-medium">
                  <strong>Instructor Feedback:</strong> {task.adminFeedback}
                </p>
              )}
            </div>
          )}

          {isNeedsRevision && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-1.5 font-black text-sm text-amber-800">
                <Icon name="replay" className="text-base text-amber-600" />
                <span>Revision Requested</span>
              </div>
              {task.adminFeedback && (
                <div className="text-xs bg-white p-3 rounded-xl border border-amber-200 font-medium text-[#0F172A] leading-relaxed">
                  <strong>Instructor Feedback:</strong> {task.adminFeedback}
                </div>
              )}
              <p className="text-[11px] text-amber-800 font-medium">
                Please update your answer document according to the feedback above and upload your revised file below.
              </p>
            </div>
          )}

          {isSubmitted && !isNeedsRevision && !isReviewed && (
            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-[#0F172A] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Icon name="schedule" className="text-base text-[#2563EB] shrink-0" />
                <span className="text-xs font-medium text-[#475569]">
                  Answers submitted on{' '}
                  <strong className="text-[#0F172A]">
                    {task.submittedAt
                      ? new Date(task.submittedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                      : 'recently'}
                  </strong>
                  . Awaiting instructor review.
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white text-[#2563EB] border border-blue-200 text-[10px] font-black uppercase tracking-wider shrink-0">
                {currentStatus === 'resubmitted' ? 'Resubmitted' : 'Submitted'}
              </span>
            </div>
          )}

          {/* Current Attached / Submitted File */}
          {fileUrl && (
            <div className="p-3.5 rounded-2xl bg-[#F8FAFC] border border-slate-200 space-y-2">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                <span>Submitted Answers File</span>
                <span className="text-[#0D9488] font-bold">
                  {task.submittedAt ? new Date(task.submittedAt).toLocaleDateString('en-IN') : 'Uploaded'}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon name="description" className="text-lg text-[#2563EB] shrink-0" />
                  <span className="text-xs font-bold text-[#0F172A] truncate">{fileName || 'Submitted_Answers'}</span>
                </div>
                <a
                  href={assetUrl(fileUrl)}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-3 py-1 rounded-lg bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 text-[#2563EB] font-bold text-xs inline-flex items-center gap-1 transition shrink-0"
                >
                  <Icon name="download" className="text-xs" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          )}

          {/* Upload Your Answers Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            <div className="space-y-2">
              <label className="block text-xs font-black text-[#0F172A]">
                {isNeedsRevision
                  ? 'Upload Revised Answers'
                  : fileUrl
                    ? 'Replace / Update Answers File'
                    : 'Upload Your Answers'}
              </label>

              <div className="border-2 border-dashed border-slate-300 hover:border-[#2563EB] rounded-2xl p-5 text-center transition bg-[#F8FAFC]">
                <Icon name="upload_file" className="text-3xl text-[#2563EB] mx-auto mb-2" />
                <p className="text-xs font-bold text-[#0F172A]">
                  {selectedFile ? selectedFile.name : 'Choose answer document to upload'}
                </p>
                <p className="text-[11px] text-[#475569] mt-1">
                  Supported: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, PNG (Max 25MB)
                </p>

                <div className="mt-3 flex justify-center">
                  <label className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition active:scale-95">
                    <Icon name="folder_open" className="text-sm" />
                    <span>{selectedFile ? 'Change File' : 'Choose File'}</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      disabled={uploadingFile || submitting}
                      className="hidden"
                    />
                  </label>
                </div>

                {selectedFile && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-[#0D9488] text-[11px] font-bold border border-emerald-200">
                    <Icon name="check_circle" className="text-xs text-[#10B981]" />
                    <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="ml-1 text-slate-500 hover:text-red-500 cursor-pointer"
                      title="Remove"
                    >
                      <Icon name="close" className="text-xs" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
                <Icon name="error" className="text-sm shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#0D9488] text-xs font-bold flex items-center gap-2">
                <Icon name="check_circle" className="text-sm shrink-0 text-[#10B981]" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-[#475569] hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                disabled={submitting || uploadingFile || (!selectedFile && !fileUrl)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-[#1D4ED8] hover:to-[#4338CA] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer disabled:opacity-50"
              >
                {submitting || uploadingFile ? (
                  <>
                    <Icon name="sync" className="animate-spin text-sm" />
                    <span>{uploadingFile ? 'Uploading file...' : 'Submitting answers...'}</span>
                  </>
                ) : (
                  <>
                    <Icon name="check_circle" className="text-sm text-blue-100" />
                    <span>
                      {isNeedsRevision
                        ? 'Submit Revised Answers'
                        : fileUrl
                          ? 'Update Answers'
                          : 'Submit Answers'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* In-app Preview Modal */}
      {previewFileModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
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
                <button
                  type="button"
                  onClick={() => handleDownloadFile(previewFileModal.url, previewFileModal.name)}
                  className="px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Icon name="download" className="text-xs" />
                  <span>Download</span>
                </button>
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
                    This document can be opened and viewed with your local application ({previewFileModal.type}).
                  </p>
                  <button
                    type="button"
                    onClick={() => handleDownloadFile(previewFileModal.url, previewFileModal.name)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition cursor-pointer shadow-xs"
                  >
                    <Icon name="download" className="text-sm" />
                    <span>Download File</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
