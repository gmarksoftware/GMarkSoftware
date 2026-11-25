import { BadRequestException, ConflictException, Injectable, NotFoundException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as XLSX from 'xlsx';
import { CourseEntity, CourseRating, CourseView, CourseEnrollment, SiteSetting, AdminVideoAssignment, CoursePlaylist, CoursePlaylistVideo } from '../entities';
import { CreateCourseDto, UpdateCourseDto } from '../dto';
import { assertValidYoutubeUrl, getYoutubeThumbnailUrl, validateYoutubeUrlOrId } from './youtube.util';

export interface ExcelRowError {
  row: number;
  error: string;
}

export interface ValidationResult {
  valid: boolean;
  totalRows: number;
  validCount: number;
  errorCount: number;
  errors: ExcelRowError[];
  validRows: Array<{
    courseName: string;
    slug: string;
    category: string;
    level: string;
    shortDescription: string;
    status: string;
    trending: boolean;
  }>;
}

export const INITIAL_DEFAULT_COURSES: any[] = [];

@Injectable()
export class CoursesService implements OnModuleInit {
  constructor(
    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,
    @InjectRepository(CourseRating)
    private readonly ratingRepo: Repository<CourseRating>,
    @InjectRepository(CourseEnrollment)
    private readonly enrollmentRepo: Repository<CourseEnrollment>,
    private readonly dataSource: DataSource,
  ) { }

  async onModuleInit() {
    try {
      // Ensure all LMS tables and extended columns exist in PostgreSQL
      await this.dataSource.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS "learningPurpose" text;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS "interests" jsonb DEFAULT '[]'::jsonb;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS "phone" varchar;

        ALTER TABLE courses ADD COLUMN IF NOT EXISTS "topics" jsonb DEFAULT '[]'::jsonb;
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS "price" numeric(10,2) DEFAULT 0;
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS "isFree" boolean DEFAULT true;
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS "validityDays" integer DEFAULT 365;
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS "allowSubscription" boolean DEFAULT true;
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS "duration" varchar DEFAULT 'Self-paced';
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS "certificateEnabled" boolean DEFAULT false;
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS "requirements" jsonb DEFAULT '[]'::jsonb;
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS "resources" jsonb DEFAULT '[]'::jsonb;
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS "sections" jsonb DEFAULT '[]'::jsonb;
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS "description" text;

        CREATE TABLE IF NOT EXISTS course_enrollments (
          id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "courseSlug" varchar NOT NULL,
          "courseId"   varchar,
          "userId"     varchar NOT NULL,
          "userEmail"  varchar,
          "userName"   varchar,
          "startDate"  timestamptz DEFAULT CURRENT_TIMESTAMP,
          "expiryDate" timestamptz,
          "validityDays" integer DEFAULT 365,
          "status"     varchar DEFAULT 'active',
          "paymentId"  varchar,
          "amountPaid" numeric(10,2) DEFAULT 0,
          "createdAt"  timestamp NOT NULL DEFAULT now(),
          "updatedAt"  timestamp NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "IDX_course_enrollments_slug_user" ON course_enrollments ("courseSlug", "userId");

        ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS "startDate" timestamptz DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS "expiryDate" timestamptz;
        ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS "validityDays" integer DEFAULT 365;
        ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS "status" varchar DEFAULT 'active';
        ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS "paymentId" varchar;
        ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS "amountPaid" numeric(10,2) DEFAULT 0;

        CREATE TABLE IF NOT EXISTS course_progress (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "courseSlug" varchar NOT NULL,
          "courseId" varchar,
          "userId" varchar NOT NULL,
          "completedLessons" jsonb DEFAULT '[]'::jsonb,
          "checkpointsPassed" jsonb DEFAULT '{}'::jsonb,
          "progressPercent" integer DEFAULT 0,
          "watchTimeSec" integer DEFAULT 0,
          "lastAccessedLessonIndex" integer DEFAULT 0,
          "lastAccessedLessonTitle" varchar,
          "isCompleted" boolean DEFAULT false,
          "completedAt" timestamptz,
          "createdAt" timestamp NOT NULL DEFAULT now(),
          "updatedAt" timestamp NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "IDX_course_progress_slug_user" ON course_progress ("courseSlug", "userId");

        CREATE TABLE IF NOT EXISTS course_assignments (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "courseSlug" varchar NOT NULL,
          "topicId" varchar,
          "title" varchar NOT NULL,
          "description" text,
          "totalMarks" integer DEFAULT 100,
          "passingMarks" integer DEFAULT 40,
          "questions" jsonb DEFAULT '[]'::jsonb,
          "published" boolean DEFAULT true,
          "createdAt" timestamp NOT NULL DEFAULT now(),
          "updatedAt" timestamp NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS assignment_submissions (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "assignmentId" varchar NOT NULL,
          "userId" varchar NOT NULL,
          "courseSlug" varchar NOT NULL,
          "userName" varchar,
          "userEmail" varchar,
          "submissionData" jsonb NOT NULL,
          "score" integer,
          "status" varchar DEFAULT 'pending',
          "feedback" text,
          "createdAt" timestamp NOT NULL DEFAULT now(),
          "updatedAt" timestamp NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS assessment_attempts (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "courseSlug" varchar NOT NULL,
          "userId" varchar NOT NULL,
          "userName" varchar,
          "userEmail" varchar,
          "score" integer NOT NULL,
          "totalMarks" integer NOT NULL,
          "percentage" integer NOT NULL,
          "passed" boolean DEFAULT false,
          "answers" jsonb DEFAULT '{}'::jsonb,
          "createdAt" timestamp NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS student_queries (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" varchar NOT NULL,
          "userName" varchar,
          "userEmail" varchar,
          "courseSlug" varchar,
          "category" varchar DEFAULT 'general',
          "subject" varchar NOT NULL,
          "message" text NOT NULL,
          "status" varchar DEFAULT 'Pending',
          "adminReply" text,
          "resolvedAt" timestamptz,
          "createdAt" timestamp NOT NULL DEFAULT now(),
          "updatedAt" timestamp NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS live_classes (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "courseSlug" varchar,
          "title" varchar NOT NULL,
          "description" text,
          "scheduledAt" timestamptz NOT NULL,
          "durationMinutes" integer DEFAULT 60,
          "meetingUrl" varchar NOT NULL,
          "isPublished" boolean DEFAULT true,
          "createdAt" timestamp NOT NULL DEFAULT now(),
          "updatedAt" timestamp NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS payments (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" varchar NOT NULL,
          "userEmail" varchar,
          "userName" varchar,
          "courseSlug" varchar,
          "amount" numeric(10,2) NOT NULL,
          "currency" varchar DEFAULT 'INR',
          "status" varchar DEFAULT 'success',
          "paymentMethod" varchar,
          "transactionId" varchar,
          "itemType" varchar DEFAULT 'course',
          "createdAt" timestamp NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS subscription_plans (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "name" varchar NOT NULL,
          "price" numeric(10,2) NOT NULL,
          "durationDays" integer NOT NULL,
          "isActive" boolean DEFAULT true,
          "features" jsonb DEFAULT '[]'::jsonb,
          "createdAt" timestamp NOT NULL DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS user_subscriptions (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "userId" varchar NOT NULL,
          "userEmail" varchar,
          "planName" varchar,
          "status" varchar DEFAULT 'active',
          "startDate" timestamptz NOT NULL,
          "expiryDate" timestamptz NOT NULL,
          "paymentId" varchar,
          "createdAt" timestamp NOT NULL DEFAULT now()
        );
      `);
    } catch (e: any) {
      console.warn('LMS PostgreSQL table setup notice:', e.message);
    }

    try {
      const settingRepo = this.dataSource.getRepository(SiteSetting);
      const seeded = await settingRepo.findOne({ where: { key: 'initial_courses_seeded' } });

      for (const c of INITIAL_DEFAULT_COURSES) {
        const exists = await this.courseRepo.findOne({ where: { slug: c.slug } });
        if (!exists) {
          const entity = this.courseRepo.create(c);
          await this.courseRepo.save(entity);
        }
      }

      if (!seeded) {
        await settingRepo.save({
          key: 'initial_courses_seeded',
          value: { seeded: true, initializedAt: new Date().toISOString() },
        });
      }
    } catch (err: any) {
      console.warn('Initial course seeding check skipped or error:', err.message);
    }
  }

  /** Normalizes a course entity for frontend API consumption (exposing title and short alongside courseName and shortDescription). */
  private formatCourse(
    course: CourseEntity,
    stats?: { averageRating: number; totalRatings: number },
    viewStats?: { views: number; totalTime: number; avgTime: number },
    learnersCount?: number,
    isAuthenticated: boolean = false,
  ) {
    const youtube = course.youtubeVideoId || course.youtubeUrl || null;
    const defaultYtThumb = course.youtubeVideoId
      ? `https://img.youtube.com/vi/${course.youtubeVideoId}/hqdefault.jpg`
      : null;
    const thumbnailUrl = course.thumbnailUrl || defaultYtThumb || null;
    const averageRating = stats ? stats.averageRating : 0;
    const totalRatings = stats ? stats.totalRatings : 0;
    const views = viewStats ? viewStats.views : 0;
    const totalTime = viewStats ? viewStats.totalTime : 0;
    const avgTime = viewStats ? viewStats.avgTime : 0;
    const learners = learnersCount !== undefined ? learnersCount : 0;

    // Lesson video references
    const rawLessons = Array.isArray(course.lessons) ? course.lessons : [];
    const lessons = rawLessons.map((l: any) => {
      const ytId = l.youtubeVideoId || (l.youtubeUrl ? (l.youtubeUrl.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*)/)?.[1] || null) : null);
      return {
        ...l,
        youtube: l.youtube || l.youtubeUrl || null,
        youtubeUrl: l.youtubeUrl || l.youtube || null,
        youtubeVideoId: ytId || l.youtubeVideoId || null,
        thumbnailUrl: l.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null),
        poster: l.poster || l.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null),
        file: isAuthenticated ? (l.file || l.videoUrl || null) : null,
        videoUrl: isAuthenticated ? (l.videoUrl || l.file || null) : (l.youtubeUrl || null),
      };
    });

    const rawSections = Array.isArray(course.sections) ? course.sections : [];
    const sections = rawSections.map((sec: any) => {
      if (!Array.isArray(sec.lessons)) return sec;
      return {
        ...sec,
        lessons: sec.lessons.map((l: any) => {
          const ytId = l.youtubeVideoId || (l.youtubeUrl ? (l.youtubeUrl.match(/(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*)/)?.[1] || null) : null);
          return {
            ...l,
            youtube: l.youtube || l.youtubeUrl || null,
            youtubeUrl: l.youtubeUrl || l.youtube || null,
            youtubeVideoId: ytId || l.youtubeVideoId || null,
            thumbnailUrl: l.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null),
            poster: l.poster || l.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null),
            file: isAuthenticated ? (l.file || l.videoUrl || null) : null,
            videoUrl: isAuthenticated ? (l.videoUrl || l.file || null) : (l.youtubeUrl || null),
          };
        }),
      };
    });

    return {
      ...course,
      title: course.courseName,
      short: course.shortDescription,
      description: course.description || course.shortDescription || null,
      youtube,
      youtubeUrl: course.youtubeUrl || (course.youtubeVideoId ? `https://www.youtube.com/watch?v=${course.youtubeVideoId}` : null),
      youtubeVideoId: course.youtubeVideoId || null,
      file: isAuthenticated ? ((course as any).file || course.videoUrl || null) : null,
      videoUrl: course.videoUrl || course.youtubeUrl || null,
      thumbnailUrl,
      image: course.image || thumbnailUrl,
      price: Number(course.price || 0),
      isFree: course.isFree ?? (Number(course.price || 0) === 0),
      validityDays: course.validityDays || 365,
      allowSubscription: course.allowSubscription ?? true,
      duration: course.duration || 'Self-paced',
      certificateEnabled: course.certificateEnabled ?? false,
      strictNonSkippable: course.strictNonSkippable !== false,
      requireProjectForCertificate: course.requireProjectForCertificate !== false,
      sections,
      lessons,
      topics: Array.isArray(course.topics) ? course.topics : [],
      learn: Array.isArray(course.learn) ? course.learn : [],
      requirements: Array.isArray(course.requirements) ? course.requirements : [],
      resources: Array.isArray(course.resources) ? course.resources : [],
      assessments: course.assessments || [],
      assessmentSettings: course.assessmentSettings || {},
      rating: averageRating,
      averageRating,
      totalRatings,
      ratingCount: totalRatings,
      views,
      totalTime,
      avgTime,
      learners,
      videoProtected: true,
      isAuthenticated,
    };
  }

  async getCourseViewStatsMap(): Promise<Map<string, { views: number; totalTime: number; avgTime: number }>> {
    const viewStatsMap = new Map<string, { views: number; totalTime: number; avgTime: number }>();
    try {
      const raw = await this.dataSource.query(`
        WITH user_course_time AS (
          SELECT 
            LOWER(TRIM(slug)) as slug, 
            COALESCE(NULLIF(TRIM("userId"), ''), id::text) as viewer_id,
            MAX("timeSpent") as user_time
          FROM course_views
          GROUP BY LOWER(TRIM(slug)), COALESCE(NULLIF(TRIM("userId"), ''), id::text)
        )
        SELECT 
          slug,
          COUNT(viewer_id)::int as "views",
          COALESCE(SUM(user_time), 0)::int as "totalTime",
          COALESCE(ROUND(AVG(user_time)), 0)::int as "avgTime"
        FROM user_course_time
        GROUP BY slug;
      `);

      for (const row of raw) {
        if (row.slug) {
          viewStatsMap.set(String(row.slug).toLowerCase(), {
            views: Number(row.views) || 0,
            totalTime: Number(row.totalTime) || 0,
            avgTime: Number(row.avgTime) || 0,
          });
        }
      }
    } catch (e) {
      // safe fallback
    }
    return viewStatsMap;
  }

  async getSingleCourseViewStats(slug: string): Promise<{ views: number; totalTime: number; avgTime: number }> {
    try {
      const raw = await this.dataSource.query(`
        WITH user_course_time AS (
          SELECT 
            COALESCE(NULLIF(TRIM("userId"), ''), id::text) as viewer_id,
            MAX("timeSpent") as user_time
          FROM course_views
          WHERE LOWER(TRIM(slug)) = LOWER(TRIM($1))
          GROUP BY COALESCE(NULLIF(TRIM("userId"), ''), id::text)
        )
        SELECT 
          COUNT(viewer_id)::int as "views",
          COALESCE(SUM(user_time), 0)::int as "totalTime",
          COALESCE(ROUND(AVG(user_time)), 0)::int as "avgTime"
        FROM user_course_time;
      `, [slug]);

      if (raw && raw.length > 0) {
        return {
          views: Number(raw[0].views) || 0,
          totalTime: Number(raw[0].totalTime) || 0,
          avgTime: Number(raw[0].avgTime) || 0,
        };
      }
    } catch (e) {
      // safe fallback
    }
    return { views: 0, totalTime: 0, avgTime: 0 };
  }

  async getCourseRatingStats(courseId?: string, courseSlug?: string): Promise<{ averageRating: number; totalRatings: number }> {
    const conditions: any[] = [];
    if (courseSlug) conditions.push({ courseSlug });
    if (courseId) conditions.push({ courseId });
    if (conditions.length === 0) return { averageRating: 0, totalRatings: 0 };

    const allRatings = await this.ratingRepo.find({ where: conditions });
    const ratings = allRatings.filter((r) => r.status !== 'hidden');
    const totalRatings = ratings.length;
    if (totalRatings === 0) {
      return { averageRating: 0, totalRatings: 0 };
    }
    const sum = ratings.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const averageRating = Math.round((sum / totalRatings) * 10) / 10;
    return { averageRating, totalRatings };
  }

  async getCourseLearnerStatsMap(): Promise<Map<string, number>> {
    const learnerStatsMap = new Map<string, number>();
    try {
      const raw = await this.dataSource.query(`
        SELECT LOWER(TRIM(slug)) as slug, COUNT(DISTINCT user_id)::int as learners
        FROM (
          SELECT LOWER(TRIM("courseSlug")) as slug, TRIM("userId") as user_id 
          FROM course_enrollments 
          WHERE "userId" IS NOT NULL AND TRIM("userId") != ''
          UNION
          SELECT LOWER(TRIM(slug)) as slug, TRIM("userId") as user_id 
          FROM course_views 
          WHERE "userId" IS NOT NULL AND TRIM("userId") != ''
        ) u
        GROUP BY slug;
      `);

      for (const row of raw) {
        if (row.slug) {
          learnerStatsMap.set(String(row.slug).toLowerCase(), Number(row.learners) || 0);
        }
      }
    } catch (e) {
      // safe fallback
    }
    return learnerStatsMap;
  }

  async getSingleCourseLearnerStats(slug: string): Promise<number> {
    try {
      const raw = await this.dataSource.query(`
        SELECT COUNT(DISTINCT user_id)::int as learners
        FROM (
          SELECT LOWER(TRIM("courseSlug")) as slug, TRIM("userId") as user_id 
          FROM course_enrollments 
          WHERE LOWER(TRIM("courseSlug")) = LOWER(TRIM($1)) AND "userId" IS NOT NULL AND TRIM("userId") != ''
          UNION
          SELECT LOWER(TRIM(slug)) as slug, TRIM("userId") as user_id 
          FROM course_views 
          WHERE LOWER(TRIM(slug)) = LOWER(TRIM($1)) AND "userId" IS NOT NULL AND TRIM("userId") != ''
        ) u
      `, [slug]);
      return Number(raw[0]?.learners) || 0;
    } catch (e) {
      return 0;
    }
  }

  async enrollUser(slug: string, userId: string, userEmail?: string, userName?: string): Promise<any> {
    const cleanSlug = slug.trim().toLowerCase();
    const cleanUserId = userId.trim();
    if (!cleanUserId) {
      throw new BadRequestException('userId is required');
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cleanSlug);
    let course = await this.courseRepo.findOne({
      where: isUuid ? [{ id: cleanSlug }, { slug: cleanSlug }] : [{ slug: cleanSlug }],
    });

    let isPlaylist = false;
    let playlistItem: any = null;

    if (!course) {
      // Check if this slug/id corresponds to a playlist
      try {
        const plRepo = this.dataSource.getRepository('CoursePlaylist');
        playlistItem = await plRepo.findOne({
          where: isUuid ? [{ id: cleanSlug }] : [{ id: cleanSlug }, { courseSlug: cleanSlug }],
        });
        if (playlistItem) {
          isPlaylist = true;
        }
      } catch { }
    }

    if (!course && !playlistItem) {
      throw new NotFoundException(`Course or Playlist '${slug}' not found`);
    }

    const itemSlug = course ? course.slug : (playlistItem.id || cleanSlug);
    const itemId = course ? course.id : playlistItem.id;
    const itemType = isPlaylist ? 'playlist' : 'course';

    let existing = await this.enrollmentRepo.findOne({
      where: { courseSlug: itemSlug, userId: cleanUserId },
    });

    const validityDays = course?.validityDays || 365;
    const startDate = new Date();
    const expiryDate = new Date(startDate.getTime() + validityDays * 24 * 60 * 60 * 1000);

    if (!existing) {
      existing = this.enrollmentRepo.create({
        courseSlug: itemSlug,
        courseId: itemId,
        itemType,
        playlistId: isPlaylist ? itemId : null,
        userId: cleanUserId,
        userEmail: userEmail || null,
        userName: userName || null,
        startDate,
        expiryDate,
        validityDays,
        status: 'active',
        amountPaid: Number(course?.price || 0),
      });
      try {
        await this.enrollmentRepo.save(existing);
      } catch (err: any) {
        if (err?.code === '23505' || String(err?.message || '').includes('duplicate key')) {
          existing = (await this.enrollmentRepo.findOne({
            where: { courseSlug: itemSlug, userId: cleanUserId },
          })) || existing;
        } else {
          throw err;
        }
      }
    } else if (existing.expiryDate && new Date(existing.expiryDate).getTime() < Date.now()) {
      existing.startDate = startDate;
      existing.expiryDate = expiryDate;
      existing.validityDays = validityDays;
      existing.status = 'active';
      await this.enrollmentRepo.save(existing);
    }

    const learnerCount = course ? await this.getSingleCourseLearnerStats(course.slug) : 1;
    const now = Date.now();
    const isExpired = existing.expiryDate ? new Date(existing.expiryDate).getTime() < now : false;
    const daysRemaining = existing.expiryDate
      ? Math.max(0, Math.ceil((new Date(existing.expiryDate).getTime() - now) / (1000 * 60 * 60 * 24)))
      : null;

    return {
      success: true,
      enrolled: true,
      slug: itemSlug,
      itemType,
      userId: cleanUserId,
      learners: learnerCount,
      enrolledAt: existing.createdAt,
      startDate: existing.startDate || existing.createdAt,
      expiryDate: existing.expiryDate,
      validityDays: existing.validityDays || validityDays,
      isExpired,
      daysRemaining,
      status: isExpired ? 'expired' : existing.status || 'active',
    };
  }

  async isUserEnrolled(slug: string, userId: string): Promise<boolean> {
    const cleanSlug = slug.trim().toLowerCase();
    const cleanUserId = userId.trim();
    const enrollment = await this.enrollmentRepo.findOne({
      where: [{ courseSlug: cleanSlug, userId: cleanUserId }],
    });
    if (!enrollment) return false;
    if (enrollment.expiryDate && new Date(enrollment.expiryDate).getTime() < Date.now()) {
      return false;
    }
    return true;
  }

  async isCourseAssignedToAdmin(courseIdOrSlug: string, adminUser: any): Promise<boolean> {
    if (!adminUser || adminUser.role === 'super_admin') return true;
    if (adminUser.role !== 'admin') return false;

    const clean = (courseIdOrSlug || '').trim().toLowerCase();
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseIdOrSlug);
    const course = isUuid
      ? await this.courseRepo.findOne({ where: { id: courseIdOrSlug }, select: ['id', 'slug', 'createdBy'] })
      : await this.courseRepo.findOne({ where: { slug: clean }, select: ['id', 'slug', 'createdBy'] });
    if (course?.createdBy && course.createdBy === adminUser.id) {
      return true;
    }

    const assignments = await this.dataSource.getRepository(AdminVideoAssignment).find({
      where: { adminId: adminUser.id },
    });
    return assignments.some(
      (a) =>
        (a.courseSlug && a.courseSlug.toLowerCase() === clean) ||
        (a.courseId && a.courseId.toLowerCase() === clean),
    );
  }

  async findAllAdmin(adminUser?: any): Promise<any[]> {
    let list = await this.courseRepo.find({ order: { createdAt: 'DESC' } });

    if (adminUser?.role === 'admin') {
      try {
        const assignments = await this.dataSource.getRepository(AdminVideoAssignment).find({
          where: { adminId: adminUser.id },
        });

        const fullCourseSlugs = new Set(
          (assignments || [])
            .filter((a) => (!a.videoId || a.videoId === 'ALL') && !a.playlistId)
            .map((a) => (a.courseSlug || '').trim().toLowerCase())
            .filter(Boolean),
        );
        const allowedSlugs = new Set(
          (assignments || []).map((a) => (a.courseSlug || '').trim().toLowerCase()).filter(Boolean),
        );
        const allowedCourseIds = new Set(
          (assignments || []).map((a) => a.courseId).filter(Boolean),
        );
        const allowedVideoIds = new Set(
          (assignments || [])
            .map((a) => (a.videoId || '').trim())
            .filter((v) => Boolean(v) && v !== 'ALL'),
        );
        const allowedVideoTitles = new Set(
          (assignments || [])
            .map((a) => (a.videoTitle || '').trim().toLowerCase())
            .filter(Boolean),
        );

        list = list
          .filter((c) => {
            if (c.createdBy && c.createdBy === adminUser.id) return true;
            const slug = (c.slug || '').trim().toLowerCase();
            return allowedSlugs.has(slug) || (c.id && allowedCourseIds.has(c.id));
          })
          .map((c) => {
            if (c.createdBy && c.createdBy === adminUser.id) {
              return c;
            }
            const slug = (c.slug || '').trim().toLowerCase();
            const hasFullCourse = fullCourseSlugs.has(slug);
            if (hasFullCourse) {
              return c;
            }

            // Scoped lessons inside course
            if (Array.isArray(c.lessons) && c.lessons.length > 0) {
              const scopedLessons = c.lessons.filter((l: any, idx: number) => {
                const vidId = `${c.slug}_v${idx}`;
                const rawYt = l.id || l.youtubeVideoId;
                const title = (l.t || l.title || '').trim().toLowerCase();
                return (
                  allowedVideoIds.has(vidId) ||
                  (l.id && allowedVideoIds.has(l.id)) ||
                  (rawYt && allowedVideoIds.has(rawYt)) ||
                  (title && allowedVideoTitles.has(title))
                );
              });
              return { ...c, lessons: scopedLessons };
            }
            return c;
          });
      } catch (err: any) {
        console.warn('Scoping courses for admin notice:', err.message);
        return [];
      }
    }

    const viewStatsMap = await this.getCourseViewStatsMap();
    const learnerStatsMap = await this.getCourseLearnerStatsMap();
    return list.map((c) => {
      const viewStats = viewStatsMap.get(c.slug.toLowerCase()) || { views: 0, totalTime: 0, avgTime: 0 };
      const learners = learnerStatsMap.get(c.slug.toLowerCase()) || 0;
      return this.formatCourse(c, undefined, viewStats, learners, true);
    });
  }

  async findAllPublic(queryOrCat?: string | {
    category?: string;
    search?: string;
    level?: string;
    price?: string;
    status?: string;
    rating?: string;
    sort?: string;
  }): Promise<any[]> {
    const query = typeof queryOrCat === 'string' ? { category: queryOrCat } : (queryOrCat || {});
    const where: any = {};
    if (query.status && query.status.toLowerCase() !== 'all') {
      where.status = query.status;
    } else if (!query.status) {
      where.status = 'Active';
    }

    if (query.category && query.category.toLowerCase() !== 'all') {
      where.category = query.category.toLowerCase();
    }

    if (query.level && query.level.toLowerCase() !== 'all') {
      where.level = query.level;
    }

    if (query.price === 'free') {
      where.isFree = true;
    } else if (query.price === 'paid') {
      where.isFree = false;
    }

    let list = await this.courseRepo.find({ where, order: { createdAt: 'DESC' } });

    // Server-side text search across name, shortDescription, description, category
    if (query.search && query.search.trim()) {
      const q = query.search.trim().toLowerCase();
      list = list.filter((c) => {
        const name = (c.courseName || '').toLowerCase();
        const short = (c.shortDescription || '').toLowerCase();
        const desc = (c.description || '').toLowerCase();
        const cat = (c.category || '').toLowerCase();
        return name.includes(q) || short.includes(q) || desc.includes(q) || cat.includes(q);
      });
    }

    // Aggregate ratings across courses directly from database
    const statsMap = new Map<string, { averageRating: number; totalRatings: number }>();
    try {
      const rawStats = await this.ratingRepo
        .createQueryBuilder('r')
        .select('r.courseSlug', 'slug')
        .addSelect('r.courseId', 'id')
        .addSelect('COUNT(r.id)', 'count')
        .addSelect('AVG(r.rating)', 'avg')
        .where("r.status != 'hidden' OR r.status IS NULL")
        .groupBy('r.courseSlug')
        .addGroupBy('r.courseId')
        .getRawMany();

      for (const row of rawStats) {
        const count = parseInt(row.count, 10) || 0;
        const avg = parseFloat(row.avg) || 0;
        const roundedAvg = Math.round(avg * 10) / 10;
        const data = { averageRating: roundedAvg, totalRatings: count };
        if (row.slug) statsMap.set(String(row.slug).toLowerCase(), data);
        if (row.id) statsMap.set(String(row.id), data);
      }
    } catch (e) {
      // safe fallback
    }

    const viewStatsMap = await this.getCourseViewStatsMap();
    const learnerStatsMap = await this.getCourseLearnerStatsMap();

    let formatted = list.map((c) => {
      const stats = statsMap.get(c.slug.toLowerCase()) || (c.id ? statsMap.get(c.id) : undefined) || { averageRating: 0, totalRatings: 0 };
      const viewStats = viewStatsMap.get(c.slug.toLowerCase()) || { views: 0, totalTime: 0, avgTime: 0 };
      const learners = learnerStatsMap.get(c.slug.toLowerCase()) || 0;
      return this.formatCourse(c, stats, viewStats, learners);
    });

    // Rating filter (4+, 3+, 2+, 1+)
    if (query.rating && query.rating !== 'all') {
      const minR = Number(query.rating);
      if (!isNaN(minR) && minR > 0) {
        formatted = formatted.filter((c) => Number(c.averageRating ?? c.rating ?? 0) >= minR);
      }
    }

    // Server-side sorting
    if (query.sort === 'rating') {
      formatted.sort((a, b) => Number(b.averageRating ?? b.rating ?? 0) - Number(a.averageRating ?? a.rating ?? 0));
    } else if (query.sort === 'popular') {
      formatted.sort((a, b) => Number(b.learners ?? b.views ?? 0) - Number(a.learners ?? a.views ?? 0));
    } else if (query.sort === 'newest') {
      formatted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return formatted;
  }

  async findOneBySlug(slug: string, isAuthenticated: boolean = false): Promise<any> {
    const raw = decodeURIComponent(slug).trim().toLowerCase();
    const normalized = raw.replace(/[\s_]+/g, '-');
    let course = await this.courseRepo.findOne({
      where: [{ slug: raw }, { slug: normalized }],
    });
    if (!course) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);
      if (isUuid) {
        course = await this.courseRepo.findOne({ where: { id: raw } });
      }
    }
    if (!course) {
      throw new NotFoundException(`Course with slug '${slug}' not found`);
    }
    const stats = await this.getCourseRatingStats(course.id, course.slug);
    const viewStats = await this.getSingleCourseViewStats(course.slug);
    const learners = await this.getSingleCourseLearnerStats(course.slug);
    return this.formatCourse(course, stats, viewStats, learners, isAuthenticated);
  }

  /**
   * Protected method to return full video streaming & lesson access for authenticated users.
   */
  async getCourseVideoAccess(slug: string, user: any): Promise<any> {
    if (!user) {
      throw new UnauthorizedException('Authentication required to access video content');
    }
    const raw = decodeURIComponent(slug).trim().toLowerCase();
    const normalized = raw.replace(/[\s_]+/g, '-');
    let course = await this.courseRepo.findOne({
      where: [{ slug: raw }, { slug: normalized }],
    });
    if (!course) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);
      if (isUuid) {
        course = await this.courseRepo.findOne({ where: { id: raw } });
      }
    }
    if (!course) {
      throw new NotFoundException(`Course with slug '${slug}' not found`);
    }

    const rawLessons = Array.isArray(course.lessons) ? course.lessons : [];
    const checkpoints = Array.isArray((course as any).checkpoints) ? (course as any).checkpoints : [];

    return {
      success: true,
      accessGranted: true,
      courseId: course.id,
      slug: course.slug,
      courseName: course.courseName,
      youtubeVideoId: course.youtubeVideoId || null,
      youtubeUrl: course.youtubeUrl || null,
      youtube: course.youtubeVideoId || course.youtubeUrl || null,
      file: (course as any).file || course.videoUrl || null,
      videoUrl: course.videoUrl || null,
      checkpoints,
      lessons: rawLessons.map((l: any, i: number) => ({
        ...l,
        youtubeVideoId: l.youtubeVideoId || (i === 0 ? course.youtubeVideoId : null) || null,
        youtubeUrl: l.youtubeUrl || (i === 0 ? course.youtubeUrl : null) || null,
        youtube: l.youtube || l.youtubeVideoId || (i === 0 ? course.youtubeVideoId : null) || null,
        file: l.file || (i === 0 ? ((course as any).file || course.videoUrl) : null) || null,
        videoUrl: l.videoUrl || (i === 0 ? course.videoUrl : null) || null,
      })),
    };
  }

  /**
   * Protected method to return individual lesson video access for authenticated users.
   */
  async getLessonVideoAccess(slug: string, lessonIndex: number, user: any): Promise<any> {
    const videoAccess = await this.getCourseVideoAccess(slug, user);
    const lesson = videoAccess.lessons?.[lessonIndex] || videoAccess.lessons?.[0];
    if (!lesson) {
      throw new NotFoundException(`Lesson index ${lessonIndex} not found in course ${slug}`);
    }
    return {
      success: true,
      accessGranted: true,
      lessonIndex,
      lesson,
      courseVideoId: videoAccess.youtubeVideoId,
      courseVideoUrl: videoAccess.videoUrl,
    };
  }

  async getCourseRatings(slugOrId: string, userId?: string) {
    const raw = decodeURIComponent(slugOrId).trim().toLowerCase();
    const normalized = raw.replace(/[\s_]+/g, '-');
    let course = await this.courseRepo.findOne({
      where: [{ slug: raw }, { slug: normalized }],
    });
    if (!course) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);
      if (isUuid) {
        course = await this.courseRepo.findOne({ where: { id: raw } });
      }
    }

    const courseSlug = course ? course.slug : normalized;
    const courseId = course ? course.id : null;

    const conditions: any[] = [{ courseSlug }];
    if (courseId) conditions.push({ courseId });

    const allRatings = await this.ratingRepo.find({
      where: conditions,
      order: { updatedAt: 'DESC' },
    });

    const publishedRatings = allRatings.filter((r) => r.status !== 'hidden');
    const totalRatings = publishedRatings.length;
    const sum = publishedRatings.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const averageRating = totalRatings > 0 ? Math.round((sum / totalRatings) * 10) / 10 : 0;

    let userRating: CourseRating | null = null;
    if (userId) {
      userRating = allRatings.find((r) => r.userId === userId) || null;
    }

    return {
      averageRating,
      totalRatings,
      userRating,
      reviews: publishedRatings.map((r) => ({
        id: r.id,
        userName: r.userName || 'Student',
        rating: r.rating,
        review: r.review || '',
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
    };
  }

  async submitCourseRating(
    slugOrId: string,
    user: { id: string; fullName?: string; email?: string },
    dto: { rating: number; review?: string },
  ) {
    const numericRating = Number(dto?.rating);
    if (!numericRating || isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      throw new BadRequestException('Rating must be an integer between 1 and 5');
    }

    const raw = decodeURIComponent(slugOrId).trim().toLowerCase();
    const normalized = raw.replace(/[\s_]+/g, '-');
    let course = await this.courseRepo.findOne({
      where: [{ slug: raw }, { slug: normalized }],
    });
    if (!course) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);
      if (isUuid) {
        course = await this.courseRepo.findOne({ where: { id: raw } });
      }
    }
    if (!course) {
      throw new NotFoundException(`Course not found`);
    }

    let existing = await this.ratingRepo.findOne({
      where: [
        { courseId: course.id, userId: user.id },
        { courseSlug: course.slug, userId: user.id },
      ],
    });

    const cleanReview = typeof dto.review === 'string' ? dto.review.trim() : null;
    const displayName = user.fullName || (user.email ? user.email.split('@')[0] : 'Student');

    if (existing) {
      existing.rating = Math.round(numericRating);
      existing.review = cleanReview;
      existing.userName = displayName;
      existing.courseId = course.id;
      existing.courseSlug = course.slug;
      await this.ratingRepo.save(existing);
    } else {
      existing = this.ratingRepo.create({
        courseId: course.id,
        courseSlug: course.slug,
        userId: user.id,
        userName: displayName,
        rating: Math.round(numericRating),
        review: cleanReview,
      });
      await this.ratingRepo.save(existing);
    }

    const stats = await this.getCourseRatingStats(course.id, course.slug);

    return {
      success: true,
      rating: existing,
      averageRating: stats.averageRating,
      totalRatings: stats.totalRatings,
    };
  }

  // ==========================================
  // Admin Reviews & Ratings Management
  // ==========================================

  async getAdminReviews(query: {
    courseId?: string;
    rating?: string;
    status?: string;
    search?: string;
  }): Promise<any[]> {
    // Build map of courses for nice course names
    const allCourses = await this.courseRepo.find({ select: ['id', 'slug', 'courseName'] });
    const courseMap = new Map<string, string>();
    allCourses.forEach((c) => {
      if (c.slug) courseMap.set(c.slug.toLowerCase(), c.courseName);
      if (c.id) courseMap.set(c.id, c.courseName);
    });

    const where: any = {};
    if (query.courseId && query.courseId !== 'all') {
      const matchCourse = allCourses.find((c) => c.id === query.courseId || c.slug === query.courseId);
      if (matchCourse) {
        where.courseSlug = matchCourse.slug;
      } else {
        where.courseSlug = query.courseId;
      }
    }

    if (query.rating && query.rating !== 'all') {
      const rNum = parseInt(query.rating, 10);
      if (!isNaN(rNum) && rNum >= 1 && rNum <= 5) {
        where.rating = rNum;
      }
    }

    if (query.status && query.status !== 'all') {
      if (query.status === 'hidden') {
        where.status = 'hidden';
      } else if (query.status === 'published' || query.status === 'active') {
        where.status = 'published';
      }
    }

    let list = await this.ratingRepo.find({
      where,
      order: { updatedAt: 'DESC' },
    });

    // If query.status === 'published', also include legacy records where status is null or not 'hidden'
    if (query.status === 'published' || query.status === 'active') {
      list = list.filter((r) => r.status !== 'hidden');
    }

    // Server-side search by course name, student name, or review text
    if (query.search && query.search.trim()) {
      const q = query.search.trim().toLowerCase();
      list = list.filter((r) => {
        const student = (r.userName || '').toLowerCase();
        const rev = (r.review || '').toLowerCase();
        const cName = (courseMap.get((r.courseSlug || '').toLowerCase()) || r.courseSlug || '').toLowerCase();
        return student.includes(q) || rev.includes(q) || cName.includes(q);
      });
    }

    return list.map((r) => ({
      id: r.id,
      courseId: r.courseId,
      courseSlug: r.courseSlug,
      courseName: courseMap.get((r.courseSlug || '').toLowerCase()) || r.courseSlug || 'Course',
      userId: r.userId,
      userName: r.userName || 'Student',
      rating: r.rating,
      review: r.review || '',
      status: r.status === 'hidden' ? 'hidden' : 'published',
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async getAdminReviewsSummary(courseIdOrSlug?: string): Promise<{
    averageRating: number;
    totalReviews: number;
    publishedCount: number;
    hiddenCount: number;
    distribution: Record<number, number>;
    percentages: Record<number, number>;
    courses: Array<{ id: string; slug: string; name: string; totalReviews: number; averageRating: number }>;
  }> {
    const allCourses = await this.courseRepo.find({ select: ['id', 'slug', 'courseName'] });
    const courseMap = new Map<string, string>();
    allCourses.forEach((c) => {
      if (c.slug) courseMap.set(c.slug.toLowerCase(), c.courseName);
      if (c.id) courseMap.set(c.id, c.courseName);
    });

    const where: any = {};
    if (courseIdOrSlug && courseIdOrSlug !== 'all') {
      const matchCourse = allCourses.find((c) => c.id === courseIdOrSlug || c.slug === courseIdOrSlug);
      if (matchCourse) {
        where.courseSlug = matchCourse.slug;
      } else {
        where.courseSlug = courseIdOrSlug;
      }
    }

    const allRatings = await this.ratingRepo.find({ where });

    const published = allRatings.filter((r) => r.status !== 'hidden');
    const hidden = allRatings.filter((r) => r.status === 'hidden');

    const totalPublished = published.length;
    const sum = published.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const averageRating = totalPublished > 0 ? Math.round((sum / totalPublished) * 10) / 10 : 0;

    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    const percentages: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    published.forEach((r) => {
      const val = Number(r.rating);
      if (val >= 1 && val <= 5) {
        distribution[val] = (distribution[val] || 0) + 1;
      }
    });

    if (totalPublished > 0) {
      [1, 2, 3, 4, 5].forEach((star) => {
        percentages[star] = Math.round(((distribution[star] || 0) / totalPublished) * 100);
      });
    }

    // Per-course breakdown
    const courseStatsMap = new Map<string, { total: number; sum: number }>();
    published.forEach((r) => {
      const s = (r.courseSlug || '').toLowerCase();
      const curr = courseStatsMap.get(s) || { total: 0, sum: 0 };
      curr.total += 1;
      curr.sum += Number(r.rating) || 0;
      courseStatsMap.set(s, curr);
    });

    const coursesBreakdown = allCourses.map((c) => {
      const stat = courseStatsMap.get(c.slug.toLowerCase()) || { total: 0, sum: 0 };
      const avg = stat.total > 0 ? Math.round((stat.sum / stat.total) * 10) / 10 : 0;
      return {
        id: c.id,
        slug: c.slug,
        name: c.courseName,
        totalReviews: stat.total,
        averageRating: avg,
      };
    });

    return {
      averageRating,
      totalReviews: totalPublished,
      publishedCount: totalPublished,
      hiddenCount: hidden.length,
      distribution,
      percentages,
      courses: coursesBreakdown,
    };
  }

  async updateAdminReviewStatus(id: string, status: string): Promise<any> {
    const cleanStatus = (status || '').toLowerCase().trim();
    if (cleanStatus !== 'published' && cleanStatus !== 'hidden') {
      throw new BadRequestException("Status must be either 'published' or 'hidden'");
    }

    const review = await this.ratingRepo.findOne({ where: { id } });
    if (!review) {
      throw new NotFoundException(`Review with ID "${id}" not found`);
    }

    review.status = cleanStatus;
    await this.ratingRepo.save(review);

    return {
      success: true,
      id: review.id,
      status: review.status,
      message: `Review marked as ${review.status}`,
    };
  }

  private parseDurationToSeconds(dur?: string | null): number {
    if (!dur || typeof dur !== 'string') return 0;
    const parts = dur.trim().split(':').map(Number);
    if (parts.length === 3 && parts.every((n) => !isNaN(n))) {
      return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    }
    if (parts.length === 2 && parts.every((n) => !isNaN(n))) {
      return (parts[0] * 60) + parts[1];
    }
    return 0;
  }

  /**
   * Upserts at most one course-bound playlist (and its ordered video lessons) inside the active transaction
   * only when playlist data or playlistVideos were explicitly provided. Never duplicates course_playlists rows.
   */
  private async upsertCourseBoundPlaylist(
    manager: EntityManager,
    savedCourse: CourseEntity,
    playlistInput: any,
    fallbackVideos: any[] | undefined,
    adminUser?: any,
  ): Promise<CoursePlaylist | null> {
    if (playlistInput === undefined && fallbackVideos === undefined) {
      return null;
    }

    const playlistRepo = manager.getRepository(CoursePlaylist);
    const videoRepo = manager.getRepository(CoursePlaylistVideo);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (playlistInput && playlistInput.enabled === false) {
      return null;
    }

    const rawVideos: any[] = Array.isArray(playlistInput?.videos)
      ? playlistInput.videos
      : Array.isArray(fallbackVideos)
        ? fallbackVideos
        : [];

    const hasExplicitId = typeof playlistInput?.id === 'string' && uuidRegex.test(playlistInput.id.trim());
    const hasTitle = typeof playlistInput?.title === 'string' && playlistInput.title.trim().length > 0;
    if (!hasExplicitId && rawVideos.length === 0 && !hasTitle) {
      return null;
    }

    let playlist: CoursePlaylist | null = null;
    if (hasExplicitId) {
      playlist = await playlistRepo.findOne({ where: { id: playlistInput.id.trim() } });
    }
    if (!playlist) {
      playlist = await playlistRepo.findOne({
        where: [{ courseId: savedCourse.id }, { courseSlug: savedCourse.slug }],
        order: { displayOrder: 'ASC', createdAt: 'ASC' },
      });
    }

    if (!playlist) {
      playlist = playlistRepo.create({
        courseId: savedCourse.id,
        courseSlug: savedCourse.slug,
        title: (playlistInput?.title || `${savedCourse.courseName} - Video Playlist`).trim(),
        description: playlistInput?.description?.trim() || savedCourse.shortDescription || null,
        thumbnailUrl: playlistInput?.thumbnailUrl?.trim() || savedCourse.thumbnailUrl || null,
        displayOrder: 0,
        isTrending: Boolean(playlistInput?.isTrending),
        category: savedCourse.category || 'entrepreneurship',
        level: savedCourse.level || 'Beginner',
        shortDescription: savedCourse.shortDescription || null,
        isFree: savedCourse.isFree ?? true,
        learn: Array.isArray(savedCourse.learn) ? savedCourse.learn : null,
        requirements: Array.isArray(savedCourse.requirements) ? savedCourse.requirements : null,
        resources: Array.isArray(savedCourse.resources) ? savedCourse.resources : null,
        assessments: Array.isArray(savedCourse.assessments) ? savedCourse.assessments : null,
        assessmentSettings: savedCourse.assessmentSettings || { enabled: true },
        createdBy: savedCourse.createdBy || adminUser?.id || null,
      });
    } else {
      playlist.courseId = savedCourse.id;
      playlist.courseSlug = savedCourse.slug;
      if (playlistInput?.title !== undefined && playlistInput.title.trim()) {
        playlist.title = playlistInput.title.trim();
      }
      if (playlistInput?.description !== undefined) {
        playlist.description = playlistInput.description?.trim() || null;
      }
      if (playlistInput?.thumbnailUrl !== undefined) {
        playlist.thumbnailUrl = playlistInput.thumbnailUrl?.trim() || savedCourse.thumbnailUrl || null;
      }
      if (playlistInput?.isTrending !== undefined) {
        playlist.isTrending = Boolean(playlistInput.isTrending);
      }
      playlist.category = savedCourse.category || playlist.category;
      playlist.level = savedCourse.level || playlist.level;
      playlist.isFree = savedCourse.isFree ?? playlist.isFree;
    }

    const savedPlaylist = await playlistRepo.save(playlist);

    if (Array.isArray(playlistInput?.videos) || Array.isArray(fallbackVideos)) {
      await videoRepo.delete({ playlistId: savedPlaylist.id });

      const videoEntities: CoursePlaylistVideo[] = [];
      let firstThumb: string | null = savedPlaylist.thumbnailUrl || null;

      for (let i = 0; i < rawVideos.length; i++) {
        const v = rawVideos[i];
        if (!v) continue;
        const title = String(v.title || v.t || `Video Lesson ${i + 1}`).trim();
        const rawMedia = String(v.youtubeUrl || v.youtubeVideoId || v.youtube || v.videoUrl || v.file || '').trim();
        const ytCheck = validateYoutubeUrlOrId(rawMedia);

        let youtubeUrl = '';
        let youtubeVideoId = '';
        let thumb = v.thumbnailUrl?.trim() || v.thumbnail?.trim() || null;

        if (ytCheck.valid && ytCheck.videoId && ytCheck.normalizedUrl) {
          youtubeUrl = ytCheck.normalizedUrl;
          youtubeVideoId = ytCheck.videoId;
          if (!thumb) thumb = getYoutubeThumbnailUrl(ytCheck.videoId, 'hqdefault');
        } else if (rawMedia && (rawMedia.startsWith('/uploads/') || /^https?:\/\//i.test(rawMedia))) {
          youtubeUrl = rawMedia;
          youtubeVideoId = '';
        } else {
          throw new BadRequestException(`Playlist video "${title}" requires a valid YouTube URL/ID or uploaded video file.`);
        }

        if (!firstThumb && thumb) firstThumb = thumb;

        videoEntities.push(
          videoRepo.create({
            playlistId: savedPlaylist.id,
            title,
            description: v.description?.trim() || null,
            youtubeUrl,
            youtubeVideoId,
            thumbnailUrl: thumb || savedCourse.thumbnailUrl || null,
            duration: v.duration?.trim() || null,
            displayOrder: typeof v.displayOrder === 'number' ? v.displayOrder : i,
            chapters: Array.isArray(v.chapters) ? v.chapters : null,
            notesUrl: v.notesUrl?.trim() || null,
            notesName: v.notesName?.trim() || null,
            notesSize: v.notesSize?.trim() || null,
            notesExt: v.notesExt?.trim() || null,
            assessments: Array.isArray(v.assessments) ? v.assessments : null,
          }),
        );
      }

      if (videoEntities.length > 0) {
        await videoRepo.save(videoEntities);
        if (!savedPlaylist.thumbnailUrl && firstThumb) {
          savedPlaylist.thumbnailUrl = firstThumb;
          await playlistRepo.save(savedPlaylist);
        }
      }
    }

    const loaded = await playlistRepo.findOne({
      where: { id: savedPlaylist.id },
      relations: ['videos'],
    });
    if (loaded?.videos) {
      loaded.videos.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
    }
    return loaded || savedPlaylist;
  }

  async create(dto: CreateCourseDto, adminUser?: any): Promise<any> {
    const result = await this.dataSource.transaction(async (manager) => {
      const courseRepo = manager.getRepository(CourseEntity);
      let slug = dto.slug.trim().toLowerCase();
      const exists = await courseRepo.findOne({ where: { slug } });
      if (exists) {
        slug = `${slug}-${Date.now().toString().slice(-4)}`;
      }

      let youtubeVideoId: string | null = null;
      let youtubeUrl: string | null = null;
      const rawYoutube = dto.youtubeUrl || dto.youtubeVideoId || (dto.videoUrl && (dto.videoUrl.includes('youtu.be') || dto.videoUrl.includes('youtube.com')) ? dto.videoUrl : null);
      if (rawYoutube) {
        const validated = assertValidYoutubeUrl(rawYoutube);
        youtubeVideoId = validated.videoId;
        youtubeUrl = validated.normalizedUrl;
      }

      let lessons = Array.isArray(dto.lessons) ? [...dto.lessons] : [];
      const maxDurationSec = this.parseDurationToSeconds(dto.duration);
      if (maxDurationSec > 0 && lessons.length > 0) {
        for (const l of lessons) {
          if (l.startTime !== undefined) {
            const sSec = Number(l.startTime);
            if (!isNaN(sSec) && sSec > maxDurationSec) {
              throw new BadRequestException(
                `Chapter "${l.title || l.t || 'Chapter'}" timestamp (${sSec}s) cannot exceed video duration (${dto.duration}).`
              );
            }
          }
        }
      }
      if (lessons.length > 0) {
        lessons = lessons.map((l) => {
          const lRaw = l.youtube || l.youtubeUrl || l.youtubeVideoId || (l.file && (l.file.includes('youtu.be') || l.file.includes('youtube.com')) ? l.file : null);
          if (lRaw) {
            const lVal = assertValidYoutubeUrl(lRaw);
            const autoThumb = `https://img.youtube.com/vi/${lVal.videoId}/maxresdefault.jpg`;
            const thumb = l.thumbnailUrl || l.thumbnail || autoThumb;
            return {
              ...l,
              youtube: lVal.videoId,
              youtubeVideoId: lVal.videoId,
              youtubeUrl: lVal.normalizedUrl,
              thumbnailUrl: thumb,
              thumbnail: thumb,
            };
          }
          return l;
        });
      }

      let courseThumbnail = dto.thumbnailUrl || null;
      if (!courseThumbnail && youtubeVideoId) {
        courseThumbnail = `https://img.youtube.com/vi/${youtubeVideoId}/maxresdefault.jpg`;
      } else if (!courseThumbnail && lessons.length > 0) {
        courseThumbnail = lessons[0].thumbnailUrl || lessons[0].thumbnail || null;
      }

      const course = courseRepo.create({
        ...dto,
        slug,
        youtubeUrl,
        youtubeVideoId,
        thumbnailUrl: courseThumbnail,
        status: dto.status || 'Active',
        trending: dto.trending ?? false,
        gradient: dto.gradient || 'from-brand-forest via-brand-deep to-brand-darker',
        lessons,
        sections: dto.sections || [],
        topics: dto.topics || [],
        price: dto.price !== undefined ? Number(dto.price) : 0,
        isFree: dto.isFree !== undefined ? !!dto.isFree : (Number(dto.price || 0) === 0),
        validityDays: dto.validityDays !== undefined ? Number(dto.validityDays) : 365,
        allowSubscription: dto.allowSubscription !== undefined ? !!dto.allowSubscription : true,
        duration: dto.duration || 'Self-paced',
        certificateEnabled: dto.certificateEnabled !== undefined ? !!dto.certificateEnabled : false,
        strictNonSkippable: dto.strictNonSkippable !== undefined ? !!dto.strictNonSkippable : true,
        requireProjectForCertificate: dto.requireProjectForCertificate !== undefined ? !!dto.requireProjectForCertificate : true,
        learn: dto.learn || [],
        requirements: dto.requirements || [],
        resources: dto.resources || [],
        assessments: dto.assessments || [],
        assessmentSettings: dto.assessmentSettings || {},
        createdBy: adminUser?.id || null,
      });

      const saved = await courseRepo.save(course);
      const linkedPlaylist = await this.upsertCourseBoundPlaylist(
        manager,
        saved,
        (dto as any).playlist,
        (dto as any).playlistVideos,
        adminUser,
      );

      // If the course had no primary video but a playlist video was added, sync fallback thumbnail/youtube on course
      if (linkedPlaylist?.videos?.length && !saved.youtubeVideoId && !saved.videoUrl) {
        const firstPlVid = linkedPlaylist.videos[0];
        if (firstPlVid.youtubeVideoId) {
          saved.youtubeVideoId = firstPlVid.youtubeVideoId;
          saved.youtubeUrl = firstPlVid.youtubeUrl;
        } else if (firstPlVid.youtubeUrl) {
          saved.videoUrl = firstPlVid.youtubeUrl;
        }
        if (!saved.thumbnailUrl && firstPlVid.thumbnailUrl) {
          saved.thumbnailUrl = firstPlVid.thumbnailUrl;
        }
        await courseRepo.save(saved);
      }

      return { saved, linkedPlaylist };
    });

    const formatted = this.formatCourse(result.saved);
    return result.linkedPlaylist
      ? { ...formatted, linkedPlaylist: result.linkedPlaylist, playlists: [result.linkedPlaylist] }
      : formatted;
  }

  async update(idOrSlug: string, dto: UpdateCourseDto, adminUser?: any): Promise<any> {
    const result = await this.dataSource.transaction(async (manager) => {
      const courseRepo = manager.getRepository(CourseEntity);
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
      const existing = isUuid
        ? await courseRepo.findOne({ where: { id: idOrSlug } })
        : await courseRepo.findOne({ where: { slug: idOrSlug.trim().toLowerCase() } });

      if (!existing) throw new NotFoundException(`Course '${idOrSlug}' not found`);

      if (dto.slug && dto.slug.trim().toLowerCase() !== existing.slug) {
        const slug = dto.slug.trim().toLowerCase();
        const conflict = await courseRepo.findOne({ where: { slug } });
        if (conflict) throw new ConflictException(`Course with slug '${slug}' already exists`);
        existing.slug = slug;
      }

      if (dto.courseName !== undefined) existing.courseName = dto.courseName;
      if (dto.category !== undefined) existing.category = dto.category;
      if (dto.level !== undefined) existing.level = dto.level;
      if (dto.shortDescription !== undefined) existing.shortDescription = dto.shortDescription;
      if (dto.description !== undefined) existing.description = dto.description;
      if (dto.status !== undefined) existing.status = dto.status;
      if (dto.trending !== undefined) existing.trending = dto.trending;
      if (dto.icon !== undefined) existing.icon = dto.icon;
      if (dto.image !== undefined) existing.image = dto.image;
      if (dto.gradient !== undefined) existing.gradient = dto.gradient;
      if (dto.videoUrl !== undefined) existing.videoUrl = dto.videoUrl;

      if (dto.topics !== undefined) existing.topics = dto.topics;
      if (dto.price !== undefined) {
        existing.price = Number(dto.price);
        existing.isFree = dto.isFree !== undefined ? !!dto.isFree : (existing.price === 0);
      }
      if (dto.isFree !== undefined) existing.isFree = !!dto.isFree;
      if (dto.validityDays !== undefined) existing.validityDays = Number(dto.validityDays);
      if (dto.allowSubscription !== undefined) existing.allowSubscription = !!dto.allowSubscription;
      if (dto.duration !== undefined) existing.duration = dto.duration;
      if (dto.certificateEnabled !== undefined) existing.certificateEnabled = !!dto.certificateEnabled;
      if (dto.strictNonSkippable !== undefined) existing.strictNonSkippable = !!dto.strictNonSkippable;
      if (dto.requireProjectForCertificate !== undefined) existing.requireProjectForCertificate = !!dto.requireProjectForCertificate;

      if (dto.youtubeUrl !== undefined || dto.youtubeVideoId !== undefined) {
        const raw = dto.youtubeUrl || dto.youtubeVideoId;
        if (raw && raw.trim()) {
          const val = assertValidYoutubeUrl(raw);
          existing.youtubeVideoId = val.videoId;
          existing.youtubeUrl = val.normalizedUrl;
        } else {
          existing.youtubeVideoId = null;
          existing.youtubeUrl = null;
        }
      } else if (dto.videoUrl !== undefined && (dto.videoUrl?.includes('youtu.be') || dto.videoUrl?.includes('youtube.com'))) {
        const val = assertValidYoutubeUrl(dto.videoUrl);
        existing.youtubeVideoId = val.videoId;
        existing.youtubeUrl = val.normalizedUrl;
      }

      if (dto.thumbnailUrl !== undefined) existing.thumbnailUrl = dto.thumbnailUrl;

      if (dto.lessons !== undefined) {
        let lessons = Array.isArray(dto.lessons) ? [...dto.lessons] : [];
        lessons = lessons.map((l) => {
          const lRaw = l.youtube || l.youtubeUrl || l.youtubeVideoId || (l.file && (l.file.includes('youtu.be') || l.file.includes('youtube.com')) ? l.file : null);
          if (lRaw) {
            const lVal = assertValidYoutubeUrl(lRaw);
            const autoThumb = `https://img.youtube.com/vi/${lVal.videoId}/maxresdefault.jpg`;
            const thumb = l.thumbnailUrl || l.thumbnail || autoThumb;
            return {
              ...l,
              youtube: lVal.videoId,
              youtubeVideoId: lVal.videoId,
              youtubeUrl: lVal.normalizedUrl,
              thumbnailUrl: thumb,
              thumbnail: thumb,
            };
          }
          return l;
        });
        const maxDur = this.parseDurationToSeconds(dto.duration || existing.duration);
        if (maxDur > 0 && lessons.length > 0) {
          for (const l of lessons) {
            if (l.startTime !== undefined) {
              const sSec = Number(l.startTime);
              if (!isNaN(sSec) && sSec > maxDur) {
                throw new BadRequestException(
                  `Chapter "${l.title || l.t || 'Chapter'}" timestamp (${sSec}s) cannot exceed video duration (${dto.duration || existing.duration}).`
                );
              }
            }
          }
        }
        existing.lessons = lessons;

        // Ensure course-level YouTube video is synced if not already explicitly set
        if (!existing.youtubeVideoId && dto.youtubeUrl === undefined && dto.youtubeVideoId === undefined) {
          const firstWithYt = lessons.find((l) => l.youtubeVideoId || l.youtube);
          if (firstWithYt) {
            existing.youtubeVideoId = firstWithYt.youtubeVideoId || firstWithYt.youtube;
            existing.youtubeUrl = firstWithYt.youtubeUrl || `https://www.youtube.com/watch?v=${existing.youtubeVideoId}`;
            if (!existing.thumbnailUrl) {
              existing.thumbnailUrl = firstWithYt.thumbnailUrl || `https://img.youtube.com/vi/${existing.youtubeVideoId}/maxresdefault.jpg`;
            }
          }
        }
      }

      if (existing.youtubeVideoId && !existing.thumbnailUrl) {
        existing.thumbnailUrl = `https://img.youtube.com/vi/${existing.youtubeVideoId}/maxresdefault.jpg`;
      }

      if (dto.learn !== undefined) existing.learn = dto.learn;
      if (dto.sections !== undefined) existing.sections = dto.sections;
      if (dto.requirements !== undefined) existing.requirements = dto.requirements;
      if (dto.resources !== undefined) existing.resources = dto.resources;
      if (dto.assessments !== undefined) existing.assessments = dto.assessments;
      if (dto.assessmentSettings !== undefined) existing.assessmentSettings = dto.assessmentSettings;

      const saved = await courseRepo.save(existing);
      const linkedPlaylist = await this.upsertCourseBoundPlaylist(
        manager,
        saved,
        (dto as any).playlist,
        (dto as any).playlistVideos,
        adminUser,
      );

      if (linkedPlaylist?.videos?.length && !saved.youtubeVideoId && !saved.videoUrl) {
        const firstPlVid = linkedPlaylist.videos[0];
        if (firstPlVid.youtubeVideoId) {
          saved.youtubeVideoId = firstPlVid.youtubeVideoId;
          saved.youtubeUrl = firstPlVid.youtubeUrl;
        } else if (firstPlVid.youtubeUrl) {
          saved.videoUrl = firstPlVid.youtubeUrl;
        }
        if (!saved.thumbnailUrl && firstPlVid.thumbnailUrl) {
          saved.thumbnailUrl = firstPlVid.thumbnailUrl;
        }
        await courseRepo.save(saved);
      }

      return { saved, linkedPlaylist };
    });

    const formatted = this.formatCourse(result.saved);
    return result.linkedPlaylist
      ? { ...formatted, linkedPlaylist: result.linkedPlaylist, playlists: [result.linkedPlaylist] }
      : formatted;
  }

  async updateAssessment(idOrSlug: string, assessments: any[], assessmentSettings: any = {}): Promise<any> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const course = isUuid
      ? await this.courseRepo.findOne({ where: { id: idOrSlug } })
      : await this.courseRepo.findOne({ where: { slug: idOrSlug.toLowerCase() } });

    if (!course) throw new NotFoundException(`Course '${idOrSlug}' not found`);

    course.assessments = assessments || [];
    course.assessmentSettings = assessmentSettings || {};
    const saved = await this.courseRepo.save(course);
    return this.formatCourse(saved);
  }

  async delete(idOrSlug: string): Promise<{ ok: boolean }> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const existing = isUuid
      ? await this.courseRepo.findOne({ where: { id: idOrSlug } })
      : await this.courseRepo.findOne({ where: { slug: idOrSlug.trim().toLowerCase() } });
    if (!existing) {
      // Course is already removed or does not exist in DB; return ok for idempotent deletion
      return { ok: true };
    }
    await this.courseRepo.delete(existing.id);
    await this.dataSource.getRepository(CourseView).delete({ slug: existing.slug }).catch(() => { });
    return { ok: true };
  }

  /**
   * Deletes a single lesson/video from a course by its zero-based index.
   * Keeps the course itself and remaining lessons intact.
   */
  async deleteLesson(idOrSlug: string, lessonIndex: number): Promise<any> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const course = isUuid
      ? await this.courseRepo.findOne({ where: { id: idOrSlug } })
      : await this.courseRepo.findOne({ where: { slug: idOrSlug.trim().toLowerCase() } });

    if (!course) throw new NotFoundException('Course not found');

    const lessons = Array.isArray(course.lessons) ? [...course.lessons] : [];
    if (lessonIndex < 0 || lessonIndex >= lessons.length) {
      throw new BadRequestException(`Lesson index ${lessonIndex} is out of bounds (total lessons: ${lessons.length})`);
    }

    // Remove only the selected lesson
    lessons.splice(lessonIndex, 1);
    course.lessons = lessons;

    // Synchronize primary course-level video and thumbnail
    const firstYt = lessons.find((l) => l.youtubeVideoId || l.youtube);
    if (firstYt) {
      course.youtubeVideoId = firstYt.youtubeVideoId || firstYt.youtube;
      course.youtubeUrl = firstYt.youtubeUrl || `https://www.youtube.com/watch?v=${course.youtubeVideoId}`;
      if (!course.thumbnailUrl || course.thumbnailUrl.includes('img.youtube.com')) {
        course.thumbnailUrl = firstYt.thumbnailUrl || firstYt.thumbnail || `https://img.youtube.com/vi/${course.youtubeVideoId}/maxresdefault.jpg`;
      }
    } else if (lessons.length === 0) {
      course.youtubeVideoId = null;
      course.youtubeUrl = null;
    }

    // Safely update assessment questions if any were attached to this video index
    if (Array.isArray(course.assessments)) {
      course.assessments = course.assessments
        .filter((q) => Number(q.videoIndex) !== lessonIndex)
        .map((q) => {
          const idx = Number(q.videoIndex);
          if (idx > lessonIndex) {
            return { ...q, videoIndex: idx - 1 };
          }
          return q;
        });
    }

    const saved = await this.courseRepo.save(course);
    return this.formatCourse(saved);
  }

  /** Generates template workbook buffer containing only column headings. */
  generateTemplateBuffer(): Buffer {
    const wb = XLSX.utils.book_new();

    // Sheet: Courses (Headings only)
    const headers = ['course_name', 'category', 'level', 'short_description', 'status', 'trending'];
    const wsCourses = XLSX.utils.aoa_to_sheet([headers]);
    wsCourses['!cols'] = [
      { wch: 35 }, // course_name
      { wch: 18 }, // category
      { wch: 15 }, // level
      { wch: 60 }, // short_description
      { wch: 12 }, // status
      { wch: 12 }, // trending
    ];
    XLSX.utils.book_append_sheet(wb, wsCourses, 'Courses');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  /** Generates export workbook buffer for all database courses. */
  async generateExportBuffer(): Promise<Buffer> {
    const list = await this.courseRepo.find({ order: { createdAt: 'DESC' } });
    const exportData = list.map((c) => ({
      course_name: c.courseName,
      category: c.category,
      level: c.level,
      short_description: c.shortDescription,
      status: c.status || 'Active',
      trending: c.trending ? 'Yes' : 'No',
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(exportData, {
      header: [
        'course_name',
        'category',
        'level',
        'short_description',
        'status',
        'trending',
      ],
    });
    ws['!cols'] = [
      { wch: 35 },
      { wch: 18 },
      { wch: 15 },
      { wch: 60 },
      { wch: 12 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, 'Courses');

    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Parses and validates uploaded Excel buffer.
   * Checks every row without writing to database.
   * Reports exact row numbers and failure reasons.
   */
  async parseAndValidateExcel(buffer: Buffer): Promise<ValidationResult> {
    let workbook: XLSX.WorkBook;
    try {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    } catch (e) {
      throw new BadRequestException('Could not parse Excel file. The file may be corrupt or not a valid Excel format.');
    }

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new BadRequestException('Excel file has no sheets.');
    }

    // Prefer sheet named "Courses" (case-insensitive), or take first sheet
    const targetSheetName = workbook.SheetNames.find((s) => s.trim().toLowerCase() === 'courses') || workbook.SheetNames[0];
    const sheet = workbook.Sheets[targetSheetName];
    if (!sheet) {
      throw new BadRequestException(`Sheet '${targetSheetName}' not found or empty.`);
    }

    const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    if (!rawRows || rawRows.length < 2) {
      throw new BadRequestException('Excel sheet has no data rows. Please use the downloaded template.');
    }

    // Analyze Header Row (Row 1)
    const headerRow = rawRows[0].map((h) => String(h || '').trim().toLowerCase().replace(/[\s-]+/g, '_'));
    const colIdx = {
      courseName: headerRow.findIndex((h) => ['course_name', 'coursename', 'title', 'course_title'].includes(h)),
      slug: headerRow.findIndex((h) => ['slug', 'course_slug'].includes(h)),
      category: headerRow.findIndex((h) => ['category', 'cat'].includes(h)),
      level: headerRow.findIndex((h) => ['level', 'difficulty'].includes(h)),
      shortDescription: headerRow.findIndex((h) => ['short_description', 'shortdescription', 'description', 'short_desc'].includes(h)),
      status: headerRow.findIndex((h) => ['status', 'state'].includes(h)),
      trending: headerRow.findIndex((h) => ['trending', 'is_trending', 'popular'].includes(h)),
    };

    const missingHeaders: string[] = [];
    if (colIdx.courseName === -1) missingHeaders.push('course_name');
    if (colIdx.category === -1) missingHeaders.push('category');
    if (colIdx.level === -1) missingHeaders.push('level');
    if (colIdx.shortDescription === -1) missingHeaders.push('short_description');

    if (missingHeaders.length > 0) {
      throw new BadRequestException(`Missing required columns in Excel: ${missingHeaders.join(', ')}. Required: course_name, category, level, short_description.`);
    }

    const seenFileKeys = new Set<string>();
    const errors: ExcelRowError[] = [];
    const validRows: Array<{
      courseName: string;
      slug: string;
      category: string;
      level: string;
      shortDescription: string;
      status: string;
      trending: boolean;
    }> = [];

    const allowedLevels = ['beginner', 'intermediate', 'advanced', 'all levels'];
    const allowedStatuses = ['active', 'draft', 'inactive', 'archived'];

    let totalDataRows = 0;

    // Check each data row (Row 2 onwards, 1-indexed for the user)
    for (let i = 1; i < rawRows.length; i++) {
      const row = rawRows[i];
      const excelRowNum = i + 1; // 1-indexed for humans (Header is Row 1)

      // Skip completely empty rows
      const hasAnyContent = row.some((cell) => cell !== '' && cell !== null && cell !== undefined);
      if (!hasAnyContent) continue;

      totalDataRows++;

      const rawCourseName = String(row[colIdx.courseName] ?? '').trim();
      let rawSlug = colIdx.slug !== -1 ? String(row[colIdx.slug] ?? '').trim().toLowerCase() : '';
      if (!rawSlug && rawCourseName) {
        rawSlug = rawCourseName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }

      const rawCategory = String(row[colIdx.category] ?? '').trim();
      const rawLevel = String(row[colIdx.level] ?? '').trim();
      const rawShort = String(row[colIdx.shortDescription] ?? '').trim();
      const rawStatus = colIdx.status !== -1 ? String(row[colIdx.status] ?? '').trim() : '';
      const rawTrending = colIdx.trending !== -1 ? String(row[colIdx.trending] ?? '').trim() : '';

      let rowHasError = false;

      // 1. course_name validation
      if (!rawCourseName || rawCourseName.length < 3) {
        errors.push({ row: excelRowNum, error: 'course_name is required (minimum 3 characters)' });
        rowHasError = true;
      }

      // 2. duplicate course validation in file
      const dedupeKey = rawSlug || rawCourseName.toLowerCase();
      if (seenFileKeys.has(dedupeKey)) {
        errors.push({ row: excelRowNum, error: `duplicate course '${rawCourseName}' in file` });
        rowHasError = true;
      } else {
        seenFileKeys.add(dedupeKey);
      }

      // 3. category validation
      if (!rawCategory) {
        errors.push({ row: excelRowNum, error: 'category is required' });
        rowHasError = true;
      }

      // 4. level validation
      if (!rawLevel) {
        errors.push({ row: excelRowNum, error: 'level is required' });
        rowHasError = true;
      } else if (!allowedLevels.includes(rawLevel.toLowerCase())) {
        errors.push({ row: excelRowNum, error: 'level is invalid (must be Beginner, Intermediate, Advanced, or All levels)' });
        rowHasError = true;
      }

      // 5. short_description validation
      if (!rawShort || rawShort.length < 5) {
        errors.push({ row: excelRowNum, error: 'short_description is required (minimum 5 characters)' });
        rowHasError = true;
      }

      // 6. status validation
      let finalStatus = 'Active';
      if (rawStatus) {
        if (!allowedStatuses.includes(rawStatus.toLowerCase())) {
          errors.push({ row: excelRowNum, error: 'status is invalid (must be Active, Draft, Inactive, or Archived)' });
          rowHasError = true;
        } else {
          finalStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
        }
      }

      // 7. trending validation
      let finalTrending = false;
      if (rawTrending) {
        const trendLower = rawTrending.toLowerCase();
        if (['yes', 'true', '1', 'y'].includes(trendLower)) {
          finalTrending = true;
        } else if (['no', 'false', '0', 'n'].includes(trendLower)) {
          finalTrending = false;
        } else {
          errors.push({ row: excelRowNum, error: 'trending must be Yes or No' });
          rowHasError = true;
        }
      }

      if (!rowHasError) {
        const normalizedLevel = rawLevel.charAt(0).toUpperCase() + rawLevel.slice(1).toLowerCase();
        validRows.push({
          courseName: rawCourseName,
          slug: rawSlug,
          category: rawCategory.toLowerCase(),
          level: normalizedLevel,
          shortDescription: rawShort,
          status: finalStatus,
          trending: finalTrending,
        });
      }
    }

    const errorRowSet = new Set(errors.map((e) => e.row));
    const validCount = totalDataRows - errorRowSet.size;

    return {
      valid: errors.length === 0,
      totalRows: totalDataRows,
      validCount,
      errorCount: errors.length,
      errors,
      validRows: errors.length === 0 ? validRows : [],
    };
  }

  /**
   * Generates Excel workbook buffer containing this specific course's data.
   * Matches the exact same columns and validation structure as Admin import/export.
   */
  generateSingleCourseExcelBuffer(course: CourseEntity): Buffer {
    const wb = XLSX.utils.book_new();

    const courseData = [
      {
        course_name: course.courseName,
        category: course.category,
        level: course.level,
        short_description: course.shortDescription,
        status: course.status || 'Active',
        trending: course.trending ? 'Yes' : 'No',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(courseData, {
      header: ['course_name', 'category', 'level', 'short_description', 'status', 'trending'],
    });

    ws['!cols'] = [
      { wch: 35 }, // course_name
      { wch: 18 }, // category
      { wch: 15 }, // level
      { wch: 60 }, // short_description
      { wch: 12 }, // status
      { wch: 12 }, // trending
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Courses');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  /**
   * Atomically imports validated courses into PostgreSQL.
   * If course already exists (by slug or name), updates that existing course.
   * Otherwise, creates a new course record.
   * Optionally associates the uploaded Excel file with the courses.
   */
  async importCourses(
    coursesToImport: Array<{
      courseName: string;
      slug: string;
      category: string;
      level: string;
      shortDescription: string;
      status?: string;
      trending?: boolean;
    }>,
    uploadedFile?: { originalname: string; buffer: Buffer },
  ): Promise<{ ok: boolean; importedCount: number; message: string }> {
    if (!coursesToImport || !Array.isArray(coursesToImport) || coursesToImport.length === 0) {
      throw new BadRequestException('No course data provided to import.');
    }

    let storedFileName: string | null = null;
    let storedFileUrl: string | null = null;

    if (uploadedFile && uploadedFile.buffer) {
      try {
        const coursesUploadDir = join(process.cwd(), 'uploads', 'courses');
        if (!existsSync(coursesUploadDir)) {
          mkdirSync(coursesUploadDir, { recursive: true });
        }
        storedFileName = uploadedFile.originalname;
        const safeDiskName = `${Date.now()}_${uploadedFile.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const diskPath = join(coursesUploadDir, safeDiskName);
        writeFileSync(diskPath, uploadedFile.buffer);
        storedFileUrl = `/uploads/courses/${safeDiskName}`;
      } catch (err) {
        console.warn('Could not store uploaded course Excel file to disk:', err.message);
      }
    }

    await this.dataSource.transaction(async (manager) => {
      for (const item of coursesToImport) {
        const slug = item.slug.trim().toLowerCase();
        let existing = await manager.findOne(CourseEntity, { where: { slug } });
        if (!existing) {
          existing = await manager.findOne(CourseEntity, { where: { courseName: item.courseName.trim() } });
        }

        if (existing) {
          existing.courseName = item.courseName.trim();
          existing.category = item.category.trim().toLowerCase();
          existing.level = item.level.trim();
          existing.shortDescription = item.shortDescription.trim();
          if (item.status) existing.status = item.status;
          if (item.trending !== undefined) existing.trending = !!item.trending;
          if (storedFileName && storedFileUrl) {
            existing.excelFileName = storedFileName;
            existing.excelFileUrl = storedFileUrl;
          }
          await manager.save(existing);
        } else {
          const entity = manager.create(CourseEntity, {
            courseName: item.courseName.trim(),
            slug,
            category: item.category.trim().toLowerCase(),
            level: item.level.trim(),
            shortDescription: item.shortDescription.trim(),
            status: item.status || 'Active',
            trending: !!item.trending,
            gradient: 'from-brand-forest via-brand-deep to-brand-darker',
            lessons: [],
            learn: ['Hands-on practical skills', 'Comprehensive curriculum guidance'],
            excelFileName: storedFileName,
            excelFileUrl: storedFileUrl,
          });
          await manager.save(entity);
        }
      }
    });

    return {
      ok: true,
      importedCount: coursesToImport.length,
      message: `${coursesToImport.length} courses processed successfully (updated/imported into database).`,
    };
  }

  /**
   * Associates an uploaded Excel file directly with an existing course.
   */
  async attachExcelToCourse(
    idOrSlug: string,
    file: { originalname: string; buffer: Buffer },
  ): Promise<any> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const course = isUuid
      ? await this.courseRepo.findOne({ where: { id: idOrSlug } })
      : await this.courseRepo.findOne({ where: { slug: idOrSlug.trim().toLowerCase() } });

    if (!course) {
      throw new NotFoundException(`Course '${idOrSlug}' not found.`);
    }

    const coursesUploadDir = join(process.cwd(), 'uploads', 'courses');
    if (!existsSync(coursesUploadDir)) {
      mkdirSync(coursesUploadDir, { recursive: true });
    }

    const safeDiskName = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const diskPath = join(coursesUploadDir, safeDiskName);
    writeFileSync(diskPath, file.buffer);

    course.excelFileName = file.originalname;
    course.excelFileUrl = `/uploads/courses/${safeDiskName}`;

    const saved = await this.courseRepo.save(course);
    return this.formatCourse(saved);
  }

  /**
   * Removes associated Excel file from a course.
   */
  async removeExcelFromCourse(idOrSlug: string): Promise<any> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const course = isUuid
      ? await this.courseRepo.findOne({ where: { id: idOrSlug } })
      : await this.courseRepo.findOne({ where: { slug: idOrSlug.trim().toLowerCase() } });

    if (!course) {
      throw new NotFoundException(`Course '${idOrSlug}' not found.`);
    }

    course.excelFileName = null;
    course.excelFileUrl = null;

    const saved = await this.courseRepo.save(course);
    return this.formatCourse(saved);
  }

  /**
   * Parses workbook sheets of a course and returns structured JSON for HTML table presentation.
   * Supports multiple sheets.
   */
  async getCourseExcelSheets(slug: string): Promise<{
    courseName: string;
    slug: string;
    fileName: string;
    fileUrl: string | null;
    sheets: Array<{
      name: string;
      headers: string[];
      rows: any[][];
      totalRows: number;
    }>;
  }> {
    const normalized = slug.trim().toLowerCase();
    const course = await this.courseRepo.findOne({ where: { slug: normalized } });
    if (!course) {
      throw new NotFoundException(`Course with slug '${slug}' not found`);
    }

    let wb: XLSX.WorkBook | null = null;

    if (course.excelFileUrl) {
      const diskPath = join(process.cwd(), course.excelFileUrl.replace(/^\//, ''));
      if (existsSync(diskPath)) {
        try {
          wb = XLSX.readFile(diskPath);
        } catch (err) {
          console.warn('Could not read excel file from disk, falling back to generated excel:', err.message);
        }
      }
    }

    if (!wb) {
      const buffer = this.generateSingleCourseExcelBuffer(course);
      wb = XLSX.read(buffer, { type: 'buffer' });
    }

    const sheets = (wb.SheetNames || []).map((name) => {
      const ws = wb.Sheets[name];
      const raw = (XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' }) || []) as any[][];
      let headers: string[] = [];
      let rows: any[][] = [];

      if (raw.length > 0) {
        headers = (raw[0] || []).map((h) => String(h ?? '').trim());
        rows = raw.slice(1).filter((r) => r.some((c) => String(c ?? '').trim() !== ''));
      }

      return {
        name,
        headers,
        rows,
        totalRows: rows.length,
      };
    });

    return {
      courseName: course.courseName,
      slug: course.slug,
      fileName: course.excelFileName || `${course.slug}.xlsx`,
      fileUrl: course.excelFileUrl || null,
      sheets,
    };
  }
}

