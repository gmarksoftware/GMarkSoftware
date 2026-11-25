import { useEffect, useMemo, useState } from 'react';
import Icon from '../../components/Icon.jsx';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
const PASSWORD_MSG =
  'Password must be at least 8 characters and include uppercase (A-Z), lowercase (a-z), a number (0-9), and a special character (e.g. @, #, $).';

function getPasswordChecks(pw = '') {
  return [
    { key: 'length', label: 'At least 8 characters', ok: pw.length >= 8 },
    { key: 'lower', label: 'One lowercase letter (a-z)', ok: /[a-z]/.test(pw) },
    { key: 'upper', label: 'One uppercase letter (A-Z)', ok: /[A-Z]/.test(pw) },
    { key: 'digit', label: 'One number (0-9)', ok: /\d/.test(pw) },
    { key: 'special', label: 'One special character (@, #, !, ...)', ok: /[^a-zA-Z0-9]/.test(pw) },
  ];
}

function PasswordRequirements({ password }) {
  const checks = getPasswordChecks(password);
  return (
    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
      {checks.map((c) => (
        <div
          key={c.key}
          className={`flex items-center gap-1.5 text-[11px] font-semibold ${
            c.ok ? 'text-emerald-700' : 'text-[#475569]'
          }`}
        >
          <Icon
            name={c.ok ? 'check_circle' : 'radio_button_unchecked'}
            className={`text-xs ${c.ok ? 'text-emerald-600' : 'text-slate-400'}`}
          />
          <span>{c.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminManagementPanel({ api }) {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState({ text: '', type: 'success' });

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [assigningAdmin, setAssigningAdmin] = useState(null);
  const [deletingAdmin, setDeletingAdmin] = useState(null);

  // Assignable resources from backend
  const [resources, setResources] = useState([]);
  const [playlistResources, setPlaylistResources] = useState([]);
  const [loadingResources, setLoadingResources] = useState(false);

  // New admin form state
  const [newAdminForm, setNewAdminForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [selectedNewAssignments, setSelectedNewAssignments] = useState([]);
  const [selectedNewPlaylistIds, setSelectedNewPlaylistIds] = useState([]);
  const [submittingAdd, setSubmittingAdd] = useState(false);

  // Edit / Assign modal state
  const [editAdminForm, setEditAdminForm] = useState({
    fullName: '',
    phone: '',
    password: '',
  });
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [currentAssignments, setCurrentAssignments] = useState([]);
  const [currentPlaylistIds, setCurrentPlaylistIds] = useState([]);
  const [savingAssignments, setSavingAssignments] = useState(false);

  const showToast = (text, type = 'success') => {
    setNotice({ text, type });
    setTimeout(() => setNotice({ text: '', type: 'success' }), 4000);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getSubAdmins();
      setAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load sub-admins:', err);
      showToast(err?.message || 'Failed to load sub-admins', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadResources = async () => {
    if (resources.length > 0 || playlistResources.length > 0) return;
    setLoadingResources(true);
    try {
      const res = await api.getAssignableResources();
      if (Array.isArray(res)) {
        setResources(res);
        setPlaylistResources([]);
      } else {
        setResources(Array.isArray(res?.courses) ? res.courses : []);
        setPlaylistResources(Array.isArray(res?.playlists) ? res.playlists : []);
      }
    } catch (err) {
      console.error('Failed to load assignable resources:', err);
    } finally {
      setLoadingResources(false);
    }
  };

  useEffect(() => {
    loadData();
    loadResources();
  }, []);

  // Filtered admins
  const filteredAdmins = useMemo(() => {
    const q = search.trim().toLowerCase();
    return admins.filter((adm) => {
      if (!q) return true;
      return (
        adm.fullName?.toLowerCase().includes(q) ||
        adm.email?.toLowerCase().includes(q) ||
        adm.phone?.includes(q)
      );
    });
  }, [admins, search]);

  // Overall KPI stats
  const totalSubAdmins = admins.filter((a) => a.role === 'admin').length;
  const activeSubAdmins = admins.filter((a) => a.role === 'admin' && a.isActive !== false).length;
  const totalAssignmentsCount = admins.reduce((acc, a) => acc + (a.assignedVideosCount || 0), 0);

  // Permanently delete Sub-Admin
  const handleDeleteConfirm = async () => {
    if (!deletingAdmin) return;
    try {
      await api.deleteSubAdmin(deletingAdmin.id, true);
      showToast(`Sub-Admin "${deletingAdmin.fullName}" permanently deleted.`);
      setAdmins((prev) => prev.filter((a) => a.id !== deletingAdmin.id));
      setDeletingAdmin(null);
    } catch (err) {
      showToast(err?.message || 'Failed to delete sub-admin', 'error');
    }
  };

  // Open Edit / Assign Modal
  const handleOpenAssignModal = (admin) => {
    setAssigningAdmin(admin);
    setEditAdminForm({
      fullName: admin.fullName || '',
      phone: admin.phone || '',
      password: '',
    });
    setShowEditPassword(false);

    const rawAssignments = admin.assignments || [];
    const courseAndVideoItems = rawAssignments
      .filter((a) => !(a.playlistId && (!a.videoId || a.videoId === 'ALL')))
      .map((a) => ({
        courseSlug: a.courseSlug,
        courseId: a.courseId || '',
        playlistId: a.playlistId || '',
        videoId: a.videoId || 'ALL',
        videoTitle: a.videoTitle || '',
      }));
    setCurrentAssignments(courseAndVideoItems);

    const derivedPlaylistIds = Array.isArray(admin.assignedPlaylistIds)
      ? admin.assignedPlaylistIds
      : Array.from(
          new Set(
            rawAssignments
              .filter((a) => a.playlistId && (!a.videoId || a.videoId === 'ALL'))
              .map((a) => a.playlistId),
          ),
        );
    setCurrentPlaylistIds(derivedPlaylistIds);
    loadResources();
  };

  // Save Sub-Admin details + course/video & playlist assignments
  const handleSaveAssignments = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!assigningAdmin) return;

    if (!editAdminForm.fullName.trim()) {
      showToast('Full Name is required.', 'error');
      return;
    }
    if (editAdminForm.password && !PASSWORD_REGEX.test(editAdminForm.password)) {
      showToast(PASSWORD_MSG, 'error');
      return;
    }

    setSavingAssignments(true);
    try {
      await api.updateSubAdmin(assigningAdmin.id, {
        fullName: editAdminForm.fullName.trim(),
        phone: editAdminForm.phone.trim(),
        ...(editAdminForm.password ? { password: editAdminForm.password } : {}),
        assignments: currentAssignments,
        assignedPlaylistIds: currentPlaylistIds,
      });
      showToast(`Updated ${editAdminForm.fullName.trim()} and saved ${currentAssignments.length + currentPlaylistIds.length} resource assignment(s).`);
      setAssigningAdmin(null);
      await loadData();
    } catch (err) {
      showToast(err?.message || 'Failed to update sub-admin', 'error');
    } finally {
      setSavingAssignments(false);
    }
  };

  // Handle Add New Sub-Admin submit
  const handleCreateSubAdmin = async (e) => {
    e.preventDefault();
    if (!newAdminForm.fullName.trim() || !newAdminForm.email.trim() || !newAdminForm.password) {
      showToast('Full Name, Email, and Password are required.', 'error');
      return;
    }
    if (!PASSWORD_REGEX.test(newAdminForm.password)) {
      showToast(PASSWORD_MSG, 'error');
      return;
    }

    setSubmittingAdd(true);
    try {
      await api.createSubAdmin({
        fullName: newAdminForm.fullName.trim(),
        email: newAdminForm.email.trim(),
        password: newAdminForm.password,
        phone: newAdminForm.phone.trim() || undefined,
        assignments: selectedNewAssignments,
        assignedPlaylistIds: selectedNewPlaylistIds,
      });

      showToast(`Sub-Admin "${newAdminForm.fullName}" created successfully!`);
      setShowAddModal(false);
      setNewAdminForm({ fullName: '', email: '', password: '', phone: '' });
      setShowNewPassword(false);
      setSelectedNewAssignments([]);
      setSelectedNewPlaylistIds([]);
      await loadData();
    } catch (err) {
      showToast(err?.message || 'Failed to create sub-admin', 'error');
    } finally {
      setSubmittingAdd(false);
    }
  };

  const togglePlaylistInList = (list, setList, playlistId) => {
    if (!playlistId) return;
    if (list.includes(playlistId)) {
      setList(list.filter((id) => id !== playlistId));
    } else {
      setList([...list, playlistId]);
    }
  };

  // Helper to toggle an assignment item
  const toggleAssignmentInList = (list, setList, item) => {
    const isFullCourse = item.videoId === 'ALL';
    const isSelected = list.some(
      (a) =>
        a.courseSlug.toLowerCase() === item.courseSlug.toLowerCase() &&
        a.videoId === item.videoId &&
        (isFullCourse || a.playlistId === item.playlistId),
    );

    if (isSelected) {
      // Remove item
      setList(
        list.filter(
          (a) =>
            !(
              a.courseSlug.toLowerCase() === item.courseSlug.toLowerCase() &&
              a.videoId === item.videoId &&
              (isFullCourse || a.playlistId === item.playlistId)
            ),
        ),
      );
    } else {
      // Add item
      setList([...list, item]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notice.text && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-between shadow-sm animate-in fade-in duration-200 ${
            notice.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Icon name={notice.type === 'error' ? 'error_outline' : 'check_circle'} className="text-lg" />
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice({ text: '', type: 'success' })} className="text-current opacity-70 hover:opacity-100">
            <Icon name="close" className="text-sm" />
          </button>
        </div>
      )}

      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shadow-xs">
              <Icon name="admin_panel_settings" className="text-2xl text-amber-700" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0F172A]">
                Sub-Admin & Instructor Management
              </h1>
              <p className="text-xs sm:text-sm text-[#475569] font-medium mt-0.5">
                Role-based access control — assign specific courses and videos to Sub-Admins.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddModal(true);
            setShowNewPassword(false);
            loadResources();
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-black text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Icon name="person_add" className="text-base text-white" />
          <span>Add New Sub-Admin</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
            <Icon name="group" className="text-sm text-[#0F172A]" />
            Total Admins
          </div>
          <div className="text-2xl font-black text-[#0F172A] mt-1.5">{admins.length}</div>
          <div className="text-[10px] text-[#475569] font-semibold mt-0.5">
            {admins.filter((a) => a.role === 'super_admin').length} Super Admin(s) · {totalSubAdmins} Sub-Admin(s)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
            <Icon name="verified_user" className="text-sm text-emerald-600" />
            Active Sub-Admins
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-1.5">{activeSubAdmins}</div>
          <div className="text-[10px] text-[#475569] font-semibold mt-0.5">
            {totalSubAdmins} instructor account(s)
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#475569] flex items-center gap-1.5">
            <Icon name="ondemand_video" className="text-sm text-[#2563EB]" />
            Assigned Resources
          </div>
          <div className="text-2xl font-black text-[#2563EB] mt-1.5">{totalAssignmentsCount}</div>
          <div className="text-[10px] text-[#475569] font-semibold mt-0.5">
            Courses, playlists &amp; video scopes delegated
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#475569] text-base" />
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:bg-white transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-gray-600">
              <Icon name="close" className="text-xs" />
            </button>
          )}
        </div>

        <div className="text-xs font-bold text-[#475569]">
          Showing <span className="font-black text-[#0F172A]">{filteredAdmins.length}</span> of {admins.length} administrator(s)
        </div>
      </div>

      {/* Admins Table / Directory */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-[#0F172A] flex flex-col items-center justify-center gap-2">
            <Icon name="sync" className="animate-spin text-3xl" />
            <span className="text-xs font-bold text-[#475569]">Loading administrators...</span>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="py-16 text-center text-[#475569]">
            <Icon name="admin_panel_settings" className="text-4xl text-[#475569] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#0F172A]">No administrators match your criteria</p>
            <p className="text-xs text-[#475569] mt-1">Try adjusting the search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-[#475569] uppercase tracking-wider">
                  <th className="py-3.5 px-4 sm:px-6">Administrator</th>
                  <th className="py-3.5 px-4">Role & Status</th>
                  <th className="py-3.5 px-4">Assigned Video Scope</th>
                  <th className="py-3.5 px-4 text-center">Learners Reached</th>
                  <th className="py-3.5 px-4 text-right sm:pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs font-semibold">
                {filteredAdmins.map((admin) => {
                  const isSuper = admin.role === 'super_admin';
                  const isActive = admin.isActive !== false;

                  return (
                    <tr key={admin.id} className="hover:bg-white transition-colors">
                      {/* Name & Contact */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-black shrink-0 ${
                              isSuper
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {admin.fullName?.charAt(0)?.toUpperCase() || 'A'}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-black text-[#0F172A] truncate flex items-center gap-1.5">
                              <span>{admin.fullName}</span>
                              {isSuper && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[9px] font-black border border-amber-200">
                                  <Icon name="verified" className="text-[10px]" /> Super
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#475569] font-medium truncate">{admin.email}</div>
                            {admin.phone && (
                              <div className="text-[10px] text-[#475569] font-medium">{admin.phone}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Role & Status */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div>
                            {isSuper ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                                <Icon name="shield" className="text-[11px]" /> Super Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Icon name="person" className="text-[11px]" /> Sub-Admin
                              </span>
                            )}
                          </div>
                          <div>
                            {isActive ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-red-50 text-red-700">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600" /> Suspended
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Assigned Video Scope */}
                      <td className="py-4 px-4">
                        {isSuper ? (
                          <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold">
                            <Icon name="all_inclusive" className="text-sm" />
                            <span>Unrestricted Full Platform</span>
                          </div>
                        ) : admin.assignments && admin.assignments.length > 0 ? (
                          <div className="space-y-1 max-w-xs">
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 font-black text-[10px]">
                                {admin.assignments.length} assigned item(s)
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {admin.assignments.slice(0, 3).map((asg, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-[#0F172A] truncate max-w-[150px]"
                                  title={`${asg.courseSlug} / ${asg.videoTitle || asg.videoId}`}
                                >
                                  {asg.videoTitle || (asg.videoId === 'ALL' ? `${asg.courseSlug} (All)` : asg.videoId)}
                                </span>
                              ))}
                              {admin.assignments.length > 3 && (
                                <span className="text-[10px] font-bold text-[#475569] self-center">
                                  +{admin.assignments.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-amber-600 font-bold flex items-center gap-1">
                            <Icon name="warning" className="text-xs" /> No videos assigned yet
                          </span>
                        )}
                      </td>

                      {/* Learners Reached */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-50 text-[#0F172A] font-black text-xs border border-slate-200">
                          <Icon name="school" className="text-xs text-[#475569]" />
                          {admin.learnersCount}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right sm:pr-6">
                        <div className="inline-flex items-center gap-2">
                          {!isSuper && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenAssignModal(admin)}
                                className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                title="Edit sub-admin details or assign courses, playlists, and videos"
                              >
                                <Icon name="edit" className="text-sm" />
                                <span>Edit / Assign</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeletingAdmin(admin)}
                                className="p-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white text-xs font-bold transition cursor-pointer"
                                title="Delete Sub-Admin"
                              >
                                <Icon name="delete" className="text-base" />
                              </button>
                            </>
                          )}
                          {isSuper && (
                            <span className="text-[11px] text-[#475569] font-bold italic pr-2">Primary Super Admin</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL 1: ADD NEW SUB-ADMIN ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0F172A] flex items-center justify-center font-black">
                  <Icon name="person_add" className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0F172A]">Add New Sub-Admin / Instructor</h3>
                  <p className="text-xs text-[#475569] font-medium">
                    Create credentials and immediately assign specific courses and videos.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#475569] transition"
              >
                <Icon name="close" className="text-sm" />
              </button>
            </div>

            <form onSubmit={handleCreateSubAdmin} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#0F172A] mb-1">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patil"
                    value={newAdminForm.fullName}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#0F172A] mb-1">
                    Email Address <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="subadmin@gmarksoftware.com"
                    value={newAdminForm.email}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-[#0F172A] mb-1">
                    Temporary Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      placeholder="e.g. Instructor@123"
                      value={newAdminForm.password}
                      onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                      className="w-full pl-3.5 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#0F172A] cursor-pointer"
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      <Icon name={showNewPassword ? 'visibility_off' : 'visibility'} className="text-lg" />
                    </button>
                  </div>
                  <PasswordRequirements password={newAdminForm.password} />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-[#0F172A] mb-1">
                    Phone / Mobile <span className="text-[#475569] font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={newAdminForm.phone}
                    onChange={(e) => setNewAdminForm({ ...newAdminForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                  />
                </div>
              </div>

              {/* Playlist Assignment Checklist */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold text-[#0F172A] flex items-center gap-1.5">
                    <Icon name="playlist_play" className="text-sm text-[#0D9488]" />
                    <span>Playlist Assignment</span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[10px]">
                      {selectedNewPlaylistIds.length} selected
                    </span>
                  </label>
                  {selectedNewPlaylistIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedNewPlaylistIds([])}
                      className="text-[11px] font-bold text-red-600 hover:underline"
                    >
                      Clear Playlists
                    </button>
                  )}
                </div>

                <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/60 max-h-44 overflow-y-auto space-y-1.5">
                  {loadingResources ? (
                    <div className="py-4 text-center text-xs font-bold text-[#475569]">Loading playlists...</div>
                  ) : playlistResources.length === 0 ? (
                    <div className="py-4 text-center text-xs font-bold text-[#475569]">No playlists available yet.</div>
                  ) : (
                    playlistResources.map((pl) => {
                      const plId = pl.playlistId || pl.id;
                      const checked = selectedNewPlaylistIds.includes(plId);
                      return (
                        <label
                          key={plId}
                          className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 cursor-pointer hover:border-[#2563EB]/40 transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePlaylistInList(selectedNewPlaylistIds, setSelectedNewPlaylistIds, plId)}
                              className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[#0F172A] truncate">{pl.title}</div>
                              <div className="text-[10px] text-[#475569] truncate">
                                Course: {pl.courseSlug || 'General'} · {pl.videoCount ?? pl.videos?.length ?? 0} video(s)
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 shrink-0">
                            Full Playlist
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Immediate Resource Assignment Picker */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-extrabold text-[#0F172A] flex items-center gap-1.5">
                    <Icon name="ondemand_video" className="text-sm text-[#0F172A]" />
                    <span>Assign Video Resources</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0F172A] text-[10px]">
                      {selectedNewAssignments.length} selected
                    </span>
                  </label>
                  {selectedNewAssignments.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedNewAssignments([])}
                      className="text-[11px] font-bold text-red-600 hover:underline"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="border border-slate-200 rounded-2xl p-3 bg-white max-h-60 overflow-y-auto space-y-3">
                  {loadingResources ? (
                    <div className="py-6 text-center text-xs font-bold text-[#475569]">Loading courses...</div>
                  ) : resources.length === 0 ? (
                    <div className="py-6 text-center text-xs font-bold text-[#475569]">No courses or videos found.</div>
                  ) : (
                    resources.map((c) => {
                      const isFullCourse = selectedNewAssignments.some(
                        (a) => a.courseSlug.toLowerCase() === c.courseSlug.toLowerCase() && a.videoId === 'ALL',
                      );

                      return (
                        <div key={c.courseId || c.courseSlug} className="bg-white rounded-xl p-3 border border-slate-200">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isFullCourse}
                                onChange={() =>
                                  toggleAssignmentInList(selectedNewAssignments, setSelectedNewAssignments, {
                                    courseSlug: c.courseSlug,
                                    courseId: c.courseId,
                                    videoId: 'ALL',
                                    videoTitle: `Full Course: ${c.courseTitle}`,
                                  })
                                }
                                className="w-4 h-4 rounded text-[#0F172A] focus:ring-[#2563EB]"
                              />
                              <span className="text-xs font-black text-[#0F172A]">{c.courseTitle}</span>
                            </label>
                            <span className="text-[10px] font-bold text-[#475569] uppercase tracking-wider">
                              Full Course
                            </span>
                          </div>

                          {/* Individual Playlists & Videos */}
                          <div className="pt-2 pl-4 space-y-2">
                            {(c.playlists || []).map((pl) => (
                              <div key={pl.playlistId} className="space-y-1">
                                <div className="text-[11px] font-extrabold text-[#0F172A] flex items-center gap-1">
                                  <Icon name="playlist_play" className="text-xs text-emerald-600" />
                                  <span>{pl.playlistTitle}</span>
                                </div>
                                <div className="pl-3 space-y-1">
                                  {(pl.videos || []).map((vid) => {
                                    const isVidSelected =
                                      isFullCourse ||
                                      selectedNewAssignments.some(
                                        (a) =>
                                          a.courseSlug.toLowerCase() === c.courseSlug.toLowerCase() &&
                                          a.videoId === vid.videoId,
                                      );

                                    return (
                                      <label
                                        key={vid.videoId}
                                        className="flex items-center justify-between text-xs text-[#475569] hover:text-[#0F172A] cursor-pointer py-0.5"
                                      >
                                        <div className="flex items-center gap-2 truncate">
                                          <input
                                            type="checkbox"
                                            disabled={isFullCourse}
                                            checked={isVidSelected}
                                            onChange={() =>
                                              toggleAssignmentInList(
                                                selectedNewAssignments,
                                                setSelectedNewAssignments,
                                                {
                                                  courseSlug: c.courseSlug,
                                                  courseId: c.courseId,
                                                  playlistId: pl.playlistId,
                                                  videoId: vid.videoId,
                                                  videoTitle: vid.videoTitle,
                                                },
                                              )
                                            }
                                            className="w-3.5 h-3.5 rounded text-[#0F172A] focus:ring-[#2563EB]"
                                          />
                                          <span className="truncate">{vid.videoTitle}</span>
                                        </div>
                                        {vid.duration && (
                                          <span className="text-[10px] text-[#475569] shrink-0 font-mono ml-2">
                                            {vid.duration}
                                          </span>
                                        )}
                                      </label>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#475569] hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAdd}
                  className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black shadow-sm transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {submittingAdd && <Icon name="sync" className="animate-spin text-sm" />}
                  <span>{submittingAdd ? 'Creating Sub-Admin...' : 'Create Sub-Admin'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: EDIT SUB-ADMIN & ASSIGN RESOURCES MODAL ── */}
      {assigningAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 space-y-5 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black">
                  <Icon name="manage_accounts" className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#0F172A]">
                    Edit &amp; Assign: {assigningAdmin.fullName}
                  </h3>
                  <p className="text-xs text-[#475569] font-medium">
                    {assigningAdmin.email} · Update profile, password, playlists, courses, or videos
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAssigningAdmin(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#475569] transition"
              >
                <Icon name="close" className="text-sm" />
              </button>
            </div>

            <form onSubmit={handleSaveAssignments} className="space-y-5">
              {/* Account Profile & Optional Password Reset */}
              <div className="grid sm:grid-cols-2 gap-3.5 bg-slate-50/70 border border-slate-200 rounded-2xl p-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#0F172A] mb-1">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editAdminForm.fullName}
                    onChange={(e) => setEditAdminForm({ ...editAdminForm, fullName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#0F172A] mb-1">
                    Phone / Mobile
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={editAdminForm.phone}
                    onChange={(e) => setEditAdminForm({ ...editAdminForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-extrabold text-[#0F172A] mb-1">
                    New Password <span className="text-[#475569] font-normal">(Leave blank to keep current password)</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      placeholder="Enter new strong password to reset"
                      value={editAdminForm.password}
                      onChange={(e) => setEditAdminForm({ ...editAdminForm, password: e.target.value })}
                      className="w-full pl-3.5 pr-11 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#475569] hover:text-[#0F172A] cursor-pointer"
                      aria-label={showEditPassword ? 'Hide password' : 'Show password'}
                    >
                      <Icon name={showEditPassword ? 'visibility_off' : 'visibility'} className="text-lg" />
                    </button>
                  </div>
                  {editAdminForm.password.length > 0 && (
                    <PasswordRequirements password={editAdminForm.password} />
                  )}
                </div>
              </div>

              {/* Playlist Assignment Checklist */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-extrabold text-[#0F172A] flex items-center gap-1.5">
                    <Icon name="playlist_play" className="text-sm text-[#0D9488]" />
                    <span>Playlist Assignment</span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 text-[10px]">
                      {currentPlaylistIds.length} playlist(s)
                    </span>
                  </div>
                  {currentPlaylistIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCurrentPlaylistIds([])}
                      className="text-xs font-bold text-red-600 hover:underline"
                    >
                      Clear Playlists
                    </button>
                  )}
                </div>

                <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/60 max-h-44 overflow-y-auto space-y-1.5">
                  {loadingResources ? (
                    <div className="py-4 text-center text-xs font-bold text-[#475569]">Loading playlists...</div>
                  ) : playlistResources.length === 0 ? (
                    <div className="py-4 text-center text-xs font-bold text-[#475569]">No playlists available.</div>
                  ) : (
                    playlistResources.map((pl) => {
                      const plId = pl.playlistId || pl.id;
                      const checked = currentPlaylistIds.includes(plId);
                      return (
                        <label
                          key={plId}
                          className="flex items-center justify-between gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 cursor-pointer hover:border-[#2563EB]/40 transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => togglePlaylistInList(currentPlaylistIds, setCurrentPlaylistIds, plId)}
                              className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-bold text-[#0F172A] truncate">{pl.title}</div>
                              <div className="text-[10px] text-[#475569] truncate">
                                Course: {pl.courseSlug || 'General'} · {pl.videoCount ?? pl.videos?.length ?? 0} video(s)
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 shrink-0">
                            Full Playlist
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-[#475569]">
                  Course / Video Assignments: <span className="font-black text-[#0F172A]">{currentAssignments.length}</span> item(s)
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentAssignments([])}
                    className="text-xs font-bold text-red-600 hover:underline"
                  >
                    Clear Course / Video Scopes
                  </button>
                </div>
              </div>

            <div className="border border-slate-200 rounded-2xl p-3 bg-white max-h-96 overflow-y-auto space-y-3">
              {loadingResources ? (
                <div className="py-10 text-center text-xs font-bold text-[#475569]">Loading resources...</div>
              ) : resources.length === 0 ? (
                <div className="py-10 text-center text-xs font-bold text-[#475569]">No courses or videos available.</div>
              ) : (
                resources.map((c) => {
                  const isFullCourse = currentAssignments.some(
                    (a) => a.courseSlug.toLowerCase() === c.courseSlug.toLowerCase() && a.videoId === 'ALL',
                  );

                  return (
                    <div key={c.courseId || c.courseSlug} className="bg-white rounded-xl p-3.5 border border-slate-200">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isFullCourse}
                            onChange={() =>
                              toggleAssignmentInList(currentAssignments, setCurrentAssignments, {
                                courseSlug: c.courseSlug,
                                courseId: c.courseId,
                                videoId: 'ALL',
                                videoTitle: `Full Course: ${c.courseTitle}`,
                              })
                            }
                            className="w-4 h-4 rounded text-[#0F172A] focus:ring-[#2563EB]"
                          />
                          <span className="text-xs sm:text-sm font-black text-[#0F172A]">{c.courseTitle}</span>
                        </label>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          All Videos in Course
                        </span>
                      </div>

                      {/* Course Playlists and Videos */}
                      <div className="pt-2 pl-4 space-y-2">
                        {(c.playlists || []).map((pl) => (
                          <div key={pl.playlistId} className="space-y-1">
                            <div className="text-[11px] font-extrabold text-[#0F172A] flex items-center gap-1">
                              <Icon name="playlist_play" className="text-xs text-emerald-600" />
                              <span>{pl.playlistTitle}</span>
                            </div>
                            <div className="pl-3 space-y-1">
                              {(pl.videos || []).map((vid) => {
                                const isVidSelected =
                                  isFullCourse ||
                                  currentAssignments.some(
                                    (a) =>
                                      a.courseSlug.toLowerCase() === c.courseSlug.toLowerCase() &&
                                      a.videoId === vid.videoId,
                                  );

                                return (
                                  <label
                                    key={vid.videoId}
                                    className="flex items-center justify-between text-xs text-[#475569] hover:text-[#0F172A] cursor-pointer py-1 px-1 rounded-lg hover:bg-white"
                                  >
                                    <div className="flex items-center gap-2 truncate">
                                      <input
                                        type="checkbox"
                                        disabled={isFullCourse}
                                        checked={isVidSelected}
                                        onChange={() =>
                                          toggleAssignmentInList(currentAssignments, setCurrentAssignments, {
                                            courseSlug: c.courseSlug,
                                            courseId: c.courseId,
                                            playlistId: pl.playlistId,
                                            videoId: vid.videoId,
                                            videoTitle: vid.videoTitle,
                                          })
                                        }
                                        className="w-3.5 h-3.5 rounded text-[#0F172A] focus:ring-[#2563EB]"
                                      />
                                      <span className="truncate">{vid.videoTitle}</span>
                                    </div>
                                    {vid.duration && (
                                      <span className="text-[10px] text-[#475569] shrink-0 font-mono ml-2">
                                        {vid.duration}
                                      </span>
                                    )}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setAssigningAdmin(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-[#475569] hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={savingAssignments}
                className="px-6 py-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-black shadow-sm transition disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {savingAssignments && <Icon name="sync" className="animate-spin text-sm" />}
                <span>{savingAssignments ? 'Saving Changes...' : 'Save Changes'}</span>
              </button>
            </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: DELETE CONFIRMATION ── */}
      {deletingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-red-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <Icon name="delete_forever" className="text-2xl" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#0F172A]">
                Delete Sub-Admin?
              </h3>
              <p className="text-xs text-[#475569] mt-1">
                Are you sure you want to permanently delete <strong>{deletingAdmin.fullName}</strong> ({deletingAdmin.email})? All assignments will be removed and this account will be deleted.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingAdmin(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#475569] hover:bg-slate-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-xs transition cursor-pointer"
              >
                Yes, Delete Sub-Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
