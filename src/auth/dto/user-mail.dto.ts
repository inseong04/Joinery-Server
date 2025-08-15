import { IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UserMailDto {
    @ApiProperty({
        description: '인증 코드를 받을 이메일 주소',
        example: 'user@example.com',
        type: 'string'
    })
    @IsEmail()
    email: string;
}