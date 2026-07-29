

import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import * as schema from './schema.js';

export interface DatabaseClientOptions {
  connectionString: string;
  maxConnections?: number;
}

type DrizzleWithPool = MySql2Database<typeof schema> & { $pool: mysql.Pool };

export function createDatabaseClient(options: DatabaseClientOptions): DrizzleWithPool {
  const pool = mysql.createPool({
    uri: options.connectionString,
    connectionLimit: options.maxConnections ?? (process.env['NODE_ENV'] === 'test' ? 10 : 20),
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
  });

  const db = drizzle(pool, { schema, mode: 'default' }) as unknown as DrizzleWithPool;
  db.$pool = pool;
  return db;
}

export type DatabaseClient = ReturnType<typeof createDatabaseClient>;
export type TransactionClient = Parameters<Parameters<DatabaseClient['transaction']>[0]>[0];
export type DatabaseOrTransaction = DatabaseClient | TransactionClient;

