import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CommonModule } from '../common/common.module';
import {
  CourseEntity,
  CourseEnrollment,
  CoursePlaylist,
  CoursePlaylistVideo,
  User,
  VideoTask,
  VideoTaskAssignment,
  VideoTaskSubmission,
} from '../entities';
import { TasksAdminController } from './tasks-admin.controller';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VideoTask,
      VideoTaskAssignment,
      VideoTaskSubmission,
      User,
      CoursePlaylistVideo,
      CoursePlaylist,
      CourseEntity,
      CourseEnrollment,
    ]),
    AuthModule,
    CommonModule,
  ],
  controllers: [TasksAdminController, TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}

