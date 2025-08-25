import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { ScheduleDto } from "./schedule.dto";
import { Transform, Type } from "class-transformer";

export class PostCreateDto{
        @ApiProperty({description:'지역 id입니다. 경기도 0 강원도 1 충청북도 2 충청남도 3 경상북도 4 경상남도 5 전라북도 6 전라남도 7 제주도 8 광주광역시 9 대구광역시 10 대전광역시 11 부신광역시 12 울산광역시 13 서울특별시 14'})
        @IsNumber()
        region_id:number;

        @ApiProperty({description:'포스트 제목'})
        @IsString()
        title:string;
    
        @ApiProperty({description:'포스트 설명'})
        @IsString()
        description:string;
    
        @ApiProperty({description:'스케줄 list'})
        @ValidateNested({each: true})
        @Type(()=> ScheduleDto)
        schedule:ScheduleDto[];
    
        @ApiProperty({description: '시작하는 스케줄 날짜. 2025-01-21 와 같이 format'})
        @IsString()
        startDate:string;
    
        @ApiProperty({description: '마지막 스케줄 날짜. 2025-01-21 와 같이 format'})
        @IsString()
        endDate:string;
    
        @ApiProperty({description: '하트(찜) 한계 수 - 모집인원이라고 볼수있음.'})
        @IsNumber()
        maxPerson:number;
    
        @ApiProperty({description:'하트(찜) 수'})
        @IsOptional()
        @IsNumber()
        currentPerson:number;
        
        @ApiProperty({description:'하트누른 사람 id 담는 배열'})
        @IsOptional()
        @IsArray()
        @IsString({each:true})
        @Transform(({ value }) => (Array.isArray(value) ? value : []))
        likedUserId:string[];
    
        @ApiProperty({description:'여행스타일. Max 3개'})
        @IsArray()
        @IsString({each:true})
        tripStyle:string[];
        
}