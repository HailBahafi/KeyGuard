import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { QueryLogsDto } from './dto/query-logs.dto';
import { ExportLogsDto } from './dto/export-logs.dto';
import {
  AuditLogDto,
  AuditLogsPaginationResponseDto,
  ExportLogsResponseDto,
} from './dto/audit-log-response.dto';
import dayjs from 'dayjs';

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  async listLogs(query: QueryLogsDto): Promise<AuditLogsPaginationResponseDto> {
    const {
      page = 1,
      limit = 50,
      search,
      dateRange,
      eventType,
      status,
      severity,
      startDate,
      endDate,
    } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Date range filter
    if (startDate && endDate) {
      where.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (dateRange && dateRange !== 'all') {
      const timeMap = {
        hour: 1,
        day: 24,
        week: 168,
        month: 720,
      };
      where.timestamp = {
        gte: dayjs().subtract(timeMap[dateRange], 'hour').toDate(),
      };
    }

    // Event type filter
    if (eventType && eventType !== 'all') {
      where.event = {
        startsWith: eventType,
      };
    }

    // Status filter
    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    // Severity filter
    if (severity && severity !== 'all') {
      where.severity = severity.toUpperCase();
    }

    // Search filter
    if (search) {
      where.OR = [
        { event: { contains: search, mode: 'insensitive' } },
        { actorName: { contains: search, mode: 'insensitive' } },
        { targetName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count and logs
    const [total, logs] = await Promise.all([
      this.prisma.prisma.auditLog.count({ where }),
      this.prisma.prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
    ]);

    const mappedLogs: AuditLogDto[] = logs.map((log: any) => ({
      id: log.id,
      timestamp: log.timestamp.toISOString(),
      severity: log.severity.toLowerCase() as any,
      event: log.event,
      status: log.status.toLowerCase() as any,
      actor: {
        id: log.actorId,
        name: log.actorName,
        type: log.actorType.toLowerCase() as any,
        ip: log.actorIp,
        location: log.actorLocation ?? '',
      },
      target: {
        id: log.targetId || '',
        name: log.targetName || '',
        type: log.targetType ?? '',
      },
      metadata: (log.metadata as any) || {},
    }));

    const pages = Math.ceil(total / limit);

    return {
      logs: mappedLogs,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    };
  }

  async exportLogs(exportDto: ExportLogsDto): Promise<ExportLogsResponseDto> {
    const { format, filters } = exportDto;

    // Get all logs matching filters (without pagination)
    const where: any = {};

    if (filters) {
      // Apply same filters as listLogs
      if (filters.dateRange && filters.dateRange !== 'all') {
        const timeMap = {
          hour: 1,
          day: 24,
          week: 168,
          month: 720,
        };
        where.timestamp = {
          gte: dayjs()
            .subtract(timeMap[filters.dateRange], 'hour')
            .toDate(),
        };
      }

      if (filters.eventType && filters.eventType !== 'all') {
        where.event = { startsWith: filters.eventType };
      }

      if (filters.status && filters.status !== 'all') {
        where.status = filters.status.toUpperCase();
      }

      if (filters.severity && filters.severity !== 'all') {
        where.severity = filters.severity.toUpperCase();
      }
    }

    const logs = await this.prisma.prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 10000, // Limit to 10k logs for export
    });

    // Generate filename
    const timestamp = dayjs().format('YYYY-MM-DD-HHmmss');
    const filename = `audit-logs-${timestamp}.${format}`;

    // In production, you would:
    // 1. Generate the file (CSV or JSON)
    // 2. Upload to S3 or similar storage
    // 3. Generate pre-signed URL
    // For now, we'll return a mock URL
    const url = `/api/v1/audit/logs/download/${filename}`;

    return {
      url,
      filename,
    };
  }

  async createLog(logData: {
    event: string;
    severity: 'info' | 'warning' | 'critical';
    status: 'success' | 'failure';
    actorId: string;
    actorName: string;
    actorType: 'user' | 'device' | 'system';
    actorIp: string;
    actorLocation?: string;
    targetId?: string;
    targetName?: string;
    targetType?: string;
    metadata?: any;
    userId?: string;
    deviceId?: string;
    apiKeyId?: string;
  }) {
    return this.prisma.prisma.auditLog.create({
      data: {
        event: logData.event,
        severity: logData.severity.toUpperCase() as any,
        status: logData.status.toUpperCase() as any,
        actorId: logData.actorId,
        actorName: logData.actorName,
        actorType: logData.actorType.toUpperCase() as any,
        actorIp: logData.actorIp,
        actorLocation: logData.actorLocation ?? null,
        targetId: logData.targetId ?? null,
        targetName: logData.targetName ?? null,
        targetType: logData.targetType ?? null,
        metadata: logData.metadata ?? null,
        userId: logData.userId ?? null,
        deviceId: logData.deviceId ?? null,
        apiKeyId: logData.apiKeyId ?? null,
      },
    });
  }
}
