import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Redis Service - Handles Redis connections for caching and replay protection
 */
@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private client: Redis | null = null;
    private isEnabled = false;

    constructor(private readonly configService: ConfigService) { }

    async onModuleInit() {
        const redisUrl = this.configService.get<string>('REDIS_URL');

        if (!redisUrl) {
            this.logger.warn('REDIS_URL not configured. Redis functionality will be disabled.');
            return;
        }

        try {
            this.client = new Redis(redisUrl, {
                maxRetriesPerRequest: 3,
                retryStrategy: (times: number) => {
                    if (times > 3) {
                        this.logger.error('Redis connection failed after 3 retries');
                        return null;
                    }
                    return Math.min(times * 100, 2000);
                },
            });

            this.client.on('connect', () => {
                this.logger.log('Redis connected successfully');
                this.isEnabled = true;
            });

            this.client.on('error', (err: Error) => {
                this.logger.error(`Redis error: ${err.message}`);
                this.isEnabled = false;
            });

            this.client.on('ready', () => {
                this.logger.log('Redis client ready');
                this.isEnabled = true;
            });
        } catch (error) {
            this.logger.error(`Failed to initialize Redis: ${error instanceof Error ? error.message : 'Unknown error'}`);
            this.isEnabled = false;
        }
    }

    async onModuleDestroy() {
        if (this.client) {
            await this.client.quit();
            this.logger.log('Redis connection closed');
        }
    }

    /**
     * Check if Redis is enabled and connected
     */
    isRedisEnabled(): boolean {
        return this.isEnabled && this.client !== null;
    }

    /**
     * Store nonce with TTL using SET NX (atomic operation)
     * Returns true if nonce was stored (not a replay), false if nonce already exists (replay attack)
     */
    async storeNonceIfNotExists(key: string, ttlSeconds: number): Promise<boolean> {
        if (!this.isRedisEnabled() || !this.client) {
            this.logger.warn('Redis not available, skipping nonce check');
            return true; // Allow the request if Redis is not available
        }

        try {
            // SET key value EX ttl NX
            // NX: Only set if not exists
            // EX: Set expiry in seconds
            const result = await this.client.set(key, '1', 'EX', ttlSeconds, 'NX');

            // Returns 'OK' if set successfully, null if key already exists
            return result === 'OK';
        } catch (error) {
            this.logger.error(`Redis SET NX failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return true; // Fail open - allow the request if Redis has issues
        }
    }

    /**
     * Get value by key
     */
    async get(key: string): Promise<string | null> {
        if (!this.isRedisEnabled() || !this.client) {
            return null;
        }

        try {
            return await this.client.get(key);
        } catch (error) {
            this.logger.error(`Redis GET failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return null;
        }
    }

    /**
     * Set value with optional TTL
     */
    async set(key: string, value: string, ttlSeconds?: number): Promise<boolean> {
        if (!this.isRedisEnabled() || !this.client) {
            return false;
        }

        try {
            if (ttlSeconds) {
                await this.client.set(key, value, 'EX', ttlSeconds);
            } else {
                await this.client.set(key, value);
            }
            return true;
        } catch (error) {
            this.logger.error(`Redis SET failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }

    /**
     * Delete key
     */
    async delete(key: string): Promise<boolean> {
        if (!this.isRedisEnabled() || !this.client) {
            return false;
        }

        try {
            await this.client.del(key);
            return true;
        } catch (error) {
            this.logger.error(`Redis DEL failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }
}
