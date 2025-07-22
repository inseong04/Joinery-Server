import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guard/auth.guard';
import { PostCreateDto } from './dto/post.create.dto';
import { PostSchema } from './schema/post.schema';
import { PostService } from './post.service';

@ApiTags('Post')
@Controller('post')
export class PostController {
    constructor(private readonly postService: PostService){}

    @ApiCreatedResponse({description: '회원가입 성공시 body 그대로 반환',})
    @ApiOperation({description:'게시글 생성'})
    @ApiBearerAuth('token')
    @UseGuards(JwtAuthGuard)
    @Post('/')
    async create(@Body() postCreateDto: PostCreateDto) : Promise<PostSchema> {
        return this.postService.createPost(postCreateDto);
    }
}
