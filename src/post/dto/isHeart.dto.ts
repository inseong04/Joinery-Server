import { IsString } from "class-validator";

export class isHeartDto{
    @IsString()
    postId: string;
    @IsString()
    userId: string;
}