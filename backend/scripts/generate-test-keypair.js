#!/usr/bin/env node

/**
 * Generate a test ECDSA P-256 key pair for KeyGuard testing
 *
 * Usage: node scripts/generate-test-keypair.js
 */

const { webcrypto } = require('node:crypto');
const { createHash, randomBytes } = require('node:crypto');

async function generateTestKeypair() {
  console.log('🔑 Generating ECDSA P-256 Key Pair...\n');

  // Generate key pair
  const keyPair = await webcrypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign', 'verify']
  );

  // Export public key (SPKI format)
  const publicKeyBuffer = await webcrypto.subtle.exportKey('spki', keyPair.publicKey);
  const publicKeyBase64 = Buffer.from(publicKeyBuffer).toString('base64');

  // Export private key (PKCS8 format)
  const privateKeyBuffer = await webcrypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  const privateKeyBase64 = Buffer.from(privateKeyBuffer).toString('base64');

  // Generate keyId (hash of public key)
  const keyIdHash = createHash('sha256').update(publicKeyBuffer).digest('hex').substring(0, 16);
  const keyId = `kg_key_${keyIdHash}`;

  // Generate fingerprint (simulated)
  const fingerprint = randomBytes(16).toString('hex');

  console.log('✅ Key pair generated successfully!\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Public Key (SPKI Base64):');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(publicKeyBase64);
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('Private Key (PKCS8 Base64):');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(privateKeyBase64);
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('Key ID:');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(keyId);
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('Device Fingerprint (simulated):');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(fingerprint);
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('Usage:');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('1. Use the Public Key to enroll the device via POST /api/v1/keyguard/enroll');
  console.log('2. Keep the Private Key secret - use it to sign requests');
  console.log('3. Use the Key ID in the x-keyguard-key-id header');
  console.log('\nSave these values for testing!\n');

  // Return for programmatic use
  return {
    publicKey: publicKeyBase64,
    privateKey: privateKeyBase64,
    keyId,
    fingerprint,
  };
}

// Run if called directly
if (require.main === module) {
  generateTestKeypair().catch(console.error);
}

module.exports = { generateTestKeypair };
