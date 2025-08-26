import { ScheduleDto } from "src/post/presentation/dto/schedule.dto";

export interface PostInformation {
    _id:string;
    region_id:number;
    authorId: string;
    memberId:string[];
    title:string;
    description:string;
    schedule:ScheduleDto[];
    startDate:Date;
    endDate:Date;
    maxPerson:number;
    currentPerson:number;
    likedUserId:string[]; 
    tripStyle:string[]; 
}