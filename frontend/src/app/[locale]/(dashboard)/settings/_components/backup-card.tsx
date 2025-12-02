'use client';

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
    const { toast } = useToast();

    const handleBackup = () => {
        toast({
            title: 'Coming Soon',
            description: 'Backup functionality will be available in the next release',
        });
    };

    return (
        <Card id="backup" className="p-6 scroll-mt-20">
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-semibold mb-4">Backup & Maintenance</h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Manage backups and data retention settings
                    </p>
                </div>

                <div className="space-y-6 opacity-60">
                    {/* Manual Backup */}
                    <div className="space-y-3">
                        <Label>Manual Backup</Label>
                        <p className="text-sm text-muted-foreground">
                            Download a complete backup of your KeyGuard configuration and data
                        </p>
                        {lastBackupAt && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    Last backup: {formatDistanceToNow(new Date(lastBackupAt), { addSuffix: true })}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Log Retention */}
                    <div className="space-y-3">
                        <Label>Log Retention (Days)</Label>
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
                            Audit logs will be retained for 90 days before automatic deletion
                        </p>
                    </div>
                </div>

                <Button onClick={handleBackup} className="w-full sm:w-auto">
                    <Download className="h-4 w-4 me-2" />
                    Download Backup
                </Button>
            </div>
        </Card>
    );
}
