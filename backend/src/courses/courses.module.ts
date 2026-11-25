import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
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
} from '../entities';
import { AdminGuard } from '../site/admin.guard';
import { CourseAdminController } from './course-admin.controller';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { LmsAdminController } from './lms-admin.controller';
import { LmsController } from './lms.controller';
import { LmsService } from './lms.service';
import { PlaylistAdminController } from './playlists-admin.controller';
import { PlaylistsController } from './playlists.controller';
import { PlaylistsService } from './playlists.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CourseEntity,
      CourseCertificateEntity,
      CourseRating,
      CourseEnrollment,
      CourseProgress,
      CourseAssignment,
      AssignmentSubmission,
      AssessmentAttempt,
      StudentQuery,
      LiveClass,
      PaymentRecord,
      SubscriptionPlan,
      UserSubscription,
      User,
      CourseView,
      CoursePlaylist,
      CoursePlaylistVideo,
    ]),
    AuthModule,
  ],
  controllers: [
    CoursesController,
    CourseAdminController,
    LmsController,
    LmsAdminController,
    PlaylistsController,
    PlaylistAdminController,
  ],
  providers: [CoursesService, LmsService, PlaylistsService, AdminGuard],
  exports: [CoursesService, LmsService, PlaylistsService],
})
export class CoursesModule {}

