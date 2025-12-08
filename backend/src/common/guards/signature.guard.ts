import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { RedisService } from '../../core/cache/redis.service';
import { PrismaService } from '../../core/database/prisma.service';
import { CryptoService } from '../../modules/keyguard/services/crypto.service';

/**
 * SignatureGuard - Validates KeyGuard cryptographic signatures
 *
 * Protects endpoints by verifying device-bound request signatures with:
 * - Database lookup for device public key (no hardcoded keys)
 * - Redis-based nonce replay protection
 * - Timestamp validation
 */
@Injectable()
export class SignatureGuard implements CanActivate {
    private readonly logger = new Logger(SignatureGuard.name);
    private readonly TIME_WINDOW_SECONDS = 120; // Match with verify-test window

    constructor(
        private readonly cryptoService: CryptoService,
        private readonly prisma: PrismaService,
        private readonly redis: RedisService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<FastifyRequest>();

        // Extract KeyGuard headers
        const signature = this.getHeader(request, 'x-keyguard-signature');
        const timestamp = this.getHeader(request, 'x-keyguard-timestamp');
        const nonce = this.getHeader(request, 'x-keyguard-nonce');
        const bodySha256 = this.getHeader(request, 'x-keyguard-body-sha256');
        const keyId = this.getHeader(request, 'x-keyguard-key-id');
        const apiKey = this.getHeader(request, 'x-keyguard-api-key');

        // Validate all required headers are present
        if (!signature || !timestamp || !nonce || !bodySha256 || !keyId || !apiKey) {
            throw new UnauthorizedException('Missing required KeyGuard headers');
        }

        // 1. Validate API key and get project
        const project = await this.prisma.prisma.apiKey.findFirst({
            where: { fullValue: apiKey },
        });

        if (!project || project.status !== 'ACTIVE') {
            throw new UnauthorizedException('Invalid or inactive API key');
        }

        // 2. Get device from database using keyId
        const device = await this.prisma.prisma.device.findFirst({
            where: {
                apiKeyId: project.id,
                keyId: keyId,
            },
        });

        if (!device) {
            this.logger.warn(`Device with keyId ${keyId} not found`);
            throw new UnauthorizedException('Device not found');
        }

        if (device.status !== 'ACTIVE') {
            this.logger.warn(`Device ${device.id} is ${device.status}`);
            throw new UnauthorizedException(`Device is ${device.status}`);
        }

        if (!device.publicKeySpkiBase64) {
            this.logger.error(`Device ${device.id} has no public key`);
            throw new UnauthorizedException('Device has no public key');
        }

        // 3. Check nonce for replay protection using Redis SET NX
        const nonceKey = `nonce:${project.id}:${keyId}:${nonce}`;
        const isNewNonce = await this.redis.storeNonceIfNotExists(nonceKey, this.TIME_WINDOW_SECONDS);

        if (!isNewNonce) {
            this.logger.warn(`Replay attack detected: nonce ${nonce} already used`);
            throw new UnauthorizedException('Nonce has already been used (replay attack detected)');
        }

        // 4. Validate timestamp is within acceptable time window
        this.validateTimestamp(timestamp);

        // 5. Reconstruct the canonical payload
        const method = request.method;
        const url = request.url;
        const pathAndQuery = this.extractPathAndQuery(url);

        const payload = this.cryptoService.reconstructPayload({
            timestamp,
            method,
            pathAndQuery,
            bodySha256,
            nonce,
            apiKey,
            keyId,
        });

        // 6. Verify the signature using device's public key from DB
        const isValid = await this.cryptoService.verifySignature(
            device.publicKeySpkiBase64,
            signature,
            payload,
        );

        if (!isValid) {
            this.logger.warn(`Invalid signature for device ${device.id}`);
            throw new UnauthorizedException('Invalid signature');
        }

        // 7. Update last seen timestamp
        await this.prisma.prisma.device.update({
            where: { id: device.id },
            data: { lastSeen: new Date() },
        }).catch((err: Error) => {
            this.logger.error(`Failed to update lastSeen for device ${device.id}: ${err.message}`);
        });

        this.logger.log(`Request verified successfully for device ${device.id}`);
        return true;
    }

    /**
     * Get header value from request (case-insensitive)
     */
    private getHeader(request: FastifyRequest, headerName: string): string | undefined {
        const value = request.headers[headerName.toLowerCase()];
        return Array.isArray(value) ? value[0] : value;
    }

    /**
     * Validate timestamp is within acceptable time window
     */
    private validateTimestamp(timestamp: string): void {
        try {
            const requestTime = new Date(timestamp).getTime();
            const currentTime = Date.now();
            const diffSeconds = Math.abs(currentTime - requestTime) / 1000;

            if (diffSeconds > this.TIME_WINDOW_SECONDS) {
                throw new UnauthorizedException(
                    `Request timestamp outside acceptable window (${this.TIME_WINDOW_SECONDS}s)`,
                );
            }
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Invalid timestamp format');
        }
    }

    /**
     * Extract path and query from URL
     */
    private extractPathAndQuery(url: string): string {
        // URL already includes path and query (e.g., "/api/v1/verify-test?foo=bar")
        // If it starts with full URL, parse it
        if (url.startsWith('http://') || url.startsWith('https://')) {
            try {
                const urlObj = new URL(url);
                return urlObj.pathname + urlObj.search;
            } catch {
                return url;
            }
        }
        return url;
    }
}
