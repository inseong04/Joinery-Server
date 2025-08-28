import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Gender } from "src/constants/user.constants";
import { Region } from "src/constants/region-list.constant";
import { Matches } from "class-validator";

@Schema({timestamps: true})
export class User {

        @ApiProperty({description:'사용자 ID'})
        _id: string;

        @ApiProperty({description:'공급처 구분. local / google'})
        @Prop({ required:true, enum: ['local', 'google'], default: 'local'})
        provider:string;

        @ApiProperty({description:'아이디'})
        @Prop({required:true, unique:true})
        username:string;
        
        @ApiProperty({description:'비밀번호'})
        @Matches(
                /^(?:(?=.*[a-z])(?=.*[A-Z])|(?=.*[a-z])(?=.*\d)|(?=.*[a-z])(?=.*[^a-zA-Z0-9])|(?=.*[A-Z])(?=.*\d)|(?=.*[A-Z])(?=.*[^a-zA-Z0-9])|(?=.*\d)(?=.*[^a-zA-Z0-9])).{8,}$/,{
                  message: '비밀번호는 8자 이상이며, 대문자/소문자/숫자/특수문자 중 최소 2개 이상을 포함해야 합니다.',},)
        @Prop({select: false})
        password:string;

        @ApiProperty({description:'이메일'})
        @Prop({required:true, unique:true})
        email:string;
        
        @ApiProperty({description:'닉네임'})
        @Prop()
        nickname:string;
    
        @ApiProperty({description:'성별. 0: 남자 1: 여자 2: 미지정'})
        @Prop({ enum:[0, 1, 2]})
        gender:Gender
    
        @ApiProperty({description:'생년월일'})
        @Prop()
        birthDate:Date;

        @ApiProperty({description:'여행 스타일. string[]'})
        @Prop({type:[String]})
        tripStyle:string[];

        @ApiProperty({description:'자기 소개'})
        @Prop()
        userDescription:string;

        @ApiProperty({description:'작성한 게시글 목록'})
        @Prop({type:[String]})
        wrotePost:string[];

        @ApiProperty({description:'하트 누른 게시글 목록'})
        @Prop({type:[String]})
        likePostId:string[];

        @ApiProperty({description:'신청완료된 게시글 목록'})
        @Prop({type:[String]})
        joinPostId:string[];

        @ApiProperty({description:'관심지역 목록'})
        @Prop({type:[Number], enum: Object.values(Region)})
        interestRegion:Region[];

        @ApiProperty({description:'프로필 이미지 경로'})
        @Prop()
        profileImageUrl:string;

        @ApiProperty({description:'북마크'})
        @Prop()
        bookmarkPostId:string[];
        
}
export const UserSchema = SchemaFactory.createForClass(User);