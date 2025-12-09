'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

export function NotificationsForm() {
    const t = useTranslations('Settings');
    const tNotifications = useTranslations('Settings.notifications');
    const { toast } = useToast();

    const handleSave = () => {
        toast({
            title: tNotifications('comingSoon'),
            description: tNotifications('comingSoonDescription'),
        });
    };

    return (
        <Card id="notifications" className="p-6 scroll-mt-20">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4">{tNotifications('title')}</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        {tNotifications('description')}
                    </p>
                </div>

                <div className="space-y-4 opacity-60">
                    <div className="space-y-2">
                        <Label>{tNotifications('smtpHost')}</Label>
                        <Input placeholder={tNotifications('smtpHostPlaceholder')} disabled />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>{tNotifications('smtpPort')}</Label>
                            <Input placeholder={tNotifications('smtpPortPlaceholder')} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>{tNotifications('smtpUsername')}</Label>
                            <Input placeholder={tNotifications('smtpUsernamePlaceholder')} disabled />
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-4 border-y border-border">
                        <div className="space-y-0.5">
                            <Label>{tNotifications('emailAlerts')}</Label>
                            <p className="text-sm text-muted-foreground">
                                {tNotifications('emailAlertsDescription')}
                            </p>
                        </div>
                        <Switch disabled />
                    </div>
                </div>

                <Button onClick={handleSave}>
                    {t('saveChanges')}
                </Button>
            </div>
        </Card>
    );
}

