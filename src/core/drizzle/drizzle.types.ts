import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './../../db/schema/schema';

export type Drizzle = PostgresJsDatabase<typeof schema>;