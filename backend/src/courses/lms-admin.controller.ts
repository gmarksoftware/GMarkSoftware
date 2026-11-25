import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../site/admin.guard';
import { LmsService } from './lms.service';
import { CoursesService } from './courses.service';

@UseGuards(AdminGuard)
@Controller('admin')
export class LmsAdminController {
  constructor(
    private readonly lmsService: LmsService,
    private readonly coursesService: CoursesService,
  ) {}

  // ==========================================
  // LMS Analytics & Reports
  // ==========================================
  @Get('lms/analytics')
  async getAnalytics() {
    return this.lmsService.getAdminLmsAnalytics();
  }

  @Get('lms/reports/students')
  async getStudentReports() {
    return this.lmsService.getAdminStudentReports();
  }

  @Get('lms/reports/courses')
  async getCourseReports() {
    return this.lmsService.getAdminCourseReports();
  }

  // ==========================================
  // Student Support Queries Management
  // ==========================================
  @Get('queries')
  async getQueries(@Query('status') status?: string, @Req() req?: any) {
    return this.lmsService.getAdminQueries(status, req?.user);
  }

  @Put('queries/:id')
  async replyQuery(
    @Param('id') id: string,
    @Body() body: { reply: string; status?: string },
  ) {
    return this.lmsService.replyAndResolveQuery(id, body.reply, body.status || 'Answered');
  }

  @Patch('queries/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.lmsService.updateQueryStatus(id, body.status);
  }

  @Delete('queries/:id')
  async deleteQuery(@Param('id') id: string) {
    return this.lmsService.deleteQuery(id);
  }

  // ==========================================
  // Live Classes Management
  // ==========================================
  @Get('live-classes')
  async getLiveClasses() {
    return this.lmsService.getAdminLiveClasses();
  }

  @Post('live-classes')
  async createLiveClass(
    @Body()
    body: {
      title: string;
      description?: string;
      courseSlug?: string;
      scheduledAt: string;
      durationMinutes?: number;
      meetingUrl: string;
      isPublished?: boolean;
    },
  ) {
    return this.lmsService.createLiveClass(body);
  }

  @Put('live-classes/:id')
  async updateLiveClass(@Param('id') id: string, @Body() body: any) {
    return this.lmsService.updateLiveClass(id, body);
  }

  @Delete('live-classes/:id')
  async deleteLiveClass(@Param('id') id: string) {
    return this.lmsService.deleteLiveClass(id);
  }

  // ==========================================
  // Assignments Management
  // ==========================================
  @Get('lms/assignments')
  async getAssignments(@Query('courseSlug') courseSlug?: string) {
    return this.lmsService.getAdminAssignments(courseSlug);
  }

  @Post('lms/assignments')
  async createAssignment(
    @Body()
    body: {
      courseSlug: string;
      topicId?: string;
      title: string;
      description?: string;
      totalMarks?: number;
      passingMarks?: number;
      questions?: any[];
    },
  ) {
    return this.lmsService.createAssignment(body);
  }

  @Get('lms/submissions')
  async getSubmissions(@Query('assignmentId') assignmentId?: string) {
    return this.lmsService.getAdminSubmissions(assignmentId);
  }

  @Put('lms/submissions/:id/grade')
  async gradeSubmission(
    @Param('id') id: string,
    @Body() body: { score: number; status: string; feedback?: string },
  ) {
    return this.lmsService.gradeSubmission(id, body);
  }

  // ==========================================
  // LMS Payments
  // ==========================================
  @Get('lms/payments')
  async getPayments() {
    return this.lmsService.getAdminPayments();
  }

  // ==========================================
  // Course Ratings & Reviews Management
  // ==========================================
  @Get('reviews')
  async getReviews(
    @Query('courseId') courseId?: string,
    @Query('rating') rating?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.coursesService.getAdminReviews({ courseId, rating, status, search });
  }

  @Get('reviews/summary')
  async getReviewsSummary(@Query('courseId') courseId?: string) {
    return this.coursesService.getAdminReviewsSummary(courseId);
  }

  @Patch('reviews/:id/status')
  async patchReviewStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.coursesService.updateAdminReviewStatus(id, status);
  }

  @Put('reviews/:id/status')
  async putReviewStatus(
    @Param('id') id: string,
    @Body('status') status: string,
  ) {
    return this.coursesService.updateAdminReviewStatus(id, status);
  }
}
