'use client';

import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface DeviceFiltersProps {
    filters: {
        status: string;
        platform: string;
        lastSeen: string;
        sort: string;
    };
    onFilterChange: (key: string, value: string) => void;
    onClearFilters: () => void;
}

export function DeviceFilters({ filters, onFilterChange, onClearFilters }: DeviceFiltersProps) {
    const t = useTranslations('Devices.filters');

    const hasActiveFilters =
        filters.status !== 'all' ||
        filters.platform !== 'all' ||
        filters.lastSeen !== 'all';

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <Select
                value={filters.status}
                onValueChange={(value) => onFilterChange('status', value)}
            >
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder={t('status.label')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('status.all')}</SelectItem>
                    <SelectItem value="active">{t('status.active')}</SelectItem>
                    <SelectItem value="pending">{t('status.pending')}</SelectItem>
                    <SelectItem value="suspended">{t('status.suspended')}</SelectItem>
                    <SelectItem value="revoked">{t('status.revoked')}</SelectItem>
                    <SelectItem value="offline">{t('status.offline')}</SelectItem>
                </SelectContent>
            </Select>

            {/* Platform Filter */}
            <Select
                value={filters.platform}
                onValueChange={(value) => onFilterChange('platform', value)}
            >
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder={t('platform.label')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('platform.all')}</SelectItem>
                    <SelectItem value="macOS">macOS</SelectItem>
                    <SelectItem value="Windows">Windows</SelectItem>
                    <SelectItem value="Linux">Linux</SelectItem>
                    <SelectItem value="iOS">iOS</SelectItem>
                    <SelectItem value="Android">Android</SelectItem>
                </SelectContent>
            </Select>

            {/* Last Seen Filter */}
            <Select
                value={filters.lastSeen}
                onValueChange={(value) => onFilterChange('lastSeen', value)}
            >
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder={t('lastSeen.label')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">{t('lastSeen.all')}</SelectItem>
                    <SelectItem value="hour">{t('lastSeen.hour')}</SelectItem>
                    <SelectItem value="day">{t('lastSeen.day')}</SelectItem>
                    <SelectItem value="week">{t('lastSeen.week')}</SelectItem>
                </SelectContent>
            </Select>

            {/* Sort */}
            <Select
                value={filters.sort}
                onValueChange={(value) => onFilterChange('sort', value)}
            >
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder={t('sort.label')} />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="recent">{t('sort.recent')}</SelectItem>
                    <SelectItem value="name">{t('sort.name')}</SelectItem>
                    <SelectItem value="platform">{t('sort.platform')}</SelectItem>
                </SelectContent>
            </Select>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="text-muted-foreground"
                >
                    <X className="h-4 w-4 me-1" />
                    {t('clearAll')}
                </Button>
            )}
        </div>
    );
}
