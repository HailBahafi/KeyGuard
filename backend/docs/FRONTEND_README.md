# 🎨 KeyGuard API - Frontend Integration Guide

**Welcome, Frontend Developers!** This is your complete guide to integrating with the KeyGuard Backend API.

---

## 📚 Documentation Overview

| Document | Size | Purpose | Start Here |
|----------|------|---------|------------|
| **FRONTEND_API_GUIDE.md** | 33KB | Complete integration guide with code examples | ⭐ **Main Guide** |
| **API_QUICK_REFERENCE.md** | 6KB | Quick reference card for all endpoints | 🚀 Quick lookup |
| **API_INTEGRATION_CHECKLIST.md** | 8KB | Step-by-step integration checklist | ✅ Implementation |
| **Postman Collection** | - | Test all endpoints | 🧪 Testing |

---

## 🚀 Quick Start (5 Minutes)

### 1. Import Postman Collection

```bash
# Navigate to Postman
1. Click "Import"
2. Select: docs/postman/KeyGuard-Complete-API.postman_collection.json
3. Select: docs/postman/KeyGuard-Complete.postman_environment.json
```

### 2. Test the API

```bash
# In Postman:
1. Authentication → Register Organization → Send
2. Token will auto-save
3. Try any other endpoint - token attached automatically!
```

### 3. Setup Your Frontend

```typescript
// Step 1: Install dependencies
npm install axios @tanstack/react-query

// Step 2: Create API client (see FRONTEND_API_GUIDE.md)
// Step 3: Copy TypeScript types (all provided in guide)
// Step 4: Implement authentication flow
```

---

## 📖 Complete Documentation Structure

### 1. FRONTEND_API_GUIDE.md ⭐ (Main Guide)

**What's inside:**
- ✅ API Client Setup with interceptors
- ✅ All 23 endpoints documented
- ✅ Request/Response examples for each
- ✅ Complete TypeScript types
- ✅ React component examples
- ✅ React Query hooks
- ✅ Error handling strategies
- ✅ Best practices

**Sections:**
1. Quick Start
2. Authentication (Register, Login, Refresh)
3. API Keys Management
4. Devices Management
5. Audit Logs
6. Settings
7. Error Handling
8. TypeScript Types
9. React Examples
10. Best Practices

### 2. API_QUICK_REFERENCE.md 🚀 (Quick Lookup)

**What's inside:**
- ✅ All 23 endpoints with curl examples
- ✅ Status codes reference
- ✅ Error responses
- ✅ Common query parameters
- ✅ Quick tips

**Perfect for:**
- Quick endpoint lookup
- Copy-paste curl commands
- Status code reference
- Parameter reference

### 3. API_INTEGRATION_CHECKLIST.md ✅ (Implementation)

**What's inside:**
- ✅ Pre-integration setup checklist
- ✅ Authentication flow checklist
- ✅ Module-by-module checklists
- ✅ UI components list
- ✅ Testing checklist
- ✅ Deployment checklist

**Use this to:**
- Track implementation progress
- Ensure nothing is missed
- Organize your work
- Plan your sprints

### 4. Postman Collection 🧪 (Testing)

**What's inside:**
- ✅ 23 endpoints ready to test
- ✅ 70+ sample responses
- ✅ Automated test scripts
- ✅ Auto-token management

**Use this to:**
- Test endpoints before coding
- Understand request/response structure
- Debug API issues
- Share with team

---

## 🔐 Authentication Flow

### First-Time Setup: Register Organization

```typescript
// 1. User goes to /setup page
// 2. Fills form:
{
  organizationName: "Acme Corp",
  email: "admin@acme.com",
  password: "SecurePassword123!"
}

// 3. API call: POST /auth/register
const response = await register(data);

// 4. Store token & redirect
localStorage.setItem('accessToken', response.token);
router.push('/dashboard');
```

### Returning Users: Login

```typescript
// 1. User goes to /login
// 2. Fills credentials
{
  email: "admin@acme.com",
  password: "SecurePassword123!"
}

// 3. API call: POST /auth/login
const response = await login(credentials);

// 4. Store tokens
localStorage.setItem('accessToken', response.accessToken);
localStorage.setItem('refreshToken', response.refreshToken);
```

### Token Refresh (Automatic)

```typescript
// Handled by API client interceptor
// Automatically refreshes on 401 errors
// No manual intervention needed!
```

---

## 📦 All API Endpoints (23 Total)

### Authentication (3 endpoints)
- `POST /auth/register` - Register organization ⭐ **NEW!**
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token

### API Keys (3 endpoints)
- `GET /keys` - List keys
- `POST /keys` - Create key
- `POST /keys/:id/revoke` - Revoke key

### Devices (5 endpoints)
- `GET /devices` - List devices
- `POST /devices/enroll` - Generate enrollment code
- `POST /devices/:id/approve` - Approve device
- `POST /devices/:id/suspend` - Suspend device
- `DELETE /devices/:id` - Revoke device

### Audit Logs (2 endpoints) 👑
- `GET /logs` - List logs (Admin only)
- `POST /logs/export` - Export logs (Admin only)

### Settings (8 endpoints) 👑
- `GET /settings` - Get all settings (Admin only)
- `PUT /settings/general` - Update general (Admin only)
- `PUT /settings/security` - Update security (Admin only)
- `PUT /settings/notifications` - Update notifications (Admin only)
- `POST /settings/notifications/test` - Test SMTP (Admin only)
- `POST /settings/api/keys` - Generate admin API key (Admin only)
- `DELETE /settings/api/keys/:id` - Revoke admin API key (Admin only)
- `GET /settings/backup` - Download backup (Admin only)

👑 = Admin role required

---

## 💡 Key Features

### 🔒 Security
- JWT authentication
- Token refresh
- Role-based access control
- Password hashing
- IP whitelisting support

### 📊 Pagination & Filtering
All list endpoints support:
- Page number & limit
- Status filtering
- Search
- Sorting
- Date ranges

### ❌ Error Handling
Consistent error format:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Error Type",
  "timestamp": "2025-12-02T09:48:27.000Z",
  "path": "/api/v1/endpoint",
  "details": []
}
```

### 📝 TypeScript Support
- All types defined
- Request interfaces
- Response interfaces
- Enum types

---

## 🎯 Recommended Implementation Order

### Phase 1: Core (Week 1)
1. ✅ Setup API client
2. ✅ Implement authentication (Register, Login, Refresh)
3. ✅ Create protected routes
4. ✅ Build basic layout

### Phase 2: API Keys (Week 2)
1. ✅ List API keys
2. ✅ Create API key
3. ✅ Revoke API key
4. ✅ Filtering & pagination

### Phase 3: Devices (Week 3)
1. ✅ List devices
2. ✅ Generate enrollment code
3. ✅ Approve devices
4. ✅ Suspend/Revoke devices

### Phase 4: Admin Features (Week 4)
1. ✅ Audit logs
2. ✅ Settings management
3. ✅ Admin API keys
4. ✅ Backup/Export

---

## 🧰 Tech Stack Recommendations

### Required
- **HTTP Client**: Axios or Fetch API
- **State Management**: React Query (recommended) or Redux
- **Routing**: Next.js or React Router

### Recommended
- **UI Library**: Shadcn/ui, Material-UI, or Chakra UI
- **Forms**: React Hook Form
- **Validation**: Zod or Yup
- **Date Handling**: dayjs or date-fns
- **Notifications**: react-hot-toast or sonner

---

## 📊 API Response Format

### Success (200/201)
```json
{
  // Response data varies by endpoint
  "keys": [...],        // For list endpoints
  "pagination": {...}   // For paginated endpoints
}
```

### Error (400/401/404/409/500)
```json
{
  "statusCode": 400,
  "message": "Error message",
  "error": "Error Type",
  "timestamp": "2025-12-02T09:48:27.000Z",
  "path": "/api/v1/endpoint",
  "details": []  // Optional validation details
}
```

---

## ✅ Implementation Checklist

### Setup
- [ ] Install dependencies
- [ ] Create API client
- [ ] Setup environment variables
- [ ] Import Postman collection

### Authentication
- [ ] Register page
- [ ] Login page
- [ ] Token storage
- [ ] Token refresh
- [ ] Protected routes
- [ ] Logout

### API Keys Module
- [ ] List keys
- [ ] Create key
- [ ] Revoke key
- [ ] Filtering
- [ ] Pagination

### Devices Module
- [ ] List devices
- [ ] Generate code
- [ ] Approve device
- [ ] Suspend device
- [ ] Revoke device

### Admin Module
- [ ] Audit logs
- [ ] Settings
- [ ] Export functions

### UI/UX
- [ ] Loading states
- [ ] Error handling
- [ ] Success messages
- [ ] Empty states
- [ ] Responsive design

---

## 🆘 Support & Resources

### Documentation
- **Main Guide**: `FRONTEND_API_GUIDE.md`
- **Quick Ref**: `API_QUICK_REFERENCE.md`
- **Checklist**: `API_INTEGRATION_CHECKLIST.md`

### Testing
- **Postman**: `postman/KeyGuard-Complete-API.postman_collection.json`
- **OpenAPI**: http://localhost:3000/api/docs

### Backend Docs
- **Setup Feature**: `ORGANIZATION_SETUP_FEATURE.md`
- **Migration**: `MIGRATION_STEPS.md`

---

## 🔧 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_APP_NAME=KeyGuard
NEXT_PUBLIC_ENV=development
```

---

## 🎨 UI Components Needed

### Common
- Button
- Input
- Select
- Checkbox
- Toggle
- Badge
- Card
- Modal/Dialog
- Toast
- Spinner
- Empty State

### Specific
- API Key Card
- Device Card
- Audit Log Entry
- Status Badge
- Provider Icon
- Pagination
- Search Bar
- Filter Dropdown

---

## 📈 Performance Tips

1. **Use React Query** for automatic caching
2. **Implement pagination** - don't load everything
3. **Debounce search** - wait for user to stop typing
4. **Optimize re-renders** - use memo/callback
5. **Lazy load** - split code by route
6. **Cache API responses** - use staleTime in React Query

---

## 🐛 Common Issues & Solutions

### Issue: Token expired
**Solution**: Implement token refresh in interceptor (example in guide)

### Issue: CORS errors
**Solution**: Backend handles CORS, ensure correct headers

### Issue: 401 on every request
**Solution**: Check if token is being sent in Authorization header

### Issue: Validation errors
**Solution**: Check FRONTEND_API_GUIDE.md for validation rules

---

## 🎓 Learning Path

### Day 1: Setup
- Read FRONTEND_API_GUIDE.md (Setup section)
- Import Postman collection
- Test registration endpoint

### Day 2: Authentication
- Implement register page
- Implement login page
- Setup token management

### Day 3-5: API Keys
- Build keys list page
- Build create key form
- Implement revoke

### Day 6-10: Devices
- Build devices page
- Implement enrollment
- Implement approval flow

### Day 11+: Admin Features
- Build audit logs page
- Build settings pages
- Implement exports

---

## ✨ Quick Examples

### Register Organization
```typescript
const response = await apiClient.post('/auth/register', {
  organizationName: "Acme Corp",
  email: "admin@acme.com",
  password: "SecurePassword123!"
});
```

### List API Keys
```typescript
const response = await apiClient.get('/keys', {
  params: { page: 1, limit: 20, status: 'active' }
});
```

### Create API Key
```typescript
const response = await apiClient.post('/keys', {
  name: "Production OpenAI",
  provider: "OPENAI",
  environment: "PRODUCTION"
});
```

---

## 📞 Need Help?

1. **Check the guides** - Most answers are in FRONTEND_API_GUIDE.md
2. **Test in Postman** - Verify endpoint behavior
3. **Check OpenAPI docs** - http://localhost:3000/api/docs
4. **Review examples** - Complete React components in guide

---

## 🎉 You're Ready!

**Start with**: FRONTEND_API_GUIDE.md
**Quick lookup**: API_QUICK_REFERENCE.md
**Track progress**: API_INTEGRATION_CHECKLIST.md
**Test first**: Import Postman collection

---

**Version**: 1.1.0
**Last Updated**: December 2, 2025
**Total Endpoints**: 23
**Documentation**: Complete ✅

🚀 **Happy Coding!**
