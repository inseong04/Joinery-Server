import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
import DateUtils from 'src/utils/date.utill';
import { MembersInformationModel } from './model/members-information.model';
import { AuthorModel } from './model/author.model';

@Injectable()
export class PostService {
    constructor(
        @InjectModel('Post') private PostModel:Model<PostSchema>, 
        @InjectModel('User') private verificationModel:Model<Verification>,
    ){}

    async getRegionPost(regionId:number, findRegionDto: FindRegionDto){
    let result: PreviewPostModel[] = [];
    //시작날짜 끝나는날짜 미입력시
    if (findRegionDto.startDate == null && findRegionDto.endDate == null) {
            const posts = await this.PostModel.find({region_id: regionId}).select('title startDate endDate limitedHeart heart createdAt authorId').lean();
            const postList: PreviewPostModel[] = await Promise.all(posts.map(async item => {
                const user = await this.verificationModel.findById(item.authorId).select('nickname username profileImageUrl').lean();
                const author : AuthorModel = new AuthorModel();
                author.nickname = user?.nickname ?? 'Unknown';
                author.username = user?.username ?? 'Unknown';
                author.profileImageUrl = user?.profileImageUrl ?? process.env.DEFAULT_PROFILE_IMAGE_URL!;
                console.log(item);
                return {
                    _id: item._id.toString(),
                    title: item.title,
                    author: author,
                    startDate: DateUtils.formatDate(item.startDate),
                    endDate: DateUtils.formatDate(item.endDate),
                    currentPerson: item.currentPerson,
                    maxPerson: item.maxPerson,
                    
                };
            }));
            result = postList;
    }
    else {
        const filterStartDate = new Date(findRegionDto.startDate);
        const filterEndDate = new Date(findRegionDto.endDate);
        const posts = await this.PostModel.find({region_id:regionId, startDate:{$gte: filterStartDate}, endDate:{$lte:filterEndDate} });
        const postList: PreviewPostModel[] = await Promise.all(posts.map(async item => {
                const user = await this.verificationModel.findById(item.authorId).select('nickname username profileImageUrl').lean();
                const author : AuthorModel = new AuthorModel();            
                return {
                _id:item._id.toString(),
                title: item.title,
                author: author,
                startDate: DateUtils.formatDate(item.startDate),
                endDate: DateUtils.formatDate(item.endDate),
                currentPerson: item.currentPerson,
                maxPerson: item.maxPerson,
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
        if (!post) throw new NotFoundException();

        const authorInformation = await this.verificationModel.findById(post.authorId).select('nickname username profileImageUrl').lean();
        const author: AuthorModel = new AuthorModel();
        author.nickname = authorInformation?.nickname ??'Unknown';
        author.username = authorInformation?.username ?? 'Unknown';
        author.profileImageUrl = authorInformation?.profileImageUrl ?? process.env.DEFAULT_PROFILE_IMAGE_URL!;

        const members: MembersInformationModel[] = await Promise.all(
            post.memberId.map(async id => {
                const user = await this.verificationModel.findById(id).select('nickname username profileImageUrl').lean();
                const someMember = new MembersInformationModel;
                someMember.nickname = user?.nickname ?? 'Unknown';
                someMember.username = user?.username ?? 'Unknown';
                someMember.profileImageUrl = user?.profileImageUrl ?? process.env.DEFAULT_PROFILE_IMAGE_URL!;

                return someMember;
            })
        );

        // 토큰 있을시
        if (userId != undefined) {
            const user = await this.verificationModel.findById(userId).select('')
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
            // startDate, endDate를 'YYYY-MM-DD HH' string로 변환

            const {authorId, memberId, likedUserId, ...rest} = post;
            
            return {
                ...rest,
                startDate: this.formatDateHour(post.startDate),
                endDate: this.formatDateHour(post.endDate),
                heartType: heartType,
                author: author,
                members: members,
                
            } as unknown as DetailPost;
            
        } else { // 토큰 없을시
            const {authorId, memberId, likedUserId, ...rest} = post;

            // startDate, endDate를 'YYYY-MM-DD HH' string로 변환
            return {
                ...rest,
                startDate: this.formatDateHour(post.startDate),
                endDate: this.formatDateHour(post.endDate),
                author: author,
                members: members
            } as unknown as DetailPost;
        }
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
            authorId: userId,
            currentPerson: 1, // 기본값으로 작성자 1명
        };

        const newPost = await new this.PostModel(postData);
        // User Collection에 wrotePost(작성한 게시글)에 해당 게시글 _id 추가
        await this.verificationModel.findByIdAndUpdate(userId, {
            $addToSet: {wrotePost: newPost._id}
        });
        return newPost.save();
    }

    async updatePost(id: string, updateData: any, userId: string): Promise<DetailPost | null> {
        
        const beforeCurrentPerson = await this.PostModel.findById(id).select('currentPerson');
        if (updateData.currentPerson >= beforeCurrentPerson!)
            throw new BadRequestException();
        
        const now = new Date();
        if (DateUtils.stringToDate(updateData.startDate) < now || DateUtils.stringToDate(updateData.endDate) < now)
            throw new BadRequestException();

        await this.PostModel.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true }
        );
        return this.getPost(id, userId);
    }

    async deletePost(id: string, userId: string) {
        await this.PostModel.findByIdAndDelete(id);
        await this.verificationModel.findByIdAndUpdate(userId, {$pull: {wrotePost: id}});
        return {message:"success"};
    }
}
