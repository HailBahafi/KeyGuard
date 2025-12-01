'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Smartphone, Globe, FileText, DollarSign } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Feature {
    icon: LucideIcon;
    titleKey: string;
    descKey: string;
    gradient: string;
}

export function FeaturesGrid() {
    const t = useTranslations('LandingPage.features');

    const features: Feature[] = [
        {
            icon: Smartphone,
            titleKey: 'deviceBinding.title',
            descKey: 'deviceBinding.description',
            gradient: 'from-blue-500/10 to-cyan-500/10',
        },
        {
            icon: Globe,
            titleKey: 'dataSovereignty.title',
            descKey: 'dataSovereignty.description',
            gradient: 'from-green-500/10 to-emerald-500/10',
        },
        {
            icon: FileText,
            titleKey: 'realTimeLogs.title',
            descKey: 'realTimeLogs.description',
            gradient: 'from-purple-500/10 to-pink-500/10',
        },
        {
            icon: DollarSign,
            titleKey: 'costControl.title',
            descKey: 'costControl.description',
            gradient: 'from-orange-500/10 to-red-500/10',
        },
    ];

    return (
        <section className="py-24 px-4 relative" id="features">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-muted/30" />

            <div className="container mx-auto relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 space-y-4"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                        {t('title')}
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </motion.div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.titleKey}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <Card className="h-full border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 group">
                                <CardHeader className="space-y-4">
                                    {/* Icon with Gradient Background */}
                                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className="h-7 w-7 text-primary" />
                                    </div>

                                    <CardTitle className="text-xl font-semibold">
                                        {t(feature.titleKey)}
                                    </CardTitle>
                                </CardHeader>

                                <CardContent>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {t(feature.descKey)}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
