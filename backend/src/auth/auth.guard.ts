import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

/** Requires a valid "Authorization: Bearer <token>" header (any logged-in user). Puts the user on request.user. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService) {}

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

    const user = token ? await this.auth.userFromToken(token) : null;
    if (!user) throw new UnauthorizedException('Please log in');
    req.user = user;
    return true;
  }
}
