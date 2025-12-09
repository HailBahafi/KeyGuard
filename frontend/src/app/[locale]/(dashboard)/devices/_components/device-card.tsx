'use client';

import { useTranslations } from 'next-intl';
import { Device } from '@/types/device';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Monitor,
    Smartphone,
    Tablet,
    CheckCircle,
    XCircle,
    Clock,
    Ban,
    Eye,
    MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface DeviceCardProps {
    device: Device;
    onViewDetails: (device: Device) => void;
    onApprove: (device: Device) => void;
    onSuspend: (device: Device) => void;
    onRevoke: (device: Device) => void;
}

export function DeviceCard({
    device,
    onViewDetails,
    onApprove,
    onSuspend,
    onRevoke
}: DeviceCardProps) {
    const t = useTranslations('Devices');

    // Select icon based on platform
    const getDeviceIcon = () => {
        const { os } = device.platform;
        if (os === 'iOS' || os === 'Android') {
            return Smartphone;
        }
        return Monitor;
    };

    const DeviceIcon = getDeviceIcon();

    // Status badge configuration
    const getStatusConfig = () => {
        switch (device.status) {
            case 'active':
                return {
                    label: t('filters.status.active'),
                    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                };
            case 'pending':
                return {
                    label: t('filters.status.pending'),
                    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                };
            case 'suspended':
                return {
                    label: t('filters.status.suspended'),
                    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                };
            case 'revoked':
                return {
                    label: t('filters.status.revoked'),
                    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                };
            default:
                return {
                    label: device.status,
                    className: ''
                };
        }
    };

    const statusConfig = getStatusConfig();
    const lastSeenText = formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true });

    return (
        <Card className="p-4 hover:shadow-md transition-all duration-200 border-border bg-card">
            <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <DeviceIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">{device.name}</h3>
                            <p className="text-sm text-muted-foreground">{device.owner.name}</p>
                        </div>
                    </div>
                    <Badge className={cn(statusConfig.className, "border-0")}>
                        {statusConfig.label}
                    </Badge>
                </div>

                {/* Platform Info */}
                <div className="space-y-1">
                    <p className="text-sm text-foreground">
                        {device.platform.os} {device.platform.version}
                    </p>
                    {device.platform.browser && (
                        <p className="text-sm text-muted-foreground">{device.platform.browser}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{device.location}</p>
                </div>

                {/* Last Seen */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{t('card.lastSeen', { time: lastSeenText })}</span>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm">
                    <div>
                        <span className="text-muted-foreground">{t('card.calls')}: </span>
                        <span className="font-medium text-foreground">{device.stats.totalCalls.toLocaleString()}</span>
                    </div>
                    <div>
                        <span className="text-muted-foreground">{t('card.keys')}: </span>
                        <span className="font-medium text-foreground">{device.stats.keysAccessed}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-1 pt-2 border-t border-border">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(device)}
                    >
                        <Eye className="h-4 w-4 me-1" />
                        {t('card.details')}
                    </Button>

                    <div className="flex items-center gap-1">
                        {device.status === 'pending' && (
                            <>
                                <Button
                                    variant="default"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => onApprove(device)}
                                    title={t('actions.approve')}
                                >
                                    <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => onSuspend(device)}
                                    title={t('actions.suspend')}
                                >
                                    <Ban className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => onRevoke(device)}
                                    title={t('actions.revoke')}
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </>
                        )}

                        {device.status === 'active' && (
                            <>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => onSuspend(device)}
                                    title={t('actions.suspend')}
                                >
                                    <Ban className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => onRevoke(device)}
                                    title={t('actions.revoke')}
                                >
                                    <XCircle className="h-4 w-4" />
                                </Button>
                            </>
                        )}

                        {device.status === 'suspended' && (
                            <Button
                                variant="destructive"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onRevoke(device)}
                                title={t('actions.revoke')}
                            >
                                <XCircle className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
