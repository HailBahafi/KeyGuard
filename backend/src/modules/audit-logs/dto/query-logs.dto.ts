import { IsOptional, IsEnum, IsInt, Min, Max, IsString, IsISO8601 } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryLogsDto {
  @ApiProperty({ required: false, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ required: false, default: 50, minimum: 1, maximum: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number = 50;

  @ApiProperty({ required: false, description: 'Search in event, actor name, target name, error' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    required: false,
    enum: ['hour', 'day', 'week', 'month', 'all'],
    default: 'all',
  })
  @IsOptional()
  @IsEnum(['hour', 'day', 'week', 'month', 'all'])
  dateRange?: 'hour' | 'day' | 'week' | 'month' | 'all' = 'all';

  @ApiProperty({
    required: false,
    enum: ['key', 'device', 'auth', 'system', 'api', 'security', 'all'],
    default: 'all',
  })
  @IsOptional()
  @IsEnum(['key', 'device', 'auth', 'system', 'api', 'security', 'all'])
  eventType?: 'key' | 'device' | 'auth' | 'system' | 'api' | 'security' | 'all' = 'all';

  @ApiProperty({
    required: false,
    enum: ['success', 'failure', 'all'],
    default: 'all',
  })
  @IsOptional()
  @IsEnum(['success', 'failure', 'all'])
  status?: 'success' | 'failure' | 'all' = 'all';

  @ApiProperty({
    required: false,
    enum: ['info', 'warning', 'critical', 'all'],
    default: 'all',
  })
  @IsOptional()
  @IsEnum(['info', 'warning', 'critical', 'all'])
  severity?: 'info' | 'warning' | 'critical' | 'all' = 'all';

  @ApiProperty({ required: false, description: 'Custom start date (ISO 8601)' })
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @ApiProperty({ required: false, description: 'Custom end date (ISO 8601)' })
  @IsOptional()
  @IsISO8601()
  endDate?: string;
}
