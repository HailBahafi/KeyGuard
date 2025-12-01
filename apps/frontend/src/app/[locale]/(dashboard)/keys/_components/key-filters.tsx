'use client';

import { useTranslations } from 'next-intl';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface KeyFiltersProps {
    filters: {
        status: string;
        provider: string;
        environment: string;
        sort: string;
    };
    onFilterChange: (key: string, value: string) => void;
    onClearFilters: () => void;
}

export function KeyFilters({ filters, onFilterChange, onClearFilters }: KeyFiltersProps) {
    const t = useTranslations('KeyVault.filters');

    const hasActiveFilters = filters.status !== 'all' ||
        filters.provider !== 'all' ||
        filters.environment !== 'all';

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
                {/* Environment Filter */}
                <Select
                    value={filters.environment}
                    onValueChange={(value) => onFilterChange('environment', value)}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder={t('environment.label')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('environment.all')}</SelectItem>
                        <SelectItem value="production">{t('environment.production')}</SelectItem>
                        <SelectItem value="development">{t('environment.development')}</SelectItem>
                        <SelectItem value="staging">{t('environment.staging')}</SelectItem>
                        <SelectItem value="archived">{t('environment.archived')}</SelectItem>
                    </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select
                    value={filters.status}
                    onValueChange={(value) => onFilterChange('status', value)}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder={t('status.label')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('status.all')}</SelectItem>
                        <SelectItem value="active">{t('status.active')}</SelectItem>
                        <SelectItem value="idle">{t('status.idle')}</SelectItem>
                        <SelectItem value="expired">{t('status.expired')}</SelectItem>
                        <SelectItem value="revoked">{t('status.revoked')}</SelectItem>
                    </SelectContent>
                </Select>

                {/* Provider Filter */}
                <Select
                    value={filters.provider}
                    onValueChange={(value) => onFilterChange('provider', value)}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder={t('provider.label')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">{t('provider.all')}</SelectItem>
                        <SelectItem value="openai">{t('provider.openai')}</SelectItem>
                        <SelectItem value="anthropic">{t('provider.anthropic')}</SelectItem>
                        <SelectItem value="google">{t('provider.google')}</SelectItem>
                        <SelectItem value="azure">{t('provider.azure')}</SelectItem>
                        <SelectItem value="other">{t('provider.other')}</SelectItem>
                    </SelectContent>
                </Select>

                {/* Sort Order */}
                <Select
                    value={filters.sort}
                    onValueChange={(value) => onFilterChange('sort', value)}
                >
                    <SelectTrigger className="w-[180px] ms-auto">
                        <SelectValue placeholder={t('sort.label')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="recent">{t('sort.recent')}</SelectItem>
                        <SelectItem value="nameAsc">{t('sort.nameAsc')}</SelectItem>
                        <SelectItem value="nameDesc">{t('sort.nameDesc')}</SelectItem>
                        <SelectItem value="mostUsed">{t('sort.mostUsed')}</SelectItem>
                        <SelectItem value="expiringSoon">{t('sort.expiringSoon')}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Active Filter Pills */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                    {filters.environment !== 'all' && (
                        <Badge variant="secondary" className="gap-1">
                            {t('environment.label')}: {t(`environment.${filters.environment}`)}
                            <button
                                onClick={() => onFilterChange('environment', 'all')}
                                className="ml-1 hover:text-foreground/80"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {filters.status !== 'all' && (
                        <Badge variant="secondary" className="gap-1">
                            {t('status.label')}: {t(`status.${filters.status}`)}
                            <button
                                onClick={() => onFilterChange('status', 'all')}
                                className="ml-1 hover:text-foreground/80"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    {filters.provider !== 'all' && (
                        <Badge variant="secondary" className="gap-1">
                            {t('provider.label')}: {t(`provider.${filters.provider}`)}
                            <button
                                onClick={() => onFilterChange('provider', 'all')}
                                className="ml-1 hover:text-foreground/80"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </Badge>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="h-6 px-2 text-xs"
                    >
                        {t('clearAll')}
                    </Button>
                </div>
            )}
        </div>
    );
}
