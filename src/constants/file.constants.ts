// 파일 업로드 관련 상수
export const FILE_CONSTANTS = {
  // 허용된 이미지 MIME 타입
  ALLOWED_IMAGE_TYPES: ['image/png', 'image/jpeg', 'image/jpg'],
  
  // 허용된 이미지 확장자
  ALLOWED_IMAGE_EXTENSIONS: ['png', 'jpeg', 'jpg'],
  
  // 파일 업로드 경로
  UPLOAD_PATH: 'uploads/',
  
  // 최대 파일 크기 (5MB)
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  
  // 에러 메시지
  ERROR_MESSAGES: {
    INVALID_FILE_TYPE: '지원하지 않는 파일 형식입니다. PNG, JPEG, JPG 파일만 업로드 가능합니다.',
    FILE_TOO_LARGE: '파일 크기가 너무 큽니다. 5MB 이하의 파일만 업로드 가능합니다.',
    FILE_REQUIRED: '업로드할 파일이 없습니다.',
    DELETE_FAILED: '파일 삭제에 실패했습니다.',
    INVALID_S3_URL: '유효하지 않은 S3 URL입니다.'
  }
}; 