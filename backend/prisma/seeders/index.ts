import { PrismaClient } from '../../src/generated/client';
import * as bcrypt from 'bcryptjs';
import { settings } from '@/src/common/config';

const prisma = new PrismaClient({
  accelerateUrl: settings.DATABASE_URL
});

async function seeder() {
  console.log('🌱 Seeding database...');

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

  console.log('✅ Admin user created: admin@keyguard.io / admin123');

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
