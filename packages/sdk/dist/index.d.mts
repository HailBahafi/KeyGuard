/**
 * KeyGuard SDK - Type Definitions
 *
 * Core TypeScript interfaces and types for device binding and secure API key management
 */
/**
 * Interface for providing device fingerprinting
 * Allows injection of custom fingerprinting logic (e.g. for Node.js)
 */
interface FingerprintProvider {
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
interface StorageAdapter {
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
    getKeyPair(): Promise<{
        publicKey: CryptoKey;
        privateKey: CryptoKey;
    } | null>;
    /**
     * Clear all stored keys from storage
     */
    clear(): Promise<void>;
}
/**
 * Configuration object for initializing the KeyGuard SDK
 */
interface KeyGuardConfig {
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
interface EnrollmentPayload {
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
interface SignedRequestHeaders {
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

/**
 * KeyGuard SDK - Main Client
 *
 * Secure Device Binding SDK for protecting LLM API keys
 */

/**
 * KeyGuard Client - Main SDK interface
 *
 * Provides device binding capabilities for securing LLM API keys
 */
declare class KeyGuardClient {
    private config;
    private crypto;
    private storage;
    private fingerprintProvider?;
    /**
     * Create a new KeyGuard client instance
     *
     * @param config - SDK configuration
     * @throws Error if configuration is invalid or storage is unavailable
     */
    constructor(config: KeyGuardConfig);
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
    enroll(deviceName?: string): Promise<EnrollmentPayload>;
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
    signRequest(request: {
        method: string;
        url: string;
        body?: string;
    }): Promise<SignedRequestHeaders>;
    /**
     * Unenroll this device by clearing all stored keys
     *
     * @throws Error if clearing keys fails
     */
    unenroll(): Promise<void>;
    /**
     * Check if this device is enrolled
     *
     * @returns true if device has stored keys, false otherwise
     */
    isEnrolled(): Promise<boolean>;
    /**
     * Generate a unique key ID from the public key
     *
     * @param publicKey - Public CryptoKey
     * @returns Key identifier (hash of public key)
     */
    private generateKeyId;
    /**
     * Get the user agent string
     *
     * @returns User agent or undefined
     */
    private getUserAgent;
}

/**
 * KeyGuard SDK - Memory Storage Adapter
 *
 * In-memory storage implementation for testing or non-persistent environments
 */

declare class MemoryStorageAdapter implements StorageAdapter {
    private publicKey;
    private privateKey;
    saveKeyPair(publicKey: CryptoKey, privateKey: CryptoKey): Promise<void>;
    getKeyPair(): Promise<{
        publicKey: CryptoKey;
        privateKey: CryptoKey;
    } | null>;
    clear(): Promise<void>;
}

/**
 * KeyGuard SDK - Browser Storage Adapter
 *
 * IndexedDB-based storage implementation using idb-keyval
 * Stores CryptoKey objects directly using structured cloning
 */

/**
 * Browser storage adapter using IndexedDB
 * Leverages IndexedDB's structured cloning to store CryptoKey objects directly
 */
declare class BrowserStorageAdapter implements StorageAdapter {
    /**
     * Save a CryptoKey pair to IndexedDB
     *
     * @param publicKey - Public CryptoKey (extractable)
     * @param privateKey - Private CryptoKey (non-extractable)
     * @throws Error if storage operation fails
     */
    saveKeyPair(publicKey: CryptoKey, privateKey: CryptoKey): Promise<void>;
    /**
     * Retrieve the stored CryptoKey pair from IndexedDB
     *
     * @returns Key pair if exists, null if not found
     * @throws Error if storage operation fails
     */
    getKeyPair(): Promise<{
        publicKey: CryptoKey;
        privateKey: CryptoKey;
    } | null>;
    /**
     * Clear all stored keys from IndexedDB
     *
     * @throws Error if storage operation fails
     */
    clear(): Promise<void>;
}

/**
 * KeyGuard SDK - Cryptography Module
 *
 * WebCrypto API wrapper for ECDSA P-256 operations
 * - Key generation (non-extractable private keys)
 * - Signing with ECDSA-SHA256
 * - Public key export in SPKI format
 */
/**
 * CryptoManager - Handles all cryptographic operations for KeyGuard SDK
 */
declare class CryptoManager {
    private crypto;
    constructor();
    /**
     * Generate a new ECDSA P-256 key pair
     *
     * CRITICAL SECURITY: Private key is non-extractable (extractable: false)
     * This ensures the private key cannot be exported from the CryptoKey object
     *
     * @returns CryptoKeyPair with public and private keys
     * @throws Error if key generation fails
     */
    generateKeyPair(): Promise<CryptoKeyPair>;
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
    exportPublicKey(publicKey: CryptoKey): Promise<string>;
    /**
     * Sign a payload using the private key
     *
     * @param privateKey - The private CryptoKey (non-extractable)
     * @param payload - The string payload to sign
     * @returns Base64-encoded ECDSA signature (IEEE P1363 format)
     * @throws Error if signing fails or key is not a private key
     */
    sign(privateKey: CryptoKey, payload: string): Promise<string>;
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
    }): string;
    /**
     * Calculate SHA-256 hash of data and return as Base64
     *
     * @param input - Data to hash (string or Uint8Array)
     * @returns Base64 encoded SHA-256 hash
     */
    hashSha256Base64(input: string | Uint8Array): Promise<string>;
    /**
     * Generate a cryptographically secure random nonce
     *
     * @param length - Number of random bytes (default: 16)
     * @returns Base64-encoded random nonce
     */
    generateNonce(length?: number): string;
}
/**
 * Convert an ArrayBuffer to a Base64 string
 *
 * @param buffer - ArrayBuffer or ArrayBufferView to convert
 * @returns Base64-encoded string
 */
declare function arrayBufferToBase64(buffer: ArrayBuffer | ArrayBufferView): string;
/**
 * Convert a Base64 string to an ArrayBuffer
 *
 * @param base64 - Base64-encoded string
 * @returns ArrayBuffer
 */
declare function base64ToArrayBuffer(base64: string): ArrayBuffer;

export { BrowserStorageAdapter, CryptoManager, type EnrollmentPayload, type FingerprintProvider, KeyGuardClient, type KeyGuardConfig, MemoryStorageAdapter, type SignedRequestHeaders, type StorageAdapter, arrayBufferToBase64, base64ToArrayBuffer };
