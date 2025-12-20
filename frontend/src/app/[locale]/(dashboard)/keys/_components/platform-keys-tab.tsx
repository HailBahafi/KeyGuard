'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Plus, Copy, Trash2, Check, HelpCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings } from '@/hooks/use-settings';

interface PlatformKey {
    id: string;
    name: string;
    key: string;
    createdAt: string;
    lastUsedAt: string | null;
}

export function PlatformKeysTab() {
    const t = useTranslations('KeyVault.platformKeys');
    const { data: settings, isLoading, refetch } = useSettings();
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [keyToRevoke, setKeyToRevoke] = useState<PlatformKey | null>(null);
    const [newKeyName, setNewKeyName] = useState('');
    const [generatedKey, setGeneratedKey] = useState<{ key: PlatformKey; rawKey: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const keys: PlatformKey[] = settings?.api?.keys || [];

    const handleGenerateKey = async () => {
        if (!newKeyName.trim()) {
            toast.error(t('toast.enterName'));
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.post<{ key: PlatformKey; rawKey: string }>('/settings/api-keys', {
                name: newKeyName,
                scope: ['read', 'write'],
            });
            setGeneratedKey(response.data);
            setNewKeyName('');
            toast.success(t('toast.generated'));
        } catch {
            toast.error(t('toast.generateFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleCopyKey = async (key: string) => {
        try {
            await navigator.clipboard.writeText(key);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success(t('toast.copied'));
        } catch {
            toast.error(t('toast.copyFailed'));
        }
    };

    const handleRevokeKey = async () => {
        if (!keyToRevoke) return;

        try {
            setLoading(true);
            await apiClient.delete(`/settings/api-keys/${keyToRevoke.id}`);
            toast.success(t('toast.revoked'));
            refetch();
            setKeyToRevoke(null);
        } catch {
            toast.error(t('toast.revokeFailed'));
        } finally {
            setLoading(false);
        }
    };

    const handleCloseGenerated = () => {
        setGeneratedKey(null);
        setIsGenerateOpen(false);
        refetch();
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-32 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header with explanation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div>
                        <h3 className="text-lg font-semibold">{t('title')}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            {t('description')}
                        </p>
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <p>{t('tooltip')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Button onClick={() => setIsGenerateOpen(true)}>
                    <Plus className="h-4 w-4 me-2" />
                    {t('generateKey')}
                </Button>
            </div>

            {/* Platform Keys Table */}
            <div className="border border-border rounded-lg">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border bg-muted/30">
                                <th className="text-start p-3 text-sm font-medium">{t('table.name')}</th>
                                <th className="text-start p-3 text-sm font-medium">{t('table.key')}</th>
                                <th className="text-start p-3 text-sm font-medium">{t('table.created')}</th>
                                <th className="text-start p-3 text-sm font-medium">{t('table.lastUsed')}</th>
                                <th className="text-end p-3 text-sm font-medium">{t('table.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {keys.map((apiKey) => (
                                <tr key={apiKey.id} className="border-b border-border last:border-0">
                                    <td className="p-3">
                                        <span className="font-medium">{apiKey.name}</span>
                                    </td>
                                    <td className="p-3">
                                        <code className="text-xs font-mono bg-muted px-2 py-1 rounded">
                                            {apiKey.key}
                                        </code>
                                    </td>
                                    <td className="p-3 text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(apiKey.createdAt), { addSuffix: true })}
                                    </td>
                                    <td className="p-3 text-sm text-muted-foreground">
                                        {apiKey.lastUsedAt
                                            ? formatDistanceToNow(new Date(apiKey.lastUsedAt), { addSuffix: true })
                                            : t('table.never')}
                                    </td>
                                    <td className="p-3 text-end">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setKeyToRevoke(apiKey)}
                                        >
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {keys.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                        {t('empty')}
                    </div>
                )}
            </div>

            {/* Generate Key Dialog */}
            <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('generateDialog.title')}</DialogTitle>
                        <DialogDescription>
                            {t('generateDialog.description')}
                        </DialogDescription>
                    </DialogHeader>

                    {!generatedKey ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="keyName">{t('generateDialog.keyName')}</Label>
                                <Input
                                    id="keyName"
                                    placeholder={t('generateDialog.keyNamePlaceholder')}
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>
                                    {t('generateDialog.cancel')}
                                </Button>
                                <Button onClick={handleGenerateKey} disabled={loading || !newKeyName.trim()}>
                                    {t('generateDialog.generate')}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-muted">
                                <p className="text-sm text-muted-foreground mb-2">
                                    {t('generateDialog.warning')}
                                </p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 text-sm font-mono bg-background p-3 rounded border border-border break-all">
                                        {generatedKey.rawKey}
                                    </code>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleCopyKey(generatedKey.rawKey)}
                                    >
                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>

                            <Button onClick={handleCloseGenerated} className="w-full">
                                {t('generateDialog.done')}
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Revoke Confirmation Dialog */}
            <AlertDialog open={!!keyToRevoke} onOpenChange={() => setKeyToRevoke(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('revokeDialog.title')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('revokeDialog.description', { name: keyToRevoke?.name ?? '' })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('revokeDialog.cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRevokeKey} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            {t('revokeDialog.revoke')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
