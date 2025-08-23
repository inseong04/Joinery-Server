import { ApiProperty, PickType } from '@nestjs/swagger';
import { Author } from '../interfaces/author.model';

export class PreviewPostDto{
    @ApiProperty({ description: '게시글 ID', type: String })
    _id: string;

    @ApiProperty({ description: '게시글 제목' })
    title: string;

    @ApiProperty({ description: '작성자 정보' })
    author: Author;

    @ApiProperty({ description: '시작 날짜' })
    startDate: string;

    @ApiProperty({ description: '종료 날짜' })
    endDate: string;

    @ApiProperty({ description: '하트 수' })
    currentPerson: number;

    @ApiProperty({ description: '제한 하트 수' })
    maxPerson: number;
}