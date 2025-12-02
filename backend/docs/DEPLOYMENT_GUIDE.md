# KeyGuard Phase 1 - Deployment Guide

## 🚀 Deployment Instructions

This guide covers deploying the KeyGuard Backend Phase 1 implementation.

---

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database
- npm or yarn package manager
- Environment variables configured

---

## Development Environment Setup

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Create `.env` file with:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/keyguard?schema=public"
PORT=3000
NODE_ENV=development
```

### Step 3: Database Setup

#### Option A: Fresh Database (Recommended)

If you have a fresh database or want to reset:

```bash
# Generate Prisma Client
npm run prisma:generate

# Reset database and apply migrations
npx prisma migrate reset

# Seed database with test data
npm run prisma:seed
```

#### Option B: Existing Database (Migration)

If you have existing data you want to keep:

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration from current state
npx prisma migrate dev --name add_keyguard_phase1

# Apply migration
npx prisma migrate deploy

# Seed new data
npm run prisma:seed
```

#### Option C: Database Has Drift

If Prisma detects drift (schema doesn't match migrations):

```bash
# Generate Prisma Client
npm run prisma:generate

# Option 1: Reset (loses all data)
npx prisma migrate reset
npm run prisma:seed

# Option 2: Resolve manually
# 1. Backup your database
# 2. Create baseline migration
npx prisma migrate resolve --applied "20250928111251_init"
# 3. Create new migration
npx prisma migrate dev --name add_keyguard_phase1
```

### Step 4: Verify Setup

```bash
# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Check for errors
npm run lint
```

### Step 5: Start Development Server

```bash
npm run start:dev
```

Server starts on `http://localhost:3000`

### Step 6: Verify Endpoints

```bash
# Health check
curl http://localhost:3000

# Test enrollment (should return 401/400 without valid API key)
curl http://localhost:3000/api/v1/keyguard/enroll
```

---

## Production Deployment

### Step 1: Build Application

```bash
npm run build
```

### Step 2: Set Production Environment

```env
DATABASE_URL="postgresql://user:password@production-host:5432/keyguard?schema=public"
PORT=3000
NODE_ENV=production
FRONTEND_URL="https://your-frontend.com"
```

### Step 3: Run Migrations

```bash
# Apply migrations (doesn't reset)
npx prisma migrate deploy
```

**⚠️ WARNING:** Never use `prisma migrate dev` or `prisma migrate reset` in production!

### Step 4: Seed Production Data

Create production API keys manually or via script:

```bash
# Edit prisma/seeders/api-keys.seeder.ts for production keys
# Then run:
npm run prisma:seed
```

### Step 5: Start Production Server

```bash
# Direct
npm run start:prod

# With PM2
pm2 start dist/main.js --name keyguard-api

# With Docker
docker-compose up -d
```

---

## Docker Deployment

### Using Docker Compose

```yaml
version: '3.8'

services:
  keyguard-api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - NODE_ENV=production
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=keyguard
      - POSTGRES_PASSWORD=secure_password
      - POSTGRES_DB=keyguard
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres-data:
```

### Build and Deploy

```bash
# Build
docker-compose build

# Run migrations
docker-compose run keyguard-api npx prisma migrate deploy

# Start services
docker-compose up -d

# View logs
docker-compose logs -f keyguard-api
```

---

## Database Migrations

### Understanding the Schema

The KeyGuard implementation adds three main tables:

1. **api_keys** - Project API keys
   - Stores project information
   - Status management (ACTIVE/INACTIVE/REVOKED)

2. **devices** - Enrolled devices
   - Stores device public keys
   - Device metadata and status
   - Linked to API keys

3. **nonces** - Replay protection
   - Stores used nonces with TTL
   - Prevents replay attacks

### Migration Commands

```bash
# Create new migration
npx prisma migrate dev --name <migration_name>

# Apply migrations (production)
npx prisma migrate deploy

# View migration status
npx prisma migrate status

# Mark migration as applied (resolve conflicts)
npx prisma migrate resolve --applied <migration_id>

# Rollback (manual - Prisma doesn't support automatic rollback)
# You need to create a new migration that reverts changes
```

---

## Testing in Production

### Step 1: Generate Test Keys

```bash
npm run keyguard:generate-keys
```

Save the output securely.

### Step 2: Create API Key

Insert a test API key in the database:

```sql
INSERT INTO api_keys (id, key_prefix, name, status)
VALUES (
  gen_random_uuid(),
  'kg_test',
  'Test Project',
  'ACTIVE'
);
```

### Step 3: Enroll Device

```bash
curl -X POST https://your-api.com/api/v1/keyguard/enroll \
  -H "Content-Type: application/json" \
  -H "x-keyguard-api-key: kg_test_production_key" \
  -d '{
    "publicKey": "<generated_public_key>",
    "keyId": "<generated_key_id>",
    "deviceFingerprint": "test_fingerprint",
    "label": "Production Test Device"
  }'
```

### Step 4: Verify Signature

Use the sign-request script:

```bash
node scripts/sign-request.js \
  --api-key "kg_test_production_key" \
  --key-id "<your_key_id>" \
  --private-key "<your_private_key>" \
  --body '{"test":"production"}'
```

Copy and run the generated cURL command.

---

## Monitoring & Maintenance

### Health Checks

Add a health check endpoint to your infrastructure:

```bash
curl http://localhost:3000/health
```

### Database Cleanup

Run periodic nonce cleanup:

```typescript
// Add to your cron job or scheduler
import { KeyGuardService } from './modules/keyguard/services/keyguard.service';

// Run every 5 minutes
schedule.scheduleJob('*/5 * * * *', async () => {
  const service = app.get(KeyGuardService);
  await service.cleanupExpiredNonces();
});
```

Or via SQL:

```sql
-- Delete expired nonces (run every 5 minutes)
DELETE FROM nonces WHERE expires_at < NOW();
```

### Logging

Monitor these events:
- Failed verification attempts
- Enrollment requests
- Device revocations
- Replay attack attempts (nonce reuse)
- Timestamp violations

### Metrics

Track:
- Enrollment rate
- Verification success/failure rate
- Average verification time
- Active devices count
- Failed attempts per device

---

## Troubleshooting

### Issue: "Prisma schema drift detected"

**Solution:**

```bash
# Option 1: Reset (development only)
npx prisma migrate reset

# Option 2: Create migration from current state
npx prisma migrate dev --name sync_schema

# Option 3: Resolve manually
npx prisma migrate resolve --applied <migration_id>
```

### Issue: "Cannot find module '@prisma/client'"

**Solution:**

```bash
npm run prisma:generate
```

### Issue: "Database connection failed"

**Solution:**
- Check DATABASE_URL in .env
- Verify database is running
- Check firewall/network access
- Test connection: `npx prisma db pull`

### Issue: "Verification always returns false"

**Causes:**
- Payload construction mismatch
- Body hash computed incorrectly
- Signature format issue
- Clock skew (timestamp)

**Solution:**
- Enable debug logging
- Compare canonical payloads
- Verify raw body capture is working
- Check server/client timestamps

### Issue: "Nonce already used" on first request

**Causes:**
- Test request was successful
- Duplicate request
- Nonce cleanup not running

**Solution:**
- Generate fresh nonce for each request
- Check nonce expiration in database
- Verify cleanup is running

---

## Security Checklist

Before going to production:

- [ ] Change default API keys
- [ ] Use HTTPS/TLS for all connections
- [ ] Hash API keys in database (implement in Phase 2)
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerts
- [ ] Configure CORS properly
- [ ] Review and restrict database permissions
- [ ] Enable audit logging
- [ ] Set up backup strategy
- [ ] Test disaster recovery
- [ ] Document incident response plan
- [ ] Perform security audit
- [ ] Test against OWASP Top 10

---

## Performance Optimization

### Database Indexes

Already configured:
- `api_keys.key_prefix` (UNIQUE)
- `devices.apiKeyId_keyId` (UNIQUE)
- `nonces.apiKeyId_keyId_nonce` (UNIQUE)
- `nonces.expiresAt` (INDEX)

### Caching (Phase 2)

Consider adding Redis for:
- Nonce storage (faster than DB)
- Device lookup caching
- API key validation caching

### Connection Pooling

Configure in Prisma:

```typescript
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")

  // Add connection pooling
  pool_timeout = 10
  connection_limit = 20
}
```

---

## Backup Strategy

### Database Backups

```bash
# Backup
pg_dump -h localhost -U keyguard keyguard > backup.sql

# Restore
psql -h localhost -U keyguard keyguard < backup.sql
```

### Automated Backups

Set up daily backups:

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -U keyguard keyguard > "backup_$DATE.sql"
# Upload to S3 or backup storage
```

---

## Rollback Procedure

If you need to rollback:

1. **Stop the application**
   ```bash
   pm2 stop keyguard-api
   ```

2. **Restore database backup**
   ```bash
   psql -h localhost -U keyguard keyguard < backup_before_deployment.sql
   ```

3. **Deploy previous version**
   ```bash
   git checkout previous-tag
   npm install
   npm run build
   npm run start:prod
   ```

4. **Verify functionality**
   ```bash
   npm run test:e2e
   ```

---

## Support & Resources

- **Documentation:** See `BACKEND_PHASE1_README.md`
- **Testing Guide:** See `TESTING_GUIDE.md`
- **Implementation Details:** See `IMPLEMENTATION_SUMMARY.md`
- **Status:** See `KEYGUARD_PHASE1_STATUS.md`

---

## Summary

This deployment guide covers:
- ✅ Development setup
- ✅ Production deployment
- ✅ Docker deployment
- ✅ Database migrations
- ✅ Testing procedures
- ✅ Monitoring setup
- ✅ Troubleshooting
- ✅ Security checklist
- ✅ Backup/recovery

**Follow these steps for a successful deployment!**
