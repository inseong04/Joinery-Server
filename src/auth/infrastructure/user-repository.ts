import { Injectable } from "@nestjs/common";
import { UserRepository } from "../application/interfaces/user-repository.interface";
import { Model } from "mongoose";
import { User } from "./schema/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { SignUpDto } from "../presentation/dto/signup.dto";
import { MongoPullOperation, UserArrayFields, MongoAddToSetOperation, MongoPushOperation } from "src/post/application/interfaces/mongo-operators.interface";

@Injectable()
export class MongoUserRepository implements UserRepository {
    constructor(
        @InjectModel('User') private readonly userModel:Model<User>,   
    ){}
    async updateToPullFromArray(id: string, pullData: MongoPullOperation<UserArrayFields>): Promise<User | null> {
        return await this.userModel.findByIdAndUpdate(id, pullData);
    }
    async updateToAddToArray(id: string, addData: MongoAddToSetOperation<UserArrayFields>): Promise<User | null> {
        return await this.userModel.findByIdAndUpdate(id, addData);
    }
    updateToPushToArray(id: string, pushData: MongoPushOperation<UserArrayFields>): Promise<User | null> {
        throw new Error("Method not implemented.");
    }

    async findById(id: string): Promise<User | null> {
        return await this.userModel.findById(id);
    }

    async findByUsername(username:string): Promise<User | null>{
        return await this.userModel.findOne({ username: username });
    }

    async findByUsernameWithPassword(username:string): Promise<User | null>{
        return await this.userModel.findOne({ username: username }).select('+password');
    }


    async findByEmail(email:string): Promise<User | null>{
        return await this.userModel.findOne({ email:email });
    }

    async updateById(id:string, updateData:Partial<User>): Promise<User | null>{
        return await this.userModel.findByIdAndUpdate(id, updateData,
            { new: true, runValidators: true }
        );
    }

    async updatePassword(id: string, password)  {
        await this.userModel.findByIdAndUpdate(id, 
            {$set: {password: password} }
        );
    }

    async create(userData: SignUpDto): Promise<User> {
        const createUser = new this.userModel(userData);
        return await createUser.save();
    }

    async delete(id: string) {
        await this.userModel.deleteOne({_id:id});
    }
}