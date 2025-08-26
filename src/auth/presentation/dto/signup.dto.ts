import { ApiProperty, ApiHideProperty } from "@nestjs/swagger";
import { IsArray, IsDate, IsEmail, IsEnum, IsOptional, IsString } from "class-validator";
import { Gender } from "src/constants/user.constants";
import { Region } from "src/constants/region-list.constant";

export class SignUpDto {

            @ApiProperty({description:'공급처 구분. local / google'})
            @IsEnum(['local', 'google'])
            @IsOptional()
            provider:string;

            @ApiProperty({description:'아이디'})
            @IsString()
            username:string;
            
            @ApiProperty({description:'비밀번호'})
            @IsString()
            password:string;

            @ApiProperty({description:'이메일'})
            @IsEmail()
            email:string;
            
            @ApiProperty({description:'닉네임'})
            @IsString()
            nickname:string;
        
            @ApiProperty({description:'성별. 0: 남자 1: 여자'})
            @IsEnum(Gender)
            gender:Gender;
        
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

            @ApiHideProperty()
            @IsOptional()
            wrotePost:string[];

            @ApiHideProperty()
            @IsOptional()
            likePostId:string[];

            @ApiHideProperty()
            @IsOptional()
            joinPostId:string[];

            @ApiHideProperty()
            @IsOptional()
            interestRegion:Region[];

            @ApiHideProperty()
            @IsOptional()
            profileImageUrl:string;

            @ApiHideProperty()
            @IsOptional()
            bookmarkPostId:string[];

}