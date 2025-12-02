import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/database/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('API Keys (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let authToken: string;
  let createdKeyId: string;

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
        email: 'admin-keys@keyguard.io',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin-keys@keyguard.io',
        password: 'Admin123!@#',
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.prisma.apiKey.deleteMany({
      where: { name: { contains: 'Test' } },
    });
    await prisma.prisma.user.deleteMany({
      where: { email: { contains: 'admin-keys' } },
    });
    await app.close();
  });

  describe('/api/v1/keys (GET)', () => {
    it('should list all API keys with default pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/keys')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('keys');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.keys)).toBe(true);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 20,
      });
    });

    it('should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/keys?status=active')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('keys');
      expect(Array.isArray(response.body.keys)).toBe(true);
    });

    it('should filter by provider', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/keys?provider=openai')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('keys');
    });

    it('should filter by environment', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/keys?environment=production')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('keys');
    });

    it('should search by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/keys?search=test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('keys');
    });

    it('should paginate correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/keys?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
      });
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/keys')
        .expect(401);
    });
  });

  describe('/api/v1/keys (POST)', () => {
    it('should create API key successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/keys')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test OpenAI Key',
          provider: 'openai',
          environment: 'development',
          description: 'Test key for development',
        })
        .expect(201);

      expect(response.body).toHaveProperty('key');
      expect(response.body.key).toMatchObject({
        name: 'Test OpenAI Key',
        provider: 'openai',
        environment: 'development',
        status: 'active',
      });
      expect(response.body.key).toHaveProperty('id');
      expect(response.body.key).toHaveProperty('maskedValue');

      createdKeyId = response.body.key.id;
    });

    it('should create API key with expiration date', async () => {
      const futureDate = new Date();
      futureDate.setMonth(futureDate.getMonth() + 1);

      const response = await request(app.getHttpServer())
        .post('/api/v1/keys')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Expiring Key',
          provider: 'anthropic',
          environment: 'production',
          expiresAt: futureDate.toISOString(),
        })
        .expect(201);

      expect(response.body.key).toHaveProperty('expiresAt');
      expect(new Date(response.body.key.expiresAt)).toBeInstanceOf(Date);
    });

    it('should fail with duplicate name', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/keys')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test OpenAI Key',
          provider: 'openai',
          environment: 'development',
        })
        .expect(409);
    });

    it('should fail with invalid provider', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/keys')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Invalid Provider',
          provider: 'invalid-provider',
          environment: 'development',
        })
        .expect(400);
    });

    it('should fail with invalid environment', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/keys')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Invalid Environment',
          provider: 'openai',
          environment: 'invalid-env',
        })
        .expect(400);
    });

    it('should fail with name too short', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/keys')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'AB',
          provider: 'openai',
          environment: 'development',
        })
        .expect(400);
    });

    it('should fail with past expiration date', async () => {
      const pastDate = new Date();
      pastDate.setMonth(pastDate.getMonth() - 1);

      await request(app.getHttpServer())
        .post('/api/v1/keys')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Past Expiry',
          provider: 'openai',
          environment: 'development',
          expiresAt: pastDate.toISOString(),
        })
        .expect(400);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/keys')
        .send({
          name: 'Test Key',
          provider: 'openai',
          environment: 'development',
        })
        .expect(401);
    });
  });

  describe('/api/v1/keys/:id (DELETE)', () => {
    it('should revoke API key successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/keys/${createdKeyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'API key revoked successfully',
      });
    });

    it('should fail to revoke already revoked key', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/keys/${createdKeyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should fail with non-existent key ID', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/keys/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should fail with invalid UUID', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/keys/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/keys/${createdKeyId}`)
        .expect(401);
    });
  });
});
