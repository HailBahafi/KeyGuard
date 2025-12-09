# ⚡ Quick Start Guide

Get KeyGuard up and running in 5 minutes!

---

## Prerequisites

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **PostgreSQL** 16+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))

---

## 1. Clone the Repository

```bash
git clone https://github.com/your-org/keyguard.git
cd keyguard
```

---

## 2. Start the Backend

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp env.example .env
```

Edit `.env` with your settings:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/keyguard"
JWT_SECRET_KEY="your-super-secret-key-at-least-32-characters"
```

```bash
# Setup database
npx prisma generate
npx prisma migrate dev
npm run prisma:seed

# Start server
npm run start:dev
```

✅ Backend running at http://localhost:3000

---

## 3. Start the Frontend

Open a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env

# Start server
npm run dev
```

✅ Dashboard running at http://localhost:3001

---

## 4. Login to Dashboard

1. Open http://localhost:3001
2. Login with default credentials:
   - **Email**: `admin@keyguard.io`
   - **Password**: `admin123`

> ⚠️ **Change these credentials in production!**

---

## 5. Integrate the SDK

Install in your application:

```bash
npm install @keyguard/sdk
```

Basic usage:

```typescript
import { KeyGuardClient } from '@keyguard/sdk';

const client = new KeyGuardClient({
  apiKey: 'your-api-key-from-dashboard'
});

// Enroll device
const enrollment = await client.enroll();

// Sign requests
const headers = await client.signRequest({
  method: 'POST',
  url: '/api/chat',
  body: JSON.stringify({ message: 'Hello' })
});
```

---

## 🎉 You're Ready!

### Next Steps

- 📖 Read the [Architecture Overview](./ARCHITECTURE.md)
- 🔐 Learn about the [Security Protocol](./SECURITY_PROTOCOL.md)
- ⚙️ Configure [Settings](./CONFIGURATION.md)
- 🚀 Deploy to [Production](./DEPLOYMENT.md)

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

---

<p align="center">
  Need help? Check the <a href="./INSTALLATION.md">detailed installation guide</a>
</p>
