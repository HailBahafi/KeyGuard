'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Activity, Zap, TrendingUp } from 'lucide-react';
import { NumberTicker } from '@/components/common/effects';

interface StatCard {
    icon: React.ReactNode;
    value: number;
    startValue: number;
    suffix: string;
    prefix?: string;
    labelKey: string;
    subLabelKey: string;
    decimals?: number;
    color: string;
}

export function StatsSection() {
    const t = useTranslations('LandingPage.socialProof');

    const stats: StatCard[] = [
        {
            icon: <Activity className="size-6" />,
            value: 99.99,
            startValue: 95,
            suffix: '%',
            labelKey: 'metrics.uptime',
            subLabelKey: 'metrics.uptimeDesc',
            decimals: 2,
            color: 'text-chart-1', // Blue from globals.css
        },
        {
            icon: <Zap className="size-6" />,
            value: 0,
            startValue: 50,
            suffix: 'ms',
            prefix: '~',
            labelKey: 'metrics.latency',
            subLabelKey: 'metrics.latencyDesc',
            decimals: 0,
            color: 'text-chart-3', // Purple from globals.css
        },
        {
            icon: <TrendingUp className="size-6" />,
            value: 10000,
            startValue: 0,
            suffix: '+',
            labelKey: 'metrics.requests',
            subLabelKey: 'metrics.requestsDesc',
            decimals: 0,
            color: 'text-chart-2', // Green from globals.css
        },
    ];

    return (
        <section className="py-24 px-4 bg-background">
            <div className="container mx-auto">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 space-y-4"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                        {t('title')}
                    </h2>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.labelKey}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group relative"
                        >
                            {/* Animated border container */}
                            <div className="relative rounded-2xl p-[1px] overflow-hidden bg-gradient-to-r from-transparent via-border to-transparent">
                                {/* Rotating gradient border - uses primary color */}
                                <div 
                                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{
                                        background: 'conic-gradient(from 0deg, transparent, var(--primary), var(--chart-3), transparent)',
                                        animation: 'spin 3s linear infinite',
                                    }}
                                />
                                
                                {/* Card content */}
                                <div className="relative bg-card border border-border rounded-2xl p-8 hover-lift">
                                    {/* Icon - uses primary color */}
                                    <div className="inline-flex items-center justify-center size-12 rounded-xl bg-primary/10 text-primary mb-4">
                                        {stat.icon}
                                    </div>

                                    {/* Number - uses chart colors for variety */}
                                    <div className={`text-4xl md:text-5xl font-bold ${stat.color} mb-2`}>
                                        <NumberTicker
                                            value={stat.value}
                                            startValue={stat.startValue}
                                            suffix={stat.suffix}
                                            prefix={stat.prefix}
                                            decimals={stat.decimals}
                                            duration={2}
                                            delay={0.2}
                                        />
                                    </div>

                                    {/* Label */}
                                    <p className="text-lg font-medium text-foreground mb-1">
                                        {t(stat.labelKey)}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {t(stat.subLabelKey)}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </section>
    );
}
