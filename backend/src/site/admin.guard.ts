import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { AuthService } from '../auth/auth.service';

/**
 * Protects /api/admin/*.
 *  1. Normal way: the admin logs in on the website's own login page (same as every user) and the
 *     "Authorization: Bearer <token>" belongs to a user whose role is 'admin'.
 *  2. Optional fallback for scripts/curl: the legacy ADMIN_API_KEY sent as "x-admin-key". The website itself no longer uses it.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private config: ConfigService, private auth: AuthService) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();

    const header = String(req.headers['authorization'] ?? '');
    let token = '';
    const match = header.match(/^Bearer\s+(.+)$/i);
    if (match) {
      token = match[1].trim();
    } else if (req.headers.cookie) {
      const cookieMatch = String(req.headers.cookie).match(/(?:^|;\s*)(?:token|gramguru_token|auth_token)=([^;]+)/);
      if (cookieMatch) token = decodeURIComponent(cookieMatch[1].trim());
    }

    if (token) {
      const user = await this.auth.userFromToken(token);
      if (!user) throw new UnauthorizedException('Session expired – please log in again');
      if (user.isActive === false) throw new ForbiddenException('Account suspended');
      if (user.role !== 'admin' && user.role !== 'super_admin') throw new ForbiddenException('Admin access only');
      req.user = user;
      return true;
    }

    const expected = this.config.get<string>('ADMIN_API_KEY', '');
    const supplied = String(req.headers['x-admin-key'] ?? '');
    if (!expected || !supplied) throw new UnauthorizedException('Admin authentication required');
    const a = Buffer.from(expected);
    const b = Buffer.from(supplied);
    if (a.length !== b.length || !timingSafeEqual(a, b)) throw new UnauthorizedException('Invalid admin key');
    req.user = { id: '00000000-0000-0000-0000-000000000000', email: 'admin@system', fullName: 'Super Administrator', role: 'super_admin', isActive: true };
    return true;
  }
}
