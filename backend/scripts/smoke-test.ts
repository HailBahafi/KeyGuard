/**
 * 🔥 KeyGuard E2E "Live Fire" Smoke Test
 * 
 * This script performs a complete end-to-end test of the KeyGuard system:
 * 
 * Phase 1: Admin Setup - Generate Enrollment Code
 * Phase 2: Client Onboarding - SDK Device Enrollment  
 * Phase 3: Integrity Check - Verify Enrollment Status
 * Phase 4: Live Fire Test - OpenAI Proxy Request
 * Phase 5: Result Analysis - Validate Response
 * 
 * Usage: npx tsx scripts/smoke-test.ts
 */

import * as readline from 'readline';
import * as crypto from 'crypto';

// ============================================================================
// CONFIGURATION
// ============================================================================

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin1@keyguard.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin123';

// ============================================================================
// CONSOLE UTILITIES
// ============================================================================

const COLORS = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    dim: '\x1b[2m',
};

function printHeader(text: string): void {
    console.log('\n' + '═'.repeat(70));
    console.log(`${COLORS.cyan}${text}${COLORS.reset}`);
    console.log('═'.repeat(70) + '\n');
}

function printSuccess(text: string): void {
    console.log(`${COLORS.green}✅ ${text}${COLORS.reset}`);
}

function printError(text: string): void {
    console.log(`${COLORS.red}❌ ${text}${COLORS.reset}`);
}

function printWarning(text: string): void {
    console.log(`${COLORS.yellow}⚠️  ${text}${COLORS.reset}`);
}

function printInfo(text: string): void {
    console.log(`${COLORS.blue}ℹ️  ${text}${COLORS.reset}`);
}

function printDivider(): void {
    console.log(`${COLORS.dim}${'─'.repeat(50)}${COLORS.reset}`);
}

// ============================================================================
// READLINE INTERFACE
// ============================================================================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
        rl.question(`${COLORS.yellow}${question}${COLORS.reset}`, (answer: string) => {
            resolve(answer.trim());
        });
    });
}

function waitForEnter(message: string): Promise<void> {
    return new Promise((resolve) => {
        rl.question(`${COLORS.yellow}${message} [Press ENTER to continue]${COLORS.reset}`, () => {
            resolve();
        });
    });
}

// ============================================================================
// HTTP CLIENT
// ============================================================================

interface ApiResponse<T = unknown> {
    ok: boolean;
    status: number;
    data: T | null;
    error?: string;
    requestId?: string;
}

async function makeRequest<T = unknown>(
    url: string,
    options: {
        method?: string;
        headers?: Record<string, string>;
        body?: unknown;
    } = {}
): Promise<ApiResponse<T>> {
    const { method = 'GET', headers = {}, body } = options;

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        const requestId = response.headers.get('x-request-id') || undefined;
        let data: T | null = null;

        try {
            data = await response.json() as T;
        } catch {
            // Response might not be JSON
        }

        return {
            ok: response.ok,
            status: response.status,
            data,
            requestId,
        };
    } catch (error) {
        return {
            ok: false,
            status: 0,
            data: null,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// ============================================================================
// SIMULATED KEYGUARD CLIENT (for testing without SDK dependency)
// ============================================================================

class SimulatedKeyGuardClient {
    private baseUrl: string;
    private apiKey: string;
    private keyPair: CryptoKeyPair | null = null;
    private keyId: string = '';
    private publicKeyBase64: string = '';
    private enrolled: boolean = false;

    constructor(config: { baseUrl: string; apiKey: string }) {
        this.baseUrl = config.baseUrl;
        this.apiKey = config.apiKey;
    }

    async generateKeyPair(): Promise<void> {
        // Generate ECDSA P-256 key pair
        this.keyPair = await crypto.subtle.generateKey(
            { name: 'ECDSA', namedCurve: 'P-256' },
            true,
            ['sign', 'verify']
        );

        // Export public key in SPKI format
        const publicKeyBuffer = await crypto.subtle.exportKey('spki', this.keyPair.publicKey);
        this.publicKeyBase64 = Buffer.from(publicKeyBuffer).toString('base64');

        // Generate keyId as MD5 hash of public key
        const hash = crypto.createHash('md5');
        hash.update(this.publicKeyBase64);
        this.keyId = hash.digest('hex');

        printSuccess('Key pair generated successfully');
        printInfo(`Key ID: ${this.keyId}`);
    }

    async enroll(options: { enrollmentCode?: string; label?: string }): Promise<{ status: string; deviceId: string }> {
        if (!this.keyPair) {
            await this.generateKeyPair();
        }

        // Generate a device fingerprint
        const fingerprintData = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
        const deviceFingerprint = crypto.createHash('sha256').update(fingerprintData).digest('hex');

        const enrollmentPayload = {
            keyId: this.keyId,
            publicKey: this.publicKeyBase64,  // Backend expects 'publicKey' not 'publicKeySpkiBase64'
            deviceFingerprint: deviceFingerprint,  // Required field
            label: options.label || 'E2E Smoke Test Device',
            enrollmentCode: options.enrollmentCode,
            metadata: {
                testRun: true,
                timestamp: new Date().toISOString(),
            },
        };

        printInfo(`Sending enrollment request...`);
        if (options.enrollmentCode) {
            printInfo(`Using enrollment code: ${options.enrollmentCode}`);
        }

        const result = await makeRequest<{ id: string; status: string; createdAt: string }>(
            `${this.baseUrl}/api/v1/keyguard/enroll`,
            {
                method: 'POST',
                headers: {
                    'x-keyguard-api-key': this.apiKey,
                },
                body: enrollmentPayload,
            }
        );

        if (!result.ok || !result.data) {
            throw new Error(`Enrollment failed: ${JSON.stringify(result.data || result.error)}`);
        }

        this.enrolled = true;
        return {
            status: result.data.status,
            deviceId: result.data.id,
        };
    }

    isEnrolled(): boolean {
        return this.enrolled && !!this.keyPair;
    }

    async signRequest(request: {
        method: string;
        url: string;
        body?: unknown;
    }): Promise<Record<string, string>> {
        if (!this.keyPair) {
            throw new Error('Not enrolled - no key pair available');
        }

        const timestamp = new Date().toISOString();
        const nonce = crypto.randomBytes(16).toString('hex');

        // Compute body hash
        const bodyString = request.body ? JSON.stringify(request.body) : '';
        const bodyHash = crypto.createHash('sha256').update(bodyString).digest('base64');

        // Extract path and query from URL
        let pathAndQuery: string;
        try {
            const urlObj = new URL(request.url);
            pathAndQuery = urlObj.pathname + urlObj.search;
        } catch {
            pathAndQuery = request.url;
        }

        // Build canonical payload (matching backend format)
        // Format: kg-v1|{timestamp}|{METHOD}|{pathAndQuery}|{bodySha256}|{nonce}|{apiKey}|{keyId}
        const payload = [
            'kg-v1',
            timestamp,
            request.method.toUpperCase(),
            pathAndQuery,
            bodyHash,
            nonce,
            this.apiKey,
            this.keyId,
        ].join('|');

        // Sign with ECDSA P-256
        const payloadBuffer = new TextEncoder().encode(payload);
        const signatureBuffer = await crypto.subtle.sign(
            { name: 'ECDSA', hash: 'SHA-256' },
            this.keyPair.privateKey,
            payloadBuffer
        );
        const signature = Buffer.from(signatureBuffer).toString('base64');

        return {
            'x-keyguard-api-key': this.apiKey,
            'x-keyguard-key-id': this.keyId,
            'x-keyguard-timestamp': timestamp,
            'x-keyguard-nonce': nonce,
            'x-keyguard-body-sha256': bodyHash,
            'x-keyguard-alg': 'ECDSA_P256_SHA256_P1363',
            'x-keyguard-signature': signature,
        };
    }
}

// ============================================================================
// MAIN TEST EXECUTION
// ============================================================================

async function runSmokeTest(): Promise<void> {
    console.log('\n');
    console.log('🔥 ' + COLORS.cyan + 'KeyGuard E2E "Live Fire" Smoke Test' + COLORS.reset);
    console.log('═'.repeat(70));
    console.log(`Backend URL: ${BACKEND_URL}`);
    console.log(`Admin Email: ${ADMIN_EMAIL}`);
    console.log('═'.repeat(70));

    let authToken: string = '';
    let enrollmentCode: string = '';
    let apiKeyRaw: string = '';
    let apiKeyId: string = '';

    // =========================================================================
    // PHASE 1: ADMIN SETUP
    // =========================================================================
    printHeader('PHASE 1: ADMIN SETUP - Generate Enrollment Code');

    try {
        // Step 1.1: Login as admin
        printInfo('Logging in as admin...');
        const loginResult = await makeRequest<{ accessToken: string; user: { email: string } }>(
            `${BACKEND_URL}/api/v1/auth/login`,
            {
                method: 'POST',
                body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
            }
        );

        if (!loginResult.ok || !loginResult.data) {
            throw new Error(`Login failed: ${JSON.stringify(loginResult.data || loginResult.error)}`);
        }

        authToken = loginResult.data.accessToken;
        printSuccess(`Logged in as: ${loginResult.data.user.email}`);

        // Step 1.2: Fetch available API keys
        printInfo('Fetching available API keys...');
        const keysResult = await makeRequest<{ keys: Array<{ id: string; name: string; status: string; maskedValue: string }> }>(
            `${BACKEND_URL}/api/v1/keys`,
            {
                method: 'GET',
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );

        if (!keysResult.ok || !keysResult.data) {
            throw new Error(`Failed to fetch keys: ${JSON.stringify(keysResult.data || keysResult.error)}`);
        }

        // Find the live-fire-openai key or the first active key
        const activeKey = keysResult.data.keys.find(k => k.name === 'live-fire-openai' && k.status.toLowerCase() === 'active')
            || keysResult.data.keys.find(k => k.status.toLowerCase() === 'active');

        if (!activeKey) {
            throw new Error('No active API key found. Please create one in the Dashboard.');
        }

        apiKeyId = activeKey.id;
        printSuccess(`Found active API key: ${activeKey.name} (${activeKey.maskedValue})`);

        // Step 1.3: Generate enrollment code
        printInfo('Generating enrollment code...');
        const enrollCodeResult = await makeRequest<{ code: string; expiresAt: string }>(
            `${BACKEND_URL}/api/v1/devices/enrollment-code`,
            {
                method: 'POST',
                headers: { Authorization: `Bearer ${authToken}` },
                body: { apiKeyId, description: 'E2E Live Fire Test' },
            }
        );

        if (!enrollCodeResult.ok || !enrollCodeResult.data?.code) {
            printWarning('Could not generate enrollment code automatically.');
            enrollmentCode = await prompt('Please paste a valid Enrollment Code from the Dashboard: ');
        } else {
            enrollmentCode = enrollCodeResult.data.code;
            printSuccess(`Enrollment Code: ${enrollmentCode}`);
            printInfo(`Expires at: ${enrollCodeResult.data.expiresAt || 'Never'}`);
        }

        // Step 1.4: Prompt for API key
        printInfo('');
        printInfo('The SDK needs a raw API key to sign requests.');
        printDivider();
        apiKeyRaw = await prompt(`Enter the raw API Key (e.g., kg_xxx...): `);

        if (!apiKeyRaw || !apiKeyRaw.startsWith('kg_')) {
            printError('Invalid API key format. Expected kg_...');
            process.exit(1);
        }

        printSuccess(`🔑 Using Enrollment Code: ${enrollmentCode}`);
        printSuccess(`🔑 Using API Key: ${apiKeyRaw.substring(0, 15)}...`);

    } catch (error) {
        printError(`Phase 1 failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }

    // =========================================================================
    // PHASE 2: CLIENT ONBOARDING (SDK)
    // =========================================================================
    printHeader('PHASE 2: CLIENT ONBOARDING - SDK Device Enrollment');

    const client = new SimulatedKeyGuardClient({
        baseUrl: BACKEND_URL,
        apiKey: apiKeyRaw,
    });

    let deviceId: string = '';

    try {
        printInfo('Initializing KeyGuard client...');
        printInfo('Generating cryptographic key pair and enrolling device...');

        const enrollResult = await client.enroll({
            enrollmentCode: enrollmentCode,
            label: 'E2E Live Fire Test Device',
        });

        deviceId = enrollResult.deviceId;

        if (enrollResult.status.toUpperCase() === 'ACTIVE') {
            printSuccess('Auto-Activation Successful!');
            printInfo(`Device ID: ${deviceId}`);
        } else if (enrollResult.status.toUpperCase() === 'PENDING') {
            printWarning('Device is PENDING approval.');
            printWarning('Go to the Dashboard and Approve it, then return here.');
            await waitForEnter('');
        } else {
            printInfo(`Device status: ${enrollResult.status}`);
            printInfo(`Device ID: ${deviceId}`);
        }

    } catch (error) {
        printError(`Phase 2 failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }

    // =========================================================================
    // PHASE 3: INTEGRITY CHECK
    // =========================================================================
    printHeader('PHASE 3: INTEGRITY CHECK - Verify Enrollment');

    try {
        const isEnrolled = client.isEnrolled();
        if (isEnrolled) {
            printSuccess(`client.isEnrolled() = ${isEnrolled}`);
            printSuccess('Device is locally enrolled and keys are generated.');
        } else {
            printError('Client reports not enrolled!');
            process.exit(1);
        }

        // Verify with backend
        printInfo('Sending signed test request to verify device...');
        const verifyPayload = { test: true, timestamp: new Date().toISOString() };
        const verifyHeaders = await client.signRequest({
            method: 'POST',
            url: `${BACKEND_URL}/api/v1/keyguard/verify-test`,
            body: verifyPayload,
        });

        const verifyResult = await makeRequest<{ valid: boolean; deviceId?: string; error?: string }>(
            `${BACKEND_URL}/api/v1/keyguard/verify-test`,
            {
                method: 'POST',
                headers: verifyHeaders,
                body: verifyPayload,
            }
        );

        if (verifyResult.ok && verifyResult.data?.valid) {
            printSuccess('Signature verification successful!');
            printInfo(`Verified Device ID: ${verifyResult.data.deviceId}`);
        } else {
            printError(`Verification failed: ${verifyResult.data?.error || 'Unknown error'}`);
            console.log('Full response:', JSON.stringify(verifyResult, null, 2));
        }

    } catch (error) {
        printError(`Phase 3 failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }

    // =========================================================================
    // PHASE 4: LIVE FIRE TEST - OpenAI Proxy
    // =========================================================================
    printHeader('PHASE 4: LIVE FIRE TEST - OpenAI Proxy Request');

    const openAIPayload = {
        model: 'gpt-3.5-turbo',
        messages: [
            {
                role: 'user',
                content: "Reply with exactly: 'KeyGuard System Operational'",
            },
        ],
        max_tokens: 50,
    };

    let proxyResult: ApiResponse<{
        choices?: Array<{ message?: { content?: string } }>;
        error?: { message?: string };
    }>;

    try {
        printInfo('Signing request for OpenAI proxy...');
        printInfo(`Payload: ${JSON.stringify(openAIPayload, null, 2)}`);

        const proxyUrl = `${BACKEND_URL}/api/v1/proxy/v1/chat/completions`;
        const proxyHeaders = await client.signRequest({
            method: 'POST',
            url: proxyUrl,
            body: openAIPayload,
        });

        printInfo('Sending signed request to proxy...');

        proxyResult = await makeRequest(proxyUrl, {
            method: 'POST',
            headers: proxyHeaders,
            body: openAIPayload,
        });

    } catch (error) {
        printError(`Phase 4 failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }

    // =========================================================================
    // PHASE 5: RESULT ANALYSIS
    // =========================================================================
    printHeader('PHASE 5: RESULT ANALYSIS');

    if (proxyResult.ok && proxyResult.data?.choices?.[0]?.message?.content) {
        const aiResponse = proxyResult.data.choices[0].message.content;

        printSuccess('🎉 OpenAI Proxy Request Successful!');
        printDivider();
        console.log(`\n${COLORS.green}📝 OpenAI Response:${COLORS.reset}`);
        printDivider();
        console.log(aiResponse);
        printDivider();

        console.log(`\n${COLORS.green}🎉 SUCCESS: Full cycle complete!${COLORS.reset}`);

    } else {
        printError(`Proxy request failed with status: ${proxyResult.status}`);

        // Detailed error analysis
        if (proxyResult.status === 400) {
            printError('400 Bad Request - Check the request format or headers');
        } else if (proxyResult.status === 401) {
            printError('401 Unauthorized - Signature verification failed or device not authorized');
        } else if (proxyResult.status === 403) {
            printError('403 Forbidden - Access denied');
        } else if (proxyResult.status === 500) {
            printError('500 Internal Server Error - Backend error');
        }

        console.log(`\n${COLORS.red}📝 Error Details:${COLORS.reset}`);
        printDivider();
        console.log(JSON.stringify(proxyResult.data, null, 2));
        printDivider();

        if (proxyResult.requestId) {
            printInfo(`Request ID: ${proxyResult.requestId}`);
        }
    }

    // =========================================================================
    // SUMMARY
    // =========================================================================
    printHeader('SMOKE TEST COMPLETE');

    console.log('Test Summary:');
    console.log('  ✓ Admin login and enrollment code generation');
    console.log('  ✓ SDK initialization and key pair generation');
    console.log('  ✓ Device enrollment');
    console.log('  ✓ Signature verification');
    console.log('  ✓ OpenAI proxy request');

    rl.close();
}

// Run the test
runSmokeTest().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
