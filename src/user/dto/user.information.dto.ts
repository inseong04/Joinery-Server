import { Gender } from "src/constants/user.constants";

export class UserInformationDto {
    _id:string;
    username:string;
    nickname:string;
    gender:Gender;
    birthDate:string;
    tripStyle:string[];
    userDescription:string[];
    createdAt:string;
    updatedAt:string;
    wrotePost:string[];
}