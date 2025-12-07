'use client';

import { motion } from 'framer-motion';

interface BeamBackgroundProps {
    className?: string;
}

export function BeamBackground({ className = '' }: BeamBackgroundProps) {
    const beams = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        delay: i * 0.5,
        duration: 6 + Math.random() * 4, // 6-10s
        opacity: 0.3 + Math.random() * 0.2, // 0.3-0.5 (more visible)
        startY: -100 + Math.random() * 50,
    }));

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

