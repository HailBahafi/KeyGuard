import { IsString, IsEnum, IsOptional, Length, IsISO8601 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKeyDto {
  @ApiProperty({
    description: 'API key name (3-50 characters)',
    example: 'Production OpenAI Key',
    minLength: 3,
    maxLength: 50,
  })
  @IsString()
  @Length(3, 50, { message: 'Name must be between 3 and 50 characters' })
  name: string;

  @ApiProperty({
    description: 'Provider type',
    enum: ['openai', 'anthropic', 'google', 'azure'],
    example: 'openai',
  })
  @IsEnum(['openai', 'anthropic', 'google', 'azure'], {
    message: 'Provider must be one of: openai, anthropic, google, azure',
  })
  provider: 'openai' | 'anthropic' | 'google' | 'azure';

  @ApiProperty({
    description: 'Environment type',
    enum: ['production', 'development', 'staging'],
    example: 'production',
  })
  @IsEnum(['production', 'development', 'staging'], {
    message: 'Environment must be one of: production, development, staging',
  })
  environment: 'production' | 'development' | 'staging';

  @ApiProperty({
    description: 'Expiration date (ISO 8601)',
    example: '2025-12-31T23:59:59.000Z',
    required: false,
  })
  @IsOptional()
  @IsISO8601({}, { message: 'expiresAt must be a valid ISO 8601 date' })
  expiresAt?: string;

  @ApiProperty({
    description: 'Optional description',
    example: 'Key for production OpenAI API calls',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;
}
