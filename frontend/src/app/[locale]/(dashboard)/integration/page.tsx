'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code2, Play } from 'lucide-react';
import { Sidebar } from './_components/sidebar';
import { QuickStart } from './_components/quick-start';
import { CodeGenerator } from './_components/code-generator';
import { ConnectionTest } from './_components/connection-test';
import { SdkReference } from './_components/sdk-reference';
import { ApiPlayground } from './_components/api-playground';
import { useLanguageStore } from '@/stores/use-language-store';
import type { Language } from '@/lib/docs-content';

const sections = [
    {
        id: 'quick-start',
        titleKey: 'quickStart',
        subsections: [
            { id: 'install', titleKey: 'install' },
            { id: 'enroll', titleKey: 'enroll' },
            { id: 'sign', titleKey: 'sign' }
        ]
    },
    {
        id: 'code-generator',
        titleKey: 'codeGenerator',
        subsections: []
    },
    {
        id: 'troubleshooting',
        titleKey: 'troubleshooting',
        subsections: []
    },
    {
        id: 'sdk-reference',
        titleKey: 'sdkReference',
        subsections: [
            { id: 'client-initialization', titleKey: 'clientInit' },
            { id: 'enroll-device', titleKey: 'enrollDevice' },
            { id: 'sign-request', titleKey: 'signRequest' }
        ]
    },
    {
        id: 'examples',
        titleKey: 'examples',
        subsections: [
            { id: 'openai-example', titleKey: 'openai' },
            { id: 'anthropic-example', titleKey: 'anthropic' }
        ]
    }
];

const languageOptions = [
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'go', label: 'Go' },
    { value: 'curl', label: 'cURL' }
];

export default function IntegrationPage() {
    const t = useTranslations('Integration');
    const { language, setLanguage } = useLanguageStore();
    const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);

    return (
        <div className="animate-in fade-in duration-500 max-w-full overflow-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div className="min-w-0">
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('subtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                    {/* Language Selector */}
                    <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                        <SelectTrigger className="w-[160px]">
                            <Code2 className="h-4 w-4 me-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {languageOptions.map((lang) => (
                                <SelectItem key={lang.value} value={lang.value}>
                                    {lang.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Try API Button */}
                    <Button onClick={() => setIsPlaygroundOpen(true)}>
                        <Play className="h-4 w-4 me-2" />
                        {t('tryApi')}
                    </Button>
                </div>
            </div>

            {/* Two-Column Layout - relative positioning for sticky context */}
            <div className="lg:flex lg:gap-8">
                {/* Sidebar Navigation - fixed in viewport */}
                <aside className="hidden lg:block lg:w-[220px] lg:flex-shrink-0">
                    <div className="fixed top-24 w-[220px]">
                        <Sidebar sections={sections} />
                    </div>
                </aside>

                {/* Main Content - Code sections remain in English with LTR direction */}
                <main className="flex-1 space-y-16 min-w-0 overflow-x-hidden" dir="ltr">
                    <QuickStart />
                    <CodeGenerator />
                    <ConnectionTest />
                    <SdkReference />
                </main>
            </div>

            {/* API Playground */}
            <ApiPlayground
                open={isPlaygroundOpen}
                onOpenChange={setIsPlaygroundOpen}
            />
        </div>
    );
}
