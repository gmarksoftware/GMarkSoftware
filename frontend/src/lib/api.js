const isDev =
  Boolean(import.meta.env.DEV) ||
  (typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '0.0.0.0' ||
      window.location.port === '3001' ||
      window.location.port === '5173'));

const rawConfiguredApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/+$/, '');

// In development, strict isolation: NEVER call production URLs or mismatched ports from localhost
const configuredApiUrl = isDev
  ? (rawConfiguredApiUrl === '/api' || rawConfiguredApiUrl.includes('localhost:3000') || rawConfiguredApiUrl.includes('127.0.0.1:3000')
    ? rawConfiguredApiUrl
    : '/api')
  : rawConfiguredApiUrl;

const defaultHost = '/api';
const targetHost = (configuredApiUrl || defaultHost).replace(/\/+$/, '');

// Ensure BASE is consistently /api in local dev (proxied to port 3000) or configured VITE_API_URL
export const BASE =
  targetHost === '/api'
    ? '/api'
    : targetHost.endsWith('/api')
      ? targetHost
      : `${targetHost}/api`;

export const ORIGIN = BASE.startsWith('http')
  ? new URL(BASE).origin
  : isDev
    ? 'http://localhost:3000'
    : (targetHost.startsWith('http') ? new URL(targetHost).origin : '');

/**
 * Resolves an API path cleanly against BASE without double or missing /api.
 */
export function resolveApiPath(path) {
  let cleanPath = String(path || '').trim();
  if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;
  if (cleanPath.startsWith('/api/')) {
    cleanPath = cleanPath.slice(4);
  } else if (cleanPath === '/api') {
    cleanPath = '';
  }
  return `${BASE}${cleanPath}`;
}

export const assetUrl = (p) => {
  if (!p) return '';
  if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:') || p.startsWith('blob:')) return p;
  const cleanPath = p.startsWith('/') ? p : `/${p}`;
  return `${ORIGIN}${cleanPath}`;
};

async function request(path, { method = 'GET', body, headers = {}, isForm = false } = {}) {
  const token = typeof window !== 'undefined' ? (localStorage.getItem('gramguru_token') || '') : '';
  const defaultHeaders = token ? { Authorization: `Bearer ${token}` } : {};
  const url = resolveApiPath(path);

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        ...(body && !isForm ? { 'Content-Type': 'application/json' } : {}),
        ...defaultHeaders,
        ...headers,
      },
      body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
      credentials: 'include',
    });
  } catch (networkErr) {
    const err = new Error(networkErr?.message || 'Network error');
    err.isNetworkError = true;
    err.originalError = networkErr;
    throw err;
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message[0] : (data?.message || data?.error);
    const err = new Error(msg || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    err.isNetworkError = false;
    throw err;
  }
  return data;
}

async function downloadBlob(path, defaultFilename, token) {
  const currentToken = token || (typeof window !== 'undefined' ? (localStorage.getItem('gramguru_token') || '') : '');
  const headers = currentToken ? { Authorization: `Bearer ${currentToken}` } : {};
  const targetUrl = resolveApiPath(path);

  let res;
  try {
    res = await fetch(targetUrl, { headers, credentials: 'include' });
  } catch (networkErr) {
    const err = new Error(networkErr?.message || 'Network error');
    err.isNetworkError = true;
    err.originalError = networkErr;
    throw err;
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    const msg = Array.isArray(data?.message) ? data.message[0] : (data?.message || data?.error);
    const err = new Error(msg || `Download failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    err.isNetworkError = false;
    throw err;
  }
  const disposition = res.headers.get('Content-Disposition') || '';
  let filename = defaultFilename;
  const match = disposition.match(/filename="?([^"]+)"?/);
  if (match && match[1]) filename = match[1];

  const blob = await res.blob();
  const blobUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(blobUrl);
  a.remove();
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body }),
  getCourses: (category) =>
    request(`/courses${category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : ''}`),
  getCourse: (slug) => request(`/courses/${encodeURIComponent(slug)}`),
  getCourseVideoAccess: (slug) => request(`/courses/${encodeURIComponent(slug)}/video`),
  downloadCourseTemplate: () => downloadBlob('/courses/template', 'gramguru_course_template.xlsx'),
  getCourseExcelData: (slug) => request(`/courses/${encodeURIComponent(slug)}/excel-data`),
  getCourseRatings: (slug) => request(`/courses/${encodeURIComponent(slug)}/ratings`),
  submitCourseRating: (slug, data) => request(`/courses/${encodeURIComponent(slug)}/rate`, { method: 'POST', body: data }),
  enrollCourse: (slug, data = {}) => request(`/courses/${encodeURIComponent(slug)}/enroll`, { method: 'POST', body: data }),
  getEnrollmentStatus: (slug) => request(`/courses/${encodeURIComponent(slug)}/is-enrolled`),

  // LMS Student APIs
  getStudentProfile: () => request('/lms/profile'),
  updateStudentProfile: (data) => request('/lms/profile', { method: 'PUT', body: data }),
  getMyLearning: () => request('/courses/my/learning'),
  deleteMyLearningCourse: (slug) => request(`/courses/my/learning/${encodeURIComponent(slug)}`, { method: 'DELETE' }),
  getCourseValidity: (slug) => request(`/courses/${encodeURIComponent(slug)}/validity`),
  getCourseProgress: (slug) => request(`/courses/${encodeURIComponent(slug)}/progress`),
  saveCourseProgress: (slug, data) => request(`/courses/${encodeURIComponent(slug)}/progress`, { method: 'POST', body: data }),
  submitAssessment: (slug, data) => request(`/courses/${encodeURIComponent(slug)}/assessments/submit`, { method: 'POST', body: data }),
  getMyAssessmentAttempts: (slug) => request(`/courses/${encodeURIComponent(slug)}/assessments/my-attempts`),
  getCourseAssignments: (slug) => request(`/courses/${encodeURIComponent(slug)}/assignments`),
  submitAssignment: (slug, id, submissionData) =>
    request(`/courses/${encodeURIComponent(slug)}/assignments/${encodeURIComponent(id)}/submit`, {
      method: 'POST',
      body: { submissionData },
    }),
  getMyAssignmentSubmissions: (slug) =>
    request(`/courses/${encodeURIComponent(slug)}/assignments/my-submissions`),
  getCourseCertificateStatus: (slug) =>
    request(`/courses/${encodeURIComponent(slug)}/certificate-status`),
  getMyCertificates: () => request('/lms/certificates/my'),
  verifyCertificate: (code) =>
    request(`/certificates/verify/${encodeURIComponent(code)}`),
  getSubscriptionPlans: () => request('/subscriptions/plans'),
  getMySubscription: () => request('/subscriptions/my'),
  checkout: (data) => request('/payments/checkout', { method: 'POST', body: data }),
  getMyQueries: () => request('/queries/my'),
  submitQuery: (data) => request('/queries', { method: 'POST', body: data }),
  getMyActivity: () => request('/lms/activity/my'),
  getAllPlaylists: () => request('/playlists'),
  getCoursePlaylists: (courseSlug) => request(`/courses/${encodeURIComponent(courseSlug)}/playlists`),
  getPlaylist: (playlistId) => request(`/playlists/${encodeURIComponent(playlistId)}`),
  getTrendingPlaylists: () => request('/playlists/trending'),

  // Video-wise Task / Assignment APIs
  getMyTasks: (videoId) => request(videoId ? `/tasks/my?videoId=${encodeURIComponent(videoId)}` : '/tasks/my'),
  getTaskByVideo: (videoId, params = {}) => {
    const sp = new URLSearchParams();
    if (params?.courseSlug) sp.set('courseSlug', params.courseSlug);
    if (params?.playlistId) sp.set('playlistId', params.playlistId);
    if (params?.videoTitle) sp.set('videoTitle', params.videoTitle);
    if (params?.youtubeVideoId) sp.set('youtubeVideoId', params.youtubeVideoId);
    const q = sp.toString();
    return request(`/tasks/by-video/${encodeURIComponent(videoId)}${q ? `?${q}` : ''}`);
  },
  submitVideoAnswer: (videoId, body) => request(`/tasks/by-video/${encodeURIComponent(videoId)}/submit`, { method: 'POST', body }),
  getTask: (id) => request(`/tasks/${encodeURIComponent(id)}`),
  submitTaskWork: (id, body) => request(`/tasks/${encodeURIComponent(id)}/submit`, { method: 'POST', body }),
  resubmitTaskWork: (id, body) => request(`/tasks/${encodeURIComponent(id)}/submission`, { method: 'PUT', body }),
  uploadTaskWork: (file, onProgress) => {
    const fd = new FormData();
    fd.append('file', file);
    const token = typeof window !== 'undefined' ? (localStorage.getItem('gramguru_token') || '') : '';
    return uploadWithProgress('/tasks/upload', fd, { headers: token ? { Authorization: `Bearer ${token}` } : {}, onProgress });
  },
};

export const publicApi = api;



/** Login / register / "who am I" – one flow for visitors and the admin. */
export const authApi = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  register: (fullName, email, password) => request('/auth/register', { method: 'POST', body: { fullName, email, password } }),
  google: (fullName, email, password, googleId) => request('/auth/google', { method: 'POST', body: { fullName, email, password, googleId } }),
  me: (token) => {
    const t = token || (typeof window !== 'undefined' ? (localStorage.getItem('gramguru_token') || '') : '');
    return request('/auth/me', { headers: t ? { Authorization: `Bearer ${t}` } : {} });
  },
};

function uploadWithProgress(path, formData, { method = 'POST', headers = {}, onProgress } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, resolveApiPath(path));

    for (const [k, v] of Object.entries(headers)) {
      if (k.toLowerCase() !== 'content-type') {
        xhr.setRequestHeader(k, v);
      }
    }

    if (xhr.upload && typeof onProgress === 'function') {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress({ loaded: e.loaded, total: e.total, percent });
        }
      };
    }

    xhr.onload = () => {
      let data = null;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = null;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        const msg = Array.isArray(data?.message) ? data.message[0] : (data?.message || `Upload failed (${xhr.status})`);
        const err = new Error(msg);
        err.status = xhr.status;
        reject(err);
      }
    };

    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.ontimeout = () => reject(new Error('Upload timed out'));
    xhr.timeout = 0;

    xhr.send(formData);
  });
}

/** Admin calls – authenticated with the logged-in admin's token (Authorization: Bearer …). */
export const adminApi = (token) => {
  const authToken = token || (typeof window !== 'undefined' ? (localStorage.getItem('gramguru_token') || localStorage.getItem('token') || '') : '');
  const headers = authToken ? { Authorization: `Bearer ${authToken}` } : {};
  return {
    get: (p) => request(`/admin${p}`, { headers }),
    post: (p, body) => request(`/admin${p}`, { method: 'POST', body, headers }),
    put: (p, body) => request(`/admin${p}`, { method: 'PUT', body, headers }),
    del: (p) => request(`/admin${p}`, { method: 'DELETE', headers }),
    upload: (p, formData, onProgress, method = 'POST') => uploadWithProgress(`/admin${p}`, formData, { method, headers, onProgress }),

    // Gallery
    getGallery: () => request('/admin/gallery', { headers }),
    uploadGallery: (formData, onProgress) => uploadWithProgress('/admin/gallery', formData, { method: 'POST', headers, onProgress }),
    updateGallery: (id, formDataOrBody, onProgress) => {
      if (typeof FormData !== 'undefined' && formDataOrBody instanceof FormData) {
        return uploadWithProgress(`/admin/gallery/${id}`, formDataOrBody, { method: 'PUT', headers, onProgress });
      }
      return request(`/admin/gallery/${id}`, { method: 'PUT', body: formDataOrBody, headers });
    },
    deleteGallery: (id) => request(`/admin/gallery/${id}`, { method: 'DELETE', headers }),

    // Users & Profiles
    getUsers: () => request('/admin/users', { headers }),
    getUserProfile: (id) => request(`/admin/users/${id}`, { headers }),
    getUserDetails: (id) => request(`/admin/users/${encodeURIComponent(id)}/details`, { headers }),
    createUser: (body) => request('/admin/users', { method: 'POST', body, headers }),
    updateUserRole: (id, role) => request(`/admin/users/${id}/role`, { method: 'PUT', body: { role }, headers }),
    deleteUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE', headers }),

    // Sub-Admin Management (Super Admin only)
    getSubAdmins: () => request('/admin/sub-admins', { headers }),
    createSubAdmin: (body) => request('/admin/sub-admins', { method: 'POST', body, headers }),
    updateSubAdmin: (id, body) =>
      request(`/admin/sub-admins/${encodeURIComponent(id)}`, { method: 'PUT', body, headers }),
    updateSubAdminAssignments: (id, assignments = [], assignedPlaylistIds = []) =>
      request(`/admin/sub-admins/${encodeURIComponent(id)}/assignments`, {
        method: 'PUT',
        body: { assignments, assignedPlaylistIds },
        headers,
      }),
    deleteSubAdmin: (id, permanent = true) =>
      request(`/admin/sub-admins/${encodeURIComponent(id)}${permanent ? '?permanent=true' : ''}`, { method: 'DELETE', headers }),
    getAssignableResources: (adminId) =>
      request(`/admin/assignable-resources${adminId ? `?adminId=${encodeURIComponent(adminId)}` : ''}`, { headers }),

    // Real-Time Mail, Newsletter & Inquiries
    getMailStatus: () => request('/admin/mail/status', { headers }),
    sendSubscriberEmail: (body) => request('/admin/subscribers/send-email', { method: 'POST', body, headers }),
    replyContactMessage: (body) => request('/admin/contact/reply', { method: 'POST', body, headers }),
    uploadMailAttachment: (file, onProgress) => {
      const fd = new FormData();
      fd.append('file', file);
      return uploadWithProgress('/admin/mail/upload-attachment', fd, { headers, onProgress });
    },
    uploadThumbnail: (file, onProgress) => {
      const fd = new FormData();
      fd.append('thumbnail', file);
      return uploadWithProgress('/admin/upload-thumbnail', fd, { headers, onProgress });
    },

    // Courses & Excel Import/Export
    getCourses: () => request('/admin/courses', { headers }),
    getCourseViewsBreakdown: (slug) =>
      request(`/admin/courses/${encodeURIComponent(slug)}/views-breakdown`, { headers }),
    createCourse: (body) => request('/admin/courses', { method: 'POST', body, headers }),
    updateCourse: (id, body) => request(`/admin/courses/${id}`, { method: 'PUT', body, headers }),
    saveCourseAssessment: (idOrSlug, assessments, assessmentSettings) =>
      request(`/admin/courses/${encodeURIComponent(idOrSlug)}/assessment`, {
        method: 'PUT',
        body: { assessments, assessmentSettings },
        headers,
      }),
    deleteCourse: (id) => request(`/admin/courses/${encodeURIComponent(id)}`, { method: 'DELETE', headers }),
    deleteCourseLesson: (id, lessonIndex) =>
      request(`/admin/courses/${encodeURIComponent(id)}/lessons/${lessonIndex}`, { method: 'DELETE', headers }),
    downloadTemplate: () => downloadBlob('/courses/template', 'gramguru_course_template.xlsx', token),
    downloadCourseExcel: (idOrSlug) =>
      downloadBlob(
        idOrSlug ? `/courses/${encodeURIComponent(idOrSlug)}/download-excel` : '/courses/download-excel',
        `${idOrSlug || 'courses'}.xlsx`,
        token
      ),
    exportCourses: () => downloadBlob('/admin/courses/export', `gramguru_courses_${new Date().toISOString().split('T')[0]}.xlsx`, token),
    validateImportCourses: (file) => {
      const fd = new FormData();
      fd.append('file', file);
      return request('/admin/courses/import/validate', { method: 'POST', body: fd, headers, isForm: true });
    },
    importCourses: (courses, file) => {
      if (file) {
        const fd = new FormData();
        fd.append('file', file);
        return request('/admin/courses/import', { method: 'POST', body: fd, headers, isForm: true });
      }
      return request('/admin/courses/import', { method: 'POST', body: { courses }, headers });
    },
    uploadCourseExcel: (id, file) => {
      const fd = new FormData();
      fd.append('file', file);
      return request(`/admin/courses/${encodeURIComponent(id)}/excel`, { method: 'POST', body: fd, headers, isForm: true });
    },
    removeCourseExcel: (id) => request(`/admin/courses/${encodeURIComponent(id)}/excel`, { method: 'DELETE', headers }),
    uploadCourseNote: (file, onProgress) => {
      const fd = new FormData();
      fd.append('file', file);
      if (typeof onProgress === 'function') {
        return uploadWithProgress('/admin/courses/upload-note', fd, { headers, onProgress });
      }
      return request('/admin/courses/upload-note', { method: 'POST', body: fd, headers, isForm: true });
    },

    // LMS Admin APIs
    getLmsAnalytics: () => request('/admin/lms/analytics', { headers }),
    getStudentReports: () => request('/admin/lms/reports/students', { headers }),
    getCourseReports: () => request('/admin/lms/reports/courses', { headers }),
    getQueries: (status) => request(`/admin/queries${status && status !== 'all' ? `?status=${encodeURIComponent(status)}` : ''}`, { headers }),
    replyQuery: (id, reply, status = 'Answered') => request(`/admin/queries/${encodeURIComponent(id)}`, { method: 'PUT', body: { reply, status }, headers }),
    updateQueryStatus: (id, status) => request(`/admin/queries/${encodeURIComponent(id)}/status`, { method: 'PATCH', body: { status }, headers }),
    deleteQuery: (id) => request(`/admin/queries/${encodeURIComponent(id)}`, { method: 'DELETE', headers }),
    getLiveClasses: () => request('/admin/live-classes', { headers }),
    createLiveClass: (body) => request('/admin/live-classes', { method: 'POST', body, headers }),
    updateLiveClass: (id, body) => request(`/admin/live-classes/${encodeURIComponent(id)}`, { method: 'PUT', body, headers }),
    deleteLiveClass: (id) => request(`/admin/live-classes/${encodeURIComponent(id)}`, { method: 'DELETE', headers }),
    getAssignments: (courseSlug) => request(`/admin/lms/assignments${courseSlug ? `?courseSlug=${encodeURIComponent(courseSlug)}` : ''}`, { headers }),
    createAssignment: (body) => request('/admin/lms/assignments', { method: 'POST', body, headers }),
    getSubmissions: (assignmentId) => request(`/admin/lms/submissions${assignmentId ? `?assignmentId=${encodeURIComponent(assignmentId)}` : ''}`, { headers }),
    gradeSubmission: (id, body) => request(`/admin/lms/submissions/${encodeURIComponent(id)}/grade`, { method: 'PUT', body, headers }),
    getLmsPayments: () => request('/admin/lms/payments', { headers }),

    // Course Ratings & Reviews Management
    getReviews: (params = {}) => {
      const sp = new URLSearchParams();
      if (params.courseId && params.courseId !== 'all') sp.set('courseId', params.courseId);
      if (params.rating && params.rating !== 'all') sp.set('rating', params.rating);
      if (params.status && params.status !== 'all') sp.set('status', params.status);
      if (params.search && params.search.trim()) sp.set('search', params.search.trim());
      const q = sp.toString();
      return request(`/admin/reviews${q ? `?${q}` : ''}`, { headers });
    },
    getReviewsSummary: (courseId) => {
      const q = courseId && courseId !== 'all' ? `?courseId=${encodeURIComponent(courseId)}` : '';
      return request(`/admin/reviews/summary${q}`, { headers });
    },
    updateReviewStatus: (id, status) =>
      request(`/admin/reviews/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: { status },
        headers,
      }),

    // Playlist Management
    getPlaylists: (courseIdOrParams) => {
      if (!courseIdOrParams) return request('/admin/playlists', { headers });
      if (typeof courseIdOrParams === 'string') {
        return request(`/admin/playlists?courseId=${encodeURIComponent(courseIdOrParams)}`, { headers });
      }
      const sp = new URLSearchParams();
      if (courseIdOrParams.courseId) sp.set('courseId', courseIdOrParams.courseId);
      if (courseIdOrParams.courseSlug) sp.set('courseSlug', courseIdOrParams.courseSlug);
      if (courseIdOrParams.isTrending !== undefined) sp.set('isTrending', String(courseIdOrParams.isTrending));
      const q = sp.toString();
      return request(`/admin/playlists${q ? `?${q}` : ''}`, { headers });
    },
    getPlaylist: (id) => request(`/admin/playlists/${encodeURIComponent(id)}`, { headers }),
    createPlaylist: (body) => request('/admin/playlists', { method: 'POST', body, headers }),
    updatePlaylist: (id, body) => request(`/admin/playlists/${encodeURIComponent(id)}`, { method: 'PUT', body, headers }),
    deletePlaylist: (id) => request(`/admin/playlists/${encodeURIComponent(id)}`, { method: 'DELETE', headers }),
    addPlaylistVideo: (playlistId, body) =>
      request(`/admin/playlists/${encodeURIComponent(playlistId)}/videos`, { method: 'POST', body, headers }),
    updatePlaylistVideo: (playlistId, videoId, body) =>
      request(`/admin/playlists/${encodeURIComponent(playlistId)}/videos/${encodeURIComponent(videoId)}`, {
        method: 'PUT',
        body,
        headers,
      }),
    updateVideo: (videoId, body) =>
      request(`/admin/playlists/videos/${encodeURIComponent(videoId)}`, {
        method: 'PUT',
        body,
        headers,
      }),
    deletePlaylistVideo: (playlistId, videoId) =>
      request(`/admin/playlists/${encodeURIComponent(playlistId)}/videos/${encodeURIComponent(videoId)}`, {
        method: 'DELETE',
        headers,
      }),
    reorderPlaylistVideos: (playlistId, videoIds) =>
      request(`/admin/playlists/${encodeURIComponent(playlistId)}/videos/reorder`, {
        method: 'PUT',
        body: { videoIds },
        headers,
      }),

    // Video Task Management
    getAdminTasks: (params = {}) => {
      if (!params || typeof params === 'string') {
        return request('/admin/tasks', { headers });
      }
      const sp = new URLSearchParams();
      if (params.videoId) sp.set('videoId', params.videoId);
      if (params.courseSlug) sp.set('courseSlug', params.courseSlug);
      const q = sp.toString();
      return request(`/admin/tasks${q ? `?${q}` : ''}`, { headers });
    },
    getAdminTask: (id) => request(`/admin/tasks/${encodeURIComponent(id)}`, { headers }),
    getAllAdminTaskSubmissions: () => request('/admin/tasks/submissions/all', { headers }),
    getVideoAdminTaskSubmissions: (videoId) =>
      request(`/admin/tasks/by-video/${encodeURIComponent(videoId)}/submissions`, { headers }),
    createAdminTask: (body) => request('/admin/tasks', { method: 'POST', body, headers }),
    updateAdminTask: (id, body) => request(`/admin/tasks/${encodeURIComponent(id)}`, { method: 'PUT', body, headers }),
    deleteAdminTask: (id) => request(`/admin/tasks/${encodeURIComponent(id)}`, { method: 'DELETE', headers }),
    getAdminTaskSubmissions: (id) => request(`/admin/tasks/${encodeURIComponent(id)}/submissions`, { headers }),
    reviewAdminTaskSubmission: (submissionId, body) =>
      request(`/admin/tasks/submissions/${encodeURIComponent(submissionId)}/review`, {
        method: 'PUT',
        body,
        headers,
      }),
    uploadAdminTaskAttachment: (file, onProgress) => {
      const fd = new FormData();
      fd.append('file', file);
      return uploadWithProgress('/admin/tasks/upload-attachment', fd, { headers, onProgress });
    },
  };
};

