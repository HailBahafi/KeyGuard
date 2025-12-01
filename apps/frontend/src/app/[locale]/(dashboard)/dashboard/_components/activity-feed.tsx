'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslations } from 'next-intl';
import { Inbox } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
    id: string;
    device: string;
    action: string;
    keyName?: string;
    timestamp: string;
    status: 'success' | 'failed';
}

interface ActivityFeedProps {
    activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
    const t = useTranslations('Dashboard.activity');
    const tEmpty = useTranslations('Dashboard.empty');

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        const minutes = Math.floor((Date.now() - date.getTime()) / 60000);

        if (minutes < 1) return t('timeAgo.justNow');
        if (minutes < 60) return t('timeAgo.minutesAgo', { count: minutes });
        if (minutes < 1440) return t('timeAgo.hoursAgo', { count: Math.floor(minutes / 60) });
        return t('timeAgo.daysAgo', { count: Math.floor(minutes / 1440) });
    };

    if (activities.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{t('viewAll')}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                        <p className="text-sm font-medium">{tEmpty('noActivity')}</p>
                        <p className="text-xs text-muted-foreground mt-1">{tEmpty('noActivitySubtext')}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('viewAll')}</CardTitle>
                <button className="text-sm text-primary hover:underline">
                    {t('viewAll')}
                </button>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                        {activities.map((activity, index) => (
                            <div
                                key={activity.id}
                                className="flex items-start gap-3 pb-4 border-b border-border last:border-0"
                            >
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium">{activity.device}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {activity.keyName
                                            ? t('actions.keyRetrieved', { keyName: activity.keyName })
                                            : t('actions.requestMade')}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {formatTime(activity.timestamp)}
                                        </span>
                                        <Badge
                                            variant={activity.status === 'success' ? 'default' : 'destructive'}
                                            className="text-xs"
                                        >
                                            {activity.status === 'success' ? '✓ Success' : '✗ Failed'}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
