import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { multerOptionsFactory } from 'src/config/multer.config';

@Module({
  imports: [
    ConfigModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: multerOptionsFactory,
      inject: [ConfigService],
    }),
  ],
  providers: [UploadService],
  exports:[UploadService],
})
export class UploadModule {}
