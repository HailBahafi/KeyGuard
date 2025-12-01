/**
 * KeyGuard SDK - Main Client
 * 
 * Secure Device Binding SDK for protecting LLM API keys
 */

import type { KeyGuardConfig, EnrollmentPayload, SignedRequestHeaders, StorageAdapter } from './types';
import { CryptoManager } from './core/crypto';
import { BrowserStorageAdapter } from './storage/browser';
import { getDeviceFingerprint } from './core/fingerprint';

/**
 * Default configuration values
 */
const DEFAULT_CONFIG = {
  apiBaseUrl: 'https://api.keyguard.dev',
  storage: 'browser' as const,
};

/**
 * KeyGuard Client - Main SDK interface
 * 
 * Provides device binding capabilities for securing LLM API keys
 */
export class KeyGuardClient {
  private config: Required<KeyGuardConfig>;
  private crypto: CryptoManager;
  private storage: StorageAdapter;

  /**
   * Create a new KeyGuard client instance
   * 
   * @param config - SDK configuration
   * @throws Error if configuration is invalid or storage is unavailable
   */
  constructor(config: KeyGuardConfig) {
    // Merge with defaults
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
    };

    // Initialize crypto manager
    this.crypto = new CryptoManager();

    // Initialize storage adapter based on configuration
    if (this.config.storage === 'browser') {
      this.storage = new BrowserStorageAdapter();
    } else {
      throw new Error(`Unsupported storage type: ${this.config.storage}`);
    }
  }

  /**
   * Enroll this device by generating and storing a cryptographic key pair
   * 
   * This method:
   * 1. Collects device fingerprint using FingerprintJS
   * 2. Checks if device is already enrolled
   * 3. Generates a new ECDSA P-256 key pair
   * 4. Stores the keys securely
   * 5. Exports the public key
   * 6. Returns enrollment payload for backend registration
   * 
   * @param deviceName - Optional user-friendly device label (e.g., "Ahmed's MacBook")
   *                    If not provided, auto-generates from device info (e.g., "Chrome on macOS")
   * @returns Enrollment payload to send to backend
   * @throws Error if device is already enrolled or enrollment fails
   */
  async enroll(deviceName?: string): Promise<EnrollmentPayload> {
    try {
      // Collect device fingerprint using FingerprintJS
      const fingerprint = await getDeviceFingerprint();

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

      // Use provided device name or fallback to auto-generated label
      const label = deviceName || fingerprint.label;

      // Create enrollment payload with FingerprintJS data
      const enrollmentPayload: EnrollmentPayload = {
        publicKey: publicKeyBase64,
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
   * 3. Creates canonical payload string
   * 4. Signs the payload with private key
   * 5. Returns headers to attach to the request
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

      // Create canonical payload string
      const payload = this.crypto.createPayload(
        request.method,
        request.url,
        request.body || '',
        timestamp,
        nonce
      );

      // Sign the payload
      const signature = await this.crypto.sign(keyPair.privateKey, payload);

      // Generate key ID from public key
      const keyId = await this.generateKeyId(keyPair.publicKey);

      // Return signed headers
      const headers: SignedRequestHeaders = {
        'X-KeyGuard-Signature': signature,
        'X-KeyGuard-Timestamp': timestamp,
        'X-KeyGuard-Nonce': nonce,
        'X-KeyGuard-Key-ID': keyId,
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
