/**
 * KeyGuard SDK - Type Definitions
 *
 * Core TypeScript interfaces and types for device binding and secure API key management
 */
/**
 * Configuration object for initializing the KeyGuard SDK
 */
interface KeyGuardConfig {
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
interface EnrollmentPayload {
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
interface SignedRequestHeaders {
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
     * @returns Base64-encoded ECDSA signature
     * @throws Error if signing fails or key is not a private key
     */
    sign(privateKey: CryptoKey, payload: string): Promise<string>;
    /**
     * Create a canonicalized payload for signing
     *
     * This format is CRITICAL - the backend must parse this exact format
     * Format: {timestamp}|{METHOD}|{url}|{body}|{nonce}
     *
     * @param method - HTTP method (will be uppercased)
     * @param url - Full request URL
     * @param body - Request body (empty string if no body)
     * @param timestamp - ISO 8601 timestamp
     * @param nonce - Unique nonce for replay prevention
     * @returns Canonicalized payload string
     */
    createPayload(method: string, url: string, body: string, timestamp: string, nonce: string): string;
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
    enroll(deviceName?: string): Promise<EnrollmentPayload>;
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

export { BrowserStorageAdapter, CryptoManager, type EnrollmentPayload, KeyGuardClient, type KeyGuardConfig, type SignedRequestHeaders, type StorageAdapter, arrayBufferToBase64, base64ToArrayBuffer };
