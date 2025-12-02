'use client';

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
    const hasActiveFilters =
        (filters.dateRange && filters.dateRange !== 'all') ||
        (filters.eventType && filters.eventType !== 'all') ||
        (filters.status && filters.status !== 'all') ||
        (filters.severity && filters.severity !== 'all');

    const activeFilterTags: Array<{ key: string; label: string; value: string }> = [];

    if (filters.dateRange && filters.dateRange !== 'all') {
        const labels: Record<string, string> = {
            hour: 'Last Hour',
            day: 'Last 24 Hours',
            week: 'Last Week',
            month: 'Last Month'
        };
        activeFilterTags.push({
            key: 'dateRange',
            label: 'Date',
            value: labels[filters.dateRange] || filters.dateRange
        });
    }

    if (filters.eventType && filters.eventType !== 'all') {
        activeFilterTags.push({
            key: 'eventType',
            label: 'Event',
            value: filters.eventType.charAt(0).toUpperCase() + filters.eventType.slice(1)
        });
    }

    if (filters.status && filters.status !== 'all') {
        activeFilterTags.push({
            key: 'status',
            label: 'Status',
            value: filters.status.charAt(0).toUpperCase() + filters.status.slice(1)
        });
    }

    if (filters.severity && filters.severity !== 'all') {
        activeFilterTags.push({
            key: 'severity',
            label: 'Severity',
            value: filters.severity.charAt(0).toUpperCase() + filters.severity.slice(1)
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
                        <SelectValue placeholder="Date Range" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="hour">Last Hour</SelectItem>
                        <SelectItem value="day">Last 24 Hours</SelectItem>
                        <SelectItem value="week">Last Week</SelectItem>
                        <SelectItem value="month">Last Month</SelectItem>
                    </SelectContent>
                </Select>

                {/* Event Type Filter */}
                <Select
                    value={filters.eventType || 'all'}
                    onValueChange={(value) => onFilterChange('eventType', value)}
                >
                    <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Events</SelectItem>
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
                        <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="failure">Failed</SelectItem>
                    </SelectContent>
                </Select>

                {/* Severity Filter */}
                <Select
                    value={filters.severity || 'all'}
                    onValueChange={(value) => onFilterChange('severity', value)}
                >
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Severity</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Active Filter Tags */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Active filters:</span>
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
                        Clear All
                    </Button>
                </div>
            )}
        </div>
    );
}
