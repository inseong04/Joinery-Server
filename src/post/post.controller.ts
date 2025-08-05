import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { PostCreateDto } from './dto/post.create.dto';
import { PostSchema } from './schema/post.schema';
import { PostService } from './post.service';
import { DetailPost } from './model/detail.post.model';
import { RegionPost } from './model/region.post.model';
import { FindRegionDto } from './dto/find.region.dto';
import { isValidObjectId } from 'mongoose';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CommonResponses, PostDetailResponse, PopularRegionsResponse } from '../swagger/responses';
import { PreviewPostModel } from './model/preview.post.model';

@ApiTags('Post')
@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService){}


    @ApiOperation({
        summary:'특정 게시글 조회',
        description: '게시글 ID로 특정 게시글의 상세 정보를 조회합니다. 좋아요 여부도 함께 반환됩니다.'
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
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getOne(@Param('id') id:string, @CurrentUser() userId: string) : Promise<DetailPost | null>{
        if (!isValidObjectId(id)) {
            return null;
        }
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
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    _id: {
                        type: 'string',
                        example:'게시글id',
                        description:'게시글의 _id'
                    },
                    title: {
                        type: 'string',
                        example: '제주도 여행',
                        description: '게시글 제목'
                    },
                    username: {
                        type: 'string',
                        example: '여행자',
                        description: '작성자 닉네임'
                    },
                    startDate: {
                        type: 'string',
                        example: '2024-01-01',
                        description: '여행 시작일'
                    },
                    endDate: {
                        type: 'string',
                        example: '2024-01-03',
                        description: '여행 종료일'
                    },
                    heart: {
                        type: 'number',
                        example: 5,
                        description: '현재 좋아요 수'
                    },
                    limitedHeart: {
                        type: 'number',
                        example: 10,
                        description: '최대 좋아요 수'
                    }
                }
            }
        }
    })
    @Get('/region/:id')
    async getRegion(@Param('id') regionId : number, @Query() findRegionDto: FindRegionDto): Promise<RegionPost[]>{
        return this.postService.getRegionPost(regionId, findRegionDto) as any;
    }

    @ApiOperation({
        summary:'게시글 생성',
        description: '새로운 여행 게시글을 생성합니다. 제목, 내용, 지역, 일정 정보가 필요합니다.'
    })
    @ApiBody({
        type: PostCreateDto,
        description: '생성할 게시글 정보'
    })
    @ApiCreatedResponse({
        description: '게시글 생성 성공',
        schema: PostDetailResponse
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @ApiResponse({
        status: 400,
        description: '잘못된 입력 데이터',
        schema: CommonResponses.validationError
    })
    @ApiBearerAuth('access-token')
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async create(@CurrentUser() userId: string, @Body() postCreateDto: PostCreateDto) : Promise<PostSchema> {
        return this.postService.createPost(userId, postCreateDto);
    }

    @ApiOperation({
        summary:'게시글 수정',
        description: '기존 게시글의 내용을 수정합니다. 작성자만 수정할 수 있습니다.'
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
                title: { type: 'string', example: '수정된 제목', description: '게시글 제목' },
                content: { type: 'string', example: '수정된 내용...', description: '게시글 내용' },
                schedule: {
                    type: 'object',
                    properties: {
                        startDate: { type: 'string', example: '2024-01-01' },
                        endDate: { type: 'string', example: '2024-01-03' }
                    },
                    description: '여행 일정'
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
    ): Promise<DetailPost | null> {
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
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Post deleted successfully' }
            }
        }
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
        return this.postService.deletePost(id);
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
        type: [PreviewPostModel]
    })
    @Get('region')
    async getRegionPost(
        @Query('regionId') regionId: number,
        @Query() findRegionDto: FindRegionDto
    ): Promise<PreviewPostModel[]> {
        return this.postService.getRegionPost(regionId, findRegionDto);
    }
}
