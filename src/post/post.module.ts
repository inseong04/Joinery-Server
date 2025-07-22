import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { newPostSchema, PostSchema } from './schema/post.schema';

@Module({
  imports:[  MongooseModule.forFeature([{ name: 'Post', schema: newPostSchema }]),],
  controllers: [PostController],
  providers: [PostService]
})
export class PostModule {}
