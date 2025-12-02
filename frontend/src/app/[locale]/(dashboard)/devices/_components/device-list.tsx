'use client';

import { Device } from '@/types/device';
import { DeviceCard } from './device-card';
import { Skeleton } from '@/components/ui/skeleton';
import { LayoutGrid, Table as TableIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface DeviceListProps {
    devices: Device[];
    loading: boolean;
    onViewDetails: (device: Device) => void;
    onApprove: (device: Device) => void;
    onSuspend: (device: Device) => void;
    onRevoke: (device: Device) => void;
}

export function DeviceList({
    devices,
    loading,
    onViewDetails,
    onApprove,
    onSuspend,
    onRevoke
}: DeviceListProps) {
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-64" />
                ))}
            </div>
        );
    }

    if (devices.length === 0) {
        return (
            <div className="text-center py-12 border border-dashed border-border rounded-lg bg-muted/20">
                <p className="text-muted-foreground">No devices found matching your filters.</p>
            </div>
        );
    }

    const getStatusBadge = (status: Device['status']) => {
        const configs = {
            active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
            pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
            suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
            revoked: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        };

        return (
            <Badge className={cn(configs[status], 'border-0 capitalize')}>
                {status}
            </Badge>
        );
    };

    return (
        <div className="space-y-4">
            {/* View Toggle */}
            <div className="flex items-center justify-end gap-2">
                <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                >
                    <LayoutGrid className="h-4 w-4 me-1" />
                    Grid
                </Button>
                <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                >
                    <TableIcon className="h-4 w-4 me-1" />
                    Table
                </Button>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in duration-300">
                    {devices.map((device) => (
                        <DeviceCard
                            key={device.id}
                            device={device}
                            onViewDetails={onViewDetails}
                            onApprove={onApprove}
                            onSuspend={onSuspend}
                            onRevoke={onRevoke}
                        />
                    ))}
                </div>
            )}

            {/* Table View */}
            {viewMode === 'table' && (
                <div className="border border-border rounded-lg overflow-hidden animate-in fade-in duration-300">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead>Device Name</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Platform</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Seen</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="text-end">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {devices.map((device) => (
                                <TableRow
                                    key={device.id}
                                    className="cursor-pointer hover:bg-muted/30"
                                    onClick={() => onViewDetails(device)}
                                >
                                    <TableCell className="font-medium">{device.name}</TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="text-sm">{device.owner.name}</p>
                                            <p className="text-xs text-muted-foreground">{device.owner.email}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="text-sm">{device.platform.os} {device.platform.version}</p>
                                            {device.platform.browser && (
                                                <p className="text-xs text-muted-foreground">{device.platform.browser}</p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell>{getStatusBadge(device.status)}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="text-sm">{device.location}</TableCell>
                                    <TableCell className="text-end">
                                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                                            {device.status === 'pending' && (
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => onApprove(device)}
                                                >
                                                    Approve
                                                </Button>
                                            )}
                                            {device.status === 'active' && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onSuspend(device)}
                                                >
                                                    Suspend
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
