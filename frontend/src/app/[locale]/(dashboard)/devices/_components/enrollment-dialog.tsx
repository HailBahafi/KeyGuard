'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, RefreshCw, CheckCircle, Terminal } from 'lucide-react';
import { useEnrollmentCode } from '@/hooks/use-devices';
import { EnrollmentCode } from '@/types/device';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';

interface EnrollmentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onGenerateCode?: () => void;
}

export function EnrollmentDialog({ open, onOpenChange, onGenerateCode }: EnrollmentDialogProps) {
    const t = useTranslations('Devices');
    const enrollmentMutation = useEnrollmentCode();
    const [enrollmentCode, setEnrollmentCode] = useState<EnrollmentCode | null>(null);
    const [copied, setCopied] = useState<'code' | 'cli' | null>(null);
    const [timeLeft, setTimeLeft] = useState<string>('');

    const loadEnrollmentCode = () => {
        enrollmentMutation.mutate(undefined, {
            onSuccess: (data) => {
                setEnrollmentCode(data);
                setCopied(null);
                if (onGenerateCode) {
                    onGenerateCode();
                }
            },
        });
    };

    useEffect(() => {
        if (open && !enrollmentCode) {
            loadEnrollmentCode();
        }
    }, [open]);

    useEffect(() => {
        if (!enrollmentCode) return;

        const updateTimer = () => {
            const expiresAt = new Date(enrollmentCode.expiresAt);
            const now = new Date();

            if (expiresAt > now) {
                setTimeLeft(formatDistanceToNow(expiresAt, { addSuffix: false }));
            } else {
                setTimeLeft('expired');
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [enrollmentCode]);

    const copyToClipboard = async (text: string, type: 'code' | 'cli') => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const cliCommand = enrollmentCode
        ? `npx @keyguard/cli enroll --code ${enrollmentCode.code}`
        : '';

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[calc(100vw-2rem)] max-w-md overflow-hidden">
                <DialogHeader>
                    <DialogTitle>{t('enrollmentDialog.title')}</DialogTitle>
                    <DialogDescription>
                        {t('enrollmentDialog.subtitle')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Enrollment Code */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            {t('enrollmentDialog.enrollmentCode')}
                        </label>
                        {enrollmentMutation.isPending ? (
                            <Skeleton className="h-16 w-full" />
                        ) : enrollmentCode ? (
                            <div className="relative">
                                <div className="flex items-center justify-center p-4 rounded-lg bg-muted border border-border">
                                    <code className="text-xl font-mono font-bold text-primary tracking-wider select-all">
                                        {enrollmentCode.code}
                                    </code>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="absolute top-2 end-2 h-8 w-8 p-0"
                                    onClick={() => copyToClipboard(enrollmentCode.code, 'code')}
                                >
                                    {copied === 'code' ? (
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        ) : null}

                        {enrollmentCode && (
                            <p className="text-sm text-muted-foreground text-center">
                                {timeLeft === 'expired'
                                    ? t('enrollmentDialog.expired')
                                    : t('enrollmentDialog.expires', { time: timeLeft })
                                }
                            </p>
                        )}
                    </div>

                    {/* CLI Command - Compact Design */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                            {t('enrollmentDialog.cliCommand')}
                        </label>
                        {enrollmentMutation.isPending ? (
                            <Skeleton className="h-12 w-full" />
                        ) : (
                            <div className="rounded-lg bg-zinc-900 border border-border p-3">
                                <div className="flex items-start gap-3">
                                    <Terminal className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                    <code className="text-xs text-zinc-300 font-mono flex-1 break-all leading-relaxed select-all">
                                        {cliCommand}
                                    </code>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 shrink-0 hover:bg-zinc-800"
                                        onClick={() => copyToClipboard(cliCommand, 'cli')}
                                        title={copied === 'cli' ? t('enrollmentDialog.copied') : 'Copy'}
                                    >
                                        {copied === 'cli' ? (
                                            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                                        ) : (
                                            <Copy className="h-3.5 w-3.5 text-zinc-400" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-2">
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={loadEnrollmentCode}
                            disabled={enrollmentMutation.isPending}
                        >
                            <RefreshCw className={`h-4 w-4 me-2 ${enrollmentMutation.isPending ? 'animate-spin' : ''}`} />
                            {t('enrollmentDialog.generateNewCode')}
                        </Button>
                        <Button onClick={() => onOpenChange(false)} className="w-full">
                            {t('enrollmentDialog.done')}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
