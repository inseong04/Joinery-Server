import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsDate, IsEnum, IsOptional, IsString } from "class-validator";
import { Gender } from "src/constants/user.constants";

export class SignUpDto {
            @ApiProperty({description:'아이디'})
            @IsString()
            username:string;
            
            @ApiProperty({description:'비밀번호'})
            @IsString()
            password:string;
            
            @ApiProperty({description:'닉네임'})
            @IsString()
            nickname:string;
        
            @ApiProperty({description:'성별. 0: 남자 1: 여자'})
            @IsEnum(Gender)
            gender:Gender
        
            @ApiProperty({description:'생년월일'})
            @IsString()
            birthDate:string;
    
            @ApiProperty({description:'여행 스타일. string[]'})
            @IsArray()
            @IsString({each:true})
            tripStyle:string[];
    
            @ApiProperty({description:'자기 소개'})
            @IsString()
            userDescription:string;

            @ApiProperty({description:'작성한 게시글 목록'})
            @IsOptional()
            wrotePost:string[];

            @ApiProperty({description:'하트 누른 게시글 목록'})
            @IsOptional()
            likePostId:string[];
}