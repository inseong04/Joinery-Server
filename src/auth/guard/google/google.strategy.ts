import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy} from 'passport-google-oauth20';
import { AuthService } from 'src/auth/auth.service';
import { Profile } from 'src/types/passport';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthService,
  ) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'https://port-0-joinery-md0easjwbfa8cb98.sel5.cloudtype.app/auth/sign-in/google/callback',
      scope: ['profile', 'email', 'https://www.googleapis.com/auth/user.gender.read', 'https://www.googleapis.com/auth/user.birthday.read'],
    });
  }

  async validate(_at: string, _rt: string, profile: Profile) : Promise<any>{
    // 여기서 DB upsert 등 처리하고, 컨트롤러로 넘길 사용자 객체 리턴
    
    const user = await this.authService.findOrCreateUserByGoogle(profile)

    if (!user){
        throw new UnauthorizedException();
    }

    return user;
  }
}