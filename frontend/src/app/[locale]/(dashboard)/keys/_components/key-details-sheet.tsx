'use client';

import { useTranslations } from 'next-intl';
import { Clock, Activity, Shield, Smartphone, AlertTriangle } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ApiKey } from '@/hooks/use-keys';

interface KeyDetailsSheetProps {
    apiKey: ApiKey | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onRotate: (key: ApiKey) => void;
    onRevoke: (key: ApiKey) => void;
}

export function KeyDetailsSheet({ apiKey, open, onOpenChange, onRotate, onRevoke }: KeyDetailsSheetProps) {
    const t = useTranslations('KeyVault.detailsSheet');

    if (!apiKey) return null;

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-full sm:max-w-xl p-0">
                <div className="h-full flex flex-col">
                    <SheetHeader className="p-6 border-b">
                        <div className="flex items-center justify-between">
                            <SheetTitle>{t('title')}</SheetTitle>
                            <Badge variant={apiKey.status === 'active' ? 'default' : 'secondary'}>
                                {apiKey.status}
                            </Badge>
                        </div>
                        <SheetDescription>
                            {apiKey.name} • {apiKey.maskedValue}
                        </SheetDescription>
                    </SheetHeader>

                    <ScrollArea className="flex-1">
                        <div className="p-6 space-y-8">
                            {/* Information Grid */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {t('information.created')}
                                    </span>
                                    <p className="font-medium">
                                        {new Date(apiKey.created).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Activity className="w-4 h-4" />
                                        {t('information.lastUsed')}
                                    </span>
                                    <p className="font-medium">
                                        {apiKey.lastUsed ? new Date(apiKey.lastUsed).toLocaleString() : '-'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Shield className="w-4 h-4" />
                                        {t('information.expiration')}
                                    </span>
                                    <p className="font-medium">
                                        {apiKey.expiresAt ? new Date(apiKey.expiresAt).toLocaleDateString() : 'Never'}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                        <Smartphone className="w-4 h-4" />
                                        {t('devices.title')}
                                    </span>
                                    <p className="font-medium">{apiKey.deviceCount} devices</p>
                                </div>
                            </div>

                            <Separator />

                            {/* Usage Stats (Placeholder for chart) */}
                            <div className="space-y-4">
                                <h3 className="font-semibold">{t('usageStats.title')}</h3>
                                <div className="h-40 bg-muted/30 rounded-lg flex items-center justify-center border border-dashed">
                                    <p className="text-muted-foreground text-sm">Usage Chart Placeholder</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground">{t('usageStats.totalCalls')}</p>
                                        <p className="text-2xl font-bold">{apiKey.usageCount.toLocaleString()}</p>
                                    </div>
                                    <div className="p-4 bg-muted/50 rounded-lg">
                                        <p className="text-sm text-muted-foreground">{t('usageStats.successRate')}</p>
                                        <p className="text-2xl font-bold text-green-600">99.8%</p>
                                    </div>
                                </div>
                            </div>

                            <Separator />

                            {/* Danger Zone */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-destructive flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    {t('dangerZone.title')}
                                </h3>
                                <div className="border border-destructive/20 rounded-lg divide-y divide-destructive/10">
                                    <div className="p-4 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{t('dangerZone.rotateTitle')}</p>
                                            <p className="text-sm text-muted-foreground">{t('dangerZone.rotateDescription')}</p>
                                        </div>
                                        <Button variant="outline" onClick={() => onRotate(apiKey)}>
                                            {t('dangerZone.rotateTitle')}
                                        </Button>
                                    </div>
                                    <div className="p-4 flex items-center justify-between bg-destructive/5">
                                        <div>
                                            <p className="font-medium text-destructive">{t('dangerZone.revokeTitle')}</p>
                                            <p className="text-sm text-muted-foreground">{t('dangerZone.revokeDescription')}</p>
                                        </div>
                                        <Button variant="destructive" onClick={() => onRevoke(apiKey)}>
                                            {t('dangerZone.revokeTitle')}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </ScrollArea>
                </div>
            </SheetContent>
        </Sheet>
    );
}
