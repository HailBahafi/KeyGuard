import { isDevelopment } from '@/src/common/utils/is-environment.util';
import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { withAccelerate } from '@prisma/extension-accelerate';
import { withOptimize } from '@prisma/extension-optimize';
import settings from 'src/common/config/index';
import { PrismaClient } from 'src/generated/client';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  public readonly prisma: PrismaClient;

  constructor() {
    this.prisma = PrismaService.createPrismaClient();
  }

  private static createPrismaClient() {
    const isDev = isDevelopment();
    const isTest = process.env.NODE_ENV === 'TEST';
    const databaseUrl = settings.DATABASE_URL;

    // Check if using Prisma Accelerate (URL starts with prisma://)
    const useAccelerate = databaseUrl?.startsWith('prisma://') || databaseUrl?.startsWith('prisma+postgres://');

    let client: any;

    try {
      if (useAccelerate && !isTest) {
        // Use Accelerate in production/development
        client = new PrismaClient({
          log: isDev ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'],
          errorFormat: 'pretty',
          accelerateUrl: databaseUrl,
        });

        const optimizeApiKey = settings.OPTIMIZE_API_KEY;
        if (isDev && optimizeApiKey) {
          client = client.$extends(withOptimize({ apiKey: optimizeApiKey }));
        }

        return client.$extends(withAccelerate());
      } else {
        // For tests or regular PostgreSQL URLs
        // Pass the URL as accelerateUrl to satisfy Prisma 7 requirement
        // but don't apply the Accelerate extension
        client = new PrismaClient({
          log: isDev || isTest ? ['query', 'warn', 'error'] : ['warn', 'error'],
          errorFormat: 'pretty',
          accelerateUrl: databaseUrl || 'postgresql://localhost:5432/keyguard',
        });

        return client;
      }
    } catch (error) {
      console.error('Failed to create Prisma client:', error);
      // Fallback to basic client
      return new PrismaClient({
        log: ['error'],
        errorFormat: 'pretty',
        accelerateUrl: databaseUrl || 'postgresql://localhost:5432/keyguard',
      });
    }
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.prisma.$connect();
    } catch (error) {
      console.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }
}
