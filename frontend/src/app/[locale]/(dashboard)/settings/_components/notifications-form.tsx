'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';

export function NotificationsForm() {
    const { toast } = useToast();

    const handleSave = () => {
        toast({
            title: 'Coming Soon',
            description: 'Notification settings will be available in the next release',
        });
    };

    return (
        <Card id="notifications" className="p-6 scroll-mt-20">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Notification Settings</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Configure email notifications and SMTP settings
                    </p>
                </div>

                <div className="space-y-4 opacity-60">
                    <div className="space-y-2">
                        <Label>SMTP Host</Label>
                        <Input placeholder="smtp.gmail.com" disabled />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>SMTP Port</Label>
                            <Input placeholder="587" disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>SMTP Username</Label>
                            <Input placeholder="notifications@example.com" disabled />
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-4 border-y border-border">
                        <div className="space-y-0.5">
                            <Label>Email Alerts</Label>
                            <p className="text-sm text-muted-foreground">
                                Send email notifications for critical events
                            </p>
                        </div>
                        <Switch disabled />
                    </div>
                </div>

                <Button onClick={handleSave}>
                    Save Changes
                </Button>
            </div>
        </Card>
    );
}
