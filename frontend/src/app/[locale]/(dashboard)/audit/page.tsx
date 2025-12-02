'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Download, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
    fetchLogs,
    subscribeToLogs
} from '@/lib/mock-api/audit-logs';
import { AuditLog, LogFilters } from '@/types/audit';
import { LiveIndicator } from './_components/live-indicator';
import { AuditFilters } from './_components/audit-filters';
import { LogRow } from './_components/log-row';
import { LogDetailsSheet } from './_components/log-details';
import { ExportDialog } from './_components/export-dialog';

export default function AuditLogsPage() {
    const { toast } = useToast();
    const logsContainerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

    // Data State
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [newLogs, setNewLogs] = useState<AuditLog[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(true);

    // Live Stream State
    const [isLive, setIsLive] = useState(true);
    const [newLogsCount, setNewLogsCount] = useState(0);

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
    const [totalPages, setTotalPages] = useState(1);

    // Load logs
    const loadLogs = async () => {
        try {
            setLoading(true);
            const data = await fetchLogs(page, 50, {
                search: searchQuery,
                ...filters
            });
            setLogs(data.logs);
            setTotalRecords(data.pagination.total);
            setTotalPages(data.pagination.pages);
        } catch (error) {
            console.error('Failed to load logs:', error);
            toast({
                title: 'Error',
                description: 'Failed to load audit logs',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    // Subscribe to live updates
    useEffect(() => {
        if (!isLive) return;

        const unsubscribe = subscribeToLogs((newLog) => {
            if (isLive) {
                // Add new log to the beginning
                setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep only 50 in view
                setNewLogs(prev => [...prev, newLog]);

                // Auto scroll to top if enabled
                if (shouldAutoScroll && logsContainerRef.current) {
                    logsContainerRef.current.scrollTop = 0;
                }

                // Show toast for critical events
                if (newLog.severity === 'critical') {
                    toast({
                        title: '🚨 Critical Event',
                        description: `${newLog.event} - ${newLog.actor.name}`,
                        variant: 'destructive'
                    });
                }
            } else {
                // If paused, increment counter
                setNewLogsCount(prev => prev + 1);
            }
        });

        return unsubscribe;
    }, [isLive, shouldAutoScroll, toast]);

    // Clear new logs animation after a delay
    useEffect(() => {
        if (newLogs.length > 0) {
            const timer = setTimeout(() => {
                setNewLogs([]);
            }, 2000); // Clear animation after 2 seconds

            return () => clearTimeout(timer);
        }
    }, [newLogs]);

    // Load logs on filter/search/page change
    useEffect(() => {
        const timer = setTimeout(() => {
            loadLogs();
        }, 300); // Debounce search

        return () => clearTimeout(timer);
    }, [searchQuery, filters, page]);

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
        setIsLive(prev => !prev);
        if (!isLive) {
            // Resuming, clear new logs counter
            setNewLogsCount(0);
            loadLogs(); // Refresh to get latest logs
        }
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
                    <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
                    <p className="text-muted-foreground mt-1">
                        Monitor security events and system activity in real-time
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <LiveIndicator
                        isLive={isLive}
                        onToggle={handleToggleLive}
                        newLogsCount={newLogsCount}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsExportOpen(true)}
                    >
                        <Download className="h-4 w-4 me-1" />
                        Export
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
                        placeholder="Search logs by event, actor, target, or error..."
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
                        Showing {logs.length} of {totalRecords.toLocaleString()} logs
                    </span>
                    {isLive && (
                        <span className="text-green-600 dark:text-green-500 font-medium">
                            Live streaming active
                        </span>
                    )}
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
                        <p className="text-muted-foreground">No audit logs found matching your filters.</p>
                        <Button
                            variant="link"
                            onClick={handleClearFilters}
                            className="mt-2"
                        >
                            Clear all filters
                        </Button>
                    </div>
                ) : (
                    // Log Rows
                    logs.map((log) => (
                        <LogRow
                            key={log.id}
                            log={log}
                            onClick={handleViewDetails}
                            isNew={newLogs.some(newLog => newLog.id === log.id)}
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
                        ← Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={page === totalPages}
                    >
                        Next →
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
