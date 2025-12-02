'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { CodeBlock } from './code-block';
import { sdkReference, examples } from '@/lib/docs-content';
import { useLanguageStore } from '@/stores/use-language-store';

export function SdkReference() {
    const { language } = useLanguageStore();

    return (
        <>
            {/* SDK Reference */}
            <section id="sdk-reference" className="scroll-mt-20 space-y-8">
                <div className="space-y-4">
                    <Badge className="bg-primary/10 text-primary border-0">SDK Reference</Badge>
                    <h2 className="text-3xl font-bold tracking-tight">API Reference</h2>
                    <p className="text-lg text-muted-foreground">
                        Complete documentation for all SDK methods
                    </p>
                </div>

                <div className="space-y-6">
                    {sdkReference.map((ref) => {
                        const codeSnippet = ref.codeSnippets?.find(s => s.language === language) || ref.codeSnippets?.[0];

                        return (
                            <Card key={ref.id} id={ref.id} className="p-6 scroll-mt-20">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xl font-semibold font-mono mb-2">{ref.title}</h3>
                                        <p className="text-muted-foreground">{ref.description}</p>
                                        {ref.content && (
                                            <p className="text-sm text-muted-foreground mt-2">{ref.content}</p>
                                        )}
                                    </div>

                                    {codeSnippet && (
                                        <CodeBlock
                                            code={codeSnippet.code}
                                            language={codeSnippet.language}
                                            filename={codeSnippet.filename}
                                        />
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </section>

            {/* Examples */}
            <section id="examples" className="scroll-mt-20 space-y-8">
                <div className="space-y-4">
                    <Badge className="bg-primary/10 text-primary border-0">Examples</Badge>
                    <h2 className="text-3xl font-bold tracking-tight">Real-World Examples</h2>
                    <p className="text-lg text-muted-foreground">
                        Learn by example with popular AI providers
                    </p>
                </div>

                <div className="space-y-6">
                    {examples.map((example) => {
                        const codeSnippet = example.codeSnippets?.find(s => s.language === language) || example.codeSnippets?.[0];

                        return (
                            <Card key={example.id} id={example.id} className="p-6 scroll-mt-20">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">{example.title}</h3>
                                        <p className="text-muted-foreground">{example.description}</p>
                                    </div>

                                    {codeSnippet && (
                                        <CodeBlock
                                            code={codeSnippet.code}
                                            language={codeSnippet.language}
                                            filename={codeSnippet.filename}
                                            showLineNumbers
                                        />
                                    )}
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </section>
        </>
    );
}
