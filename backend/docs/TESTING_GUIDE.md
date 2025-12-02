# KeyGuard Testing Guide

This guide explains how to test the KeyGuard implementation.

## Prerequisites

1. Database is running (PostgreSQL)
2. Environment variables are configured
3. Dependencies are installed: `npm install`

## Setup

### 1. Generate Prisma Client

```bash
npx prisma generate
```

### 2. Run Database Migrations

```bash
npx prisma migrate dev --name add_keyguard_tables
```

### 3. Seed Database

```bash
npm run prisma:seed
```

This will create test API keys:
- `kg_prod_xxx` - Production Project
- `kg_dev_xxx` - Development Project
- `kg_test_xxx` - Test Project

## Running Tests

### Unit Tests

Run all unit tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:cov
```

Run tests in watch mode:
```bash
npm run test:watch
```

### E2E Tests

Run end-to-end tests:
```bash
npm run test:e2e
```

### Specific Test Files

Run KeyGuard service tests:
```bash
npm test -- keyguard.service.spec
```

Run signature verification tests:
```bash
npm test -- signature-verification.service.spec
```

Run E2E tests:
```bash
npm test -- keyguard.e2e-spec
```

## Manual Testing with cURL

### 1. Start the Application

```bash
npm run start:dev
```

The server will start on `http://localhost:3000` (or your configured port).

### 2. Enroll a Device

First, generate a key pair using the provided test script:

```bash
node scripts/generate-test-keypair.js
```

This will output:
- Public Key (SPKI Base64)
- Private Key
- Key ID

Use the public key to enroll:

```bash
curl -X POST http://localhost:3000/api/v1/keyguard/enroll \
  -H "Content-Type: application/json" \
  -H "x-keyguard-api-key: kg_prod_123" \
  -d '{
    "publicKey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...",
    "keyId": "kg_key_abc123",
    "deviceFingerprint": "fingerprint123",
    "label": "My Test Device",
    "userAgent": "curl/7.0",
    "metadata": {}
  }'
```

Expected Response:
```json
{
  "id": "device-uuid",
  "status": "ACTIVE",
  "createdAt": "2025-12-02T10:30:00.000Z"
}
```

### 3. Test Signature Verification

Use the provided test script to generate a signed request:

```bash
node scripts/sign-request.js
```

This will output the required headers. Then make a request:

```bash
curl -X POST http://localhost:3000/api/v1/keyguard/verify-test \
  -H "Content-Type: application/json" \
  -H "x-keyguard-api-key: kg_prod_123" \
  -H "x-keyguard-key-id: kg_key_abc123" \
  -H "x-keyguard-timestamp: 2025-12-02T10:30:00.000Z" \
  -H "x-keyguard-nonce: nonce123" \
  -H "x-keyguard-body-sha256: hash..." \
  -H "x-keyguard-alg: ECDSA_P256_SHA256_P1363" \
  -H "x-keyguard-signature: signature..." \
  -d '{"test":"data"}'
```

Expected Response:
```json
{
  "valid": true,
  "deviceId": "device-uuid",
  "keyId": "kg_key_abc123"
}
```

### 4. List Devices

```bash
curl -X GET http://localhost:3000/api/v1/keyguard/devices \
  -H "x-keyguard-api-key: kg_prod_123"
```

### 5. Revoke a Device

```bash
curl -X DELETE http://localhost:3000/api/v1/keyguard/devices/{device-id} \
  -H "x-keyguard-api-key: kg_prod_123"
```

## Test Scenarios

### Success Cases

1. ✅ Enroll new device with valid public key
2. ✅ Verify request with valid signature
3. ✅ Verify request with empty body
4. ✅ List all devices for API key
5. ✅ Get device by ID
6. ✅ Revoke device

### Error Cases

1. ❌ Enroll without API key
2. ❌ Enroll with invalid API key
3. ❌ Enroll with duplicate keyId
4. ❌ Enroll with invalid public key format
5. ❌ Verify with invalid signature
6. ❌ Verify with modified body (body hash mismatch)
7. ❌ Verify with replay attack (reused nonce)
8. ❌ Verify with old timestamp (outside window)
9. ❌ Verify with missing headers
10. ❌ Verify with revoked device

## Coverage Report

After running tests with coverage:

```bash
npm run test:cov
```

Open the coverage report:

```bash
open coverage/lcov-report/index.html
```

Target coverage: 80%+ for all metrics (lines, branches, functions, statements)

## Troubleshooting

### Issue: "Invalid signature"

**Causes:**
- Payload mismatch (check method, path, body hash, timestamp, nonce)
- Body hash computed from parsed JSON instead of raw bytes
- Signature format mismatch (DER vs IEEE-P1363)

**Solution:**
- Verify canonical payload construction
- Ensure raw body is captured before JSON parsing
- Use WebCrypto for consistent signature format

### Issue: "Body hash mismatch"

**Causes:**
- Body was modified after signing
- Hash computed on wrong data (parsed JSON vs raw bytes)
- Whitespace differences in JSON

**Solution:**
- Compute hash on raw body buffer before JSON parsing
- Send exact same bytes that were signed

### Issue: "Replay attack detected"

**Causes:**
- Nonce was reused (intentional replay)
- Nonce stored in database from previous request

**Solution:**
- Generate fresh nonce for each request
- Nonces expire after 120 seconds

### Issue: "Timestamp outside valid window"

**Causes:**
- Client clock skew
- Request took too long to reach server
- Timestamp is more than 120 seconds old/future

**Solution:**
- Sync client clock with NTP
- Ensure timestamp window is reasonable (default: 120 seconds)
- Generate timestamp just before signing

## Performance Benchmarks

Expected performance on modern hardware:

- **Enrollment**: < 50ms
- **Signature Verification**: < 100ms
- **Device Lookup**: < 10ms
- **Nonce Check**: < 5ms

## Security Considerations

1. **Nonce Storage**: Currently in database, consider Redis for better performance
2. **Timestamp Window**: 120 seconds balances security and usability
3. **Key Rotation**: Not yet implemented (future phase)
4. **Rate Limiting**: Should be added in production
5. **API Key Storage**: Should use hashed values in production

## Next Steps

1. Add Redis for nonce storage (better performance)
2. Implement key rotation
3. Add rate limiting per device
4. Add device attestation
5. Implement device groups and policies
6. Add metrics and monitoring
7. Create admin dashboard for device management
