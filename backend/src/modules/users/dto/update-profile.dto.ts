import {
  IsEmail,
  IsOptional,
  IsString,
  IsStrongPassword,
  ValidateIf,
} from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  name: string;

  @ValidateIf(o => o.newPassword)
  @IsOptional()
  @IsString()
  oldPassword: string;

  @ValidateIf(o => o.oldPassword)
  @IsOptional()
  @IsStrongPassword()
  @IsString()
  newPassword: string;

  @IsOptional()
  @IsString()
  avatar: string;
}
