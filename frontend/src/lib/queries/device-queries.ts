// Mock API for Device Inventory

import { Device, DevicesPaginationData, DeviceStats, EnrollmentCode, DeviceOS } from '@/types/device';

// Generate realistic mock devices
function generateMockDevices(): Device[] {
    const osOptions: DeviceOS[] = ['macOS', 'Windows', 'Linux', 'iOS', 'Android'];
    const browsers = ['Chrome', 'Safari', 'Firefox', 'Edge', 'Brave'];
    const cities = [
        'Riyadh, SA',
        'Dubai, AE',
        'Cairo, EG',
        'London, UK',
        'New York, US',
        'Berlin, DE',
        'Tokyo, JP',
        'Singapore, SG'
    ];

    const names = [
        'Ahmed-Laptop',
        'Sarah-iPhone',
        'Mohammed-Desktop',
        'Fatima-MacBook',
        'Ali-Surface',
        'Layla-iPad',
        'Omar-ThinkPad',
        'Zainab-iPhone',
        'Hassan-Desktop',
        'Mariam-MacBook',
        'Khalid-Laptop',
        'Aisha-Surface',
        'Yusuf-iPad',
        'Nora-MacBook',
        'Ibrahim-Desktop',
        'Hana-iPhone',
        'Abdullah-ThinkPad',
        'Mona-Laptop',
        'Tariq-MacBook',
        'Dina-Surface'
    ];

    const owners = [
        { name: 'Ahmed Al-Rashid', email: 'ahmed@company.com' },
        { name: 'Sarah Hassan', email: 'sarah@company.com' },
        { name: 'Mohammed Ali', email: 'mohammed@company.com' },
        { name: 'Fatima Khan', email: 'fatima@company.com' },
        { name: 'Ali Ibrahim', email: 'ali@company.com' },
        { name: 'Layla Mansour', email: 'layla@company.com' },
        { name: 'Omar Sayed', email: 'omar@company.com' },
        { name: 'Zainab Ahmed', email: 'zainab@company.com' },
        { name: 'Hassan Nasser', email: 'hassan@company.com' },
        { name: 'Mariam Saleh', email: 'mariam@company.com' },
        { name: 'Khalid Omar', email: 'khalid@company.com' },
        { name: 'Aisha Farah', email: 'aisha@company.com' },
        { name: 'Yusuf Amin', email: 'yusuf@company.com' },
        { name: 'Nora Zaki', email: 'nora@company.com' },
        { name: 'Ibrahim Malik', email: 'ibrahim@company.com' },
        { name: 'Hana Salem', email: 'hana@company.com' },
        { name: 'Abdullah Yousef', email: 'abdullah@company.com' },
        { name: 'Mona Tariq', email: 'mona@company.com' },
        { name: 'Tariq Samir', email: 'tariq@company.com' },
        { name: 'Dina Waleed', email: 'dina@company.com' }
    ];

    // Create mix of statuses: mostly active, few pending, some suspended, rare revoked
    const statuses: Array<'active' | 'pending' | 'suspended' | 'revoked'> = [
        'active', 'active', 'active', 'active', 'active',
        'active', 'active', 'active', 'active', 'active',
        'pending', 'pending',
        'suspended', 'suspended',
        'revoked',
        'active', 'active', 'active', 'active', 'active'
    ];

    return names.map((name, index) => {
        const os = osOptions[index % osOptions.length];
        const status = statuses[index];
        const owner = owners[index];

        // Determine last seen based on status
        let lastSeenDate: Date;
        if (status === 'active') {
            // Active devices seen recently (within last hour to 2 days)
            lastSeenDate = new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000);
        } else if (status === 'pending') {
            // Pending devices never seen (enrollment not completed)
            lastSeenDate = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes ago for created time
        } else {
            // Suspended/revoked seen days to weeks ago
            lastSeenDate = new Date(Date.now() - (7 + Math.random() * 30) * 24 * 60 * 60 * 1000);
        }

        // Browser selection based on OS
        let browser = '';
        if (os === 'iOS' || os === 'macOS') {
            browser = Math.random() > 0.5 ? 'Safari' : 'Chrome';
        } else if (os === 'Android') {
            browser = Math.random() > 0.5 ? 'Chrome' : 'Firefox';
        } else {
            browser = browsers[Math.floor(Math.random() * browsers.length)];
        }

        // Generate version numbers
        let osVersion = '';
        switch (os) {
            case 'macOS':
                osVersion = `${13 + Math.floor(Math.random() * 3)}.${Math.floor(Math.random() * 5)}`;
                break;
            case 'Windows':
                osVersion = Math.random() > 0.5 ? '11' : '10';
                break;
            case 'Linux':
                osVersion = 'Ubuntu 22.04';
                break;
            case 'iOS':
                osVersion = `${16 + Math.floor(Math.random() * 2)}.${Math.floor(Math.random() * 5)}`;
                break;
            case 'Android':
                osVersion = `${12 + Math.floor(Math.random() * 3)}`;
                break;
        }

        const browserVersion = `${100 + Math.floor(Math.random() * 20)}`;

        // Generate realistic IP addresses
        const ipAddress = `${192 + Math.floor(Math.random() * 16)}.168.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;

        // Generate fingerprint hash
        const fingerprintHash = Array.from({ length: 8 }, () =>
            Math.random().toString(36).substring(2, 6)
        ).join('-');

        return {
            id: `device_${index + 1}`,
            name,
            status,
            platform: {
                os,
                version: osVersion,
                browser: `${browser} ${browserVersion}`
            },
            owner,
            ipAddress,
            location: cities[index % cities.length],
            lastSeen: lastSeenDate.toISOString(),
            fingerprintHash: `fp-${fingerprintHash}`,
            stats: {
                totalCalls: status === 'active' ? Math.floor(Math.random() * 5000) + 100 : 0,
                keysAccessed: status === 'active' ? Math.floor(Math.random() * 10) + 1 : 0
            }
        };
    });
}

const mockDevices = generateMockDevices();

// Calculate device statistics
function calculateStats(devices: Device[]): DeviceStats {
    const stats: DeviceStats = {
        total: devices.length,
        active: 0,
        pending: 0,
        suspended: 0,
        offline: 0
    };

    devices.forEach(device => {
        switch (device.status) {
            case 'active':
                // Check if device is offline (not seen in last 24 hours)
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

// Mock API: Fetch devices with filters
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
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredDevices = [...mockDevices];

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
        if (filters.status === 'offline') {
            filteredDevices = filteredDevices.filter(d => {
                const hoursSinceLastSeen = (Date.now() - new Date(d.lastSeen).getTime()) / (1000 * 60 * 60);
                return d.status === 'active' && hoursSinceLastSeen > 24;
            });
        } else {
            filteredDevices = filteredDevices.filter(d => d.status === filters.status);
        }
    }

    if (filters?.platform && filters.platform !== 'all') {
        filteredDevices = filteredDevices.filter(d => d.platform.os === filters.platform);
    }

    if (filters?.lastSeen && filters.lastSeen !== 'all') {
        const now = Date.now();
        filteredDevices = filteredDevices.filter(d => {
            const lastSeenTime = new Date(d.lastSeen).getTime();
            const hoursDiff = (now - lastSeenTime) / (1000 * 60 * 60);

            switch (filters.lastSeen) {
                case 'hour':
                    return hoursDiff <= 1;
                case 'day':
                    return hoursDiff <= 24;
                case 'week':
                    return hoursDiff <= 168;
                default:
                    return true;
            }
        });
    }

    if (filters?.search) {
        const search = filters.search.toLowerCase();
        filteredDevices = filteredDevices.filter(d =>
            d.name.toLowerCase().includes(search) ||
            d.owner.name.toLowerCase().includes(search) ||
            d.owner.email.toLowerCase().includes(search) ||
            d.platform.os.toLowerCase().includes(search) ||
            d.location.toLowerCase().includes(search)
        );
    }

    // Apply sorting
    if (filters?.sort) {
        switch (filters.sort) {
            case 'recent':
                filteredDevices.sort((a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime());
                break;
            case 'name':
                filteredDevices.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'platform':
                filteredDevices.sort((a, b) => a.platform.os.localeCompare(b.platform.os));
                break;
        }
    }

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedDevices = filteredDevices.slice(start, end);

    return {
        devices: paginatedDevices,
        stats: calculateStats(mockDevices), // Stats based on all devices, not filtered
        pagination: {
            total: filteredDevices.length,
            page,
            limit,
            pages: Math.ceil(filteredDevices.length / limit)
        }
    };
}

// Mock API: Generate enrollment code
export async function generateEnrollmentCode(): Promise<EnrollmentCode> {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate random enrollment code
    const code = `KG-ENRL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    return {
        code,
        expiresAt: expiresAt.toISOString()
    };
}

// Mock API: Approve device
export async function approveDevice(deviceId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const device = mockDevices.find(d => d.id === deviceId);
    if (device && device.status === 'pending') {
        device.status = 'active';
    }
}

// Mock API: Suspend device
export async function suspendDevice(deviceId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const device = mockDevices.find(d => d.id === deviceId);
    if (device && device.status === 'active') {
        device.status = 'suspended';
    }
}

// Mock API: Revoke device
export async function revokeDevice(deviceId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const device = mockDevices.find(d => d.id === deviceId);
    if (device) {
        device.status = 'revoked';
    }
}
