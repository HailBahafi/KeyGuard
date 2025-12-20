# 🔐 KeyGuard - Complete Project Documentation

**Enterprise-Grade Device Binding & API Key Protection Platform**

> Secure your LLM API keys (OpenAI, Anthropic, Google, Azure) by cryptographically binding them to trusted devices.

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Problem & Solution](#problem--solution)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Project Structure](#project-structure)
6. [Core Concepts](#core-concepts)
7. [Security Protocol (V1)](#security-protocol-v1)
8. [Components Deep Dive](#components-deep-dive)
   - [Backend API](#backend-api)
   - [Frontend Dashboard](#frontend-dashboard)
   - [SDK (Client Library)](#sdk-client-library)
9. [Data Flow & Sequences](#data-flow--sequences)
10. [Database Schema](#database-schema)
11. [API Reference](#api-reference)
12. [Getting Started](#getting-started)
13. [Configuration](#configuration)
14. [Development](#development)
15. [Deployment](#deployment)
16. [Troubleshooting](#troubleshooting)

---

## Overview

KeyGuard is a comprehensive security platform that protects LLM (Large Language Model) API keys from unauthorized access. It achieves this through **device binding** using ECDSA P-256 cryptographic signatures.

### Key Capabilities

| Feature | Description |
|---------|-------------|
| **Device Binding** | Each client device generates a unique cryptographic key pair |
| **Request Signing** | Every API request is signed with the device's private key |
| **Signature Verification** | Backend verifies signatures before proxying to LLM providers |
| **Multi-Provider Support** | Works with OpenAI, Anthropic, Google Gemini, Azure OpenAI |
| **Audit Trail** | Complete visibility into which devices make which requests |
| **Device Management** | Approve, suspend, or revoke devices from the dashboard |

---

## Problem & Solution

### The Problem

```
❌ API Key Theft        → Keys easily stolen from client-side applications
❌ Credential Sharing   → Users share keys, causing unauthorized usage & billing
❌ No Device Tracking   → Traditional API keys don't identify request sources
❌ Replay Attacks       → Stolen credentials can be reused indefinitely
```

### The Solution

```
✅ Device Enrollment    → Each device generates unique key pair (private key never leaves)
✅ Request Signing      → Every request signed with device's private key + timestamp + nonce
✅ Server Verification  → Backend verifies signature before proxying to LLM providers
✅ Complete Audit Trail → Full visibility into device activity and API usage
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                 KeyGuard Platform                               │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│    ┌──────────────────┐                                                         │
│    │   Client App     │  Your application using the KeyGuard SDK                │
│    │  with SDK        │                                                         │
│    │                  │                                                         │
│    │  ┌────────────┐  │                                                         │
│    │  │ @keyguard  │  │  • Generates ECDSA key pair                             │
│    │  │    /sdk    │  │  • Signs every request                                  │
│    │  │            │  │  • Stores keys in IndexedDB                             │
│    │  │ • Crypto   │  │  • Collects device fingerprint                          │
│    │  │ • Storage  │  │                                                         │
│    │  │ • Signing  │  │                                                         │
│    │  └────────────┘  │                                                         │
│    └────────┬─────────┘                                                         │
│             │                                                                   │
│             │ Signed Requests with x-keyguard-* headers                         │
│             ▼                                                                   │
│    ┌──────────────────────────────────────────────────────────────────────────┐ │
│    │                           Backend API (NestJS)                           │ │
│    │                                                                          │ │
│    │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐          │ │
│    │  │   Auth     │  │  KeyGuard  │  │   Proxy    │  │  Devices   │          │ │
│    │  │  Module    │  │  Module    │  │  Module    │  │  Module    │          │ │
│    │  │            │  │            │  │            │  │            │          │ │
│    │  │ • JWT      │  │ • Enroll   │  │ • OpenAI   │  │ • Inventory│          │ │
│    │  │ • Login    │  │ • Verify   │  │ • Anthropic│  │ • Approve  │          │ │
│    │  │ • Refresh  │  │ • Validate │  │ • Google   │  │ • Suspend  │          │ │
│    │  └────────────┘  └────────────┘  └────────────┘  └────────────┘          │ │
│    │                                                                          │ │
│    │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐          │ │
│    │  │  API Keys  │  │   Audit    │  │  Settings  │  │   Users    │          │ │
│    │  │  Module    │  │   Module   │  │  Module    │  │  Module    │          │ │
│    │  │            │  │            │  │            │  │            │          │ │
│    │  │ • Create   │  │ • Log      │  │ • Security │  │ • CRUD     │          │ │
│    │  │ • Rotate   │  │ • Export   │  │ • General  │  │ • Roles    │          │ │
│    │  │ • Revoke   │  │ • Filter   │  │ • Notify   │  │ • Auth     │          │ │
│    │  └────────────┘  └────────────┘  └────────────┘  └────────────┘          │ │
│    │                                                                          │ │
│    └────────────────────────────┬─────────────────────────────────────────────┘ │
│                                 │                                               │
│                 ┌───────────────┼───────────────┐                               │
│                 ▼               ▼               ▼                               │
│          ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                     │
│          │  PostgreSQL  │ │    Redis     │ │ LLM APIs     │                     │
│          │  Database    │ │   (Cache)    │ │              │                     │
│          │              │ │              │ │ • OpenAI     │                     │
│          │ • Users      │ │ • Sessions   │ │ • Anthropic  │                     │
│          │ • Devices    │ │ • Nonces     │ │ • Google     │                     │
│          │ • API Keys   │ │ • Rate Limit │ │ • Azure      │                     │
│          │ • Audit Logs │ │              │ │              │                     │
│          └──────────────┘ └──────────────┘ └──────────────┘                     │
│                                                                                 │
│    ┌─────────────────────────────────────────────────────────────────────────┐  │
│    │                    Frontend Dashboard (Next.js)                         │  │
│    │                                                                         │  │ 
│    │  📊 Overview      📱 Devices      🔑 API Keys     📋 Audit Logs         │  │
│    │  ⚙️ Settings      🔗 Integration  🔐 Login        📝 Setup              │  │
│    │                                                                         │  │
│    │  Features:                                                              │  │
│    │  • i18n (English + Arabic RTL)    • Dark/Light theme                    │  │
│    │  • Responsive design              • Real-time updates                   │  │
│    │                                                                         │  │
│    └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **NestJS** | 11.x | Server framework |
| **TypeScript** | 5.9 | Programming language |
| **PostgreSQL** | 16+ | Primary database |
| **Prisma** | 7.x | ORM & migrations |
| **Redis** | - | Caching, nonce storage, rate limiting |
| **Passport/JWT** | - | Authentication |
| **Fastify** | - | HTTP server |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.x | React framework (App Router) |
| **React** | 19.x | UI library |
| **TypeScript** | 5.x | Programming language |
| **Tailwind CSS** | v4 | Styling |
| **Shadcn/UI** | - | UI components (Radix primitives) |
| **Zustand** | - | State management |
| **React Query** | - | Data fetching |
| **next-intl** | - | Internationalization |
| **Framer Motion** | - | Animations |

### SDK
| Technology | Purpose |
|------------|---------|
| **TypeScript** | Type-safe client library |
| **WebCrypto API** | ECDSA P-256 cryptography |
| **IndexedDB** | Secure key storage (browser) |
| **FingerprintJS** | Device fingerprinting |

---

## Project Structure

```
keyguard/
├── backend/                          # NestJS Backend API
│   ├── src/
│   │   ├── core/                     # Core infrastructure
│   │   │   ├── auth/                 # JWT authentication
│   │   │   ├── config/               # Configuration module
│   │   │   └── database/             # Prisma database module
│   │   ├── modules/                  # Feature modules
│   │   │   ├── api-keys/             # LLM API key management
│   │   │   │   ├── api-keys.controller.ts
│   │   │   │   ├── api-keys.service.ts
│   │   │   │   └── dto/
│   │   │   ├── audit-logs/           # Activity logging & export
│   │   │   ├── devices/              # Device inventory management
│   │   │   ├── health/               # Health check endpoints
│   │   │   ├── keyguard/             # Core signature verification
│   │   │   │   ├── keyguard.controller.ts  # Enrollment & verification
│   │   │   │   └── services/
│   │   │   │       ├── crypto.service.ts   # ECDSA signature verification
│   │   │   │       └── keyguard.service.ts # Business logic
│   │   │   ├── proxy/                # LLM provider proxy
│   │   │   │   ├── proxy.controller.ts     # Universal proxy endpoint
│   │   │   │   └── proxy.service.ts        # Forward to OpenAI etc.
│   │   │   ├── settings/             # System configuration
│   │   │   └── users/                # User management
│   │   ├── common/                   # Shared utilities
│   │   │   ├── guards/               # Auth guards
│   │   │   ├── interceptors/         # Audit interceptor
│   │   │   ├── filters/              # Error filters
│   │   │   └── decorators/           # Custom decorators
│   │   ├── main.ts                   # Application entry point
│   │   └── app.module.ts             # Root module
│   ├── prisma/
│   │   ├── schemas/                  # Database schema files
│   │   │   ├── device.prisma         # Device model
│   │   │   ├── api-key.prisma        # API Key model
│   │   │   ├── audit-log.prisma      # Audit log model
│   │   │   └── user.prisma           # User model
│   │   ├── migrations/               # Database migrations
│   │   └── seeders/                  # Seed data
│   ├── test/                         # E2E tests (75+ tests)
│   └── docs/                         # API documentation & Postman
│
├── frontend/                         # Next.js Dashboard
│   ├── src/
│   │   ├── app/
│   │   │   └── [locale]/             # Locale-based routing (en/ar)
│   │   │       ├── (auth)/           # Authentication pages
│   │   │       │   ├── login/        # Login page
│   │   │       │   └── setup/        # Initial setup
│   │   │       ├── (dashboard)/      # Protected dashboard
│   │   │       │   ├── dashboard/    # Overview & stats
│   │   │       │   ├── devices/      # Device management
│   │   │       │   ├── keys/         # API key management
│   │   │       │   ├── audit/        # Audit log viewer
│   │   │       │   ├── settings/     # Configuration
│   │   │       │   └── integration/  # SDK integration guide
│   │   │       └── (marketing)/      # Public marketing pages
│   │   ├── components/
│   │   │   ├── ui/                   # Shadcn/UI components
│   │   │   ├── common/               # Shared components
│   │   │   ├── dashboard/            # Dashboard-specific
│   │   │   └── providers/            # Context providers
│   │   ├── stores/                   # Zustand state stores
│   │   ├── hooks/                    # Custom React hooks
│   │   ├── lib/                      # Utilities (API client, helpers)
│   │   ├── services/                 # API service layer
│   │   └── i18n/messages/            # Translation files (en.json, ar.json)
│   └── i18n/                         # i18n configuration
│
├── packages/
│   └── sdk/                          # @keyguard/sdk TypeScript SDK
│       ├── src/
│       │   ├── client.ts             # Main KeyGuardClient class
│       │   ├── types.ts              # TypeScript interfaces
│       │   ├── core/
│       │   │   ├── crypto.ts         # ECDSA P-256 cryptographic operations
│       │   │   └── fingerprint.ts    # Device fingerprinting (FingerprintJS)
│       │   └── storage/
│       │       ├── browser.ts        # IndexedDB storage adapter
│       │       └── memory.ts         # In-memory storage adapter
│       └── dist/                     # Built output (ESM + CJS)
│
├── keyguard-client-demo/             # Demo application
│
├── docs/                             # Project documentation
│   ├── ARCHITECTURE.md               # System architecture
│   ├── QUICKSTART.md                 # Quick start guide
│   └── README.md                     # Documentation index
│
└── README.md                         # Main project README
```

---

## Core Concepts

### 1. API Key (Project)

Represents a protected LLM API key:

| Field | Description |
|-------|-------------|
| `id` | Unique identifier (UUID) |
| `name` | Human-readable name (e.g., "Production OpenAI") |
| `provider` | LLM provider (OPENAI, ANTHROPIC, GOOGLE, AZURE) |
| `status` | ACTIVE, IDLE, EXPIRED, REVOKED |
| `environment` | PRODUCTION, DEVELOPMENT, STAGING |
| `maskedValue` | Display value (e.g., "sk-...abc123") |
| `fullValue` | Encrypted full API key |

### 2. Device

Represents an enrolled client device:

| Field | Description |
|-------|-------------|
| `id` | Unique identifier (UUID) |
| `name` | Device nickname |
| `status` | PENDING → ACTIVE → SUSPENDED/REVOKED |
| `publicKeySpkiBase64` | Public key (ECDSA P-256, SPKI format) |
| `keyId` | SHA-256 hash of public key |
| `fingerprintHash` | FingerprintJS visitor ID |
| `platform` | OS, version, browser info |
| `ipAddress` | Last seen IP |
| `totalCalls` | Request count |

### 3. Device Status Lifecycle

```
┌──────────┐     Admin      ┌──────────┐
│ PENDING  │ ──────────────►│  ACTIVE  │
└──────────┘    Approves    └────┬─────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
             ┌──────────┐             ┌──────────┐
             │SUSPENDED │◄───────────►│ REVOKED  │
             └──────────┘  Can Toggle └──────────┘
```

- **PENDING**: Device enrolled, awaiting admin approval
- **ACTIVE**: Device approved, can make API requests
- **SUSPENDED**: Temporarily disabled (can be re-activated)
- **REVOKED**: Permanently disabled

---

## Security Protocol (V1)

### Request Signing Flow

```
┌──────────────────┐                    ┌──────────────────┐
│   Client (SDK)   │                    │   Backend API    │
└────────┬─────────┘                    └────────┬─────────┘
         │                                       │
         │ 1. SDK generates signature headers    │
         │    for the request:                   │
         │                                       │
         │    • x-keyguard-api-key               │
         │    • x-keyguard-key-id                │
         │    • x-keyguard-timestamp             │
         │    • x-keyguard-nonce                 │
         │    • x-keyguard-body-sha256           │
         │    • x-keyguard-alg                   │
         │    • x-keyguard-signature             │
         │                                       │
         │ ─────────────────────────────────────►│
         │                                       │
         │                    2. Backend verifies │
         │                       • Timestamp (5 min window)
         │                       • Nonce (Redis check)
         │                       • Device status (ACTIVE)
         │                       • ECDSA signature
         │                       • Body hash integrity
         │                                       │
         │                    3. Forward to LLM  │
         │                       provider        │
         │                                       │
         │ ◄─────────────────────────────────────│
         │         4. Stream response back       │
         │                                       │
```

### Signature Headers

| Header | Description | Example |
|--------|-------------|---------|
| `x-keyguard-api-key` | Project API key | `kg_prod_abc123...` |
| `x-keyguard-key-id` | SHA-256 hash of public key | `a1b2c3d4e5f6...` |
| `x-keyguard-timestamp` | ISO 8601 timestamp | `2024-01-15T10:30:00.000Z` |
| `x-keyguard-nonce` | Random 16-byte Base64 | `a3F5d2g4j2k1...` |
| `x-keyguard-body-sha256` | SHA-256 hash of body | `47DEQpj8HB...` |
| `x-keyguard-alg` | Signing algorithm | `ECDSA_P256_SHA256_P1363` |
| `x-keyguard-signature` | ECDSA signature | `MEUCIQDk...` |

### Canonical Payload Format

The signature is calculated over this pipe-separated string:

```
kg-v1|{timestamp}|{METHOD}|{pathAndQuery}|{bodySha256}|{nonce}|{apiKey}|{keyId}
```

**Example:**
```
kg-v1|2024-01-15T10:30:00.000Z|POST|/v1/chat/completions|47DEQpj...|randomNonce|kg_prod_abc|a1b2c3d4
```

### Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Security Stack                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Layer 1: Device Binding                                │
│  ├── ECDSA P-256 key pair per device                   │
│  ├── Private key never leaves device                    │
│  └── Non-extractable WebCrypto keys                     │
│                                                         │
│  Layer 2: Request Signing                               │
│  ├── Timestamp prevents replay (5-min window)           │
│  ├── Nonce ensures uniqueness (Redis storage)           │
│  └── Body hash ensures integrity                        │
│                                                         │
│  Layer 3: Server Verification                           │
│  ├── Signature verification before proxy                │
│  ├── Device status check (must be ACTIVE)              │
│  └── Rate limiting per device                           │
│                                                         │
│  Layer 4: API Protection                                │
│  ├── JWT authentication for dashboard                   │
│  ├── IP whitelisting option                             │
│  └── Comprehensive audit logging                        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Components Deep Dive

### Backend API

#### Module Overview

| Module | Endpoints | Purpose |
|--------|-----------|---------|
| **Auth** | 2 | Login, token refresh |
| **KeyGuard** | 5 | Device enrollment, signature verification |
| **Proxy** | 1 (*) | Universal LLM proxy |
| **Devices** | 5 | Device management for dashboard |
| **API Keys** | 3 | API key CRUD |
| **Audit Logs** | 2 | Log viewing and export |
| **Settings** | 8 | Configuration management |
| **Users** | CRUD | User management |

#### KeyGuard Module (Core)

```typescript
// POST /api/v1/keyguard/enroll
// Enrolls a device by storing its public key
{
  "keyId": "sha256-hash-of-public-key",
  "publicKey": "base64-spki-public-key",
  "deviceFingerprint": "fingerprint-hash",
  "label": "My MacBook Pro",
  "userAgent": "Mozilla/5.0...",
  "metadata": { "os": "macOS", "browser": "Chrome" }
}

// Response
{
  "deviceId": "uuid",
  "status": "PENDING"
}
```

#### Proxy Module

```typescript
// POST /api/v1/proxy/v1/chat/completions
// Verifies signature then forwards to OpenAI

// Required Headers:
// x-keyguard-api-key, x-keyguard-key-id, x-keyguard-timestamp,
// x-keyguard-nonce, x-keyguard-body-sha256, x-keyguard-alg,
// x-keyguard-signature

// Flow:
// 1. Validate all required headers present
// 2. Verify signature with KeyGuardService
// 3. Extract OpenAI endpoint from URL
// 4. Forward request to OpenAI with decrypted API key
// 5. Stream response back to client
```

---

### Frontend Dashboard

#### Pages Overview

| Route | Description |
|-------|-------------|
| `/login` | Authentication page |
| `/setup` | Initial setup wizard |
| `/dashboard` | Overview with stats & charts |
| `/dashboard/devices` | Device inventory & management |
| `/dashboard/keys` | API key management |
| `/dashboard/audit` | Audit log viewer with filters |
| `/dashboard/settings` | Configuration (security, general, notifications) |
| `/dashboard/integration` | SDK integration guide |

#### Features

- **🌍 Internationalization**: English and Arabic (RTL) support via `next-intl`
- **🌓 Theme**: Light/Dark mode with system preference detection
- **📱 Responsive**: Works on desktop and mobile
- **🔄 Real-time**: React Query for data synchronization
- **📊 Charts**: Recharts for data visualization
- **✨ Animations**: Framer Motion for smooth transitions

#### State Management

Using Zustand with DevTools:
- `useAuthStore` - Authentication state
- `useDevicesStore` - Devices data
- `useSettingsStore` - App settings

---

### SDK (Client Library)

#### Installation

```bash
npm install @keyguard/sdk
```

#### Usage

```typescript
import { KeyGuardClient } from '@keyguard/sdk';

// 1. Initialize client
const client = new KeyGuardClient({
  apiKey: 'kg_prod_your_api_key'
});

// 2. Check enrollment status
const isEnrolled = await client.isEnrolled();

// 3. Enroll device (first time)
if (!isEnrolled) {
  const enrollment = await client.enroll('My Device');
  
  // Send to backend for registration
  await fetch('/api/enroll', {
    method: 'POST',
    body: JSON.stringify(enrollment)
  });
}

// 4. Sign and make requests
const headers = await client.signRequest({
  method: 'POST',
  url: '/v1/chat/completions',
  body: JSON.stringify({ model: 'gpt-4', messages: [] })
});

const response = await fetch('/api/proxy/v1/chat/completions', {
  method: 'POST',
  headers: { ...headers, 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'gpt-4', messages: [] })
});
```

#### Client Methods

| Method | Description |
|--------|-------------|
| `enroll(deviceName?)` | Generate key pair and return enrollment payload |
| `signRequest(request)` | Sign HTTP request, return headers |
| `isEnrolled()` | Check if device has stored keys |
| `unenroll()` | Clear all stored keys |

#### Storage Adapters

| Adapter | Environment | Storage |
|---------|-------------|---------|
| `BrowserStorageAdapter` | Browser | IndexedDB |
| `MemoryStorageAdapter` | Node.js/Testing | In-memory |
| Custom | Any | Implement `StorageAdapter` interface |

---

## Data Flow & Sequences

### Device Enrollment Flow

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│   Client   │     │  Your App  │     │  Backend   │     │  Database  │
│   (SDK)    │     │  Server    │     │    API     │     │            │
└─────┬──────┘     └─────┬──────┘     └─────┬──────┘     └─────┬──────┘
      │                  │                  │                  │
      │ 1. client.enroll()                  │                  │
      │ ─────────────►   │                  │                  │
      │                  │                  │                  │
      │ 2. Generate ECDSA                   │                  │
      │    P-256 keypair │                  │                  │
      │                  │                  │                  │
      │ 3. Collect device                   │                  │
      │    fingerprint   │                  │                  │
      │                  │                  │                  │
      │ 4. Return enrollment                │                  │
      │    payload       │                  │                  │
      │ ◄─────────────── │                  │                  │
      │                  │                  │                  │
      │ 5. App forwards  │                  │                  │
      │    to backend    │                  │                  │
      │                  │ POST /keyguard/enroll              │
      │                  │ ─────────────────►                  │
      │                  │                  │                  │
      │                  │                  │ 6. Validate API  │
      │                  │                  │    Key           │
      │                  │                  │ ◄────────────────│
      │                  │                  │                  │
      │                  │                  │ 7. Create device │
      │                  │                  │    (PENDING)     │
      │                  │                  │ ─────────────────►
      │                  │                  │                  │
      │                  │                  │ 8. Return device │
      │                  │                  │    ID            │
      │                  │ ◄─────────────── │                  │
      │                  │                  │                  │
      │                  │ 9. Admin approves                   │
      │                  │    device in dashboard              │
      │                  │                  │ PATCH /devices/:id/approve
      │                  │                  │ ─────────────────►
      │                  │                  │   status=ACTIVE  │
      │                  │                  │                  │
```

### Signed Request Flow (LLM Proxy)

```
┌────────────┐     ┌────────────┐     ┌────────────┐     ┌────────────┐
│   Client   │     │  Backend   │     │  KeyGuard  │     │  OpenAI    │
│   (SDK)    │     │    API     │     │  Service   │     │    API     │
└─────┬──────┘     └─────┬──────┘     └─────┬──────┘     └─────┬──────┘
      │                  │                  │                  │
      │ 1. signRequest() │                  │                  │
      │ ─────────────►   │                  │                  │
      │                  │                  │                  │
      │ 2. Generate:     │                  │                  │
      │    - timestamp   │                  │                  │
      │    - nonce       │                  │                  │
      │    - bodySha256  │                  │                  │
      │    - signature   │                  │                  │
      │                  │                  │                  │
      │ 3. Return headers│                  │                  │
      │ ◄─────────────── │                  │                  │
      │                  │                  │                  │
      │ 4. POST /proxy/v1/chat/completions  │                  │
      │    + x-keyguard-* headers           │                  │
      │ ────────────────────────────────────►                  │
      │                  │                  │                  │
      │                  │ 5. verifyRequest()                  │
      │                  │ ─────────────────►                  │
      │                  │                  │                  │
      │                  │    - Check timestamp                │
      │                  │    - Check nonce (Redis)            │
      │                  │    - Lookup device                  │
      │                  │    - Verify status=ACTIVE           │
      │                  │    - Verify ECDSA signature         │
      │                  │    - Verify body hash               │
      │                  │                  │                  │
      │                  │ 6. Verification  │                  │
      │                  │    result        │                  │
      │                  │ ◄─────────────── │                  │
      │                  │                  │                  │
      │                  │ 7. Decrypt API key                  │
      │                  │    from database │                  │
      │                  │                  │                  │
      │                  │ 8. Forward request                  │
      │                  │ ────────────────────────────────────►
      │                  │                  │                  │
      │                  │                  │ 9. LLM Response  │
      │                  │ ◄────────────────────────────────────
      │                  │                  │                  │
      │ 10. Stream response to client       │                  │
      │ ◄──────────────────────────────────────────────────────
      │                  │                  │                  │
```

---

## Database Schema

### Entity Relationship Diagram

```
┌─────────────────┐          ┌─────────────────┐
│   Organization  │          │      User       │
├─────────────────┤          ├─────────────────┤
│ id              │◄────┬────│ id              │
│ name            │     │    │ email           │
│ slug            │     │    │ name            │
│ createdAt       │     │    │ password        │
└────────┬────────┘     │    │ role            │
         │              │    │ organizationId  │
         │              │    └─────────────────┘
         │              │
         │              │    ┌─────────────────┐
         │              └────│    Settings     │
         │                   ├─────────────────┤
         │                   │ id              │
         │                   │ key             │
         │                   │ value           │
         ▼                   └─────────────────┘
┌─────────────────┐
│     ApiKey      │
├─────────────────┤
│ id              │
│ name            │
│ provider        │──── OPENAI | ANTHROPIC | GOOGLE | AZURE
│ status          │──── ACTIVE | IDLE | EXPIRED | REVOKED
│ environment     │──── PRODUCTION | DEVELOPMENT | STAGING
│ maskedValue     │
│ fullValue       │──── Encrypted
│ organizationId  │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│     Device      │
├─────────────────┤
│ id              │
│ name            │
│ status          │──── PENDING | ACTIVE | SUSPENDED | REVOKED
│ platform        │──── { os, version, browser }
│ fingerprintHash │
│ keyId           │──── SHA-256 of public key
│ publicKeySpkiBase64
│ ipAddress       │
│ totalCalls      │
│ apiKeyId        │
│ organizationId  │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────┐
│    AuditLog     │
├─────────────────┤
│ id              │
│ action          │──── CREATE | UPDATE | DELETE | AUTH | ...
│ resource        │
│ resourceId      │
│ details         │
│ ipAddress       │
│ severity        │
│ userId          │
│ deviceId        │
│ apiKeyId        │
│ timestamp       │
└─────────────────┘
```

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | User login, returns tokens |
| POST | `/api/v1/auth/refresh` | Refresh access token |

### KeyGuard (Public - uses x-keyguard-api-key)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/keyguard/enroll` | Enroll a device |
| POST | `/api/v1/keyguard/verify-test` | Test signature verification |
| GET | `/api/v1/keyguard/devices` | List devices for API key |
| GET | `/api/v1/keyguard/devices/:id` | Get device details |
| DELETE | `/api/v1/keyguard/devices/:id` | Revoke device |

### Proxy (Public - uses signature verification)

| Method | Endpoint | Description |
|--------|----------|-------------|
| ALL | `/api/v1/proxy/*` | Forward signed requests to LLM |

### Devices (Dashboard - JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/devices` | List all devices |
| POST | `/api/v1/devices/enrollment-code` | Generate enrollment code |
| PATCH | `/api/v1/devices/:id/approve` | Approve device |
| PATCH | `/api/v1/devices/:id/suspend` | Suspend device |
| DELETE | `/api/v1/devices/:id` | Revoke device |

### API Keys (Dashboard - JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/keys` | List API keys (with filtering) |
| POST | `/api/v1/keys` | Create new API key |
| DELETE | `/api/v1/keys/:id` | Revoke API key |

### Audit Logs (Dashboard - JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/audit/logs` | List logs (with filtering) |
| POST | `/api/v1/audit/logs/export` | Export logs (CSV/JSON) |

### Settings (Dashboard - JWT required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/settings` | Get all settings |
| PATCH | `/api/v1/settings/general` | Update general settings |
| PATCH | `/api/v1/settings/security` | Update security settings |
| PATCH | `/api/v1/settings/notifications` | Update notifications |
| POST | `/api/v1/settings/notifications/test` | Test SMTP |
| POST | `/api/v1/settings/api-keys` | Generate admin API key |
| DELETE | `/api/v1/settings/api-keys/:id` | Revoke admin API key |
| POST | `/api/v1/settings/backup/download` | Download backup |

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **PostgreSQL** 16+
- **Redis** (optional, for production anti-replay)
- **npm** or **yarn**

### 1. Clone Repository

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
# Edit .env: Set DATABASE_URL and JWT_SECRET_KEY

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

> ⚠️ **Change these in production!**

Backend runs at: http://localhost:3000

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

Dashboard runs at: http://localhost:3001

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
const enrollment = await client.enroll('My Device');

// Sign requests
const headers = await client.signRequest({
  method: 'POST',
  url: '/v1/chat/completions',
  body: JSON.stringify({ model: 'gpt-4', messages: [] })
});
```

---

## Configuration

### Backend Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET_KEY` | ✅ | JWT signing secret (32+ chars) |
| `NODE_ENV` | ❌ | `development` or `production` |
| `PORT` | ❌ | Server port (default: 3000) |
| `FRONTEND_URL` | ❌ | Frontend URL for CORS |
| `JWT_EXPIRES_IN` | ❌ | Token expiration (default: 15m) |
| `REDIS_URL` | ❌ | Redis URL for caching |

### Frontend Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | ✅ | Backend API URL |

---

## Development

### Backend Commands

```bash
npm run start:dev      # Development with hot reload
npm run start:debug    # Start with debugging
npm run build          # Production build
npm run start:prod     # Start production build
npm test               # Run unit tests
npm run test:e2e       # Run E2E tests
npm run prisma:studio  # Open Prisma Studio
```

### Frontend Commands

```bash
npm run dev            # Development server
npm run build          # Production build
npm start              # Start production server
npm run lint           # Run ESLint
```

### SDK Commands

```bash
npm run build          # Build SDK
npm run dev            # Watch mode
npm run typecheck      # Type checking
```

---

## Deployment

### Production Checklist

- [ ] Change default admin credentials
- [ ] Generate strong JWT secret: `openssl rand -base64 48`
- [ ] Configure HTTPS/SSL
- [ ] Set up Redis for anti-replay
- [ ] Configure rate limiting
- [ ] Set up database backups
- [ ] Configure monitoring & alerts
- [ ] Review CORS settings

### Deployment Steps

```bash
# Backend
cd backend
npm ci --only=production
npx prisma generate
npm run build
npx prisma migrate deploy
npm run start:prod

# Frontend
cd frontend
npm ci
npm run build
npm start
```

---

## Troubleshooting

### Database Connection Failed

```bash
# Check PostgreSQL is running
pg_isready -h localhost -p 5432

# Create database if needed
createdb keyguard
```

### Port Already in Use

```bash
# Backend: Change PORT in .env
PORT=3001

# Frontend: Use different port
npm run dev -- -p 3002
```

### Prisma Client Not Generated

```bash
npx prisma generate
```

### Signature Verification Failing

1. Check timestamp is within 5-minute window
2. Verify nonce hasn't been used before
3. Confirm device status is ACTIVE
4. Ensure body hash matches

### Device Not Found

1. Verify x-keyguard-key-id header matches stored keyId
2. Check device is enrolled and approved
3. Verify API key matches device's associated key

---

## License

MIT License - see [LICENSE](../LICENSE) file for details.

---

<p align="center">
  <strong>Made with ❤️ by the KeyGuard Team</strong>
</p>

<p align="center">
  <a href="../README.md">Main README</a> •
  <a href="../backend/README.md">Backend</a> •
  <a href="../frontend/README.md">Frontend</a> •
  <a href="../packages/sdk/README.md">SDK</a>
</p>
