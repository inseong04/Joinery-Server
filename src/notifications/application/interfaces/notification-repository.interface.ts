import { Notification } from "src/notifications/infrastructure/schema/notification.schema";
import { NotificationDto } from "src/notifications/presentation/dto/notification.dto";

export interface NotificationRepository {
    create(notificationData: NotificationDto);
    findById(id: string): Promise<Notification | null>;
    findByIdWithLastWeek(id: string): Promise<Notification | null>;
    findByField(notificationData: Partial<NotificationDto> & { 'meta.postId'?: string }): Promise<Notification | null>;
    isReadCheck(id: string);
}