import { IsDate, IsOptional, IsString } from "class-validator";

export class CreateEnrollmentCodeDto {
    @IsString()
    @IsOptional()
    description: string;

    @IsDate()
    @IsOptional()
    expiresAt?: Date;
}
