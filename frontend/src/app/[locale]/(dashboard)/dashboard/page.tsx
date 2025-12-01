'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Key, Monitor, Activity as ActivityIcon, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { MetricCard } from './_components/metric-card';
import { UsageChart } from './_components/usage-chart';
import { ActivityFeed } from './_components/activity-feed';
import { DeviceOverview } from './_components/device-overview';
import { SecurityAlerts } from './_components/security-alerts';
import { fetchDashboardData, DashboardData } from '@/lib/queries/dashboard-queries';

export default function DashboardPage() {
    const t = useTranslations('Dashboard');
    const [data, setData] = useState<DashboardData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const loadData = async () => {
        try {
            setIsRefreshing(true);
            const dashboardData = await fetchDashboardData('7d');
            setData(dashboardData);
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();

        // Auto-refresh every 30 seconds
        const interval = setInterval(loadData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (isLoading || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading dashboard...</p>
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
                        onClick={loadData}
                        disabled={isRefreshing}
                    >
                        <RefreshCw className={`h-4 w-4 me-2 ${isRefreshing ? 'animate-spin' : ''}`} />
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
                    value={data.metrics.activeKeys.count}
                    trend={{ direction: 'up', value: `${data.metrics.activeKeys.change} ${t('metrics.trend.from')}` }}
                    onClick={() => console.log('Navigate to keys')}
                />
                <MetricCard
                    icon={Monitor}
                    label={t('metrics.totalDevices')}
                    value={data.metrics.totalDevices.count}
                    trend={{ direction: 'up', value: `${data.metrics.totalDevices.change} ${t('metrics.trend.new')}` }}
                    onClick={() => console.log('Navigate to devices')}
                />
                <MetricCard
                    icon={ActivityIcon}
                    label={t('metrics.apiCallsToday')}
                    value={data.metrics.apiCalls.count.toLocaleString()}
                    trend={{ direction: 'up', value: `${data.metrics.apiCalls.change} ${t('metrics.trend.from')}` }}
                    onClick={() => console.log('Navigate to logs')}
                />
                <MetricCard
                    icon={AlertTriangle}
                    label={t('metrics.securityAlerts')}
                    value={data.metrics.alerts.count}
                    trend={{
                        direction: data.metrics.alerts.count > 0 ? 'up' : 'neutral',
                        value: `${data.metrics.alerts.change} ${t('metrics.trend.new')}`,
                    }}
                    className={data.metrics.alerts.count > 0 ? 'border-destructive/50' : ''}
                    onClick={() => console.log('Scroll to alerts')}
                />
            </div>

            {/* Usage Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
            >
                <UsageChart data={data.usage} />
            </motion.div>

            {/* Activity Feed & Device Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                >
                    <ActivityFeed activities={data.recentActivity} />
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                >
                    <DeviceOverview status={data.deviceStatus} topDevices={data.topDevices} />
                </motion.div>
            </div>

            {/* Security Alerts */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
            >
                <SecurityAlerts
                    alerts={data.alerts}
                    onDismiss={(alertId) => {
                        console.log('Dismiss alert:', alertId);
                        // In production, would call API to dismiss alert
                        setData({
                            ...data,
                            alerts: data.alerts.filter((a) => a.id !== alertId),
                        });
                    }}
                />
            </motion.div>
        </div>
    );
}
