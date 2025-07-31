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

    async updateInterestRegion(id: string, interestRegionList: Region[]){
        return await this.verificationModel.findByIdAndUpdate(id, {$addToSet:{ interestRegion: { $each: interestRegionList}}});
    }

    async deleteInterestRegion(id: string, deleteInterestRegion: Region){
        return await this.verificationModel.updateOne({_id:id}, {$pull:{interestRegion: deleteInterestRegion}});   
    }
}
