'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Shield, Check, Server, TrendingUp, Zap, Clock } from 'lucide-react';

export function SocialProof() {
    const t = useTranslations('LandingPage.socialProof');

    const metrics = [
        { icon: TrendingUp, label: t('metrics.requests'), value: '10K+' },
        { icon: Zap, label: t('metrics.latency'), value: '0ms' },
        { icon: Clock, label: t('metrics.uptime'), value: '99.99%' },
    ];

    const badges = [
        { icon: Shield, label: t('badges.nca') },
        { icon: Check, label: t('badges.sama') },
        { icon: Server, label: t('badges.selfHosted') },
    ];

    return (
        <section className="py-16 px-4 border-y border-border bg-muted/30">
            <div className="container mx-auto">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <h3 className="text-2xl md:text-3xl font-bold">
                        {t('title')}
                    </h3>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Metrics */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="grid grid-cols-3 gap-6">
                            {metrics.map((metric, index) => (
                                <motion.div
                                    key={metric.label}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    className="text-center"
                                >
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <metric.icon className="h-6 w-6 text-primary" />
                                    </div>
                                    <div className="text-2xl font-bold mb-1">{metric.value}</div>
                                    <div className="text-sm text-muted-foreground">{metric.label}</div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Compliance Badges */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-wrap gap-4 justify-center md:justify-start items-center"
                    >
                        {badges.map((badge, index) => (
                            <motion.div
                                key={badge.label}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors"
                            >
                                <badge.icon className="h-5 w-5 text-primary" />
                                <span className="text-sm font-medium">{badge.label}</span>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
