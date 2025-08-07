import { BadRequestException, Injectable } from '@nestjs/common';

@Injectable()
export class UploadService {
    uploadFile(file: Express.MulterS3.File): string {
        if(!file){
            throw new BadRequestException('파일이 존재하지 않습니다.');
        }
        return file.location;
    }
}
