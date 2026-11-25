import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ALL_ENTITIES } from '../entities';
import { AdminController } from './admin.controller';
import { AdminGuard } from './admin.guard';
import { SuperAdminGuard } from './super-admin.guard';
import { AdminScopeService } from './admin-scope.service';
import { AdminUserDetailsService } from './admin-user-details.service';
import { MailService } from './mail.service';
import { PublicController } from './public.controller';
import { SettingsService } from './settings.service';

@Module({
  imports: [TypeOrmModule.forFeature(ALL_ENTITIES), AuthModule],
  controllers: [PublicController, AdminController],
  providers: [
    SettingsService,
    MailService,
    AdminGuard,
    SuperAdminGuard,
    AdminScopeService,
    AdminUserDetailsService,
  ],
  exports: [
    MailService,
    AdminGuard,
    SuperAdminGuard,
    AdminScopeService,
    AdminUserDetailsService,
  ],
})
export class SiteModule {}
