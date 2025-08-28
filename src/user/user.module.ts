import { Module } from '@nestjs/common';
import { UserController } from './presentation/user.controller';
import { UserService } from './application/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from 'src/auth/infrastructure/schema/user.schema';
import { PostSchema } from 'src/post/infrastructure/schema/post.schema';
import { UploadModule } from 'src/upload/upload.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { multerOptionsFactory } from 'src/config/multer.config';
import { AuthModule } from 'src/auth/auth.module';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MongoUserRepository } from 'src/auth/infrastructure/user-repository';

@Module({
  imports:[
    AuthModule,
    NotificationsModule,
    MongooseModule.forFeature([{name: 'User', schema:UserSchema}, {name:'Post', schema:PostSchema}]),
    UploadModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: multerOptionsFactory,
      inject: [ConfigService],
    }),
  ],
  controllers: [UserController],
  providers: [UserService,
    {
      provide:'UserRepository',
      useClass:MongoUserRepository
    }
  ]
})
export class UserModule {}
