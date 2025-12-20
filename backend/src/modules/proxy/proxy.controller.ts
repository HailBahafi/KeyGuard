import { Public } from '@/src/common/decorators/public.decorator';
import { Encryption } from '@/src/common/utils/encryption.util';
import {
  All,
  BadRequestException,
  Controller,
  Headers,
  Logger,
  Req,
  Res,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { KeyGuardService } from '../keyguard/services/keyguard.service';
import { KeyGuardProxyHeaders } from './dto';
import { ProxyService } from './proxy.service';

/**
 * Proxy Controller - Handles OpenAI API proxy requests
 * All requests are verified using KeyGuard signatures before forwarding
 */
@Public()
@Controller('proxy')
export class ProxyController {
  private readonly logger = new Logger(ProxyController.name);

  constructor(
    private readonly proxyService: ProxyService,
    private readonly keyguardService: KeyGuardService,
  ) { }

  /**
   * Universal proxy endpoint - handles any path under /proxy/*
   *
   * Examples:
   *   POST /api/v1/proxy/v1/chat/completions
   *   POST /api/v1/proxy/v1/embeddings
   *   GET  /api/v1/proxy/v1/models
   */
  @All('*')
  async proxyRequest(
    @Req() request: FastifyRequest & { rawBody?: Buffer },
    @Res() reply: FastifyReply,
    @Headers('x-keyguard-api-key') apiKey: string,
    @Headers('x-keyguard-key-id') keyId: string,
    @Headers('x-keyguard-timestamp') timestamp: string,
    @Headers('x-keyguard-nonce') nonce: string,
    @Headers('x-keyguard-body-sha256') bodySha256: string,
    @Headers('x-keyguard-alg') algorithm: string,
    @Headers('x-keyguard-signature') signature: string,
  ) {
    // Validate required headers
    const missingHeaders = [];
    if (!apiKey) missingHeaders.push('x-keyguard-api-key');
    if (!keyId) missingHeaders.push('x-keyguard-key-id');
    if (!timestamp) missingHeaders.push('x-keyguard-timestamp');
    if (!nonce) missingHeaders.push('x-keyguard-nonce');
    if (!bodySha256) missingHeaders.push('x-keyguard-body-sha256');
    if (!algorithm) missingHeaders.push('x-keyguard-alg');
    if (!signature) missingHeaders.push('x-keyguard-signature');

    if (missingHeaders.length > 0) {
      throw new BadRequestException(
        `Missing required headers: ${missingHeaders.join(', ')}`,
      );
    }

    const headers: KeyGuardProxyHeaders = {
      apiKey,
      keyId,
      timestamp,
      nonce,
      bodySha256,
      algorithm,
      signature,
    };

    // Get raw body from request
    const rawBody = request.rawBody ?? null;

    // Get method and URL
    const method = request.method;
    const url = request.url;

    this.logger.log(`Proxy request: ${method} ${url}`);

    // Step 1: Verify KeyGuard signature
    const verificationResult = await this.keyguardService.verifyRequest(
      headers,
      method,
      url,
      rawBody,
    );

    if (!verificationResult.valid) {
      this.logger.warn(
        `Signature verification failed: ${verificationResult.error}`,
      );
      throw new BadRequestException(
        `Signature verification failed: ${verificationResult.error}`,
      );
    }

    this.logger.log(
      `Signature verified for device: ${verificationResult.deviceId}`,
    );

    // Step 2: Extract OpenAI endpoint from URL
    // URL format: /api/v1/proxy/v1/chat/completions -> /v1/chat/completions
    const proxyPrefix = '/proxy';
    const proxyPrefixIndex = url.indexOf(proxyPrefix);

    if (proxyPrefixIndex === -1) {
      throw new BadRequestException('Invalid proxy URL format');
    }

    const openaiEndpoint = url.substring(proxyPrefixIndex + proxyPrefix.length);

    if (!openaiEndpoint) {
      throw new BadRequestException('No OpenAI endpoint specified');
    }

    this.logger.log(`Forwarding to OpenAI endpoint: ${openaiEndpoint}`);

    // Step 3: Parse request body
    let body: any = {};
    if (rawBody && rawBody.length > 0) {
      try {
        body = JSON.parse(rawBody.toString('utf-8'));
      } catch (error) {
        throw new BadRequestException('Invalid JSON body');
      }
    }

    // Step 4: Get device and API key info for logging
    const device = await this.keyguardService.getDevice(verificationResult.deviceId!);

    // Step 5: Decrypt the API key (stored encrypted with AES-256-GCM)
    let decryptedApiKey: string;
    try {
      decryptedApiKey = Encryption.decrypt(device.apiKey.apiKey);
    } catch (error) {
      this.logger.error(`Failed to decrypt API key: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new BadRequestException('Failed to decrypt API key. The key may be corrupted or stored with old encryption.');
    }

    // Step 6: Forward to OpenAI with decrypted key
    await this.proxyService.forwardToOpenAI(
      openaiEndpoint,
      body,
      method,
      reply,
      device.id,
      device.apiKeyId,
      decryptedApiKey,
    );
  }
}
