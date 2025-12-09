# 🔐 KeyGuard SDK

Secure TypeScript SDK for Device Binding to protect LLM API keys using ECDSA P-256 cryptography.

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.3-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/ECDSA-P256-green.svg" alt="ECDSA">
  <img src="https://img.shields.io/npm/v/@keyguard/sdk" alt="npm version">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
</p>

---

## ✨ Features

- 🔒 **Device Binding** - Binds API keys to specific devices using ECDSA P-256
- ✍️ **Request Signing** - Signs every request with a unique, non-replayable signature
- 🔍 **Fingerprinting** - Collects device metadata for audit trails (FingerprintJS)
- 💾 **Secure Storage** - Uses non-extractable keys in IndexedDB (browser) or custom adapters
- 🌐 **Universal** - Works in browsers and Node.js with appropriate adapters

---

## 📦 Installation

```bash
npm install @keyguard/sdk
```

Or with yarn:

```bash
yarn add @keyguard/sdk
```

---

## 🚀 Quick Start

### Browser Usage

```typescript
import { KeyGuardClient } from '@keyguard/sdk';

// Initialize the client
const client = new KeyGuardClient({
  apiKey: 'kg_prod_your_api_key'
});

// 1. Check if device is enrolled
const isEnrolled = await client.isEnrolled();

if (!isEnrolled) {
  // 2. Enroll the device (generates cryptographic key pair)
  const enrollment = await client.enroll('My Laptop');
  
  // 3. Send enrollment to your backend for registration
  await fetch('/api/enroll', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(enrollment)
  });
}

// 4. Sign requests to LLM providers
const headers = await client.signRequest({
  method: 'POST',
  url: 'https://api.openai.com/v1/chat/completions',
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});

// 5. Make the signed request
const response = await fetch('/api/proxy/openai/chat/completions', {
  method: 'POST',
  headers: {
    ...headers,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});
```

### Node.js Usage

For Node.js environments, provide a custom storage adapter and fingerprint provider:

```typescript
import { KeyGuardClient, MemoryStorageAdapter } from '@keyguard/sdk';

const client = new KeyGuardClient({
  apiKey: 'kg_prod_your_api_key',
  storage: new MemoryStorageAdapter(),
  fingerprintProvider: {
    getFingerprint: async () => ({
      visitorId: 'node-server-1',
      label: 'Production Server',
      metadata: { hostname: 'api.example.com' }
    })
  }
});
```

---

## 📖 API Reference

### `KeyGuardClient`

The main SDK client class.

#### Constructor

```typescript
new KeyGuardClient(config: KeyGuardConfig)
```

**Config Options:**

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `apiKey` | `string` | ✅ | Project API key (e.g., `kg_prod_...`) |
| `apiBaseUrl` | `string` | ❌ | Backend URL (default: production API) |
| `storage` | `'browser'` \| `'memory'` \| `StorageAdapter` | ❌ | Key storage strategy |
| `fingerprintProvider` | `FingerprintProvider` | ❌ | Custom fingerprinting logic |

#### Methods

##### `enroll(deviceName?: string): Promise<EnrollmentPayload>`

Enrolls the device by generating a cryptographic key pair.

```typescript
const enrollment = await client.enroll('My MacBook Pro');

console.log(enrollment);
// {
//   publicKey: 'MFkwEwYHKoZI...',      // Base64 SPKI public key
//   keyId: 'a1b2c3d4e5f6...',          // Key identifier (SHA-256 hash)
//   deviceFingerprint: 'xyz123...',    // FingerprintJS visitor ID
//   label: 'My MacBook Pro',           // Device name
//   userAgent: 'Mozilla/5.0...',       // Browser user agent
//   metadata: { ... }                  // Device metadata
// }
```

##### `signRequest(request): Promise<SignedRequestHeaders>`

Signs an HTTP request with device credentials.

```typescript
const headers = await client.signRequest({
  method: 'POST',
  url: 'https://api.openai.com/v1/chat/completions',
  body: JSON.stringify({ model: 'gpt-4', messages: [] })
});

console.log(headers);
// {
//   'x-keyguard-api-key': 'kg_prod_...',
//   'x-keyguard-key-id': 'a1b2c3d4...',
//   'x-keyguard-timestamp': '2024-01-15T10:30:00.000Z',
//   'x-keyguard-nonce': 'randomBase64...',
//   'x-keyguard-body-sha256': 'sha256Base64...',
//   'x-keyguard-alg': 'ECDSA_P256_SHA256_P1363',
//   'x-keyguard-signature': 'signatureBase64...'
// }
```

##### `isEnrolled(): Promise<boolean>`

Checks if the device has stored keys.

```typescript
const enrolled = await client.isEnrolled();
// true or false
```

##### `unenroll(): Promise<void>`

Clears all stored keys from the device.

```typescript
await client.unenroll();
```

---

## 🔐 Security Protocol (V1)

### Signature Headers

Every signed request includes these headers:

| Header | Description | Example |
|--------|-------------|---------|
| `x-keyguard-signature` | Base64 ECDSA signature (IEEE P1363) | `MEUCIQDk...` |
| `x-keyguard-timestamp` | ISO 8601 timestamp | `2024-01-15T10:30:00.000Z` |
| `x-keyguard-nonce` | Random 16-byte nonce (Base64) | `a3F5d2g...` |
| `x-keyguard-key-id` | Key ID (SHA-256 hash of SPKI public key) | `a1b2c3d4...` |
| `x-keyguard-api-key` | Project API Key | `kg_prod_...` |
| `x-keyguard-body-sha256` | SHA-256 hash of raw body (Base64) | `47DEQpj...` |
| `x-keyguard-alg` | Signing algorithm | `ECDSA_P256_SHA256_P1363` |

### Canonical Payload

The signature is calculated over this pipe-separated string:

```
kg-v1|{timestamp}|{METHOD}|{pathAndQuery}|{bodySha256}|{nonce}|{apiKey}|{keyId}
```

**Example:**

```
kg-v1|2024-01-15T10:30:00.000Z|POST|/v1/chat/completions|47DEQpj...|randomNonce|kg_prod_abc|a1b2c3d4
```

**Field Details:**

| Field | Description |
|-------|-------------|
| `kg-v1` | Protocol version identifier |
| `timestamp` | ISO 8601 timestamp (prevents replay) |
| `METHOD` | HTTP method in uppercase (GET, POST, etc.) |
| `pathAndQuery` | URL path and query string (`/v1/chat?q=hello`) |
| `bodySha256` | Base64 SHA-256 hash of raw body (empty string hash if no body) |
| `nonce` | Random 16-byte Base64 string (prevents replay) |
| `apiKey` | Project API key |
| `keyId` | Device key identifier |

---

## 💾 Storage Adapters

### BrowserStorageAdapter (Default)

Uses IndexedDB with `idb-keyval` for secure key storage in browsers.

```typescript
import { KeyGuardClient, BrowserStorageAdapter } from '@keyguard/sdk';

const client = new KeyGuardClient({
  apiKey: 'kg_prod_...',
  storage: new BrowserStorageAdapter()
});
```

### MemoryStorageAdapter

Stores keys in memory (for testing or Node.js):

```typescript
import { KeyGuardClient, MemoryStorageAdapter } from '@keyguard/sdk';

const client = new KeyGuardClient({
  apiKey: 'kg_prod_...',
  storage: new MemoryStorageAdapter()
});
```

### Custom Storage Adapter

Implement the `StorageAdapter` interface:

```typescript
import { StorageAdapter } from '@keyguard/sdk';

class MyCustomStorage implements StorageAdapter {
  async saveKeyPair(publicKey: CryptoKey, privateKey: CryptoKey): Promise<void> {
    // Store keys securely
  }

  async getKeyPair(): Promise<{ publicKey: CryptoKey; privateKey: CryptoKey } | null> {
    // Retrieve keys
  }

  async clear(): Promise<void> {
    // Delete keys
  }
}
```

---

## 🔍 Fingerprinting

### Default (FingerprintJS)

In browser environments, the SDK uses [FingerprintJS](https://fingerprint.com/) for device fingerprinting.

### Custom Fingerprint Provider

For Node.js or custom fingerprinting:

```typescript
import { FingerprintProvider } from '@keyguard/sdk';

const customProvider: FingerprintProvider = {
  getFingerprint: async () => ({
    visitorId: 'unique-device-id',
    label: 'Custom Device Label',
    metadata: {
      hostname: 'server.example.com',
      environment: 'production'
    }
  })
};

const client = new KeyGuardClient({
  apiKey: 'kg_prod_...',
  fingerprintProvider: customProvider
});
```

---

## 🏗️ Architecture

```
@keyguard/sdk/
├── src/
│   ├── index.ts           # Public exports
│   ├── client.ts          # Main KeyGuardClient class
│   ├── types.ts           # TypeScript interfaces
│   ├── core/
│   │   ├── crypto.ts      # ECDSA P-256 cryptographic operations
│   │   └── fingerprint.ts # Device fingerprinting
│   └── storage/
│       ├── browser.ts     # IndexedDB storage adapter
│       └── memory.ts      # In-memory storage adapter
├── dist/                  # Built output (ESM + CJS)
├── package.json
├── tsconfig.json
└── tsup.config.ts         # Build configuration
```

---

## 🔧 Development

### Building

```bash
# Build the SDK
npm run build

# Watch mode
npm run dev

# Type checking
npm run typecheck
```

### Output Formats

The SDK is built with [tsup](https://tsup.egoist.dev/) and outputs:

- **ESM**: `dist/index.mjs`
- **CommonJS**: `dist/index.js`
- **Types**: `dist/index.d.ts`

---

## 📋 TypeScript Types

The SDK exports all necessary types:

```typescript
import {
  KeyGuardClient,
  KeyGuardConfig,
  EnrollmentPayload,
  SignedRequestHeaders,
  StorageAdapter,
  FingerprintProvider,
  BrowserStorageAdapter,
  MemoryStorageAdapter
} from '@keyguard/sdk';
```

---

## ⚠️ Error Handling

The SDK throws descriptive errors:

```typescript
try {
  await client.enroll();
} catch (error) {
  if (error.message.includes('already enrolled')) {
    // Device is already enrolled
    await client.unenroll();
    await client.enroll();
  }
}

try {
  await client.signRequest({ method: 'POST', url: '/api', body: '{}' });
} catch (error) {
  if (error.message.includes('not enrolled')) {
    // Device needs enrollment first
    await client.enroll();
  }
}
```

---

## 🌐 Browser Compatibility

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 63+ | Full support |
| Firefox | 60+ | Full support |
| Safari | 12+ | Full support |
| Edge | 79+ | Full support |

**Requirements:**
- Web Crypto API (`crypto.subtle`)
- IndexedDB (for BrowserStorageAdapter)

---

## 🔒 Security Considerations

1. **Private Key Protection**: Private keys are generated as `non-extractable` CryptoKeys and never leave the device
2. **Replay Prevention**: Nonce + timestamp combination prevents replay attacks
3. **Request Integrity**: Body hash ensures the request hasn't been tampered with
4. **Secure Storage**: IndexedDB provides same-origin isolation

---

## 📝 License

MIT License - see the [LICENSE](./LICENSE) file for details.

---

<p align="center">
  <strong>Part of the KeyGuard Platform</strong>
</p>

<p align="center">
  <a href="../../README.md">Main Docs</a> •
  <a href="../../backend/README.md">Backend</a> •
  <a href="../../frontend/README.md">Frontend</a>
</p>
