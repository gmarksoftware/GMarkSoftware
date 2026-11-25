import { ConflictException, Injectable, Logger, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { DataSource, Repository } from 'typeorm';
import { User, UserLoginLog } from '../entities';
import { MailService } from '../site/mail.service';
import { hashPassword, signToken, verifyPassword, verifyToken, TokenPayload } from './security';

const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
// Used so a login for an unknown e-mail costs the same time as a real one (no user enumeration by timing).
const DUMMY_HASH = `${'00'.repeat(16)}:${'00'.repeat(64)}`;

export const publicUser = (u: User) => ({
  id: u.id,
  fullName: u.fullName,
  email: u.email,
  role: u.role,
  isActive: u.isActive !== false,
  createdAt: u.createdAt,
  lastLoginAt: u.lastLoginAt,
  phone: u.phone,
});

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly log = new Logger('Auth');

  constructor(
    @InjectRepository(User) private users: Repository<User>,
    @InjectRepository(UserLoginLog) private loginLogs: Repository<UserLoginLog>,
    private config: ConfigService,
    private mail: MailService,
    private dataSource: DataSource,
  ) {}

  /** Secret used to sign tokens: JWT_SECRET, or derived from ADMIN_API_KEY, or stable fallback. */
  get secret(): string {
    const s = this.config.get<string>('JWT_SECRET', '');
    if (s) return s;
    const k = this.config.get<string>('ADMIN_API_KEY', '');
    if (k) return createHash('sha256').update(`gramguru-jwt:${k}`).digest('hex');
    const fallbackSeed = process.env.RENDER_SERVICE_ID || process.env.NODE_ENV || 'gramguru-production-jwt-key-2026';
    return createHash('sha256').update(`gramguru-fallback-jwt:${fallbackSeed}`).digest('hex');
  }

  /** Creates / refreshes the admin account from ADMIN_EMAIL + ADMIN_PASSWORD on every start and runs idempotent migrations. */
  async onModuleInit() {
    try {
      await this.dataSource.query(`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS "createdByAdminId" uuid;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true;
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS "createdBy" uuid;
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS "strictNonSkippable" boolean DEFAULT true;
        ALTER TABLE courses ADD COLUMN IF NOT EXISTS "requireProjectForCertificate" boolean DEFAULT true;
        ALTER TABLE course_playlists ADD COLUMN IF NOT EXISTS "createdBy" uuid;
        ALTER TABLE course_progress ADD COLUMN IF NOT EXISTS "lessonMaxWatched" jsonb DEFAULT '{}'::jsonb;
        ALTER TABLE user_video_watch_logs ADD COLUMN IF NOT EXISTS "maxWatchedSeconds" integer DEFAULT 0;
        ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS "verifiedBy" varchar;
        ALTER TABLE assignment_submissions ADD COLUMN IF NOT EXISTS "reviewedAt" timestamptz;
        ALTER TABLE video_task_submissions ADD COLUMN IF NOT EXISTS "verifiedBy" varchar;
        CREATE TABLE IF NOT EXISTS course_certificates (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "certificateCode" varchar NOT NULL UNIQUE,
          "userId" varchar NOT NULL,
          "userName" varchar,
          "userEmail" varchar,
          "courseId" varchar,
          "courseSlug" varchar NOT NULL,
          "courseTitle" varchar NOT NULL,
          "completedAt" timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "verificationStatus" varchar NOT NULL DEFAULT 'VERIFIED',
          "projectTitle" varchar,
          "projectUrl" varchar,
          "metadata" jsonb DEFAULT '{}'::jsonb,
          "createdAt" timestamptz NOT NULL DEFAULT now(),
          "updatedAt" timestamptz NOT NULL DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS "IDX_course_certificates_user_slug" ON course_certificates ("userId", "courseSlug");
        CREATE UNIQUE INDEX IF NOT EXISTS "IDX_course_certificates_code" ON course_certificates ("certificateCode");
        CREATE TABLE IF NOT EXISTS admin_video_assignments (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          "adminId" uuid NOT NULL,
          "courseSlug" varchar NOT NULL,
          "courseId" uuid,
          "playlistId" uuid,
          "videoId" varchar,
          "videoTitle" varchar,
          "assignedBy" uuid,
          "createdAt" timestamptz DEFAULT now()
        );
        CREATE UNIQUE INDEX IF NOT EXISTS idx_admin_video_unique ON admin_video_assignments ("adminId", "courseSlug", COALESCE("videoId", 'ALL'));
      `);
    } catch (e: any) {
      this.log.warn(`RBAC Migration notice: ${e?.message}`);
    }

    const email = this.config.get<string>('ADMIN_EMAIL', '').trim().toLowerCase();
    const password = this.config.get<string>('ADMIN_PASSWORD', '');
    if (!email || !password) {
      this.log.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set – no admin account was created. Set them in .env to enable admin login.');
      return;
    }
    try {
      const existing = await this.users.findOne({ where: { email } });
      if (!existing) {
        await this.users.save(this.users.create({
          fullName: 'Administrator', email, role: 'super_admin', isActive: true, passwordHash: await hashPassword(password),
        }));
        this.log.log(`Super Admin account created for ${email}`);
        return;
      }
      // Keep the account in sync with .env (so changing ADMIN_PASSWORD there resets the password).
      existing.role = 'super_admin';
      existing.isActive = true;
      if (!(await verifyPassword(password, existing.passwordHash))) existing.passwordHash = await hashPassword(password);
      await this.users.save(existing);
      this.log.log(`Primary Super Admin account synchronized for ${email}`);
    } catch (err: any) {
      this.log.error(`Admin initialization notice: ${err?.message}`);
    }
  }

  async recordLogin(user: User, req?: any) {
    try {
      const ip = (req?.headers?.['x-forwarded-for'] || req?.socket?.remoteAddress || req?.ip || '').toString().split(',')[0].trim() || null;
      const userAgent = (req?.headers?.['user-agent'] || '').toString() || null;
      let device = 'Desktop';
      if (userAgent) {
        if (/Mobile|Android|iPhone|iPod/i.test(userAgent)) device = 'Mobile';
        else if (/iPad|Tablet/i.test(userAgent)) device = 'Tablet';
      }

      await this.loginLogs.save(
        this.loginLogs.create({
          userId: user.id,
          ipAddress: ip,
          userAgent,
          device,
          loginAt: new Date(),
        }),
      );

      await this.users.update(user.id, {
        lastLoginAt: new Date(),
        lastLoginIp: ip,
      });
    } catch (err: any) {
      this.log.warn(`Could not record login log: ${err?.message}`);
    }
  }

  async register(fullName: string, rawEmail: string, password: string, req?: any) {
    const email = rawEmail.trim().toLowerCase();
    if (await this.users.findOne({ where: { email } })) throw new ConflictException('An account with this email already exists');
    // Role is ALWAYS 'user' here – nobody can self-register as admin.
    const user = await this.users.save(this.users.create({
      fullName: fullName.trim(), email, role: 'user', passwordHash: await hashPassword(password),
    }));
    // Fire-and-forget welcome email – non-blocking, never fails registration
    this.mail.sendWelcomeEmail(user.email, user.fullName).catch(() => {});
    await this.recordLogin(user, req);
    return this.session(user);
  }

  async login(rawEmail: string, password: string, req?: any) {
    const user = await this.users.findOne({ where: { email: rawEmail.trim().toLowerCase() } });
    const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !ok) throw new UnauthorizedException('Incorrect email or password');
    if (user.isActive === false) throw new UnauthorizedException('This account has been deactivated. Please contact support.');
    await this.recordLogin(user, req);
    return this.session(user);
  }

  async googleAuth(fullName: string, rawEmail: string, password?: string, req?: any) {
    const email = rawEmail.trim().toLowerCase();
    let user = await this.users.findOne({ where: { email } });
    const isNew = !user;
    if (!user) {
      const pwToHash = password && password.length >= 6
        ? password
        : createHash('sha256').update(`${email}:${Date.now()}:${Math.random()}`).digest('hex');
      user = await this.users.save(this.users.create({
        fullName: (fullName || email.split('@')[0]).trim(),
        email,
        role: 'user',
        passwordHash: await hashPassword(pwToHash),
      }));
      this.log.log(`Google user registered: ${email}`);
    } else if (password && password.length >= 6) {
      user.passwordHash = await hashPassword(password);
      await this.users.save(user);
    }
    // Send welcome email only for brand-new Google registrations
    if (isNew) {
      this.mail.sendWelcomeEmail(user.email, user.fullName).catch(() => {});
    }
    await this.recordLogin(user, req);
    return this.session(user);
  }

  /** Validates a bearer token and loads the user fresh from the DB (so role changes / deletions apply at once). */
  async userFromToken(token: string): Promise<User | null> {
    const payload: TokenPayload | null = verifyToken(token, this.secret);
    if (!payload) return null;
    return this.users.findOne({ where: { id: payload.sub } });
  }

  private session(user: User) {
    return { token: signToken(user, this.secret, TOKEN_TTL_SECONDS), user: publicUser(user) };
  }
}
