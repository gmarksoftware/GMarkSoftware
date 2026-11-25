import {
  BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Put, Query, Req,
  ServiceUnavailableException, UploadedFile, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { unlink } from 'fs/promises';
import { diskStorage, memoryStorage } from 'multer';
import { join } from 'path';
import { In, Repository } from 'typeorm';
import {
  AdminVideoAssignment, ContactMessage, CourseEntity, CoursePlaylist, CourseView, DonationPledge, EventEntity, GalleryItem, NewsletterBroadcast, NewsletterSubscriber, User, VideoTask, VideoTaskSubmission, Volunteer, WorkshopRegistration,
} from '../entities';
import { AssignAdminVideosDto, CreateSubAdminDto, EventDto, GalleryUploadDto, GalleryUpdateDto, NewsletterBroadcastDto, SettingDto, UpdateSubAdminDto, UpdateSubAdminStatusDto, UpdateUserRoleDto } from '../dto';
import { hashPassword } from '../auth/security';
import { AdminGuard } from './admin.guard';
import { SuperAdminGuard } from './super-admin.guard';
import { AdminScopeService } from './admin-scope.service';
import { AdminUserDetailsService } from './admin-user-details.service';
import { MailService } from './mail.service';
import { SettingsService } from './settings.service';
import { S3Service } from '../common/s3.service';

export const UPLOAD_DIR = join(process.cwd(), 'uploads');
const EXT: Record<string, string> = {
  'image/jpeg': '.jpg', 'image/jpg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif',
};
const VIDEO_EXT: Record<string, string> = {
  'video/mp4': '.mp4', 'video/webm': '.webm', 'video/ogg': '.ogv', 'video/quicktime': '.mov', 'video/x-matroska': '.mkv', 'video/avi': '.avi',
};

@UseGuards(AdminGuard)
@Controller('admin')
export class AdminController {
  private lists: Record<string, Repository<any>>;

  constructor(
    private settings: SettingsService,
    private mailService: MailService,
    @InjectRepository(ContactMessage) contacts: Repository<ContactMessage>,
    @InjectRepository(Volunteer) volunteers: Repository<Volunteer>,
    @InjectRepository(WorkshopRegistration) registrations: Repository<WorkshopRegistration>,
    @InjectRepository(DonationPledge) pledges: Repository<DonationPledge>,
    @InjectRepository(NewsletterSubscriber) subscribers: Repository<NewsletterSubscriber>,
    @InjectRepository(NewsletterBroadcast) private broadcasts: Repository<NewsletterBroadcast>,
    @InjectRepository(EventEntity) private events: Repository<EventEntity>,
    @InjectRepository(GalleryItem) private gallery: Repository<GalleryItem>,
    @InjectRepository(CourseView) private courseViews: Repository<CourseView>,
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(AdminVideoAssignment) private assignmentsRepo: Repository<AdminVideoAssignment>,
    @InjectRepository(CoursePlaylist) private playlistRepo: Repository<CoursePlaylist>,
    @InjectRepository(CourseEntity) private courseRepo: Repository<CourseEntity>,
    @InjectRepository(VideoTask) private taskRepo: Repository<VideoTask>,
    @InjectRepository(VideoTaskSubmission) private taskSubmissionRepo: Repository<VideoTaskSubmission>,
    private s3Service: S3Service,
    private userDetailsService: AdminUserDetailsService,
    private adminScopeService: AdminScopeService,
  ) {
    this.lists = {
      contact: contacts,
      messages: contacts,
      volunteers,
      registrations,
      pledges,
      donations: pledges,
      subscribers,
    };
  }

  /** Check the key (used by the login box on /admin). */
  @Get('ping')
  ping() {
    return { ok: true };
  }

  /** Compact overview data used by the admin dashboard (scoped for sub-admin). */
  @Get('dashboard')
  async dashboard(@Req() req: any) {
    if (req.user?.role === 'admin') {
      const scope = await this.adminScopeService.getScopeForAdmin(req.user);
      const learners = await this.adminScopeService.getScopedLearnersForAdmin(req.user);
      let pendingTasksCount = 0;
      if (scope.videoIds.length > 0) {
        const tasks = await this.taskRepo.find({ where: { videoId: In(scope.videoIds) } });
        if (tasks.length > 0) {
          pendingTasksCount = await this.taskSubmissionRepo.count({
            where: { taskId: In(tasks.map((t) => t.id)), status: In(['submitted', 'needs_revision']) },
          });
        }
      }
      const uniqueCourses = new Set([
        ...scope.assignments.map((a) => (a.courseSlug || a.courseId || '').trim().toLowerCase()).filter(Boolean),
        ...scope.createdCourseSlugs,
      ]);
      const uniquePlaylists = new Set([
        ...scope.assignments.map((a) => (a.playlistId || '').trim()).filter(Boolean),
        ...scope.createdPlaylistIds,
      ]);
      const allocatedCoursesCount = uniqueCourses.size;
      const allocatedPlaylistsCount = uniquePlaylists.size;
      const allocatedTotalCount = allocatedCoursesCount + allocatedPlaylistsCount;

      return {
        isSubAdmin: true,
        assignedVideosCount: scope.assignments.length,
        allocatedCoursesCount,
        allocatedPlaylistsCount,
        allocatedTotalCount,
        learnersCount: learners.length,
        pendingTasksCount,
        assignments: scope.assignments,
      };
    }

    const [contacts, volunteers, registrations, pledges, subscribers, events, gallery, users] = await Promise.all([
      this.lists.contact.count(),
      this.lists.volunteers.count(),
      this.lists.registrations.count(),
      this.lists.pledges.count(),
      this.lists.subscribers.count(),
      this.events.count(),
      this.gallery.count(),
      this.users.count(),
    ]);
    return { isSubAdmin: false, contacts, volunteers, registrations, pledges, subscribers, events, gallery, users };
  }

  // ---------- Submissions (read / delete) ----------
  private repoFor(type: string) {
    if (!Object.prototype.hasOwnProperty.call(this.lists, type)) throw new NotFoundException('Unknown list');
    return this.lists[type];
  }

  @Get('submissions/:type')
  list(@Param('type') type: string) {
    return this.repoFor(type).find({ order: { createdAt: 'DESC' }, take: 1000 });
  }

  @UseGuards(SuperAdminGuard)
  @Delete('submissions/:type/:id')
  async remove(@Param('type') type: string, @Param('id', ParseUUIDPipe) id: string) {
    await this.repoFor(type).delete(id);
    return { ok: true };
  }

  // ---------- Settings ----------
  @UseGuards(SuperAdminGuard)
  @Put('settings/:key')
  setSetting(@Param('key') key: string, @Body() dto: SettingDto) {
    return this.settings.set(key, dto.value);
  }

  // ---------- Events ----------
  @Get('events')
  allEvents() {
    return this.events.find({ order: { startsAt: 'DESC' } });
  }

  @Post('events')
  createEvent(@Body() dto: EventDto) {
    return this.events.save(this.events.create({ ...dto, startsAt: new Date(dto.startsAt) }));
  }

  @Put('events/:id')
  async updateEvent(@Param('id', ParseUUIDPipe) id: string, @Body() dto: EventDto) {
    if ((await this.events.count({ where: { id } })) === 0) throw new NotFoundException();
    await this.events.update(id, { ...dto, startsAt: new Date(dto.startsAt) });
    return this.events.findOneBy({ id });
  }

  @Delete('events/:id')
  async deleteEvent(@Param('id', ParseUUIDPipe) id: string) {
    await this.events.delete(id);
    return { ok: true };
  }

  // ---------- Gallery ----------
  @Get('gallery')
  async getGallery() {
    return this.gallery.find({ order: { createdAt: 'DESC' } });
  }

  @Post('gallery')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024, files: 1 },
      fileFilter: (_req, file, cb) =>
        EXT[file.mimetype] ? cb(null, true) : cb(new BadRequestException('Only JPG, JPEG, PNG, WEBP or GIF images are allowed'), false),
    }),
  )
  async upload(@UploadedFile() file: Express.Multer.File, @Body() dto: GalleryUploadDto) {
    if (!file) throw new BadRequestException('Image file is required (field name: image)');
    const result = await this.s3Service.uploadFile(file, 'gallery');
    return this.gallery.save(this.gallery.create({ ...dto, imageUrl: result.url }));
  }

  @Put('gallery/:id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024, files: 1 },
      fileFilter: (_req, file, cb) =>
        EXT[file.mimetype] ? cb(null, true) : cb(new BadRequestException('Only JPG, JPEG, PNG, WEBP or GIF images are allowed'), false),
    }),
  )
  async updateGallery(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() dto: GalleryUpdateDto,
  ) {
    const item = await this.gallery.findOneBy({ id });
    if (!item) throw new NotFoundException('Gallery image not found');
    if (dto.category) item.category = dto.category;
    if (dto.captionEn !== undefined) item.captionEn = dto.captionEn;
    if (dto.captionMr !== undefined) item.captionMr = dto.captionMr;
    if (file) {
      if (item.imageUrl) {
        if (item.imageUrl.startsWith('http')) {
          await this.s3Service.deleteFile(item.imageUrl).catch(() => undefined);
        } else {
          const oldFilename = item.imageUrl.replace(/^\/?(api\/)?uploads\//, '');
          await unlink(join(UPLOAD_DIR, oldFilename)).catch(() => undefined);
        }
      }
      const result = await this.s3Service.uploadFile(file, 'gallery');
      item.imageUrl = result.url;
    }
    return this.gallery.save(item);
  }

  @Delete('gallery/:id')
  async deleteImage(@Param('id', ParseUUIDPipe) id: string) {
    const item = await this.gallery.findOneBy({ id });
    if (!item) throw new NotFoundException('Gallery image not found');
    await this.gallery.delete(id);
    if (item.imageUrl) {
      if (item.imageUrl.startsWith('http')) {
        await this.s3Service.deleteFile(item.imageUrl).catch(() => undefined);
      } else {
        const oldFilename = item.imageUrl.replace(/^\/?(api\/)?uploads\//, '');
        await unlink(join(UPLOAD_DIR, oldFilename)).catch(() => undefined);
      }
    }
    return { ok: true, message: 'Gallery image deleted successfully.' };
  }

  // ---------- Video Upload for Courses ----------
  @Post('upload-video')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const ext = VIDEO_EXT[file.mimetype] || (file.originalname?.includes('.') ? '.' + file.originalname.split('.').pop() : '.mp4');
          cb(null, `course_video_${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 20 * 1024 * 1024 * 1024, files: 1 }, // 20GB (supports 6GB+ 60min HD videos)
      fileFilter: (_req, file, cb) => {
        if (file.mimetype.startsWith('video/') || VIDEO_EXT[file.mimetype] || /\.(mp4|webm|mov|mkv|avi|ogv)$/i.test(file.originalname)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only video files (MP4, WebM, MOV, MKV, etc.) are allowed'), false);
        }
      },
    }),
  )
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Video file is required (field name: video)');
    return {
      videoUrl: `/uploads/${file.filename}`,
      filename: file.filename,
      originalname: file.originalname,
      size: file.size,
    };
  }

  // ---------- Thumbnail Upload for Courses & Lessons ----------
  @Post('upload-thumbnail')
  @UseInterceptors(
    FileInterceptor('thumbnail', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024, files: 1 }, // 10MB
      fileFilter: (_req, file, cb) => {
        if (EXT[file.mimetype] || /\.(jpe?g|png|webp|gif)$/i.test(file.originalname)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only JPG, PNG, WEBP or GIF images are allowed for thumbnails'), false);
        }
      },
    }),
  )
  async uploadThumbnail(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Thumbnail file is required (field name: thumbnail)');
    const result = await this.s3Service.uploadFile(file, 'thumbnails');
    return {
      thumbnailUrl: result.url,
      url: result.url,
      filename: result.key,
      key: result.key,
      originalname: file.originalname,
      size: file.size,
    };
  }

  // ---------- Newsletter Broadcasts & Real-Time Subscriber Emails ----------
  @Get('mail/status')
  getMailStatus() {
    return this.mailService.getSmtpStatus();
  }

  @Get('mail/verify')
  async verifyMailConnection() {
    return this.mailService.verifyConnection();
  }

  @Post('mail/upload-attachment')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 25 * 1024 * 1024 }, // 25MB standard email attachment limit
    }),
  )
  async uploadMailAttachment(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Attachment file is required');
    const result = await this.s3Service.uploadFile(file, 'attachments');
    return {
      url: result.url,
      file: result.url,
      filename: file.originalname,
      originalname: file.originalname,
      size: file.size,
      key: result.key,
    };
  }

  @Get('broadcasts')
  listBroadcasts() {
    return this.broadcasts.find({ order: { createdAt: 'DESC' }, take: 200 });
  }

  @Post('broadcasts')
  async sendBroadcast(@Body() dto: NewsletterBroadcastDto) {
    if (!this.mailService.isConfigured()) {
      throw new ServiceUnavailableException('SMTP configuration is missing on the server. Please configure SMTP_USER and SMTP_PASS.');
    }

    const allSubscribers = await this.lists.subscribers.find({ select: ['email'] });
    const recipientEmails = allSubscribers.map((s) => s.email).filter(Boolean);

    if (recipientEmails.length === 0) {
      throw new BadRequestException('No subscriber emails found to send to.');
    }

    // Send real-time emails to all registered subscriber emails
    const mailResult = await this.mailService.sendToSubscribers({
      subject: dto.subject,
      body: dto.body,
      resourceLink: dto.resourceLink ?? null,
      resourceTitle: dto.resourceTitle ?? null,
      attachmentPath: dto.attachmentPath ?? null,
      attachmentName: dto.attachmentName ?? null,
      recipients: recipientEmails,
    });

    if (mailResult.sent === 0 && mailResult.failed > 0) {
      const firstError = mailResult.failedEmails[0]?.error || 'Failed to dispatch email';
      throw new InternalServerErrorException(`Email could not be sent: ${firstError}. Please check SMTP configuration on Render.`);
    }

    const broadcast = await this.broadcasts.save(
      this.broadcasts.create({
        subject: dto.subject,
        body: dto.body,
        resourceLink: dto.resourceLink ?? null,
        resourceTitle: dto.resourceTitle ?? null,
        sentCount: mailResult.sent,
      }),
    );

    return {
      ...broadcast,
      mailResult,
      totalSubscribers: recipientEmails.length,
    };
  }

  @Post('subscribers/send-email')
  async sendEmailToSubscribers(
    @Body()
    dto: {
      subject: string;
      body: string;
      resourceLink?: string;
      resourceTitle?: string;
      attachmentPath?: string;
      attachmentName?: string;
      recipientEmails?: string[];
    },
  ) {
    if (!this.mailService.isConfigured()) {
      throw new ServiceUnavailableException('SMTP configuration is missing on the server. Please configure SMTP_USER and SMTP_PASS.');
    }

    let emails = dto.recipientEmails;
    if (!emails || emails.length === 0) {
      const all = await this.lists.subscribers.find({ select: ['email'] });
      emails = all.map((s) => s.email).filter(Boolean);
    }

    if (!emails || emails.length === 0) {
      throw new BadRequestException('No subscriber email addresses found to send to.');
    }

    const mailResult = await this.mailService.sendToSubscribers({
      subject: dto.subject,
      body: dto.body,
      resourceLink: dto.resourceLink ?? null,
      resourceTitle: dto.resourceTitle ?? null,
      attachmentPath: dto.attachmentPath ?? null,
      attachmentName: dto.attachmentName ?? null,
      recipients: emails,
    });

    if (mailResult.sent === 0 && mailResult.failed > 0) {
      const firstError = mailResult.failedEmails[0]?.error || 'Failed to dispatch email';
      throw new InternalServerErrorException(`Email could not be sent: ${firstError}. Please check SMTP configuration on Render.`);
    }

    const broadcast = await this.broadcasts.save(
      this.broadcasts.create({
        subject: dto.subject,
        body: dto.body,
        resourceLink: dto.resourceLink ?? null,
        resourceTitle: dto.resourceTitle ?? null,
        sentCount: mailResult.sent,
      }),
    );

    return {
      ok: true,
      broadcast,
      mailResult,
      sentCount: mailResult.sent,
      totalRecipients: emails.length,
    };
  }

  @Delete('broadcasts/:id')
  async deleteBroadcast(@Param('id', ParseUUIDPipe) id: string) {
    await this.broadcasts.delete(id);
    return { ok: true };
  }

  // ---------- Contact Messages Direct Reply ----------
  @Post('contact/reply')
  async replyToContact(
    @Body()
    dto: {
      to: string;
      fullName?: string;
      subject: string;
      message: string;
      originalMessage?: string;
    },
  ) {
    if (!this.mailService.isConfigured()) {
      throw new ServiceUnavailableException('SMTP configuration is missing on the server. Please configure SMTP_USER and SMTP_PASS.');
    }

    if (!dto.to || !dto.message) {
      throw new BadRequestException('Recipient email and reply message are required');
    }
    const cleanTo = dto.to.trim();
    const subject = dto.subject?.trim() || 'Response from GramGuru Foundation';

    let formattedBody = dto.message.trim();
    if (dto.originalMessage) {
      formattedBody += `\n\n----------------------------------------\nOriginal Inquiry:\n"${dto.originalMessage.trim()}"`;
    }

    const mailResult = await this.mailService.sendToSubscribers({
      subject,
      body: formattedBody,
      recipients: [cleanTo],
    });

    if (mailResult.sent === 0 && mailResult.failed > 0) {
      const firstError = mailResult.failedEmails[0]?.error || 'Failed to dispatch email';
      throw new InternalServerErrorException(`Email could not be sent: ${firstError}. Please check SMTP configuration on Render.`);
    }

    return {
      ok: true,
      sent: mailResult.sent > 0,
      mailResult,
    };
  }

  @Get('courses/:slug/views-breakdown')
  async getCourseViewsBreakdown(@Param('slug') slug: string, @Req() req: any) {
    return this.adminScopeService.getCourseViewsBreakdown(slug, req.user);
  }

  @Get('course-views')
  async getCourseViews() {
    return this.courseViews.find({ order: { createdAt: 'DESC' }, take: 2000 });
  }

  // ---------- Users (Registered Accounts & Profiles) ----------
  @Get('users')
  async listUsers(@Req() req: any, @Query('role') role?: string) {
    if (req.user?.role === 'admin') {
      return this.adminScopeService.getScopedLearnersForAdmin(req.user);
    }

    const where: any = {};
    if (role && role !== 'all') {
      where.role = role;
    }

    const users = await this.users.find({
      where,
      order: { createdAt: 'DESC' },
      select: ['id', 'fullName', 'email', 'role', 'phone', 'isActive', 'createdAt', 'updatedAt', 'lastLoginAt'],
    });

    const assignments = await this.assignmentsRepo.find();
    const assignCountMap = new Map<string, number>();
    assignments.forEach((a) => {
      assignCountMap.set(a.adminId, (assignCountMap.get(a.adminId) || 0) + 1);
    });

    return users.map((u) => ({
      ...u,
      assignedVideosCount: assignCountMap.get(u.id) || 0,
      assignedVideosWatched: ['All Access (Super Admin)'],
    }));
  }

  @Get('users/:id/details')
  async getUserDetails(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
    return this.userDetailsService.getUserDetails(id, req.user);
  }

  @Get('users/:id')
  async getUserProfile(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.users.findOne({
      where: { id },
      select: ['id', 'fullName', 'email', 'role', 'phone', 'isActive', 'createdAt', 'updatedAt'],
    });
    if (!user) throw new NotFoundException('User not found');

    const rawViews = await this.courseViews.find({
      where: [{ userId: user.id }, { userId: user.email }],
      order: { createdAt: 'DESC' },
      take: 200,
    });

    // Deduplicate view sessions by course and 2-hour window so duplicates don't inflate watch time
    const views: CourseView[] = [];
    for (const rv of rawViews) {
      const rTime = new Date(rv.createdAt).getTime();
      const existing = views.find(
        (v) => v.slug === rv.slug && Math.abs(new Date(v.createdAt).getTime() - rTime) < 2 * 60 * 60 * 1000,
      );
      if (existing) {
        existing.timeSpent = Math.max(existing.timeSpent || 0, rv.timeSpent || 0);
      } else {
        views.push({ ...rv });
      }
    }

    const totalWatchTime = views.reduce((acc, v) => acc + (Number(v.timeSpent) || 0), 0);
    const uniqueCourses = Array.from(new Set(views.map((v) => v.slug)));

    return {
      ...user,
      views,
      totalWatchTime,
      coursesViewedCount: uniqueCourses.length,
      coursesViewed: uniqueCourses,
    };
  }

  @UseGuards(SuperAdminGuard)
  @Post('users')
  async createUser(@Body() body: { fullName: string; email: string; password?: string; role?: string }) {
    if (!body.fullName || !body.email) throw new BadRequestException('Full name and email are required');
    const email = body.email.trim().toLowerCase();
    const existing = await this.users.findOne({ where: { email } });
    if (existing) throw new BadRequestException('A user with this email already exists');
    const pw = body.password && body.password.length >= 6 ? body.password : 'User@123';
    const user = await this.users.save(
      this.users.create({
        fullName: body.fullName.trim(),
        email,
        role: body.role === 'admin' ? 'admin' : body.role === 'super_admin' ? 'super_admin' : 'user',
        isActive: true,
        passwordHash: await hashPassword(pw),
      }),
    );
    return { id: user.id, fullName: user.fullName, email: user.email, role: user.role, createdAt: user.createdAt };
  }

  @UseGuards(SuperAdminGuard)
  @Put('users/:id/role')
  async updateUserRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpdateUserRoleDto,
  ) {
    const role = body.role;
    await this.users.update(id, { role });
    return this.users.findOne({
      where: { id },
      select: ['id', 'fullName', 'email', 'role', 'isActive', 'createdAt', 'updatedAt'],
    });
  }

  @UseGuards(SuperAdminGuard)
  @Delete('users/:id')
  async deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
    @Query('permanent') permanent?: string,
  ) {
    if (req.user?.id === id) {
      throw new BadRequestException('Cannot delete your own administrative account');
    }
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === 'super_admin') {
      throw new BadRequestException('Cannot delete a Super Admin account');
    }

    if (user.role === 'admin' && permanent !== 'true') {
      user.isActive = false;
      await this.users.save(user);
      return { ok: true, message: `Sub-Admin ${user.fullName} suspended successfully.`, isActive: false };
    }

    await this.assignmentsRepo.delete({ adminId: id });
    await this.users.delete(id);
    return { ok: true };
  }

  // ==========================================
  // SUPER ADMIN: SUB-ADMIN & VIDEO SCOPING MANAGEMENT
  // ==========================================
  private async saveAdminAssignments(
    adminId: string,
    assignments: any[] = [],
    assignedPlaylistIds: string[] = [],
    assignedBy: string | null = null,
  ) {
    const cleanPlaylistIds = Array.from(
      new Set((Array.isArray(assignedPlaylistIds) ? assignedPlaylistIds : []).filter(Boolean)),
    );
    const playlistMap = new Map<string, CoursePlaylist>();
    if (cleanPlaylistIds.length > 0) {
      const foundPls = await this.playlistRepo.find({ where: { id: In(cleanPlaylistIds) } });
      foundPls.forEach((p) => playlistMap.set(p.id, p));
    }

    const toSave: AdminVideoAssignment[] = [];
    const seenKeys = new Set<string>();

    for (const a of Array.isArray(assignments) ? assignments : []) {
      const slug = (a.courseSlug || '').trim();
      if (!slug) continue;
      const vid = a.videoId ? a.videoId.trim() : 'ALL';
      const plId = a.playlistId || null;
      const key = `${slug.toLowerCase()}::${plId || ''}::${vid}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
      toSave.push(
        this.assignmentsRepo.create({
          adminId,
          courseSlug: slug,
          courseId: a.courseId || null,
          playlistId: plId,
          videoId: vid,
          videoTitle: a.videoTitle || null,
          assignedBy,
        }),
      );
    }

    for (const plId of cleanPlaylistIds) {
      const pl = playlistMap.get(plId);
      const slug = (pl?.courseSlug || 'general').trim();
      const key = `${slug.toLowerCase()}::${plId}::ALL`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
      toSave.push(
        this.assignmentsRepo.create({
          adminId,
          courseSlug: slug,
          courseId: pl?.courseId || null,
          playlistId: plId,
          videoId: 'ALL',
          videoTitle: pl ? `Playlist: ${pl.title}` : 'Assigned Playlist',
          assignedBy,
        }),
      );
    }

    if (toSave.length > 0) {
      await this.assignmentsRepo.save(toSave);
    }
  }

  private extractAssignedPlaylistIds(assignments: AdminVideoAssignment[] = []): string[] {
    return Array.from(
      new Set(
        assignments
          .filter((a) => a.playlistId && (!a.videoId || a.videoId === 'ALL'))
          .map((a) => a.playlistId as string),
      ),
    );
  }

  @Get('assignable-resources')
  @UseGuards(SuperAdminGuard)
  async getAssignableResources(@Query('adminId') adminId?: string) {
    const courses = await this.courseRepo.find({ order: { createdAt: 'DESC' } });
    const playlists = await this.playlistRepo.find({
      relations: ['videos'],
      order: { displayOrder: 'ASC' },
    });

    let assignedPlaylistIds: string[] = [];
    if (adminId) {
      const existing = await this.assignmentsRepo.find({ where: { adminId } });
      assignedPlaylistIds = this.extractAssignedPlaylistIds(existing);
    }

    const courseItems = courses.map((c) => {
      const coursePlaylists = playlists.filter(
        (p) => (p.courseSlug && p.courseSlug.toLowerCase() === c.slug.toLowerCase()) || p.courseId === c.id,
      );
      return {
        courseId: c.id,
        courseSlug: c.slug,
        courseTitle: c.courseName,
        lessons: (c.lessons || []).map((l: any, idx: number) => ({
          index: idx,
          videoId: `${c.slug}_v${idx}`,
          videoTitle: l.t || l.title || `Lesson ${idx + 1}`,
          duration: l.duration || null,
          youtubeVideoId: l.id || null,
        })),
        playlists: coursePlaylists.map((p) => ({
          playlistId: p.id,
          playlistTitle: p.title,
          videos: (p.videos || []).map((v) => ({
            videoId: v.id,
            videoTitle: v.title,
            youtubeVideoId: v.youtubeVideoId,
            duration: v.duration,
            displayOrder: v.displayOrder,
          })),
        })),
      };
    });

    const playlistItems = playlists.map((p) => ({
      playlistId: p.id,
      id: p.id,
      title: p.title,
      courseId: p.courseId,
      courseSlug: p.courseSlug,
      videoCount: (p.videos || []).length,
      videos: (p.videos || []).map((v) => ({
        videoId: v.id,
        videoTitle: v.title,
        youtubeVideoId: v.youtubeVideoId,
        duration: v.duration,
        displayOrder: v.displayOrder,
      })),
    }));

    return {
      courses: courseItems,
      playlists: playlistItems,
      assignedPlaylistIds,
    };
  }

  @Get('sub-admins')
  @UseGuards(SuperAdminGuard)
  async getSubAdmins() {
    const admins = await this.users.find({
      where: [{ role: 'admin' }, { role: 'super_admin' }],
      order: { createdAt: 'DESC' },
      select: ['id', 'fullName', 'email', 'role', 'phone', 'isActive', 'createdByAdminId', 'createdAt', 'lastLoginAt'],
    });

    const assignments = await this.assignmentsRepo.find();
    const assignMap = new Map<string, AdminVideoAssignment[]>();
    assignments.forEach((a) => {
      if (!assignMap.has(a.adminId)) assignMap.set(a.adminId, []);
      assignMap.get(a.adminId)!.push(a);
    });

    const enriched = await Promise.all(
      admins.map(async (adm) => {
        const userAssignments = assignMap.get(adm.id) || [];
        const assignedPlaylistIds = this.extractAssignedPlaylistIds(userAssignments);
        const learners = adm.role === 'admin' ? await this.adminScopeService.getScopedLearnersForAdmin(adm) : [];
        return {
          ...adm,
          assignments: userAssignments,
          assignedPlaylistIds,
          assignedVideosCount: userAssignments.length,
          learnersCount: adm.role === 'super_admin' ? 'All' : learners.length,
        };
      }),
    );

    return enriched;
  }

  @Post('sub-admins')
  @UseGuards(SuperAdminGuard)
  async createSubAdmin(@Body() dto: CreateSubAdminDto, @Req() req: any) {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.users.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('An account with this email already exists');
    }

    const user = await this.users.save(
      this.users.create({
        fullName: dto.fullName.trim(),
        email,
        role: 'admin',
        phone: dto.phone ? dto.phone.trim() : null,
        isActive: true,
        createdByAdminId: req.user?.id || null,
        passwordHash: await hashPassword(dto.password),
      }),
    );

    await this.saveAdminAssignments(
      user.id,
      dto.assignments || [],
      dto.assignedPlaylistIds || [],
      req.user?.id || null,
    );

    const savedAssignments = await this.assignmentsRepo.find({ where: { adminId: user.id } });
    const assignedPlaylistIds = this.extractAssignedPlaylistIds(savedAssignments);

    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      createdAt: user.createdAt,
      assignments: savedAssignments,
      assignedPlaylistIds,
    };
  }

  @Put('sub-admins/:id')
  @UseGuards(SuperAdminGuard)
  async updateSubAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubAdminDto,
    @Req() req: any,
  ) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Sub-Admin not found');
    if (user.role === 'super_admin') {
      throw new BadRequestException('Cannot modify Primary Super Admin via Sub-Admin endpoint');
    }

    if (dto.fullName !== undefined) user.fullName = dto.fullName.trim();
    if (dto.phone !== undefined) user.phone = dto.phone ? dto.phone.trim() : null;
    if (dto.password !== undefined && dto.password.length > 0) {
      user.passwordHash = await hashPassword(dto.password);
    }
    await this.users.save(user);

    if (dto.assignments !== undefined || dto.assignedPlaylistIds !== undefined) {
      await this.assignmentsRepo.delete({ adminId: id });
      await this.saveAdminAssignments(
        id,
        dto.assignments || [],
        dto.assignedPlaylistIds || [],
        req.user?.id || null,
      );
    }

    const savedAssignments = await this.assignmentsRepo.find({ where: { adminId: id } });
    return {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive,
      assignments: savedAssignments,
      assignedPlaylistIds: this.extractAssignedPlaylistIds(savedAssignments),
    };
  }

  @Put('sub-admins/:id/assignments')
  @UseGuards(SuperAdminGuard)
  async updateSubAdminAssignments(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AssignAdminVideosDto,
    @Req() req: any,
  ) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Sub-Admin not found');

    await this.assignmentsRepo.delete({ adminId: id });
    await this.saveAdminAssignments(
      id,
      dto.assignments || [],
      dto.assignedPlaylistIds || [],
      req.user?.id || null,
    );

    const savedAssignments = await this.assignmentsRepo.find({ where: { adminId: id } });
    return {
      assignments: savedAssignments,
      assignedPlaylistIds: this.extractAssignedPlaylistIds(savedAssignments),
    };
  }

  @Patch('sub-admins/:id/status')
  @UseGuards(SuperAdminGuard)
  async updateSubAdminStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSubAdminStatusDto,
    @Req() req: any,
  ) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Admin user not found');
    if (user.role === 'super_admin' && !dto.isActive) {
      throw new BadRequestException('Cannot deactivate a Super Admin account');
    }

    user.isActive = dto.isActive;
    await this.users.save(user);

    return { ok: true, id: user.id, isActive: user.isActive };
  }

  @Delete('sub-admins/:id')
  @UseGuards(SuperAdminGuard)
  async deleteSubAdmin(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: any,
    @Query('permanent') permanent?: string,
  ) {
    if (req.user?.id === id) {
      throw new BadRequestException('Cannot delete your own administrative account');
    }
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Admin user not found');
    if (user.role === 'super_admin') {
      throw new BadRequestException('Cannot delete a Super Admin account');
    }

    if (permanent === 'true') {
      await this.assignmentsRepo.delete({ adminId: id });
      await this.users.delete(id);
      return { ok: true, message: `Sub-Admin ${user.fullName} permanently deleted.` };
    }

    user.isActive = false;
    await this.users.save(user);

    return { ok: true, message: `Sub-Admin ${user.fullName} suspended successfully.`, isActive: false };
  }
}

