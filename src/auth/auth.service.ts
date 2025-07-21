import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Verification } from './schema/verification.schema';
import { SignUpDto } from './dto/signup.dto';
import DateUtils from 'src/constants/date.utill';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/signin.dto';
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
        signUpDto.birthDate = DateUtils.momentNow();
        signUpDto.password = await bcrypt.hash(signUpDto.password, 10);
        const createUser = new this.verificationModel(signUpDto);
        return createUser.save();
    }
}
