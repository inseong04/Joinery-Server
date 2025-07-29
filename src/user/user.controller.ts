import { Controller, Delete, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){}

    @ApiOperation({summary:'특정 id의 유저 정보를 불러옴'})
    @ApiParam({name:'id', type:'string'})
    @Get('/:id')
    async getUser(@Param() id:string){
        return this.userService.getUser(id);
    }

    @ApiOperation({summary:'관심지역 수정'})
    @ApiBearerAuth('token')
    @UseGuards(JwtAuthGuard)
    @Patch('/interest-region')
    async updateInterestRegion(@CurrentUser() id: string, interestRegionList:Region[]){
        return this.userService.updateInterestRegion(id, interestRegionList);
    }

    @ApiOperation({summary:'관심지역 삭제'})
    @ApiBearerAuth('token')
    @UseGuards(JwtAuthGuard)
    @Delete('/interest-region')
    async deleteInterestRegion(@CurrentUser() id:string, deleteInterestRegion:Region){
        return this.userService.deleteInterestRegion(id, deleteInterestRegion);
    }
}
