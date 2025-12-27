'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { securitySettingsSchema, type SecuritySettingsFormData } from '@/lib/validations/settings';
import { useState } from 'react';
import { Loader2, Plus, X } from 'lucide-react';
import { useUpdateSecuritySettings } from '@/hooks/use-settings';
import type { SecuritySettings } from '@/types/settings';

interface SecurityFormProps {
    initialData: SecuritySettings;
    onSuccess?: () => void;
}

export function SecurityForm({ initialData, onSuccess }: SecurityFormProps) {
    const t = useTranslations('Settings');
    const tSecurity = useTranslations('Settings.security');
    const updateMutation = useUpdateSecuritySettings();
    const [newIp, setNewIp] = useState('');

    const sessionTimeouts = [
        { value: 3600, labelKey: '1hour' },
        { value: 28800, labelKey: '8hours' },
        { value: 86400, labelKey: '24hours' },
        { value: 604800, labelKey: '7days' },
        { value: 2592000, labelKey: '30days' },
    ];

    const {
        handleSubmit,
        formState: { errors, isDirty },
        setValue,
        watch,
    } = useForm<SecuritySettingsFormData>({
        resolver: zodResolver(securitySettingsSchema),
        defaultValues: initialData,
    });

    // eslint-disable-next-line react-hooks/incompatible-library -- react-hook-form watch() cannot be memoized
    const ipWhitelist = watch('ipWhitelist') || [];

    const onSubmit = (data: SecuritySettingsFormData) => {
        updateMutation.mutate(data, {
            onSuccess: () => {
                onSuccess?.();
            },
        });
    };

    const handleAddIp = () => {
        if (newIp.trim()) {
            setValue('ipWhitelist', [...ipWhitelist, newIp.trim()], { shouldDirty: true });
            setNewIp('');
        }
    };

    const handleRemoveIp = (index: number) => {
        const updated = ipWhitelist.filter((_, i) => i !== index);
        setValue('ipWhitelist', updated, { shouldDirty: true });
    };

    return (
        <Card id="security" className="p-6 scroll-mt-20">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4">{tSecurity('title')}</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        {tSecurity('description')}
                    </p>
                </div>

                <div className="space-y-6">
                    {/* Session Timeout */}
                    <div className="space-y-2">
                        <Label htmlFor="sessionTimeout">{tSecurity('sessionTimeout')}</Label>
                        <Select
                            value={watch('sessionTimeoutSeconds').toString()}
                            onValueChange={(value) => setValue('sessionTimeoutSeconds', parseInt(value), { shouldDirty: true })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {sessionTimeouts.map((option) => (
                                    <SelectItem key={option.value} value={option.value.toString()}>
                                        {tSecurity(`sessionTimeouts.${option.labelKey}`)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {tSecurity('sessionTimeoutDescription')}
                        </p>
                        {errors.sessionTimeoutSeconds && (
                            <p className="text-sm text-destructive">{errors.sessionTimeoutSeconds.message}</p>
                        )}
                    </div>

                    {/* 2FA Enforcement */}
                    <div className="flex items-center justify-between py-4 border-y border-border">
                        <div className="space-y-0.5">
                            <Label htmlFor="enforce2FA">{tSecurity('enforce2FA')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {tSecurity('enforce2FADescription')}
                            </p>
                        </div>
                        <Switch
                            id="enforce2FA"
                            checked={watch('enforce2FA')}
                            onCheckedChange={(checked) => setValue('enforce2FA', checked, { shouldDirty: true })}
                        />
                    </div>

                    {/* IP Whitelist */}
                    <div className="space-y-4">
                        <div>
                            <Label>{tSecurity('ipWhitelist')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {tSecurity('ipWhitelistDescription')}
                            </p>
                        </div>

                        {/* Add IP Input */}
                        <div className="flex gap-2">
                            <Input
                                placeholder={tSecurity('ipPlaceholder')}
                                value={newIp}
                                onChange={(e) => setNewIp(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddIp();
                                    }
                                }}
                            />
                            <Button type="button" variant="outline" onClick={handleAddIp}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* IP List */}
                        {ipWhitelist.length > 0 && (
                            <div className="space-y-2">
                                {ipWhitelist.map((ip, index) => (
                                    <div key={`${ip}-${index}`} className="flex items-center gap-2">
                                        <Badge variant="secondary" className="flex items-center gap-2 pe-2">
                                            <span className="font-mono text-sm">{ip}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 hover:bg-transparent"
                                                onClick={() => handleRemoveIp(index)}
                                            >
                                                <X className="h-3 w-3" />
                                            </Button>
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}

                        {ipWhitelist.length === 0 && (
                            <p className="text-sm text-muted-foreground italic">
                                {tSecurity('noIpRestrictions')}
                            </p>
                        )}

                        {errors.ipWhitelist && (
                            <p className="text-sm text-destructive">
                                {errors.ipWhitelist.message || errors.ipWhitelist.root?.message}
                            </p>
                        )}
                    </div>
                </div>

                <Button type="submit" disabled={!isDirty || updateMutation.isPending}>
                    {updateMutation.isPending && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                    {t('saveChanges')}
                </Button>
            </form>
        </Card>
    );
}

