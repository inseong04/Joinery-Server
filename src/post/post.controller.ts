import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { PostCreateDto } from './dto/post.create.dto';
import { PostSchema } from './schema/post.schema';
import { PostService } from './post.service';
import { DetailPost } from './model/detail.post.model';
import { RegionPost } from './model/region.post.model';
import { FindRegionDto } from './dto/find.region.dto';
import { isValidObjectId } from 'mongoose';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Post')
@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService){}


    @ApiOperation({summary:'특정 id의 게시글 반환'})
    @ApiParam({name:'id',type:'string'})
    @ApiOkResponse({description:'성공적으로 게시글이 조회됨',})
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getOne(@Param('id') id:string, @CurrentUser() userId: string) : Promise<DetailPost | null>{
        if (!isValidObjectId(id)) {
            return null;
        }
        return this.postService.getPost(id, userId);
    }

    @ApiOperation({summary:'좋아요 업데이트'})
    @ApiParam({name:'id', type:'string'})
    @ApiBearerAuth('token')
    @ApiBody({})
    @UseGuards(JwtAuthGuard)
    @Patch('/:id')
    async updateLike(@Param('id')id:string, @CurrentUser() userId: string, isDelete: boolean): Promise<DetailPost | null>{
        return this.updateLike(id, userId, isDelete);
    }

    @ApiOperation({summary:'인기 여행지 목록', description:'인기 여행지 5개를 반환. 게시글이 많이 작성된 것을 기준으로 반환합니다.'})
    @ApiOkResponse({description:'요청 성공', schema:{properties:{count: {type:'number',example:'9'}, regionId: {type:'number',example:'3'}}}})
    @Get('/region/popular')
    async getPopularRegions(){
        return this.postService.getPopularRegions();
    }
    
    @ApiOkResponse({description:'성공적으로 해당 지역의 게시글이 조회됨',})
    @ApiOperation({summary:'특정 id 지역의 게시글들 반환', description: 'startDate와 endDate를 담지않고 보내면(body 미포함) 해당 지역의 게시글이 모두 반환됩니다'})
    @ApiParam({name:'id',type:'number'})
    @ApiBody({type:FindRegionDto})
    @Get('/region/:id')
    async getRegion(@Param('id') regionId : number, @Query() findRegionDto: FindRegionDto): Promise<RegionPost[]>{
        return this.postService.getRegionPost(regionId, findRegionDto) as any;
    }

    @ApiOperation({summary:'게시글 생성'})
    @ApiBody({type:PostCreateDto})
    @ApiCreatedResponse({description: '게시글 생성 성공시 body 그대로 반환 (date는 Date Type으로 format됩니다)',})
    @ApiBearerAuth('token')
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async create(@Body() postCreateDto: PostCreateDto) : Promise<PostSchema> {
        return this.postService.createPost(postCreateDto);
    }

}
