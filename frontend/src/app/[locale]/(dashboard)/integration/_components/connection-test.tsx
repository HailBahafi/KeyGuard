'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Loader2, Wifi } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

type ConnectionStatus = 'idle' | 'checking' | 'connected' | 'disconnected';

export function ConnectionTest() {
    const [status, setStatus] = useState<ConnectionStatus>('idle');

    const testConnection = async () => {
        setStatus('checking');
        toast.info('Testing connection...');

        try {
            // Test the health endpoint
            await apiClient.get('/health');
            setStatus('connected');
            toast.success('Connection successful!', {
                description: 'Your KeyGuard API is ready to use.',
            });
        } catch (error: any) {
            setStatus('disconnected');
            toast.error('Connection failed', {
                description: error.message || 'Unable to reach KeyGuard API. Please check your configuration.',
            });
        }
    };

    const getStatusBadge = () => {
        switch (status) {
            case 'checking':
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-0">
                        <Loader2 className="h-3 w-3 me-1 animate-spin" />
                        Checking...
                    </Badge>
                );
            case 'connected':
                return (
                    <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-0">
                        <CheckCircle2 className="h-3 w-3 me-1" />
                        Ready to Sign
                    </Badge>
                );
            case 'disconnected':
                return (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-0">
                        <XCircle className="h-3 w-3 me-1" />
                        Not Connected
                    </Badge>
                );
            default:
                return null;
        }
    };

    return (
        <Card className="p-6 border-2 border-dashed">
            <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <Wifi className="h-6 w-6 text-primary" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-1">Test Your Connection</h3>
                        <p className="text-sm text-muted-foreground">
                            Verify that your KeyGuard API is properly configured and ready to sign requests.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            onClick={testConnection}
                            disabled={status === 'checking'}
                            variant={status === 'connected' ? 'outline' : 'default'}
                        >
                            {status === 'checking' && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                            {status === 'connected' ? 'Test Again' : 'Check Connection'}
                        </Button>
                        {getStatusBadge()}
                    </div>

                    {status === 'connected' && (
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-900/30">
                            <p className="text-sm text-green-800 dark:text-green-400">
                                ✓ Your KeyGuard instance is online and accepting requests.
                            </p>
                        </div>
                    )}

                    {status === 'disconnected' && (
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30">
                            <p className="text-sm text-red-800 dark:text-red-400 font-medium mb-1">
                                Connection Failed
                            </p>
                            <p className="text-xs text-red-700 dark:text-red-400">
                                Make sure the KeyGuard API is running and accessible. Check your API URL in settings.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
