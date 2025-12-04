"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _testing = require("@nestjs/testing");
const _signatureverificationservice = require("./signature-verification.service");
const _nodecrypto = require("node:crypto");
describe('SignatureVerificationService', ()=>{
    let service;
    // Test keys generated for testing
    const testPublicKeyBase64 = 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEhKMl+ER0xKjBBHdGKn8V0eKF2VwmzYfqLQQp7gxYQVW5tLxI+YwZx8gLYQzCf+9hZF8dZzWYGQhLxLVJGxhZEw==';
    beforeEach(async ()=>{
        const module = await _testing.Test.createTestingModule({
            providers: [
                _signatureverificationservice.SignatureVerificationService
            ]
        }).compile();
        service = module.get(_signatureverificationservice.SignatureVerificationService);
    });
    it('should be defined', ()=>{
        expect(service).toBeDefined();
    });
    describe('buildCanonicalPayload', ()=>{
        it('should build correct canonical payload', ()=>{
            const timestamp = '2025-12-02T10:30:00.000Z';
            const method = 'POST';
            const pathAndQuery = '/api/v1/enroll';
            const bodySha256 = 'abc123';
            const nonce = 'nonce123';
            const apiKey = 'kg_prod_123';
            const keyId = 'key_abc';
            const payload = service.buildCanonicalPayload(timestamp, method, pathAndQuery, bodySha256, nonce, apiKey, keyId);
            expect(payload).toBe('kg-v1|2025-12-02T10:30:00.000Z|POST|/api/v1/enroll|abc123|nonce123|kg_prod_123|key_abc');
        });
        it('should uppercase HTTP method', ()=>{
            const payload = service.buildCanonicalPayload('2025-12-02T10:30:00.000Z', 'post', '/api/v1/test', 'hash', 'nonce', 'api_key', 'key_id');
            expect(payload).toContain('|POST|');
        });
    });
    describe('computeBodyHash', ()=>{
        it('should compute SHA-256 hash of body', ()=>{
            const body = Buffer.from('{"test":"data"}', 'utf8');
            const hash = service.computeBodyHash(body);
            // Expected hash for {"test":"data"}
            expect(hash).toBe('0e3ee8634d03a0ba7db6fe5b7f0ad2a4fef45a5c3bfa8d7dc57b6f3c4dbe5e4f');
            expect(hash.length).toBe(64); // SHA-256 hex length
        });
        it('should handle empty body', ()=>{
            const hash = service.computeBodyHash(null);
            // Expected hash for empty string
            expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
        });
        it('should handle empty buffer', ()=>{
            const hash = service.computeBodyHash(Buffer.from(''));
            // Expected hash for empty string
            expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
        });
    });
    describe('validateTimestamp', ()=>{
        it('should accept timestamp within window', ()=>{
            const now = new Date();
            const timestamp = now.toISOString();
            const isValid = service.validateTimestamp(timestamp, 120);
            expect(isValid).toBe(true);
        });
        it('should reject timestamp outside window', ()=>{
            const past = new Date(Date.now() - 200 * 1000); // 200 seconds ago
            const timestamp = past.toISOString();
            const isValid = service.validateTimestamp(timestamp, 120);
            expect(isValid).toBe(false);
        });
        it('should accept future timestamp within window', ()=>{
            const future = new Date(Date.now() + 60 * 1000); // 60 seconds in future
            const timestamp = future.toISOString();
            const isValid = service.validateTimestamp(timestamp, 120);
            expect(isValid).toBe(true);
        });
        it('should reject invalid timestamp format', ()=>{
            const isValid = service.validateTimestamp('invalid-date');
            expect(isValid).toBe(false);
        });
    });
    describe('extractPathAndQuery', ()=>{
        it('should extract path and query from full URL', ()=>{
            const url = 'https://example.com/api/v1/test?foo=bar';
            const result = service.extractPathAndQuery(url);
            expect(result).toBe('/api/v1/test?foo=bar');
        });
        it('should handle path without query', ()=>{
            const url = 'https://example.com/api/v1/test';
            const result = service.extractPathAndQuery(url);
            expect(result).toBe('/api/v1/test');
        });
        it('should return path if already just a path', ()=>{
            const url = '/api/v1/test?foo=bar';
            const result = service.extractPathAndQuery(url);
            expect(result).toBe('/api/v1/test?foo=bar');
        });
        it('should handle HTTP URLs', ()=>{
            const url = 'http://localhost:3000/api/v1/test';
            const result = service.extractPathAndQuery(url);
            expect(result).toBe('/api/v1/test');
        });
    });
    describe('validateAlgorithm', ()=>{
        it('should accept supported algorithm', ()=>{
            const isValid = service.validateAlgorithm('ECDSA_P256_SHA256_P1363');
            expect(isValid).toBe(true);
        });
        it('should reject unsupported algorithm', ()=>{
            const isValid = service.validateAlgorithm('ECDSA_P384_SHA384');
            expect(isValid).toBe(false);
        });
        it('should reject empty algorithm', ()=>{
            const isValid = service.validateAlgorithm('');
            expect(isValid).toBe(false);
        });
    });
    describe('verifySignature', ()=>{
        let publicKey;
        let privateKey;
        let publicKeyBase64;
        beforeEach(async ()=>{
            // Generate a test key pair
            const keyPair = await _nodecrypto.webcrypto.subtle.generateKey({
                name: 'ECDSA',
                namedCurve: 'P-256'
            }, true, [
                'sign',
                'verify'
            ]);
            publicKey = keyPair.publicKey;
            privateKey = keyPair.privateKey;
            // Export public key to SPKI format
            const publicKeyBuffer = await _nodecrypto.webcrypto.subtle.exportKey('spki', publicKey);
            publicKeyBase64 = Buffer.from(publicKeyBuffer).toString('base64');
        });
        it('should verify valid signature', async ()=>{
            const payload = 'kg-v1|2025-12-02T10:30:00.000Z|POST|/api/v1/test|hash|nonce|api|key';
            // Sign the payload
            const signature = await _nodecrypto.webcrypto.subtle.sign({
                name: 'ECDSA',
                hash: {
                    name: 'SHA-256'
                }
            }, privateKey, Buffer.from(payload, 'utf8'));
            const signatureBase64 = Buffer.from(signature).toString('base64');
            // Verify
            const isValid = await service.verifySignature(publicKeyBase64, payload, signatureBase64);
            expect(isValid).toBe(true);
        });
        it('should reject invalid signature', async ()=>{
            const payload = 'kg-v1|2025-12-02T10:30:00.000Z|POST|/api/v1/test|hash|nonce|api|key';
            const invalidSignature = Buffer.from('invalid-signature').toString('base64');
            const isValid = await service.verifySignature(publicKeyBase64, payload, invalidSignature);
            expect(isValid).toBe(false);
        });
        it('should reject signature with modified payload', async ()=>{
            const originalPayload = 'kg-v1|2025-12-02T10:30:00.000Z|POST|/api/v1/test|hash|nonce|api|key';
            // Sign original payload
            const signature = await _nodecrypto.webcrypto.subtle.sign({
                name: 'ECDSA',
                hash: {
                    name: 'SHA-256'
                }
            }, privateKey, Buffer.from(originalPayload, 'utf8'));
            const signatureBase64 = Buffer.from(signature).toString('base64');
            // Verify with modified payload
            const modifiedPayload = 'kg-v1|2025-12-02T10:30:00.000Z|POST|/api/v1/test|modified|nonce|api|key';
            const isValid = await service.verifySignature(publicKeyBase64, modifiedPayload, signatureBase64);
            expect(isValid).toBe(false);
        });
        it('should reject signature with invalid public key', async ()=>{
            const payload = 'kg-v1|2025-12-02T10:30:00.000Z|POST|/api/v1/test|hash|nonce|api|key';
            // Sign the payload
            const signature = await _nodecrypto.webcrypto.subtle.sign({
                name: 'ECDSA',
                hash: {
                    name: 'SHA-256'
                }
            }, privateKey, Buffer.from(payload, 'utf8'));
            const signatureBase64 = Buffer.from(signature).toString('base64');
            // Try to verify with different public key
            const invalidPublicKey = testPublicKeyBase64;
            const isValid = await service.verifySignature(invalidPublicKey, payload, signatureBase64);
            expect(isValid).toBe(false);
        });
    });
});

//# sourceMappingURL=signature-verification.service.spec.js.map