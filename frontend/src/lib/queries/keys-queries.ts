/**
 * Keys Queries - Real API calls to backend
 */

import { apiClient } from '@/lib/api';

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
    maskedValue: string;
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

// Backend response interfaces
interface BackendApiKey {
    id: string;
    name: string;
    provider: string;
    status: string;
    environment: string;
    createdAt: string;
    lastUsed: string | null;
    expiresAt: string | null;
    deviceCount: number;
    usageCount: number;
    description?: string;
    maskedValue: string;
}

interface BackendKeysResponse {
    keys: BackendApiKey[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

interface CreateKeyResponse {
    key: BackendApiKey;
    rawKey: string;
}

// Map backend key to frontend format
function mapBackendKey(key: BackendApiKey): ApiKey {
    return {
        id: key.id,
        name: key.name,
        provider: key.provider.toLowerCase() as ApiKey['provider'],
        status: key.status.toLowerCase() as ApiKey['status'],
        environment: key.environment.toLowerCase() as ApiKey['environment'],
        created: key.createdAt,
        lastUsed: key.lastUsed,
        expiresAt: key.expiresAt,
        deviceCount: key.deviceCount,
        usageCount: key.usageCount,
        description: key.description,
        maskedValue: key.maskedValue,
    };
}

/**
 * Fetch API keys from the backend
 */
export async function fetchKeys(
    page: number = 1,
    limit: number = 20,
    filters?: {
        status?: string;
        provider?: string;
        environment?: string;
        search?: string;
    }
): Promise<KeysPaginationData> {
    try {
        // Build query params
        const params = new URLSearchParams();
        params.set('page', page.toString());
        params.set('limit', limit.toString());
        
        if (filters?.status && filters.status !== 'all') {
            params.set('status', filters.status);
        }
        if (filters?.provider && filters.provider !== 'all') {
            params.set('provider', filters.provider);
        }
        if (filters?.environment && filters.environment !== 'all') {
            params.set('environment', filters.environment);
        }
        if (filters?.search) {
            params.set('search', filters.search);
        }

        const response = await apiClient.get<BackendKeysResponse>(`/keys?${params.toString()}`);
        const data = response.data;

        return {
            keys: data.keys.map(mapBackendKey),
            pagination: data.pagination,
        };
    } catch (error) {
        console.error('Failed to fetch keys:', error);
        return {
            keys: [],
            pagination: { total: 0, page: 1, limit: 20, pages: 0 },
        };
    }
}

/**
 * Create a new API key
 * @returns The created key and the raw key value (only shown once!)
 */
export async function createKey(data: { 
    name: string; 
    provider: string; 
    environment?: string; 
    expiresAt?: string; 
    description?: string;
}, apiKey: string): Promise<{ key: ApiKey; rawKey: string }> {
    const response = await apiClient.post<CreateKeyResponse>('/keys', {
        name: data.name,
        provider: data.provider,
        environment: data.environment || 'development',
        expiresAt: data.expiresAt,
        description: data.description,
    }, {
        headers: {
            'x-api-key': apiKey, // The actual external API key (e.g., OpenAI key)
        },
    });

    return {
        key: mapBackendKey(response.data.key),
        rawKey: response.data.rawKey,
    };
}

/**
 * Revoke an API key
 */
export async function revokeKey(keyId: string): Promise<void> {
    await apiClient.delete(`/keys/${keyId}`);
}
