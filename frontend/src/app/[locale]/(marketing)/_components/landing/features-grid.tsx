'use client';

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Smartphone, Globe, FileText, DollarSign, Lock } from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import { useRef, MouseEvent } from 'react';
import { cn } from '@/lib/utils';

interface Feature {
    icon: LucideIcon;
    titleKey: string;
    descKey: string;
    gridClass: string;
    isHero?: boolean;
}

// 3D Tilt Card for hero feature
function TiltCard({ children, className, enabled }: { children: React.ReactNode; className?: string; enabled?: boolean }) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 50 });
    const rotateX = useTransform(mouseY, [-0.5, 0.5], ['10deg', '-10deg']);
    const rotateY = useTransform(mouseX, [-0.5, 0.5], ['-10deg', '10deg']);

    function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
        if (!ref.current || !enabled) return;
        const rect = ref.current.getBoundingClientRect();
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={enabled ? { rotateX, rotateY, transformStyle: 'preserve-3d' } : {}}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function FeaturesGrid() {
    const t = useTranslations('LandingPage.features');

    const features: Feature[] = [
        {
            icon: Smartphone,
            titleKey: 'deviceBinding.title',
            descKey: 'deviceBinding.description',
            gridClass: 'col-span-2 row-span-2',
            isHero: true,
        },
        {
            icon: FileText,
            titleKey: 'realTimeLogs.title',
            descKey: 'realTimeLogs.description',
            gridClass: 'col-span-2 row-span-1',
        },
        {
            icon: DollarSign,
            titleKey: 'costControl.title',
            descKey: 'costControl.description',
            gridClass: 'col-span-1 row-span-1',
        },
        {
            icon: Globe,
            titleKey: 'dataSovereignty.title',
            descKey: 'dataSovereignty.description',
            gridClass: 'col-span-1 row-span-1',
        },
    ];

    return (
        <section className="py-24 px-4 bg-background" id="features">
            <div className="container mx-auto">
                {/* Section Header - following typography rules */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16 space-y-4"
                >
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
                        {t('title')}
                    </h2>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                        {t('subtitle')}
                    </p>
                </motion.div>

                {/* Asymmetric Bento Grid */}
                <div 
                    className="grid grid-cols-2 md:grid-cols-4 auto-rows-[180px] gap-4 max-w-6xl mx-auto"
                    style={{ direction: 'rtl' }}
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.titleKey}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className={cn(feature.gridClass, 'group')}
                        >
                            <TiltCard enabled={feature.isHero} className="h-full">
                                <div 
                                    className={cn(
                                        'h-full rounded-2xl border border-border bg-card p-6 relative overflow-hidden',
                                        'transition-all duration-500 hover:border-accent',
                                        'hover:shadow-2xl hover:shadow-primary/10'
                                    )}
                                    style={{ direction: 'rtl' }}
                                >
                                    {/* Hero card animated border - uses CSS variables */}
                                    {feature.isHero && (
                                        <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                            <motion.div 
                                                className="absolute inset-0"
                                                style={{
                                                    background: 'conic-gradient(from 0deg, var(--primary), var(--chart-3), var(--primary))',
                                                }}
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                            />
                                            <div className="absolute inset-[2px] rounded-2xl bg-card" />
                                        </div>
                                    )}

                                    <div className="relative z-10 h-full flex flex-col">
                                        {/* Icon - uses primary color */}
                                        <div className={cn(
                                            'inline-flex items-center justify-center rounded-xl bg-primary/10 mb-4',
                                            feature.isHero ? 'size-20' : 'size-14'
                                        )}>
                                            <feature.icon className={cn('text-primary', feature.isHero ? 'size-10' : 'size-7')} />
                                            {feature.isHero && (
                                                <Lock className="size-5 text-primary-foreground absolute -bottom-1 -left-1 bg-primary rounded-full p-1" />
                                            )}
                                        </div>

                                        {/* Title - follows H3 typography rules */}
                                        <h3 className={cn('font-semibold text-foreground mb-2', feature.isHero ? 'text-2xl' : 'text-xl')}>
                                            {t(feature.titleKey)}
                                        </h3>

                                        {/* Description - follows body/small text rules */}
                                        <p className={cn('text-muted-foreground leading-relaxed', feature.isHero ? 'text-base' : 'text-sm')}>
                                            {t(feature.descKey)}
                                        </p>
                                    </div>
                                </div>
                            </TiltCard>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
