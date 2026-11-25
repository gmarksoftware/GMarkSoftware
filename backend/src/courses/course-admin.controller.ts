import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage, memoryStorage } from 'multer';
import { join } from 'path';
import { randomUUID } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { AdminGuard } from '../site/admin.guard';
import { SuperAdminGuard } from '../site/super-admin.guard';
import { CreateCourseDto, ImportCoursesDto, UpdateCourseDto } from '../dto';
import { CoursesService } from './courses.service';
import { S3Service } from '../common/s3.service';

@UseGuards(AdminGuard)
@Controller('admin/courses')
export class CourseAdminController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly s3Service: S3Service,
  ) { }

  @Get()
  async listAllCourses(@Req() req: any) {
    return this.coursesService.findAllAdmin(req.user);
  }

  @Post()
  async createCourse(@Body() dto: CreateCourseDto, @Req() req: any) {
    return this.coursesService.create(dto, req.user);
  }

  @Put(':id')
  async updateCourse(@Param('id') id: string, @Body() dto: UpdateCourseDto, @Req() req: any) {
    if (req.user?.role === 'admin') {
      const allowed = await this.coursesService.isCourseAssignedToAdmin(id, req.user);
      if (!allowed) {
        throw new ForbiddenException('You are not authorized to edit this course.');
      }
    }
    return this.coursesService.update(id, dto, req.user);
  }

  @Put(':id/assessment')
  async updateCourseAssessment(
    @Param('id') id: string,
    @Body() body: { assessments: any[]; assessmentSettings?: any },
    @Req() req: any,
  ) {
    if (req.user?.role === 'admin') {
      const allowed = await this.coursesService.isCourseAssignedToAdmin(id, req.user);
      if (!allowed) {
        throw new ForbiddenException('You are not authorized to edit this course assessment.');
      }
    }
    return this.coursesService.updateAssessment(id, body.assessments, body.assessmentSettings);
  }

  @Delete(':id/lessons/:index')
  async deleteCourseLesson(
    @Param('id') id: string,
    @Param('index') index: string,
    @Req() req: any,
  ) {
    if (req.user?.role === 'admin') {
      const allowed = await this.coursesService.isCourseAssignedToAdmin(id, req.user);
      if (!allowed) {
        throw new ForbiddenException('You are not authorized to delete lessons from this course.');
      }
    }
    return this.coursesService.deleteLesson(id, parseInt(index, 10));
  }

  @Delete(':id')
  async deleteCourse(@Param('id') id: string, @Req() req: any) {
    if (req.user?.role === 'admin') {
      const allowed = await this.coursesService.isCourseAssignedToAdmin(id, req.user);
      if (!allowed) {
        throw new ForbiddenException('You are not authorized to delete this course.');
      }
    }
    return this.coursesService.delete(id);
  }

  /**
   * Downloads official course Excel import template.
   * Contains Sheet 1 "Courses" and Sheet 2 "Instructions".
   */
  @Get('import-template')
  async downloadTemplate(@Res() res: Response) {
    const buffer = this.coursesService.generateTemplateBuffer();
    const filename = 'gramguru_course_import_template.xlsx';

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }

  /**
   * Validates uploaded Excel file without writing to DB.
   * Checks every row and reports specific row errors or valid preview.
   */
  @Post('import/validate')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024, files: 1 }, // 10MB
      fileFilter: (_req, file, cb) => {
        const isExcel =
          file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.mimetype === 'application/vnd.ms-excel' ||
          /\.(xlsx|xls)$/i.test(file.originalname);
        if (isExcel) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only Excel files (.xlsx or .xls) are allowed.'), false);
        }
      },
    }),
  )
  async validateExcelFile(@UploadedFile() file: Express.Multer.File) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Excel file is required (form field: file).');
    }

    const result = await this.coursesService.parseAndValidateExcel(file.buffer);
    return {
      fileName: file.originalname,
      ...result,
    };
  }

  /**
   * Imports validated courses into PostgreSQL database.
   * Can accept either JSON body { courses: [...] } or an Excel file.
   */
  @Post('import')
  @UseGuards(SuperAdminGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024, files: 1 },
      fileFilter: (_req, file, cb) => {
        if (!file) return cb(null, true);
        const isExcel =
          file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.mimetype === 'application/vnd.ms-excel' ||
          /\.(xlsx|xls)$/i.test(file.originalname);
        if (isExcel) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only Excel files (.xlsx or .xls) are allowed.'), false);
        }
      },
    }),
  )
  async importCourses(
    @Body() body: ImportCoursesDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file && file.buffer) {
      const validation = await this.coursesService.parseAndValidateExcel(file.buffer);
      if (!validation.valid || validation.errorCount > 0) {
        throw new BadRequestException({
          message: 'Excel file contains validation errors. Please fix them before importing.',
          errors: validation.errors,
          totalRows: validation.totalRows,
        });
      }
      return this.coursesService.importCourses(validation.validRows, {
        originalname: file.originalname,
        buffer: file.buffer,
      });
    }

    if (body && Array.isArray(body.courses) && body.courses.length > 0) {
      return this.coursesService.importCourses(body.courses);
    }

    throw new BadRequestException('No courses provided for import.');
  }

  /**
   * Exports all courses in the database to a real .xlsx workbook.
   * File name: gramguru_courses_YYYY-MM-DD.xlsx
   */
  @Get('export')
  async exportCourses(@Res() res: Response) {
    const buffer = await this.coursesService.generateExportBuffer();
    const today = new Date().toISOString().split('T')[0];
    const filename = `gramguru_courses_${today}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  }

  /**
   * Associates an imported Excel file directly with an existing course.
   */
  @Post(':id/excel')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024, files: 1 },
      fileFilter: (_req, file, cb) => {
        const isExcel =
          file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.mimetype === 'application/vnd.ms-excel' ||
          /\.(xlsx|xls)$/i.test(file.originalname);
        if (isExcel) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only Excel files (.xlsx or .xls) are allowed.'), false);
        }
      },
    }),
  )
  async uploadCourseExcel(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file || !file.buffer) {
      throw new BadRequestException('Excel file is required (form field: file).');
    }
    return this.coursesService.attachExcelToCourse(id, {
      originalname: file.originalname,
      buffer: file.buffer,
    });
  }

  /**
   * Dissociates the Excel file from an existing course.
   */
  @Delete(':id/excel')
  async removeCourseExcel(@Param('id') id: string) {
    return this.coursesService.removeExcelFromCourse(id);
  }

  /**
   * Uploads a course note file (PDF, DOC, DOCX) and returns metadata.
   */
  @Post('upload-note')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 30 * 1024 * 1024 }, // 30MB note file limit
      fileFilter: (_req, file, cb) => {
        const allowed = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx)$/i.test(file.originalname);
        if (allowed) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Only PDF, DOC, DOCX, XLS, XLSX, PPT, and PPTX files are allowed for course notes.'), false);
        }
      },
    }),
  )
  async uploadCourseNote(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Note file is required');
    const result = await this.s3Service.uploadFile(file, 'notes');
    const ext = file.originalname?.split('.').pop()?.toUpperCase() || 'PDF';
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      file: result.url,
      url: result.url,
      name: file.originalname,
      title: file.originalname.replace(/\.[^/.]+$/, ''),
      size: `${mb} MB`,
      ext,
      key: result.key,
    };
  }
}

