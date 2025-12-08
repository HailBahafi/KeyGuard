import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { AuthModule } from './core/auth/auth.module';
import { JwtAuthGuard } from './core/auth/jwt-auth.guard';
import { CacheModule } from './core/cache/cache.module';
import { PrismaModule } from './core/database/prisma.module';

// Feature modules
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { DevicesModule } from './modules/devices/devices.module';
import { HealthModule } from './modules/health/health.module';
import { KeyGuardModule } from './modules/keyguard/keyguard.module';
import { ProxyModule } from './modules/proxy/proxy.module';
import { SettingsModule } from './modules/settings/settings.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per minute
      },
    ]),
    // Core modules
    PrismaModule,
    CacheModule,
    CommonModule,
    AuthModule,
    // Feature modules
    UsersModule,
    KeyGuardModule,
    ApiKeysModule,
    DevicesModule,
    AuditLogsModule,
    SettingsModule,
    ProxyModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global guards
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
