/**
 * Device Queries - Real API calls to backend
 */

import { apiClient } from '@/lib/api';
import { Device, DevicesPaginationData, DeviceStats, EnrollmentCode } from '@/types/device';

// Backend response interfaces
interface BackendDevice {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REVOKED';
  platform: Record<string, unknown>;
  ownerName: string;
  ownerEmail: string;
  ipAddress: string;
  location: string;
  lastSeen: string | null;
  fingerprintHash: string;
  createdAt: string;
  keyId?: string;
}

interface BackendDevicesResponse {
  devices: BackendDevice[];
  stats: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    offline: number;
  };
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface BackendEnrollmentCodeResponse {
  code: string;
  expiresAt: string;
}

// Map backend device to frontend device format
function mapBackendDevice(device: BackendDevice): Device {
  const platform = device.platform as { os?: string; version?: string; browser?: string } || {};
  
  return {
    id: device.id,
    name: device.name,
    status: device.status.toLowerCase() as 'active' | 'pending' | 'suspended' | 'revoked',
    platform: {
      os: (platform.os || 'Unknown') as Device['platform']['os'],
      version: platform.version || '',
      browser: platform.browser || '',
    },
    owner: {
      name: device.ownerName,
      email: device.ownerEmail,
    },
    ipAddress: device.ipAddress,
    location: device.location,
    lastSeen: device.lastSeen || device.createdAt,
    fingerprintHash: device.fingerprintHash,
    stats: {
      totalCalls: 0,
      keysAccessed: 0,
    },
  };
}

// Calculate device statistics from devices list
function calculateStats(devices: Device[]): DeviceStats {
  const stats: DeviceStats = {
    total: devices.length,
    active: 0,
    pending: 0,
    suspended: 0,
    offline: 0,
  };

  devices.forEach(device => {
    switch (device.status) {
      case 'active':
        const lastSeen = new Date(device.lastSeen);
        const hoursSinceLastSeen = (Date.now() - lastSeen.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastSeen > 24) {
          stats.offline++;
        } else {
          stats.active++;
        }
        break;
      case 'pending':
        stats.pending++;
        break;
      case 'suspended':
        stats.suspended++;
        break;
    }
  });

  return stats;
}

/**
 * Fetch devices from the backend API
 */
export async function fetchDevices(
  page: number = 1,
  limit: number = 20,
  filters?: {
    status?: string;
    platform?: string;
    lastSeen?: string;
    search?: string;
    sort?: string;
  }
): Promise<DevicesPaginationData> {
  try {
    // Build query params
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    
    if (filters?.status && filters.status !== 'all') {
      params.set('status', filters.status);
    }
    if (filters?.platform && filters.platform !== 'all') {
      params.set('platform', filters.platform);
    }
    if (filters?.lastSeen && filters.lastSeen !== 'all') {
      params.set('lastSeen', filters.lastSeen);
    }
    if (filters?.search) {
      params.set('search', filters.search);
    }
    if (filters?.sort) {
      params.set('sort', filters.sort);
    }

    const response = await apiClient.get<BackendDevicesResponse>(`/devices?${params.toString()}`);
    const data = response.data;

    // Map backend devices to frontend format
    const devices = data.devices.map(mapBackendDevice);

    return {
      devices,
      stats: data.stats || calculateStats(devices),
      pagination: data.pagination,
    };
  } catch (error) {
    console.error('Failed to fetch devices:', error);
    // Return empty data on error
    return {
      devices: [],
      stats: { total: 0, active: 0, pending: 0, suspended: 0, offline: 0 },
      pagination: { total: 0, page: 1, limit: 20, pages: 0 },
    };
  }
}

/**
 * Generate enrollment code from the backend API
 */
export async function generateEnrollmentCode(apiKeyId?: string): Promise<EnrollmentCode> {
  const response = await apiClient.post<BackendEnrollmentCodeResponse>('/devices/enrollment-code', {
    apiKeyId,
  });
  
  return {
    code: response.data.code,
    expiresAt: response.data.expiresAt,
  };
}

/**
 * Approve a pending device
 */
export async function approveDevice(deviceId: string): Promise<void> {
  await apiClient.patch(`/devices/${deviceId}/approve`);
}

/**
 * Suspend an active device
 */
export async function suspendDevice(deviceId: string): Promise<void> {
  await apiClient.patch(`/devices/${deviceId}/suspend`);
}

/**
 * Revoke a device
 */
export async function revokeDevice(deviceId: string): Promise<void> {
  await apiClient.delete(`/devices/${deviceId}`);
}
