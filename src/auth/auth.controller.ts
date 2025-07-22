import { Body, Controller, Get, Post, Res, UseGuards, } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { Verification } from './schema/verification.schema';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiHeader, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/signin.dto';
import { Response } from 'express';
import { JwtAuthGuard } from './guard/auth.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    
    @ApiOperation({summary:'로그인'})
    @ApiBody({type:SignInDto})
@ApiCreatedResponse({
    description: '로그인 성공 시 JWT 토큰 반환',
    schema: {
        example: {
            accessToken: 'TOKEN KEY'
        }
    }
})
    @Post('/sign-in')
    async signIn(@Body() signInDto: SignInDto, @Res() res: Response): Promise<any> {
        const jwt = await this.authService.validateUser(signInDto);
        res.setHeader('Authorization', 'Bearer '+jwt?.accessToken);
        return res.json(jwt);
    }

    @ApiOperation({summary:'회원가입'})
    @ApiBody({ type:SignUpDto })
    @ApiCreatedResponse({description: '회원가입 성공시 body 그대로 반환',})
    @Post()
    async create(@Body() signUpDto:SignUpDto) : Promise<Verification> {
        return this.authService.create(signUpDto);
    }

    @ApiCreatedResponse({
    description: 'JWT 인증 성공',
    schema: {
        example: {
            message: 'success'
        }}})
    @ApiOperation({summary:'JWT token Test'})
    @ApiBearerAuth('token')
    @UseGuards(JwtAuthGuard)
    @Get('/token-test')
    async testToken() {
        return 'success'
    }
    


}
