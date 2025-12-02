import { ApiProperty } from '@nestjs/swagger';

export class RegisterErrorDto {
  @ApiProperty({ description: 'Error status', example: false })
  success: boolean;

  @ApiProperty({ description: 'Error code', example: 'EMAIL_ALREADY_EXISTS' })
  error: string;

  @ApiProperty({ description: 'Error message', example: 'An account with this email already exists' })
  message: string;

  @ApiProperty({ description: 'Validation error details', required: false })
  details?: Record<string, string>;
}
