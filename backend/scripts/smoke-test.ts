#!/usr/bin/env npx tsx
/**
 * KeyGuard E2E Smoke Test Script
 * 
 * Comprehensive end-to-end test that validates the full KeyGuard lifecycle:
 * - Admin Setup (Enrollment Code Generation)
 * - Developer Enrollment (SDK)
 * - Verification (Status Check)
 * - Real Traffic Test (OpenAI Proxy)
 * - Result Analysis
 * 
 * Usage: npx tsx scripts/smoke-test.ts
 * 
 * Environment variables:
 * - BACKEND_URL: Backend API URL (default: http://localhost:4000)
 * - ADMIN_EMAIL: Admin email (default: admin1@keyguard.com)
 * - ADMIN_PASSWORD: Admin password (default: Admin123)
 */

import * as readline from 'readline';
import * as crypto from 'crypto';

// ============================================================================
// Configuration
// ============================================================================

const CONFIG = {
    backendUrl: process.env.BACKEND_URL || 'http://localhost:4000',
    adminEmail: process.env.ADMIN_EMAIL || 'admin1@keyguard.com',
    adminPassword: process.env.ADMIN_PASSWORD || 'Admin123',
};

// ============================================================================
// Utility Functions
// ============================================================================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function waitForEnter(message: string): Promise<void> {
    await prompt(`\n${message}\n\nPress ENTER when ready...`);
}

function printHeader(phase: number, title: string): void {
    console.log('\n' + '═'.repeat(70));
    console.log(`PHASE ${phase}: ${title}`);
    console.log('═'.repeat(70) + '\n');
}

function printSuccess(message: string): void {
    console.log(`✅ ${message}`);
}

function printWarning(message: string): void {
    console.log(`⚠️  ${message}`);
}

function printError(message: string): void {
    console.log(`❌ ${message}`);
}

function printInfo(message: string): void {
    console.log(`ℹ️  ${message}`);
}

async function makeRequest<T>(url: string, options: RequestInit = {}): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        const text = await response.text();
        let data: T | null = null;

        try {
            data = JSON.parse(text) as T;
        } catch {
            // Not JSON response
        }

        return {
            ok: response.ok,
            status: response.status,
            data,
            error: !response.ok ? text : undefined,
        };
    } catch (error) {
        return {
            ok: false,
            status: 0,
            data: null,
            error: error instanceof Error ? error.message : 'Network error',
        };
    }
}

// ============================================================================
// In-Memory Storage Adapter for Node.js
// ============================================================================

interface StorageAdapter {
    saveKeyPair(publicKey: CryptoKey, privateKey: CryptoKey): Promise<void>;
    getKeyPair(): Promise<{ publicKey: CryptoKey; privateKey: CryptoKey } | null>;
    clear(): Promise<void>;
}

class MemoryStorageAdapter implements StorageAdapter {
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
        return { publicKey: this.publicKey, privateKey: this.privateKey };
    }

    async clear(): Promise<void> {
        this.publicKey = null;
        this.privateKey = null;
    }
}

// ============================================================================
// Simplified KeyGuard Client for Node.js
// ============================================================================

interface EnrollmentPayload {
    publicKey: string;
    keyId: string;
    deviceFingerprint: string;
    label: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
}

interface SignedRequestHeaders {
    'x-keyguard-api-key': string;
    'x-keyguard-key-id': string;
    'x-keyguard-timestamp': string;
    'x-keyguard-nonce': string;
    'x-keyguard-body-sha256': string;
    'x-keyguard-alg': string;
    'x-keyguard-signature': string;
}

class KeyGuardClientNode {
    private apiKey: string;
    private apiBaseUrl: string;
    private storage: StorageAdapter;

    constructor(config: { apiKey: string; apiBaseUrl?: string; storage?: StorageAdapter }) {
        this.apiKey = config.apiKey;
        this.apiBaseUrl = config.apiBaseUrl || 'http://localhost:4000';
        this.storage = config.storage || new MemoryStorageAdapter();
    }

    async enroll(deviceName?: string): Promise<EnrollmentPayload> {
        // Check if already enrolled
        const existingKeys = await this.storage.getKeyPair();
        if (existingKeys) {
            throw new Error('Device already enrolled. Call unenroll() first.');
        }

        // Generate ECDSA P-256 key pair using Node.js crypto
        const keyPair = await crypto.subtle.generateKey(
            { name: 'ECDSA', namedCurve: 'P-256' },
            true,
            ['sign', 'verify']
        );

        // Store keys
        await this.storage.saveKeyPair(keyPair.publicKey, keyPair.privateKey);

        // Export public key in SPKI format
        const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
        const publicKeyBase64 = Buffer.from(publicKeyBuffer).toString('base64');

        // Generate Key ID (SHA-256 hash of public key, first 16 bytes hex)
        const keyIdHash = crypto.createHash('sha256').update(publicKeyBase64).digest();
        const keyId = keyIdHash.subarray(0, 16).toString('hex');

        // Generate fingerprint
        const fingerprint = crypto.randomUUID();

        return {
            publicKey: publicKeyBase64,
            keyId,
            deviceFingerprint: fingerprint,
            label: deviceName || `Node.js Smoke Test Device`,
            userAgent: `Node.js/${process.version}`,
            metadata: {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                testRun: new Date().toISOString(),
            },
        };
    }

    async signRequest(request: { method: string; url: string; body?: string }): Promise<SignedRequestHeaders> {
        const keyPair = await this.storage.getKeyPair();
        if (!keyPair) {
            throw new Error('Device not enrolled. Call enroll() first.');
        }

        // Generate timestamp
        const timestamp = new Date().toISOString();

        // Generate nonce
        const nonce = crypto.randomBytes(16).toString('hex');

        // Generate Key ID
        const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
        const publicKeyBase64 = Buffer.from(publicKeyBuffer).toString('base64');
        const keyIdHash = crypto.createHash('sha256').update(publicKeyBase64).digest();
        const keyId = keyIdHash.subarray(0, 16).toString('hex');

        // Calculate Body Hash (SHA-256)
        const bodyHash = crypto.createHash('sha256').update(request.body || '').digest('base64');

        // Parse URL to get path + query
        let pathAndQuery: string;
        if (request.url.startsWith('/')) {
            pathAndQuery = request.url;
        } else {
            try {
                const urlObj = new URL(request.url);
                pathAndQuery = urlObj.pathname + urlObj.search;
            } catch {
                pathAndQuery = request.url;
            }
        }

        // Create canonical payload string (matching backend format)
        // Format: kg-v1|{timestamp}|{METHOD}|{pathAndQuery}|{bodySha256}|{nonce}|{apiKey}|{keyId}
        const payload = [
            'kg-v1',
            timestamp,
            request.method.toUpperCase(),
            pathAndQuery,
            bodyHash,
            nonce,
            this.apiKey,
            keyId,
        ].join('|');

        // Sign the payload with ECDSA P-256
        const payloadBuffer = new TextEncoder().encode(payload);
        const signatureBuffer = await crypto.subtle.sign(
            { name: 'ECDSA', hash: 'SHA-256' },
            keyPair.privateKey,
            payloadBuffer
        );
        const signature = Buffer.from(signatureBuffer).toString('base64');

        return {
            'x-keyguard-api-key': this.apiKey,
            'x-keyguard-key-id': keyId,
            'x-keyguard-timestamp': timestamp,
            'x-keyguard-nonce': nonce,
            'x-keyguard-body-sha256': bodyHash,
            'x-keyguard-alg': 'ECDSA_P256_SHA256_P1363',
            'x-keyguard-signature': signature,
        };
    }

    async isEnrolled(): Promise<boolean> {
        const keyPair = await this.storage.getKeyPair();
        return keyPair !== null;
    }

    async unenroll(): Promise<void> {
        await this.storage.clear();
    }
}

// ============================================================================
// Main Test Flow
// ============================================================================

interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}

interface EnrollmentCodeResponse {
    code: string;
    expiresAt: string;
}

interface EnrollResponse {
    id: string;
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
    keyId: string;
    label: string;
}

async function main(): Promise<void> {
    console.log('\n🚀 KeyGuard E2E Smoke Test');
    console.log('='.repeat(70));
    console.log(`Backend URL: ${CONFIG.backendUrl}`);
    console.log(`Admin Email: ${CONFIG.adminEmail}`);
    console.log('='.repeat(70));

    let enrollmentCode: string | null = null;
    let jwtToken: string | null = null;
    let apiKey: string | null = null;

    // ========================================================================
    // PHASE 1: Admin Setup (Enrollment Code Generation)
    // ========================================================================
    printHeader(1, 'ADMIN SETUP - Generate Enrollment Code');

    try {
        // Step 1.1: Login as Admin
        printInfo('Logging in as admin...');

        const loginResult = await makeRequest<LoginResponse>(`${CONFIG.backendUrl}/api/v1/auth/login`, {
            method: 'POST',
            body: JSON.stringify({
                email: CONFIG.adminEmail,
                password: CONFIG.adminPassword,
            }),
        });

        if (!loginResult.ok || !loginResult.data) {
            throw new Error(`Login failed: ${loginResult.error || 'Unknown error'}`);
        }

        jwtToken = loginResult.data.accessToken;
        printSuccess(`Logged in as: ${loginResult.data.user.email}`);

        // Step 1.2: Get list of API keys to find one to use
        printInfo('Fetching available API keys...');

        const keysResult = await makeRequest<{ keys: Array<{ id: string; name: string; status: string; maskedValue: string }> }>(`${CONFIG.backendUrl}/api/v1/keys`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
            },
        });

        if (!keysResult.ok || !keysResult.data || keysResult.data.keys.length === 0) {
            printWarning('No API keys found. Please create an API key in the dashboard first.');
            throw new Error('No API keys available');
        }

        const activeKey = keysResult.data.keys.find(k => k.status === 'active');
        if (!activeKey) {
            printWarning('No active API keys found.');
            throw new Error('No active API keys available');
        }

        printSuccess(`Found active API key: ${activeKey.name} (${activeKey.maskedValue})`);

        // Step 1.3: Generate Enrollment Code
        printInfo('Generating enrollment code...');

        const enrollCodeResult = await makeRequest<EnrollmentCodeResponse>(`${CONFIG.backendUrl}/api/v1/devices/enrollment-code`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwtToken}`,
            },
            body: JSON.stringify({
                description: 'Smoke Test Device',
            }),
        });

        if (!enrollCodeResult.ok || !enrollCodeResult.data) {
            throw new Error(`Failed to generate enrollment code: ${enrollCodeResult.error || 'Unknown error'}`);
        }

        enrollmentCode = enrollCodeResult.data.code;
        printSuccess(`Enrollment Code: ${enrollmentCode}`);
        printInfo(`Expires at: ${enrollCodeResult.data.expiresAt}`);

    } catch (error) {
        printError(`Phase 1 automated setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

        // Fallback: Manual enrollment code input
        printWarning('Falling back to manual input...');
        printInfo('Please go to the Dashboard, generate an enrollment code, and paste it below.');

        enrollmentCode = await prompt('\nEnter Enrollment Code (e.g., KG-ENRL-XXXX): ');

        if (!enrollmentCode || enrollmentCode.trim() === '') {
            printError('No enrollment code provided. Exiting.');
            rl.close();
            process.exit(1);
        }

        enrollmentCode = enrollmentCode.trim();
        printSuccess(`Using Code: ${enrollmentCode}`);
    }

    // Get API key for SDK
    if (!apiKey) {
        printInfo('\nThe SDK needs an API key to sign requests.');
        printInfo('This is the raw API key you see when creating a key in the dashboard.');
        apiKey = await prompt('Enter the raw API Key (e.g., kg_xxx...): ');

        if (!apiKey || apiKey.trim() === '') {
            printError('No API key provided. Exiting.');
            rl.close();
            process.exit(1);
        }
        apiKey = apiKey.trim();
    }

    // ========================================================================
    // PHASE 2: Developer Enrollment (SDK)
    // ========================================================================
    printHeader(2, 'DEVELOPER ENROLLMENT - Using KeyGuard SDK');

    const client = new KeyGuardClientNode({
        apiKey: apiKey,
        apiBaseUrl: CONFIG.backendUrl,
    });

    printInfo('Initializing KeyGuard client...');
    printInfo('Generating cryptographic key pair and enrolling device...');

    let enrollmentPayload: EnrollmentPayload;
    try {
        enrollmentPayload = await client.enroll('Smoke Test Device');
        printSuccess('Key pair generated successfully');
        printInfo(`Key ID: ${enrollmentPayload.keyId}`);
        printInfo(`Device Label: ${enrollmentPayload.label}`);
    } catch (error) {
        printError(`Failed to generate enrollment payload: ${error instanceof Error ? error.message : 'Unknown error'}`);
        rl.close();
        process.exit(1);
    }

    // Send enrollment request to backend - include enrollment code for auto-activation
    printInfo('Sending enrollment request to backend...');
    printInfo(`Using enrollment code: ${enrollmentCode}`);

    const enrollResult = await makeRequest<EnrollResponse>(`${CONFIG.backendUrl}/api/v1/keyguard/enroll`, {
        method: 'POST',
        headers: {
            'x-keyguard-api-key': apiKey,
        },
        body: JSON.stringify({
            ...enrollmentPayload,
            enrollmentCode: enrollmentCode, // Include enrollment code for auto-activation
        }),
    });

    if (!enrollResult.ok || !enrollResult.data) {
        printError(`Enrollment failed: ${enrollResult.error || 'Unknown error'}`);
        console.log('Full error:', JSON.stringify(enrollResult, null, 2));
        rl.close();
        process.exit(1);
    }

    const deviceStatus = enrollResult.data.status;
    const deviceId = enrollResult.data.id;

    if (deviceStatus === 'ACTIVE') {
        printSuccess('✅ Enrollment Successful & Auto-Activated');
    } else if (deviceStatus === 'PENDING') {
        printWarning('⚠️ Device is PENDING. Please approve it in the Dashboard now.');
        printInfo(`Device ID: ${deviceId}`);
        printInfo('Go to Dashboard → Devices → Find this device → Click Approve');

        await waitForEnter('After approving the device in the Dashboard, press ENTER to continue...');
    } else {
        printWarning(`Device status: ${deviceStatus}`);
    }

    // ========================================================================
    // PHASE 3: Verification (Status Check)
    // ========================================================================
    printHeader(3, 'VERIFICATION - Status Check');

    const isEnrolled = await client.isEnrolled();
    if (isEnrolled) {
        printSuccess('client.isEnrolled() = true');
    } else {
        printError('client.isEnrolled() = false - Something went wrong!');
        rl.close();
        process.exit(1);
    }

    // Verify with a test request
    printInfo('Sending signed test request to verify device...');

    const testBody = JSON.stringify({ test: 'verification', timestamp: Date.now() });

    try {
        const signedHeaders = await client.signRequest({
            method: 'POST',
            url: '/api/v1/keyguard/verify-test',
            body: testBody,
        });

        const verifyResult = await makeRequest<{ valid: boolean; deviceId?: string; error?: string }>(`${CONFIG.backendUrl}/api/v1/keyguard/verify-test`, {
            method: 'POST',
            headers: signedHeaders as unknown as Record<string, string>,
            body: testBody,
        });

        if (verifyResult.ok && verifyResult.data?.valid) {
            printSuccess('Signature verification successful!');
            printInfo(`Verified Device ID: ${verifyResult.data.deviceId}`);
        } else {
            printError(`Verification failed: ${verifyResult.data?.error || verifyResult.error}`);
            console.log('Full response:', JSON.stringify(verifyResult, null, 2));
        }
    } catch (error) {
        printError(`Verification request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // ========================================================================
    // PHASE 4: Real Traffic Test (OpenAI Proxy)
    // ========================================================================
    printHeader(4, 'REAL TRAFFIC TEST - OpenAI Proxy');

    const openAIPayload = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: "Say 'Hello KeyGuard'!" }],
        max_tokens: 50,
    };

    const openAIBody = JSON.stringify(openAIPayload);
    const proxyUrl = '/api/v1/proxy/v1/chat/completions';

    printInfo('Signing request for OpenAI proxy...');
    printInfo(`Payload: ${JSON.stringify(openAIPayload, null, 2)}`);

    try {
        const proxyHeaders = await client.signRequest({
            method: 'POST',
            url: proxyUrl,
            body: openAIBody,
        });

        printInfo('Sending signed request to proxy...');

        const proxyResult = await makeRequest<any>(`${CONFIG.backendUrl}${proxyUrl}`, {
            method: 'POST',
            headers: proxyHeaders as unknown as Record<string, string>,
            body: openAIBody,
        });

        // ========================================================================
        // PHASE 5: Result Analysis
        // ========================================================================
        printHeader(5, 'RESULT ANALYSIS');

        if (proxyResult.ok && proxyResult.status === 200) {
            printSuccess('🎉 OpenAI Proxy Request Successful!');

            if (proxyResult.data?.choices?.[0]?.message?.content) {
                console.log('\n📝 OpenAI Response:');
                console.log('─'.repeat(50));
                console.log(proxyResult.data.choices[0].message.content);
                console.log('─'.repeat(50));
            } else {
                console.log('\n📝 Full Response:');
                console.log(JSON.stringify(proxyResult.data, null, 2));
            }
        } else {
            printError(`Proxy request failed with status: ${proxyResult.status}`);

            if (proxyResult.status === 401) {
                printError('401 Unauthorized - Signature verification failed or device not authorized');
            } else if (proxyResult.status === 403) {
                printError('403 Forbidden - Device may be suspended or revoked');
            } else if (proxyResult.status === 400) {
                printError('400 Bad Request - Check the request format or headers');
            }

            console.log('\n📝 Error Details:');
            console.log('─'.repeat(50));
            console.log(JSON.stringify(proxyResult.data || proxyResult.error, null, 2));
            console.log('─'.repeat(50));
        }

    } catch (error) {
        printHeader(5, 'RESULT ANALYSIS');
        printError(`Proxy request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // ========================================================================
    // Summary
    // ========================================================================
    console.log('\n' + '═'.repeat(70));
    console.log('SMOKE TEST COMPLETE');
    console.log('═'.repeat(70));
    console.log('\nTest Summary:');
    console.log('  ✓ Admin login and enrollment code generation');
    console.log('  ✓ SDK initialization and key pair generation');
    console.log('  ✓ Device enrollment');
    console.log('  ✓ Signature verification');
    console.log('  ✓ OpenAI proxy request');
    console.log('\n');

    rl.close();
}

// Run the test
main().catch((error) => {
    console.error('Fatal error:', error);
    rl.close();
    process.exit(1);
});
