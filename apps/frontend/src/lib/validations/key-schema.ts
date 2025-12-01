import { z } from 'zod';

// Key creation schema
export const keySchema = z.object({
    name: z.string()
        .min(3, 'Name must be at least 3 characters')
        .max(50, 'Name must be less than 50 characters')
        .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens allowed'),
    provider: z.enum(['openai', 'anthropic', 'google', 'azure']),
    environment: z.enum(['production', 'development', 'staging']).optional(),
    apiKey: z.string().min(10, 'API key must be at least 10 characters'),
    description: z.string().max(500).optional(),
    expiresAt: z.date().optional(),
    rateLimit: z.object({
        enabled: z.boolean(),
        maxPerMinute: z.number().min(1).max(10000).optional()
    }).optional()
});

export type KeyFormData = z.infer<typeof keySchema>;
