/**
 * KeyGuard SDK - Type Definitions
 * 
 * Core TypeScript interfaces and types for device binding and secure API key management
 */

/**
 * Configuration object for initializing the KeyGuard SDK
 */
export interface KeyGuardConfig {
  /**
   * Project API key (e.g., "kg_prod_...")
   */
  apiKey: string;

  /**
   * Optional backend URL
   * @default Production API endpoint
   */
  apiBaseUrl?: string;

  /**
   * Storage strategy for cryptographic keys
   * @default 'browser'
   */
  storage?: 'browser' | 'memory';
}

/**
 * Payload sent to the backend during device enrollment/registration
 */
export interface EnrollmentPayload {
  /**
   * Public key in Base64 SPKI format
   */
  publicKey: string;

  /**
   * Unique hardware/device identifier (FingerprintJS visitorId)
   */
  deviceFingerprint: string;

  /**
   * User-friendly device label (e.g., "Ahmed's Macbook" or "Chrome on macOS")
   */
  label: string;

  /**
   * Optional browser user agent string
   */
  userAgent?: string;

  /**
   * Optional device metadata from FingerprintJS
   */
  metadata?: Record<string, unknown>;
}

/**
 * HTTP headers appended to every protected API request
 * These headers provide cryptographic proof of device identity
 */
export interface SignedRequestHeaders {
  /**
   * Base64-encoded ECDSA signature of the request
   */
  'X-KeyGuard-Signature': string;

  /**
   * ISO 8601 timestamp of when the request was signed
   */
  'X-KeyGuard-Timestamp': string;

  /**
   * Unique nonce to prevent replay attacks
   */
  'X-KeyGuard-Nonce': string;

  /**
   * Identifier of the enrolled cryptographic key
   */
  'X-KeyGuard-Key-ID': string;
}

/**
 * Storage adapter interface for persisting cryptographic key pairs
 * Decouples storage logic from specific implementations (IndexedDB, Keytar, etc.)
 */
export interface StorageAdapter {
  /**
   * Persist a CryptoKey pair to secure storage
   * @param publicKey - The public key (extractable)
   * @param privateKey - The private key (non-extractable)
   */
  saveKeyPair(publicKey: CryptoKey, privateKey: CryptoKey): Promise<void>;

  /**
   * Retrieve the stored CryptoKey pair
   * @returns The key pair if exists, null otherwise
   */
  getKeyPair(): Promise<{ publicKey: CryptoKey; privateKey: CryptoKey } | null>;

  /**
   * Clear all stored keys from storage
   */
  clear(): Promise<void>;
}
