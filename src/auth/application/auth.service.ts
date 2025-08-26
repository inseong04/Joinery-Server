import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException, UnauthorizedException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../infrastructure/schema/user.schema';
import { SignUpDto } from '../presentation/dto/signup.dto';
import DateUtils from 'src/utils/date.utill';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { SignInDto } from '../presentation/dto/signin.dto';
import { ConfigService } from '@nestjs/config';
import { Profile } from 'src/types/passport';
import { UserData } from './interfaces/user-data.interface';
import { Gender } from 'src/constants/user.constants';
import { MailerService } from '@nestjs-modules/mailer';
import { getRandomSixDigitString } from 'src/utils/random-num';
import { mailVerification } from '../infrastructure/schema/mail-verification.schema';
import { MailVerificationDto } from '../presentation/dto/mail-verification.dto';
import { UserRepository } from './interfaces/user-repository.interface';
@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);

    constructor(
        @Inject('UserRepository') private readonly userRepository: UserRepository,
        @InjectModel('MailVerification') private MailVerificationModel:Model<mailVerification>,
        private jwtService:JwtService,
        private readonly mailerService: MailerService,
    ) {}

    async validateUser(signInDto: SignInDto): Promise<{accessToken: string} | undefined> {

        const user = await this.userRepository.findByUsernameWithPassword(signInDto.username);
        if (!user) throw new NotFoundException();

        if (user?.provider == 'local') {
            const isMatch = await bcrypt.compare(signInDto.password, user.password);
            if (!isMatch) throw new UnauthorizedException();
        }
            
        const payload = { username: user.username, sub: user._id };
        const accessToken = await this.jwtService.signAsync(payload);
        
        return { "accessToken": accessToken };
    }


    
    async create(signUpDto: SignUpDto) {
        // username 중복 체크
        const existingUser = await this.userRepository.findByUsername(signUpDto.username);
        if (existingUser) {
            throw new ConflictException('이미 존재하는 아이디입니다.');
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
        signUpDto.bookmarkPostId = [];
        signUpDto.profileImageUrl = process.env.DEFAULT_PROFILE_IMAGE_URL!;
        
        await this.userRepository.create(signUpDto);
        
        // // birthDate를 string으로 변환하여 응답
        // const userResponse = savedUser.toObject();
        // if (userResponse.birthDate) {
        //     userResponse.birthDate = DateUtils.formatDate(userResponse.birthDate) as any;
        // }        
    }

    async sendMail(email: string): Promise<void> {
        const verificationCode = getRandomSixDigitString();
    
        await this.mailerService.sendMail({
            to:email,
            subject: "[Joinery] 이메일 인증번호",
            template:"./verification",
            context:{
                verificationCode,
            },
        });

        const verification = await this.MailVerificationModel.findOne({email:email});
        if (verification)
            throw new BadRequestException();

        const newVerification = new MailVerificationDto();
        newVerification.email = email;
        newVerification.verificationCode = verificationCode;
        const createVerification = new this.MailVerificationModel(newVerification);

        await createVerification.save();
    }

    async verifyMail(email:string, verificationCode: string){ 
        const verification = await this.MailVerificationModel.findOne({email:email});

        if (!verification)
            throw new NotFoundException();

        if (verification.verificationCode != verificationCode)
            throw new BadRequestException();

        await this.MailVerificationModel.deleteOne({email:email});
    }

    async updatePassword(id: string, password: string){
        const user = await this.userRepository.findById(id);
        if(!user)
            throw new NotFoundException();
        const provider = user.provider;
        if (provider == 'google')
            throw new BadRequestException();

        const hashedPassword = await bcrypt.hash(password, 10);
        await this.userRepository.updatePassword(id, hashedPassword);
    }

    async findOrCreateUserByGoogle(profile: Profile, userData?: UserData){
        const user = await this.userRepository.findByUsername(profile.id);
        
        if(user) {
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

        await this.userRepository.create(newUser);
    }

    async deleteUser(id: string) {
        await this.userRepository.delete(id);
    }
}