'use client';

import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    icon: LucideIcon;
    label: string;
    value: number | string;
    trend?: {
        direction: 'up' | 'down' | 'neutral';
        value: string;
    };
    className?: string;
    onClick?: () => void;
}

export function MetricCard({ icon: Icon, label, value, trend, className, onClick }: MetricCardProps) {
    const trendColors = {
        up: 'text-green-600 dark:text-green-400',
        down: 'text-red-600 dark:text-red-400',
        neutral: 'text-muted-foreground',
    };

    const trendIcons = {
        up: '↑',
        down: '↓',
        neutral: '→',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -4 }}
        >
            <Card
                className={cn(
                    'transition-all duration-200 cursor-pointer hover:shadow-lg hover:border-primary/50',
                    className
                )}
                onClick={onClick}
            >
                <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Icon className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 space-y-1">
                        <p className="text-4xl font-bold tracking-tight">{value}</p>
                        <p className="text-sm text-muted-foreground">{label}</p>
                    </div>

                    {trend && (
                        <div className={cn('mt-2 text-xs font-medium', trendColors[trend.direction])}>
                            <span className="me-1">{trendIcons[trend.direction]}</span>
                            {trend.value}
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
