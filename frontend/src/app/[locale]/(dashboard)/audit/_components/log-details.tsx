'use client';

import { AuditLog } from '@/types/audit';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Copy,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    MapPin,
    Globe,
    Clock,
    Zap,
    Hash,
    User,
    Target as TargetIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useState } from 'react';

interface LogDetailsSheetProps {
    log: AuditLog | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function LogDetailsSheet({ log, open, onOpenChange }: LogDetailsSheetProps) {
    const [copied, setCopied] = useState(false);

    if (!log) return null;

    const getStatusConfig = () => {
        if (log.status === 'success') {
            return {
                icon: CheckCircle,
                label: 'Success',
                className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
            };
        }
        return {
            icon: XCircle,
            label: 'Failed',
            className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        };
    };

    const getSeverityConfig = () => {
        switch (log.severity) {
            case 'critical':
                return {
                    icon: AlertTriangle,
                    label: 'Critical',
                    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                };
            case 'warning':
                return {
                    icon: AlertTriangle,
                    label: 'Warning',
                    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                };
            default:
                return {
                    icon: Info,
                    label: 'Info',
                    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                };
        }
    };

    const statusConfig = getStatusConfig();
    const severityConfig = getSeverityConfig();
    const StatusIcon = statusConfig.icon;
    const SeverityIcon = severityConfig.icon;

    const copyToClipboard = async () => {
        try {
            const jsonString = JSON.stringify(log, null, 2);
            await navigator.clipboard.writeText(jsonString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-2xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>Audit Log Details</SheetTitle>
                    <SheetDescription>
                        Complete event information and metadata
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                    {/* Status & Severity Badges */}
                    <div className="flex items-center gap-2">
                        <Badge className={cn(statusConfig.className, 'border-0')}>
                            <StatusIcon className="h-3 w-3 me-1" />
                            {statusConfig.label}
                        </Badge>
                        <Badge className={cn(severityConfig.className, 'border-0')}>
                            <SeverityIcon className="h-3 w-3 me-1" />
                            {severityConfig.label}
                        </Badge>
                    </div>

                    {/* Event Information */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">Event Information</h3>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Event Type</span>
                                <code className="text-sm font-mono text-foreground">{log.event}</code>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Timestamp</span>
                                <span className="text-sm text-foreground">
                                    {format(new Date(log.timestamp), 'PPpp')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">Request ID</span>
                                <code className="text-xs font-mono text-foreground bg-muted px-2 py-1 rounded">
                                    {log.metadata.requestId}
                                </code>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Actor Information */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold text-foreground">Actor</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Name</span>
                                <span className="text-sm font-medium text-foreground">{log.actor.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Type</span>
                                <Badge variant="outline" className="text-xs capitalize">
                                    {log.actor.type}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">IP Address</span>
                                <code className="text-sm font-mono text-foreground">{log.actor.ip}</code>
                            </div>
                            {log.actor.location && (
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-muted-foreground">Location</span>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-sm text-foreground">{log.actor.location}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Target Information */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <TargetIcon className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold text-foreground">Target</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Resource Name</span>
                                <span className="text-sm font-medium text-foreground">{log.target.name}</span>
                            </div>
                            {log.target.type && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Resource Type</span>
                                    <Badge variant="outline" className="text-xs capitalize">
                                        {log.target.type}
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Performance & Metadata */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold text-foreground">Performance</h3>
                        </div>
                        <div className="space-y-2">
                            {log.metadata.latency && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Latency</span>
                                    <span className="text-sm text-foreground">{log.metadata.latency}ms</span>
                                </div>
                            )}
                            {log.metadata.tokens && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Tokens Used</span>
                                    <span className="text-sm text-foreground">{log.metadata.tokens.toLocaleString()}</span>
                                </div>
                            )}
                            {log.metadata.cost && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Cost</span>
                                    <span className="text-sm text-foreground">${log.metadata.cost.toFixed(4)}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error Details (if failed) */}
                    {log.metadata.error && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-destructive">Error Details</h3>
                                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                    <p className="text-sm text-destructive font-medium">{log.metadata.error}</p>
                                </div>
                            </div>
                        </>
                    )}

                    {/* User Agent */}
                    {log.metadata.userAgent && (
                        <>
                            <Separator />
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Globe className="h-4 w-4 text-muted-foreground" />
                                    <h3 className="text-sm font-semibold text-foreground">User Agent</h3>
                                </div>
                                <code className="block text-xs font-mono p-2 rounded bg-muted text-foreground break-all">
                                    {log.metadata.userAgent}
                                </code>
                            </div>
                        </>
                    )}

                    <Separator />

                    {/* Raw JSON */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-sm font-semibold text-foreground">Raw JSON</h3>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={copyToClipboard}
                            >
                                {copied ? (
                                    <>
                                        <CheckCircle className="h-3 w-3 me-1" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3 w-3 me-1" />
                                        Copy JSON
                                    </>
                                )}
                            </Button>
                        </div>
                        <pre className="text-xs font-mono p-3 rounded-lg bg-muted text-foreground overflow-x-auto max-h-64 overflow-y-auto">
                            {JSON.stringify(log, null, 2)}
                        </pre>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
