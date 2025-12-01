/**
 * KeyGuard SDK - Cryptography Module
 * 
 * WebCrypto API wrapper for ECDSA P-256 operations
 * - Key generation (non-extractable private keys)
 * - Signing with ECDSA-SHA256
 * - Public key export in SPKI format
 */

/**
 * ECDSA algorithm parameters for P-256 curve with SHA-256
 */
const ECDSA_PARAMS: EcKeyGenParams = {
  name: 'ECDSA',
  namedCurve: 'P-256', // secp256r1
};

const ECDSA_SIGN_PARAMS: EcdsaParams = {
  name: 'ECDSA',
  hash: { name: 'SHA-256' },
};

/**
 * CryptoManager - Handles all cryptographic operations for KeyGuard SDK
 */
export class CryptoManager {
  private crypto: Crypto;

  constructor() {
    // Support both browser and Node.js environments
    if (typeof globalThis.crypto !== 'undefined') {
      this.crypto = globalThis.crypto;
    } else if (typeof window !== 'undefined' && window.crypto) {
      this.crypto = window.crypto;
    } else {
      // In Node 19+, globalThis.crypto is available. For older versions, user might need polyfill.
      // We throw if not available.
      throw new Error('WebCrypto API is not available in this environment');
    }

    if (!this.crypto.subtle) {
      throw new Error('SubtleCrypto API is not available');
    }
  }

  /**
   * Generate a new ECDSA P-256 key pair
   * 
   * CRITICAL SECURITY: Private key is non-extractable (extractable: false)
   * This ensures the private key cannot be exported from the CryptoKey object
   * 
   * @returns CryptoKeyPair with public and private keys
   * @throws Error if key generation fails
   */
  async generateKeyPair(): Promise<CryptoKeyPair> {
    try {
      const keyPair = await this.crypto.subtle.generateKey(
        ECDSA_PARAMS,
        false, // extractable: false - CRITICAL SECURITY REQUIREMENT
        ['sign', 'verify']
      );

      if (!keyPair.privateKey || !keyPair.publicKey) {
        throw new Error('Failed to generate key pair: missing keys');
      }

      return keyPair;
    } catch (error) {
      throw new Error(
        `Key generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Export a public key to Base64-encoded SPKI format
   * 
   * SPKI (SubjectPublicKeyInfo) is a standard format for public keys
   * that can be transmitted and stored
   * 
   * @param publicKey - The CryptoKey to export (must be extractable)
   * @returns Base64-encoded SPKI representation
   * @throws Error if export fails or key is not a public key
   */
  async exportPublicKey(publicKey: CryptoKey): Promise<string> {
    try {
      if (publicKey.type !== 'public') {
        throw new Error('Provided key is not a public key');
      }

      const spki = await this.crypto.subtle.exportKey('spki', publicKey);
      return arrayBufferToBase64(spki);
    } catch (error) {
      throw new Error(
        `Public key export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Sign a payload using the private key
   * 
   * @param privateKey - The private CryptoKey (non-extractable)
   * @param payload - The string payload to sign
   * @returns Base64-encoded ECDSA signature (IEEE P1363 format)
   * @throws Error if signing fails or key is not a private key
   */
  async sign(privateKey: CryptoKey, payload: string): Promise<string> {
    try {
      if (privateKey.type !== 'private') {
        throw new Error('Provided key is not a private key');
      }

      // Encode the payload to Uint8Array
      const encoder = new TextEncoder();
      const data = encoder.encode(payload);

      // Sign the data
      const signature = await this.crypto.subtle.sign(
        ECDSA_SIGN_PARAMS,
        privateKey,
        data
      );

      return arrayBufferToBase64(signature);
    } catch (error) {
      throw new Error(
        `Signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Create a canonicalized payload for signing (V1 Protocol)
   * 
   * Format: kg-v1|{timestamp}|{METHOD}|{pathAndQuery}|{bodySha256}|{nonce}|{apiKey}|{keyId}
   * 
   * @param params - Payload parameters
   * @returns Canonicalized payload string
   */
  createPayloadV1(params: {
    method: string;
    pathAndQuery: string;
    bodySha256: string;
    timestamp: string;
    nonce: string;
    apiKey: string;
    keyId: string;
  }): string {
    // Ensure method is uppercase for consistency
    const normalizedMethod = params.method.toUpperCase();

    // Create the canonical format with pipe separator
    // Protocol version prefix allows future upgrades
    return `kg-v1|${params.timestamp}|${normalizedMethod}|${params.pathAndQuery}|${params.bodySha256}|${params.nonce}|${params.apiKey}|${params.keyId}`;
  }

  /**
   * Calculate SHA-256 hash of data and return as Base64
   * 
   * @param input - Data to hash (string or Uint8Array)
   * @returns Base64 encoded SHA-256 hash
   */
  async hashSha256Base64(input: string | Uint8Array): Promise<string> {
    const data = typeof input === 'string' ? new TextEncoder().encode(input) : input;
    const hashBuffer = await this.crypto.subtle.digest('SHA-256', data as any);
    return arrayBufferToBase64(hashBuffer);
  }

  /**
   * Generate a cryptographically secure random nonce
   * 
   * @param length - Number of random bytes (default: 16)
   * @returns Base64-encoded random nonce
   */
  generateNonce(length: number = 16): string {
    const randomBytes = new Uint8Array(length);
    this.crypto.getRandomValues(randomBytes as any);
    return arrayBufferToBase64(randomBytes);
  }
}

/**
 * Convert an ArrayBuffer to a Base64 string
 * 
 * @param buffer - ArrayBuffer or ArrayBufferView to convert
 * @returns Base64-encoded string
 */
export function arrayBufferToBase64(buffer: ArrayBuffer | ArrayBufferView): string {
  // Handle both ArrayBuffer and typed arrays
  const bytes = buffer instanceof ArrayBuffer
    ? new Uint8Array(buffer)
    : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);

  // Convert to binary string
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }

  // Encode to Base64
  if (typeof btoa !== 'undefined') {
    return btoa(binary);
  } else if (typeof Buffer !== 'undefined') {
    // Node.js environment fallback
    return Buffer.from(bytes).toString('base64');
  } else {
    throw new Error('No Base64 encoding method available');
  }
}

/**
 * Convert a Base64 string to an ArrayBuffer
 * 
 * @param base64 - Base64-encoded string
 * @returns ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  let binary: string;

  if (typeof atob !== 'undefined') {
    binary = atob(base64);
  } else if (typeof Buffer !== 'undefined') {
    // Node.js environment fallback
    binary = Buffer.from(base64, 'base64').toString('binary');
  } else {
    throw new Error('No Base64 decoding method available');
  }

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  return bytes.buffer;
}
