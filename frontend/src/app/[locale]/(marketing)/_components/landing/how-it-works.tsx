'use client';

import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Smartphone, Shield, Brain, Lock } from 'lucide-react';
import { useRef, forwardRef, useState, useEffect, useId } from 'react';
import { cn } from '@/lib/utils';

// Circle Node with animated border
const CircleNode = forwardRef<
    HTMLDivElement,
    { 
        icon: React.ReactNode; 
        label: string; 
        borderColor: string;
        isCenter?: boolean;
        showLock?: boolean;
    }
>(({ icon, label, borderColor, isCenter, showLock }, ref) => {
    return (
        <div className="flex flex-col items-center gap-2 sm:gap-4 z-10">
            <div
                ref={ref}
                className={cn(
                    'relative flex items-center justify-center rounded-full transition-all duration-300',
                    isCenter 
                        ? 'size-16 sm:size-24 md:size-32 bg-gradient-to-br from-primary via-chart-3 to-primary shadow-2xl shadow-primary/40' 
                        : 'size-12 sm:size-16 md:size-24 bg-card border-2',
                    !isCenter && borderColor
                )}
            >
                {icon}
                {/* Pulsing glow for center node */}
                {isCenter && (
                    <motion.div 
                        className="absolute inset-0 rounded-full bg-primary/30"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
                {/* Lock popup */}
                {showLock && (
                    <motion.div
                        initial={{ scale: 0, y: 0 }}
                        animate={{ scale: 1, y: -40 }}
                        className="absolute -top-2 sm:-top-4 bg-chart-2 rounded-full p-1.5 sm:p-2.5 shadow-lg shadow-chart-2/50 z-20"
                    >
                        <Lock className="size-3 sm:size-5 text-primary-foreground" />
                    </motion.div>
                )}
            </div>
            <span className="text-xs sm:text-sm md:text-base font-semibold text-foreground text-center">{label}</span>
        </div>
    );
});

CircleNode.displayName = 'CircleNode';

// Animated Beam SVG with visible moving gradient
function AnimatedBeamLine({ 
    start, 
    end, 
    isActive, 
    colors 
}: { 
    start: { x: number; y: number }; 
    end: { x: number; y: number };
    isActive: boolean;
    colors: { from: string; to: string };
}) {
    // Use useId for stable, hydration-safe unique IDs
    const uniqueId = useId();
    const gradientId = `gradient-${uniqueId}`;
    
    // Create curved path
    const midX = (start.x + end.x) / 2;
    const midY = Math.min(start.y, end.y) - 60;
    const pathD = `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;

    return (
        <svg className="absolute inset-0 pointer-events-none w-full h-full" style={{ zIndex: 5 }}>
            <defs>
                <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor={colors.from} />
                    <stop offset="100%" stopColor={colors.to} />
                </linearGradient>
            </defs>
            
            {/* Background static path - uses border color */}
            <path
                d={pathD}
                stroke="var(--border)"
                strokeWidth="3"
                fill="none"
            />
            
            {/* Animated moving beam */}
            {isActive && (
                <>
                    <motion.path
                        d={pathD}
                        stroke={`url(#${gradientId})`}
                        strokeWidth="4"
                        fill="none"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 2, ease: "easeInOut" }}
                    />
                    {/* Glowing particle - uses CSS animation for offset-distance */}
                    <circle
                        r="8"
                        fill={colors.from}
                        filter="url(#glow)"
                        className="animate-beam-particle"
                        style={{ 
                            offsetPath: `path('${pathD}')`,
                        } as React.CSSProperties}
                    />
                </>
            )}
            
            {/* Glow filter */}
            <defs>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>
        </svg>
    );
}

export function HowItWorks() {
    const t = useTranslations('LandingPage.howItWorks');
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: false, margin: '-50px' });
    
    const [phase, setPhase] = useState<'idle' | 'beam1' | 'lock' | 'beam2'>('idle');
    const [containerWidth, setContainerWidth] = useState(0);

    // Track container width for responsive beams
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.clientWidth);
            }
        };

        updateWidth();
        window.addEventListener('resize', updateWidth);
        
        // Use ResizeObserver for more accurate tracking
        const resizeObserver = new ResizeObserver(updateWidth);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            window.removeEventListener('resize', updateWidth);
            resizeObserver.disconnect();
        };
    }, []);

    // Animation cycle - use startTransition to avoid the cascading render warning
    useEffect(() => {
        if (!isInView) {
            // When not in view, reset to idle without triggering immediate re-render
            const resetTimer = setTimeout(() => setPhase('idle'), 0);
            return () => clearTimeout(resetTimer);
        }

        const runCycle = () => {
            setPhase('beam1');
            
            setTimeout(() => setPhase('lock'), 2000);
            setTimeout(() => setPhase('beam2'), 2500);
            setTimeout(() => setPhase('idle'), 4500);
        };

        const timer = setTimeout(runCycle, 500);
        const interval = setInterval(runCycle, 5500);

        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [isInView]);

    // Calculate beam positions based on actual container width
    const beamY = 120;
    const rightX = containerWidth * 0.85;
    const centerX = containerWidth * 0.50;
    const leftX = containerWidth * 0.15;

    return (
        <section className="py-24 px-4 bg-background" id="how-it-works">
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

                {/* Beam Visualization */}
                <motion.div
                    ref={containerRef}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="relative h-[300px] max-w-4xl mx-auto mb-12"
                >
                    {/* SVG Beams - only render when we have valid width */}
                    {containerWidth > 0 && (
                        <>
                            <AnimatedBeamLine
                                start={{ x: rightX, y: beamY }}
                                end={{ x: centerX, y: beamY }}
                                isActive={phase === 'beam1' || phase === 'lock'}
                                colors={{ from: 'var(--destructive)', to: 'var(--chart-4)' }}
                            />
                            <AnimatedBeamLine
                                start={{ x: centerX, y: beamY }}
                                end={{ x: leftX, y: beamY }}
                                isActive={phase === 'beam2'}
                                colors={{ from: 'var(--primary)', to: 'var(--chart-2)' }}
                            />
                        </>
                    )}

                    {/* Nodes Container */}
                    <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-8 md:px-16">
                        {/* Client Node (Right in RTL) */}
                        <div className="order-3 rtl:order-1">
                            <CircleNode
                                icon={<Smartphone className="size-6 sm:size-8 md:size-10 text-destructive" />}
                                label={t('labels.clientApp')}
                                borderColor="border-destructive"
                            />
                        </div>

                        {/* KeyGuard Node (Center) */}
                        <div className={`order-2`}>
                            <CircleNode
                                icon={<Shield className="size-8 sm:size-10 md:size-12 text-primary-foreground" />}
                                label="KeyGuard"
                                borderColor="border-primary"
                                isCenter
                                showLock={phase === 'lock' || phase === 'beam2'}
                            />
                        </div>

                        {/* LLM Node (Left in RTL) */}
                        <div className="order-1 rtl:order-3">
                            <CircleNode
                                icon={<Brain className="size-6 sm:size-8 md:size-10 text-chart-2" />}
                                label={t('labels.llmProvider')}
                                borderColor="border-chart-2"
                            />
                        </div>
                    </div>

                    {/* Beam Labels */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-around text-xs sm:text-xs">
                        <span className="order-1 rtl:order-2 text-chart-2 font-medium">{t('labels.protectedRequest')}</span>
                        <span className="order-2 rtl:order-1 text-destructive font-medium">{t('labels.unsecuredRequest')}</span>
                    </div>
                </motion.div>

                {/* Steps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    {[
                        { num: 1, title: t('step1.title'), desc: t('step1.description') },
                        { num: 2, title: t('step2.title'), desc: t('step2.description') },
                        { num: 3, title: t('step3.title'), desc: t('step3.description') },
                    ].map((step, i) => (
                        <motion.div
                            key={step.num}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center p-6 rounded-xl bg-card border border-border"
                        >
                            <div className="size-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-4 font-bold">
                                {step.num}
                            </div>
                            <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                            <p className="text-sm text-muted-foreground">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
