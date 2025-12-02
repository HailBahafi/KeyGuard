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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Send, Loader2 } from 'lucide-react';

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
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle>API Playground</DialogTitle>
                    <DialogDescription>
                        Demo: Test API requests with KeyGuard signing (simulated responses for demonstration purposes only)
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-6 flex-1 overflow-hidden">
                    {/* Request Builder */}
                    <div className="space-y-4 overflow-y-auto pe-2">
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
                                placeholder="https://api.example.com/endpoint"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Request Body (JSON)</Label>
                            <Textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                className="font-mono text-sm h-64"
                                placeholder="{}"
                            />
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
                    <div className="space-y-4 overflow-hidden flex flex-col border-s border-border ps-6">
                        <div className="flex items-center justify-between">
                            <Label>Response</Label>
                            {response && (
                                <div className="flex items-center gap-2">
                                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
                                        200 OK
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                        {responseTime}ms
                                    </span>
                                </div>
                            )}
                        </div>

                        {!response && !loading && (
                            <div className="flex-1 flex items-center justify-center border-2 border-dashed border-border rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    Send a request to see the response
                                </p>
                            </div>
                        )}

                        {loading && (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        )}

                        {response && (
                            <pre className="flex-1 overflow-auto p-4 rounded-lg bg-muted text-sm font-mono">
                                {JSON.stringify(response, null, 2)}
                            </pre>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
