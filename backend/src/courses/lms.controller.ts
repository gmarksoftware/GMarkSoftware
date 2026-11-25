import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { LmsService } from './lms.service';

@Controller()
export class LmsController {
  constructor(private readonly lmsService: LmsService) {}

  // ==========================================
  // Student Profile & Learning Purpose
  // ==========================================
  @Get('lms/profile')
  @UseGuards(AuthGuard)
  async getProfile(@Req() req: any) {
    return this.lmsService.getStudentProfile(req.user.id);
  }

  @Put('lms/profile')
  @UseGuards(AuthGuard)
  async updateProfile(
    @Req() req: any,
    @Body() body: { fullName?: string; phone?: string; learningPurpose?: string; interests?: string[] },
  ) {
    return this.lmsService.updateStudentProfile(req.user.id, body);
  }

  // ==========================================
  // Enrolled Courses & Learning Dashboard
  // ==========================================
  @Get('courses/my/learning')
  @UseGuards(AuthGuard)
  async getMyLearning(@Req() req: any) {
    return this.lmsService.getMyLearningCourses(req.user.id);
  }

  @Delete('courses/my/learning/:slug')
  @UseGuards(AuthGuard)
  async deleteMyLearningCourse(@Param('slug') slug: string, @Req() req: any) {
    return this.lmsService.deleteMyLearningCourse(slug, req.user.id);
  }

  // Legacy/convenience alias matching frontend
  @Get('lms/my-learning')
  @UseGuards(AuthGuard)
  async getMyLearningAlias(@Req() req: any) {
    return this.lmsService.getMyLearningCourses(req.user.id);
  }

  @Get('lms/activity/my')
  @UseGuards(AuthGuard)
  async getMyActivity(@Req() req: any) {
    return this.lmsService.getMyRecentActivity(req.user.id);
  }

  @Get('courses/my/activity')
  @UseGuards(AuthGuard)
  async getMyActivityAlias(@Req() req: any) {
    return this.lmsService.getMyRecentActivity(req.user.id);
  }

  // ==========================================
  // Course Validity
  // ==========================================
  @Get('courses/:slug/validity')
  @UseGuards(AuthGuard)
  async getCourseValidity(@Param('slug') slug: string, @Req() req: any) {
    return this.lmsService.getEnrollmentValidity(slug, req.user.id);
  }

  // ==========================================
  // Course Progress Tracking
  // ==========================================
  @Get('courses/:slug/progress')
  @UseGuards(AuthGuard)
  async getCourseProgress(@Param('slug') slug: string, @Req() req: any) {
    return this.lmsService.getStudentProgress(slug, req.user.id);
  }

  @Post('courses/:slug/progress')
  @UseGuards(AuthGuard)
  async saveCourseProgress(
    @Param('slug') slug: string,
    @Req() req: any,
    @Body()
    body: {
      lessonIndex?: number;
      lessonTitle?: string;
      markLessonDone?: boolean;
      checkpointKey?: string;
      checkpointPassed?: boolean;
      watchTimeDeltaSec?: number;
      watchTimeSec?: number;
      watchedSeconds?: number;
      durationSeconds?: number;
      ended?: boolean;
      lastPositionSec?: number;
      positionSec?: number;
      sessionId?: string;
      isNewSession?: boolean;
      videoId?: string;
      chapterId?: string;
    },
  ) {
    return this.lmsService.saveStudentProgress(slug, req.user.id, body);
  }

  @Post('lms/watch-log')
  @UseGuards(AuthGuard)
  async recordWatchLog(@Req() req: any, @Body() body: any) {
    return this.lmsService.recordVideoWatch(req.user.id, body);
  }

  // ==========================================
  // Assessments / Quizzes
  // ==========================================
  @Post('courses/:slug/assessments/submit')
  @UseGuards(AuthGuard)
  async submitAssessment(
    @Param('slug') slug: string,
    @Req() req: any,
    @Body() body: { answers: Record<string, any>; score: number; totalMarks: number },
  ) {
    return this.lmsService.submitAssessment(slug, req.user, body);
  }

  @Get('courses/:slug/assessments/my-attempts')
  @UseGuards(AuthGuard)
  async getMyAssessmentAttempts(@Param('slug') slug: string, @Req() req: any) {
    return this.lmsService.getMyAssessmentAttempts(slug, req.user.id);
  }

  // ==========================================
  // Assignments
  // ==========================================
  @Get('courses/:slug/assignments')
  async getCourseAssignments(@Param('slug') slug: string) {
    return this.lmsService.getCourseAssignments(slug);
  }

  @Post('courses/:slug/assignments/:id/submit')
  @UseGuards(AuthGuard)
  async submitAssignment(
    @Param('id') id: string,
    @Req() req: any,
    @Body() body: { submissionData: any },
  ) {
    return this.lmsService.submitAssignment(id, req.user, body.submissionData);
  }

  @Get('courses/:slug/assignments/my-submissions')
  @UseGuards(AuthGuard)
  async getMyAssignmentSubmissions(@Param('slug') slug: string, @Req() req: any) {
    return this.lmsService.getMyAssignmentSubmissions(req.user.id, slug);
  }

  // ==========================================
  // Student Support Queries / Tickets
  // ==========================================
  @Post('queries')
  @UseGuards(AuthGuard)
  async createQuery(
    @Req() req: any,
    @Body() body: { subject: string; message: string; category?: string; courseSlug?: string },
  ) {
    return this.lmsService.createStudentQuery(req.user, body);
  }

  @Get('queries/my')
  @UseGuards(AuthGuard)
  async getMyQueries(@Req() req: any) {
    return this.lmsService.getMyQueries(req.user.id);
  }

  // ==========================================
  // Live Classes
  // ==========================================
  @Get('live-classes')
  async getLiveClasses(@Query('courseSlug') courseSlug?: string) {
    return this.lmsService.getUpcomingLiveClasses(courseSlug);
  }

  // ==========================================
  // Subscriptions & Payments
  // ==========================================
  @Get('subscriptions/plans')
  async getSubscriptionPlans() {
    return this.lmsService.getSubscriptionPlans();
  }

  @Get('subscriptions/my')
  @UseGuards(AuthGuard)
  async getMySubscription(@Req() req: any) {
    return this.lmsService.getUserSubscription(req.user.id);
  }

  @Post('payments/checkout')
  @UseGuards(AuthGuard)
  async processCheckout(
    @Req() req: any,
    @Body()
    body: {
      itemType: 'course' | 'subscription';
      courseSlug?: string;
      planId?: string;
      paymentMethod?: string;
      transactionId?: string;
    },
  ) {
    return this.lmsService.processCheckout(req.user, body);
  }

  // ==========================================
  // Course Completion & Certificates
  // ==========================================
  @Get('courses/:slug/certificate-status')
  @UseGuards(AuthGuard)
  async getCertificateStatus(@Param('slug') slug: string, @Req() req: any) {
    return this.lmsService.getCourseCertificateStatus(req.user.id, slug);
  }

  @Get('lms/certificates/my')
  @UseGuards(AuthGuard)
  async getMyCertificates(@Req() req: any) {
    return this.lmsService.getMyCertificates(req.user.id);
  }
}
