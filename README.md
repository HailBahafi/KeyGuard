<p align="center">
  <img src="docs/logo.png" alt="KeyGuard Logo" width="120" height="120">
</p>

<h1 align="center">🔐 KeyGuard</h1>

<p align="center">
  <strong>Enterprise-Grade Device Binding & API Key Protection Platform</strong>
</p>

<p align="center">
  Secure your LLM API keys by binding them to trusted devices with cryptographic signatures
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue.svg" alt="TypeScript">
  <img src="https://img.shields.io/badge/NestJS-11.1-red.svg" alt="NestJS">
  <img src="https://img.shields.io/badge/Next.js-16-black.svg" alt="Next.js">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
</p>

---

## 🎯 What is KeyGuard?

KeyGuard is a comprehensive security platform that protects your LLM API keys (OpenAI, Anthropic, Google, Azure) from unauthorized access by binding them to specific devices using cryptographic signatures.

### The Problem

- **API Key Theft**: API keys can be easily stolen from client-side applications
- **Credential Sharing**: Users share credentials, leading to unauthorized usage and billing issues
- **No Device Tracking**: Traditional API keys don't identify which device made the request
- **Replay Attacks**: Stolen credentials can be reused indefinitely

### The Solution

KeyGuard implements **Device Binding** using ECDSA P-256 cryptography:

1. **Device Enrollment**: Each device generates a unique key pair; the private key never leaves the device
2. **Request Signing**: Every API request is signed with the device's private key
3. **Server Verification**: The backend verifies signatures before proxying requests to LLM providers
4. **Audit Trail**: Complete visibility into which devices are making requests

---

## ✨ Features

### 🔒 Security
- **ECDSA P-256 Device Binding** - Hardware-bound cryptographic keys
- **Non-replayable Signatures** - Timestamp + nonce prevent replay attacks
- **Request Integrity** - SHA-256 body hashing ensures data integrity
- **IP Whitelisting** - Restrict access by IP address
- **Rate Limiting** - Configurable request throttling

### 📱 Device Management
- **Device Inventory** - Track all enrolled devices
- **Enrollment Codes** - Time-limited enrollment flow
- **Device Approval** - Approve/suspend/revoke devices
- **Fingerprinting** - Collect device metadata for auditing

### 📊 Monitoring & Audit
- **Comprehensive Audit Logs** - Track all operations
- **Export Capabilities** - CSV/JSON export for compliance
- **Real-time Dashboard** - Visualize API usage and security events
- **Security Alerts** - Detect anomalies and suspicious activity

### 🔑 API Key Management
- **Multi-Provider Support** - OpenAI, Anthropic, Google, Azure
- **Secure Storage** - Encrypted API key storage
- **Key Rotation** - Easy key rotation workflow
- **Usage Tracking** - Monitor API key usage per device

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              KeyGuard Platform                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐     │
│  │   Frontend      │    │    Backend      │    │      SDK        │     │
│  │   Dashboard     │    │     API         │    │   (Client)      │     │
│  │                 │    │                 │    │                 │     │
│  │  • Next.js 16   │    │  • NestJS 11    │    │  • TypeScript   │     │
│  │  • React 19     │◄───│  • PostgreSQL   │    │  • ECDSA P-256  │     │
│  │  • Tailwind     │    │  • Prisma ORM   │    │  • FingerprintJS│     │
│  │  • Zustand      │    │  • JWT Auth     │    │  • IndexedDB    │     │
│  └─────────────────┘    └────────┬────────┘    └────────┬────────┘     │
│                                  │                       │              │
│                                  │    Signature          │              │
│                                  │    Verification       │              │
│                                  ▼                       │              │
│                    ┌──────────────────────────┐          │              │
│                    │    LLM Providers         │◄─────────┘              │
│                    │  • OpenAI                │   Signed Requests       │
│                    │  • Anthropic             │                         │
│                    │  • Google Gemini         │                         │
│                    │  • Azure OpenAI          │                         │
│                    └──────────────────────────┘                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Components

| Component | Description | Technology |
|-----------|-------------|------------|
| **Backend API** | Core authentication, device management, and signature verification | NestJS, PostgreSQL, Prisma |
| **Frontend Dashboard** | Admin interface for managing devices, keys, and viewing audit logs | Next.js, React, Tailwind CSS |
| **SDK** | Client library for device enrollment and request signing | TypeScript, Web Crypto API |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/keyguard.git
cd keyguard
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET_KEY

# Generate Prisma client & run migrations
npx prisma generate
npx prisma migrate dev

# Seed database (creates admin user)
npm run prisma:seed

# Start development server
npm run start:dev
```

**Default Admin Credentials:**
- Email: `admin@keyguard.io`
- Password: `admin123`

> ⚠️ **Change these credentials in production!**

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env

# Start development server
npm run dev
```

Visit http://localhost:3001 for the dashboard.

### 4. SDK Integration

```bash
npm install @keyguard/sdk
```

```typescript
import { KeyGuardClient } from '@keyguard/sdk';

const client = new KeyGuardClient({
  apiKey: 'kg_prod_your_api_key'
});

// Enroll device
const enrollment = await client.enroll();

// Sign requests
const headers = await client.signRequest({
  method: 'POST',
  url: 'https://api.openai.com/v1/chat/completions',
  body: JSON.stringify({ model: 'gpt-4', messages: [] })
});
```

---

## 📁 Project Structure

```
keyguard/
├── backend/                 # NestJS Backend API
│   ├── src/
│   │   ├── core/           # Auth, database, config
│   │   ├── modules/        # Feature modules
│   │   │   ├── api-keys/   # API key management
│   │   │   ├── devices/    # Device inventory
│   │   │   ├── keyguard/   # Signature verification
│   │   │   ├── proxy/      # LLM provider proxy
│   │   │   ├── audit-logs/ # Audit logging
│   │   │   └── settings/   # Configuration
│   │   └── common/         # Shared utilities
│   ├── prisma/             # Database schema & migrations
│   └── docs/               # API documentation
│
├── frontend/               # Next.js Dashboard
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # React components
│   │   ├── stores/        # Zustand state
│   │   └── lib/           # Utilities
│   └── i18n/              # Internationalization
│
├── packages/
│   └── sdk/               # TypeScript SDK
│       └── src/
│           ├── client.ts  # Main client
│           ├── core/      # Crypto & fingerprinting
│           └── storage/   # Key storage adapters
│
├── docs/                  # Project documentation
└── LICENSE               # MIT License
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [Backend README](./backend/README.md) | Backend setup, API endpoints, and configuration |
| [Frontend README](./frontend/README.md) | Frontend setup, components, and customization |
| [SDK README](./packages/sdk/README.md) | SDK installation, usage, and protocol details |
| [API Specification](./backend/docs/KeyGuard%20Backend%20API%20Requirements%20Specification/BACKEND_REQUIREMENTS.md) | Complete API documentation |
| [Migration Guide](./backend/docs/MIGRATION_GUIDE.md) | Database migration instructions |

---

## 🔐 Security Protocol (V1)

### Request Signing Flow

1. **SDK generates signature headers** for each request:
   - `x-keyguard-signature`: Base64 ECDSA signature
   - `x-keyguard-timestamp`: ISO 8601 timestamp
   - `x-keyguard-nonce`: Random 16-byte nonce
   - `x-keyguard-key-id`: Device key identifier
   - `x-keyguard-body-sha256`: Request body hash

2. **Backend verifies** the signature before proxying to LLM providers

3. **Canonical payload format**:
   ```
   kg-v1|{timestamp}|{METHOD}|{path}|{bodySha256}|{nonce}|{apiKey}|{keyId}
   ```

### Security Features

- ✅ ECDSA P-256 cryptographic signatures
- ✅ Non-extractable private keys (WebCrypto)
- ✅ Replay attack prevention (nonce + timestamp)
- ✅ Request integrity verification (body hash)
- ✅ Device fingerprinting for auditing

---

## 🛠️ Development

### Available Scripts

**Backend:**
```bash
npm run start:dev      # Development with hot reload
npm run build          # Production build
npm run test           # Run unit tests
npm run test:e2e       # Run E2E tests
npm run prisma:studio  # Open Prisma Studio
```

**Frontend:**
```bash
npm run dev            # Development server
npm run build          # Production build
npm run lint           # Run ESLint
```

**SDK:**
```bash
npm run build          # Build SDK
npm run dev            # Watch mode
npm run typecheck      # Type checking
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
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

- [NestJS](https://nestjs.com/) - Backend framework
- [Prisma](https://www.prisma.io/) - Database ORM
- [Next.js](https://nextjs.org/) - Frontend framework
- [FingerprintJS](https://fingerprint.com/) - Device fingerprinting

---

<p align="center">
  <strong>Made with ❤️ by the KeyGuard Team</strong>
</p>

<p align="center">
  <a href="./backend/README.md">Backend Docs</a> •
  <a href="./frontend/README.md">Frontend Docs</a> •
  <a href="./packages/sdk/README.md">SDK Docs</a>
</p>
