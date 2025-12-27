import { Prisma } from '@/src/generated/client';
import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import dayjs from 'dayjs';
import { Hashing } from 'src/common/utils/hashing.util';
import { AuditLogsService } from '../../modules/audit-logs/audit-logs.service';
import { PrismaService } from '../database/prisma.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterResponseDto } from './dto/register-response.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly auditLogsService: AuditLogsService,
  ) { }
  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    // Find user by email
    const user = await this.prismaService.prisma.user.findUnique({
      where: { email: loginDto.email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        isActive: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }
    // Verify password
    const isPasswordValid = await Hashing.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Generate tokens
    const accessToken = await this.generateAccessToken(user.id, user.email);
    const refreshToken = await this.generateRefreshToken(user.id);
    // Update last login
    await this.prismaService.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: dayjs().toDate() },
    });

    // Log successful login
    try {
      await this.auditLogsService.createLog({
        event: 'auth.login',
        severity: 'info',
        status: 'success',
        actorId: user.id,
        actorName: user.name,
        actorType: 'user',
        actorIp: '0.0.0.0', // Will be updated by interceptor if available
        targetId: user.id,
        targetName: user.email,
        targetType: 'user',
        metadata: {
          role: user.role,
        },
        userId: user.id,
      });
    } catch (error) {
      this.logger.error(`Failed to create audit log for login: ${error}`);
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.toLowerCase() as 'admin' | 'user',
      },
    };
  }
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken);
      // Verify user still exists and is active
      const user = await this.prismaService.prisma.user.findUnique({
        where: { id: payload.id },
        select: { id: true, email: true, isActive: true },
      });
      if (!user?.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const accessToken = await this.generateAccessToken(user.id, user.email);
      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
  private async generateAccessToken(userId: string, email: string): Promise<string> {
    const payload = { id: userId, email };
    return this.jwtService.signAsync(payload, { expiresIn: '15m' });
  }
  private async generateRefreshToken(userId: string): Promise<string> {
    const payload = { id: userId };
    return this.jwtService.signAsync(payload, { expiresIn: '7d' });
  }
  async validateUser(userId: string) {
    const user = await this.prismaService.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
    if (!user?.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return user;
  }
  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    // Check if user with this email already exists
    const existingUser = await this.prismaService.prisma.user.findUnique({
      where: { email: registerDto.email },
    });
    if (existingUser) {
      throw new ConflictException('An account with this email already exists');
    }
    // Create organization slug from name
    const slug = registerDto.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    // Check if organization slug already exists
    const existingOrg = await this.prismaService.prisma.organization.findUnique({
      where: { slug },
    });
    if (existingOrg) {
      // If slug exists, append random string
      const randomSuffix = Math.random().toString(36).substring(2, 6);
      const uniqueSlug = `${slug}-${randomSuffix}`;
      return this.createOrganizationAndUser(
        registerDto,
        uniqueSlug,
      );
    }
    return await this.createOrganizationAndUser(registerDto, slug);
  }
  private async createOrganizationAndUser(
    registerDto: RegisterDto,
    slug: string,
  ): Promise<RegisterResponseDto> {
    // Hash password
    const hashedPassword = await Hashing.hash(registerDto.password);
    // Create organization and admin user in a transaction
    const result = await this.prismaService.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          name: registerDto.organizationName,
          slug,
        },
      });
      // Create admin user
      const user = await tx.user.create({
        data: {
          email: registerDto.email,
          name: registerDto.email.split('@')[0] ?? 'Admin', // Extract name from email
          password: hashedPassword,
          role: 'ADMIN',
          organizationId: organization.id,
        },
      });
      return { organization, user };
    });
    // Generate JWT token
    const token = await this.generateAccessToken(
      result.user.id,
      result.user.email,
    );

    // Log successful registration
    try {
      await this.auditLogsService.createLog({
        event: 'auth.register',
        severity: 'info',
        status: 'success',
        actorId: result.user.id,
        actorName: result.user.name,
        actorType: 'user',
        actorIp: '0.0.0.0', // Will be updated by interceptor if available
        targetId: result.organization.id,
        targetName: result.organization.name,
        targetType: 'organization',
        metadata: {
          email: result.user.email,
          organizationSlug: result.organization.slug,
        },
        userId: result.user.id,
      });
    } catch (error) {
      this.logger.error(`Failed to create audit log for registration: ${error}`);
    }

    // Return response
    return {
      success: true,
      user: {
        email: result.user.email,
        organizationName: result.organization.name,
        isAuthenticated: true,
      },
      token,
    };
  }
}
