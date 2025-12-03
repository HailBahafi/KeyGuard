import { Module } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';
import { LoggerModule } from './logger/logger.module';
import { KeyGuardModule } from '../modules/keyguard/keyguard.module';
import { SignatureGuard } from './guards/signature.guard';

@Module({
  imports: [LoggerModule, KeyGuardModule],
  providers: [HttpExceptionFilter, SignatureGuard],
  exports: [HttpExceptionFilter, SignatureGuard],
})
export class CommonModule {}
