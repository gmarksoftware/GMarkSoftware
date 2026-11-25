import { Body, ConflictException, Controller, Get, HttpCode, Logger, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { MoreThanOrEqual, Repository } from 'typeorm';
import {
  ContactMessage, CourseCertificateEntity, CourseEntity, CourseView, DonationPledge, EventEntity, GalleryItem, NewsletterSubscriber, Volunteer, WorkshopRegistration,
} from '../entities';
import {
  ContactDto, DonationPledgeDto, NewsletterDto, TrackCourseViewDto, VolunteerDto, WorkshopRegistrationDto,
} from '../dto';
import { LABEL_TO_CATEGORY } from '../constants';
import { SettingsService } from './settings.service';

// Stricter limit for anything that writes to the DB (per IP).
const FORM_LIMIT = { default: { limit: 8, ttl: 60_000 } };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Controller()
export class PublicController {
  private readonly logger = new Logger(PublicController.name);

  constructor(
    private settings: SettingsService,
    @InjectRepository(ContactMessage) private contacts: Repository<ContactMessage>,
    @InjectRepository(Volunteer) private volunteers: Repository<Volunteer>,
    @InjectRepository(WorkshopRegistration) private registrations: Repository<WorkshopRegistration>,
    @InjectRepository(DonationPledge) private pledges: Repository<DonationPledge>,
    @InjectRepository(NewsletterSubscriber) private subscribers: Repository<NewsletterSubscriber>,
    @InjectRepository(EventEntity) private events: Repository<EventEntity>,
    @InjectRepository(GalleryItem) private gallery: Repository<GalleryItem>,
    @InjectRepository(CourseView) private courseViews: Repository<CourseView>,
    @InjectRepository(CourseEntity) private courses: Repository<CourseEntity>,
    @InjectRepository(CourseCertificateEntity) private certificates: Repository<CourseCertificateEntity>,
  ) { }

  @Get('health')
  health() {
    return { status: 'ok' };
  }

  /** Impact numbers, contact info, donation details and social links. */
  @Get('settings')
  getSettings() {
    return this.settings.getAll();
  }

  /** Upcoming, published programs / workshops. */
  @Get('events')
  upcomingEvents() {
    return this.events.find({
      where: { published: true, startsAt: MoreThanOrEqual(new Date()) },
      order: { startsAt: 'ASC' },
      take: 50,
    });
  }

  @Get('gallery')
  galleryItems(@Query('category') category?: string) {
    let cleanCategory: string | undefined;
    if (category && category !== 'all') {
      const lower = category.trim().toLowerCase();
      cleanCategory = LABEL_TO_CATEGORY[lower] || lower;
    }
    return this.gallery.find({
      where: cleanCategory ? { category: cleanCategory } : {},
      order: { createdAt: 'DESC' },
      take: 200,
    });
  }

  @Throttle(FORM_LIMIT) @Post('contact') @HttpCode(201)
  async contact(@Body() dto: ContactDto) {
    await this.contacts.save(this.contacts.create(dto));
    return { ok: true };
  }

  @Throttle(FORM_LIMIT) @Post('volunteers') @HttpCode(201)
  async volunteer(@Body() dto: VolunteerDto) {
    await this.volunteers.save(this.volunteers.create(dto));
    return { ok: true };
  }

  @Throttle(FORM_LIMIT) @Post('workshop-registrations') @HttpCode(201)
  async register(@Body() dto: WorkshopRegistrationDto) {
    await this.registrations.save(this.registrations.create(dto));
    return { ok: true };
  }

  /** Records interest in donating. It does NOT process a payment. */
  @Throttle(FORM_LIMIT) @Post('donations/pledge') @HttpCode(201)
  async pledge(@Body() dto: DonationPledgeDto) {
    await this.pledges.save(this.pledges.create(dto));
    return { ok: true };
  }

  @Throttle(FORM_LIMIT) @Post('newsletter') @HttpCode(201)
  async subscribe(@Body() dto: NewsletterDto) {
    const email = dto.email.toLowerCase();
    if ((await this.subscribers.count({ where: { email } })) > 0) throw new ConflictException('Already subscribed');
    await this.subscribers.save(this.subscribers.create({ email }));
    return { ok: true };
  }

  @SkipThrottle()
  @Post('courses/track-view')
  @HttpCode(200)
  async trackCourseView(@Body() dto: TrackCourseViewDto) {
    try {
      let slug = (dto.slug || '').trim().toLowerCase();

      // If slug was not provided but courseId was provided, resolve the slug
      if (!slug && dto.courseId) {
        const cId = String(dto.courseId).trim();
        if (UUID_REGEX.test(cId)) {
          const course = await this.courses.findOne({ where: { id: cId } });
          if (course) slug = course.slug.toLowerCase();
        }
        if (!slug) {
          const course = await this.courses.findOne({ where: { slug: cId.toLowerCase() } });
          if (course) slug = course.slug.toLowerCase();
          else slug = cId.toLowerCase();
        }
      }

      const timeSpent = Math.max(0, Number(dto.timeSpent) || 0);
      const userId = (dto.userId || '').trim() || null;

      if (!slug) {
        return { ok: false, message: 'slug or courseId is required' };
      }

      let view: CourseView | null = null;
      const sessionId = (dto.sessionId || '').trim() || null;

      // 1. If explicit valid UUID sessionId was provided, find existing session
      if (sessionId && UUID_REGEX.test(sessionId)) {
        try {
          view = await this.courseViews.findOne({ where: { id: sessionId } });
        } catch (err: any) {
          this.logger.warn(`Could not find course view by sessionId "${dto.sessionId}": ${err?.message || err}`);
        }
      }

      // 2. If user is logged in, find existing view record for this user & course
      if (!view && userId) {
        view = await this.courseViews.findOne({
          where: { slug, userId },
          order: { updatedAt: 'DESC' },
        });
      }

      if (view) {
        view.timeSpent = Math.max(view.timeSpent || 0, timeSpent);
        if (userId && !view.userId) {
          view.userId = userId;
        }
        await this.courseViews.save(view);

        if (userId) {
          try {
            await this.courses.query(
              `INSERT INTO course_enrollments (id, "courseSlug", "userId", "createdAt", "updatedAt")
               VALUES (gen_random_uuid(), $1, $2, now(), now())
               ON CONFLICT ("courseSlug", "userId") DO NOTHING`,
              [slug, userId]
            );
          } catch { }
        }

        return { ok: true, session: view };
      }

      // 3. Create brand new course view record
      const newEntity: Partial<CourseView> = {
        slug,
        timeSpent,
        userId,
      };
      if (sessionId && UUID_REGEX.test(sessionId)) {
        newEntity.id = sessionId;
      }

      view = await this.courseViews.save(this.courseViews.create(newEntity));

      if (userId) {
        try {
          await this.courses.query(
            `INSERT INTO course_enrollments (id, "courseSlug", "userId", "createdAt", "updatedAt")
             VALUES (gen_random_uuid(), $1, $2, now(), now())
             ON CONFLICT ("courseSlug", "userId") DO NOTHING`,
            [slug, userId]
          );
        } catch { }
      }

      return { ok: true, session: view };
    } catch (error: any) {
      this.logger.error(`Error in trackCourseView: ${error?.message || error}`, error?.stack);
      throw error;
    }
  }

  @SkipThrottle()
  @Get('courses/views')
  async getCourseViews() {
    return this.courseViews.find({ order: { updatedAt: 'DESC' }, take: 1000 });
  }

  /** Public company verification endpoint for earned G-Mark Software completion certificates. */
  @SkipThrottle()
  @Get('certificates/verify/:certificateCode')
  async verifyCertificate(@Param('certificateCode') certificateCode: string) {
    const cleanCode = (certificateCode || '').trim().toUpperCase();
    if (!cleanCode) {
      throw new NotFoundException('Certificate code is required.');
    }

    const cert = await this.certificates.findOne({
      where: { certificateCode: cleanCode },
    });

    if (!cert) {
      throw new NotFoundException(`Certificate "${cleanCode}" not found or invalid.`);
    }

    return {
      valid: true,
      verified: cert.verificationStatus === 'VERIFIED',
      certificateCode: cert.certificateCode,
      learnerName: cert.userName || 'G-Mark Learner',
      userName: cert.userName || 'G-Mark Learner',
      courseTitle: cert.courseTitle,
      courseSlug: cert.courseSlug,
      completedAt: cert.completedAt,
      verificationStatus: cert.verificationStatus || 'VERIFIED',
      projectTitle: cert.projectTitle || null,
      projectUrl: cert.projectUrl || null,
      issuer: 'G-Mark Software',
    };
  }
}
