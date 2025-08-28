// src/auth/guards/optional-jwt-auth.guard.ts

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    // 토큰이 없거나 유효하지 않아도 에러를 던지지 않고 null 반환
    if (err || !user) {
      return null;
    }
    return user;
  }
}