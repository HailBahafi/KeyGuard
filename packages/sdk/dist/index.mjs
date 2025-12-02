import { createStore, set, get, del } from 'idb-keyval';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

// src/core/crypto.ts
var ECDSA_PARAMS = {
  name: "ECDSA",
  namedCurve: "P-256"
  // secp256r1
};
var ECDSA_SIGN_PARAMS = {
  name: "ECDSA",
  hash: { name: "SHA-256" }
};
var CryptoManager = class {
  constructor() {
    if (typeof globalThis.crypto !== "undefined") {
      this.crypto = globalThis.crypto;
    } else if (typeof window !== "undefined" && window.crypto) {
      this.crypto = window.crypto;
    } else {
      throw new Error("WebCrypto API is not available in this environment");
    }
    if (!this.crypto.subtle) {
      throw new Error("SubtleCrypto API is not available");
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
  async generateKeyPair() {
    try {
      const keyPair = await this.crypto.subtle.generateKey(
        ECDSA_PARAMS,
        false,
        // extractable: false - CRITICAL SECURITY REQUIREMENT
        ["sign", "verify"]
      );
      if (!keyPair.privateKey || !keyPair.publicKey) {
        throw new Error("Failed to generate key pair: missing keys");
      }
      return keyPair;
    } catch (error) {
      throw new Error(
        `Key generation failed: ${error instanceof Error ? error.message : "Unknown error"}`
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
  async exportPublicKey(publicKey) {
    try {
      if (publicKey.type !== "public") {
        throw new Error("Provided key is not a public key");
      }
      const spki = await this.crypto.subtle.exportKey("spki", publicKey);
      return arrayBufferToBase64(spki);
    } catch (error) {
      throw new Error(
        `Public key export failed: ${error instanceof Error ? error.message : "Unknown error"}`
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
  async sign(privateKey, payload) {
    try {
      if (privateKey.type !== "private") {
        throw new Error("Provided key is not a private key");
      }
      const encoder = new TextEncoder();
      const data = encoder.encode(payload);
      const signature = await this.crypto.subtle.sign(
        ECDSA_SIGN_PARAMS,
        privateKey,
        data
      );
      return arrayBufferToBase64(signature);
    } catch (error) {
      throw new Error(
        `Signing failed: ${error instanceof Error ? error.message : "Unknown error"}`
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
  createPayloadV1(params) {
    const normalizedMethod = params.method.toUpperCase();
    return `kg-v1|${params.timestamp}|${normalizedMethod}|${params.pathAndQuery}|${params.bodySha256}|${params.nonce}|${params.apiKey}|${params.keyId}`;
  }
  /**
   * Calculate SHA-256 hash of data and return as Base64
   * 
   * @param input - Data to hash (string or Uint8Array)
   * @returns Base64 encoded SHA-256 hash
   */
  async hashSha256Base64(input) {
    const data = typeof input === "string" ? new TextEncoder().encode(input) : input;
    const hashBuffer = await this.crypto.subtle.digest("SHA-256", data);
    return arrayBufferToBase64(hashBuffer);
  }
  /**
   * Generate a cryptographically secure random nonce
   * 
   * @param length - Number of random bytes (default: 16)
   * @returns Base64-encoded random nonce
   */
  generateNonce(length = 16) {
    const randomBytes = new Uint8Array(length);
    this.crypto.getRandomValues(randomBytes);
    return arrayBufferToBase64(randomBytes);
  }
};
function arrayBufferToBase64(buffer) {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  if (typeof btoa !== "undefined") {
    return btoa(binary);
  } else if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  } else {
    throw new Error("No Base64 encoding method available");
  }
}
function base64ToArrayBuffer(base64) {
  let binary;
  if (typeof atob !== "undefined") {
    binary = atob(base64);
  } else if (typeof Buffer !== "undefined") {
    binary = Buffer.from(base64, "base64").toString("binary");
  } else {
    throw new Error("No Base64 decoding method available");
  }
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
var KEYGUARD_STORE = createStore("keyguard-db", "keyguard-store");
var STORAGE_KEYS = {
  PUBLIC_KEY: "public-key",
  PRIVATE_KEY: "private-key"
};
var BrowserStorageAdapter = class {
  /**
   * Save a CryptoKey pair to IndexedDB
   * 
   * @param publicKey - Public CryptoKey (extractable)
   * @param privateKey - Private CryptoKey (non-extractable)
   * @throws Error if storage operation fails
   */
  async saveKeyPair(publicKey, privateKey) {
    try {
      if (publicKey.type !== "public") {
        throw new Error("Invalid public key type");
      }
      if (privateKey.type !== "private") {
        throw new Error("Invalid private key type");
      }
      await set(STORAGE_KEYS.PUBLIC_KEY, publicKey, KEYGUARD_STORE);
      await set(STORAGE_KEYS.PRIVATE_KEY, privateKey, KEYGUARD_STORE);
    } catch (error) {
      throw new Error(
        `Failed to save key pair: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Retrieve the stored CryptoKey pair from IndexedDB
   * 
   * @returns Key pair if exists, null if not found
   * @throws Error if storage operation fails
   */
  async getKeyPair() {
    try {
      const publicKey = await get(STORAGE_KEYS.PUBLIC_KEY, KEYGUARD_STORE);
      const privateKey = await get(STORAGE_KEYS.PRIVATE_KEY, KEYGUARD_STORE);
      if (!publicKey || !privateKey) {
        return null;
      }
      if (publicKey.type !== "public" || privateKey.type !== "private") {
        throw new Error("Retrieved keys have invalid types");
      }
      return { publicKey, privateKey };
    } catch (error) {
      throw new Error(
        `Failed to retrieve key pair: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Clear all stored keys from IndexedDB
   * 
   * @throws Error if storage operation fails
   */
  async clear() {
    try {
      await del(STORAGE_KEYS.PUBLIC_KEY, KEYGUARD_STORE);
      await del(STORAGE_KEYS.PRIVATE_KEY, KEYGUARD_STORE);
    } catch (error) {
      throw new Error(
        `Failed to clear keys: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
};
async function getDeviceFingerprint() {
  const isNode = typeof process !== "undefined" && process.versions != null && process.versions.node != null;
  if (isNode || typeof window === "undefined") {
    console.warn("\u26A0\uFE0F KeyGuard: Running in Node.js/Server environment - Using Mock Fingerprint");
    return {
      visitorId: "node-test-device-" + Date.now(),
      label: "Node.js Environment",
      metadata: {
        platform: "Node.js",
        userAgent: "Terminal",
        isServer: true,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }
    };
  }
  try {
    const fp = await FingerprintJS.load();
    const result = await fp.get();
    const components = result.components;
    const label = generateDeviceLabel(components);
    return {
      visitorId: result.visitorId,
      label,
      metadata: result.components || {}
    };
  } catch (error) {
    console.warn("KeyGuard: FingerprintJS failed, falling back.", error);
    return {
      visitorId: "fallback-" + Date.now(),
      label: "Unknown Device",
      metadata: { error: String(error) }
    };
  }
}
function generateDeviceLabel(components) {
  const getValue = (component, fallback = "") => {
    if (!component) return fallback;
    if (typeof component === "object" && "value" in component) {
      return component.value ?? fallback;
    }
    return fallback;
  };
  let browser = "Unknown Browser";
  const vendor = String(getValue(components.vendor, ""));
  const vendorFlavors = getValue(components.vendorFlavors, []);
  if (vendor.includes("Google") || Array.isArray(vendorFlavors) && vendorFlavors.includes("chrome")) browser = "Chrome";
  else if (vendor.includes("Apple") || Array.isArray(vendorFlavors) && vendorFlavors.includes("safari")) browser = "Safari";
  else if (Array.isArray(vendorFlavors) && vendorFlavors.includes("firefox")) browser = "Firefox";
  let os = "Unknown OS";
  const platform = String(getValue(components.platform, ""));
  if (platform.includes("Win")) os = "Windows";
  else if (platform.includes("Mac")) os = "macOS";
  else if (platform.includes("Linux")) os = "Linux";
  return `${browser} on ${os}`;
}

// src/client.ts
var DEFAULT_CONFIG = {
  apiBaseUrl: "https://api.keyguard.dev"
};
var KeyGuardClient = class {
  /**
   * Create a new KeyGuard client instance
   * 
   * @param config - SDK configuration
   * @throws Error if configuration is invalid or storage is unavailable
   */
  constructor(config) {
    if (!config.apiKey) {
      throw new Error("KeyGuard SDK requires an apiKey");
    }
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    };
    this.crypto = new CryptoManager();
    if (this.config.storage) {
      if (typeof this.config.storage === "string") {
        if (this.config.storage === "browser") {
          this.storage = new BrowserStorageAdapter();
        } else if (this.config.storage === "memory") {
          throw new Error("Memory storage string shortcut not fully implemented. Pass instance of MemoryStorageAdapter instead.");
        } else {
          throw new Error(`Unsupported storage type: ${this.config.storage}`);
        }
      } else {
        this.storage = this.config.storage;
      }
    } else {
      if (typeof window !== "undefined" && typeof indexedDB !== "undefined") {
        this.storage = new BrowserStorageAdapter();
      } else {
        throw new Error("No storage adapter provided and browser environment not detected. Please provide a custom storage adapter for Node.js environments.");
      }
    }
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
  async enroll(deviceName) {
    try {
      let fingerprint;
      if (this.fingerprintProvider) {
        fingerprint = await this.fingerprintProvider.getFingerprint();
      } else {
        fingerprint = await getDeviceFingerprint();
      }
      const existingKeys = await this.storage.getKeyPair();
      if (existingKeys) {
        throw new Error(
          "Device already enrolled. Call unenroll() first to re-enroll this device."
        );
      }
      const keyPair = await this.crypto.generateKeyPair();
      await this.storage.saveKeyPair(keyPair.publicKey, keyPair.privateKey);
      const publicKeyBase64 = await this.crypto.exportPublicKey(keyPair.publicKey);
      const keyId = await this.generateKeyId(keyPair.publicKey);
      const label = deviceName || fingerprint.label;
      const enrollmentPayload = {
        publicKey: publicKeyBase64,
        keyId,
        deviceFingerprint: fingerprint.visitorId,
        label,
        userAgent: this.getUserAgent(),
        metadata: fingerprint.metadata
      };
      return enrollmentPayload;
    } catch (error) {
      throw new Error(
        `Enrollment failed: ${error instanceof Error ? error.message : "Unknown error"}`
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
  async signRequest(request) {
    try {
      const keyPair = await this.storage.getKeyPair();
      if (!keyPair) {
        throw new Error(
          "Device not enrolled. Call enroll() first to register this device."
        );
      }
      const timestamp = (/* @__PURE__ */ new Date()).toISOString();
      const nonce = this.crypto.generateNonce();
      const keyId = await this.generateKeyId(keyPair.publicKey);
      const bodySha256 = await this.crypto.hashSha256Base64(request.body || "");
      let pathAndQuery;
      if (request.url.startsWith("/")) {
        pathAndQuery = request.url;
      } else {
        try {
          const urlObj = new URL(request.url);
          pathAndQuery = urlObj.pathname + urlObj.search;
        } catch (e) {
          pathAndQuery = request.url;
        }
      }
      const payload = this.crypto.createPayloadV1({
        method: request.method,
        pathAndQuery,
        bodySha256,
        timestamp,
        nonce,
        apiKey: this.config.apiKey,
        keyId
      });
      const signature = await this.crypto.sign(keyPair.privateKey, payload);
      const headers = {
        "x-keyguard-api-key": this.config.apiKey,
        "x-keyguard-key-id": keyId,
        "x-keyguard-timestamp": timestamp,
        "x-keyguard-nonce": nonce,
        "x-keyguard-body-sha256": bodySha256,
        "x-keyguard-alg": "ECDSA_P256_SHA256_P1363",
        "x-keyguard-signature": signature
      };
      return headers;
    } catch (error) {
      throw new Error(
        `Request signing failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Unenroll this device by clearing all stored keys
   * 
   * @throws Error if clearing keys fails
   */
  async unenroll() {
    try {
      await this.storage.clear();
    } catch (error) {
      throw new Error(
        `Unenrollment failed: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
  /**
   * Check if this device is enrolled
   * 
   * @returns true if device has stored keys, false otherwise
   */
  async isEnrolled() {
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
  async generateKeyId(publicKey) {
    const publicKeyBase64 = await this.crypto.exportPublicKey(publicKey);
    const encoder = new TextEncoder();
    const data = encoder.encode(publicKeyBase64);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer)).slice(0, 16);
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
  }
  /**
   * Get the user agent string
   * 
   * @returns User agent or undefined
   */
  getUserAgent() {
    if (typeof navigator !== "undefined" && navigator.userAgent) {
      return navigator.userAgent;
    }
    return void 0;
  }
};

// src/storage/memory.ts
var MemoryStorageAdapter = class {
  constructor() {
    this.publicKey = null;
    this.privateKey = null;
  }
  async saveKeyPair(publicKey, privateKey) {
    this.publicKey = publicKey;
    this.privateKey = privateKey;
  }
  async getKeyPair() {
    if (!this.publicKey || !this.privateKey) {
      return null;
    }
    return {
      publicKey: this.publicKey,
      privateKey: this.privateKey
    };
  }
  async clear() {
    this.publicKey = null;
    this.privateKey = null;
  }
};

export { BrowserStorageAdapter, CryptoManager, KeyGuardClient, MemoryStorageAdapter, arrayBufferToBase64, base64ToArrayBuffer };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map