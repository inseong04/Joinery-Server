// Google OAuth 관련 상수들
export const GOOGLE_OAUTH_CONSTANTS = {
  // 환경변수 이름들
  ENV_VARS: {
    CLIENT_ID: 'GOOGLE_CLIENT_ID',
    CLIENT_SECRET: 'GOOGLE_CLIENT_SECRET',
    CALLBACK_URL: 'GOOGLE_CALLBACK_URL'
  },

  // 기본 URL들
  URLS: {
    AUTH: '/auth/sign-in/google',
    CALLBACK: '/auth/sign-in/google/callback',
    DEFAULT_CALLBACK: 'http://localhost:3000/auth/sign-in/google/callback'
  },

  // Google Cloud Console 설정 가이드
  SETUP_GUIDE: {
    TITLE: 'Google OAuth 설정 가이드',
    STEPS: [
      'Google Cloud Console (https://console.cloud.google.com) 접속',
      '프로젝트 선택 또는 새 프로젝트 생성',
      '"API 및 서비스" > "사용자 인증 정보" 메뉴로 이동',
      '"사용자 인증 정보 만들기" > "OAuth 2.0 클라이언트 ID" 선택',
      '애플리케이션 유형: "웹 애플리케이션" 선택',
      '승인된 리다이렉트 URI에 콜백 URL 추가'
    ]
  },

  // 보안 주의사항
  SECURITY_NOTES: [
    'GOOGLE_CLIENT_SECRET은 절대 코드에 하드코딩하지 마세요',
    '환경변수나 설정 파일을 통해 안전하게 관리하세요',
    '운영환경에서는 HTTPS를 사용해야 합니다',
    '리다이렉트 URI는 정확히 일치해야 합니다'
  ],

  // 사용방법 가이드
  USAGE_GUIDE: {
    AUTH_START: {
      TITLE: 'Google OAuth 로그인 시작',
      STEPS: [
        '브라우저에서 /auth/sign-in/google 엔드포인트에 GET 요청을 보냅니다',
        'Google 로그인 페이지로 자동 리다이렉트됩니다',
        '사용자가 Google 계정으로 로그인하면 /auth/sign-in/google/callback으로 리다이렉트됩니다'
      ],
      NOTES: [
        '이 엔드포인트는 브라우저 환경에서만 정상 작동합니다',
        'Google OAuth 설정이 올바르게 구성되어야 합니다',
        '리다이렉트 URI가 Google Console에서 등록되어 있어야 합니다'
      ]
    },
    CALLBACK: {
      TITLE: 'Google OAuth 콜백 처리',
      STEPS: [
        'Google 로그인 완료 후 자동으로 이 엔드포인트로 리다이렉트됩니다',
        'Google에서 전달받은 인증 코드를 처리합니다',
        '사용자 정보를 검증하고 JWT 토큰을 발급합니다',
        '응답 헤더에 Authorization Bearer 토큰이 포함됩니다'
      ],
      NOTES: [
        '이 엔드포인트는 Google OAuth 콜백용으로만 사용됩니다',
        '직접 호출하지 마세요',
        'Google 계정이 처음 로그인하는 경우 자동으로 회원가입이 진행됩니다',
        'Google 사용자는 임시 비밀번호로 관리됩니다 (보안상 실제 비밀번호는 사용하지 않음)'
      ]
    }
  }
};
