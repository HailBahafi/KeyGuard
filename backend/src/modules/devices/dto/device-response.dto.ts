import { ApiProperty } from '@nestjs/swagger';

export class DevicePlatformDto {
  @ApiProperty({ enum: ['macOS', 'Windows', 'Linux', 'iOS', 'Android'] })
  os: 'macOS' | 'Windows' | 'Linux' | 'iOS' | 'Android';

  @ApiProperty()
  version: string;

  @ApiProperty({ required: false })
  browser?: string;
}

export class DeviceOwnerDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;
}

export class DeviceStatsDto {
  @ApiProperty()
  totalCalls: number;

  @ApiProperty()
  keysAccessed: number;
}

export class DeviceDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['active', 'pending', 'suspended', 'revoked'] })
  status: 'active' | 'pending' | 'suspended' | 'revoked';

  @ApiProperty({ type: DevicePlatformDto })
  platform: DevicePlatformDto;

  @ApiProperty({ type: DeviceOwnerDto })
  owner: DeviceOwnerDto;

  @ApiProperty()
  ipAddress: string;

  @ApiProperty()
  location: string;

  @ApiProperty()
  lastSeen: string;

  @ApiProperty()
  fingerprintHash: string;

  @ApiProperty({ type: DeviceStatsDto })
  stats: DeviceStatsDto;
}

export class DeviceStatsResponseDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  active: number;

  @ApiProperty()
  pending: number;

  @ApiProperty()
  suspended: number;

  @ApiProperty()
  offline: number;
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

export class DevicesPaginationResponseDto {
  @ApiProperty({ type: [DeviceDto] })
  devices: DeviceDto[];

  @ApiProperty({ type: DeviceStatsResponseDto })
  stats: DeviceStatsResponseDto;

  @ApiProperty({ type: PaginationMeta })
  pagination: PaginationMeta;
}

export class EnrollmentCodeDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  expiresAt: string;
}

export class DeviceActionResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty({ type: DeviceDto })
  device: DeviceDto;
}
