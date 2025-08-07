import { BadRequestException, Injectable } from '@nestjs/common';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { createS3Client } from 'src/config/multer.config';

@Injectable()
export class UploadService {
    private s3Client: any;

    constructor(private configService: ConfigService) {
        this.s3Client = createS3Client(configService);
    }

    uploadFile(file: Express.MulterS3.File): string {
        if(!file){
            throw new BadRequestException('파일이 존재하지 않습니다.');
        }
        return file.location;
    }

    async deleteFile(fileUrl: string): Promise<boolean> {
        try {
            // S3 URL에서 키 추출
            const bucketName = this.configService.get('AWS_BUCKET_NAME');
            const key = this.extractKeyFromUrl(fileUrl, bucketName);
            
            if (!key) {
                throw new BadRequestException('유효하지 않은 S3 URL입니다.');
            }

            const deleteCommand = new DeleteObjectCommand({
                Bucket: bucketName,
                Key: key,
            });

            await this.s3Client.send(deleteCommand);
            return true;
        } catch (error) {
            console.error('S3 파일 삭제 실패:', error);
            throw new BadRequestException('파일 삭제에 실패했습니다.');
        }
    }

    private extractKeyFromUrl(fileUrl: string, bucketName: string): string | null {
        try {
            // 완전한 S3 URL인 경우
            if (fileUrl.startsWith('http')) {
                const url = new URL(fileUrl);
                const pathParts = url.pathname.split('/');
                // 첫 번째 요소는 빈 문자열이므로 제거하고 나머지를 조합
                return pathParts.slice(1).join('/');
            }
            
            // 상대 경로인 경우 (uploads/filename 형식)
            if (fileUrl.startsWith('uploads/')) {
                return fileUrl;
            }
            
            // 다른 형식의 경우
            return fileUrl;
        } catch (error) {
            console.error('URL 파싱 실패:', error);
            return null;
        }
    }
}
