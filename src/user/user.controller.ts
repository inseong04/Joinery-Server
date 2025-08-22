import { Controller, Delete, Get, Param, Patch, UseGuards, Body, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiTags, ApiBody, ApiOkResponse, ApiResponse, ApiProperty } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { UserUpdateDto } from './dto/user.update.dto';
import { CommonResponses, UserResponse, BookmarkResponses } from '../swagger/responses';
import { UploadService } from 'src/upload/upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from 'src/upload/image-validation.pipe';

@ApiTags('User')
@Controller('user')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly uploadService: UploadService,
    ){}


    @ApiOperation({
        summary: '내 프로필 조회',
        description: '현재 로그인한 사용자의 프로필 정보를 조회합니다.'
    })
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: '프로필 조회 성공',
        schema: UserResponse
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @UseGuards(JwtAuthGuard)
    @Get('')
    async getMyProfile(@CurrentUser() id: string){
        return this.userService.getUserById(id);
    }

    @ApiOperation({
        summary:'유저 정보 수정',
        description: '현재 로그인한 사용자의 정보를 수정합니다. 닉네임, 자기소개, 여행 스타일, 프로필 이미지를 변경할 수 있습니다. 이미지 파일은 PNG, JPEG, JPG 형식을 지원합니다.'
    })
    @ApiBearerAuth('access-token')
    @ApiBody({
        description: '수정할 사용자 정보 및 이미지 파일',
        schema: {
            type: 'object',
            properties: {
                nickname: { type: 'string', description: '닉네임', example: '새로운닉네임' },
                userDescription: { type: 'string', description: '자기소개', example: '안녕하세요!' },
                tripStyle: { 
                    type: 'array', 
                    items: { type: 'string' },
                    description: '여행 스타일',
                    example: ['문화탐방', '자연감상']
                },
                file: {
                    type: 'File',
                    format: 'binary',
                    description: '프로필 이미지 파일 (선택사항, PNG, JPEG, JPG)'
                }
            }
        }
    })
    @ApiOkResponse({
        description: '사용자 정보 수정 성공',
        schema: UserResponse
    })
    @ApiResponse({
        status: 400,
        description: '잘못된 파일 형식',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: '지원하지 않는 파일 형식입니다. PNG, JPEG, JPG 파일만 업로드 가능합니다.' },
                error: { type: 'string', example: 'Bad Request' },
                statusCode: { type: 'number', example: 400 }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    @Patch('')
    async updateUser(@CurrentUser() id: string, @Body() userUpdateDto: UserUpdateDto, 
    @UploadedFile(ImageValidationPipe) file?: Express.MulterS3.File){
        const imageUrl = file ? this.uploadService.uploadFile(file) : undefined;
        return await this.userService.updateUser(id, userUpdateDto, imageUrl);
    }

    @ApiOperation({
        summary:'참여한 동행 목록',
        description: '현재 로그인한 사용자가 참여한 동행 게시글 목록을 조회합니다.'
    })
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: '참여한 동행 목록 조회 성공',
        schema: {
            type: 'object',
            properties: {
                ended: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                            region_id: { type: 'number', example: 1 },
                            username: { type: 'string', example: '사용자닉네임' },
                            startDate: { type: 'string', example: '2024-01-01' },
                            endDate: { type: 'string', example: '2024-01-03' },
                            isJoin: { type: 'boolean', example: true },
                            isEnded: { type: 'boolean', example: true }
                        }
                    }
                },
                notEnded: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
                            region_id: { type: 'number', example: 2 },
                            username: { type: 'string', example: '사용자닉네임' },
                            startDate: { type: 'string', example: '2024-02-01' },
                            endDate: { type: 'string', example: '2024-02-03' },
                            isJoin: { type: 'boolean', example: false },
                            isEnded: { type: 'boolean', example: false }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @UseGuards(JwtAuthGuard)
    @Get('/application-post')
    async getApplicationPost(@CurrentUser() id: string){
        return this.userService.getApplicationPost(id);
    }

    @ApiOperation({
        summary:'작성한 동행',
        description: '현재 로그인한 사용자가 작성한 동행 게시글 목록을 조회합니다.'
    })
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: '작성한 동행 목록 조회 성공',
        schema: {
            type: 'object',
            properties: {
                ended: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                            region_id: { type: 'number', example: 1 },
                            startDate: { type: 'string', example: '2024-01-01' },
                            endDate: { type: 'string', example: '2024-01-03' },
                            limitedHeart: { type: 'number', example: 10 },
                            heart: { type: 'number', example: 5 },
                            isEnded: { type: 'boolean', example: true }
                        }
                    }
                },
                notEnded: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            _id: { type: 'string', example: '507f1f77bcf86cd799439012' },
                            region_id: { type: 'number', example: 2 },
                            startDate: { type: 'string', example: '2024-02-01' },
                            endDate: { type: 'string', example: '2024-02-03' },
                            limitedHeart: { type: 'number', example: 10 },
                            heart: { type: 'number', example: 8 },
                            isEnded: { type: 'boolean', example: false }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
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

    @ApiOperation({
        summary: '프로필 이미지 업로드',
        description: '현재 로그인한 사용자의 프로필 이미지를 업로드합니다. PNG, JPEG, JPG 형식의 이미지 파일을 지원합니다.'
    })
    @ApiBearerAuth('access-token')
    @ApiBody({
        description: '업로드할 이미지 파일',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: '이미지 파일 (PNG, JPEG, JPG)'
                }
            }
        }
    })
    @ApiOkResponse({
        description: '프로필 이미지 업로드 성공',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'success' },
                url: { type: 'string', example: 'uploads/1754546984873-profile-image.png' }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: '잘못된 파일 형식',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: '지원하지 않는 파일 형식입니다. PNG, JPEG, JPG 파일만 업로드 가능합니다.' },
                error: { type: 'string', example: 'Bad Request' },
                statusCode: { type: 'number', example: 400 }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @UseGuards(JwtAuthGuard)
    @Post('/upload-image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@CurrentUser() id: string, @UploadedFile(ImageValidationPipe) file?: Express.MulterS3.File) {
        if (!file) {
            throw new BadRequestException('업로드할 파일이 없습니다.');
        }
        const imageUrl = this.uploadService.uploadFile(file);
        return this.userService.uploadImage(id, imageUrl);
    }

    @ApiOperation({
        summary: '북마크 게시글 조회',
        description: '현재 로그인한 사용자가 북마크한 게시글 목록을 조회합니다.'
    })
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: '북마크 게시글 조회 성공',
        schema: BookmarkResponses.getBookmarksSuccess
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @UseGuards(JwtAuthGuard)
    @Get('/bookmark')
    async getBookmark(@CurrentUser()id : string){
        return await this.userService.getBookmark(id);
    }

    @ApiOperation({
        summary: '북마크 추가',
        description: '현재 로그인한 사용자가 특정 게시글을 북마크에 추가합니다.'
    })
    @ApiBearerAuth('access-token')
    @ApiBody({
        description: '북마크할 게시글 ID',
        schema: {
            type: 'object',
            properties: {
                postId: {
                    type: 'string',
                    description: '게시글 ID',
                    example: '507f1f77bcf86cd799439011'
                }
            }
        }
    })
    @ApiOkResponse({
        description: '북마크 추가 성공',
        schema: BookmarkResponses.addBookmarkSuccess
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @UseGuards(JwtAuthGuard)
    @Post('/bookmark')
    async updateBookmark(@CurrentUser()id : string, @Body('postId') postId:string){
        return await this.userService.updateBookmark(id, postId);
    }

    @ApiOperation({
        summary: '북마크 제거',
        description: '현재 로그인한 사용자의 북마크에서 특정 게시글을 제거합니다.'
    })
    @ApiBearerAuth('access-token')
    @ApiBody({
        description: '제거할 게시글 ID',
        schema: {
            type: 'object',
            properties: {
                postId: {
                    type: 'string',
                    description: '게시글 ID',
                    example: '507f1f77bcf86cd799439011'
                }
            }
        }
    })
    @ApiOkResponse({
        description: '북마크 제거 성공',
        schema: BookmarkResponses.deleteBookmarkSuccess
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @UseGuards(JwtAuthGuard)
    @Delete('/bookmark')
    async deleteBookmark(@CurrentUser()id : string, @Body('postId') postId:string){
        return await this.userService.deleteBookmark(id, postId);
    }


    @ApiOperation({
        summary:'특정 사용자 정보 조회',
        description: '사용자 ID(username)로 특정 사용자의 정보를 조회합니다.'
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

}
