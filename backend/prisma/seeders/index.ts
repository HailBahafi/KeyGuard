import { PrismaClient } from '../../src/generated/client';
import * as bcrypt from 'bcryptjs';
import { settings } from '@/src/common/config';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: settings.DATABASE_URL,
    },
  },
});

/**
 * Database Seeder
 * 
 * Creates initial admin user and default settings.
 * 
 * SECURITY: In production, you MUST set ADMIN_SEED_PASSWORD environment variable.
 * The seeder will fail in production if using the default password.
 */
async function seeder() {
  console.log('🌱 Seeding database...');

  // Get admin password from environment or use default for development
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  const isProduction = process.env.NODE_ENV === 'production';

  // Security check: fail in production if no password is set
  if (isProduction && !adminPassword) {
    console.error('❌ SECURITY ERROR: ADMIN_SEED_PASSWORD is required in production!');
    console.error('   Set it with: export ADMIN_SEED_PASSWORD="$(openssl rand -base64 24)"');
    process.exit(1);
  }

  // Warn in development if using default password
  if (!adminPassword) {
    console.warn('⚠️  WARNING: Using default seed password for development.');
    console.warn('   Set ADMIN_SEED_PASSWORD environment variable for custom password.');
    console.warn('   NEVER use default credentials in production!\n');
  }

  const passwordToHash = adminPassword || 'admin123';
  const hashedPassword = await bcrypt.hash(passwordToHash, 12);

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

  if (adminPassword) {
    console.log('✅ Admin user created: admin@keyguard.io (password from ADMIN_SEED_PASSWORD)');
  } else {
    console.log('✅ Admin user created: admin@keyguard.io (default dev password)');
  }

  // Create default settings
  await prisma.settings.upsert({
    where: { key: 'general' },
    update: {},
    create: {
      key: 'general',
      value: {
        instanceName: 'KeyGuard',
        adminEmail: 'admin@keyguard.io',
        timezone: 'UTC',
        baseUrl: 'http://localhost:3000',
      } as any,
    },
  });

  await prisma.settings.upsert({
    where: { key: 'security' },
    update: {},
    create: {
      key: 'security',
      value: {
        sessionTimeoutSeconds: 3600,
        enforce2FA: false,
        ipWhitelist: [],
      } as any,
    },
  });

  console.log('✅ Default settings created');
  console.log('🎉 Seeding completed!');
}

seeder()
  .catch(e => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
