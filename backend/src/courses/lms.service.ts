import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { DataSource, In, Repository } from 'typeorm';
import {
  AssessmentAttempt,
  AssignmentSubmission,
  CourseAssignment,
  CourseCertificateEntity,
  CourseEntity,
  CourseEnrollment,
  CoursePlaylist,
  CoursePlaylistVideo,
  CourseProgress,
  CourseRating,
  CourseView,
  LiveClass,
  PaymentRecord,
  SubscriptionPlan,
  StudentQuery,
  User,
  UserSubscription,
  UserVideoWatchLog,
  AdminVideoAssignment,
  VideoTask,
  VideoTaskSubmission,
} from '../entities';

@Injectable()
export class LmsService implements OnModuleInit {
  private readonly logger = new Logger(LmsService.name);

  constructor(
    @InjectRepository(CourseEntity) private readonly courseRepo: Repository<CourseEntity>,
    @InjectRepository(CourseEnrollment) private readonly enrollmentRepo: Repository<CourseEnrollment>,
    @InjectRepository(CourseProgress) private readonly progressRepo: Repository<CourseProgress>,
    @InjectRepository(CourseAssignment) private readonly assignmentRepo: Repository<CourseAssignment>,
    @InjectRepository(AssignmentSubmission) private readonly submissionRepo: Repository<AssignmentSubmission>,
    @InjectRepository(AssessmentAttempt) private readonly attemptRepo: Repository<AssessmentAttempt>,
    @InjectRepository(StudentQuery) private readonly queryRepo: Repository<StudentQuery>,
    @InjectRepository(LiveClass) private readonly liveClassRepo: Repository<LiveClass>,
    @InjectRepository(PaymentRecord) private readonly paymentRepo: Repository<PaymentRecord>,
    @InjectRepository(SubscriptionPlan) private readonly planRepo: Repository<SubscriptionPlan>,
    @InjectRepository(UserSubscription) private readonly userSubRepo: Repository<UserSubscription>,
    @InjectRepository(CourseRating) private readonly ratingRepo: Repository<CourseRating>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(CourseCertificateEntity) private readonly certRepo: Repository<CourseCertificateEntity>,
    private readonly dataSource: DataSource,
  ) { }

  async onModuleInit() {
    try {
      // Ensure column sessionId exists in user_video_watch_logs
      await this.dataSource.query(`
        ALTER TABLE user_video_watch_logs ADD COLUMN IF NOT EXISTS "sessionId" varchar;
      `).catch(() => {});

      // 1. One-time idempotent cleanup of inflated dummy watch logs for 'aaaaaaaaaaaa'
      // and any heartbeat spam rows with timesWatched > 15 or (watchTimeSec <= 1 AND timesWatched > 1)
      await this.dataSource.query(`
        DELETE FROM user_video_watch_logs
        WHERE "courseSlug" = 'aaaaaaaaaaaa'
           OR "timesWatched" > 15
           OR ("watchTimeSec" <= 1 AND "timesWatched" > 1);
      `);

      // 2. Also reset legacy dummy course_views for 'aaaaaaaaaaaa'
      await this.dataSource.query(`
        DELETE FROM course_views WHERE LOWER(TRIM(slug)) = 'aaaaaaaaaaaa';
      `);

      // 3. For any remaining legitimate rows, reset timesWatched to 1 so historical counts are accurate
      await this.dataSource.query(`
        UPDATE user_video_watch_logs
        SET "timesWatched" = 1
        WHERE "timesWatched" > 1;
      `);

      this.logger.log('Idempotent cleanup of inflated view logs and reset to zero completed.');
    } catch (err: any) {
      this.logger.warn(`Could not run view logs cleanup: ${err?.message || err}`);
    }
  }

  // ==========================================
  // 1. STUDENT PROFILE & GOALS
  // ==========================================
  async getStudentProfile(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const enrollments = await this.enrollmentRepo.find({ where: { userId } });
    const progressList = await this.progressRepo.find({ where: { userId } });
    const completedCount = progressList.filter((p) => p.isCompleted).length;

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone || null,
      learningPurpose: user.learningPurpose || '',
      interests: Array.isArray(user.interests) ? user.interests : [],
      createdAt: user.createdAt,
      enrolledCount: enrollments.length,
      completedCount,
    };
  }

  async updateStudentProfile(
    userId: string,
    dto: { fullName?: string; phone?: string; learningPurpose?: string; interests?: string[] },
  ) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.fullName !== undefined) user.fullName = dto.fullName.trim();
    if (dto.phone !== undefined) user.phone = dto.phone ? dto.phone.trim() : null;
    if (dto.learningPurpose !== undefined) user.learningPurpose = dto.learningPurpose ? dto.learningPurpose.trim() : null;
    if (dto.interests !== undefined && Array.isArray(dto.interests)) user.interests = dto.interests;

    await this.userRepo.save(user);
    return this.getStudentProfile(userId);
  }

  // ==========================================
  // 2. ENROLLMENT & COURSE VALIDITY
  // ==========================================
  async enrollStudent(courseSlug: string, user: { id: string; email?: string; fullName?: string }, validityDaysOverride?: number) {
    const cleanSlug = courseSlug.trim().toLowerCase();
    const course = await this.courseRepo.findOne({ where: { slug: cleanSlug } });
    if (!course) throw new NotFoundException(`Course '${courseSlug}' not found`);

    let existing = await this.enrollmentRepo.findOne({
      where: { courseSlug: course.slug, userId: user.id },
    });

    const validityDays = validityDaysOverride || course.validityDays || 365;
    const startDate = new Date();
    const expiryDate = new Date(startDate.getTime() + validityDays * 24 * 60 * 60 * 1000);

    if (existing) {
      // If already enrolled but expired or renewing, extend expiry
      if (existing.expiryDate && new Date(existing.expiryDate).getTime() < Date.now()) {
        existing.startDate = startDate;
        existing.expiryDate = expiryDate;
        existing.validityDays = validityDays;
        existing.status = 'active';
        await this.enrollmentRepo.save(existing);
      }
      return this.formatEnrollmentWithValidity(existing, course);
    }

    const created = this.enrollmentRepo.create({
      courseSlug: course.slug,
      courseId: course.id,
      userId: user.id,
      userEmail: user.email || null,
      userName: user.fullName || null,
      startDate,
      expiryDate,
      validityDays,
      status: 'active',
      amountPaid: Number(course.price || 0),
    });

    await this.enrollmentRepo.save(created);
    return this.formatEnrollmentWithValidity(created, course);
  }

  async getEnrollmentValidity(courseSlug: string, userId: string) {
    const cleanSlug = courseSlug.trim().toLowerCase();
    const enrollment = await this.enrollmentRepo.findOne({
      where: { courseSlug: cleanSlug, userId },
    });
    if (!enrollment) {
      return { enrolled: false, isExpired: false, status: 'none' };
    }

    const now = Date.now();
    const isExpired = enrollment.expiryDate ? new Date(enrollment.expiryDate).getTime() < now : false;
    const daysRemaining = enrollment.expiryDate
      ? Math.max(0, Math.ceil((new Date(enrollment.expiryDate).getTime() - now) / (1000 * 60 * 60 * 24)))
      : null;

    return {
      enrolled: true,
      id: enrollment.id,
      startDate: enrollment.startDate || enrollment.createdAt,
      expiryDate: enrollment.expiryDate,
      validityDays: enrollment.validityDays || 365,
      isExpired,
      daysRemaining,
      status: isExpired ? 'expired' : enrollment.status || 'active',
    };
  }

  private formatEnrollmentWithValidity(enrollment: CourseEnrollment, course?: CourseEntity) {
    const now = Date.now();
    const isExpired = enrollment.expiryDate ? new Date(enrollment.expiryDate).getTime() < now : false;
    const daysRemaining = enrollment.expiryDate
      ? Math.max(0, Math.ceil((new Date(enrollment.expiryDate).getTime() - now) / (1000 * 60 * 60 * 24)))
      : null;

    return {
      ...enrollment,
      isExpired,
      daysRemaining,
      status: isExpired ? 'expired' : enrollment.status || 'active',
      courseName: course?.courseName || enrollment.courseSlug,
    };
  }

  // ==========================================
  // 3. STUDENT PROGRESS TRACKING (ANTI-SKIP & SEQUENTIAL UNLOCK)
  // ==========================================
  async getStudentProgress(courseSlug: string, userId: string) {
    const cleanSlug = courseSlug.trim().toLowerCase();
    const course = await this.courseRepo.findOne({ where: { slug: cleanSlug } });
    if (!course) throw new NotFoundException('Course not found');

    let progress = await this.progressRepo.findOne({
      where: { courseSlug: cleanSlug, userId },
    });

    if (!progress) {
      progress = this.progressRepo.create({
        courseSlug: cleanSlug,
        courseId: course.id,
        userId,
        completedLessons: [],
        completedVideos: [],
        checkpointsPassed: {},
        lessonMaxWatched: {},
        progressPercent: 0,
        watchTimeSec: 0,
        lastAccessedLessonIndex: 0,
        lastAccessedLessonTitle: '',
        isCompleted: false,
      });
      await this.progressRepo.save(progress);
    }

    const totalLessons = Array.isArray(course.lessons) && course.lessons.length > 0 ? course.lessons.length : 1;
    const completedSet = new Set((progress.completedLessons || []).map(String));
    const strictNonSkippable = course.strictNonSkippable !== false;
    let unlockedLessonIndex = totalLessons - 1;
    if (strictNonSkippable) {
      unlockedLessonIndex = 0;
      for (let i = 0; i < totalLessons; i++) {
        if (completedSet.has(String(i))) {
          unlockedLessonIndex = Math.min(totalLessons - 1, i + 1);
        } else {
          break;
        }
      }
    }

    const validity = await this.getEnrollmentValidity(cleanSlug, userId);

    return {
      ...progress,
      validity,
      totalLessons,
      unlockedLessonIndex,
      strictNonSkippable,
      requireProjectForCertificate: course.requireProjectForCertificate !== false,
    };
  }

  async saveStudentProgress(
    courseSlug: string,
    userId: string,
    dto: {
      lessonIndex?: number;
      lessonTitle?: string;
      markLessonDone?: boolean;
      checkpointKey?: string;
      checkpointPassed?: boolean;
      watchTimeDeltaSec?: number;
      watchTimeSec?: number;
      watchedSeconds?: number;
      durationSeconds?: number;
      ended?: boolean;
      lastPositionSec?: number;
      positionSec?: number;
      sessionId?: string;
      isNewSession?: boolean;
      videoId?: string;
      chapterId?: string;
    },
  ) {
    const cleanSlug = courseSlug.trim().toLowerCase();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSlug);
    let course = await this.courseRepo.findOne({
      where: isUuid ? [{ id: cleanSlug }, { slug: cleanSlug }] : [{ slug: cleanSlug }],
    });

    let isPlaylist = false;
    let playlistItem: any = null;

    if (!course) {
      try {
        const plRepo = this.dataSource.getRepository(CoursePlaylist);
        playlistItem = await plRepo
          .createQueryBuilder('pl')
          .leftJoinAndSelect('pl.videos', 'video')
          .where(isUuid ? 'pl.id = :cleanSlug' : 'pl.id = :cleanSlug OR pl.courseSlug = :cleanSlug', { cleanSlug })
          .orderBy('video.displayOrder', 'ASC')
          .getOne();
        if (playlistItem) isPlaylist = true;
      } catch {}
    }

    if (!course && !playlistItem) throw new NotFoundException('Course or playlist not found');

    const effectiveSlug = course ? course.slug : (playlistItem.id || cleanSlug);
    const effectiveId = course ? course.id : playlistItem.id;
    const strictNonSkippable = course ? course.strictNonSkippable !== false : true;

    // Ensure enrollment exists when saving progress
    try {
      let enr = await this.enrollmentRepo.findOne({
        where: { courseSlug: effectiveSlug, userId },
      });
      if (!enr) {
        enr = this.enrollmentRepo.create({
          courseSlug: effectiveSlug,
          courseId: effectiveId,
          itemType: isPlaylist ? 'playlist' : 'course',
          playlistId: isPlaylist ? effectiveId : null,
          userId,
          status: 'active',
          validityDays: 365,
          startDate: new Date(),
          expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          amountPaid: 0,
        });
        await this.enrollmentRepo.save(enr);
      }
    } catch {}

    let progress = await this.progressRepo.findOne({
      where: { courseSlug: effectiveSlug, userId },
    });

    if (!progress) {
      progress = this.progressRepo.create({
        courseSlug: effectiveSlug,
        courseId: effectiveId,
        itemType: isPlaylist ? 'playlist' : 'course',
        playlistId: isPlaylist ? effectiveId : null,
        userId,
        completedLessons: [],
        completedVideos: [],
        checkpointsPassed: {},
        lessonMaxWatched: {},
        progressPercent: 0,
        watchTimeSec: 0,
        lastAccessedLessonIndex: 0,
        lastAccessedLessonTitle: '',
        isCompleted: false,
      });
    }

    const completedSet = new Set(Array.isArray(progress.completedLessons) ? progress.completedLessons.map(String) : []);
    const completedVideosSet = new Set(Array.isArray(progress.completedVideos) ? progress.completedVideos.map(String) : []);
    const checkpointsObj = { ...(progress.checkpointsPassed || {}) };
    const lessonMaxWatched: Record<string, number> = { ...(progress.lessonMaxWatched || {}) };

    const lessonIdx = dto.lessonIndex !== undefined ? Math.max(0, Number(dto.lessonIndex)) : undefined;
    const lessonKey = lessonIdx !== undefined ? String(lessonIdx) : '0';
    const resolvedVideoId =
      dto.videoId ||
      dto.chapterId ||
      (isPlaylist ? playlistItem?.videos?.[lessonIdx ?? 0]?.id : null) ||
      `${effectiveSlug}_v${lessonIdx ?? 0}`;

    // Sequential lesson lock check when strictNonSkippable is enabled
    if (strictNonSkippable && lessonIdx !== undefined && lessonIdx > 0) {
      const prevIdxKey = String(lessonIdx - 1);
      const prevVideoId = isPlaylist ? playlistItem?.videos?.[lessonIdx - 1]?.id : null;
      const isPrevDone =
        completedSet.has(prevIdxKey) ||
        (prevVideoId && completedVideosSet.has(String(prevVideoId)));
      const isCurrentAlreadyUnlocked =
        completedSet.has(String(lessonIdx)) ||
        completedVideosSet.has(String(resolvedVideoId));
      if (!isPrevDone && !isCurrentAlreadyUnlocked) {
        throw new BadRequestException(
          `Lesson ${lessonIdx + 1} is locked. Complete Lesson ${lessonIdx} first.`,
        );
      }
    }

    // Lookup existing watch log to enforce anti-skip ceiling (+10s buffer)
    const watchRepo = this.dataSource.getRepository(UserVideoWatchLog);
    const existingLog = await watchRepo
      .findOne({ where: { userId, videoId: resolvedVideoId }, order: { lastWatchedAt: 'DESC' } })
      .catch(() => null);

    const prevMaxWatched = Math.max(
      0,
      Number(lessonMaxWatched[lessonKey] || 0),
      Number(lessonMaxWatched[resolvedVideoId] || 0),
      Number(existingLog?.maxWatchedSeconds || 0),
    );

    const rawReported =
      dto.watchedSeconds !== undefined
        ? Number(dto.watchedSeconds)
        : dto.lastPositionSec !== undefined
          ? Number(dto.lastPositionSec)
          : dto.positionSec !== undefined
            ? Number(dto.positionSec)
            : undefined;
    const reportedSec =
      rawReported !== undefined && !isNaN(rawReported) ? Math.max(0, Math.round(rawReported)) : undefined;

    const durationSec = Math.max(
      0,
      Math.round(Number(dto.durationSeconds ?? existingLog?.videoDurationSec ?? 0) || 0),
    );

    // Reject forward jumps beyond +10s buffer when strictNonSkippable is active
    if (strictNonSkippable && reportedSec !== undefined && reportedSec > prevMaxWatched + 10) {
      throw new BadRequestException(
        `Skipping ahead is not allowed on this course. Current verified watch progress is ${prevMaxWatched}s (max forward jump allowed: +10s).`,
      );
    }

    const newMaxWatched = reportedSec !== undefined ? Math.max(prevMaxWatched, reportedSec) : prevMaxWatched;
    lessonMaxWatched[lessonKey] = newMaxWatched;
    lessonMaxWatched[resolvedVideoId] = newMaxWatched;

    const has95Percent = durationSec > 0 && newMaxWatched >= Math.floor(durationSec * 0.95);
    const endedAfterPlayback =
      dto.ended === true &&
      (durationSec === 0
        ? (!strictNonSkippable || newMaxWatched > 0 || Number(dto.watchTimeDeltaSec || 0) > 0)
        : newMaxWatched >= Math.floor(durationSec * 0.9));
    const lessonQualifiedComplete = has95Percent || endedAfterPlayback;

    if (lessonIdx !== undefined) {
      progress.lastAccessedLessonIndex = lessonIdx;
      if (dto.lessonTitle) progress.lastAccessedLessonTitle = dto.lessonTitle;

      if (dto.markLessonDone) {
        if (strictNonSkippable && durationSec > 0 && !lessonQualifiedComplete && !completedSet.has(String(lessonIdx))) {
          throw new BadRequestException(
            `Cannot mark lesson complete yet. Watch at least 95% of the video (${Math.floor(durationSec * 0.95)}s required, ${newMaxWatched}s watched).`,
          );
        }
        if (!strictNonSkippable || lessonQualifiedComplete || durationSec === 0) {
          completedSet.add(String(lessonIdx));
          if (isPlaylist && playlistItem?.videos?.[lessonIdx]?.id) {
            completedVideosSet.add(String(playlistItem.videos[lessonIdx].id));
          }
        }
      } else if (lessonQualifiedComplete) {
        completedSet.add(String(lessonIdx));
        if (isPlaylist && playlistItem?.videos?.[lessonIdx]?.id) {
          completedVideosSet.add(String(playlistItem.videos[lessonIdx].id));
        }
      }
    }

    if (reportedSec !== undefined) {
      progress.lastPositionSec = Math.min(reportedSec, newMaxWatched);
    }

    if (dto.checkpointKey && dto.checkpointPassed !== undefined) {
      checkpointsObj[dto.checkpointKey] = !!dto.checkpointPassed;
    }

    if (dto.watchTimeDeltaSec && dto.watchTimeDeltaSec > 0) {
      progress.watchTimeSec = (progress.watchTimeSec || 0) + Math.min(dto.watchTimeDeltaSec, 1800); // capped delta
    } else if (dto.watchTimeSec !== undefined && dto.watchTimeSec > 0) {
      progress.watchTimeSec = Math.max(progress.watchTimeSec || 0, Math.round(Number(dto.watchTimeSec)));
    }

    progress.completedLessons = Array.from(completedSet);
    progress.completedVideos = Array.from(completedVideosSet);
    progress.checkpointsPassed = checkpointsObj;
    progress.lessonMaxWatched = lessonMaxWatched;

    // Calculate progress percentage
    const totalLessons = isPlaylist
      ? (Array.isArray(playlistItem?.videos) && playlistItem.videos.length > 0 ? playlistItem.videos.length : 1)
      : (Array.isArray(course?.lessons) && course.lessons.length > 0 ? course.lessons.length : 1);
    const completedCount = isPlaylist
      ? Math.max(progress.completedLessons.length, progress.completedVideos.length)
      : progress.completedLessons.length;
    const calculatedPct = Math.min(100, Math.round((completedCount / totalLessons) * 100));

    progress.progressPercent = calculatedPct;

    if (calculatedPct === 100 && !progress.isCompleted) {
      progress.isCompleted = true;
      progress.completedAt = new Date();
    }

    let saved = progress;
    try {
      saved = await this.progressRepo.save(progress);
    } catch (err: any) {
      if (err?.code === '23505' || String(err?.message || '').includes('duplicate key')) {
        const fresh = await this.progressRepo.findOne({
          where: { courseSlug: effectiveSlug, userId },
        });
        if (fresh) {
          progress.id = fresh.id;
          saved = await this.progressRepo.save(progress);
        } else {
          throw err;
        }
      } else {
        throw err;
      }
    }

    // Track detailed per-video watch progress in user_video_watch_logs
    const lessonMarkedDone =
      (lessonIdx !== undefined && completedSet.has(String(lessonIdx))) ||
      completedVideosSet.has(String(resolvedVideoId));
    try {
      const vTitle =
        dto.lessonTitle ||
        (lessonIdx !== undefined &&
          (isPlaylist ? playlistItem?.videos?.[lessonIdx]?.title : course?.lessons?.[lessonIdx]?.t)) ||
        progress.lastAccessedLessonTitle ||
        'Main Lesson';
      const sessionId = dto.sessionId || null;
      const isNewSession = Boolean(dto.isNewSession);

      let log: UserVideoWatchLog | null = null;
      if (sessionId) {
        log = await watchRepo.findOne({
          where: { userId, videoId: resolvedVideoId, sessionId },
        });
      }
      if (!log && !isNewSession) {
        const recent = await watchRepo.findOne({
          where: { userId, videoId: resolvedVideoId },
          order: { lastWatchedAt: 'DESC' },
        });
        if (recent) {
          const diffMs = Date.now() - new Date(recent.lastWatchedAt).getTime();
          if (diffMs < 30 * 60 * 1000) {
            log = recent;
          }
        }
      }

      const computedVideoPct =
        lessonMarkedDone
          ? 100
          : durationSec > 0
            ? Math.min(100, Math.round((newMaxWatched / durationSec) * 100))
            : (calculatedPct || 0);

      if (!log) {
        log = watchRepo.create({
          userId,
          videoId: resolvedVideoId,
          sessionId: sessionId || undefined,
          videoTitle: vTitle,
          courseSlug: effectiveSlug,
          courseTitle: isPlaylist
            ? (playlistItem?.title || effectiveSlug)
            : (typeof course?.courseName === 'string' ? course.courseName : effectiveSlug),
          watchTimeSec: Math.max(0, dto.watchTimeDeltaSec || dto.watchTimeSec || 0),
          maxWatchedSeconds: newMaxWatched,
          videoDurationSec: durationSec,
          lastPositionSec: reportedSec ?? 0,
          isCompleted: lessonMarkedDone,
          progressPercent: computedVideoPct,
          timesWatched: 1,
        });
      } else {
        if (dto.watchTimeDeltaSec && dto.watchTimeDeltaSec > 0) {
          log.watchTimeSec = (log.watchTimeSec || 0) + dto.watchTimeDeltaSec;
        } else if (dto.watchTimeSec && dto.watchTimeSec > (log.watchTimeSec || 0)) {
          log.watchTimeSec = dto.watchTimeSec;
        }
        log.maxWatchedSeconds = Math.max(log.maxWatchedSeconds || 0, newMaxWatched);
        if (durationSec > 0) {
          log.videoDurationSec = Math.max(log.videoDurationSec || 0, durationSec);
        }
        if (reportedSec !== undefined) log.lastPositionSec = Math.min(reportedSec, log.maxWatchedSeconds);
        if (lessonMarkedDone) {
          log.isCompleted = true;
          log.progressPercent = 100;
        } else {
          log.progressPercent = Math.max(log.progressPercent || 0, computedVideoPct);
        }
        if (sessionId && !log.sessionId) {
          log.sessionId = sessionId;
        }
        log.lastWatchedAt = new Date();
      }
      await watchRepo.save(log);
    } catch (e: any) {
      // Non-blocking catch so progress save never fails
    }

    const validity = await this.getEnrollmentValidity(effectiveSlug, userId);
    const certificateStatus = await this.evaluateAndIssueCertificate(userId, effectiveSlug).catch(() => null);

    return {
      ...saved,
      maxWatchedSeconds: newMaxWatched,
      completed: lessonMarkedDone,
      strictNonSkippable,
      validity,
      totalLessons,
      certificateStatus,
      certificate: certificateStatus?.certificate || null,
    };
  }

  async recordVideoWatch(userId: string, body: any) {
    const cleanSlug = (body.courseSlug || '').trim().toLowerCase();
    const course = await this.courseRepo.findOne({ where: { slug: cleanSlug } });
    if (!course) {
      try {
        const plRepo = this.dataSource.getRepository(CoursePlaylist);
        const playlist = await plRepo.findOne({
          where: [{ id: cleanSlug }, { courseSlug: cleanSlug }],
        });
        if (!playlist) return { ok: false, message: 'Course or playlist not found' };
      } catch {
        return { ok: false, message: 'Course not found' };
      }
    }

    return this.saveStudentProgress(cleanSlug, userId, {
      ...body,
      isNewSession: body.isNewSession !== undefined ? body.isNewSession : true,
    });
  }

  // Enrolled courses & playlists for current student with live progress & validity
  async getMyLearningCourses(userId: string) {
    const enrollments = await this.enrollmentRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (enrollments.length === 0) return [];

    const slugs = enrollments.map((e) => e.courseSlug);
    const courses = await this.courseRepo.find({
      where: { slug: In(slugs) },
    });
    const courseMap = new Map(courses.map((c) => [c.slug.toLowerCase(), c]));

    // Also look up matching playlists
    let playlists: any[] = [];
    try {
      const plRepo = this.dataSource.getRepository(CoursePlaylist);
      playlists = await plRepo
        .createQueryBuilder('pl')
        .leftJoinAndSelect('pl.videos', 'video')
        .where('pl.id IN (:...slugs) OR pl.courseSlug IN (:...slugs)', { slugs })
        .orderBy('video.displayOrder', 'ASC')
        .getMany();
    } catch {}
    const playlistMap = new Map<string, any>();
    playlists.forEach((pl) => {
      if (pl.id) playlistMap.set(pl.id.toLowerCase(), pl);
      if (pl.courseSlug) playlistMap.set(pl.courseSlug.toLowerCase(), pl);
    });

    const progressList = await this.progressRepo.find({
      where: { userId, courseSlug: In(slugs) },
    });
    const progressMap = new Map(progressList.map((p) => [p.courseSlug.toLowerCase(), p]));

    const now = Date.now();

    return enrollments.map((enrollment) => {
      const c = courseMap.get(enrollment.courseSlug.toLowerCase());
      const pl = playlistMap.get(enrollment.courseSlug.toLowerCase());
      const p = progressMap.get(enrollment.courseSlug.toLowerCase());

      const isPlaylist = enrollment.itemType === 'playlist' || Boolean(pl);
      const isExpired = enrollment.expiryDate ? new Date(enrollment.expiryDate).getTime() < now : false;
      const daysRemaining = enrollment.expiryDate
        ? Math.max(0, Math.ceil((new Date(enrollment.expiryDate).getTime() - now) / (1000 * 60 * 60 * 24)))
        : null;

      const totalLessons = isPlaylist
        ? (Array.isArray(pl?.videos) && pl.videos.length > 0 ? pl.videos.length : 1)
        : (Array.isArray(c?.lessons) && c.lessons.length > 0 ? c.lessons.length : 1);

      const completedLessons = Array.isArray(p?.completedLessons) ? p.completedLessons : [];
      const completedVideos = Array.isArray(p?.completedVideos) ? p.completedVideos : [];

      let pct = p?.progressPercent ?? 0;
      if (pct === 0 && (completedLessons.length > 0 || completedVideos.length > 0)) {
        const count = isPlaylist ? Math.max(completedLessons.length, completedVideos.length) : completedLessons.length;
        pct = Math.min(100, Math.round((count / totalLessons) * 100));
      }

      const displayTitle = isPlaylist
        ? (pl?.title || c?.courseName || enrollment.courseSlug)
        : (c?.courseName || enrollment.courseSlug);

      const displayCategory = isPlaylist
        ? (pl?.category || c?.category || 'general')
        : (c?.category || 'general');

      const displayImg = isPlaylist
        ? (pl?.thumbnailUrl || c?.image || c?.thumbnailUrl || null)
        : (c?.image || c?.thumbnailUrl || null);

      const displayShort = isPlaylist
        ? (pl?.shortDescription || pl?.description || c?.shortDescription || '')
        : (c?.shortDescription || '');

      return {
        id: enrollment.id,
        itemType: isPlaylist ? 'playlist' : 'course',
        courseSlug: enrollment.courseSlug,
        playlistId: pl?.id || (isPlaylist ? enrollment.courseSlug : null),
        courseName: displayTitle,
        category: displayCategory,
        level: isPlaylist ? (pl?.level || 'Beginner') : (c?.level || 'Beginner'),
        image: displayImg,
        thumbnailUrl: displayImg,
        gradient: c?.gradient || 'from-brand-forest via-brand-deep to-brand-darker',
        shortDescription: displayShort,
        startDate: enrollment.startDate || enrollment.createdAt,
        expiryDate: enrollment.expiryDate,
        validityDays: enrollment.validityDays || 365,
        isExpired,
        daysRemaining,
        status: isExpired ? 'expired' : enrollment.status || 'active',
        progressPercent: pct,
        isCompleted: p?.isCompleted || pct === 100,
        completedAt: p?.completedAt || null,
        completedLessonsCount: completedLessons.length,
        completedVideosCount: completedVideos.length,
        totalLessons,
        videosCount: isPlaylist && Array.isArray(pl?.videos) ? pl.videos.length : null,
        watchTimeSec: p?.watchTimeSec || 0,
        lastAccessedLessonIndex: p?.lastAccessedLessonIndex || 0,
        lastAccessedLessonTitle: p?.lastAccessedLessonTitle || (isPlaylist ? pl?.videos?.[p?.lastAccessedLessonIndex || 0]?.title : (Array.isArray(c?.lessons) && c.lessons[p?.lastAccessedLessonIndex || 0]?.t)) || '',
        lastPositionSec: p?.lastPositionSec || 0,
        updatedAt: p?.updatedAt || enrollment.updatedAt,
      };
    });
  }

  // Delete/unenroll a course from student's My Learning list
  async deleteMyLearningCourse(courseSlug: string, userId: string) {
    const cleanSlug = courseSlug.trim().toLowerCase();
    await this.enrollmentRepo.delete({ courseSlug: cleanSlug, userId });
    await this.progressRepo.delete({ courseSlug: cleanSlug, userId });
    return { success: true, message: 'Course removed from My Learning' };
  }

  // ==========================================
  // 4. ASSESSMENTS / QUIZZES
  // ==========================================
  async submitAssessment(
    courseSlug: string,
    user: { id: string; email?: string; fullName?: string },
    dto: { answers?: Record<string, any>; score?: number; totalMarks?: number },
  ) {
    const cleanSlug = courseSlug.trim().toLowerCase();
    const course = await this.courseRepo.findOne({ where: { slug: cleanSlug } });
    if (!course) throw new NotFoundException('Course not found');

    const submittedAnswers: Record<string, any> = dto.answers || {};

    // 1. Retrieve official course questions from PostgreSQL
    let storedQuestions: any[] = [];
    if (Array.isArray(course.assessments) && course.assessments.length > 0) {
      storedQuestions = course.assessments;
    }

    // 2. Identify evaluated questions from submitted answers
    const submittedKeys = Object.keys(submittedAnswers);
    let evaluatedQuestions: any[] = [];

    if (submittedKeys.length > 0 && storedQuestions.length > 0) {
      // Find matching stored questions by ID (handling number or string ID)
      evaluatedQuestions = storedQuestions.filter((q) => {
        const qIdStr = String(q.id ?? '');
        return submittedKeys.some((k) => String(k).trim() === qIdStr.trim());
      });
    }

    // If no specific subset matched, evaluate against all stored course questions
    if (evaluatedQuestions.length === 0 && storedQuestions.length > 0) {
      evaluatedQuestions = storedQuestions;
    }

    // 3. Server-side score verification
    let verifiedCorrect = 0;
    let totalQuestions = evaluatedQuestions.length;

    if (totalQuestions > 0) {
      for (const q of evaluatedQuestions) {
        const qIdStr = String(q.id ?? '');
        const userAnswer = submittedAnswers[q.id] ?? submittedAnswers[qIdStr];

        if (userAnswer !== undefined && userAnswer !== null && userAnswer !== '') {
          const correctVal = q.correct;
          const options = Array.isArray(q.options) ? q.options : [];

          let isMatch = false;

          // Case A: Correct answer is a 0-based option index
          if (typeof correctVal === 'number' || (!isNaN(Number(correctVal)) && String(correctVal).trim() !== '')) {
            const correctIdx = Number(correctVal);
            if (Number(userAnswer) === correctIdx) {
              isMatch = true;
            } else if (typeof userAnswer === 'string' && options[correctIdx]) {
              isMatch = userAnswer.trim().toLowerCase() === String(options[correctIdx]).trim().toLowerCase();
            }
          }

          // Case B: Correct answer is the direct option string
          if (!isMatch && typeof correctVal === 'string') {
            if (String(userAnswer).trim().toLowerCase() === correctVal.trim().toLowerCase()) {
              isMatch = true;
            }
          }

          if (isMatch) {
            verifiedCorrect++;
          }
        }
      }
    } else {
      // If no questions exist on this course at all, fall back to safe bounded inputs
      totalQuestions = Math.max(1, Number(dto.totalMarks) || 1);
      verifiedCorrect = Math.min(totalQuestions, Math.max(0, Number(dto.score) || 0));
    }

    const verifiedScore = verifiedCorrect;
    const totalMarks = totalQuestions;
    const percentage = Math.round((verifiedScore / totalMarks) * 100);

    const passingScore = Number(course.assessmentSettings?.passingScore ?? 70);
    const passed = percentage >= passingScore;

    // 4. Persist verified attempt to PostgreSQL
    const attempt = this.attemptRepo.create({
      courseSlug: cleanSlug,
      userId: user.id,
      userName: user.fullName || user.email || 'Student',
      userEmail: user.email || null,
      score: verifiedScore,
      totalMarks,
      percentage,
      passed,
      answers: submittedAnswers,
    });

    await this.attemptRepo.save(attempt);

    // 5. If passed, record progress checkpoint and evaluate certificate eligibility
    let certificateStatus: any = null;
    if (passed) {
      await this.saveStudentProgress(cleanSlug, user.id, {
        checkpointKey: 'final-assessment',
        checkpointPassed: true,
      });
      certificateStatus = await this.evaluateAndIssueCertificate(user.id, cleanSlug).catch(() => null);
    }

    return {
      success: true,
      attemptId: attempt.id,
      score: verifiedScore,
      totalMarks,
      percentage,
      passed,
      passingScore,
      verifiedServerSide: true,
      createdAt: attempt.createdAt,
      certificateStatus,
      certificate: certificateStatus?.certificate || null,
    };
  }

  async getMyAssessmentAttempts(courseSlug: string, userId: string) {
    const cleanSlug = courseSlug.trim().toLowerCase();
    return this.attemptRepo.find({
      where: { courseSlug: cleanSlug, userId },
      order: { createdAt: 'DESC' },
    });
  }

  // ==========================================
  // 5. ASSIGNMENTS & AUTO-VERIFICATION
  // ==========================================
  async getCourseAssignments(courseSlug: string) {
    const cleanSlug = courseSlug.trim().toLowerCase();
    return this.assignmentRepo.find({
      where: { courseSlug: cleanSlug, published: true },
      order: { createdAt: 'ASC' },
    });
  }

  private hasValidProjectPayload(submissionData: any): boolean {
    if (!submissionData) return false;
    if (typeof submissionData === 'string') return submissionData.trim().length > 0;
    if (typeof submissionData === 'object') {
      const candidates = [
        submissionData.fileUrl,
        submissionData.url,
        submissionData.projectUrl,
        submissionData.link,
        submissionData.githubUrl,
        submissionData.text,
        submissionData.description,
        submissionData.workDescription,
        submissionData.answer,
        submissionData.notes,
      ];
      if (candidates.some((v) => typeof v === 'string' && v.trim().length > 0)) return true;
      if (Array.isArray(submissionData.files) && submissionData.files.length > 0) return true;
      if (Array.isArray(submissionData.answers) && submissionData.answers.length > 0) return true;
      return Object.values(submissionData).some((v) => v !== null && v !== undefined && String(v).trim().length > 0);
    }
    return false;
  }

  async submitAssignment(
    assignmentId: string,
    user: { id: string; email?: string; fullName?: string },
    submissionData: any,
  ) {
    const assignment = await this.assignmentRepo.findOne({ where: { id: assignmentId } });
    if (!assignment) throw new NotFoundException('Assignment not found');

    if (!this.hasValidProjectPayload(submissionData)) {
      throw new BadRequestException('Please attach a valid project file, URL, or answer before submitting.');
    }

    const now = new Date();
    let submission = await this.submissionRepo.findOne({
      where: { assignmentId, userId: user.id },
    });

    if (submission) {
      submission.submissionData = submissionData;
      submission.status = 'APPROVED';
      submission.verifiedBy = 'SYSTEM_AUTO_VERIFY';
      submission.reviewedAt = now;
      await this.submissionRepo.save(submission);
    } else {
      submission = this.submissionRepo.create({
        assignmentId,
        userId: user.id,
        courseSlug: assignment.courseSlug,
        userName: user.fullName || user.email || 'Student',
        userEmail: user.email || null,
        submissionData,
        status: 'APPROVED',
        verifiedBy: 'SYSTEM_AUTO_VERIFY',
        reviewedAt: now,
      });
      await this.submissionRepo.save(submission);
    }

    const certificateStatus = await this.evaluateAndIssueCertificate(user.id, assignment.courseSlug).catch(() => null);

    return {
      success: true,
      status: 'APPROVED',
      verifiedBy: 'SYSTEM_AUTO_VERIFY',
      autoVerified: true,
      submission,
      certificateStatus,
      certificate: certificateStatus?.certificate || null,
    };
  }

  async getMyAssignmentSubmissions(userId: string, courseSlug?: string) {
    const where: any = { userId };
    if (courseSlug) where.courseSlug = courseSlug.trim().toLowerCase();
    return this.submissionRepo.find({ where, order: { updatedAt: 'DESC' } });
  }

  // ==========================================
  // 6. STUDENT QUERIES / SUPPORT
  // ==========================================
  async createStudentQuery(
    user: { id: string; email?: string; fullName?: string },
    dto: { subject: string; message: string; category?: string; courseSlug?: string },
  ) {
    if (!dto.subject || !dto.message) {
      throw new BadRequestException('Subject and message are required.');
    }

    const query = this.queryRepo.create({
      userId: user.id,
      userName: user.fullName || user.email || 'Student',
      userEmail: user.email || null,
      courseSlug: dto.courseSlug ? dto.courseSlug.trim().toLowerCase() : null,
      category: dto.category || 'general',
      subject: dto.subject.trim(),
      message: dto.message.trim(),
      status: 'Pending',
    });

    return this.queryRepo.save(query);
  }

  async getMyQueries(userId: string) {
    const list = await this.queryRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    const allCourses = await this.courseRepo.find({ select: ['id', 'slug', 'courseName'] });
    const courseMap = new Map<string, string>();
    allCourses.forEach((c) => {
      if (c.slug) courseMap.set(c.slug.toLowerCase(), c.courseName);
      if (c.id) courseMap.set(c.id, c.courseName);
    });

    return list.map((q) => ({
      ...q,
      courseName: q.courseSlug ? (courseMap.get(q.courseSlug.toLowerCase()) || q.courseSlug) : 'General',
    }));
  }

  async getMyRecentActivity(userId: string) {
    const activities: any[] = [];

    // 1. Course Enrollments
    const enrollments = await this.enrollmentRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });
    const slugs = enrollments.map((e) => e.courseSlug);
    const courses = slugs.length > 0
      ? await this.courseRepo.find({ where: { slug: In(slugs) } })
      : [];
    const courseMap = new Map(courses.map((c) => [c.slug.toLowerCase(), c.courseName]));

    enrollments.forEach((e) => {
      activities.push({
        id: `enroll-${e.id}`,
        type: 'course_enrolled',
        title: 'Enrolled in Course',
        detail: courseMap.get(e.courseSlug.toLowerCase()) || e.courseSlug,
        courseSlug: e.courseSlug,
        icon: 'school',
        color: 'text-brand-forest',
        bgColor: 'bg-brand-surface',
        date: e.createdAt,
      });
    });

    // 2. Course Progress / Chapter Completed / Watched
    const progressList = await this.progressRepo.find({
      where: { userId },
      order: { updatedAt: 'DESC' },
      take: 10,
    });

    progressList.forEach((p) => {
      const cName = courseMap.get(p.courseSlug.toLowerCase()) || p.courseSlug;
      if (p.isCompleted && p.completedAt) {
        activities.push({
          id: `comp-${p.id}`,
          type: 'course_completed',
          title: 'Course Completed! 🎉',
          detail: `Finished 100% of ${cName}`,
          courseSlug: p.courseSlug,
          icon: 'emoji_events',
          color: 'text-amber-700',
          bgColor: 'bg-amber-50',
          date: p.completedAt,
        });
      } else if (p.lastAccessedLessonTitle) {
        activities.push({
          id: `prog-${p.id}`,
          type: 'lesson_watched',
          title: 'Studied Chapter',
          detail: `${p.lastAccessedLessonTitle} (${cName})`,
          courseSlug: p.courseSlug,
          icon: 'play_circle',
          color: 'text-emerald-700',
          bgColor: 'bg-emerald-50',
          date: p.updatedAt,
        });
      }
    });

    // 3. Student Support Queries / Doubts
    const queries = await this.queryRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 10,
    });

    queries.forEach((q) => {
      activities.push({
        id: `query-${q.id}`,
        type: 'query_submitted',
        title: 'Asked a Doubt / Support Query',
        detail: q.subject,
        courseSlug: q.courseSlug,
        icon: 'help',
        color: 'text-teal-700',
        bgColor: 'bg-teal-50',
        date: q.createdAt,
      });

      if (q.resolvedAt && q.adminReply) {
        activities.push({
          id: `query-ans-${q.id}`,
          type: 'query_answered',
          title: 'Mentor Answered Query',
          detail: `Re: ${q.subject}`,
          courseSlug: q.courseSlug,
          icon: 'mark_chat_read',
          color: 'text-blue-700',
          bgColor: 'bg-blue-50',
          date: q.resolvedAt,
        });
      }
    });

    // 4. Assessment Attempts
    try {
      const attempts = await this.attemptRepo.find({
        where: { userId },
        order: { createdAt: 'DESC' },
        take: 10,
      });

      attempts.forEach((a) => {
        const cName = courseMap.get(a.courseSlug?.toLowerCase()) || a.courseSlug || 'Course';
        activities.push({
          id: `attempt-${a.id}`,
          type: 'assessment_attempted',
          title: a.passed ? 'Passed Course Assessment! ✅' : 'Attempted Course Assessment',
          detail: `Scored ${a.score}/${a.totalMarks} (${a.percentage}%) in ${cName}`,
          courseSlug: a.courseSlug,
          icon: a.passed ? 'task_alt' : 'quiz',
          color: a.passed ? 'text-emerald-700' : 'text-purple-700',
          bgColor: a.passed ? 'bg-emerald-50' : 'bg-purple-50',
          date: a.createdAt,
        });
      });
    } catch {}

    // Sort all by timestamp descending and take top 15
    return activities
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15);
  }

  // ==========================================
  // 7. LIVE CLASSES
  // ==========================================
  async getUpcomingLiveClasses(courseSlug?: string) {
    const where: any = { isPublished: true };
    if (courseSlug) where.courseSlug = courseSlug.trim().toLowerCase();
    return this.liveClassRepo.find({
      where,
      order: { scheduledAt: 'ASC' },
    });
  }

  // ==========================================
  // 8. SUBSCRIPTIONS & PAYMENTS
  // ==========================================
  async getSubscriptionPlans() {
    const plans = await this.planRepo.find({ order: { price: 'ASC' } });
    if (plans.length === 0) {
      // Seed default monthly and yearly plans if none exist
      const p1 = await this.planRepo.save(
        this.planRepo.create({
          name: 'Monthly Pro Access',
          price: 499,
          durationDays: 30,
          isActive: true,
          features: ['Unlimited course access', 'Live doubt clearing sessions', 'Downloadable resources & worksheets'],
        }),
      );
      const p2 = await this.planRepo.save(
        this.planRepo.create({
          name: 'Annual Master Access',
          price: 3999,
          durationDays: 365,
          isActive: true,
          features: ['All Courses + Future additions for 1 full year', 'Live Mentorship Workshops', 'Priority Support Desk', 'Verified GramGuru Credentials'],
        }),
      );
      return [p1, p2];
    }
    return plans;
  }

  async getUserSubscription(userId: string) {
    const sub = await this.userSubRepo.findOne({
      where: { userId },
      order: { expiryDate: 'DESC' },
    });
    if (!sub) return { hasSubscription: false, active: false };

    const isActive = new Date(sub.expiryDate).getTime() > Date.now() && sub.status === 'active';
    return {
      hasSubscription: true,
      active: isActive,
      subscription: sub,
    };
  }

  async processCheckout(
    user: { id: string; email?: string; fullName?: string },
    dto: { itemType: 'course' | 'subscription'; courseSlug?: string; planId?: string; paymentMethod?: string; transactionId?: string },
  ) {
    let amount = 0;
    let title = '';

    if (dto.itemType === 'course' && dto.courseSlug) {
      const course = await this.courseRepo.findOne({ where: { slug: dto.courseSlug.trim().toLowerCase() } });
      if (!course) throw new NotFoundException('Course not found');
      amount = Number(course.price || 0);
      title = course.courseName;

      // Enroll student with validity
      await this.enrollStudent(course.slug, user, course.validityDays || 365);
    } else if (dto.itemType === 'subscription' && dto.planId) {
      const plan = await this.planRepo.findOne({ where: { id: dto.planId } });
      if (!plan) throw new NotFoundException('Subscription plan not found');
      amount = Number(plan.price);
      title = plan.name;

      const startDate = new Date();
      const expiryDate = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);

      await this.userSubRepo.save(
        this.userSubRepo.create({
          userId: user.id,
          userEmail: user.email || null,
          planName: plan.name,
          startDate,
          expiryDate,
          status: 'active',
        }),
      );
    }

    const payment = this.paymentRepo.create({
      userId: user.id,
      userEmail: user.email || null,
      userName: user.fullName || null,
      courseSlug: dto.courseSlug || null,
      amount,
      currency: 'INR',
      status: 'success',
      paymentMethod: dto.paymentMethod || 'Razorpay',
      transactionId: dto.transactionId || `TXN_${Date.now()}`,
      itemType: dto.itemType,
    });

    await this.paymentRepo.save(payment);

    return {
      success: true,
      message: `Enrolled successfully in ${title}`,
      payment,
    };
  }

  // ==========================================
  // 9. ADMIN LMS MANAGEMENT & ANALYTICS
  // ==========================================
  async getAdminLmsAnalytics() {
    const totalCourses = await this.courseRepo.count();
    const totalUsers = await this.userRepo.count({ where: { role: 'user' } });
    const totalEnrollments = await this.enrollmentRepo.count();
    const totalCompleted = await this.progressRepo.count({ where: { isCompleted: true } });

    // Assessment statistics
    const attempts = await this.attemptRepo.find();
    const passedAttempts = attempts.filter((a) => a.passed).length;
    const avgScore =
      attempts.length > 0 ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length) : 0;
    const passRate = attempts.length > 0 ? Math.round((passedAttempts / attempts.length) * 100) : 0;

    // Watch time & views
    const viewRows = await this.dataSource.query(`
      SELECT COALESCE(SUM("timeSpent"), 0)::int as "totalTime", COUNT(*)::int as "views" FROM course_views;
    `);
    const totalWatchTimeSec = Number(viewRows[0]?.totalTime) || 0;
    const totalViews = Number(viewRows[0]?.views) || 0;

    // Revenue
    const revenueRows = await this.dataSource.query(`
      SELECT COALESCE(SUM(amount), 0)::numeric as "revenue" FROM payments WHERE status = 'success';
    `);
    const totalRevenue = Number(revenueRows[0]?.revenue) || 0;

    // Average course rating
    const ratingRows = await this.dataSource.query(`
      SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as "avgRating", COUNT(*)::int as "totalReviews" FROM course_ratings;
    `);
    const avgRating = Number(ratingRows[0]?.avgRating) || 0;
    const totalReviews = Number(ratingRows[0]?.totalReviews) || 0;

    const pendingQueriesCount = await this.queryRepo.count({ where: { status: 'Pending' } });

    return {
      totalCourses,
      registeredStudents: totalUsers,
      totalEnrollments,
      totalCompleted,
      completionRate: totalEnrollments > 0 ? Math.round((totalCompleted / totalEnrollments) * 100) : 0,
      totalAssessmentsTaken: attempts.length,
      assessmentAvgScore: avgScore,
      assessmentPassRate: passRate,
      totalWatchTimeMinutes: Math.round(totalWatchTimeSec / 60),
      totalViews,
      totalRevenue,
      averageRating: avgRating,
      totalReviews,
      pendingQueriesCount,
    };
  }

  async getAdminStudentReports() {
    const raw = await this.dataSource.query(`
      SELECT 
        u.id, 
        u."fullName", 
        u.email, 
        u."createdAt" as "joinedAt",
        u."learningPurpose",
        u.phone,
        COALESCE(e.enrolled_count, 0)::int as "enrolledCount",
        COALESCE(p.completed_count, 0)::int as "completedCount",
        COALESCE(p.total_watch_time, 0)::int as "totalWatchTimeSec",
        COALESCE(a.attempts_count, 0)::int as "assessmentsAttempted",
        COALESCE(a.passed_count, 0)::int as "assessmentsPassed"
      FROM users u
      LEFT JOIN (
        SELECT "userId", COUNT(*)::int as enrolled_count 
        FROM course_enrollments GROUP BY "userId"
      ) e ON e."userId" = u.id::text
      LEFT JOIN (
        SELECT "userId", 
               COUNT(CASE WHEN "isCompleted" THEN 1 END)::int as completed_count,
               SUM("watchTimeSec")::int as total_watch_time
        FROM course_progress GROUP BY "userId"
      ) p ON p."userId" = u.id::text
      LEFT JOIN (
        SELECT "userId", 
               COUNT(*)::int as attempts_count,
               COUNT(CASE WHEN passed THEN 1 END)::int as passed_count
        FROM assessment_attempts GROUP BY "userId"
      ) a ON a."userId" = u.id::text
      WHERE u.role = 'user'
      ORDER BY u."createdAt" DESC;
    `);
    return raw;
  }

  async getAdminCourseReports() {
    const raw = await this.dataSource.query(`
      SELECT 
        c.id,
        c.slug,
        c."courseName",
        c.category,
        c.level,
        c.price,
        c."validityDays",
        c.status,
        COALESCE(e.enrolled_count, 0)::int as "enrolledStudents",
        COALESCE(p.completed_count, 0)::int as "completionsCount",
        COALESCE(p.avg_progress, 0)::int as "avgProgressPct",
        COALESCE(r.avg_rating, 0)::numeric as "avgRating",
        COALESCE(r.review_count, 0)::int as "reviewsCount",
        COALESCE(v.view_count, 0)::int as "viewsCount"
      FROM courses c
      LEFT JOIN (
        SELECT "courseSlug", COUNT(DISTINCT "userId")::int as enrolled_count
        FROM course_enrollments GROUP BY "courseSlug"
      ) e ON LOWER(e."courseSlug") = LOWER(c.slug)
      LEFT JOIN (
        SELECT "courseSlug",
               COUNT(CASE WHEN "isCompleted" THEN 1 END)::int as completed_count,
               ROUND(AVG("progressPercent"))::int as avg_progress
        FROM course_progress GROUP BY "courseSlug"
      ) p ON LOWER(p."courseSlug") = LOWER(c.slug)
      LEFT JOIN (
        SELECT "courseSlug",
               ROUND(AVG(rating)::numeric, 1) as avg_rating,
               COUNT(*)::int as review_count
        FROM course_ratings GROUP BY "courseSlug"
      ) r ON LOWER(r."courseSlug") = LOWER(c.slug)
      LEFT JOIN (
        SELECT slug, COUNT(*)::int as view_count
        FROM course_views GROUP BY slug
      ) v ON LOWER(v.slug) = LOWER(c.slug)
      ORDER BY enrolled_count DESC;
    `);
    return raw;
  }

  // Admin Query Management (scoped for Sub-Admin if provided)
  async getAdminQueries(status?: string, adminUser?: any) {
    const where: any = {};
    if (status && status !== 'all') {
      const s = status.trim().toLowerCase();
      if (s === 'answered' || s === 'resolved') {
        where.status = In(['Answered', 'Resolved']);
      } else if (s === 'pending') {
        where.status = 'Pending';
      } else if (s === 'closed') {
        where.status = 'Closed';
      } else {
        where.status = status;
      }
    }
    let list = await this.queryRepo.find({ where, order: { createdAt: 'DESC' } });

    if (adminUser?.role === 'admin') {
      try {
        const assignments = await this.dataSource.getRepository(AdminVideoAssignment).find({
          where: { adminId: adminUser.id },
        });
        if (assignments.length === 0) return [];
        const allowedSlugs = new Set(assignments.map((a) => (a.courseSlug || '').trim().toLowerCase()));
        list = list.filter((q) => q.courseSlug && allowedSlugs.has(q.courseSlug.trim().toLowerCase()));
      } catch (err: any) {
        console.warn('Scoping queries for admin notice:', err.message);
      }
    }

    const allCourses = await this.courseRepo.find({ select: ['id', 'slug', 'courseName'] });
    const courseMap = new Map<string, string>();
    allCourses.forEach((c) => {
      if (c.slug) courseMap.set(c.slug.toLowerCase(), c.courseName);
      if (c.id) courseMap.set(c.id, c.courseName);
    });

    return list.map((q) => ({
      ...q,
      courseName: q.courseSlug ? (courseMap.get(q.courseSlug.toLowerCase()) || q.courseSlug) : 'General Support',
    }));
  }

  async replyAndResolveQuery(queryId: string, reply: string, status: string = 'Answered') {
    const q = await this.queryRepo.findOne({ where: { id: queryId } });
    if (!q) throw new NotFoundException('Query not found');

    if (reply !== undefined && reply !== null) {
      q.adminReply = reply.trim();
    }
    q.status = status || 'Answered';
    q.resolvedAt = new Date();
    return this.queryRepo.save(q);
  }

  async updateQueryStatus(queryId: string, status: string) {
    const q = await this.queryRepo.findOne({ where: { id: queryId } });
    if (!q) throw new NotFoundException('Query not found');

    q.status = status;
    if (status === 'Answered' || status === 'Resolved') {
      if (!q.resolvedAt) q.resolvedAt = new Date();
    } else if (status === 'Pending') {
      q.resolvedAt = null;
    }
    return this.queryRepo.save(q);
  }

  async deleteQuery(queryId: string) {
    const q = await this.queryRepo.findOne({ where: { id: queryId } });
    if (!q) throw new NotFoundException('Query not found');
    await this.queryRepo.remove(q);
    return { success: true, message: 'Query deleted successfully' };
  }

  // Admin Live Classes Management
  async getAdminLiveClasses() {
    return this.liveClassRepo.find({ order: { scheduledAt: 'DESC' } });
  }

  async createLiveClass(dto: {
    title: string;
    description?: string;
    courseSlug?: string;
    scheduledAt: string | Date;
    durationMinutes?: number;
    meetingUrl: string;
    isPublished?: boolean;
  }) {
    const item = this.liveClassRepo.create({
      title: dto.title.trim(),
      description: dto.description ? dto.description.trim() : null,
      courseSlug: dto.courseSlug ? dto.courseSlug.trim().toLowerCase() : null,
      scheduledAt: new Date(dto.scheduledAt),
      durationMinutes: dto.durationMinutes || 60,
      meetingUrl: dto.meetingUrl.trim(),
      isPublished: dto.isPublished ?? true,
    });
    return this.liveClassRepo.save(item);
  }

  async updateLiveClass(id: string, dto: any) {
    const item = await this.liveClassRepo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Live class not found');
    Object.assign(item, dto);
    if (dto.scheduledAt) item.scheduledAt = new Date(dto.scheduledAt);
    return this.liveClassRepo.save(item);
  }

  async deleteLiveClass(id: string) {
    await this.liveClassRepo.delete({ id });
    return { success: true };
  }

  // Admin Assignment Management
  async createAssignment(dto: {
    courseSlug: string;
    topicId?: string;
    title: string;
    description?: string;
    totalMarks?: number;
    passingMarks?: number;
    questions?: any[];
  }) {
    const item = this.assignmentRepo.create({
      courseSlug: dto.courseSlug.trim().toLowerCase(),
      topicId: dto.topicId || null,
      title: dto.title.trim(),
      description: dto.description || null,
      totalMarks: dto.totalMarks || 100,
      passingMarks: dto.passingMarks || 40,
      questions: dto.questions || [],
      published: true,
    });
    return this.assignmentRepo.save(item);
  }

  async getAdminAssignments(courseSlug?: string) {
    const where: any = {};
    if (courseSlug) where.courseSlug = courseSlug.trim().toLowerCase();
    return this.assignmentRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async getAdminSubmissions(assignmentId?: string) {
    const where: any = {};
    if (assignmentId) where.assignmentId = assignmentId;
    return this.submissionRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async gradeSubmission(id: string, dto: { score: number; status: string; feedback?: string }) {
    const sub = await this.submissionRepo.findOne({ where: { id } });
    if (!sub) throw new NotFoundException('Submission not found');
    sub.score = dto.score;
    sub.status = dto.status;
    sub.feedback = dto.feedback || null;
    return this.submissionRepo.save(sub);
  }

  // Admin Payment History
  async getAdminPayments() {
    return this.paymentRepo.find({ order: { createdAt: 'DESC' } });
  }

  // ==========================================
  // 9. CERTIFICATE EVALUATION, AUTO-ISSUANCE & VERIFICATION
  // ==========================================
  private generateCertificateCode(): string {
    const year = new Date().getFullYear();
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = randomBytes(6);
    let suffix = '';
    for (let i = 0; i < 6; i++) {
      suffix += alphabet[bytes[i] % alphabet.length];
    }
    return `GMARK-${year}-${suffix}`;
  }

  async evaluateAndIssueCertificate(userId: string, courseSlug: string) {
    const cleanInput = (courseSlug || '').trim().toLowerCase();
    if (!userId || !cleanInput) {
      throw new BadRequestException('User ID and course slug are required.');
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanInput);
    let course = await this.courseRepo.findOne({
      where: isUuid ? [{ id: cleanInput }, { slug: cleanInput }] : [{ slug: cleanInput }],
    });

    let playlistItem: CoursePlaylist | null = null;
    try {
      const plRepo = this.dataSource.getRepository(CoursePlaylist);
      if (course) {
        playlistItem = await plRepo
          .createQueryBuilder('pl')
          .leftJoinAndSelect('pl.videos', 'video')
          .where('pl.courseId = :cId OR LOWER(pl.courseSlug) = :cSlug', {
            cId: course.id,
            cSlug: course.slug.toLowerCase(),
          })
          .orderBy('pl.displayOrder', 'ASC')
          .addOrderBy('video.displayOrder', 'ASC')
          .getOne();
      } else {
        playlistItem = await plRepo
          .createQueryBuilder('pl')
          .leftJoinAndSelect('pl.videos', 'video')
          .where(isUuid ? 'pl.id = :cleanInput' : 'LOWER(pl.courseSlug) = :cleanInput', { cleanInput })
          .orderBy('video.displayOrder', 'ASC')
          .getOne();
        if (playlistItem?.courseSlug && playlistItem.courseSlug !== 'general') {
          course = await this.courseRepo.findOne({ where: { slug: playlistItem.courseSlug.toLowerCase() } });
        }
      }
    } catch {}

    if (!course && !playlistItem) {
      throw new NotFoundException(`Course '${courseSlug}' not found`);
    }

    const effectiveSlug = course ? course.slug.toLowerCase() : (playlistItem!.id || cleanInput).toLowerCase();
    const effectiveTitle = course ? course.courseName : (playlistItem?.title || effectiveSlug);
    const effectiveCourseId = course?.id || playlistItem?.id || null;
    const strictNonSkippable = course ? course.strictNonSkippable !== false : true;
    const requireProject = course ? course.requireProjectForCertificate !== false : true;

    // 1. Video completion check
    const progress = await this.progressRepo.findOne({
      where: [
        { userId, courseSlug: effectiveSlug },
        ...(playlistItem?.id ? [{ userId, courseSlug: playlistItem.id.toLowerCase() }] : []),
      ],
    });

    const courseLessonsCount = Array.isArray(course?.lessons) ? course.lessons.length : 0;
    const playlistVideosCount = Array.isArray(playlistItem?.videos) ? playlistItem.videos.length : 0;
    const totalVideos = Math.max(1, playlistVideosCount > 0 ? playlistVideosCount : courseLessonsCount);

    const completedSet = new Set<string>(
      Array.isArray(progress?.completedLessons) ? progress!.completedLessons.map(String) : [],
    );
    const completedVideosSet = new Set<string>(
      Array.isArray(progress?.completedVideos) ? progress!.completedVideos.map(String) : [],
    );
    const videosCompleted = Math.min(totalVideos, Math.max(completedSet.size, completedVideosSet.size));
    const allVideosCompleted = Boolean(progress?.isCompleted) || videosCompleted >= totalVideos;

    // 2. MCQ / assessment check
    const hasCourseMcqs = Array.isArray(course?.assessments) && course!.assessments.length > 0;
    const hasPlaylistMcqs =
      Array.isArray(playlistItem?.assessments) && playlistItem!.assessments.length > 0
      || (Array.isArray(playlistItem?.videos) && playlistItem!.videos.some((v) => Array.isArray(v.assessments) && v.assessments.length > 0));
    const mcqsRequired = hasCourseMcqs || hasPlaylistMcqs;

    let mcqsPassed = !mcqsRequired;
    if (mcqsRequired) {
      const passedAttempt = await this.attemptRepo.findOne({
        where: { userId, courseSlug: effectiveSlug, passed: true },
      });
      mcqsPassed = Boolean(passedAttempt) || Boolean(progress?.checkpointsPassed?.['final-assessment']);
    }

    // 3. Project / assignment / video task check (auto-verified or admin-verified)
    const courseAssignments = await this.assignmentRepo.find({
      where: { courseSlug: effectiveSlug, published: true },
    });
    const videoTasks = await this.dataSource.getRepository(VideoTask).find({
      where: [
        { courseSlug: effectiveSlug },
        ...(course?.id ? [{ courseId: course.id }] : []),
        ...(playlistItem?.id ? [{ playlistId: playlistItem.id }] : []),
      ],
    });

    const projectRequired = requireProject && (courseAssignments.length > 0 || videoTasks.length > 0);
    let projectVerified = !projectRequired;
    let projectTitle: string | null = null;
    let projectUrl: string | null = null;

    const approvedStatuses = ['APPROVED', 'VERIFIED', 'reviewed', 'passed'];

    if (courseAssignments.length > 0) {
      const subs = await this.submissionRepo.find({
        where: { userId, courseSlug: effectiveSlug },
        order: { updatedAt: 'DESC' },
      });
      const verifiedSub = subs.find((s) => approvedStatuses.includes(s.status));
      if (verifiedSub) {
        projectVerified = true;
        const matchedAssignment = courseAssignments.find((a) => a.id === verifiedSub.assignmentId);
        projectTitle = matchedAssignment?.title || verifiedSub.submissionData?.title || 'Course Project Submission';
        projectUrl = verifiedSub.submissionData?.fileUrl || verifiedSub.submissionData?.url || verifiedSub.submissionData?.projectUrl || null;
      }
    }

    if (!projectVerified && videoTasks.length > 0) {
      const taskIds = videoTasks.map((t) => t.id);
      const vSubs = await this.dataSource.getRepository(VideoTaskSubmission).find({
        where: { userId, taskId: In(taskIds) },
        order: { submittedAt: 'DESC' },
      });
      const verifiedVSub = vSubs.find((s) => approvedStatuses.includes(s.status));
      if (verifiedVSub) {
        projectVerified = true;
        const matchedTask = videoTasks.find((t) => t.id === verifiedVSub.taskId);
        projectTitle = matchedTask?.title || 'Video Project Task';
        projectUrl = verifiedVSub.fileUrl || null;
      }
    }

    const eligible = allVideosCompleted && mcqsPassed && projectVerified;

    let certificate = await this.certRepo.findOne({
      where: { userId, courseSlug: effectiveSlug },
    });

    if (!certificate && eligible) {
      const user = await this.userRepo.findOne({ where: { id: userId } });
      let code = this.generateCertificateCode();
      for (let attempt = 0; attempt < 5; attempt++) {
        const collision = await this.certRepo.findOne({ where: { certificateCode: code } });
        if (!collision) break;
        code = this.generateCertificateCode();
      }

      certificate = this.certRepo.create({
        certificateCode: code,
        userId,
        userName: user?.fullName || user?.email || 'G-Mark Learner',
        userEmail: user?.email || null,
        courseId: effectiveCourseId,
        courseSlug: effectiveSlug,
        courseTitle: effectiveTitle,
        completedAt: progress?.completedAt || new Date(),
        verificationStatus: 'VERIFIED',
        projectTitle,
        projectUrl,
        metadata: {
          videosCompleted,
          totalVideos,
          mcqsRequired,
          mcqsPassed,
          projectRequired,
          projectVerified,
          autoVerified: true,
        },
      });
      try {
        certificate = await this.certRepo.save(certificate);
      } catch (err: any) {
        if (err?.code === '23505') {
          certificate = await this.certRepo.findOne({ where: { userId, courseSlug: effectiveSlug } });
        } else {
          throw err;
        }
      }
    }

    return {
      courseSlug: effectiveSlug,
      courseTitle: effectiveTitle,
      strictNonSkippable,
      requireProjectForCertificate: requireProject,
      videosCompleted,
      totalVideos,
      allVideosCompleted,
      mcqsRequired,
      mcqsPassed,
      projectRequired,
      projectVerified,
      eligible,
      certificate: certificate || null,
    };
  }

  async getCourseCertificateStatus(userId: string, courseSlug: string) {
    return this.evaluateAndIssueCertificate(userId, courseSlug);
  }

  async getMyCertificates(userId: string) {
    return this.certRepo.find({
      where: { userId },
      order: { completedAt: 'DESC' },
    });
  }
}
