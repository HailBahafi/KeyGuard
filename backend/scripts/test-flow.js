#!/usr/bin/env node

/**
 * Complete end-to-end test flow for KeyGuard
 *
 * This script:
 * 1. Generates a key pair
 * 2. Enrolls the device
 * 3. Signs and verifies a test request
 * 4. Lists devices
 * 5. Revokes the device
 *
 * Usage: node scripts/test-flow.js [base-url]
 *
 * Example: node scripts/test-flow.js http://localhost:3000
 */

const { generateTestKeypair } = require('./generate-test-keypair');
const { signRequest } = require('./sign-request');

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const API_KEY = 'kg_prod_123';

async function makeRequest(url, options) {
  const fetch = (await import('node-fetch')).default;
  const response = await fetch(url, options);
  const text = await response.text();

  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }

  return {
    status: response.status,
    statusText: response.statusText,
    body,
    ok: response.ok,
  };
}

async function runTestFlow() {
  console.log('🚀 Starting KeyGuard End-to-End Test Flow\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  try {
    // Step 1: Generate key pair
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Step 1: Generate Key Pair');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const keys = await generateTestKeypair();

    console.log('\n');

    // Step 2: Enroll device
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Step 2: Enroll Device');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const enrollData = {
      publicKey: keys.publicKey,
      keyId: keys.keyId,
      deviceFingerprint: keys.fingerprint,
      label: 'Test Flow Device',
      userAgent: 'Node.js Test Script',
      metadata: { test: true },
    };

    const enrollResponse = await makeRequest(`${BASE_URL}/api/v1/keyguard/enroll`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-keyguard-api-key': API_KEY,
      },
      body: JSON.stringify(enrollData),
    });

    console.log('Enroll Response:', JSON.stringify(enrollResponse.body, null, 2));

    if (!enrollResponse.ok) {
      throw new Error(`Enrollment failed: ${JSON.stringify(enrollResponse.body)}`);
    }

    const deviceId = enrollResponse.body.id;
    console.log(`\n✅ Device enrolled successfully: ${deviceId}\n`);

    // Step 3: Sign and verify request
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Step 3: Sign and Verify Request');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const testBody = { test: 'data', timestamp: Date.now() };
    const signedRequest = await signRequest({
      method: 'POST',
      url: '/api/v1/keyguard/verify-test',
      body: JSON.stringify(testBody),
      apiKey: API_KEY,
      keyId: keys.keyId,
      privateKey: keys.privateKey,
    });

    const verifyResponse = await makeRequest(`${BASE_URL}/api/v1/keyguard/verify-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...signedRequest.headers,
      },
      body: signedRequest.body,
    });

    console.log('Verify Response:', JSON.stringify(verifyResponse.body, null, 2));

    if (!verifyResponse.ok || !verifyResponse.body.valid) {
      throw new Error(`Verification failed: ${JSON.stringify(verifyResponse.body)}`);
    }

    console.log('\n✅ Request verified successfully\n');

    // Step 4: List devices
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Step 4: List Devices');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const listResponse = await makeRequest(`${BASE_URL}/api/v1/keyguard/devices`, {
      method: 'GET',
      headers: {
        'x-keyguard-api-key': API_KEY,
      },
    });

    console.log(`Found ${listResponse.body.length} device(s)`);
    console.log(JSON.stringify(listResponse.body.slice(0, 3), null, 2)); // Show first 3

    console.log('\n✅ Devices listed successfully\n');

    // Step 5: Revoke device
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Step 5: Revoke Device');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const revokeResponse = await makeRequest(
      `${BASE_URL}/api/v1/keyguard/devices/${deviceId}`,
      {
        method: 'DELETE',
        headers: {
          'x-keyguard-api-key': API_KEY,
        },
      }
    );

    console.log('Revoke Response:', JSON.stringify(revokeResponse.body, null, 2));

    if (!revokeResponse.ok) {
      throw new Error(`Revocation failed: ${JSON.stringify(revokeResponse.body)}`);
    }

    console.log('\n✅ Device revoked successfully\n');

    // Final summary
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ Test Flow Completed Successfully!');
    console.log('═══════════════════════════════════════════════════════════════\n');
    console.log('Summary:');
    console.log('  ✓ Key pair generated');
    console.log('  ✓ Device enrolled');
    console.log('  ✓ Request signed and verified');
    console.log('  ✓ Devices listed');
    console.log('  ✓ Device revoked');
    console.log('');

  } catch (error) {
    console.error('\n❌ Test flow failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runTestFlow().catch(console.error);
}

module.exports = { runTestFlow };
