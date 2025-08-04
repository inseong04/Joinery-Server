import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({
    summary: '서버 상태 확인',
    description: '서버가 정상적으로 작동하는지 확인합니다.'
  })
  @ApiOkResponse({
    description: '서버 정상 작동',
    schema: {
      type: 'string',
      example: 'Hello World!'
    }
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
