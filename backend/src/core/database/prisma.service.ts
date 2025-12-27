 
/**
 * Note: ESLint unsafe-call rule is disabled for the Prisma extension
 * method calls which TypeScript cannot properly type due to the complex
 * extension type inference.
 */
import { isDevelopment } from '@/src/common/utils/is-environment.util';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import settings from 'src/common/config/index';

// Type for the base Prisma client without extensions
type BasePrismaClient = PrismaClient;

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public readonly prisma: BasePrismaClient;

  constructor() {
    this.prisma = PrismaService.createPrismaClient();
  }

  private static createPrismaClient(): BasePrismaClient {
    const isDev = isDevelopment();
    const isTest = process.env.NODE_ENV === 'TEST';
    const databaseUrl = settings.DATABASE_URL;

    try {
      // Create Prisma client with datasource URL override
      return new PrismaClient({
        log: isDev || isTest ? ['query', 'warn', 'error'] : ['warn', 'error'],
        errorFormat: 'pretty',
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
      });
    } catch (error) {
      const logger = new Logger(PrismaService.name);
      logger.error('Failed to create Prisma client:', error);
      // Fallback to basic client
      return new PrismaClient({
        log: ['error'],
        errorFormat: 'pretty',
      });
    }
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.prisma.$connect();
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
