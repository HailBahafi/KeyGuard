'use client';

import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { LogFilters } from '@/types/audit';

interface AuditFiltersProps {
    filters: LogFilters;
    onFilterChange: (key: keyof LogFilters, value: string) => void;
    onClearFilters: () => void;
}

export function AuditFilters({ filters, onFilterChange, onClearFilters }: AuditFiltersProps) {
    const t = useTranslations('AuditLogs.filters');

    const hasActiveFilters =
        (filters.dateRange && filters.dateRange !== 'all') ||
        (filters.eventType && filters.eventType !== 'all') ||
        (filters.status && filters.status !== 'all') ||
        (filters.severity && filters.severity !== 'all');

    const activeFilterTags: Array<{ key: string; label: string; value: string }> = [];

    if (filters.dateRange && filters.dateRange !== 'all') {
        const labels: Record<string, string> = {
            hour: t('dateRange.hour'),
            day: t('dateRange.day'),
            week: t('dateRange.week'),
            month: t('dateRange.month')
        };
        activeFilterTags.push({
            key: 'dateRange',
            label: t('dateRange.label'),
            value: labels[filters.dateRange] || filters.dateRange
        });
    }

    if (filters.eventType && filters.eventType !== 'all') {
        activeFilterTags.push({
            key: 'eventType',
            label: t('eventType.label'),
            value: filters.eventType.charAt(0).toUpperCase() + filters.eventType.slice(1)
        });
    }

    if (filters.status && filters.status !== 'all') {
        const statusLabels: Record<string, string> = {
            success: t('status.success'),
            failure: t('status.failure')
        };
        activeFilterTags.push({
            key: 'status',
            label: t('status.label'),
            value: statusLabels[filters.status] || filters.status
        });
    }

    if (filters.severity && filters.severity !== 'all') {
        const severityLabels: Record<string, string> = {
            info: t('severity.info'),
            warning: t('severity.warning'),
            error: t('severity.error'),
            critical: t('severity.critical')
        };
        activeFilterTags.push({
            key: 'severity',
            label: t('severity.label'),
            value: severityLabels[filters.severity] || filters.severity
        });
    }

    return (
        <div className="space-y-3">
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
                {/* Date Range Filter */}
                <Select
                    value={filters.dateRange || 'all'}
                    onValueChange={(value) => onFilterChange('dateRange', value)}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder={t('dateRange.label')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('dateRange.all')}</SelectItem>
                        <SelectItem value="hour">{t('dateRange.hour')}</SelectItem>
                        <SelectItem value="day">{t('dateRange.day')}</SelectItem>
                        <SelectItem value="week">{t('dateRange.week')}</SelectItem>
                        <SelectItem value="month">{t('dateRange.month')}</SelectItem>
                    </SelectContent>
                </Select>

                {/* Event Type Filter */}
                <Select
                    value={filters.eventType || 'all'}
                    onValueChange={(value) => onFilterChange('eventType', value)}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder={t('eventType.label')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('eventType.all')}</SelectItem>
                        <SelectItem value="auth">Authentication</SelectItem>
                        <SelectItem value="key">Key Operations</SelectItem>
                        <SelectItem value="device">Device Management</SelectItem>
                        <SelectItem value="system">System Events</SelectItem>
                        <SelectItem value="api">API Events</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                    </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                    value={filters.status || 'all'}
                    onValueChange={(value) => onFilterChange('status', value)}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder={t('status.label')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('status.all')}</SelectItem>
                        <SelectItem value="success">{t('status.success')}</SelectItem>
                        <SelectItem value="failure">{t('status.failure')}</SelectItem>
                    </SelectContent>
                </Select>

                {/* Severity Filter */}
                <Select
                    value={filters.severity || 'all'}
                    onValueChange={(value) => onFilterChange('severity', value)}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder={t('severity.label')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('severity.all')}</SelectItem>
                        <SelectItem value="info">{t('severity.info')}</SelectItem>
                        <SelectItem value="warning">{t('severity.warning')}</SelectItem>
                        <SelectItem value="critical">{t('severity.critical')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Active Filter Tags */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">{t('activeFilters')}:</span>
                    {activeFilterTags.map((tag) => (
                        <Badge
                            key={tag.key}
                            variant="secondary"
                            className="gap-1 pe-1"
                        >
                            <span className="text-xs">
                                <span className="font-semibold">{tag.label}:</span> {tag.value}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0 hover:bg-transparent"
                                onClick={() => onFilterChange(tag.key as keyof LogFilters, 'all')}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="h-6 text-xs"
                    >
                        {t('clearAll')}
                    </Button>
                </div>
            )}
        </div>
    );
}
