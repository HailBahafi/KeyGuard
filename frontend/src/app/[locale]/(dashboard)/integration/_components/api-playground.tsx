'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2 } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Custom style for transparent background
const customStyle = {
    ...oneDark,
    'pre[class*="language-"]': {
        ...oneDark['pre[class*="language-"]'],
        background: 'transparent',
        margin: 0,
        padding: 0,
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

interface ApiPlaygroundProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ApiPlayground({ open, onOpenChange }: ApiPlaygroundProps) {
    const [method, setMethod] = useState('POST');
    const [url, setUrl] = useState('https://api.openai.com/v1/chat/completions');
    const [body, setBody] = useState(JSON.stringify({
        model: 'gpt-4',
        messages: [
            { role: 'user', content: 'Hello! How can you help me today?' }
        ]
    }, null, 2));
    const [isEditing, setIsEditing] = useState(false);
    const [response, setResponse] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(false);
    const [responseTime, setResponseTime] = useState<number>(0);

    const sendRequest = async () => {
        setLoading(true);
        setResponse(null);
        const startTime = Date.now();

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

        // Demo: Generate a simple mock response based on URL
        // In production, this would use the actual KeyGuard SDK to sign and send the request
        const mockResponse: Record<string, unknown> = {
            id: `chatcmpl-${Math.random().toString(36).substring(7)}`,
            object: 'chat.completion',
            created: Math.floor(Date.now() / 1000),
            model: url.includes('anthropic') ? 'claude-3-opus-20240229' : 'gpt-4-turbo-preview',
            choices: [
                {
                    index: 0,
                    message: {
                        role: 'assistant',
                        content: 'This is a demo response. In production, this would be the actual API response from the provider.',
                    },
                    finish_reason: 'stop',
                },
            ],
            usage: {
                prompt_tokens: 10,
                completion_tokens: 15,
                total_tokens: 25,
            },
        };

        const endTime = Date.now();
        setResponseTime(endTime - startTime);
        setResponse(mockResponse);
        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent dir="ltr" className="max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>API Playground</DialogTitle>
                    <DialogDescription>
                        Demo: Test API requests with KeyGuard signing (simulated responses)
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 flex-1 overflow-hidden">
                    {/* Request Builder */}
                    <div className="space-y-3 md:space-y-4 overflow-y-auto pe-0 md:pe-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label>Method</Label>
                                <Select value={method} onValueChange={setMethod}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GET">GET</SelectItem>
                                        <SelectItem value="POST">POST</SelectItem>
                                        <SelectItem value="PUT">PUT</SelectItem>
                                        <SelectItem value="DELETE">DELETE</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>URL</Label>
                                <Input
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://api.example.com"
                                    className="text-xs md:text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Request Body (JSON)</Label>
                            <div
                                className="relative rounded-lg bg-muted border border-border overflow-hidden cursor-text"
                                onClick={() => setIsEditing(true)}
                            >
                                {isEditing ? (
                                    <textarea
                                        value={body}
                                        onChange={(e) => setBody(e.target.value)}
                                        onBlur={() => setIsEditing(false)}
                                        className="w-full h-48 md:h-64 p-3 md:p-4 font-mono text-xs md:text-sm bg-transparent border-0 resize-none focus:outline-none focus:ring-0"
                                        autoFocus
                                        placeholder="{}"
                                    />
                                ) : (
                                    <div className="h-48 md:h-64 p-3 md:p-4 overflow-auto font-mono text-xs md:text-sm">
                                        <SyntaxHighlighter
                                            language="json"
                                            style={customStyle}
                                            customStyle={{
                                                background: 'transparent',
                                                margin: 0,
                                                padding: 0,
                                            }}
                                            codeTagProps={{
                                                style: {
                                                    fontFamily: 'inherit',
                                                    fontSize: 'inherit',
                                                },
                                            }}
                                        >
                                            {body || '{}'}
                                        </SyntaxHighlighter>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Button
                            onClick={sendRequest}
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 me-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 me-2" />
                                    Send Request
                                </>
                            )}
                        </Button>
                    </div>

                    {/* Response Viewer */}
                    <div className="space-y-3 md:space-y-4 overflow-hidden flex flex-col border-t md:border-t-0 md:border-s border-border pt-4 md:pt-0 md:ps-6">
                        <div className="flex items-center justify-between">
                            <Label>Response</Label>
                            {response && (
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0 text-xs">
                                        200 OK
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {responseTime}ms
                                    </span>
                                </div>
                            )}
                        </div>

                        {!response && !loading && (
                            <div className="flex-1 min-h-[150px] md:min-h-0 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                                <p className="text-xs md:text-sm text-muted-foreground text-center px-4">
                                    Send a request to see the response
                                </p>
                            </div>
                        )}

                        {loading && (
                            <div className="flex-1 min-h-[150px] md:min-h-0 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        )}

                        {response && (
                            <div className="flex-1 min-h-[200px] md:min-h-0 overflow-auto p-3 md:p-4 rounded-lg bg-muted text-xs md:text-sm font-mono">
                                <SyntaxHighlighter
                                    language="json"
                                    style={customStyle}
                                    customStyle={{
                                        background: 'transparent',
                                        margin: 0,
                                        padding: 0,
                                    }}
                                    codeTagProps={{
                                        style: {
                                            fontFamily: 'inherit',
                                            fontSize: 'inherit',
                                        },
                                    }}
                                >
                                    {JSON.stringify(response, null, 2)}
                                </SyntaxHighlighter>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}


