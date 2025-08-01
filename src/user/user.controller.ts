import { Controller, Delete, Get, Param, Patch, UseGuards, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags, ApiBody, ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { Region } from 'src/constants/region-list.constant';
import { UserUpdateDto } from './dto/user.update.dto';
import { CommonResponses, UserResponse } from '../swagger/responses';

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
        schema: UserResponse
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
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
        schema: UserResponse
    })
    @ApiResponse({
        status: 404,
        description: '사용자를 찾을 수 없음',
        schema: CommonResponses.notFound
    })
    @Get('/:id')
    async getUser(@Param('id') id:string){
        return this.userService.getUser(id);
    }

    @ApiOperation({summary:'참여한 동행 목록'})
    @ApiBearerAuth('token')
    @UseGuards(JwtAuthGuard)
    @Get('/application-post')
    async getApplicationPost(@CurrentUser() id: string){
        return this.userService.getApplicationPost(id);
    }

    @ApiOperation({summary:'작성한 동행'})
    @ApiBearerAuth('token')
    @UseGuards(JwtAuthGuard)
    @Get('/wrote-post')
    async getUserWrotePost(@CurrentUser() id: string) {
        return this.userService.getUserWrotePost(id);
    }

    @ApiOperation({
        summary:'관심지역 수정',
        description: '현재 로그인한 사용자의 관심지역 목록을 수정합니다.'
    })
    @ApiBearerAuth('access-token')
    @ApiBody({
        description: '관심지역 ID 목록 (숫자 배열)',
        schema: {
            type: 'array',
            items: {
                type: 'number',
                description: '지역 ID (0: 경기도, 1: 강원도, 2: 충청북도, 3: 충청남도, 4: 경상북도, 5: 경상남도, 6: 전라북도, 7: 전라남도, 8: 제주도, 9: 광주광역시, 10: 대구광역시, 11: 대전광역시, 12: 부신광역시, 13: 울산광역시, 14: 서울특별시)'
            },
            example: [14, 8, 5]
        }
    })
    @ApiOkResponse({
        description: '관심지역 수정 성공',
        schema: UserResponse
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @UseGuards(JwtAuthGuard)
    @Patch('/interest-region')
    async updateInterestRegion(@CurrentUser() id: string, @Body() interestRegionList: number[]){
        return this.userService.updateInterestRegion(id, interestRegionList);
    }

    @ApiOperation({
        summary:'관심지역 삭제',
        description: '현재 로그인한 사용자의 특정 관심지역을 삭제합니다.'
    })
    @ApiBearerAuth('access-token')
    @ApiBody({
        description: '삭제할 관심지역 ID',
        schema: {
            type: 'number',
            description: '지역 ID (0: 경기도, 1: 강원도, 2: 충청북도, 3: 충청남도, 4: 경상북도, 5: 경상남도, 6: 전라북도, 7: 전라남도, 8: 제주도, 9: 광주광역시, 10: 대구광역시, 11: 대전광역시, 12: 부신광역시, 13: 울산광역시, 14: 서울특별시)',
            example: 14
        }
    })
    @ApiOkResponse({
        description: '관심지역 삭제 성공',
        schema: UserResponse
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @ApiResponse({
        status: 404,
        description: '삭제할 관심지역을 찾을 수 없음',
        schema: CommonResponses.notFound
    })
    @UseGuards(JwtAuthGuard)
    @Delete('/interest-region')
    async deleteInterestRegion(@CurrentUser() id:string, @Body() deleteInterestRegion: number){
        return this.userService.deleteInterestRegion(id, deleteInterestRegion);
    }
}
