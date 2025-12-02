# KeyGuard API - Postman Collection

This folder contains Postman collection and environment files for testing the KeyGuard API.

## Files

- **KeyGuard-API.postman_collection.json** - Complete API collection with all endpoints
- **KeyGuard-Local.postman_environment.json** - Environment for local development

## How to Import

### Import Collection

1. Open Postman
2. Click **Import** button (top left)
3. Drag and drop `KeyGuard-API.postman_collection.json` or click **Upload Files**
4. Click **Import**

### Import Environment

1. In Postman, click the **Environments** tab (left sidebar)
2. Click **Import**
3. Select `KeyGuard-Local.postman_environment.json`
4. Click **Import**
5. Select "KeyGuard - Local Development" from the environment dropdown (top right)

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `baseUrl` | API base URL | `http://localhost:3000` |
| `apiKey` | Project API key | `kg_prod_123` |
| `keyId` | Device key identifier | `kg_key_abc123` |
| `publicKey` | Base64 SPKI public key | (generated) |
| `privateKey` | Base64 PKCS8 private key | (generated) |
| `deviceId` | Enrolled device UUID | (auto-set after enrollment) |
| `timestamp` | ISO8601 timestamp | (auto-generated) |
| `nonce` | Unique nonce | (auto-generated) |
| `bodySha256` | SHA-256 body hash | (computed) |
| `signature` | Base64 signature | (computed) |

## Quick Start

### 1. Generate Keys

Run the key generation script:

```bash
cd /path/to/project
node scripts/generate-test-keypair.js
```

Copy the output values and set them in Postman environment:
- `publicKey` - SPKI Base64 public key
- `privateKey` - PKCS8 Base64 private key
- `keyId` - Generated key ID

### 2. Enroll Device

1. Go to **Device Enrollment > Enroll Device**
2. Update the request body with your generated `publicKey` and `keyId`
3. Send the request
4. The `deviceId` will be automatically saved to the environment

### 3. Test Signature Verification

For signature verification testing, you need to:

1. Generate signature headers using the signing script:

```bash
node scripts/sign-request.js \
  --api-key "kg_prod_123" \
  --key-id "your_key_id" \
  --private-key "your_private_key" \
  --body '{"test":"data"}'
```

2. Copy the generated headers into Postman:
   - `timestamp`
   - `nonce`
   - `bodySha256`
   - `signature`

3. Send the **Verify Signed Request** request

## Endpoints Included

### Device Enrollment
- **POST** `/api/v1/keyguard/enroll` - Enroll new device

### Signature Verification
- **POST** `/api/v1/keyguard/verify-test` - Test signature verification

### Device Management
- **GET** `/api/v1/keyguard/devices` - List all devices
- **GET** `/api/v1/keyguard/devices/:id` - Get device by ID
- **DELETE** `/api/v1/keyguard/devices/:id` - Revoke device

## Test Scripts

Each request includes pre-request and test scripts for:
- Automatic timestamp/nonce generation
- Response validation
- Saving variables for subsequent requests

## Response Examples

Each endpoint includes example responses for:
- Success cases
- Common error cases
- Edge cases

## Tips

1. **Use Collection Variables**: The collection includes default variables that can be overridden by environment variables

2. **Auto-generated Values**: Some values like `timestamp` and `nonce` are generated in pre-request scripts

3. **Saved Responses**: After enrolling a device, the `deviceId` is automatically saved

4. **Console Logging**: Check the Postman Console (View > Show Postman Console) for debug logs

5. **Test Results**: Review the "Test Results" tab after each request to see validation results

## Troubleshooting

### "Missing required headers"
- Ensure all KeyGuard headers are set in the environment

### "Invalid API key"
- Verify `apiKey` matches a seeded project (run `npm run prisma:seed`)

### "Invalid signature"
- Regenerate signature using the signing script
- Ensure timestamp is recent (within 120 seconds)
- Verify body hasn't changed after signing

### "Device already enrolled"
- Use a different `keyId`
- Or delete the existing device first

## Support

For issues with the API, check:
- Terminal logs when running the server
- `docs/TESTING_GUIDE.md` for detailed troubleshooting
- Unit tests for expected behavior

