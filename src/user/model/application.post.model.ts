import { Region } from "src/constants/region-list.constant";

export class ApplicationPostModel {
    _id: string;
    region_id: Region;
    authorId: string[];
    memberId: string[];
    title:string;
    startDate: string;
    endDate: string;
    likedUserId: string[];
}