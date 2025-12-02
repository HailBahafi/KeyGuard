import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { QueryLogsDto } from './query-logs.dto';

export class ExportLogsDto {
  @ApiProperty({
    description: 'Export format',
    enum: ['csv', 'json'],
  })
  @IsEnum(['csv', 'json'])
  format: 'csv' | 'json';

  @ApiProperty({
    description: 'Optional filters (same as query params)',
    required: false,
    type: QueryLogsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => QueryLogsDto)
  filters?: Omit<QueryLogsDto, 'page' | 'limit'>;
}
