import { Module } from '@nestjs/common';
import { KeyGuardController } from './keyguard.controller';
import { KeyGuardService } from './services/keyguard.service';
import { SignatureVerificationService } from './services/signature-verification.service';
import { CryptoService } from './services/crypto.service';

/**
 * KeyGuard Module - Device binding and signature verification
 */
@Module({
  controllers: [KeyGuardController],
  providers: [KeyGuardService, SignatureVerificationService, CryptoService],
  exports: [KeyGuardService, SignatureVerificationService, CryptoService],
})
export class KeyGuardModule { }
