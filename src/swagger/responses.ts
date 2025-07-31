// 공통 API 응답 스키마들
export const CommonResponses = {
  // 성공 응답
  success: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'success' }
    }
  },

  // 인증 실패 응답
  unauthorized: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Unauthorized' },
      error: { type: 'string', example: 'Unauthorized' },
      statusCode: { type: 'number', example: 401 }
    }
  },

  // 검증 실패 응답
  validationError: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Validation failed' },
      error: { type: 'string', example: 'Bad Request' },
      statusCode: { type: 'number', example: 400 }
    }
  },

  // 리소스 없음 응답
  notFound: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Not found' },
      error: { type: 'string', example: 'Not Found' },
      statusCode: { type: 'number', example: 404 }
    }
  },

  // 권한 없음 응답
  forbidden: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Forbidden' },
      error: { type: 'string', example: 'Forbidden' },
      statusCode: { type: 'number', example: 403 }
    }
  },

  // 충돌 응답
  conflict: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Conflict' },
      error: { type: 'string', example: 'Conflict' },
      statusCode: { type: 'number', example: 409 }
    }
  }
};

// 로그인 응답 스키마
export const LoginResponse = {
  type: 'object',
  properties: {
    accessToken: {
      type: 'string',
      description: 'JWT 액세스 토큰',
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    },
    user: {
      type: 'object',
      properties: {
        id: { type: 'string', example: '507f1f77bcf86cd799439011' },
        username: { type: 'string', example: 'user123' },
        nickname: { type: 'string', example: '여행러버' }
      }
    }
  }
};

// 회원가입 응답 스키마
export const SignUpResponse = {
  type: 'object',
  properties: {
    id: { type: 'string', example: '507f1f77bcf86cd799439011' },
    username: { type: 'string', example: 'user123' },
    nickname: { type: 'string', example: '여행러버' },
    gender: { type: 'number', example: 0, description: '0: 남자, 1: 여자' },
    birthDate: { type: 'string', example: '1990-01-01' },
    tripStyle: { 
      type: 'array', 
      items: { type: 'string' },
      example: ['자연', '문화', '맛집']
    },
    userDescription: { type: 'string', example: '여행을 좋아하는 사람입니다.' },
    createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
  }
};

// 사용자 정보 응답 스키마
export const UserResponse = {
  type: 'object',
  properties: {
    id: { type: 'string', example: '507f1f77bcf86cd799439011' },
    username: { type: 'string', example: 'user123' },
    nickname: { type: 'string', example: '여행러버' },
    gender: { type: 'number', example: 0, description: '0: 남자, 1: 여자' },
    birthDate: { type: 'string', example: '1990-01-01' },
    tripStyle: { 
      type: 'array', 
      items: { type: 'string' },
      example: ['자연', '문화', '맛집']
    },
    userDescription: { type: 'string', example: '여행을 좋아하는 사람입니다.' },
    interestRegion: { 
      type: 'array', 
      items: { type: 'object' },
      example: [{ id: 1, name: '서울' }, { id: 2, name: '부산' }]
    },
    createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
  }
};

// 게시글 상세 응답 스키마
export const PostDetailResponse = {
  type: 'object',
  properties: {
    id: { type: 'string', example: '507f1f77bcf86cd799439011' },
    title: { type: 'string', example: '서울 여행 후기' },
    content: { type: 'string', example: '서울에서 즐거운 시간을 보냈습니다...' },
    author: { 
      type: 'object',
      properties: {
        id: { type: 'string', example: '507f1f77bcf86cd799439012' },
        nickname: { type: 'string', example: '여행러버' }
      }
    },
    region: { 
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: '서울' }
      }
    },
    schedule: {
      type: 'object',
      properties: {
        startDate: { type: 'string', example: '2024-01-01' },
        endDate: { type: 'string', example: '2024-01-03' }
      }
    },
    isLiked: { type: 'boolean', example: true },
    likeCount: { type: 'number', example: 5 },
    createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
  }
};

// 인기 지역 응답 스키마
export const PopularRegionsResponse = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      count: { type: 'number', example: 9, description: '해당 지역의 게시글 수' },
      regionId: { type: 'number', example: 3, description: '지역 ID' },
      regionName: { type: 'string', example: '서울', description: '지역명' }
    }
  },
  example: [
    { count: 15, regionId: 1, regionName: '서울' },
    { count: 12, regionId: 2, regionName: '부산' },
    { count: 8, regionId: 3, regionName: '제주' },
    { count: 6, regionId: 4, regionName: '경주' },
    { count: 4, regionId: 5, regionName: '강릉' }
  ]
}; 