import { ScheduleDto } from "src/post/presentation/dto/schedule.dto";
import { Region } from "src/constants/region-list.constant";

export interface PostArrayFields {
    memberId: string[];
    schedule: ScheduleDto[];
    likedUserId: string[];
    tripStyle: string[];
}

export interface UserArrayFields {
    wrotePost: string[];
    likePostId: string[];
    joinPostId:string[];
    interestRegion:Region[];
    bookmarkPostId:string[];    
}

export interface MongoPullOperation<T> {
    $pull: {
        [K in keyof T]?: T[K] extends Array<infer U> ? U : never;
    };
}

export interface MongoAddToSetOperation<T> {
    $addToSet: {
        [K in keyof T]?: T[K] extends Array<infer U> ? U : never;
    };
}

export interface MongoPushOperation<T> {
    $push: {
        [K in keyof T]?: T[K] extends Array<infer U> ? U : never;
    };
}