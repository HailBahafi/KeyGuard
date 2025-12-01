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
   * @returns Base64-encoded ECDSA signature
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
  createPayload(method, url, body, timestamp, nonce) {
    const normalizedMethod = method.toUpperCase();
    return `${timestamp}|${normalizedMethod}|${url}|${body}|${nonce}`;
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
  try {
    const fpPromise = FingerprintJS.load();
    const fp = await fpPromise;
    const result = await fp.get();
    const components = result.components;
    const label = generateDeviceLabel(components);
    const getValue = (component) => {
      if (!component) return void 0;
      if (typeof component === "object" && "value" in component) {
        return component.value;
      }
      return void 0;
    };
    const metadata = {
      platform: getValue(components.platform),
      vendor: getValue(components.vendor),
      vendorFlavors: getValue(components.vendorFlavors),
      screenResolution: getValue(components.screenResolution),
      timezone: getValue(components.timezone),
      languages: getValue(components.languages),
      colorDepth: getValue(components.colorDepth),
      deviceMemory: getValue(components.deviceMemory),
      hardwareConcurrency: getValue(components.hardwareConcurrency),
      touchSupport: getValue(components.touchSupport)
    };
    return {
      visitorId: result.visitorId,
      label,
      metadata
    };
  } catch (error) {
    throw new Error(
      `Device fingerprinting failed: ${error instanceof Error ? error.message : "Unknown error"}`
    );
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
  if (vendor.includes("Google") || Array.isArray(vendorFlavors) && vendorFlavors.includes("chrome")) {
    browser = "Chrome";
  } else if (vendor.includes("Apple") || Array.isArray(vendorFlavors) && vendorFlavors.includes("safari")) {
    browser = "Safari";
  } else if (Array.isArray(vendorFlavors) && vendorFlavors.includes("firefox")) {
    browser = "Firefox";
  } else if (Array.isArray(vendorFlavors) && vendorFlavors.includes("edge")) {
    browser = "Edge";
  }
  let os = "Unknown OS";
  const platform = String(getValue(components.platform, ""));
  if (platform.includes("Win")) {
    os = "Windows";
  } else if (platform.includes("Mac")) {
    os = "macOS";
  } else if (platform.includes("Linux")) {
    os = "Linux";
  } else if (platform.includes("iPhone") || platform.includes("iPad")) {
    os = "iOS";
  } else if (platform.includes("Android")) {
    os = "Android";
  }
  if (os === "Unknown OS" && typeof navigator !== "undefined") {
    const ua = navigator.userAgent || "";
    if (ua.includes("Windows")) os = "Windows";
    else if (ua.includes("Mac")) os = "macOS";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
    else if (ua.includes("Android")) os = "Android";
  }
  return `${browser} on ${os}`;
}

// src/client.ts
var DEFAULT_CONFIG = {
  apiBaseUrl: "https://api.keyguard.dev",
  storage: "browser"
};
var KeyGuardClient = class {
  /**
   * Create a new KeyGuard client instance
   * 
   * @param config - SDK configuration
   * @throws Error if configuration is invalid or storage is unavailable
   */
  constructor(config) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    };
    this.crypto = new CryptoManager();
    if (this.config.storage === "browser") {
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
  async enroll(deviceName) {
    try {
      const fingerprint = await getDeviceFingerprint();
      const existingKeys = await this.storage.getKeyPair();
      if (existingKeys) {
        throw new Error(
          "Device already enrolled. Call unenroll() first to re-enroll this device."
        );
      }
      const keyPair = await this.crypto.generateKeyPair();
      await this.storage.saveKeyPair(keyPair.publicKey, keyPair.privateKey);
      const publicKeyBase64 = await this.crypto.exportPublicKey(keyPair.publicKey);
      const label = deviceName || fingerprint.label;
      const enrollmentPayload = {
        publicKey: publicKeyBase64,
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
   * 3. Creates canonical payload string
   * 4. Signs the payload with private key
   * 5. Returns headers to attach to the request
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
      const payload = this.crypto.createPayload(
        request.method,
        request.url,
        request.body || "",
        timestamp,
        nonce
      );
      const signature = await this.crypto.sign(keyPair.privateKey, payload);
      const keyId = await this.generateKeyId(keyPair.publicKey);
      const headers = {
        "X-KeyGuard-Signature": signature,
        "X-KeyGuard-Timestamp": timestamp,
        "X-KeyGuard-Nonce": nonce,
        "X-KeyGuard-Key-ID": keyId
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

export { BrowserStorageAdapter, CryptoManager, KeyGuardClient, arrayBufferToBase64, base64ToArrayBuffer };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map