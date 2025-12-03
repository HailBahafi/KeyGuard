/* eslint-disable @typescript-eslint/no-unsafe-call */
/**
 * Note: ESLint unsafe-call rule is disabled for the Prisma extension
 * method calls which TypeScript cannot properly type due to the complex
 * extension type inference.
 */
import { isDevelopment } from '@/src/common/utils/is-environment.util';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { withAccelerate } from '@prisma/extension-accelerate';
import { withOptimize } from '@prisma/extension-optimize';
import settings from 'src/common/config/index';
import { PrismaClient } from 'src/generated/client';
// Type for the base Prisma client without extensions
type BasePrismaClient = InstanceType<typeof PrismaClient>;
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
    // Check if using Prisma Accelerate (URL starts with prisma://)
    const useAccelerate =
      databaseUrl?.startsWith('prisma://') || databaseUrl?.startsWith('prisma+postgres://');
    try {
      if (useAccelerate && !isTest) {
        // Use Accelerate in production/development
        const client = new PrismaClient({
          log: isDev ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
          errorFormat: 'pretty',
          accelerateUrl: databaseUrl,
        });
        const optimizeApiKey = settings.OPTIMIZE_API_KEY;
        if (isDev && optimizeApiKey) {
          return client
            .$extends(withOptimize({ apiKey: optimizeApiKey }))
            .$extends(withAccelerate()) as unknown as BasePrismaClient;
        }
        return client.$extends(withAccelerate()) as unknown as BasePrismaClient;
      } else {
        // For tests or regular PostgreSQL URLs
        // Pass the URL as accelerateUrl to satisfy Prisma 7 requirement
        // but don't apply the Accelerate extension
        return new PrismaClient({
          log: isDev || isTest ? ['query', 'warn', 'error'] : ['warn', 'error'],
          errorFormat: 'pretty',
          accelerateUrl: databaseUrl ?? 'postgresql://localhost:5432/keyguard',
        });
      }
    } catch (error) {
      const logger = new Logger(PrismaService.name);
      logger.error('Failed to create Prisma client:', error);
      // Fallback to basic client
      return new PrismaClient({
        log: ['error'],
        errorFormat: 'pretty',
        accelerateUrl: databaseUrl ?? 'postgresql://localhost:5432/keyguard',
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
