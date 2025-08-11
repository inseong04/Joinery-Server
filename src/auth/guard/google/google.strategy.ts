import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy} from 'passport-google-oauth20';
import { AuthService } from 'src/auth/auth.service';
import { Profile } from 'src/types/passport';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { UserDataModel } from 'src/auth/model/user-data.model';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:3000/auth/sign-in/google/callback',
      scope: ['profile', 'email', 'https://www.googleapis.com/auth/user.gender.read', 'https://www.googleapis.com/auth/user.birthday.read'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) : Promise<any>{
    
        // Google People API 클라이언트 - OAuth 액세스 토큰 사용
    const people = google.people({
      version: 'v1',
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    try {
      // gender와 birthday 정보 가져오기
      const userData = await people.people.get({
        resourceName: 'people/me',
        personFields: 'genders,birthdays',
      }); 

      const user = await this.authService.findOrCreateUserByGoogle(profile, userData.data as unknown as UserDataModel)

      if (!user){
          throw new UnauthorizedException();
      }

      return user;
    } catch (error) {      
        // People API 호출 실패 시 기본 프로필 정보만 사용
        const user = await this.authService.findOrCreateUserByGoogle(profile, undefined)

      if (!user){
          throw new UnauthorizedException();
      }

      return user;
    }
  }
}