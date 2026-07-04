// Database client factory: given a connection string, creates a pg connection
// pool and a typed Drizzle instance bound to the schema. The single source of
// the DB connection, consumed by the API's DbModule.
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import { drizzle, type NodePgDatabase, type NodePgTransaction } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema/index';

export type Database = NodePgDatabase<typeof schema>;

// The transaction handle passed to `db.transaction(async (tx) => ...)`,
// re-exported so consumers can type a helper that takes `tx` as a parameter
// without a direct dependency on drizzle-orm.
export type Transaction = NodePgTransaction<
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

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
