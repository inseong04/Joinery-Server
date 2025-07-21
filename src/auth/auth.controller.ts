import { Body, Controller, Get, Post, Res, } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { Verification } from './schema/verification.schema';
import { AuthService } from './auth.service';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/signin.dto';
import { Response } from 'express';

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
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFzZDMzM2YxMjM0Iiwic3ViIjoiNjg3ZTMzZDgyNjQ3OTQ3MmI4ZDI4MTc1IiwiaWF0IjoxNzUzMTA2Mjc0fQ.oYlxOB1Mri6ZunfAzwGsr5fGCIp0DFiOHpxLc-UOTvA'
        }
    }
})
    @Post('/sign-in')
    async signIn(@Body() signInDto: SignInDto, @Res() res: Response): Promise<any> {
        const jwt = await this.authService.validateUser(signInDto);
        res.setHeader('Authorization', 'Bearer'+jwt?.accessToken);
        return res.json(jwt);
    }

    @ApiOperation({summary:'회원가입'})
    @ApiBody({ type:SignUpDto })
    @ApiCreatedResponse({description: '회원가입 성공시 body 그대로 반환',})
    @Post()
    async create(@Body() signUpDto:SignUpDto) : Promise<Verification> {
        return this.authService.create(signUpDto);
    }


}
