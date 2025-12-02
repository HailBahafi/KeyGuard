import {
  Injectable,
  Logger,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@/src/core/database/prisma.service';
import { SignatureVerificationService } from './signature-verification.service';
import {
  EnrollDeviceDto,
  EnrollResponseDto,
  VerifyResponseDto,
  KeyGuardHeaders,
} from '../dto';
import { DeviceCreateInput } from '@/src/generated/models';

/**
 * Main KeyGuard service handling device enrollment and signature verification
 */
@Injectable()
export class KeyGuardService {
  private readonly logger = new Logger(KeyGuardService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly signatureVerification: SignatureVerificationService,
  ) {}

  /**
   * Enroll a new device by storing its public key
   *
   * @param apiKey - Project API key from header
   * @param enrollDto - Enrollment data from SDK
   * @returns Device ID and status
   */
  async enrollDevice(
    apiKey: string,
    enrollDto: EnrollDeviceDto,
  ): Promise<EnrollResponseDto> {
    this.logger.log(`Enrolling device with keyId: ${enrollDto.keyId}`);

    // Validate API key and get project
    const project = await this.validateApiKey(apiKey);

    // Check if device with same fingerprint already exists
    const existingDevice = await this.prisma.prisma.device.findUnique({
      where: {
        fingerprintHash: enrollDto.deviceFingerprint,
      },
    });

    if (existingDevice) {
      throw new BadRequestException(
        `Device already enrolled`,
      );
    }

    // Validate public key format (basic check)
    this.validatePublicKey(enrollDto.publicKey);

    // Create device record with new schema
    const device = await this.prisma.prisma.device.create({
      data: {
        name: enrollDto.label || 'Unnamed Device',
        fingerprintHash: enrollDto.deviceFingerprint,
        status: 'PENDING',
        platform: enrollDto.metadata ?? {},
        ownerName: 'System',
        ownerEmail: 'system@keyguard.io',
        ipAddress: '0.0.0.0',
        location: 'Unknown',
        keyId: enrollDto.keyId ?? null,
        publicKeySpkiBase64: enrollDto.publicKey ?? null,
        userAgent: enrollDto.userAgent ?? null,
        metadata: enrollDto.metadata ?? {},
        apiKey: {
          connect: {
            id: project.id,
          },
        },
      },
    });

    this.logger.log(`Device enrolled successfully: ${device.id}`);

    return {
      id: device.id,
      status: device.status,
      createdAt: device.createdAt,
    };
  }

  /**
   * Verify a signed request
   *
   * @param headers - KeyGuard headers from request
   * @param method - HTTP method
   * @param url - Request URL (path and query)
   * @param rawBody - Raw request body buffer
   * @returns Verification result
   */
  async verifyRequest(
    headers: KeyGuardHeaders,
    method: string,
    url: string,
    rawBody: Buffer | null,
  ): Promise<VerifyResponseDto> {
    try {
      this.logger.log(
        `Verifying request for keyId: ${headers.keyId}, apiKey: ${headers.apiKey}`,
      );

      // 1. Validate algorithm
      if (!this.signatureVerification.validateAlgorithm(headers.algorithm)) {
        return {
          valid: false,
          error: `Unsupported algorithm: ${headers.algorithm}`,
        };
      }

      // 2. Validate timestamp (120 second window)
      if (!this.signatureVerification.validateTimestamp(headers.timestamp)) {
        return {
          valid: false,
          error: 'Request timestamp outside valid window',
        };
      }

      // 3. Validate API key and get project
      const project = await this.validateApiKey(headers.apiKey);

      // 4. Get device and public key
      const device = await this.prisma.prisma.device.findFirst({
        where: {
          apiKeyId: project.id,
          keyId: headers.keyId,
        },
      });

      if (!device) {
        return {
          valid: false,
          error: `Device with keyId ${headers.keyId} not found`,
        };
      }

      if (device.status !== 'ACTIVE') {
        return {
          valid: false,
          error: `Device status is ${device.status}`,
        };
      }

      // 5. Check nonce uniqueness (replay protection)
      const nonceExists = await this.checkNonceExists(
        project.id,
        headers.keyId,
        headers.nonce,
      );

      if (nonceExists) {
        return {
          valid: false,
          error: 'Nonce has already been used (replay attack detected)',
        };
      }

      // 6. Compute body hash and compare
      const computedBodyHash =
        this.signatureVerification.computeBodyHash(rawBody);

      if (computedBodyHash !== headers.bodySha256) {
        this.logger.warn(
          `Body hash mismatch. Expected: ${headers.bodySha256}, Got: ${computedBodyHash}`,
        );
        return {
          valid: false,
          error: 'Body hash mismatch',
        };
      }

      // 7. Build canonical payload
      const pathAndQuery =
        this.signatureVerification.extractPathAndQuery(url);
      const canonicalPayload =
        this.signatureVerification.buildCanonicalPayload(
          headers.timestamp,
          method,
          pathAndQuery,
          headers.bodySha256,
          headers.nonce,
          headers.apiKey,
          headers.keyId,
        );

      // 8. Verify signature
      const isValid = await this.signatureVerification.verifySignature(
        device.publicKeySpkiBase64 || '',
        canonicalPayload,
        headers.signature,
      );

      if (!isValid) {
        return {
          valid: false,
          error: 'Invalid signature',
        };
      }

      // 9. Store nonce to prevent replay (TTL: 120 seconds)
      await this.storeNonce(project.id, headers.keyId, headers.nonce);

      // 10. Update last seen timestamp
      await this.prisma.prisma.device.update({
        where: { id: device.id },
        data: { lastSeen: new Date() },
      });

      this.logger.log(`Request verified successfully for device: ${device.id}`);

      return {
        valid: true,
        deviceId: device.id,
        keyId: device.keyId || '',
      };
    } catch (error) {
      this.logger.error('Verification error:', error);
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Verification failed',
      };
    }
  }

  /**
   * Get device by ID
   */
  async getDevice(deviceId: string) {
    const device = await this.prisma.prisma.device.findUnique({
      where: { id: deviceId },
      include: { apiKey: true },
    });

    if (!device) {
      throw new NotFoundException(`Device ${deviceId} not found`);
    }

    return device;
  }

  /**
   * List all devices for an API key
   */
  async listDevices(apiKey: string) {
    const project = await this.validateApiKey(apiKey);

    const devices = await this.prisma.prisma.device.findMany({
      where: { apiKeyId: project.id },
      orderBy: { createdAt: 'desc' },
    });

    return devices;
  }

  /**
   * Revoke a device
   */
  async revokeDevice(apiKey: string, deviceId: string) {
    const project = await this.validateApiKey(apiKey);

    const device = await this.prisma.prisma.device.findFirst({
      where: {
        id: deviceId,
        apiKeyId: project.id,
      },
    });

    if (!device) {
      throw new NotFoundException(`Device ${deviceId} not found`);
    }

    const updated = await this.prisma.prisma.device.update({
      where: { id: deviceId },
      data: { status: 'REVOKED' },
    });

    this.logger.log(`Device revoked: ${deviceId}`);
    return updated;
  }

  /**
   * Validate API key exists and is active
   */
  private async validateApiKey(apiKey: string) {
    if (!apiKey) {
      throw new BadRequestException('API key is required');
    }

    // Find API key by matching the full value
    const project = await this.prisma.prisma.apiKey.findFirst({
      where: {
        fullValue: apiKey,
      },
    });

    if (!project) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (project.status !== 'ACTIVE') {
      throw new UnauthorizedException('API key is not active');
    }

    return project;
  }

  /**
   * Validate public key format (basic validation)
   */
  private validatePublicKey(publicKey: string) {
    // Check if it's valid base64
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    if (!base64Regex.test(publicKey)) {
      throw new BadRequestException('Invalid public key format');
    }

    // Check reasonable length (SPKI P-256 keys are ~91 base64 chars)
    if (publicKey.length < 50 || publicKey.length > 200) {
      throw new BadRequestException('Public key length out of valid range');
    }
  }

  /**
   * Check if nonce has been used
   */
  private async checkNonceExists(
    apiKeyId: string,
    keyId: string,
    nonce: string,
  ): Promise<boolean> {
    const existing = await this.prisma.prisma.nonce.findUnique({
      where: {
        apiKeyId_keyId_nonce: {
          apiKeyId,
          keyId,
          nonce,
        },
      },
    });

    return !!existing;
  }

  /**
   * Store nonce with TTL (120 seconds)
   */
  private async storeNonce(
    apiKeyId: string,
    keyId: string,
    nonce: string,
  ): Promise<void> {
    const expiresAt = new Date(Date.now() + 120 * 1000); // 120 seconds

    await this.prisma.prisma.nonce.create({
      data: {
        apiKeyId,
        keyId,
        nonce,
        expiresAt,
      },
    });
  }

  /**
   * Clean up expired nonces (should be run periodically via cron)
   */
  async cleanupExpiredNonces(): Promise<number> {
    const result = await this.prisma.prisma.nonce.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired nonces`);
    return result.count;
  }
}
