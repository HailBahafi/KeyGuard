# Database Migration Guide

## Overview

This guide helps you migrate the database to support all the new KeyGuard features.

## Option 1: Fresh Setup (Recommended for Development)

If you're starting fresh or can afford to lose existing data:

```bash
# Navigate to backend directory
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations (creates all tables)
npx prisma migrate dev --name initial_keyguard_setup

# Seed initial data (optional)
npx prisma db seed
```

## Option 2: Manual Migration (for Production)

If you need to preserve existing data, follow these steps carefully:

### Step 1: Backup Current Database

```bash
# PostgreSQL backup
pg_dump -U your_user -d your_database > backup_$(date +%Y%m%d).sql
```

### Step 2: Create Migration

```bash
# This will detect schema changes and create a migration
npx prisma migrate dev --create-only --name add_keyguard_features
```

### Step 3: Review and Apply

```bash
# Review the generated migration SQL in prisma/migrations/

# Apply the migration
npx prisma migrate deploy
```

## Schema Changes Summary

### New Tables

1. **audit_logs** - Stores all system audit logs
2. **settings** - Stores system settings as key-value pairs
3. **enrollment_codes** - Stores device enrollment codes
4. **admin_api_keys** - Stores admin API keys

### Modified Tables

1. **users**
   - Removed: `username`, `phone`
   - Updated: `role` enum (ADMIN, USER instead of ADMIN, SELLER, BUYER)
   - Added: `name` field

2. **api_keys**
   - Added: `provider`, `environment`, `description`, `maskedValue`, `fullValue`, `usageCount`, `expiresAt`, `lastUsed`
   - Updated: `status` enum (ACTIVE, IDLE, EXPIRED, REVOKED)

3. **devices**
   - Added: `name`, `platform`, `ownerName`, `ownerEmail`, `ipAddress`, `location`, `fingerprintHash`, `totalCalls`, `keysAccessed`
   - Updated: `status` enum (ACTIVE, PENDING, SUSPENDED, REVOKED)
   - Changed: `lastSeenAt` → `lastSeen`
   - Made optional: `keyId`, `publicKeySpkiBase64` (for backward compatibility)

### New Enums

- `ApiKeyProvider`: OPENAI, ANTHROPIC, GOOGLE, AZURE
- `ApiKeyEnvironment`: PRODUCTION, DEVELOPMENT, STAGING
- `AuditLogSeverity`: INFO, WARNING, CRITICAL
- `AuditLogStatus`: SUCCESS, FAILURE
- `ActorType`: USER, DEVICE, SYSTEM

## Data Migration Scripts

### Migrate Existing Users

If you have existing users with `username` field:

```sql
-- Add name field from username or email
UPDATE users
SET name = COALESCE(username, SPLIT_PART(email, '@', 1))
WHERE name IS NULL;

-- Update roles
UPDATE users SET role = 'ADMIN' WHERE role = 'ADMIN';
UPDATE users SET role = 'USER' WHERE role IN ('SELLER', 'BUYER');
```

### Migrate Existing API Keys

If you have existing API keys:

```sql
-- Add required fields with defaults
UPDATE api_keys
SET
  provider = 'OPENAI',  -- Set appropriate default
  environment = 'PRODUCTION',
  maskedValue = CONCAT(LEFT(keyPrefix, 8), '...', RIGHT(keyPrefix, 4)),
  fullValue = 'LEGACY_KEY_NEEDS_UPDATE',  -- Mark for manual update
  usageCount = 0
WHERE provider IS NULL;
```

### Migrate Existing Devices

If you have existing devices:

```sql
-- Add required fields with defaults
UPDATE devices
SET
  name = CONCAT('Device ', id),
  ownerName = 'Legacy User',
  ownerEmail = 'legacy@example.com',
  ipAddress = '0.0.0.0',
  location = 'Unknown',
  totalCalls = 0,
  keysAccessed = 0
WHERE name IS NULL;

-- Rename lastSeenAt to lastSeen (if needed)
-- This depends on your specific migration
```

## Verification

After migration, verify the database:

```bash
# Check all tables exist
npx prisma studio

# Or use psql
psql -U your_user -d your_database -c "\dt"
```

### Expected Tables

- users
- api_keys
- devices
- nonces
- audit_logs
- settings
- enrollment_codes
- admin_api_keys

## Rollback

If something goes wrong:

```bash
# Restore from backup
psql -U your_user -d your_database < backup_YYYYMMDD.sql

# Or rollback last migration
npx prisma migrate resolve --rolled-back <migration_name>
```

## Seeding Initial Data

Create a default admin user and test data:

```typescript
// Add to prisma/seeders/index.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@keyguard.io' },
    update: {},
    create: {
      email: 'admin@keyguard.io',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create test API key
  await prisma.apiKey.create({
    data: {
      name: 'Test OpenAI Key',
      provider: 'OPENAI',
      environment: 'DEVELOPMENT',
      maskedValue: 'kg_test_...abc123',
      fullValue: 'kg_test_1234567890abcdef',
      status: 'ACTIVE',
    },
  });

  // Create default settings
  await prisma.settings.createMany({
    data: [
      {
        key: 'general',
        value: {
          instanceName: 'KeyGuard',
          adminEmail: 'admin@keyguard.io',
          timezone: 'UTC',
          baseUrl: 'http://localhost:3000',
        },
      },
      {
        key: 'security',
        value: {
          sessionTimeoutSeconds: 3600,
          enforce2FA: false,
          ipWhitelist: [],
        },
      },
    ],
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run with:
```bash
npx ts-node prisma/seeders/index.ts
```

## Troubleshooting

### Error: "P2002: Unique constraint failed"

**Solution**: Check for duplicate entries before migration
```sql
SELECT email, COUNT(*)
FROM users
GROUP BY email
HAVING COUNT(*) > 1;
```

### Error: "Column does not exist"

**Solution**: Ensure you've run `npx prisma generate` after schema changes

### Error: "Migration failed"

**Solution**: Check the migration SQL for syntax errors, review and fix manually

## Production Deployment

1. **Test migration on staging first**
2. **Schedule maintenance window**
3. **Backup database**
4. **Run migration with monitoring**
5. **Verify all endpoints work**
6. **Rollback if issues occur**

## Support

For migration issues:
1. Check Prisma migration logs
2. Review database logs
3. Test on a database copy first
4. Contact database administrator if needed

---

**Last Updated**: December 2, 2025
