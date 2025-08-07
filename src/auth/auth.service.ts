import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Verification } from './schema/verification.schema';
import { SignUpDto } from './dto/signup.dto';
import DateUtils from 'src/post/utils/date.utill';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/signin.dto';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
    constructor(
        @InjectModel('User') private verificationModel:Model<Verification>,    private jwtService:JwtService
    ) {}


    async validateUser(signInDto: SignInDto): Promise<{accessToken: string} | undefined> {
        const user = await this.verificationModel.findOne({ username: signInDto.username }).select('+password');
        if (!user) return undefined;
        const isMatch = await bcrypt.compare(signInDto.password, user.password);
        
        if (!isMatch) return undefined;
        
        const payload = { username: user.username, sub: user._id };
        const accessToken = await this.jwtService.signAsync(payload);
        return { "accessToken": accessToken };
    }
    
    async create(signUpDto: SignUpDto): Promise<Verification> {
        // 클라이언트에서 string(YYYY-MM-DD)로 받은 birthDate를 Date로 변환
        if (signUpDto.birthDate) {
            signUpDto.birthDate = new Date(signUpDto.birthDate) as any;
        }
        signUpDto.password = await bcrypt.hash(signUpDto.password, 10);
        signUpDto.wrotePost= [];
        signUpDto.likePostId= [];
        signUpDto.joinPostId = [];
        signUpDto.interestRegion= [];
        signUpDto.profileImageUrl = process.env.DEFAULT_PROFILE_IMAGE_URL!;
        const createUser = new this.verificationModel(signUpDto);
        return createUser.save();
    }
}
