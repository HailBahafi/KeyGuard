import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/core/database/prisma.service';
import * as bcrypt from 'bcryptjs';

describe('Audit Logs (e2e)', () => {
  let app: NestFastifyApplication;
  let prisma: PrismaService;
  let authToken: string;

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
    const user = await prisma.prisma.user.create({
      data: {
        email: 'admin-logs@keyguard.io',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({
        email: 'admin-logs@keyguard.io',
        password: 'Admin123!@#',
      });

    authToken = loginResponse.body.accessToken;

    // Create test audit logs
    await prisma.prisma.auditLog.createMany({
      data: [
        {
          event: 'auth.login',
          severity: 'INFO',
          status: 'SUCCESS',
          actorId: user.id,
          actorName: 'Admin User',
          actorType: 'USER',
          actorIp: '192.168.1.1',
          actorLocation: 'Test Location',
          targetId: user.id,
          targetName: 'User Login',
          targetType: 'user',
          userId: user.id,
        },
        {
          event: 'key.created',
          severity: 'INFO',
          status: 'SUCCESS',
          actorId: user.id,
          actorName: 'Admin User',
          actorType: 'USER',
          actorIp: '192.168.1.1',
          targetName: 'API Key',
          targetType: 'key',
        },
        {
          event: 'auth.failed',
          severity: 'WARNING',
          status: 'FAILURE',
          actorId: 'unknown',
          actorName: 'Unknown User',
          actorType: 'USER',
          actorIp: '192.168.1.100',
          targetName: 'Login Attempt',
        },
      ],
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.prisma.auditLog.deleteMany({});
    await prisma.prisma.user.deleteMany({
      where: { email: { contains: 'admin-logs' } },
    });
    await app.close();
  });

  describe('/api/v1/audit/logs (GET)', () => {
    it('should list all audit logs with default pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/audit/logs')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.logs)).toBe(true);
      expect(response.body.logs.length).toBeGreaterThan(0);
      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 50,
      });
    });

    it('should filter by event type', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/audit/logs?eventType=auth')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(Array.isArray(response.body.logs)).toBe(true);
      response.body.logs.forEach((log: any) => {
        expect(log.event).toMatch(/^auth\./);
      });
    });

    it('should filter by status', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/audit/logs?status=success')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      response.body.logs.forEach((log: any) => {
        expect(log.status).toBe('success');
      });
    });

    it('should filter by severity', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/audit/logs?severity=warning')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      response.body.logs.forEach((log: any) => {
        expect(log.severity).toBe('warning');
      });
    });

    it('should filter by date range', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/audit/logs?dateRange=day')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('logs');
      expect(Array.isArray(response.body.logs)).toBe(true);
    });

    it('should search in logs', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/audit/logs?search=Admin')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('logs');
    });

    it('should paginate correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/audit/logs?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toMatchObject({
        page: 1,
        limit: 10,
      });
    });

    it('should respect max limit of 200', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/audit/logs?limit=300')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);
    });

    it('should filter by custom date range', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      const endDate = new Date();

      const response = await request(app.getHttpServer())
        .get(`/api/v1/audit/logs?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('logs');
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/audit/logs')
        .expect(401);
    });
  });

  describe('/api/v1/audit/logs/export (POST)', () => {
    it('should export logs as CSV successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/audit/logs/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'csv',
        })
        .expect(200);

      expect(response.body).toHaveProperty('url');
      expect(response.body).toHaveProperty('filename');
      expect(response.body.filename).toMatch(/\.csv$/);
    });

    it('should export logs as JSON successfully', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/audit/logs/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'json',
        })
        .expect(200);

      expect(response.body).toHaveProperty('url');
      expect(response.body).toHaveProperty('filename');
      expect(response.body.filename).toMatch(/\.json$/);
    });

    it('should export with filters', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/audit/logs/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'csv',
          filters: {
            eventType: 'auth',
            severity: 'warning',
          },
        })
        .expect(200);

      expect(response.body).toHaveProperty('url');
      expect(response.body).toHaveProperty('filename');
    });

    it('should fail with invalid format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/audit/logs/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          format: 'xml',
        })
        .expect(400);
    });

    it('should fail without format', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/audit/logs/export')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/audit/logs/export')
        .send({
          format: 'csv',
        })
        .expect(401);
    });
  });
});
