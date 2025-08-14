import { Injectable, Logger } from "@nestjs/common";
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
            ignoreExpiration: false,
        });
    }

    async validate(payload:any){
        
        // payload 유효성 검사
        if (!payload.sub || !payload.username) {
            return null;
        }
        
        return { sub: payload.sub, username: payload.username };
    }
}