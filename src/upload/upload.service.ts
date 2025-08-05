import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class UploadService {
    private readonly s3Client: S3Client;
    private readonly bucket: string;

    constructor(private configService: ConfigService){
        this.s3Client = new S3Client({
            region: configService.get('AWS_REGION'),
            credentials: {
                accessKeyId: configService.get('AWS_ACCESS_KEY_ID')!,
                secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY')!,
            },
        });

        this.bucket = configService.get('AWS_BUCKET_NAME')!;
    }

    getS3(){
        return this.s3Client;
    }

    getBucket(){
        return this.bucket;
    }
}
