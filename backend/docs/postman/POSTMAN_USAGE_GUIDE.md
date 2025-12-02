# KeyGuard API - Postman Collection Usage Guide

## Overview

The KeyGuard Complete API Postman collection provides comprehensive documentation and testing capabilities for all KeyGuard Backend endpoints.

## Collections Available

### 1. **KeyGuard-Complete-API.postman_collection.json** (NEW - Recommended)
- ✅ All endpoints documented (22 total)
- ✅ Complete request/response examples
- ✅ All HTTP status codes covered
- ✅ Validation examples
- ✅ Error scenarios
- ✅ Authentication flows

### 2. **KeyGuard-API.postman_collection.json** (Legacy)
- Legacy device binding endpoints
- Signature verification endpoints
- Phase 1 features only

## Quick Start

### Step 1: Import Collection

1. Open Postman
2. Click **Import** button
3. Select `KeyGuard-Complete-API.postman_collection.json`
4. Collection will appear in your sidebar

### Step 2: Import Environment

1. Click **Import** button
2. Select `KeyGuard-Complete.postman_environment.json`
3. Select the environment from dropdown (top right)

### Step 3: Configure Environment Variables

Edit the environment and set:

| Variable | Description | Example |
|----------|-------------|---------|
| `baseUrl` | API base URL | `http://localhost:3000` |
| `adminEmail` | Admin user email | `admin@keyguard.io` |
| `adminPassword` | Admin password | `admin123` |
| `accessToken` | JWT access token | Auto-filled after login |
| `refreshToken` | JWT refresh token | Auto-filled after login |

### Step 4: Login

1. Navigate to **1. Authentication > Login**
2. Click **Send**
3. Access and refresh tokens will be automatically saved
4. All subsequent requests will use the saved token

### Step 5: Test Endpoints

All endpoints are now ready to use with automatic authentication!

## Collection Structure

```
KeyGuard Complete API
├── 1. Authentication
│   ├── Login (POST /auth/login)
│   └── Refresh Token (POST /auth/refresh)
│
├── 2. API Keys Management
│   ├── List API Keys (GET /keys)
│   ├── Create API Key (POST /keys)
│   └── Revoke API Key (DELETE /keys/:id)
│
├── 3. Devices
│   ├── List Devices (GET /devices)
│   ├── Generate Enrollment Code (POST /devices/enrollment-code)
│   ├── Approve Device (PATCH /devices/:id/approve)
│   ├── Suspend Device (PATCH /devices/:id/suspend)
│   └── Revoke Device (DELETE /devices/:id)
│
├── 4. Audit Logs
│   ├── List Audit Logs (GET /audit/logs)
│   └── Export Audit Logs (POST /audit/logs/export)
│
├── 5. Settings
│   ├── Get All Settings (GET /settings)
│   ├── Update General Settings (PATCH /settings/general)
│   ├── Update Security Settings (PATCH /settings/security)
│   ├── Update Notification Settings (PATCH /settings/notifications)
│   ├── Test SMTP Connection (POST /settings/notifications/test)
│   ├── Generate Admin API Key (POST /settings/api-keys)
│   ├── Revoke Admin API Key (DELETE /settings/api-keys/:id)
│   └── Download Backup (POST /settings/backup/download)
│
└── 6. Legacy - KeyGuard
    └── Enroll Device (POST /keyguard/enroll)
```

## Response Examples

Each endpoint includes multiple response examples:

### Success Responses
- ✅ 200 OK - Successful GET/PATCH/DELETE
- ✅ 201 Created - Successful POST

### Error Responses
- ✅ 400 Bad Request - Validation errors
- ✅ 401 Unauthorized - Missing/invalid authentication
- ✅ 404 Not Found - Resource not found
- ✅ 409 Conflict - Duplicate resource
- ✅ 422 Unprocessable Entity - Business logic errors
- ✅ 429 Too Many Requests - Rate limit exceeded

## Using the Collection

### Authentication Flow

1. **Login** to get tokens:
```json
POST /api/v1/auth/login
{
  "email": "admin@keyguard.io",
  "password": "admin123"
}
```

2. **Access token** is automatically set in environment
3. All subsequent requests use Bearer token authentication
4. **Refresh** when access token expires (after 15 minutes)

### Query Parameters

Many endpoints support filtering and pagination:

**Example - List API Keys with filters:**
```
GET /api/v1/keys?page=1&limit=20&status=active&provider=openai&environment=production&search=prod
```

**Example - List Devices with sorting:**
```
GET /api/v1/devices?status=active&platform=macOS&sort=recent&page=1&limit=10
```

**Example - List Audit Logs with date range:**
```
GET /api/v1/audit/logs?severity=critical&status=failure&dateRange=week&page=1&limit=50
```

## Response Structure

### Success Response
```json
{
  "data": { /* response data */ },
  "message": "Optional success message"
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Error Type",
  "timestamp": "2025-12-02T09:48:27.000Z",
  "path": "/api/v1/endpoint",
  "details": [
    {
      "field": "fieldName",
      "message": "Validation error"
    }
  ]
}
```

## Testing Features

### Automatic Tests

Each request includes Postman tests that automatically verify:
- ✅ HTTP status codes
- ✅ Response structure
- ✅ Data types
- ✅ Required fields
- ✅ Token management

### Running Tests

1. Select a folder (e.g., "2. API Keys Management")
2. Click **Run** button
3. Click **Run KeyGuard Complete API**
4. View test results

### Collection Runner

Run all requests sequentially:
1. Click **Runner** button
2. Select **KeyGuard Complete API**
3. Select environment
4. Click **Run KeyGuard Complete API**
5. View results for all endpoints

## Pre-Request Scripts

### Auto-Generated Values

Some endpoints have pre-request scripts that generate:
- Timestamps (for signed requests)
- Nonces (for replay protection)
- Request IDs

### Example - Login Script
```javascript
// Automatically saves tokens after login
pm.test('Save tokens', function () {
  const jsonData = pm.response.json();
  pm.collectionVariables.set('accessToken', jsonData.accessToken);
  pm.collectionVariables.set('refreshToken', jsonData.refreshToken);
});
```

## Environment Variables

| Variable | Auto-Set | Description |
|----------|----------|-------------|
| `baseUrl` | No | API base URL |
| `accessToken` | Yes | After login |
| `refreshToken` | Yes | After login |
| `adminEmail` | No | Admin email for login |
| `adminPassword` | No | Admin password |
| `apiKeyId` | Manual | For testing specific key |
| `deviceId` | Manual | For testing specific device |

## Common Workflows

### 1. Complete API Testing Workflow

```
1. Login → Get tokens
2. List API Keys → View existing keys
3. Create API Key → Add new provider key
4. List Devices → View enrolled devices
5. Generate Enrollment Code → Get code for new device
6. Approve Device → Activate pending device
7. List Audit Logs → View activity
8. Get Settings → View configuration
9. Update Settings → Modify as needed
```

### 2. API Key Management Workflow

```
1. Login
2. List API Keys (filter by status=active)
3. Create new key for OpenAI production
4. Verify creation in list
5. Revoke old key
6. Confirm status changed to revoked
```

### 3. Device Management Workflow

```
1. Login
2. Generate enrollment code
3. (Client enrolls device using code)
4. List devices (filter by status=pending)
5. Approve new device
6. Monitor in audit logs
7. Suspend if needed
8. Revoke when device is decommissioned
```

## Filtering Examples

### API Keys Filters
```
status: active, idle, expired, revoked, all
provider: openai, anthropic, google, azure, all
environment: production, development, staging, all
search: text search in name/description
```

### Devices Filters
```
status: active, pending, suspended, revoked, offline, all
platform: macOS, Windows, Linux, iOS, Android, all
lastSeen: hour, day, week, all
sort: recent, name, platform
search: text search in name/owner/location
```

### Audit Logs Filters
```
eventType: key, device, auth, system, api, security, all
status: success, failure, all
severity: info, warning, critical, all
dateRange: hour, day, week, month, all
startDate: ISO 8601 date (custom range)
endDate: ISO 8601 date (custom range)
search: text search in event/actor/target
```

## Error Handling Examples

### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2025-12-02T09:48:27.000Z",
  "path": "/api/v1/keys",
  "details": [
    {
      "field": "name",
      "message": "Name must be between 3 and 50 characters"
    },
    {
      "field": "provider",
      "message": "Provider must be one of: openai, anthropic, google, azure"
    }
  ]
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized",
  "timestamp": "2025-12-02T09:48:27.000Z",
  "path": "/api/v1/keys"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "API key not found",
  "error": "Not Found",
  "timestamp": "2025-12-02T09:48:27.000Z",
  "path": "/api/v1/keys/123e4567-e89b-12d3-a456-426614174000"
}
```

### Conflict (409)
```json
{
  "statusCode": 409,
  "message": "API key with this name already exists",
  "error": "Conflict",
  "timestamp": "2025-12-02T09:48:27.000Z",
  "path": "/api/v1/keys"
}
```

### Rate Limited (429)
```json
{
  "statusCode": 429,
  "message": "Too many requests",
  "error": "Too Many Requests",
  "timestamp": "2025-12-02T09:48:27.000Z",
  "path": "/api/v1/auth/login"
}
```

## Tips & Tricks

### 1. Use Environment for Different Stages
Create multiple environments:
- Development (localhost:3000)
- Staging (staging.keyguard.io)
- Production (api.keyguard.io)

### 2. Save Response Variables
Many requests automatically save response data to variables for use in subsequent requests.

### 3. View Response Examples
Click "Examples" dropdown on any request to see all possible responses.

### 4. Monitor Mode
Use Postman Monitor to run automated API tests on a schedule.

### 5. Generate Code Snippets
Click "Code" button to generate code in various languages (curl, JavaScript, Python, etc.).

## Troubleshooting

### Token Expired
If you get 401 errors:
1. Run **Refresh Token** request
2. Or re-run **Login** request

### Server Not Running
Ensure backend server is running:
```bash
cd backend
npm run start:dev
```

### CORS Errors
Add `localhost:3000` to CORS allowlist in backend configuration.

### Wrong Environment
Check environment selector (top right) shows "KeyGuard - Complete Environment".

## Advanced Usage

### Scripting

Use Postman tests and pre-request scripts for:
- Automated token management
- Dynamic data generation
- Response validation
- Environment setup

### Newman (CLI)

Run collection from command line:
```bash
npm install -g newman
newman run KeyGuard-Complete-API.postman_collection.json \
  -e KeyGuard-Complete.postman_environment.json \
  --reporters cli,html
```

### CI/CD Integration

Integrate with GitHub Actions:
```yaml
- name: Run API Tests
  run: |
    newman run docs/postman/KeyGuard-Complete-API.postman_collection.json \
      -e docs/postman/KeyGuard-Complete.postman_environment.json \
      --reporters cli,junit \
      --reporter-junit-export results.xml
```

## Support

For issues or questions:
1. Check the request description
2. View response examples
3. Check backend logs
4. Review API specification in BACKEND_REQUIREMENTS.md

## Version History

- **v1.0** (Dec 2, 2025) - Complete collection with all endpoints
- **Phase 1** (Earlier) - Legacy device binding endpoints only

---

**Last Updated**: December 2, 2025
**Collection Version**: 1.0
**Total Endpoints**: 22
**Status**: ✅ Complete
