import { IsString } from "class-validator";

export class Schedule {
    @IsString()
    title:String;
    @IsString()
    description:string;
    @IsString()
    date:string
}