import { useEffect, useState } from 'react';
import Icon from './Icon.jsx';
import UserTaskModal from './UserTaskModal.jsx';
import { api } from '../lib/api.js';
import { useLanguage } from '../i18n/LanguageContext.jsx';

export default function UserTasksSection({ user }) {
  const { lang } = useLanguage();
  const isMr = lang === 'mr';
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'submitted' | 'reviewed' | 'needs_revision'
  const [activeTask, setActiveTask] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await api.getMyTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Failed to load user tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user?.id]);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'submitted') return t.status === 'submitted';
    if (filter === 'reviewed') return t.status === 'reviewed';
    if (filter === 'needs_revision') return t.status === 'needs_revision';
    return true;
  });

  const handleTaskUpdated = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.taskId === updatedTask.taskId || t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
    );
  };

  return (
    <div className="space-y-5">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-[#0F172A] flex items-center gap-2">
            <Icon name="assignment" className="text-[#2563EB]" />
            {isMr ? 'माझे उपक्रम आणि असाइनमेंट्स' : 'My Tasks & Assignments'}
          </h2>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'all', label: isMr ? `सर्व (${tasks.length})` : `All (${tasks.length})` },
            { id: 'pending', label: isMr ? `प्रलंबित (${tasks.filter((t) => t.status === 'pending').length})` : `Pending (${tasks.filter((t) => t.status === 'pending').length})` },
            { id: 'submitted', label: isMr ? `सबमिट केले (${tasks.filter((t) => t.status === 'submitted').length})` : `Submitted (${tasks.filter((t) => t.status === 'submitted').length})` },
            { id: 'reviewed', label: isMr ? `तपासलेले (${tasks.filter((t) => t.status === 'reviewed').length})` : `Reviewed (${tasks.filter((t) => t.status === 'reviewed').length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${filter === tab.id
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-[#475569] hover:bg-slate-50 hover:text-[#0F172A]'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards Grid */}
      {loading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <Icon name="sync" className="animate-spin text-3xl text-[#2563EB] mx-auto" />
          <p className="text-xs font-bold text-[#475569]">
            {isMr ? 'आपले सोपवलेले उपक्रम लोड होत आहेत...' : 'Loading your assigned tasks...'}
          </p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 space-y-3">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] flex items-center justify-center mx-auto">
            <Icon name="assignment_turned_in" className="text-3xl" />
          </div>
          <h3 className="font-extrabold text-[#0F172A] text-base">
            {isMr ? 'कोणतेही उपक्रम सापडले नाहीत' : 'No tasks found'}
          </h3>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => {
            const isPending = task.status === 'pending';
            const isNeedsRevision = task.status === 'needs_revision';
            const isSystemApproved =
              task.status === 'APPROVED' ||
              task.status === 'VERIFIED' ||
              task.status === 'approved' ||
              task.status === 'verified' ||
              task.verifiedBy === 'SYSTEM_AUTO_VERIFY';
            const isReviewed = task.status === 'reviewed' || isSystemApproved;

            return (
              <div
                key={task.taskId || task.assignmentId || task.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-300 hover:shadow-md transition"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 border border-slate-200 text-slate-600 truncate">
                      {task.courseSlug || (isMr ? 'व्हिडिओ उपक्रम' : 'Course Video Task')}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 ${isReviewed
                        ? 'bg-emerald-50 text-[#0D9488] border border-emerald-200'
                        : isNeedsRevision
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : isPending
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-blue-50 text-[#2563EB] border border-blue-200'
                        }`}
                    >
                      {task.status === 'needs_revision'
                        ? (isMr ? 'पुनरावृत्ती आवश्यक' : 'Needs Revision')
                        : isSystemApproved
                          ? 'System Verified ✓'
                          : task.status === 'submitted'
                            ? (isMr ? 'सबमिट केले' : 'Submitted')
                            : task.status === 'reviewed'
                              ? (isMr ? 'तपासलेले' : 'Reviewed')
                              : (isMr ? 'प्रलंबित' : 'Pending')}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm sm:text-base text-[#0F172A] line-clamp-2">
                    {task.title}
                  </h3>

                  {task.videoTitle && (
                    <div className="flex items-center gap-1.5 text-xs text-[#475569] font-medium">
                      <Icon name="smart_display" className="text-sm text-[#2563EB] shrink-0" />
                      <span className="truncate">
                        {isMr ? 'संबंधित व्हिडिओ: ' : 'Related Video: '}
                        <strong className="text-[#0F172A]">{task.videoTitle}</strong>
                      </span>
                    </div>
                  )}

                  {task.description && (
                    <p className="text-xs text-[#475569] line-clamp-2 leading-relaxed">
                      {task.description}
                    </p>
                  )}

                  {task.adminFeedback && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                      <strong className="text-amber-800">{isMr ? 'मार्गदर्शकांचा अभिप्राय:' : 'Instructor Feedback:'}</strong> {task.adminFeedback}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[11px] text-slate-500">
                    {task.dueDate ? (
                      <span>
                        {isMr ? 'मुदत: ' : 'Due: '}
                        {new Date(task.dueDate).toLocaleDateString(isMr ? 'mr-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    ) : (
                      <span className="italic">{isMr ? 'मुदत नाही' : 'No due date'}</span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTask(task)}
                    className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center gap-1 transition shadow-xs cursor-pointer"
                  >
                    <span>{isMr ? 'उपक्रम पहा' : 'View Task'}</span>
                    <Icon name="arrow_forward" className="text-xs" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Submission Modal */}
      {activeTask && (
        <UserTaskModal
          task={activeTask}
          onClose={() => setActiveTask(null)}
          onSuccess={handleTaskUpdated}
        />
      )}
    </div>
  );
}

