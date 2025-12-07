'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { UserPlus, FileSignature, CheckCircle2, ArrowRight } from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface Step {
    number: number;
    icon: LucideIcon;
    titleKey: string;
    descKey: string;
}

export function HowItWorks() {
    const t = useTranslations('LandingPage.howItWorks');

    const steps: Step[] = [
        {
            number: 1,
            icon: UserPlus,
            titleKey: 'step1.title',
            descKey: 'step1.description',
        },
        {
            number: 2,
            icon: FileSignature,
            titleKey: 'step2.title',
            descKey: 'step2.description',
        },
        {
            number: 3,
            icon: CheckCircle2,
            titleKey: 'step3.title',
            descKey: 'step3.description',
        },
    ];

    return (
        <section className="py-24 px-4" id="how-it-works">
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

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 max-w-6xl mx-auto relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-16 start-0 end-0 h-0.5">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-border to-transparent" />
                    </div>

                    {steps.map((step, index) => (
                        <motion.div
                            key={step.number}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: index * 0.2 }}
                            className="relative"
                        >
                            {/* Step Card */}
                            <div className="relative bg-card border border-border rounded-lg p-6 space-y-4 hover:border-primary/50 transition-all duration-300 hover:shadow-lg h-full min-h-[220px] flex flex-col">
                                {/* Number Badge */}
                                <div className="absolute -top-4 start-6">
                                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-4 border-background">
                                        <span className="text-sm font-bold text-primary-foreground">
                                            {step.number}
                                        </span>
                                    </div>
                                </div>

                                {/* Icon */}
                                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mt-2">
                                    <step.icon className="h-7 w-7 text-primary" />
                                </div>

                                {/* Content */}
                                <div className="space-y-2 flex-grow">
                                    <h3 className="text-xl font-semibold">{t(step.titleKey)}</h3>
                                    <p className="text-muted-foreground leading-relaxed">
                                        {t(step.descKey)}
                                    </p>
                                </div>
                            </div>

                            {/* Arrow Connector (Desktop) */}
                            {index < steps.length - 1 && (
                                <div className="hidden md:flex absolute top-16 start-full w-full items-center justify-center z-20">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                                    >
                                        <ArrowRight className="h-6 w-6 text-primary -ms-3 rtl:rotate-180" />
                                    </motion.div>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
