import {
  IsString,
  IsEmail,
  IsBoolean,
  IsInt,
  IsEnum,
  IsArray,
  Min,
  Max,
  Length,
  Matches,
  IsUrl,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateGeneralSettingsDto {
  @ApiProperty({ minLength: 3, maxLength: 50 })
  @IsString()
  @Length(3, 50)
  instanceName: string;

  @ApiProperty()
  @IsEmail()
  adminEmail: string;

  @ApiProperty()
  @IsString()
  timezone: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUrl()
  baseUrl: string;
}

export class UpdateSecuritySettingsDto {
  @ApiProperty({ minimum: 300, maximum: 2592000 })
  @IsInt()
  @Min(300)
  @Max(2592000)
  sessionTimeoutSeconds: number;

  @ApiProperty()
  @IsBoolean()
  enforce2FA: boolean;

  @ApiProperty({ type: [String] })
  @IsArray()
  @Matches(/^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/, {
    each: true,
    message: 'Each IP must be a valid IP address or CIDR notation',
  })
  ipWhitelist: string[];
}

export class UpdateNotificationSettingsDto {
  @ApiProperty()
  @IsString()
  smtpHost: string;

  @ApiProperty({ minimum: 1, maximum: 65535 })
  @IsInt()
  @Min(1)
  @Max(65535)
  smtpPort: number;

  @ApiProperty()
  @IsString()
  smtpUsername: string;

  @ApiProperty()
  @IsString()
  smtpPassword: string;

  @ApiProperty()
  @IsBoolean()
  emailAlerts: boolean;
}

export class GenerateApiKeyDto {
  @ApiProperty({ minLength: 3, maxLength: 50 })
  @IsString()
  @Length(3, 50)
  name: string;

  @ApiProperty({ type: [String], description: "At least one scope (e.g., ['read', 'write'])" })
  @IsArray()
  @IsString({ each: true })
  scope: string[];
}
