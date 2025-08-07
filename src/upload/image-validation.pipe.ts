import { Injectable, ParseFilePipe, FileValidator } from "@nestjs/common";

class ImageFileValidator extends FileValidator {
    constructor() {
        super({});
    }

    isValid(file: any): boolean {
        const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        return allowedMimeTypes.includes(file.mimetype);
    }

    buildErrorMessage(): string {
        return '지원하지 않는 파일 형식입니다. PNG, JPEG, JPG 파일만 업로드 가능합니다.';
    }
}

@Injectable()
export class ImageValidationPipe extends ParseFilePipe {
    constructor() {
        super({
            validators: [
                new ImageFileValidator(),
            ],
            fileIsRequired:false,
        })
    }
}