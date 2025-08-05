import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';


@Injectable()
export class UploadService {
    private readonly s3: AWS.S3;
    private readonly bucket: string;

    constructor(private configService: ConfigService){
        this.s3 = new AWS.S3({
            credentials: {
                accessKeyId: configService.get('AWS_ACCESS_KEY_ID')!,
                secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY')!,
            },
            region: configService.get('AWS_REGION'),
        });

        this.bucket = configService.get('AWS_BUCKET_NAME')!;
    }

    getS3(){
        return this.s3;
    }

    getBucket(){
        return this.bucket;
    }

}
