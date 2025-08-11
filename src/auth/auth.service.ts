import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Verification } from './schema/verification.schema';
import { SignUpDto } from './dto/signup.dto';
import DateUtils from 'src/utils/date.utill';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from './dto/signin.dto';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'src/types/passport';
import { UserDataModel } from './model/user-data.model';
import { Gender } from 'src/constants/user.constants';
@Injectable()
export class AuthService {
    constructor(
        @InjectModel('User') private verificationModel:Model<Verification>,    private jwtService:JwtService
    ) {}

    async validateUser(signInDto: SignInDto): Promise<{accessToken: string} | undefined> {

        console.log(signInDto);
        const user = await this.verificationModel.findOne({ username: signInDto.username }).select('+password');
        console.log(user);
        if (!user) throw new NotFoundException();

        if (user?.provider == 'local') {
            const isMatch = await bcrypt.compare(signInDto.password, user.password);
            if (!isMatch) throw new UnauthorizedException();
        }
            
        const payload = { username: user.username, sub: user._id };
        const accessToken = await this.jwtService.signAsync(payload);

        return { "accessToken": accessToken };
    }


    
    async create(signUpDto: SignUpDto): Promise<Verification> {
        // username 중복 체크
        const existingUser = await this.verificationModel.findOne({ username: signUpDto.username });
        if (existingUser) {
            throw new Error('이미 존재하는 아이디입니다.');
        }

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
        const savedUser = await createUser.save();
        
        // birthDate를 string으로 변환하여 응답
        const userResponse = savedUser.toObject();
        if (userResponse.birthDate) {
            userResponse.birthDate = DateUtils.formatDate(userResponse.birthDate) as any;
        }
        
        return userResponse;
    }

    async findOrCreateUserByGoogle(profile: Profile, userData?: UserDataModel){
        const user = await this.verificationModel.findOne({username:profile.id});

        if(user) {
            console.log("vcv");
            return user;
        }

        const newUser = new SignUpDto();
        newUser.username = profile.id;
        newUser.nickname = profile.displayName;

        const genderOfUser: string = userData?.genders?.[0].value; 
        if(genderOfUser == 'male') 
            newUser.gender = Gender.Male;
        else if(genderOfUser == 'female')
            newUser.gender = Gender.Female;
        else
            newUser.gender = Gender.Unspecified;

        if (userData?.birthdays?.[0]?.date) {
            const { year, month, day } = userData.birthdays[0].date;

            if (year && month && day && year > 1900 && year <= new Date().getFullYear()) {
                const birthDateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                newUser.birthDate = birthDateString as any;
            } else {
                newUser.birthDate = '1900-01-01' as any; // 유효하지 않은 날짜는 기본 날짜로 설정
            }
        } else {
            newUser.birthDate = '1900-01-01' as any; // 생년월일 정보가 없으면 기본 날짜로 설정
        }
        newUser.wrotePost= [];
        newUser.likePostId= [];
        newUser.joinPostId = [];
        newUser.interestRegion= [];
        newUser.profileImageUrl = process.env.DEFAULT_PROFILE_IMAGE_URL!;
        newUser.provider = 'google';

        const createUser = new this.verificationModel(newUser);

        return await createUser.save();
    }
}