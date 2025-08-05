import { MulterOptions } from "@nestjs/platform-express/multer/interfaces/multer-options.interface";
import { UploadService } from "./upload.service";
import * as multerS3 from 'multer-s3';
import { extname } from "path";
import { v4 as uuidv4 } from 'uuid';

export const createMulterOptions = (uploadService: UploadService): MulterOptions => ({
    storage: multerS3({
        s3: uploadService.getS3() as any, // AWS SDK v3 호환성을 위한 타입 캐스팅
        bucket: uploadService.getBucket(),
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        key: (req, file, cb) => {
            const ext = extname(file.originalname);
            const fileName = `${uuidv4()}${ext}`;
            cb(null, fileName);
        }
    }),
    fileFilter: (req, file, cb) => {
        // 허용된 파일 타입 검증
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/jpg'
        ];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('지원하지 않는 파일 형식입니다.'), false);
        }
    }
});