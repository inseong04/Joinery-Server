import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class FindRegionDto {
    @ApiProperty({
        description:'시작일',
        required: false,
        example: '2024-01-01'
    })
    @IsOptional()
    @IsString()
    startDate:string;
    
    @ApiProperty({
        description:'마지막일',
        required: false,
        example: '2024-01-03'
    })
    @IsOptional()
    @IsString()
    endDate:string;
}