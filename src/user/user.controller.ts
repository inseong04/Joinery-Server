import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { ObjectId } from 'mongoose';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){}

    @ApiOperation({summary:'특정 id의 유저 정보를 불러옴'})
    @ApiParam({name:'id', type:'string'})
    @Get('/:id')
    async getUser(@Param() id:string){
        return this.userService.getUser(id);
    }
}
