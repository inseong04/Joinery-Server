export function extractS3KeyFromUrl(s3Url: string): string | null {
  try {
    // 1. 문자열을 URL 객체로 변환합니다.
    const url = new URL(s3Url);

    // 2. pathname을 가져옵니다.
    // 예: /uploads/1754537060858-다운로드.png
    const pathname = url.pathname;

    // 3. 맨 앞의 슬래시(/)를 제거하여 순수한 Key 값만 반환합니다.
    // pathname.substring(1) 또는 pathname.slice(1)을 사용할 수 있습니다.
    return pathname.startsWith('/') ? pathname.substring(1) : pathname;
  } catch (error) {
    console.error('유효하지 않은 URL입니다:', s3Url, error);
    return null; // 유효하지 않은 URL인 경우 null 반환
  }
}