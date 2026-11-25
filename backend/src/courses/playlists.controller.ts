import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { AdminGuard } from '../site/admin.guard';
import { CreatePlaylistDto, UpdatePlaylistDto } from '../dto';

@Controller()
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  /**
   * Public endpoint to fetch all active playlists
   */
  @Get('playlists')
  async getAllPlaylists() {
    return this.playlistsService.findAll();
  }

  /**
   * Public endpoint to fetch all active playlists for a course
   */
  @Get('courses/:slug/playlists')
  async getCoursePlaylists(@Param('slug') slug: string) {
    return this.playlistsService.findByCourse(slug);
  }

  /**
   * Public endpoint to fetch all playlists marked as trending by admin
   */
  @Get('playlists/trending')
  async getTrendingPlaylists() {
    return this.playlistsService.findTrending();
  }

  /**
   * Public endpoint to fetch details of a specific playlist
   */
  @Get('playlists/:id')
  async getPlaylist(@Param('id') id: string) {
    return this.playlistsService.findOne(id);
  }

  /**
   * Admin endpoint alias for POST /api/playlists
   */
  @UseGuards(AdminGuard)
  @Post('playlists')
  async createPlaylist(@Body() dto: CreatePlaylistDto) {
    return this.playlistsService.createPlaylist(dto);
  }

  /**
   * Admin endpoint alias for PUT /api/playlists/:id
   */
  @UseGuards(AdminGuard)
  @Put('playlists/:id')
  async updatePlaylist(
    @Param('id') id: string,
    @Body() dto: UpdatePlaylistDto,
  ) {
    return this.playlistsService.updatePlaylist(id, dto);
  }

  /**
   * Admin endpoint alias for DELETE /api/playlists/:id
   */
  @UseGuards(AdminGuard)
  @Delete('playlists/:id')
  async deletePlaylist(@Param('id') id: string) {
    return this.playlistsService.deletePlaylist(id);
  }
}


