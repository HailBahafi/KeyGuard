import { IsBoolean, IsString, IsOptional } from 'class-validator';

export class VerifyResponseDto {
  @IsBoolean()
  valid: boolean;

  @IsString()
  @IsOptional()
  deviceId?: string;

  @IsString()
  @IsOptional()
  keyId?: string;

  @IsString()
  @IsOptional()
  error?: string;
}

export class KeyGuardHeaders {
  keyId: string;
  timestamp: string;
  nonce: string;
  bodySha256: string;
  algorithm: string;
  signature: string;
}
