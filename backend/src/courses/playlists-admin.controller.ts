import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../site/admin.guard';
import { SuperAdminGuard } from '../site/super-admin.guard';
import {
  AddPlaylistVideoDto,
  CreatePlaylistDto,
  ReorderPlaylistVideosDto,
  UpdatePlaylistDto,
  UpdatePlaylistVideoDto,
} from '../dto';
import { PlaylistsService } from './playlists.service';

@UseGuards(AdminGuard)
@Controller('admin/playlists')
export class PlaylistAdminController {
  constructor(private readonly playlistsService: PlaylistsService) { }

  @Get()
  async listPlaylists(
    @Query('courseId') courseId?: string,
    @Query('courseSlug') courseSlug?: string,
    @Query('isTrending') isTrending?: string,
    @Req() req?: any,
  ) {
    return this.playlistsService.findAll(
      {
        courseId,
        courseSlug,
        isTrending: isTrending !== undefined ? isTrending === 'true' : undefined,
      },
      req?.user,
    );
  }

  @Get(':id')
  async getPlaylist(@Param('id') id: string, @Req() req?: any) {
    const pl = await this.playlistsService.findOne(id);
    if (req?.user?.role === 'admin' && pl) {
      const allowed = await this.playlistsService.isPlaylistAssignedToAdmin(pl, req.user);
      if (!allowed) {
        throw new ForbiddenException('You do not have access to this playlist.');
      }
    }
    return pl;
  }

  @Post()
  async createPlaylist(@Body() dto: CreatePlaylistDto, @Req() req: any) {
    return this.playlistsService.createPlaylist(dto, req.user);
  }

  @Put('videos/:videoId')
  async updateGlobalVideo(
    @Param('videoId') videoId: string,
    @Body() dto: UpdatePlaylistVideoDto,
    @Req() req: any,
  ) {
    if (req.user?.role === 'admin') {
      const allowed = await this.playlistsService.isVideoAssignedToAdmin(videoId, req.user);
      if (!allowed) {
        throw new ForbiddenException('You are not authorized to edit this video.');
      }
    }
    return this.playlistsService.updateVideo(null, videoId, dto);
  }

  @Put(':id')
  async updatePlaylist(
    @Param('id') id: string,
    @Body() dto: UpdatePlaylistDto,
    @Req() req: any,
  ) {
    if (req.user?.role === 'admin') {
      const pl = await this.playlistsService.findOne(id);
      const allowed = pl ? await this.playlistsService.isPlaylistAssignedToAdmin(pl, req.user) : false;
      if (!allowed) {
        throw new ForbiddenException('You are not authorized to edit this playlist.');
      }
    }
    return this.playlistsService.updatePlaylist(id, dto);
  }

  @Delete(':id')
  async deletePlaylist(@Param('id') id: string, @Req() req: any) {
    if (req.user?.role === 'admin') {
      const pl = await this.playlistsService.findOne(id);
      const allowed = pl ? await this.playlistsService.isPlaylistAssignedToAdmin(pl, req.user) : false;
      if (!allowed) {
        throw new ForbiddenException('You are not authorized to delete this playlist.');
      }
    }
    return this.playlistsService.deletePlaylist(id);
  }

  @Post(':id/videos')
  async addVideo(
    @Param('id') id: string,
    @Body() dto: AddPlaylistVideoDto,
    @Req() req: any,
  ) {
    if (req.user?.role === 'admin') {
      const pl = await this.playlistsService.findOne(id);
      const allowed = pl ? await this.playlistsService.isPlaylistAssignedToAdmin(pl, req.user) : false;
      if (!allowed) {
        throw new ForbiddenException('You are not authorized to add videos to this playlist.');
      }
    }
    return this.playlistsService.addVideo(id, dto);
  }

  @Put(':id/videos/reorder')
  async reorderVideos(
    @Param('id') id: string,
    @Body() dto: ReorderPlaylistVideosDto,
    @Req() req: any,
  ) {
    if (req.user?.role === 'admin') {
      const pl = await this.playlistsService.findOne(id);
      const allowed = pl ? await this.playlistsService.isPlaylistAssignedToAdmin(pl, req.user) : false;
      if (!allowed) {
        throw new ForbiddenException('You are not authorized to reorder videos in this playlist.');
      }
    }
    return this.playlistsService.reorderVideos(id, dto);
  }

  @Put(':id/videos/:videoId')
  async updateVideo(
    @Param('id') id: string,
    @Param('videoId') videoId: string,
    @Body() dto: UpdatePlaylistVideoDto,
    @Req() req: any,
  ) {
    if (req.user?.role === 'admin') {
      const pl = await this.playlistsService.findOne(id);
      const allowed = pl ? await this.playlistsService.isPlaylistAssignedToAdmin(pl, req.user, videoId) : false;
      if (!allowed) {
        throw new ForbiddenException('You are not authorized to edit this video.');
      }
    }
    return this.playlistsService.updateVideo(id, videoId, dto);
  }

  @Delete(':id/videos/:videoId')
  async deleteVideo(
    @Param('id') id: string,
    @Param('videoId') videoId: string,
    @Req() req: any,
  ) {
    if (req.user?.role === 'admin') {
      const pl = await this.playlistsService.findOne(id);
      const allowed = pl ? await this.playlistsService.isPlaylistAssignedToAdmin(pl, req.user, videoId) : false;
      if (!allowed) {
        throw new ForbiddenException('You are not authorized to delete videos from this playlist.');
      }
    }
    return this.playlistsService.deleteVideo(id, videoId);
  }
}

