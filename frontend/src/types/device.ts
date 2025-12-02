// Device Inventory Types

export type DeviceStatus = 'active' | 'pending' | 'suspended' | 'revoked';
export type DeviceOS = 'macOS' | 'Windows' | 'Linux' | 'iOS' | 'Android';

export interface DevicePlatform {
    os: DeviceOS;
    version: string;
    browser?: string;
}

export interface DeviceOwner {
    name: string;
    email: string;
}

export interface Device {
    id: string;
    name: string;
    status: DeviceStatus;
    platform: DevicePlatform;
    owner: DeviceOwner;
    ipAddress: string;
    location: string; // e.g., "Riyadh, SA"
    lastSeen: string; // ISO Date
    fingerprintHash: string;
    stats: {
        totalCalls: number;
        keysAccessed: number;
    };
}

export interface DeviceStats {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    offline: number;
}

export interface EnrollmentCode {
    code: string;
    expiresAt: string; // ISO Date
}

export interface DevicesPaginationData {
    devices: Device[];
    stats: DeviceStats;
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}
