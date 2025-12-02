import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/core/database/prisma.service';
import { PrismaModule } from '../src/core/database/prisma.module';

describe('Database Connection (e2e)', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
    }).compile();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prisma.prisma.$disconnect();
  });

  it('should connect to database', async () => {
    const result = await prisma.prisma.$queryRaw`SELECT 1 as result`;
    expect(result).toBeDefined();
  });

  it('should have prisma client initialized', () => {
    expect(prisma).toBeDefined();
    expect(prisma.prisma).toBeDefined();
  });
});
