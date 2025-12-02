import { Module } from '@nestjs/common';
import { KeyGuardController } from './keyguard.controller';
import { KeyGuardService } from './services/keyguard.service';
import { SignatureVerificationService } from './services/signature-verification.service';

/**
 * KeyGuard Module - Device binding and signature verification
 */
@Module({
  controllers: [KeyGuardController],
  providers: [KeyGuardService, SignatureVerificationService],
  exports: [KeyGuardService, SignatureVerificationService],
})
export class KeyGuardModule {}
