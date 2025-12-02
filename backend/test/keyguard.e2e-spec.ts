import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/database/prisma.service';
import { webcrypto } from 'node:crypto';
import { createHash } from 'node:crypto';

describe('KeyGuard (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;

  // Test data
  let testApiKey: string;
  let testProjectId: string;
  let testKeyId: string;
  let publicKeyBase64: string;
  let privateKey: webcrypto.CryptoKey;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const fastifyAdapter = new FastifyAdapter();

    // Setup raw body capture
    fastifyAdapter.getInstance().addContentTypeParser(
      'application/json',
      { parseAs: 'buffer' },
      (req: any, body: Buffer, done: any) => {
        try {
          req.rawBody = body;
          const json = body.length > 0 ? JSON.parse(body.toString('utf8')) : {};
          done(null, json);
        } catch (error: any) {
          done(error, undefined);
        }
      },
    );

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      fastifyAdapter,
    );

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    prisma = app.get<PrismaService>(PrismaService);

    // Generate test key pair
    const keyPair = await webcrypto.subtle.generateKey(
      {
        name: 'ECDSA',
        namedCurve: 'P-256',
      },
      true,
      ['sign', 'verify'],
    );

    privateKey = keyPair.privateKey;

    const publicKeyBuffer = await webcrypto.subtle.exportKey(
      'spki',
      keyPair.publicKey,
    );
    publicKeyBase64 = Buffer.from(publicKeyBuffer).toString('base64');

    // Create test project/API key
    const project = await prisma.prisma.apiKey.create({
      data: {
        keyPrefix: 'kg_test',
        name: 'Test Project',
        status: 'ACTIVE',
      },
    });

    testProjectId = project.id;
    testApiKey = `${project.keyPrefix}_e2e_test_key`;
    testKeyId = `kg_key_e2e_test_${Date.now()}`;
  });

  afterAll(async () => {
    // Cleanup test data
    if (testProjectId) {
      await prisma.prisma.device.deleteMany({
        where: { apiKeyId: testProjectId },
      });
      await prisma.prisma.nonce.deleteMany({
        where: { apiKeyId: testProjectId },
      });
      await prisma.prisma.apiKey.delete({
        where: { id: testProjectId },
      });
    }

    await app.close();
  });

  describe('/api/v1/keyguard/enroll (POST)', () => {
    it('should successfully enroll a device', async () => {
      const enrollData = {
        publicKey: publicKeyBase64,
        keyId: testKeyId,
        deviceFingerprint: 'fingerprint_e2e_test',
        label: 'E2E Test Device',
        userAgent: 'Mozilla/5.0 (Test)',
        metadata: { test: true },
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/keyguard/enroll',
        headers: {
          'x-keyguard-api-key': testApiKey,
          'content-type': 'application/json',
        },
        payload: enrollData,
      });

      expect(response.statusCode).toBe(201);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('status', 'ACTIVE');
      expect(body).toHaveProperty('createdAt');
    });

    it('should reject enrollment without API key', async () => {
      const enrollData = {
        publicKey: publicKeyBase64,
        keyId: 'another_key_id',
        deviceFingerprint: 'fingerprint',
        label: 'Test Device',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/keyguard/enroll',
        headers: {
          'content-type': 'application/json',
        },
        payload: enrollData,
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject enrollment with duplicate keyId', async () => {
      const enrollData = {
        publicKey: publicKeyBase64,
        keyId: testKeyId, // Same as already enrolled
        deviceFingerprint: 'fingerprint2',
        label: 'Duplicate Device',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/keyguard/enroll',
        headers: {
          'x-keyguard-api-key': testApiKey,
          'content-type': 'application/json',
        },
        payload: enrollData,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body).toContain('already enrolled');
    });

    it('should reject enrollment with invalid public key', async () => {
      const enrollData = {
        publicKey: 'invalid_public_key!!!',
        keyId: 'new_key_id',
        deviceFingerprint: 'fingerprint',
        label: 'Test Device',
      };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/keyguard/enroll',
        headers: {
          'x-keyguard-api-key': testApiKey,
          'content-type': 'application/json',
        },
        payload: enrollData,
      });

      expect(response.statusCode).toBe(400);
    });

    it('should validate required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/keyguard/enroll',
        headers: {
          'x-keyguard-api-key': testApiKey,
          'content-type': 'application/json',
        },
        payload: {
          publicKey: publicKeyBase64,
          // Missing required fields
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('/api/v1/keyguard/verify-test (POST)', () => {
    /**
     * Helper to sign a request
     */
    async function signRequest(
      method: string,
      url: string,
      body: any,
    ): Promise<{
      timestamp: string;
      nonce: string;
      bodySha256: string;
      signature: string;
    }> {
      const timestamp = new Date().toISOString();
      const nonce = `nonce_${Date.now()}_${Math.random()}`;

      const bodyString = body ? JSON.stringify(body) : '';
      const bodyBuffer = Buffer.from(bodyString, 'utf8');
      const bodySha256 = createHash('sha256').update(bodyBuffer).digest('hex');

      const pathAndQuery = url;

      const canonicalPayload = [
        'kg-v1',
        timestamp,
        method.toUpperCase(),
        pathAndQuery,
        bodySha256,
        nonce,
        testApiKey,
        testKeyId,
      ].join('|');

      const signatureBuffer = await webcrypto.subtle.sign(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        privateKey,
        Buffer.from(canonicalPayload, 'utf8'),
      );

      const signature = Buffer.from(signatureBuffer).toString('base64');

      return { timestamp, nonce, bodySha256, signature };
    }

    it('should successfully verify a signed request with body', async () => {
      const body = { test: 'data', value: 123 };
      const { timestamp, nonce, bodySha256, signature } = await signRequest(
        'POST',
        '/api/v1/keyguard/verify-test',
        body,
      );

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/keyguard/verify-test',
        headers: {
          'x-keyguard-api-key': testApiKey,
          'x-keyguard-key-id': testKeyId,
          'x-keyguard-timestamp': timestamp,
          'x-keyguard-nonce': nonce,
          'x-keyguard-body-sha256': bodySha256,
          'x-keyguard-alg': 'ECDSA_P256_SHA256_P1363',
          'x-keyguard-signature': signature,
          'content-type': 'application/json',
        },
        payload: body,
      });

      expect(response.statusCode).toBe(200);

      const responseBody = JSON.parse(response.body);
      expect(responseBody).toEqual({
        valid: true,
        deviceId: expect.any(String),
        keyId: testKeyId,
      });
    });

    it('should successfully verify a signed request with empty body', async () => {
      const { timestamp, nonce, bodySha256, signature } = await signRequest(
        'POST',
        '/api/v1/keyguard/verify-test',
        null,
      );

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/keyguard/verify-test',
        headers: {
          'x-keyguard-api-key': testApiKey,
          'x-keyguard-key-id': testKeyId,
          'x-keyguard-timestamp': timestamp,
          'x-keyguard-nonce': nonce,
          'x-keyguard-body-sha256': bodySha256,
          'x-keyguard-alg': 'ECDSA_P256_SHA256_P1363',
          'x-keyguard-signature': signature,
          'content-type': 'application/json',
        },
      });

      expect(response.statusCode).toBe(200);

      const responseBody = JSON.parse(response.body);
      expect(responseBody.valid).toBe(true);
    });

    it('should reject request with invalid signature', async () => {
      const body = { test: 'data' };
      const { timestamp, nonce, bodySha256 } = await signRequest(
        'POST',
        '/api/v1/keyguard/verify-test',
        body,
      );

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/keyguard/verify-test',
        headers: {
          'x-keyguard-api-key': testApiKey,
          'x-keyguard-key-id': testKeyId,
          'x-keyguard-timestamp': timestamp,
          'x-keyguard-nonce': nonce,
          'x-keyguard-body-sha256': bodySha256,
          'x-keyguard-alg': 'ECDSA_P256_SHA256_P1363',
          'x-keyguard-signature': 'invalid_signature_base64',
          'content-type': 'application/json',
        },
        payload: body,
      });

      expect(response.statusCode).toBe(200);

      const responseBody = JSON.parse(response.body);
      expect(responseBody.valid).toBe(false);
      expect(responseBody.error).toBeDefined();
    });

    it('should reject request with modified body', async () => {
      const originalBody = { test: 'data' };
      const { timestamp, nonce, bodySha256, signature } = await signRequest(
        'POST',
        '/api/v1/keyguard/verify-test',
        originalBody,
      );

      // Send different body
      const modifiedBody = { test: 'modified' };

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/keyguard/verify-test',
        headers: {
          'x-keyguard-api-key': testApiKey,
          'x-keyguard-key-id': testKeyId,
          'x-keyguard-timestamp': timestamp,
          'x-keyguard-nonce': nonce,
          'x-keyguard-body-sha256': bodySha256,
          'x-keyguard-alg': 'ECDSA_P256_SHA256_P1363',
          'x-keyguard-signature': signature,
          'content-type': 'application/json',
        },
        payload: modifiedBody,
      });

      expect(response.statusCode).toBe(200);

      const responseBody = JSON.parse(response.body);
      expect(responseBody.valid).toBe(false);
      expect(responseBody.error).toContain('hash');
    });

    it('should reject replay attack (reused nonce)', async () => {
      const body = { test: 'data' };
      const { timestamp, nonce, bodySha256, signature } = await signRequest(
        'POST',
        '/api/v1/keyguard/verify-test',
        body,
      );

      // First request should succeed
      const response1 = await app.inject({
        method: 'POST',
        url: '/api/v1/keyguard/verify-test',
        headers: {
          'x-keyguard-api-key': testApiKey,
          'x-keyguard-key-id': testKeyId,
          'x-keyguard-timestamp': timestamp,
          'x-keyguard-nonce': nonce,
          'x-keyguard-body-sha256': bodySha256,
          'x-keyguard-alg': 'ECDSA_P256_SHA256_P1363',
          'x-keyguard-signature': signature,
          'content-type': 'application/json',
        },
        payload: body,
      });

      expect(response1.statusCode).toBe(200);
      const body1 = JSON.parse(response1.body);
      expect(body1.valid).toBe(true);

      // Second request with same nonce should fail
      const response2 = await app.inject({
        method: 'POST',
        url: '/api/v1/keyguard/verify-test',
        headers: {
          'x-keyguard-api-key': testApiKey,
          'x-keyguard-key-id': testKeyId,
          'x-keyguard-timestamp': timestamp,
          'x-keyguard-nonce': nonce,
          'x-keyguard-body-sha256': bodySha256,
          'x-keyguard-alg': 'ECDSA_P256_SHA256_P1363',
          'x-keyguard-signature': signature,
          'content-type': 'application/json',
        },
        payload: body,
      });

      expect(response2.statusCode).toBe(200);
      const body2 = JSON.parse(response2.body);
      expect(body2.valid).toBe(false);
      expect(body2.error).toContain('replay');
    });

    it('should reject request with old timestamp', async () => {
      const oldTimestamp = new Date(Date.now() - 200 * 1000).toISOString(); // 200 seconds ago
      const nonce = `nonce_${Date.now()}`;
      const body = { test: 'data' };
      const bodyString = JSON.stringify(body);
      const bodySha256 = createHash('sha256')
        .update(Buffer.from(bodyString, 'utf8'))
        .digest('hex');

      const canonicalPayload = [
        'kg-v1',
        oldTimestamp,
        'POST',
        '/api/v1/keyguard/verify-test',
        bodySha256,
        nonce,
        testApiKey,
        testKeyId,
      ].join('|');

      const signatureBuffer = await webcrypto.subtle.sign(
        { name: 'ECDSA', hash: { name: 'SHA-256' } },
        privateKey,
        Buffer.from(canonicalPayload, 'utf8'),
      );
      const signature = Buffer.from(signatureBuffer).toString('base64');

      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/keyguard/verify-test',
        headers: {
          'x-keyguard-api-key': testApiKey,
          'x-keyguard-key-id': testKeyId,
          'x-keyguard-timestamp': oldTimestamp,
          'x-keyguard-nonce': nonce,
          'x-keyguard-body-sha256': bodySha256,
          'x-keyguard-alg': 'ECDSA_P256_SHA256_P1363',
          'x-keyguard-signature': signature,
          'content-type': 'application/json',
        },
        payload: body,
      });

      expect(response.statusCode).toBe(200);

      const responseBody = JSON.parse(response.body);
      expect(responseBody.valid).toBe(false);
      expect(responseBody.error).toContain('timestamp');
    });

    it('should reject request with missing headers', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/keyguard/verify-test',
        headers: {
          'x-keyguard-api-key': testApiKey,
          // Missing other required headers
          'content-type': 'application/json',
        },
        payload: {},
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('/api/v1/keyguard/devices (GET)', () => {
    it('should list all devices for API key', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/keyguard/devices',
        headers: {
          'x-keyguard-api-key': testApiKey,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
    });

    it('should reject request without API key', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/keyguard/devices',
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('/api/v1/keyguard/devices/:id (DELETE)', () => {
    it('should revoke a device', async () => {
      // Get device ID from list
      const listResponse = await app.inject({
        method: 'GET',
        url: '/api/v1/keyguard/devices',
        headers: {
          'x-keyguard-api-key': testApiKey,
        },
      });

      const devices = JSON.parse(listResponse.body);
      const deviceId = devices[0].id;

      // Revoke device
      const response = await app.inject({
        method: 'DELETE',
        url: `/api/v1/keyguard/devices/${deviceId}`,
        headers: {
          'x-keyguard-api-key': testApiKey,
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.status).toBe('REVOKED');
    });

    it('should reject request without API key', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/v1/keyguard/devices/some-id',
      });

      expect(response.statusCode).toBe(400);
    });
  });
});
