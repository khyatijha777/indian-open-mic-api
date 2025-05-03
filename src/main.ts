import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as express from 'express';

async function bootstrap() {
  dotenv.config();
  console.log('Loaded Environment Variables:');
  Object.keys(process.env).forEach((key) => {
    console.log(`${key} = ${process.env[key]}`);
  });

  const app = await NestFactory.create(AppModule, {
    bodyParser: true, // default is true anyway
    rawBody: false,
  });
  app.enableCors();

  console.log('app: ', app);
  // // Set global body size limits using Express parser options
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
