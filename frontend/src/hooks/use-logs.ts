/**
 * Audit Logs Hooks
 * 
 * React Query hooks for fetching audit logs
 */

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { AuditLog, AuditLogsPaginationData, LogFilters } from '@/types/audit';

interface LogsParams extends LogFilters {
  page?: number;
  limit?: number;
}

/**
 * Fetch audit logs with pagination and filters
 */
export function useLogs(params: LogsParams = {}) {
  return useQuery({
    queryKey: ['logs', params],
    queryFn: async (): Promise<AuditLogsPaginationData> => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.search) searchParams.append('search', params.search);
      if (params.dateRange) searchParams.append('dateRange', params.dateRange);
      if (params.eventType) searchParams.append('eventType', params.eventType);
      if (params.status) searchParams.append('status', params.status);
      if (params.severity) searchParams.append('severity', params.severity);
      if (params.startDate) searchParams.append('startDate', params.startDate);
      if (params.endDate) searchParams.append('endDate', params.endDate);

      const response = await apiClient.get<AuditLogsPaginationData>(
        `/logs?${searchParams.toString()}`
      );
      return response.data;
    },
    staleTime: 10000, // 10 seconds (logs change frequently)
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
    placeholderData: (previousData) => previousData, // Keep previous data while fetching for smooth pagination
  });
}

/**
 * Get a single audit log by ID
 */
export function useLog(logId: string) {
  return useQuery({
    queryKey: ['logs', logId],
    queryFn: async (): Promise<AuditLog> => {
      const response = await apiClient.get<AuditLog>(`/logs/${logId}`);
      return response.data;
    },
    enabled: !!logId,
  });
}

/**
 * Export audit logs
 */
import { useMutation } from '@tanstack/react-query';
import type { ExportLogsPayload } from '@/types/audit';

export function useExportLogs() {
  return useMutation({
    mutationFn: async (payload: ExportLogsPayload) => {
      const response = await apiClient.post('/audit/logs/export', payload, {
        responseType: 'blob', // Important for file download
      });
      return response.data;
    },
  });
}


