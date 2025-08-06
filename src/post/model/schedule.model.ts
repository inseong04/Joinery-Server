import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class Schedule {
    @ApiProperty({
        description: '일정 제목',
        example: '첫째 날 - 제주도 도착'
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: '일정 설명',
        example: '제주도 공항에서 만나서 호텔 체크인 후 저녁 식사'
    })
    @IsString()
    description: string;

    @ApiProperty({
        description: '일정 날짜 (YYYY-MM-DD 형식)',
        example: '2025-01-21'
    })
    @IsString()
    date: string;
}