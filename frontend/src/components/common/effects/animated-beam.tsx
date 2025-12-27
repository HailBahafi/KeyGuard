'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, RefObject, useEffect, useState, useId } from 'react';

interface AnimatedBeamProps {
    containerRef: RefObject<HTMLElement>;
    fromRef: RefObject<HTMLElement>;
    toRef: RefObject<HTMLElement>;
    curvature?: number;
    endYOffset?: number;
    duration?: number;
    delay?: number;
    pathColor?: string;
    pathWidth?: number;
    gradientStartColor?: string;
    gradientStopColor?: string;
    dotSize?: number;
    showDot?: boolean;
    startXOffset?: number;
    startYOffset?: number;
    endXOffset?: number;
}

/**
 * AnimatedBeam - Professional beam animation component
 * 
 * CRITICAL FOR RTL: This component animates in the LOGICAL direction of data flow,
 * not the visual layout direction. In RTL layouts, nodes may appear right-to-left,
 * but the beam always travels in the sequence you specify (from → to).
 * 
 * @reference Based on Magic UI Animated Beam
 * @see https://magicui.design/docs/components/animated-beam
 */
export function AnimatedBeam({
    containerRef,
    fromRef,
    toRef,
    curvature = 0,
    endYOffset = 0,
    duration = 2,
    delay = 0,
    pathColor = 'rgba(255, 255, 255, 0.05)',
    pathWidth = 2,
    gradientStartColor = '#ef4444',
    gradientStopColor = '#f59e0b',
    dotSize = 4,
    showDot = true,
    startXOffset = 0,
    startYOffset = 0,
    endXOffset = 0,
}: AnimatedBeamProps) {
    const [pathD, setPathD] = useState<string>('');
    const [svgDimensions, setSvgDimensions] = useState({ width: 0, height: 0 });
    const pathRef = useRef<SVGPathElement>(null);
    const isInView = useInView(containerRef, { once: false, margin: '-100px' });

    // Use useId for stable, unique gradient ID
    const baseId = useId();
    const gradientId = `beam-gradient-${baseId.replace(/:/g, '-')}`;

    useEffect(() => {
        const updatePath = () => {
            if (!containerRef.current || !fromRef.current || !toRef.current) {
                return;
            }

            const containerRect = containerRef.current.getBoundingClientRect();
            const fromRect = fromRef.current.getBoundingClientRect();
            const toRect = toRef.current.getBoundingClientRect();

            // Set SVG dimensions to match container
            setSvgDimensions({
                width: containerRect.width,
                height: containerRect.height,
            });

            // Calculate center points of nodes relative to container
            const fromX = fromRect.left - containerRect.left + fromRect.width / 2 + startXOffset;
            const fromY = fromRect.top - containerRect.top + fromRect.height / 2 + startYOffset;
            const toX = toRect.left - containerRect.left + toRect.width / 2 + endXOffset;
            const toY = toRect.top - containerRect.top + toRect.height / 2 + endYOffset;

            // Calculate control point for quadratic bezier curve
            const midX = (fromX + toX) / 2;
            const midY = (fromY + toY) / 2 + curvature;

            // Generate SVG path using quadratic bezier curve
            // This creates a smooth curve from the FROM node to the TO node
            const path = `M ${fromX},${fromY} Q ${midX},${midY} ${toX},${toY}`;
            setPathD(path);
        };

        // Initial path calculation
        updatePath();

        // Recalculate on window resize
        const resizeObserver = new ResizeObserver(updatePath);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        window.addEventListener('resize', updatePath);

        return () => {
            window.removeEventListener('resize', updatePath);
            resizeObserver.disconnect();
        };
    }, [containerRef, fromRef, toRef, curvature, endYOffset, startXOffset, startYOffset, endXOffset]);

    // Don't render until path is calculated
    if (!pathD || svgDimensions.width === 0) {
        return null;
    }

    return (
        <svg
            className="absolute inset-0 pointer-events-none z-10"
            width={svgDimensions.width}
            height={svgDimensions.height}
            viewBox={`0 0 ${svgDimensions.width} ${svgDimensions.height}`}
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                {/* Gradient definition - flows in the direction of the path */}
                <linearGradient
                    id={gradientId}
                    gradientUnits="userSpaceOnUse"
                >
                    <stop offset="0%" stopColor={gradientStartColor} stopOpacity="0" />
                    <stop offset="5%" stopColor={gradientStartColor} stopOpacity="1" />
                    <stop offset="95%" stopColor={gradientStopColor} stopOpacity="1" />
                    <stop offset="100%" stopColor={gradientStopColor} stopOpacity="0" />
                </linearGradient>

                {/* Glow filter for enhanced visibility */}
                <filter id={`${gradientId}-glow`}>
                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Static background path (always visible) */}
            <path
                d={pathD}
                stroke={pathColor}
                strokeWidth={pathWidth}
                strokeLinecap="round"
                fill="none"
            />

            {/* Animated beam path (appears when in view) */}
            {isInView && (
                <>
                    <motion.path
                        ref={pathRef}
                        d={pathD}
                        stroke={`url(#${gradientId})`}
                        strokeWidth={pathWidth + 2}
                        strokeLinecap="round"
                        fill="none"
                        filter={`url(#${gradientId}-glow)`}
                        initial={{ 
                            pathLength: 0, 
                            opacity: 0,
                        }}
                        animate={{ 
                            pathLength: [0, 1],
                            opacity: [0, 1, 1, 0],
                        }}
                        transition={{
                            pathLength: { 
                                duration, 
                                delay, 
                                ease: 'easeInOut' 
                            },
                            opacity: { 
                                duration: duration + 0.5, 
                                delay,
                                times: [0, 0.1, 0.9, 1],
                                ease: 'easeInOut',
                            },
                            repeat: Infinity,
                            repeatDelay: 1,
                        }}
                    />

                    {/* Animated particle dot that follows the beam */}
                    {showDot && (
                        <motion.circle
                            cx="0"
                            cy="0"
                            r={dotSize}
                            fill={gradientStartColor}
                            filter={`url(#${gradientId}-glow)`}
                        >
                            <animateMotion
                                dur={`${duration}s`}
                                repeatCount="indefinite"
                                begin={`${delay}s`}
                                path={pathD}
                            />
                            <animate
                                attributeName="opacity"
                                values="0;1;1;0"
                                dur={`${duration + 0.5}s`}
                                repeatCount="indefinite"
                                begin={`${delay}s`}
                                keyTimes="0;0.1;0.9;1"
                            />
                        </motion.circle>
                    )}

                    {/* Additional glow particle for enhanced effect */}
                    {showDot && (
                        <motion.circle
                            cx="0"
                            cy="0"
                            r={dotSize * 2}
                            fill={gradientStartColor}
                            opacity="0.3"
                            filter="blur(8px)"
                        >
                            <animateMotion
                                dur={`${duration}s`}
                                repeatCount="indefinite"
                                begin={`${delay}s`}
                                path={pathD}
                            />
                            <animate
                                attributeName="opacity"
                                values="0;0.3;0.3;0"
                                dur={`${duration + 0.5}s`}
                                repeatCount="indefinite"
                                begin={`${delay}s`}
                                keyTimes="0;0.1;0.9;1"
                            />
                        </motion.circle>
                    )}
                </>
            )}
        </svg>
    );
}

/**
 * CORRECT Usage Example for RTL "How It Works" Section:
 * 
 * CRITICAL: In RTL, nodes appear visually as [Client] [KeyGuard] [LLM] from right to left,
 * BUT you must still pass refs in LOGICAL order (Client → KeyGuard → LLM)
 * 
 * ```tsx
 * 'use client';
 * 
 * import { useRef } from 'react';
 * import { AnimatedBeam } from '@/components/ui/animated-beam';
 * import { Smartphone, Shield, Brain, Lock } from 'lucide-react';
 * 
 * export function HowItWorksRTL() {
 *   const containerRef = useRef<HTMLDivElement>(null);
 *   const clientRef = useRef<HTMLDivElement>(null);     // Node 1: Client
 *   const keyguardRef = useRef<HTMLDivElement>(null);   // Node 2: KeyGuard
 *   const llmRef = useRef<HTMLDivElement>(null);        // Node 3: LLM Provider
 * 
 *   return (
 *     <section className="py-20 px-4 bg-black" dir="rtl">
 *       <h2 className="text-4xl font-bold text-center text-white mb-4">
 *         كيف يعمل
 *       </h2>
 *       <p className="text-gray-400 text-center mb-16">
 *         ثلاث خطوات لتأمين مفاتيح API الخاصة بك
 *       </p>
 * 
 *       <div 
 *         ref={containerRef} 
 *         className="relative w-full max-w-5xl mx-auto h-96 flex items-center justify-between px-20"
 *       >
 *         // RTL Visual Layout: [Client (right)] [KeyGuard (center)] [LLM (left)]
 *         
 *         // Node 1: Client App (appears on RIGHT in RTL)
 *         <div 
 *           ref={clientRef}
 *           className="relative z-20 flex flex-col items-center gap-4"
 *         >
 *           <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-red-500 bg-gray-900/80 backdrop-blur">
 *             <Smartphone className="h-8 w-8 text-red-400" />
 *           </div>
 *           <div className="text-center">
 *             <p className="text-sm font-semibold text-white">تطبيق العميل</p>
 *             <p className="text-xs text-red-400">طلب غير آمن</p>
 *           </div>
 *         </div>
 * 
 *         // Node 2: KeyGuard (appears in CENTER)
 *         <div 
 *           ref={keyguardRef}
 *           className="relative z-20 flex flex-col items-center gap-4"
 *         >
 *           <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-purple-600 shadow-2xl shadow-blue-500/50 ring-4 ring-blue-500/20">
 *             <Shield className="h-12 w-12 text-white" />
 *             // Lock icon that appears during encryption
 *             <div className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
 *               <Lock className="h-4 w-4 text-white" />
 *             </div>
 *           </div>
 *           <div className="text-center">
 *             <p className="text-sm font-semibold text-white">KeyGuard</p>
 *             <p className="text-xs text-blue-400">تشفير وحماية</p>
 *           </div>
 *         </div>
 * 
 *         // Node 3: LLM Provider (appears on LEFT in RTL)
 *         <div 
 *           ref={llmRef}
 *           className="relative z-20 flex flex-col items-center gap-4"
 *         >
 *           <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-green-500 bg-gray-900/80 backdrop-blur">
 *             <Brain className="h-8 w-8 text-green-400" />
 *           </div>
 *           <div className="text-center">
 *             <p className="text-sm font-semibold text-white">مزود LLM</p>
 *             <p className="text-xs text-green-400">طلب محمي</p>
 *           </div>
 *         </div>
 * 
 *         // BEAM 1: Client → KeyGuard (UNSECURED - Red/Orange)
 *         // This beam shows the UNSECURED request going FROM client TO KeyGuard
 *         <AnimatedBeam
 *           containerRef={containerRef}
 *           fromRef={clientRef}      // Start: Client (right side in RTL)
 *           toRef={keyguardRef}      // End: KeyGuard (center)
 *           curvature={-60}          // Curve upward
 *           duration={2}
 *           delay={0}
 *           gradientStartColor="#ef4444"  // Red (danger)
 *           gradientStopColor="#f59e0b"   // Orange (warning)
 *           pathWidth={2}
 *         />
 * 
 *         // BEAM 2: KeyGuard → LLM (SECURED - Blue/Green)
 *         // This beam shows the SECURED request going FROM KeyGuard TO LLM
 *         <AnimatedBeam
 *           containerRef={containerRef}
 *           fromRef={keyguardRef}    // Start: KeyGuard (center)
 *           toRef={llmRef}           // End: LLM (left side in RTL)
 *           curvature={-60}          // Curve upward
 *           duration={2}
 *           delay={2.5}              // Starts AFTER first beam (2s animation + 0.5s pause)
 *           gradientStartColor="#3b82f6"  // Blue (trust)
 *           gradientStopColor="#10b981"   // Green (success)
 *           pathWidth={2}
 *         />
 *       </div>
 * 
 *       // Labels below the animation
 *       <div className="flex justify-center gap-8 mt-8" dir="rtl">
 *         <div className="flex items-center gap-2">
 *           <div className="h-3 w-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500" />
 *           <span className="text-sm text-gray-400">طلب غير آمن</span>
 *         </div>
 *         <div className="flex items-center gap-2">
 *           <div className="h-3 w-3 rounded-full bg-gradient-to-r from-blue-500 to-green-500" />
 *           <span className="text-sm text-gray-400">طلب محمي</span>
 *         </div>
 *       </div>
 *     </section>
 *   );
 * }
 * ```
 * 
 * KEY POINTS FOR RTL:
 * 1. Visual layout (RTL): Nodes appear [Right → Center → Left]
 * 2. Logical flow: Always Client → KeyGuard → LLM (never changes)
 * 3. First beam (red): Shows unsecured request going TO KeyGuard
 * 4. Second beam (blue): Shows secured request going FROM KeyGuard to LLM
 * 5. The component calculates actual pixel positions, so it works in any direction
 */