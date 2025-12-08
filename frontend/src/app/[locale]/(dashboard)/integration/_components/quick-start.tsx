'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Terminal, Shield, Key } from 'lucide-react';
import { CodeBlock } from './code-block';
import { quickStartSteps, type CodeSnippet } from '@/lib/docs-content';
import { useLanguageStore } from '@/stores/use-language-store';
import { useApiKeys } from '@/hooks/use-keys';

const iconMap = {
    Terminal,
    Shield,
    Key
};

export function QuickStart() {
    const t = useTranslations('Integration.quickStart');
    const { language } = useLanguageStore();

    // Fetch user's API keys to pre-fill in code snippets
    const { data: keysData } = useApiKeys({ page: 1, limit: 1, status: 'active' });
    const apiKeyPlaceholder = keysData?.keys?.[0]?.maskedValue || 'your-api-key';

    return (
        <section id="quick-start" className="scroll-mt-20">
            <div className="space-y-4 mb-8">
                <Badge className="bg-primary/10 text-primary border-0">{t('badge')}</Badge>
                <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
                <p className="text-lg text-muted-foreground">
                    {t('description')}
                </p>
            </div>

            <div className="space-y-8">
                {quickStartSteps.map((step) => {
                    const Icon = iconMap[step.icon as keyof typeof iconMap];
                    const codeSnippet = (step.codeSnippets?.find(s => s.language === language) || step.codeSnippets?.[0]) as CodeSnippet | undefined;

                    // Replace API key placeholders with actual key (or masked version)
                    const codeWithKey = codeSnippet ? {
                        ...codeSnippet,
                        code: codeSnippet.code
                            .replace(/your-api-key/g, apiKeyPlaceholder)
                            .replace(/'your-project-id'/g, `'${process.env.NEXT_PUBLIC_PROJECT_ID || 'your-project-id'}'`)
                            .replace(/"your-project-id"/g, `"${process.env.NEXT_PUBLIC_PROJECT_ID || 'your-project-id'}"`)
                    } : undefined;

                    return (
                        <Card key={step.id} id={step.id} className="p-6 scroll-mt-20">
                            {/* Header Section - Icon + Title + Description */}
                            <div className="flex items-start gap-4 mb-4">
                                {/* Step Icon */}
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 border-2 border-primary">
                                        <Icon className="h-6 w-6 text-primary" />
                                    </div>
                                </div>

                                {/* Title and Description */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="font-mono">
                                            {t('step', { number: step.step })}
                                        </Badge>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                                    <p className="text-muted-foreground">{step.description}</p>
                                    {step.content && (
                                        <p className="text-sm text-muted-foreground mt-2">{step.content}</p>
                                    )}
                                </div>
                            </div>

                            {/* Code Block - Full Width, always LTR */}
                            {codeWithKey && (
                                <div className="w-full" dir="ltr">
                                    <CodeBlock
                                        code={codeWithKey.code}
                                        language={codeWithKey.language}
                                        filename={codeWithKey?.filename}
                                    />
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}
