'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Download, FileJson, FileSpreadsheet } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { LogFilters } from '@/types/audit';

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    filters?: LogFilters;
    totalRecords: number;
}

export function ExportDialog({
    open,
    onOpenChange,
    filters,
    totalRecords
}: ExportDialogProps) {
    const [format, setFormat] = useState<'csv' | 'json'>('json');
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        try {
            setLoading(true);
            // TODO: Replace with real endpoint when available: GET /logs/export?format=json&...
            const searchParams = new URLSearchParams();
            searchParams.append('format', format);
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value && value !== 'all') {
                        searchParams.append(key, value);
                    }
                });
            }

            const response = await apiClient.get(`/logs/export?${searchParams.toString()}`, {
                responseType: 'blob',
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `audit-logs-${Date.now()}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            toast.success('Export completed');
            setLoading(false);
            onOpenChange(false);
        } catch (error) {
            toast.error('Failed to export logs');
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Export Audit Logs</DialogTitle>
                    <DialogDescription>
                        Download audit logs for compliance and analysis
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Format Selection */}
                    <div className="space-y-3">
                        <Label>Export Format</Label>
                        <RadioGroup value={format} onValueChange={(value) => setFormat(value as 'csv' | 'json')}>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="json" id="json" />
                                <Label htmlFor="json" className="flex items-center gap-2 cursor-pointer font-normal">
                                    <FileJson className="h-4 w-4" />
                                    <div>
                                        <p className="text-sm font-medium">JSON</p>
                                        <p className="text-xs text-muted-foreground">
                                            Full structured data with nested objects
                                        </p>
                                    </div>
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="csv" id="csv" />
                                <Label htmlFor="csv" className="flex items-center gap-2 cursor-pointer font-normal">
                                    <FileSpreadsheet className="h-4 w-4" />
                                    <div>
                                        <p className="text-sm font-medium">CSV</p>
                                        <p className="text-xs text-muted-foreground">
                                            Flat format compatible with Excel and databases
                                        </p>
                                    </div>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    {/* Export Info */}
                    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Records to export</span>
                            <span className="font-medium text-foreground">{totalRecords.toLocaleString()}</span>
                        </div>
                        {filters && Object.keys(filters).length > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Filters applied</span>
                                <span className="font-medium text-foreground">Yes</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">File format</span>
                            <span className="font-medium text-foreground uppercase">{format}</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1"
                            onClick={handleExport}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <Download className="h-4 w-4 me-2 animate-bounce" />
                                    Exporting...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 me-2" />
                                    Export
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
