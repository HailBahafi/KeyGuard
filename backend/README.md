# 🔐 KeyGuard Backend API

Enterprise-grade API Key Management System built with NestJS, TypeScript, and PostgreSQL.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.1-red.svg)](https://nestjs.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📋 Overview

KeyGuard Backend is a comprehensive API key management system designed for enterprises to securely manage, monitor, and audit API keys across multiple providers (OpenAI, Anthropic, Google, Azure).

### Key Features

- 🔐 **Secure API Key Management** - Store and manage API keys with encryption
- 📱 **Device Inventory** - Track and manage devices using your API keys
- 📊 **Audit Logging** - Comprehensive audit trails for all operations
- ⚙️ **Settings Management** - Centralized configuration and security settings
- 🔒 **JWT Authentication** - Secure authentication with access and refresh tokens
- 🚦 **Rate Limiting** - Protect your APIs from abuse
- 🌐 **IP Whitelisting** - Restrict access by IP addresses
- 📝 **API Documentation** - Interactive Swagger/OpenAPI docs

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp env.example .env
nano .env  # Configure DATABASE_URL and JWT_SECRET_KEY

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (creates admin user)
npm run prisma:seed

# Start development server
npm run start:dev
```

### Default Admin Credentials

After seeding:
- **Email**: `admin@keyguard.io`
- **Password**: `admin123`

⚠️ **Change these in production!**

---

## 📚 Documentation

### Guides
- 📖 [API Requirements](docs/KeyGuard%20Backend%20API%20Requirements%20Specification/BACKEND_REQUIREMENTS.md) - Complete API specification
- 🗃️ [Database Migration Guide](docs/MIGRATION_GUIDE.md) - Database setup
- 🧪 [Testing Guide](test/RUNNING_TESTS.md) - Running tests

### API Testing
- 📮 [Postman Collection](docs/postman/KeyGuard-Complete-API.postman_collection.json) - 22 endpoints documented
- 📘 [Postman Usage Guide](docs/postman/POSTMAN_USAGE_GUIDE.md) - How to use Postman
- 🌐 **Swagger UI**: http://localhost:3000/api/docs (when running)

---

## 🏗️ Architecture

### Tech Stack

| Category | Technology |
|----------|-----------|
| **Runtime** | Node.js 20+ |
| **Framework** | NestJS 11 |
| **Language** | TypeScript 5.9 |
| **Database** | PostgreSQL 16 |
| **ORM** | Prisma 7 |
| **Authentication** | JWT with Passport |
| **API Docs** | Swagger/OpenAPI |
| **Testing** | Jest + Supertest |

### Project Structure

```
backend/
├── src/
│   ├── core/              # Core modules (auth, database)
│   ├── modules/           # Feature modules
│   │   ├── api-keys/      # API key management
│   │   ├── devices/       # Device inventory
│   │   ├── audit-logs/    # Audit logging
│   │   ├── settings/      # Settings management
│   │   └── users/         # User management
│   ├── common/            # Shared utilities
│   │   ├── guards/        # Auth guards
│   │   ├── interceptors/  # Audit interceptor
│   │   ├── filters/       # Error filters
│   │   └── decorators/    # Custom decorators
│   └── generated/         # Prisma generated types
├── prisma/
│   ├── schemas/           # Database schemas
│   ├── migrations/        # Database migrations
│   └── seeders/           # Database seeders
├── test/                  # E2E tests
├── docs/                  # Documentation
└── docker/                # Docker configuration
```

---

## 🛠️ Development

### Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or Docker)
- npm or yarn

### Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start with debugging

# Production
npm run build              # Build for production
npm run start:prod         # Start production build

# Database
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run migrations
npm run prisma:seed        # Seed database
npm run prisma:studio      # Open Prisma Studio

# Testing
npm test                   # Run unit tests
npm run test:e2e           # Run E2E tests
npm run test:cov           # Generate coverage

# Linting
npm run lint               # Lint code
npm run format             # Format code
```

---

---

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token

### API Keys
- `GET /api/v1/keys` - List API keys (with filtering)
- `POST /api/v1/keys` - Create new API key
- `DELETE /api/v1/keys/:id` - Revoke API key

### Devices
- `GET /api/v1/devices` - List devices (with stats)
- `POST /api/v1/devices/enrollment-code` - Generate enrollment code
- `PATCH /api/v1/devices/:id/approve` - Approve device
- `PATCH /api/v1/devices/:id/suspend` - Suspend device
- `DELETE /api/v1/devices/:id` - Revoke device

### Audit Logs
- `GET /api/v1/audit/logs` - List audit logs (with filtering)
- `POST /api/v1/audit/logs/export` - Export logs (CSV/JSON)

### Settings
- `GET /api/v1/settings` - Get all settings
- `PATCH /api/v1/settings/general` - Update general settings
- `PATCH /api/v1/settings/security` - Update security settings
- `PATCH /api/v1/settings/notifications` - Update notifications
- `POST /api/v1/settings/notifications/test` - Test SMTP
- `POST /api/v1/settings/api-keys` - Generate admin API key
- `DELETE /api/v1/settings/api-keys/:id` - Revoke admin API key
- `POST /api/v1/settings/backup/download` - Download backup

**📖 Full API Documentation**: [docs/BACKEND_REQUIREMENTS.md](docs/KeyGuard%20Backend%20API%20Requirements%20Specification/BACKEND_REQUIREMENTS.md)

---

## 🧪 Testing

### Run Tests

```bash
# Unit tests
npm test

# E2E tests (requires database configuration)
npm run test:e2e

# With coverage
npm run test:cov

# In Docker
bash scripts/docker-test.sh
```

### Test with Postman

1. Import collection: `docs/postman/KeyGuard-Complete-API.postman_collection.json`
2. Import environment: `docs/postman/KeyGuard-Complete.postman_environment.json`
3. Run "Login" request
4. Test all endpoints (token auto-saved)

**📖 Testing Guide**: [test/RUNNING_TESTS.md](test/RUNNING_TESTS.md)

---

## 🔐 Security

### Implemented Security Features

- ✅ JWT Authentication with refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting (100 req/min configurable)
- ✅ IP whitelisting
- ✅ Password hashing (bcrypt)
- ✅ Audit logging for all operations
- ✅ Input validation (class-validator)
- ✅ SQL injection protection (Prisma)
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Non-root Docker user
- ✅ Health checks

### Security Best Practices

1. **Change Default Credentials** - Don't use `admin123` in production
2. **Use Strong JWT Secret** - Generate with `openssl rand -base64 48`
3. **Enable HTTPS** - Always use SSL/TLS in production
4. **Set Up Firewall** - Restrict access to necessary ports only
5. **Regular Updates** - Keep dependencies updated
6. **Database Backups** - Schedule regular backups
7. **Monitor Logs** - Set up log monitoring and alerts

---

## 🚢 Deployment

```bash
# 1. Install dependencies
npm ci --only=production

# 2. Generate Prisma client
npx prisma generate

# 3. Build application
npm run build

# 4. Run migrations
npx prisma migrate deploy

# 5. Start application
npm run start:prod
```

### Cloud Platforms

Deploy to your preferred platform:
- **AWS EC2** - Install Node.js, PostgreSQL, and run the application
- **Google Cloud Run** - Deploy with Cloud Build
- **DigitalOcean** - Use App Platform or Droplets
- **Heroku** - Use Node.js buildpack

---

## 🌍 Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET_KEY` | JWT signing secret (32+ chars) | Generated with `openssl rand -base64 48` |

### Optional

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | Environment mode |
| `PORT` | `3000` | Application port |
| `FRONTEND_URL` | - | Frontend URL for CORS |
| `JWT_EXPIRES_IN` | `15m` | Access token expiration |
| `OPTIMIZE_API_KEY` | - | Prisma Optimize key |

**📖 Full Configuration**: [env.example](env.example)

---

## 📊 Features Status

| Module | Status | Endpoints | Tests |
|--------|--------|-----------|-------|
| Authentication | ✅ Complete | 2 | ✅ 8 tests |
| API Keys | ✅ Complete | 3 | ✅ 17 tests |
| Devices | ✅ Complete | 5 | ✅ 16 tests |
| Audit Logs | ✅ Complete | 2 | ✅ 13 tests |
| Settings | ✅ Complete | 8 | ✅ 21 tests |
| **Total** | ✅ **100%** | **20** | ✅ **75 tests** |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **MohamedSaeed-dev** - *Initial work*

---

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- Prisma team for the excellent ORM
- All contributors and users

---

## 📞 Support

### Documentation
- 📖 [API Requirements](docs/KeyGuard%20Backend%20API%20Requirements%20Specification/BACKEND_REQUIREMENTS.md)
- 🐳 [Docker Guide](docs/DOCKER_GUIDE.md)
- 📮 [Postman Collection](docs/postman/)
- 🧪 [Testing Guide](test/RUNNING_TESTS.md)

### Quick Commands
```bash
make help           # Show all Docker commands
npm run start:dev   # Start development server
docker-compose up   # Start with Docker
```

### Troubleshooting
- Check logs: `make logs` or `docker-compose logs -f`
- Health check: `curl http://localhost:3000/health`
- Documentation: `docs/` directory

---

## 🎯 Roadmap

- [ ] Add WebSocket support for real-time notifications
- [ ] Implement email notifications
- [ ] Add multi-tenancy support
- [ ] Implement API key rotation
- [ ] Add Prometheus metrics
- [ ] Implement GraphQL API
- [ ] Add rate limiting per API key
- [ ] Implement two-factor authentication

---

**Version**: 1.0.0
**Status**: ✅ Production Ready
**Last Updated**: December 2, 2025

---

<div align="center">

**Made with ❤️ by KeyGuard Team**

[Documentation](docs/) • [API Docs](http://localhost:3000/api/docs) • [Docker Guide](DOCKER_QUICKSTART.md)

</div>
