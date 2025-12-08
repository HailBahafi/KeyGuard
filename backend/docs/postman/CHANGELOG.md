# Postman Collection Changelog

## Version 1.1 - December 8, 2025

### Added
- **NEW**: OpenAI Proxy endpoints section
  - Chat Completion (Non-streaming)
  - Chat Completion (Streaming)
  - List Models
  - Embeddings
  - Universal proxy support for all OpenAI endpoints

- **NEW**: Simplified Logs endpoint (GET /logs)
  - Easy frontend integration
  - Real data from database
  - Comprehensive filtering options

### Changed
- **ENHANCED**: Audit Logs event type filter now includes "proxy"
- **UPDATED**: Documentation to reflect new audit logging events

### Event Types
Added 9 new event types to audit logs:
- `proxy.request` - OpenAI proxy requests
- `device.enrolled` - Device enrollment
- `device.revoked` - Device revocation
- `key.created` - API key creation
- `key.revoked` - API key revocation
- `auth.login` - User login
- `auth.register` - User registration
- `settings.updated` - General settings update
- `settings.security.updated` - Security settings update

---

## Version 1.0 - December 2, 2025

### Initial Release
- Authentication endpoints
- API Keys Management
- Devices Management
- Audit Logs
- Settings
- Legacy KeyGuard endpoints

---

## How to Update

### Option 1: Import New Documentation
1. Read `NEW_ENDPOINTS_v1.1.md` for detailed documentation
2. Manually add new sections to your Postman collection

### Option 2: Download Updated Collection (Coming Soon)
- Full Postman collection with v1.1 endpoints will be available soon

---

## Notes

- All v1.0 endpoints remain unchanged (backward compatible)
- New endpoints require KeyGuard signature verification
- OpenAI API key configuration required for proxy endpoints
- JWT authentication required for GET /logs endpoint

---

**Maintained by**: KeyGuard Development Team
**Contact**: See repository README for support options
