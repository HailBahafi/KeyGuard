# Postman Collection Changelog

All notable changes to the KeyGuard API Postman collection will be documented in this file.

---

## [1.1.0] - 2025-12-02

### Added
- **Organization Registration Endpoint** (`POST /auth/register`)
  - Complete request/response examples
  - 4 sample responses (201 Success, 409 Conflict, 400 Validation, 500 Error)
  - Automated test scripts for response validation
  - Token auto-save functionality
  - Comprehensive field validation documentation

### Updated
- Collection description with organization setup information
- Authentication section now includes 3 endpoints (Register, Login, Refresh)
- Environment variables documentation

### Notes
- Registration endpoint supports first-time organization setup
- Admin user automatically created with ADMIN role
- JWT token returned immediately upon successful registration
- Email uniqueness enforced
- Organization slug auto-generated from name

---

## [1.0.0] - 2025-12-01

### Initial Release
- Complete API collection with 22 endpoints
- Authentication (Login, Refresh Token)
- API Keys Management (List, Create, Revoke)
- Devices Management (List, Enroll, Approve, Suspend, Revoke)
- Audit Logs (List, Export)
- Settings (General, Security, Notifications, API Keys, Backup)
- Comprehensive response examples for all endpoints
- Automated test scripts
- Environment variables setup
