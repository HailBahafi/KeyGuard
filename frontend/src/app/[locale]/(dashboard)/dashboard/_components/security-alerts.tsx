'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SecurityAlert {
    id: string;
    type: 'rate_limit' | 'suspicious_activity' | 'auth_failed' | 'key_expiring';
    severity: 'warning' | 'error';
    message: string;
    timestamp: string;
}

interface SecurityAlertsProps {
    alerts: SecurityAlert[];
    onDismiss?: (alertId: string) => void;
}

export function SecurityAlerts({ alerts, onDismiss }: SecurityAlertsProps) {
    const t = useTranslations('Dashboard.alerts');
    const tEmpty = useTranslations('Dashboard.empty');
    const tSections = useTranslations('Dashboard.sections');

    if (alerts.length === 0) {
        return (
            <div className="flex items-center gap-3 p-4 border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        {tEmpty('noAlerts')}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-0.5">
                        {tEmpty('noAlertsSubtext')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">{tSections('securityAlerts')}</h3>
            {alerts.map((alert) => (
                <Alert
                    key={alert.id}
                    variant={alert.severity === 'error' ? 'destructive' : 'default'}
                    className="relative"
                >
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle className="flex items-center gap-2">
                        {t(`types.${alert.type}`)}
                        <Badge variant={alert.severity === 'error' ? 'destructive' : 'secondary'} className="text-xs">
                            {alert.severity}
                        </Badge>
                    </AlertTitle>
                    <AlertDescription className="mt-2">
                        {alert.message}
                    </AlertDescription>
                    <div className="flex gap-2 mt-4">
                        <Button size="sm" variant="outline">
                            {t('viewDetails')}
                        </Button>
                        {onDismiss && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => onDismiss(alert.id)}
                            >
                                {t('dismiss')}
                            </Button>
                        )}
                    </div>
                </Alert>
            ))}
        </div>
    );
}
