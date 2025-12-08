import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/core/database/prisma.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';

@Module({
  imports: [PrismaModule, AuditLogsModule],
  controllers: [ApiKeysController],
  providers: [ApiKeysService],
  exports: [ApiKeysService],
})
export class ApiKeysModule { }
