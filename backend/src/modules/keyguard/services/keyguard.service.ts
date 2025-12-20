import { PrismaService } from '@/src/core/database/prisma.service';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';
import {
  EnrollDeviceDto,
  EnrollResponseDto,
  KeyGuardHeaders,
  VerifyResponseDto,
} from '../dto';
import { SignatureVerificationService } from './signature-verification.service';
/**
 * Main KeyGuard service handling device enrollment and signature verification
 */
@Injectable()
export class KeyGuardService {
  private readonly logger = new Logger(KeyGuardService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly signatureVerification: SignatureVerificationService,
    private readonly auditLogsService: AuditLogsService,
  ) { }
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
    // Check if device with same fingerprint already exists (idempotent re-enrollment)
    const existingDevice = await this.prisma.prisma.device.findUnique({
      where: {
        fingerprintHash: enrollDto.deviceFingerprint,
      },
    });
    if (existingDevice) {
      // Idempotent: return existing device instead of throwing error
      this.logger.log(`Device already enrolled, returning existing: ${existingDevice.id} (status: ${existingDevice.status})`);
      return {
        id: existingDevice.id,
        status: existingDevice.status,
        createdAt: existingDevice.createdAt,
      };
    }
    // Validate public key format (basic check)
    this.validatePublicKey(enrollDto.publicKey);
    // Determine device status based on enrollment code
    let deviceStatus: 'ACTIVE' | 'PENDING' = 'PENDING';
    let enrollmentCodeId: string | undefined;
    if (enrollDto.enrollmentCode) {
      this.logger.log(`Verifying enrollment code: ${enrollDto.enrollmentCode}`);
      // Look up enrollment code in database
      const enrollmentCode = await this.prisma.prisma.enrollmentCode.findUnique({
        where: { code: enrollDto.enrollmentCode },
      });
      // Validate enrollment code
      if (enrollmentCode && !enrollmentCode.used && (enrollmentCode.expiresAt === null || enrollmentCode.expiresAt > new Date())) {
        this.logger.log(`Valid enrollment code found, setting device status to ACTIVE`);
        deviceStatus = 'ACTIVE';
        enrollmentCodeId = enrollmentCode.id;
        // Mark code as used
        await this.prisma.prisma.enrollmentCode.update({
          where: { id: enrollmentCode.id },
          data: {
            used: true,
            usedAt: new Date(),
          },
        });
      } else {
        this.logger.warn(`Invalid or expired enrollment code: ${enrollDto.enrollmentCode}`);
        // Device will remain PENDING for manual approval
      }
    } else {
      this.logger.log('No enrollment code provided, device status set to PENDING');
    }
    // Create device record with new schema
    const device = await this.prisma.prisma.device.create({
      data: {
        name: enrollDto.label || 'Unnamed Device',
        fingerprintHash: enrollDto.deviceFingerprint,
        status: deviceStatus,
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
    this.logger.log(`Device enrolled successfully: ${device.id} (status: ${deviceStatus})`);
    // Log device enrollment
    try {
      await this.auditLogsService.createLog({
        event: 'device.enrolled',
        severity: 'info',
        status: 'success',
        actorId: device.id,
        actorName: device.name,
        actorType: 'device',
        actorIp: device.ipAddress,
        actorLocation: device.location,
        targetId: project.id,
        targetName: project.name,
        targetType: 'api_key',
        metadata: {
          keyId: device.keyId,
          fingerprint: device.fingerprintHash,
          platform: enrollDto.metadata,
          enrollmentCodeUsed: !!enrollmentCodeId,
          enrollmentCodeId,
          initialStatus: deviceStatus,
        },
        deviceId: device.id,
        apiKeyId: project.id,
      });
    } catch (error) {
      this.logger.error(`Failed to create audit log for enrollment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
        `Verifying request for keyId: ${headers.keyId}`,
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
      // 4. Get device and public key
      const device = await this.prisma.prisma.device.findFirst({
        where: {
          keyId: headers.keyId,
        },
        include: {
          apiKey: true,
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
      const project = await this.validateApiKey(headers.apiKey);
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
          headers.apiKey,  // Use raw API key from request header for signature verification
          headers.keyId,
        );
      // 8. Verify signature
      const isValid = await this.signatureVerification.verifySignature(
        device.publicKeySpkiBase64 ?? '',
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
        keyId: device.keyId ?? '',
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
    // Log device revocation
    try {
      await this.auditLogsService.createLog({
        event: 'device.revoked',
        severity: 'warning',
        status: 'success',
        actorId: 'system',
        actorName: 'System',
        actorType: 'system',
        actorIp: '0.0.0.0',
        targetId: deviceId,
        targetName: updated.name,
        targetType: 'device',
        metadata: {
          keyId: updated.keyId,
          previousStatus: device.status,
        },
        deviceId,
        apiKeyId: project.id,
      });
    } catch (error) {
      this.logger.error(`Failed to create audit log for revocation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    return updated;
  }
  /**
   * Validate API key exists and is active
   * Uses bcrypt comparison since fullValue stores hashed keys
   */
  private async validateApiKey(apiKey: string) {
    if (!apiKey) {
      throw new BadRequestException('API key is required');
    }

    // Get all active API keys for comparison
    // Note: This is necessary because we store bcrypt hashes in fullValue
    const activeKeys = await this.prisma.prisma.apiKey.findMany({
      where: {
        status: 'ACTIVE',
      },
    });

    // Compare provided key against each stored hash
    for (const project of activeKeys) {
      try {
        // Use bcrypt to compare the provided key against the stored hash
        const bcrypt = await import('bcryptjs');
        const isMatch = await bcrypt.compare(apiKey, project.fullValue);
        if (isMatch) {
          return project;
        }
      } catch (error) {
        // If comparison fails, continue to next key
        this.logger.debug(`API key comparison failed for ${project.id}: ${error}`);
      }
    }

    throw new UnauthorizedException('Invalid API key');
  }
  /**
   * Validate public key format (basic validation)
   */
  private validatePublicKey(publicKey: string) {
    // Clean the public key
    const cleanedKey = publicKey.trim().replace(/\s/g, '');
    // Check if it's valid base64
    const base64Regex = /^[A-Za-z0-9+/]+=*$/;
    if (!base64Regex.test(cleanedKey)) {
      throw new BadRequestException('Invalid public key format: not valid base64');
    }
    // Check reasonable length (SPKI P-256 keys are ~91 base64 chars)
    if (cleanedKey.length < 50 || cleanedKey.length > 200) {
      throw new BadRequestException('Public key length out of valid range');
    }
    // Try to decode and validate SPKI format
    try {
      const buffer = Buffer.from(cleanedKey, 'base64');
      // SPKI format validation:
      // - Must start with 0x30 (SEQUENCE tag)
      // - For P-256 keys, typical length is 91 bytes
      if (buffer.length < 50) {
        throw new BadRequestException('Public key buffer too short');
      }
      if (buffer[0] !== 0x30) {
        throw new BadRequestException('Invalid SPKI format: missing SEQUENCE tag');
      }
      this.logger.debug(`Public key validated: ${buffer.length} bytes`);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to decode public key: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
