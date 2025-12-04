/**
 * Devices Hooks
 * 
 * React Query hooks for managing devices
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import type { Device, DevicesPaginationData, DeviceStats, EnrollmentCode } from '@/types/device';

interface DevicesParams {
  page?: number;
  limit?: number;
  status?: string;
  platform?: string;
  lastSeen?: string;
  search?: string;
  sort?: string;
}

export interface ApproveDeviceDto {
  name: string;
  ownerName: string;
  ownerEmail: string;
  location?: string;
}

export interface EnrollmentCodeDto {
  name: string;
  expiresInMinutes?: number;
  description?: string;
}

/**
 * Fetch devices with pagination and filters
 */
export function useDevices(params: DevicesParams = {}) {
  return useQuery({
    queryKey: ['devices', params],
    queryFn: async (): Promise<DevicesPaginationData> => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.status) searchParams.append('status', params.status);
      if (params.platform) searchParams.append('platform', params.platform);
      if (params.lastSeen) searchParams.append('lastSeen', params.lastSeen);
      if (params.search) searchParams.append('search', params.search);
      if (params.sort) searchParams.append('sort', params.sort);

      const response = await apiClient.get<DevicesPaginationData>(
        `/devices?${searchParams.toString()}`
      );
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Get device by ID
 */
export function useDevice(deviceId: string) {
  return useQuery({
    queryKey: ['devices', deviceId],
    queryFn: async (): Promise<Device> => {
      const response = await apiClient.get<Device>(`/devices/${deviceId}`);
      return response.data;
    },
    enabled: !!deviceId,
  });
}

/**
 * Approve a pending device
 */
export function useApproveDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ deviceId, data }: { deviceId: string; data: ApproveDeviceDto }): Promise<Device> => {
      const response = await apiClient.post<Device>(`/devices/${deviceId}/approve`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Device approved', {
        description: 'The device has been approved successfully.',
      });
    },
  });
}

/**
 * Revoke a device
 */
export function useRevokeDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deviceId: string): Promise<void> => {
      await apiClient.delete(`/devices/${deviceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Device revoked', {
        description: 'The device has been revoked successfully.',
      });
    },
  });
}

/**
 * Suspend a device
 */
export function useSuspendDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (deviceId: string): Promise<void> => {
      await apiClient.post(`/devices/${deviceId}/suspend`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      toast.success('Device suspended', {
        description: 'The device has been suspended successfully.',
      });
    },
  });
}

/**
 * Generate enrollment code
 */
export function useEnrollmentCode() {
  return useMutation({
    mutationFn: async (data: EnrollmentCodeDto): Promise<EnrollmentCode> => {
      const response = await apiClient.post<EnrollmentCode>('/devices/enroll', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Enrollment code generated', {
        description: 'Share this code with the device owner.',
      });
    },
  });
}


