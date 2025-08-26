export class NotificationDto {
        userId:string;
        type:string;
        message:string;
        meta: Record<string, any>;
        readAt?: Date | null;
        isRead?: boolean | null;
}