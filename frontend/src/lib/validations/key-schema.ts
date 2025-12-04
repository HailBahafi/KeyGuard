import { z } from 'zod';

// Key creation schema
export const keySchema = z.object({
    name: z.string()
        .min(3, 'Name must be at least 3 characters')
        .max(50, 'Name must be less than 50 characters'),
    provider: z.enum(['openai', 'anthropic', 'google', 'azure']),
    environment: z.enum(['production', 'development', 'staging']).optional(),
    apiKey: z.string().min(10, 'API key must be at least 10 characters'),
    description: z.string().max(500).optional(),
    expiration: z.enum(['30days', '60days', '90days', '1year', 'never']).optional(),
});

export type KeyFormData = z.infer<typeof keySchema>;
