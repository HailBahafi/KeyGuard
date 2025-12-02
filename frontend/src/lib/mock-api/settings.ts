// Mock API for Settings with localStorage persistence

import type { SettingsState, GeneralSettings, SecuritySettings, NotificationSettings, ApiKey, BackupSettings } from '@/types/settings';

const SETTINGS_STORAGE_KEY = 'keyguard-settings';

// Default settings
const defaultSettings: SettingsState = {
    general: {
        instanceName: 'KeyGuard Instance',
        adminEmail: 'admin@example.com',
        timezone: 'Asia/Riyadh',
        baseUrl: 'https://keyguard.example.com',
    },
    security: {
        sessionTimeoutSeconds: 28800, // 8 hours
        enforce2FA: false,
        ipWhitelist: [],
    },
    notifications: {
        smtpHost: 'smtp.gmail.com',
        smtpPort: 587,
        smtpUsername: 'notifications@example.com',
        smtpPassword: '••••••••',
        emailAlerts: true,
    },
    api: {
        keys: [
            {
                id: 'key_1',
                name: 'Production API Key',
                key: 'kg_prod_••••••••••••••••',
                scope: ['read', 'write'],
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                lastUsedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: 'key_2',
                name: 'Development API Key',
                key: 'kg_dev_••••••••••••••••',
                scope: ['read'],
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
                lastUsedAt: null,
            },
        ],
    },
    backup: {
        logRetentionDays: 90,
        autoBackupEnabled: false,
        autoBackupFrequency: 'weekly',
        lastBackupAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
};

// Get settings from localStorage or return defaults
function getStoredSettings(): SettingsState {
    if (typeof window === 'undefined') return defaultSettings;

    try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
            return { ...defaultSettings, ...JSON.parse(stored) };
        }
    } catch (error) {
        console.error('Failed to load settings from localStorage:', error);
    }

    return defaultSettings;
}

// Save settings to localStorage
function saveSettings(settings: SettingsState): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.error('Failed to save settings to localStorage:', error);
    }
}

// Mock API: Fetch all settings
export async function fetchSettings(): Promise<SettingsState> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return getStoredSettings();
}

// Mock API: Update general settings
export async function updateGeneralSettings(data: GeneralSettings): Promise<{ success: boolean }> {
    // Simulate network delay (1-2s)
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const settings = getStoredSettings();
    settings.general = data;
    saveSettings(settings);

    return { success: true };
}

// Mock API: Update security settings
export async function updateSecuritySettings(data: SecuritySettings): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const settings = getStoredSettings();
    settings.security = data;
    saveSettings(settings);

    return { success: true };
}

// Mock API: Update notification settings
export async function updateNotificationSettings(data: NotificationSettings): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const settings = getStoredSettings();
    settings.notifications = data;
    saveSettings(settings);

    return { success: true };
}

// Mock API: Update backup settings
export async function updateBackupSettings(data: BackupSettings): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

    const settings = getStoredSettings();
    settings.backup = data;
    saveSettings(settings);

    return { success: true };
}

// Mock API: Test SMTP connection
export async function testSMTPConnection(): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate success/failure randomly
    const success = Math.random() > 0.2; // 80% success rate

    return {
        success,
        message: success
            ? 'SMTP connection successful! Test email sent.'
            : 'Failed to connect to SMTP server. Please check your settings.',
    };
}

// Mock API: Generate new API key
export async function generateApiKey(name: string, scope: string[]): Promise<{ key: ApiKey; rawKey: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const rawKey = `kg_${Date.now()}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const settings = getStoredSettings();

    const newKey: ApiKey = {
        id: `key_${Date.now()}`,
        name,
        key: `kg_${rawKey.split('_')[1].substring(0, 4)}••••••••••••••••`,
        scope,
        createdAt: new Date().toISOString(),
        lastUsedAt: null,
    };

    settings.api.keys.push(newKey);
    saveSettings(settings);

    return { key: newKey, rawKey };
}

// Mock API: Revoke API key
export async function revokeApiKey(id: string): Promise<{ success: boolean }> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const settings = getStoredSettings();
    settings.api.keys = settings.api.keys.filter(k => k.id !== id);
    saveSettings(settings);

    return { success: true };
}

// Mock API: Download backup
export async function downloadBackup(): Promise<{ url: string; filename: string }> {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `keyguard-backup-${timestamp}.zip`;

    // Update last backup time
    const settings = getStoredSettings();
    settings.backup.lastBackupAt = new Date().toISOString();
    saveSettings(settings);

    return {
        url: '#', // Mock URL
        filename,
    };
}
