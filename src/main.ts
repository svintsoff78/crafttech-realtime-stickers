import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { config } from 'dotenv';
config();

/**
 * Точка входа HTTP-приложения.
 *
 * Поднимает NestJS на базе Fastify:
 * - создаёт Fastify-адаптер;
 * - запускает HTTP-сервер на указанном порту.
 *
 * Порт:
 * - Берётся из переменной окружения `PORT`;
 * - По умолчанию — 3000.
 *
 */
async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  await app.listen(Number(process.env.PORT) || 3000, '0.0.0.0');
}

bootstrap();
