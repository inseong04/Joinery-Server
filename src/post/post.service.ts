import { Injectable, NotFoundException } from '@nestjs/common';
import { PostCreateDto } from './dto/post.create.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { newPostSchema, PostSchema } from './schema/post.schema';
import { DetailPost } from './model/detail.post.model';
import { FindRegionDto } from './dto/find.region.dto';
import { Verification } from 'src/auth/schema/verification.schema';
import { isHeartDto } from './dto/isHeart.dto';
import { HeartType } from 'src/constants/user.constants';
import { PreviewPostModel } from './model/preview.post.model';
import DateUtils from 'src/post/utils/date.utill';

@Injectable()
export class PostService {
    constructor(
        @InjectModel('Post') private PostModel:Model<PostSchema>, 
        @InjectModel('User') private verificationModel:Model<Verification>,
    ){}

    async getRegionPost(regionId:number, findRegionDto: FindRegionDto){
    let result: PreviewPostModel[] = [];
    if (findRegionDto.startDate == null && findRegionDto.endDate == null) {
            const posts = await this.PostModel.find({region_id: regionId}).select('title startDate endDate limitedHeart heart createdAt authorId').lean();
            const postList: PreviewPostModel[] = await Promise.all(posts.map(async item => {
                const user = await this.verificationModel.findById(item.authorId).select('nickname').lean();
                console.log(item);
                return {
                    _id: item._id.toString(),
                    title: item.title,
                    username: user?.nickname ?? 'Unknown',
                    startDate: DateUtils.formatDate(item.startDate),
                    endDate: DateUtils.formatDate(item.endDate),
                    heart: item.heart,
                    limitedHeart: item.limitedHeart,
                    
                };
            }));
            result = postList;
    }
    else {
        const filterStartDate = new Date(findRegionDto.startDate);
        const filterEndDate = new Date(findRegionDto.endDate);
        const posts = await this.PostModel.find({region_id:regionId, startDate:{$gte: filterStartDate}, endDate:{$lte:filterEndDate} });
        const postList: PreviewPostModel[] = await Promise.all(posts.map(async item => {
            const user = await this.verificationModel.findById(item.authorId).select('nickname').lean();
            return {
                _id:item._id.toString(),
                title: item.title,
                username: user?.nickname ?? 'Unknown',
                startDate: DateUtils.formatDate(item.startDate),
                endDate: DateUtils.formatDate(item.endDate),
                heart: item.heart,
                limitedHeart: item.limitedHeart,
                };
            }));    
        result = postList;
        }
return result;
    }

    private formatDateHour(date: Date | string): string {
      if (!(date instanceof Date)) date = new Date(date);
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const hh = String(date.getHours()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}`;
    }

    async getPost(id : string, userId:string): Promise<DetailPost | null>{
        const post = await this.PostModel.findById(id).lean();
        const user = await this.verificationModel.findById(userId).select('')

        if (!post) throw new NotFoundException();
        if (!user) throw new NotFoundException();
        // 아무도 하트X-> 아무데도 등록X
        // 유저만 하트 -> likePostId에 postId등록, likedUserId에 userId 등록, memberId에는 등록X
        // 둘다 하트  -> likePostId에는 이미 등록, likedUserId에는 userId 삭제, memberId에는 등록O 
        let heartType : HeartType = HeartType.NoOne;
        if (user.likePostId.includes(id)){
            if (post.memberId.includes(userId)){
                heartType = HeartType.Both;
            } else {
                heartType = HeartType.UserOnly;
            }
        } 

        const authorName = await this.verificationModel.findById(post.authorId).select('nickname').lean();
        const members: string[] = await Promise.all(
            post.memberId.map(async id => {
                const user = await this.verificationModel.findById(id).select('nickname').lean();
                return user?.nickname ?? 'Unknown';
            })
        );

        // startDate, endDate를 'YYYY-MM-DD HH' string로 변환
        return {
            ...post,
            startDate: this.formatDateHour(post.startDate),
            endDate: this.formatDateHour(post.endDate),
            heartType: heartType,
            authorName: authorName!.nickname,
            membersName: members
        } as DetailPost;
    }

    async updateLike(id: string, userId: string){
        await this.PostModel.findByIdAndUpdate(id, {$addToSet: {likedUserId: userId}},{new: true});
        await this.verificationModel.findByIdAndUpdate(userId, {$addToSet: {likePostId: id}}, {new:true});
        return {message:"success for updateLike"};
    }

    async deleteLike(id: string, userId: string){
        await this.PostModel.findByIdAndUpdate(id, {$pull: { likedUserId: userId}})
        await this.verificationModel.findByIdAndUpdate(userId, {$pull: {likePostId: id}})
        return {message:"success for deleteLike"};
    }

    async getPopularRegions(){
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() -7);
        return this.PostModel.aggregate([
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
        ])
    }
    async createPost(userId: string, postCreateDto: PostCreateDto): Promise<PostSchema> {

        if (postCreateDto.schedule) {

            for (const index in postCreateDto.schedule) {
                const raw = postCreateDto.schedule[index].date;
                const iso = raw.replace(' ', 'T') + ':00:00';
                postCreateDto.schedule[index].date = new Date(iso) as any;
            }
        }

        if (postCreateDto.startDate && postCreateDto.endDate) {
            postCreateDto.startDate = new Date(postCreateDto.startDate) as any;
            postCreateDto.endDate = new Date(postCreateDto.endDate) as any;
        }

        // JWT token에서 받은 userId를 authorId로 설정
        const postData = {
            ...postCreateDto,   
            authorId: userId
        };

        const newPost = await new this.PostModel(postData);
        // User Collection에 wrotePost(작성한 게시글)에 해당 게시글 _id 추가
        await this.verificationModel.findByIdAndUpdate(userId, {
            $addToSet: {wrotePost: newPost._id}
        });
        return newPost.save();
    }

    async updatePost(id: string, updateData: any, userId: string): Promise<DetailPost | null> {
        await this.PostModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        ).lean();
        return this.getPost(id, userId);
    }

    async deletePost(id: string) {
        await this.PostModel.findByIdAndDelete(id);
        return {message:"success"};
    }
}
