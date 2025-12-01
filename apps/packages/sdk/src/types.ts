/**
 * KeyGuard SDK - Type Definitions
 * 
 * Core TypeScript interfaces and types for device binding and secure API key management
 */

/**
 * Interface for providing device fingerprinting
 * Allows injection of custom fingerprinting logic (e.g. for Node.js)
 */
export interface FingerprintProvider {
  getFingerprint(): Promise<{
    visitorId: string;
    label: string;
    metadata: Record<string, unknown>;
  }>;
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

/**
 * Configuration object for initializing the KeyGuard SDK
 */
export interface KeyGuardConfig {
  /**
   * Project API key (e.g., "kg_prod_...")
   * REQUIRED for signing requests to identify the project
   */
  apiKey: string;

  /**
   * Optional backend URL
   * @default Production API endpoint
   */
  apiBaseUrl?: string;

  /**
   * Storage strategy for cryptographic keys
   * @default 'browser' (IndexedDB)
   * Provide a custom adapter for Node.js or specific requirements
   */
  storage?: 'browser' | 'memory' | StorageAdapter;

  /**
   * Custom fingerprint provider
   * Required for Node.js environments where FingerprintJS is not available
   */
  fingerprintProvider?: FingerprintProvider;
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
   * Key ID (SHA-256 hash of public key, first 16 bytes hex)
   */
  keyId: string;

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
   * Project API Key
   */
  'x-keyguard-api-key': string;

  /**
   * Identifier of the enrolled cryptographic key
   */
  'x-keyguard-key-id': string;

  /**
   * ISO 8601 timestamp of when the request was signed
   */
  'x-keyguard-timestamp': string;

  /**
   * Unique nonce to prevent replay attacks
   */
  'x-keyguard-nonce': string;

  /**
   * SHA-256 hash of the request body (Base64)
   */
  'x-keyguard-body-sha256': string;

  /**
   * Algorithm used for signing (e.g., "ECDSA_P256_SHA256_P1363")
   */
  'x-keyguard-alg': string;

  /**
   * Base64-encoded ECDSA signature of the request
   */
  'x-keyguard-signature': string;
}
