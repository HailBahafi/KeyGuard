import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/database/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('Devices (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let authToken: string;
  let testDeviceId: string;
  let testApiKeyId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
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

    // Create admin user and login
    const hashedPassword = await bcrypt.hash('Admin123!@#', 10);
    await prisma.prisma.user.create({
      data: {
        email: 'admin-devices@keyguard.io',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin-devices@keyguard.io',
        password: 'Admin123!@#',
      });

    authToken = loginResponse.body.accessToken;

    // Create test API key and device
    const apiKey = await prisma.prisma.apiKey.create({
      data: {
        name: 'Test Device Key',
        provider: 'OPENAI',
        environment: 'DEVELOPMENT',
        maskedValue: 'test_...1234',
        fullValue: 'test_key_12345',
        status: 'ACTIVE',
      },
    });
    testApiKeyId = apiKey.id;

    const device = await prisma.prisma.device.create({
      data: {
        name: 'Test Device',
        fingerprintHash: 'test-fingerprint-123',
        status: 'PENDING',
        platform: { os: 'macOS', version: '14.0' },
        ownerName: 'Test Owner',
        ownerEmail: 'owner@test.com',
        ipAddress: '192.168.1.1',
        location: 'Test Location',
        apiKeyId: testApiKeyId,
      },
    });
    testDeviceId = device.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.prisma.device.deleteMany({
      where: { name: { contains: 'Test' } },
    });
    await prisma.prisma.apiKey.deleteMany({
      where: { name: { contains: 'Test' } },
    });
    await prisma.prisma.user.deleteMany({
      where: { email: { contains: 'admin-devices' } },
    });
    await prisma.prisma.enrollmentCode.deleteMany({});
    await app.close();
  });

  describe('/api/v1/devices (GET)', () => {
    it('should list all devices with default pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/devices')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('devices');
      expect(response.body).toHaveProperty('stats');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.devices)).toBe(true);
      expect(response.body.stats).toHaveProperty('total');
      expect(response.body.stats).toHaveProperty('active');
      expect(response.body.stats).toHaveProperty('pending');
    });

    it('should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/devices?status=pending')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('devices');
      expect(response.body.devices.every((d: any) => d.status === 'pending')).toBe(true);
    });

    it('should filter by platform', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/devices?platform=macOS')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('devices');
    });

    it('should search by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/devices?search=Test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('devices');
    });

    it('should sort devices', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/devices?sort=name')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('devices');
    });

    it('should paginate correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/devices?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
      });
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/devices')
        .expect(401);
    });
  });

  describe('/api/v1/devices/enrollment-code (POST)', () => {
    it('should generate enrollment code successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/devices/enrollment-code')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('code');
      expect(response.body).toHaveProperty('expiresAt');
      expect(response.body.code).toMatch(/^KG-ENRL-[A-Z0-9]{4}$/);
      expect(new Date(response.body.expiresAt)).toBeInstanceOf(Date);

      // Verify expiration is ~15 minutes in future
      const expiresAt = new Date(response.body.expiresAt);
      const now = new Date();
      const diffMinutes = (expiresAt.getTime() - now.getTime()) / (1000 * 60);
      expect(diffMinutes).toBeGreaterThan(14);
      expect(diffMinutes).toBeLessThan(16);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/devices/enrollment-code')
        .expect(401);
    });
  });

  describe('/api/v1/devices/:id/approve (PATCH)', () => {
    it('should approve pending device successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/devices/${testDeviceId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Device approved successfully',
      });
      expect(response.body.device).toHaveProperty('status', 'active');
    });

    it('should fail to approve already active device', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/devices/${testDeviceId}/approve`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should fail with non-existent device ID', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/devices/00000000-0000-0000-0000-000000000000/approve')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/devices/${testDeviceId}/approve`)
        .expect(401);
    });
  });

  describe('/api/v1/devices/:id/suspend (PATCH)', () => {
    it('should suspend active device successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/devices/${testDeviceId}/suspend`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Device suspended successfully',
      });
      expect(response.body.device).toHaveProperty('status', 'suspended');
    });

    it('should fail to suspend non-active device', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/devices/${testDeviceId}/suspend`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should fail with non-existent device ID', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/devices/00000000-0000-0000-0000-000000000000/suspend')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .patch(`/api/v1/devices/${testDeviceId}/suspend`)
        .expect(401);
    });
  });

  describe('/api/v1/devices/:id (DELETE)', () => {
    it('should revoke device successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/devices/${testDeviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Device revoked successfully',
      });
      expect(response.body.device).toHaveProperty('status', 'revoked');
    });

    it('should fail with non-existent device ID', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/devices/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/devices/${testDeviceId}`)
        .expect(401);
    });
  });
});
