// Database client factory: given a connection string, creates a pg connection
// pool and a typed Drizzle instance bound to the schema. The single source of
// the DB connection, consumed by the API's DbModule.
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema/index';

export type Database = NodePgDatabase<typeof schema>;

export interface CreateDatabaseOptions {
  connectionString: string;
  max?: number;
}

export function createDatabase(options: CreateDatabaseOptions): {
  db: Database;
  pool: pg.Pool;
} {
  const pool = new pg.Pool({
    connectionString: options.connectionString,
    max: options.max ?? 10,
  });
  const db = drizzle(pool, { schema });
  return { db, pool };
}
