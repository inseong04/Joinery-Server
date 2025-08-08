import { Injectable, ParseFilePipe, FileValidator } from "@nestjs/common";
import { FILE_CONSTANTS } from "src/constants/file.constants";

class ImageFileValidator extends FileValidator {
    constructor() {
        super({});
    }

    isValid(file: any): boolean {
        return FILE_CONSTANTS.ALLOWED_IMAGE_TYPES.includes(file.mimetype);
    }

    buildErrorMessage(): string {
        return FILE_CONSTANTS.ERROR_MESSAGES.INVALID_FILE_TYPE;
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