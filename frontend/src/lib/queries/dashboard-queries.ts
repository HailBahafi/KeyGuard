// Mock data for dashboard (replace with real API later)

export interface DashboardMetrics {
    activeKeys: { count: number; change: string };
    totalDevices: { count: number; change: string };
    apiCalls: { count: number; change: string };
    alerts: { count: number; change: string };
}

export interface UsageData {
    timestamp: string;
    successful: number;
    failed: number;
    total: number;
}

export interface Activity {
    id: string;
    device: string;
    action: string;
    keyName?: string;
    timestamp: string;
    status: 'success' | 'failed';
}

export interface DeviceStatus {
    active: number;
    idle: number;
    offline: number;
}

export interface TopDevice {
    name: string;
    calls: number;
    percentage: number;
}

export interface SecurityAlert {
    id: string;
    type: 'rate_limit' | 'suspicious_activity' | 'auth_failed' | 'key_expiring';
    severity: 'warning' | 'error';
    message: string;
    timestamp: string;
}

export interface DashboardData {
    metrics: DashboardMetrics;
    usage: UsageData[];
    recentActivity: Activity[];
    deviceStatus: DeviceStatus;
    topDevices: TopDevice[];
    alerts: SecurityAlert[];
}

// Generate mock data
function generateMockUsageData(days: number): UsageData[] {
    const data: UsageData[] = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);

        const successful = Math.floor(Math.random() * 2000) + 800;
        const failed = Math.floor(Math.random() * 50) + 10;

        data.push({
            timestamp: date.toISOString(),
            successful,
            failed,
            total: successful + failed,
        });
    }

    return data;
}

function generateMockActivities(): Activity[] {
    const devices = ['Ahmed-Laptop', 'Production-Server', 'Dev-Machine', 'QA-Environment', 'Staging-Server'];
    const keyNames = ['openai-prod', 'anthropic-dev', 'openai-staging'];
    const activities: Activity[] = [];

    for (let i = 0; i < 10; i++) {
        const minutesAgo = Math.floor(Math.random() * 120);
        const timestamp = new Date(Date.now() - minutesAgo * 60000);

        activities.push({
            id: `act_${i}`,
            device: devices[Math.floor(Math.random() * devices.length)],
            action: 'key_retrieved',
            keyName: keyNames[Math.floor(Math.random() * keyNames.length)],
            timestamp: timestamp.toISOString(),
            status: Math.random() > 0.1 ? 'success' : 'failed',
        });
    }

    return activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

// Mock API call with setTimeout to simulate network delay
export async function fetchDashboardData(period: '7d' | '30d' | '90d' = '7d'): Promise<DashboardData> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;

    return {
        metrics: {
            activeKeys: { count: 12, change: '+15%' },
            totalDevices: { count: 8, change: '+2' },
            apiCalls: { count: 15234, change: '+8%' },
            alerts: { count: 2, change: '+1' },
        },
        usage: generateMockUsageData(days),
        recentActivity: generateMockActivities(),
        deviceStatus: {
            active: 5,
            idle: 2,
            offline: 1,
        },
        topDevices: [
            { name: 'Ahmed-Laptop', calls: 1234, percentage: 82 },
            { name: 'Production-Server', calls: 856, percentage: 56 },
            { name: 'Dev-Machine', calls: 432, percentage: 28 },
            { name: 'QA-Environment', calls: 289, percentage: 19 },
            { name: 'Staging-Server', calls: 156, percentage: 10 },
        ],
        alerts: [
            {
                id: 'alert_1',
                type: 'rate_limit',
                severity: 'warning',
                message: 'Device "Production-Server" has exceeded 80% of its rate limit.',
                timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
            },
            {
                id: 'alert_2',
                type: 'key_expiring',
                severity: 'warning',
                message: 'API key "openai-prod" will expire in 7 days.',
                timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
            },
        ],
    };
}
