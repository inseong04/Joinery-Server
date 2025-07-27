import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { Gender } from "src/constants/user.constants";

@Schema({timestamps: true})
export class Verification {
        @ApiProperty({description:'아이디'})
        @Prop({required:true, unique:true})
        username:string;
        
        @ApiProperty({description:'비밀번호'})
        @Prop({required:true, select: false})
        password:string;
        
        @ApiProperty({description:'닉네임'})
        @Prop()
        nickname:string;
    
        @ApiProperty({description:'성별. 0: 남자 1: 여자'})
        @Prop({ enum:[0, 1]})
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
}
export const VerificationSchema = SchemaFactory.createForClass(Verification);