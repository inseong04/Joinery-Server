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
import { UsersInformationModel } from './model/users-information.model';
import { AuthorModel } from './model/author.model';
import { Schedule } from './model/schedule.model';
import { NotificationsService } from 'src/notifications/notifications.service';
import { NotificationType } from 'src/notifications/types/notifications.types';

@Injectable()
export class PostService {
    constructor(
        @InjectModel('Post') private PostModel:Model<PostSchema>, 
        @InjectModel('User') private verificationModel:Model<Verification>,
        private readonly notifications: NotificationsService,
    ){}

    async getRegionPost(regionId:number, findRegionDto: FindRegionDto){
    let result: PreviewPostModel[] = [];
    //시작날짜 끝나는날짜 미입력시
    if (findRegionDto.startDate == null && findRegionDto.endDate == null) {
            const posts = await this.PostModel.find({region_id: regionId}).select('title startDate endDate limitedHeart heart createdAt authorId currentPerson maxPerson').lean();
            const postList: PreviewPostModel[] = await Promise.all(posts.map(async item => {
                const user = await this.verificationModel.findById(item.authorId).select('nickname username profileImageUrl').lean();
                const author : AuthorModel = new AuthorModel();
                author.nickname = user?.nickname ?? 'Unknown';
                author.username = user?.username ?? 'Unknown';
                author.profileImageUrl = user?.profileImageUrl ?? process.env.DEFAULT_PROFILE_IMAGE_URL!;
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

    async getPost(id : string, userId:string): Promise<DetailPost | null>{
        const post = await this.PostModel.findById(id).lean();
        if (!post) throw new NotFoundException();
        const authorInformation = await this.verificationModel.findById(post.authorId).select('nickname username profileImageUrl').lean();
        const author: AuthorModel = new AuthorModel();
        author.nickname = authorInformation?.nickname ??'Unknown';
        author.username = authorInformation?.username ?? 'Unknown';
        author.profileImageUrl = authorInformation?.profileImageUrl ?? process.env.DEFAULT_PROFILE_IMAGE_URL!;

        const members: UsersInformationModel[] = await Promise.all(
            post.memberId.map(async id => {
                const user = await this.verificationModel.findById(id).select('nickname username profileImageUrl _id').lean();
                const someMember = new UsersInformationModel();
                someMember._id = user?._id.toString() ?? 'Unknown';
                someMember.nickname = user?.nickname ?? 'Unknown';
                someMember.username = user?.username ?? 'Unknown';
                someMember.profileImageUrl = user?.profileImageUrl ?? process.env.DEFAULT_PROFILE_IMAGE_URL!;

                return someMember;
            })
        );

        const schedules : Schedule[] = post.schedule.map(item => {
            return {
                ...item,
                date: DateUtils.formatDate(item.date),
            };
        });

        // 토큰 있을시 (userId가 유효한 문자열인 경우)
        if (userId && typeof userId === 'string' && userId.trim() !== '') {
            const user = await this.verificationModel.findById(userId).select('')
            if (!user) throw new NotFoundException();
            // 아무도 하트X-> 아무데도 등록X heartType 0
            // 유저만 하트 -> (users) likePostId에 postId등록, (post) likedUserId에 userId 등록, (post)memberId에는 등록X
            // 둘다 하트  -> (users) likePostId에는 이미 등록, (users)likedUserId에는 userId 삭제, (users) memberId에는 등록O 
            let heartType : HeartType = HeartType.NoOne;
            if (user.likePostId.includes(id)){
                if (post.memberId.includes(userId)){
                    heartType = HeartType.Both;
                } else {
                    heartType = HeartType.UserOnly;
                }
            }
            
            const {authorId, memberId, schedule, ...rest} = post;
            // 조회 이용자가 게시글 작성자인지 판별
            if (user._id.toString() == post.authorId) {
                // 게시글 작성자일시
                const likedUsers: UsersInformationModel[] = await Promise.all(
                    post.likedUserId.map(async id => {
                        const user = await this.verificationModel.findById(id).select('nickname username profileImageUrl _id').lean();
                        const someUser = new UsersInformationModel();
                        someUser._id = user?._id.toString() ?? 'Unknown';
                        someUser.nickname = user?.nickname ?? 'Unknown';
                        someUser.username = user?.username ?? 'Unknown';
                        someUser.profileImageUrl = user?.profileImageUrl ?? process.env.DEFAULT_PROFILE_IMAGE_URL!;

                        return someUser;
                    })
                );

                return {
                    ...rest,
                    startDate: DateUtils.formatDate(post.startDate),
                    endDate: DateUtils.formatDate(post.endDate),
                    heartType: heartType,
                    author: author,
                    members: members,
                    schedule: schedules,
                    likedUsers
                } as unknown as DetailPost;
            } 

            else {
                // 게시글 작성자 아닐시
                return {
                    ...rest,
                    startDate: DateUtils.formatDate(post.startDate),
                    endDate: DateUtils.formatDate(post.endDate),
                    heartType: heartType,
                    author: author,
                    members: members,
                    schedule: schedules,  
                } as unknown as DetailPost;
            }
            
        } else { // 토큰 없을시
            console.log("토큰X")
            const {authorId, memberId, likedUserId, schedule, ...rest} = post;

            // startDate, endDate를 'YYYY-MM-DD HH' string로 변환
            return {
                ...rest,
                startDate: DateUtils.formatDate(post.startDate),
                endDate: DateUtils.formatDate(post.endDate),
                heartType: HeartType.NoOne, // 토큰이 없을 때는 NoOne으로 설정
                author: author,
                members: members,
                schedule: schedules,
            } as unknown as DetailPost;
        }
    }

    async updateLike(id: string, userId: string){
        const post = await this.PostModel.findById(id).select('authorId');
        
        if (!post || !post.authorId)
            throw new NotFoundException();

        if(post?.authorId == userId)
            throw new BadRequestException();

        await this.PostModel.findByIdAndUpdate(id, {$addToSet: {likedUserId: userId}},{new: true});
        await this.verificationModel.findByIdAndUpdate(userId, {$addToSet: {likePostId: id}}, {new:true});
        
        await this.notifications.create({
            userId: post.authorId,
            type: NotificationType.LIKE,
            meta: {
                postId:id,
                actorId: userId
            },
        });
        return {isLike:true};
    }

    async deleteLike(id: string, userId: string){
        const post = await this.PostModel.findById(id).select('authorId');
        if(post?.authorId == userId)
            throw new BadRequestException();

        await this.PostModel.findByIdAndUpdate(id, {$pull: { likedUserId: userId}})
        await this.verificationModel.findByIdAndUpdate(userId, {$pull: {likePostId: id}})
        return {isLike:false};
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

    // 아래 세개 작동안되고 deletePost가 실행됨
    async deletePost(id: string, userId: string) {
        await this.PostModel.findByIdAndDelete(id);
        await this.verificationModel.findByIdAndUpdate(userId, {$pull: {wrotePost: id}});
        return {message:"success"};
    }

    async checkAuthor(id: string, postId:string) {
        const post = await this.PostModel.findById(postId).select('authorId');
        if (id != post?.authorId)
            throw new BadRequestException();   
    }

    private async createNotificationForMember(postId:string, userId:string, memberId:string[]){
        memberId.forEach(async item => {
            await this.notifications.create({
                userId:item,
                type:NotificationType.MEMBER_JOINED,
                meta:{
                    postId:postId,
                    actorId:userId
                }
            });
        });
    }

    async updateMember(id:string , postId:string, userId:string){
        await this.checkAuthor(id, postId);

        await this.verificationModel.updateOne({_id:userId}, 
            {$addToSet: {joinPostId: postId}}
        );

        const post = await this.PostModel.findById(postId).select('maxPerson currentPerson authorId memberId');
        if (post == undefined)
            throw new NotFoundException();
        
        const newCurrentPerson = post.currentPerson + 1;
        if  (newCurrentPerson > post.maxPerson)
            throw new BadRequestException();

        await this.notifications.create({
            userId: userId,
            type: NotificationType.LIKE_ACCEPTED,
            meta: {
                postId:postId,
                actorId: id
            }
        });

        this.createNotificationForMember(postId, userId, post.memberId);

        return await this.PostModel.updateOne({_id:postId},
            {$addToSet: {memberId: userId}},
            {currentPerson: newCurrentPerson}
        );

        
    }

    async deleteLikePostId(id: string, postId:string, userId:string) {
        await this.checkAuthor(id, postId);
        await this.verificationModel.updateOne({_id:userId},
            {$pull: {likePostId: postId}}
        );

        await this.PostModel.updateOne({_id: postId},
            {$pull: {likedUserId: userId}},
        );

        await this.notifications.create({
            userId:userId,
            type:NotificationType.LIKE_REJECTED,
            meta:{
                postId:postId,
                actorId:id
            }
        });
    }

    async deleteMember(id: string, postId:string, userId:string){
        await this.checkAuthor(id, postId);
        await this.verificationModel.updateOne({_id:userId},
            {$pull: {joinPostId: postId}}
        );

        const post = await this.PostModel.findById(postId).select('currentPerson');
        if (post == undefined)
            throw new NotFoundException();
        
        const newCurrentPerson = post.currentPerson - 1;

        return await this.PostModel.updateOne({_id:postId},
            {$pull: {memberId: userId}},
            {currentPerson: newCurrentPerson}
        );
    }
}
