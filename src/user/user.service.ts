import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Verification } from 'src/auth/schema/verification.schema';
import { Region } from 'src/constants/region-list.constant';
import { UserUpdateDto } from './dto/user.update.dto';
import { PostSchema } from 'src/post/schema/post.schema';
import { ApplicationPostModel } from './model/application.post.model';
import DateUtils from 'src/constants/date.utill';
import { UserPostModel } from './model/user.post.model';
import { PostGetDto } from 'src/post/dto/post.get.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel('Post') private postModel:Model<PostSchema>,
        @InjectModel('User') private verificationModel: Model<Verification & Document>
    ){}

    async getUser(id:string){
        // ObjectId 유효성 검사
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return null;
        }
        const user = await this.verificationModel.findById(id);
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

    async getApplicationPost(id: string){
        const user = await this.verificationModel.findById(id).select('likePostId');
        const likedPostIdList = (user as any)?.likePostId as string[] | undefined;
        if (!user || !likedPostIdList) {
            return {};
        }

        let userLikedPosts: UserPostModel[] = [];
        for (const item of likedPostIdList) {
            const post = await this.postModel.findById(item);
            const likedPost : UserPostModel = new UserPostModel();
            likedPost._id = post?._id ? post._id.toString() : null;
            likedPost.region_id = post?.region_id ? post.region_id : null;
            const author = await this.verificationModel.findById(post?.authorId).select('nickname').lean();
            likedPost.username = author ? author.nickname : null;
            likedPost.startDate = post?.startDate ? post.startDate.toString() : null;
            likedPost.endDate = post?.endDate ? post.endDate.toString() : null;
            likedPost.isJoin = post?.memberId.includes(id) ? true : false;
            const now = new Date();
            likedPost.isEnded = (now >= post!.endDate) ? true: false; 
            userLikedPosts.push(likedPost);
        }
        return userLikedPosts;
    }
//null 로 반환됨
    async getUserWrotePost(id: string){
        const result = await this.verificationModel.findById(id).select('wrotePost');
        return result;
    }

    async updateInterestRegion(id: string, interestRegionList: number[]){
        // 숫자 배열을 그대로 사용 (Region enum 값이 숫자이므로)
        return await this.verificationModel.findByIdAndUpdate(
            id, 
            {$addToSet:{ interestRegion: { $each: interestRegionList}}},
            {new: true}  // 업데이트 후 데이터 반환
        );
    }

    async deleteInterestRegion(id: string, deleteInterestRegion: number){
        // 숫자를 그대로 사용 (Region enum 값이 숫자이므로)
        await this.verificationModel.updateOne({_id:id}, {$pull:{interestRegion: deleteInterestRegion}});
        // 업데이트 후 사용자 정보 반환
        return await this.verificationModel.findById(id);
    }


}
