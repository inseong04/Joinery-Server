import { Schedule } from "./schedule.model";

export class DetailPost{
    region_id:number;
    authorId: string;
    memberId:string[];
    title:string;
    description:string;
    schedule:Schedule[];
    startDate:string;
    endDate:string;
    limitedHeart:number;
    heart:number;
    likedUserId:string[];
    tripStyle:string[];
}