import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

/**
 * Drizzle ORM configuration.
 *
 * Используется для генерации миграций и подключения к базе данных.
 * Конфиг читает переменные окружения, но имеет дефолты, чтобы удобно
 * работать в локальной среде без .env.
 *
 * Параметры:
 * - dialect: тип базы данных (здесь PostgreSQL)
 * - schema: путь к схеме, где описаны таблицы drizzle
 * - out: директория, куда будут складываться сгенерированные миграции
 * - dbCredentials: параметры подключения к Postgres
 *
 * Важно:
 * - Значения host/port/user/password/database берутся из process.env,
 *   но падать приложение не будет — есть дефолтные fallback-и.
 * - Используется классическая схема подключения без DATABASE_URL,
 *   что проще для локальной разработки.
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/drizzle/schema/schema.ts',
  out: './drizzle',
  dbCredentials: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'gen_user',
    password: process.env.DB_PASS || 'loona',
    database: process.env.DB_NAME || 'default_db',
  },
});
