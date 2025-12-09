'use client';

import { useTranslations } from 'next-intl';
import { Device } from '@/types/device';
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
    CheckCircle,
    XCircle,
    Ban,
    Monitor,
    MapPin,
    Wifi,
    Activity,
    Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface DeviceDetailsSheetProps {
    device: Device | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApprove: (device: Device) => void;
    onSuspend: (device: Device) => void;
    onRevoke: (device: Device) => void;
}

export function DeviceDetailsSheet({
    device,
    open,
    onOpenChange,
    onApprove,
    onSuspend,
    onRevoke
}: DeviceDetailsSheetProps) {
    const t = useTranslations('Devices');

    if (!device) return null;

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
        }
    };

    const statusConfig = getStatusConfig();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl overflow-y-auto">
                <SheetHeader>
                    <SheetTitle>{device.name}</SheetTitle>
                    <SheetDescription>
                        {t('detailsSheet.subtitle')}
                    </SheetDescription>
                </SheetHeader>

                <div className="space-y-6 mt-6">
                    {/* Status Badge */}
                    <div>
                        <Badge className={cn(statusConfig.className, 'border-0 text-sm px-3 py-1')}>
                            {statusConfig.label}
                        </Badge>
                    </div>

                    {/* Owner Information */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">{t('detailsSheet.owner')}</h3>
                        <div className="space-y-1">
                            <p className="text-sm text-foreground">{device.owner.name}</p>
                            <p className="text-sm text-muted-foreground">{device.owner.email}</p>
                        </div>
                    </div>

                    <Separator />

                    {/* Platform Information */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Monitor className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold text-foreground">{t('detailsSheet.platform')}</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">{t('detailsSheet.operatingSystem')}</span>
                                <span className="text-sm font-medium text-foreground">
                                    {device.platform.os} {device.platform.version}
                                </span>
                            </div>
                            {device.platform.browser && (
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">{t('detailsSheet.browser')}</span>
                                    <span className="text-sm font-medium text-foreground">{device.platform.browser}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Network Information */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Wifi className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold text-foreground">{t('detailsSheet.network')}</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">{t('detailsSheet.ipAddress')}</span>
                                <code className="text-sm font-mono text-foreground">{device.ipAddress}</code>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{t('detailsSheet.location')}</span>
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-muted-foreground" />
                                    <span className="text-sm text-foreground">{device.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Activity Information */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold text-foreground">{t('detailsSheet.activity')}</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">{t('detailsSheet.lastSeen')}</span>
                                <span className="text-sm text-foreground">
                                    {formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">{t('detailsSheet.totalCalls')}</span>
                                <span className="text-sm font-medium text-foreground">
                                    {device.stats.totalCalls.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">{t('detailsSheet.keysAccessed')}</span>
                                <span className="text-sm font-medium text-foreground">
                                    {device.stats.keysAccessed}
                                </span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Security Information */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-sm font-semibold text-foreground">{t('detailsSheet.security')}</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="space-y-1">
                                <span className="text-sm text-muted-foreground">{t('detailsSheet.fingerprint')}</span>
                                <code className="block text-xs font-mono p-2 rounded bg-muted text-foreground break-all">
                                    {device.fingerprintHash}
                                </code>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                        {device.status === 'pending' && (
                            <>
                                <Button
                                    onClick={() => {
                                        onApprove(device);
                                        onOpenChange(false);
                                    }}
                                    className="w-full"
                                >
                                    <CheckCircle className="h-4 w-4 me-2" />
                                    {t('detailsSheet.approveDevice')}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        onSuspend(device);
                                        onOpenChange(false);
                                    }}
                                    className="w-full"
                                >
                                    <Ban className="h-4 w-4 me-2" />
                                    {t('detailsSheet.suspendDevice')}
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        onRevoke(device);
                                        onOpenChange(false);
                                    }}
                                    className="w-full"
                                >
                                    <XCircle className="h-4 w-4 me-2" />
                                    {t('detailsSheet.rejectDevice')}
                                </Button>
                            </>
                        )}

                        {device.status === 'active' && (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        onSuspend(device);
                                        onOpenChange(false);
                                    }}
                                    className="w-full"
                                >
                                    <Ban className="h-4 w-4 me-2" />
                                    {t('detailsSheet.suspendDevice')}
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => {
                                        onRevoke(device);
                                        onOpenChange(false);
                                    }}
                                    className="w-full"
                                >
                                    <XCircle className="h-4 w-4 me-2" />
                                    {t('detailsSheet.revokeAccess')}
                                </Button>
                            </>
                        )}

                        {device.status === 'suspended' && (
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    onRevoke(device);
                                    onOpenChange(false);
                                }}
                                className="w-full"
                            >
                                <XCircle className="h-4 w-4 me-2" />
                                {t('detailsSheet.revokeAccess')}
                            </Button>
                        )}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
