import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy){
    constructor(configService: ConfigService) {
        const secret = configService.get<string>('SECRET') || 'helloworld';
        
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: secret,
        });
    }

    async validate(payload:any){
        return { userId: payload.sub, username: payload.username };
    }
}

// auth.service.ts 의 validate 로 생성할때는
//         const payload = { username: user.username, sub: user._id };
// 서로 달라서 이런 무제 발생하는듯함.