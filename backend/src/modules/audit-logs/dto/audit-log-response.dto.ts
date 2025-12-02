import { ApiProperty } from '@nestjs/swagger';

export class EventActorDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['user', 'device', 'system'] })
  type: 'user' | 'device' | 'system';

  @ApiProperty()
  ip: string;

  @ApiProperty()
  location: string;
}

export class EventTargetDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  type: string;
}

export class SecurityContextDto {
  @ApiProperty({ required: false })
  latency?: number;

  @ApiProperty({ required: false })
  tokens?: number;

  @ApiProperty({ required: false })
  cost?: number;

  @ApiProperty({ required: false })
  error?: string;

  @ApiProperty({ required: false })
  userAgent?: string;

  @ApiProperty({ required: false })
  requestId?: string;
}

export class AuditLogDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  timestamp: string;

  @ApiProperty({ enum: ['info', 'warning', 'critical'] })
  severity: 'info' | 'warning' | 'critical';

  @ApiProperty()
  event: string;

  @ApiProperty({ enum: ['success', 'failure'] })
  status: 'success' | 'failure';

  @ApiProperty({ type: EventActorDto })
  actor: EventActorDto;

  @ApiProperty({ type: EventTargetDto })
  target: EventTargetDto;

  @ApiProperty({ type: SecurityContextDto })
  metadata: SecurityContextDto;
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

export class AuditLogsPaginationResponseDto {
  @ApiProperty({ type: [AuditLogDto] })
  logs: AuditLogDto[];

  @ApiProperty({ type: PaginationMeta })
  pagination: PaginationMeta;
}

export class ExportLogsResponseDto {
  @ApiProperty()
  url: string;

  @ApiProperty()
  filename: string;
}
