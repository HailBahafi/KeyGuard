import { ApiProperty } from '@nestjs/swagger';

export class GeneralSettingsDto {
  @ApiProperty()
  instanceName: string;

  @ApiProperty()
  adminEmail: string;

  @ApiProperty()
  timezone: string;

  @ApiProperty()
  baseUrl: string;
}

export class SecuritySettingsDto {
  @ApiProperty()
  sessionTimeoutSeconds: number;

  @ApiProperty()
  enforce2FA: boolean;

  @ApiProperty({ type: [String] })
  ipWhitelist: string[];
}

export class NotificationSettingsDto {
  @ApiProperty()
  smtpHost: string;

  @ApiProperty()
  smtpPort: number;

  @ApiProperty()
  smtpUsername: string;

  @ApiProperty()
  smtpPassword: string;

  @ApiProperty()
  emailAlerts: boolean;
}

export class AdminApiKeyDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  key: string;

  @ApiProperty({ type: [String] })
  scope: string[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ nullable: true })
  lastUsedAt: string | null;
}

export class ApiSettingsDto {
  @ApiProperty({ type: [AdminApiKeyDto] })
  keys: AdminApiKeyDto[];
}

export class BackupSettingsDto {
  @ApiProperty()
  logRetentionDays: number;

  @ApiProperty()
  autoBackupEnabled: boolean;

  @ApiProperty({ enum: ['daily', 'weekly', 'monthly'] })
  autoBackupFrequency: 'daily' | 'weekly' | 'monthly';

  @ApiProperty({ nullable: true })
  lastBackupAt: string | null;
}

export class SettingsStateDto {
  @ApiProperty({ type: GeneralSettingsDto })
  general: GeneralSettingsDto;

  @ApiProperty({ type: SecuritySettingsDto })
  security: SecuritySettingsDto;

  @ApiProperty({ type: NotificationSettingsDto })
  notifications: NotificationSettingsDto;

  @ApiProperty({ type: ApiSettingsDto })
  api: ApiSettingsDto;

  @ApiProperty({ type: BackupSettingsDto })
  backup: BackupSettingsDto;
}

export class UpdateSettingsResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: any;
}

export class TestSMTPResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;
}

export class GenerateApiKeyResponseDto {
  @ApiProperty({ type: AdminApiKeyDto })
  key: AdminApiKeyDto;

  @ApiProperty()
  rawKey: string;
}

export class RevokeApiKeyResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;
}

export class DownloadBackupResponseDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  filename: string;
}
