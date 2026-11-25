import {
  Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn,
} from 'typeorm';

@Entity('contact_messages')
export class ContactMessage {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() fullName: string;
  @Column() mobile: string;
  @Column() email: string;
  @Column() subject: string;
  @Column('text') message: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('volunteers')
export class Volunteer {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() fullName: string;
  @Column() mobile: string;
  @Column() email: string;
  @Column() interest: string; // volunteer | partner | support | participate
  @Column({ type: 'text', nullable: true }) message: string | null;
  @CreateDateColumn() createdAt: Date;
}

@Entity('events')
export class EventEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() titleEn: string;
  @Column({ type: 'varchar', nullable: true }) titleMr: string | null;
  @Column({ type: 'text', nullable: true }) descriptionEn: string | null;
  @Column({ type: 'text', nullable: true }) descriptionMr: string | null;
  @Column() category: string;
  @Column({ type: 'timestamptz' }) startsAt: Date;
  @Column({ type: 'varchar', nullable: true }) location: string | null;
  @Column({ default: true }) registrationOpen: boolean;
  @Column({ default: true }) published: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('workshop_registrations')
export class WorkshopRegistration {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() fullName: string;
  @Column() mobile: string;
  @Column({ type: 'varchar', nullable: true }) email: string | null;
  @Column({ type: 'varchar', nullable: true }) place: string | null;
  @Column({ type: 'uuid', nullable: true }) eventId: string | null;
  @Column({ type: 'text', nullable: true }) message: string | null;
  @CreateDateColumn() createdAt: Date;
}

@Entity('donation_pledges')
export class DonationPledge {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() fullName: string;
  @Column() mobile: string;
  @Column({ type: 'varchar', nullable: true }) email: string | null;
  @Column({ type: 'int', nullable: true }) amount: number | null; // INR, optional
  @Column({ type: 'text', nullable: true }) message: string | null;
  @CreateDateColumn() createdAt: Date;
}

@Entity('newsletter_subscribers')
export class NewsletterSubscriber {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index({ unique: true }) @Column() email: string;
  @CreateDateColumn() createdAt: Date;
}

@Entity('newsletter_broadcasts')
export class NewsletterBroadcast {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() subject: string;
  @Column({ type: 'text' }) body: string;
  @Column({ type: 'varchar', nullable: true }) resourceLink: string | null;
  @Column({ type: 'varchar', nullable: true }) resourceTitle: string | null;
  /** How many subscriber emails were queued/sent at send time. */
  @Column({ type: 'int', default: 0 }) sentCount: number;
  @CreateDateColumn() createdAt: Date;
}

@Entity('gallery_items')
export class GalleryItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() category: string;
  @Column({ type: 'varchar', nullable: true }) captionEn: string | null;
  @Column({ type: 'varchar', nullable: true }) captionMr: string | null;
  @Column() imageUrl: string; // e.g. /uploads/abc.jpg
  @CreateDateColumn() createdAt: Date;
}

/** Website accounts. Visitors register as role 'user'; the admin account (role 'super_admin' or 'admin') is seeded from ADMIN_EMAIL / ADMIN_PASSWORD. */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() fullName: string;
  @Index({ unique: true }) @Column() email: string; // always stored lower-case
  @Column() passwordHash: string; // scrypt, "salt:hash" (hex)
  @Column({ default: 'user' }) role: string; // 'super_admin' | 'admin' | 'user'
  @Column({ type: 'uuid', nullable: true }) createdByAdminId: string | null;
  @Column({ type: 'boolean', default: true }) isActive: boolean;
  @Column({ type: 'text', nullable: true }) learningPurpose: string | null;
  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" }) interests: string[];
  @Column({ type: 'varchar', nullable: true }) phone: string | null;
  @Column({ type: 'timestamptz', nullable: true }) lastLoginAt: Date | null;
  @Column({ type: 'varchar', nullable: true }) lastLoginIp: string | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

/** Key/value store for editable site data: impact numbers, contact info, donation details, social links. */
@Entity('site_settings')
export class SiteSetting {
  @PrimaryColumn() key: string;
  @Column({ type: 'jsonb' }) value: Record<string, unknown>;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('course_views')
export class CourseView {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() slug: string;
  @Column({ type: 'int', default: 0 }) timeSpent: number; // in seconds
  @Column({ type: 'varchar', nullable: true }) userId: string | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('courses')
export class CourseEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() courseName: string;
  @Index({ unique: true }) @Column() slug: string;
  @Column() category: string;
  @Column({ default: 'Beginner' }) level: string;
  @Column({ type: 'text' }) shortDescription: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ default: 'Active' }) status: string; // 'Active' | 'Draft' | 'Inactive' | 'Archived'
  @Column({ default: false }) trending: boolean;
  @Column({ type: 'varchar', nullable: true, default: 'school' }) icon: string | null;
  @Column({ type: 'varchar', nullable: true }) image: string | null;
  @Column({ type: 'varchar', default: 'from-brand-forest via-brand-deep to-brand-darker' }) gradient: string;
  @Column({ type: 'varchar', nullable: true }) videoUrl: string | null;
  @Column({ type: 'varchar', nullable: true }) youtubeUrl: string | null;
  @Column({ type: 'varchar', nullable: true }) youtubeVideoId: string | null;
  @Column({ type: 'varchar', nullable: true }) thumbnailUrl: string | null;
  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" }) lessons: any[];
  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" }) sections: any[];
  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" }) topics: any[];
  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" }) learn: string[];
  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" }) requirements: string[];
  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" }) resources: any[];
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) price: number;
  @Column({ default: true }) isFree: boolean;
  @Column({ type: 'int', default: 365 }) validityDays: number;
  @Column({ default: true }) allowSubscription: boolean;
  @Column({ type: 'varchar', nullable: true, default: 'Self-paced' }) duration: string | null;
  @Column({ default: false }) certificateEnabled: boolean;
  @Column({ default: true }) strictNonSkippable: boolean;
  @Column({ default: true }) requireProjectForCertificate: boolean;
  @Column({ type: 'varchar', nullable: true }) excelFileName: string | null;
  @Column({ type: 'varchar', nullable: true }) excelFileUrl: string | null;
  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" }) assessments: any[];
  @Column({ type: 'jsonb', nullable: true, default: () => "'{}'" }) assessmentSettings: Record<string, any>;
  @Index() @Column({ type: 'uuid', nullable: true }) createdBy: string | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('course_ratings')
@Index(['courseId', 'userId'], { unique: true })
@Index(['courseSlug', 'userId'], { unique: true })
export class CourseRating {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ type: 'varchar', nullable: true }) courseId: string | null;
  @Index() @Column() courseSlug: string;
  @Index() @Column() userId: string;
  @Column({ type: 'varchar', nullable: true }) userName: string | null;
  @Column({ type: 'int' }) rating: number; // 1-5
  @Column({ type: 'text', nullable: true }) review: string | null;
  @Index() @Column({ type: 'varchar', default: 'published' }) status: string; // 'published' | 'hidden'
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('course_enrollments')
@Index(['courseSlug', 'userId'], { unique: true })
export class CourseEnrollment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ type: 'varchar', nullable: true }) courseId: string | null;
  @Index() @Column() courseSlug: string;
  @Index() @Column({ type: 'varchar', default: 'course' }) itemType: string; // 'course' | 'playlist'
  @Index() @Column({ type: 'varchar', nullable: true }) playlistId: string | null;
  @Index() @Column() userId: string;
  @Column({ type: 'varchar', nullable: true }) userEmail: string | null;
  @Column({ type: 'varchar', nullable: true }) userName: string | null;
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) startDate: Date;
  @Column({ type: 'timestamptz', nullable: true }) expiryDate: Date | null;
  @Column({ type: 'int', default: 365 }) validityDays: number;
  @Column({ default: 'active' }) status: string; // 'active' | 'expired' | 'cancelled'
  @Column({ type: 'varchar', nullable: true }) paymentId: string | null;
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) amountPaid: number;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('course_progress')
@Index(['courseSlug', 'userId'], { unique: true })
export class CourseProgress {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column() courseSlug: string;
  @Index() @Column({ type: 'varchar', nullable: true }) courseId: string | null;
  @Index() @Column({ type: 'varchar', default: 'course' }) itemType: string; // 'course' | 'playlist'
  @Index() @Column({ type: 'varchar', nullable: true }) playlistId: string | null;
  @Index() @Column() userId: string;
  @Column({ type: 'jsonb', default: () => "'[]'" }) completedLessons: string[];
  @Column({ type: 'jsonb', default: () => "'[]'" }) completedVideos: string[];
  @Column({ type: 'jsonb', default: () => "'{}'" }) checkpointsPassed: Record<string, boolean>;
  @Column({ type: 'jsonb', default: () => "'{}'" }) lessonMaxWatched: Record<string, number>;
  @Column({ type: 'int', default: 0 }) progressPercent: number;
  @Column({ type: 'int', default: 0 }) watchTimeSec: number;
  @Column({ type: 'int', default: 0 }) lastAccessedLessonIndex: number;
  @Column({ type: 'varchar', nullable: true }) lastAccessedLessonTitle: string | null;
  @Column({ type: 'int', default: 0 }) lastPositionSec: number;
  @Column({ default: false }) isCompleted: boolean;
  @Column({ type: 'timestamptz', nullable: true }) completedAt: Date | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('course_assignments')
export class CourseAssignment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column() courseSlug: string;
  @Column({ type: 'varchar', nullable: true }) topicId: string | null;
  @Column() title: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ type: 'int', default: 100 }) totalMarks: number;
  @Column({ type: 'int', default: 40 }) passingMarks: number;
  @Column({ type: 'jsonb', default: () => "'[]'" }) questions: any[];
  @Column({ default: true }) published: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('assignment_submissions')
export class AssignmentSubmission {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column() assignmentId: string;
  @Index() @Column() userId: string;
  @Index() @Column() courseSlug: string;
  @Column({ type: 'varchar', nullable: true }) userName: string | null;
  @Column({ type: 'varchar', nullable: true }) userEmail: string | null;
  @Column({ type: 'jsonb' }) submissionData: any;
  @Column({ type: 'int', nullable: true }) score: number | null;
  @Column({ default: 'pending' }) status: string; // 'pending' | 'APPROVED' | 'VERIFIED' | 'passed' | 'failed' | 'graded'
  @Column({ type: 'varchar', nullable: true }) verifiedBy: string | null;
  @Column({ type: 'timestamptz', nullable: true }) reviewedAt: Date | null;
  @Column({ type: 'text', nullable: true }) feedback: string | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('assessment_attempts')
export class AssessmentAttempt {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column() courseSlug: string;
  @Index() @Column() userId: string;
  @Column({ type: 'varchar', nullable: true }) userName: string | null;
  @Column({ type: 'varchar', nullable: true }) userEmail: string | null;
  @Column({ type: 'int' }) score: number;
  @Column({ type: 'int' }) totalMarks: number;
  @Column({ type: 'int' }) percentage: number;
  @Column({ default: false }) passed: boolean;
  @Column({ type: 'jsonb', default: () => "'{}'" }) answers: Record<string, any>;
  @CreateDateColumn() createdAt: Date;
}

@Entity('student_queries')
export class StudentQuery {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column() userId: string;
  @Column({ type: 'varchar', nullable: true }) userName: string | null;
  @Column({ type: 'varchar', nullable: true }) userEmail: string | null;
  @Index() @Column({ type: 'varchar', nullable: true }) courseSlug: string | null;
  @Column({ default: 'general' }) category: string; // 'video' | 'assignment' | 'payment' | 'access' | 'general'
  @Column() subject: string;
  @Column({ type: 'text' }) message: string;
  @Column({ default: 'Pending' }) status: string; // 'Pending' | 'In Progress' | 'Resolved'
  @Column({ type: 'text', nullable: true }) adminReply: string | null;
  @Column({ type: 'timestamptz', nullable: true }) resolvedAt: Date | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('live_classes')
export class LiveClass {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ type: 'varchar', nullable: true }) courseSlug: string | null;
  @Column() title: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ type: 'timestamptz' }) scheduledAt: Date;
  @Column({ type: 'int', default: 60 }) durationMinutes: number;
  @Column() meetingUrl: string;
  @Column({ default: true }) isPublished: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('payments')
export class PaymentRecord {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column() userId: string;
  @Column({ type: 'varchar', nullable: true }) userEmail: string | null;
  @Column({ type: 'varchar', nullable: true }) userName: string | null;
  @Index() @Column({ type: 'varchar', nullable: true }) courseSlug: string | null;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) amount: number;
  @Column({ default: 'INR' }) currency: string;
  @Column({ default: 'success' }) status: string; // 'pending' | 'success' | 'failed' | 'refunded'
  @Column({ type: 'varchar', nullable: true }) paymentMethod: string | null;
  @Column({ type: 'varchar', nullable: true }) transactionId: string | null;
  @Column({ type: 'varchar', default: 'course' }) itemType: string; // 'course' | 'subscription'
  @CreateDateColumn() createdAt: Date;
}

@Entity('subscription_plans')
export class SubscriptionPlan {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) price: number;
  @Column({ type: 'int' }) durationDays: number;
  @Column({ default: true }) isActive: boolean;
  @Column({ type: 'jsonb', default: () => "'[]'" }) features: string[];
  @CreateDateColumn() createdAt: Date;
}

@Entity('user_subscriptions')
export class UserSubscription {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column() userId: string;
  @Column({ type: 'varchar', nullable: true }) userEmail: string | null;
  @Column({ type: 'varchar', nullable: true }) planName: string | null;
  @Column({ default: 'active' }) status: string;
  @Column({ type: 'timestamptz' }) startDate: Date;
  @Column({ type: 'timestamptz' }) expiryDate: Date;
  @Column({ type: 'varchar', nullable: true }) paymentId: string | null;
  @CreateDateColumn() createdAt: Date;
}

@Entity('course_playlists')
export class CoursePlaylist {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ type: 'varchar' }) courseId: string;
  @Index() @Column({ type: 'varchar' }) courseSlug: string;
  @Column() title: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ type: 'varchar', nullable: true }) thumbnailUrl: string | null;
  @Column({ type: 'int', default: 0 }) displayOrder: number;
  @Column({ type: 'boolean', default: false }) isTrending: boolean;
  @Column({ type: 'varchar', nullable: true, default: 'entrepreneurship' }) category: string | null;
  @Column({ type: 'varchar', nullable: true, default: 'Beginner' }) level: string | null;
  @Column({ type: 'text', nullable: true }) shortDescription: string | null;
  @Column({ type: 'boolean', default: true }) isFree: boolean;
  @Column({ type: 'jsonb', nullable: true }) learn: any | null;
  @Column({ type: 'jsonb', nullable: true }) requirements: any | null;
  @Column({ type: 'jsonb', nullable: true }) resources: any | null;
  @Column({ type: 'jsonb', nullable: true }) assessments: any | null;
  @Column({ type: 'jsonb', nullable: true }) assessmentSettings: Record<string, any> | null;
  @Index() @Column({ type: 'uuid', nullable: true }) createdBy: string | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;

  @OneToMany(() => CoursePlaylistVideo, (video) => video.playlist, { cascade: true })
  videos: CoursePlaylistVideo[];
}

@Entity('course_playlist_videos')
export class CoursePlaylistVideo {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ type: 'uuid' }) playlistId: string;

  @ManyToOne(() => CoursePlaylist, (pl) => pl.videos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playlistId' })
  playlist: CoursePlaylist;

  @Column() title: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column() youtubeUrl: string;
  @Column() youtubeVideoId: string;
  @Column({ type: 'varchar', nullable: true }) thumbnailUrl: string | null;
  @Column({ type: 'varchar', nullable: true }) duration: string | null;
  @Column({ type: 'int', default: 0 }) displayOrder: number;
  @Column({ type: 'jsonb', nullable: true, default: () => "'[]'" }) chapters: any | null;
  @Column({ type: 'varchar', nullable: true }) notesUrl: string | null;
  @Column({ type: 'varchar', nullable: true }) notesName: string | null;
  @Column({ type: 'varchar', nullable: true }) notesSize: string | null;
  @Column({ type: 'varchar', nullable: true }) notesExt: string | null;
  @Column({ type: 'jsonb', nullable: true }) assessments: any | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('video_tasks')
export class VideoTask {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ type: 'varchar' }) videoId: string;
  @Column({ type: 'varchar', nullable: true }) videoTitle: string | null;
  @Index() @Column({ type: 'varchar', nullable: true }) courseId: string | null;
  @Index() @Column({ type: 'varchar', nullable: true }) courseSlug: string | null;
  @Index() @Column({ type: 'varchar', nullable: true }) playlistId: string | null;
  @Column() title: string;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ type: 'text', nullable: true }) instructions: string | null;
  @Column({ type: 'timestamptz', nullable: true }) dueDate: Date | null;
  @Column({ type: 'varchar', nullable: true }) attachmentUrl: string | null;
  @Column({ type: 'varchar', nullable: true }) attachmentName: string | null;
  @Column({ type: 'varchar', nullable: true }) attachmentSize: string | null;
  @Column({ type: 'varchar', nullable: true }) attachmentExt: string | null;
  @Column({ type: 'varchar', nullable: true }) createdBy: string | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('video_task_assignments')
@Index(['taskId', 'userId'], { unique: true })
export class VideoTaskAssignment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ type: 'uuid' }) taskId: string;
  @Index() @Column({ type: 'uuid' }) userId: string;
  @Column({ default: 'pending' }) status: string; // 'pending' | 'submitted' | 'reviewed' | 'needs_revision'
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) assignedAt: Date;
  @Column({ type: 'timestamptz', nullable: true }) dueDate: Date | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('video_task_submissions')
export class VideoTaskSubmission {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ type: 'uuid' }) taskId: string;
  @Index() @Column({ type: 'uuid' }) userId: string;
  @Index() @Column({ type: 'uuid', nullable: true }) assignmentId: string | null;
  @Column({ type: 'text', nullable: true }) workDescription: string | null;
  @Column({ type: 'varchar', nullable: true }) fileUrl: string | null;
  @Column({ type: 'varchar', nullable: true }) fileName: string | null;
  @Column({ default: 'submitted' }) status: string; // 'submitted' | 'APPROVED' | 'VERIFIED' | 'reviewed' | 'needs_revision'
  @Column({ type: 'varchar', nullable: true }) verifiedBy: string | null;
  @Column({ type: 'text', nullable: true }) adminFeedback: string | null;
  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true }) marksObtained: number | null;
  @Column({ type: 'decimal', precision: 6, scale: 2, default: 100 }) maxMarks: number;
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) submittedAt: Date;
  @Column({ type: 'timestamptz', nullable: true }) reviewedAt: Date | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('user_login_logs')
export class UserLoginLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ type: 'uuid' }) userId: string;
  @Column({ type: 'varchar', nullable: true }) ipAddress: string | null;
  @Column({ type: 'varchar', nullable: true }) userAgent: string | null;
  @Column({ type: 'varchar', nullable: true }) device: string | null;
  @CreateDateColumn() loginAt: Date;
}

@Entity('user_video_watch_logs')
@Index(['userId', 'videoId'])
@Index(['userId', 'courseSlug'])
export class UserVideoWatchLog {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ type: 'uuid' }) userId: string;
  @Index() @Column({ type: 'varchar' }) videoId: string;
  @Index() @Column({ type: 'varchar', nullable: true }) sessionId: string | null;
  @Column({ type: 'varchar', nullable: true }) videoTitle: string | null;
  @Column({ type: 'varchar', nullable: true }) courseSlug: string | null;
  @Column({ type: 'varchar', nullable: true }) courseTitle: string | null;
  @Column({ type: 'varchar', nullable: true }) playlistTitle: string | null;
  @Column({ type: 'int', default: 0 }) watchTimeSec: number;
  @Column({ type: 'int', default: 0 }) maxWatchedSeconds: number;
  @Column({ type: 'int', default: 0 }) videoDurationSec: number;
  @Column({ type: 'int', default: 0 }) lastPositionSec: number;
  @Column({ type: 'int', default: 0 }) progressPercent: number;
  @Column({ type: 'boolean', default: false }) isCompleted: boolean;
  @Column({ type: 'int', default: 1 }) timesWatched: number;
  @CreateDateColumn() firstWatchedAt: Date;
  @UpdateDateColumn() lastWatchedAt: Date;
}

@Entity('admin_video_assignments')
@Index(['adminId', 'courseSlug', 'videoId'])
export class AdminVideoAssignment {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ type: 'uuid' }) adminId: string;
  @Index() @Column({ type: 'varchar' }) courseSlug: string;
  @Index() @Column({ type: 'uuid', nullable: true }) courseId: string | null;
  @Index() @Column({ type: 'uuid', nullable: true }) playlistId: string | null;
  @Index() @Column({ type: 'varchar', nullable: true }) videoId: string | null;
  @Column({ type: 'varchar', nullable: true }) videoTitle: string | null;
  @Column({ type: 'uuid', nullable: true }) assignedBy: string | null;
  @CreateDateColumn() createdAt: Date;
}

@Entity('course_certificates')
@Index(['userId', 'courseSlug'], { unique: true })
export class CourseCertificateEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index({ unique: true }) @Column({ type: 'varchar' }) certificateCode: string;
  @Index() @Column({ type: 'varchar' }) userId: string;
  @Column({ type: 'varchar', nullable: true }) userName: string | null;
  @Column({ type: 'varchar', nullable: true }) userEmail: string | null;
  @Index() @Column({ type: 'varchar', nullable: true }) courseId: string | null;
  @Index() @Column({ type: 'varchar' }) courseSlug: string;
  @Column({ type: 'varchar' }) courseTitle: string;
  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }) completedAt: Date;
  @Column({ type: 'varchar', default: 'VERIFIED' }) verificationStatus: string;
  @Column({ type: 'varchar', nullable: true }) projectTitle: string | null;
  @Column({ type: 'varchar', nullable: true }) projectUrl: string | null;
  @Column({ type: 'jsonb', nullable: true, default: () => "'{}'" }) metadata: Record<string, any> | null;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

export const ALL_ENTITIES = [
  ContactMessage, Volunteer, EventEntity, WorkshopRegistration,
  DonationPledge, NewsletterSubscriber, NewsletterBroadcast, GalleryItem, SiteSetting, User,
  CourseView, CourseEntity, CourseRating, CourseEnrollment,
  CourseProgress, CourseAssignment, AssignmentSubmission, AssessmentAttempt,
  StudentQuery, LiveClass, PaymentRecord, SubscriptionPlan, UserSubscription,
  CoursePlaylist, CoursePlaylistVideo,
  VideoTask, VideoTaskAssignment, VideoTaskSubmission,
  UserLoginLog, UserVideoWatchLog,
  AdminVideoAssignment,
  CourseCertificateEntity,
];



