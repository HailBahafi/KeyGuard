# End-to-End Integration Test Guide

This guide explains how to run the E2E integration test that verifies the SDK can successfully communicate with the Backend via signed requests.

## Prerequisites

1. **Backend is running**: The NestJS backend must be running on `http://localhost:3000`
   ```bash
   cd backend
   npm run start:dev
   ```

2. **SDK is built**: The SDK must be compiled
   ```bash
   cd packages/sdk
   npm run build
   ```

## Test Flow

The E2E test (`test.js`) performs the following steps:

1. **Device Enrollment**: SDK generates a new ECDSA P-256 key pair
2. **Request Signing**: SDK signs a test request with the private key
3. **HTTP Request**: Sends the signed request to backend `/api/v1/verify-test`
4. **Signature Verification**: Backend's `SignatureGuard` verifies the signature
5. **Response**: Backend returns success if signature is valid

## Setup Steps

### Step 1: Update SignatureGuard with Public Key

Before running the test, you need to update the hardcoded public key in the guard:

1. Run the test script once to get the public key:
   ```bash
   node test.js
   ```

2. Copy the public key from the output (it will be displayed between `━` lines)

3. Open `backend/src/common/guards/signature.guard.ts`

4. Replace `HARDCODED_PUBLIC_KEY` with the copied public key:
   ```typescript
   private readonly HARDCODED_PUBLIC_KEY = 'PASTE_YOUR_PUBLIC_KEY_HERE';
   // Replace with the actual public key from enrollment
   ```

5. Restart the backend if it's running

### Step 2: Run the Test

```bash
node test.js
```

## Expected Output

On success, you should see:

```
✅✅✅ SUCCESS! End-to-End Integration Test PASSED!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 The SDK successfully signed a request and the backend verified it!
🎉 Cryptographic handshake is working correctly!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Troubleshooting

### Error: "Cannot connect to backend"
- Make sure the backend is running on `http://localhost:3000`
- Check that the backend started successfully without errors

### Error: "Invalid signature" or 401 Unauthorized
- Verify the public key in `SignatureGuard` matches the one from enrollment
- Make sure you restarted the backend after updating the guard
- Check that the API key in the test script matches what the backend expects

### Error: "Missing required KeyGuard headers"
- This shouldn't happen if the SDK is working correctly
- Verify the SDK build is up to date: `cd packages/sdk && npm run build`

### CORS Errors
- The backend CORS is configured to allow localhost requests
- If you see CORS errors, check `backend/src/main.ts` CORS configuration

## Implementation Details

### Backend Changes

1. **Endpoint**: `POST /api/v1/verify-test` in `app.controller.ts`
   - Protected by `SignatureGuard`
   - Returns `{ status: 'success', message: 'Signature Verified!' }`

2. **SignatureGuard**: Located in `backend/src/common/guards/signature.guard.ts`
   - Verifies ECDSA P-256 signatures
   - Uses `CryptoService` for signature verification
   - Currently uses hardcoded public key (will be replaced with database lookup)

3. **CORS**: Updated to allow KeyGuard headers and localhost origins

4. **Module Configuration**: `CommonModule` now imports `KeyGuardModule` to provide `CryptoService` to `SignatureGuard`

### SDK Usage

The test script uses:
- `KeyGuardClient` from the compiled SDK
- `MemoryStorageAdapter` for in-memory key storage
- Native `fetch` API (Node.js 18+) to send HTTP requests

## Next Steps

After this test passes, you can:
1. Implement database-backed device enrollment (replace hardcoded public key)
2. Add more comprehensive test cases
3. Integrate the SDK into your frontend application
4. Deploy and test in staging/production environments


