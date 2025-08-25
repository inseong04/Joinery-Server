import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/auth/schema/user.schema';
import { mailVerificationSchema } from 'src/auth/schema/mail-verification.schema';
import { NotificationSchema } from './schema/notification.schema';
import { PostSchema } from 'src/post/schema/post.schema';

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
  providers: [NotificationsService],
  exports: [NotificationsService]
})
export class NotificationsModule {}
