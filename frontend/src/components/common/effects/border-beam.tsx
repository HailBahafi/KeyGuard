'use client';

import { cn } from '@/lib/utils';
import { ReactNode } from 'react';

interface BorderBeamProps {
    children: ReactNode;
    className?: string;
    duration?: number;
    colorFrom?: string;
    colorTo?: string;
}

export function BorderBeam({
    children,
    className = '',
    duration = 3,
    colorFrom = '#3b82f6',
    colorTo = '#8b5cf6',
}: BorderBeamProps) {
    return (
        <div className={cn('relative rounded-2xl overflow-hidden', className)}>
            {/* Moving beam */}
            <div
                className="absolute inset-0 rounded-2xl"
                style={{
                    background: `conic-gradient(from 0deg, transparent, ${colorFrom}, ${colorTo}, transparent)`,
                    animation: `spin ${duration}s linear infinite`,
                }}
            />
            {/* Mask to show only border */}
            <div
                className="absolute rounded-2xl bg-[#0a0a0a]"
                style={{
                    inset: '2px',
                }}
            />
            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
