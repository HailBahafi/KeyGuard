# BACKEND_SPECS.md

**Status:** High Priority
**Tech Stack:** NestJS • Prisma (Postgres) • Redis

## Overview

This backend powers **Keyguard**:

* **Device Enrollment**: SDK registers a device against an API Key (Project).
* **Security Proxy**: verifies signed requests (anti-replay + ECDSA P-256) and forwards them to OpenAI using the project’s real provider key (encrypted at rest).
* **Dashboard Management**: list/approve/revoke devices for a given project.

---

## High-Level Architecture

**Request Flow (SDK → Proxy → OpenAI)**

1. SDK enrolls device: `POST /api/v1/devices/enroll`
2. Admin approves device: `PATCH /api/v1/devices/:id/approve`
3. SDK sends signed proxy calls: `POST /api/v1/proxy/*`
4. Proxy:

   * validates timestamp + nonce (Redis)
   * validates device is **ACTIVE**
   * verifies ECDSA signature with device public key
   * decrypts provider key
   * forwards to `https://api.openai.com/...`
   * streams response back to client

---

## Database Schema (Prisma)

> File: `prisma/schema.prisma`

```prisma
model ApiKey {
  id          String    @id @default(uuid())
  name        String    // e.g. "Production OpenAI"
  keyPrefix   String    @unique // e.g. "kg_prod_..." (Used by SDK to identify project)

  // The real provider key (Encrypted at rest)
  providerKeyEncrypted String

  devices     Device[]
  logs        RequestLog[]

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Device {
  id                String    @id @default(uuid())
  // Hardware Identity
  publicKey         String    // Base64 SPKI (From SDK)
  fingerprint       String    // Device Fingerprint Hash

  // Metadata
  label             String    // e.g. "Ahmed's Macbook"
  metadata          Json?

  // State
  status            String    // PENDING | ACTIVE | REVOKED

  // Relations
  apiKeyId          String
  apiKey            ApiKey    @relation(fields: [apiKeyId], references: [id])

  lastSeenAt        DateTime  @default(now())
  createdAt         DateTime  @default(now())

  // Ensure a device registers only once per project
  @@unique([apiKeyId, publicKey])
}

model RequestLog {
  id          String   @id @default(uuid())
  deviceId    String?
  apiKeyId    String
  endpoint    String
  status      Int      // 200, 403, etc.
  timestamp   DateTime @default(now())
}
```

### Notes / Recommendations

* Consider converting `Device.status` to an enum for stronger integrity:

  * `enum DeviceStatus { PENDING ACTIVE REVOKED }`
* Add indexes if needed later:

  * `Device(apiKeyId, status)`
  * `RequestLog(apiKeyId, timestamp)`

---

## Core Concepts

### ApiKey (Project)

* Identified externally by `keyPrefix` (e.g. `kg_prod_...`)
* Stores `providerKeyEncrypted` (real OpenAI key encrypted at rest)

### Device (Developer / Client)

* Enrolled per project using `publicKey` and a `fingerprint`
* Must be **ACTIVE** to use proxy
* Enrollment is **idempotent** per `(apiKeyId, publicKey)` unique constraint

### RequestLog

* Stores minimal audit info for proxy calls (status, endpoint, timestamp, apiKeyId, optional deviceId)

---

## Feature 1: Device Enrollment

### Endpoint

`POST /api/v1/devices/enroll`

### Description

Handles initial handshake from SDK and creates a **PENDING** device entry.

### Request Body (DTO)

```json
{
  "apiKeyPrefix": "kg_prod_123...",
  "publicKey": "base64_string...",
  "deviceFingerprint": "hash...",
  "label": "Chrome on MacOS",
  "metadata": { }
}
```

### Business Logic

1. Find `ApiKey` by `keyPrefix`

   * if not found → **404 Not Found**
2. Check if `(apiKeyId, publicKey)` already exists

   * if yes → return existing deviceId (idempotency)
3. Create device with:

   * `status = "PENDING"`
   * `fingerprint = deviceFingerprint`
   * `label`, `metadata`
4. Return created device info

### Response

**201 Created**

```json
{ "deviceId": "uuid...", "status": "PENDING" }
```

**200 OK** (idempotent re-enroll)

```json
{ "deviceId": "uuid...", "status": "PENDING" }
```

---

## Feature 2: Security Proxy (Core Engine)

### Endpoint

`POST /api/v1/proxy/*` (wildcard)

### Description

Intercepts SDK requests, verifies cryptographic headers, then forwards to OpenAI.

### Required Headers

* `x-keyguard-signature`
* `x-keyguard-timestamp`
* `x-keyguard-nonce`
* `x-keyguard-key-id` (device public key identifier; see lookup strategy below)

### Guard Logic (Verification)

#### 1) Anti-Replay

* Reject if timestamp is older than **10 seconds**
* Use Redis nonce lock:

  * `SET nonceKey value NX EX 20`
  * If already exists → reject as replay

**Redis key suggestion**

* `keyguard:nonce:{apiKeyPrefix}:{nonce}`

#### 2) Device Lookup

* Locate the device using `x-keyguard-key-id`
* Verify:

  * device exists
  * `device.status === "ACTIVE"`

> **Key-ID lookup strategy**

* If `x-keyguard-key-id` is the literal `publicKey` (base64 SPKI), lookup by:

  * `Device.publicKey`
* If it’s a derived ID (recommended), store a `publicKeyHash` field and lookup by that.

#### 3) Crypto Verify (ECDSA P-256)

* Verify signature using the device public key (SPKI)
* Must validate signature against a canonical “signing payload” (example below)

**Canonical signing payload (example)**

```
timestamp + "\n" +
nonce + "\n" +
method + "\n" +
path + "\n" +
sha256(body)
```

> The SDK and backend must match the exact canonicalization rules.

---

## Forwarding Logic (Proxy → OpenAI)

1. Resolve project (`ApiKey`) from the device relation or from route context
2. Decrypt `ApiKey.providerKeyEncrypted`
3. Forward the request to:

   * `https://api.openai.com/...` (preserve path after `/proxy`)
4. Attach header:

   * `Authorization: Bearer sk-openai-real-key`
5. Stream response back to client (including SSE / streaming responses)
6. Write `RequestLog`:

   * `apiKeyId`, optional `deviceId`, `endpoint`, `status`

### Response Behavior

* If auth/verification fails → return **401/403**
* If OpenAI errors → pass through status + body
* Streaming responses must remain streaming end-to-end

---

## Feature 3: Dashboard Management (Next.js Frontend)

> These endpoints are used by the dashboard/admin UI.

### List Devices

`GET /api/v1/devices`

**Query Filters**

* `?status=PENDING` (optional)

**Response (example)**

```json
[
  {
    "id": "uuid...",
    "publicKey": "base64...",
    "fingerprint": "hash...",
    "label": "Ahmed's Macbook",
    "metadata": {},
    "status": "PENDING",
    "lastSeenAt": "2025-12-08T12:00:00.000Z",
    "createdAt": "2025-12-08T11:00:00.000Z",
    "apiKeyId": "uuid..."
  }
]
```

### Approve Device

`PATCH /api/v1/devices/:id/approve`

**Behavior**

* Set `status = "ACTIVE"`

**Response**

```json
{ "id": "uuid...", "status": "ACTIVE" }
```

### Revoke Device (Soft Delete)

`DELETE /api/v1/devices/:id`

**Behavior**

* Set `status = "REVOKED"` (do not delete row)

**Response**

```json
{ "id": "uuid...", "status": "REVOKED" }
```

---

## NestJS Module Layout (Suggested)

```
src/
  app.module.ts

  prisma/
    prisma.module.ts
    prisma.service.ts

  redis/
    redis.module.ts
    redis.service.ts

  crypto/
    crypto.module.ts
    crypto.service.ts   // verify signature, hashing, canonical payload
    encryption.service.ts // decrypt provider keys

  api-keys/
    api-keys.module.ts
    api-keys.service.ts

  devices/
    devices.module.ts
    devices.controller.ts
    devices.service.ts
    dto/enroll-device.dto.ts

  proxy/
    proxy.module.ts
    proxy.controller.ts
    proxy.service.ts
    guards/keyguard-auth.guard.ts

  logs/
    logs.module.ts
    logs.service.ts
```

---

## Security Requirements

### Provider Key Encryption (At Rest)

* `providerKeyEncrypted` must be encrypted before persisting
* Decrypt only inside proxy forwarding path
* Recommended:

  * AES-256-GCM with a server-managed key (env / KMS)
  * include `iv`, `tag`, `ciphertext` (encode as base64 JSON blob)

### Anti-Replay

* Timestamp skew limit: **10 seconds**
* Nonce uniqueness enforced via Redis:

  * NX + EX = 20 seconds

### Device Status Enforcement

* Only `ACTIVE` devices may access proxy
* `PENDING` and `REVOKED` must be rejected

---

## Observability (Minimum)

* Log verification failures (without sensitive payloads)
* Store `RequestLog` records for:

  * apiKeyId
  * deviceId (if known)
  * endpoint
  * status
  * timestamp

---

## Error Codes (Suggested)

* `404` ApiKey not found (enroll)
* `400` invalid payload / headers
* `401` missing/invalid signature headers
* `403` device not ACTIVE / replay detected
* `502` upstream OpenAI failure (optional; or pass-through)

