/**
 * API Keys Hooks
 * 
 * React Query hooks for managing API keys
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';

// Types
export interface ApiKey {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'azure';
  status: 'active' | 'idle' | 'expired' | 'revoked';
  environment: 'production' | 'development' | 'staging';
  created: string;
  lastUsed: string | null;
  expiresAt: string | null;
  deviceCount: number;
  usageCount: number;
  description?: string;
  maskedValue?: string; // Optional, may be provided by backend or computed on frontend
}

export interface KeysPaginationData {
  keys: ApiKey[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface CreateKeyDto {
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'azure';
  environment: 'production' | 'development' | 'staging';
  description?: string;
  expiresAt?: string;
}

export interface CreateKeyResponse extends ApiKey {
  rawKey?: string; // ⚠️ Shown only once! Must be copied immediately
}

interface KeysParams {
  page?: number;
  limit?: number;
  status?: string;
  provider?: string;
  environment?: string;
  search?: string;
}

/**
 * Fetch API keys with pagination and filters
 */
export function useApiKeys(params: KeysParams = {}) {
  return useQuery({
    queryKey: ['keys', params],
    queryFn: async (): Promise<KeysPaginationData> => {
      const searchParams = new URLSearchParams();
      if (params.page) searchParams.append('page', params.page.toString());
      if (params.limit) searchParams.append('limit', params.limit.toString());
      if (params.status) searchParams.append('status', params.status);
      if (params.provider) searchParams.append('provider', params.provider);
      if (params.environment) searchParams.append('environment', params.environment);
      if (params.search) searchParams.append('search', params.search);

      const response = await apiClient.get<KeysPaginationData>(
        `/keys?${searchParams.toString()}`
      );
      return response.data;
    },
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Create a new API key
 */
export function useCreateKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateKeyDto): Promise<CreateKeyResponse> => {
      const response = await apiClient.post<CreateKeyResponse>('/keys', data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch keys list
      queryClient.invalidateQueries({ queryKey: ['keys'] });
      // NOTE: Success toast will be shown by the component after user copies rawKey
    },
  });
}

/**
 * Revoke an API key
 */
export function useRevokeKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string): Promise<void> => {
      await apiClient.post(`/keys/${keyId}/revoke`);
    },
    onSuccess: () => {
      // Invalidate and refetch keys list
      queryClient.invalidateQueries({ queryKey: ['keys'] });
      toast.success('API key revoked', {
        description: 'The API key has been revoked successfully.',
      });
    },
  });
}

/**
 * Rotate an API key (if endpoint exists)
 */
export function useRotateKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keyId: string): Promise<ApiKey> => {
      const response = await apiClient.post<ApiKey>(`/keys/${keyId}/rotate`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['keys'] });
      toast.success('API key rotated', {
        description: 'A new API key has been generated.',
      });
    },
  });
}

