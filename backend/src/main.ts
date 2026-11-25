import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { mkdirSync } from 'fs';
import { AppModule } from './app.module';
import { UPLOAD_DIR } from './site/admin.controller';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  mkdirSync(UPLOAD_DIR, { recursive: true });

  // 1. CORS FIRST: Must execute before Helmet and before any route or guard
  const envFrontendUrl = process.env.FRONTEND_URL || '';
  const configuredOrigins = envFrontendUrl
    .split(/[,;\n]/)
    .map((s) => s.trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '').toLowerCase())
    .filter(Boolean);

  const localDefaults = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:5173',
  ];

  const productionDefaults = [
    'https://www.gramgurufoudation.com',
    'https://gramgurufoudation.com',
    'http://www.gramgurufoudation.com',
    'http://gramgurufoudation.com',
    'https://www.gramgurufoundation.com',
    'https://gramgurufoundation.com',
    'http://www.gramgurufoundation.com',
    'http://gramgurufoundation.com',
    'https://gramguru.onrender.com',
  ];

  const exactAllowedOrigins = new Set<string>(
    [...productionDefaults, ...localDefaults, ...configuredOrigins].map((o) => o.toLowerCase()),
  );

  const allowedOriginPatterns = [
    // Localhost or loopback on any port
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i,
    // gramgurufoudation.com and any subdomains
    /^https?:\/\/([a-z0-9-]+\.)*gramgurufoudation\.com$/i,
    // gramgurufoundation.com and any subdomains
    /^https?:\/\/([a-z0-9-]+\.)*gramgurufoundation\.com$/i,
    // Render deployment subdomains
    /^https?:\/\/([a-z0-9-]+\.)*onrender\.com$/i,
    // Vercel and Netlify deployment subdomains
    /^https?:\/\/([a-z0-9-]+\.)*vercel\.app$/i,
    /^https?:\/\/([a-z0-9-]+\.)*netlify\.app$/i,
  ];

  const isOriginAllowed = (origin?: string | null): boolean => {
    if (!origin) return true;
    const clean = origin.trim().replace(/\/+$/, '').toLowerCase();
    if (exactAllowedOrigins.has(clean)) return true;
    for (const pattern of allowedOriginPatterns) {
      if (pattern.test(clean)) return true;
    }
    if (process.env.NODE_ENV !== 'production') return true;
    return false;
  };

  // Dedicated single CORS middleware handling preflight OPTIONS and normal requests
  app.use((req: any, res: any, next: any) => {
    const origin = req.headers?.origin as string | undefined;
    const allowed = isOriginAllowed(origin);

    if (origin && allowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition, Content-Length');
      res.setHeader('Vary', 'Origin');
    }

    if (req.method === 'OPTIONS') {
      if (!origin || allowed) {
        if (origin) {
          res.setHeader('Access-Control-Allow-Origin', origin);
          res.setHeader('Access-Control-Allow-Credentials', 'true');
        }
        res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, PUT, PATCH, POST, DELETE, OPTIONS');
        const reqHeaders = req.headers?.['access-control-request-headers'];
        res.setHeader(
          'Access-Control-Allow-Headers',
          reqHeaders ||
            'Content-Type, Authorization, x-admin-key, Accept, Origin, X-Requested-With, Cache-Control, Pragma, Range',
        );
        res.setHeader('Access-Control-Max-Age', '86400');
        res.setHeader('Content-Length', '0');
        return res.status(204).end();
      }
      return res.status(403).end();
    }
    next();
  });

  // 2. Security headers (placed after CORS so preflights are never blocked)
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    }),
  );
  app.setGlobalPrefix('api');

  // Protect direct unauthenticated access to video files in uploads while allowing notes, submissions, and images
  app.use((req: any, res: any, next: any) => {
    const pathname = String(req.url || req.path || '').toLowerCase();
    const isVideoFile = /\.(mp4|webm|mov|mkv|avi)($|\?)/i.test(pathname);

    if (isVideoFile && (pathname.includes('/uploads') || pathname.includes('/courses'))) {
      const header = String(req.headers['authorization'] ?? '');
      const match = header.match(/^Bearer\s+(.+)$/i);
      let token = match ? match[1].trim() : '';
      if (!token && req.headers.cookie) {
        const cookieMatch = String(req.headers.cookie).match(/(?:^|;\s*)(?:token|gramguru_token|auth_token)=([^;]+)/);
        if (cookieMatch) token = decodeURIComponent(cookieMatch[1].trim());
      }

      if (!token) {
        return res.status(401).json({
          statusCode: 401,
          message: 'Authentication required to access course video files.',
        });
      }
    }
    next();
  });

  app.useStaticAssets(UPLOAD_DIR, { prefix: '/uploads' });
  app.useStaticAssets(UPLOAD_DIR, { prefix: '/api/uploads' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  const port = Number(process.env.PORT ?? 3000);
  const server = await app.listen(port, '0.0.0.0');
  if (server) {
    // Disable timeouts to allow large multi-gigabyte video uploads without socket disconnection
    server.setTimeout(0);
    if ('requestTimeout' in server) {
      (server as any).requestTimeout = 0;
    }
    if ('headersTimeout' in server) {
      (server as any).headersTimeout = 0;
    }
  }
  console.log(`Gram Guru API running on http://localhost:${port}/api`);
}
bootstrap();
