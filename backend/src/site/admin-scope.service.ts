import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  AdminVideoAssignment,
  CourseEntity,
  CourseEnrollment,
  CoursePlaylist,
  CoursePlaylistVideo,
  CourseProgress,
  User,
  UserVideoWatchLog,
  VideoTask,
  VideoTaskSubmission,
} from '../entities';

export interface AdminScope {
  isSuperAdmin: boolean;
  adminId?: string;
  assignments: AdminVideoAssignment[];
  courseSlugs: string[];
  courseIds: string[];
  playlistIds: string[];
  createdCourseSlugs: string[];
  createdCourseIds: string[];
  createdPlaylistIds: string[];
  videoIds: string[];
  videoTitles: string[];
  hasFullCourseAccess: (slug: string) => boolean;
  isAssignedToVideo: (courseSlug: string, videoId?: string, videoTitle?: string) => boolean;
}

function safeLabel(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') {
    return val.en || val.mr || val.hi || JSON.stringify(val);
  }
  return String(val);
}

@Injectable()
export class AdminScopeService {
  constructor(
    @InjectRepository(AdminVideoAssignment)
    private readonly assignmentRepo: Repository<AdminVideoAssignment>,

    @InjectRepository(UserVideoWatchLog)
    private readonly videoWatchLogRepo: Repository<UserVideoWatchLog>,

    @InjectRepository(CourseEnrollment)
    private readonly enrollmentRepo: Repository<CourseEnrollment>,

    @InjectRepository(CourseProgress)
    private readonly progressRepo: Repository<CourseProgress>,

    @InjectRepository(VideoTaskSubmission)
    private readonly taskSubmissionRepo: Repository<VideoTaskSubmission>,

    @InjectRepository(VideoTask)
    private readonly taskRepo: Repository<VideoTask>,

    @InjectRepository(CoursePlaylistVideo)
    private readonly playlistVideoRepo: Repository<CoursePlaylistVideo>,

    @InjectRepository(CoursePlaylist)
    private readonly playlistRepo: Repository<CoursePlaylist>,

    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) { }

  async getScopeForAdmin(adminUser: any): Promise<AdminScope> {
    if (!adminUser || adminUser.role === 'super_admin') {
      return {
        isSuperAdmin: true,
        adminId: adminUser?.id,
        assignments: [],
        courseSlugs: [],
        courseIds: [],
        playlistIds: [],
        createdCourseSlugs: [],
        createdCourseIds: [],
        createdPlaylistIds: [],
        videoIds: [],
        videoTitles: [],
        hasFullCourseAccess: () => true,
        isAssignedToVideo: () => true,
      };
    }

    const [assignments, createdCourses, createdPlaylists] = await Promise.all([
      this.assignmentRepo.find({ where: { adminId: adminUser.id } }),
      this.courseRepo.find({ where: { createdBy: adminUser.id }, select: ['id', 'slug'] }),
      this.playlistRepo.find({ where: { createdBy: adminUser.id }, select: ['id', 'courseId', 'courseSlug'] }),
    ]);

    const createdCourseIds = createdCourses.map((c) => c.id).filter(Boolean);
    const createdCourseSlugs = Array.from(
      new Set(createdCourses.map((c) => (c.slug || '').trim().toLowerCase()).filter(Boolean)),
    );
    const createdPlaylistIds = createdPlaylists.map((p) => p.id).filter(Boolean);

    const courseSlugs = Array.from(
      new Set([
        ...assignments.map((a) => (a.courseSlug || '').trim().toLowerCase()).filter(Boolean),
        ...createdCourseSlugs,
      ]),
    );
    const courseIds = Array.from(
      new Set([
        ...(assignments.map((a) => a.courseId).filter(Boolean) as string[]),
        ...createdCourseIds,
      ]),
    );
    const playlistIds = Array.from(
      new Set([
        ...(assignments.map((a) => a.playlistId).filter(Boolean) as string[]),
        ...createdPlaylistIds,
      ]),
    );
    const videoIds = Array.from(
      new Set(
        assignments
          .map((a) => (a.videoId || '').trim())
          .filter((v) => Boolean(v) && v !== 'ALL'),
      ),
    );
    const videoTitles = Array.from(
      new Set(assignments.map((a) => (a.videoTitle || '').trim().toLowerCase()).filter(Boolean)),
    );

    // Resolve any missing courseSlugs from courseIds
    const missingSlugCourseIds = assignments
      .filter((a) => !a.courseSlug && a.courseId)
      .map((a) => a.courseId as string);
    if (missingSlugCourseIds.length > 0) {
      const courses = await this.courseRepo.find({
        where: { id: In(missingSlugCourseIds) },
        select: ['id', 'slug'],
      });
      courses.forEach((c) => {
        if (c.slug) {
          const s = c.slug.trim().toLowerCase();
          if (!courseSlugs.includes(s)) courseSlugs.push(s);
        }
      });
    }

    // Resolve any missing courseSlugs from playlistIds
    const missingSlugPlaylistIds = assignments
      .filter((a) => !a.courseSlug && a.playlistId)
      .map((a) => a.playlistId as string);
    if (missingSlugPlaylistIds.length > 0) {
      const playlists = await this.playlistRepo.find({
        where: { id: In(missingSlugPlaylistIds) },
        select: ['id', 'courseSlug'],
      });
      playlists.forEach((p) => {
        if (p.courseSlug) {
          const s = p.courseSlug.trim().toLowerCase();
          if (!courseSlugs.includes(s)) courseSlugs.push(s);
        }
      });
    }

    const hasFullCourseAccess = (slug: string) => {
      const cleanSlug = (slug || '').trim().toLowerCase();
      if (!cleanSlug) return false;
      if (createdCourseSlugs.includes(cleanSlug)) return true;
      return assignments.some(
        (a) =>
          (a.courseSlug || '').trim().toLowerCase() === cleanSlug &&
          (!a.videoId || a.videoId === 'ALL'),
      );
    };

    const isAssignedToVideo = (courseSlug?: string, videoId?: string, videoTitle?: string) => {
      const cleanSlug = (courseSlug || '').trim().toLowerCase();
      if (cleanSlug && hasFullCourseAccess(cleanSlug)) return true;

      const cleanVid = (videoId || '').trim();
      const cleanTitle = (videoTitle || '').trim().toLowerCase();

      return assignments.some((a) => {
        const aSlug = (a.courseSlug || '').trim().toLowerCase();
        const aVid = (a.videoId || '').trim();
        const aTitle = (a.videoTitle || '').trim().toLowerCase();

        // 1. Direct video ID match
        if (cleanVid && aVid && aVid !== 'ALL') {
          if (cleanVid === aVid) return true;
          if (cleanVid.endsWith(`_v${aVid}`) || aVid.endsWith(`_v${cleanVid}`)) return true;
        }

        // 2. Direct courseSlug match with full or partial video check
        if (cleanSlug && aSlug && cleanSlug === aSlug) {
          if (!aVid || aVid === 'ALL') return true;
          if (cleanVid && (aVid === cleanVid || cleanVid.endsWith(`_v${aVid}`) || aVid.endsWith(`_v${cleanVid}`))) return true;
          if (cleanTitle && aTitle && (cleanTitle === aTitle || cleanTitle.includes(aTitle) || aTitle.includes(cleanTitle))) return true;
        }

        // 3. Title match if both present
        if (cleanTitle && aTitle && (cleanTitle === aTitle || cleanTitle.includes(aTitle) || aTitle.includes(cleanTitle))) {
          if (!cleanSlug || !aSlug || cleanSlug === aSlug) return true;
        }

        return false;
      });
    };

    return {
      isSuperAdmin: false,
      adminId: adminUser.id,
      assignments,
      courseSlugs,
      courseIds,
      playlistIds,
      createdCourseSlugs,
      createdCourseIds,
      createdPlaylistIds,
      videoIds,
      videoTitles,
      hasFullCourseAccess,
      isAssignedToVideo,
    };
  }

  async canAccessCourse(course: { id?: string; slug?: string; createdBy?: string | null }, adminUser: any): Promise<boolean> {
    if (!adminUser || adminUser.role === 'super_admin') return true;
    if (adminUser.role !== 'admin') return false;
    if (course.createdBy && course.createdBy === adminUser.id) return true;
    const scope = await this.getScopeForAdmin(adminUser);
    const slugLower = (course.slug || '').trim().toLowerCase();
    return Boolean(
      (slugLower && scope.courseSlugs.includes(slugLower)) ||
      (course.id && scope.courseIds.includes(course.id)),
    );
  }

  async canAccessPlaylist(
    playlist: { id?: string; courseSlug?: string; createdBy?: string | null; videos?: any[] },
    adminUser: any,
    specificVideoId?: string,
  ): Promise<boolean> {
    if (!adminUser || adminUser.role === 'super_admin') return true;
    if (adminUser.role !== 'admin') return false;
    if (playlist.createdBy && playlist.createdBy === adminUser.id) return true;
    const scope = await this.getScopeForAdmin(adminUser);
    if (playlist.id && scope.playlistIds.includes(playlist.id)) return true;
    const cSlug = (playlist.courseSlug || '').trim().toLowerCase();
    if (cSlug && scope.hasFullCourseAccess(cSlug)) return true;
    if (specificVideoId && scope.videoIds.includes(specificVideoId)) return true;
    if (Array.isArray(playlist.videos)) {
      return playlist.videos.some((v) =>
        scope.isAssignedToVideo(playlist.courseSlug || '', v.id || v.youtubeVideoId, v.title),
      );
    }
    return false;
  }

  /**
   * Returns list of learners scoped to the sub-admin's assigned videos/courses,
   * along with the specific assigned videos each learner interacted with.
   */
  async getScopedLearnersForAdmin(adminUser: any) {
    const scope = await this.getScopeForAdmin(adminUser);
    if (scope.isSuperAdmin) {
      const allUsers = await this.userRepo.find({
        order: { createdAt: 'DESC' },
        select: ['id', 'fullName', 'email', 'role', 'isActive', 'createdAt', 'updatedAt'],
      });
      return allUsers.map((u) => ({
        ...u,
        assignedVideosWatched: ['All Platform Access'],
      }));
    }

    if (scope.courseSlugs.length === 0 && scope.videoIds.length === 0) {
      return [];
    }

    interface LearnerData {
      labels: Set<string>;
      courseSlugs: Set<string>;
      totalWatchTimeSec: number;
      maxProgressPercent: number;
      lastWatchedAt: Date | null;
      courseStats: Map<string, {
        courseSlug: string;
        courseTitle: string;
        watchTimeSec: number;
        progressPercent: number;
        lastWatchedAt: Date | null;
        isCompleted: boolean;
      }>;
    }

    const learnerDataMap = new Map<string, LearnerData>();

    const getOrCreateLearner = (userId: string | null | undefined): LearnerData | null => {
      if (!userId) return null;
      if (!learnerDataMap.has(userId)) {
        learnerDataMap.set(userId, {
          labels: new Set(),
          courseSlugs: new Set(),
          totalWatchTimeSec: 0,
          maxProgressPercent: 0,
          lastWatchedAt: null,
          courseStats: new Map(),
        });
      }
      return learnerDataMap.get(userId)!;
    };

    // 1. Check video watch logs
    if (scope.videoIds.length > 0) {
      const logs = await this.videoWatchLogRepo.find({
        where: { videoId: In(scope.videoIds) },
        select: ['userId', 'videoId', 'videoTitle', 'courseSlug', 'courseTitle', 'watchTimeSec', 'progressPercent', 'isCompleted', 'lastWatchedAt'],
      });
      for (const l of logs) {
        const ld = getOrCreateLearner(l.userId);
        if (!ld) continue;
        ld.labels.add(safeLabel(l.videoTitle) || `Video ${l.videoId}`);
        const cSlug = (l.courseSlug || '').trim().toLowerCase();
        if (cSlug) ld.courseSlugs.add(cSlug);

        ld.totalWatchTimeSec += (l.watchTimeSec || 0);
        ld.maxProgressPercent = Math.max(ld.maxProgressPercent, l.progressPercent || 0);
        if (l.lastWatchedAt && (!ld.lastWatchedAt || new Date(l.lastWatchedAt) > new Date(ld.lastWatchedAt))) {
          ld.lastWatchedAt = l.lastWatchedAt;
        }

        if (cSlug) {
          const prev = ld.courseStats.get(cSlug) || {
            courseSlug: cSlug,
            courseTitle: l.courseTitle || cSlug,
            watchTimeSec: 0,
            progressPercent: 0,
            lastWatchedAt: null,
            isCompleted: false,
          };
          prev.watchTimeSec += (l.watchTimeSec || 0);
          prev.progressPercent = Math.max(prev.progressPercent, l.progressPercent || 0);
          if (l.isCompleted) prev.isCompleted = true;
          if (l.lastWatchedAt && (!prev.lastWatchedAt || new Date(l.lastWatchedAt) > new Date(prev.lastWatchedAt))) {
            prev.lastWatchedAt = l.lastWatchedAt;
          }
          ld.courseStats.set(cSlug, prev);
        }
      }
    }

    // Check watch logs for assigned courses if full course access
    for (const slug of scope.courseSlugs) {
      if (scope.hasFullCourseAccess(slug)) {
        const slugLogs = await this.videoWatchLogRepo.find({
          where: { courseSlug: slug },
          select: ['userId', 'videoId', 'videoTitle', 'courseTitle', 'watchTimeSec', 'progressPercent', 'isCompleted', 'lastWatchedAt'],
        });
        for (const l of slugLogs) {
          const ld = getOrCreateLearner(l.userId);
          if (!ld) continue;
          ld.labels.add(safeLabel(l.videoTitle) || safeLabel(l.courseTitle) || slug);
          const cSlug = slug.toLowerCase();
          ld.courseSlugs.add(cSlug);
          ld.totalWatchTimeSec += (l.watchTimeSec || 0);
          ld.maxProgressPercent = Math.max(ld.maxProgressPercent, l.progressPercent || 0);
          if (l.lastWatchedAt && (!ld.lastWatchedAt || new Date(l.lastWatchedAt) > new Date(ld.lastWatchedAt))) {
            ld.lastWatchedAt = l.lastWatchedAt;
          }

          const prev = ld.courseStats.get(cSlug) || {
            courseSlug: cSlug,
            courseTitle: l.courseTitle || slug,
            watchTimeSec: 0,
            progressPercent: 0,
            lastWatchedAt: null,
            isCompleted: false,
          };
          prev.watchTimeSec += (l.watchTimeSec || 0);
          prev.progressPercent = Math.max(prev.progressPercent, l.progressPercent || 0);
          if (l.isCompleted) prev.isCompleted = true;
          if (l.lastWatchedAt && (!prev.lastWatchedAt || new Date(l.lastWatchedAt) > new Date(prev.lastWatchedAt))) {
            prev.lastWatchedAt = l.lastWatchedAt;
          }
          ld.courseStats.set(cSlug, prev);
        }
      }
    }

    // 2. Check enrollments & progress for assigned courses
    if (scope.courseSlugs.length > 0) {
      const enrollments = await this.enrollmentRepo.find({
        where: { courseSlug: In(scope.courseSlugs) },
        select: ['userId', 'courseSlug'],
      });

      const courses = await this.courseRepo.find({
        where: { slug: In(scope.courseSlugs) },
        select: ['id', 'slug', 'courseName', 'lessons'],
      });
      const courseMap = new Map(courses.map((c) => [c.slug.toLowerCase(), c]));

      const progressRecords = await this.progressRepo.find({
        where: { courseSlug: In(scope.courseSlugs) },
      });
      const progressMap = new Map<string, CourseProgress>();
      progressRecords.forEach((p) => {
        progressMap.set(`${p.userId}_${p.courseSlug.toLowerCase()}`, p);
      });

      for (const enr of enrollments) {
        const c = courseMap.get(enr.courseSlug.toLowerCase());
        const cTitle = c?.courseName || enr.courseSlug;
        const cSlug = enr.courseSlug.toLowerCase();
        const p = progressMap.get(`${enr.userId}_${cSlug}`);

        if (scope.hasFullCourseAccess(enr.courseSlug)) {
          const ld = getOrCreateLearner(enr.userId);
          if (ld) {
            ld.labels.add(safeLabel(cTitle));
            ld.courseSlugs.add(cSlug);
            if (p) {
              ld.totalWatchTimeSec = Math.max(ld.totalWatchTimeSec, p.watchTimeSec || 0);
              ld.maxProgressPercent = Math.max(ld.maxProgressPercent, p.progressPercent || 0);
              if (p.updatedAt && (!ld.lastWatchedAt || new Date(p.updatedAt) > new Date(ld.lastWatchedAt))) {
                ld.lastWatchedAt = p.updatedAt;
              }
              const prev = ld.courseStats.get(cSlug) || {
                courseSlug: cSlug,
                courseTitle: cTitle,
                watchTimeSec: 0,
                progressPercent: 0,
                lastWatchedAt: null,
                isCompleted: false,
              };
              prev.watchTimeSec = Math.max(prev.watchTimeSec, p.watchTimeSec || 0);
              prev.progressPercent = Math.max(prev.progressPercent, p.progressPercent || 0);
              if (p.isCompleted) prev.isCompleted = true;
              if (p.updatedAt && (!prev.lastWatchedAt || new Date(p.updatedAt) > new Date(prev.lastWatchedAt))) {
                prev.lastWatchedAt = p.updatedAt;
              }
              ld.courseStats.set(cSlug, prev);
            }
          }
        } else if (p) {
          const completed = new Set(p.completedLessons || []);
          (c?.lessons || []).forEach((l: any, idx: number) => {
            const vKey = `${enr.courseSlug}_v${idx}`;
            const title = l?.t || l?.title || `Lesson ${idx + 1}`;
            if (
              scope.isAssignedToVideo(enr.courseSlug, vKey, title) ||
              scope.isAssignedToVideo(enr.courseSlug, String(idx), title)
            ) {
              if (completed.has(String(idx)) || p.lastAccessedLessonIndex === idx) {
                const ld = getOrCreateLearner(enr.userId);
                if (ld) {
                  ld.labels.add(safeLabel(title));
                  ld.courseSlugs.add(cSlug);
                  ld.totalWatchTimeSec = Math.max(ld.totalWatchTimeSec, p.watchTimeSec || 0);
                  ld.maxProgressPercent = Math.max(ld.maxProgressPercent, p.progressPercent || 0);
                  if (p.updatedAt && (!ld.lastWatchedAt || new Date(p.updatedAt) > new Date(ld.lastWatchedAt))) {
                    ld.lastWatchedAt = p.updatedAt;
                  }
                  const prev = ld.courseStats.get(cSlug) || {
                    courseSlug: cSlug,
                    courseTitle: cTitle,
                    watchTimeSec: 0,
                    progressPercent: 0,
                    lastWatchedAt: null,
                    isCompleted: false,
                  };
                  prev.watchTimeSec = Math.max(prev.watchTimeSec, p.watchTimeSec || 0);
                  prev.progressPercent = Math.max(prev.progressPercent, p.progressPercent || 0);
                  if (p.isCompleted) prev.isCompleted = true;
                  if (p.updatedAt && (!prev.lastWatchedAt || new Date(p.updatedAt) > new Date(prev.lastWatchedAt))) {
                    prev.lastWatchedAt = p.updatedAt;
                  }
                  ld.courseStats.set(cSlug, prev);
                }
              }
            }
          });
        }
      }
    }

    // 3. Check task submissions on assigned videos
    if (scope.videoIds.length > 0) {
      const tasks = await this.taskRepo.find({
        where: { videoId: In(scope.videoIds) },
        select: ['id', 'videoId', 'videoTitle', 'title', 'courseSlug'],
      });
      const taskIds = tasks.map((t) => t.id);
      if (taskIds.length > 0) {
        const submissions = await this.taskSubmissionRepo.find({
          where: { taskId: In(taskIds) },
          select: ['userId', 'taskId', 'submittedAt'],
        });
        const taskMap = new Map(tasks.map((t) => [t.id, t]));
        for (const s of submissions) {
          const t = taskMap.get(s.taskId);
          const ld = getOrCreateLearner(s.userId);
          if (ld) {
            ld.labels.add(safeLabel(t?.videoTitle) || safeLabel(t?.title) || 'Video Assignment');
            if (t?.courseSlug) ld.courseSlugs.add(t.courseSlug.toLowerCase());
            if (s.submittedAt && (!ld.lastWatchedAt || new Date(s.submittedAt) > new Date(ld.lastWatchedAt))) {
              ld.lastWatchedAt = s.submittedAt;
            }
          }
        }
      }
    }

    const matchedUserIds = Array.from(learnerDataMap.keys());
    if (matchedUserIds.length === 0) {
      return [];
    }

    const users = await this.userRepo.find({
      where: { id: In(matchedUserIds), role: 'user' },
      order: { createdAt: 'DESC' },
      select: ['id', 'fullName', 'email', 'role', 'isActive', 'createdAt', 'updatedAt'],
    });

    return users.map((u) => {
      const ld = learnerDataMap.get(u.id);
      const assignedVideosWatched = ld?.labels ? Array.from(ld.labels) : ['Assigned Video'];
      const engagedCourseSlugs = ld?.courseSlugs ? Array.from(ld.courseSlugs) : [];
      const coursesDetail = ld?.courseStats ? Array.from(ld.courseStats.values()) : [];
      const watchDurationSec = ld?.totalWatchTimeSec || 0;
      const completionPercent = Math.min(100, Math.max(0, ld?.maxProgressPercent || 0));
      const lastWatchedAt = ld?.lastWatchedAt ? ld.lastWatchedAt.toISOString() : (u.updatedAt || u.createdAt);

      return {
        ...u,
        assignedVideosWatched,
        engagedCourseSlugs,
        watchDurationSec,
        completionPercent,
        lastWatchedAt,
        coursesDetail,
      };
    });
  }

  /**
   * Scoped breakdown of views and sub-views (per video/chapter) and registered learners for a course or playlist.
   */
  async getCourseViewsBreakdown(slugOrId: string, adminUser: any) {
    const target = (slugOrId || '').trim();
    if (!target) {
      throw new NotFoundException('Course or playlist identifier is required.');
    }
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(target);

    // 1. Locate Course
    let course: CourseEntity | null = null;
    if (isUUID) {
      course = await this.courseRepo.findOne({ where: { id: target } });
    }
    if (!course) {
      course = await this.courseRepo.findOne({ where: { slug: target } });
    }
    if (!course) {
      course = await this.courseRepo
        .createQueryBuilder('c')
        .where('LOWER(c.slug) = LOWER(:target)', { target })
        .getOne();
    }

    // 2. Locate Playlist
    let playlist: CoursePlaylist | null = null;
    if (isUUID) {
      playlist = await this.playlistRepo.findOne({ where: { id: target }, relations: ['videos'] });
    }
    if (!playlist) {
      playlist = await this.playlistRepo.findOne({
        where: [{ courseSlug: target }, { title: target }],
        relations: ['videos'],
      });
    }
    if (!playlist) {
      playlist = await this.playlistRepo
        .createQueryBuilder('p')
        .leftJoinAndSelect('p.videos', 'v')
        .where('LOWER(p.courseSlug) = LOWER(:target) OR LOWER(p.title) = LOWER(:target)', { target })
        .getOne();
    }

    if (!course && !playlist) {
      throw new NotFoundException(`Course or playlist '${target}' not found.`);
    }

    // If playlist found without course, attempt to attach course
    if (!course && playlist && (playlist.courseSlug || playlist.courseId)) {
      if (playlist.courseSlug) {
        course = await this.courseRepo.findOne({ where: { slug: playlist.courseSlug } });
      }
      if (!course && playlist.courseId) {
        course = await this.courseRepo.findOne({ where: { id: playlist.courseId } });
      }
    }

    // If course found without playlist, fetch any playlists under this course
    let attachedPlaylists: CoursePlaylist[] = [];
    if (course) {
      attachedPlaylists = await this.playlistRepo.find({
        where: [{ courseSlug: course.slug }, { courseId: course.id }],
        relations: ['videos'],
      });
    }

    // 3. Verify Sub-Admin Access
    const isSubAdmin = adminUser && adminUser.role === 'admin';
    const scope = await this.getScopeForAdmin(adminUser);

    if (isSubAdmin) {
      const courseSlugLower = (course?.slug || playlist?.courseSlug || '').toLowerCase();
      const courseId = course?.id || playlist?.courseId;
      const playlistId = playlist?.id;

      const isCreator =
        (course?.createdBy && course.createdBy === adminUser.id) ||
        (playlist?.createdBy && playlist.createdBy === adminUser.id);

      const hasCourseAccess =
        Boolean(isCreator) ||
        (courseSlugLower && scope.courseSlugs.includes(courseSlugLower)) ||
        (courseId && scope.courseIds.includes(courseId)) ||
        (playlistId && scope.playlistIds.includes(playlistId));

      const hasAnyVideoAccess =
        scope.assignments.some(
          (a) =>
            (courseSlugLower && (a.courseSlug || '').toLowerCase() === courseSlugLower) ||
            (courseId && a.courseId === courseId) ||
            (playlistId && a.playlistId === playlistId)
        );

      if (!hasCourseAccess && !hasAnyVideoAccess) {
        throw new ForbiddenException('You do not have administrative access to this course or playlist.');
      }
    }

    // 4. Construct list of videos/chapters
    interface VideoMeta {
      videoId: string;
      lessonIndex: number;
      chapterTitle: string;
      duration: string | null;
      youtubeVideoId: string | null;
      isPlaylistVideo: boolean;
    }

    const videosList: VideoMeta[] = [];

    // Course lessons
    if (course && Array.isArray(course.lessons)) {
      course.lessons.forEach((l: any, idx: number) => {
        videosList.push({
          videoId: `${course.slug}_v${idx}`,
          lessonIndex: idx,
          chapterTitle: safeLabel(l?.t || l?.title || `Lesson ${idx + 1}`),
          duration: l?.duration || null,
          youtubeVideoId: l?.id || null,
          isPlaylistVideo: false,
        });
      });
    }

    // Playlist videos
    const allPlaylistVideos: CoursePlaylistVideo[] = [];
    if (playlist && Array.isArray(playlist.videos)) {
      allPlaylistVideos.push(...playlist.videos);
    }
    attachedPlaylists.forEach((pl) => {
      if (Array.isArray(pl.videos)) {
        pl.videos.forEach((pv) => {
          if (!allPlaylistVideos.some((existing) => existing.id === pv.id)) {
            allPlaylistVideos.push(pv);
          }
        });
      }
    });

    allPlaylistVideos.forEach((pv) => {
      if (!videosList.some((existing) => existing.videoId === pv.id)) {
        videosList.push({
          videoId: pv.id,
          lessonIndex: pv.displayOrder ?? videosList.length,
          chapterTitle: pv.title,
          duration: pv.duration || null,
          youtubeVideoId: pv.youtubeVideoId || null,
          isPlaylistVideo: true,
        });
      }
    });

    // If sub-admin has restricted video assignments, filter to allowed videos only
    const allowedVideosList = isSubAdmin
      ? videosList.filter((v) =>
        scope.isAssignedToVideo(course?.slug || playlist?.courseSlug || '', v.videoId, v.chapterTitle) ||
        scope.isAssignedToVideo(course?.slug || playlist?.courseSlug || '', String(v.lessonIndex), v.chapterTitle)
      )
      : videosList;

    const finalVideos = allowedVideosList.length > 0 ? allowedVideosList : videosList;

    // 5. Gather watch logs
    const relevantSlugs = Array.from(
      new Set(
        [course?.slug, playlist?.courseSlug, target]
          .filter(Boolean)
          .map((s) => s!.toLowerCase())
      )
    );
    const relevantVideoIds = finalVideos.map((v) => v.videoId);

    const queryWhere: any[] = [];
    if (relevantSlugs.length > 0) {
      queryWhere.push({ courseSlug: In(relevantSlugs) });
    }
    if (relevantVideoIds.length > 0) {
      queryWhere.push({ videoId: In(relevantVideoIds) });
    }

    const allWatchLogs = queryWhere.length > 0
      ? await this.videoWatchLogRepo.find({
        where: queryWhere,
        order: { lastWatchedAt: 'DESC' },
      })
      : [];

    // Filter logs for Sub-Admin
    const scopedLogs = isSubAdmin
      ? allWatchLogs.filter((l) =>
        scope.isAssignedToVideo(l.courseSlug || '', l.videoId, l.videoTitle || undefined)
      )
      : allWatchLogs;

    // 6. Aggregate Sub-Views Breakdown
    const subViews = finalVideos.map((v) => {
      const matching = scopedLogs.filter(
        (l) =>
          l.videoId === v.videoId ||
          l.videoId === `${course?.slug}_v${v.lessonIndex}` ||
          l.videoId === String(v.lessonIndex) ||
          (l.videoTitle && l.videoTitle.trim().toLowerCase() === v.chapterTitle.trim().toLowerCase())
      );

      const viewsCount = matching.reduce((sum, l) => sum + (l.timesWatched !== undefined && l.timesWatched !== null ? l.timesWatched : 1), 0);
      const uniqueViewersSet = new Set(matching.map((l) => l.userId).filter(Boolean));
      const completedCount = matching.filter((l) => l.isCompleted || (l.progressPercent || 0) >= 80).length;
      const totalWatchSec = matching.reduce((sum, l) => sum + (l.watchTimeSec || 0), 0);
      const avgWatchSeconds = viewsCount > 0 ? Math.round(totalWatchSec / viewsCount) : 0;

      return {
        videoId: v.videoId,
        lessonIndex: v.lessonIndex,
        chapterTitle: v.chapterTitle,
        duration: v.duration,
        youtubeVideoId: v.youtubeVideoId,
        viewsCount,
        uniqueViewers: uniqueViewersSet.size,
        completedCount,
        avgWatchSeconds,
        totalWatchSeconds: totalWatchSec,
      };
    });

    // 7. Aggregate Course / Playlist Summary
    // Ensure totalViews equals the exact sum of real viewsCount across its sub-views
    const totalViews = subViews.reduce((sum, sv) => sum + (sv.viewsCount || 0), 0);
    const totalWatchSeconds = subViews.reduce((sum, sv) => sum + (sv.totalWatchSeconds || 0), 0);

    // 8. Registered Learners for this Course / Playlist
    const userIdsSet = new Set<string>();
    if (scopedLogs.length > 0) {
      scopedLogs.forEach((l) => {
        if (l.userId && (l.watchTimeSec > 0 || l.timesWatched > 0)) userIdsSet.add(l.userId);
      });

      // Also include enrollments if there is active watch activity
      if (relevantSlugs.length > 0) {
        const enrollments = await this.enrollmentRepo.find({
          where: { courseSlug: In(relevantSlugs) },
        });
        enrollments.forEach((e) => {
          if (e.userId) userIdsSet.add(e.userId);
        });
      }
    }

    const uniqueUserIds = Array.from(userIdsSet);
    const userEntities = uniqueUserIds.length > 0
      ? await this.userRepo.find({
        where: { id: In(uniqueUserIds) },
        select: ['id', 'fullName', 'email', 'role', 'createdAt', 'updatedAt'],
      })
      : [];
    const userMap = new Map(userEntities.map((u) => [u.id, u]));

    const learners = uniqueUserIds
      .map((uid) => {
        const userObj = userMap.get(uid);
        const uLogs = scopedLogs.filter((l) => l.userId === uid);
        const uViews = uLogs.reduce((sum, l) => sum + Math.max(1, l.timesWatched || 1), 0);
        const uWatchSec = uLogs.reduce((sum, l) => sum + (l.watchTimeSec || 0), 0);
        const videosWatchedSet = new Set<string>();
        let latestWatchedAt: Date | null = null;

        uLogs.forEach((l) => {
          if (l.videoTitle) videosWatchedSet.add(safeLabel(l.videoTitle));
          if (l.lastWatchedAt) {
            const t = new Date(l.lastWatchedAt);
            if (!latestWatchedAt || t > latestWatchedAt) latestWatchedAt = t;
          }
        });

        const lastWatchedStr: string | null = latestWatchedAt
          ? (latestWatchedAt as Date).toISOString()
          : (userObj?.updatedAt ? new Date(userObj.updatedAt).toISOString() : userObj?.createdAt ? new Date(userObj.createdAt).toISOString() : null);

        return {
          userId: uid,
          fullName: userObj?.fullName || 'Anonymous User',
          email: userObj?.email || '',
          totalViews: uViews,
          totalWatchSeconds: uWatchSec,
          videosWatched: Array.from(videosWatchedSet),
          lastWatchedAt: lastWatchedStr,
        };
      })
      .sort((a, b) => b.totalWatchSeconds - a.totalWatchSeconds);

    return {
      courseId: course?.id || playlist?.courseId || null,
      courseSlug: course?.slug || playlist?.courseSlug || target,
      courseTitle: course?.courseName || playlist?.title || target,
      playlistId: playlist?.id || null,
      playlistTitle: playlist?.title || null,
      thumbnailUrl: playlist?.thumbnailUrl || course?.thumbnailUrl || null,
      totalViews,
      uniqueLearners: learners.length,
      totalWatchSeconds,
      subViews,
      learners,
    };
  }
}
