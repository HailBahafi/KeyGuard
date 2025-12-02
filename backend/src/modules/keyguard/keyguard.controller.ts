import { Public } from '@/src/common/decorators/public.decorator';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { EnrollDeviceDto, EnrollResponseDto, VerifyResponseDto } from './dto';
import { KeyGuardService } from './services/keyguard.service';
/**
 * KeyGuard Controller - Handles device enrollment and signature verification
 * All endpoints are public (use their own x-keyguard-api-key authentication)
 */
@Public()
@Controller('keyguard')
export class KeyGuardController {
  private readonly logger = new Logger(KeyGuardController.name);
  constructor(private readonly keyguardService: KeyGuardService) { }
  /**
   * Enroll a new device by storing its public key
   *
   * POST /api/v1/keyguard/enroll
   */
  @Post('enroll')
  @HttpCode(HttpStatus.CREATED)
  async enroll(
    @Headers('x-keyguard-api-key') apiKey: string,
    @Body() enrollDto: EnrollDeviceDto,
  ): Promise<EnrollResponseDto> {
    if (!apiKey) {
      throw new BadRequestException('x-keyguard-api-key header is required');
    }
    this.logger.log(`Enrollment request for keyId: ${enrollDto.keyId}`);
    return this.keyguardService.enrollDevice(apiKey, enrollDto);
  }
  /**
   * Verify a signed request (test endpoint for Phase 1)
   *
   * POST /api/v1/keyguard/verify-test
   */
  @Post('verify-test')
  @HttpCode(HttpStatus.OK)
  async verifyTest(
    @Req() request: FastifyRequest & { rawBody?: Buffer },
    @Headers('x-keyguard-api-key') apiKey: string,
    @Headers('x-keyguard-key-id') keyId: string,
    @Headers('x-keyguard-timestamp') timestamp: string,
    @Headers('x-keyguard-nonce') nonce: string,
    @Headers('x-keyguard-body-sha256') bodySha256: string,
    @Headers('x-keyguard-alg') algorithm: string,
    @Headers('x-keyguard-signature') signature: string,
    @Body() body?: unknown,
  ): Promise<VerifyResponseDto> {
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
    const headers = {
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
    this.logger.log(`Verification test request: ${method} ${url}`);
    return this.keyguardService.verifyRequest(headers, method, url, rawBody);
  }
  /**
   * Get device by ID
   *
   * GET /api/v1/keyguard/devices/:id
   */
  @Get('devices/:id')
  async getDevice(
    @Headers('x-keyguard-api-key') apiKey: string,
    @Param('id') id: string,
  ) {
    if (!apiKey) {
      throw new BadRequestException('x-keyguard-api-key header is required');
    }
    return this.keyguardService.getDevice(id);
  }
  /**
   * List all devices for an API key
   *
   * GET /api/v1/keyguard/devices
   */
  @Get('devices')
  async listDevices(@Headers('x-keyguard-api-key') apiKey: string) {
    if (!apiKey) {
      throw new BadRequestException('x-keyguard-api-key header is required');
    }
    return this.keyguardService.listDevices(apiKey);
  }
  /**
   * Revoke a device
   *
   * DELETE /api/v1/keyguard/devices/:id
   */
  @Delete('devices/:id')
  @HttpCode(HttpStatus.OK)
  async revokeDevice(
    @Headers('x-keyguard-api-key') apiKey: string,
    @Param('id') id: string,
  ) {
    if (!apiKey) {
      throw new BadRequestException('x-keyguard-api-key header is required');
    }
    return this.keyguardService.revokeDevice(apiKey, id);
  }
}
