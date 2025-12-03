/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/**
 * Note: ESLint unsafe-* rules are disabled in this file because
 * the Prisma generated client uses @ts-nocheck which causes TypeScript
 * to report all usages as 'error' typed values. This is a known limitation
 * of the Prisma 7 client generation.
 */
import { Injectable } from '@nestjs/common';
import type { InputJsonValue } from '@prisma/client/runtime/client';
import dayjs from 'dayjs';
import { PrismaService } from 'src/core/database/prisma.service';
import { Prisma, type AuditLog } from 'src/generated/client';
import { ActorType, AuditLogSeverity, AuditLogStatus } from 'src/generated/enums';
import type { AuditLogWhereInput } from 'src/generated/models/AuditLog';
import {
  AuditLogDto,
  AuditLogsPaginationResponseDto,
  ExportLogsResponseDto,
  SecurityContextDto,
} from './dto/audit-log-response.dto';
import { ExportLogsDto } from './dto/export-logs.dto';
import { QueryLogsDto } from './dto/query-logs.dto';

type DateRangeKey = 'hour' | 'day' | 'week' | 'month';

@Injectable()
export class AuditLogsService {
  private readonly prisma: PrismaService;

  constructor(prisma: PrismaService) {
    this.prisma = prisma;
  }

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
    const where: AuditLogWhereInput = {};

    // Date range filter
    if (startDate && endDate) {
      where.timestamp = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    } else if (dateRange && dateRange !== 'all') {
      const timeMap: Record<DateRangeKey, number> = {
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
      where.status = status.toUpperCase() as AuditLogStatus;
    }

    // Severity filter
    if (severity && severity !== 'all') {
      where.severity = severity.toUpperCase() as AuditLogSeverity;
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

    const mappedLogs: AuditLogDto[] = (logs as AuditLog[]).map((log: AuditLog) => ({
      id: log.id,
      timestamp: log.timestamp.toISOString(),
      severity: log.severity.toLowerCase() as 'info' | 'warning' | 'critical',
      event: log.event,
      status: log.status.toLowerCase() as 'success' | 'failure',
      actor: {
        id: log.actorId,
        name: log.actorName,
        type: log.actorType.toLowerCase() as 'user' | 'device' | 'system',
        ip: log.actorIp,
        location: log.actorLocation ?? '',
      },
      target: {
        id: log.targetId ?? '',
        name: log.targetName ?? '',
        type: log.targetType ?? '',
      },
      metadata: (log.metadata as SecurityContextDto | null) ?? {},
    }));

    const pages = Math.ceil((total as number) / limit);

    return {
      logs: mappedLogs,
      pagination: {
        total: total as number,
        page,
        limit,
        pages,
      },
    };
  }

  async exportLogs(exportDto: ExportLogsDto): Promise<ExportLogsResponseDto> {
    const { format, filters } = exportDto;

    // Get all logs matching filters (without pagination)
    const where: AuditLogWhereInput = {};

    if (filters) {
      // Apply same filters as listLogs
      if (filters.dateRange && filters.dateRange !== 'all') {
        const timeMap: Record<DateRangeKey, number> = {
          hour: 1,
          day: 24,
          week: 168,
          month: 720,
        };
        where.timestamp = {
          gte: dayjs().subtract(timeMap[filters.dateRange], 'hour').toDate(),
        };
      }

      if (filters.eventType && filters.eventType !== 'all') {
        where.event = { startsWith: filters.eventType };
      }

      if (filters.status && filters.status !== 'all') {
        where.status = filters.status.toUpperCase() as AuditLogStatus;
      }

      if (filters.severity && filters.severity !== 'all') {
        where.severity = filters.severity.toUpperCase() as AuditLogSeverity;
      }
    }

    // Fetch logs for potential export processing
    // Currently unused but kept for future implementation
    await this.prisma.prisma.auditLog.findMany({
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
    actorLocation?: string | null;
    targetId?: string | null;
    targetName?: string | null;
    targetType?: string | null;
    metadata?: InputJsonValue | null;
    userId?: string | null;
    deviceId?: string | null;
    apiKeyId?: string | null;
  }): Promise<AuditLog> {
    return (await this.prisma.prisma.auditLog.create({
      data: {
        event: logData.event,
        severity: logData.severity.toUpperCase() as AuditLogSeverity,
        status: logData.status.toUpperCase() as AuditLogStatus,
        actorId: logData.actorId,
        actorName: logData.actorName,
        actorType: logData.actorType.toUpperCase() as ActorType,
        actorIp: logData.actorIp,
        actorLocation: logData.actorLocation ?? null,
        targetId: logData.targetId ?? null,
        targetName: logData.targetName ?? null,
        targetType: logData.targetType ?? null,
        metadata: logData.metadata ?? Prisma.DbNull,
        userId: logData.userId ?? null,
        deviceId: logData.deviceId ?? null,
        apiKeyId: logData.apiKeyId ?? null,
      },
    })) as AuditLog;
  }
}
