import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { VerificationSchema } from 'src/auth/schema/verification.schema';
import { PostSchema } from 'src/post/schema/post.schema';
import { UploadModule } from 'src/upload/upload.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { multerOptionsFactory } from 'src/config/multer.config';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports:[
    AuthModule,
    NotificationsModule,
    MongooseModule.forFeature([{name: 'User', schema:VerificationSchema}, {name:'Post', schema:PostSchema}]),
    UploadModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: multerOptionsFactory,
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
