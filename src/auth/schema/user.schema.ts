import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Gender } from "src/constants/user.constants";
import { Region } from "src/constants/region-list.constant";

@Schema({timestamps: true})
export class User {

        @ApiProperty({description:'공급처 구분. local / google'})
        @Prop({ required:true, enum: ['local', 'google'], default: 'local'})
        provider:string;

        @ApiProperty({description:'아이디'})
        @Prop({required:true, unique:true})
        username:string;
        
        @ApiProperty({description:'비밀번호'})
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