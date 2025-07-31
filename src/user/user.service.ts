import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Verification } from 'src/auth/schema/verification.schema';
import { Region } from 'src/constants/region-list.constant';
import { UserUpdateDto } from './dto/user.update.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel('User') private verificationModel:Model<Verification>
    ){}

    async getUser(id:string){
        const user = await this.verificationModel.findById(new mongoose.Types.ObjectId(id));
        if (!user) return null;
        return user;
    }

    async updateUser(id:string, userUpdateDto: UserUpdateDto){
        const cleanData = Object.fromEntries(
            Object.entries(userUpdateDto).filter(([_, v]) => v !== undefined)
        );
        return await this.verificationModel.findByIdAndUpdate(
            id,
            {$set: cleanData},
            {new: true}
        );
    }

    async getUserWrotePost(id: string){
        return await this.verificationModel.findById(id).select('wrotePost');
    }

    async updateInterestRegion(id: string, interestRegionList: number[]){
        // 숫자 배열을 Region enum으로 변환
        const regionList = interestRegionList.map(regionId => Region[regionId]);
        return await this.verificationModel.findByIdAndUpdate(id, {$addToSet:{ interestRegion: { $each: regionList}}});
    }

    async deleteInterestRegion(id: string, deleteInterestRegion: number){
        // 숫자를 Region enum으로 변환
        const regionToDelete = Region[deleteInterestRegion];
        return await this.verificationModel.updateOne({_id:id}, {$pull:{interestRegion: regionToDelete}});   
    }
}
