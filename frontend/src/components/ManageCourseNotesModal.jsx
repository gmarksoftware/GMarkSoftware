import { useState, useEffect } from 'react';
import Icon from './Icon.jsx';
import { adminApi, assetUrl, resolveApiPath } from '../lib/api.js';
import { getToken } from '../lib/AuthContext.jsx';

export default function ManageCourseNotesModal({ api, course, courses = [], onClose, onSaveNotes }) {
  const [selectedCourseId, setSelectedCourseId] = useState(course?.id || course?._id || course?.slug);
  const currentCourse = courses.find((c) => (c.id || c._id || c.slug) === selectedCourseId) || course;

  const [notes, setNotes] = useState(() => {
    const res = currentCourse?.resources;
    if (Array.isArray(res)) return res;
    return [];
  });

  const [noteTitle, setNoteTitle] = useState('');
  const [selectedLesson, setSelectedLesson] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  // Update notes if selected course changes
  useEffect(() => {
    if (currentCourse?.resources && Array.isArray(currentCourse.resources)) {
      setNotes(currentCourse.resources);
    } else {
      setNotes([]);
    }
  }, [selectedCourseId, currentCourse]);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const allowed = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i.test(f.name);
    if (!allowed) {
      setError('Only PDF, DOC, DOCX, XLS, XLSX, PPT, and PPTX files are allowed.');
      e.target.value = '';
      return;
    }
    setError('');
    setFile(f);
    if (!noteTitle) {
      setNoteTitle(f.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleUploadAndAddNote = async (e) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      setError('Please provide a note title.');
      return;
    }
    if (!file) {
      setError('Please select a PDF, DOC, DOCX, XLS, XLSX, PPT, or PPTX file to upload.');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const client = api || adminApi(getToken());
      let uploadedData = null;
      if (typeof client?.uploadCourseNote === 'function') {
        uploadedData = await client.uploadCourseNote(file);
      } else {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch(resolveApiPath('/admin/courses/upload-note'), {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
          body: fd,
        });
        if (!res.ok) throw new Error('Failed to upload note file');
        uploadedData = await res.json();
      }

      const newNote = {
        id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: noteTitle.trim(),
        file: uploadedData?.file || uploadedData?.url || `/uploads/notes/${file.name}`,
        name: file.name,
        size: uploadedData?.size || `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        ext: file.name.split('.').pop()?.toUpperCase() || 'PDF',
        lessonTitle: selectedLesson || 'General Course Note',
        createdAt: new Date().toISOString(),
      };

      const updated = [...notes, newNote];
      setNotes(updated);
      setNoteTitle('');
      setSelectedLesson('');
      setFile(null);
      setSuccess('✓ Note uploaded and saved successfully!');

      if (onSaveNotes) {
        await onSaveNotes(currentCourse.id || currentCourse._id || currentCourse.slug, updated);
      } else if (client?.updateCourse) {
        await client.updateCourse(currentCourse.id || currentCourse.slug, { resources: updated });
      }
    } catch (err) {
      setError(err.message || 'Failed to upload note.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this course note?')) return;
    const updated = notes.filter((n) => n.id !== noteId && n.file !== noteId);
    setNotes(updated);
    try {
      const client = api || adminApi(getToken());
      if (onSaveNotes) {
        await onSaveNotes(currentCourse.id || currentCourse._id || currentCourse.slug, updated);
      } else if (client?.updateCourse) {
        await client.updateCourse(currentCourse.id || currentCourse.slug, { resources: updated });
      }
      setSuccess('✓ Note deleted successfully.');
    } catch (err) {
      console.warn('Failed to delete note on server:', err);
    }
  };

  const handleSaveEditTitle = async (noteId) => {
    if (!editTitleValue.trim()) return;
    const updated = notes.map((n) =>
      (n.id === noteId || n.file === noteId) ? { ...n, title: editTitleValue.trim() } : n
    );
    setNotes(updated);
    setEditingNoteId(null);
    setEditTitleValue('');
    try {
      const client = api || adminApi(getToken());
      if (onSaveNotes) {
        await onSaveNotes(currentCourse.id || currentCourse._id || currentCourse.slug, updated);
      } else if (client?.updateCourse) {
        await client.updateCourse(currentCourse.id || currentCourse.slug, { resources: updated });
      }
      setSuccess('✓ Note title updated.');
    } catch (err) {
      console.warn('Failed to update note title on server:', err);
    }
  };

  const lessons = Array.isArray(currentCourse?.lessons) ? currentCourse.lessons : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Icon name="description" className="text-xl" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#0F172A] text-base sm:text-lg">
                Manage Course Notes
              </h3>
              <p className="text-xs text-[#475569]">
                Upload and manage downloadable notes (PDF, DOC, DOCX) for students
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-[#0F172A] flex items-center justify-center transition cursor-pointer"
          >
            <Icon name="close" className="text-base" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <Icon name="error" className="text-base text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
              <Icon name="check_circle" className="text-base text-emerald-600 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {courses.length > 1 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1.5">
                Selected Course:
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm font-semibold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                {courses.map((c) => (
                  <option key={c.id || c._id || c.slug} value={c.id || c._id || c.slug}>
                    {c.title?.en || c.title || c.courseName || c.slug}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Upload Form */}
          <form onSubmit={handleUploadAndAddNote} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-3.5">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
              <Icon name="upload_file" className="text-base text-[#0F172A]" />
              Upload Note File
            </h4>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. API Architecture Notes"
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0F172A] mb-1">
                  Select Lesson (Optional)
                </label>
                <select
                  value={selectedLesson}
                  onChange={(e) => setSelectedLesson(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2.5 text-xs text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="">General Course Note</option>
                  {lessons.map((l, lIdx) => (
                    <option key={lIdx} value={l.t || `Lesson ${lIdx + 1}`}>
                      Lesson {lIdx + 1}: {l.t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0F172A] mb-1">
                Select Note File (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX) *
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                onChange={handleFileChange}
                className="w-full border border-dashed border-slate-200 rounded-xl p-2 text-xs text-[#0F172A] bg-white cursor-pointer"
              />
              {file && (
                <p className="text-[11px] text-emerald-700 mt-1 font-medium">
                  ✓ Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
                </p>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={uploading || !file || !noteTitle.trim()}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Icon name={uploading ? "sync" : "upload"} className={uploading ? "animate-spin text-sm" : "text-sm"} />
                {uploading ? 'Uploading...' : 'Upload & Save Note'}
              </button>
            </div>
          </form>

          {/* Notes List */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A] mb-3 flex items-center justify-between">
              <span>Current Course Notes ({notes.length})</span>
            </h4>

            {notes.length === 0 ? (
              <div className="p-6 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-[#475569] bg-slate-50">
                <Icon name="description" className="text-3xl text-[#475569] mb-1" />
                <p>No notes available for this course yet.</p>
                <p className="text-[10px] text-[#475569] mt-0.5">Upload a PDF or DOC note above.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {notes.map((n, nIdx) => {
                  const isEditing = editingNoteId === (n.id || nIdx);
                  const noteUrl = n.file || n.url || '#';
                  return (
                    <div
                      key={n.id || nIdx}
                      className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                          <Icon name="description" className="text-lg" />
                        </div>
                        <div className="min-w-0 flex-1">
                          {isEditing ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={editTitleValue}
                                onChange={(e) => setEditTitleValue(e.target.value)}
                                className="border border-blue-200 rounded-lg px-2 py-1 text-xs text-[#0F172A] w-full"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEditTitle(n.id || nIdx)}
                                className="px-2 py-1 rounded bg-[#2563EB] text-white text-[11px] font-bold cursor-pointer"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingNoteId(null)}
                                className="px-2 py-1 rounded border border-slate-200 text-[#475569] text-[11px] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <p className="text-xs font-bold text-[#0F172A] truncate">{n.title || n.name}</p>
                              <p className="text-[10px] text-[#475569] truncate">
                                {n.name || 'File'} • {n.size || 'PDF'} {n.lessonTitle ? `• ${n.lessonTitle}` : ''}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <a
                          href={noteUrl.startsWith('/') ? assetUrl(noteUrl) : noteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download
                          className="p-1.5 rounded-lg text-[#0F172A] hover:bg-slate-100 transition"
                          title="Download Note"
                        >
                          <Icon name="download" className="text-base" />
                        </a>
                        {!isEditing && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteId(n.id || nIdx);
                              setEditTitleValue(n.title || n.name || '');
                            }}
                            className="p-1.5 rounded-lg text-[#475569] hover:bg-slate-100 transition cursor-pointer"
                            title="Edit Title"
                          >
                            <Icon name="edit" className="text-base" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(n.id || n.file)}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-500/25 transition cursor-pointer"
                          title="Delete Note"
                        >
                          <Icon name="delete" className="text-base" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
