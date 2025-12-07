'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface ShineBorderProps {
    children: ReactNode;
    className?: string;
    borderWidth?: number;
    duration?: number;
    colors?: string[];
}

export function ShineBorder({
    children,
    className = '',
    borderWidth = 2,
    duration = 4,
    colors = ['#fbbf24', '#3b82f6', '#8b5cf6', '#fbbf24'],
}: ShineBorderProps) {
    const gradient = `linear-gradient(90deg, ${colors.join(', ')})`;

    return (
        <div
            className={cn('relative rounded-2xl overflow-hidden', className)}
            style={{
                background: '#171717',
            }}
        >
            {/* Animated gradient border */}
            <div
                className="absolute inset-0 rounded-2xl"
                style={{
                    padding: `${borderWidth}px`,
                    background: gradient,
                    backgroundSize: '200% 200%',
                    animation: `shine ${duration}s linear infinite`,
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                }}
            />
            {/* Content */}
            <div className="relative z-10 rounded-2xl bg-[#171717]">
                {children}
            </div>
        </div>
    );
}
