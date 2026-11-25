import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
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
import { AdminGuard } from '../site/admin.guard';
import { S3Service } from '../common/s3.service';
import {
  CreateVideoTaskDto,
  ReviewVideoTaskSubmissionDto,
  UpdateVideoTaskDto,
} from '../dto';
import { TasksService } from './tasks.service';

const IS_UUID = (str: string): boolean =>
  typeof str === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());

@UseGuards(AdminGuard)
@Controller('admin/tasks')
export class TasksAdminController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  async listTasks(
    @Req() req: any,
    @Query('videoId') videoId?: string,
    @Query('courseSlug') courseSlug?: string,
  ) {
    return this.tasksService.findAllTasksAdmin(req.user, { videoId, courseSlug });
  }

  // Static routes MUST be declared above parameterized :id routes
  @Get('submissions/all')
  async getAllSubmissions(@Req() req: any) {
    return this.tasksService.getAllSubmissionsAdmin(req.user);
  }

  @Get('submissions')
  async getSubmissionsAlias(@Req() req: any) {
    return this.tasksService.getAllSubmissionsAdmin(req.user);
  }

  @Get('by-video/:videoId/submissions')
  async getSubmissionsByVideo(@Param('videoId') videoId: string) {
    return this.tasksService.getSubmissionsForVideoAdmin(videoId);
  }

  @Post('upload-attachment')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAttachment(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      return { success: false, message: 'No file uploaded' };
    }
    const result = await this.s3Service.uploadFile(file, 'tasks');
    return {
      success: true,
      url: result.url,
      fileName: file.originalname,
      fileSize: file.size,
    };
  }

  @Put('submissions/:submissionId/review')
  async reviewSubmission(
    @Param('submissionId') submissionId: string,
    @Body() dto: ReviewVideoTaskSubmissionDto,
    @Req() req: any,
  ) {
    if (!IS_UUID(submissionId)) {
      throw new BadRequestException(`Invalid submission ID format: ${submissionId}`);
    }
    return this.tasksService.reviewSubmissionAdmin(submissionId, dto, req.user);
  }

  @Post()
  async createTask(@Body() dto: CreateVideoTaskDto, @Req() req: any) {
    return this.tasksService.createTask(dto, req.user);
  }

  // Parameterized routes with strict UUID validation
  @Get(':id')
  async getTask(@Param('id') id: string) {
    if (!IS_UUID(id)) {
      throw new NotFoundException(`Invalid task ID format: ${id}`);
    }
    return this.tasksService.findOneTaskAdmin(id);
  }

  @Put(':id')
  async updateTask(
    @Param('id') id: string,
    @Body() dto: UpdateVideoTaskDto,
    @Req() req: any,
  ) {
    if (!IS_UUID(id)) {
      throw new BadRequestException(`Invalid task ID format: ${id}`);
    }
    return this.tasksService.updateTaskAdmin(id, dto, req.user);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string, @Req() req: any) {
    if (!IS_UUID(id)) {
      throw new BadRequestException(`Invalid task ID format: ${id}`);
    }
    return this.tasksService.deleteTaskAdmin(id, req.user);
  }

  @Get(':id/submissions')
  async getSubmissions(@Param('id') id: string) {
    if (!IS_UUID(id)) {
      throw new NotFoundException(`Invalid task ID format: ${id}`);
    }
    return this.tasksService.getSubmissionsForTaskAdmin(id);
  }
}

