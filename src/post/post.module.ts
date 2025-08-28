import { Module } from '@nestjs/common';
import { PostController } from './presentation/post.controller';
import { PostService } from './application/post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { newPostSchema, PostSchema } from './infrastructure/schema/post.schema';
import { User, UserSchema } from 'src/auth/infrastructure/schema/user.schema';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { MongoPostRepository } from './infrastructure/post-repository';
import { MongoUserRepository } from 'src/auth/infrastructure/user-repository';

@Module({
  imports:[  
    MongooseModule.forFeature([{
       name: 'Post', schema: newPostSchema }, 
       {name:'User', schema: UserSchema}]),
    NotificationsModule
      
      ],
  controllers: [PostController],
  providers: [PostService,
    {
      provide: 'PostRepository',
      useClass: MongoPostRepository
    },
    {
      provide: 'UserRepository',
      useClass: MongoUserRepository
    }
  ]
})
export class PostModule {}
