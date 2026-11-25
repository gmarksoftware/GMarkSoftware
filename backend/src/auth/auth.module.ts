import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, UserLoginLog } from '../entities';
import { MailService } from '../site/mail.service';
import { AuthController } from './auth.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserLoginLog])],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, MailService],
  exports: [AuthService, AuthGuard],
})
export class AuthModule {}
