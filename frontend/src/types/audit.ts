// Audit Log Types

export type EventSeverity = 'info' | 'warning' | 'critical';
export type EventStatus = 'success' | 'failure';
export type ActorType = 'user' | 'device' | 'system';

export interface EventActor {
    id: string;
    name: string;
    type: ActorType;
    ip: string;
    location?: string;
}

export interface EventTarget {
    id: string;
    name: string;
    type?: string; // 'key', 'device', 'user', etc.
}

export interface SecurityContext {
    latency?: number; // milliseconds
    tokens?: number;
    cost?: number;
    error?: string;
    userAgent?: string;
    requestId?: string;
}

export interface AuditLog {
    id: string;
    timestamp: string; // ISO Date
    severity: EventSeverity;
    event: string; // e.g., "key.retrieved", "device.enrolled"
    status: EventStatus;
    actor: EventActor;
    target: EventTarget;
    metadata: SecurityContext;
}

export interface AuditLogsPaginationData {
    logs: AuditLog[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

export interface LogFilters {
    search?: string;
    dateRange?: string; // 'hour', 'day', 'week', 'month', 'custom'
    eventType?: string;
    status?: string;
    severity?: string;
    startDate?: string;
    endDate?: string;
}
