/**
 * KeyGuard SDK - Crypto Module Tests
 * 
 * These tests verify the core cryptographic functionality:
 * - Key pair generation (ECDSA P-256)
 * - Payload signing
 * - SHA-256 hashing
 * - Nonce generation
 * - Payload canonicalization
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { CryptoManager, arrayBufferToBase64, base64ToArrayBuffer } from './crypto';

describe('CryptoManager', () => {
  let crypto: CryptoManager;

  beforeEach(() => {
    crypto = new CryptoManager();
  });

  describe('generateKeyPair', () => {
    it('should generate a valid ECDSA P-256 key pair', async () => {
      const keyPair = await crypto.generateKeyPair();

      expect(keyPair).toBeDefined();
      expect(keyPair.publicKey).toBeDefined();
      expect(keyPair.privateKey).toBeDefined();
    });

    it('should generate a public key of type "public"', async () => {
      const keyPair = await crypto.generateKeyPair();

      expect(keyPair.publicKey.type).toBe('public');
      expect(keyPair.publicKey.algorithm.name).toBe('ECDSA');
    });

    it('should generate a non-extractable private key', async () => {
      const keyPair = await crypto.generateKeyPair();

      expect(keyPair.privateKey.type).toBe('private');
      expect(keyPair.privateKey.extractable).toBe(false);
    });
  });

  describe('exportPublicKey', () => {
    it('should export public key as Base64 string', async () => {
      const keyPair = await crypto.generateKeyPair();
      const exported = await crypto.exportPublicKey(keyPair.publicKey);

      expect(typeof exported).toBe('string');
      expect(exported.length).toBeGreaterThan(0);
      // SPKI format for P-256 is ~91 bytes = ~124 Base64 chars
      expect(exported.length).toBeGreaterThan(100);
    });

    it('should throw when trying to export private key as public', async () => {
      const keyPair = await crypto.generateKeyPair();

      await expect(crypto.exportPublicKey(keyPair.privateKey)).rejects.toThrow(
        'not a public key'
      );
    });
  });

  describe('sign', () => {
    it('should sign a payload and return Base64 signature', async () => {
      const keyPair = await crypto.generateKeyPair();
      const payload = 'test payload to sign';

      const signature = await crypto.sign(keyPair.privateKey, payload);

      expect(typeof signature).toBe('string');
      expect(signature.length).toBeGreaterThan(0);
      // ECDSA P-256 signature is 64 bytes = ~88 Base64 chars
      expect(signature.length).toBeGreaterThanOrEqual(80);
    });

    it('should produce different signatures for different payloads', async () => {
      const keyPair = await crypto.generateKeyPair();

      const sig1 = await crypto.sign(keyPair.privateKey, 'payload 1');
      const sig2 = await crypto.sign(keyPair.privateKey, 'payload 2');

      expect(sig1).not.toBe(sig2);
    });

    it('should throw when trying to sign with public key', async () => {
      const keyPair = await crypto.generateKeyPair();

      await expect(crypto.sign(keyPair.publicKey as any, 'test')).rejects.toThrow(
        'not a private key'
      );
    });
  });

  describe('createPayloadV1', () => {
    it('should create correctly formatted canonical payload', () => {
      const payload = crypto.createPayloadV1({
        method: 'POST',
        pathAndQuery: '/v1/chat/completions',
        bodySha256: 'abc123hash',
        timestamp: '2024-01-15T10:30:00.000Z',
        nonce: 'randomNonce',
        apiKey: 'kg_prod_test',
        keyId: 'keyid123',
      });

      expect(payload).toBe(
        'kg-v1|2024-01-15T10:30:00.000Z|POST|/v1/chat/completions|abc123hash|randomNonce|kg_prod_test|keyid123'
      );
    });

    it('should normalize method to uppercase', () => {
      const payload = crypto.createPayloadV1({
        method: 'get',
        pathAndQuery: '/test',
        bodySha256: 'hash',
        timestamp: '2024-01-01T00:00:00Z',
        nonce: 'nonce',
        apiKey: 'api',
        keyId: 'key',
      });

      expect(payload).toContain('|GET|');
    });
  });

  describe('hashSha256Base64', () => {
    it('should hash empty string correctly', async () => {
      const hash = await crypto.hashSha256Base64('');
      // SHA-256 of empty string is well-known
      expect(hash).toBe('47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=');
    });

    it('should produce consistent hashes', async () => {
      const hash1 = await crypto.hashSha256Base64('test data');
      const hash2 = await crypto.hashSha256Base64('test data');

      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', async () => {
      const hash1 = await crypto.hashSha256Base64('data 1');
      const hash2 = await crypto.hashSha256Base64('data 2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateNonce', () => {
    it('should generate Base64 encoded nonce', () => {
      const nonce = crypto.generateNonce();

      expect(typeof nonce).toBe('string');
      expect(nonce.length).toBeGreaterThan(0);
    });

    it('should generate unique nonces', () => {
      const nonces = new Set<string>();

      for (let i = 0; i < 100; i++) {
        nonces.add(crypto.generateNonce());
      }

      expect(nonces.size).toBe(100);
    });

    it('should respect custom length', () => {
      const nonce8 = crypto.generateNonce(8);
      const nonce32 = crypto.generateNonce(32);

      // Base64 encoding: 8 bytes = ~12 chars, 32 bytes = ~44 chars
      expect(nonce8.length).toBeLessThan(nonce32.length);
    });
  });
});

describe('Base64 utilities', () => {
  describe('arrayBufferToBase64', () => {
    it('should convert Uint8Array to Base64', () => {
      const data = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
      const base64 = arrayBufferToBase64(data);

      expect(base64).toBe('SGVsbG8=');
    });
  });

  describe('base64ToArrayBuffer', () => {
    it('should convert Base64 to ArrayBuffer', () => {
      const base64 = 'SGVsbG8='; // "Hello"
      const buffer = base64ToArrayBuffer(base64);

      expect(new Uint8Array(buffer)).toEqual(new Uint8Array([72, 101, 108, 108, 111]));
    });
  });

  describe('roundtrip', () => {
    it('should roundtrip correctly', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5, 255, 0, 128]);
      const base64 = arrayBufferToBase64(original);
      const restored = new Uint8Array(base64ToArrayBuffer(base64));

      expect(restored).toEqual(original);
    });
  });
});
