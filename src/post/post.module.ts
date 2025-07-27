import { Module } from '@nestjs/common';
import { PostController } from './post.controller';
import { PostService } from './post.service';
import { MongooseModule } from '@nestjs/mongoose';
import { newPostSchema, PostSchema } from './schema/post.schema';
import { Verification, VerificationSchema } from 'src/auth/schema/verification.schema';

@Module({
  imports:[  MongooseModule.forFeature([{ name: 'Post', schema: newPostSchema }, {name:'User', schema: VerificationSchema}]),],
  controllers: [PostController],
  providers: [PostService]
})
export class PostModule {}
