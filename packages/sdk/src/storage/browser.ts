/**
 * KeyGuard SDK - Browser Storage Adapter
 * 
 * IndexedDB-based storage implementation using idb-keyval
 * Stores CryptoKey objects directly using structured cloning
 */

import { get, set, del, createStore } from 'idb-keyval';
import type { StorageAdapter } from '../types';

/**
 * IndexedDB store configuration for KeyGuard
 */
const KEYGUARD_STORE = createStore('keyguard-db', 'keyguard-store');

/**
 * Storage keys for IndexedDB
 */
const STORAGE_KEYS = {
  PUBLIC_KEY: 'public-key',
  PRIVATE_KEY: 'private-key',
} as const;

/**
 * Browser storage adapter using IndexedDB
 * Leverages IndexedDB's structured cloning to store CryptoKey objects directly
 */
export class BrowserStorageAdapter implements StorageAdapter {
  /**
   * Save a CryptoKey pair to IndexedDB
   * 
   * @param publicKey - Public CryptoKey (extractable)
   * @param privateKey - Private CryptoKey (non-extractable)
   * @throws Error if storage operation fails
   */
  async saveKeyPair(publicKey: CryptoKey, privateKey: CryptoKey): Promise<void> {
    try {
      // Validate key types
      if (publicKey.type !== 'public') {
        throw new Error('Invalid public key type');
      }
      if (privateKey.type !== 'private') {
        throw new Error('Invalid private key type');
      }

      // Store both keys using structured cloning
      // IndexedDB can store CryptoKey objects directly, even non-extractable ones
      await set(STORAGE_KEYS.PUBLIC_KEY, publicKey, KEYGUARD_STORE);
      await set(STORAGE_KEYS.PRIVATE_KEY, privateKey, KEYGUARD_STORE);
    } catch (error) {
      throw new Error(
        `Failed to save key pair: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Retrieve the stored CryptoKey pair from IndexedDB
   * 
   * @returns Key pair if exists, null if not found
   * @throws Error if storage operation fails
   */
  async getKeyPair(): Promise<{ publicKey: CryptoKey; privateKey: CryptoKey } | null> {
    try {
      const publicKey = await get<CryptoKey>(STORAGE_KEYS.PUBLIC_KEY, KEYGUARD_STORE);
      const privateKey = await get<CryptoKey>(STORAGE_KEYS.PRIVATE_KEY, KEYGUARD_STORE);

      // Both keys must exist
      if (!publicKey || !privateKey) {
        return null;
      }

      // Validate retrieved keys
      if (publicKey.type !== 'public' || privateKey.type !== 'private') {
        throw new Error('Retrieved keys have invalid types');
      }

      return { publicKey, privateKey };
    } catch (error) {
      throw new Error(
        `Failed to retrieve key pair: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Clear all stored keys from IndexedDB
   * 
   * @throws Error if storage operation fails
   */
  async clear(): Promise<void> {
    try {
      await del(STORAGE_KEYS.PUBLIC_KEY, KEYGUARD_STORE);
      await del(STORAGE_KEYS.PRIVATE_KEY, KEYGUARD_STORE);
    } catch (error) {
      throw new Error(
        `Failed to clear keys: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
