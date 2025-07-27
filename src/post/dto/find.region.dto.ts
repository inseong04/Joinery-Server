import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class FindRegionDto {
    @ApiProperty({description:'시작일'})
    @IsOptional()
    @IsString()
    startDate:string;
    @ApiProperty({description:'마지막일'})
    @IsOptional()
    @IsString()
    endDate:string;
}