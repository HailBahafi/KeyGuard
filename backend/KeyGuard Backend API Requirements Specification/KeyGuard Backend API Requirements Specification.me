# KeyGuard Backend API Requirements Specification

**Version:** 1.0  
**Date:** 2025-12-02  
**Target Backend:** NestJS  
**Frontend Framework:** Next.js 14 (TypeScript)

---

## Table of Contents

1. [Overview](#overview)
2. [Global API Conventions](#global-api-conventions)
3. [Authentication & Authorization](#authentication--authorization)
4. [API Keys Management](#api-keys-management)
5. [Device Inventory](#device-inventory)
6. [Audit Logs](#audit-logs)
7. [Settings Management](#settings-management)
8. [Error Handling](#error-handling)
9. [Pagination Standard](#pagination-standard)

---

## Overview

This document specifies the exact API contract between the KeyGuard Next.js frontend and the NestJS backend. All TypeScript interfaces are extracted from the production frontend code in `src/types/`.

**Base URL:** `/api/v1`

**Content-Type:** `application/json` (all requests and responses)

**Date Format:** ISO 8601 strings (e.g., `"2025-12-02T09:48:27.000Z"`)

---

## Global API Conventions

### Request Headers
```
Content-Type: application/json
Authorization: Bearer <jwt-token>
```

### Response Structure (Success)
```typescript
{
  data: T,           // The actual response payload
  message?: string   // Optional success message
}
```

### Response Structure (Error)
See [Error Handling](#error-handling) section.

---

## Authentication & Authorization

### Login

**User Goal:** User wants to authenticate and receive a JWT token.

**Endpoint:**
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/auth/login` | Authenticate user |

**Request Body (DTO):**
```typescript
interface LoginDto {
  email: string;     // required, email format
  password: string;  // required, min 8 characters
}
```

**Response (200 OK):**
```typescript
interface LoginResponse {
  accessToken: string;      // JWT token
  refreshToken: string;     // Refresh token
  user: {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user';
  };
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `429 Too Many Requests` - Rate limited

---

## API Keys Management

### 1. List API Keys

**User Goal:** View all API keys with filtering and pagination.

**Endpoint:**
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/keys` | List all API keys |

**Query Parameters:**
```typescript
interface KeysQueryParams {
  page?: number;           // default: 1
  limit?: number;          // default: 20, max: 100
  status?: 'active' | 'idle' | 'expired' | 'revoked' | 'all';  // default: 'all'
  provider?: 'openai' | 'anthropic' | 'google' | 'azure' | 'all';  // default: 'all'
  environment?: 'production' | 'development' | 'staging' | 'all';  // default: 'all'
  search?: string;         // search by key name or provider
}
```

**Response (200 OK):**
```typescript
interface KeysPaginationData {
  keys: ApiKey[];
  pagination: PaginationMeta;
}

interface ApiKey {
  id: string;                  // UUID or unique identifier
  name: string;                // User-friendly name
  provider: 'openai' | 'anthropic' | 'google' | 'azure';
  status: 'active' | 'idle' | 'expired' | 'revoked';
  environment: 'production' | 'development' | 'staging';
  created: string;             // ISO date
  lastUsed: string | null;     // ISO date, null if never used
  expiresAt: string | null;    // ISO date, null if no expiration
  deviceCount: number;         // Number of devices using this key
  usageCount: number;          // Total API calls made with this key
  description?: string;        // Optional description
  maskedValue: string;         // e.g., "sk-...abc123"
}

interface PaginationMeta {
  total: number;    // Total number of items (filtered)
  page: number;     // Current page number
  limit: number;    // Items per page
  pages: number;    // Total number of pages
}
```

**Example:**
```
GET /api/v1/keys?page=1&limit=20&status=active&provider=openai
```

---

### 2. Create API Key

**User Goal:** Create a new API key for a provider.

**Endpoint:**
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/keys` | Create new API key |

**Request Body (DTO):**
```typescript
interface CreateKeyDto {
  name: string;                // required, 3-50 characters
  provider: 'openai' | 'anthropic' | 'google' | 'azure';  // required
  environment: 'production' | 'development' | 'staging';  // required
  expiresAt?: string;          // optional, ISO date
  description?: string;        // optional
}
```

**Response (201 Created):**
```typescript
interface CreateKeyResponse {
  key: ApiKey;  // The ApiKey interface from above
}
```

**Validation Rules:**
- `name`: 3-50 characters, unique within the project
- `provider`: Must be valid enum value
- `environment`: Must be valid enum value
- `expiresAt`: If provided, must be future date

---

### 3. Revoke API Key

**User Goal:** Revoke/delete an API key.

**Endpoint:**
| Method | Path | Purpose |
|--------|------|---------|
| DELETE | `/api/v1/keys/:id` | Revoke API key |

**Path Parameters:**
- `id` (string, required): The API key ID

**Response (200 OK):**
```typescript
interface RevokeKeyResponse {
  success: boolean;
  message: string;  // e.g., "API key revoked successfully"
}
```

**Note:** The frontend expects the key `status` to change to `'revoked'` instead of deleting the record. Preserve for audit trail.

---

## Device Inventory

### 1. List Devices

**User Goal:** View all enrolled devices with filtering, sorting, and pagination.

**Endpoint:**
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/devices` | List all devices |

**Query Parameters:**
```typescript
interface DevicesQueryParams {
  page?: number;           // default: 1
  limit?: number;          // default: 20, max: 100
  status?: 'active' | 'pending' | 'suspended' | 'revoked' | 'offline' | 'all';  // default: 'all'
  platform?: 'macOS' | 'Windows' | 'Linux' | 'iOS' | 'Android' | 'all';  // default: 'all'
  lastSeen?: 'hour' | 'day' | 'week' | 'all';  // filter by last seen time, default: 'all'
  search?: string;         // search by name, owner name/email, location
  sort?: 'recent' | 'name' | 'platform';  // default: 'recent'
}
```

**Special Note on `offline` status:**
- `offline` is a computed status, not stored in DB
- Device is offline if `status === 'active'` AND `lastSeen > 24 hours ago`

**Response (200 OK):**
```typescript
interface DevicesPaginationData {
  devices: Device[];
  stats: DeviceStats;
  pagination: PaginationMeta;
}

interface Device {
  id: string;                  // UUID
  name: string;                // Device nickname
  status: 'active' | 'pending' | 'suspended' | 'revoked';
  platform: DevicePlatform;
  owner: DeviceOwner;
  ipAddress: string;           // Last known IP
  location: string;            // e.g., "Riyadh, SA"
  lastSeen: string;            // ISO date
  fingerprintHash: string;     // Unique device fingerprint
  stats: {
    totalCalls: number;        // Total API calls from this device
    keysAccessed: number;      // Number of unique keys accessed
  };
}

interface DevicePlatform {
  os: 'macOS' | 'Windows' | 'Linux' | 'iOS' | 'Android';
  version: string;             // e.g., "13.4", "11", "Ubuntu 22.04"
  browser?: string;            // e.g., "Chrome 120", optional
}

interface DeviceOwner {
  name: string;
  email: string;
}

interface DeviceStats {
  total: number;      // Total devices in system
  active: number;     // status=active AND lastSeen < 24h
  pending: number;    // status=pending
  suspended: number;  // status=suspended
  offline: number;    // status=active BUT lastSeen > 24h
}
```

**Example:**
```
GET /api/v1/devices?page=1&limit=20&status=active&sort=recent
```

---

### 2. Generate Enrollment Code

**User Goal:** Admin generates a one-time enrollment code for a new device.

**Endpoint:**
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/devices/enrollment-code` | Generate enrollment code |

**Request Body:** None

**Response (201 Created):**
```typescript
interface EnrollmentCode {
  code: string;        // e.g., "KG-ENRL-ABCD"
  expiresAt: string;   // ISO date, typically 15 minutes in future
}
```

**Implementation Note:**
- Code should be single-use
- Frontend displays countdown timer to `expiresAt`
- Format: `KG-ENRL-{4_RANDOM_CHARS}`

---

### 3. Approve Device

**User Goal:** Admin approves a pending device enrollment.

**Endpoint:**
| Method | Path | Purpose |
|--------|------|---------|
| PATCH | `/api/v1/devices/:id/approve` | Approve pending device |

**Path Parameters:**
- `id` (string, required): The device ID

**Request Body:** None

**Response (200 OK):**
```typescript
interface ApproveDeviceResponse {
  success: boolean;
  message: string;
  device: Device;  // Updated device with status='active'
}
```

**Validation:**
- Device must exist
- Device status must be `'pending'`

---

### 4. Suspend Device

**User Goal:** Admin suspends an active device.

**Endpoint:**
| Method | Path | Purpose |
|--------|------|---------|
| PATCH | `/api/v1/devices/:id/suspend` | Suspend active device |

**Path Parameters:**
- `id` (string, required): The device ID

**Request Body:** None

**Response (200 OK):**
```typescript
interface SuspendDeviceResponse {
  success: boolean;
  message: string;
  device: Device;  // Updated device with status='suspended'
}
```

---

### 5. Revoke Device

**User Goal:** Admin permanently revokes a device.

**Endpoint:**
| Method | Path | Purpose |
|--------|------|---------|
| DELETE | `/api/v1/devices/:id` | Revoke device |

**Path Parameters:**
- `id` (string, required): The device ID

**Response (200 OK):**
```typescript
interface RevokeDeviceResponse {
  success: boolean;
  message: string;
  device: Device;  // Updated device with status='revoked'
}
```

**Note:** Do NOT delete from database. Set `status='revoked'` for audit trail.

---

## Audit Logs

### 1. List Audit Logs

**User Goal:** View system audit logs with filtering and pagination.

**Endpoint:**
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/audit/logs` | List audit logs |

**Query Parameters:**
```typescript
interface LogsQueryParams {
  page?: number;           // default: 1
  limit?: number;          // default: 50, max: 200
  search?: string;         // search in event, actor name, target name, error
  dateRange?: 'hour' | 'day' | 'week' | 'month' | 'all';  // default: 'all'
  eventType?: 'key' | 'device' | 'auth' | 'system' | 'api' | 'security' | 'all';  // default: 'all'
  status?: 'success' | 'failure' | 'all';  // default: 'all'
  severity?: 'info' | 'warning' | 'critical' | 'all';  // default: 'all'
  startDate?: string;      // ISO date, for custom range
  endDate?: string;        // ISO date, for custom range
}
```

**Response (200 OK):**
```typescript
interface AuditLogsPaginationData {
  logs: AuditLog[];
  pagination: PaginationMeta;
}

interface AuditLog {
  id: string;                       // UUID
  timestamp: string;                // ISO date
  severity: 'info' | 'warning' | 'critical';
  event: string;                    // e.g., "key.retrieved", "device.enrolled"
  status: 'success' | 'failure';
  actor: EventActor;
  target: EventTarget;
  metadata: SecurityContext;
}

interface EventActor {
  id: string;
  name: string;                     // Device name or User name
  type: 'user' | 'device' | 'system';
  ip: string;
  location?: string;                // e.g., "Riyadh, SA"
}

interface EventTarget {
  id: string;
  name: string;                     // Key name or Device name
  type?: string;                    // 'key', 'device', 'user', etc.
}

interface SecurityContext {
  latency?: number;                 // Milliseconds
  tokens?: number;                  // For key.retrieved events
  cost?: number;                    // USD cost
  error?: string;                   // Error message if status=failure
  userAgent?: string;               // Full UA string
  requestId?: string;               // Trace ID
}
```

**Event Types Reference:**
```
key.retrieved, key.created, key.rotated, key.revoked
device.enrolled, device.approved, device.suspended, device.revoked
auth.login, auth.logout, auth.failed, auth.mfa_verified
system.backup, system.config_changed
api.rate_limited
security.suspicious_activity
```

**Example:**
```
GET /api/v1/audit/logs?page=1&limit=50&severity=critical&status=failure
```

---

### 2. Export Audit Logs

**User Goal:** Download audit logs as CSV or JSON.

**Endpoint:**
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/audit/logs/export` | Export logs |

**Request Body (DTO):**
```typescript
interface ExportLogsDto {
  format: 'csv' | 'json';  // required
  filters?: LogsQueryParams;  // Same as List query params (excludes page/limit)
}
```

**Response (200 OK):**
```typescript
interface ExportLogsResponse {
  url: string;        // Pre-signed download URL
  filename: string;   // e.g., "audit-logs-2025-12-02.csv"
}
```

**Implementation Note:**
- Generate file server-side
- Return pre-signed URL (S3 or similar)
- URL should expire in 5 minutes
- Frontend auto-downloads from URL

---

### 3. Live Logs Stream (WebSocket) [OPTIONAL]

**User Goal:** Real-time streaming of new audit logs.

**Endpoint:**
```
WS /api/v1/audit/logs/stream
```

**Client → Server:**
```typescript
interface StreamSubscribeMessage {
  type: 'subscribe';
  filters?: Partial<LogsQueryParams>;  // Optional filters
}
```

**Server → Client:**
```typescript
interface StreamLogMessage {
  type: 'log';
  data: AuditLog;
}
```

**Frontend Behavior:**
- Connects to WebSocket on page load
- Subscribes with current filters
- Receives new logs every 3-5 seconds
- Unsubscribes on page unmount

---

## Settings Management

### 1. Fetch All Settings

**User Goal:** Load current instance settings.

**Endpoint:**
| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/settings` | Get all settings |

**Response (200 OK):**
```typescript
interface SettingsState {
  general: GeneralSettings;
  security: SecuritySettings;
  notifications: NotificationSettings;
  api: ApiSettings;
  backup: BackupSettings;
}

interface GeneralSettings {
  instanceName: string;     // 3-50 characters
  adminEmail: string;       // Email format
  timezone: string;         // IANA timezone, e.g., "Asia/Riyadh"
  baseUrl: string;          // Valid URL
}

interface SecuritySettings {
  sessionTimeoutSeconds: number;  // Range: 300 (5min) to 2592000 (30 days)
  enforce2FA: boolean;
  ipWhitelist: string[];          // Array of IP addresses or CIDR notation
}

interface NotificationSettings {
  smtpHost: string;
  smtpPort: number;               // 1-65535
  smtpUsername: string;
  smtpPassword: string;           // Encrypted/masked in transit
  emailAlerts: boolean;
}

interface ApiSettings {
  keys: ApiKey[];  // List of admin API keys (different from provider keys)
}

interface ApiKey {  // Admin KeyGuard API keys
  id: string;
  name: string;
  key: string;                    // Always masked except at creation
  scope: string[];                // e.g., ['read', 'write']
  createdAt: string;              // ISO date
  lastUsedAt: string | null;      // ISO date
}

interface BackupSettings {
  logRetentionDays: number;       // 30-365
  autoBackupEnabled: boolean;
  autoBackupFrequency: 'daily' | 'weekly' | 'monthly';
  lastBackupAt: string | null;    // ISO date
}
```

---

### 2. Update General Settings

**Endpoint:**
| Method | Path | Purpose |
|--------|------|---------|
| PATCH | `/api/v1/settings/general` | Update general settings |

**Request Body (DTO):**
```typescript
interface UpdateGeneralSettingsDto {
  instanceName: string;     // required, 3-50 chars
  adminEmail: string;       // required, email format
  timezone: string;         // required, valid IANA timezone
  baseUrl: string;          // optional, valid URL or empty
}
```

**Response (200 OK):**
```typescript
interface UpdateSettingsResponse {
  success: boolean;
  data: GeneralSettings;
}
```

---

### 3. Update Security Settings

**Endpoint:**
| Method | Path | Purpose |
|--------|------|---------|
| PATCH | `/api/v1/settings/security` | Update security settings |

**Request Body (DTO):**
```typescript
interface UpdateSecuritySettingsDto {
  sessionTimeoutSeconds: number;  // required, 300-2592000
  enforce2FA: boolean;            // required
  ipWhitelist: string[];          // required, each IP validated with regex
}
```

**Validation:**
- `ipWhitelist`: Each entry must match `^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$`
- Empty array `[]` means no IP restrictions

**Response (200 OK):**
```typescript
interface UpdateSettingsResponse {
  success: boolean;
  data: SecuritySettings;
}
```

---

### 4. Update Notification Settings

**Endpoint:**
| Method | Path | Purpose |
|--------|------|---------|
| PATCH | `/api/v1/settings/notifications` | Update notification settings |

**Request Body (DTO):**
```typescript
interface UpdateNotificationSettingsDto {
  smtpHost: string;         // required
  smtpPort: number;         // required, 1-65535
  smtpUsername: string;     // required
  smtpPassword: string;     // required
  emailAlerts: boolean;     // required
}
```

**Response (200 OK):**
```typescript
interface UpdateSettingsResponse {
  success: boolean;
  data: NotificationSettings;
}
```

---

### 5. Test SMTP Connection

**User Goal:** Verify SMTP settings by sending a test email.

**Endpoint:**
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/settings/notifications/test` | Test SMTP connection |

**Request Body:** None (uses current settings)

**Response (200 OK):**
```typescript
interface TestSMTPResponse {
  success: boolean;
  message: string;  // e.g., "Test email sent successfully" or error
}
```

**Frontend Expectation:**
- Shows loading state for ~1 second
- Displays toast with `message` content
- Success/failure indicated by `success` boolean

---

### 6. Generate Admin API Key

**User Goal:** Create a new KeyGuard admin API key.

**Endpoint:**
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/settings/api-keys` | Generate admin API key |

**Request Body (DTO):**
```typescript
interface GenerateApiKeyDto {
  name: string;       // required, 3-50 characters
  scope: string[];    // required, at least one scope (e.g., ['read', 'write'])
}
```

**Response (201 Created):**
```typescript
interface GenerateApiKeyResponse {
  key: ApiKey;        // Masked key object
  rawKey: string;     // Full key, shown ONLY once
}
```

**CRITICAL:** The `rawKey` is returned only at creation time. Frontend displays a warning that it won't be shown again and provides a copy button.

**Example `rawKey`:**
```
kg_1733105307000_abc123def456ghi789
```

---

### 7. Revoke Admin API Key

**Endpoint:**
| Method | Path | Purpose |
|--------|------|---------|
| DELETE | `/api/v1/settings/api-keys/:id` | Revoke admin API key |

**Path Parameters:**
- `id` (string, required): The API key ID

**Response (200 OK):**
```typescript
interface RevokeApiKeyResponse {
  success: boolean;
  message: string;
}
```

---

### 8. Download Backup

**User Goal:** Download a complete backup of the KeyGuard instance.

**Endpoint:**
| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/settings/backup/download` | Generate and download backup |

**Request Body:** None

**Response (200 OK):**
```typescript
interface DownloadBackupResponse {
  url: string;        // Pre-signed download URL
  filename: string;   // e.g., "keyguard-backup-2025-12-02.zip"
}
```

**Implementation Note:**
- Generate `.zip` archive containing:
  - Database export (JSON or SQL)
  - Configuration files
  - Audit logs
- Return pre-signed URL
- Update `backup.lastBackupAt` timestamp
- Frontend auto-downloads from URL

---

## Error Handling

### Standard Error Response

All errors should follow this structure:

```typescript
interface ErrorResponse {
  statusCode: number;       // HTTP status code
  message: string;          // User-friendly error message
  error: string;            // Error type (e.g., "Bad Request")
  timestamp: string;        // ISO date
  path: string;             // Request path
  details?: any;            // Optional validation details
}
```

### Common HTTP Status Codes

| Code | Meaning | Frontend Action |
|------|---------|-----------------|
| 400 | Bad Request | Show validation errors to user |
| 401 | Unauthorized | Redirect to login page |
| 403 | Forbidden | Show permission denied message |
| 404 | Not Found | Show "resource not found" message |
| 409 | Conflict | Show conflict message (e.g., duplicate name) |
| 422 | Unprocessable Entity | Show validation errors |
| 429 | Too Many Requests | Show rate limit message |
| 500 | Internal Server Error | Show generic error message |

### Validation Error Details

For 400/422 errors with validation failures:

```typescript
interface ValidationErrorResponse extends ErrorResponse {
  details: {
    field: string;      // e.g., "email"
    message: string;    // e.g., "Invalid email format"
  }[];
}
```

**Example:**
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
      "message": "Name must be at least 3 characters"
    },
    {
      "field": "provider",
      "message": "Provider must be one of: openai, anthropic, google, azure"
    }
  ]
}
```

---

## Pagination Standard

All paginated endpoints must follow this structure:

### Response Format

```typescript
interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

interface PaginationMeta {
  total: number;    // Total count of items (after filters)
  page: number;     // Current page (1-indexed)
  limit: number;    // Items per page
  pages: number;    // Total pages (Math.ceil(total / limit))
}
```

### Query Parameters

```typescript
interface PaginationParams {
  page?: number;    // default: 1, min: 1
  limit?: number;   // default varies by endpoint, typical: 20, max: 100-200
}
```

### Frontend Behavior

- Default `page = 1`
- Default `limit` varies (Keys: 20, Devices: 20, Logs: 50)
- Frontend calculates total pages from `pagination.total` and `pagination.limit`
- Shows pagination controls only if `pages > 1`
- Displays "Showing X-Y of total" using `page`, `limit`, and `total`

---

## Additional Notes

### Date Handling
- All dates are ISO 8601 strings in UTC
- Frontend converts to user's timezone for display
- Backend should store in UTC

### Performance Expectations
- List endpoints: < 500ms response time
- Create/Update endpoints: < 1s response time
- Export/Backup endpoints: < 5s initial response (returns URL)
- Live streaming: 3-5 second intervals for new logs

### Security
- All endpoints (except `/api/v1/auth/login`) require JWT authentication
- Admin-only endpoints: All settings, device approval/revoke, key management
- Rate limiting recommended: 100 requests/minute per user

### Frontend Assumptions
- Expects 500ms simulated delay in development
- Uses `toast` for all success/error feedback
- Implements optimistic UI updates for some actions
- Stores settings in localStorage (backend should be source of truth)

---

## Implementation Checklist for Backend Developer

### Phase 1: Core Infrastructure
- [ ] Set up NestJS project with TypeScript
- [ ] Configure Postgres/MySQL database
- [ ] Implement JWT authentication
- [ ] Create global error handling middleware
- [ ] Set up CORS for Next.js frontend

### Phase 2: Features
- [ ] API Keys CRUD endpoints
- [ ] Device management endpoints  
- [ ] Audit logs endpoints (with filtering)
- [ ] Settings management endpoints
- [ ] WebSocket for live logs (optional)

### Phase 3: Security & Performance
- [ ] Add rate limiting
- [ ] Implement IP whitelisting logic
- [ ] Add request validation (use class-validator)
- [ ] Set up database indexes for pagination/filtering
- [ ] Add API key encryption at rest

### Phase 4: Testing
- [ ] Unit tests for services
- [ ] Integration tests for controllers
- [ ] Test pagination edge cases
- [ ] Test all filter combinations

---

**End of Specification**

For questions or clarifications, refer to the frontend source code in `/Users/hail/Desktop/key guard/KeyGuard/frontend/src/`.
