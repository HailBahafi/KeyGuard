import { PrismaClient } from '../../src/generated/client';
import { settings } from '@/src/common/config';


export async function seedApiKeys(): Promise<void> {
  // Create a new PrismaClient instance for seeding
  const prisma = new PrismaClient({
    log: ['error'],
    accelerateUrl: settings.DATABASE_URL,
  });
  try {
    // eslint-disable-next-line no-console
    console.log('Seeding API keys...');
    const apiKeys = [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        keyPrefix: 'kg_prod',
        name: 'Production Project',
        status: 'ACTIVE' as const,
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        keyPrefix: 'kg_dev',
        name: 'Development Project',
        status: 'ACTIVE' as const,
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174003',
        keyPrefix: 'kg_test',
        name: 'Test Project',
        status: 'ACTIVE' as const,
      },
    ];
    for (const apiKey of apiKeys) {
      await prisma.apiKey.upsert({
        where: { id: apiKey.id },
        update: apiKey,
        create: apiKey,
      });
    }
    // eslint-disable-next-line no-console
    console.log(`✓ Seeded ${apiKeys.length} API keys`);
  } finally {
    await prisma.$disconnect();
  }
}
