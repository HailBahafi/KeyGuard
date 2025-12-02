// Settings Types

export interface GeneralSettings {
    instanceName: string;
    adminEmail: string;
    timezone: string;
    baseUrl: string;
}

export interface SecuritySettings {
    sessionTimeoutSeconds: number; // e.g., 3600 for 1 hour
    enforce2FA: boolean;
    ipWhitelist: string[];
}

export interface NotificationSettings {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    emailAlerts: boolean;
}

export interface ApiKey {
    id: string;
    name: string;
    key: string; // Masked except when first created
    scope: string[];
    createdAt: string;
    lastUsedAt: string | null;
}

export interface ApiSettings {
    keys: ApiKey[];
}

export interface BackupSettings {
    logRetentionDays: number;
    autoBackupEnabled: boolean;
    autoBackupFrequency: 'daily' | 'weekly' | 'monthly';
    lastBackupAt: string | null;
}

export interface SettingsState {
    general: GeneralSettings;
    security: SecuritySettings;
    notifications: NotificationSettings;
    api: ApiSettings;
    backup: BackupSettings;
}
