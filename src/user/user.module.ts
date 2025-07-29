import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { VerificationSchema } from 'src/auth/schema/verification.schema';

@Module({
  imports:[ MongooseModule.forFeature([{name: 'User', schema:VerificationSchema}]),],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule {}
