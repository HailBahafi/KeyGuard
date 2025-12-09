'use client';

import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { Download, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface BackupCardProps {
    lastBackupAt: string | null;
}

export function BackupCard({ lastBackupAt }: BackupCardProps) {
    const tBackup = useTranslations('Settings.backup');
    const { toast } = useToast();

    const handleBackup = () => {
        toast({
            title: tBackup('comingSoon'),
            description: tBackup('comingSoonDescription'),
        });
    };

    return (
        <Card id="backup" className="p-6 scroll-mt-20">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4">{tBackup('title')}</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        {tBackup('description')}
                    </p>
                </div>

                <div className="space-y-6 opacity-60">
                    {/* Manual Backup */}
                    <div className="space-y-3">
                        <Label>{tBackup('manualBackup')}</Label>
                        <p className="text-sm text-muted-foreground">
                            {tBackup('manualBackupDescription')}
                        </p>
                        {lastBackupAt && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {tBackup('lastBackup', { time: formatDistanceToNow(new Date(lastBackupAt), { addSuffix: true }) })}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Log Retention */}
                    <div className="space-y-3">
                        <Label>{tBackup('logRetention')}</Label>
                        <div className="flex items-center gap-4">
                            <Slider
                                defaultValue={[90]}
                                max={365}
                                min={30}
                                step={1}
                                className="flex-1"
                                disabled
                            />
                            <span className="text-sm font-medium w-12 text-center">90</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            {tBackup('logRetentionDescription', { days: 90 })}
                        </p>
                    </div>
                </div>

                <Button onClick={handleBackup} className="w-full sm:w-auto">
                    <Download className="h-4 w-4 me-2" />
                    {tBackup('downloadBackup')}
                </Button>
            </div>
        </Card>
    );
}

