import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/database/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('Settings (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let authToken: string;
  let createdApiKeyId: string;

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
        email: 'admin-settings@keyguard.io',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin-settings@keyguard.io',
        password: 'Admin123!@#',
      });

    authToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.prisma.adminApiKey.deleteMany({});
    await prisma.prisma.settings.deleteMany({
      where: { key: { in: ['general', 'security', 'notifications'] } },
    });
    await prisma.prisma.user.deleteMany({
      where: { email: { contains: 'admin-settings' } },
    });
    await app.close();
  });

  describe('/api/v1/settings (GET)', () => {
    it('should get all settings successfully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('general');
      expect(response.body).toHaveProperty('security');
      expect(response.body).toHaveProperty('notifications');
      expect(response.body).toHaveProperty('api');
      expect(response.body).toHaveProperty('backup');
    });

    it('should have default values for general settings', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/settings')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.general).toMatchObject({
        instanceName: expect.any(String),
        adminEmail: expect.any(String),
        timezone: expect.any(String),
        baseUrl: expect.any(String),
      });
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/settings')
        .expect(401);
    });
  });

  describe('/api/v1/settings/general (PATCH)', () => {
    it('should update general settings successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/settings/general')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          instanceName: 'Test KeyGuard Instance',
          adminEmail: 'admin@test-keyguard.io',
          timezone: 'America/New_York',
          baseUrl: 'https://test.keyguard.io',
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
      });
      expect(response.body.data).toMatchObject({
        instanceName: 'Test KeyGuard Instance',
        adminEmail: 'admin@test-keyguard.io',
        timezone: 'America/New_York',
      });
    });

    it('should fail with invalid email', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/settings/general')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          instanceName: 'Test',
          adminEmail: 'invalid-email',
          timezone: 'UTC',
          baseUrl: '',
        })
        .expect(400);
    });

    it('should fail with too short instance name', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/settings/general')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          instanceName: 'AB',
          adminEmail: 'admin@test.io',
          timezone: 'UTC',
          baseUrl: '',
        })
        .expect(400);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/settings/general')
        .send({
          instanceName: 'Test',
          adminEmail: 'admin@test.io',
          timezone: 'UTC',
          baseUrl: '',
        })
        .expect(401);
    });
  });

  describe('/api/v1/settings/security (PATCH)', () => {
    it('should update security settings successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/settings/security')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionTimeoutSeconds: 7200,
          enforce2FA: true,
          ipWhitelist: ['192.168.1.0/24', '10.0.0.1'],
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
      });
      expect(response.body.data).toMatchObject({
        sessionTimeoutSeconds: 7200,
        enforce2FA: true,
      });
      expect(response.body.data.ipWhitelist).toHaveLength(2);
    });

    it('should accept empty IP whitelist', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/settings/security')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionTimeoutSeconds: 3600,
          enforce2FA: false,
          ipWhitelist: [],
        })
        .expect(200);

      expect(response.body.data.ipWhitelist).toEqual([]);
    });

    it('should fail with timeout below minimum', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/settings/security')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionTimeoutSeconds: 100,
          enforce2FA: false,
          ipWhitelist: [],
        })
        .expect(400);
    });

    it('should fail with timeout above maximum', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/settings/security')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionTimeoutSeconds: 3000000,
          enforce2FA: false,
          ipWhitelist: [],
        })
        .expect(400);
    });

    it('should fail with invalid IP format', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/settings/security')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          sessionTimeoutSeconds: 3600,
          enforce2FA: false,
          ipWhitelist: ['invalid-ip'],
        })
        .expect(400);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/settings/security')
        .send({
          sessionTimeoutSeconds: 3600,
          enforce2FA: false,
          ipWhitelist: [],
        })
        .expect(401);
    });
  });

  describe('/api/v1/settings/notifications (PATCH)', () => {
    it('should update notification settings successfully', async () => {
      const response = await request(app.getHttpServer())
        .patch('/api/v1/settings/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          smtpHost: 'smtp.test.com',
          smtpPort: 587,
          smtpUsername: 'test@test.com',
          smtpPassword: 'password123',
          emailAlerts: true,
        })
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
      });
      expect(response.body.data).toMatchObject({
        smtpHost: 'smtp.test.com',
        smtpPort: 587,
        emailAlerts: true,
      });
    });

    it('should fail with invalid port number', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/settings/notifications')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          smtpHost: 'smtp.test.com',
          smtpPort: 70000,
          smtpUsername: 'test@test.com',
          smtpPassword: 'password123',
          emailAlerts: true,
        })
        .expect(400);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .patch('/api/v1/settings/notifications')
        .send({
          smtpHost: 'smtp.test.com',
          smtpPort: 587,
          smtpUsername: 'test@test.com',
          smtpPassword: 'password123',
          emailAlerts: true,
        })
        .expect(401);
    });
  });

  describe('/api/v1/settings/notifications/test (POST)', () => {
    it('should test SMTP connection successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/settings/notifications/test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: expect.any(String),
      });
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/settings/notifications/test')
        .expect(401);
    });
  });

  describe('/api/v1/settings/api-keys (POST)', () => {
    it('should generate admin API key successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/settings/api-keys')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Admin Key',
          scope: ['read', 'write'],
        })
        .expect(201);

      expect(response.body).toHaveProperty('key');
      expect(response.body).toHaveProperty('rawKey');
      expect(response.body.key).toMatchObject({
        name: 'Test Admin Key',
        scope: ['read', 'write'],
      });
      expect(response.body.rawKey).toMatch(/^kg_\d+_/);

      createdApiKeyId = response.body.key.id;
    });

    it('should fail with name too short', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/settings/api-keys')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'AB',
          scope: ['read'],
        })
        .expect(400);
    });

    it('should fail without scope', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/settings/api-keys')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Key',
          scope: [],
        })
        .expect(400);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/settings/api-keys')
        .send({
          name: 'Test Key',
          scope: ['read'],
        })
        .expect(401);
    });
  });

  describe('/api/v1/settings/api-keys/:id (DELETE)', () => {
    it('should revoke admin API key successfully', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/api/v1/settings/api-keys/${createdApiKeyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'API key revoked successfully',
      });
    });

    it('should fail with non-existent key ID', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/settings/api-keys/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/settings/api-keys/${createdApiKeyId}`)
        .expect(401);
    });
  });

  describe('/api/v1/settings/backup/download (POST)', () => {
    it('should download backup successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/settings/backup/download')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('url');
      expect(response.body).toHaveProperty('filename');
      expect(response.body.filename).toMatch(/^keyguard-backup-.*\.zip$/);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/settings/backup/download')
        .expect(401);
    });
  });
});
