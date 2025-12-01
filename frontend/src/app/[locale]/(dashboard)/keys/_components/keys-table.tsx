'use client';

import { useTranslations } from 'next-intl';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ApiKey } from '@/lib/queries/keys-queries';
import { KeyActionsMenu } from './key-actions-menu';

interface KeysTableProps {
    keys: ApiKey[];
    loading: boolean;
    onViewDetails: (key: ApiKey) => void;
    onRotate: (key: ApiKey) => void;
    onRevoke: (key: ApiKey) => void;
}

export function KeysTable({ keys, loading, onViewDetails, onRotate, onRevoke }: KeysTableProps) {
    const t = useTranslations('KeyVault.table');

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-900';
            case 'idle': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900';
            case 'expired': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-900';
            case 'revoked': return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800';
            default: return 'bg-gray-100';
        }
    };

    if (loading) {
        return (
            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('columns.name')}</TableHead>
                            <TableHead>{t('columns.provider')}</TableHead>
                            <TableHead>{t('columns.status')}</TableHead>
                            <TableHead>{t('columns.usedBy')}</TableHead>
                            <TableHead>{t('columns.expiration')}</TableHead>
                            <TableHead className="text-end">{t('columns.actions')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[...Array(5)].map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><div className="h-10 w-32 bg-muted animate-pulse rounded" /></TableCell>
                                <TableCell><div className="h-6 w-20 bg-muted animate-pulse rounded" /></TableCell>
                                <TableCell><div className="h-6 w-16 bg-muted animate-pulse rounded" /></TableCell>
                                <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                                <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                                <TableCell><div className="h-8 w-8 ms-auto bg-muted animate-pulse rounded" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>{t('columns.name')}</TableHead>
                        <TableHead>{t('columns.provider')}</TableHead>
                        <TableHead>{t('columns.status')}</TableHead>
                        <TableHead>{t('columns.usedBy')}</TableHead>
                        <TableHead>{t('columns.expiration')}</TableHead>
                        <TableHead className="text-end">{t('columns.actions')}</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {keys.map((key) => {
                        const daysUntilExpiry = key.expiresAt
                            ? Math.floor((new Date(key.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                            : null;

                        return (
                            <TableRow key={key.id} className="group">
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span
                                            className="font-medium cursor-pointer hover:underline"
                                            onClick={() => onViewDetails(key)}
                                        >
                                            {key.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground font-mono">
                                            {key.maskedValue}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                        {key.provider}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={getStatusColor(key.status)}>
                                        {t(`status.${key.status}`)}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <span className="text-sm text-muted-foreground">
                                        {key.deviceCount > 0
                                            ? t('usedBy.devices', { count: key.deviceCount })
                                            : t('usedBy.notUsed')
                                        }
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {daysUntilExpiry !== null ? (
                                        <span className={`text-sm ${daysUntilExpiry < 7 ? 'text-red-600 dark:text-red-400 font-medium' :
                                                daysUntilExpiry < 30 ? 'text-yellow-600 dark:text-yellow-400' : ''
                                            }`}>
                                            {t('expiration.daysLeft', { count: daysUntilExpiry })}
                                        </span>
                                    ) : (
                                        <span className="text-sm text-muted-foreground">
                                            {t('expiration.never')}
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-end">
                                    <KeyActionsMenu
                                        apiKey={key}
                                        onViewDetails={onViewDetails}
                                        onRotate={onRotate}
                                        onRevoke={onRevoke}
                                    />
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
