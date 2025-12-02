import { IsOptional, IsEnum, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryDevicesDto {
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
    enum: ['active', 'pending', 'suspended', 'revoked', 'offline', 'all'],
    default: 'all',
  })
  @IsOptional()
  @IsEnum(['active', 'pending', 'suspended', 'revoked', 'offline', 'all'])
  status?: 'active' | 'pending' | 'suspended' | 'revoked' | 'offline' | 'all' = 'all';

  @ApiProperty({
    required: false,
    enum: ['macOS', 'Windows', 'Linux', 'iOS', 'Android', 'all'],
    default: 'all',
  })
  @IsOptional()
  @IsEnum(['macOS', 'Windows', 'Linux', 'iOS', 'Android', 'all'])
  platform?: 'macOS' | 'Windows' | 'Linux' | 'iOS' | 'Android' | 'all' = 'all';

  @ApiProperty({
    required: false,
    enum: ['hour', 'day', 'week', 'all'],
    default: 'all',
  })
  @IsOptional()
  @IsEnum(['hour', 'day', 'week', 'all'])
  lastSeen?: 'hour' | 'day' | 'week' | 'all' = 'all';

  @ApiProperty({
    required: false,
    description: 'Search by name, owner name/email, or location',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    enum: ['recent', 'name', 'platform'],
    default: 'recent',
  })
  @IsOptional()
  @IsEnum(['recent', 'name', 'platform'])
  sort?: 'recent' | 'name' | 'platform' = 'recent';
}
