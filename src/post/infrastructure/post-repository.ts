import { Model } from "mongoose";
import { PostRepository } from "../application/interfaces/post-repository.interface";
import { PostCreateDto } from "../presentation/dto/post.create.dto";
import { PostGetDto } from "../presentation/dto/post.get.dto";
import { PostSchema } from "./schema/post.schema";
import { InjectModel } from "@nestjs/mongoose";
import { PostInformation } from "../application/interfaces/post-information.interface";
import { post } from "@typegoose/typegoose";
import { NotFoundException } from "@nestjs/common";
import { MongoPullOperation, PostArrayFields, MongoAddToSetOperation, MongoPushOperation } from "../application/interfaces/mongo-operators.interface";

export class MongoPostRepository implements PostRepository {

    constructor(
        @InjectModel('Post') private postModel:Model<PostSchema>, 
    ){
    }

    async findByRegionIdAndFilterDate(regionId: number, startDate:string, endDate:string): Promise<PostInformation[]> {
        const filterStartDate = new Date(startDate);
        const filterEndDate = new Date(endDate);
        const posts: PostInformation[] = await this.postModel.find({region_id:regionId, startDate:{$gte: filterStartDate}, endDate:{$lte:filterEndDate} });
        
        if (!posts)
            throw new NotFoundException();

        return posts;
    }

    async findById(id: string): Promise<PostSchema | null> {
        return await this.postModel.findById(id).lean();
    }
    async findByRegionId(regionId: number): Promise<PostInformation[] | null> {
        return await this.postModel.find({region_id: regionId}).lean();
    }
    findByField(postData: Partial<PostGetDto>): Promise<PostSchema> {
        throw new Error("Method not implemented.");
    }
    async getPopularRegions(): Promise<PostSchema[] | null> {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() -7);
        return await this.postModel.aggregate([
            {
                $match:{
                    createdAt: { $gte: oneWeekAgo}
                }
            },
            {
                $group:{
                    _id: "$region_id",
                    count: {$sum:1}
                }
            },
            { $sort:{ count: -1}},
            {$limit: 5},
            {
                $project: {
                    regionId: "$_id",
                    count: 1,
                    _id: 0
                }
            }
        ]);
    }
    async create(postData: PostCreateDto): Promise<PostSchema> {
        const newPost = await new this.postModel(postData);
        return await newPost.save();
    }
    async update(id: string, postUpdateData: Partial<PostGetDto>): Promise<PostSchema | null> {
        return await this.postModel.findByIdAndUpdate(
            id,
            postUpdateData,
            { new: true }
        ).lean();
    }

    async updateToPullFromArray(_id: string, pullData: MongoPullOperation<PostArrayFields>): Promise<PostSchema | null> {
        return await this.postModel.findByIdAndUpdate(_id, pullData, {new:true}).lean();
    }

    async updateToAddToArray(_id: string, addData: MongoAddToSetOperation<PostArrayFields>): Promise<PostSchema | null> {
        return await this.postModel.findByIdAndUpdate(_id, addData, {new:true}).lean();
    }
    
    async updateToPushToArray(_id: string, pushData: MongoPushOperation<PostArrayFields>): Promise<PostSchema | null> {
        return await this.postModel.findByIdAndUpdate(_id, pushData, {new:true}).lean();
    }

    async updateToAddToArrayAndSet(_id: string, addData: any) {
        return await this.postModel.findByIdAndUpdate(_id, addData).lean();
    }


    async delete(id: string) {
        await this.postModel.findByIdAndDelete(id);
    }

}