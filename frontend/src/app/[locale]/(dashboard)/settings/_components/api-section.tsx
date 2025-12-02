'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
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
import { toast } from 'sonner';
import { Plus, Copy, Trash2, Check } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { ApiKey } from '@/types/settings';
import { formatDistanceToNow } from 'date-fns';

interface ApiSectionProps {
    keys: ApiKey[];
    onUpdate?: () => void;
}

export function ApiSection({ keys, onUpdate }: ApiSectionProps) {
    const [isGenerateOpen, setIsGenerateOpen] = useState(false);
    const [keyToRevoke, setKeyToRevoke] = useState<ApiKey | null>(null);
    const [newKeyName, setNewKeyName] = useState('');
    const [generatedKey, setGeneratedKey] = useState<{ key: ApiKey; rawKey: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerateKey = async () => {
        if (!newKeyName.trim()) {
            toast.error('Please enter a key name');
            return;
        }

        try {
            setLoading(true);
            // TODO: Replace with real endpoint when available: POST /settings/api-keys
            const response = await apiClient.post<{ key: ApiKey; rawKey: string }>('/settings/api-keys', {
                name: newKeyName,
                scope: ['read', 'write'],
            });
            setGeneratedKey(response.data);
            setNewKeyName('');
            toast.success('API key generated successfully');
        } catch {
            toast.error('Failed to generate API key');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyKey = async (key: string) => {
        try {
            await navigator.clipboard.writeText(key);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('API key copied to clipboard');
        } catch {
            toast.error('Failed to copy to clipboard');
        }
    };

    const handleRevokeKey = async () => {
        if (!keyToRevoke) return;

        try {
            setLoading(true);
            // TODO: Replace with real endpoint when available: DELETE /settings/api-keys/:id
            await apiClient.delete(`/settings/api-keys/${keyToRevoke.id}`);
            toast.success('API key revoked successfully');
            onUpdate?.();
            setKeyToRevoke(null);
        } catch {
            toast.error('Failed to revoke API key');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseGenerated = () => {
        setGeneratedKey(null);
        setIsGenerateOpen(false);
        onUpdate?.();
    };

    return (
        <Card id="api" className="p-6 scroll-mt-20">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold">API Keys</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage API keys for programmatic access
                        </p>
                    </div>
                    <Button onClick={() => setIsGenerateOpen(true)}>
                        <Plus className="h-4 w-4 me-2" />
                        Generate Key
                    </Button>
                </div>

                {/* API Keys Table */}
                <div className="border border-border rounded-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border bg-muted/30">
                                    <th className="text-start p-3 text-sm font-medium">Name</th>
                                    <th className="text-start p-3 text-sm font-medium">Key</th>
                                    <th className="text-start p-3 text-sm font-medium">Created</th>
                                    <th className="text-start p-3 text-sm font-medium">Last Used</th>
                                    <th className="text-end p-3 text-sm font-medium">Actions</th>
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
                                                : 'Never'}
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
                            No API keys yet. Generate one to get started.
                        </div>
                    )}
                </div>
            </div>

            {/* Generate Key Dialog */}
            <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Generate API Key</DialogTitle>
                        <DialogDescription>
                            Create a new API key for programmatic access
                        </DialogDescription>
                    </DialogHeader>

                    {!generatedKey ? (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="keyName">Key Name</Label>
                                <Input
                                    id="keyName"
                                    placeholder="e.g., Production Key"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setIsGenerateOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleGenerateKey} disabled={loading || !newKeyName.trim()}>
                                    Generate
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-muted">
                                <p className="text-sm text-muted-foreground mb-2">
                                    ⚠️ Make sure to copy your API key now. You won&apos;t be able to see it again!
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
                                Done
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Revoke Confirmation Dialog */}
            <AlertDialog open={!!keyToRevoke} onOpenChange={() => setKeyToRevoke(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke API Key?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently revoke the API key `{keyToRevoke?.name}`. Applications using this key will no longer have access.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRevokeKey} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Revoke Key
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Card>
    );
}
