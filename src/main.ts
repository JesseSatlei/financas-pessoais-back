import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const rawOrigins = process.env.FRONTEND_ORIGIN?.trim();
  const defaultOrigins = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];

  const allowAnyOrigin = rawOrigins === '*';
  const origins = (rawOrigins ? rawOrigins.split(',') : defaultOrigins)
    .map((o) => o.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowAnyOrigin ? true : origins,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204,
  });
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
