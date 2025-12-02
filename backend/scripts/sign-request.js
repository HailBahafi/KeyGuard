#!/usr/bin/env node

/**
 * Sign a request using KeyGuard protocol
 *
 * Usage: node scripts/sign-request.js [options]
 *
 * Options:
 *   --method <METHOD>       HTTP method (default: POST)
 *   --url <URL>             Request path (default: /api/v1/keyguard/verify-test)
 *   --body <JSON>           Request body as JSON string (default: {})
 *   --api-key <KEY>         API key (default: kg_prod_123)
 *   --key-id <ID>           Device key ID (required)
 *   --private-key <KEY>     Private key PKCS8 Base64 (required)
 */

const { webcrypto } = require('node:crypto');
const { createHash } = require('node:crypto');

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    method: 'POST',
    url: '/api/v1/keyguard/verify-test',
    body: '{}',
    apiKey: 'kg_prod_123',
    keyId: null,
    privateKey: null,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const next = args[i + 1];

    switch (arg) {
      case '--method':
        options.method = next;
        i++;
        break;
      case '--url':
        options.url = next;
        i++;
        break;
      case '--body':
        options.body = next;
        i++;
        break;
      case '--api-key':
        options.apiKey = next;
        i++;
        break;
      case '--key-id':
        options.keyId = next;
        i++;
        break;
      case '--private-key':
        options.privateKey = next;
        i++;
        break;
    }
  }

  return options;
}

async function signRequest(options) {
  const { method, url, body, apiKey, keyId, privateKey } = options;

  // Validate required options
  if (!keyId || !privateKey) {
    console.error('❌ Error: --key-id and --private-key are required');
    console.log('\nUsage:');
    console.log('  node scripts/sign-request.js --key-id <ID> --private-key <KEY>');
    console.log('\nGenerate keys first:');
    console.log('  node scripts/generate-test-keypair.js');
    process.exit(1);
  }

  console.log('🔐 Signing request...\n');

  try {
    // Import private key
    const privateKeyBuffer = Buffer.from(privateKey, 'base64');
    const cryptoKey = await webcrypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true,
      ['sign']
    );

    // Generate timestamp and nonce
    const timestamp = new Date().toISOString();
    const nonce = `nonce_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Compute body hash
    const bodyBuffer = Buffer.from(body, 'utf8');
    const bodySha256 = createHash('sha256').update(bodyBuffer).digest('hex');

    // Build canonical payload
    const pathAndQuery = url;
    const canonicalPayload = [
      'kg-v1',
      timestamp,
      method.toUpperCase(),
      pathAndQuery,
      bodySha256,
      nonce,
      apiKey,
      keyId,
    ].join('|');

    console.log('📋 Canonical Payload:');
    console.log(canonicalPayload);
    console.log('');

    // Sign payload
    const payloadBuffer = Buffer.from(canonicalPayload, 'utf8');
    const signatureBuffer = await webcrypto.subtle.sign(
      {
        name: 'ECDSA',
        hash: { name: 'SHA-256' },
      },
      cryptoKey,
      payloadBuffer
    );

    const signature = Buffer.from(signatureBuffer).toString('base64');

    console.log('✅ Request signed successfully!\n');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('Headers:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`x-keyguard-api-key: ${apiKey}`);
    console.log(`x-keyguard-key-id: ${keyId}`);
    console.log(`x-keyguard-timestamp: ${timestamp}`);
    console.log(`x-keyguard-nonce: ${nonce}`);
    console.log(`x-keyguard-body-sha256: ${bodySha256}`);
    console.log(`x-keyguard-alg: ECDSA_P256_SHA256_P1363`);
    console.log(`x-keyguard-signature: ${signature}`);
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('cURL Command:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`curl -X ${method} http://localhost:3000${url} \\`);
    console.log(`  -H "Content-Type: application/json" \\`);
    console.log(`  -H "x-keyguard-api-key: ${apiKey}" \\`);
    console.log(`  -H "x-keyguard-key-id: ${keyId}" \\`);
    console.log(`  -H "x-keyguard-timestamp: ${timestamp}" \\`);
    console.log(`  -H "x-keyguard-nonce: ${nonce}" \\`);
    console.log(`  -H "x-keyguard-body-sha256: ${bodySha256}" \\`);
    console.log(`  -H "x-keyguard-alg: ECDSA_P256_SHA256_P1363" \\`);
    console.log(`  -H "x-keyguard-signature: ${signature}" \\`);
    console.log(`  -d '${body}'`);
    console.log('');

    return {
      headers: {
        'x-keyguard-api-key': apiKey,
        'x-keyguard-key-id': keyId,
        'x-keyguard-timestamp': timestamp,
        'x-keyguard-nonce': nonce,
        'x-keyguard-body-sha256': bodySha256,
        'x-keyguard-alg': 'ECDSA_P256_SHA256_P1363',
        'x-keyguard-signature': signature,
      },
      body,
    };
  } catch (error) {
    console.error('❌ Error signing request:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  const options = parseArgs();
  signRequest(options).catch(console.error);
}

module.exports = { signRequest };
