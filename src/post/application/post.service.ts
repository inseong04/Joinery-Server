import { BadRequestException, Injectable, NotFoundException, Inject } from '@nestjs/common';
import { PostCreateDto } from '../presentation/dto/post.create.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { newPostSchema, PostSchema } from '../infrastructure/schema/post.schema';
import { DetailPostDto } from '../presentation/dto/detail.post.dto';
import { FindRegionDto } from '../presentation/dto/find.region.dto';
import { User } from 'src/auth/infrastructure/schema/user.schema';
import { isHeartDto } from '../presentation/dto/isHeart.dto';
import { HeartType } from 'src/constants/user.constants';
import { PreviewPostDto } from '../presentation/dto/preview.post.model';
import DateUtils from 'src/utils/date.utill';
import { UsersInformationDto } from '../presentation/dto/users-information.dto';
import { Author } from './interfaces/author.model';
import { ScheduleDto } from '../presentation/dto/schedule.dto';
import { NotificationsService } from 'src/notifications/application/notifications.service';
import { NotificationType } from 'src/notifications/types/notifications.types';
import { PostRepository } from './interfaces/post-repository.interface';
import { PostInformation } from './interfaces/post-information.interface';
import { UserRepository } from 'src/auth/application/interfaces/user-repository.interface';
import { SearchPostDto } from '../presentation/dto/search.post.dto';
import { SearchAuthor } from './interfaces/author-search.model';

@Injectable()
export class PostService {
    constructor(
        @Inject('PostRepository') private readonly postRepository: PostRepository,
        @Inject('UserRepository') private readonly userRepository: UserRepository,
        private readonly notifications: NotificationsService,
    ){}

    // 토큰 유효 판독 (userId가 유효한 문자열인 경우)
    isValidToken(userId: string){
        if(userId && typeof userId === 'string' && userId.trim() !== '')
            return true;
        else
            return false;
    }

    // 게시글 이용자 판독
    isAuthor(userId:string, authorId:string){
        if (userId == authorId)
            return true;
        else
            return false;
    }

    async getRegionPost(regionId:number, findRegionDto: FindRegionDto){
    let result: PreviewPostDto[] = [];
    //시작날짜 끝나는날짜 미입력시
    if (findRegionDto.startDate == null && findRegionDto.endDate == null) {
            const posts = await this.postRepository.findByRegionId(regionId);
            if (!posts)
                throw new NotFoundException();
            const postList: PreviewPostDto[] = await Promise.all(posts.map(async item => {
                const user = await this.userRepository.findById(item.authorId);
                const author : Author = {
                nickname : user?.nickname ?? 'Unknown',
                username : user?.username ?? 'Unknown',
                profileImageUrl : user?.profileImageUrl ?? process.env.DEFAULT_PROFILE_IMAGE_URL!
                }
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
        const posts = await this.postRepository.findByRegionIdAndFilterDate(regionId, findRegionDto.startDate, findRegionDto.endDate);
        const postList: PreviewPostDto[] = await Promise.all(posts.map(async item => {
                const user = await this.userRepository.findById(item.authorId);
                const author : Author = {
                    nickname : user?.nickname ?? 'Unknown',
                    username : user?.username ?? 'Unknown',
                    profileImageUrl : user?.profileImageUrl ?? process.env.DEFAULT_PROFILE_IMAGE_URL!
                    }
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

    async getPost(id : string, userId:string): Promise<DetailPostDto | null>{
        const post = await this.postRepository.findById(id);
        if (!post) throw new NotFoundException();
        const authorInformation = await this.userRepository.findById(post.authorId);
        const author: Author = {
        nickname : authorInformation?.nickname ??'Unknown',
        username : authorInformation?.username ?? 'Unknown',
        profileImageUrl : authorInformation?.profileImageUrl ?? process.env.DEFAULT_PROFILE_IMAGE_URL!
        }
        const members: UsersInformationDto[] = await Promise.all(
            post.memberId.map(async id => {
                const user = await this.userRepository.findById(id);
                const someMember = new UsersInformationDto();
                someMember._id = user?._id.toString() ?? 'Unknown';
                someMember.nickname = user?.nickname ?? 'Unknown';
                someMember.username = user?.username ?? 'Unknown';
                someMember.profileImageUrl = user?.profileImageUrl ?? process.env.DEFAULT_PROFILE_IMAGE_URL!;

                return someMember;
            })
        );

        const schedules : ScheduleDto[] = post.schedule.map(item => {
            return {
                ...item,
                date: DateUtils.formatDate(item.date),
            };
        });

        if (this.isValidToken(userId)) {
            const user = await this.userRepository.findById(userId);
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
            
            if (this.isAuthor(user._id.toString(), post.authorId)){
                // 게시글 작성자일시
                const likedUsers: UsersInformationDto[] = await Promise.all(
                    post.likedUserId.map(async id => {
                        const user = await this.userRepository.findById(id);
                        const someUser = new UsersInformationDto();
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
                    isBookmark: false,
                    author: author,
                    members: members,
                    schedule: schedules,
                    likedUsers
                } as unknown as DetailPostDto;
            } 

            else {
                // 게시글 작성자 아닐시
                
                const isBookmark = user.bookmarkPostId.includes(post._id.toString()) ? true : false;
                return {
                    ...rest,
                    startDate: DateUtils.formatDate(post.startDate),
                    endDate: DateUtils.formatDate(post.endDate),
                    heartType: heartType,
                    isBookmark: isBookmark,
                    author: author,
                    members: members,
                    schedule: schedules,  
                } as unknown as DetailPostDto;
            }
            
        } else { // 토큰 없을시
            const {authorId, memberId, likedUserId, schedule, ...rest} = post;

            // startDate, endDate를 'YYYY-MM-DD HH' string로 변환
            return {
                ...rest,
                startDate: DateUtils.formatDate(post.startDate),
                endDate: DateUtils.formatDate(post.endDate),
                heartType: HeartType.NoOne, // 토큰이 없을 때는 NoOne으로 설정
                isBookmark: false,
                author: author,
                members: members,
                schedule: schedules,
            } as unknown as DetailPostDto;
        }
    }

    async updateLike(id: string, userId: string){
        console.log(id);
        if (id === undefined)
            throw new NotFoundException();
        
        const post = await this.postRepository.findById(id);
        if (!post || !post.authorId)
            throw new NotFoundException();

        if(post?.authorId == userId)
            throw new BadRequestException();

        await this.postRepository.updateToAddToArray(id, {$addToSet: {likedUserId: userId}});
        await this.userRepository.updateToAddToArray(userId,  {$addToSet: {likePostId: id}});

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
        const post = await this.postRepository.findById(id);
        if(post?.authorId == userId)
            throw new BadRequestException();

        await this.postRepository.updateToPullFromArray(id, {$pull: { likedUserId: userId}});
        await this.userRepository.updateToPullFromArray(userId, {$pull: {likePostId: id}});
        return {isLike:false};
    }

    async getPopularRegions(){
        return await this.postRepository.getPopularRegions();
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

        const newPost: PostInformation = await this.postRepository.create(postData);
        // User Collection에 wrotePost(작성한 게시글)에 해당 게시글 _id 추가
        await this.userRepository.updateToAddToArray(userId, {
            $addToSet: {wrotePost: newPost._id}
        });
        return newPost;
    } // 에러 가능성 O

    async updatePost(id: string, updateData: any, userId: string): Promise<DetailPostDto | null> {
        
        const beforeCurrentPerson = await this.postRepository.findById(id);
        
        if (updateData.currentPerson){
            if (updateData.currentPerson >= beforeCurrentPerson!)
                throw new BadRequestException();
        }
        if (updateData.startDate) {
            const now = new Date();
            if (DateUtils.stringToDate(updateData.startDate) < now || DateUtils.stringToDate(updateData.endDate) < now)
                throw new BadRequestException();
        }
        await this.postRepository.update(id, updateData);
        return await this.getPost(id, userId);
    } // 테스트 요망

    async deletePost(id: string, userId: string) {
        this.postRepository.delete(id);
        await this.userRepository.updateToPullFromArray(userId, {$pull: {wrotePost: id}});
    }

    async checkAuthor(id: string, postId:string) {
        const post = await this.postRepository.findById(postId);
        if (!post)
            throw new NotFoundException();
        if (id != post.authorId)
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

    async updateMember(id: string, postId: string, userId: string) {
        try {
            await this.checkAuthor(id, postId);
            
            const post = await this.postRepository.findById(postId);
            if (!post) {
                throw new NotFoundException('Post not found');
            }
            
            if (post.currentPerson >= post.maxPerson) {
                throw new BadRequestException('Maximum person limit reached');
            }
            
            if (post.memberId.includes(userId)) {
                throw new BadRequestException('User is already a member');
            }
            
            await this.userRepository.updateToAddToArray(userId, {
                $addToSet: { joinPostId: postId }
            });
            
            await this.postRepository.updateToAddToArrayAndSet(postId, {
                $addToSet: { memberId: userId },
                $set: { currentPerson: post.currentPerson + 1 }
            });
            
            await this.userRepository.updateToPullFromArray(userId, {
                $pull: { likePostId: postId }
            });
            
            await this.postRepository.updateToPullFromArray(postId, {
                $pull: { likedUserId: userId }
            });
            
            await this.notifications.create({
                userId: userId,
                type: NotificationType.LIKE_ACCEPTED,
                meta: {
                    postId: postId,
                    actorId: id
                }
            });
            
            for (const memberId of post.memberId) {
                await this.notifications.create({
                    userId: memberId,
                    type: NotificationType.MEMBER_JOINED,
                    meta: {
                        postId: postId,
                        actorId: userId
                    }
                });
            }
                        
        } catch (error) {
            console.error('Error in updateMember:', error);
            throw error;
        }
    }

    async deleteLikePostId(id: string, postId:string, userId:string) {
        await this.checkAuthor(id, postId);

        await this.userRepository.updateToPullFromArray(userId,
            {$pull: {likePostId: postId}}    
        );

        await this.postRepository.updateToPullFromArray(postId, {$pull: {likedUserId: userId}});

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

        await this.userRepository.updateToPullFromArray(userId,
            {$pull: {joinPostId: postId}}
        );

        const post = await this.postRepository.findById(postId);
        if (post == undefined)
            throw new NotFoundException();
        
        const newCurrentPerson = post.currentPerson - 1;

        return await this.postRepository.updateToAddToArrayAndSet(postId, {$pull: {memberId: userId},
            currentPerson: newCurrentPerson});
    }

    async search(keyword: string, userId: string){
        if (!keyword)
            throw new BadRequestException();

        const posts = await this.postRepository.search(keyword);
        
        const postList: SearchPostDto[] = await Promise.all(posts.map(async item => {
                const authorUser = await this.userRepository.findById(item.authorId);
                const author : SearchAuthor = {
                    nickname: authorUser?.nickname ?? 'Unknown',
                    profileImageUrl: authorUser?.profileImageUrl ?? process.env.DEFAULT_PROFILE_IMAGE_URL!
                };
                let isBookmark: boolean;
                if (this.isValidToken(userId))
                    isBookmark = await this.userRepository.isBookmark(userId, item._id);
                else
                    isBookmark = false;
                
                return {
                    _id: item._id.toString(),
                    title: item.title,
                    startDate: DateUtils.formatDate(item.startDate),
                    maxPerson: item.maxPerson,
                    currentPerson: item.currentPerson,
                    author: author,
                    isBookmark
                }
            })
        );

        return postList;
    }
}