import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/presentation/guard/auth.guard';
import { PostCreateDto } from './dto/post.create.dto';
import { PostSchema } from '../infrastructure/schema/post.schema';
import { PostService } from '../application/post.service';
import { DetailPostDto } from './dto/detail.post.dto';
import { RegionPostDto } from './dto/region.post.dto';
import { FindRegionDto } from './dto/find.region.dto';
import { isValidObjectId } from 'mongoose';
import { CurrentUser } from '../../auth/presentation/decorators/current-user.decorator';
import { CommonResponses, PostDetailResponse, PopularRegionsResponse, PostListResponse, LikeResponse, DeletePostResponse, MemberResponses } from '../../utils/swagger/responses';
import { PreviewPostDto } from './dto/preview.post.model';
import { OptionalJwtAuthGuard } from 'src/auth/presentation/guard/optional-auth.guard';

@ApiTags('Post')
@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService){}


    @ApiOperation({
        summary:'특정 게시글 조회',
        description: '게시글 ID로 특정 게시글의 상세 정보를 조회합니다. 좋아요 여부도 함께 반환됩니다.만약 토큰이 없으면 좋야요 여부는 반환되지않습니다.'
    })
    @ApiParam({
        name:'id',
        type:'string',
        description: '조회할 게시글의 ID',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiOkResponse({
        description: '게시글 조회 성공',
        schema: PostDetailResponse
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @ApiResponse({
        status: 404,
        description: '게시글을 찾을 수 없음',
        schema: CommonResponses.notFound
    })
    @ApiBearerAuth('access-token')
    @UseGuards(OptionalJwtAuthGuard)
    @Get('/:id')
    async getOne(@Param('id') id:string, @CurrentUser() userId: string) : Promise<DetailPostDto | null>{
        if (!isValidObjectId(id)) {
            return null;
        }
        console.log(userId);
        return this.postService.getPost(id, userId);
    }

    @ApiOperation({
        summary:'좋아요 업데이트',
        description: '게시글의 좋아요를 추가합니다.'
    })
    @ApiParam({
        name:'id', 
        type:'string',
        description: '좋아요를 업데이트할 게시글의 ID',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: '좋아요 업데이트 성공',
        schema: LikeResponse
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @ApiResponse({
        status: 404,
        description: '게시글을 찾을 수 없음',
        schema: CommonResponses.notFound
    })
    @UseGuards(JwtAuthGuard)
    @Patch('/like/:id')
    async updateLike(@Param('id')id:string, @CurrentUser() userId: string): Promise<any>{
        return this.postService.updateLike(id, userId);
    }

    @ApiOperation({
        summary:'게시글 좋아요 삭제',
        description: '게시글의 좋아요를 삭제합니다.'
    })
    @ApiParam({
        name:'id', 
        type:'string',
        description: '좋아요를 삭제할 게시글의 ID',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: '좋아요 삭제 성공',
        schema: LikeResponse
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @ApiResponse({
        status: 404,
        description: '게시글을 찾을 수 없음',
        schema: CommonResponses.notFound
    })
    @UseGuards(JwtAuthGuard)
    @Delete('/like/:id')
    async deleteLike(@Param('id')id:string, @CurrentUser() userId:string) {
        return this.postService.deleteLike(id, userId);
    }



    @ApiOperation({
        summary:'인기 여행지 목록',
        description: '게시글이 많이 작성된 인기 여행지 상위 5개를 반환합니다.'
    })
    @ApiOkResponse({
        description: '인기 여행지 목록 조회 성공',
        schema: PopularRegionsResponse
    })
    @Get('/region/popular')
    async getPopularRegions(){
        return this.postService.getPopularRegions();
    }
    
    @ApiOperation({
        summary:'특정 지역의 게시글 목록',
        description: '특정 지역의 게시글 목록을 조회합니다. startDate와 endDate는 선택사항이며, 지정하면 해당 기간의 게시글만 조회됩니다.'
    })
    @ApiParam({
        name:'id',
        type:'number',
        description: '조회할 지역의 ID',
        example: 1
    })
    @ApiOkResponse({
        description: '지역 게시글 목록 조회 성공',
        schema: PostListResponse
    })
    @Get('/region/:id')
    async getRegion(@Param('id') regionId : number, @Query() findRegionDto: FindRegionDto): Promise<RegionPostDto[]>{
        return this.postService.getRegionPost(regionId, findRegionDto) as any;
    }

    @ApiOperation({
        summary:'동행 게시글 생성',
        description: '새로운 동행 게시글을 생성합니다. 여행 일정, 모집 인원, 여행 스타일 등을 포함합니다.'
    })
    @ApiBearerAuth('access-token')
    @ApiBody({
        description: '생성할 게시글 정보',
        schema: {
            type: 'object',
            properties: {
                region_id: { 
                    type: 'number', 
                    example: 14, 
                    description: '지역 ID (0: 경기도, 1: 강원도, 2: 충청북도, 3: 충청남도, 4: 경상북도, 5: 경상남도, 6: 전라북도, 7: 전라남도, 8: 제주도, 9: 광주광역시, 10: 대구광역시, 11: 대전광역시, 12: 부산광역시, 13: 울산광역시, 14: 서울특별시)' 
                },
                title: { 
                    type: 'string', 
                    example: '제주도 3박 4일 여행', 
                    description: '게시글 제목' 
                },
                description: { 
                    type: 'string', 
                    example: '제주도에서 함께 여행할 동행을 구합니다!', 
                    description: '게시글 설명' 
                },
                schedule: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            title: { type: 'string', example: '첫째 날 - 제주도 도착', description: '일정 제목' },
                            description: { type: 'string', example: '제주도 공항에서 만나서 호텔 체크인', description: '일정 설명' },
                            date: { type: 'string', example: '2025-01-21', description: '일정 날짜' }
                        }
                    },
                    description: '여행 일정 목록'
                },
                startDate: { 
                    type: 'string', 
                    example: '2025-01-21', 
                    description: '여행 시작 날짜 (YYYY-MM-DD 형식)' 
                },
                endDate: { 
                    type: 'string', 
                    example: '2025-01-24', 
                    description: '여행 종료 날짜 (YYYY-MM-DD 형식)' 
                },
                maxPerson: { 
                    type: 'number', 
                    example: 4, 
                    description: '모집 인원 수' 
                },

                likedUserId: { 
                    type: 'array', 
                    items: { type: 'string' }, 
                    example: [], 
                    description: '좋아요를 누른 사용자 ID 목록 (선택사항)' 
                },
                tripStyle: { 
                    type: 'array', 
                    items: { type: 'string' }, 
                    example: ['자연', '맛집', '문화'], 
                    description: '여행 스타일 (최대 3개)' 
                }
            },
            required: ['region_id', 'title', 'description', 'schedule', 'startDate', 'endDate', 'maxPerson', 'tripStyle']
        }
    })
    @ApiCreatedResponse({
        description: '게시글 생성 성공',
        schema: {
            type: 'object',
            properties: {
                _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                region_id: { type: 'number', example: 14 },
                authorId: { type: 'string', example: '507f1f77bcf86cd799439012' },
                memberId: { type: 'array', items: { type: 'string' }, example: [] },
                title: { type: 'string', example: '제주도 3박 4일 여행' },
                description: { type: 'string', example: '제주도에서 함께 여행할 동행을 구합니다!' },
                schedule: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            title: { type: 'string', example: '첫째 날 - 제주도 도착' },
                            description: { type: 'string', example: '제주도 공항에서 만나서 호텔 체크인' },
                            date: { type: 'string', example: '2025-01-21' }
                        }
                    }
                },
                startDate: { type: 'string', example: '2025-01-21T00:00:00.000Z' },
                endDate: { type: 'string', example: '2025-01-24T00:00:00.000Z' },
                maxPerson: { type: 'number', example: 4 },

                likedUserId: { type: 'array', items: { type: 'string' }, example: [] },
                tripStyle: { type: 'array', items: { type: 'string' }, example: ['자연', '맛집', '문화'] },
                createdAt: { type: 'string', example: '2025-01-15T10:30:00.000Z' },
                updatedAt: { type: 'string', example: '2025-01-15T10:30:00.000Z' }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: '잘못된 요청 데이터',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Validation failed' },
                errors: { 
                    type: 'array', 
                    items: { type: 'string' }, 
                    example: ['region_id must be a number', 'title should not be empty'] 
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
    @Post()
    async create(@CurrentUser() userId: string, @Body() postCreateDto: PostCreateDto) : Promise<PostSchema> {
        return this.postService.createPost(userId, postCreateDto);
    }

    @ApiOperation({
        summary:'동행 게시글 수정',
        description: '기존 동행 게시글의 내용을 수정합니다. 작성자만 수정할 수 있습니다.'
    })
    @ApiParam({
        name:'id', 
        type:'string',
        description: '수정할 게시글의 ID',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiBearerAuth('access-token')
    @ApiBody({
        description: '수정할 게시글 정보',
        schema: {
            type: 'object',
            properties: {
                region_id: { 
                    type: 'number', 
                    example: 14, 
                    description: '지역 ID (0: 경기도, 1: 강원도, 2: 충청북도, 3: 충청남도, 4: 경상북도, 5: 경상남도, 6: 전라북도, 7: 전라남도, 8: 제주도, 9: 광주광역시, 10: 대구광역시, 11: 대전광역시, 12: 부산광역시, 13: 울산광역시, 14: 서울특별시)' 
                },
                title: { 
                    type: 'string', 
                    example: '수정된 제목', 
                    description: '게시글 제목' 
                },
                description: { 
                    type: 'string', 
                    example: '수정된 설명', 
                    description: '게시글 설명' 
                },
                schedule: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            title: { type: 'string', example: '수정된 일정 제목', description: '일정 제목' },
                            description: { type: 'string', example: '수정된 일정 설명', description: '일정 설명' },
                            date: { type: 'string', example: '2025-01-21', description: '일정 날짜' }
                        }
                    },
                    description: '여행 일정 목록'
                },
                startDate: { 
                    type: 'string', 
                    example: '2025-01-21', 
                    description: '여행 시작 날짜 (YYYY-MM-DD 형식)' 
                },
                endDate: { 
                    type: 'string', 
                    example: '2025-01-24', 
                    description: '여행 종료 날짜 (YYYY-MM-DD 형식)' 
                },
                maxPerson: { 
                    type: 'number', 
                    example: 4, 
                    description: '모집 인원 수' 
                },

                likedUserId: { 
                    type: 'array', 
                    items: { type: 'string' }, 
                    example: [], 
                    description: '좋아요를 누른 사용자 ID 목록' 
                },
                tripStyle: { 
                    type: 'array', 
                    items: { type: 'string' }, 
                    example: ['자연', '맛집', '문화'], 
                    description: '여행 스타일 (최대 3개)' 
                }
            }
        }
    })
    @ApiOkResponse({
        description: '게시글 수정 성공',
        schema: PostDetailResponse
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @ApiResponse({
        status: 403,
        description: '권한 없음 - 게시글 작성자가 아님',
        schema: CommonResponses.forbidden
    })
    @ApiResponse({
        status: 404,
        description: '게시글을 찾을 수 없음',
        schema: CommonResponses.notFound
    })
    @UseGuards(JwtAuthGuard)
    @Patch('/:id')
    async updatePost(
        @Param('id') id: string,
        @Body() updateDto: any,
        @CurrentUser() userId: string
    ): Promise<DetailPostDto | null> {
        // 권한 체크 등은 필요시 추가
        return this.postService.updatePost(id, updateDto, userId);
    }

    @ApiOperation({
        summary:'게시글 삭제',
        description: '기존 게시글을 삭제합니다. 작성자만 삭제할 수 있습니다.'
    })
    @ApiParam({
        name:'id', 
        type:'string',
        description: '삭제할 게시글의 ID',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: '게시글 삭제 성공',
        schema: DeletePostResponse
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @ApiResponse({
        status: 403,
        description: '권한 없음 - 게시글 작성자가 아님',
        schema: CommonResponses.forbidden
    })
    @ApiResponse({
        status: 404,
        description: '게시글을 찾을 수 없음',
        schema: CommonResponses.notFound
    })
    @UseGuards(JwtAuthGuard)
    @Delete('/:id')
    async deletePost(@Param('id') id: string, @CurrentUser() userId: string) {
        // TODO: 권한 체크 추가 (작성자만 삭제 가능)
        return this.postService.deletePost(id, userId);
    }

    @ApiOperation({
        summary: '특정 지역의 게시글 목록',
        description: '특정 지역의 게시글 목록을 조회합니다. regionId로 지역을 필터링할 수 있습니다.'
    })
    @ApiParam({
        name: 'regionId',
        type: 'number',
        description: '조회할 지역의 ID',
        example: 1
    })
    @ApiOkResponse({
        description: '지역 게시글 목록 조회 성공',
        type: [PreviewPostDto]
    })
    @Get('region')
    async getRegionPost(
        @Query('regionId') regionId: number,
        @Query() findRegionDto: FindRegionDto
    ): Promise<PreviewPostDto[]> {
        return this.postService.getRegionPost(regionId, findRegionDto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary:'( 팀장용 ) 동행 멤버 추가',
        description: '동행 게시글에 새로운 멤버를 추가합니다. 팀장(게시글 작성자)만 멤버를 추가할 수 있습니다.'
    })
    @ApiParam({
        name: 'postId',
        type: 'string',
        description: '멤버를 추가할 게시글의 ID',
        example: '507f1f77bcf86cd799439011'
    })
        @ApiBody({
        schema: {
            type: 'object',
            properties: {
                userId: { 
                    type: 'string', 
                    example: 14, 
                    description: '동행 신청 유저의 _id'
                }
            }
        }
    })
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: '멤버 추가 성공',
        schema: MemberResponses.addMemberSuccess
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @ApiResponse({
        status: 403,
        description: '권한 없음 - 게시글 작성자가 아님',
        schema: CommonResponses.forbidden
    })
    @ApiResponse({
        status: 404,
        description: '게시글을 찾을 수 없음',
        schema: CommonResponses.notFound
    })
    @Post('member/:postId')
    async updateMember(@CurrentUser() id: string, @Param('postId') postId:string, @Body('userId')userId:string){
        return this.postService.updateMember(id, postId, userId);
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary:'( 팀장용 ) 동행 신청 유저 거절',
        description:'팀원이 아닌 좋아요만 눌렀던 유저의 신청을 거절합니다. 팀장(게시글 작성자)만 신청을 거절할 수 있습니다.'
    })
    @ApiParam({
        name: 'postId',
        type: 'string',
        description: '신청을 거절할 게시글의 ID',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                userId: { 
                    type: 'string', 
                    example: 14, 
                    description: '동행 신청 유저의 _id'
                }
            }
        }
    })
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: '신청 거절 성공',
        schema: MemberResponses.rejectApplicationSuccess
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @ApiResponse({
        status: 403,
        description: '권한 없음 - 게시글 작성자가 아님',
        schema: CommonResponses.forbidden
    })
    @ApiResponse({
        status: 404,
        description: '게시글을 찾을 수 없음',
        schema: CommonResponses.notFound
    })
    @Delete('member/:postId')
    async deleteLikePostId(@CurrentUser() id: string, @Param('postId') postId:string, @Body('userId') userId:string){
        return this.postService.deleteLikePostId(id, postId, userId);   
    }

    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary:'( 팀장용 ) 동행 멤버 삭제',
        description: '동행 게시글에서 특정 멤버를 삭제합니다. 팀장(게시글 작성자)만 멤버를 삭제할 수 있습니다.'
    })
    @ApiParam({
        name: 'postId',
        type: 'string',
        description: '멤버를 삭제할 게시글의 ID',
        example: '507f1f77bcf86cd799439011'
    })
    @ApiParam({
        name: 'userId',
        type: 'string',
        description: '삭제할 멤버의 사용자 ID',
        example: '507f1f77bcf86cd799439012'
    })
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: '멤버 삭제 성공',
        schema: MemberResponses.deleteMemberSuccess
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @ApiResponse({
        status: 403,
        description: '권한 없음 - 게시글 작성자가 아님',
        schema: CommonResponses.forbidden
    })
    @ApiResponse({
        status: 404,
        description: '게시글을 찾을 수 없음',
        schema: CommonResponses.notFound
    })
    @Delete('member/:postId/:userId')
    async deleteMember(@CurrentUser() id: string, @Param('postId') postId:string, @Param('userId')userId:string){
        return this.postService.deleteMember(id, postId, userId);
    }
}
