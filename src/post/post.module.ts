import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { newPostSchema, PostSchema } from './schema/post.schema';
import { User, UserSchema } from 'src/auth/schema/user.schema';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports:[  
    MongooseModule.forFeature([{
       name: 'Post', schema: newPostSchema }, 
       {name:'User', schema: UserSchema}]),
    NotificationsModule
      
      ],
  controllers: [PostController],
  providers: [PostService]
})
export class PostModule {}
