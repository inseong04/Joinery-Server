import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Verification } from 'src/auth/schema/verification.schema';

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
}
