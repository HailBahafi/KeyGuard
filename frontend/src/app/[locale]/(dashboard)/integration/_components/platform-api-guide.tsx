'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CodeBlock } from './code-block';
import { useLanguageStore } from '@/stores/use-language-store';
import { Key, Server, Shield } from 'lucide-react';

const platformApiSteps = [
    {
        id: 'get-platform-key',
        step: 1,
        title: 'Get Platform API Key',
        description: 'Generate a Platform API key from the Keys page',
        icon: 'Key',
        content: 'Go to Keys → Platform Keys tab and generate a new API key. This is used for server-to-server authentication.',
        codeSnippets: [
            {
                language: 'curl',
                code: `# Your Platform API Key looks like this:
# kgp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Store it securely in environment variables:
export KEYGUARD_PLATFORM_KEY="kgp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"`
            },
            {
                language: 'typescript',
                code: `// Store in .env file
KEYGUARD_PLATFORM_KEY=kgp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

// Access in your code
const platformKey = process.env.KEYGUARD_PLATFORM_KEY;`,
                filename: '.env'
            }
        ]
    },
    {
        id: 'call-api',
        step: 2,
        title: 'Call KeyGuard REST API',
        description: 'Use the Platform Key in Authorization header',
        icon: 'Server',
        content: 'Include your Platform Key in the Authorization header when calling KeyGuard management APIs.',
        codeSnippets: [
            {
                language: 'curl',
                code: `# List all devices
curl -X GET "https://your-keyguard-server/api/v1/devices" \\
  -H "Authorization: Bearer kgp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json"

# Get device details
curl -X GET "https://your-keyguard-server/api/v1/devices/{deviceId}" \\
  -H "Authorization: Bearer kgp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# List API keys
curl -X GET "https://your-keyguard-server/api/v1/keys" \\
  -H "Authorization: Bearer kgp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"`
            },
            {
                language: 'typescript',
                code: `// Using fetch
const response = await fetch('https://your-keyguard-server/api/v1/devices', {
  method: 'GET',
  headers: {
    'Authorization': \`Bearer \${process.env.KEYGUARD_PLATFORM_KEY}\`,
    'Content-Type': 'application/json'
  }
});

const devices = await response.json();
console.log('Devices:', devices);`,
                filename: 'platform-api.ts'
            },
            {
                language: 'python',
                code: `import requests
import os

platform_key = os.environ['KEYGUARD_PLATFORM_KEY']

# List all devices
response = requests.get(
    'https://your-keyguard-server/api/v1/devices',
    headers={
        'Authorization': f'Bearer {platform_key}',
        'Content-Type': 'application/json'
    }
)

devices = response.json()
print('Devices:', devices)`,
                filename: 'platform_api.py'
            }
        ]
    }
];

const iconMap = {
    Key,
    Server,
    Shield
};

interface PlatformApiGuideProps {
    visible: boolean;
}

export function PlatformApiGuide({ visible }: PlatformApiGuideProps) {
    const t = useTranslations('Integration.platformApi');
    const { language } = useLanguageStore();

    if (!visible) return null;

    return (
        <section id="platform-api" className="scroll-mt-20">
            <div className="space-y-4 mb-8">
                <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-0">{t('badge')}</Badge>
                <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
                <p className="text-lg text-muted-foreground">
                    {t('description')}
                </p>
            </div>

            <div className="space-y-8">
                {platformApiSteps.map((step) => {
                    const Icon = iconMap[step.icon as keyof typeof iconMap];
                    const codeSnippet = step.codeSnippets?.find(s => s.language === language) || step.codeSnippets?.[0];

                    return (
                        <Card key={step.id} id={step.id} className="p-6 scroll-mt-20">
                            <div className="flex items-start gap-4 mb-4">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/10 border-2 border-purple-500">
                                        <Icon className="h-6 w-6 text-purple-500" />
                                    </div>
                                </div>

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

                            {codeSnippet && (
                                <div className="w-full" dir="ltr">
                                    <CodeBlock
                                        code={codeSnippet.code}
                                        language={codeSnippet.language}
                                        filename={codeSnippet.filename}
                                    />
                                </div>
                            )}
                        </Card>
                    );
                })}
            </div>

            {/* Available Endpoints */}
            <Card className="mt-8 p-6">
                <h3 className="text-lg font-semibold mb-4">{t('availableEndpoints')}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b">
                                <th className="text-start p-2 font-medium">Method</th>
                                <th className="text-start p-2 font-medium">Endpoint</th>
                                <th className="text-start p-2 font-medium">{t('endpointDescription')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="p-2"><Badge variant="outline">GET</Badge></td>
                                <td className="p-2 font-mono text-xs">/api/v1/devices</td>
                                <td className="p-2 text-muted-foreground">{t('endpoints.listDevices')}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-2"><Badge variant="outline">GET</Badge></td>
                                <td className="p-2 font-mono text-xs">/api/v1/devices/:id</td>
                                <td className="p-2 text-muted-foreground">{t('endpoints.getDevice')}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-2"><Badge variant="outline">PATCH</Badge></td>
                                <td className="p-2 font-mono text-xs">/api/v1/devices/:id/approve</td>
                                <td className="p-2 text-muted-foreground">{t('endpoints.approveDevice')}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-2"><Badge variant="outline">DELETE</Badge></td>
                                <td className="p-2 font-mono text-xs">/api/v1/devices/:id</td>
                                <td className="p-2 text-muted-foreground">{t('endpoints.revokeDevice')}</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-2"><Badge variant="outline">GET</Badge></td>
                                <td className="p-2 font-mono text-xs">/api/v1/keys</td>
                                <td className="p-2 text-muted-foreground">{t('endpoints.listKeys')}</td>
                            </tr>
                            <tr>
                                <td className="p-2"><Badge variant="outline">GET</Badge></td>
                                <td className="p-2 font-mono text-xs">/api/v1/audit</td>
                                <td className="p-2 text-muted-foreground">{t('endpoints.auditLogs')}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </section>
    );
}
