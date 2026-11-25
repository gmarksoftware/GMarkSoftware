import { BadRequestException, Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { AuthService } from '../auth/auth.service';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly authService: AuthService,
  ) { }

  /**
   * Public course Excel template download.
   * Uses the exact same single source of truth generator as Admin import/export.
   */
  @Get('template')
  async downloadTemplate(@Res() res: Response) {
    const buffer = this.coursesService.generateTemplateBuffer();
    const filename = 'gramguru_course_template.xlsx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }

  /** Public course catalogue. Returns active courses, optionally filtered by category, search, level, price, status, rating, sort. */
  @Get()
  async getPublicCourses(
    @Query('category') category?: string,
    @Query('search') search?: string,
    @Query('level') level?: string,
    @Query('price') price?: string,
    @Query('status') status?: string,
    @Query('rating') rating?: string,
    @Query('sort') sort?: string,
  ) {
    return this.coursesService.findAllPublic({ category, search, level, price, status, rating, sort });
  }

  /**
   * Downloads official courses export as an .xlsx spreadsheet.
   */
  @Get('download-excel')
  async downloadAllCoursesExcel(@Res() res: Response) {
    const buffer = await this.coursesService.generateExportBuffer();
    const today = new Date().toISOString().split('T')[0];
    const filename = `gramguru_courses_${today}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }

  /**
   * Downloads specific course spreadsheet as .xlsx attachment.
   */
  @Get(':slug/download-excel')
  async downloadCourseExcel(@Param('slug') slug: string, @Res() res: Response) {
    const course = await this.coursesService.findOneBySlug(slug);
    if (!course) {
      throw new BadRequestException(`Course with slug '${slug}' not found`);
    }
    const buffer = this.coursesService.generateSingleCourseExcelBuffer(course);
    const filename = `${course.slug || 'course'}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }

  /**
   * Returns parsed Excel sheet data for an existing course.
   * Enables webpage viewing as readable HTML tables with multi-sheet support.
   */
  @Get(':slug/excel-data')
  async getCourseExcelData(@Param('slug') slug: string) {
    return this.coursesService.getCourseExcelSheets(slug);
  }

  /**
   * Get ratings and reviews for a specific course.
   * If caller is logged in, includes their specific rating.
   */
  @Get(':slug/ratings')
  async getCourseRatings(@Param('slug') slug: string, @Req() req: any) {
    let userId: string | undefined = undefined;
    try {
      const header = String(req.headers['authorization'] ?? '');
      const match = header.match(/^Bearer\s+(.+)$/i);
      let token = match ? match[1].trim() : '';
      if (!token && req.headers.cookie) {
        const cookieMatch = String(req.headers.cookie).match(/(?:^|;\s*)(?:token|gramguru_token|auth_token)=([^;]+)/);
        if (cookieMatch) token = decodeURIComponent(cookieMatch[1].trim());
      }
      if (token) {
        const user = await this.authService.userFromToken(token);
        if (user) userId = user.id;
      }
    } catch {
      // ignore guest auth check
    }
    return this.coursesService.getCourseRatings(slug, userId);
  }

  /**
   * Submit or update a rating and review for a course.
   * Requires authenticated user.
   */
  @Post(':slug/rate')
  @UseGuards(AuthGuard)
  async submitRating(
    @Param('slug') slug: string,
    @Body() body: { rating: number; review?: string },
    @Req() req: any,
  ) {
    return this.coursesService.submitCourseRating(slug, req.user, body);
  }

  /**
   * Enroll a user in a course (direct endpoint).
   * Accepts { slug, userId, email, fullName } in body or token in header.
   */
  @Post('enroll')
  async enrollDirect(
    @Body() body: { slug: string; userId?: string; email?: string; fullName?: string },
    @Req() req: any,
  ) {
    if (!body?.slug) {
      throw new BadRequestException('Course slug is required');
    }
    return this.enrollInCourse(body.slug, body, req);
  }

  /**
   * Check if a user is enrolled in a course.
   */
  @Get(':slug/is-enrolled')
  async isEnrolled(
    @Param('slug') slug: string,
    @Query('userId') queryUserId: string,
    @Req() req: any,
  ) {
    let userId = queryUserId;
    if (!userId) {
      try {
        const header = String(req.headers['authorization'] ?? '');
        const match = header.match(/^Bearer\s+(.+)$/i);
        let token = match ? match[1].trim() : '';
        if (!token && req.headers.cookie) {
          const cookieMatch = String(req.headers.cookie).match(/(?:^|;\s*)(?:token|gramguru_token|auth_token)=([^;]+)/);
          if (cookieMatch) token = decodeURIComponent(cookieMatch[1].trim());
        }
        if (token) {
          const user = await this.authService.userFromToken(token);
          if (user) userId = user.id;
        }
      } catch { }
    }
    if (!userId) return { enrolled: false };
    const enrolled = await this.coursesService.isUserEnrolled(slug, userId);
    return { enrolled };
  }

  /**
   * Enroll the caller or provided user in a specific course.
   */
  @Post(':slug/enroll')
  async enrollInCourse(
    @Param('slug') slug: string,
    @Body() body: { userId?: string; email?: string; fullName?: string },
    @Req() req: any,
  ) {
    let userId = body?.userId;
    let userEmail = body?.email;
    let userName = body?.fullName;

    if (!userId) {
      try {
        const header = String(req.headers['authorization'] ?? '');
        const match = header.match(/^Bearer\s+(.+)$/i);
        let token = match ? match[1].trim() : '';
        if (!token && req.headers.cookie) {
          const cookieMatch = String(req.headers.cookie).match(/(?:^|;\s*)(?:token|gramguru_token|auth_token)=([^;]+)/);
          if (cookieMatch) token = decodeURIComponent(cookieMatch[1].trim());
        }
        if (token) {
          const user = await this.authService.userFromToken(token);
          if (user) {
            userId = user.id;
            userEmail = userEmail || user.email;
            userName = userName || user.fullName;
          }
        }
      } catch { }
    }

    if (!userId) {
      throw new BadRequestException('User ID or authentication is required to enroll in a course.');
    }

    return this.coursesService.enrollUser(slug, userId, userEmail, userName);
  }

  /**
   * Protected course video stream & access endpoint.
   * Requires authenticated user. Returns 401 Unauthorized if unauthenticated.
   */
  @Get(':slug/video')
  @UseGuards(AuthGuard)
  async getCourseVideo(@Param('slug') slug: string, @Req() req: any) {
    return this.coursesService.getCourseVideoAccess(slug, req.user);
  }

  @Get(':slug/watch')
  @UseGuards(AuthGuard)
  async getCourseWatch(@Param('slug') slug: string, @Req() req: any) {
    return this.coursesService.getCourseVideoAccess(slug, req.user);
  }

  @Get(':slug/video-access')
  @UseGuards(AuthGuard)
  async getCourseVideoAccessAlias(@Param('slug') slug: string, @Req() req: any) {
    return this.coursesService.getCourseVideoAccess(slug, req.user);
  }

  @Get(':slug/lessons/:lessonIndex/video')
  @UseGuards(AuthGuard)
  async getLessonVideo(@Param('slug') slug: string, @Param('lessonIndex') lessonIndex: string, @Req() req: any) {
    return this.coursesService.getLessonVideoAccess(slug, parseInt(lessonIndex, 10), req.user);
  }

  /** Course detail lookup by unique slug. Public browsing permitted; authenticated requests receive full video stream access. */
  @Get(':slug')
  async getCourseBySlug(@Param('slug') slug: string, @Req() req: any) {
    let isAuthenticated = false;
    try {
      const header = String(req?.headers?.['authorization'] ?? '');
      const match = header.match(/^Bearer\s+(.+)$/i);
      let token = match ? match[1].trim() : '';
      if (!token && req?.headers?.cookie) {
        const cookieMatch = String(req.headers.cookie).match(/(?:^|;\s*)(?:token|gramguru_token|auth_token)=([^;]+)/);
        if (cookieMatch) token = decodeURIComponent(cookieMatch[1].trim());
      }
      if (token) {
        const user = await this.authService.userFromToken(token);
        if (user) isAuthenticated = true;
      }
    } catch { }

    return this.coursesService.findOneBySlug(slug, isAuthenticated);
  }
}
