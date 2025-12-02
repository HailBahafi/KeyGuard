import { IsOptional, IsEnum, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryKeysDto {
  @ApiProperty({ required: false, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    required: false,
    enum: ['active', 'idle', 'expired', 'revoked', 'all'],
    default: 'all',
  })
  @IsOptional()
  @IsEnum(['active', 'idle', 'expired', 'revoked', 'all'])
  status?: 'active' | 'idle' | 'expired' | 'revoked' | 'all' = 'all';

  @ApiProperty({
    required: false,
    enum: ['openai', 'anthropic', 'google', 'azure', 'all'],
    default: 'all',
  })
  @IsOptional()
  @IsEnum(['openai', 'anthropic', 'google', 'azure', 'all'])
  provider?: 'openai' | 'anthropic' | 'google' | 'azure' | 'all' = 'all';

  @ApiProperty({
    required: false,
    enum: ['production', 'development', 'staging', 'all'],
    default: 'all',
  })
  @IsOptional()
  @IsEnum(['production', 'development', 'staging', 'all'])
  environment?: 'production' | 'development' | 'staging' | 'all' = 'all';

  @ApiProperty({
    required: false,
    description: 'Search by key name or provider',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
