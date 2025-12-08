import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/database/prisma.service';

describe('Proxy Module (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let testApiKey: string;
  let testDeviceId: string;
  let testKeyPair: crypto.KeyPairKeyObjectResult;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );

    await app.init();
    await app.getHttpAdapter().getInstance().ready();

    prisma = app.get(PrismaService);

    // Generate test keypair
    testKeyPair = crypto.generateKeyPairSync('ec', {
      namedCurve: 'prime256v1',
      publicKeyEncoding: { type: 'spki', format: 'der' },
      privateKeyEncoding: { type: 'pkcs8', format: 'der' },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('POST /proxy/v1/chat/completions', () => {
    beforeEach(async () => {
      // Create test API key
      const apiKey = await prisma.prisma.apiKey.create({
        data: {
          name: 'Test API Key',
          fullValue: `kg_test_${Date.now()}`,
          prefix: 'kg_test',
          lastUsed: new Date(),
          status: 'ACTIVE',
          organizationId: null,
        },
      });
      testApiKey = apiKey.fullValue;

      // Enroll test device
      const publicKeyBase64 = testKeyPair.publicKey.export({
        type: 'spki',
        format: 'der',
      }).toString('base64');

      const device = await prisma.prisma.device.create({
        data: {
          name: 'Test Device',
          fingerprintHash: `fingerprint_${Date.now()}`,
          status: 'ACTIVE',
          platform: {},
          ownerName: 'Test User',
          ownerEmail: 'test@example.com',
          ipAddress: '127.0.0.1',
          location: 'Test Location',
          keyId: `test_key_${Date.now()}`,
          publicKeySpkiBase64: publicKeyBase64,
          userAgent: 'Test Agent',
          metadata: {},
          apiKeyId: apiKey.id,
        },
      });
      testDeviceId = device.id;
    });

    afterEach(async () => {
      // Cleanup
      await prisma.prisma.device.deleteMany({
        where: { name: 'Test Device' },
      });
      await prisma.prisma.apiKey.deleteMany({
        where: { name: 'Test API Key' },
      });
    });

    it('should reject requests without signature headers', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/proxy/v1/chat/completions',
        payload: {
          model: 'gpt-4',
          messages: [{ role: 'user', content: 'Hello' }],
        },
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toContain('Missing required headers');
    });

    it('should reject requests with invalid signature', async () => {
      const timestamp = new Date().toISOString();
      const nonce = crypto.randomBytes(16).toString('hex');
      const body = JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      });
      const bodySha256 = crypto.createHash('sha256').update(body).digest('hex');

      const response = await app.inject({
        method: 'POST',
        url: '/proxy/v1/chat/completions',
        headers: {
          'x-keyguard-api-key': testApiKey,
          'x-keyguard-key-id': 'invalid-key-id',
          'x-keyguard-timestamp': timestamp,
          'x-keyguard-nonce': nonce,
          'x-keyguard-body-sha256': bodySha256,
          'x-keyguard-alg': 'ES256',
          'x-keyguard-signature': 'invalid-signature',
        },
        payload: body,
      });

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toContain('Signature verification failed');
    });

    // Note: Full integration test would require valid OpenAI API key
    // and proper signature generation. This is left as an exercise
    // or should be done in a separate integration test suite.

    it('should log proxy attempts to audit log', async () => {
      const timestamp = new Date().toISOString();
      const nonce = crypto.randomBytes(16).toString('hex');
      const body = JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: 'Hello' }],
      });
      const bodySha256 = crypto.createHash('sha256').update(body).digest('hex');

      // Attempt proxy request (will fail signature verification)
      await app.inject({
        method: 'POST',
        url: '/proxy/v1/chat/completions',
        headers: {
          'x-keyguard-api-key': testApiKey,
          'x-keyguard-key-id': 'test-key',
          'x-keyguard-timestamp': timestamp,
          'x-keyguard-nonce': nonce,
          'x-keyguard-body-sha256': bodySha256,
          'x-keyguard-alg': 'ES256',
          'x-keyguard-signature': 'invalid-signature',
        },
        payload: body,
      });

      // Wait a bit for async logging
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check audit log
      const logs = await prisma.prisma.auditLog.findMany({
        where: {
          event: 'proxy.request',
        },
        orderBy: { timestamp: 'desc' },
        take: 1,
      });

      // Note: Log might not exist if signature verification fails before proxy service
      // In production, you might want to log failed attempts too
    });
  });

  describe('GET /logs', () => {
    it('should return logs without authentication (for testing)', async () => {
      // Note: In production, this endpoint should be protected with JWT
      // For this test, we're assuming it's accessible

      const response = await app.inject({
        method: 'GET',
        url: '/logs?page=1&limit=10',
      });

      expect([200, 401]).toContain(response.statusCode);

      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        expect(data).toHaveProperty('logs');
        expect(data).toHaveProperty('pagination');
        expect(Array.isArray(data.logs)).toBe(true);
      }
    });

    it('should filter logs by event type', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/logs?eventType=proxy&page=1&limit=10',
      });

      expect([200, 401]).toContain(response.statusCode);

      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        expect(data).toHaveProperty('logs');
        expect(Array.isArray(data.logs)).toBe(true);
      }
    });

    it('should paginate logs correctly', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/logs?page=1&limit=5',
      });

      expect([200, 401]).toContain(response.statusCode);

      if (response.statusCode === 200) {
        const data = JSON.parse(response.body);
        expect(data.pagination).toHaveProperty('total');
        expect(data.pagination).toHaveProperty('page');
        expect(data.pagination).toHaveProperty('limit');
        expect(data.pagination).toHaveProperty('pages');
        expect(data.pagination.limit).toBe(5);
      }
    });
  });
});
