/**
 * Dashboard Queries - Real API calls to backend
 */

import { apiClient } from '@/lib/api';

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

/**
 * Fetch dashboard data from backend API
 * Falls back to empty data if API is not available
 */
export async function fetchDashboardData(period: '7d' | '30d' | '90d' = '7d'): Promise<DashboardData> {
    try {
        // Try to fetch from real API
        const response = await apiClient.get<DashboardData>(`/dashboard?period=${period}`);
        return response.data;
    } catch {
        // Return empty data structure if API fails or not implemented
        return {
            metrics: {
                activeKeys: { count: 0, change: '0%' },
                totalDevices: { count: 0, change: '0' },
                apiCalls: { count: 0, change: '0%' },
                alerts: { count: 0, change: '0' },
            },
            usage: [],
            recentActivity: [],
            deviceStatus: {
                active: 0,
                idle: 0,
                offline: 0,
            },
            topDevices: [],
            alerts: [],
        };
    }
}
