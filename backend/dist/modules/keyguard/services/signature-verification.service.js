"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "SignatureVerificationService", {
    enumerable: true,
    get: function() {
        return SignatureVerificationService;
    }
});
const _common = require("@nestjs/common");
const _nodecrypto = require("node:crypto");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
const subtle = _nodecrypto.webcrypto.subtle;
let SignatureVerificationService = class SignatureVerificationService {
    /**
   * Verify an ECDSA signature using WebCrypto (matches browser SDK)
   *
   * @param publicKeySpkiBase64 - Base64-encoded SPKI public key
   * @param payload - The exact payload string that was signed
   * @param signatureBase64 - Base64-encoded signature (IEEE P1363 format)
   * @returns Promise<boolean> - true if signature is valid
   */ async verifySignature(publicKeySpkiBase64, payload, signatureBase64) {
        try {
            const publicKey = await subtle.importKey('spki', this.base64ToBuffer(publicKeySpkiBase64), this.importParams, true, [
                'verify'
            ]);
            const isValid = await subtle.verify(this.verifyParams, publicKey, this.base64ToBuffer(signatureBase64), Buffer.from(payload, 'utf8'));
            this.logger.debug(`Signature verification result: ${isValid}`);
            return isValid;
        } catch (error) {
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
   */ buildCanonicalPayload(timestamp, method, pathAndQuery, bodySha256, nonce, apiKey, keyId) {
        const parts = [
            'kg-v1',
            timestamp,
            method.toUpperCase(),
            pathAndQuery,
            bodySha256,
            nonce,
            apiKey,
            keyId
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
   */ computeBodyHash(rawBody) {
        if (!rawBody || rawBody.length === 0) {
            // Empty body hash
            const hash = (0, _nodecrypto.createHash)('sha256').update('').digest('hex');
            this.logger.debug(`Computed empty body hash: ${hash}`);
            return hash;
        }
        const hash = (0, _nodecrypto.createHash)('sha256').update(rawBody).digest('hex');
        this.logger.debug(`Computed body hash: ${hash}`);
        return hash;
    }
    /**
   * Validate timestamp is within acceptable window (default 120 seconds)
   *
   * @param timestamp - ISO8601 timestamp string
   * @param windowSeconds - Time window in seconds (default: 120)
   * @returns true if timestamp is within window
   */ validateTimestamp(timestamp, windowSeconds = 120) {
        try {
            const requestTime = new Date(timestamp).getTime();
            const now = Date.now();
            const diff = Math.abs(now - requestTime);
            const isValid = diff <= windowSeconds * 1000;
            if (!isValid) {
                this.logger.warn(`Timestamp outside window: ${diff}ms (max: ${windowSeconds * 1000}ms)`);
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
   */ extractPathAndQuery(url) {
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
   */ validateAlgorithm(algorithm) {
        const supported = [
            'ECDSA_P256_SHA256_P1363'
        ];
        const isValid = supported.includes(algorithm);
        if (!isValid) {
            this.logger.warn(`Unsupported algorithm: ${algorithm}`);
        }
        return isValid;
    }
    /**
   * Convert base64 string to Buffer
   */ base64ToBuffer(base64) {
        return Buffer.from(base64, 'base64');
    }
    constructor(){
        this.logger = new _common.Logger(SignatureVerificationService.name);
        this.importParams = {
            name: 'ECDSA',
            namedCurve: 'P-256'
        };
        this.verifyParams = {
            name: 'ECDSA',
            hash: {
                name: 'SHA-256'
            }
        };
    }
};
SignatureVerificationService = _ts_decorate([
    (0, _common.Injectable)()
], SignatureVerificationService);

//# sourceMappingURL=signature-verification.service.js.map