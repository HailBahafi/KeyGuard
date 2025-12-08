Part 1: Backend Implementation Specification
File Name: BACKEND_SPECS.md Status: High Priority Tech Stack: NestJS, Prisma (Postgres), Redis

1. Database Schema (Prisma)
We need to model the relationship between API Keys (Projects) and Devices (Developers).

Code snippet

// schema.prisma

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
  metadata          Json?     // OS, Browser info
  
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
2. Feature: Device Enrollment
Endpoint: POST /api/v1/devices/enroll Description: Handles the initial handshake from the SDK.

Request Body (DTO):

JSON

{
  "apiKeyPrefix": "kg_prod_123...",
  "publicKey": "base64_string...",
  "deviceFingerprint": "hash...",
  "label": "Chrome on MacOS",
  "metadata": { ... }
}
Business Logic:

Find the ApiKey record by keyPrefix. If not found -> Error 404.

Check if this publicKey already exists for this Key.

If yes -> Return existing deviceId (Idempotency).

Create new Device record with status PENDING.

Return: 201 Created with { deviceId: "...", status: "PENDING" }.

3. Feature: The Security Proxy (The Core Engine)
Endpoint: POST /api/v1/proxy/* (Wildcard) Description: Intercepts, verifies, and forwards requests to OpenAI.

Headers Required:

x-keyguard-signature

x-keyguard-timestamp

x-keyguard-nonce

x-keyguard-key-id (Device Public Key ID)

Business Logic (The Guard):

Anti-Replay: Check timestamp (max 10s old). Check Redis for nonce. If exists -> Reject. If new -> Save to Redis (SET NX EX 20).

Device Lookup: Find device by key-id. Check if status === ACTIVE.

Crypto Verify: Verify the signature using ECDSA P-256.

Forwarding Logic:

Decrypt the providerKeyEncrypted from DB.

Attach Authorization: Bearer sk-openai-real-key.

Proxy the request to https://api.openai.com/....

Stream the response back to the client.

4. Feature: Dashboard Management
Description: Endpoints used by the Next.js Frontend.

GET /api/v1/devices

Returns list of devices. Support filters: ?status=PENDING.

PATCH /api/v1/devices/:id/approve

Updates status to ACTIVE.

DELETE /api/v1/devices/:id

Updates status to REVOKED (Soft delete).
