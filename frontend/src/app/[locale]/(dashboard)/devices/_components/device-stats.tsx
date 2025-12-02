'use client';

import { DeviceStats } from '@/types/device';
import { Monitor, Clock, XCircle, Wifi, WifiOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DeviceStatsProps {
    stats: DeviceStats;
    onFilterByStatus: (status: string) => void;
}

export function DeviceStatsBar({ stats, onFilterByStatus }: DeviceStatsProps) {
    const statCards = [
        {
            label: 'Total Devices',
            value: stats.total,
            icon: Monitor,
            status: 'all',
            colorClass: 'text-foreground'
        },
        {
            label: 'Active',
            value: stats.active,
            icon: Wifi,
            status: 'active',
            colorClass: 'text-green-600 dark:text-green-500'
        },
        {
            label: 'Pending',
            value: stats.pending,
            icon: Clock,
            status: 'pending',
            colorClass: 'text-yellow-600 dark:text-yellow-500'
        },
        {
            label: 'Suspended',
            value: stats.suspended,
            icon: XCircle,
            status: 'suspended',
            colorClass: 'text-red-600 dark:text-red-500'
        },
        {
            label: 'Offline',
            value: stats.offline,
            icon: WifiOff,
            status: 'offline',
            colorClass: 'text-muted-foreground'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={stat.status}
                        className={cn(
                            "p-4 cursor-pointer transition-all duration-200",
                            "hover:shadow-md hover:scale-105",
                            "border-border bg-card"
                        )}
                        onClick={() => onFilterByStatus(stat.status)}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className={cn("text-2xl font-bold mt-1", stat.colorClass)}>
                                    {stat.value}
                                </p>
                            </div>
                            <Icon className={cn("h-8 w-8", stat.colorClass)} />
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}
