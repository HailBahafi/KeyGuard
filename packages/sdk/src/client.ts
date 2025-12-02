/**
 * KeyGuard SDK - Main Client
 * 
 * Secure Device Binding SDK for protecting LLM API keys
 */

import type { KeyGuardConfig, EnrollmentPayload, SignedRequestHeaders, StorageAdapter, FingerprintProvider } from './types';
import { CryptoManager } from './core/crypto';
import { BrowserStorageAdapter } from './storage/browser';
import { getDeviceFingerprint } from './core/fingerprint';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  apiBaseUrl: 'https://api.keyguard.dev',
};

/**
 * KeyGuard Client - Main SDK interface
 * 
 * Provides device binding capabilities for securing LLM API keys
 */
export class KeyGuardClient {
  private config: KeyGuardConfig;
  private crypto: CryptoManager;
  private storage: StorageAdapter;
  private fingerprintProvider?: FingerprintProvider;

  /**
   * Create a new KeyGuard client instance
   * 
   * @param config - SDK configuration
   * @throws Error if configuration is invalid or storage is unavailable
   */
  constructor(config: KeyGuardConfig) {
    if (!config.apiKey) {
      throw new Error('KeyGuard SDK requires an apiKey');
    }

    // Merge with defaults
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    // Initialize crypto manager
    this.crypto = new CryptoManager();

    // Initialize storage adapter
    if (this.config.storage) {
      if (typeof this.config.storage === 'string') {
        if (this.config.storage === 'browser') {
          this.storage = new BrowserStorageAdapter();
        } else if (this.config.storage === 'memory') {
          // Dynamic import to avoid bundling memory adapter if not needed, 
          // but for now we'll assume it's available or user passes instance
          throw new Error('Memory storage string shortcut not fully implemented. Pass instance of MemoryStorageAdapter instead.');
        } else {
          throw new Error(`Unsupported storage type: ${this.config.storage}`);
        }
      } else {
        // User provided adapter instance
        this.storage = this.config.storage;
      }
    } else {
      // Default to browser storage
      if (typeof window !== 'undefined' && typeof indexedDB !== 'undefined') {
        this.storage = new BrowserStorageAdapter();
      } else {
        throw new Error('No storage adapter provided and browser environment not detected. Please provide a custom storage adapter for Node.js environments.');
      }
    }

    // Initialize fingerprint provider
    if (this.config.fingerprintProvider) {
      this.fingerprintProvider = this.config.fingerprintProvider;
    }
  }

  /**
   * Enroll this device by generating and storing a cryptographic key pair
   * 
   * This method:
   * 1. Collects device fingerprint
   * 2. Checks if device is already enrolled
   * 3. Generates a new ECDSA P-256 key pair
   * 4. Stores the keys securely
   * 5. Exports the public key
   * 6. Returns enrollment payload for backend registration
   * 
   * @param deviceName - Optional user-friendly device label
   * @returns Enrollment payload to send to backend
   * @throws Error if device is already enrolled or enrollment fails
   */
  async enroll(deviceName?: string): Promise<EnrollmentPayload> {
    try {
      // Collect device fingerprint
      let fingerprint;
      if (this.fingerprintProvider) {
        fingerprint = await this.fingerprintProvider.getFingerprint();
      } else {
        // getDeviceFingerprint() now handles Node.js environments with mock data
        fingerprint = await getDeviceFingerprint();
      }

      // Check if device is already enrolled
      const existingKeys = await this.storage.getKeyPair();
      if (existingKeys) {
        throw new Error(
          'Device already enrolled. Call unenroll() first to re-enroll this device.'
        );
      }

      // Generate new cryptographic key pair
      const keyPair = await this.crypto.generateKeyPair();

      // Store keys securely
      await this.storage.saveKeyPair(keyPair.publicKey, keyPair.privateKey);

      // Export public key in SPKI format
      const publicKeyBase64 = await this.crypto.exportPublicKey(keyPair.publicKey);

      // Generate Key ID
      const keyId = await this.generateKeyId(keyPair.publicKey);

      // Use provided device name or fallback to auto-generated label
      const label = deviceName || fingerprint.label;

      // Create enrollment payload
      const enrollmentPayload: EnrollmentPayload = {
        publicKey: publicKeyBase64,
        keyId,
        deviceFingerprint: fingerprint.visitorId,
        label,
        userAgent: this.getUserAgent(),
        metadata: fingerprint.metadata,
      };

      return enrollmentPayload;
    } catch (error) {
      throw new Error(
        `Enrollment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Sign an HTTP request with device credentials
   * 
   * This method:
   * 1. Retrieves stored cryptographic keys
   * 2. Generates timestamp and nonce
   * 3. Calculates body hash
   * 4. Creates canonical payload string (V1)
   * 5. Signs the payload with private key
   * 6. Returns headers to attach to the request
   * 
   * @param request - Request details to sign
   * @returns Signed request headers to attach to HTTP request
   * @throws Error if device is not enrolled or signing fails
   */
  async signRequest(request: {
    method: string;
    url: string;
    body?: string;
  }): Promise<SignedRequestHeaders> {
    try {
      // Retrieve stored keys
      const keyPair = await this.storage.getKeyPair();
      if (!keyPair) {
        throw new Error(
          'Device not enrolled. Call enroll() first to register this device.'
        );
      }

      // Generate timestamp (ISO 8601 format)
      const timestamp = new Date().toISOString();

      // Generate cryptographically secure nonce
      const nonce = this.crypto.generateNonce();

      // Generate Key ID
      const keyId = await this.generateKeyId(keyPair.publicKey);

      // Calculate Body Hash (SHA-256)
      const bodySha256 = await this.crypto.hashSha256Base64(request.body || '');

      // Parse URL to get path + query
      let pathAndQuery: string;
      if (request.url.startsWith('/')) {
        pathAndQuery = request.url;
      } else {
        try {
          const urlObj = new URL(request.url);
          pathAndQuery = urlObj.pathname + urlObj.search;
        } catch (e) {
          // Fallback if URL parsing fails (e.g. relative URL without base)
          pathAndQuery = request.url;
        }
      }

      // Create canonical payload string (V1)
      const payload = this.crypto.createPayloadV1({
        method: request.method,
        pathAndQuery,
        bodySha256,
        timestamp,
        nonce,
        apiKey: this.config.apiKey,
        keyId
      });

      // Sign the payload
      const signature = await this.crypto.sign(keyPair.privateKey, payload);

      // Return signed headers
      const headers: SignedRequestHeaders = {
        'x-keyguard-api-key': this.config.apiKey,
        'x-keyguard-key-id': keyId,
        'x-keyguard-timestamp': timestamp,
        'x-keyguard-nonce': nonce,
        'x-keyguard-body-sha256': bodySha256,
        'x-keyguard-alg': 'ECDSA_P256_SHA256_P1363',
        'x-keyguard-signature': signature,
      };

      return headers;
    } catch (error) {
      throw new Error(
        `Request signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Unenroll this device by clearing all stored keys
   * 
   * @throws Error if clearing keys fails
   */
  async unenroll(): Promise<void> {
    try {
      await this.storage.clear();
    } catch (error) {
      throw new Error(
        `Unenrollment failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Check if this device is enrolled
   * 
   * @returns true if device has stored keys, false otherwise
   */
  async isEnrolled(): Promise<boolean> {
    try {
      const keyPair = await this.storage.getKeyPair();
      return keyPair !== null;
    } catch {
      return false;
    }
  }

  /**
   * Generate a unique key ID from the public key
   * 
   * @param publicKey - Public CryptoKey
   * @returns Key identifier (hash of public key)
   */
  private async generateKeyId(publicKey: CryptoKey): Promise<string> {
    // Export public key
    const publicKeyBase64 = await this.crypto.exportPublicKey(publicKey);

    // Hash the public key to create a unique identifier
    const encoder = new TextEncoder();
    const data = encoder.encode(publicKeyBase64);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);

    // Convert to hex string (first 16 bytes for shorter ID)
    const hashArray = Array.from(new Uint8Array(hashBuffer)).slice(0, 16);
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
  }

  /**
   * Get the user agent string
   * 
   * @returns User agent or undefined
   */
  private getUserAgent(): string | undefined {
    if (typeof navigator !== 'undefined' && navigator.userAgent) {
      return navigator.userAgent;
    }
    return undefined;
  }
}
