interface NotificationDocument {
    userId: string;
    type: string;
    message: string;
    meta: Record<string, any>;
    isRead: boolean;
    readAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}