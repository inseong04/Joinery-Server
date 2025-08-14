import { Body, Controller, Get, Post, Res, UseGuards, BadRequestException, ConflictException, Req, Delete, Patch } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { Verification, VerificationSchema } from './schema/verification.schema';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiHideProperty, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/signin.dto';
import { Response, Request } from 'express';
import { JwtAuthGuard } from './guard/auth.guard';
import { CommonResponses, LoginResponse, SignUpResponse, SignUpConflictResponse, GoogleOAuthResponses, UserResponses } from '../swagger/responses';
import { AuthGuard } from '@nestjs/passport';
import { AuthUser, CurrentUser } from './decorators/current-user.decorator';
import { GOOGLE_OAUTH_CONSTANTS } from '../constants/google-oauth.constants';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

/**
 * 인증 관련 API 컨트롤러
 * 
 * Google OAuth 설정 및 사용방법은 /auth/google-oauth-info 엔드포인트를 참조하세요.
 */
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @ApiOperation({
        summary:'로그인',
        description: '사용자 아이디와 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.'
    })
    @ApiBody({
        type: SignInDto,
        description: '로그인 정보'
    })
    @ApiCreatedResponse({
        description: '로그인 성공 시 JWT 토큰 반환',
        schema: {
            type: 'object',
            properties: {
                accessToken: {
                    type: 'string',
                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    description: 'JWT 액세스 토큰'
                }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: '로그인 실패 - 잘못된 아이디 또는 비밀번호',
        schema: CommonResponses.unauthorized
    })
    @Post('/sign-in')
    async signIn(@Body() signInDto: SignInDto, @Res() res: Response): Promise<any> {
        const jwt = await this.authService.validateUser(signInDto);
        res.setHeader('Authorization', 'Bearer '+jwt?.accessToken);
        return res.json(jwt);
    }

    @ApiOperation({
        summary:'회원가입',
        description: '새로운 사용자 계정을 생성합니다. 아이디, 비밀번호, 닉네임, 성별, 생년월일, 여행 스타일, 자기소개가 필요합니다.'
    })
    @ApiBody({ 
        type: SignUpDto,
        description: '회원가입 정보'
    })
    @ApiCreatedResponse({
        description: '회원가입 성공시 생성된 사용자 정보 반환',
        schema: SignUpResponse
    })
    @ApiResponse({
        status: 400,
        description: '회원가입 실패 - 잘못된 입력 데이터',
        schema: CommonResponses.validationError
    })
    @ApiResponse({
        status: 409,
        description: '회원가입 실패 - 이미 존재하는 아이디',
        schema: SignUpConflictResponse
    })
    @Post('/sign-up')
    async create(@Body() signUpDto:SignUpDto) : Promise<Verification> {
        try {
            return await this.authService.create(signUpDto);
        } catch (error) {
            if (error.message === '이미 존재하는 아이디입니다.') {
                throw new ConflictException('이미 존재하는 아이디입니다.');
            }
            throw new BadRequestException('회원가입에 실패했습니다.');
        }
    }

    @ApiOperation({
        summary: 'Google OAuth 로그인 시작',
        description: 'Google OAuth 인증 프로세스를 시작합니다. 사용자를 Google 로그인 페이지로 리다이렉트합니다.'
    })
    @ApiResponse({
        status: 302,
        description: 'Google OAuth 인증 페이지로 리다이렉트'
    })
    @ApiResponse({
        status: 500,
        description: 'Google OAuth 설정 오류',
        schema: GoogleOAuthResponses.serverError
    })
    @Get('/sign-in/google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req: Request){}

    @ApiOperation({
        summary: 'Google OAuth 콜백 처리',
        description: 'Google OAuth 인증 완료 후 콜백을 처리하고 JWT 토큰을 발급합니다.'
    })
    @ApiCreatedResponse({
        description: 'Google OAuth 로그인 성공 시 JWT 토큰 반환',
        schema: GoogleOAuthResponses.callbackSuccess
    })
    @ApiResponse({
        status: 401,
        description: 'Google OAuth 인증 실패 또는 사용자 검증 실패',
        schema: CommonResponses.unauthorized
    })
    @ApiResponse({
        status: 500,
        description: 'Google OAuth 처리 중 서버 오류',
        schema: GoogleOAuthResponses.serverError
    })
    @Get('/sign-in/google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@AuthUser() user: any, @Res() res: Response){
        // profile.id를 username으로 사용하여 SignInDto 생성
        const signInDto = new SignInDto();
        signInDto.username = user.username; // profile.id 값
        signInDto.password = 'google-user'; // Google 사용자는 임시 비밀번호
        
        const jwt = await this.authService.validateUser(signInDto);
        
        if (!jwt || !jwt.accessToken) {
            // JWT 토큰 생성 실패 시 에러 페이지로 리다이렉트
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
            return res.redirect(`${frontendUrl}/auth/error?message=token_generation_failed`);
        }
        
        // 프론트엔드로 리다이렉트하면서 JWT 토큰을 쿼리 파라미터로 전달
        // 프론트엔드의 실제 URL로 변경 (예: React 앱의 기본 URL)
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        return res.redirect(`${frontendUrl}/?token=${jwt.accessToken}`);
    }

    @ApiOperation({
        summary: '비밀번호 변경',
        description: '현재 로그인한 사용자의 비밀번호를 새로운 비밀번호로 변경합니다.'
    })
    @ApiBody({
        type: UpdatePasswordDto,
        description: '새로운 비밀번호 정보'
    })
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: '비밀번호 변경 성공',
        schema: UserResponses.updatePasswordSuccess
    })
    @ApiResponse({
        status: 400,
        description: '잘못된 비밀번호 형식',
        schema: CommonResponses.validationError
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패 - 유효하지 않은 JWT 토큰',
        schema: CommonResponses.unauthorized
    })
    @ApiResponse({
        status: 404,
        description: '사용자를 찾을 수 없음',
        schema: CommonResponses.notFound
    })
    @ApiResponse({
        status: 500,
        description: '서버 오류 - 비밀번호 변경 중 오류 발생',
        schema: UserResponses.updatePasswordError
    })
    @UseGuards(JwtAuthGuard)
    @Patch('password')
    async updatePassword(@CurrentUser() id: string, @Body() updatePasswordDto: UpdatePasswordDto) {
        return await this.authService.updatePassword(id, updatePasswordDto.password);
    }

    @ApiOperation({
        summary: 'Google OAuth 설정 정보',
        description: 'Google OAuth 설정에 필요한 정보와 사용방법을 제공합니다.'
    })
    @ApiOkResponse({
        description: 'Google OAuth 설정 정보',
        schema: GoogleOAuthResponses.oauthInfo
    })
    @Get('/google-oauth-info')
    async getGoogleOAuthInfo() {
        return {
            message: 'Google OAuth 설정 정보',
            requiredEnvVars: Object.values(GOOGLE_OAUTH_CONSTANTS.ENV_VARS),
            callbackUrl: GOOGLE_OAUTH_CONSTANTS.URLS.DEFAULT_CALLBACK,
            authUrl: GOOGLE_OAUTH_CONSTANTS.URLS.AUTH,
            setupGuide: GOOGLE_OAUTH_CONSTANTS.SETUP_GUIDE.TITLE,
            setupSteps: GOOGLE_OAUTH_CONSTANTS.SETUP_GUIDE.STEPS,
            securityNotes: GOOGLE_OAUTH_CONSTANTS.SECURITY_NOTES,
            usageGuide: GOOGLE_OAUTH_CONSTANTS.USAGE_GUIDE
        };
    }

    @ApiOperation({
        summary: 'Google OAuth 테스트',
        description: 'Google OAuth 설정이 제대로 되어 있는지 테스트합니다.'
    })
    @Get('/google-oauth-test')
    async googleOAuthTest() {
        return {
            message: 'Google OAuth 테스트',
            clientId: process.env.GOOGLE_CLIENT_ID ? '설정됨' : '설정되지 않음',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ? '설정됨' : '설정되지 않음',
            callbackUrl: 'https://port-0-joinery-md0easjwbfa8cb98.sel5.cloudtype.app/auth/sign-in/google/callback',
            testUrl: 'http://localhost:3000/auth/sign-in/google'
        };
    }

    @ApiOperation({
        summary: '사용자 계정 삭제',
        description: '현재 로그인한 사용자의 계정을 영구적으로 삭제합니다. 삭제된 계정은 복구할 수 없습니다.'
    })
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: '사용자 계정 삭제 성공',
        schema: UserResponses.deleteUserSuccess
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패 - 유효하지 않은 JWT 토큰',
        schema: CommonResponses.unauthorized
    })
    @ApiResponse({
        status: 404,
        description: '사용자를 찾을 수 없음',
        schema: CommonResponses.notFound
    })
    @ApiResponse({
        status: 500,
        description: '서버 오류 - 계정 삭제 중 오류 발생',
        schema: UserResponses.deleteUserError
    })
    @UseGuards(JwtAuthGuard)
    @Delete()
    async deleteUser(@CurrentUser() id: string) {
        return this.authService.deleteUser(id);
    }

}
