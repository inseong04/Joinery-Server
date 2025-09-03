import { ApiProperty } from '@nestjs/swagger';
import { HeartType } from "src/constants/user.constants";
import { ScheduleDto } from "./schedule.dto";

export class DetailPostDto {
    @ApiProperty({ description: '게시글 ID', type: String })
    _id: string;

    @ApiProperty({ description: '게시글 제목' })
    title: string;

    @ApiProperty({ description: '작성자 닉네임' })
    authorName: string;

    @ApiProperty({ description: '멤버 닉네임 목록', type: [String] })
    membersName: string[];

    @ApiProperty({ description: '시작 날짜', type: String })
    startDate: string;

    @ApiProperty({ description: '종료 날짜', type: String })
    endDate: string;

    @ApiProperty({ description: '하트 타입', enum: ['NoOne', 'UserOnly', 'Both'] })
    heartType: string;

    @ApiProperty({ description: 'bookmark 여부. 0은 북마크X 1은 북마크O'})
    isBookmark: boolean;

    region_id:number;
    authorId: string;
    memberId:string[];
    description:string;
    schedule:ScheduleDto[];
    MaxPerson:number;
    currentPerson:number;
    likedUserId:string[];
    tripStyle:string[];
}