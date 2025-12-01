// Mock data for Key Vault

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

// Generate mock keys
function generateMockKeys(): ApiKey[] {
    const providers: Array<'openai' | 'anthropic' | 'google' | 'azure'> = ['openai', 'anthropic', 'google', 'azure'];
    const statuses: Array<'active' | 'idle' | 'expired' | 'revoked'> = ['active', 'idle', 'expired', 'revoked'];
    const environments: Array<'production' | 'development' | 'staging'> = ['production', 'development', 'staging'];

    const keyNames = [
        'openai-production',
        'anthropic-dev',
        'backup-key',
        'staging-openai',
        'google-prod',
        'azure-test',
        'openai-dev',
        'anthropic-prod'
    ];

    return keyNames.map((name, index) => {
        const provider = providers[index % providers.length];
        const status = index === 0 || index === 1 ? 'active' : statuses[index % statuses.length];
        const env = environments[index % environments.length];

        const created = new Date(Date.now() - (index + 1) * 86400000 * 30); // Months ago
        const lastUsed = status === 'active' ? new Date(Date.now() - Math.random() * 86400000 * 2) : null; // Within 2 days
        const expiresAt = status !== 'expired' && Math.random() > 0.3
            ? new Date(Date.now() + (30 + index * 10) * 86400000) // 30-100 days from now
            : null;

        return {
            id: `key_${index + 1}`,
            name,
            provider,
            status,
            environment: env,
            created: created.toISOString(),
            lastUsed: lastUsed?.toISOString() || null,
            expiresAt: expiresAt?.toISOString() || null,
            deviceCount: status === 'active' ? Math.floor(Math.random() * 5) + 1 : 0,
            usageCount: status === 'active' ? Math.floor(Math.random() * 10000) + 100 : 0,
            description: index % 2 === 0 ? `${env} environment key` : undefined,
            maskedValue: `sk-...${Math.random().toString(36).substring(2, 8)}`
        };
    });
}

const mockKeys = generateMockKeys();

// Mock API call
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
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredKeys = [...mockKeys];

    // Apply filters
    if (filters?.status && filters.status !== 'all') {
        filteredKeys = filteredKeys.filter(k => k.status === filters.status);
    }
    if (filters?.provider && filters.provider !== 'all') {
        filteredKeys = filteredKeys.filter(k => k.provider === filters.provider);
    }
    if (filters?.environment && filters.environment !== 'all') {
        filteredKeys = filteredKeys.filter(k => k.environment === filters.environment);
    }
    if (filters?.search) {
        const search = filters.search.toLowerCase();
        filteredKeys = filteredKeys.filter(k =>
            k.name.toLowerCase().includes(search) ||
            k.provider.toLowerCase().includes(search)
        );
    }

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedKeys = filteredKeys.slice(start, end);

    return {
        keys: paginatedKeys,
        pagination: {
            total: filteredKeys.length,
            page,
            limit,
            pages: Math.ceil(filteredKeys.length / limit)
        }
    };
}

// Create key mock
export async function createKey(data: any): Promise<ApiKey> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const newKey: ApiKey = {
        id: `key_${mockKeys.length + 1}`,
        name: data.name,
        provider: data.provider,
        status: 'active',
        environment: data.environment || 'development',
        created: new Date().toISOString(),
        lastUsed: null,
        expiresAt: data.expiresAt || null,
        deviceCount: 0,
        usageCount: 0,
        description: data.description,
        maskedValue: `sk-...${Math.random().toString(36).substring(2, 8)}`
    };

    mockKeys.push(newKey);
    return newKey;
}

// Revoke key mock
export async function revokeKey(keyId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const key = mockKeys.find(k => k.id === keyId);
    if (key) {
        key.status = 'revoked';
    }
}
