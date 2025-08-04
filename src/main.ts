import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // swagger API
    const options = new DocumentBuilder()
    .setTitle('Joinery API')
    .setDescription('여행 커뮤니티 플랫폼 Joinery의 REST API 문서')
    .setVersion('1.0')
    .addServer('http://localhost:3000/', 'Local environment')
    .addServer('https://staging.yourapi.com/', 'Staging')
    .addServer('https://production.yourapi.com/', 'Production')
    .addTag('Auth', '사용자 인증 관련 API')
    .addTag('User', '사용자 정보 관리 API')
    .addTag('Post', '게시글 관리 API')
    .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        name: 'JWT',
        in: 'header',
        description: 'JWT 토큰을 입력하세요. Bearer 접두사를 포함해주세요.',
      },
      'access-token',
    )
    .build();
    const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      persistAuthorization: true,
    },
  };
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document, customOptions);

  app.enableCors();   // cors 활성화
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const port = Number(process.env.PORT) | 3000;
  console.log(`start in ${port}`);
  
  await app.listen(port);
}
bootstrap();
