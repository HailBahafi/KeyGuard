import { ApiProperty } from '@nestjs/swagger';

export class ApiKeyDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['openai', 'anthropic', 'google', 'azure'] })
  provider: 'openai' | 'anthropic' | 'google' | 'azure';

  @ApiProperty({ enum: ['active', 'idle', 'expired', 'revoked'] })
  status: 'active' | 'idle' | 'expired' | 'revoked';

  @ApiProperty({ enum: ['production', 'development', 'staging'] })
  environment: 'production' | 'development' | 'staging';

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ nullable: true })
  lastUsed: string | null;

  @ApiProperty({ nullable: true })
  expiresAt: string | null;

  @ApiProperty()
  deviceCount: number;

  @ApiProperty()
  usageCount: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  maskedValue: string;
}

export class PaginationMeta {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  pages: number;
}

export class KeysPaginationResponseDto {
  @ApiProperty({ type: [ApiKeyDto] })
  keys: ApiKeyDto[];

  @ApiProperty({ type: PaginationMeta })
  pagination: PaginationMeta;
}

export class CreateKeyResponseDto {
  @ApiProperty({ type: ApiKeyDto })
  key: ApiKeyDto;
}

export class RevokeKeyResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;
}
