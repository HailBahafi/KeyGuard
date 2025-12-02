import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { CreateKeyDto } from './dto/create-key.dto';
import { QueryKeysDto } from './dto/query-keys.dto';
import { ApiKeyDto, KeysPaginationResponseDto } from './dto/key-response.dto';
import dayjs from 'dayjs';

@Injectable()
export class ApiKeysService {
  constructor(private readonly prisma: PrismaService) {}

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

    const mappedKeys: ApiKeyDto[] = keys.map((key: any) => ({
      id: key.id,
      name: key.name,
      provider: key.provider.toLowerCase() as any,
      status: this.computeKeyStatus(key),
      environment: key.environment.toLowerCase() as any,
      created: key.createdAt.toISOString(),
      lastUsed: key.lastUsed ? key.lastUsed.toISOString() : null,
      expiresAt: key.expiresAt ? key.expiresAt.toISOString() : null,
      deviceCount: key._count.devices,
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

  async createKey(createKeyDto: CreateKeyDto): Promise<ApiKeyDto> {
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

    // Generate full key value (this would be the actual API key)
    const fullValue = this.generateApiKeyValue();
    const maskedValue = this.maskApiKey(fullValue);

    // Create key
    const key = await this.prisma.prisma.apiKey.create({
      data: {
        name: createKeyDto.name,
        provider: createKeyDto.provider.toUpperCase() as any,
        environment: createKeyDto.environment.toUpperCase() as any,
        description: createKeyDto.description ?? null,
        expiresAt: createKeyDto.expiresAt ? new Date(createKeyDto.expiresAt) : null,
        fullValue, // In production, this should be encrypted
        maskedValue,
        status: 'ACTIVE',
      },
      include: {
        _count: {
          select: { devices: true },
        },
      },
    });

    return {
      id: key.id,
      name: key.name,
      provider: key.provider.toLowerCase() as any,
      status: this.computeKeyStatus(key),
      environment: key.environment.toLowerCase() as any,
      created: key.createdAt.toISOString(),
      lastUsed: null,
      expiresAt: key.expiresAt ? key.expiresAt.toISOString() : null,
      deviceCount: 0,
      usageCount: 0,
      description: key.description ?? '',
      maskedValue: key.maskedValue,
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
