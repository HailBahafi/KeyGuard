"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "KeyGuardService", {
    enumerable: true,
    get: function() {
        return KeyGuardService;
    }
});
const _common = require("@nestjs/common");
const _prismaservice = require("../../../core/database/prisma.service");
const _signatureverificationservice = require("./signature-verification.service");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function _ts_metadata(k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
}
let KeyGuardService = class KeyGuardService {
    /**
   * Enroll a new device by storing its public key
   *
   * @param apiKey - Project API key from header
   * @param enrollDto - Enrollment data from SDK
   * @returns Device ID and status
   */ async enrollDevice(apiKey, enrollDto) {
        this.logger.log(`Enrolling device with keyId: ${enrollDto.keyId}`);
        // Validate API key and get project
        const project = await this.validateApiKey(apiKey);
        // Check if device with same keyId already exists
        const existingDevice = await this.prisma.prisma.device.findUnique({
            where: {
                apiKeyId_keyId: {
                    apiKeyId: project.id,
                    keyId: enrollDto.keyId
                }
            }
        });
        if (existingDevice) {
            throw new _common.BadRequestException(`Device with keyId ${enrollDto.keyId} already enrolled`);
        }
        // Validate public key format (basic check)
        this.validatePublicKey(enrollDto.publicKey);
        // Create device record
        const deviceData = {
            keyId: enrollDto.keyId,
            publicKeySpkiBase64: enrollDto.publicKey,
            fingerprint: enrollDto.deviceFingerprint,
            label: enrollDto.label,
            status: 'ACTIVE',
            apiKey: {
                connect: {
                    id: project.id
                }
            }
        };
        // Only add optional fields if they exist
        if (enrollDto.userAgent) {
            deviceData.userAgent = enrollDto.userAgent;
        }
        if (enrollDto.metadata) {
            deviceData.metadata = enrollDto.metadata;
        }
        const device = await this.prisma.prisma.device.create({
            data: deviceData
        });
        this.logger.log(`Device enrolled successfully: ${device.id}`);
        return {
            id: device.id,
            status: device.status,
            createdAt: device.createdAt
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
   */ async verifyRequest(headers, method, url, rawBody) {
        try {
            this.logger.log(`Verifying request for keyId: ${headers.keyId}, apiKey: ${headers.apiKey}`);
            // 1. Validate algorithm
            if (!this.signatureVerification.validateAlgorithm(headers.algorithm)) {
                return {
                    valid: false,
                    error: `Unsupported algorithm: ${headers.algorithm}`
                };
            }
            // 2. Validate timestamp (120 second window)
            if (!this.signatureVerification.validateTimestamp(headers.timestamp)) {
                return {
                    valid: false,
                    error: 'Request timestamp outside valid window'
                };
            }
            // 3. Validate API key and get project
            const project = await this.validateApiKey(headers.apiKey);
            // 4. Get device and public key
            const device = await this.prisma.prisma.device.findUnique({
                where: {
                    apiKeyId_keyId: {
                        apiKeyId: project.id,
                        keyId: headers.keyId
                    }
                }
            });
            if (!device) {
                return {
                    valid: false,
                    error: `Device with keyId ${headers.keyId} not found`
                };
            }
            if (device.status !== 'ACTIVE') {
                return {
                    valid: false,
                    error: `Device status is ${device.status}`
                };
            }
            // 5. Check nonce uniqueness (replay protection)
            const nonceExists = await this.checkNonceExists(project.id, headers.keyId, headers.nonce);
            if (nonceExists) {
                return {
                    valid: false,
                    error: 'Nonce has already been used (replay attack detected)'
                };
            }
            // 6. Compute body hash and compare
            const computedBodyHash = this.signatureVerification.computeBodyHash(rawBody);
            if (computedBodyHash !== headers.bodySha256) {
                this.logger.warn(`Body hash mismatch. Expected: ${headers.bodySha256}, Got: ${computedBodyHash}`);
                return {
                    valid: false,
                    error: 'Body hash mismatch'
                };
            }
            // 7. Build canonical payload
            const pathAndQuery = this.signatureVerification.extractPathAndQuery(url);
            const canonicalPayload = this.signatureVerification.buildCanonicalPayload(headers.timestamp, method, pathAndQuery, headers.bodySha256, headers.nonce, headers.apiKey, headers.keyId);
            // 8. Verify signature
            const isValid = await this.signatureVerification.verifySignature(device.publicKeySpkiBase64, canonicalPayload, headers.signature);
            if (!isValid) {
                return {
                    valid: false,
                    error: 'Invalid signature'
                };
            }
            // 9. Store nonce to prevent replay (TTL: 120 seconds)
            await this.storeNonce(project.id, headers.keyId, headers.nonce);
            // 10. Update last seen timestamp
            await this.prisma.prisma.device.update({
                where: {
                    id: device.id
                },
                data: {
                    lastSeenAt: new Date()
                }
            });
            this.logger.log(`Request verified successfully for device: ${device.id}`);
            return {
                valid: true,
                deviceId: device.id,
                keyId: device.keyId
            };
        } catch (error) {
            this.logger.error('Verification error:', error);
            return {
                valid: false,
                error: error instanceof Error ? error.message : 'Verification failed'
            };
        }
    }
    /**
   * Get device by ID
   */ async getDevice(deviceId) {
        const device = await this.prisma.prisma.device.findUnique({
            where: {
                id: deviceId
            },
            include: {
                apiKey: true
            }
        });
        if (!device) {
            throw new _common.NotFoundException(`Device ${deviceId} not found`);
        }
        return device;
    }
    /**
   * List all devices for an API key
   */ async listDevices(apiKey) {
        const project = await this.validateApiKey(apiKey);
        const devices = await this.prisma.prisma.device.findMany({
            where: {
                apiKeyId: project.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return devices;
    }
    /**
   * Revoke a device
   */ async revokeDevice(apiKey, deviceId) {
        const project = await this.validateApiKey(apiKey);
        const device = await this.prisma.prisma.device.findFirst({
            where: {
                id: deviceId,
                apiKeyId: project.id
            }
        });
        if (!device) {
            throw new _common.NotFoundException(`Device ${deviceId} not found`);
        }
        const updated = await this.prisma.prisma.device.update({
            where: {
                id: deviceId
            },
            data: {
                status: 'REVOKED'
            }
        });
        this.logger.log(`Device revoked: ${deviceId}`);
        return updated;
    }
    /**
   * Validate API key exists and is active
   */ async validateApiKey(apiKey) {
        if (!apiKey) {
            throw new _common.BadRequestException('API key is required');
        }
        // Extract key prefix (e.g., kg_prod_123 -> kg_prod)
        const keyPrefix = apiKey.split('_').slice(0, 2).join('_');
        const project = await this.prisma.prisma.apiKey.findFirst({
            where: {
                keyPrefix
            }
        });
        if (!project) {
            throw new _common.UnauthorizedException('Invalid API key');
        }
        if (project.status !== 'ACTIVE') {
            throw new _common.UnauthorizedException('API key is not active');
        }
        return project;
    }
    /**
   * Validate public key format (basic validation)
   */ validatePublicKey(publicKey) {
        // Check if it's valid base64
        const base64Regex = /^[A-Za-z0-9+/]+=*$/;
        if (!base64Regex.test(publicKey)) {
            throw new _common.BadRequestException('Invalid public key format');
        }
        // Check reasonable length (SPKI P-256 keys are ~91 base64 chars)
        if (publicKey.length < 50 || publicKey.length > 200) {
            throw new _common.BadRequestException('Public key length out of valid range');
        }
    }
    /**
   * Check if nonce has been used
   */ async checkNonceExists(apiKeyId, keyId, nonce) {
        const existing = await this.prisma.prisma.nonce.findUnique({
            where: {
                apiKeyId_keyId_nonce: {
                    apiKeyId,
                    keyId,
                    nonce
                }
            }
        });
        return !!existing;
    }
    /**
   * Store nonce with TTL (120 seconds)
   */ async storeNonce(apiKeyId, keyId, nonce) {
        const expiresAt = new Date(Date.now() + 120 * 1000); // 120 seconds
        await this.prisma.prisma.nonce.create({
            data: {
                apiKeyId,
                keyId,
                nonce,
                expiresAt
            }
        });
    }
    /**
   * Clean up expired nonces (should be run periodically via cron)
   */ async cleanupExpiredNonces() {
        const result = await this.prisma.prisma.nonce.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date()
                }
            }
        });
        this.logger.log(`Cleaned up ${result.count} expired nonces`);
        return result.count;
    }
    constructor(prisma, signatureVerification){
        this.prisma = prisma;
        this.signatureVerification = signatureVerification;
        this.logger = new _common.Logger(KeyGuardService.name);
    }
};
KeyGuardService = _ts_decorate([
    (0, _common.Injectable)(),
    _ts_metadata("design:type", Function),
    _ts_metadata("design:paramtypes", [
        typeof _prismaservice.PrismaService === "undefined" ? Object : _prismaservice.PrismaService,
        typeof _signatureverificationservice.SignatureVerificationService === "undefined" ? Object : _signatureverificationservice.SignatureVerificationService
    ])
], KeyGuardService);

//# sourceMappingURL=keyguard.service.js.map