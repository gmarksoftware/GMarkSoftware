import { Transform, Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsDateString, IsEmail, IsIn, IsInt, IsNumber, IsObject, IsOptional, IsString, IsUUID,
  Matches, Max, MaxLength, Min, MinLength, ValidateNested,
} from 'class-validator';
import { CATEGORIES, LABEL_TO_CATEGORY, PHONE_REGEX, VOLUNTEER_INTERESTS } from '../constants';

const trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
const emptyToUndef = () => Transform(({ value }) => (value === '' || value === null ? undefined : value));
const PHONE_MSG = 'mobile must be a valid phone number';

export class ContactDto {
  @trim() @IsString() @MinLength(2) @MaxLength(100) fullName: string;
  @trim() @Matches(PHONE_REGEX, { message: PHONE_MSG }) mobile: string;
  @trim() @IsEmail() @MaxLength(150) email: string;
  @trim() @IsString() @MinLength(2) @MaxLength(150) subject: string;
  @trim() @IsString() @MinLength(5) @MaxLength(3000) message: string;
}

export class VolunteerDto {
  @trim() @IsString() @MinLength(2) @MaxLength(100) fullName: string;
  @trim() @Matches(PHONE_REGEX, { message: PHONE_MSG }) mobile: string;
  @trim() @IsEmail() @MaxLength(150) email: string;
  @IsIn(VOLUNTEER_INTERESTS as unknown as string[]) interest: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(2000) message?: string;
}

export class WorkshopRegistrationDto {
  @trim() @IsString() @MinLength(2) @MaxLength(100) fullName: string;
  @trim() @Matches(PHONE_REGEX, { message: PHONE_MSG }) mobile: string;
  @emptyToUndef() @IsOptional() @trim() @IsEmail() @MaxLength(150) email?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(150) place?: string;
  @emptyToUndef() @IsOptional() @IsUUID() eventId?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(2000) message?: string;
}

export class DonationPledgeDto {
  @trim() @IsString() @MinLength(2) @MaxLength(100) fullName: string;
  @trim() @Matches(PHONE_REGEX, { message: PHONE_MSG }) mobile: string;
  @emptyToUndef() @IsOptional() @trim() @IsEmail() @MaxLength(150) email?: string;
  // '' / null -> undefined (field skipped); otherwise coerce the form string to a number.
  @Transform(({ value }) => (value === '' || value === null || value === undefined ? undefined : Number(value)))
  @IsOptional() @IsInt() @Min(1) @Max(100000000) amount?: number;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(2000) message?: string;
}

export class NewsletterDto {
  @trim() @IsEmail() @MaxLength(150) email: string;
}

export class EventDto {
  @trim() @IsString() @MinLength(2) @MaxLength(200) titleEn: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(200) titleMr?: string;
  @emptyToUndef() @IsOptional() @IsString() @MaxLength(3000) descriptionEn?: string;
  @emptyToUndef() @IsOptional() @IsString() @MaxLength(3000) descriptionMr?: string;
  @IsIn(CATEGORIES as unknown as string[]) category: string;
  @IsDateString() startsAt: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(200) location?: string;
  @IsOptional() @IsBoolean() registrationOpen?: boolean;
  @IsOptional() @IsBoolean() published?: boolean;
}

export class SettingDto {
  @IsObject() value: Record<string, unknown>;
}

const normalizeCategory = () =>
  Transform(({ value }) => {
    if (typeof value !== 'string') return value;
    const clean = value.trim().toLowerCase();
    return LABEL_TO_CATEGORY[clean] || clean;
  });

export class GalleryUploadDto {
  @normalizeCategory() @IsIn(CATEGORIES as unknown as string[]) category: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(200) captionEn?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(200) captionMr?: string;
}

export class GalleryUpdateDto {
  @IsOptional() @normalizeCategory() @IsIn(CATEGORIES as unknown as string[]) category?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(200) captionEn?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(200) captionMr?: string;
}

export class NewsletterBroadcastDto {
  @trim() @IsString() @MinLength(2) @MaxLength(200) subject: string;
  @trim() @IsString() @MinLength(5) @MaxLength(5000) body: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(500) resourceLink?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(200) resourceTitle?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(500) attachmentPath?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(255) attachmentName?: string;
}

export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).{8,}$/;
export const PASSWORD_MSG = 'Password must be at least 8 characters and contain at least one uppercase letter (A-Z), one lowercase letter (a-z), one number (0-9), and one special character.';

export class RegisterDto {
  @trim() @IsString() @MinLength(2) @MaxLength(100) fullName: string;
  @trim() @IsEmail() @MaxLength(150) email: string;
  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MSG })
  @MaxLength(100)
  password: string;
}

export class LoginDto {
  @trim() @IsEmail() @MaxLength(150) email: string;
  @IsString() @MinLength(1) @MaxLength(100) password: string;
}

export class GoogleAuthDto {
  @trim() @IsEmail() @MaxLength(150) email: string;
  @trim() @IsString() @MinLength(1) @MaxLength(100) fullName: string;
  @emptyToUndef() @IsOptional() @IsString() @MinLength(6) @MaxLength(100) password?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() googleId?: string;
}

export class TrackCourseViewDto {
  @Transform(({ value }) => (value === '' || value === null || value === undefined ? undefined : String(value).trim()))
  @emptyToUndef() @IsOptional() @IsString() @MaxLength(150) slug?: string;

  @Transform(({ value }) => (value === '' || value === null || value === undefined ? undefined : String(value).trim()))
  @emptyToUndef() @IsOptional() @IsString() @MaxLength(150) courseId?: string;

  @Transform(({ value }) => (value === '' || value === null || value === undefined ? undefined : Number(value)))
  @IsOptional() @IsInt() @Min(0) timeSpent?: number;

  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(150) userId?: string;

  @emptyToUndef() @IsOptional() @trim() @IsString() sessionId?: string;
}

export class CreateCourseDto {
  @trim() @IsString() @MinLength(2) @MaxLength(200) courseName: string;
  @trim() @IsString() @MinLength(2) @MaxLength(200) @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug must be lowercase letters, numbers, and hyphens' }) slug: string;
  @trim() @IsString() @MinLength(2) @MaxLength(100) category: string;
  @trim() @IsString() @MinLength(2) @MaxLength(50) level: string;
  @trim() @IsString() @MinLength(5) @MaxLength(5000) shortDescription: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(50) status?: string;
  @IsOptional() @IsBoolean() trending?: boolean;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(100) icon?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(500) image?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(200) gradient?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(500) videoUrl?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(500) youtubeUrl?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(50) youtubeVideoId?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(1000) thumbnailUrl?: string;
  @IsOptional() lessons?: any[];
  @IsOptional() sections?: any[];
  @IsOptional() topics?: any[];
  @IsOptional() learn?: string[];
  @IsOptional() requirements?: string[];
  @IsOptional() resources?: any[];
  @IsOptional() price?: number;
  @IsOptional() isFree?: boolean;
  @IsOptional() validityDays?: number;
  @emptyToUndef() @IsOptional() @trim() @IsString() description?: string;
  @IsOptional() allowSubscription?: boolean;
  @IsOptional() duration?: string;
  @IsOptional() certificateEnabled?: boolean;
  @IsOptional() @IsBoolean() strictNonSkippable?: boolean;
  @IsOptional() @IsBoolean() requireProjectForCertificate?: boolean;
  @IsOptional() assessments?: any[];
  @IsOptional() assessmentSettings?: Record<string, any>;
  @IsOptional() playlist?: any;
  @IsOptional() playlistVideos?: any[];
}

export class CourseSectionDto {
  @IsOptional() @IsString() id?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() displayOrder?: number;
}

export class UpdateCourseDto {
  @emptyToUndef() @IsOptional() @trim() @IsString() @MinLength(2) @MaxLength(200) courseName?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MinLength(2) @MaxLength(200) @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'slug must be lowercase letters, numbers, and hyphens' }) slug?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MinLength(2) @MaxLength(100) category?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MinLength(2) @MaxLength(50) level?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MinLength(5) @MaxLength(5000) shortDescription?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() description?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(50) status?: string;
  @IsOptional() @IsBoolean() trending?: boolean;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(100) icon?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(500) image?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(200) gradient?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(500) videoUrl?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(500) youtubeUrl?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(50) youtubeVideoId?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(1000) thumbnailUrl?: string;
  @IsOptional() lessons?: any[];
  @IsOptional() sections?: any[];
  @IsOptional() topics?: any[];
  @IsOptional() learn?: string[];
  @IsOptional() requirements?: string[];
  @IsOptional() resources?: any[];
  @IsOptional() price?: number;
  @IsOptional() isFree?: boolean;
  @IsOptional() validityDays?: number;
  @IsOptional() allowSubscription?: boolean;
  @IsOptional() duration?: string;
  @IsOptional() certificateEnabled?: boolean;
  @IsOptional() @IsBoolean() strictNonSkippable?: boolean;
  @IsOptional() @IsBoolean() requireProjectForCertificate?: boolean;
  @IsOptional() assessments?: any[];
  @IsOptional() assessmentSettings?: Record<string, any>;
  @IsOptional() playlist?: any;
  @IsOptional() playlistVideos?: any[];
}

export class ImportCoursesDto {
  @IsOptional()
  courses?: Array<{
    courseName: string;
    slug: string;
    category: string;
    level: string;
    shortDescription: string;
    status?: string;
    trending?: boolean;
  }>;
}

export class CreatePlaylistVideoItemDto {
  @trim() @IsString() @MinLength(1) @MaxLength(300) title: string;
  @trim() @IsString() youtubeUrl: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(2000) description?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(1000) thumbnailUrl?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(50) duration?: string;
  @IsOptional() @IsInt() displayOrder?: number;
  @IsOptional() chapters?: any[];
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(1000) notesUrl?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(300) notesName?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(50) notesSize?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(20) notesExt?: string;
  @IsOptional() assessments?: any[];
}

export class CreatePlaylistDto {
  @emptyToUndef() @IsOptional() @trim() @IsString() courseId?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() courseSlug?: string;
  @trim() @IsString() @MinLength(2) @MaxLength(255) title: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(5000) description?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(1000) thumbnailUrl?: string;
  @IsOptional() @IsInt() displayOrder?: number;
  @IsOptional() @IsBoolean() isTrending?: boolean;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(100) category?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(50) level?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(2000) shortDescription?: string;
  @IsOptional() @IsBoolean() isFree?: boolean;
  @IsOptional() learn?: any[];
  @IsOptional() requirements?: any[];
  @IsOptional() resources?: any[];
  @IsOptional() assessments?: any[];
  @IsOptional() assessmentSettings?: Record<string, any>;
  @IsOptional() videos?: CreatePlaylistVideoItemDto[];
}

export class UpdatePlaylistDto {
  @emptyToUndef() @IsOptional() @trim() @IsString() courseId?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() courseSlug?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MinLength(2) @MaxLength(255) title?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(5000) description?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(1000) thumbnailUrl?: string;
  @IsOptional() @IsInt() displayOrder?: number;
  @IsOptional() @IsBoolean() isTrending?: boolean;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(100) category?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(50) level?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(2000) shortDescription?: string;
  @IsOptional() @IsBoolean() isFree?: boolean;
  @IsOptional() learn?: any[];
  @IsOptional() requirements?: any[];
  @IsOptional() resources?: any[];
  @IsOptional() assessments?: any[];
  @IsOptional() assessmentSettings?: Record<string, any>;
  @IsOptional() videos?: CreatePlaylistVideoItemDto[];
}

export class AddPlaylistVideoDto {
  @trim() @IsString() @MinLength(1) @MaxLength(300) title: string;
  @trim() @IsString() youtubeUrl: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(2000) description?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(1000) thumbnailUrl?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(50) duration?: string;
  @IsOptional() @IsInt() displayOrder?: number;
  @IsOptional() chapters?: any[];
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(1000) notesUrl?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(300) notesName?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(50) notesSize?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(20) notesExt?: string;
  @IsOptional() assessments?: any[];
}

export class UpdatePlaylistVideoDto {
  @emptyToUndef() @IsOptional() @trim() @IsString() @MinLength(1) @MaxLength(300) title?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() youtubeUrl?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(2000) description?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(1000) thumbnailUrl?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(50) duration?: string;
  @IsOptional() @IsInt() displayOrder?: number;
  @IsOptional() chapters?: any[];
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(1000) notesUrl?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(300) notesName?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(50) notesSize?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(20) notesExt?: string;
  @IsOptional() assessments?: any[];
}

export class ReorderPlaylistVideosDto {
  @IsString({ each: true }) videoIds: string[];
}

export class CreateVideoTaskDto {
  @trim() @IsString() @MinLength(2) @MaxLength(300) title: string;
  @trim() @IsString() videoId: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(500) videoTitle?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() courseId?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() courseSlug?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() playlistId?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(5000) description?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(5000) instructions?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() dueDate?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(1000) attachmentUrl?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(300) attachmentName?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(100) attachmentSize?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(50) attachmentExt?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() assignToType?: 'all' | 'selected';
  @IsOptional() @IsArray() assignedUserIds?: string[];
}

export class UpdateVideoTaskDto {
  @emptyToUndef() @IsOptional() @trim() @IsString() @MinLength(2) @MaxLength(300) title?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(5000) description?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(5000) instructions?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() dueDate?: string;
  @IsOptional() @trim() @IsString() @MaxLength(1000) attachmentUrl?: string;
  @IsOptional() @trim() @IsString() @MaxLength(300) attachmentName?: string;
  @IsOptional() @trim() @IsString() @MaxLength(100) attachmentSize?: string;
  @IsOptional() @trim() @IsString() @MaxLength(50) attachmentExt?: string;
  @IsOptional() @IsBoolean() removeAttachment?: boolean;
  @emptyToUndef() @IsOptional() @trim() @IsString() assignToType?: 'all' | 'selected';
  @IsOptional() @IsArray() assignedUserIds?: string[];
}

export class SubmitVideoTaskDto {
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(10000) workDescription?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(1000) fileUrl?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(300) fileName?: string;
}

export class ReviewVideoTaskSubmissionDto {
  @trim() @IsString() status: 'reviewed' | 'needs_revision';
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(5000) feedback?: string;
  @IsOptional() @IsNumber() @Min(0) marksObtained?: number | null;
  @IsOptional() @IsNumber() @Min(1) maxMarks?: number;
}

export class AdminVideoAssignmentItemDto {
  @trim() @IsString() @MinLength(1) @MaxLength(200) courseSlug: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(100) courseId?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(100) playlistId?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(200) videoId?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(500) videoTitle?: string;
}

export class CreateSubAdminDto {
  @trim() @IsString() @MinLength(2) @MaxLength(100) fullName: string;
  @trim() @IsEmail() @MaxLength(150) email: string;
  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MSG })
  @MaxLength(100)
  password: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(30) phone?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => AdminVideoAssignmentItemDto) assignments?: AdminVideoAssignmentItemDto[];
  @IsOptional() @IsArray() @IsString({ each: true }) assignedPlaylistIds?: string[];
}

export class UpdateSubAdminDto {
  @emptyToUndef() @IsOptional() @trim() @IsString() @MinLength(2) @MaxLength(100) fullName?: string;
  @emptyToUndef() @IsOptional() @trim() @IsString() @MaxLength(30) phone?: string;
  @emptyToUndef() @IsOptional() @IsString() @Matches(PASSWORD_REGEX, { message: PASSWORD_MSG }) @MaxLength(100) password?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => AdminVideoAssignmentItemDto) assignments?: AdminVideoAssignmentItemDto[];
  @IsOptional() @IsArray() @IsString({ each: true }) assignedPlaylistIds?: string[];
}

export class AssignAdminVideosDto {
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => AdminVideoAssignmentItemDto) assignments?: AdminVideoAssignmentItemDto[];
  @IsOptional() @IsArray() @IsString({ each: true }) assignedPlaylistIds?: string[];
}

export class UpdateSubAdminStatusDto {
  @IsBoolean() isActive: boolean;
}

export class UpdateUserRoleDto {
  @trim() @IsIn(['user', 'admin', 'super_admin']) role: string;
}

