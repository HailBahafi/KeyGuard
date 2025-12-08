'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

// Custom style that matches our terminal theme
const customStyle = {
    ...oneDark,
    'pre[class*="language-"]': {
        ...oneDark['pre[class*="language-"]'],
        background: 'transparent',
        margin: 0,
        padding: 0,
        overflow: 'visible',
        fontSize: 'inherit',
        fontFamily: 'inherit',
    },
    'code[class*="language-"]': {
        ...oneDark['code[class*="language-"]'],
        background: 'transparent',
        fontSize: 'inherit',
        fontFamily: 'inherit',
    },
};

interface HighlightedLineProps {
    line: string;
    isPartial?: boolean;
}

function HighlightedLine({ line, isPartial }: HighlightedLineProps) {
    // Handle empty lines
    if (!line.trim()) {
        return <span>&nbsp;</span>;
    }

    // Handle success messages (keep original styling)
    if (line.includes('✓')) {
        return <span className="text-chart-2">{line}</span>;
    }

    // For code lines, use syntax highlighting
    return (
        <SyntaxHighlighter
            language="typescript"
            style={customStyle}
            customStyle={{
                background: 'transparent',
                margin: 0,
                padding: 0,
                display: 'inline',
            }}
            codeTagProps={{
                style: {
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                },
            }}
            PreTag="span"
            CodeTag="span"
        >
            {line}
        </SyntaxHighlighter>
    );
}

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
                    <div className="w-full overflow-x-auto">
                        {displayedLines.map((line, index) => (
                            <div key={index} className="leading-relaxed whitespace-pre">
                                <HighlightedLine line={line} />
                            </div>
                        ))}
                        {currentLineIndex < codeLines.length && (
                            <div className="leading-relaxed whitespace-pre">
                                <HighlightedLine
                                    line={codeLines[currentLineIndex].substring(0, currentChar)}
                                    isPartial
                                />
                                <span className="inline-block w-2 h-4 bg-primary animate-pulse ms-0.5" />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
