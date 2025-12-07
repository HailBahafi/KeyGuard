'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

interface NumberTickerProps {
    value: number;
    startValue?: number;
    duration?: number;
    delay?: number;
    suffix?: string;
    prefix?: string;
    decimals?: number;
    className?: string;
}

export function NumberTicker({
    value,
    startValue = 0,
    duration = 2,
    delay = 0,
    suffix = '',
    prefix = '',
    decimals = 0,
    className = '',
}: NumberTickerProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });
    const [displayValue, setDisplayValue] = useState(startValue);

    useEffect(() => {
        if (!isInView) return;

        const startTime = Date.now();
        const delayMs = delay * 1000;
        const durationMs = duration * 1000;

        const animate = () => {
            const elapsed = Date.now() - startTime - delayMs;
            
            if (elapsed < 0) {
                requestAnimationFrame(animate);
                return;
            }

            const progress = Math.min(elapsed / durationMs, 1);
            // Ease out cubic for smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (value - startValue) * eased;
            
            setDisplayValue(current);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [isInView, value, startValue, duration, delay]);

    const formattedValue = decimals > 0 
        ? displayValue.toFixed(decimals)
        : Math.round(displayValue).toLocaleString();

    return (
        <motion.span
            ref={ref}
            className={className}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay }}
        >
            {prefix}{formattedValue}{suffix}
        </motion.span>
    );
}
