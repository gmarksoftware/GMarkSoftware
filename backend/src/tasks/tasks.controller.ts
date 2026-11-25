import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '../auth/auth.guard';
import { S3Service } from '../common/s3.service';
import { SubmitVideoTaskDto } from '../dto';
import { TasksService } from './tasks.service';

@UseGuards(AuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly s3Service: S3Service,
  ) {}

  /**
   * Get all tasks assigned to the current logged-in user.
   */
  @Get('my')
  async getMyTasks(@Req() req: any, @Query('videoId') videoId?: string) {
    return this.tasksService.findMyTasks(req.user.id, videoId);
  }

  /**
   * Get task specifically associated with a video for the current user.
   */
  @Get('by-video/:videoId')
  async getTaskByVideo(
    @Param('videoId') videoId: string,
    @Req() req: any,
    @Query('courseSlug') courseSlug?: string,
    @Query('playlistId') playlistId?: string,
    @Query('videoTitle') videoTitle?: string,
    @Query('youtubeVideoId') youtubeVideoId?: string,
  ) {
    return this.tasksService.findTaskForVideo(videoId, req.user?.id, {
      courseSlug,
      playlistId,
      videoTitle,
      youtubeVideoId,
    });
  }

  /**
   * Submit answers directly for a specific video.
   */
  @Post('by-video/:videoId/submit')
  async submitAnswerForVideo(
    @Param('videoId') videoId: string,
    @Body() dto: SubmitVideoTaskDto,
    @Req() req: any,
  ) {
    return this.tasksService.submitWork(videoId, req.user.id, dto);
  }

  /**
   * Upload user answer file (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, JPEG, PNG, etc.)
   * Includes production-level security validation against dangerous scripts/executables.
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadWorkFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded.');
    }

    // 1. File size check (max 25MB)
    const MAX_SIZE = 25 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new BadRequestException('File size exceeds the 25 MB limit.');
    }

    // 2. Dangerous executable extension check
    const rawName = file.originalname || '';
    const ext = (rawName.split('.').pop() || '').toLowerCase();
    const DANGEROUS_EXTENSIONS = [
      'exe', 'bat', 'cmd', 'sh', 'js', 'msi', 'dll', 'vbs', 'ps1',
      'com', 'scr', 'jar', 'php', 'py', 'jsp', 'bin', 'cgi', 'pl',
      'hta', 'apk', 'wsf', 'reg', 'pif', 'vb', 'ws', 'jse'
    ];
    if (DANGEROUS_EXTENSIONS.includes(ext)) {
      throw new BadRequestException('Executable or script files are not allowed.');
    }

    // 3. Supported extension validation
    const ALLOWED_EXTENSIONS = [
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'jpg', 'jpeg', 'png', 'webp'
    ];
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      throw new BadRequestException(
        'This file type is not supported. Please upload a PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, JPEG, or PNG file.'
      );
    }

    // 4. MIME type check
    const ALLOWED_MIME_PREFIXES = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument',
      'application/vnd.ms-excel',
      'application/vnd.ms-powerpoint',
      'text/plain',
      'text/csv',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/octet-stream',
    ];
    const mime = (file.mimetype || '').toLowerCase();
    const isMimeValid = ALLOWED_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix));
    if (!isMimeValid) {
      throw new BadRequestException(
        'This file type is not supported. Please upload a PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, CSV, JPG, JPEG, or PNG file.'
      );
    }

    const result = await this.s3Service.uploadFile(file, 'submissions');
    return {
      success: true,
      url: result.url,
      fileName: file.originalname,
      fileSize: file.size,
      fileExt: ext.toUpperCase(),
    };
  }

  /**
   * Get details of a single task for the current user.
   */
  @Get(':id')
  async getTask(@Param('id') id: string, @Req() req: any) {
    return this.tasksService.findOneTaskUser(id, req.user.id);
  }

  /**
   * Submit work for an assigned task.
   */
  @Post(':id/submit')
  async submitTask(
    @Param('id') id: string,
    @Body() dto: SubmitVideoTaskDto,
    @Req() req: any,
  ) {
    return this.tasksService.submitWork(id, req.user.id, dto);
  }

  /**
   * Resubmit or update work for an assigned task.
   */
  @Put(':id/submission')
  async resubmitTask(
    @Param('id') id: string,
    @Body() dto: SubmitVideoTaskDto,
    @Req() req: any,
  ) {
    return this.tasksService.submitWork(id, req.user.id, dto);
  }
}

