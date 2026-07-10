

import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

const { Pool } = pg;

export interface DatabaseClientOptions {
  connectionString: string;
  maxConnections?: number;
}

type DrizzleWithPool = NodePgDatabase<typeof schema> & { $pool: pg.Pool };

export function createDatabaseClient(options: DatabaseClientOptions): DrizzleWithPool {
  const pool = new Pool({
    connectionString: options.connectionString,
    statement_timeout: 30000,  
    query_timeout: 30000,
    connectionTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    max: options.maxConnections ?? (process.env['NODE_ENV'] === 'test' ? 10 : 20),
  });

  const db = drizzle(pool, { schema }) as unknown as DrizzleWithPool;
  db.$pool = pool;
  return db;
}

export type DatabaseClient = ReturnType<typeof createDatabaseClient>;
export type TransactionClient = Parameters<Parameters<DatabaseClient['transaction']>[0]>[0];
export type DatabaseOrTransaction = DatabaseClient | TransactionClient;
