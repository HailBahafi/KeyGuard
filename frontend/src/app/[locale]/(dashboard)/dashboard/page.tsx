'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Key, Monitor, Activity as ActivityIcon, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useApiKeys } from '@/hooks/use-keys';
import { useDevices } from '@/hooks/use-devices';
import { useLogs } from '@/hooks/use-logs';
import { useQueryClient } from '@tanstack/react-query';

import { MetricCard } from './_components/metric-card';
import { ActivityFeed } from './_components/activity-feed';
import { DeviceOverview } from './_components/device-overview';
import { SecurityAlerts } from './_components/security-alerts';

export default function DashboardPage() {
    const t = useTranslations('Dashboard');
    const queryClient = useQueryClient();

    // Fetch real data
    const { data: keysData, isLoading: keysLoading } = useApiKeys({ page: 1, limit: 100 });
    const { data: devicesData, isLoading: devicesLoading } = useDevices({ page: 1, limit: 100 });
    const { data: logsData, isLoading: logsLoading } = useLogs({ page: 1, limit: 10 });

    const isLoading = keysLoading || devicesLoading || logsLoading;

    // Calculate metrics from real data
    const activeKeys = keysData?.keys.filter(k => k.status === 'active').length || 0;
    const totalKeys = keysData?.keys.length || 0;
    const activeDevices = devicesData?.devices.filter(d => d.status === 'active').length || 0;
    const totalDevices = devicesData?.devices.length || 0;

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: ['keys'] });
        queryClient.invalidateQueries({ queryKey: ['devices'] });
        queryClient.invalidateQueries({ queryKey: ['logs'] });
    };

    // Transform audit logs into activity feed format
    const recentActivity = useMemo(() => {
        if (!logsData?.logs) return [];
        return logsData.logs.slice(0, 10).map(log => ({
            id: log.id,
            device: log.actor.name,
            action: log.event,
            keyName: log.target.type === 'key' ? log.target.name : undefined,
            timestamp: log.timestamp,
            status: log.status === 'success' ? 'success' as const : 'failed' as const,
        }));
    }, [logsData]);

    // Derive security alerts from audit logs with critical/warning severity
    const securityAlerts = useMemo(() => {
        if (!logsData?.logs) return [];
        return logsData.logs
            .filter(log => (log.severity === 'critical' || log.severity === 'warning') && log.status === 'failure')
            .slice(0, 5)
            .map(log => ({
                id: log.id,
                type: log.event.includes('rate_limited') ? 'rate_limit' as const
                    : log.event.includes('suspicious') ? 'suspicious_activity' as const
                    : log.event.includes('auth') && log.status === 'failure' ? 'auth_failed' as const
                    : 'suspicious_activity' as const,
                severity: log.severity === 'critical' ? 'error' as const : 'warning' as const,
                message: log.metadata.error || `${log.event} from ${log.actor.name}`,
                timestamp: log.timestamp,
            }));
    }, [logsData]);

    // Calculate offline devices
    const offlineDevices = useMemo(() => {
        if (!devicesData?.devices) return 0;
        const baseTime = 1700000000000; // Fixed base time
        return devicesData.devices.filter(d => {
            const lastSeenTime = new Date(d.lastSeen).getTime();
            const hoursSinceLastSeen = (baseTime - lastSeenTime) / (1000 * 60 * 60);
            return d.status === 'active' && hoursSinceLastSeen > 24;
        }).length;
    }, [devicesData]);

    if (isLoading) {
        return (
            <div className="space-y-6 pb-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-96" />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('welcome', { name: 'Admin' })}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={isLoading}
                    >
                        <RefreshCw className={`h-4 w-4 me-2 ${isLoading ? 'animate-spin' : ''}`} />
                        {t('actions.refresh')}
                    </Button>
                    <Button size="sm">
                        {t('actions.addDevice')}
                    </Button>
                </div>
            </motion.div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    icon={Key}
                    label={t('metrics.activeKeys')}
                    value={activeKeys}
                    trend={{ direction: 'neutral', value: `${totalKeys} total` }}
                    onClick={() => {}}
                />
                <MetricCard
                    icon={Monitor}
                    label={t('metrics.totalDevices')}
                    value={totalDevices}
                    trend={{ direction: 'neutral', value: `${activeDevices} active` }}
                    onClick={() => {}}
                />
                <MetricCard
                    icon={ActivityIcon}
                    label={t('metrics.apiCallsToday')}
                    value="0"
                    trend={{ direction: 'neutral', value: 'N/A' }}
                    onClick={() => {}}
                />
                <MetricCard
                    icon={AlertTriangle}
                    label={t('metrics.securityAlerts')}
                    value={securityAlerts.length}
                    trend={{
                        direction: securityAlerts.length > 0 ? 'up' : 'neutral',
                        value: securityAlerts.length > 0 ? `${securityAlerts.length} active` : 'All clear',
                    }}
                    className={securityAlerts.length > 0 ? 'border-destructive/50' : ''}
                    onClick={() => {}}
                />
            </div>

            {/* Usage Chart - Removed until usage analytics endpoint is available */}

            {/* Activity Feed & Device Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                >
                    <ActivityFeed activities={recentActivity} />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                >
                    <DeviceOverview 
                        status={{
                            active: activeDevices,
                            idle: devicesData?.devices.filter(d => d.status === 'pending').length || 0,
                            offline: offlineDevices,
                        }} 
                        topDevices={[]} 
                    />
                </motion.div>
            </div>

            {/* Security Alerts */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
            >
                <SecurityAlerts
                    alerts={securityAlerts}
                    onDismiss={() => {}}
                />
            </motion.div>
        </div>
    );
}
