'use client';

import { useTranslations } from 'next-intl';
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
import { useState } from 'react';

interface RevokeKeyDialogProps {
    apiKey: ApiKey | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (keyId: string) => void;
}

export function RevokeKeyDialog({ apiKey, open, onOpenChange, onConfirm }: RevokeKeyDialogProps) {
    const t = useTranslations('KeyVault.revokeDialog');
    const [confirmName, setConfirmName] = useState('');

    if (!apiKey) return null;

    const isConfirmed = confirmName === apiKey.name;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription className="text-destructive">
                        {t('description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>{t('confirmLabel')}</Label>
                        <Input
                            placeholder={apiKey.name}
                            value={confirmName}
                            onChange={(e) => setConfirmName(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>{t('reasonLabel')}</Label>
                        <Input placeholder={t('reasonPlaceholder')} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('cancel')}
                    </Button>
                    <Button
                        variant="destructive"
                        disabled={!isConfirmed}
                        onClick={() => {
                            onConfirm(apiKey.id);
                            onOpenChange(false);
                            setConfirmName('');
                        }}
                    >
                        {t('confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
