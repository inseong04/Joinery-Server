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
    async isAllReadCheck(id: string) {
        const notifications = await this.notificationModel.find({userId: id}, {isRead: false}).lean();

        notifications.forEach(async (item) => {
            await this.notificationModel.updateOne(
                { _id: item._id},
                { $set: { isRead: true}}
            );
        });
    }


    async create(notificationData: NotificationDto) {
        const newNotification = new this.notificationModel(notificationData);
        await newNotification.save();
    }

    async findById(id: string): Promise<Notification | null> {
        return await this.notificationModel.findOne({_id: id}).lean();
    }

    async findAllById(id: string): Promise<Notification[] | null> {
        return await this.notificationModel.find({userId: id}).lean();
    }

    async findByIdWithLastWeek(id: string): Promise<Notification[] | null> {
        const sevenDays = new Date();
        sevenDays.setDate(sevenDays.getDate() - 7);
        const notifications = await this.notificationModel.find({
            userId: id,
            createdAt: { $gte: sevenDays }
        }).sort({ createdAt: -1 }).lean();
        return notifications as Notification[] | null;
    }

    async findByField(notificationData: Partial<NotificationDto>): Promise<Notification | null> {
        return await this.notificationModel.findOne(notificationData).lean();
    }

    async isReadCheck(id: string): Promise<Notification | null>{
        return await this.notificationModel.findByIdAndUpdate(id,
            {$set:{ isRead:true } }
        ).lean();    
    }
    
}