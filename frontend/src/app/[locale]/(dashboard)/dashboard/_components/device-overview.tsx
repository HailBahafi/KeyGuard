'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useTranslations } from 'next-intl';
import { Monitor } from 'lucide-react';

interface DeviceStatus {
    active: number;
    idle: number;
    offline: number;
}

interface TopDevice {
    name: string;
    calls: number;
    percentage: number;
}

interface DeviceOverviewProps {
    status: DeviceStatus;
    topDevices: TopDevice[];
}

const COLORS = {
    active: '#10b981',
    idle: '#f59e0b',
    offline: '#6b7280',
};

export function DeviceOverview({ status, topDevices }: DeviceOverviewProps) {
    const t = useTranslations('Dashboard.devices');
    const tSections = useTranslations('Dashboard.sections');
    const tEmpty = useTranslations('Dashboard.empty');

    const pieData = [
        { name: t('active'), value: status.active, color: COLORS.active },
        { name: t('idle'), value: status.idle, color: COLORS.idle },
        { name: t('offline'), value: status.offline, color: COLORS.offline },
    ];

    const totalDevices = status.active + status.idle + status.offline;

    if (totalDevices === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{tSections('deviceStatus')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Monitor className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm font-medium">{tEmpty('noDevices')}</p>
                        <p className="text-xs text-muted-foreground mt-1">{tEmpty('noDevicesSubtext')}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{tSections('deviceStatus')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Pie Chart */}
                <div className="relative">
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-3xl font-bold">{totalDevices}</p>
                            <p className="text-xs text-muted-foreground">Devices</p>
                        </div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-4">
                    {pieData.map((entry) => (
                        <div key={entry.name} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-xs text-muted-foreground">
                                {entry.name}: {entry.value}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Top Devices */}
                {topDevices.length > 0 && (
                    <div className="space-y-3 pt-4 border-t">
                        <h4 className="text-sm font-medium">{tSections('topDevices')}</h4>
                        {topDevices.map((device, index) => (
                            <div key={device.name} className="space-y-1">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-muted-foreground">{index + 1}.</span>
                                        <span className="font-medium">{device.name}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {t('calls', { count: device.calls })}
                                    </span>
                                </div>
                                <div className="h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all"
                                        style={{ width: `${device.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
