import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    credentials: true,
  });

  await app.listen(process.env.PORT || 3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();