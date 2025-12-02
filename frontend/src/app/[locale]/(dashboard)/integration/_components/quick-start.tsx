'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Shield, Key } from 'lucide-react';
import { CodeBlock } from './code-block';
import { quickStartSteps, type CodeSnippet } from '@/lib/docs-content';
import { useLanguageStore } from '@/stores/use-language-store';

const iconMap = {
    Package,
    Shield,
    Key
};

export function QuickStart() {
    const { language } = useLanguageStore();

    return (
        <section id="quick-start" className="scroll-mt-20">
            <div className="space-y-4 mb-8">
                <Badge className="bg-primary/10 text-primary border-0">Quick Start</Badge>
                <h2 className="text-3xl font-bold tracking-tight">Get Started in 3 Steps</h2>
                <p className="text-lg text-muted-foreground">
                    Secure your first API request in under 3 minutes
                </p>
            </div>

            <div className="space-y-8">
                {quickStartSteps.map((step) => {
                    const Icon = iconMap[step.icon as keyof typeof iconMap];
                    const codeSnippet = (step.codeSnippets?.find(s => s.language === language) || step.codeSnippets?.[0]) as CodeSnippet | undefined;

                    return (
                        <Card key={step.id} id={step.id} className="p-6 scroll-mt-20">
                            <div className="flex items-start gap-4">
                                {/* Step Number */}
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border-2 border-primary">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="font-mono">
                                                Step {step.step}
                                            </Badge>
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                                        <p className="text-muted-foreground">{step.description}</p>
                                        {step.content && (
                                            <p className="text-sm text-muted-foreground mt-2">{step.content}</p>
                                        )}
                                    </div>

                                    {codeSnippet && (
                                        <CodeBlock
                                            code={codeSnippet.code}
                                            language={codeSnippet.language}
                                            filename={codeSnippet?.filename}
                                        />
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </section >
    );
}
