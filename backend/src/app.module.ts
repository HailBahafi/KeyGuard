import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { AuthModule } from './core/auth/auth.module';
import { PrismaModule } from './core/database/prisma.module';
import { JwtAuthGuard } from './core/auth/jwt-auth.guard';

// Feature modules
import { UsersModule } from './modules/users/users.module';
import { KeyGuardModule } from './modules/keyguard/keyguard.module';
import { ApiKeysModule } from './modules/api-keys/api-keys.module';
import { DevicesModule } from './modules/devices/devices.module';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module';
import { SettingsModule } from './modules/settings/settings.module';

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
    CommonModule,
    AuthModule,
    // Feature modules
    UsersModule,
    KeyGuardModule,
    ApiKeysModule,
    DevicesModule,
    AuditLogsModule,
    SettingsModule,
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
export class AppModule {}
