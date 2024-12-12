import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DbConfig } from './config/db';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  const PORT = DbConfig.port || 5000;

  await app.listen(PORT, () => {
    Logger.log(`App is running on PORT: ${PORT}`);
  });
}
bootstrap();