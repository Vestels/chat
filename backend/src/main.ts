import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { DbConfig } from './config/db';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });
  const PORT = DbConfig.port || 5000;

  await app.listen(PORT, () => {
    Logger.log(`App is running on PORT: ${PORT}`);
  });
}
bootstrap();