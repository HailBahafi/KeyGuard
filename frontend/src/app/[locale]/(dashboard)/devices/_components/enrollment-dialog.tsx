'use client';

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw, CheckCircle } from 'lucide-react';
import { useEnrollmentCode } from '@/hooks/use-devices';
import { EnrollmentCode } from '@/types/device';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface EnrollmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerateCode?: (name: string) => void;
}

export function EnrollmentDialog({ open, onOpenChange, onGenerateCode }: EnrollmentDialogProps) {
    const enrollmentMutation = useEnrollmentCode();
    const [enrollmentCode, setEnrollmentCode] = useState<EnrollmentCode | null>(null);
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>('');

    const loadEnrollmentCode = () => {
        // Generate code with default name, or use callback if provided
        enrollmentMutation.mutate('New Device', {
            onSuccess: (data) => {
                setEnrollmentCode(data);
                setCopied(false);
                if (onGenerateCode) {
                    onGenerateCode('New Device');
                }
            },
        });
    };

    useEffect(() => {
        if (open && !enrollmentCode) {
            loadEnrollmentCode();
        }
    }, [open]);

    // Update countdown timer
    useEffect(() => {
        if (!enrollmentCode) return;

        const updateTimer = () => {
            const expiresAt = new Date(enrollmentCode.expiresAt);
            const now = new Date();

            if (expiresAt > now) {
                setTimeLeft(formatDistanceToNow(expiresAt, { addSuffix: true }));
            } else {
                setTimeLeft('Expired');
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [enrollmentCode]);

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const cliCommand = enrollmentCode
        ? `npx @keyguard/cli enroll --code ${enrollmentCode.code}`
        : '';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Enroll New Device</DialogTitle>
                    <DialogDescription>
                        Use this one-time enrollment code to register a new device.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Enrollment Code */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Enrollment Code</label>
                        {enrollmentMutation.isPending ? (
                            <Skeleton className="h-16 w-full" />
                        ) : enrollmentCode ? (
                            <div className="relative">
                                <div className="flex items-center justify-center p-4 rounded-lg bg-muted border border-border">
                                    <code className="text-2xl font-mono font-bold text-primary tracking-wider">
                                        {enrollmentCode.code}
                                    </code>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 end-2"
                                    onClick={() => copyToClipboard(enrollmentCode.code)}
                                >
                                    {copied ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        ) : null}

                        {/* Expiration Timer */}
                        {enrollmentCode && (
                            <p className="text-sm text-muted-foreground text-center">
                                Expires {timeLeft}
                            </p>
                        )}
                    </div>

                    {/* CLI Command */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">CLI Command</label>
                        {enrollmentMutation.isPending ? (
                            <Skeleton className="h-12 w-full" />
                        ) : (
                            <div className="relative">
                                <pre className="p-3 rounded-lg bg-card border border-border overflow-x-auto text-sm">
                                    <code className="font-mono text-foreground">{cliCommand}</code>
                                </pre>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-1 end-1"
                                    onClick={() => copyToClipboard(cliCommand)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={loadEnrollmentCode}
                            disabled={enrollmentMutation.isPending}
                        >
                            <RefreshCw className={`h-4 w-4 me-2 ${enrollmentMutation.isPending ? 'animate-spin' : ''}`} />
                            Generate New Code
                        </Button>
                        <Button onClick={() => onOpenChange(false)}>
                            Done
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
