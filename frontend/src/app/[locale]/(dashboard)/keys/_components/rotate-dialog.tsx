'use client';

import { useTranslations } from 'next-intl';
import { RefreshCw } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ApiKey } from '@/hooks/use-keys';

interface RotateKeyDialogProps {
    apiKey: ApiKey | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (keyId: string) => void;
}

export function RotateKeyDialog({ apiKey, open, onOpenChange, onConfirm }: RotateKeyDialogProps) {
    const t = useTranslations('KeyVault.rotateDialog');

    if (!apiKey) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>
                        {t('description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="p-4 bg-muted rounded-md flex items-start gap-3">
                        <RefreshCw className="w-5 h-5 mt-0.5 text-primary" />
                        <div className="space-y-1">
                            <p className="font-medium text-sm">Rotation Policy</p>
                            <p className="text-sm text-muted-foreground">
                                The current key will be immediately revoked. A new key will be generated and shown to you once.
                            </p>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('cancel')}
                    </Button>
                    <Button
                        onClick={() => {
                            onConfirm(apiKey.id);
                            onOpenChange(false);
                        }}
                    >
                        {t('confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
