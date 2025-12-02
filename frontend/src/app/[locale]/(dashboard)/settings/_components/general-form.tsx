'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generalSettingsSchema, type GeneralSettingsFormData } from '@/lib/validations/settings';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { updateGeneralSettings } from '@/lib/mock-api/settings';
import type { GeneralSettings } from '@/types/settings';

interface GeneralFormProps {
    initialData: GeneralSettings;
    onSuccess?: () => void;
}

const timezones = [
    'Asia/Riyadh',
    'Asia/Dubai',
    'Asia/Kuwait',
    'Europe/London',
    'America/New_York',
    'Asia/Tokyo',
    'UTC',
];

export function GeneralForm({ initialData, onSuccess }: GeneralFormProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const {
        register,
        handleSubmit,
        formState: { errors, isDirty },
        setValue,
        watch,
    } = useForm<GeneralSettingsFormData>({
        resolver: zodResolver(generalSettingsSchema),
        defaultValues: initialData,
    });

    const onSubmit = async (data: GeneralSettingsFormData) => {
        try {
            setLoading(true);
            await updateGeneralSettings(data);
            toast({
                title: 'Success',
                description: 'General settings saved successfully',
            });
            onSuccess?.();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save settings',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card id="general" className="p-6 scroll-mt-20">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4">General Settings</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Configure basic instance information and preferences
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="instanceName">Instance Name</Label>
                        <Input
                            id="instanceName"
                            {...register('instanceName')}
                            placeholder="My KeyGuard Instance"
                        />
                        {errors.instanceName && (
                            <p className="text-sm text-destructive">{errors.instanceName.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="adminEmail">Admin Email</Label>
                        <Input
                            id="adminEmail"
                            type="email"
                            {...register('adminEmail')}
                            placeholder="admin@example.com"
                        />
                        {errors.adminEmail && (
                            <p className="text-sm text-destructive">{errors.adminEmail.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                            value={watch('timezone')}
                            onValueChange={(value) => setValue('timezone', value, { shouldDirty: true })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {timezones.map((tz) => (
                                    <SelectItem key={tz} value={tz}>
                                        {tz}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.timezone && (
                            <p className="text-sm text-destructive">{errors.timezone.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="baseUrl">Base URL</Label>
                        <Input
                            id="baseUrl"
                            type="url"
                            {...register('baseUrl')}
                            placeholder="https://keyguard.example.com"
                        />
                        {errors.baseUrl && (
                            <p className="text-sm text-destructive">{errors.baseUrl.message}</p>
                        )}
                    </div>
                </div>

                <Button type="submit" disabled={!isDirty || loading}>
                    {loading && <Loader2 className="h-4 w-4 me-2 animate-spin" />}
                    Save Changes
                </Button>
            </form>
        </Card>
    );
}
