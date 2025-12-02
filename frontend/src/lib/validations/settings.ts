// Settings Validation Schemas using Zod

import { z } from 'zod';

// General Settings Schema
export const generalSettingsSchema = z.object({
    instanceName: z
        .string()
        .min(3, 'Instance name must be at least 3 characters')
        .max(50, 'Instance name must not exceed 50 characters'),
    adminEmail: z
        .string()
        .email('Please enter a valid email address'),
    timezone: z
        .string()
        .min(1, 'Please select a timezone'),
    baseUrl: z
        .string()
        .url('Please enter a valid URL')
        .or(z.literal('')), // Allow empty for optional field
});

// Security Settings Schema
export const securitySettingsSchema = z.object({
    sessionTimeoutSeconds: z
        .number()
        .int()
        .positive('Session timeout must be positive')
        .min(300, 'Session timeout must be at least 5 minutes')
        .max(2592000, 'Session timeout must not exceed 30 days'),
    enforce2FA: z.boolean(),
    ipWhitelist: z.array(
        z.string().regex(
            /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/,
            'Please enter a valid IP address or CIDR notation (e.g., 192.168.1.1 or 10.0.0.0/24)'
        )
    ),
});

// Notification Settings Schema
export const notificationSettingsSchema = z.object({
    smtpHost: z
        .string()
        .min(1, 'SMTP host is required'),
    smtpPort: z
        .number()
        .int()
        .min(1, 'Port must be between 1 and 65535')
        .max(65535, 'Port must be between 1 and 65535'),
    smtpUsername: z
        .string()
        .min(1, 'SMTP username is required'),
    smtpPassword: z
        .string()
        .min(1, 'SMTP password is required'),
    emailAlerts: z.boolean(),
});

// API Key Schema
export const apiKeySchema = z.object({
    name: z
        .string()
        .min(3, 'Key name must be at least 3 characters')
        .max(50, 'Key name must not exceed 50 characters'),
    scope: z.array(z.string()).min(1, 'At least one scope is required'),
});

// Backup Settings Schema
export const backupSettingsSchema = z.object({
    logRetentionDays: z
        .number()
        .int()
        .min(30, 'Log retention must be at least 30 days')
        .max(365, 'Log retention must not exceed 365 days'),
    autoBackupEnabled: z.boolean(),
    autoBackupFrequency: z.enum(['daily', 'weekly', 'monthly']),
});

// Type inference from schemas
export type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>;
export type SecuritySettingsFormData = z.infer<typeof securitySettingsSchema>;
export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>;
export type ApiKeyFormData = z.infer<typeof apiKeySchema>;
export type BackupSettingsFormData = z.infer<typeof backupSettingsSchema>;
