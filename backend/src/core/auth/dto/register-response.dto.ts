import { ApiProperty } from '@nestjs/swagger';

export class RegisterUserDto {
  @ApiProperty({ description: 'User email address' })
  email: string;

  @ApiProperty({ description: 'Organization name' })
  organizationName: string;

  @ApiProperty({ description: 'Whether the user is authenticated' })
  isAuthenticated: boolean;
}

export class RegisterResponseDto {
  @ApiProperty({ description: 'Registration success status' })
  success: boolean;

  @ApiProperty({ type: RegisterUserDto, description: 'User information' })
  user: RegisterUserDto;

  @ApiProperty({ description: 'JWT access token' })
  token: string;
}
