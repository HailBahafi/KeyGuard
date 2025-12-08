'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code2, Key } from 'lucide-react';
import { CodeBlock } from './code-block';
import { useApiKeys } from '@/hooks/use-keys';

type Language = 'typescript' | 'python' | 'curl';

interface CodeSnippets {
    typescript: string;
    python: string;
    curl: string;
}

const generateCodeSnippets = (apiKey: string): CodeSnippets => ({
    typescript: `import { KeyGuardClient } from '@keyguard/sdk';

// Initialize the client with your API key
const client = new KeyGuardClient({ apiKey: '${apiKey}' });

// Enroll the device (one-time setup)
await client.enroll();

// Sign a request before sending
const headers = await client.signRequest({
  method: 'POST',
  url: 'https://api.openai.com/v1/chat/completions',
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});

// Use the signed headers in your fetch call
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: 'Hello!' }]
  })
});`,
    python: `from keyguard import KeyGuardClient
import requests
import json

# Initialize the client with your API key
client = KeyGuardClient(api_key='${apiKey}')

# Enroll the device (one-time setup)
client.enroll()

# Sign a request before sending
headers = client.sign_request(
    method='POST',
    url='https://api.openai.com/v1/chat/completions',
    body=json.dumps({
        'model': 'gpt-4',
        'messages': [{'role': 'user', 'content': 'Hello!'}]
    })
)

# Use the signed headers in your request
response = requests.post(
    'https://api.openai.com/v1/chat/completions',
    headers=headers,
    json={
        'model': 'gpt-4',
        'messages': [{'role': 'user', 'content': 'Hello!'}]
    }
)`,
    curl: `# Sign a request using the KeyGuard API
curl -X POST https://api.keyguard.dev/v1/sign \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "method": "POST",
    "url": "https://api.openai.com/v1/chat/completions",
    "body": "{\\"model\\":\\"gpt-4\\",\\"messages\\":[{\\"role\\":\\"user\\",\\"content\\":\\"Hello!\\"}]}"
  }'`
});

const languageLabels: Record<Language, string> = {
    typescript: 'TypeScript (Node)',
    python: 'Python',
    curl: 'cURL'
};

export function CodeGenerator() {
    const t = useTranslations('Integration.codeGenerator');
    const [language, setLanguage] = useState<Language>('typescript');
    const [selectedKeyId, setSelectedKeyId] = useState<string>('placeholder');

    // Fetch user's API keys
    const { data: keysData, isLoading: keysLoading } = useApiKeys({
        page: 1,
        limit: 10,
        status: 'active'
    });

    // Get API key value to display in code
    const apiKeyDisplay = useMemo(() => {
        if (selectedKeyId === 'placeholder' || !keysData?.keys) {
            return 'kg_prod_...';
        }
        const selectedKey = keysData.keys.find(k => k.id === selectedKeyId);
        return selectedKey?.maskedValue || 'kg_prod_...';
    }, [selectedKeyId, keysData?.keys]);

    const codeSnippets = useMemo(() => generateCodeSnippets(apiKeyDisplay), [apiKeyDisplay]);

    return (
        <section id="code-generator" className="scroll-mt-20">
            <div className="space-y-4 mb-8">
                <Badge className="bg-primary/10 text-primary border-0">{t('badge')}</Badge>
                <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
                <p className="text-lg text-muted-foreground">
                    {t('description')}
                </p>
            </div>

            <Card>
                <CardHeader className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex-1 min-w-0">
                            <CardTitle className="flex items-center gap-2">
                                <Code2 className="h-5 w-5 text-primary" />
                                {t('sdkIntegration')}
                            </CardTitle>
                            <CardDescription className="mt-1">
                                {t('selectLanguage')}
                            </CardDescription>
                        </div>

                        {/* API Key Selector */}
                        <Select value={selectedKeyId} onValueChange={setSelectedKeyId}>
                            <SelectTrigger className="w-[200px]">
                                <Key className="h-4 w-4 me-2 text-muted-foreground" />
                                <SelectValue placeholder={t('selectApiKey')} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="placeholder">
                                    {t('usePlaceholder')}
                                </SelectItem>
                                {keysLoading ? (
                                    <SelectItem value="loading" disabled>
                                        {t('loadingKeys')}
                                    </SelectItem>
                                ) : keysData?.keys && keysData.keys.length > 0 ? (
                                    keysData.keys.map((key) => (
                                        <SelectItem key={key.id} value={key.id}>
                                            {key.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-keys" disabled>
                                        {t('noActiveKeys')}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>

                <CardContent className="pt-0">
                    <Tabs value={language} onValueChange={(v) => setLanguage(v as Language)}>
                        <TabsList className="mb-4">
                            {Object.entries(languageLabels).map(([key, label]) => (
                                <TabsTrigger key={key} value={key}>
                                    {label}
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {Object.entries(codeSnippets).map(([lang, code]) => (
                            <TabsContent key={lang} value={lang} className="mt-0">
                                <div dir="ltr">
                                    <CodeBlock
                                        code={code}
                                        language={lang}
                                        filename={lang === 'typescript' ? 'example.ts' : lang === 'python' ? 'example.py' : undefined}
                                        showLineNumbers
                                    />
                                </div>
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>
        </section>
    );
}
