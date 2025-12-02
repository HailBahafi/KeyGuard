import { Injectable } from '@nestjs/common';
import { createHash, createVerify } from 'crypto';

/**
 * CryptoService - Core cryptographic operations for KeyGuard
 * 
 * Handles signature verification for device-bound requests
 */
@Injectable()
export class CryptoService {
    /**
     * Verify ECDSA P-256 signature
     * 
     * @param publicKeyBase64 - Base64-encoded SPKI public key
     * @param signatureBase64 - Base64-encoded signature (IEEE-P1363 format)
     * @param payload - Canonical payload string that was signed
     * @returns true if signature is valid, false otherwise
     */
    async verifySignature(
        publicKeyBase64: string,
        signatureBase64: string,
        payload: string,
    ): Promise<boolean> {
        try {
            // Import public key from Base64 SPKI format
            const publicKeyPEM = this.base64ToPEM(publicKeyBase64, 'PUBLIC KEY');

            // Convert signature from Base64 to Buffer
            const signatureBuffer = Buffer.from(signatureBase64, 'base64');

            // Convert IEEE-P1363 format (raw 64 bytes) to DER format
            const derSignature = this.p1363ToDER(signatureBuffer);

            // Create verifier for ECDSA with P-256 curve and SHA-256
            const verifier = createVerify('SHA256');
            verifier.update(payload);
            verifier.end();

            // Verify the signature
            const isValid = verifier.verify(
                {
                    key: publicKeyPEM,
                    format: 'pem',
                    type: 'spki',
                },
                derSignature,
            );

            return isValid;
        } catch (error) {
            console.error('Signature verification failed:', error);
            return false;
        }
    }

    /**
     * Reconstruct the canonical payload that was signed by the client
     * 
     * Format: kg-v1|{timestamp}|{METHOD}|{pathAndQuery}|{bodySha256}|{nonce}|{apiKey}|{keyId}
     * 
     * @param params - Request parameters
     * @returns Canonical payload string
     */
    reconstructPayload(params: {
        timestamp: string;
        method: string;
        pathAndQuery: string;
        bodySha256: string;
        nonce: string;
        apiKey: string;
        keyId: string;
    }): string {
        const normalizedMethod = params.method.toUpperCase();

        return `kg-v1|${params.timestamp}|${normalizedMethod}|${params.pathAndQuery}|${params.bodySha256}|${params.nonce}|${params.apiKey}|${params.keyId}`;
    }

    /**
     * Hash request body with SHA-256 and return Base64
     * 
     * @param body - Request body string
     * @returns Base64-encoded SHA-256 hash
     */
    hashSha256(body: string): string {
        const hash = createHash('sha256');
        hash.update(body);
        return hash.digest('base64');
    }

    /**
     * Convert Base64-encoded key to PEM format
     * 
     * @param base64Key - Base64-encoded key
     * @param type - Key type (e.g., 'PUBLIC KEY', 'PRIVATE KEY')
     * @returns PEM-formatted key
     */
    private base64ToPEM(base64Key: string, type: string): string {
        const pemHeader = `-----BEGIN ${type}-----`;
        const pemFooter = `-----END ${type}-----`;

        // Split into 64-character lines as per PEM standard
        const lines: string[] = [];
        for (let i = 0; i < base64Key.length; i += 64) {
            lines.push(base64Key.substring(i, i + 64));
        }

        return `${pemHeader}\n${lines.join('\n')}\n${pemFooter}`;
    }

    /**
     * Convert IEEE-P1363 signature format to DER format
     * 
     * IEEE-P1363 is the raw format (r || s, each 32 bytes for P-256)
     * DER is the ASN.1 format required by Node.js crypto.verify
     * 
     * @param p1363Signature - IEEE-P1363 format signature (64 bytes)
     * @returns DER-encoded signature
     */
    private p1363ToDER(p1363Signature: Buffer): Buffer {
        if (p1363Signature.length !== 64) {
            throw new Error('Invalid P-256 signature length (expected 64 bytes)');
        }

        // Extract r and s values (each 32 bytes)
        const r = p1363Signature.subarray(0, 32);
        const s = p1363Signature.subarray(32, 64);

        // Encode r and s as DER integers
        const rDER = this.encodeInteger(r);
        const sDER = this.encodeInteger(s);

        // Combine into DER sequence
        const sequenceLength = rDER.length + sDER.length;
        const der = Buffer.concat([
            Buffer.from([0x30, sequenceLength]), // SEQUENCE tag and length
            rDER,
            sDER,
        ]);

        return der;
    }

    /**
     * Encode a big-endian integer as DER
     * 
     * @param value - Integer value as Buffer
     * @returns DER-encoded integer
     */
    private encodeInteger(value: Buffer): Buffer {
        // Remove leading zeros
        let trimmed = value;
        while (trimmed.length > 1 && trimmed[0] === 0x00) {
            trimmed = trimmed.subarray(1);
        }

        // If the high bit is set, prepend 0x00 to indicate positive number
        const firstByte = trimmed[0];
        if (firstByte !== undefined && (firstByte & 0x80) !== 0) {
            trimmed = Buffer.concat([Buffer.from([0x00]), trimmed]);
        }

        // INTEGER tag (0x02) followed by length and value
        return Buffer.concat([Buffer.from([0x02, trimmed.length]), trimmed]);
    }
}
