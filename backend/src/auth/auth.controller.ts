import { Body, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { GoogleAuthDto, LoginDto, RegisterDto } from '../dto';
import { AuthGuard } from './auth.guard';
import { AuthService, publicUser } from './auth.service';

// Brute-force protection: 10 attempts / minute / IP.
const AUTH_LIMIT = { default: { limit: 10, ttl: 60_000 } };

/**  POST /api/auth/register · POST /api/auth/login · POST /api/auth/google · GET /api/auth/me
 *   One login for everybody – the response contains user.role ('user' or 'admin'). */
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Throttle(AUTH_LIMIT) @Post('register') @HttpCode(201)
  register(@Body() dto: RegisterDto, @Req() req: any) {
    return this.auth.register(dto.fullName, dto.email, dto.password, req);
  }

  @Throttle(AUTH_LIMIT) @Post('login') @HttpCode(200)
  login(@Body() dto: LoginDto, @Req() req: any) {
    return this.auth.login(dto.email, dto.password, req);
  }

  @Throttle(AUTH_LIMIT) @Post('google') @HttpCode(200)
  google(@Body() dto: GoogleAuthDto, @Req() req: any) {
    return this.auth.googleAuth(dto.fullName, dto.email, dto.password, req);
  }

  @UseGuards(AuthGuard) @Get('me')
  me(@Req() req: any) {
    return { user: publicUser(req.user) };
  }

  @UseGuards(AuthGuard) @Post('me') @HttpCode(200)
  mePost(@Req() req: any) {
    return { user: publicUser(req.user) };
  }
}
