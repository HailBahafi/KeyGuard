import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/core/database/prisma.service';
import { QueryDevicesDto } from './dto/query-devices.dto';
import {
  DeviceDto,
  DevicesPaginationResponseDto,
  DeviceStatsResponseDto,
  EnrollmentCodeDto,
} from './dto/device-response.dto';
import dayjs from 'dayjs';
import { CreateEnrollmentCodeDto } from './dto/create-enrollment-code.dto';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async listDevices(query: QueryDevicesDto): Promise<DevicesPaginationResponseDto> {
    const { page = 1, limit = 20, status, platform, lastSeen, search, sort } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    // Status filter (handle offline separately)
    if (status && status !== 'all') {
      if (status === 'offline') {
        // Offline devices are active but not seen in last 24h
        where.status = 'ACTIVE';
        where.lastSeen = {
          lt: dayjs().subtract(24, 'hour').toDate(),
        };
      } else {
        where.status = status.toUpperCase();
        // For active status, exclude offline devices
        if (status === 'active') {
          where.lastSeen = {
            gte: dayjs().subtract(24, 'hour').toDate(),
          };
        }
      }
    }

    // Platform filter
    if (platform && platform !== 'all') {
      where.platform = {
        path: ['os'],
        equals: platform.toUpperCase(),
      };
    }

    // Last seen filter
    if (lastSeen && lastSeen !== 'all') {
      const timeMap = {
        hour: 1,
        day: 24,
        week: 168,
      };
      where.lastSeen = {
        gte: dayjs().subtract(timeMap[lastSeen], 'hour').toDate(),
      };
    }

    // Search filter
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { ownerName: { contains: search, mode: 'insensitive' } },
        { ownerEmail: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    let orderBy: any = { lastSeen: 'desc' };
    if (sort === 'name') {
      orderBy = { name: 'asc' };
    } else if (sort === 'platform') {
      orderBy = { platform: 'asc' };
    }

    // Get total count and devices
    const [total, devices, stats] = await Promise.all([
      this.prisma.prisma.device.count({ where }),
      this.prisma.prisma.device.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.getDeviceStats(),
    ]);

    const mappedDevices: DeviceDto[] = devices.map((device: any) => this.mapDeviceToDto(device));

    const pages = Math.ceil(total / limit);

    return {
      devices: mappedDevices,
      stats,
      pagination: {
        total,
        page,
        limit,
        pages,
      },
    };
  }

  async generateEnrollmentCode(userId: string, body: CreateEnrollmentCodeDto): Promise<EnrollmentCodeDto> {
    // Generate unique enrollment code
    const code = this.generateCode();
    const expiresAt = body.expiresAt ? dayjs(body.expiresAt).toDate() : null;

    await this.prisma.prisma.enrollmentCode.create({
      data: {
        code,
        expiresAt,
        description: body.description,
        userId,
      },
    });

    return {
      code,
      expiresAt: expiresAt?.toISOString() || null,
    };
  }

  async approveDevice(id: string): Promise<{ success: boolean; message: string; device: DeviceDto }> {
    const device = await this.prisma.prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (device.status !== 'PENDING') {
      throw new BadRequestException('Only pending devices can be approved');
    }

    const updatedDevice = await this.prisma.prisma.device.update({
      where: { id },
      data: { status: 'ACTIVE' },
    });

    return {
      success: true,
      message: 'Device approved successfully',
      device: this.mapDeviceToDto(updatedDevice),
    };
  }

  async suspendDevice(id: string): Promise<{ success: boolean; message: string; device: DeviceDto }> {
    const device = await this.prisma.prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    if (device.status !== 'ACTIVE') {
      throw new BadRequestException('Only active devices can be suspended');
    }

    const updatedDevice = await this.prisma.prisma.device.update({
      where: { id },
      data: { status: 'SUSPENDED' },
    });

    return {
      success: true,
      message: 'Device suspended successfully',
      device: this.mapDeviceToDto(updatedDevice),
    };
  }

  async revokeDevice(id: string): Promise<{ success: boolean; message: string; device: DeviceDto }> {
    const device = await this.prisma.prisma.device.findUnique({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException('Device not found');
    }

    const updatedDevice = await this.prisma.prisma.device.update({
      where: { id },
      data: { status: 'REVOKED' },
    });

    return {
      success: true,
      message: 'Device revoked successfully',
      device: this.mapDeviceToDto(updatedDevice),
    };
  }

  private async getDeviceStats(): Promise<DeviceStatsResponseDto> {
    const now = dayjs();
    const yesterday = now.subtract(24, 'hour').toDate();

    const [total, active, pending, suspended, allActive] = await Promise.all([
      this.prisma.prisma.device.count(),
      this.prisma.prisma.device.count({
        where: {
          status: 'ACTIVE',
          lastSeen: { gte: yesterday },
        },
      }),
      this.prisma.prisma.device.count({ where: { status: 'PENDING' } }),
      this.prisma.prisma.device.count({ where: { status: 'SUSPENDED' } }),
      this.prisma.prisma.device.count({
        where: {
          status: 'ACTIVE',
          lastSeen: { lt: yesterday },
        },
      }),
    ]);

    return {
      total,
      active,
      pending,
      suspended,
      offline: allActive,
    };
  }

  private mapDeviceToDto(device: any): DeviceDto {
    return {
      id: device.id,
      name: device.name,
      status: device.status.toLowerCase(),
      platform: device.platform,
      owner: {
        name: device.ownerName,
        email: device.ownerEmail,
      },
      ipAddress: device.ipAddress,
      location: device.location,
      lastSeen: device.lastSeen.toISOString(),
      fingerprintHash: device.fingerprintHash,
      stats: {
        totalCalls: device.totalCalls,
        keysAccessed: device.keysAccessed,
      },
    };
  }

  private generateCode(): string {
    // Generate format: KG-ENRL-XXXX
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const randomPart = Array.from({ length: 4 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length)),
    ).join('');
    return `KG-ENRL-${randomPart}`;
  }
}
