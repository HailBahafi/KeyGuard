import {
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import dayjs from 'dayjs';
import { Hashing } from 'src/common/utils/hashing.util';
import { PrismaService } from '../database/prisma.service';
import { LoginResponseDto } from './dto/login-response.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
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
}
