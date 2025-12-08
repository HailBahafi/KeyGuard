import { Module } from '@nestjs/common';
import { KeyGuardModule } from '../keyguard/keyguard.module';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';

/**
 * Proxy Module - OpenAI API proxy with KeyGuard authentication
 */
@Module({
  imports: [KeyGuardModule],
  controllers: [ProxyController],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule { }
