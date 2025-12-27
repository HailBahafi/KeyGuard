import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { PrismaService } from 'src/core/database/prisma.service';

/**
 * IP Whitelist Guard
 * Checks if the request IP is in the allowed whitelist
 */
@Injectable()
export class IpWhitelistGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if endpoint is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const clientIp = this.getClientIp(request);

    // Get IP whitelist from settings
    const settings = await this.prisma.prisma.settings.findUnique({
      where: { key: 'security' },
    });

    if (!settings) {
      return true; // No settings, allow all
    }

    const securitySettings = settings.value as any;
    const ipWhitelist = securitySettings.ipWhitelist || [];

    // If whitelist is empty, allow all
    if (ipWhitelist.length === 0) {
      return true;
    }

    // Check if IP is in whitelist
    const isAllowed = ipWhitelist.some((allowedIp: string) => {
      return this.matchIp(clientIp, allowedIp);
    });

    if (!isAllowed) {
      throw new ForbiddenException('Access denied: IP not in whitelist');
    }

    return true;
  }

  private getClientIp(request: FastifyRequest): string {
    // Try to get IP from various headers (for proxy/load balancer scenarios)
    const forwarded = request.headers['x-forwarded-for'];
    if (forwarded) {
      const ips = typeof forwarded === 'string' ? forwarded.split(',') : forwarded;
      return ips?.[0] ? ips[0].trim() : '0.0.0.0';
    }

    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return typeof realIp === 'string' ? realIp : (realIp[0] || '0.0.0.0');
    }

    return request.ip || '0.0.0.0';
  }

  private matchIp(clientIp: string, allowedIp: string): boolean {
    // Simple IP matching (supports CIDR notation)
    if (allowedIp.includes('/')) {
      // CIDR notation
      return this.matchCIDR(clientIp, allowedIp);
    }

    // Exact match
    return clientIp === allowedIp;
  }

  private matchCIDR(clientIp: string, cidr: string): boolean {
    // Simple CIDR matching implementation
    const [range, bits] = cidr.split('/');
    if (!bits) return false;
    const mask = ~(2 ** (32 - parseInt(bits)) - 1);

    const ipToNumber = (ip: string) => {
      return ip
        .split('.')
        .reduce((acc, octet) => (acc << 8) + parseInt(octet), 0) >>> 0;
    };

    return (ipToNumber(clientIp) & mask) === (ipToNumber(range || '0.0.0.0') & mask);
  }
}
