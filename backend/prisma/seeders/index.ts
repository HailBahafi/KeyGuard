import { settings } from '@/src/common/config';
import { PrismaClient } from '../../src/generated/client';
import { usersSeeder } from './users.seeder';
import { seedApiKeys } from './api-keys.seeder';
const prisma = new PrismaClient({
  accelerateUrl: settings.DATABASE_URL
});
async function seeder() {
  await seedApiKeys();
  await usersSeeder(prisma);
}
seeder()
  .catch(e => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
