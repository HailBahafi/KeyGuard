import * as crypto from 'crypto';

/**
 * AES-256-GCM Encryption Utility
 * 
 * Provides secure encryption for API keys that need to be stored and later retrieved
 * for making external API calls (like OpenAI).
 * 
 * Key features:
 * - AES-256-GCM authenticated encryption
 * - Random IV per encryption
 * - Authentication tag for integrity verification
 * - Base64 encoded output for storage
 * 
 * Format: base64(iv:authTag:ciphertext)
 */
export abstract class Encryption {
    private static readonly ALGORITHM = 'aes-256-gcm';
    private static readonly IV_LENGTH = 12; // 96 bits recommended for GCM
    private static readonly AUTH_TAG_LENGTH = 16; // 128 bits

    /**
     * Get the encryption key from environment or generate one
     * In production, this MUST be set via environment variable
     */
    private static getKey(): Buffer {
        const envKey = process.env.API_KEY_ENCRYPTION_KEY;

        if (!envKey) {
            throw new Error(
                'API_KEY_ENCRYPTION_KEY environment variable is required for API key encryption. ' +
                'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
            );
        }

        // Key should be 32 bytes (256 bits) hex encoded = 64 characters
        if (envKey.length !== 64) {
            throw new Error(
                'API_KEY_ENCRYPTION_KEY must be exactly 64 hex characters (32 bytes). ' +
                'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
            );
        }

        return Buffer.from(envKey, 'hex');
    }

    /**
     * Encrypt a plaintext string using AES-256-GCM
     * 
     * @param plaintext - The string to encrypt (e.g., OpenAI API key)
     * @returns Base64 encoded string containing IV, auth tag, and ciphertext
     */
    static encrypt(plaintext: string): string {
        const key = this.getKey();
        const iv = crypto.randomBytes(this.IV_LENGTH);

        const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);

        let ciphertext = cipher.update(plaintext, 'utf8');
        ciphertext = Buffer.concat([ciphertext, cipher.final()]);

        const authTag = cipher.getAuthTag();

        // Combine IV + AuthTag + Ciphertext and encode as base64
        const combined = Buffer.concat([iv, authTag, ciphertext]);
        return combined.toString('base64');
    }

    /**
     * Decrypt an encrypted string using AES-256-GCM
     * 
     * @param encryptedData - Base64 encoded string from encrypt()
     * @returns The original plaintext string
     * @throws Error if decryption fails (wrong key, tampering, etc.)
     */
    static decrypt(encryptedData: string): string {
        const key = this.getKey();
        const combined = Buffer.from(encryptedData, 'base64');

        // Extract components
        const iv = combined.subarray(0, this.IV_LENGTH);
        const authTag = combined.subarray(this.IV_LENGTH, this.IV_LENGTH + this.AUTH_TAG_LENGTH);
        const ciphertext = combined.subarray(this.IV_LENGTH + this.AUTH_TAG_LENGTH);

        const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let plaintext = decipher.update(ciphertext);
        plaintext = Buffer.concat([plaintext, decipher.final()]);

        return plaintext.toString('utf8');
    }

    /**
     * Check if a string appears to be encrypted (base64 encoded with correct length)
     * This is a heuristic check, not a guarantee
     * 
     * @param value - The string to check
     * @returns true if the string appears to be encrypted
     */
    static isEncrypted(value: string): boolean {
        try {
            // Minimum length: IV (12) + AuthTag (16) + at least 1 byte of ciphertext
            const minBase64Length = Math.ceil((12 + 16 + 1) * 4 / 3);
            if (value.length < minBase64Length) return false;

            // Check if it's valid base64
            const decoded = Buffer.from(value, 'base64');

            // Check minimum decoded length
            if (decoded.length < this.IV_LENGTH + this.AUTH_TAG_LENGTH + 1) return false;

            // Simple check: doesn't start with typical bcrypt prefix
            if (value.startsWith('$2')) return false;

            return true;
        } catch {
            return false;
        }
    }

    /**
     * Generate a new encryption key (for setup purposes)
     * This should be stored securely in environment variables
     * 
     * @returns 64-character hex string (32 bytes)
     */
    static generateKey(): string {
        return crypto.randomBytes(32).toString('hex');
    }
}
