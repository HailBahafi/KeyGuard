'use client';

import { useMemo, useId } from 'react';
import { motion } from 'framer-motion';

// Seeded random number generator for stable values
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return (seed / 0x7fffffff);
  };
}

interface BeamBackgroundProps {
    className?: string;
}

export function BeamBackground({ className = '' }: BeamBackgroundProps) {
    const id = useId();
    
    const beams = useMemo(() => {
        const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const random = seededRandom(seed);
        return Array.from({ length: 8 }, (_, i) => ({
            id: i,
            delay: i * 0.5,
            duration: 6 + random() * 4, // 6-10s
            opacity: 0.3 + random() * 0.2, // 0.3-0.5 (more visible)
            startY: -100 + random() * 50,
        }));
    }, [id]);

    return (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
            {beams.map((beam) => (
                <motion.div
                    key={beam.id}
                    className="absolute h-[2px] w-[250%] bg-gradient-to-r from-transparent via-blue-500 to-transparent"
                    style={{
                        top: `${5 + beam.id * 11}%`,
                        right: '-75%',
                        transform: 'rotate(-12deg)',
                    }}
                    initial={{
                        x: '100%',
                        y: beam.startY,
                        opacity: 0,
                    }}
                    animate={{
                        x: '-100%',
                        y: beam.startY + 150,
                        opacity: [0, beam.opacity, beam.opacity, 0],
                    }}
                    transition={{
                        duration: beam.duration,
                        delay: beam.delay,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            ))}
        </div>
    );
}

