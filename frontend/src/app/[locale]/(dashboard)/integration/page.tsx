'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Code2, Play } from 'lucide-react';
import { Sidebar } from './_components/sidebar';
import { QuickStart } from './_components/quick-start';
import { SdkReference } from './_components/sdk-reference';
import { ApiPlayground } from './_components/api-playground';
import { useLanguageStore } from '@/stores/use-language-store';

const sections = [
    {
        id: 'quick-start',
        title: 'Quick Start',
        subsections: [
            { id: 'install', title: 'Install' },
            { id: 'enroll', title: 'Enroll' },
            { id: 'sign', title: 'Sign & Send' }
        ]
    },
    {
        id: 'sdk-reference',
        title: 'SDK Reference',
        subsections: [
            { id: 'client-initialization', title: 'Client Initialization' },
            { id: 'enroll-device', title: 'enroll()' },
            { id: 'sign-request', title: 'signRequest()' }
        ]
    },
    {
        id: 'examples',
        title: 'Examples',
        subsections: [
            { id: 'openai-example', title: 'OpenAI' },
            { id: 'anthropic-example', title: 'Anthropic' }
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
    const { language, setLanguage } = useLanguageStore();
    const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);

    return (
        <div className="animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Integration Guide</h1>
                    <p className="text-muted-foreground mt-1">
                        Developer documentation and SDK reference
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Language Selector */}
                    <Select value={language} onValueChange={(value: any) => setLanguage(value)}>
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
                        Try API
                    </Button>
                </div>
            </div>

            {/* Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8">
                {/* Sidebar Navigation */}
                <aside className="hidden lg:block">
                    <Sidebar sections={sections} />
                </aside>

                {/* Main Content */}
                <main className="space-y-16 min-w-0">
                    <QuickStart />
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
