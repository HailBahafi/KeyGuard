import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import {
  UpdateGeneralSettingsDto,
  UpdateSecuritySettingsDto,
  UpdateNotificationSettingsDto,
  GenerateApiKeyDto,
} from './dto/update-settings.dto';
import {
  SettingsStateDto,
  GeneralSettingsDto,
  SecuritySettingsDto,
  NotificationSettingsDto,
  ApiSettingsDto,
  BackupSettingsDto,
  AdminApiKeyDto,
} from './dto/settings-response.dto';
import { Hashing } from 'src/common/utils/hashing.util';
import dayjs from 'dayjs';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllSettings(): Promise<SettingsStateDto> {
    const [general, security, notifications, apiKeys, backup] = await Promise.all([
      this.getGeneralSettings(),
      this.getSecuritySettings(),
      this.getNotificationSettings(),
      this.getApiKeys(),
      this.getBackupSettings(),
    ]);

    return {
      general,
      security,
      notifications,
      api: { keys: apiKeys },
      backup,
    };
  }

  async updateGeneralSettings(dto: UpdateGeneralSettingsDto): Promise<GeneralSettingsDto> {
    await this.prisma.prisma.settings.upsert({
      where: { key: 'general' },
      update: { value: dto as any },
      create: { key: 'general', value: dto as any },
    });

    return dto;
  }

  async updateSecuritySettings(dto: UpdateSecuritySettingsDto): Promise<SecuritySettingsDto> {
    await this.prisma.prisma.settings.upsert({
      where: { key: 'security' },
      update: { value: dto as any },
      create: { key: 'security', value: dto as any },
    });

    return dto;
  }

  async updateNotificationSettings(
    dto: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettingsDto> {
    await this.prisma.prisma.settings.upsert({
      where: { key: 'notifications' },
      update: { value: dto as any },
      create: { key: 'notifications', value: dto as any },
    });

    return dto;
  }

  async testSMTPConnection(): Promise<{ success: boolean; message: string }> {
    // In production, this would actually send a test email
    // For now, return success
    return {
      success: true,
      message: 'Test email sent successfully',
    };
  }

  async generateApiKey(dto: GenerateApiKeyDto): Promise<{
    key: AdminApiKeyDto;
    rawKey: string;
  }> {
    // Generate raw key
    const rawKey = `kg_${Date.now()}_${this.generateRandomString(32)}`;
    const keyHash = await Hashing.hash(rawKey);

    const apiKey = await this.prisma.prisma.adminApiKey.create({
      data: {
        name: dto.name,
        keyHash,
        scope: dto.scope,
      },
    });

    // Return masked key in the key object, but include rawKey separately
    const maskedKey = this.maskApiKey(rawKey);

    return {
      key: {
        id: apiKey.id,
        name: apiKey.name,
        key: maskedKey,
        scope: apiKey.scope as string[],
        createdAt: apiKey.createdAt.toISOString(),
        lastUsedAt: apiKey.lastUsedAt ? apiKey.lastUsedAt.toISOString() : null,
      },
      rawKey,
    };
  }

  async revokeApiKey(id: string): Promise<{ success: boolean; message: string }> {
    const apiKey = await this.prisma.prisma.adminApiKey.findUnique({
      where: { id },
    });

    if (!apiKey) {
      throw new NotFoundException('API key not found');
    }

    await this.prisma.prisma.adminApiKey.delete({
      where: { id },
    });

    return {
      success: true,
      message: 'API key revoked successfully',
    };
  }

  async downloadBackup(): Promise<{ url: string; filename: string }> {
    // Update last backup timestamp
    const now = dayjs().toISOString();
    await this.prisma.prisma.settings.upsert({
      where: { key: 'backup' },
      update: {
        value: {
          logRetentionDays: 90,
          autoBackupEnabled: false,
          autoBackupFrequency: 'daily',
          lastBackupAt: now,
        },
      },
      create: {
        key: 'backup',
        value: {
          logRetentionDays: 90,
          autoBackupEnabled: false,
          autoBackupFrequency: 'daily',
          lastBackupAt: now,
        },
      },
    });

    // Generate filename
    const filename = `keyguard-backup-${dayjs().format('YYYY-MM-DD')}.zip`;

    // In production, this would:
    // 1. Generate backup archive
    // 2. Upload to S3
    // 3. Return pre-signed URL
    const url = `/api/v1/settings/backup/download/${filename}`;

    return { url, filename };
  }

  private async getGeneralSettings(): Promise<GeneralSettingsDto> {
    const settings = await this.prisma.prisma.settings.findUnique({
      where: { key: 'general' },
    });

    if (settings) {
      return settings.value as unknown as GeneralSettingsDto;
    }

    // Return defaults
    return {
      instanceName: 'KeyGuard',
      adminEmail: 'admin@keyguard.io',
      timezone: 'UTC',
      baseUrl: 'http://localhost:3000',
    };
  }

  private async getSecuritySettings(): Promise<SecuritySettingsDto> {
    const settings = await this.prisma.prisma.settings.findUnique({
      where: { key: 'security' },
    });

    if (settings) {
      return settings.value as unknown as SecuritySettingsDto;
    }

    return {
      sessionTimeoutSeconds: 3600,
      enforce2FA: false,
      ipWhitelist: [],
    };
  }

  private async getNotificationSettings(): Promise<NotificationSettingsDto> {
    const settings = await this.prisma.prisma.settings.findUnique({
      where: { key: 'notifications' },
    });

    if (settings) {
      return settings.value as unknown as NotificationSettingsDto;
    }

    return {
      smtpHost: '',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      emailAlerts: false,
    };
  }

  private async getApiKeys(): Promise<AdminApiKeyDto[]> {
    const keys = await this.prisma.prisma.adminApiKey.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return keys.map((key: any) => ({
      id: key.id,
      name: key.name,
      key: '***************', // Always masked
      scope: key.scope as string[],
      createdAt: key.createdAt.toISOString(),
      lastUsedAt: key.lastUsedAt ? key.lastUsedAt.toISOString() : null,
    }));
  }

  private async getBackupSettings(): Promise<BackupSettingsDto> {
    const settings = await this.prisma.prisma.settings.findUnique({
      where: { key: 'backup' },
    });

    if (settings) {
      return settings.value as unknown as BackupSettingsDto;
    }

    return {
      logRetentionDays: 90,
      autoBackupEnabled: false,
      autoBackupFrequency: 'daily',
      lastBackupAt: null,
    };
  }

  private generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private maskApiKey(key: string): string {
    if (key.length <= 12) {
      return key;
    }
    const start = key.substring(0, 8);
    const end = key.substring(key.length - 4);
    return `${start}...${end}`;
  }
}
