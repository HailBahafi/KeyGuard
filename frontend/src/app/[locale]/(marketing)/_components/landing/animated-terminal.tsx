'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const codeLines = [
    '// Enroll your device',
    'import { KeyGuardClient } from "@keyguard/sdk";',
    '',
    'const client = new KeyGuardClient({',
    '  baseURL: "https://keyguard.local"',
    '});',
    '',
    'await client.enroll("Ahmed-Laptop");',
    '',
    '// ✓ Device enrolled successfully',
];

export function AnimatedTerminal() {
    const [displayedLines, setDisplayedLines] = useState<string[]>([]);
    const [currentLineIndex, setCurrentLineIndex] = useState(0);
    const [currentChar, setCurrentChar] = useState(0);

    useEffect(() => {
        if (currentLineIndex >= codeLines.length) return;

        const currentLine = codeLines[currentLineIndex];

        if (currentChar < currentLine.length) {
            const timeout = setTimeout(() => {
                setCurrentChar(currentChar + 1);
            }, 30);
            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                setDisplayedLines([...displayedLines, currentLine]);
                setCurrentLineIndex(currentLineIndex + 1);
                setCurrentChar(0);
            }, 200);
            return () => clearTimeout(timeout);
        }
    }, [currentChar, currentLineIndex, displayedLines]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative w-full max-w-[667px]"
        >
            {/* Terminal Window */}
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-2xl">
                {/* Terminal Header */}
                <div className="bg-muted px-4 py-2 flex items-center gap-2 border-b border-border">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-destructive" />
                        <div className="w-3 h-3 rounded-full bg-chart-4" />
                        <div className="w-3 h-3 rounded-full bg-chart-2" />
                    </div>
                    <span className="text-sm text-muted-foreground ms-2">keyguard-enroll.ts</span>
                </div>

                {/* Terminal Body */}
                <div className="p-6 font-mono text-sm h-[300px] overflow-y-auto bg-card">
                    <div className="w-full">
                        {displayedLines.map((line, index) => (
                            <div key={index} className="leading-relaxed">
                                {line.startsWith('//') ? (
                                    <span className="text-muted-foreground">{line}</span>
                                ) : line.includes('import') || line.includes('const') || line.includes('await') ? (
                                    <span className="text-primary">{line}</span>
                                ) : line.includes('✓') ? (
                                    <span className="text-chart-2">{line}</span>
                                ) : (
                                    <span className="text-foreground">{line}</span>
                                )}
                            </div>
                        ))}
                        {currentLineIndex < codeLines.length && (
                            <div className="leading-relaxed">
                                {codeLines[currentLineIndex].substring(0, currentChar).startsWith('//') ? (
                                    <span className="text-muted-foreground">
                                        {codeLines[currentLineIndex].substring(0, currentChar)}
                                    </span>
                                ) : codeLines[currentLineIndex].substring(0, currentChar).includes('import') ||
                                    codeLines[currentLineIndex].substring(0, currentChar).includes('const') ||
                                    codeLines[currentLineIndex].substring(0, currentChar).includes('await') ? (
                                    <span className="text-primary">
                                        {codeLines[currentLineIndex].substring(0, currentChar)}
                                    </span>
                                ) : (
                                    <span className="text-foreground">
                                        {codeLines[currentLineIndex].substring(0, currentChar)}
                                    </span>
                                )}
                                <span className="inline-block w-2 h-4 bg-primary animate-pulse ms-0.5" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
