'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Search, Download, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useLogs } from '@/hooks/use-logs';
import type { AuditLog, LogFilters } from '@/types/audit';
import { LiveIndicator } from './_components/live-indicator';
import { AuditFilters } from './_components/audit-filters';
import { LogRow } from './_components/log-row';
import { LogDetailsSheet } from './_components/log-details';
import { ExportDialog } from './_components/export-dialog';

export default function AuditLogsPage() {
    const t = useTranslations('AuditLogs');
    const logsContainerRef = useRef<HTMLDivElement>(null);

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<LogFilters>({
        dateRange: 'day', // Default to last 24 hours
        eventType: 'all',
        status: 'all',
        severity: 'all'
    });

    // Dialog/Sheet State
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);

    // React Query hook - auto-refetches every 30s for live updates
    const { data: logsData, isLoading: loading } = useLogs({
        page,
        limit: 50,
        search: searchQuery || undefined,
        dateRange: filters.dateRange !== 'all' ? filters.dateRange : undefined,
        eventType: filters.eventType !== 'all' ? filters.eventType : undefined,
        status: filters.status !== 'all' ? filters.status : undefined,
        severity: filters.severity !== 'all' ? filters.severity : undefined,
    });

    const logs = logsData?.logs || [];
    const totalRecords = logsData?.pagination.total || 0;
    const totalPages = logsData?.pagination.pages || 1;

    // Handlers
    const handleFilterChange = (key: keyof LogFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setPage(1); // Reset to first page
    };

    const handleClearFilters = () => {
        setFilters({
            dateRange: 'all',
            eventType: 'all',
            status: 'all',
            severity: 'all'
        });
        setSearchQuery('');
        setPage(1);
    };

    const handleToggleLive = () => {
        // Live updates are handled by React Query's refetchInterval
        // This is just for UI state
        toast.info(t('toast.liveUpdatesActive'));
    };

    const handleViewDetails = (log: AuditLog) => {
        setSelectedLog(log);
        setIsDetailsOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t('subtitle')}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <LiveIndicator
                        isLive={true}
                        onToggle={handleToggleLive}
                        newLogsCount={0}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsExportOpen(true)}
                    >
                        <Download className="h-4 w-4 me-1" />
                        {t('export')}
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                    >
                        <Settings className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col gap-4">
                <div className="relative">
                    <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={t('search.placeholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="ps-10 max-w-md"
                    />
                </div>
                <AuditFilters
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                />
            </div>

            {/* Logs Summary */}
            {!loading && (
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                        {t('summary.showing', { count: logs.length, total: totalRecords.toLocaleString() })}
                    </span>
                    <span className="text-green-600 dark:text-green-500 font-medium">
                        {t('summary.autoRefresh')}
                    </span>
                </div>
            )}

            {/* Logs List */}
            <div
                ref={logsContainerRef}
                className="space-y-3 max-h-[700px] overflow-y-auto pe-2"
            >
                {loading ? (
                    // Loading Skeletons
                    Array.from({ length: 8 }).map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))
                ) : logs.length === 0 ? (
                    // Empty State
                    <div className="text-center py-12 border border-dashed border-border rounded-lg bg-muted/20">
                        <p className="text-muted-foreground">{t('empty.noLogs')}</p>
                        <Button
                            variant="link"
                            onClick={handleClearFilters}
                            className="mt-2"
                        >
                            {t('empty.clearFilters')}
                        </Button>
                    </div>
                ) : (
                    // Log Rows
                    logs.map((log) => (
                        <LogRow
                            key={log.id}
                            log={log}
                            onClick={handleViewDetails}
                            isNew={false}
                        />
                    ))
                )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                        disabled={page === 1}
                    >
                        ← {t('pagination.previous')}
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {t('pagination.page', { current: page, total: totalPages })}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={page === totalPages}
                    >
                        {t('pagination.next')} →
                    </Button>
                </div>
            )}

            {/* Dialogs */}
            <LogDetailsSheet
                log={selectedLog}
                open={isDetailsOpen}
                onOpenChange={setIsDetailsOpen}
            />

            <ExportDialog
                open={isExportOpen}
                onOpenChange={setIsExportOpen}
                filters={filters}
                totalRecords={totalRecords}
            />
        </div>
    );
}
