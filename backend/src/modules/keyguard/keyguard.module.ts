import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { KeyGuardController } from './keyguard.controller';
import { CryptoService } from './services/crypto.service';
import { KeyGuardService } from './services/keyguard.service';
import { SignatureVerificationService } from './services/signature-verification.service';

/**
 * KeyGuard Module - Device binding and signature verification
 */
@Module({
  imports: [AuditLogsModule],
  controllers: [KeyGuardController],
  providers: [KeyGuardService, SignatureVerificationService, CryptoService],
  exports: [KeyGuardService, SignatureVerificationService, CryptoService],
})
export class KeyGuardModule { }
