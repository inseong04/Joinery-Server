import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { VerificationSchema } from 'src/auth/schema/verification.schema';
import { PostSchema } from 'src/post/schema/post.schema';

@Module({
  imports:[ MongooseModule.forFeature([{name: 'User', schema:VerificationSchema}, {name:'Post', schema:PostSchema}]),],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
