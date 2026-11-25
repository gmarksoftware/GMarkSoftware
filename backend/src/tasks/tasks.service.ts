import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { LmsService } from '../courses/lms.service';
import {
  CourseEntity,
  CourseEnrollment,
  CoursePlaylist,
  CoursePlaylistVideo,
  User,
  VideoTask,
  VideoTaskAssignment,
  VideoTaskSubmission,
  AdminVideoAssignment,
} from '../entities';
import {
  CreateVideoTaskDto,
  ReviewVideoTaskSubmissionDto,
  SubmitVideoTaskDto,
  UpdateVideoTaskDto,
} from '../dto';

const IS_UUID = (str: any): boolean =>
  typeof str === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());

@Injectable()
export class TasksService implements OnModuleInit {
  constructor(
    @InjectRepository(VideoTask)
    private readonly taskRepo: Repository<VideoTask>,

    @InjectRepository(VideoTaskAssignment)
    private readonly assignmentRepo: Repository<VideoTaskAssignment>,

    @InjectRepository(VideoTaskSubmission)
    private readonly submissionRepo: Repository<VideoTaskSubmission>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,

    @InjectRepository(CoursePlaylistVideo)
    private readonly videoRepo: Repository<CoursePlaylistVideo>,

    @InjectRepository(CoursePlaylist)
    private readonly playlistRepo: Repository<CoursePlaylist>,

    @InjectRepository(CourseEntity)
    private readonly courseRepo: Repository<CourseEntity>,

    @InjectRepository(CourseEnrollment)
    private readonly enrollmentRepo: Repository<CourseEnrollment>,

    private readonly dataSource: DataSource,
    private readonly moduleRef: ModuleRef,
  ) { }

  async onModuleInit() {
    try {
      await this.dataSource.query(`
        CREATE TABLE IF NOT EXISTS video_tasks (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "videoId" varchar NOT NULL,
          "videoTitle" varchar,
          "courseId" varchar,
          "courseSlug" varchar,
          "playlistId" varchar,
          title varchar NOT NULL,
          description text,
          instructions text,
          "dueDate" timestamptz,
          "attachmentUrl" varchar,
          "attachmentName" varchar,
          "attachmentSize" varchar,
          "attachmentExt" varchar,
          "createdBy" varchar,
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          "updatedAt" timestamptz NOT NULL DEFAULT now()
        );

        ALTER TABLE video_tasks ADD COLUMN IF NOT EXISTS "videoId" varchar;
        ALTER TABLE video_tasks ADD COLUMN IF NOT EXISTS "videoTitle" varchar;
        ALTER TABLE video_tasks ADD COLUMN IF NOT EXISTS "courseId" varchar;
        ALTER TABLE video_tasks ADD COLUMN IF NOT EXISTS "courseSlug" varchar;
        ALTER TABLE video_tasks ADD COLUMN IF NOT EXISTS "playlistId" varchar;
        ALTER TABLE video_tasks ADD COLUMN IF NOT EXISTS title varchar;
        ALTER TABLE video_tasks ADD COLUMN IF NOT EXISTS description text;
        ALTER TABLE video_tasks ADD COLUMN IF NOT EXISTS instructions text;
        ALTER TABLE video_tasks ADD COLUMN IF NOT EXISTS "dueDate" timestamptz;
        ALTER TABLE video_tasks ADD COLUMN IF NOT EXISTS "attachmentUrl" varchar;
        ALTER TABLE video_tasks ADD COLUMN IF NOT EXISTS "attachmentName" varchar;
        ALTER TABLE video_tasks ADD COLUMN IF NOT EXISTS "attachmentSize" varchar;
        ALTER TABLE video_tasks ADD COLUMN IF NOT EXISTS "attachmentExt" varchar;
        ALTER TABLE video_tasks ADD COLUMN IF NOT EXISTS "createdBy" varchar;

        CREATE TABLE IF NOT EXISTS video_task_assignments (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "taskId" uuid NOT NULL,
          "userId" uuid NOT NULL,
          status varchar DEFAULT 'pending',
          "assignedAt" timestamptz NOT NULL DEFAULT now(),
          "dueDate" timestamptz,
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          "updatedAt" timestamptz NOT NULL DEFAULT now()
        );

        ALTER TABLE video_task_assignments ADD COLUMN IF NOT EXISTS "taskId" uuid;
        ALTER TABLE video_task_assignments ADD COLUMN IF NOT EXISTS "userId" uuid;
        ALTER TABLE video_task_assignments ADD COLUMN IF NOT EXISTS status varchar DEFAULT 'pending';
        ALTER TABLE video_task_assignments ADD COLUMN IF NOT EXISTS "assignedAt" timestamptz DEFAULT now();
        ALTER TABLE video_task_assignments ADD COLUMN IF NOT EXISTS "dueDate" timestamptz;

        CREATE TABLE IF NOT EXISTS video_task_submissions (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "taskId" uuid NOT NULL,
          "userId" uuid NOT NULL,
          "assignmentId" uuid,
          "workDescription" text,
          "fileUrl" varchar,
          "fileName" varchar,
          status varchar DEFAULT 'submitted',
          "adminFeedback" text,
          "submittedAt" timestamptz NOT NULL DEFAULT now(),
          "reviewedAt" timestamptz,
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          "updatedAt" timestamptz NOT NULL DEFAULT now()
        );

        ALTER TABLE video_task_submissions ADD COLUMN IF NOT EXISTS "taskId" uuid;
        ALTER TABLE video_task_submissions ADD COLUMN IF NOT EXISTS "userId" uuid;
        ALTER TABLE video_task_submissions ADD COLUMN IF NOT EXISTS "assignmentId" uuid;
        ALTER TABLE video_task_submissions ADD COLUMN IF NOT EXISTS "workDescription" text;
        ALTER TABLE video_task_submissions ADD COLUMN IF NOT EXISTS "fileUrl" varchar;
        ALTER TABLE video_task_submissions ADD COLUMN IF NOT EXISTS "fileName" varchar;
        ALTER TABLE video_task_submissions ADD COLUMN IF NOT EXISTS status varchar DEFAULT 'submitted';
        ALTER TABLE video_task_submissions ADD COLUMN IF NOT EXISTS "verifiedBy" varchar;
        ALTER TABLE video_task_submissions ADD COLUMN IF NOT EXISTS "adminFeedback" text;
        ALTER TABLE video_task_submissions ADD COLUMN IF NOT EXISTS "submittedAt" timestamptz DEFAULT now();
        ALTER TABLE video_task_submissions ADD COLUMN IF NOT EXISTS "reviewedAt" timestamptz;

        CREATE INDEX IF NOT EXISTS "IDX_video_tasks_videoId" ON video_tasks ("videoId");
        CREATE INDEX IF NOT EXISTS "IDX_video_tasks_courseId" ON video_tasks ("courseId");
        CREATE INDEX IF NOT EXISTS "IDX_video_tasks_courseSlug" ON video_tasks ("courseSlug");
        CREATE INDEX IF NOT EXISTS "IDX_video_tasks_playlistId" ON video_tasks ("playlistId");

        CREATE INDEX IF NOT EXISTS "IDX_video_task_assignments_taskId" ON video_task_assignments ("taskId");
        CREATE INDEX IF NOT EXISTS "IDX_video_task_assignments_userId" ON video_task_assignments ("userId");

        CREATE INDEX IF NOT EXISTS "IDX_video_task_submissions_taskId" ON video_task_submissions ("taskId");
        CREATE INDEX IF NOT EXISTS "IDX_video_task_submissions_userId" ON video_task_submissions ("userId");
        CREATE INDEX IF NOT EXISTS "IDX_video_task_submissions_assignmentId" ON video_task_submissions ("assignmentId");
      `);
    } catch (err: any) {
      console.warn('Video Tasks PostgreSQL table setup notice:', err.message);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ADMIN METHODS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create a new video-wise task and assign to all enrolled / selected users.
   */
  async createTask(dto: CreateVideoTaskDto, adminUser: any) {
    if (!dto.title?.trim()) {
      throw new BadRequestException('Task title is required');
    }
    if (!dto.videoId?.trim()) {
      throw new BadRequestException('Video ID is required');
    }

    // Try to auto-resolve video title / playlist / course if not supplied
    let videoTitle = dto.videoTitle || '';
    let courseId = dto.courseId || '';
    let courseSlug = dto.courseSlug || '';
    let playlistId = dto.playlistId || '';

    try {
      const whereConds: any[] = [{ youtubeVideoId: dto.videoId }];
      if (IS_UUID(dto.videoId)) {
        whereConds.push({ id: dto.videoId });
      }
      const vid = await this.videoRepo.findOne({
        where: whereConds,
        relations: ['playlist'],
      });
      if (vid) {
        if (!videoTitle) videoTitle = vid.title;
        if (!playlistId) playlistId = vid.playlistId;
        if (vid.playlist) {
          if (!courseId) courseId = vid.playlist.courseId;
          if (!courseSlug) courseSlug = vid.playlist.courseSlug;
        }
      }
    } catch { }

    if (adminUser?.role === 'admin') {
      const assignments = await this.dataSource.getRepository(AdminVideoAssignment).find({
        where: { adminId: adminUser.id },
      });
      const allowedSlugs = new Set(assignments.map((a) => (a.courseSlug || '').trim().toLowerCase()));
      const allowedVideoIds = new Set(
        assignments.map((a) => (a.videoId || '').trim()).filter((v) => Boolean(v) && v !== 'ALL'),
      );
      const hasAllCourses = assignments.some((a) => (a.videoId || '').trim() === 'ALL');
      const isAllowed =
        (hasAllCourses && courseSlug && allowedSlugs.has(courseSlug.toLowerCase())) ||
        (hasAllCourses && dto.courseSlug && allowedSlugs.has(dto.courseSlug.toLowerCase())) ||
        allowedVideoIds.has(dto.videoId.trim()) ||
        (courseSlug && allowedSlugs.has(courseSlug.toLowerCase())) ||
        (dto.courseSlug && allowedSlugs.has(dto.courseSlug.toLowerCase()));
      if (!isAllowed) {
        throw new ForbiddenException('You can only create tasks for courses or videos assigned to you.');
      }
    }

    const task = this.taskRepo.create({
      title: dto.title.trim(),
      description: dto.description || null,
      instructions: dto.instructions || null,
      videoId: dto.videoId.trim(),
      videoTitle: videoTitle || null,
      courseId: courseId || null,
      courseSlug: courseSlug || null,
      playlistId: playlistId || null,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      attachmentUrl: dto.attachmentUrl || null,
      attachmentName: dto.attachmentName || null,
      attachmentSize: dto.attachmentSize || null,
      attachmentExt: dto.attachmentExt || null,
      createdBy: adminUser?.email || adminUser?.id || 'admin',
    });

    const savedTask = await this.taskRepo.save(task);

    // Assign to users
    await this.assignUsersToTask(savedTask, dto.assignToType, dto.assignedUserIds);

    return this.findOneTaskAdmin(savedTask.id);
  }

  /**
   * Assigns users to a task based on assignToType ('all' vs 'selected').
   */
  private async assignUsersToTask(
    task: VideoTask,
    assignToType?: 'all' | 'selected',
    selectedUserIds?: string[],
  ) {
    let targetUserIds: string[] = [];

    if (assignToType === 'selected' && Array.isArray(selectedUserIds) && selectedUserIds.length > 0) {
      targetUserIds = selectedUserIds;
    } else {
      // If course/slug exists, first check for enrolled users
      if (task.courseSlug || task.courseId) {
        const whereClause: any = task.courseSlug ? { courseSlug: task.courseSlug } : { courseId: task.courseId };
        const enrollments = await this.enrollmentRepo.find({
          where: whereClause,
          select: ['userId'],
        });
        targetUserIds = enrollments.map((e) => e.userId).filter(Boolean);
      }

      // If no enrolled users found or general video, assign to all registered users
      if (targetUserIds.length === 0) {
        const users = await this.userRepo.find({
          where: { role: 'user' },
          select: ['id'],
        });
        targetUserIds = users.map((u) => u.id);
      }
    }

    // Deduplicate
    const uniqueUserIds = Array.from(new Set(targetUserIds));

    // Create assignments
    for (const uId of uniqueUserIds) {
      const existing = await this.assignmentRepo.findOne({
        where: { taskId: task.id, userId: uId },
      });
      if (!existing) {
        const assignment = this.assignmentRepo.create({
          taskId: task.id,
          userId: uId,
          status: 'pending',
          dueDate: task.dueDate,
          assignedAt: new Date(),
        });
        await this.assignmentRepo.save(assignment);
      }
    }
  }

  /**
   * Admin: List all tasks with counts and metadata (scoped for Sub-Admin if provided).
   */
  async findAllTasksAdmin(
    adminUser?: any,
    filter?: { videoId?: string; courseSlug?: string },
  ) {
    let tasks = await this.taskRepo.find({
      order: { createdAt: 'DESC' },
    });

    if (filter?.videoId) {
      const targetVid = filter.videoId.trim().toLowerCase();
      let alternateId: string | null = null;
      try {
        const vid = await this.videoRepo.findOne({
          where: [{ id: filter.videoId.trim() }, { youtubeVideoId: filter.videoId.trim() }],
        });
        if (vid) {
          alternateId = (vid.id === filter.videoId.trim() ? vid.youtubeVideoId : vid.id)?.toLowerCase() || null;
        }
      } catch { }

      tasks = tasks.filter((t) => {
        const tVid = (t.videoId || '').trim().toLowerCase();
        return tVid === targetVid || (alternateId && tVid === alternateId);
      });
    }

    if (filter?.courseSlug) {
      const targetSlug = filter.courseSlug.trim().toLowerCase();
      tasks = tasks.filter((t) => (t.courseSlug || '').trim().toLowerCase() === targetSlug);
    }

    if (adminUser?.role === 'admin') {
      try {
        const assignments = await this.dataSource.getRepository(AdminVideoAssignment).find({
          where: { adminId: adminUser.id },
        });
        if (assignments.length === 0) return [];
        const allowedSlugs = new Set(assignments.map((a) => (a.courseSlug || '').trim().toLowerCase()));
        const allowedVideoIds = new Set(
          assignments
            .map((a) => (a.videoId || '').trim())
            .filter((v) => Boolean(v) && v !== 'ALL'),
        );
        const hasAllCourses = assignments.some((a) => (a.videoId || '').trim() === 'ALL');
        tasks = tasks.filter((t) => {
          if (hasAllCourses && t.courseSlug && allowedSlugs.has(t.courseSlug.toLowerCase())) return true;
          if (allowedVideoIds.has(t.videoId)) return true;
          if (t.courseSlug && allowedSlugs.has(t.courseSlug.toLowerCase())) return true;
          return false;
        });
      } catch (err: any) {
        console.warn('Scoping tasks for admin notice:', err.message);
      }
    }

    const enriched = await Promise.all(
      tasks.map(async (t) => {
        const [assignments, assignmentCount] = await this.assignmentRepo.findAndCount({
          where: { taskId: t.id },
        });

        const submissions = await this.submissionRepo.find({
          where: { taskId: t.id },
        });

        const submissionCount = submissions.length;
        const pendingCount = assignments.filter((a) => a.status === 'pending').length;
        const reviewedCount = submissions.filter((s) => ['reviewed', 'APPROVED', 'VERIFIED'].includes(s.status)).length;
        const needsRevisionCount = submissions.filter((s) => s.status === 'needs_revision').length;

        return {
          ...t,
          assignmentCount,
          submissionCount,
          pendingCount,
          reviewedCount,
          needsRevisionCount,
          status: submissionCount > 0 ? (reviewedCount === submissionCount ? 'Reviewed' : 'In Progress') : 'Pending',
        };
      }),
    );

    return enriched;
  }

  /**
   * Admin: Get all submissions across all tasks and videos with complete metadata (scoped for Sub-Admin if provided).
   */
  async getAllSubmissionsAdmin(adminUser?: any) {
    const submissions = await this.submissionRepo.find({
      order: { submittedAt: 'DESC' },
    });

    if (!submissions.length) return [];

    let userAssignments: AdminVideoAssignment[] = [];
    if (adminUser?.role === 'admin') {
      try {
        userAssignments = await this.dataSource.getRepository(AdminVideoAssignment).find({
          where: { adminId: adminUser.id },
        });
        if (userAssignments.length === 0) return [];
      } catch (err: any) {
        console.warn('Scoping submissions for admin notice:', err.message);
      }
    }

    const userIds = [...new Set(submissions.map((s) => s.userId).filter((id) => IS_UUID(id)))];
    const taskIds = [...new Set(submissions.map((s) => s.taskId).filter((id) => IS_UUID(id)))];

    const users = userIds.length ? await this.userRepo.find({ where: { id: In(userIds) } }) : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const tasks = taskIds.length ? await this.taskRepo.find({ where: { id: In(taskIds) } }) : [];
    const taskMap = new Map(tasks.map((t) => [t.id, t]));

    const playlistIds = [...new Set(tasks.map((t) => t.playlistId).filter((id) => IS_UUID(id)))];
    const playlists = playlistIds.length ? await this.playlistRepo.find({ where: { id: In(playlistIds) } }) : [];
    const playlistMap = new Map(playlists.map((p) => [p.id, p]));

    let results = submissions.map((s) => {
      const user = userMap.get(s.userId);
      const task = taskMap.get(s.taskId);
      const playlist = task?.playlistId ? playlistMap.get(task.playlistId) : null;

      let fileType = 'DOCUMENT';
      if (s.fileName) {
        const parts = s.fileName.split('.');
        if (parts.length > 1) {
          fileType = parts.pop()!.toUpperCase();
        }
      } else if (s.fileUrl) {
        const parts = s.fileUrl.split('.');
        if (parts.length > 1) {
          fileType = parts.pop()!.split('?')[0].toUpperCase();
        }
      }

      return {
        id: s.id,
        submissionId: s.id,
        taskId: s.taskId,
        userId: s.userId,
        userName: user?.fullName || 'Learner',
        userEmail: user?.email || '',
        userPhone: user?.phone || '',
        taskTitle: task?.title || 'Video Assignment',
        videoTitle: task?.videoTitle || 'Course Video',
        videoId: task?.videoId || '',
        courseSlug: task?.courseSlug || '',
        playlistId: task?.playlistId || '',
        playlistTitle: playlist?.title || '',
        status: s.status,
        submittedAt: s.submittedAt,
        reviewedAt: s.reviewedAt,
        workDescription: s.workDescription,
        fileUrl: s.fileUrl,
        fileName: s.fileName,
        fileType,
        adminFeedback: s.adminFeedback,
        marksObtained: s.marksObtained !== null && s.marksObtained !== undefined ? Number(s.marksObtained) : null,
        maxMarks: s.maxMarks !== null && s.maxMarks !== undefined ? Number(s.maxMarks) : 100,
      };
    });

    if (adminUser?.role === 'admin' && userAssignments.length > 0) {
      const allowedSlugs = new Set(userAssignments.map((a) => (a.courseSlug || '').trim().toLowerCase()));
      const allowedVideoIds = new Set(
        userAssignments
          .map((a) => (a.videoId || '').trim())
          .filter((v) => Boolean(v) && v !== 'ALL'),
      );
      results = results.filter((r) => {
        if (allowedVideoIds.has(r.videoId)) return true;
        if (r.courseSlug && allowedSlugs.has(r.courseSlug.toLowerCase())) return true;
        return false;
      });
    }

    return results;
  }

  /**
   * Admin: Get a single task with all user assignments and submissions.
   */
  async findOneTaskAdmin(id: string) {
    if (!IS_UUID(id)) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    let playlistTitle = '';
    if (task.playlistId && IS_UUID(task.playlistId)) {
      try {
        const pl = await this.playlistRepo.findOne({ where: { id: task.playlistId } });
        if (pl) playlistTitle = pl.title;
      } catch { }
    }

    const assignments = await this.assignmentRepo.find({
      where: { taskId: id },
      order: { createdAt: 'ASC' },
    });

    const userIds = [...new Set(assignments.map((a) => a.userId).filter((uid) => IS_UUID(uid)))];
    const users = userIds.length > 0 ? await this.userRepo.find({ where: { id: In(userIds) } }) : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const submissions = await this.submissionRepo.find({
      where: { taskId: id },
      order: { submittedAt: 'DESC' },
    });
    const subMap = new Map<string, VideoTaskSubmission>();
    for (const s of submissions) {
      if (!subMap.has(s.userId)) {
        subMap.set(s.userId, s);
      }
    }

    const userSubmissions = assignments.map((a) => {
      const user = userMap.get(a.userId);
      const sub = subMap.get(a.userId);

      let fileType = 'DOCUMENT';
      if (sub?.fileName) {
        const parts = sub.fileName.split('.');
        if (parts.length > 1) {
          fileType = parts.pop()!.toUpperCase();
        }
      } else if (sub?.fileUrl) {
        const parts = sub.fileUrl.split('.');
        if (parts.length > 1) {
          fileType = parts.pop()!.split('?')[0].toUpperCase();
        }
      }

      return {
        assignmentId: a.id,
        userId: a.userId,
        userName: user?.fullName || 'Unknown User',
        userEmail: user?.email || '',
        userPhone: user?.phone || '',
        status: sub?.status || a.status || 'pending',
        assignedAt: a.assignedAt,
        dueDate: a.dueDate || task.dueDate,
        submittedAt: sub?.submittedAt || null,
        reviewedAt: sub?.reviewedAt || null,
        workDescription: sub?.workDescription || null,
        fileUrl: sub?.fileUrl || null,
        fileName: sub?.fileName || null,
        fileType,
        adminFeedback: sub?.adminFeedback || null,
        marksObtained: sub?.marksObtained !== null && sub?.marksObtained !== undefined ? Number(sub.marksObtained) : null,
        maxMarks: sub?.maxMarks !== null && sub?.maxMarks !== undefined ? Number(sub.maxMarks) : 100,
        submissionId: sub?.id || null,
        videoTitle: task.videoTitle,
        taskTitle: task.title,
        courseSlug: task.courseSlug,
        playlistTitle,
      };
    });

    const submissionCount = submissions.length;
    const pendingCount = assignments.filter((a) => a.status === 'pending').length;
    const reviewedCount = submissions.filter((s) => ['reviewed', 'APPROVED', 'VERIFIED'].includes(s.status)).length;

    return {
      task: {
        ...task,
        playlistTitle,
      },
      assignmentsCount: assignments.length,
      submissionCount,
      pendingCount,
      reviewedCount,
      userSubmissions,
    };
  }

  /**
   * Helper to verify if an admin has access to view/edit/delete a task based on AdminVideoAssignment.
   */
  private async checkAdminTaskAccess(task: VideoTask, adminUser: any): Promise<boolean> {
    if (!adminUser || adminUser.role === 'super_admin') return true;
    if (adminUser.role !== 'admin') return false;
    const assignments = await this.dataSource.getRepository(AdminVideoAssignment).find({
      where: { adminId: adminUser.id },
    });
    if (!assignments || assignments.length === 0) return false;
    const allowedSlugs = new Set(assignments.map((a) => (a.courseSlug || '').trim().toLowerCase()));
    const allowedVideoIds = new Set(
      assignments
        .map((a) => (a.videoId || '').trim())
        .filter((v) => Boolean(v) && v !== 'ALL'),
    );
    const hasAllCourses = assignments.some((a) => (a.videoId || '').trim() === 'ALL');
    if (hasAllCourses && task.courseSlug && allowedSlugs.has(task.courseSlug.toLowerCase())) return true;
    if (allowedVideoIds.has(task.videoId)) return true;
    if (task.courseSlug && allowedSlugs.has(task.courseSlug.toLowerCase())) return true;
    return false;
  }

  /**
   * Admin: Update task details.
   */
  async updateTaskAdmin(id: string, dto: UpdateVideoTaskDto, adminUser?: any) {
    if (!IS_UUID(id)) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    if (adminUser?.role === 'admin') {
      const allowed = await this.checkAdminTaskAccess(task, adminUser);
      if (!allowed) {
        throw new ForbiddenException('You can only modify tasks for courses or videos assigned to you.');
      }
    }

    if (dto.title !== undefined) task.title = dto.title.trim();
    if (dto.description !== undefined) task.description = dto.description || null;
    if (dto.instructions !== undefined) task.instructions = dto.instructions || null;
    if (dto.dueDate !== undefined) task.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;

    if (dto.removeAttachment) {
      task.attachmentUrl = null;
      task.attachmentName = null;
      task.attachmentSize = null;
      task.attachmentExt = null;
    } else {
      if (dto.attachmentUrl !== undefined) task.attachmentUrl = dto.attachmentUrl || null;
      if (dto.attachmentName !== undefined) task.attachmentName = dto.attachmentName || null;
      if (dto.attachmentSize !== undefined) task.attachmentSize = dto.attachmentSize || null;
      if (dto.attachmentExt !== undefined) task.attachmentExt = dto.attachmentExt || null;
    }

    const saved = await this.taskRepo.save(task);

    // If new user assignments provided, assign them
    if (dto.assignedUserIds && Array.isArray(dto.assignedUserIds)) {
      await this.assignUsersToTask(saved, 'selected', dto.assignedUserIds);
    }

    return this.findOneTaskAdmin(id);
  }

  /**
   * Admin: Delete task.
   */
  async deleteTaskAdmin(id: string, adminUser?: any) {
    if (!IS_UUID(id)) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }

    if (adminUser?.role === 'admin') {
      const allowed = await this.checkAdminTaskAccess(task, adminUser);
      if (!allowed) {
        throw new ForbiddenException('You can only delete tasks for courses or videos assigned to you.');
      }
    }

    await this.submissionRepo.delete({ taskId: id });
    await this.assignmentRepo.delete({ taskId: id });
    await this.taskRepo.delete(id);

    return { success: true, message: `Task "${task.title}" deleted successfully.` };
  }

  /**
   * Admin: Get all student answer submissions for a specific video.
   */
  async getSubmissionsForVideoAdmin(videoId: string) {
    if (!videoId) return { videoId, videoTitle: '', submissions: [] };

    let task = await this.taskRepo.findOne({
      where: [{ videoId }, { videoId: videoId.trim() }],
      order: { createdAt: 'DESC' },
    });

    let vid: CoursePlaylistVideo | null = null;
    if (!task) {
      try {
        const whereConds: any[] = [{ youtubeVideoId: videoId }];
        if (IS_UUID(videoId)) {
          whereConds.push({ id: videoId });
        }
        vid = await this.videoRepo.findOne({
          where: whereConds,
        });
        if (vid) {
          const altId = vid.id === videoId ? vid.youtubeVideoId : vid.id;
          if (altId) {
            task = await this.taskRepo.findOne({
              where: [{ videoId: altId }],
              order: { createdAt: 'DESC' },
            });
          }
        }
      } catch { }
    } else {
      try {
        const whereConds: any[] = [{ youtubeVideoId: task.videoId }];
        if (IS_UUID(task.videoId)) {
          whereConds.push({ id: task.videoId });
        }
        vid = await this.videoRepo.findOne({
          where: whereConds,
        });
      } catch { }
    }

    const videoTitle = vid?.title || task?.videoTitle || 'Course Video';

    if (!task) {
      return {
        videoId,
        videoTitle,
        task: null,
        submissions: [],
      };
    }

    const submissions = await this.submissionRepo.find({
      where: { taskId: task.id },
      order: { submittedAt: 'DESC' },
    });

    if (!submissions.length) {
      return {
        videoId,
        videoTitle,
        taskId: task.id,
        task,
        submissions: [],
      };
    }

    const userIds = [...new Set(submissions.map((s) => s.userId).filter((id) => IS_UUID(id)))];
    const users = userIds.length ? await this.userRepo.find({ where: { id: In(userIds) } }) : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    const mappedSubmissions = submissions.map((s) => {
      const user = userMap.get(s.userId);

      let fileType = 'DOCUMENT';
      if (s.fileName) {
        const parts = s.fileName.split('.');
        if (parts.length > 1) fileType = parts.pop()!.toUpperCase();
      } else if (s.fileUrl) {
        const parts = s.fileUrl.split('.');
        if (parts.length > 1) fileType = parts.pop()!.split('?')[0].toUpperCase();
      }

      return {
        id: s.id,
        submissionId: s.id,
        taskId: s.taskId,
        userId: s.userId,
        userName: user?.fullName || 'Learner',
        userEmail: user?.email || '',
        userPhone: user?.phone || '',
        videoId: task?.videoId || videoId,
        videoTitle,
        fileUrl: s.fileUrl,
        fileName: s.fileName || 'Submitted_Answers',
        fileType,
        status: s.status,
        submittedAt: s.submittedAt,
        reviewedAt: s.reviewedAt,
        adminFeedback: s.adminFeedback,
        marksObtained: s.marksObtained !== null && s.marksObtained !== undefined ? Number(s.marksObtained) : null,
        maxMarks: s.maxMarks !== null && s.maxMarks !== undefined ? Number(s.maxMarks) : 100,
      };
    });

    return {
      videoId,
      videoTitle,
      taskId: task.id,
      task,
      submissions: mappedSubmissions,
    };
  }

  /**
   * Admin: Get all submissions for a task.
   */
  async getSubmissionsForTaskAdmin(taskId: string) {
    if (!IS_UUID(taskId)) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }

    const submissions = await this.submissionRepo.find({
      where: { taskId },
      order: { submittedAt: 'DESC' },
    });

    const userIds = [...new Set(submissions.map((s) => s.userId).filter((id) => IS_UUID(id)))];
    const users = userIds.length > 0 ? await this.userRepo.find({ where: { id: In(userIds) } }) : [];
    const userMap = new Map(users.map((u) => [u.id, u]));

    return submissions.map((s) => {
      const u = userMap.get(s.userId);
      return {
        ...s,
        userName: u?.fullName || 'Learner',
        userEmail: u?.email || '',
        taskTitle: task.title,
        videoTitle: task.videoTitle,
      };
    });
  }

  /**
   * Admin: Review user submission.
   */
  async reviewSubmissionAdmin(
    submissionId: string,
    dto: ReviewVideoTaskSubmissionDto,
    adminUser: any,
  ) {
    if (!IS_UUID(submissionId)) {
      throw new NotFoundException(`Submission ${submissionId} not found`);
    }
    const sub = await this.submissionRepo.findOne({ where: { id: submissionId } });
    if (!sub) {
      throw new NotFoundException(`Submission ${submissionId} not found`);
    }

    if (adminUser?.role === 'admin') {
      const task = await this.taskRepo.findOne({ where: { id: sub.taskId } });
      const assignments = await this.dataSource.getRepository(AdminVideoAssignment).find({
        where: { adminId: adminUser.id },
      });
      const allowedSlugs = new Set(assignments.map((a) => (a.courseSlug || '').trim().toLowerCase()));
      const allowedVideoIds = new Set(
        assignments
          .map((a) => (a.videoId || '').trim())
          .filter((v) => Boolean(v) && v !== 'ALL'),
      );
      const isAllowed =
        task &&
        (allowedVideoIds.has(task.videoId) ||
          (task.courseSlug && allowedSlugs.has(task.courseSlug.toLowerCase())));
      if (!isAllowed) {
        throw new ForbiddenException('You can only review submissions for your assigned videos');
      }
    }

    if (dto.status === 'reviewed') {
      if (dto.marksObtained === undefined || dto.marksObtained === null || isNaN(Number(dto.marksObtained))) {
        throw new BadRequestException('Marks obtained is required when marking submission as reviewed.');
      }
      const marks = Number(dto.marksObtained);
      const max = dto.maxMarks !== undefined && dto.maxMarks !== null ? Number(dto.maxMarks) : (sub.maxMarks ? Number(sub.maxMarks) : 100);
      if (marks < 0 || marks > max) {
        throw new BadRequestException(`Marks obtained must be between 0 and total marks (${max}).`);
      }
      sub.marksObtained = marks;
      sub.maxMarks = max;
    } else if (dto.marksObtained !== undefined && dto.marksObtained !== null) {
      const marks = Number(dto.marksObtained);
      const max = dto.maxMarks !== undefined && dto.maxMarks !== null ? Number(dto.maxMarks) : (sub.maxMarks ? Number(sub.maxMarks) : 100);
      if (marks < 0 || marks > max) {
        throw new BadRequestException(`Marks obtained must be between 0 and total marks (${max}).`);
      }
      sub.marksObtained = marks;
      sub.maxMarks = max;
    }

    if (dto.maxMarks !== undefined && dto.maxMarks !== null && !isNaN(Number(dto.maxMarks))) {
      sub.maxMarks = Number(dto.maxMarks);
    }

    sub.status = dto.status;
    sub.adminFeedback = dto.feedback?.trim() || null;
    sub.reviewedAt = new Date();

    const savedSub = await this.submissionRepo.save(sub);

    // Also update assignment status
    if (sub.assignmentId) {
      await this.assignmentRepo.update(sub.assignmentId, {
        status: dto.status,
      });
    } else {
      await this.assignmentRepo.update(
        { taskId: sub.taskId, userId: sub.userId },
        { status: dto.status },
      );
    }

    return savedSub;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // USER METHODS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * User: Get all tasks assigned to the logged-in user.
   * Can optionally filter by videoId.
   */
  async findMyTasks(userId: string, videoId?: string) {
    const assignments = await this.assignmentRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });

    if (assignments.length === 0) return [];

    const taskIds = assignments.map((a) => a.taskId);
    const tasks = await this.taskRepo.find({
      where: { id: In(taskIds) },
    });
    const taskMap = new Map(tasks.map((t) => [t.id, t]));

    const submissions = await this.submissionRepo.find({
      where: { userId },
      order: { submittedAt: 'DESC' },
    });
    const subMap = new Map<string, VideoTaskSubmission>();
    for (const s of submissions) {
      if (!subMap.has(s.taskId)) {
        subMap.set(s.taskId, s);
      }
    }

    const results: any[] = [];
    for (const a of assignments) {
      const task = taskMap.get(a.taskId);
      if (!task) continue;

      if (videoId && task.videoId !== videoId && !task.videoId.includes(videoId)) {
        continue;
      }

      const sub = subMap.get(task.id);
      results.push({
        assignmentId: a.id,
        taskId: task.id,
        title: task.title,
        description: task.description,
        instructions: task.instructions,
        videoId: task.videoId,
        videoTitle: task.videoTitle,
        courseId: task.courseId,
        courseSlug: task.courseSlug,
        playlistId: task.playlistId,
        dueDate: a.dueDate || task.dueDate,
        attachmentUrl: task.attachmentUrl,
        attachmentName: task.attachmentName,
        attachmentSize: task.attachmentSize || null,
        attachmentExt: task.attachmentExt || null,
        referenceAttachmentUrl: task.attachmentUrl,
        referenceAttachmentName: task.attachmentName,
        referenceAttachmentSize: task.attachmentSize || null,
        referenceAttachmentExt: task.attachmentExt || null,
        status: sub?.status || a.status || 'pending',
        submittedAt: sub?.submittedAt || null,
        reviewedAt: sub?.reviewedAt || null,
        workDescription: sub?.workDescription || null,
        fileUrl: sub?.fileUrl || null,
        fileName: sub?.fileName || null,
        adminFeedback: sub?.adminFeedback || null,
        marksObtained: sub?.marksObtained !== null && sub?.marksObtained !== undefined ? Number(sub.marksObtained) : null,
        maxMarks: sub?.maxMarks !== null && sub?.maxMarks !== undefined ? Number(sub.maxMarks) : 100,
        submissionId: sub?.id || null,
      });
    }

    return results;
  }

  /**
   * User: Get task for a specific video.
   * Looks up task matching video ID, youtubeVideoId, courseSlug, or lesson chapter ID.
   * Prioritizes tasks with attachments/materials and filters out empty auto-generated placeholders.
   */
  async findTaskForVideo(
    videoId: string,
    userId?: string,
    extraData?: {
      courseSlug?: string;
      playlistId?: string;
      videoTitle?: string;
      youtubeVideoId?: string;
    },
  ) {
    if (!videoId && !extraData?.youtubeVideoId && !extraData?.courseSlug) return null;

    const candidateIds = new Set<string>();
    if (videoId) {
      candidateIds.add(videoId.trim());
    }
    if (extraData?.youtubeVideoId) {
      candidateIds.add(extraData.youtubeVideoId.trim());
    }
    if (extraData?.courseSlug) {
      const s = extraData.courseSlug.trim();
      candidateIds.add(s);
      candidateIds.add(`${s}-v1`);
      candidateIds.add(`${s}_v0`);
    }

    // Try cross-referencing CoursePlaylistVideo
    try {
      const vid = await this.videoRepo.findOne({
        where: [{ id: videoId }, { youtubeVideoId: videoId }],
      });
      if (vid) {
        if (vid.id) candidateIds.add(vid.id);
        if (vid.youtubeVideoId) candidateIds.add(vid.youtubeVideoId);
      }
    } catch { }

    // Cross-reference CourseEntity
    try {
      let course: CourseEntity | null = null;
      if (extraData?.courseSlug) {
        course = await this.courseRepo.findOne({ where: { slug: extraData.courseSlug.trim() } });
      }
      if (!course && IS_UUID(videoId)) {
        course = await this.courseRepo.findOne({ where: { id: videoId } });
      }
      if (!course && !IS_UUID(videoId)) {
        course = await this.courseRepo.findOne({ where: { slug: videoId.trim() } });
      }

      if (course) {
        if (course.youtubeVideoId) candidateIds.add(course.youtubeVideoId.trim());
        if (course.slug) {
          candidateIds.add(course.slug.trim());
          candidateIds.add(`${course.slug.trim()}-v1`);
        }
        if (Array.isArray(course.lessons)) {
          for (const l of course.lessons) {
            if (l.id === videoId || l.youtubeVideoId === videoId || l.youtube === videoId) {
              if (l.id) candidateIds.add(l.id);
              if (l.youtubeVideoId) candidateIds.add(l.youtubeVideoId);
              if (l.youtube) candidateIds.add(l.youtube);
            }
          }
        }
      }
    } catch { }

    const candidateList = Array.from(candidateIds).filter(Boolean);

    let tasks: VideoTask[] = [];
    if (candidateList.length > 0 || extraData?.courseSlug || extraData?.playlistId) {
      const qb = this.taskRepo.createQueryBuilder('task');
      if (candidateList.length > 0) {
        qb.where('task.videoId IN (:...candidateList)', { candidateList });
      }
      if (extraData?.courseSlug) {
        const slug = extraData.courseSlug.trim();
        if (candidateList.length > 0) {
          qb.orWhere('task.courseSlug = :slug', { slug });
        } else {
          qb.where('task.courseSlug = :slug', { slug });
        }
      }
      if (extraData?.playlistId) {
        qb.orWhere('task.playlistId = :playlistId', { playlistId: extraData.playlistId.trim() });
      }

      qb.orderBy(
        `CASE WHEN task.attachmentUrl IS NOT NULL AND task.attachmentUrl != '' THEN 0 ELSE 1 END`,
        'ASC',
      ).addOrderBy('task.createdAt', 'ASC');

      tasks = await qb.getMany();
    }

    // Filter out auto-generated blank placeholders if real admin tasks exist
    const hasRealTasks = tasks.some(
      (t) =>
        Boolean(t.attachmentUrl) ||
        (!t.title.startsWith('Video Assignment:') && Boolean(t.instructions)),
    );

    let filteredTasks = tasks;
    if (hasRealTasks) {
      filteredTasks = tasks.filter((t) => {
        const isAutoPlaceholder =
          t.title.startsWith('Video Assignment:') &&
          !t.attachmentUrl &&
          (!t.description || t.description.includes('Watch the complete video')) &&
          (!t.instructions || t.instructions.includes('Questions are provided in the video'));
        return !isAutoPlaceholder;
      });
    }

    // If still no task found, auto-create a default task
    if (filteredTasks.length === 0) {
      let vid: CoursePlaylistVideo | null = null;
      try {
        vid = await this.videoRepo.findOne({
          where: [{ id: videoId }, { youtubeVideoId: videoId }],
        });
      } catch { }

      const rawTitle = vid?.title || extraData?.videoTitle || 'Video Assignment';
      const cleanTitle = rawTitle.startsWith('Video Assignment')
        ? rawTitle
        : `Video Assignment: ${rawTitle}`;

      let defaultTask = this.taskRepo.create({
        videoId: vid?.id || extraData?.youtubeVideoId || videoId,
        videoTitle: vid?.title || extraData?.videoTitle || 'Course Video',
        title: cleanTitle,
        description: 'Watch the complete video and answer the questions provided in the video.',
        instructions:
          'Questions are provided in the video. Watch the complete video and upload your answers here.',
        courseSlug: extraData?.courseSlug || null,
        playlistId: vid?.playlistId || extraData?.playlistId || null,
      });
      defaultTask = await this.taskRepo.save(defaultTask);
      filteredTasks = [defaultTask];
    }

    // Map each task for the user with assignment & submission
    const mappedTasks = await Promise.all(
      filteredTasks.map(async (task) => {
        let assignment: VideoTaskAssignment | null = null;
        let submission: VideoTaskSubmission | null = null;

        if (userId) {
          assignment = await this.assignmentRepo.findOne({
            where: { taskId: task.id, userId },
          });
          if (!assignment) {
            assignment = this.assignmentRepo.create({
              taskId: task.id,
              userId,
              status: 'pending',
              dueDate: task.dueDate,
              assignedAt: new Date(),
            });
            assignment = await this.assignmentRepo.save(assignment);
          }
          submission = await this.submissionRepo.findOne({
            where: { taskId: task.id, userId },
            order: { submittedAt: 'DESC' },
          });
        }

        return {
          taskId: task.id,
          id: task.id,
          title: task.title,
          description: task.description,
          instructions: task.instructions,
          videoId: task.videoId,
          videoTitle: task.videoTitle,
          courseId: task.courseId,
          courseSlug: task.courseSlug || extraData?.courseSlug,
          playlistId: task.playlistId || extraData?.playlistId,
          dueDate: assignment?.dueDate || task.dueDate,
          attachmentUrl: task.attachmentUrl,
          attachmentName: task.attachmentName,
          attachmentSize: task.attachmentSize || null,
          attachmentExt: task.attachmentExt || null,
          referenceAttachmentUrl: task.attachmentUrl,
          referenceAttachmentName: task.attachmentName,
          referenceAttachmentSize: task.attachmentSize || null,
          referenceAttachmentExt: task.attachmentExt || null,
          status: submission?.status || assignment?.status || 'pending',
          workDescription: submission?.workDescription || null,
          fileUrl: submission?.fileUrl || null,
          fileName: submission?.fileName || null,
          adminFeedback: submission?.adminFeedback || null,
          marksObtained: submission?.marksObtained !== null && submission?.marksObtained !== undefined ? Number(submission.marksObtained) : null,
          maxMarks: submission?.maxMarks !== null && submission?.maxMarks !== undefined ? Number(submission.maxMarks) : 100,
          submittedAt: submission?.submittedAt || null,
          reviewedAt: submission?.reviewedAt || null,
          assignmentId: assignment?.id || null,
          submissionId: submission?.id || null,
          task,
          assignment,
          submission,
        };
      }),
    );

    const primaryTask = mappedTasks[0] || null;

    return {
      ...(primaryTask || {}),
      tasks: mappedTasks,
      task: primaryTask,
    };
  }

  /**
   * User: Get single task details by task ID.
   */
  async findOneTaskUser(taskId: string, userId: string) {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }

    // Verify user assignment (or create on the fly if enrolled)
    let assignment = await this.assignmentRepo.findOne({
      where: { taskId, userId },
    });

    if (!assignment) {
      assignment = this.assignmentRepo.create({
        taskId,
        userId,
        status: 'pending',
        dueDate: task.dueDate,
        assignedAt: new Date(),
      });
      await this.assignmentRepo.save(assignment);
    }

    const submission = await this.submissionRepo.findOne({
      where: { taskId, userId },
      order: { submittedAt: 'DESC' },
    });

    return {
      taskId: task.id,
      id: task.id,
      title: task.title,
      description: task.description,
      instructions: task.instructions,
      videoId: task.videoId,
      videoTitle: task.videoTitle,
      courseId: task.courseId,
      courseSlug: task.courseSlug,
      playlistId: task.playlistId,
      dueDate: assignment.dueDate || task.dueDate,
      attachmentUrl: task.attachmentUrl,
      attachmentName: task.attachmentName,
      attachmentSize: task.attachmentSize || null,
      attachmentExt: task.attachmentExt || null,
      referenceAttachmentUrl: task.attachmentUrl,
      referenceAttachmentName: task.attachmentName,
      referenceAttachmentSize: task.attachmentSize || null,
      referenceAttachmentExt: task.attachmentExt || null,
      status: submission?.status || assignment.status || 'pending',
      workDescription: submission?.workDescription || null,
      fileUrl: submission?.fileUrl || null,
      fileName: submission?.fileName || null,
      adminFeedback: submission?.adminFeedback || null,
      marksObtained: submission?.marksObtained !== null && submission?.marksObtained !== undefined ? Number(submission.marksObtained) : null,
      maxMarks: submission?.maxMarks !== null && submission?.maxMarks !== undefined ? Number(submission.maxMarks) : 100,
      submittedAt: submission?.submittedAt || null,
      reviewedAt: submission?.reviewedAt || null,
      assignmentId: assignment.id,
      submissionId: submission?.id || null,
      task,
      assignment,
      submission,
    };
  }

  /**
   * User: Submit or resubmit answers/work for a task or video.
   */
  async submitWork(taskIdOrVideoId: string, userId: string, dto: SubmitVideoTaskDto) {
    if (!dto.workDescription?.trim() && !dto.fileUrl?.trim()) {
      throw new BadRequestException('Please attach an answer file before submitting.');
    }

    // Search task by primary ID
    let task = await this.taskRepo.findOne({ where: { id: taskIdOrVideoId } });

    // Search task by videoId if not found by primary ID
    if (!task) {
      task = await this.taskRepo.findOne({
        where: [{ videoId: taskIdOrVideoId }, { videoId: taskIdOrVideoId.trim() }],
        order: { createdAt: 'DESC' },
      });
    }

    // Search video cross-reference if still not found
    if (!task) {
      try {
        const vid = await this.videoRepo.findOne({
          where: [{ id: taskIdOrVideoId }, { youtubeVideoId: taskIdOrVideoId }],
        });
        if (vid) {
          task = await this.taskRepo.findOne({
            where: [{ videoId: vid.id }, { videoId: vid.youtubeVideoId }],
            order: { createdAt: 'DESC' },
          });
          if (!task) {
            task = this.taskRepo.create({
              videoId: vid.id,
              videoTitle: vid.title,
              playlistId: vid.playlistId,
              title: `Video Assignment: ${vid.title}`,
              description: 'Watch the complete video and answer the questions provided in the video.',
              instructions: 'Questions are provided in the video. Watch the complete video and upload your answers here.',
            });
            task = await this.taskRepo.save(task);
          }
        }
      } catch { }
    }

    // Fallback: create task directly
    if (!task) {
      task = this.taskRepo.create({
        videoId: taskIdOrVideoId,
        videoTitle: 'Video Assignment',
        title: 'Video Assignment',
        description: 'Watch the complete video and answer the questions provided in the video.',
        instructions: 'Questions are provided in the video. Watch the complete video and upload your answers here.',
      });
      task = await this.taskRepo.save(task);
    }

    const taskId = task.id;

    let assignment = await this.assignmentRepo.findOne({
      where: { taskId, userId },
    });

    if (!assignment) {
      assignment = this.assignmentRepo.create({
        taskId,
        userId,
        status: 'submitted',
        dueDate: task.dueDate,
        assignedAt: new Date(),
      });
      assignment = await this.assignmentRepo.save(assignment);
    }

    // Check if previous submission exists
    let submission = await this.submissionRepo.findOne({
      where: { taskId, userId },
      order: { submittedAt: 'DESC' },
    });

    const isRevision = submission && submission.status === 'needs_revision';
    const now = new Date();
    // Auto-verify valid project/task submissions by default while keeping admin review possible
    const nextStatus = 'APPROVED';

    if (submission) {
      // Update existing submission (resubmission)
      submission.workDescription = dto.workDescription?.trim() || submission.workDescription || null;
      if (dto.fileUrl) {
        submission.fileUrl = dto.fileUrl;
        submission.fileName = dto.fileName || 'Submitted_Answers';
      }
      submission.status = nextStatus;
      submission.verifiedBy = 'SYSTEM_AUTO_VERIFY';
      submission.submittedAt = now;
      submission.reviewedAt = now;
      submission.adminFeedback = null; // Reset feedback on resubmission
      submission = await this.submissionRepo.save(submission);
    } else {
      // Create new submission (auto-verified)
      submission = this.submissionRepo.create({
        taskId,
        userId,
        assignmentId: assignment.id,
        workDescription: dto.workDescription?.trim() || null,
        fileUrl: dto.fileUrl || null,
        fileName: dto.fileName || 'Submitted_Answers',
        status: nextStatus,
        verifiedBy: 'SYSTEM_AUTO_VERIFY',
        submittedAt: now,
        reviewedAt: now,
      });
      submission = await this.submissionRepo.save(submission);
    }

    assignment.status = nextStatus;
    await this.assignmentRepo.save(assignment);

    let certificateStatus: any = null;
    try {
      let resolvedCourseSlug = task.courseSlug || '';
      if (!resolvedCourseSlug && task.playlistId && IS_UUID(task.playlistId)) {
        const pl = await this.playlistRepo.findOne({ where: { id: task.playlistId } });
        if (pl?.courseSlug) resolvedCourseSlug = pl.courseSlug;
      }
      if (!resolvedCourseSlug && task.courseId && IS_UUID(task.courseId)) {
        const c = await this.courseRepo.findOne({ where: { id: task.courseId } });
        if (c?.slug) resolvedCourseSlug = c.slug;
      }
      if (resolvedCourseSlug) {
        const lmsService = this.moduleRef.get(LmsService, { strict: false });
        if (lmsService && typeof lmsService.evaluateAndIssueCertificate === 'function') {
          certificateStatus = await lmsService.evaluateAndIssueCertificate(userId, resolvedCourseSlug).catch(() => null);
        }
      }
    } catch { }

    return {
      success: true,
      message: isRevision
        ? 'Revised project submitted and automatically verified!'
        : 'Project submitted and automatically verified!',
      status: nextStatus,
      verifiedBy: 'SYSTEM_AUTO_VERIFY',
      autoVerified: true,
      submission,
      assignment,
      task,
      certificateStatus,
      certificate: certificateStatus?.certificate || null,
    };
  }
}
