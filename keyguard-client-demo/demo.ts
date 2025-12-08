/**
 * KeyGuard SDK - External Client Demo
 * 
 * This script simulates a real developer experience using the @keyguard/sdk
 * to enroll a device and sign requests.
 */

import { KeyGuardClient, MemoryStorageAdapter } from '@keyguard/sdk';

// Configuration - Using placeholder API key
const API_KEY = 'kg_prod_demo_12345';
const BACKEND_URL = 'http://localhost:3000';

// Custom fingerprint provider for Node.js environment
const nodeFingerprintProvider = {
    getFingerprint: async () => ({
        visitorId: `node-demo-${Date.now()}`,
        label: 'Demo-Laptop',
        metadata: {
            platform: process.platform,
            nodeVersion: process.version,
            hostname: require('os').hostname()
        }
    })
};

async function main() {
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║           KeyGuard SDK - External Client Demo             ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');

    // Step 1: Initialize the client
    console.log('📦 Step 1: Initializing KeyGuard Client...');
    const client = new KeyGuardClient({
        apiKey: API_KEY,
        storage: new MemoryStorageAdapter(),
        fingerprintProvider: nodeFingerprintProvider
    });
    console.log('   ✓ Client initialized with API key:', API_KEY);
    console.log('');

    // Step 2: Enroll the device
    console.log('🔐 Step 2: Enrolling device "Demo-Laptop"...');
    try {
        const enrollment = await client.enroll();
        console.log('   ✓ Enrollment Successful!');
        console.log('   - Key ID:', enrollment.keyId);
        console.log('   - Public Key (first 50 chars):', enrollment.publicKey.substring(0, 50) + '...');
        console.log('');
    } catch (error: any) {
        console.error('   ✗ Enrollment failed:', error.message);
        return;
    }

    // Step 3: Sign a request
    console.log('✍️  Step 3: Signing a test request...');
    const testBody = JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello from KeyGuard!' }]
    });

    try {
        const headers = await client.signRequest({
            method: 'POST',
            url: 'https://api.openai.com/v1/chat/completions',
            body: testBody
        });

        console.log('   ✓ Request signed successfully!');
        console.log('   Generated Headers:');
        console.log('   ─────────────────────────────────────────────────────');
        for (const [key, value] of Object.entries(headers)) {
            const displayValue = value.length > 60 ? value.substring(0, 60) + '...' : value;
            console.log(`   ${key}: ${displayValue}`);
        }
        console.log('');

        // Highlight the signature header
        if (headers['x-keyguard-signature']) {
            console.log('🔑 X-KeyGuard-Signature (full):');
            console.log(`   ${headers['x-keyguard-signature']}`);
        }
    } catch (error: any) {
        console.error('   ✗ Signing failed:', error.message);
        return;
    }

    // Step 4: (Optional) Send to local backend for verification
    console.log('');
    console.log('📡 Step 4: Testing backend verification (optional)...');
    console.log(`   Target: ${BACKEND_URL}/api/v1/verify-test`);

    try {
        const verifyHeaders = await client.signRequest({
            method: 'POST',
            url: `${BACKEND_URL}/api/v1/verify-test`,
            body: testBody
        });

        const response = await fetch(`${BACKEND_URL}/api/v1/verify-test`, {
            method: 'POST',
            headers: {
                ...verifyHeaders,
                'Content-Type': 'application/json'
            },
            body: testBody
        });

        if (response.ok) {
            const result = await response.json();
            console.log('   ✓ Backend verification successful!');
            console.log('   Response:', JSON.stringify(result, null, 2));
        } else {
            console.log(`   ⚠ Backend returned ${response.status}: ${response.statusText}`);
            const text = await response.text();
            console.log('   Response:', text.substring(0, 200));
        }
    } catch (error: any) {
        console.log('   ⚠ Backend not available (expected if not running)');
        console.log(`   Error: ${error.message}`);
    }

    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    Demo Complete! 🎉                      ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
}

main().catch(console.error);
