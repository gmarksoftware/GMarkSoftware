import { useEffect, useMemo, useState } from 'react';
import Icon from '../../components/Icon.jsx';
import { adminApi, assetUrl } from '../../lib/api.js';
import { getToken, useAuth } from '../../lib/AuthContext.jsx';

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

function formatVideoDisplayTitle(videoTitle, videoId) {
  let title = (videoTitle || '').trim();
  if (
    !title ||
    title.includes('watch?v=') ||
    title.startsWith('http://') ||
    title.startsWith('https://') ||
    title.startsWith('youtu.be') ||
    /^[a-zA-Z0-9_-]{11}$/.test(title) ||
    title.startsWith('ch-') ||
    title.startsWith('v_')
  ) {
    if (
      videoId &&
      !videoId.includes('watch?v=') &&
      !videoId.startsWith('http') &&
      !/^[a-zA-Z0-9_-]{11}$/.test(videoId) &&
      !videoId.startsWith('ch-') &&
      !videoId.startsWith('v_')
    ) {
      return videoId;
    }
    return 'Course Video';
  }
  return title;
}

function isAutoPlaceholderTask(t) {
  const title = (t?.title || '').trim().toLowerCase();
  const isAutoTitle =
    title.startsWith('video assignment:') ||
    title.startsWith('assignment: chapter') ||
    title.startsWith('assignment - chapter');
  const hasNoSubmissions = (t?.submissionCount || 0) === 0;
  const hasNoAttachment = !t?.attachmentUrl;
  const instructions = (t?.instructions || t?.description || '').trim().toLowerCase();
  const hasNoCustomInstructions =
    !instructions ||
    instructions.includes('watch the video lesson and complete the assignment') ||
    instructions.includes('complete the assignment for this video');
  return isAutoTitle && hasNoSubmissions && hasNoAttachment && hasNoCustomInstructions;
}

const handleDownloadFile = async (rawUrl, fileName = 'attachment') => {
  if (!rawUrl) return;
  try {
    const fullUrl = rawUrl.startsWith('http') ? rawUrl : assetUrl(rawUrl);
    try {
      const response = await fetch(fullUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('File download response not ok');
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
      link.href = fullUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (err) {
    console.error('File download error:', err);
  }
};

const getRoleFromToken = () => {
  try {
    const token = getToken();
    if (!token) return null;
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload?.role || null;
  } catch {
    return null;
  }
};

export default function AdminTasksPanel({ isSubAdmin: propIsSubAdmin } = {}) {
  const token = getToken();
  const api = adminApi(token);
  const { user } = useAuth() || {};
  const currentRole = user?.role || getRoleFromToken();
  const isSubAdmin = propIsSubAdmin !== undefined ? propIsSubAdmin : (currentRole === 'admin');

  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'submissions'
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'pending' | 'submitted' | 'reviewed' | 'has_attachment'
  const [selectedVideoFilter, setSelectedVideoFilter] = useState('all');

  // View Submissions Modal State
  const [viewingTaskId, setViewingTaskId] = useState(null);
  const [taskDetail, setTaskDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Review Modal State
  const [reviewingSubmission, setReviewingSubmission] = useState(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [marksObtained, setMarksObtained] = useState('');
  const [maxMarks, setMaxMarks] = useState('100');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // In-App File Preview Modal State
  const [previewFile, setPreviewFile] = useState(null); // { url, name, type }

  // Edit Task Modal State
  const [editingTask, setEditingTask] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    attachmentUrl: '',
    attachmentName: '',
    attachmentSize: '',
    attachmentExt: '',
    removeAttachment: false,
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploadingEditAttachment, setUploadingEditAttachment] = useState(false);

  // Create Task Modal State
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    courseSlug: '',
    courseId: '',
    playlistId: '',
    videoId: '',
    videoTitle: '',
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    attachmentUrl: '',
    attachmentName: '',
    attachmentSize: '',
    attachmentExt: '',
    assignToType: 'all',
  });
  const [savingCreate, setSavingCreate] = useState(false);
  const [uploadingCreateAttachment, setUploadingCreateAttachment] = useState(false);
  const [coursesList, setCoursesList] = useState([]);
  const [playlistsList, setPlaylistsList] = useState([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Notification message
  const [feedback, setFeedback] = useState(null);
  const showFeedback = (msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      const isAuth = err?.status === 401 || err?.status === 403 || /unauthorized|forbidden|jwt/i.test(err?.message || '');
      const reason = isAuth ? 'Admin session expired. Please re-login.' : (err?.message || 'Server error');
      showFeedback(`Failed to load tasks (${reason})`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const data = await api.getAllAdminTaskSubmissions();
      setAllSubmissions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load all submissions:', err);
      const isAuth = err?.status === 401 || err?.status === 403 || /unauthorized|forbidden|jwt/i.test(err?.message || '');
      const reason = isAuth ? 'Admin session expired. Please re-login.' : (err?.message || 'Server error');
      showFeedback(`Failed to load submissions (${reason})`, 'error');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchAllSubmissions();
  }, []);

  // Open Task Submissions View
  const handleOpenViewTask = async (taskId) => {
    setViewingTaskId(taskId);
    setLoadingDetail(true);
    try {
      const detail = await api.getAdminTask(taskId);
      setTaskDetail(detail);
    } catch (err) {
      console.error('Failed to load task details:', err);
      const isAuth = err?.status === 401 || err?.status === 403 || /unauthorized|forbidden|jwt/i.test(err?.message || '');
      const reason = isAuth ? 'Admin session expired. Please re-login.' : (err?.message || 'Server error');
      showFeedback(`Could not load task details (${reason})`, 'error');
      setViewingTaskId(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Open Edit Task Modal
  const handleOpenEditTask = (task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      instructions: task.instructions || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
      attachmentUrl: task.attachmentUrl || '',
      attachmentName: task.attachmentName || '',
      attachmentSize: task.attachmentSize || '',
      attachmentExt: task.attachmentExt || (task.attachmentName ? task.attachmentName.split('.').pop()?.toUpperCase() : ''),
      removeAttachment: false,
    });
  };

  // Save Edited Task
  const handleSaveEditTask = async (e) => {
    e.preventDefault();
    if (!editForm.title.trim()) {
      alert('Task title is required.');
      return;
    }
    setSavingEdit(true);
    try {
      await api.updateAdminTask(editingTask.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || undefined,
        instructions: editForm.instructions.trim() || undefined,
        dueDate: editForm.dueDate || undefined,
        attachmentUrl: editForm.removeAttachment ? undefined : (editForm.attachmentUrl || undefined),
        attachmentName: editForm.removeAttachment ? undefined : (editForm.attachmentName || undefined),
        attachmentSize: editForm.removeAttachment ? undefined : (editForm.attachmentSize || undefined),
        attachmentExt: editForm.removeAttachment ? undefined : (editForm.attachmentExt || undefined),
        removeAttachment: Boolean(editForm.removeAttachment),
      });
      showFeedback('Task updated successfully!');
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error('Update task error:', err);
      alert(err?.message || 'Failed to update task.');
    } finally {
      setSavingEdit(false);
    }
  };

  // Open Create Task Modal
  const handleOpenCreateTask = async () => {
    setCreateForm({
      courseSlug: '',
      courseId: '',
      playlistId: '',
      videoId: '',
      videoTitle: '',
      title: '',
      description: '',
      instructions: '',
      dueDate: '',
      attachmentUrl: '',
      attachmentName: '',
      attachmentSize: '',
      attachmentExt: '',
      assignToType: 'all',
    });
    setCreateModalOpen(true);
    if (coursesList.length === 0) {
      setLoadingOptions(true);
      try {
        const [cData, pData] = await Promise.all([
          api.getCourses().catch(() => []),
          api.getPlaylists().catch(() => []),
        ]);
        setCoursesList(Array.isArray(cData) ? cData : (cData?.courses || []));
        setPlaylistsList(Array.isArray(pData) ? pData : (pData?.playlists || []));
      } catch (err) {
        console.error('Failed to load courses for task creation:', err);
      } finally {
        setLoadingOptions(false);
      }
    }
  };

  // Handle Course Selection in Create Form
  const handleCourseChangeInCreate = (slug) => {
    if (!slug) {
      setCreateForm((prev) => ({
        ...prev,
        courseSlug: '',
        courseId: '',
        playlistId: '',
        videoId: '',
        videoTitle: '',
      }));
      return;
    }

    const c = coursesList.find((course) => course.slug === slug);
    const coursePlaylists = playlistsList.filter(
      (p) => p.courseId === c?.id || (p.courseSlug && p.courseSlug.toLowerCase() === slug.toLowerCase())
    );

    const firstVid = c?.videos?.[0];
    const defaultVideoId = firstVid?.id || c?.youtubeVideoId || `${slug}-v1`;
    const defaultVideoTitle = firstVid?.title || c?.title || 'Course Video Lesson';

    setCreateForm((prev) => ({
      ...prev,
      courseSlug: slug,
      courseId: c?.id || '',
      playlistId: coursePlaylists?.[0]?.id || '',
      videoId: defaultVideoId,
      videoTitle: defaultVideoTitle,
    }));
  };

  // Save Created Task
  const handleSaveCreateTask = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim()) {
      alert('Task title is required.');
      return;
    }
    if (!createForm.videoId.trim()) {
      alert('Video ID is required. Please select a course or enter a video ID.');
      return;
    }

    setSavingCreate(true);
    try {
      await api.createAdminTask({
        title: createForm.title.trim(),
        videoId: createForm.videoId.trim(),
        videoTitle: createForm.videoTitle.trim() || undefined,
        courseSlug: createForm.courseSlug.trim() || undefined,
        courseId: createForm.courseId || undefined,
        playlistId: createForm.playlistId || undefined,
        description: createForm.description.trim() || undefined,
        instructions: createForm.instructions.trim() || undefined,
        dueDate: createForm.dueDate || undefined,
        attachmentUrl: createForm.attachmentUrl || undefined,
        attachmentName: createForm.attachmentName || undefined,
        attachmentSize: createForm.attachmentSize || undefined,
        attachmentExt: createForm.attachmentExt || undefined,
        assignToType: createForm.assignToType || 'all',
      });
      showFeedback('Task created successfully! Learners can now download questions and submit answers.');
      setCreateModalOpen(false);
      fetchTasks();
    } catch (err) {
      console.error('Create task error:', err);
      alert(err?.message || 'Failed to create task.');
    } finally {
      setSavingCreate(false);
    }
  };

  // Upload Question Paper Attachment
  const handleUploadAttachment = async (file, isEdit = false) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['docx', 'doc', 'pdf', 'xlsx', 'xls', 'txt', 'png', 'jpg', 'jpeg'];
    if (!allowed.includes(ext)) {
      showFeedback(`Unsupported format (.${ext}). Allowed: DOCX, DOC, PDF, XLSX, XLS, TXT, PNG, JPG`, 'error');
      return;
    }
    if (file.size > 30 * 1024 * 1024) {
      showFeedback(`File too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Max 30MB allowed.`, 'error');
      return;
    }

    if (isEdit) {
      setUploadingEditAttachment(true);
    } else {
      setUploadingCreateAttachment(true);
    }

    try {
      const res = await api.uploadAdminTaskAttachment(file);
      if (res && res.url) {
        const formattedSize = formatFileSize(file.size || res.fileSize);
        const upperExt = ext.toUpperCase();
        if (isEdit) {
          setEditForm((prev) => ({
            ...prev,
            attachmentUrl: res.url,
            attachmentName: res.fileName || file.name,
            attachmentSize: formattedSize,
            attachmentExt: upperExt,
            removeAttachment: false,
          }));
        } else {
          setCreateForm((prev) => ({
            ...prev,
            attachmentUrl: res.url,
            attachmentName: res.fileName || file.name,
            attachmentSize: formattedSize,
            attachmentExt: upperExt,
          }));
        }
        showFeedback('Question document uploaded successfully!');
      } else {
        throw new Error(res?.message || 'Upload failed');
      }
    } catch (err) {
      console.error('Attachment upload error:', err);
      showFeedback(err?.message || 'Failed to upload document', 'error');
    } finally {
      if (isEdit) {
        setUploadingEditAttachment(false);
      } else {
        setUploadingCreateAttachment(false);
      }
    }
  };

  const handleRemoveEditAttachment = () => {
    setEditForm((prev) => ({
      ...prev,
      attachmentUrl: '',
      attachmentName: '',
      attachmentSize: '',
      attachmentExt: '',
      removeAttachment: true,
    }));
  };

  const handleRemoveCreateAttachment = () => {
    setCreateForm((prev) => ({
      ...prev,
      attachmentUrl: '',
      attachmentName: '',
      attachmentSize: '',
      attachmentExt: '',
    }));
  };

  // Delete Task
  const handleDeleteTask = async (task) => {
    if (!window.confirm('Are you sure you want to delete this task?')) {
      return;
    }
    try {
      await api.deleteAdminTask(task.id);
      showFeedback('Task deleted successfully.');
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
      if (viewingTaskId === task.id) {
        setViewingTaskId(null);
        setTaskDetail(null);
      }
      fetchAllSubmissions();
    } catch (err) {
      console.error('Delete task error:', err);
      alert(err?.message || 'Failed to delete task.');
    }
  };

  // Open Review Submission Modal
  const handleOpenReview = (submission) => {
    setReviewingSubmission(submission);
    setReviewFeedback(submission.adminFeedback || '');
    setMarksObtained(
      submission.marksObtained !== null && submission.marksObtained !== undefined
        ? String(submission.marksObtained)
        : ''
    );
    setMaxMarks(
      submission.maxMarks !== null && submission.maxMarks !== undefined
        ? String(submission.maxMarks)
        : '100'
    );
  };

  // Submit Review (Mark as Reviewed or Request Revision)
  const handleSubmitReview = async (newStatus) => {
    if (!reviewingSubmission?.submissionId) {
      alert('No submission record found to review.');
      return;
    }
    if (newStatus === 'needs_revision' && !reviewFeedback.trim()) {
      alert('Please provide feedback explaining what needs revision.');
      return;
    }

    let parsedMarks = undefined;
    let parsedMax = Number(maxMarks) || 100;

    if (newStatus === 'reviewed') {
      if (marksObtained === '' || marksObtained === null || isNaN(Number(marksObtained))) {
        alert('Please enter valid Marks Obtained before marking as reviewed.');
        return;
      }
      parsedMarks = Number(marksObtained);
      if (parsedMarks < 0) {
        alert('Marks obtained cannot be negative.');
        return;
      }
      if (parsedMarks > parsedMax) {
        alert(`Marks obtained (${parsedMarks}) cannot exceed Total Marks (${parsedMax}).`);
        return;
      }
    } else if (marksObtained !== '' && !isNaN(Number(marksObtained))) {
      parsedMarks = Number(marksObtained);
      if (parsedMarks < 0 || parsedMarks > parsedMax) {
        alert(`Marks obtained (${parsedMarks}) must be between 0 and Total Marks (${parsedMax}).`);
        return;
      }
    }

    setReviewSubmitting(true);
    try {
      await api.reviewAdminTaskSubmission(reviewingSubmission.submissionId, {
        status: newStatus,
        feedback: reviewFeedback.trim() || undefined,
        marksObtained: parsedMarks,
        maxMarks: parsedMax,
      });

      showFeedback(
        newStatus === 'reviewed'
          ? 'Submission marked as Reviewed!'
          : 'Revision requested with feedback sent to learner.'
      );

      setReviewingSubmission(null);
      setReviewFeedback('');
      setMarksObtained('');
      setMaxMarks('100');

      // Refresh current task detail and submissions list
      if (viewingTaskId) {
        const updated = await api.getAdminTask(viewingTaskId);
        setTaskDetail(updated);
      }
      fetchTasks();
      fetchAllSubmissions();
    } catch (err) {
      console.error('Review error:', err);
      alert(err?.message || 'Failed to submit review.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Unique assigned videos for Sub-Admin dropdown filtering
  const availableVideos = useMemo(() => {
    const map = new Map();
    tasks.forEach((t) => {
      if (isSubAdmin && isAutoPlaceholderTask(t)) return;
      const vidKey = t.videoId || t.videoTitle;
      if (!vidKey) return;
      if (!map.has(vidKey)) {
        const title = formatVideoDisplayTitle(t.videoTitle, t.videoId);
        map.set(vidKey, {
          id: vidKey,
          title: title && title !== 'Course Video' ? title : (t.videoTitle || t.videoId || 'Video Lesson'),
          courseSlug: t.courseSlug || '',
        });
      }
    });
    return Array.from(map.values());
  }, [tasks, isSubAdmin]);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    // For Sub-Admin only: always hide empty auto-generated placeholder tasks
    if (isSubAdmin && isAutoPlaceholderTask(t)) {
      return false;
    }

    if (isSubAdmin && selectedVideoFilter !== 'all') {
      const vidKey = t.videoId || t.videoTitle;
      if (vidKey !== selectedVideoFilter) return false;
    }

    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      t.title?.toLowerCase().includes(q) ||
      t.videoTitle?.toLowerCase().includes(q) ||
      t.courseSlug?.toLowerCase().includes(q);

    if (!matchSearch) return false;

    if (filterStatus === 'has_attachment') return !!t.attachmentUrl;
    if (filterStatus === 'submitted') return (t.submissionCount || 0) > 0;
    if (filterStatus === 'pending') return (t.pendingCount || 0) > 0;
    if (filterStatus === 'reviewed') return (t.reviewedCount || 0) > 0;
    return true;
  });

  const visibleTasksCount = isSubAdmin
    ? tasks.filter((t) => !isAutoPlaceholderTask(t)).length
    : tasks.length;

  // Filter all submissions
  const filteredSubmissions = allSubmissions.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.userName?.toLowerCase().includes(q) ||
      s.userEmail?.toLowerCase().includes(q) ||
      s.taskTitle?.toLowerCase().includes(q) ||
      s.videoTitle?.toLowerCase().includes(q) ||
      s.fileName?.toLowerCase().includes(q) ||
      s.courseSlug?.toLowerCase().includes(q);

    if (!matchSearch) return false;
    if (filterStatus === 'reviewed') return s.status === 'reviewed';
    if (filterStatus === 'pending') return s.status === 'needs_revision';
    if (filterStatus === 'submitted') return s.status === 'submitted' || s.status === 'resubmitted';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-lg border text-xs font-black flex items-center gap-2 animate-bounce ${
            feedback.type === 'error'
              ? 'bg-rose-50 text-rose-700 border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
          }`}
        >
          <Icon name={feedback.type === 'error' ? 'error' : 'check_circle'} className="text-base" />
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-[#0F172A] to-brand-forest rounded-3xl p-6 sm:p-8 text-white shadow-soft-card relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {!isSubAdmin && (
              <div className="flex items-center gap-2 text-[#2563EB] text-xs font-black uppercase tracking-wider mb-2">
                <Icon name="assignment" className="text-base" />
                <span>Video-wise Task & Answer Submissions</span>
              </div>
            )}
            <h1 className="text-2xl sm:text-3xl font-black">Tasks & Submissions</h1>
            <p className="text-xs sm:text-sm text-[#2563EB]/80 mt-1 max-w-xl">
              {isSubAdmin
                ? 'Create video tasks, attach question papers, and review student submissions.'
                : 'Track student video answer submissions, review uploaded files (PDF, Word, Excel, PPT, images), download student work, and provide feedback.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                fetchTasks();
                fetchAllSubmissions();
              }}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-[#0F172A] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
            >
              <Icon name="refresh" className="text-sm" />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleOpenCreateTask}
              className="px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-50 text-[#0F172A] text-xs font-extrabold transition flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
            >
              <Icon name="add_circle" className="text-base" />
              <span>Create Task</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards - Restored for Super Admin, hidden for Sub-Admin */}
      {!isSubAdmin && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-1">
              <span>Total Tasks</span>
              <Icon name="assignment" className="text-[#0F172A] text-base" />
            </div>
            <div className="text-2xl font-black text-[#0F172A]">{tasks.length}</div>
            <div className="text-[10px] text-[#475569] mt-0.5">Across all course videos</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-1">
              <span>Total Submissions</span>
              <Icon name="upload_file" className="text-emerald-600 text-base" />
            </div>
            <div className="text-2xl font-black text-emerald-700">
              {allSubmissions.length || tasks.reduce((acc, t) => acc + (t.submissionCount || 0), 0)}
            </div>
            <div className="text-[10px] text-emerald-600 mt-0.5">Uploaded by learners</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-1">
              <span>Pending Review</span>
              <Icon name="pending_actions" className="text-amber-600 text-base" />
            </div>
            <div className="text-2xl font-black text-amber-700">
              {allSubmissions.filter((s) => s.status === 'submitted' || s.status === 'resubmitted').length}
            </div>
            <div className="text-[10px] text-amber-600 mt-0.5">Awaiting admin review</div>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-[#475569] text-xs font-bold mb-1">
              <span>Reviewed</span>
              <Icon name="verified" className="text-[#0F172A] text-base" />
            </div>
            <div className="text-2xl font-black text-[#0F172A]">
              {allSubmissions.filter((s) => s.status === 'reviewed').length}
            </div>
            <div className="text-[10px] text-[#0F172A] mt-0.5">Evaluated with feedback</div>
          </div>
        </div>
      )}

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => {
            setActiveTab('tasks');
            setFilterStatus('all');
            setSelectedVideoFilter('all');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
            activeTab === 'tasks'
              ? 'bg-[#2563EB] text-white shadow-2xs'
              : 'text-[#475569] hover:bg-slate-100 hover:text-white'
          }`}
        >
          <Icon name="assignment" className="text-sm" />
          <span>Tasks List ({visibleTasksCount})</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('submissions');
            setFilterStatus('all');
            setSelectedVideoFilter('all');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
            activeTab === 'submissions'
              ? 'bg-[#2563EB] text-white shadow-2xs'
              : 'text-[#475569] hover:bg-slate-100 hover:text-white'
          }`}
        >
          <Icon name="folder_shared" className="text-sm" />
          <span>Student Submissions ({allSubmissions.length})</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569] text-base" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === 'tasks'
                ? 'Search tasks by title, video, or course...'
                : 'Search submissions by learner, email, video, or file name...'
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium bg-slate-50 focus:bg-slate-50 focus:outline-none focus:border-blue-200 transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto flex-wrap">
          {(!isSubAdmin
            ? [
                { id: 'all', label: 'All' },
                { id: 'submitted', label: 'Submitted / Resubmitted' },
                { id: 'pending', label: activeTab === 'tasks' ? 'Pending Users' : 'Needs Revision' },
                { id: 'reviewed', label: 'Reviewed' },
              ]
            : activeTab === 'tasks'
            ? [
                { id: 'all', label: 'All Tasks' },
                { id: 'submitted', label: 'Submitted' },
                { id: 'reviewed', label: 'Reviewed' },
              ]
            : [
                { id: 'all', label: 'All' },
                { id: 'submitted', label: 'Submitted / Resubmitted' },
                { id: 'pending', label: 'Needs Revision' },
                { id: 'reviewed', label: 'Reviewed' },
              ]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'text-[#475569] hover:bg-slate-100 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}

          {/* Sub-Admin Video / Course filter dropdown when multiple assigned videos exist */}
          {isSubAdmin && activeTab === 'tasks' && availableVideos.length > 1 && (
            <div className="flex items-center gap-1.5 ml-auto">
              <Icon name="smart_display" className="text-[#0F172A] text-sm shrink-0" />
              <select
                value={selectedVideoFilter}
                onChange={(e) => setSelectedVideoFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-slate-50 hover:bg-slate-100 text-[#0F172A] focus:bg-slate-50 focus:outline-none focus:border-blue-200 transition cursor-pointer max-w-[240px] truncate"
                title="Filter tasks by video"
              >
                <option value="all">All Videos ({availableVideos.length})</option>
                {availableVideos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: TASKS LIST */}
      {activeTab === 'tasks' && (
        <>
          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <Icon name="sync" className="text-3xl text-[#0F172A] animate-spin mx-auto" />
              <p className="text-xs text-[#475569] font-bold">Loading tasks from database...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-50 text-[#0F172A] flex items-center justify-center mx-auto">
                <Icon name="assignment" className="text-3xl" />
              </div>
              <h3 className="font-extrabold text-[#0F172A] text-base">No video tasks found</h3>
              <p className="text-xs text-[#475569] max-w-md mx-auto">
                Tasks are automatically linked to video questions as learners watch courses.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    {!isSubAdmin ? (
                      /* Original Super Admin Table Headers */
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">
                        <th className="py-3.5 px-4">Task Title & Details</th>
                        <th className="py-3.5 px-4">Related Video</th>
                        <th className="py-3.5 px-4">Course / Playlist</th>
                        <th className="py-3.5 px-4 text-center">Submissions</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    ) : (
                      /* Simplified Sub-Admin Table Headers */
                      <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">
                        <th className="py-3.5 px-5">Task & Question Material</th>
                        <th className="py-3.5 px-4">Video / Course</th>
                        <th className="py-3.5 px-4 text-center">Submissions</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredTasks.map((t) => {
                      const qExt = t.attachmentExt || getFileType(t.attachmentName, t.attachmentUrl);
                      const displayVideoTitle = formatVideoDisplayTitle(t.videoTitle, t.videoId);
                      const taskDesc = t.instructions || t.description;

                      if (!isSubAdmin) {
                        /* Original Super Admin Row */
                        return (
                          <tr key={t.id} className="hover:bg-white transition">
                            <td className="py-4 px-4 font-bold text-[#0F172A] max-w-xs">
                              <div className="text-sm font-extrabold text-[#0F172A] line-clamp-1">{t.title}</div>
                              {taskDesc && (
                                <div className="text-[11px] text-[#475569] line-clamp-1 mt-0.5 font-normal">
                                  {taskDesc}
                                </div>
                              )}

                              {t.attachmentUrl && (
                                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                    <span className="px-1 py-0.2 rounded bg-emerald-200 text-emerald-700 text-[9px] font-black uppercase">
                                      {qExt}
                                    </span>
                                    <span className="truncate max-w-[150px]" title={t.attachmentName || 'Question Paper'}>
                                      {t.attachmentName || 'Question Paper'}
                                    </span>
                                    {t.attachmentSize && (
                                      <span className="text-[9px] text-emerald-700/80 font-normal">({t.attachmentSize})</span>
                                    )}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setPreviewFile({
                                      url: t.attachmentUrl,
                                      name: t.attachmentName || 'Question Paper',
                                      type: qExt,
                                    })}
                                    className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-500/25 text-emerald-700 text-[10px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                                    title="Preview Question Paper"
                                  >
                                    <Icon name="visibility" className="text-xs" />
                                    <span>Preview</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadFile(t.attachmentUrl, t.attachmentName || 'Question-Paper')}
                                    className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-[10px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                                    title="Download Question Paper"
                                  >
                                    <Icon name="download" className="text-xs" />
                                    <span>Download</span>
                                  </button>
                                </div>
                              )}
                            </td>

                            <td className="py-4 px-4 font-semibold text-[#0F172A] max-w-xs">
                              <div className="flex items-center gap-1.5 text-xs">
                                <Icon name="smart_display" className="text-[#0F172A] text-sm shrink-0" />
                                <span className="truncate">{t.videoTitle || t.videoId}</span>
                              </div>
                            </td>

                            <td className="py-4 px-4 text-[#475569]">
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[#0F172A] text-[10px] font-mono">
                                {t.courseSlug || 'Course Video'}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-center">
                              <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                                {t.submissionCount || 0}
                              </span>
                              {t.reviewedCount > 0 && (
                                <span className="ml-1 text-[10px] text-emerald-700">({t.reviewedCount} reviewed)</span>
                              )}
                            </td>

                            <td className="py-4 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  t.status === 'Reviewed'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : t.status === 'In Progress'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-slate-100 text-[#475569] border border-slate-200'
                                }`}
                              >
                                {t.status}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenViewTask(t.id)}
                                  className="px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-2xs"
                                  title="View student submissions"
                                >
                                  <Icon name="visibility" className="text-xs" />
                                  <span>Submissions ({t.submissionCount || 0})</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditTask(t)}
                                  className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-[#0F172A] transition cursor-pointer"
                                  title="Edit Task"
                                >
                                  <Icon name="edit" className="text-xs" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteTask(t)}
                                  className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-500/25 transition cursor-pointer"
                                  title="Delete Task"
                                >
                                  <Icon name="delete" className="text-xs" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      /* Simplified Sub-Admin Row (4 columns) */
                      return (
                        <tr key={t.id} className="hover:bg-white transition">
                          {/* 1. Task & Question Material */}
                          <td className="py-4 px-5 font-bold text-[#0F172A] max-w-sm">
                            <div className="text-sm font-extrabold text-[#0F172A] line-clamp-1">{t.title}</div>
                            {taskDesc && (
                              <div className="text-[11px] text-[#475569] line-clamp-1 mt-0.5 font-normal">
                                {taskDesc}
                              </div>
                            )}

                            {t.attachmentUrl && (
                              <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                                  <span className="px-1 py-0.2 rounded bg-emerald-200 text-emerald-700 text-[9px] font-black uppercase">
                                    {qExt}
                                  </span>
                                  <span className="truncate max-w-[150px]" title={t.attachmentName || 'Question Paper'}>
                                    {t.attachmentName || 'Question Paper'}
                                  </span>
                                  {t.attachmentSize && (
                                    <span className="text-[9px] text-emerald-700/80 font-normal">({t.attachmentSize})</span>
                                  )}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setPreviewFile({
                                    url: t.attachmentUrl,
                                    name: t.attachmentName || 'Question Paper',
                                    type: qExt,
                                  })}
                                  className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-500/25 text-emerald-700 text-[10px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                                  title="Preview Question Paper"
                                >
                                  <Icon name="visibility" className="text-xs" />
                                  <span>Preview</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadFile(t.attachmentUrl, t.attachmentName || 'Question-Paper')}
                                  className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-[10px] font-bold inline-flex items-center gap-1 transition cursor-pointer"
                                  title="Download Question Paper"
                                >
                                  <Icon name="download" className="text-xs" />
                                  <span>Download</span>
                                </button>
                              </div>
                            )}
                          </td>

                          {/* 2. Video / Course */}
                          <td className="py-4 px-4 font-semibold text-[#0F172A] max-w-xs">
                            <div className="flex items-center gap-1.5 text-xs">
                              <Icon name="smart_display" className="text-[#0F172A] text-sm shrink-0" />
                              <span className="truncate font-bold text-[#0F172A]" title={displayVideoTitle}>
                                {displayVideoTitle}
                              </span>
                            </div>
                            {(t.courseTitle || t.courseSlug) && (
                              <div className="mt-1">
                                <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-[#0F172A] text-[10px] font-mono">
                                  {t.courseTitle || t.courseSlug}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* 3. Submissions */}
                          <td className="py-4 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleOpenViewTask(t.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-95"
                              title="View student submissions"
                            >
                              <Icon name="folder_shared" className="text-xs" />
                              <span>Submissions ({t.submissionCount || 0})</span>
                              {t.reviewedCount > 0 && (
                                <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-[#0F172A] text-[9px] font-black">
                                  {t.reviewedCount}✓
                                </span>
                              )}
                            </button>
                          </td>

                          {/* 4. Actions */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditTask(t)}
                                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-[#0F172A] transition cursor-pointer"
                                title="Edit Task"
                              >
                                <Icon name="edit" className="text-xs" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTask(t)}
                                className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-500/25 transition cursor-pointer"
                                title="Delete Task"
                              >
                                <Icon name="delete" className="text-xs" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: STUDENT SUBMISSIONS LIST */}
      {activeTab === 'submissions' && (
        <>
          {loadingSubmissions ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
              <Icon name="sync" className="text-3xl text-[#0F172A] animate-spin mx-auto" />
              <p className="text-xs text-[#475569] font-bold">Loading student answer submissions...</p>
            </div>
          ) : filteredSubmissions.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
              <div className="w-16 h-16 rounded-full bg-slate-50 text-[#0F172A] flex items-center justify-center mx-auto">
                <Icon name="folder_open" className="text-3xl" />
              </div>
              <h3 className="font-extrabold text-[#0F172A] text-base">No answer submissions found</h3>
              <p className="text-xs text-[#475569] max-w-md mx-auto">
                When learners watch course videos and upload their answer documents, they will appear here for review and grading.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-soft-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-[#475569]">
                      <th className="py-3.5 px-4">Learner</th>
                      <th className="py-3.5 px-4">Course / Playlist</th>
                      <th className="py-3.5 px-4">Video Title</th>
                      <th className="py-3.5 px-4">Submission Date</th>
                      <th className="py-3.5 px-4">Answer File & Type</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredSubmissions.map((s) => {
                      const ext = s.fileType || getFileType(s.fileName, s.fileUrl);
                      return (
                        <tr key={s.id || s.submissionId} className="hover:bg-white transition">
                          {/* Learner Info */}
                          <td className="py-3.5 px-4">
                            <div className="font-extrabold text-[#0F172A] text-sm">{s.userName}</div>
                            <div className="text-[11px] text-[#475569]">{s.userEmail}</div>
                          </td>

                          {/* Course / Playlist */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <span className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-[#0F172A] block truncate">
                              {s.courseSlug || 'Course'}
                            </span>
                            {s.playlistTitle && (
                              <span className="text-[10px] text-[#475569] truncate block mt-0.5">
                                {s.playlistTitle}
                              </span>
                            )}
                          </td>

                          {/* Video Title */}
                          <td className="py-3.5 px-4 font-medium text-[#0F172A] max-w-xs">
                            <div className="flex items-center gap-1.5 text-xs truncate">
                              <Icon name="smart_display" className="text-[#0F172A] text-sm shrink-0" />
                              <span className="truncate">{s.videoTitle || 'Video Assignment'}</span>
                            </div>
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 text-[#475569] text-[11px] whitespace-nowrap">
                            {s.submittedAt
                              ? new Date(s.submittedAt).toLocaleString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '—'}
                          </td>

                          {/* Answer File & Type */}
                          <td className="py-3.5 px-4">
                            {s.fileUrl ? (
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                  {ext}
                                </span>
                                <span className="text-xs font-bold text-[#0F172A] truncate max-w-[140px]" title={s.fileName || 'Answer File'}>
                                  {s.fileName || 'Answer_File'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[#475569] italic text-[11px]">No file</span>
                            )}
                          </td>

                          {/* Status & Marks */}
                          <td className="py-3.5 px-4">
                            <div className="flex flex-col gap-1 items-start">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  s.status === 'reviewed'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : s.status === 'needs_revision'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : s.status === 'resubmitted'
                                    ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-300'
                                    : s.status === 'submitted'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                    : 'bg-slate-100 text-[#475569] border border-slate-200'
                                }`}
                              >
                                {s.status === 'needs_revision' ? 'Needs Revision' : s.status}
                              </span>
                              {s.marksObtained !== null && s.marksObtained !== undefined && (
                                <span className="inline-flex items-center gap-1 text-[11px] font-black text-[#0F172A]">
                                  <Icon name="military_tech" className="text-xs text-amber-600" />
                                  <span>{s.marksObtained} / {s.maxMarks || 100}</span>
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Actions: View File, Download, Review */}
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {s.fileUrl && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setPreviewFile({ url: s.fileUrl, name: s.fileName || 'Answer Document', type: ext })}
                                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-[#0F172A] font-bold text-xs inline-flex items-center gap-1 transition cursor-pointer"
                                    title="View File inside browser"
                                  >
                                    <Icon name="visibility" className="text-xs" />
                                    <span>View File</span>
                                  </button>

                                  <a
                                    href={assetUrl(s.fileUrl)}
                                    target="_blank"
                                    rel="noreferrer"
                                    download
                                    className="px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#0F172A] font-bold text-xs inline-flex items-center gap-1 transition"
                                    title="Download File"
                                  >
                                    <Icon name="download" className="text-xs" />
                                    <span>Download</span>
                                  </a>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={() => handleOpenReview(s)}
                                className="px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition cursor-pointer shadow-2xs"
                              >
                                Review
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── MODAL 1: VIEW TASK & USER SUBMISSIONS ── */}
      {viewingTaskId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-fade-in overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-[#2563EB] flex items-center justify-center shrink-0">
                  <Icon name="assignment" className="text-xl" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-[#0F172A]">
                    {taskDetail?.task?.title || 'Task Details & Submissions'}
                  </h3>
                  <p className="text-xs text-[#475569] flex items-center gap-1.5 mt-0.5">
                    <Icon name="smart_display" className="text-xs" />
                    <span>Video: {taskDetail?.task?.videoTitle || taskDetail?.task?.videoId}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setViewingTaskId(null);
                  setTaskDetail(null);
                }}
                className="p-2 rounded-xl text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 transition cursor-pointer"
              >
                <Icon name="close" className="text-lg" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {loadingDetail ? (
                <div className="py-16 text-center space-y-3">
                  <Icon name="sync" className="animate-spin text-3xl text-[#0F172A] mx-auto" />
                  <p className="text-xs font-bold text-[#475569]">Loading task and submissions...</p>
                </div>
              ) : taskDetail ? (
                <>
                  {/* Task Instructions / Overview Box */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                      <Icon name="info" className="text-sm" /> Instructions & Details
                    </h4>
                    {taskDetail.task.description && (
                      <p className="text-xs text-brand-forest/90 leading-relaxed font-medium">
                        {taskDetail.task.description}
                      </p>
                    )}
                    {taskDetail.task.instructions && (
                      <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs text-[#0F172A] leading-relaxed whitespace-pre-wrap">
                        {taskDetail.task.instructions}
                      </div>
                    )}

                    {taskDetail.task.attachmentUrl && (
                      <div className="p-3.5 rounded-xl bg-white border border-emerald-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-black text-[10px] uppercase shrink-0 border border-emerald-200">
                            {taskDetail.task.attachmentExt || getFileType(taskDetail.task.attachmentName, taskDetail.task.attachmentUrl)}
                          </span>
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                              Question Paper / Worksheet
                            </span>
                            <p className="text-xs font-bold text-[#0F172A] truncate" title={taskDetail.task.attachmentName}>
                              {taskDetail.task.attachmentName || 'Question Paper Document'}
                            </p>
                            {taskDetail.task.attachmentSize && (
                              <p className="text-[10px] text-[#475569]">{taskDetail.task.attachmentSize}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() => setPreviewFile({
                              url: taskDetail.task.attachmentUrl,
                              name: taskDetail.task.attachmentName || 'Question Paper',
                              type: taskDetail.task.attachmentExt || getFileType(taskDetail.task.attachmentName, taskDetail.task.attachmentUrl),
                            })}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-500/25 text-emerald-700 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                          >
                            <Icon name="visibility" className="text-xs" />
                            <span>Preview</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(taskDetail.task.attachmentUrl, taskDetail.task.attachmentName || 'Question-Paper')}
                            className="px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer shadow-2xs"
                          >
                            <Icon name="download" className="text-xs" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submissions Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-extrabold text-[#0F172A] flex items-center gap-1.5">
                        <Icon name="group" className="text-base" /> Assigned Learners & Submissions ({taskDetail.userSubmissions?.length || 0})
                      </h4>
                      <span className="text-xs text-[#475569]">
                        {taskDetail.submissionCount} submitted • {taskDetail.reviewedCount} reviewed
                      </span>
                    </div>

                    {taskDetail.userSubmissions?.length === 0 ? (
                      <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 text-xs text-[#475569]">
                        No learners currently assigned to this task.
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-slate-200 overflow-hidden">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase text-[#475569]">
                              <th className="py-2.5 px-3">Learner</th>
                              <th className="py-2.5 px-3">Submission Status</th>
                              <th className="py-2.5 px-3">Submitted At</th>
                              <th className="py-2.5 px-3">Answer Document</th>
                              <th className="py-2.5 px-3">Admin Review</th>
                              <th className="py-2.5 px-3">Score</th>
                              <th className="py-2.5 px-3 text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {taskDetail.userSubmissions.map((s) => {
                              const ext = s.fileType || getFileType(s.fileName, s.fileUrl);
                              return (
                                <tr key={s.userId} className="hover:bg-white transition">
                                  <td className="py-3 px-3">
                                    <div className="font-extrabold text-[#0F172A]">{s.userName}</div>
                                    <div className="text-[10px] text-[#475569]">{s.userEmail}</div>
                                  </td>
                                  <td className="py-3 px-3">
                                    <span
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                        s.status === 'reviewed'
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : s.status === 'needs_revision'
                                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                          : s.status === 'resubmitted'
                                          ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-300'
                                          : s.status === 'submitted'
                                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                          : 'bg-slate-100 text-[#475569] border border-slate-200'
                                      }`}
                                    >
                                      {s.status === 'needs_revision' ? 'Needs Revision' : s.status}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-[#475569] text-[11px]">
                                    {s.submittedAt
                                      ? new Date(s.submittedAt).toLocaleString('en-IN', {
                                          day: 'numeric',
                                          month: 'short',
                                          hour: '2-digit',
                                          minute: '2-digit',
                                        })
                                      : '—'}
                                  </td>
                                  <td className="py-3 px-3 max-w-xs">
                                    {s.fileUrl ? (
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                          {ext}
                                        </span>
                                        <button
                                          type="button"
                                          onClick={() => setPreviewFile({ url: s.fileUrl, name: s.fileName || 'Answer File', type: ext })}
                                          className="text-[11px] font-bold text-[#0F172A] hover:underline truncate max-w-[120px]"
                                        >
                                          {s.fileName || 'View Answers'}
                                        </button>
                                        <a
                                          href={assetUrl(s.fileUrl)}
                                          target="_blank"
                                          rel="noreferrer"
                                          download
                                          className="text-[#475569] hover:text-emerald-800 p-0.5"
                                          title="Download"
                                        >
                                          <Icon name="download" className="text-xs" />
                                        </a>
                                      </div>
                                    ) : (
                                      <span className="text-zinc-400 italic text-[11px]">No answer file submitted</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3">
                                    {s.adminFeedback ? (
                                      <div className="text-[11px] text-amber-700 bg-amber-50/80 p-1.5 rounded-lg border border-amber-200">
                                        <strong>Feedback:</strong> {s.adminFeedback}
                                      </div>
                                    ) : s.status === 'reviewed' ? (
                                      <span className="text-emerald-700 text-[11px] font-bold flex items-center gap-1">
                                        <Icon name="check_circle" className="text-xs" /> Approved
                                      </span>
                                    ) : (
                                      <span className="text-[#475569] text-[11px]">Pending review</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3">
                                    {s.marksObtained !== null && s.marksObtained !== undefined ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-[#0F172A] border border-emerald-200 text-xs font-black shadow-2xs">
                                        <Icon name="military_tech" className="text-xs text-amber-600" />
                                        <span>
                                          {s.marksObtained} / {s.maxMarks || 100}
                                        </span>
                                      </span>
                                    ) : (
                                      <span className="text-[#475569] text-[11px] italic">—</span>
                                    )}
                                  </td>
                                  <td className="py-3 px-3 text-right">
                                    {s.submissionId ? (
                                      <button
                                        type="button"
                                        onClick={() => handleOpenReview(s)}
                                        className="px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition cursor-pointer shadow-2xs"
                                      >
                                        Review
                                      </button>
                                    ) : (
                                      <span className="text-[10px] text-[#475569] italic">Awaiting work</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 flex items-center justify-end bg-slate-50">
              <button
                type="button"
                onClick={() => {
                  setViewingTaskId(null);
                  setTaskDetail(null);
                }}
                className="px-5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#0F172A] hover:bg-slate-100 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: REVIEW USER SUBMISSION ── */}
      {reviewingSubmission && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Icon name="rate_review" className="text-xl text-[#0F172A]" />
                <h3 className="text-base font-extrabold text-[#0F172A]">
                  Review Submission: {reviewingSubmission.userName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReviewingSubmission(null)}
                className="p-1 rounded-lg text-[#475569] hover:text-[#0F172A]"
              >
                <Icon name="close" className="text-base" />
              </button>
            </div>

            {/* Learner Submission Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div>
                <span className="text-[#475569] uppercase font-extrabold text-[10px]">Learner:</span>
                <div className="font-bold text-[#0F172A]">{reviewingSubmission.userName} ({reviewingSubmission.userEmail})</div>
              </div>

              {reviewingSubmission.fileUrl && (
                <div>
                  <span className="text-[#475569] uppercase font-extrabold text-[10px]">Uploaded Answer File:</span>
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setPreviewFile({
                        url: reviewingSubmission.fileUrl,
                        name: reviewingSubmission.fileName || 'Answer Document',
                        type: reviewingSubmission.fileType || getFileType(reviewingSubmission.fileName, reviewingSubmission.fileUrl),
                      })}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#2563EB] text-white font-bold hover:bg-[#1D4ED8] transition text-xs shadow-2xs cursor-pointer"
                    >
                      <Icon name="visibility" className="text-sm" />
                      <span>View File</span>
                    </button>
                    <a
                      href={assetUrl(reviewingSubmission.fileUrl)}
                      target="_blank"
                      rel="noreferrer"
                      download
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-[#0F172A] font-bold hover:bg-slate-200 transition text-xs border border-slate-200"
                    >
                      <Icon name="download" className="text-sm" />
                      <span>Download ({reviewingSubmission.fileName || 'Document'})</span>
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Assessment Marks / Grading Section */}
            <div className="p-4 rounded-2xl bg-[#0D3821]/5 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#0F172A] flex items-center gap-1.5">
                  <Icon name="military_tech" className="text-base text-[#0F172A]" />
                  <span>Assessment Marks / Grade</span>
                </label>
                {marksObtained !== '' && !isNaN(Number(marksObtained)) && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#0D3821] border border-emerald-200 font-extrabold text-xs shadow-2xs">
                    {marksObtained} / {maxMarks || 100} (
                    {Math.round((Number(marksObtained) / (Number(maxMarks) || 100)) * 100)}%)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="block text-[11px] font-bold text-[#0F172A] mb-1">
                    Marks Obtained <span className="text-red-600">*</span>
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    max={maxMarks || 100}
                    value={marksObtained}
                    onChange={(e) => setMarksObtained(e.target.value)}
                    placeholder="e.g. 85"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-[#0F172A] bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>

                <div>
                  <span className="block text-[11px] font-bold text-[#0F172A] mb-1">
                    Total / Max Marks
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={maxMarks}
                    onChange={(e) => setMaxMarks(e.target.value)}
                    placeholder="100"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold text-[#0F172A] bg-white focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
                  />
                </div>
              </div>
            </div>

            {/* Feedback Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#0F172A]">
                Admin Feedback / Revision Comments
              </label>
              <textarea
                rows={3}
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                placeholder="e.g. Well answered! Or: Please recheck question 2 explained in the video and recalculate the values."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
              />
              <span className="text-[10px] text-[#475569]">
                Required when requesting revision. Will be shown directly to the learner.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setReviewingSubmission(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#475569] hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={reviewSubmitting}
                onClick={() => handleSubmitReview('needs_revision')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Icon name="replay" className="text-xs" />
                <span>Request Revision</span>
              </button>

              <button
                type="button"
                disabled={reviewSubmitting}
                onClick={() => handleSubmitReview('reviewed')}
                className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-1 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Icon name="check_circle" className="text-xs text-[#2563EB]" />
                <span>Mark as Reviewed</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: IN-APP FILE PREVIEW MODAL ── */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-8 h-8 rounded-xl bg-[#2563EB] text-[#2563EB] flex items-center justify-center shrink-0">
                  <Icon name="description" className="text-base" />
                </span>
                <div className="min-w-0">
                  <h4 className="text-sm font-extrabold text-[#0F172A] truncate">{previewFile.name}</h4>
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#475569]">{previewFile.type || 'DOCUMENT'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={assetUrl(previewFile.url)}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="px-3.5 py-1.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-1 transition"
                >
                  <Icon name="download" className="text-xs" />
                  <span>Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 rounded-xl text-[#475569] hover:text-[#0F172A] hover:bg-slate-100 cursor-pointer"
                >
                  <Icon name="close" className="text-base" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-slate-100 flex items-center justify-center min-h-[55vh]">
              {previewFile.type === 'PDF' ? (
                <iframe
                  src={assetUrl(previewFile.url)}
                  title={previewFile.name}
                  className="w-full h-[70vh] rounded-2xl border border-slate-200 bg-white shadow-sm"
                />
              ) : ['JPG', 'JPEG', 'PNG', 'WEBP', 'GIF'].includes(previewFile.type) ? (
                <img
                  src={assetUrl(previewFile.url)}
                  alt={previewFile.name}
                  className="max-h-[70vh] max-w-full rounded-2xl shadow-sm object-contain"
                />
              ) : (
                <div className="text-center p-8 space-y-4 max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <Icon name="file_present" className="text-5xl text-[#475569] mx-auto" />
                  <div>
                    <h5 className="font-extrabold text-sm text-[#0F172A]">{previewFile.name}</h5>
                    <p className="text-xs text-[#475569] mt-1">
                      Direct viewing is available by downloading or opening with your local spreadsheet / office viewer ({previewFile.type}).
                    </p>
                  </div>
                  <a
                    href={assetUrl(previewFile.url)}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black shadow-xs transition"
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

      {/* ── MODAL 4: EDIT TASK ── */}
      {editingTask && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveEditTask}
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Icon name="edit" className="text-xl text-[#0F172A]" />
                <h3 className="text-base font-extrabold text-[#0F172A]">Edit Task</h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="p-1 rounded-lg text-[#475569] hover:text-[#0F172A] cursor-pointer"
              >
                <Icon name="close" className="text-base" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                  Task Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                  Detailed Instructions
                </label>
                <textarea
                  rows={4}
                  value={editForm.instructions}
                  onChange={(e) => setEditForm({ ...editForm, instructions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                  Due Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={editForm.dueDate}
                  onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              {/* Question Paper / Worksheet Document Attachment */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                    <Icon name="attachment" className="text-sm text-[#0F172A]" />
                    <span>Question Paper / Worksheet Attachment</span>
                  </label>
                  <span className="text-[10px] text-[#475569] font-medium">
                    DOCX, PDF, DOC, XLSX, TXT, PNG/JPG
                  </span>
                </div>

                {editForm.attachmentUrl ? (
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-black text-[10px] uppercase shrink-0 border border-emerald-200">
                        {editForm.attachmentExt || getFileType(editForm.attachmentName, editForm.attachmentUrl)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-[#0F172A] truncate max-w-xs" title={editForm.attachmentName}>
                          {editForm.attachmentName || 'Question Paper Document'}
                        </p>
                        {editForm.attachmentSize && (
                          <p className="text-[10px] text-[#475569]">{editForm.attachmentSize}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewFile({
                          url: editForm.attachmentUrl,
                          name: editForm.attachmentName || 'Question Paper',
                          type: editForm.attachmentExt || getFileType(editForm.attachmentName, editForm.attachmentUrl),
                        })}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-500/25 text-emerald-700 text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                        title="Preview File"
                      >
                        <Icon name="visibility" className="text-xs" />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(editForm.attachmentUrl, editForm.attachmentName || 'Question-Paper')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                        title="Download File"
                      >
                        <Icon name="download" className="text-xs" />
                        <span>Download</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveEditAttachment}
                        className="p-1 rounded-lg hover:bg-rose-500/25 text-rose-500 hover:text-rose-700 transition cursor-pointer"
                        title="Remove Attachment"
                      >
                        <Icon name="close" className="text-base" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="border-2 border-dashed border-slate-200 hover:border-[#2563EB] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-white transition group">
                      <Icon name="cloud_upload" className="text-2xl text-[#0F172A] group-hover:scale-110 transition mb-1" />
                      <span className="text-xs font-bold text-[#0F172A]">
                        {uploadingEditAttachment ? 'Uploading Question Paper...' : 'Click to attach Question Paper / Worksheet'}
                      </span>
                      <span className="text-[10px] text-[#475569] mt-0.5">
                        Supports DOCX, DOC, PDF, XLSX, TXT, PNG, JPG (up to 30MB)
                      </span>
                      <input
                        type="file"
                        accept=".docx,.doc,.pdf,.xlsx,.xls,.txt,.png,.jpg,.jpeg"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUploadAttachment(f, true);
                          e.target.value = '';
                        }}
                        disabled={uploadingEditAttachment}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setEditingTask(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#475569] hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingEdit || uploadingEditAttachment}
                className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {savingEdit ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── MODAL 5: CREATE NEW TASK ── */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleSaveCreateTask}
            className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-up"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Icon name="add_task" className="text-xl text-[#0F172A]" />
                <h3 className="text-base font-extrabold text-[#0F172A]">Create New Task / Assignment</h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="p-1 rounded-lg text-[#475569] hover:text-[#0F172A] cursor-pointer"
              >
                <Icon name="close" className="text-base" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              {/* Course Selection */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                  Assign To Course / Video <span className="text-red-600">*</span>
                </label>
                {loadingOptions ? (
                  <div className="text-xs text-[#475569] py-2 flex items-center gap-1.5">
                    <Icon name="sync" className="animate-spin text-sm" />
                    <span>Loading available courses...</span>
                  </div>
                ) : (
                  <select
                    value={createForm.courseSlug}
                    onChange={(e) => handleCourseChangeInCreate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                  >
                    <option value="">-- Choose Course (or enter Video ID below) --</option>
                    {coursesList.map((c) => (
                      <option key={c.id || c.slug} value={c.slug}>
                        {c.title} ({c.slug})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Video ID & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                    Video ID <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. video-id or youtube ID"
                    value={createForm.videoId}
                    onChange={(e) => setCreateForm({ ...createForm, videoId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                    Video Label / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Lesson 1: Introduction"
                    value={createForm.videoTitle}
                    onChange={(e) => setCreateForm({ ...createForm, videoTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Task Title */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                  Task Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chapter 1 Worksheet & Practice Exercises"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                  Short Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete all questions from the attached worksheet"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              {/* Detailed Instructions */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                  Detailed Instructions (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Provide any specific submission guidelines, format requirements, or points distribution..."
                  value={createForm.instructions}
                  onChange={(e) => setCreateForm({ ...createForm, instructions: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase tracking-wider text-[#475569] mb-1">
                  Due Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={createForm.dueDate}
                  onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>

              {/* Question Paper / Worksheet Document Attachment */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-extrabold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
                    <Icon name="attachment" className="text-sm text-[#0F172A]" />
                    <span>Attach Question Paper / Worksheet</span>
                  </label>
                  <span className="text-[10px] text-[#475569] font-medium">
                    DOCX, PDF, DOC, XLSX, TXT, PNG/JPG
                  </span>
                </div>

                {createForm.attachmentUrl ? (
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 shadow-2xs flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 font-black text-[10px] uppercase shrink-0 border border-emerald-200">
                        {createForm.attachmentExt || getFileType(createForm.attachmentName, createForm.attachmentUrl)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-[#0F172A] truncate max-w-xs" title={createForm.attachmentName}>
                          {createForm.attachmentName || 'Question Paper Document'}
                        </p>
                        {createForm.attachmentSize && (
                          <p className="text-[10px] text-[#475569]">{createForm.attachmentSize}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => setPreviewFile({
                          url: createForm.attachmentUrl,
                          name: createForm.attachmentName || 'Question Paper',
                          type: createForm.attachmentExt || getFileType(createForm.attachmentName, createForm.attachmentUrl),
                        })}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-500/25 text-emerald-700 text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                        title="Preview File"
                      >
                        <Icon name="visibility" className="text-xs" />
                        <span>Preview</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDownloadFile(createForm.attachmentUrl, createForm.attachmentName || 'Question-Paper')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-bold inline-flex items-center gap-1 transition cursor-pointer"
                        title="Download File"
                      >
                        <Icon name="download" className="text-xs" />
                        <span>Download</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveCreateAttachment}
                        className="p-1 rounded-lg hover:bg-rose-500/25 text-rose-500 hover:text-rose-700 transition cursor-pointer"
                        title="Remove Attachment"
                      >
                        <Icon name="close" className="text-base" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="border-2 border-dashed border-slate-200 hover:border-[#2563EB] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer bg-white transition group">
                      <Icon name="cloud_upload" className="text-2xl text-[#0F172A] group-hover:scale-110 transition mb-1" />
                      <span className="text-xs font-bold text-[#0F172A]">
                        {uploadingCreateAttachment ? 'Uploading Question Paper...' : 'Click to attach Question Paper / Worksheet'}
                      </span>
                      <span className="text-[10px] text-[#475569] mt-0.5">
                        Learners will see this document and download it to solve answers
                      </span>
                      <input
                        type="file"
                        accept=".docx,.doc,.pdf,.xlsx,.xls,.txt,.png,.jpg,.jpeg"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleUploadAttachment(f, false);
                          e.target.value = '';
                        }}
                        disabled={uploadingCreateAttachment}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#475569] hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingCreate || uploadingCreateAttachment}
                className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                {savingCreate ? 'Creating Task...' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
