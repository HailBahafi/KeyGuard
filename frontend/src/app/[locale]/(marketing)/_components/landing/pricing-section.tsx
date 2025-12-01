'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Check } from 'lucide-react';

export function PricingSection() {
    const t = useTranslations('LandingPage.pricing');

    const plans = [
        {
            key: 'community',
            featured: false,
        },
        {
            key: 'enterprise',
            featured: true,
        },
    ];

    return (
        <section className="py-24 px-4" id="pricing">
            <div className="container mx-auto">
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
                            >
                                <Card className={`h-full ${plan.featured ? 'border-primary shadow-lg shadow-primary/10' : 'border-border'}`}>
                                    {plan.featured && (
                                        <div className="bg-primary text-primary-foreground text-center text-sm font-semibold py-2">
                                            RECOMMENDED
                                        </div>
                                    )}

                                    <CardHeader className="space-y-4">
                                        <CardTitle className="text-2xl">{t(`${plan.key}.title`)}</CardTitle>
                                        <div>
                                            <span className="text-4xl font-bold">{t(`${plan.key}.price`)}</span>
                                            {plan.key === 'community' && <span className="text-muted-foreground ms-2">/forever</span>}
                                        </div>
                                        <CardDescription className="text-base">
                                            {t(`${plan.key}.description`)}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <ul className="space-y-3">
                                            {features.map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-start gap-3">
                                                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                                    <span className="text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>

                                    <CardFooter>
                                        <Button
                                            className="w-full"
                                            variant={plan.featured ? 'default' : 'outline'}
                                            size="lg"
                                            asChild
                                        >
                                            <a href={plan.key === 'community' ? '#' : '#contact'}>
                                                {t(`${plan.key}.cta`)}
                                            </a>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
