import { S3Client } from "@aws-sdk/client-s3";
import { ConfigService } from "@nestjs/config";
import * as multerS3 from 'multer-s3';

export const createS3Client = (configService: ConfigService): S3Client => {
    return new S3Client({
        region: configService.get('AWS_REGION')!,
        credentials: {
            accessKeyId: configService.get('AWS_ACCESS_KEY_ID')!,
            secretAccessKey: configService.get('AWS_SECRET_ACCESS_KEY')!,
        },
    });
};

export const multerOptionsFactory = (configService: ConfigService) => {
    const s3 = createS3Client(configService);
    
    return {
        storage: multerS3({
            s3: s3,
            bucket: configService.get('AWS_BUCKET_NAME')!,
            acl: 'public-read',
            key: function(request, file, cb) {
                cb(null, `uploads/${Date.now().toString()}-${file.originalname}`);
            }
        }),
    };
};