import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class SignInDto {
        @ApiProperty({description:'아이디'})
        @IsString()
        username:string;
                
        @ApiProperty({description:'비밀번호'})
        @IsString()
        password:string;
}