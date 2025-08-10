import { ApiHideProperty, ApiProperty } from "@nestjs/swagger";
import { IsArray, IsEnum, IsOptional, IsString } from "class-validator";
import { Region } from "src/constants/region-list.constant";
import { Gender } from "src/constants/user.constants";

export class GoogleSignUpDto {
    username:string;
    password:string;
    nickname:string;
    gender:Gender
    birthDate:Date;
    tripStyle:string[];
    userDescription:string;
    wrotePost:string[];
    likePostId:string[];
    joinPostId:string[];
    interestRegion:Region[];
    profileImageUrl:string;
}  