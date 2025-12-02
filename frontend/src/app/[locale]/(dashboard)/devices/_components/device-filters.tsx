'use client';

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
                    <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                    <SelectItem value="revoked">Revoked</SelectItem>
                    <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
            </Select>

            {/* Platform Filter */}
            <Select
                value={filters.platform}
                onValueChange={(value) => onFilterChange('platform', value)}
            >
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
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
                    <SelectValue placeholder="Last Seen" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="hour">Last Hour</SelectItem>
                    <SelectItem value="day">Last 24 Hours</SelectItem>
                    <SelectItem value="week">Last Week</SelectItem>
                </SelectContent>
            </Select>

            {/* Sort */}
            <Select
                value={filters.sort}
                onValueChange={(value) => onFilterChange('sort', value)}
            >
                <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="platform">Platform</SelectItem>
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
                    Clear Filters
                </Button>
            )}
        </div>
    );
}
