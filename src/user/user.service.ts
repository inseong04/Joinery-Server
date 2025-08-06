import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Verification } from 'src/auth/schema/verification.schema';
import { Region } from 'src/constants/region-list.constant';
import { UserUpdateDto } from './dto/user.update.dto';
import { PostSchema } from 'src/post/schema/post.schema';
import { ApplicationPostModel } from './model/application.post.model';
import DateUtils from 'src/post/utils/date.utill';
import { UserPostModel } from './model/user.post.model';
import { PostGetDto } from 'src/post/dto/post.get.dto';
import { UserWrotePostModel } from './model/user.wrote.post.model';

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

        const endedLikedPosts: UserPostModel[] = [];
        const likedPosts: UserPostModel[]= [];
        for (const item of likedPostIdList) {
            const post = await this.postModel.findById(item);
            const likedPost : UserPostModel = new UserPostModel();
            likedPost._id = post?._id ? post._id.toString() : null;
            likedPost.region_id = post?.region_id ? post.region_id : null;
            const author = await this.verificationModel.findById(post?.authorId).select('nickname').lean();
            likedPost.username = author ? author.nickname : null;
            likedPost.startDate = post?.startDate ? DateUtils.formatDate(post.startDate) : null;
            likedPost.endDate = post?.endDate ? DateUtils.formatDate(post.endDate) : null;
            likedPost.isJoin = post?.memberId.includes(id) ? true : false;
            const now = new Date();
            likedPost.isEnded = (now >= post!.endDate) ? true: false; 
            if (likedPost.isEnded) 
                endedLikedPosts.push(likedPost);
            else
                likedPosts.push(likedPost);
        }
        return {"ended": endedLikedPosts, "notEnded": likedPosts};
    }

    async getUserWrotePost(id: string){
        const user = await this.verificationModel.findById(id).select('wrotePost');
        const wrotePostIdList = user?.wrotePost as string[] | undefined;
        if (!user || !wrotePostIdList) {
            return {};
        }

        const endedWrotePosts: UserWrotePostModel[] = [];
        const wrotePosts: UserWrotePostModel[] = [];
        for (const item of wrotePostIdList) {
            const post = await this.postModel.findById(item);
            const wrotePost: UserWrotePostModel = new UserWrotePostModel();
            wrotePost._id = post?._id ? post._id.toString() : null;
            wrotePost.region_id = post?.region_id ? post.region_id : null;
            const author = await this.verificationModel.findById(post?.authorId).select('nickname').lean();
            wrotePost.startDate = post?.startDate ? DateUtils.formatDate(post.startDate) : null;
            wrotePost.endDate = post?.endDate ? DateUtils.formatDate(post.endDate) : null;
            wrotePost.limitedHeart = post?.maxPerson ?? 0;
            wrotePost.heart = post?.currentPerson ?? 404;
            const now = new Date();
            wrotePost.isEnded = (now >= post!.endDate) ? true : false;
            if (wrotePost.isEnded)
                endedWrotePosts.push(wrotePost);
            else
                wrotePosts.push(wrotePost);
        }
        return { "ended": endedWrotePosts, "notEnded": wrotePosts };
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
