Start Backend Phase 1 Testing

Create a file (for backend team) like: BACKEND_PHASE1_README.md

# KeyGuard Backend Phase 1 — Enrollment + Signature Verification (SDK Test)

This README describes the minimal backend required to test the KeyGuard SDK end-to-end.

The SDK performs **device binding** by:
- generating an ECDSA P-256 key pair on the client
- sending the **public key** to the backend during enrollment
- signing each request using the device **private key**
- backend verifies signed requests using the stored **public key**

---

## 1) Protocol Summary (What the SDK Sends)

### Enrollment (`POST /api/v1/enroll`)
Body (from SDK):
```json
{
  "publicKey": "<Base64 SPKI>",
  "keyId": "<string key id>",
  "deviceFingerprint": "<fingerprintjs visitorId>",
  "label": "Ahmed’s MacBook",
  "userAgent": "<browser UA>",
  "metadata": {}
}


Backend must store:

projectApiKey (from your project table or API key record)

keyId

publicKey (SPKI base64)

device fingerprint + label + status

Signed Request Headers (from SDK)

The SDK will add:

x-keyguard-api-key: project key (e.g., kg_prod_123)

x-keyguard-key-id: stable key identifier (hash-based)

x-keyguard-timestamp: ISO8601 timestamp

x-keyguard-nonce: random nonce (unique per request)

x-keyguard-body-sha256: SHA-256 hash of RAW request body bytes (empty body is allowed)

x-keyguard-alg: ECDSA_P256_SHA256_P1363

x-keyguard-signature: Base64 signature

NOTE: The SDK uses WebCrypto ECDSA. The signature format is typically IEEE-P1363 (r||s).
Your verification code must match that format.

2) Canonical Payload to Verify

Backend must rebuild the exact signed payload:

kg-v1|{timestamp}|{METHOD}|{pathAndQuery}|{bodySha256}|{nonce}|{apiKey}|{keyId}


Rules:

METHOD must be uppercase

pathAndQuery must be ONLY /path?query (no scheme/host)

bodySha256 must be computed from the raw request body bytes exactly as received

empty body is allowed

If payload reconstruction differs by even 1 character, verification fails.

3) Minimal Database Schema (Example)

You need two tables:

Projects (API Keys)

id

apiKey (unique, e.g., kg_prod_123)

status

DeviceKeys (registered devices)

id

projectId

keyId (string from SDK)

publicKeySpkiBase64

status (ACTIVE, REVOKED, etc.)

createdAt, lastSeenAt

Uniqueness:

unique(projectId, keyId)

4) Endpoints to Implement
A) POST /api/v1/enroll

Purpose: store the public key under a project.

Request

Header or body must identify the project (recommended: x-keyguard-api-key, or include apiKey in body)

Logic

validate project API key exists and active

insert device key record:

keyId

publicKeySpkiBase64

status ACTIVE

optional: fingerprint, label, userAgent, metadata

return deviceId and status

Response

{ "id": "device-uuid", "status": "ACTIVE" }

B) POST /api/v1/verify-test

Purpose: test signature verification (later becomes middleware).

Request

Any method/path/body is fine, but for testing this endpoint returns { valid: true/false }.

Must receive the signed headers listed above.

Logic

Read headers: apiKey, keyId, signature, timestamp, nonce, bodySha256, alg

DB lookup:

project by apiKey

device key by (projectId, keyId) -> get publicKeySpkiBase64

Replay protection (required for a real system):

timestamp must be within a window (e.g., 120 seconds)

nonce must be unique per (projectId,keyId) within TTL (store in Redis with TTL)

Reconstruct payload string:
kg-v1|timestamp|METHOD|pathAndQuery|bodySha256|nonce|apiKey|keyId

Verify signature using the stored public key.

Return { valid: true } if verification passes.

Response

{ "valid": true }

5) Verification Code (Node.js)
Option 1 (Recommended): Node WebCrypto verify (matches browser WebCrypto)
import { webcrypto } from "node:crypto";
const subtle = webcrypto.subtle;

const importParams: EcKeyImportParams = { name: "ECDSA", namedCurve: "P-256" };
const verifyParams: EcdsaParams = { name: "ECDSA", hash: { name: "SHA-256" } };

const b64 = (s: string) => Buffer.from(s, "base64");

export async function verifySignatureWebCrypto(
  publicKeySpkiBase64: string,
  payload: string,
  signatureBase64: string
) {
  const publicKey = await subtle.importKey(
    "spki",
    b64(publicKeySpkiBase64),
    importParams,
    true,
    ["verify"]
  );

  return subtle.verify(
    verifyParams,
    publicKey,
    b64(signatureBase64),
    Buffer.from(payload, "utf8")
  );
}

Option 2: node:crypto.verify with P1363 support
import { verify, createPublicKey } from "node:crypto";

export function verifySignatureNodeCrypto(
  publicKeySpkiBase64: string,
  payload: string,
  signatureBase64: string
) {
  const publicKey = createPublicKey({
    key: Buffer.from(publicKeySpkiBase64, "base64"),
    format: "der",
    type: "spki",
  });

  return verify(
    "sha256",
    Buffer.from(payload, "utf8"),
    { key: publicKey, dsaEncoding: "ieee-p1363" },
    Buffer.from(signatureBase64, "base64")
  );
}

6) Raw Body Handling (Important)

To compute/compare x-keyguard-body-sha256, you must hash the raw request body bytes before parsing JSON.

In Express, use a verify function in the JSON middleware to capture raw body:

app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf; // Buffer
  }
}));


Then compute SHA-256 on req.rawBody and compare with x-keyguard-body-sha256.

7) “Definition of Done” (Phase 1)

Backend is ready when:

POST /api/v1/enroll stores a device public key under a project

A browser client using the SDK can call POST /api/v1/verify-test
and backend returns:

{ "valid": true }

8) Troubleshooting

If valid=false, the most common causes are:

Payload mismatch: backend used full URL instead of path+query

Body mismatch: backend hashed parsed JSON instead of raw bytes

Signature format mismatch: backend assumed DER instead of IEEE-P1363

Timestamp window too strict or nonce reused
