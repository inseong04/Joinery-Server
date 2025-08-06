import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { UploadService } from './upload.service';
import * as multerS3 from 'multer-s3';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

export const createMulterConfig = (uploadService: any): MulterOptions => {
    // 런타임에서 안전하게 체크
    if (!uploadService || typeof uploadService.getS3 !== 'function' || typeof uploadService.getBucket !== 'function') {
        throw new Error('UploadService is not properly configured');
    }

    const s3 = uploadService.getS3();
    const bucket = uploadService.getBucket();

    if (!s3 || !bucket) {
        throw new Error('S3 configuration is not available');
    }

    return {
        storage: multerS3({
            s3: s3 as any,
            bucket: bucket,
            acl: 'public-read',
            contentType: multerS3.AUTO_CONTENT_TYPE,
            key: (req, file, cb) => {
                const ext = extname(file.originalname);
                const fileName = `${uuidv4()}${ext}`;
                cb(null, `images/${fileName}`);
            }
        }),
        fileFilter: (req, file, cb) => {
            const allowedMimeTypes = [
                'image/jpeg',
                'image/png',
                'image/webp',
                'image/jpg',
                'image/gif'
            ];
            
            if (allowedMimeTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('지원하지 않는 파일 형식입니다.'), false);
            }
        },
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        }
    };
}; 