'use client';

import { AuditLog } from '@/types/audit';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    Eye,
    ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';

interface LogRowProps {
    log: AuditLog;
    onClick: (log: AuditLog) => void;
    isNew?: boolean;
}

export function LogRow({ log, onClick, isNew = false }: LogRowProps) {
    // Status icon and color
    const getStatusConfig = () => {
        if (log.status === 'success') {
            return {
                icon: CheckCircle,
                className: 'text-green-600 dark:text-green-500',
                badgeClassName: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            };
        }
        return {
            icon: XCircle,
            className: 'text-red-600 dark:text-red-500',
            badgeClassName: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
    };

    // Severity icon
    const getSeverityIcon = () => {
        switch (log.severity) {
            case 'critical':
                return AlertTriangle;
            case 'warning':
                return AlertTriangle;
            default:
                return Info;
        }
    };

    const getSeverityColor = () => {
        switch (log.severity) {
            case 'critical':
                return 'text-red-600 dark:text-red-500';
            case 'warning':
                return 'text-yellow-600 dark:text-yellow-500';
            default:
                return 'text-blue-600 dark:text-blue-500';
        }
    };

    const statusConfig = getStatusConfig();
    const StatusIcon = statusConfig.icon;
    const SeverityIcon = getSeverityIcon();
    const severityColor = getSeverityColor();

    const timestamp = new Date(log.timestamp);
    const timeString = format(timestamp, 'HH:mm:ss');
    const relativeTime = formatDistanceToNow(timestamp, { addSuffix: true });

    return (
        <Card
            className={cn(
                "p-4 cursor-pointer transition-all duration-200",
                "hover:shadow-md hover:border-primary/50",
                "border-border bg-card",
                isNew && "animate-in slide-in-from-top-2 duration-300 border-primary/30 bg-primary/5"
            )}
            onClick={() => onClick(log)}
        >
            <div className="space-y-3">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Severity Icon */}
                        <SeverityIcon className={cn("h-4 w-4 flex-shrink-0", severityColor)} />

                        {/* Time */}
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-mono font-semibold text-foreground">
                                {timeString}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {relativeTime}
                            </span>
                        </div>

                        {/* Actor */}
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-foreground truncate">
                                {log.actor.name}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">
                                {log.actor.type} • {log.actor.ip}
                            </span>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <Badge className={cn(statusConfig.badgeClassName, "border-0 flex-shrink-0")}>
                        <StatusIcon className="h-3 w-3 me-1" />
                        {log.status}
                    </Badge>
                </div>

                {/* Event Details Row */}
                <div className="flex items-center justify-between gap-4 ps-7">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Event */}
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">
                                {log.event}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Target: {log.target.name}
                            </span>
                        </div>

                        {/* Metadata */}
                        {log.metadata.latency && (
                            <span className="text-xs text-muted-foreground">
                                {log.metadata.latency}ms
                            </span>
                        )}

                        {log.metadata.error && (
                            <Badge variant="outline" className="text-xs border-destructive text-destructive">
                                {log.metadata.error}
                            </Badge>
                        )}
                    </div>

                    {/* View Details Icon */}
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
            </div>
        </Card>
    );
}
