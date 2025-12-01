# Backend Phase 1 Technical Specification

## Overview

This document outlines the backend requirements to support the SDK functionality for device enrollment and signature verification. You need to implement **2 endpoints**, **2 database tables**, and **cryptographic verification logic**.

---

## 1. Database Schema

We need two core tables in Prisma to link devices to projects.

```prisma
// schema.prisma

// 1. API Keys for projects (e.g., kg_prod_123)
model ApiKey {
  id        String   @id @default(uuid())
  keyPrefix String   @unique // The ID sent from the SDK
  name      String
  devices   Device[] // One-to-many: one key has many devices
  createdAt DateTime @default(now())
}

// 2. Registered devices (developer laptops)
model Device {
  id                String   @id @default(uuid())
  publicKey         String   @unique // Most important field (Base64 SPKI)
  fingerprint       String   // Device fingerprint from FingerprintJS
  label             String   // Device name (e.g., "Ahmed's Mac")
  status            String   @default("ACTIVE") // ACTIVE, PENDING, REVOKED
  
  apiKeyId          String
  apiKey            ApiKey   @relation(fields: [apiKeyId], references: [id])
  
  lastSeenAt        DateTime @default(now())
  createdAt         DateTime @default(now())
  
  @@unique([apiKeyId, publicKey]) // Prevent duplicate device for same key
}
```

---

## 2. Endpoint #1: Device Enrollment

**Purpose:** The SDK will send you the public key, and you store it in the database.

### Request

- **Method:** `POST`
- **Path:** `/api/v1/enroll`
- **Body:**

```json
{
  "apiKey": "kg_prod_12345",       // Project API key
  "publicKey": "MFkwEwYHKoZ...",   // Public key (Base64)
  "deviceFingerprint": "a1b2c3d4", // Device fingerprint
  "label": "Chrome on MacOS",      // Device name
  "metadata": {}                   // Optional additional data
}
```

### Required Logic

1. Verify that `apiKey` exists in the `ApiKey` table
2. Save the data to the `Device` table
3. Return the `deviceId`

### Response

```json
{
  "id": "device-uuid-here",
  "status": "ACTIVE"
}
```

---

## 3. Endpoint #2: Signature Verification

**Purpose:** This is the "checkpoint". The SDK will send you a signature, and you verify if it's valid. (Currently for testing; later it will become Middleware).

### Request

- **Method:** `POST`
- **Path:** `/api/v1/verify-test`

### Headers You Will Receive

- `x-keyguard-signature`: The encrypted signature
- `x-keyguard-key-id`: The Public Key (or its ID)
- `x-keyguard-timestamp`: Request timestamp
- `x-keyguard-nonce`: Random number

### Core Cryptographic Logic

This is the code needed to verify the **ECDSA P-256** algorithm.

```typescript
import { verify, createPublicKey } from 'node:crypto';

// This function is the heart of the system
function verifyRequest(publicKeyBase64: string, signatureBase64: string, payloadString: string): boolean {
  try {
    // 1. Prepare the public key
    const publicKey = createPublicKey({
      key: Buffer.from(publicKeyBase64, 'base64'),
      format: 'der', // Because we send it as SPKI Raw
      type: 'spki'
    });

    // 2. Verify
    const isValid = verify(
      "sha256", 
      Buffer.from(payloadString), 
      publicKey, 
      Buffer.from(signatureBase64, 'base64')
    );

    return isValid;
  } catch (e) {
    console.error("Crypto Error:", e);
    return false;
  }
}
```

**Note:** The `payloadString` is a concatenation of: `timestamp|METHOD|url|body|nonce`

### Response

```json
{
  "valid": true
}
```

---

## 4. Definition of Done (This Week)

The server should be ready so that:

1. I can send `POST /enroll` and my device gets saved in the database
2. I can send `POST /verify-test` with a signature from my device, and the server responds with `{ "valid": true }`

---

## Technical Notes

- **Database:** Use Prisma with the schema provided above
- **Crypto Library:** Node.js built-in `crypto` module
- **Algorithm:** ECDSA with P-256 curve and SHA-256 hashing
- **Key Format:** SPKI (SubjectPublicKeyInfo) in Base64
- **Signature Format:** Base64-encoded raw signature bytes

---

## Next Steps

Once these endpoints are functional:
1. We'll integrate the SDK with the server
2. Test end-to-end device enrollment
3. Verify signature validation works correctly
4. Celebrate the first secure connection! 🚀
