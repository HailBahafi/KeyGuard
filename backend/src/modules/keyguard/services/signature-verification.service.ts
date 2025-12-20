import { Injectable, Logger } from '@nestjs/common';
import { createHash, webcrypto } from 'node:crypto';

const subtle = webcrypto.subtle;

/**
 * Service responsible for cryptographic signature verification
 * using ECDSA P-256 with SHA-256 (IEEE P1363 format)
 */
@Injectable()
export class SignatureVerificationService {
  private readonly logger = new Logger(SignatureVerificationService.name);

  private readonly importParams: EcKeyImportParams = {
    name: 'ECDSA',
    namedCurve: 'P-256',
  };

  private readonly verifyParams: EcdsaParams = {
    name: 'ECDSA',
    hash: { name: 'SHA-256' },
  };

  /**
   * Verify an ECDSA signature using WebCrypto (matches browser SDK)
   *
   * @param publicKeySpkiBase64 - Base64-encoded SPKI public key
   * @param payload - The exact payload string that was signed
   * @param signatureBase64 - Base64-encoded signature (IEEE P1363 format)
   * @returns Promise<boolean> - true if signature is valid
   */
  async verifySignature(
    publicKeySpkiBase64: string,
    payload: string,
    signatureBase64: string,
  ): Promise<boolean> {
    try {

      console.log({
        spki: 'spki',
        buffer: this.base64ToBuffer(publicKeySpkiBase64),
        importParams: this.importParams,
        extractable: true,
        keyUsages: ['verify'],
      })
            // Clean and validate the base64 string
      const cleanedPublicKey = publicKeySpkiBase64.trim().replace(/\s/g, '');

      if (!cleanedPublicKey) {
        this.logger.error('Public key is empty');
        return false;
      }

      // Convert base64 to buffer with validation
      let publicKeyBuffer: Buffer;
      try {
        publicKeyBuffer = Buffer.from(cleanedPublicKey, 'base64');
      } catch (bufferError) {
        this.logger.error('Failed to decode base64 public key:', bufferError);
        return false;
      }

      // Validate SPKI format (should start with 0x30 for DER SEQUENCE)
      if (publicKeyBuffer.length < 50 || publicKeyBuffer[0] !== 0x30) {
        this.logger.error('Invalid SPKI format: buffer does not start with SEQUENCE tag');
        return false;
      }

      this.logger.debug(`Public key buffer length: ${publicKeyBuffer.length} bytes`);

      // Import the public key
      const publicKey = await subtle.importKey(
        'spki',
        publicKeyBuffer,
        this.importParams,
        true,
        ['verify'],
      );

      // Verify the signature
      const isValid = await subtle.verify(
        this.verifyParams,
        publicKey,
        this.base64ToBuffer(signatureBase64),
        Buffer.from(payload, 'utf8'),
      );
      // console.log({
      //   isValid,
      //   payload,
      //   signatureBase64,
      //   publicKeySpkiBase64,
      // });

      this.logger.debug(`Signature verification result: ${isValid}`);
      return isValid;
    } catch (error) {
      console.log("here: ");
      console.dir(error, { depth: null });
      this.logger.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Build the canonical payload string that must match the SDK's signed payload
   *
   * Format: kg-v1|{timestamp}|{METHOD}|{pathAndQuery}|{bodySha256}|{nonce}|{apiKey}|{keyId}
   *
   * @param timestamp - ISO8601 timestamp
   * @param method - HTTP method (uppercase)
   * @param pathAndQuery - Path and query string (e.g., /api/v1/enroll?foo=bar)
   * @param bodySha256 - SHA-256 hash of raw body bytes (hex string)
   * @param nonce - Unique nonce
   * @param apiKey - Project API key
   * @param keyId - Device key identifier
   * @returns Canonical payload string
   */
  buildCanonicalPayload(
    timestamp: string,
    method: string,
    pathAndQuery: string,
    bodySha256: string,
    nonce: string,
    apiKey: string,
    keyId: string,
  ): string {
    const parts = [
      'kg-v1',
      timestamp,
      method.toUpperCase(),
      pathAndQuery,
      bodySha256,
      nonce,
      apiKey,
      keyId,
    ];

    const payload = parts.join('|');
    this.logger.debug(`Built canonical payload: ${payload}`);
    return payload;
  }

  /**
   * Compute SHA-256 hash of raw body bytes
   *
   * @param rawBody - Raw body buffer
   * @returns Hex string of SHA-256 hash
   */
  computeBodyHash(rawBody: Buffer | null): string {
    if (!rawBody || rawBody.length === 0) {
      // Empty body hash - SDK uses Base64 encoding
      const hash = createHash('sha256').update('').digest('base64');
      this.logger.debug(`Computed empty body hash: ${hash}`);
      return hash;
    }

    // SDK uses Base64 encoding for body hash
    const hash = createHash('sha256').update(rawBody).digest('base64');
    this.logger.debug(`Computed body hash: ${hash}`);
    return hash;
  }

  /**
   * Validate timestamp is within acceptable window (default 120 seconds)
   *
   * @param timestamp - ISO8601 timestamp string
   * @param windowSeconds - Time window in seconds (default: 120)
   * @returns true if timestamp is within window
   */
  validateTimestamp(timestamp: string, windowSeconds = 120): boolean {
    try {
      const requestTime = new Date(timestamp).getTime();
      const now = Date.now();
      const diff = Math.abs(now - requestTime);

      const isValid = diff <= windowSeconds * 1000;

      if (!isValid) {
        this.logger.warn(
          `Timestamp outside window: ${diff}ms (max: ${windowSeconds * 1000}ms)`,
        );
      }

      return isValid;
    } catch (error) {
      this.logger.error('Invalid timestamp format:', error);
      return false;
    }
  }

  /**
   * Extract path and query from URL (no scheme/host)
   *
   * @param url - Full URL or path
   * @returns Path and query string (e.g., /api/v1/test?foo=bar)
   */
  extractPathAndQuery(url: string): string {
    try {
      // If it's a full URL, parse it
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const parsed = new URL(url);
        return parsed.pathname + parsed.search;
      }

      // Already a path
      return url;
    } catch (error) {
      this.logger.error('Failed to extract path and query:', error);
      return url;
    }
  }

  /**
   * Validate the algorithm matches expected value
   *
   * @param algorithm - Algorithm from header
   * @returns true if algorithm is supported
   */
  validateAlgorithm(algorithm: string): boolean {
    const supported = ['ECDSA_P256_SHA256_P1363'];
    const isValid = supported.includes(algorithm);

    if (!isValid) {
      this.logger.warn(`Unsupported algorithm: ${algorithm}`);
    }

    return isValid;
  }

  /**
   * Convert base64 string to Buffer
   */
  private base64ToBuffer(base64: string): Buffer {
    return Buffer.from(base64, 'base64');
  }
}
