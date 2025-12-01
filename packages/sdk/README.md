# KeyGuard SDK

Secure Device Binding SDK for protecting LLM API keys.

## Features

- **Device Binding**: Binds API keys to specific devices using ECDSA P-256.
- **Request Signing**: Signs every request with a unique, non-replayable signature.
- **Fingerprinting**: Collects device metadata for audit trails.
- **Secure Storage**: Uses non-extractable keys in IndexedDB (browser) or custom adapters (Node.js).

## Installation

```bash
npm install @keyguard/sdk
```

## Usage

### Browser

```typescript
import { KeyGuardClient } from '@keyguard/sdk';

const client = new KeyGuardClient({
  apiKey: 'kg_prod_123456789'
});

// 1. Enroll Device
const enrollment = await client.enroll();
// Send enrollment to backend...

// 2. Sign Request
const headers = await client.signRequest({
  method: 'POST',
  url: 'https://api.openai.com/v1/chat/completions',
  body: JSON.stringify({ model: 'gpt-4', messages: [] })
});

// Attach headers to your request
await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    ...headers,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ model: 'gpt-4', messages: [] })
});
```

### Node.js (Testing/Bot)

```typescript
import { KeyGuardClient, MemoryStorageAdapter } from '@keyguard/sdk';

const client = new KeyGuardClient({
  apiKey: 'kg_prod_123456789',
  storage: new MemoryStorageAdapter(),
  fingerprintProvider: {
    getFingerprint: async () => ({
      visitorId: 'node-bot-1',
      label: 'Node.js Bot',
      metadata: {}
    })
  }
});
```

## Protocol V1

### Headers

| Header | Description |
|--------|-------------|
| `x-keyguard-signature` | Base64 ECDSA signature (IEEE P1363) |
| `x-keyguard-timestamp` | ISO 8601 timestamp |
| `x-keyguard-nonce` | Random 16-byte nonce (Base64) |
| `x-keyguard-key-id` | Key ID (SHA-256 hash of SPKI public key) |
| `x-keyguard-api-key` | Project API Key |
| `x-keyguard-body-sha256` | SHA-256 hash of raw body (Base64) |
| `x-keyguard-alg` | `ECDSA_P256_SHA256_P1363` |

### Canonical Payload

The signature is calculated over the following pipe-separated string:

```text
kg-v1|{timestamp}|{METHOD}|{pathAndQuery}|{bodySha256}|{nonce}|{apiKey}|{keyId}
```

- **METHOD**: Uppercase (e.g., `POST`)
- **pathAndQuery**: URL path and query string (e.g., `/v1/chat?q=hello`)
- **bodySha256**: Base64 SHA-256 hash of raw body bytes (empty string hash if no body)
