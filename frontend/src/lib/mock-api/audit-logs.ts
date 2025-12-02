// Mock API for Audit Logs with Live Streaming

import { AuditLog, AuditLogsPaginationData, LogFilters, EventSeverity, EventStatus } from '@/types/audit';

// Realistic data sets
const eventTypes = [
    'key.retrieved',
    'key.created',
    'key.rotated',
    'key.revoked',
    'device.enrolled',
    'device.approved',
    'device.suspended',
    'device.revoked',
    'auth.login',
    'auth.logout',
    'auth.failed',
    'auth.mfa_verified',
    'system.backup',
    'system.config_changed',
    'api.rate_limited',
    'security.suspicious_activity'
];

const userAgents = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    'KeyGuard-CLI/1.0.0 (Node.js 18.0.0)',
    'KeyGuard-SDK/2.0.0 (Python 3.11)'
];

const actorNames = [
    'Ahmed-Laptop', 'Sarah-iPhone', 'Mohammed-Desktop', 'Fatima-MacBook',
    'Ali-Surface', 'Layla-iPad', 'Omar-ThinkPad', 'Zainab-iPhone',
    'Hassan-Desktop', 'Mariam-MacBook', 'Khalid-Laptop', 'Aisha-Surface',
    'Yusuf-iPad', 'Nora-MacBook', 'Ibrahim-Desktop', 'Hana-iPhone',
    'System-Service', 'CLI-Tool', 'API-Gateway', 'Unknown-Device'
];

const targetKeys = [
    'openai-production', 'anthropic-dev', 'google-prod', 'azure-test',
    'openai-staging', 'anthropic-prod', 'backup-key', 'emergency-key'
];

const locations = [
    'Riyadh, SA', 'Dubai, AE', 'Cairo, EG', 'London, UK',
    'New York, US', 'Berlin, DE', 'Tokyo, JP', 'Singapore, SG',
    'Mumbai, IN', 'Sydney, AU'
];

const errorMessages = [
    'Invalid API key',
    'Rate limit exceeded',
    'Unauthorized access attempt',
    'Device fingerprint mismatch',
    'Suspicious IP address detected',
    'MFA verification failed',
    'Token expired',
    'Invalid signature'
];

// Generate a single random log
function generateRandomLog(timestamp?: Date): AuditLog {
    const now = timestamp || new Date();
    const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];

    // Determine status and severity based on event type
    let status: EventStatus = 'success';
    let severity: EventSeverity = 'info';

    // Failed auth events and security events
    if (event.includes('failed') || event.includes('suspicious') || event.includes('rate_limited')) {
        status = 'failure';
        severity = Math.random() > 0.5 ? 'critical' : 'warning';
    } else if (event.includes('revoked') || event.includes('suspended')) {
        severity = 'warning';
    } else if (Math.random() < 0.05) {
        // 5% chance of random failure
        status = 'failure';
        severity = 'warning';
    }

    const actorName = actorNames[Math.floor(Math.random() * actorNames.length)];
    const actorType = actorName.includes('System') ? 'system' : (actorName.includes('CLI') || actorName.includes('API') ? 'device' : 'user');

    // Generate realistic IP
    const ipPrefix = status === 'failure' && severity === 'critical'
        ? `${45 + Math.floor(Math.random() * 20)}.${Math.floor(Math.random() * 256)}`  // Suspicious IPs
        : `192.168.${Math.floor(Math.random() * 256)}`;  // Internal IPs
    const ip = `${ipPrefix}.${Math.floor(Math.random() * 256)}`;

    const targetName = event.includes('key')
        ? targetKeys[Math.floor(Math.random() * targetKeys.length)]
        : actorNames[Math.floor(Math.random() * actorNames.length)];

    return {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        timestamp: now.toISOString(),
        severity,
        event,
        status,
        actor: {
            id: `actor_${Math.random().toString(36).substring(7)}`,
            name: actorName,
            type: actorType,
            ip,
            location: locations[Math.floor(Math.random() * locations.length)]
        },
        target: {
            id: `target_${Math.random().toString(36).substring(7)}`,
            name: targetName,
            type: event.split('.')[0]
        },
        metadata: {
            latency: Math.floor(Math.random() * 500) + 10,
            tokens: event.includes('key') ? Math.floor(Math.random() * 5000) + 100 : undefined,
            cost: event.includes('key') ? parseFloat((Math.random() * 0.5).toFixed(4)) : undefined,
            error: status === 'failure' ? errorMessages[Math.floor(Math.random() * errorMessages.length)] : undefined,
            userAgent: userAgents[Math.floor(Math.random() * userAgents.length)],
            requestId: `req_${Math.random().toString(36).substring(2, 15)}`
        }
    };
}

// Generate initial set of logs
function generateMockLogs(count: number = 120): AuditLog[] {
    const logs: AuditLog[] = [];
    const now = Date.now();

    // Generate logs spread over the last 7 days
    for (let i = 0; i < count; i++) {
        // More recent logs are more frequent (weighted distribution)
        const ageInMs = Math.pow(Math.random(), 2) * 7 * 24 * 60 * 60 * 1000; // Last 7 days, weighted to recent
        const timestamp = new Date(now - ageInMs);
        logs.push(generateRandomLog(timestamp));
    }

    // Sort by timestamp descending (newest first)
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

const mockLogs = generateMockLogs();

// Live streaming state
let streamingCallbacks: Array<(log: AuditLog) => void> = [];
let streamingInterval: NodeJS.Timeout | null = null;

// Start live streaming simulation
function startLiveStream() {
    if (streamingInterval) return; // Already running

    streamingInterval = setInterval(() => {
        const newLog = generateRandomLog();
        mockLogs.unshift(newLog); // Add to beginning

        // Limit buffer to 500 logs to prevent memory issues
        if (mockLogs.length > 500) {
            mockLogs.pop();
        }

        // Notify all subscribers
        streamingCallbacks.forEach(callback => callback(newLog));
    }, 3000 + Math.random() * 2000); // 3-5 seconds
}

// Stop live streaming
function stopLiveStream() {
    if (streamingInterval) {
        clearInterval(streamingInterval);
        streamingInterval = null;
    }
}

// Mock API: Fetch logs with filters
export async function fetchLogs(
    page: number = 1,
    limit: number = 50,
    filters?: LogFilters
): Promise<AuditLogsPaginationData> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    let filteredLogs = [...mockLogs];

    // Apply filters
    if (filters?.search) {
        const search = filters.search.toLowerCase();
        filteredLogs = filteredLogs.filter(log =>
            log.event.toLowerCase().includes(search) ||
            log.actor.name.toLowerCase().includes(search) ||
            log.target.name.toLowerCase().includes(search) ||
            log.metadata.error?.toLowerCase().includes(search)
        );
    }

    if (filters?.status && filters.status !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.status === filters.status);
    }

    if (filters?.severity && filters.severity !== 'all') {
        filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
    }

    if (filters?.eventType && filters.eventType !== 'all') {
        filteredLogs = filteredLogs.filter(log => {
            const category = log.event.split('.')[0];
            return category === filters.eventType;
        });
    }

    if (filters?.dateRange && filters.dateRange !== 'all') {
        const now = Date.now();
        let cutoffTime = 0;

        switch (filters.dateRange) {
            case 'hour':
                cutoffTime = now - 60 * 60 * 1000;
                break;
            case 'day':
                cutoffTime = now - 24 * 60 * 60 * 1000;
                break;
            case 'week':
                cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
                break;
            case 'month':
                cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
                break;
        }

        if (cutoffTime > 0) {
            filteredLogs = filteredLogs.filter(log =>
                new Date(log.timestamp).getTime() >= cutoffTime
            );
        }
    }

    // Custom date range
    if (filters?.startDate) {
        filteredLogs = filteredLogs.filter(log =>
            new Date(log.timestamp) >= new Date(filters.startDate!)
        );
    }

    if (filters?.endDate) {
        filteredLogs = filteredLogs.filter(log =>
            new Date(log.timestamp) <= new Date(filters.endDate!)
        );
    }

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedLogs = filteredLogs.slice(start, end);

    return {
        logs: paginatedLogs,
        pagination: {
            total: filteredLogs.length,
            page,
            limit,
            pages: Math.ceil(filteredLogs.length / limit)
        }
    };
}

// Mock API: Subscribe to live logs
export function subscribeToLogs(callback: (log: AuditLog) => void): () => void {
    streamingCallbacks.push(callback);

    // Start streaming if not already running
    if (streamingCallbacks.length === 1) {
        startLiveStream();
    }

    // Return unsubscribe function
    return () => {
        streamingCallbacks = streamingCallbacks.filter(cb => cb !== callback);

        // Stop streaming if no more subscribers
        if (streamingCallbacks.length === 0) {
            stopLiveStream();
        }
    };
}

// Mock API: Export logs
export async function exportLogs(
    format: 'csv' | 'json',
    filters?: LogFilters
): Promise<{ url: string; filename: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In a real implementation, this would generate and download the file
    // For now, just return a mock URL
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `audit-logs-${timestamp}.${format}`;

    return {
        url: '#', // Mock URL
        filename
    };
}
