import { ApiKey } from '@/src/generated/client';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import dayjs from 'dayjs';
import { Hashing } from 'src/common/utils/hashing.util';
import { PrismaService } from 'src/core/database/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateKeyDto } from './dto/create-key.dto';
import { ApiKeyDto, KeysPaginationResponseDto } from './dto/key-response.dto';
import { QueryKeysDto } from './dto/query-keys.dto';

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) { }

  async listKeys(query: QueryKeysDto): Promise<KeysPaginationResponseDto> {
    const { page = 1, limit = 20, status, provider, environment, search } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Status filter
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    // Provider filter
    if (provider && provider !== 'all') {
      where.provider = provider.toUpperCase();
    }

    // Environment filter
    if (environment && environment !== 'all') {
      where.environment = environment.toUpperCase();
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count and keys
    const [total, keys] = await Promise.all([
      this.prisma.prisma.apiKey.count({ where }),
      this.prisma.prisma.apiKey.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { devices: true },
          },
        },
      }),
    ]);

    const mappedKeys: ApiKeyDto[] = keys.map((key: ApiKey & { _count: { devices: number } }) => ({
      id: key.id,
      name: key.name,
      provider: key.provider.toLowerCase() as 'openai' | 'anthropic' | 'google' | 'azure',
      status: this.computeKeyStatus(key),
      environment: key.environment.toLowerCase() as 'production' | 'development' | 'staging',
      createdAt: key.createdAt.toISOString(),
      lastUsed: key.lastUsed ? key.lastUsed.toISOString() : null,
      expiresAt: key.expiresAt ? key.expiresAt.toISOString() : null,
      deviceCount: key._count?.devices ?? 0,
      usageCount: key.usageCount,
      description: key.description ?? '',
      maskedValue: key.maskedValue,
    }));

    const pages = Math.ceil(total / limit);

    return {
      keys: mappedKeys,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    };
  }

  async createKey(createKeyDto: CreateKeyDto, apiKey: string): Promise<{ key: ApiKeyDto; rawKey: string }> {
    // Check if key with same name already exists
    const existingKey = await this.prisma.prisma.apiKey.findFirst({
      where: { name: createKeyDto.name },
    });

    if (existingKey) {
      throw new ConflictException('API key with this name already exists');
    }

    // Validate expiration date
    if (createKeyDto.expiresAt) {
      const expirationDate = dayjs(createKeyDto.expiresAt);
      if (!expirationDate.isValid()) {
        throw new BadRequestException('Invalid expiration date format');
      }
      if (expirationDate.isBefore(dayjs())) {
        throw new BadRequestException('Expiration date must be in the future');
      }
    }

    // Generate full key value (the raw API key that user will receive once)
    const rawKey = this.generateApiKeyValue();
    const maskedValue = this.maskApiKey(rawKey);

    // Hash the key with bcrypt for secure storage - never store plain text
    const [hashedValue, hashedApiKey] = await Promise.all([
      Hashing.hash(rawKey),
      Hashing.hash(apiKey),
    ]);

    // Create key with hashed value (not plain text)
    const key = await this.prisma.prisma.apiKey.create({
      data: {
        name: createKeyDto.name,
        provider: createKeyDto.provider.toUpperCase() as any,
        environment: createKeyDto.environment.toUpperCase() as any,
        description: createKeyDto.description ?? null,
        expiresAt: createKeyDto.expiresAt ? new Date(createKeyDto.expiresAt) : null,
        fullValue: hashedValue, // Store bcrypt hash, NOT the raw key
        maskedValue,
        status: 'ACTIVE',
        apiKey: hashedApiKey,
      },
      include: {
        _count: {
          select: { devices: true },
        },
      },
    });

    // Log API key creation
    try {
      await this.auditLogsService.createLog({
        event: 'key.created',
        severity: 'info',
        status: 'success',
        actorId: 'system',
        actorName: 'System',
        actorType: 'system',
        actorIp: '0.0.0.0',
        targetId: key.id,
        targetName: key.name,
        targetType: 'api_key',
        metadata: {
          provider: key.provider,
          environment: key.environment,
          expiresAt: key.expiresAt,
        },
        apiKeyId: key.id,
      });
    } catch (error) {
      this.logger.error(`Failed to create audit log for API key creation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Return both the key metadata and the raw key (only time it's available)
    return {
      key: {
        id: key.id,
        name: key.name,
        provider: key.provider.toLowerCase() as 'openai' | 'anthropic' | 'google' | 'azure',
        status: this.computeKeyStatus(key),
        environment: key.environment.toLowerCase() as 'production' | 'development' | 'staging',
        createdAt: key.createdAt.toISOString(),
        lastUsed: null,
        expiresAt: key.expiresAt ? key.expiresAt.toISOString() : null,
        deviceCount: 0,
        usageCount: 0,
        description: key.description ?? '',
        maskedValue: key.maskedValue,
      },
      rawKey, // CRITICAL: Only returned here, NEVER in GET requests
    };
  }

  async revokeKey(id: string): Promise<{ success: boolean; message: string }> {
    const key = await this.prisma.prisma.apiKey.findUnique({
      where: { id },
    });

    if (!key) {
      throw new NotFoundException('API key not found');
    }

    if (key.status === 'REVOKED') {
      throw new BadRequestException('API key is already revoked');
    }

    await this.prisma.prisma.apiKey.update({
      where: { id },
      data: { status: 'REVOKED' },
    });

    // Log API key revocation
    try {
      await this.auditLogsService.createLog({
        event: 'key.revoked',
        severity: 'warning',
        status: 'success',
        actorId: 'system',
        actorName: 'System',
        actorType: 'system',
        actorIp: '0.0.0.0',
        targetId: key.id,
        targetName: key.name,
        targetType: 'api_key',
        metadata: {
          previousStatus: key.status,
          provider: key.provider,
        },
        apiKeyId: key.id,
      });
    } catch (error) {
      this.logger.error(`Failed to create audit log for API key revocation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      success: true,
      message: 'API key revoked successfully',
    };
  }

  private computeKeyStatus(key: any): 'active' | 'idle' | 'expired' | 'revoked' {
    if (key.status === 'REVOKED') {
      return 'revoked';
    }

    // Check if expired
    if (key.expiresAt && dayjs(key.expiresAt).isBefore(dayjs())) {
      return 'expired';
    }

    // Check if idle (not used in last 30 days)
    if (key.lastUsed && dayjs().diff(dayjs(key.lastUsed), 'day') > 30) {
      return 'idle';
    }

    return 'active';
  }

  private generateApiKeyValue(): string {
    // Generate a random API key value
    // Format: kg_<env>_<random>
    const randomPart = Array.from({ length: 32 }, () =>
      Math.random().toString(36).charAt(2),
    ).join('');
    return `kg_${Date.now()}_${randomPart}`;
  }

  private maskApiKey(fullKey: string): string {
    // Mask the API key, showing only first 8 and last 4 characters
    if (fullKey.length <= 12) {
      return fullKey;
    }
    const start = fullKey.substring(0, 8);
    const end = fullKey.substring(fullKey.length - 4);
    return `${start}...${end}`;
  }
}
