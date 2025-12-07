'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Check, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export function PricingSection() {
    const t = useTranslations('LandingPage.pricing');

    const plans = [
        { key: 'community', featured: false },
        { key: 'enterprise', featured: true },
    ];

    return (
        <section className="py-24 px-4 bg-background" id="pricing">
            <div className="container mx-auto">
                {/* Header - follows typography rules */}
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

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {plans.map((plan, index) => {
                        const features = t.raw(`${plan.key}.features`) as string[];

                        return (
                            <motion.div
                                key={plan.key}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                                className="relative"
                            >
                                {/* SHINE BORDER - Enterprise Only - uses CSS variables */}
                                {plan.featured && (
                                    <div className="absolute inset-0 rounded-2xl p-[3px] overflow-hidden">
                                        <motion.div
                                            className="absolute inset-0 rounded-2xl"
                                            style={{
                                                background: 'conic-gradient(from 0deg, var(--chart-4), var(--primary), var(--chart-3), var(--chart-4))',
                                            }}
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                                        />
                                        <div className="absolute inset-[3px] rounded-2xl bg-muted" />
                                    </div>
                                )}

                                <div 
                                    className={cn(
                                        'relative h-full rounded-2xl p-8 flex flex-col',
                                        plan.featured 
                                            ? 'bg-muted border-transparent' 
                                            : 'bg-card border border-border'
                                    )}
                                >
                                    {/* RECOMMENDED Badge */}
                                    {plan.featured && (
                                        <div className="absolute -top-4 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 flex items-center gap-1.5 bg-chart-4 text-primary-foreground text-sm font-bold px-4 py-1.5 rounded-full shadow-lg shadow-chart-4/30">
                                            <Star className="size-4 fill-primary-foreground" />
                                            موصى به
                                        </div>
                                    )}

                                    {/* Plan Header */}
                                    <div className="mb-8 pt-4">
                                        <h3 className="text-2xl font-semibold text-foreground mb-3">
                                            {t(`${plan.key}.title`)}
                                        </h3>
                                        <div className="flex items-baseline gap-2 mb-3">
                                            <span className={cn(
                                                'text-5xl font-bold',
                                                plan.featured ? 'text-chart-4' : 'text-foreground'
                                            )}>
                                                {t(`${plan.key}.price`)}
                                            </span>
                                        </div>
                                        <p className="text-muted-foreground">
                                            {t(`${plan.key}.description`)}
                                        </p>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-4 mb-8 flex-grow">
                                        {features.map((feature, i) => (
                                            <motion.li 
                                                key={i} 
                                                className="flex items-start gap-3"
                                                initial={{ opacity: 0, x: -10 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: index * 0.2 + i * 0.05 }}
                                            >
                                                <div className={cn(
                                                    'rounded-full p-0.5 mt-0.5',
                                                    plan.featured ? 'bg-chart-4' : 'bg-chart-2'
                                                )}>
                                                    <Check className="size-4 text-primary-foreground" />
                                                </div>
                                                <span className="text-muted-foreground">{feature}</span>
                                            </motion.li>
                                        ))}
                                    </ul>

                                    {/* CTA - uses semantic button styles */}
                                    <Button
                                        className={cn(
                                            'w-full h-12 text-base font-semibold',
                                            plan.featured 
                                                ? 'bg-chart-4 hover:bg-chart-4/90 text-primary-foreground shadow-lg shadow-chart-4/30'
                                                : 'bg-secondary hover:bg-accent text-foreground border border-border'
                                        )}
                                        asChild
                                    >
                                        <a href={plan.key === 'community' ? '#' : '#contact'}>
                                            {t(`${plan.key}.cta`)}
                                        </a>
                                    </Button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
