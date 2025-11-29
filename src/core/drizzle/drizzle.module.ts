import { Global, Module } from '@nestjs/common';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './../../db/schema/schema';

/**
 * DrizzleModule
 *
 * Глобальный модуль NestJS, который создаёт подключение к базе данных
 * через drizzle-orm и postgres-js.
 *
 * Основные моменты:
 * - Создаёт единый экземпляр клиента PostgreSQL.
 * - Возвращает типизированный объект drizzle, связанный со схемой.
 * - Благодаря @Global() провайдер доступен во всём приложении.
 *
 * Поведение:
 * - Используются переменные окружения, но есть дефолтные значения
 *   для удобного локального запуска.
 * - postgres-js работает как лёгкий драйвер без лишних зависимостей.
 *
 * @example Инъекция Drizzle в сервис
 * ```ts
 * import { Inject, Injectable } from '@nestjs/common';
 * import type { Drizzle } from '../core/drizzle/drizzle.types';
 *
 * @Injectable()
 * export class BookingsService {
 *   constructor(
 *     @Inject('DRIZZLE')
 *     private readonly drizzle: Drizzle,
 *   ) {}
 * }
 * ```
 */
@Global()
@Module({
  providers: [
    {
      provide: 'DRIZZLE',
      useFactory: () => {
        const client = postgres({
          host: process.env.DB_HOST || '127.0.0.1',
          port: Number(process.env.DB_PORT) || 5432,
          user: process.env.DB_USER || 'gen_user',
          password: process.env.DB_PASS || 'loona',
          database: process.env.DB_NAME || 'default_db',
        });

        return drizzle(client, { schema });
      },
    },
  ],
  exports: ['DRIZZLE'],
})
export class DrizzleModule {}
