import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as express from 'express';

async function bootstrap() {
  // Load environment variables
  dotenv.config();
  console.log('Loaded Environment Variables:');
  Object.keys(process.env).forEach((key) => {
    console.log(`${key} = ${process.env[key]}`);
  });

  // Disable Nest's built-in body parser
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
  });

  // Use custom Express parsers with increased limits
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Enable CORS
  app.enableCors();

  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Start server
  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
