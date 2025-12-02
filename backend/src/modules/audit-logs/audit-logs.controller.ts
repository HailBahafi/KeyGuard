import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/auth/jwt-auth.guard';
import { AuditLogsService } from './audit-logs.service';
import { QueryLogsDto } from './dto/query-logs.dto';
import { ExportLogsDto } from './dto/export-logs.dto';
import {
  AuditLogsPaginationResponseDto,
  ExportLogsResponseDto,
} from './dto/audit-log-response.dto';

@ApiTags('Audit Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('audit/logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @ApiOperation({ summary: 'List audit logs with filtering and pagination' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    type: AuditLogsPaginationResponseDto,
  })
  async listLogs(@Query() query: QueryLogsDto): Promise<AuditLogsPaginationResponseDto> {
    return this.auditLogsService.listLogs(query);
  }

  @Post('export')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Export audit logs as CSV or JSON' })
  @ApiResponse({
    status: 200,
    description: 'Export URL generated successfully',
    type: ExportLogsResponseDto,
  })
  async exportLogs(@Body() exportDto: ExportLogsDto): Promise<ExportLogsResponseDto> {
    return this.auditLogsService.exportLogs(exportDto);
  }
}
