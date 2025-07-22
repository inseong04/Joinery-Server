import { Injectable } from '@nestjs/common';
import { PostCreateDto } from './dto/post.create.dto';
import DateUtils from 'src/constants/date.utill';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostSchema } from './schema/post.schema';

@Injectable()
export class PostService {
    constructor(
        @InjectModel('Post') private PostModel:Model<PostSchema>
    ){}


    async createPost(postCreateDto: PostCreateDto): Promise<PostSchema> {
        postCreateDto.startDate = DateUtils.momentNowWithHours();
        postCreateDto.endDate = DateUtils.momentNowWithHours();
        const newPost = new this.PostModel(postCreateDto);
        return newPost.save();
    }
}
