import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/auth.guard';
import { NotificationsService } from './notifications.service';
import { ApiOperation, ApiBearerAuth, ApiOkResponse, ApiResponse, ApiBody, ApiTags } from '@nestjs/swagger';
import { CommonResponses, NotificationResponses } from '../swagger/responses';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService){}

    @ApiOperation({
        summary: '사용자의 알림 모두 불러오기',
        description: '현재 로그인한 사용자의 모든 알림을 조회합니다. 최신순으로 정렬됩니다.'
    })
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: '알림 목록 조회 성공',
        schema: NotificationResponses.notificationList
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @UseGuards(JwtAuthGuard)
    @Get()
    async getNotification(@CurrentUser() id: string){
        return this.notificationsService.getAllNotification(id);
    }

    @ApiOperation({
        summary: '사용자의 최근 7일 알림 불러오기',
        description: '현재 로그인한 사용자의 최근 7일간 생성된 알림을 조회합니다. 최신순으로 정렬됩니다.'
    })
    @ApiBearerAuth('access-token')
    @ApiOkResponse({
        description: '최근 7일 알림 목록 조회 성공',
        schema: NotificationResponses.notificationList
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @UseGuards(JwtAuthGuard)
    @Get('/last-week')
    async getNotificationsLastWeek(@CurrentUser() id: string){
        return this.notificationsService.getNotificationsLastWeek(id);
    }

    @ApiOperation({
        summary: '알림 읽음 처리',
        description: '특정 알림을 읽음 상태로 변경합니다. 본인의 알림만 읽음 처리할 수 있습니다. Request Body의 id는 알림의 _id 값입니다.'
    })
    @ApiBearerAuth('access-token')
    @ApiBody({
        schema: NotificationResponses.readRequest
    })
    @ApiOkResponse({
        description: '알림 읽음 처리 성공',
        schema: NotificationResponses.readSuccess
    })
    @ApiResponse({
        status: 400,
        description: '잘못된 요청 - 본인의 알림이 아님',
        schema: CommonResponses.validationError
    })
    @ApiResponse({
        status: 401,
        description: '인증 실패',
        schema: CommonResponses.unauthorized
    })
    @ApiResponse({
        status: 404,
        description: '알림을 찾을 수 없음',
        schema: CommonResponses.notFound
    })
    @UseGuards(JwtAuthGuard)
    @Patch('/read')
    async updateIsRead(@CurrentUser() userId: string, @Body('id') id: string){
        return this.notificationsService.isReadCheck(id, userId);
    }
}
