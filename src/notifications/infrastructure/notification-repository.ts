import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { NotificationRepository } from "../application/interfaces/notification-repository.interface";
import { NotificationDto } from "../presentation/dto/notification.dto";
import { Notification } from "./schema/notification.schema";

@Injectable()
export class MongoNotificationRepository implements NotificationRepository{
    constructor(
        @InjectModel('Notification') private notificationModel:Model<Notification>,
    ){}


    async create(notificationData: NotificationDto) {
        const newNotification = new this.notificationModel(notificationData);
        await newNotification.save();
    }

    async findById(id: string): Promise<Notification | null> {
        return await this.notificationModel.findOne({id});
    }

    async findByIdWithLastWeek(id: string): Promise<Notification | null> {
        const sevenDays = new Date();
        sevenDays.setDate(sevenDays.getDate() - 7);
        const notifications = await this.notificationModel.findOne({
            userId: id,
            createdAt: { $gte: sevenDays }
        }).sort({ createdAt: -1 });
        return notifications as Notification | null;
    }

    async findByField(notificationData: Partial<NotificationDto>): Promise<Notification | null> {
        return await this.notificationModel.findOne(notificationData);
    }

    async isReadCheck(id: string): Promise<Notification | null>{
        return await this.notificationModel.findByIdAndUpdate(id,
            {$set:{ isRead:true } }
        );    
    }
    
}