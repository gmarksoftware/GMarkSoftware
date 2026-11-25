import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { ALL_ENTITIES } from './entities';
import { SiteModule } from './site/site.module';
import { S3Service } from './common/s3.service';
import { CommonModule } from './common/common.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.NODE_ENV || 'development'}`,
        '.env.local',
        '.env',
      ],
    }),
    CommonModule,
    // Global default: 120 requests / minute / IP. Form endpoints have a stricter limit.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        type: 'postgres' as const,
        host: c.get<string>('DB_HOST', 'localhost'),
        port: Number(c.get('DB_PORT', 5432)),
        username: c.get<string>('DB_USER', 'gramguru'),
        password: c.get<string>('DB_PASSWORD', 'gramguru_pass'),
        database: c.get<string>('DB_NAME', 'gramguru'),
        entities: ALL_ENTITIES,
        synchronize: c.get<string>('DB_SYNC', 'true') === 'true',
      }),
    }),
    AuthModule,
    SiteModule,
    CoursesModule,
    TasksModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    S3Service,
  ],
  exports: [S3Service],
})
export class AppModule { }
