import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import * as mongoose from 'mongoose';
import { JwtModule } from '@nestjs/jwt';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';
import { UploadModule } from './upload/upload.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || ''),
    AuthModule,
    PostModule,
    UserModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
    private readonly isDev: boolean = process.env.NODE_ENV === 'dev' ? true : false;
    configure() {
        mongoose.set('debug', this.isDev); // mongoose 쿼리 logger
    }
}
