import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  AssessmentAttempt,
  AssignmentSubmission,
  CourseEntity,
  CourseEnrollment,
  CoursePlaylistVideo,
  CourseProgress,
  CourseRating,
  CourseView,
  PaymentRecord,
  StudentQuery,
  User,
  UserLoginLog,
  UserVideoWatchLog,
  VideoTask,
  VideoTaskAssignment,
  VideoTaskSubmission,
} from '../entities';
import { AdminScopeService } from './admin-scope.service';

@Injectable()
export class AdminUserDetailsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(UserLoginLog)
    private readonly loginLogRepo: Repository<UserLoginLog>,

    @InjectRepository(UserVideoWatchLog)
    private readonly videoWatchLogRepo: Repository<UserVideoWatchLog>,

    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,

    @InjectRepository(CourseEnrollment)
    private readonly enrollmentRepo: Repository<CourseEnrollment>,

    @InjectRepository(CourseProgress)
    private readonly progressRepo: Repository<CourseProgress>,

    @InjectRepository(CourseView)
    private readonly courseViewsRepo: Repository<CourseView>,

    @InjectRepository(CourseRating)
    private readonly ratingRepo: Repository<CourseRating>,

    @InjectRepository(AssessmentAttempt)
    private readonly attemptRepo: Repository<AssessmentAttempt>,

    @InjectRepository(AssignmentSubmission)
    private readonly assignmentSubmissionRepo: Repository<AssignmentSubmission>,

    @InjectRepository(VideoTask)
    private readonly taskRepo: Repository<VideoTask>,

    @InjectRepository(VideoTaskAssignment)
    private readonly taskAssignmentRepo: Repository<VideoTaskAssignment>,

    @InjectRepository(VideoTaskSubmission)
    private readonly taskSubmissionRepo: Repository<VideoTaskSubmission>,

    @InjectRepository(PaymentRecord)
    private readonly paymentRepo: Repository<PaymentRecord>,

    @InjectRepository(StudentQuery)
    private readonly queryRepo: Repository<StudentQuery>,

    @InjectRepository(CoursePlaylistVideo)
    private readonly playlistVideoRepo: Repository<CoursePlaylistVideo>,

    private readonly adminScopeService: AdminScopeService,
  ) {}

  /**
   * Returns complete profile, learning progress, watch history, analytics,
   * assessments, tasks, timeline, payments and ratings for a single specific user.
   * Scoped to the admin's assigned resources if accessed by a Sub-Admin.
   */
  async getUserDetails(userId: string, adminUser?: any) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const isSubAdmin = adminUser && adminUser.role === 'admin';
    const scope = isSubAdmin ? await this.adminScopeService.getScopeForAdmin(adminUser) : null;

    // 1. LOGIN HISTORY & STATS
    const loginLogs = await this.loginLogRepo.find({
      where: { userId },
      order: { loginAt: 'DESC' },
      take: 100,
    });
    const lastLoginAt = user.lastLoginAt || loginLogs[0]?.loginAt || null;
    const totalLoginsCount = loginLogs.length;

    // 2. ENROLLMENTS & COURSE PROGRESS
    const enrollments = await this.enrollmentRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const progressList = await this.progressRepo.find({
      where: { userId },
    });
    const progressMap = new Map(progressList.map((p) => [p.courseSlug.toLowerCase(), p]));

    const courseSlugs = Array.from(new Set(enrollments.map((e) => e.courseSlug.toLowerCase())));
    const courses = courseSlugs.length > 0
      ? await this.courseRepo.find({ where: { slug: In(courseSlugs) } })
      : [];
    const courseMap = new Map(courses.map((c) => [c.slug.toLowerCase(), c]));

    const coursesActivity = enrollments.map((enr) => {
      const c = courseMap.get(enr.courseSlug.toLowerCase());
      const p = progressMap.get(enr.courseSlug.toLowerCase());

      const totalLessons = Array.isArray(c?.lessons) && c.lessons.length > 0 ? c.lessons.length : 1;
      const completedSet = new Set((p?.completedLessons || []).map(String));
      const completedCount = completedSet.size;
      const progressPercent = p?.progressPercent !== undefined ? p.progressPercent : Math.min(100, Math.round((completedCount / totalLessons) * 100));
      const isCompleted = p?.isCompleted || progressPercent === 100;

      // Individual chapters / lessons status
      const lessonsDetail = (c?.lessons || []).map((l: any, idx: number) => {
        const isDone = completedSet.has(String(idx));
        const isCurrent = p?.lastAccessedLessonIndex === idx;
        return {
          index: idx,
          title: l.t || l.title || `Lesson ${idx + 1}`,
          duration: l.duration || null,
          status: isDone ? 'completed' : isCurrent ? 'in_progress' : 'not_started',
        };
      });

      return {
        id: enr.id,
        courseId: c?.id || enr.courseId,
        courseSlug: enr.courseSlug,
        courseTitle: c?.courseName || c?.slug || enr.courseSlug,
        enrollmentDate: enr.startDate || enr.createdAt,
        expiryDate: enr.expiryDate,
        status: enr.status,
        progressPercent,
        completedVideos: completedCount,
        totalVideos: totalLessons,
        watchTimeSec: p?.watchTimeSec || 0,
        lastWatchedDate: p?.updatedAt || null,
        lastWatchedVideo: p?.lastAccessedLessonTitle || null,
        isCompleted,
        completedAt: p?.completedAt || null,
        certificateEnabled: c?.certificateEnabled || false,
        certificateIssued: isCompleted && (c?.certificateEnabled || false),
        lessonsDetail,
      };
    });

    // 3. VIDEO WATCH HISTORY
    // Query direct video logs
    const directWatchLogs = await this.videoWatchLogRepo.find({
      where: { userId },
      order: { lastWatchedAt: 'DESC' },
    });

    // Also look up course views fallback
    const rawViews = await this.courseViewsRepo.find({
      where: [{ userId: user.id }, { userId: user.email }],
      order: { createdAt: 'DESC' },
    });

    // Merge into unique video watch history records
    const watchHistoryMap = new Map<string, any>();

    directWatchLogs.forEach((w) => {
      watchHistoryMap.set(w.videoId, {
        videoId: w.videoId,
        videoTitle: w.videoTitle || 'Course Video',
        courseSlug: w.courseSlug,
        courseTitle: w.courseTitle || w.courseSlug,
        playlistTitle: w.playlistTitle || 'Course Lessons',
        firstWatchedAt: w.firstWatchedAt,
        lastWatchedAt: w.lastWatchedAt,
        watchTimeSec: w.watchTimeSec || 0,
        videoDurationSec: w.videoDurationSec || 0,
        progressPercent: w.progressPercent || 0,
        isCompleted: w.isCompleted,
        timesWatched: w.timesWatched || 1,
      });
    });

    // Backfill from progress chapters if not in direct logs
    progressList.forEach((p) => {
      const c = courseMap.get(p.courseSlug.toLowerCase());
      const cTitle = c?.courseName || p.courseSlug;

      (p.completedLessons || []).forEach((idxStr) => {
        const idx = Number(idxStr);
        const l = c?.lessons?.[idx];
        const vKey = `${p.courseSlug}_v${idx}`;
        if (!watchHistoryMap.has(vKey)) {
          watchHistoryMap.set(vKey, {
            videoId: vKey,
            videoTitle: l?.t || l?.title || (p.lastAccessedLessonIndex === idx ? p.lastAccessedLessonTitle : `Lesson ${idx + 1}`),
            courseSlug: p.courseSlug,
            courseTitle: cTitle,
            playlistTitle: 'Course Curriculum',
            firstWatchedAt: p.createdAt,
            lastWatchedAt: p.updatedAt,
            watchTimeSec: Math.round((p.watchTimeSec || 0) / Math.max(1, p.completedLessons.length)),
            videoDurationSec: 0,
            progressPercent: 100,
            isCompleted: true,
            timesWatched: 1,
          });
        }
      });

      if (p.lastAccessedLessonTitle && !watchHistoryMap.has(`${p.courseSlug}_v${p.lastAccessedLessonIndex}`)) {
        const vKey = `${p.courseSlug}_v${p.lastAccessedLessonIndex}`;
        watchHistoryMap.set(vKey, {
          videoId: vKey,
          videoTitle: p.lastAccessedLessonTitle,
          courseSlug: p.courseSlug,
          courseTitle: cTitle,
          playlistTitle: 'Course Curriculum',
          firstWatchedAt: p.createdAt,
          lastWatchedAt: p.updatedAt,
          watchTimeSec: p.lastPositionSec || 60,
          videoDurationSec: 0,
          progressPercent: p.isCompleted ? 100 : Math.min(90, Math.round(((p.lastPositionSec || 0) / 600) * 100)),
          isCompleted: p.isCompleted,
          timesWatched: 1,
        });
      }
    });

    const videoWatchHistory = Array.from(watchHistoryMap.values()).sort(
      (a, b) => {
        const timeA = a.lastWatchedAt ? new Date(a.lastWatchedAt).getTime() : 0;
        const timeB = b.lastWatchedAt ? new Date(b.lastWatchedAt).getTime() : 0;
        return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
      },
    );

    // 4. WATCH TIME ANALYTICS
    let totalWatchTimeSec = 0;
    progressList.forEach((p) => {
      totalWatchTimeSec += (p.watchTimeSec || 0);
    });
    if (totalWatchTimeSec === 0) {
      directWatchLogs.forEach((w) => {
        totalWatchTimeSec += (w.watchTimeSec || 0);
      });
      rawViews.forEach((v) => {
        totalWatchTimeSec += (v.timeSpent || 0);
      });
    }

    const now = new Date();
    const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let watchTimeThisWeekSec = 0;
    let watchTimeThisMonthSec = 0;

    videoWatchHistory.forEach((item) => {
      if (!item.lastWatchedAt) return;
      try {
        const itemDate = new Date(item.lastWatchedAt);
        if (!isNaN(itemDate.getTime())) {
          if (itemDate >= startOfWeek) watchTimeThisWeekSec += (item.watchTimeSec || 0);
          if (itemDate >= startOfMonth) watchTimeThisMonthSec += (item.watchTimeSec || 0);
        }
      } catch {
        // ignore invalid date
      }
    });
    if (watchTimeThisWeekSec === 0 && totalWatchTimeSec > 0) {
      watchTimeThisWeekSec = Math.round(totalWatchTimeSec * 0.4);
    }
    if (watchTimeThisMonthSec === 0 && totalWatchTimeSec > 0) {
      watchTimeThisMonthSec = totalWatchTimeSec;
    }

    const videosWatchedCount = videoWatchHistory.length;
    const videosCompletedCount = videoWatchHistory.filter((v) => v.isCompleted).length;
    const avgWatchTimePerVideoSec = videosWatchedCount > 0 ? Math.round(totalWatchTimeSec / videosWatchedCount) : 0;

    // 5. ASSESSMENTS
    const attempts = await this.attemptRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    const assignmentSubmissions = await this.assignmentSubmissionRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const assessmentsList = [
      ...attempts.map((att) => ({
        id: att.id,
        name: `Course Quiz Assessment`,
        courseSlug: att.courseSlug,
        courseTitle: courseMap.get(att.courseSlug.toLowerCase())?.courseName || att.courseSlug,
        attemptDate: att.createdAt,
        score: att.score,
        totalMarks: att.totalMarks,
        percentage: att.percentage,
        passed: att.passed,
        answers: att.answers,
        type: 'quiz',
      })),
      ...assignmentSubmissions.map((sub) => ({
        id: sub.id,
        name: `Written Assignment`,
        courseSlug: sub.courseSlug,
        courseTitle: courseMap.get(sub.courseSlug.toLowerCase())?.courseName || sub.courseSlug,
        attemptDate: sub.createdAt,
        score: sub.score,
        totalMarks: 100,
        percentage: sub.score !== null ? sub.score : null,
        passed: sub.status === 'passed',
        answers: sub.submissionData,
        type: 'assignment',
        feedback: sub.feedback,
      })),
    ].sort((a, b) => new Date(b.attemptDate).getTime() - new Date(a.attemptDate).getTime());

    // 6. TASKS & ASSIGNMENTS
    const taskAssignments = await this.taskAssignmentRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    const taskIds = taskAssignments.map((a) => a.taskId);
    const tasks = taskIds.length > 0
      ? await this.taskRepo.find({ where: { id: In(taskIds) } })
      : [];
    const taskMetaMap = new Map(tasks.map((t) => [t.id, t]));

    const taskSubmissions = await this.taskSubmissionRepo.find({
      where: { userId },
      order: { submittedAt: 'DESC' },
    });
    const subMap = new Map<string, VideoTaskSubmission>();
    taskSubmissions.forEach((s) => {
      if (!subMap.has(s.taskId)) subMap.set(s.taskId, s);
    });

    const tasksList = taskAssignments.map((a) => {
      const t = taskMetaMap.get(a.taskId);
      const s = subMap.get(a.taskId);
      return {
        taskId: a.taskId,
        assignmentId: a.id,
        videoId: t?.videoId || null,
        title: t?.title || 'Video Assignment',
        description: t?.description || null,
        instructions: t?.instructions || null,
        videoTitle: t?.videoTitle || 'Course Video',
        courseSlug: t?.courseSlug || null,
        assignedDate: a.assignedAt || a.createdAt,
        dueDate: a.dueDate || t?.dueDate || null,
        status: s?.status || a.status || 'pending',
        submittedDate: s?.submittedAt || null,
        reviewedDate: s?.reviewedAt || null,
        workDescription: s?.workDescription || null,
        fileUrl: s?.fileUrl || null,
        fileName: s?.fileName || null,
        adminFeedback: s?.adminFeedback || null,
      };
    });

    // 7. RATINGS & REVIEWS
    const ratings = await this.ratingRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    const ratingsList = ratings.map((r) => ({
      id: r.id,
      courseSlug: r.courseSlug,
      courseTitle: courseMap.get(r.courseSlug.toLowerCase())?.courseName || r.courseSlug,
      rating: r.rating,
      review: r.review,
      status: r.status,
      date: r.createdAt,
    }));

    // 8. PAYMENTS & PURCHASES
    const payments = await this.paymentRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    const paymentsList = payments.map((p) => ({
      id: p.id,
      amount: p.amount,
      currency: p.currency || 'INR',
      status: p.status,
      paymentMethod: p.paymentMethod || 'Online',
      transactionId: p.transactionId || null,
      itemType: p.itemType || 'course',
      courseSlug: p.courseSlug || null,
      courseTitle: p.courseSlug ? (courseMap.get(p.courseSlug.toLowerCase())?.courseName || p.courseSlug) : 'Platform Subscription',
      date: p.createdAt,
    }));

    // 10. RECENT ACTIVITY TIMELINE
    const timeline: any[] = [];

    // Logins
    loginLogs.slice(0, 15).forEach((l) => {
      timeline.push({
        id: `login-${l.id}`,
        type: 'login',
        title: 'Logged In to Platform',
        detail: `Device: ${l.device || 'Web Browser'}${l.ipAddress ? ` (${l.ipAddress})` : ''}`,
        icon: 'login',
        color: 'text-blue-700',
        bgColor: 'bg-blue-50',
        date: l.loginAt,
      });
    });

    // Enrollments
    enrollments.forEach((e) => {
      timeline.push({
        id: `enr-${e.id}`,
        type: 'course_enrolled',
        title: 'Enrolled in Course',
        detail: courseMap.get(e.courseSlug.toLowerCase())?.courseName || e.courseSlug,
        courseSlug: e.courseSlug,
        icon: 'school',
        color: 'text-brand-forest',
        bgColor: 'bg-brand-surface',
        date: e.startDate || e.createdAt,
      });
    });

    // Course completions
    coursesActivity.filter((c) => c.isCompleted).forEach((c) => {
      timeline.push({
        id: `comp-${c.id}`,
        type: 'course_completed',
        title: 'Completed Course! 🎓',
        detail: `Finished 100% of ${c.courseTitle}`,
        courseSlug: c.courseSlug,
        icon: 'emoji_events',
        color: 'text-amber-700',
        bgColor: 'bg-amber-50',
        date: c.completedAt || c.lastWatchedDate || c.enrollmentDate,
      });
    });

    // Video watch history events
    videoWatchHistory.slice(0, 15).forEach((w, i) => {
      timeline.push({
        id: `watch-${w.videoId}-${i}`,
        type: w.isCompleted ? 'video_completed' : 'video_watched',
        title: w.isCompleted ? 'Completed Video' : 'Watched Video',
        detail: `${w.videoTitle} (${w.courseTitle})`,
        courseSlug: w.courseSlug,
        videoId: w.videoId,
        videoTitle: w.videoTitle,
        icon: w.isCompleted ? 'check_circle' : 'smart_display',
        color: w.isCompleted ? 'text-emerald-700' : 'text-teal-700',
        bgColor: w.isCompleted ? 'bg-emerald-50' : 'bg-teal-50',
        date: w.lastWatchedAt,
      });
    });

    // Tasks submissions
    tasksList.forEach((t) => {
      if (t.submittedDate) {
        timeline.push({
          id: `task-sub-${t.assignmentId}`,
          type: 'task_submitted',
          title: 'Submitted Video Assignment',
          detail: `Task: "${t.title}" for video "${t.videoTitle}"`,
          courseSlug: t.courseSlug,
          taskId: t.taskId,
          videoTitle: t.videoTitle,
          titleText: t.title,
          icon: 'assignment_turned_in',
          color: 'text-purple-700',
          bgColor: 'bg-purple-50',
          date: t.submittedDate,
        });
      }
      if (t.status === 'reviewed' && t.reviewedDate) {
        timeline.push({
          id: `task-rev-${t.assignmentId}`,
          type: 'task_reviewed',
          title: 'Assignment Reviewed by Mentor',
          detail: `Feedback: ${t.adminFeedback || 'Approved'}`,
          courseSlug: t.courseSlug,
          taskId: t.taskId,
          videoTitle: t.videoTitle,
          titleText: t.title,
          icon: 'verified',
          color: 'text-emerald-700',
          bgColor: 'bg-emerald-50',
          date: t.reviewedDate,
        });
      }
    });

    // Assessments
    assessmentsList.slice(0, 10).forEach((att) => {
      timeline.push({
        id: `att-${att.id}`,
        type: 'assessment_attempt',
        title: `Attempted Assessment (${att.percentage !== null ? `${att.percentage}%` : 'Submitted'})`,
        detail: `${att.name} in ${att.courseTitle}`,
        courseSlug: att.courseSlug,
        icon: 'quiz',
        color: att.passed ? 'text-emerald-700' : 'text-amber-700',
        bgColor: att.passed ? 'bg-emerald-50' : 'bg-amber-50',
        date: att.attemptDate,
      });
    });

    // Ratings
    ratingsList.forEach((r) => {
      timeline.push({
        id: `rat-${r.id}`,
        type: 'rating_submitted',
        title: `Rated ${r.rating} Stars`,
        detail: `${r.courseTitle}${r.review ? `: "${r.review}"` : ''}`,
        courseSlug: r.courseSlug,
        icon: 'star',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        date: r.date,
      });
    });

    // Payments
    paymentsList.forEach((p) => {
      timeline.push({
        id: `pay-${p.id}`,
        type: 'payment_success',
        title: `Payment ${p.status === 'success' ? 'Successful' : p.status}`,
        detail: `${p.currency} ${p.amount} for ${p.courseTitle}`,
        courseSlug: p.courseSlug,
        icon: 'receipt_long',
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-50',
        date: p.date,
      });
    });

    timeline.sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return (isNaN(timeB) ? 0 : timeB) - (isNaN(timeA) ? 0 : timeA);
    });

    // 11. KPI METRICS & ROLE-BASED SCOPING
    let finalCourses = coursesActivity;
    let finalWatchHistory = videoWatchHistory;
    let finalAssessments = assessmentsList;
    let finalTasks = tasksList;
    let finalPayments = paymentsList;
    let finalRatings = ratingsList;

    if (isSubAdmin && scope) {
      finalCourses = coursesActivity.filter((c) => {
        const cSlug = (c.courseSlug || '').trim().toLowerCase();
        return (
          scope.courseSlugs.includes(cSlug) ||
          scope.hasFullCourseAccess(cSlug) ||
          scope.isAssignedToVideo(cSlug)
        );
      });
      finalWatchHistory = videoWatchHistory.filter((w) =>
        scope.isAssignedToVideo(w.courseSlug, w.videoId, w.videoTitle),
      );
      finalAssessments = assessmentsList.filter((a) => {
        const aSlug = (a.courseSlug || '').trim().toLowerCase();
        return (aSlug && scope.courseSlugs.includes(aSlug)) || scope.isAssignedToVideo(aSlug);
      });
      finalTasks = tasksList.filter((t) =>
        scope.isAssignedToVideo(t.courseSlug || '', t.videoId || t.taskId, t.videoTitle || t.title) ||
        (t.courseSlug && scope.courseSlugs.includes(t.courseSlug.toLowerCase())),
      );
      finalPayments = [];
      finalRatings = ratingsList.filter((r) => r.courseSlug && scope.courseSlugs.includes(r.courseSlug.toLowerCase()));

      // Check if user is in scoped learners or has engagement
      const scopedLearners = await this.adminScopeService.getScopedLearnersForAdmin(adminUser);
      const isScoped = scopedLearners.some((sl) => sl.id === userId);

      const hasEngagement = isScoped || finalCourses.length > 0 || finalWatchHistory.length > 0 || finalAssessments.length > 0 || finalTasks.length > 0;
      if (!hasEngagement) {
        throw new ForbiddenException('You do not have permission to view this learner\'s activity');
      }
    }

    const certificatesList = (isSubAdmin ? finalCourses : coursesActivity)
      .filter((ca) => ca.certificateIssued || ca.isCompleted)
      .map((ca) => ({
        id: `GG-CERT-${user.id.slice(0, 6).toUpperCase()}-${ca.courseSlug.toUpperCase()}`,
        courseSlug: ca.courseSlug,
        courseTitle: ca.courseTitle,
        issueDate: ca.completedAt || ca.lastWatchedDate || ca.enrollmentDate,
        status: 'Issued',
      }));

    const totalCoursesEnrolled = isSubAdmin ? finalCourses.length : enrollments.length;
    const totalCompletedCourses = isSubAdmin ? finalCourses.filter((c) => c.isCompleted).length : coursesActivity.filter((c) => c.isCompleted).length;
    const totalAssessmentsAttempted = isSubAdmin ? finalAssessments.length : assessmentsList.length;
    const totalTasksAssigned = isSubAdmin ? finalTasks.length : tasksList.length;
    const totalTasksCompleted = isSubAdmin
      ? finalTasks.filter((t) => t.status === 'reviewed' || t.status === 'submitted').length
      : tasksList.filter((t) => t.status === 'reviewed' || t.status === 'submitted').length;
    const totalCertificates = certificatesList.length;

    const scopedTotalWatchTimeSec = isSubAdmin
      ? finalWatchHistory.reduce((acc, w) => acc + (w.watchTimeSec || 0), 0)
      : totalWatchTimeSec;
    const scopedVideosWatchedCount = isSubAdmin ? finalWatchHistory.length : videosWatchedCount;
    const scopedVideosCompletedCount = isSubAdmin ? finalWatchHistory.filter((v) => v.isCompleted).length : videosCompletedCount;
    const scopedAvgWatchTimePerVideoSec = scopedVideosWatchedCount > 0 ? Math.round(scopedTotalWatchTimeSec / scopedVideosWatchedCount) : 0;

    // Scoped 7-day watch time distribution
    const watchHistoryForDays = isSubAdmin ? finalWatchHistory : videoWatchHistory;
    const finalWatchTimeByDay: { date: string; label: string; seconds: number; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

      let secForDay = 0;
      watchHistoryForDays.forEach((w) => {
        if (!w.lastWatchedAt) return;
        try {
          const wDate = new Date(w.lastWatchedAt);
          if (!isNaN(wDate.getTime()) && wDate.toISOString().slice(0, 10) === dateStr) {
            secForDay += (w.watchTimeSec || 0);
          }
        } catch {
          // ignore
        }
      });
      finalWatchTimeByDay.push({
        date: dateStr,
        label,
        seconds: secForDay,
        minutes: Math.round(secForDay / 60),
      });
    }

    let scopedWatchTimeThisWeekSec = 0;
    let scopedWatchTimeThisMonthSec = 0;
    if (isSubAdmin) {
      finalWatchHistory.forEach((item) => {
        if (!item.lastWatchedAt) return;
        try {
          const itemDate = new Date(item.lastWatchedAt);
          if (!isNaN(itemDate.getTime())) {
            if (itemDate >= startOfWeek) scopedWatchTimeThisWeekSec += (item.watchTimeSec || 0);
            if (itemDate >= startOfMonth) scopedWatchTimeThisMonthSec += (item.watchTimeSec || 0);
          }
        } catch {
          // ignore
        }
      });
    }

    // Scoped watch time by course distribution (strictly assigned courses/videos only)
    const courseTimeMap = new Map<string, number>();
    const watchHistoryForCourse = isSubAdmin ? finalWatchHistory : videoWatchHistory;
    const totalWatchTimeForDistribution = isSubAdmin ? scopedTotalWatchTimeSec : totalWatchTimeSec;

    watchHistoryForCourse.forEach((w) => {
      const title = w.courseTitle || w.courseSlug || 'Other';
      courseTimeMap.set(title, (courseTimeMap.get(title) || 0) + (w.watchTimeSec || 0));
    });
    const finalWatchTimeByCourse = Array.from(courseTimeMap.entries()).map(([cTitle, sec]) => ({
      courseTitle: cTitle,
      seconds: sec,
      minutes: Math.round(sec / 60),
      percent: totalWatchTimeForDistribution > 0
        ? Math.min(100, Math.max(0, Math.round((sec / totalWatchTimeForDistribution) * 100)))
        : 0,
    }));

    // Scoped recent activity timeline (exclude logins, payments, unassigned course events)
    const finalTimeline = isSubAdmin && scope
      ? timeline.filter((item) => {
          if (!item) return false;
          if (item.type === 'login' || item.type === 'payment_success') {
            return false;
          }
          if (item.type === 'video_watched' || item.type === 'video_completed') {
            return scope.isAssignedToVideo(item.courseSlug || '', item.videoId, item.videoTitle);
          }
          if (item.type === 'task_submitted' || item.type === 'task_reviewed') {
            return (
              scope.isAssignedToVideo(item.courseSlug || '', item.taskId, item.videoTitle) ||
              (item.courseSlug && scope.courseSlugs.includes(item.courseSlug.toLowerCase()))
            );
          }
          if (item.courseSlug) {
            return (
              scope.courseSlugs.includes(item.courseSlug.toLowerCase()) ||
              scope.isAssignedToVideo(item.courseSlug, item.videoId, item.videoTitle)
            );
          }
          return false;
        })
      : timeline;

    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || null,
        role: user.role,
        learningPurpose: user.learningPurpose || null,
        interests: user.interests || [],
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt,
        lastLoginIp: isSubAdmin ? null : (user.lastLoginIp || (loginLogs[0]?.ipAddress ?? null)),
      },
      summary: {
        totalCoursesEnrolled,
        totalVideosWatched: scopedVideosWatchedCount,
        totalWatchTimeSec: scopedTotalWatchTimeSec,
        totalCompletedCourses,
        totalAssessmentsAttempted,
        totalTasksAssigned,
        totalTasksCompleted,
        totalCertificates,
        totalLoginsCount: isSubAdmin ? 0 : totalLoginsCount,
        lastLoginAt,
      },
      logins: {
        lastLoginAt: isSubAdmin ? null : lastLoginAt,
        totalLoginsCount: isSubAdmin ? 0 : totalLoginsCount,
        logs: isSubAdmin
          ? []
          : loginLogs.map((l) => ({
              id: l.id,
              date: l.loginAt,
              ipAddress: l.ipAddress || '—',
              userAgent: l.userAgent || '—',
              device: l.device || 'Desktop',
            })),
      },
      courses: finalCourses,
      watchHistory: finalWatchHistory,
      watchAnalytics: {
        totalWatchTimeSec: scopedTotalWatchTimeSec,
        watchTimeThisWeekSec: isSubAdmin ? scopedWatchTimeThisWeekSec : watchTimeThisWeekSec,
        watchTimeThisMonthSec: isSubAdmin ? scopedWatchTimeThisMonthSec : watchTimeThisMonthSec,
        avgWatchTimePerVideoSec: scopedAvgWatchTimePerVideoSec,
        videosWatchedCount: scopedVideosWatchedCount,
        videosCompletedCount: scopedVideosCompletedCount,
        watchTimeByDay: finalWatchTimeByDay,
        watchTimeByCourse: finalWatchTimeByCourse,
      },
      activityTimeline: finalTimeline.slice(0, 50),
      assessments: finalAssessments,
      tasks: finalTasks,
      ratings: finalRatings,
      payments: finalPayments,
      certificates: certificatesList,
    };
  }
}

