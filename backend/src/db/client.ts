import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.js';

export interface DatabaseClientOptions {
  connectionString: string;
  maxConnections?: number;
}

export type DrizzleWithPool = NodePgDatabase<typeof schema> & { $pool: pg.Pool };

export function createDatabaseClient(options: DatabaseClientOptions): DrizzleWithPool {
  const isTest = process.env['NODE_ENV'] === 'test';
  const needsSsl = options.connectionString.includes('sslmode=') || options.connectionString.includes('neon.tech');
  const pool = new pg.Pool({
    connectionString: options.connectionString,
    max: options.maxConnections ?? (isTest ? 10 : 20),
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  });

  const db = drizzle(pool, { schema }) as unknown as DrizzleWithPool;
  db.$pool = pool;
  return db;
}

export type DatabaseClient = ReturnType<typeof createDatabaseClient>;
export type TransactionClient = Parameters<Parameters<DatabaseClient['transaction']>[0]>[0];
export type DatabaseOrTransaction = DatabaseClient | TransactionClient;
