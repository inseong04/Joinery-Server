import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { User } from 'src/auth/infrastructure/schema/user.schema';
import { UserUpdateDto } from '../presentation/dto/user.update.dto';
import { PostSchema } from 'src/post/infrastructure/schema/post.schema';
import DateUtils from 'src/utils/date.utill';
import { UserPostDto } from '../presentation/dto/user.post.dto';
import { UserWrotePostDto } from '../presentation/dto/user.wrote.post.dto';
import { UploadService } from 'src/upload/upload.service';
import { NotificationsService } from 'src/notifications/application/notifications.service';
import { NotificationType, TEMPLATES } from '../../notifications/types/notifications.types';

@Injectable()
export class UserService {
    constructor(
        @InjectModel('Post') private postModel:Model<PostSchema>,
        @InjectModel('User') private verificationModel: Model<User & Document>,
        private uploadService: UploadService,
        private readonly notificationsService: NotificationsService,
    ){}

    async getUser(username:string){
        const user = await this.verificationModel.findOne({username: username})
        if (!user) throw new NotFoundException();

        // birthDate를 string으로 변환
        const userResponse = user.toObject();
        if (userResponse.birthDate) {
            userResponse.birthDate = DateUtils.formatDate(userResponse.birthDate) as any;
        }
        
        return userResponse;
    }

    async getUserById(id:string) {
        const user = await this.verificationModel.findById(id);
        if (!user) throw new NotFoundException();

        // birthDate를 string으로 변환
        const userResponse = user.toObject();
        if (userResponse.birthDate) {
            userResponse.birthDate = DateUtils.formatDate(userResponse.birthDate) as any;
        }
        
        return userResponse;

    }

    async updateUser(id:string, userUpdateDto: UserUpdateDto, imageUrl?: string){
        
        if (imageUrl == undefined) {
            userUpdateDto.profileImageUrl = undefined;
        } else {
            const existPost = await this.verificationModel.findById(id).select('profileImageUrl');
            if (existPost?.profileImageUrl) {
                try {
                    this.uploadService.deleteFile(existPost.profileImageUrl);
                } catch (error) {
                    console.error('기존 이미지 삭제 실패:', error);
                }
            }
            userUpdateDto.profileImageUrl = imageUrl;
        }

        const cleanData = Object.fromEntries(
            Object.entries(userUpdateDto).filter(([_, v]) => v !== undefined)
        );
        const updatedUser = await this.verificationModel.findByIdAndUpdate(
            id,
            {$set: cleanData},
            {new: true}
        );
        
        if (!updatedUser) {
            return null;
        }
        
        // birthDate를 string으로 변환
        const userResponse = updatedUser.toObject();
        if (userResponse.birthDate) {
            userResponse.birthDate = DateUtils.formatDate(userResponse.birthDate) as any;
        }
        
        return userResponse;
    }
    async getApplicationPost(id: string){
        const user = await this.verificationModel.findById(id).select('likePostId');
        const likedPostIdList = (user as any)?.likePostId as string[] | undefined;
        if (!user || !likedPostIdList) {
            return {};
        }

        const endedLikedPosts: UserPostDto[] = [];
        const likedPosts: UserPostDto[]= [];
        for (const item of likedPostIdList) {
            const post = await this.postModel.findById(item);
            const likedPost : UserPostDto = new UserPostDto();
            likedPost._id = post?._id ? post._id.toString() : null;
            likedPost.region_id = post?.region_id ? post.region_id : null;
            const author = await this.verificationModel.findById(post?.authorId).select('nickname').lean();
            likedPost.username = author ? author.nickname : null;
            likedPost.startDate = post?.startDate ? DateUtils.formatDate(post.startDate) : null;
            likedPost.endDate = post?.endDate ? DateUtils.formatDate(post.endDate) : null;
            likedPost.isJoin = post?.memberId.includes(id) ? true : false;
            likedPost.title = post?.title ?? 'Title';
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

        const endedWrotePosts: UserWrotePostDto[] = [];
        const wrotePosts: UserWrotePostDto[] = [];
        for (const item of wrotePostIdList) {
            const post = await this.postModel.findById(item);
            if (post == null) continue; // 삭제된 게시글은 건너뛰기
            const wrotePost: UserWrotePostDto = new UserWrotePostDto();
            wrotePost._id = post?._id ? post._id.toString() : null;
            wrotePost.region_id = post?.region_id ? post.region_id : null;
            const author = await this.verificationModel.findById(post?.authorId).select('nickname').lean();
            wrotePost.startDate = post?.startDate ? DateUtils.formatDate(post.startDate) : null;
            wrotePost.endDate = post?.endDate ? DateUtils.formatDate(post.endDate) : null;
            wrotePost.MaxPerson = post?.maxPerson ?? 0;
            wrotePost.currentPerson = post?.currentPerson ?? 404;
            wrotePost.title = post?.title ?? 'Title';
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
        const updatedUser = await this.verificationModel.findByIdAndUpdate(
            id,
            {$addToSet:{ interestRegion: { $each: interestRegionList}}},
            {new: true}  // 업데이트 후 데이터 반환
        );
        
        if (!updatedUser) {
            return null;
        }
        
        // birthDate를 string으로 변환
        const userResponse = updatedUser.toObject();
        if (userResponse.birthDate) {
            userResponse.birthDate = DateUtils.formatDate(userResponse.birthDate) as any;
        }
        
        return userResponse;
    }

    async deleteInterestRegion(id: string, deleteInterestRegion: number){
        // 숫자를 그대로 사용 (Region enum 값이 숫자이므로)
        await this.verificationModel.updateOne({_id:id}, {$pull:{interestRegion: deleteInterestRegion}});
        // 업데이트 후 사용자 정보 반환
        const user = await this.verificationModel.findById(id);
        
        if (!user) {
            return null;
        }
        
        // birthDate를 string으로 변환
        const userResponse = user.toObject();
        if (userResponse.birthDate) {
            userResponse.birthDate = DateUtils.formatDate(userResponse.birthDate) as any;
        }
        
        return userResponse;
    }

    async uploadImage(id: string, imageUrl: string) {
        await this.verificationModel.findByIdAndUpdate(id, {profileImageUrl: imageUrl});
        return { message: 'success', url: imageUrl};
    }

    async getBookmark(id:string){
        const user = await this.verificationModel.findById(id).select('bookmarkPostId');
                
        if (!user)
            throw new NotFoundException();
                
        const bookmarkPostIdList = user.bookmarkPostId;
        if (!bookmarkPostIdList || bookmarkPostIdList.length === 0) {
            return [];
        }
        
        const bookmarkPosts: UserWrotePostDto[] = [];
        for (const item of bookmarkPostIdList) {
            const post = await this.postModel.findById(item);
            
            if (post == null) {
                console.log('Post is null, skipping');
                continue; // 삭제된 게시글은 건너뛰기
            }
            
            const bookmarkPost: UserWrotePostDto = new UserWrotePostDto();
            bookmarkPost._id = post?._id ? post._id.toString() : null;
            bookmarkPost.region_id = post?.region_id ? post.region_id : null;
            
            const author = await this.verificationModel.findById(post?.authorId).select('nickname').lean();
            
            bookmarkPost.startDate = post?.startDate ? DateUtils.formatDate(post.startDate) : null;
            bookmarkPost.endDate = post?.endDate ? DateUtils.formatDate(post.endDate) : null;
            bookmarkPost.MaxPerson = post?.maxPerson ?? 0;
            bookmarkPost.currentPerson = post?.currentPerson ?? 404;
            bookmarkPost.title = post?.title ?? 'Title';
            
            const now = new Date();
            bookmarkPosts.push(bookmarkPost);
        }
        
        return bookmarkPosts;
    }

    async updateBookmark(id: string, postId:string){

        const user = await this.verificationModel.findById(id);

        if (user?.wrotePost.includes(postId))
            throw new BadRequestException();

        await this.verificationModel.findByIdAndUpdate(id,
            {$addToSet:{bookmarkPostId:postId.toString()}}
        );
    }

    async deleteBookmark(id:string, postId:string){
        await this.verificationModel.findByIdAndUpdate(id, {
            $pull:{bookmarkPostId:postId}
        });
    }

     async createNotification(type:NotificationType, userId: string, postId:string){
        let meta;
        if (type=NotificationType.LIKE){
            meta = {postId, actorId:userId};
        } else if (NotificationType.LIKE_ACCEPTED){
            meta = {postId};
        } else if (NotificationType.LIKE_REJECTED){
            meta = {postId};
        } else if (NotificationType.MEMBER_JOINED){
            meta = {postId, actorId:userId};
        } else {
            throw new BadRequestException();
        }
         await this.notificationsService.create({
            type:type,
            userId:userId,
            meta: meta
         });
     }

}
