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
    createdAt: { type: 'string', example: '2024-01-01 10' }
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
    createdAt: { type: 'string', example: '2024-01-01 10' }
  }
};

// 게시글 상세 응답 스키마
export const PostDetailResponse = {
  type: 'object',
  properties: {
    _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
    title: { type: 'string', example: '서울 여행 후기' },
    description: { type: 'string', example: '서울에서 즐거운 시간을 보냈습니다...' },
    region_id: { type: 'number', example: 14 },
    author: { 
      type: 'object',
      properties: {
        nickname: { type: 'string', example: '여행러버' },
        username: { type: 'string', example: 'user123' },
        profileImageUrl: { type: 'string', example: 'uploads/1754546984873-profile-image.png' }
      }
    },
    members: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          nickname: { type: 'string', example: '여행러버' },
          username: { type: 'string', example: 'user123' },
          profileImageUrl: { type: 'string', example: 'uploads/1754546984873-profile-image.png' }
        }
      }
    },
    schedule: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', example: '첫째 날 - 서울 도착' },
          description: { type: 'string', example: '서울 공항에서 만나서 호텔 체크인' },
          date: { type: 'string', example: '2024-12-31T15:00:00.000Z' }
        }
      }
    },
    startDate: { type: 'string', example: '2024-01-01 10' },
    endDate: { type: 'string', example: '2024-01-03 18' },
    maxPerson: { type: 'number', example: 5 },
    currentPerson: { type: 'number', example: 3 },
    tripStyle: { 
      type: 'array', 
      items: { type: 'string' },
      example: ['자연', '문화', '맛집']
    },
    heartType: { 
      type: 'number', 
      enum: [0, 1, 2],
      example: 0,
      description: '0: NoOne, 1: UserOnly, 2: Both'
    }
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

// 파일 업로드 응답 스키마
export const FileUploadResponse = {
  type: 'object',
  properties: {
    message: { type: 'string', example: 'success' },
    url: { type: 'string', example: 'uploads/1754546984873-profile-image.png' }
  }
};

// 파일 업로드 에러 응답 스키마
export const FileUploadErrorResponse = {
  type: 'object',
  properties: {
    message: { type: 'string', example: '지원하지 않는 파일 형식입니다. PNG, JPEG, JPG 파일만 업로드 가능합니다.' },
    error: { type: 'string', example: 'Bad Request' },
    statusCode: { type: 'number', example: 400 }
  }
};

// 회원가입 중복 아이디 에러 응답 스키마
export const SignUpConflictResponse = {
  type: 'object',
  properties: {
    message: { type: 'string', example: '이미 존재하는 아이디입니다.' },
    error: { type: 'string', example: 'Conflict' },
    statusCode: { type: 'number', example: 409 }
  }
};

// 게시글 목록 응답 스키마
export const PostListResponse = {
  type: 'array',
  items: {
    type: 'object',
    properties: {
      _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
      title: { type: 'string', example: '서울 여행 후기' },
      author: {
        type: 'object',
        properties: {
          nickname: { type: 'string', example: '테스트유저' },
          username: { type: 'string', example: 'testuser' },
          profileImageUrl: { type: 'string', example: 'uploads/1754546984873-profile-image.png' }
        }
      },
      startDate: { type: 'string', example: '2025-01-01' },
      endDate: { type: 'string', example: '2025-01-03' }
    }
  }
};

// 좋아요 응답 스키마
export const LikeResponse = {
  type: 'object',
  properties: {
    message: { type: 'string', example: 'success for updateLike' }
  }
};

// 게시글 삭제 응답 스키마
export const DeletePostResponse = {
  type: 'object',
  properties: {
    message: { type: 'string', example: 'success' }
  }
};

// Google OAuth 관련 응답 스키마들
export const GoogleOAuthResponses = {
  // Google OAuth 콜백 성공 응답
  callbackSuccess: {
    type: 'object',
    properties: {
      accessToken: {
        type: 'string',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        description: 'JWT 액세스 토큰'
      },
      user: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          username: { type: 'string', example: 'google_123456789' },
          nickname: { type: 'string', example: 'Google User' }
        }
      }
    }
  },

  // Google OAuth 설정 정보 응답
  oauthInfo: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Google OAuth 설정 정보' },
      requiredEnvVars: {
        type: 'array',
        items: { type: 'string' },
        example: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'GOOGLE_CALLBACK_URL']
      },
      callbackUrl: { type: 'string', example: 'http://localhost:3000/auth/sign-in/google/callback' },
      authUrl: { type: 'string', example: '/auth/sign-in/google' },
      setupGuide: { type: 'string', example: 'Google Cloud Console에서 OAuth 2.0 클라이언트 ID를 생성하고 승인된 리다이렉트 URI를 설정하세요.' }
    }
  },

  // Google OAuth 서버 오류 응답
  serverError: {
    type: 'object',
    properties: {
      message: { type: 'string', example: 'Google OAuth 설정 오류' },
      error: { type: 'string', example: 'Internal Server Error' },
      statusCode: { type: 'number', example: 500 }
    }
  }
};

// 사용자 관련 응답 스키마들
export const UserResponses = {
  // 사용자 계정 삭제 성공 응답
  deleteUserSuccess: {
    type: 'object',
    properties: {
      message: { type: 'string', example: '사용자 계정이 성공적으로 삭제되었습니다.' },
      deletedUserId: { type: 'string', example: '507f1f77bcf86cd799439011' }
    }
  },

  // 사용자 계정 삭제 서버 오류 응답
  deleteUserError: {
    type: 'object',
    properties: {
      message: { type: 'string', example: '계정 삭제 중 오류가 발생했습니다.' },
      error: { type: 'string', example: 'Internal Server Error' },
      statusCode: { type: 'number', example: 500 }
    }
  },

  // 비밀번호 변경 성공 응답
  updatePasswordSuccess: {
    type: 'object',
    properties: {
      message: { type: 'string', example: '비밀번호가 성공적으로 변경되었습니다.' },
      userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
      updatedAt: { type: 'string', example: '2024-01-01T10:00:00.000Z' }
    }
  },

  // 비밀번호 변경 서버 오류 응답
  updatePasswordError: {
    type: 'object',
    properties: {
      message: { type: 'string', example: '비밀번호 변경 중 오류가 발생했습니다.' },
      error: { type: 'string', example: 'Internal Server Error' },
      statusCode: { type: 'number', example: 500 }
    }
  }
}; 

// 멤버 관련 응답 스키마들
export const MemberResponses = {
  // 멤버 추가 성공 응답
  addMemberSuccess: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: '멤버가 성공적으로 추가되었습니다.' },
      postId: { type: 'string', example: '507f1f77bcf86cd799439011' },
      addedUserId: { type: 'string', example: '507f1f77bcf86cd799439012' }
    }
  },

  // 신청 거절 성공 응답
  rejectApplicationSuccess: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: '신청이 성공적으로 거절되었습니다.' },
      postId: { type: 'string', example: '507f1f77bcf86cd799439011' },
      rejectedUserId: { type: 'string', example: '507f1f77bcf86cd799439012' }
    }
  },

  // 멤버 삭제 성공 응답
  deleteMemberSuccess: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: '멤버가 성공적으로 삭제되었습니다.' },
      postId: { type: 'string', example: '507f1f77bcf86cd799439011' },
      removedUserId: { type: 'string', example: '507f1f77bcf86cd799439012' }
    }
  }
};