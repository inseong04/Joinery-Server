import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { VerificationSchema } from './schema/verification.schema';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: VerificationSchema}
    ]),
    JwtModule.register({secret: `${process.env.SECRET}`})
  ],
  controllers: [AuthController],
  providers: [AuthService,
  ]
})
export class AuthModule {}
