import React, { useState } from 'react';
import Icon from './Icon.jsx';
import { assetUrl } from '../lib/api.js';

export default function ChapterNotesDownloadModal({
  isOpen,
  chapter,
  chapterIndex = 0,
  courseTitle = '',
  onClose,
}) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !chapter) return null;

  // Determine chapter title & chapter number
  const chapterNumber = chapterIndex + 1;
  const chapterTitle = chapter.t || chapter.title || `Chapter ${chapterNumber}`;

  // Clean PDF/Doc filename matching user specification: Chapter-X-Notes.pdf
  const defaultFileName = `Chapter-${chapterNumber}-Notes.pdf`;
  const rawFileName = chapter.notesName || chapter.noteName;
  const isRawSystemName =
    !rawFileName ||
    typeof rawFileName !== 'string' ||
    /^note_[0-9a-z_-]+/i.test(rawFileName.trim()) ||
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}/i.test(rawFileName.trim()) ||
    /^[0-9a-f]{16,}/i.test(rawFileName.trim());

  const fileName = isRawSystemName ? defaultFileName : rawFileName.trim();

  const rawUrl = chapter.notesUrl || chapter.noteUrl || chapter.file || chapter.url;
  const fileSize = chapter.notesSize || chapter.size || 'Study Material';
  const fileExt = (chapter.notesExt || chapter.ext || fileName.split('.').pop() || 'PDF').toUpperCase();
  const isPdf = fileExt === 'PDF' || /\.pdf$/i.test(fileName);

  const handleDownload = async () => {
    if (downloading) return; // Prevent duplicate downloads from repeated clicks
    setErrorMsg('');

    if (!rawUrl) {
      setErrorMsg('Notes are not available for this chapter yet.');
      return;
    }

    setDownloading(true);

    try {
      const fullUrl = rawUrl.startsWith('http') ? rawUrl : assetUrl(rawUrl);

      // Attempt blob download to ensure proper filename and track success
      try {
        const response = await fetch(fullUrl, { mode: 'cors' });
        if (!response.ok) {
          throw new Error('File download response not ok');
        }
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
      } catch (fetchErr) {
        // Fallback to direct anchor download
        const link = document.createElement('a');
        link.href = fullUrl;
        link.download = fileName;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloading(false);
        setDownloadSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Notes download error:', err);
      setErrorMsg('Failed to download notes. Please try again.');
      setDownloading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden text-[#0F172A] my-8 transition-all flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center shrink-0">
              <Icon name="description" className="text-xl" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A] truncate">
                {chapterTitle} Notes
              </h3>
              <p className="text-[11px] text-[#475569] truncate">{fileName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full text-slate-400 hover:text-[#0F172A] hover:bg-slate-200/70 flex items-center justify-center transition cursor-pointer shrink-0"
            title="Close"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-200 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center shrink-0 shadow-2xs">
              <Icon name={isPdf ? "picture_as_pdf" : "description"} className="text-2xl" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-[#0F172A] truncate">
                File: <span className="font-semibold text-[#2563EB]">{fileName}</span>
              </div>
              <div className="text-[11px] text-[#475569] font-medium truncate mt-0.5">
                {fileSize} · {fileExt} Document
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <Icon name="error_outline" className="text-sm shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {downloadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[#0D9488] text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
              <Icon name="check_circle" className="text-sm shrink-0 text-[#10B981]" />
              <span>Starting notes download...</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            disabled={downloading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-[#475569] text-xs font-bold transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#4F46E5] hover:from-[#1D4ED8] hover:to-[#4338CA] text-white text-xs font-bold flex items-center gap-2 shadow-sm transition active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Icon
              name={downloading ? 'sync' : 'download'}
              className={`text-sm ${downloading ? 'animate-spin' : ''}`}
            />
            <span>{downloading ? 'Preparing...' : 'Download Notes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
