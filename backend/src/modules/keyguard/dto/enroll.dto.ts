import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  Length,
} from 'class-validator';

export class EnrollDeviceDto {
  @IsString()
  @IsNotEmpty()
  publicKey: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  keyId: string;

  @IsString()
  @IsNotEmpty()
  deviceFingerprint: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  label: string;

  @IsString()
  @IsOptional()
  enrollmentCode?: string;

  @IsString()
  @IsOptional()
  userAgent?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class EnrollResponseDto {
  id: string;

  status: string;

  createdAt: Date;
}
