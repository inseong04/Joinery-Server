import { Controller, Delete, Get, Param, Patch, UseGuards, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags, ApiBody, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Region } from 'src/constants/region-list.constant';
import { UserUpdateDto } from './dto/user.update.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){}

    @ApiOperation({
        summary:'유저 정보 수정',
        description: '현재 로그인한 사용자의 정보를 수정합니다. 닉네임, 자기소개, 여행 스타일을 변경할 수 있습니다.'
    })
    @ApiBearerAuth('access-token')
    @ApiBody({
        type: UserUpdateDto,
        description: '수정할 사용자 정보'
    })
    @ApiOkResponse({
        description: '사용자 정보 수정 성공',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                nickname: { type: 'string', example: '새로운닉네임' },
                userDescription: { type: 'string', example: '수정된 자기소개' },
                tripStyle: { 
                    type: 'array', 
                    items: { type: 'string' },
                    example: ['자연', '문화', '맛집']
                },
                updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Unauthorized' },
                error: { type: 'string', example: 'Unauthorized' },
                statusCode: { type: 'number', example: 401 }
            }
        }
    })
    @UseGuards(JwtAuthGuard)
    @Patch('')
    async updateUser(@CurrentUser() id: string, @Body() userUpdateDto: UserUpdateDto){
        return await this.userService.updateUser(id, userUpdateDto);
    }

    @ApiOperation({
        summary:'특정 사용자 정보 조회',
        description: '사용자 ID로 특정 사용자의 정보를 조회합니다.'
    })
    @ApiParam({
        name:'id', 
        type:'string',
        description: '조회할 사용자의 ID',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiOkResponse({
        description: '사용자 정보 조회 성공',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                username: { type: 'string', example: 'user123' },
                nickname: { type: 'string', example: '여행러버' },
                gender: { type: 'number', example: 0, description: '0: 남자, 1: 여자' },
                birthDate: { type: 'string', example: '1990-01-01' },
                tripStyle: { 
                    type: 'array', 
                    items: { type: 'string' },
                    example: ['자연', '문화', '맛집']
                },
                userDescription: { type: 'string', example: '여행을 좋아하는 사람입니다.' },
                interestRegion: { 
                    type: 'array', 
                    items: { type: 'object' },
                    example: [{ id: 1, name: '서울' }, { id: 2, name: '부산' }]
                },
                createdAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: '사용자를 찾을 수 없음',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'User not found' },
                error: { type: 'string', example: 'Not Found' },
                statusCode: { type: 'number', example: 404 }
            }
        }
    })
    @Get('/:id')
    async getUser(@Param('id') id:string){
        return this.userService.getUser(id);
    }

    @ApiOperation({
        summary:'관심지역 수정',
        description: '현재 로그인한 사용자의 관심지역 목록을 수정합니다.'
    })
    @ApiBearerAuth('access-token')
    @ApiBody({
        description: '관심지역 목록',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number', example: 1 },
                    name: { type: 'string', example: '서울' }
                }
            },
            example: [
                { id: 1, name: '서울' },
                { id: 2, name: '부산' },
                { id: 3, name: '제주' }
            ]
        }
    })
    @ApiOkResponse({
        description: '관심지역 수정 성공',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                interestRegion: { 
                    type: 'array', 
                    items: { type: 'object' },
                    example: [
                        { id: 1, name: '서울' },
                        { id: 2, name: '부산' },
                        { id: 3, name: '제주' }
                    ]
                },
                updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Unauthorized' },
                error: { type: 'string', example: 'Unauthorized' },
                statusCode: { type: 'number', example: 401 }
            }
        }
    })
    @UseGuards(JwtAuthGuard)
    @Patch('/interest-region')
    async updateInterestRegion(@CurrentUser() id: string, @Body() interestRegionList: Region[]){
        return this.userService.updateInterestRegion(id, interestRegionList);
    }

    @ApiOperation({
        summary:'관심지역 삭제',
        description: '현재 로그인한 사용자의 특정 관심지역을 삭제합니다.'
    })
    @ApiBearerAuth('access-token')
    @ApiBody({
        description: '삭제할 관심지역',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                name: { type: 'string', example: '서울' }
            },
            example: { id: 1, name: '서울' }
        }
    })
    @ApiOkResponse({
        description: '관심지역 삭제 성공',
        schema: {
            type: 'object',
            properties: {
                id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                interestRegion: { 
                    type: 'array', 
                    items: { type: 'object' },
                    example: [
                        { id: 2, name: '부산' },
                        { id: 3, name: '제주' }
                    ]
                },
                updatedAt: { type: 'string', example: '2024-01-01T00:00:00.000Z' }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Unauthorized' },
                error: { type: 'string', example: 'Unauthorized' },
                statusCode: { type: 'number', example: 401 }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: '삭제할 관심지역을 찾을 수 없음',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Interest region not found' },
                error: { type: 'string', example: 'Not Found' },
                statusCode: { type: 'number', example: 404 }
            }
        }
    })
    @UseGuards(JwtAuthGuard)
    @Delete('/interest-region')
    async deleteInterestRegion(@CurrentUser() id:string, @Body() deleteInterestRegion: Region){
        return this.userService.deleteInterestRegion(id, deleteInterestRegion);
    }
}
