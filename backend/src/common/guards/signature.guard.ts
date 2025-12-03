import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { CryptoService } from '../../modules/keyguard/services/crypto.service';

/**
 * SignatureGuard - Validates KeyGuard cryptographic signatures
 * 
 * Protects endpoints by verifying device-bound request signatures
 */
@Injectable()
export class SignatureGuard implements CanActivate {
    // TODO: Replace with database lookup once device enrollment is implemented
    // For now, using hardcoded public key for testing
    // You can generate a test key pair by running: node test.js
    private readonly HARDCODED_PUBLIC_KEY = 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEyw2fLJBv+YxDdd8ZTK795LX11MTcvhC0YZ2pTO84lsR+IllKguWHJ8ZxCF3a9VA3iw4LE1cGtElypNhWF2bFmA==';

    private readonly TIME_WINDOW_SECONDS = 10;

    constructor(private readonly cryptoService: CryptoService) { }

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

        // Validate timestamp is within acceptable time window
        this.validateTimestamp(timestamp);

        // Reconstruct the canonical payload
        const method = request.method;
        const url = request.url;

        // Extract path and query from URL
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

        // Verify the signature
        const isValid = await this.cryptoService.verifySignature(
            this.HARDCODED_PUBLIC_KEY,
            signature,
            payload,
        );

        if (!isValid) {
            throw new UnauthorizedException('Invalid signature');
        }

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
