/**
 * KeyGuard SDK - Memory Storage Adapter
 * 
 * In-memory storage implementation for testing or non-persistent environments
 */

import type { StorageAdapter } from '../types';

export class MemoryStorageAdapter implements StorageAdapter {
    private publicKey: CryptoKey | null = null;
    private privateKey: CryptoKey | null = null;

    async saveKeyPair(publicKey: CryptoKey, privateKey: CryptoKey): Promise<void> {
        this.publicKey = publicKey;
        this.privateKey = privateKey;
    }

    async getKeyPair(): Promise<{ publicKey: CryptoKey; privateKey: CryptoKey } | null> {
        if (!this.publicKey || !this.privateKey) {
            return null;
        }
        return {
            publicKey: this.publicKey,
            privateKey: this.privateKey
        };
    }

    async clear(): Promise<void> {
        this.publicKey = null;
        this.privateKey = null;
    }
}
