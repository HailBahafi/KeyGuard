'use client';

import { motion, useInView } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Smartphone, Shield, Brain, Lock } from 'lucide-react';
import { useRef, forwardRef, useState, useEffect } from 'react';
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
        <div className="flex flex-col items-center gap-4 z-10">
            <div
                ref={ref}
                className={cn(
                    'relative flex items-center justify-center rounded-full transition-all duration-300',
                    isCenter 
                        ? 'size-28 md:size-32 bg-gradient-to-br from-primary via-chart-3 to-primary shadow-2xl shadow-primary/40' 
                        : 'size-20 md:size-24 bg-card border-2',
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
                        animate={{ scale: 1, y: -50 }}
                        className="absolute -top-4 bg-chart-2 rounded-full p-2.5 shadow-lg shadow-chart-2/50 z-20"
                    >
                        <Lock className="size-5 text-primary-foreground" />
                    </motion.div>
                )}
            </div>
            <span className="text-sm md:text-base font-semibold text-foreground">{label}</span>
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
    const pathId = `beam-${Math.random().toString(36).substr(2, 9)}`;
    const gradientId = `gradient-${pathId}`;
    
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
                    {/* Glowing particle */}
                    <motion.circle
                        r="8"
                        fill={colors.from}
                        filter="url(#glow)"
                        initial={{ offsetDistance: "0%" }}
                        animate={{ offsetDistance: "100%" }}
                        style={{ offsetPath: `path('${pathD}')` }}
                        transition={{ duration: 2, ease: "easeInOut" }}
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

    // Animation cycle
    useEffect(() => {
        if (!isInView) {
            setPhase('idle');
            return;
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

    // Node positions (relative percentages)
    const nodes = {
        client: { x: 85, y: 50 },   // Right (RTL)
        keyguard: { x: 50, y: 50 }, // Center
        llm: { x: 15, y: 50 },      // Left (RTL)
    };

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
                    {/* SVG Beams - uses CSS variable colors via chart tokens */}
                    <AnimatedBeamLine
                        start={{ x: containerRef.current ? containerRef.current.clientWidth * 0.85 : 680, y: 120 }}
                        end={{ x: containerRef.current ? containerRef.current.clientWidth * 0.50 : 400, y: 120 }}
                        isActive={phase === 'beam1' || phase === 'lock'}
                        colors={{ from: 'var(--destructive)', to: 'var(--chart-4)' }}
                    />
                    <AnimatedBeamLine
                        start={{ x: containerRef.current ? containerRef.current.clientWidth * 0.50 : 400, y: 120 }}
                        end={{ x: containerRef.current ? containerRef.current.clientWidth * 0.15 : 120, y: 120 }}
                        isActive={phase === 'beam2'}
                        colors={{ from: 'var(--primary)', to: 'var(--chart-2)' }}
                    />

                    {/* Nodes Container */}
                    <div className="absolute inset-0 flex items-center justify-between px-8 md:px-16">
                        {/* Client Node (Right in RTL) */}
                        <div className="order-3">
                            <CircleNode
                                icon={<Smartphone className="size-10 text-destructive" />}
                                label="تطبيق العميل"
                                borderColor="border-destructive"
                            />
                        </div>

                        {/* KeyGuard Node (Center) */}
                        <div className="order-2">
                            <CircleNode
                                icon={<Shield className="size-12 text-primary-foreground" />}
                                label="KeyGuard"
                                borderColor="border-primary"
                                isCenter
                                showLock={phase === 'lock' || phase === 'beam2'}
                            />
                        </div>

                        {/* LLM Node (Left in RTL) */}
                        <div className="order-1">
                            <CircleNode
                                icon={<Brain className="size-10 text-chart-2" />}
                                label="مزود LLM"
                                borderColor="border-chart-2"
                            />
                        </div>
                    </div>

                    {/* Beam Labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-around text-sm">
                        <span className="text-chart-2 font-medium">طلب محمي ✓</span>
                        <span className="text-destructive font-medium">طلب غير آمن</span>
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
