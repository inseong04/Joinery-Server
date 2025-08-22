import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { NotificationsService } from './notifications.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService){}

    @ApiOperation({summary:'사용자의 알림 모두 불러오기'})
    @UseGuards(JwtAuthGuard)
    @Get()
    async getNotification(@CurrentUser() id: string){
        return this.notificationsService.getAllNotification(id);
    }

    @ApiOperation({summary:'사용자의 최근 7일 알림 불러오기'})
    @UseGuards(JwtAuthGuard)
    @Get('/last-week')
    async getNotificationsLastWeek(@CurrentUser() id: string){
        return this.notificationsService.getNotificationsLastWeek(id);
    }

    @ApiOperation({summary:'알림 읽음 처리'})
    @UseGuards(JwtAuthGuard)
    @Patch('/read')
    async updateIsRead(@CurrentUser() userId: string, @Body('id') id: string){
        return this.notificationsService.isReadCheck(id, userId);
    }
}
