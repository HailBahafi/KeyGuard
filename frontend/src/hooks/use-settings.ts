/**
 * Settings Hooks
 * 
 * React Query hooks for managing settings
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import type {
  SettingsState,
  GeneralSettings,
  SecuritySettings,
  NotificationSettings,
} from '@/types/settings';

/**
 * Fetch all settings
 */
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async (): Promise<SettingsState> => {
      const response = await apiClient.get<SettingsState>('/settings');
      return response.data;
    },
    staleTime: 60000, // 1 minute
  });
}

/**
 * Update general settings
 */
export function useUpdateGeneralSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GeneralSettings): Promise<{ success: boolean }> => {
      const response = await apiClient.put<{ success: boolean }>('/settings/general', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated', {
        description: 'General settings have been saved successfully.',
      });
    },
  });
}

/**
 * Update security settings
 */
export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SecuritySettings): Promise<{ success: boolean }> => {
      const response = await apiClient.put<{ success: boolean }>('/settings/security', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Security settings updated', {
        description: 'Security settings have been saved successfully.',
      });
    },
  });
}

/**
 * Update notification settings
 */
export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: NotificationSettings): Promise<{ success: boolean }> => {
      const response = await apiClient.put<{ success: boolean }>('/settings/notifications', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Notification settings updated', {
        description: 'Notification settings have been saved successfully.',
      });
    },
  });
}


