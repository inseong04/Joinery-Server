import { Module } from '@nestjs/common';
import { NotificationsController } from './presentation/notifications.controller';
import { NotificationsService } from './application/notifications.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/auth/infrastructure/schema/user.schema';
import { mailVerificationSchema } from 'src/auth/infrastructure/schema/mail-verification.schema';
import { NotificationSchema } from './infrastructure/schema/notification.schema';
import { PostSchema } from 'src/post/infrastructure/schema/post.schema';
import { MongoNotificationRepository } from './infrastructure/notification-repository';

@Module({
  imports:[
        MongooseModule.forFeature([
          { name: 'User', schema: UserSchema},
          { name: 'MailVerification', schema: mailVerificationSchema},
          { name: 'Notification', schema: NotificationSchema},
          { name: 'Post', schema: PostSchema},
        ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService,   {
    provide:'NotificationRepository',
    useClass: MongoNotificationRepository
  }],

  exports: [NotificationsService]
})
export class NotificationsModule {}
