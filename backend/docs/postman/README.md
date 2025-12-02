# KeyGuard Postman Collections

## 📁 Files in This Directory

### Collections

1. **KeyGuard-Complete-API.postman_collection.json** ⭐ **RECOMMENDED**
   - Complete API documentation
   - All 22 endpoints
   - Comprehensive examples
   - Success and error responses
   - All HTTP status codes

2. **KeyGuard-API.postman_collection.json** (Legacy)
   - Phase 1 features only
   - Device binding endpoints
   - Signature verification
   - Limited coverage

### Environments

1. **KeyGuard-Complete.postman_environment.json** ⭐ **RECOMMENDED**
   - Variables for all endpoints
   - Auto-token management
   - Multiple stage support

2. **KeyGuard-Local.postman_environment.json** (Legacy)
   - Legacy variables
   - Device binding only

### Documentation

- **POSTMAN_USAGE_GUIDE.md** - Complete usage instructions
- **README.md** - This file

## 🚀 Quick Start

### For New Users

1. **Import the complete collection:**
   ```
   File > Import > KeyGuard-Complete-API.postman_collection.json
   ```

2. **Import the complete environment:**
   ```
   File > Import > KeyGuard-Complete.postman_environment.json
   ```

3. **Select environment:**
   - Click environment dropdown (top right)
   - Select "KeyGuard - Complete Environment"

4. **Configure variables:**
   - Edit environment
   - Set `baseUrl` (default: `http://localhost:3000`)
   - Set `adminEmail` (default: `admin@keyguard.io`)
   - Set `adminPassword` (default: `admin123`)

5. **Login:**
   - Open "1. Authentication > Login"
   - Click "Send"
   - Tokens are automatically saved!

6. **Start testing:**
   - All requests now work with saved token
   - Explore all endpoints

## 📊 What's Included

### Complete API Coverage

#### Authentication (2 endpoints)
- ✅ Login (with token auto-save)
- ✅ Refresh access token

#### API Keys Management (3 endpoints)
- ✅ List with filtering (status, provider, environment, search)
- ✅ Create with validation examples
- ✅ Revoke with error scenarios

#### Devices (5 endpoints)
- ✅ List with comprehensive filtering
- ✅ Generate enrollment codes
- ✅ Approve pending devices
- ✅ Suspend active devices
- ✅ Revoke devices

#### Audit Logs (2 endpoints)
- ✅ List with multi-dimensional filtering
- ✅ Export to CSV/JSON

#### Settings (8 endpoints)
- ✅ Get all settings
- ✅ Update general/security/notification settings
- ✅ Test SMTP connection
- ✅ Admin API key management
- ✅ Backup download

#### Legacy - KeyGuard (1 endpoint)
- ✅ Device enrollment (SDK compatibility)

### Response Examples

Each endpoint includes examples for:
- ✅ **200 OK** - Successful GET/PATCH/DELETE
- ✅ **201 Created** - Successful POST
- ✅ **400 Bad Request** - Validation errors
- ✅ **401 Unauthorized** - Auth required/invalid
- ✅ **404 Not Found** - Resource doesn't exist
- ✅ **409 Conflict** - Duplicate resource
- ✅ **429 Too Many Requests** - Rate limit

## 🎯 Common Workflows

### Workflow 1: API Key Management
```
1. Login
2. GET /keys (list existing)
3. POST /keys (create new for OpenAI)
4. GET /keys (verify creation)
5. DELETE /keys/:id (revoke old key)
```

### Workflow 2: Device Approval
```
1. Login
2. POST /devices/enrollment-code (generate code)
3. GET /devices?status=pending (list pending)
4. PATCH /devices/:id/approve (approve)
5. GET /audit/logs?eventType=device (verify in logs)
```

### Workflow 3: Security Configuration
```
1. Login
2. GET /settings (view current)
3. PATCH /settings/security (update IP whitelist)
4. PATCH /settings/notifications (configure SMTP)
5. POST /settings/notifications/test (test email)
```

## 📖 Documentation in Each Request

Every request includes:
- **Description** - What the endpoint does
- **Parameters** - Query/path parameters with descriptions
- **Validation Rules** - What input is accepted
- **Response Examples** - Multiple scenarios
- **Tests** - Auto-verification scripts

## 🧪 Automated Testing

### Collection Runner

Test all endpoints automatically:
1. Click **Runner** button
2. Select "KeyGuard Complete API"
3. Select environment
4. Click **Run**
5. View pass/fail results

### Newman (CLI)

```bash
# Install Newman
npm install -g newman

# Run collection
newman run KeyGuard-Complete-API.postman_collection.json \
  -e KeyGuard-Complete.postman_environment.json

# Generate HTML report
newman run KeyGuard-Complete-API.postman_collection.json \
  -e KeyGuard-Complete.postman_environment.json \
  --reporters cli,html \
  --reporter-html-export report.html
```

## 🔒 Security Notes

### Tokens
- Access token expires in 15 minutes
- Refresh token expires in 7 days
- Tokens are stored in environment (secure in Postman)
- Clear tokens when done testing

### API Keys
- Admin API keys shown only once at creation
- Save immediately in secure location
- Never commit to version control

### Passwords
- Use strong passwords in production
- Don't share Postman environments with passwords
- Use Postman Vault for sensitive data

## 🆘 Support

### Request Examples Not Loading?
- Check internet connection
- Ensure collection imported correctly
- Try re-importing

### 401 Unauthorized on All Requests?
1. Run Login request first
2. Check token saved in environment
3. Ensure environment is selected
4. Token may have expired - re-login

### Server Not Responding?
```bash
# Check if server is running
lsof -i :3000

# Start server
cd backend
npm run start:dev
```

### Wrong Base URL?
- Edit environment
- Update `baseUrl` variable
- Save environment

## 📚 Additional Resources

- **API Specification**: `backend/docs/BACKEND_REQUIREMENTS.md`
- **Implementation Guide**: `backend/docs/IMPLEMENTATION_COMPLETE.md`
- **Usage Guide**: `POSTMAN_USAGE_GUIDE.md`
- **Backend README**: `backend/IMPLEMENTATION_README.md`

## 🎉 Features

- ✅ **22 Endpoints** - Complete API coverage
- ✅ **Auto-Authentication** - Token management handled
- ✅ **Comprehensive Examples** - All scenarios covered
- ✅ **Automated Tests** - Validate responses
- ✅ **Error Documentation** - All status codes
- ✅ **Filtering Guide** - Query parameter examples
- ✅ **Workflow Examples** - Common use cases

---

**Version**: 1.0
**Last Updated**: December 2, 2025
**Status**: ✅ Complete
**Maintainer**: KeyGuard Team

Happy Testing! 🚀
