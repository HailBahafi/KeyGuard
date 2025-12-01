'use client';

import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { ArrowRight, BookOpen } from 'lucide-react';
import { AnimatedTerminal } from './animated-terminal';

export function HeroSection() {
    const t = useTranslations('LandingPage.hero');

    return (
        <section className="relative min-h-screen flex items-center py-20 px-4 overflow-hidden">
            {/* Cyberpunk Grid Background */}
            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]" />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />

            <div className="container mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left: Text Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7 }}
                        className="space-y-8"
                    >
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5"
                        >
                            <span className="text-xs font-semibold text-primary">{t('badge')}</span>
                        </motion.div>

                        {/* Headline */}
                        <div className="space-y-4">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.3 }}
                                className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]"
                            >
                                {t('headline')}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.7, delay: 0.4 }}
                                className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl"
                            >
                                {t('subheadline')}
                            </motion.p>
                        </div>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.5 }}
                            className="flex flex-col sm:flex-row gap-4"
                        >
                            <Button
                                size="lg"
                                className="text-base font-semibold group h-12 px-8"
                                asChild
                            >
                                <a href="#pricing">
                                    {t('ctaPrimary')}
                                    <ArrowRight className="ms-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </a>
                            </Button>

                            <Button
                                size="lg"
                                variant="outline"
                                className="text-base font-semibold h-12 px-8"
                                asChild
                            >
                                <a href="#how-it-works">
                                    <BookOpen className="me-2 h-5 w-5" />
                                    {t('ctaSecondary')}
                                </a>
                            </Button>
                        </motion.div>

                        {/* Trust Indicators */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.7, delay: 0.6 }}
                            className="flex flex-wrap gap-6 text-sm text-muted-foreground"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-green-500" />
                                <span>{t('trustUptime')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-primary" />
                                <span>{t('trustSelfHosted')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded-full bg-blue-500" />
                                <span>{t('trustLatency')}</span>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Right: Animated Terminal */}
                    <div className="flex justify-center lg:justify-end">
                        {/* Force LTR for terminal even in RTL layouts */}
                        <div dir="ltr">
                            <AnimatedTerminal />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
