import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { FastifyRequest } from 'fastify';
import { PrismaService } from 'src/core/database/prisma.service';

/**
 * Audit Log Interceptor
 * Automatically logs all API requests to the audit log
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: async () => {
          const latency = Date.now() - startTime;
          await this.logRequest(request, 'success', latency);
        },
        error: async (error: Error) => {
          const latency = Date.now() - startTime;
          await this.logRequest(request, 'failure', latency, error.message);
        },
      }),
    );
  }

  private async logRequest(
    request: FastifyRequest,
    status: 'success' | 'failure',
    latency: number,
    error?: string,
  ) {
    try {
      const user = (request as any).user;
      const method = request.method;
      const url = request.url;

      // Determine event type based on URL
      let event = 'api.request';
      let severity: 'info' | 'warning' | 'critical' = 'info';

      if (url.includes('/auth/')) {
        event = 'auth.request';
      } else if (url.includes('/keys')) {
        event = 'key.accessed';
      } else if (url.includes('/devices')) {
        event = 'device.accessed';
      }

      if (status === 'failure') {
        severity = 'warning';
      }

      await this.prisma.prisma.auditLog.create({
        data: {
          event,
          severity: severity.toUpperCase() as any,
          status: status.toUpperCase() as any,
          actorId: user?.id || 'system',
          actorName: user?.name || 'System',
          actorType: user ? 'USER' : 'SYSTEM',
          actorIp: this.getClientIp(request),
          targetId: null,
          targetName: `${method} ${url}`,
          targetType: 'endpoint',
          metadata: {
            latency,
            error,
            userAgent: request.headers['user-agent'],
            requestId: request.id,
          },
          userId: user?.id || null,
        },
      });
    } catch (error) {
      this.logger.error('Failed to create audit log:', error);
    }
  }

  private getClientIp(request: FastifyRequest): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = typeof forwarded === 'string' ? forwarded.split(',') : forwarded;
      return ips && ips[0] ? ips[0].trim() : '0.0.0.0';
    }

    return request.ip || '0.0.0.0';
  }
}
