import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Organization name',
    example: 'Acme Corporation',
    minLength: 3,
  })
  @IsString()
  @MinLength(3, { message: 'Organization name must be at least 3 characters' })
  organizationName: string;

  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@acme.com',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({
    description: 'Admin password (minimum 8 characters)',
    example: 'SecurePassword123!',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
