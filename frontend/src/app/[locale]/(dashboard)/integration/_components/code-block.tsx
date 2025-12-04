'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
    code: string;
    language: string;
    filename?: string;
    showLineNumbers?: boolean;
}

const languageColors: Record<string, string> = {
    typescript: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    python: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    go: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    curl: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    bash: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
};

const languageLabels: Record<string, string> = {
    typescript: 'TypeScript',
    python: 'Python',
    go: 'Go',
    curl: 'cURL',
    bash: 'Bash'
};

export function CodeBlock({
    code,
    language,
    filename,
    showLineNumbers = false
}: CodeBlockProps) {
    const [copied, setCopied] = useState(false);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const lines = code.split('\n');
    const displayLanguage = language === 'bash' ? 'bash' : language;

    return (
        <Card className="overflow-hidden border-border bg-card">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-muted/30">
                <div className="flex items-center gap-2 min-w-0">
                    <Badge className={cn('border-0 text-xs flex-shrink-0', languageColors[displayLanguage] || languageColors.bash)}>
                        {languageLabels[displayLanguage] || displayLanguage}
                    </Badge>
                    {filename && (
                        <span className="text-xs text-muted-foreground font-mono truncate">{filename}</span>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyToClipboard}
                    className="h-7 text-xs flex-shrink-0"
                >
                    {copied ? (
                        <>
                            <Check className="h-3 w-3 me-1" />
                            Copied
                        </>
                    ) : (
                        <>
                            <Copy className="h-3 w-3 me-1" />
                            Copy
                        </>
                    )}
                </Button>
            </div>

            {/* Code Content */}
            <div className="relative overflow-x-auto max-w-full">
                <pre className="p-4 text-sm font-mono leading-relaxed overflow-x-auto">
                    <code className="text-foreground block">
                        {showLineNumbers ? (
                            lines.map((line, index) => (
                                <div key={index} className="flex">
                                    <span className="inline-block w-8 text-end me-4 text-muted-foreground select-none flex-shrink-0">
                                        {index + 1}
                                    </span>
                                    <span className="break-all">{line}</span>
                                </div>
                            ))
                        ) : (
                            <span className="whitespace-pre-wrap break-words">{code}</span>
                        )}
                    </code>
                </pre>
            </div>
        </Card>
    );
}
