import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { NotificationMetaMap, NotificationType, TEMPLATES } from '../types/notifications.types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotificationDto } from '../presentation/dto/notification.dto';
import { PostSchema } from 'src/post/infrastructure/schema/post.schema';
import { User } from 'src/auth/infrastructure/schema/user.schema';
import { NotificationRepository } from './interfaces/notification-repository.interface';

@Injectable()
export class NotificationsService {
    constructor(
    @Inject('NotificationRepository') private readonly notificationRepository: NotificationRepository,
    @InjectModel('Post') private postModel: Model<PostSchema>,
    @InjectModel('User') private userModel: Model<User>
){}

    private render(tpl:string, params: Record<string, any>) {
        return tpl.replace(/\{\{(\w+)\}\}/g, (_, k) => String(params?.[k] ?? ''));
    }


    private async enrichMetaData<T extends NotificationType>(
        type: T, 
        meta: NotificationMetaMap[T]
    ): Promise<Record<string, any>> {
        const enrichedMeta = { ...meta };
    
        // 항상 postTitle 조회
        try {
            const post = await this.postModel.findById(meta.postId).select('title').lean();
            if (post) {
                enrichedMeta.postTitle = post.title;
            }
        } catch (error) {
            console.error('Failed to fetch post title:', error);
        }
    
        // 항상 name 조회 (actorId가 있는 경우)
        if (meta.actorId) {
            try {
                const user = await this.userModel.findById(meta.actorId).select('nickname').lean();
                if (user) {
                    enrichedMeta.name = user.nickname;
                }
            } catch (error) {
                console.error('Failed to fetch user name:', error);
            }
        }
    
        return enrichedMeta;
    }

    private async checkDuplicate<T extends NotificationType>(
        userId: string,
        type: T,
        meta: NotificationMetaMap[T]
    ): Promise<boolean> {
        // 읽지 않은 알림만 중복 체크
        const existingNotification = this.notificationRepository.findByField({
            userId: userId,
            type: type,
            'meta.postId': meta.postId,
            isRead: false
        });

        return !existingNotification;
    }

    /*
    create 사용방법
    1. NotificationsModule 내보내기 (export)
    2. 사용하는 쪽 모듈에서 import
    3. 사용하는 서비스에서 DI 받고 호출
    4. create 함수 호출   
    example)
        await this.notifications.create({
            userId: post.authorId,
            type: NotificationType.LIKE,
            meta: {
                postId:id,
                actorId: userId
            },
        });
    */
    
    /**
     * 
     * @param {string} userId 알림 받을 대상 (게시글 작성자 id 등)
     * @param {NotificationType} type 알림 타입
     * @param {NotificationMetaMap[T]} meta 알림 메타 데이터. postId: 게시글 id, actorId: 알림 발생자 id
     */
    async create<T extends NotificationType>(args: {
        userId:string;
        type:T;
        meta: NotificationMetaMap[T];
    }) {
        console.log(args.userId, args.type, args.meta);
        const isDuplicate = await this.checkDuplicate(args.userId, args.type, args.meta);
        if (isDuplicate) {
            return; // 중복이면 알림 생성하지 않음
        }

        const enrichedMeta = await this.enrichMetaData(args.type, args.meta);
        const message = this.render(TEMPLATES[args.type], enrichedMeta);
        const createNotification = new NotificationDto();
        createNotification.userId = args.userId;
        createNotification.type = args.type;
        createNotification.meta = args.meta;
        createNotification.message = message;
        createNotification.isRead = false;

        await this.notificationRepository.create(createNotification);
    }

    async getAllNotification(userId:string){
        return await this.notificationRepository.findAllById(userId);
    }

    async getNotificationsLastWeek(userId:string){
        return await this.notificationRepository.findByIdWithLastWeek(userId);
    }

    async isReadCheck(id:string, userId:string){
        const notification = await this.notificationRepository.findById(id);
        if (!notification)
            throw new NotFoundException();
        if (notification.userId != userId) 
            throw new BadRequestException();
        
        await this.notificationRepository.isReadCheck(id);
    }

}
