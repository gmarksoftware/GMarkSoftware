import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { AdminVideoAssignment, CourseEntity, CoursePlaylist, CoursePlaylistVideo } from '../entities';
import {
  AddPlaylistVideoDto,
  CreatePlaylistDto,
  ReorderPlaylistVideosDto,
  UpdatePlaylistDto,
  UpdatePlaylistVideoDto,
} from '../dto';
import { assertValidYoutubeUrl, getYoutubeThumbnailUrl } from './youtube.util';

export interface PlaylistFilterOptions {
  courseId?: string;
  courseSlug?: string;
  isTrending?: boolean;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function isUuid(val?: string | null): boolean {
  return typeof val === 'string' && UUID_REGEX.test(val.trim());
}

@Injectable()
export class PlaylistsService implements OnModuleInit {
  constructor(
    @InjectRepository(CoursePlaylist)
    private readonly playlistRepo: Repository<CoursePlaylist>,
    @InjectRepository(CoursePlaylistVideo)
    private readonly videoRepo: Repository<CoursePlaylistVideo>,
    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,
    private readonly dataSource: DataSource,
  ) { }

  async onModuleInit() {
    try {
      await this.dataSource.query(`
        CREATE TABLE IF NOT EXISTS course_playlists (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "courseId" varchar NOT NULL,
          "courseSlug" varchar NOT NULL,
          "title" varchar NOT NULL,
          "description" text,
          "thumbnailUrl" varchar,
          "displayOrder" integer DEFAULT 0,
          "isTrending" boolean DEFAULT false,
          "createdAt" timestamp NOT NULL DEFAULT now(),
          "updatedAt" timestamp NOT NULL DEFAULT now()
        );

        ALTER TABLE course_playlists ADD COLUMN IF NOT EXISTS "isTrending" boolean DEFAULT false;
        ALTER TABLE course_playlists ADD COLUMN IF NOT EXISTS "category" varchar;
        ALTER TABLE course_playlists ADD COLUMN IF NOT EXISTS "level" varchar DEFAULT 'Beginner';
        ALTER TABLE course_playlists ADD COLUMN IF NOT EXISTS "shortDescription" text;
        ALTER TABLE course_playlists ADD COLUMN IF NOT EXISTS "isFree" boolean DEFAULT true;
        ALTER TABLE course_playlists ADD COLUMN IF NOT EXISTS "learn" jsonb;
        ALTER TABLE course_playlists ADD COLUMN IF NOT EXISTS "requirements" jsonb;
        ALTER TABLE course_playlists ADD COLUMN IF NOT EXISTS "resources" jsonb;
        ALTER TABLE course_playlists ADD COLUMN IF NOT EXISTS "assessments" jsonb;
        ALTER TABLE course_playlists ADD COLUMN IF NOT EXISTS "assessmentSettings" jsonb;
        ALTER TABLE course_playlists ALTER COLUMN "courseId" DROP NOT NULL;
        ALTER TABLE course_playlists ALTER COLUMN "courseSlug" DROP NOT NULL;

        CREATE TABLE IF NOT EXISTS course_playlist_videos (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "playlistId" uuid NOT NULL,
          "title" varchar NOT NULL,
          "description" text,
          "youtubeUrl" varchar NOT NULL,
          "youtubeVideoId" varchar NOT NULL,
          "thumbnailUrl" varchar,
          "duration" varchar,
          "displayOrder" integer DEFAULT 0,
          "chapters" jsonb,
          "notesUrl" varchar,
          "notesName" varchar,
          "notesSize" varchar,
          "notesExt" varchar,
          "createdAt" timestamp NOT NULL DEFAULT now(),
          "updatedAt" timestamp NOT NULL DEFAULT now()
        );

        ALTER TABLE course_playlist_videos ADD COLUMN IF NOT EXISTS "notesUrl" varchar;
        ALTER TABLE course_playlist_videos ADD COLUMN IF NOT EXISTS "notesName" varchar;
        ALTER TABLE course_playlist_videos ADD COLUMN IF NOT EXISTS "notesSize" varchar;
        ALTER TABLE course_playlist_videos ADD COLUMN IF NOT EXISTS "notesExt" varchar;
        ALTER TABLE course_playlist_videos ADD COLUMN IF NOT EXISTS "chapters" jsonb DEFAULT '[]'::jsonb;
        ALTER TABLE course_playlist_videos ADD COLUMN IF NOT EXISTS "assessments" jsonb;

        CREATE INDEX IF NOT EXISTS "IDX_course_playlists_courseId" ON course_playlists ("courseId");
        CREATE INDEX IF NOT EXISTS "IDX_course_playlists_courseSlug" ON course_playlists ("courseSlug");
        CREATE INDEX IF NOT EXISTS "IDX_course_playlist_videos_playlistId" ON course_playlist_videos ("playlistId");
      `);
    } catch (err: any) {
      console.warn('Course Playlists PostgreSQL table setup notice:', err.message);
    }

    // No dummy playlists seeded automatically; only authentic admin-created playlists and videos are kept.
  }

  /**
   * Helper to enrich playlists with course name and video count
   */
  private async enrichPlaylists(playlists: CoursePlaylist[]): Promise<CoursePlaylist[]> {
    if (!playlists || !playlists.length) return [];

    const courses = await this.courseRepo.find({
      select: ['id', 'slug', 'courseName'],
    });
    const courseMap = new Map<string, { id: string; slug: string; name: string }>();
    for (const c of courses) {
      if (c.id) courseMap.set(c.id, { id: c.id, slug: c.slug, name: c.courseName });
      if (c.slug) courseMap.set(c.slug, { id: c.id, slug: c.slug, name: c.courseName });
    }

    return playlists.map((pl) => {
      const sortedVideos = (pl.videos || []).sort(
        (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0),
      );
      const matchedCourse = courseMap.get(pl.courseId) || courseMap.get(pl.courseSlug);
      const firstVid = sortedVideos[0];
      const fallbackThumb =
        pl.thumbnailUrl ||
        firstVid?.thumbnailUrl ||
        (firstVid?.youtubeVideoId
          ? `https://img.youtube.com/vi/${firstVid.youtubeVideoId}/hqdefault.jpg`
          : null);

      return {
        ...pl,
        thumbnailUrl: fallbackThumb,
        videos: sortedVideos,
        videoCount: sortedVideos.length,
        courseName: matchedCourse ? matchedCourse.name : pl.courseSlug,
        courseSlug: matchedCourse ? matchedCourse.slug : pl.courseSlug,
        course: matchedCourse || { id: pl.courseId, slug: pl.courseSlug, name: pl.courseSlug },
      } as CoursePlaylist;
    });
  }

  /**
   * Safe course finder that prevents PostgreSQL UUID syntax errors when given slug or id
   */
  private async findCourse(courseIdOrSlug?: string, courseSlug?: string): Promise<CourseEntity | null> {
    if (!courseIdOrSlug && !courseSlug) return null;

    const terms = [courseIdOrSlug, courseSlug].filter(Boolean) as string[];
    const whereConditions: any[] = [];

    for (const term of terms) {
      const cleanTerm = term.trim();
      whereConditions.push({ slug: cleanTerm });
      if (isUuid(cleanTerm)) {
        whereConditions.push({ id: cleanTerm });
      }
    }

    let course = await this.courseRepo.findOne({
      where: whereConditions,
    });

    if (!course) {
      const allCourses = await this.courseRepo.find();
      for (const term of terms) {
        const lower = term.toLowerCase().trim();
        course = allCourses.find((c) =>
          c.slug?.toLowerCase() === lower ||
          c.courseName?.toLowerCase() === lower ||
          c.id?.toLowerCase() === lower
        ) || null;
        if (course) break;
      }
    }

    return course;
  }

  /**
   * List all playlists, optionally filtered by courseId, courseSlug, or isTrending (scoped for Sub-Admin if provided)
   */
  async findAll(filter?: PlaylistFilterOptions, adminUser?: any): Promise<CoursePlaylist[]> {
    const qb = this.playlistRepo
      .createQueryBuilder('pl')
      .leftJoinAndSelect('pl.videos', 'video')
      .orderBy('pl.displayOrder', 'ASC')
      .addOrderBy('pl.createdAt', 'ASC')
      .addOrderBy('video.displayOrder', 'ASC');

    if (filter?.courseId) {
      const cId = filter.courseId.trim();
      if (isUuid(cId)) {
        qb.andWhere('(pl.courseId = :cId OR LOWER(pl.courseSlug) = LOWER(:cId))', { cId });
      } else {
        qb.andWhere('(LOWER(pl.courseSlug) = LOWER(:cId) OR pl.courseId = :cId)', { cId });
      }
    }
    if (filter?.courseSlug) {
      const cSlug = filter.courseSlug.trim();
      if (isUuid(cSlug)) {
        qb.andWhere('(pl.courseId = :cSlug OR LOWER(pl.courseSlug) = LOWER(:cSlug))', { cSlug });
      } else {
        qb.andWhere('(LOWER(pl.courseSlug) = LOWER(:cSlug) OR pl.courseId = :cSlug)', { cSlug });
      }
    }
    if (filter?.isTrending !== undefined) {
      qb.andWhere('pl.isTrending = :isTr', { isTr: filter.isTrending });
    }

    let playlists = await qb.getMany();

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
        const assignedPlaylistIds = new Set(
          (assignments || []).map((a) => a.playlistId).filter(Boolean),
        );
        const assignedVideoIds = new Set(
          (assignments || [])
            .map((a) => (a.videoId || '').trim())
            .filter((v) => Boolean(v) && v !== 'ALL'),
        );
        const assignedVideoTitles = new Set(
          (assignments || [])
            .map((a) => (a.videoTitle || '').trim().toLowerCase())
            .filter(Boolean),
        );

        playlists = playlists
          .filter((pl) => {
            if (pl.createdBy && pl.createdBy === adminUser.id) return true;
            const cSlug = (pl.courseSlug || '').trim().toLowerCase();
            // 1. Full course assignment
            if (cSlug && fullCourseSlugs.has(cSlug)) return true;

            // 2. Explicit playlist assignment
            if (assignedPlaylistIds.has(pl.id)) return true;

            // 3. At least one video inside matches
            if (Array.isArray(pl.videos) && pl.videos.length > 0) {
              return pl.videos.some(
                (v) =>
                  assignedVideoIds.has(v.id) ||
                  (v.youtubeVideoId && assignedVideoIds.has(v.youtubeVideoId)) ||
                  (v.title && assignedVideoTitles.has(v.title.trim().toLowerCase())),
              );
            }
            return false;
          })
          .map((pl) => {
            if (pl.createdBy && pl.createdBy === adminUser.id) {
              return pl;
            }
            const cSlug = (pl.courseSlug || '').trim().toLowerCase();
            const hasFullCourse = cSlug && fullCourseSlugs.has(cSlug);
            const isFullPlaylist = (assignments || []).some(
              (a) => a.playlistId === pl.id && (!a.videoId || a.videoId === 'ALL'),
            );
            if (hasFullCourse || isFullPlaylist) {
              return pl;
            }

            if (Array.isArray(pl.videos) && pl.videos.length > 0) {
              const scopedVideos = pl.videos.filter(
                (v) =>
                  assignedVideoIds.has(v.id) ||
                  (v.youtubeVideoId && assignedVideoIds.has(v.youtubeVideoId)) ||
                  (v.title && assignedVideoTitles.has(v.title.trim().toLowerCase())),
              );
              return { ...pl, videos: scopedVideos };
            }
            return pl;
          })
          .filter((pl) => {
            if (pl.createdBy && pl.createdBy === adminUser.id) return true;
            const cSlug = (pl.courseSlug || '').trim().toLowerCase();
            if (cSlug && fullCourseSlugs.has(cSlug)) return true;
            if (assignedPlaylistIds.has(pl.id)) return true;
            return Array.isArray(pl.videos) && pl.videos.length > 0;
          });
      } catch (err: any) {
        console.warn('Scoping playlists for admin notice:', err.message);
        return [];
      }
    }

    return this.enrichPlaylists(playlists);
  }

  async isPlaylistAssignedToAdmin(pl: CoursePlaylist, adminUser: any, specificVideoId?: string): Promise<boolean> {
    if (!adminUser || adminUser.role === 'super_admin') return true;
    if (adminUser.role !== 'admin') return false;
    if (pl.createdBy && pl.createdBy === adminUser.id) return true;

    const assignments = await this.dataSource.getRepository(AdminVideoAssignment).find({
      where: { adminId: adminUser.id },
    });
    if (!assignments || assignments.length === 0) return false;

    const cSlug = (pl.courseSlug || '').trim().toLowerCase();
    const plId = pl.id;

    const hasFullAccess = assignments.some((a) => {
      const aSlug = (a.courseSlug || '').trim().toLowerCase();
      if (aSlug && aSlug === cSlug && (!a.videoId || a.videoId === 'ALL') && !a.playlistId) return true;
      if (a.playlistId && a.playlistId === plId && (!a.videoId || a.videoId === 'ALL')) return true;
      return false;
    });
    if (hasFullAccess) return true;

    if (specificVideoId) {
      return assignments.some((a) => a.videoId && a.videoId === specificVideoId);
    }

    if (pl.videos && pl.videos.length > 0) {
      const allowedVideoIds = new Set(assignments.map((a) => a.videoId).filter(Boolean));
      const allowedTitles = new Set(assignments.map((a) => (a.videoTitle || '').trim().toLowerCase()).filter(Boolean));
      return pl.videos.some((v) => allowedVideoIds.has(v.id) || (v.youtubeVideoId && allowedVideoIds.has(v.youtubeVideoId)) || (v.title && allowedTitles.has(v.title.trim().toLowerCase())));
    }

    return false;
  }

  async isVideoAssignedToAdmin(videoId: string, adminUser: any): Promise<boolean> {
    if (!adminUser || adminUser.role === 'super_admin') return true;
    if (adminUser.role !== 'admin') return false;

    if (isUuid(videoId)) {
      const video = await this.videoRepo.findOne({ where: { id: videoId }, relations: ['playlist'] });
      if (video?.playlist?.createdBy && video.playlist.createdBy === adminUser.id) {
        return true;
      }
    }

    const assignments = await this.dataSource.getRepository(AdminVideoAssignment).find({
      where: { adminId: adminUser.id },
    });
    return assignments.some((a) => a.videoId && a.videoId === videoId);
  }

  /**
   * Get all playlists marked as trending by admin
   */
  async findTrending(): Promise<CoursePlaylist[]> {
    const qb = this.playlistRepo
      .createQueryBuilder('pl')
      .leftJoinAndSelect('pl.videos', 'video')
      .where('pl.isTrending = :isTr', { isTr: true })
      .orderBy('pl.displayOrder', 'ASC')
      .addOrderBy('pl.createdAt', 'ASC')
      .addOrderBy('video.displayOrder', 'ASC');

    const playlists = await qb.getMany();
    return this.enrichPlaylists(playlists);
  }

  /**
   * Get a single playlist by ID
   */
  async findOne(id: string): Promise<CoursePlaylist> {
    if (!isUuid(id)) {
      throw new NotFoundException(`Playlist with ID "${id}" not found.`);
    }

    const playlist = await this.playlistRepo
      .createQueryBuilder('pl')
      .leftJoinAndSelect('pl.videos', 'video')
      .where('pl.id = :id', { id })
      .orderBy('video.displayOrder', 'ASC')
      .getOne();

    if (!playlist) {
      throw new NotFoundException(`Playlist with ID "${id}" not found.`);
    }

    const enrichedList = await this.enrichPlaylists([playlist]);
    if (!enrichedList.length || !enrichedList[0]) {
      throw new NotFoundException(`Playlist with ID "${id}" not found.`);
    }
    return enrichedList[0];
  }

  /**
   * Get all playlists for a specific course (slug or id)
   */
  async findByCourse(courseSlugOrId: string): Promise<CoursePlaylist[]> {
    const term = (courseSlugOrId || '').trim();
    const isUuidTerm = isUuid(term);

    const qb = this.playlistRepo
      .createQueryBuilder('pl')
      .leftJoinAndSelect('pl.videos', 'video');

    if (isUuidTerm) {
      qb.where('(pl.courseId = :term OR LOWER(pl.courseSlug) = LOWER(:term))', { term });
    } else {
      qb.where('(LOWER(pl.courseSlug) = LOWER(:term) OR pl.courseId = :term)', { term });
    }

    qb.orderBy('pl.displayOrder', 'ASC')
      .addOrderBy('pl.createdAt', 'ASC')
      .addOrderBy('video.displayOrder', 'ASC');

    const playlists = await qb.getMany();
    return this.enrichPlaylists(playlists);
  }

  /**
   * Create a new playlist
   */
  async createPlaylist(dto: CreatePlaylistDto, adminUser?: any): Promise<CoursePlaylist> {
    const createdId = await this.dataSource.transaction(async (manager) => {
      let course = await this.findCourse(dto.courseId, dto.courseSlug);
      if (!course) {
        const firstCourse = await this.courseRepo.findOne({ where: {} });
        if (firstCourse) {
          course = firstCourse;
        } else {
          const defaultCourse = this.courseRepo.create({
            slug: 'general-learning',
            courseName: 'General Learning',
            shortDescription: 'General learning courses and materials',
            description: 'General learning courses and materials',
            category: 'business',
            level: 'All levels',
            status: 'Active',
          });
          course = await this.courseRepo.save(defaultCourse);
        }
      }

      const playlistRepo = manager.getRepository(CoursePlaylist);
      const videoRepo = manager.getRepository(CoursePlaylistVideo);

      const playlist = playlistRepo.create({
        courseId: course?.id || 'general',
        courseSlug: course?.slug || 'general',
        title: dto.title.trim(),
        description: dto.description?.trim() || null,
        thumbnailUrl: dto.thumbnailUrl?.trim() || null,
        displayOrder: typeof dto.displayOrder === 'number' ? dto.displayOrder : 0,
        isTrending: typeof dto.isTrending === 'boolean' ? dto.isTrending : false,
        category: dto.category?.trim() || course?.category || 'entrepreneurship',
        level: dto.level?.trim() || 'Beginner',
        shortDescription: dto.shortDescription?.trim() || null,
        isFree: typeof dto.isFree === 'boolean' ? dto.isFree : true,
        learn: Array.isArray(dto.learn) ? dto.learn : null,
        requirements: Array.isArray(dto.requirements) ? dto.requirements : null,
        resources: Array.isArray(dto.resources) ? dto.resources : null,
        assessments: Array.isArray(dto.assessments) ? dto.assessments : null,
        assessmentSettings: dto.assessmentSettings || { enabled: true },
        createdBy: adminUser?.id || null,
      });

      const savedPlaylist = await playlistRepo.save(playlist);

      // If initial videos provided, validate and create them
      if (Array.isArray(dto.videos) && dto.videos.length > 0) {
        const videoEntities: CoursePlaylistVideo[] = [];
        let firstThumb: string | null = null;

        for (let i = 0; i < dto.videos.length; i++) {
          const v = dto.videos[i];
          const { videoId, normalizedUrl } = assertValidYoutubeUrl(v.youtubeUrl);
          const thumb = v.thumbnailUrl?.trim() || getYoutubeThumbnailUrl(videoId, 'hqdefault');
          if (!firstThumb) firstThumb = thumb;

          videoEntities.push(
            videoRepo.create({
              playlistId: savedPlaylist.id,
              title: v.title.trim(),
              description: v.description?.trim() || null,
              youtubeUrl: normalizedUrl,
              youtubeVideoId: videoId,
              thumbnailUrl: thumb,
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

        await videoRepo.save(videoEntities);

        // If playlist has no thumbnail, auto-set from first video
        if (!savedPlaylist.thumbnailUrl && firstThumb) {
          savedPlaylist.thumbnailUrl = firstThumb;
          await playlistRepo.save(savedPlaylist);
        }
      }

      return savedPlaylist.id;
    });

    const enriched = await this.findOne(createdId);
    if (enriched.courseId && enriched.courseId !== 'general') {
      await this.syncCourseWithPlaylistVideos(enriched.courseId);
    }
    return enriched;
  }

  /**
   * Update playlist details
   */
  async updatePlaylist(id: string, dto: UpdatePlaylistDto): Promise<CoursePlaylist> {
    if (!isUuid(id)) {
      throw new NotFoundException(`Playlist with ID "${id}" not found.`);
    }

    const playlist = await this.playlistRepo.findOne({ where: { id } });
    if (!playlist) {
      throw new NotFoundException(`Playlist with ID "${id}" not found.`);
    }

    if (dto.courseId || dto.courseSlug) {
      if (dto.courseId === 'general' || dto.courseSlug === 'general') {
        playlist.courseId = 'general';
        playlist.courseSlug = 'general';
      } else {
        const course = await this.findCourse(dto.courseId, dto.courseSlug);
        if (course) {
          playlist.courseId = course.id;
          playlist.courseSlug = course.slug;
        }
      }
    }

    if (dto.title !== undefined) playlist.title = dto.title.trim();
    if (dto.description !== undefined) playlist.description = dto.description?.trim() || null;
    if (dto.thumbnailUrl !== undefined) playlist.thumbnailUrl = dto.thumbnailUrl?.trim() || null;
    if (dto.displayOrder !== undefined) playlist.displayOrder = dto.displayOrder;
    if (dto.isTrending !== undefined) playlist.isTrending = Boolean(dto.isTrending);
    if (dto.category !== undefined) playlist.category = dto.category?.trim() || null;
    if (dto.level !== undefined) playlist.level = dto.level?.trim() || 'Beginner';
    if (dto.shortDescription !== undefined) playlist.shortDescription = dto.shortDescription?.trim() || null;
    if (dto.isFree !== undefined) playlist.isFree = Boolean(dto.isFree);
    if (dto.learn !== undefined) playlist.learn = Array.isArray(dto.learn) ? dto.learn : null;
    if (dto.requirements !== undefined) playlist.requirements = Array.isArray(dto.requirements) ? dto.requirements : null;
    if (dto.resources !== undefined) playlist.resources = Array.isArray(dto.resources) ? dto.resources : null;
    if (dto.assessments !== undefined) playlist.assessments = Array.isArray(dto.assessments) ? dto.assessments : null;
    if (dto.assessmentSettings !== undefined) playlist.assessmentSettings = dto.assessmentSettings;

    await this.playlistRepo.save(playlist);

    // If videos are explicitly provided in updatePlaylist, sync them
    if (Array.isArray(dto.videos)) {
      await this.videoRepo.delete({ playlistId: id });
      const videoEntities: CoursePlaylistVideo[] = [];
      let firstThumb: string | null = playlist.thumbnailUrl;

      for (let i = 0; i < dto.videos.length; i++) {
        const v = dto.videos[i];
        const { videoId, normalizedUrl } = assertValidYoutubeUrl(v.youtubeUrl);
        const thumb = v.thumbnailUrl?.trim() || getYoutubeThumbnailUrl(videoId, 'hqdefault');
        if (!firstThumb) firstThumb = thumb;

        videoEntities.push(
          this.videoRepo.create({
            playlistId: id,
            title: v.title.trim(),
            description: v.description?.trim() || null,
            youtubeUrl: normalizedUrl,
            youtubeVideoId: videoId,
            thumbnailUrl: thumb,
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
        await this.videoRepo.save(videoEntities);
      }

      if (!playlist.thumbnailUrl && firstThumb) {
        playlist.thumbnailUrl = firstThumb;
        await this.playlistRepo.save(playlist);
      }
    }

    await this.syncCourseWithPlaylistVideos(playlist.courseId);
    return this.findOne(id);
  }

  /**
   * Synchronizes the parent CourseEntity's youtubeVideoId, youtubeUrl, thumbnailUrl, and lessons
   * with the playlist videos so the course is immediately recognized as having active video content across the entire application.
   */
  async syncCourseWithPlaylistVideos(courseIdOrSlug: string): Promise<void> {
    try {
      const course = await this.findCourse(courseIdOrSlug);
      if (!course) return;

      const playlists = await this.playlistRepo.find({
        where: [{ courseId: course.id }, { courseSlug: course.slug }],
      });
      const playlistIds = playlists.map((p) => p.id);
      if (!playlistIds.length) return;

      const videos = await this.videoRepo
        .createQueryBuilder('v')
        .where('v.playlistId IN (:...playlistIds)', { playlistIds })
        .orderBy('v.displayOrder', 'ASC')
        .addOrderBy('v.createdAt', 'ASC')
        .getMany();

      if (videos.length > 0) {
        const existingLessons = Array.isArray(course.lessons) ? course.lessons : [];
        const hasExistingLessons = existingLessons.length > 0;
        const hasExistingVideo = Boolean(course.youtubeVideoId || course.youtubeUrl || course.videoUrl);

        // Only synchronize fallback video/lessons if the course has neither its own video nor lessons
        if (!hasExistingLessons && !hasExistingVideo) {
          const first = videos[0];
          course.youtubeVideoId = first.youtubeVideoId || null;
          course.youtubeUrl = first.youtubeUrl || null;
          course.videoUrl = first.youtubeUrl || null;
          if (!course.thumbnailUrl || course.thumbnailUrl.trim() === '') {
            course.thumbnailUrl = first.thumbnailUrl || null;
          }
          if (!course.image || course.image.trim() === '') {
            course.image = first.thumbnailUrl || null;
          }

          course.lessons = videos.map((v, i) => ({
            id: v.id,
            title: v.title,
            t: v.title,
            duration: v.duration || '10:00',
            youtube: v.youtubeUrl,
            youtubeUrl: v.youtubeUrl,
            youtubeVideoId: v.youtubeVideoId,
            thumbnailUrl: v.thumbnailUrl,
            poster: v.thumbnailUrl,
            notesUrl: v.notesUrl || null,
            notesName: v.notesName || null,
            notesSize: v.notesSize || null,
            notesExt: v.notesExt || null,
            chapters: Array.isArray(v.chapters) ? v.chapters : [],
            startTime: 0,
            isPreview: i === 0,
            order: i + 1,
          }));

          await this.courseRepo.save(course);
        }
      }
    } catch (err: any) {
      console.warn('Could not sync course with playlist videos:', err?.message);
    }
  }

  /**
   * Delete playlist and its videos
   */
  async deletePlaylist(id: string) {
    if (!isUuid(id)) throw new NotFoundException(`Playlist with ID "${id}" not found.`);
    const playlist = await this.playlistRepo.findOne({ where: { id } });
    if (!playlist) {
      throw new NotFoundException(`Playlist with ID "${id}" not found.`);
    }

    await this.videoRepo.delete({ playlistId: id });
    await this.playlistRepo.remove(playlist);
    return { success: true, message: 'Playlist deleted successfully.' };
  }

  /**
   * Add video to an existing playlist
   */
  async addVideo(playlistId: string, dto: AddPlaylistVideoDto) {
    if (!isUuid(playlistId)) throw new NotFoundException(`Playlist with ID "${playlistId}" not found.`);
    const playlist = await this.playlistRepo.findOne({ where: { id: playlistId } });
    if (!playlist) {
      throw new NotFoundException(`Playlist with ID "${playlistId}" not found.`);
    }

    const { videoId, normalizedUrl } = assertValidYoutubeUrl(dto.youtubeUrl);
    const thumb = dto.thumbnailUrl?.trim() || getYoutubeThumbnailUrl(videoId, 'hqdefault');

    // Prevent duplicate addition of the same video to the same playlist
    const existingInPlaylist = await this.videoRepo.findOne({
      where: [
        { playlistId, youtubeVideoId: videoId },
        { playlistId, youtubeUrl: normalizedUrl },
      ],
    });
    if (existingInPlaylist) {
      throw new BadRequestException('This video is already added to this playlist.');
    }

    let order = dto.displayOrder;
    if (order === undefined || order === null) {
      const highest = await this.videoRepo
        .createQueryBuilder('v')
        .where('v.playlistId = :pId', { pId: playlistId })
        .orderBy('v.displayOrder', 'DESC')
        .getOne();
      order = highest ? (highest.displayOrder ?? 0) + 1 : 0;
    } else {
      // Shift existing videos at or after this displayOrder to avoid duplicates and accommodate the new video
      await this.videoRepo
        .createQueryBuilder()
        .update(CoursePlaylistVideo)
        .set({ displayOrder: () => '"displayOrder" + 1' })
        .where('playlistId = :pId AND displayOrder >= :ord', { pId: playlistId, ord: order })
        .execute();
    }

    const video = this.videoRepo.create({
      playlistId,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      youtubeUrl: normalizedUrl,
      youtubeVideoId: videoId,
      thumbnailUrl: thumb,
      duration: dto.duration?.trim() || null,
      displayOrder: order,
      chapters: Array.isArray(dto.chapters) ? dto.chapters : null,
      notesUrl: dto.notesUrl?.trim() || null,
      notesName: dto.notesName?.trim() || null,
      notesSize: dto.notesSize?.trim() || null,
      notesExt: dto.notesExt?.trim() || null,
      assessments: Array.isArray(dto.assessments) ? dto.assessments : null,
    });

    const savedVideo = await this.videoRepo.save(video);

    // If playlist does not have a thumbnail yet, adopt this video's thumbnail
    if (!playlist.thumbnailUrl && thumb) {
      playlist.thumbnailUrl = thumb;
      await this.playlistRepo.save(playlist);
    }

    await this.syncCourseWithPlaylistVideos(playlist.courseId);
    return savedVideo;
  }

  /**
   * Update video details (supports updating within a specific playlist or globally across all playlist instances)
   */
  async updateVideo(playlistId: string | null | undefined, videoId: string, dto: UpdatePlaylistVideoDto) {
    let video: CoursePlaylistVideo | null = null;
    if (videoId && isUuid(videoId)) {
      if (playlistId && isUuid(playlistId)) {
        video = await this.videoRepo.findOne({
          where: { id: videoId, playlistId },
        });
      } else {
        video = await this.videoRepo.findOne({
          where: { id: videoId },
        });
      }
    }

    if (!video && dto.youtubeUrl) {
      try {
        const { videoId: ytId } = assertValidYoutubeUrl(dto.youtubeUrl);
        video = await this.videoRepo.findOne({ where: { youtubeVideoId: ytId } });
      } catch { }
    }

    if (!video) {
      throw new NotFoundException(`Video with ID "${videoId}" not found.`);
    }

    const oldYtId = video.youtubeVideoId;
    let newYtId = oldYtId;
    let normalizedUrl = video.youtubeUrl;

    if (dto.youtubeUrl) {
      const parsed = assertValidYoutubeUrl(dto.youtubeUrl);
      newYtId = parsed.videoId;
      normalizedUrl = parsed.normalizedUrl;
    }

    const updatedTitle = dto.title !== undefined ? dto.title.trim() : video.title;
    const updatedDesc = dto.description !== undefined ? dto.description?.trim() || null : video.description;
    const updatedDuration = dto.duration !== undefined ? dto.duration?.trim() || null : video.duration;
    const updatedThumb = dto.thumbnailUrl !== undefined
      ? dto.thumbnailUrl?.trim() || null
      : (dto.youtubeUrl && newYtId ? getYoutubeThumbnailUrl(newYtId, 'hqdefault') : video.thumbnailUrl);

    video.title = updatedTitle;
    video.description = updatedDesc;
    video.youtubeUrl = normalizedUrl;
    video.youtubeVideoId = newYtId;
    video.thumbnailUrl = updatedThumb;
    video.duration = updatedDuration;
    if (dto.displayOrder !== undefined) video.displayOrder = dto.displayOrder;
    if (dto.chapters !== undefined) video.chapters = Array.isArray(dto.chapters) ? dto.chapters : null;
    if (dto.notesUrl !== undefined) video.notesUrl = dto.notesUrl?.trim() || null;
    if (dto.notesName !== undefined) video.notesName = dto.notesName?.trim() || null;
    if (dto.notesSize !== undefined) video.notesSize = dto.notesSize?.trim() || null;
    if (dto.notesExt !== undefined) video.notesExt = dto.notesExt?.trim() || null;
    if (dto.assessments !== undefined) video.assessments = Array.isArray(dto.assessments) ? dto.assessments : null;

    const saved = await this.videoRepo.save(video);

    // Sync across all playlists where this video was added!
    if (oldYtId) {
      try {
        const matchingVideos = await this.videoRepo.find({
          where: { youtubeVideoId: oldYtId },
        });
        for (const mv of matchingVideos) {
          if (mv.id !== saved.id) {
            mv.title = updatedTitle;
            mv.description = updatedDesc;
            mv.youtubeUrl = normalizedUrl;
            mv.youtubeVideoId = newYtId;
            mv.thumbnailUrl = updatedThumb;
            mv.duration = updatedDuration;
            mv.notesUrl = saved.notesUrl;
            mv.notesName = saved.notesName;
            mv.notesSize = saved.notesSize;
            mv.notesExt = saved.notesExt;
            mv.chapters = saved.chapters;
            await this.videoRepo.save(mv);
          }
        }
      } catch (syncErr) {
        console.warn('Sync across playlists notice:', syncErr);
      }
    }

    // Sync parent course lessons immediately
    if (saved.playlistId) {
      try {
        const pl = await this.playlistRepo.findOne({ where: { id: saved.playlistId } });
        if (pl?.courseId) {
          await this.syncCourseWithPlaylistVideos(pl.courseId);
        }
      } catch (plSyncErr) {
        console.warn('Sync parent course notice:', plSyncErr);
      }
    }

    return saved;
  }

  /**
   * Delete video from playlist
   */
  async deleteVideo(playlistId: string, videoId: string) {
    if (!isUuid(playlistId) || !isUuid(videoId)) throw new NotFoundException("Invalid video or playlist ID");
    const playlist = await this.playlistRepo.findOne({ where: { id: playlistId } });
    const video = await this.videoRepo.findOne({
      where: { id: videoId, playlistId },
    });
    if (!video) {
      throw new NotFoundException(`Video with ID "${videoId}" not found in this playlist.`);
    }

    await this.videoRepo.remove(video);
    if (playlist?.courseId) {
      await this.syncCourseWithPlaylistVideos(playlist.courseId);
    }
    return { success: true, message: 'Video removed from playlist successfully.' };
  }

  /**
   * Reorder videos in playlist
   */
  async reorderVideos(playlistId: string, dto: ReorderPlaylistVideosDto) {
    if (!isUuid(playlistId)) throw new NotFoundException(`Playlist with ID "${playlistId}" not found.`);
    const playlist = await this.playlistRepo.findOne({ where: { id: playlistId } });
    if (!playlist) {
      throw new NotFoundException(`Playlist with ID "${playlistId}" not found.`);
    }

    const { videoIds } = dto;
    if (!Array.isArray(videoIds) || !videoIds.length) {
      throw new BadRequestException('videoIds array is required.');
    }

    const videos = await this.videoRepo.find({ where: { playlistId } });
    const videoMap = new Map(videos.map((v) => [v.id, v]));

    const updates: CoursePlaylistVideo[] = [];
    videoIds.forEach((id, index) => {
      const v = videoMap.get(id);
      if (v) {
        v.displayOrder = index;
        updates.push(v);
      }
    });

    if (updates.length > 0) {
      await this.videoRepo.save(updates);
    }

    return this.videoRepo.find({
      where: { playlistId },
      order: { displayOrder: 'ASC' },
    });
  }
}

