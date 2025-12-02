# 🚀 KeyGuard API - Quick Reference Card

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
All endpoints except `/auth/*` require Bearer token:
```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentication

### Register Organization
```bash
POST /auth/register
{
  "organizationName": "Acme Corp",
  "email": "admin@acme.com",
  "password": "SecurePass123!"
}
→ 201 Created
{
  "success": true,
  "user": {...},
  "token": "..."
}
```

### Login
```bash
POST /auth/login
{
  "email": "admin@acme.com",
  "password": "SecurePass123!"
}
→ 200 OK
{
  "accessToken": "...",
  "refreshToken": "...",
  "user": {...}
}
```

### Refresh Token
```bash
POST /auth/refresh
{
  "refreshToken": "..."
}
→ 200 OK
{
  "accessToken": "..."
}
```

---

## 🔑 API Keys

### List Keys
```bash
GET /keys?page=1&limit=20&status=all&provider=all
→ 200 OK
{
  "keys": [...],
  "pagination": {...}
}
```

### Create Key
```bash
POST /keys
{
  "name": "Production OpenAI",
  "provider": "OPENAI",
  "environment": "PRODUCTION",
  "expiresAt": "2025-12-31T23:59:59Z",
  "description": "Main production key"
}
→ 201 Created
{
  "id": "...",
  "name": "...",
  "maskedValue": "sk-...abc123",
  ...
}
```

### Revoke Key
```bash
POST /keys/:id/revoke
→ 200 OK
{
  "success": true,
  "message": "API key revoked successfully"
}
```

---

## 📱 Devices

### List Devices
```bash
GET /devices?page=1&limit=20&status=all
→ 200 OK
{
  "devices": [...],
  "pagination": {...}
}
```

### Generate Enrollment Code
```bash
POST /devices/enroll
{
  "name": "Development Team",
  "expiresInMinutes": 60,
  "description": "For dev team"
}
→ 201 Created
{
  "code": "ABC123XYZ",
  "expiresAt": "2025-12-02T10:00:00Z"
}
```

### Approve Device
```bash
POST /devices/:id/approve
{
  "name": "John's MacBook",
  "ownerName": "John Doe",
  "ownerEmail": "john@acme.com",
  "location": "New York, US"
}
→ 200 OK
```

### Suspend Device
```bash
POST /devices/:id/suspend
→ 200 OK
```

### Revoke Device
```bash
DELETE /devices/:id
→ 200 OK
{
  "success": true,
  "message": "Device revoked successfully"
}
```

---

## 📊 Audit Logs (Admin Only)

### List Logs
```bash
GET /logs?page=1&limit=50&dateRange=day&eventType=all
→ 200 OK
{
  "logs": [...],
  "pagination": {...}
}
```

### Export Logs
```bash
POST /logs/export
{
  "format": "json",
  "filters": {
    "dateRange": "week",
    "severity": "critical"
  }
}
→ 200 OK
{
  "url": "https://...",
  "filename": "audit-logs-2025-12-02.json"
}
```

---

## ⚙️ Settings (Admin Only)

### Get All Settings
```bash
GET /settings
→ 200 OK
{
  "general": {...},
  "security": {...},
  "notifications": {...},
  "api": {...},
  "backup": {...}
}
```

### Update General Settings
```bash
PUT /settings/general
{
  "instanceName": "KeyGuard Production",
  "adminEmail": "admin@acme.com",
  "timezone": "UTC",
  "baseUrl": "https://keyguard.acme.com"
}
→ 200 OK
```

### Update Security Settings
```bash
PUT /settings/security
{
  "sessionTimeoutSeconds": 3600,
  "enforce2FA": true,
  "ipWhitelist": ["192.168.1.0/24", "10.0.0.1"]
}
→ 200 OK
```

### Update Notification Settings
```bash
PUT /settings/notifications
{
  "smtpHost": "smtp.gmail.com",
  "smtpPort": 587,
  "smtpUsername": "noreply@acme.com",
  "smtpPassword": "...",
  "emailAlerts": true
}
→ 200 OK
```

### Test SMTP Connection
```bash
POST /settings/notifications/test
→ 200 OK
{
  "success": true,
  "message": "Test email sent successfully!"
}
```

### Generate Admin API Key
```bash
POST /settings/api/keys
{
  "name": "CI/CD Pipeline",
  "scope": "admin"
}
→ 201 Created
{
  "key": {...},
  "rawKey": "kg_1234567890_abcdefghijklmnop"  ⚠️ Shown only once!
}
```

### Revoke Admin API Key
```bash
DELETE /settings/api/keys/:id
→ 200 OK
{
  "success": true,
  "message": "Admin API key revoked successfully"
}
```

### Download Backup
```bash
GET /settings/backup
→ 200 OK
{
  "url": "https://...",
  "filename": "keyguard-backup-2025-12-02.zip"
}
```

---

## ❌ Error Responses

All errors return:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Error Type",
  "timestamp": "2025-12-02T09:48:27.000Z",
  "path": "/api/v1/endpoint",
  "details": [...]  // Optional validation errors
}
```

### Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized / Invalid Token |
| 403 | Forbidden / Insufficient Permissions |
| 404 | Not Found |
| 409 | Conflict (e.g., duplicate email) |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

---

## 🔒 Authorization

| Role | Access |
|------|--------|
| **Admin** | Full access to all endpoints |
| **User** | Access to keys, devices (own organization) |
| **Public** | Only `/auth/login`, `/auth/register`, `/auth/refresh` |

---

## 📦 Common Query Parameters

### Pagination
```
?page=1&limit=20
```

### Filtering
```
?status=active&provider=openai&environment=production
```

### Sorting
```
?sortBy=createdAt&sortOrder=desc
```

### Search
```
?search=keyword
```

### Date Range
```
?dateRange=week
// OR
?startDate=2025-12-01T00:00:00Z&endDate=2025-12-31T23:59:59Z
```

---

## 🔑 API Key Providers

- `OPENAI`
- `ANTHROPIC`
- `GOOGLE`
- `AZURE`

## 📊 API Key Statuses

- `ACTIVE` - In use
- `IDLE` - Not recently used
- `EXPIRED` - Expired
- `REVOKED` - Manually revoked

## 🌍 Environments

- `PRODUCTION`
- `DEVELOPMENT`
- `STAGING`

## 📱 Device Statuses

- `ACTIVE` - Approved and active
- `PENDING` - Awaiting approval
- `SUSPENDED` - Temporarily suspended
- `REVOKED` - Permanently revoked

---

## 💡 Tips

1. **Token Storage**: Store `accessToken` and `refreshToken` in `localStorage`
2. **Auto-Refresh**: Implement token refresh on 401 errors
3. **Error Handling**: Always handle errors gracefully
4. **Loading States**: Show loading indicators during API calls
5. **Pagination**: Default limit is 20, max is 100
6. **Date Format**: Use ISO 8601 format for all dates
7. **Admin Access**: Check user role before showing admin features

---

## 📚 Documentation Links

- **Full API Guide**: `docs/FRONTEND_API_GUIDE.md`
- **Postman Collection**: `docs/postman/KeyGuard-Complete-API.postman_collection.json`
- **OpenAPI Docs**: http://localhost:3000/api/docs

---

**Last Updated**: December 2, 2025
