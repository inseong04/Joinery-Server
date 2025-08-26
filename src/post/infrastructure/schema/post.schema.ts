import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { ApiProperty } from "@nestjs/swagger";
import { ScheduleDto } from "../../presentation/dto/schedule.dto";

@Schema({timestamps:true})
export class PostSchema {

    _id:string;
    @ApiProperty({description:'지역 id입니다. 경기도 0 강원도 1 충청북도 2 충청남도 3 경상북도 4 경상남도 5 전라북도 6 전라남도 7 제주도 8 광주광역시 9 대구광역시 10 대전광역시 11 부신광역시 12 울산광역시 13 서울특별시 14'})
    @Prop({required:true})
    region_id:number;

    @ApiProperty({description:'팀장(글쓴이) id'})
    @Prop({required:true})
    authorId: string;

    @ApiProperty({description:'팀원 id. 팀원이 없다면 null 임'})
    @Prop({type:[String]})
    memberId:string[];
    
    @ApiProperty({description:'포스트 제목'})
    @Prop()
    title:string;

    @ApiProperty({description:'포스트 설명'})
    @Prop()
    description:string;

    @ApiProperty({description:'스케줄 list'})
    @Prop({type:[ScheduleDto]})
    schedule:ScheduleDto[];

    @ApiProperty({description: '시작하는 스케줄 날짜. 2025-01-21 와 같이 format'})
    @Prop()
    startDate:Date;

    @ApiProperty({description: '마지막 스케줄 날짜. 2025-01-21 와 같이 format'})
    @Prop()
    endDate:Date;

    @ApiProperty({description: '하트(찜) 한계 수 - 모집인원이라고 볼수있음.'})
    @Prop()
    maxPerson:number;

    @ApiProperty({description:'하트(찜) 수'})
    @Prop()
    currentPerson:number;
    
    @ApiProperty({description:'하트누른 사람 id 담는 배열'})
    @Prop({type:[String]})
    likedUserId:string[];

    @ApiProperty({description:'여행스타일. Max 3개'})
    @Prop({type:[String]})
    tripStyle:string[];
    
}

export const newPostSchema = SchemaFactory.createForClass(PostSchema);