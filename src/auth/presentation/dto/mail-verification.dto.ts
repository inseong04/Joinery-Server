import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class MailVerificationDto {
    @ApiProperty({
        description: '인증 코드를 받은 이메일 주소',
        example: 'user@example.com',
        type: 'string'
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: '이메일로 받은 6자리 인증 코드',
        example: '123456',
        type: 'string',
        minLength: 6,
        maxLength: 6
    })
    @IsString()
    @Length(6, 6)
    verificationCode: string;
}