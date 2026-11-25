import { useState, useEffect, useRef } from 'react';
import Icon from '../Icon.jsx';
import { adminApi, assetUrl } from '../../lib/api.js';
import { getToken } from '../../lib/AuthContext.jsx';

const ALLOWED_EXTENSIONS = [
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'jpg', 'jpeg', 'png', 'webp',
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
  if (e === 'PDF') return 'PDF';
  if (e === 'TXT') return 'TXT';
  return e || 'DOC';
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

const handleViewInNewTab = (rawUrl, fileName) => {
  if (!rawUrl) return;
  const resolvedUrl = resolveFullUrl(rawUrl);
  const ext = (fileName || '').split('.').pop()?.toLowerCase() || '';
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
  window.open(resolvedUrl, '_blank', 'noopener,noreferrer');
};

const handleDownloadFile = async (rawUrl, fileName = 'task-attachment') => {
  if (!rawUrl) return;
  const resolvedUrl = resolveFullUrl(rawUrl);
  try {
    const res = await fetch(resolvedUrl, { mode: 'cors' });
    if (!res.ok) throw new Error('Download failed');
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 2000);
  } catch {
    const a = document.createElement('a');
    a.href = resolvedUrl;
    a.download = fileName;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

/**
 * Reusable inline task creation, editing & deletion component.
 * Supports:
 *  - mode="live": fetches & executes CRUD directly against the backend.
 *  - mode="draft": stores queued tasks locally and passes back changes via onChangeDraftTasks.
 */
export default function InlineVideoTasksSection({
  mode = 'live', // 'live' | 'draft'
  videoId = '',
  videoTitle = '',
  courseSlug = '',
  playlistId = '',
  draftTasks = [],
  onChangeDraftTasks,
  onTasksUpdated,
  api: customApi,
  compact = false,
}) {
  const api = customApi || adminApi(getToken());

  // Live state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // UI state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null); // id in live mode, index in draft mode
  const [savingTask, setSavingTask] = useState(false);

  // Form state (used for both Add and Edit)
  const [formData, setFormData] = useState({
    title: '',
    instructions: '',
    description: '',
    dueDate: '',
    attachmentUrl: '',
    attachmentName: '',
    attachmentSize: '',
    attachmentExt: '',
  });
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [attachmentError, setAttachmentError] = useState('');
  const fileInputRef = useRef(null);

  // Load tasks in live mode
  const loadLiveTasks = async () => {
    if (mode !== 'live' || (!videoId && !courseSlug)) return;
    setLoading(true);
    setError('');
    try {
      const data = await api.getAdminTasks({ videoId: videoId || undefined, courseSlug: courseSlug || undefined });
      const rawTasks = Array.isArray(data) ? data : (data?.tasks || []);
      // Filter strictly for this video if videoId is provided
      const filtered = videoId
        ? rawTasks.filter((t) => {
          const v1 = (t.videoId || '').trim().toLowerCase();
          const v2 = videoId.trim().toLowerCase();
          return v1 === v2 || (courseSlug && (t.courseSlug || '').toLowerCase() === courseSlug.toLowerCase());
        })
        : rawTasks;
      setTasks(filtered);
      if (onTasksUpdated) onTasksUpdated(filtered);
    } catch (err) {
      console.warn('Failed to load tasks for video:', err);
      setError('Could not load tasks for this video.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'live') {
      loadLiveTasks();
    }
  }, [mode, videoId, courseSlug]);

  const activeTaskList = mode === 'live' ? tasks : draftTasks;

  const resetForm = () => {
    setFormData({
      title: '',
      instructions: '',
      description: '',
      dueDate: '',
      attachmentUrl: '',
      attachmentName: '',
      attachmentSize: '',
      attachmentExt: '',
    });
    setAttachmentError('');
    setShowAddForm(false);
    setEditingTaskId(null);
  };

  const handleStartAdd = () => {
    setFormData({
      title: '',
      instructions: '',
      description: '',
      dueDate: '',
      attachmentUrl: '',
      attachmentName: '',
      attachmentSize: '',
      attachmentExt: '',
    });
    setAttachmentError('');
    setEditingTaskId(null);
    setShowAddForm(true);
  };

  const handleStartEdit = (task, indexOrId) => {
    setFormData({
      title: task.title || '',
      instructions: task.instructions || '',
      description: task.description || '',
      dueDate: task.dueDate ? String(task.dueDate).slice(0, 10) : '',
      attachmentUrl: task.attachmentUrl || '',
      attachmentName: task.attachmentName || '',
      attachmentSize: task.attachmentSize || '',
      attachmentExt: task.attachmentExt || '',
    });
    setAttachmentError('');
    setShowAddForm(false);
    setEditingTaskId(indexOrId);
  };

  // Handle Question Paper File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachmentError('');

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
      setAttachmentError(`Unsupported format (.${ext || 'unknown'}). Allowed: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, PNG.`);
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setAttachmentError(`File exceeds maximum size of 25MB (${(file.size / (1024 * 1024)).toFixed(1)}MB).`);
      e.target.value = '';
      return;
    }

    setUploadingAttachment(true);
    try {
      const res = await api.uploadAdminTaskAttachment(file);
      if (res?.url) {
        setFormData((prev) => ({
          ...prev,
          attachmentUrl: res.url,
          attachmentName: res.fileName || file.name,
          attachmentSize: res.fileSize ? formatFileSize(res.fileSize) : formatFileSize(file.size),
          attachmentExt: ext.toUpperCase(),
        }));
      } else {
        throw new Error(res?.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Task attachment upload error:', err);
      setAttachmentError(err.message || 'Failed to upload question paper.');
    } finally {
      setUploadingAttachment(false);
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = () => {
    setFormData((prev) => ({
      ...prev,
      attachmentUrl: '',
      attachmentName: '',
      attachmentSize: '',
      attachmentExt: '',
    }));
  };

  // Submit Add or Edit Form
  const handleSaveForm = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a task title.');
      return;
    }

    setSavingTask(true);
    setActionSuccess('');

    try {
      if (mode === 'live') {
        if (editingTaskId) {
          // Update existing live task
          const updated = await api.updateAdminTask(editingTaskId, {
            title: formData.title.trim(),
            instructions: formData.instructions?.trim() || null,
            description: formData.description?.trim() || null,
            dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
            attachmentUrl: formData.attachmentUrl || null,
            attachmentName: formData.attachmentName || null,
            attachmentSize: formData.attachmentSize || null,
            attachmentExt: formData.attachmentExt || null,
            removeAttachment: !formData.attachmentUrl,
          });
          setTasks((prev) => prev.map((t) => (t.id === editingTaskId ? { ...t, ...updated } : t)));
          setActionSuccess('✓ Task updated successfully.');
        } else {
          // Create new live task
          const resolvedVideoId = videoId || `${courseSlug || 'video'}-v1`;
          const created = await api.createAdminTask({
            title: formData.title.trim(),
            instructions: formData.instructions?.trim() || null,
            description: formData.description?.trim() || null,
            dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
            videoId: resolvedVideoId,
            videoTitle: videoTitle || 'Course Video Lesson',
            courseSlug: courseSlug || undefined,
            playlistId: playlistId || undefined,
            attachmentUrl: formData.attachmentUrl || null,
            attachmentName: formData.attachmentName || null,
            attachmentSize: formData.attachmentSize || null,
            attachmentExt: formData.attachmentExt || null,
            assignToType: 'all',
          });
          setTasks((prev) => [created, ...prev]);
          setActionSuccess('✓ Task created successfully.');
        }
        await loadLiveTasks();
      } else {
        // Draft mode
        if (editingTaskId !== null) {
          // Update existing draft task
          const nextDrafts = [...draftTasks];
          nextDrafts[editingTaskId] = {
            ...nextDrafts[editingTaskId],
            ...formData,
            videoId: videoId || nextDrafts[editingTaskId].videoId,
            videoTitle: videoTitle || nextDrafts[editingTaskId].videoTitle,
          };
          if (onChangeDraftTasks) onChangeDraftTasks(nextDrafts);
          setActionSuccess('✓ Draft task updated.');
        } else {
          // Add new draft task
          const newTask = {
            id: `draft-${Date.now()}`,
            ...formData,
            videoId: videoId || '',
            videoTitle: videoTitle || '',
            courseSlug: courseSlug || '',
            playlistId: playlistId || '',
          };
          const nextDrafts = [...draftTasks, newTask];
          if (onChangeDraftTasks) onChangeDraftTasks(nextDrafts);
          setActionSuccess('✓ Task queued for creation.');
        }
      }
      resetForm();
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      console.error('Error saving task:', err);
      alert(err.message || 'Failed to save task. Please try again.');
    } finally {
      setSavingTask(false);
    }
  };

  // Delete / Remove Task
  const handleDeleteTask = async (task, indexOrId) => {
    const confirmMsg = `Are you sure you want to delete the task "${task.title}"?${mode === 'live' ? ' Any student submissions for this task will also be deleted.' : ''
      }`;
    if (!window.confirm(confirmMsg)) return;

    try {
      if (mode === 'live') {
        await api.deleteAdminTask(task.id);
        setTasks((prev) => prev.filter((t) => t.id !== task.id));
        setActionSuccess('✓ Task deleted successfully.');
        await loadLiveTasks();
      } else {
        const nextDrafts = draftTasks.filter((_, idx) => idx !== indexOrId);
        if (onChangeDraftTasks) onChangeDraftTasks(nextDrafts);
        setActionSuccess('✓ Draft task removed.');
      }
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      console.error('Error deleting task:', err);
      alert(err.message || 'Failed to delete task.');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-[#fbfcf9] transition-all p-5 sm:p-6 space-y-4 sm:space-y-5">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-700 text-[#0F172A] flex items-center justify-center shrink-0 shadow-2xs">
            <Icon name="assignment" className="text-base" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-[#0F172A] flex items-center gap-1.5">
              <span>Tasks & Question Materials</span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                {activeTaskList.length} {activeTaskList.length === 1 ? 'Task' : 'Tasks'}
              </span>
            </h4>
            <p className="text-[11px] sm:text-xs text-[#475569] font-medium">
              Attach question papers (DOCX, PDF, etc.) and instructions for learners to solve and submit.
            </p>
          </div>
        </div>

        {!showAddForm && editingTaskId === null && (
          <button
            type="button"
            onClick={handleStartAdd}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-[#0F172A] text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
          >
            <Icon name="add" className="text-sm" />
            <span>Add Task for This Video</span>
          </button>
        )}
      </div>

        {/* Notices */}
        {actionSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Icon name="check_circle" className="text-sm text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {error && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center gap-2">
            <Icon name="error_outline" className="text-sm" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="p-4 text-center text-xs font-bold text-[#475569] flex items-center justify-center gap-2">
            <Icon name="sync" className="animate-spin text-sm" />
            <span>Loading tasks...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && activeTaskList.length === 0 && !showAddForm && (
          <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-white text-center space-y-1.5">
            <Icon name="assignment_late" className="text-2xl text-[#475569] mx-auto" />
            <p className="text-xs font-bold text-[#0F172A]">No tasks assigned to this video yet</p>
            <p className="text-[11px] text-[#475569] max-w-md mx-auto">
              Click &quot;Add Task for This Video&quot; above to provide assignment questions and an optional worksheet document (DOCX, PDF, etc.).
            </p>
          </div>
        )}

        {/* Existing / Draft Tasks List */}
        {!loading && activeTaskList.length > 0 && (
          <div className="space-y-3">
            {activeTaskList.map((task, idx) => {
              const taskKey = task.id || idx;
              const isEditingThis = editingTaskId === (mode === 'live' ? task.id : idx);
              if (isEditingThis) return null; // rendered in form below

              const qUrl = task.attachmentUrl;
              const qName = task.attachmentName || 'Question Paper';
              const qSize = task.attachmentSize || '';
              const qExt = task.attachmentExt || getFileType(qName, qUrl);
              const badge = getBadgeType(qExt);

              return (
                <div
                  key={taskKey}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-emerald-300 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-50 text-[#0F172A] text-[10px] font-black uppercase tracking-wider border border-slate-200">
                          Task #{idx + 1}
                        </span>
                        {task.dueDate && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-bold border border-amber-200 flex items-center gap-1">
                            <Icon name="event" className="text-[11px]" />
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        {mode === 'live' && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[#0F172A] text-[10px] font-bold">
                            {task.submissionCount || 0} Submissions
                          </span>
                        )}
                      </div>
                      <h5 className="text-xs sm:text-sm font-black text-[#0F172A]">{task.title}</h5>
                      {task.instructions && (
                        <p className="text-[11px] text-[#475569] line-clamp-2 leading-relaxed">
                          {task.instructions}
                        </p>
                      )}
                    </div>

                    {/* Action buttons: Edit & Delete */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(task, mode === 'live' ? task.id : idx)}
                        className="px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-emerald-500/25 text-[#0F172A] text-xs font-bold transition flex items-center gap-1 border border-slate-200 hover:border-emerald-300 cursor-pointer"
                        title="Edit task & question paper"
                      >
                        <Icon name="edit" className="text-xs text-emerald-700" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTask(task, mode === 'live' ? task.id : idx)}
                        className="p-1 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                        title="Delete task"
                      >
                        <Icon name="delete" className="text-sm" />
                      </button>
                    </div>
                  </div>

                  {/* Attached Question Paper Document Card */}
                  {qUrl && (
                    <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-lg bg-emerald-800 text-[#0F172A] font-black text-[10px] flex items-center justify-center shrink-0 tracking-wider">
                          {badge}
                        </span>
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-[#0F172A] truncate max-w-xs sm:max-w-md">
                            {qName}
                          </div>
                          {qSize && <div className="text-[10px] text-[#475569] font-bold">{qSize}</div>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleViewInNewTab(qUrl, qName)}
                          className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-[#0F172A] hover:bg-slate-100 text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Icon name="open_in_new" className="text-xs text-emerald-700" />
                          <span>View</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(qUrl, qName)}
                          className="px-2.5 py-1 rounded-lg bg-[#2563EB] text-white hover:bg-[#1D4ED8] text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-2xs"
                        >
                          <Icon name="download" className="text-xs text-[#2563EB]" />
                          <span>Download</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Inline Form: Add or Edit Task */}
        {(showAddForm || editingTaskId !== null) && (
          <form onSubmit={handleSaveForm} className="bg-white rounded-2xl border-2 border-emerald-200 p-4 sm:p-5 shadow-sm space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h5 className="text-xs sm:text-sm font-black text-[#0F172A] flex items-center gap-2">
                <Icon name={editingTaskId !== null ? 'edit' : 'add_task'} className="text-emerald-700 text-sm" />
                <span>{editingTaskId !== null ? 'Edit Task Details' : 'Add New Task for This Video'}</span>
              </h5>
              <button
                type="button"
                onClick={resetForm}
                className="text-[#475569] hover:text-[#0F172A] p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <Icon name="close" className="text-base" />
              </button>
            </div>

            {/* Form fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                  Task / Assignment Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 1 Worksheet: Build Your Cash Flow Forecast"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                  Instructions / Questions for Students
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what learners need to do, calculate, or write down..."
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                    Optional Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                    Short Description (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Practical exercise for lesson completion"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Question Paper File Attachment Box */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                    <Icon name="attach_file" className="text-xs text-emerald-700" />
                    <span>Attach Question Paper / Worksheet (DOCX, PDF, etc.)</span>
                  </label>
                  <span className="text-[10px] text-[#475569] font-bold">Max 25MB</span>
                </div>

                {attachmentError && (
                  <div className="text-[11px] text-red-600 font-bold flex items-center gap-1">
                    <Icon name="error_outline" className="text-xs" />
                    <span>{attachmentError}</span>
                  </div>
                )}

                {formData.attachmentUrl ? (
                  <div className="p-2.5 rounded-xl bg-white border border-emerald-200 flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-emerald-800 text-[#0F172A] font-black text-[9px] flex items-center justify-center shrink-0">
                        {getBadgeType(formData.attachmentExt)}
                      </span>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-[#0F172A] truncate max-w-xs sm:max-w-sm">
                          {formData.attachmentName || 'Attached Document'}
                        </div>
                        {formData.attachmentSize && (
                          <div className="text-[10px] text-[#475569]">{formData.attachmentSize}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleViewInNewTab(formData.attachmentUrl, formData.attachmentName)}
                        className="px-2 py-1 rounded-lg bg-slate-50 hover:bg-emerald-500/25 text-[#0F172A] text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                        title="Preview in new tab"
                      >
                        <Icon name="open_in_new" className="text-xs text-emerald-700" />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveAttachment}
                        className="p-1 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition cursor-pointer"
                        title="Remove attachment"
                      >
                        <Icon name="delete" className="text-sm" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.webp"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingAttachment}
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-500/25 border border-slate-200 hover:border-emerald-300 text-[#0F172A] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                      <Icon name={uploadingAttachment ? 'sync' : 'upload_file'} className={uploadingAttachment ? 'animate-spin text-sm' : 'text-sm text-emerald-700'} />
                      <span>{uploadingAttachment ? 'Uploading Question File...' : 'Upload Question Paper (DOCX, PDF, etc.)'}</span>
                    </button>
                    <span className="text-[10px] text-[#475569]">Optional downloadable worksheet</span>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#475569] hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingTask || uploadingAttachment}
                className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-[#0F172A] text-xs font-black transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <Icon name={savingTask ? 'sync' : 'check'} className={savingTask ? 'animate-spin text-sm' : 'text-sm'} />
                <span>{savingTask ? 'Saving Task...' : (editingTaskId !== null ? 'Save Changes' : (mode === 'live' ? 'Create Task Now' : 'Queue Task'))}</span>
              </button>
            </div>
          </form>
        )}
      </div>
      );
}
