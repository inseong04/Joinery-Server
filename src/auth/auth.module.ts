import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schema/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './guard/jwt.strategy';
import { GoogleStrategy } from './guard/google/google.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MailerModule } from '@nestjs-modules/mailer';
import { mailerConfig } from 'src/config/mailer.config';
import { mailVerificationSchema } from './schema/mail-verification.schema';

@Module({
  imports: [
    MailerModule.forRootAsync(new mailerConfig()),
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema},
      { name: 'MailVerification', schema: mailVerificationSchema},
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('SECRET');
        
        return {
          secret: secret,
          signOptions: { 
            expiresIn: configService.get<string>('JWT_EXPIRES_IN')
          },
        };
      },
      inject: [ConfigService],
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [JwtModule] // JWT 모듈을 export
})
export class AuthModule {}
