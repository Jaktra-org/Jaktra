import { migrate } from 'drizzle-orm/mysql2/migrator';
import { createDatabaseClient } from './client.js';
import { logger } from '../shared/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runMigrations(): Promise<void> {
  const connectionString = process.env['DATABASE_URL'];
  if (!connectionString) {
    logger.error('DATABASE_URL is not set. Skipping migrations.');
    return;
  }
  
  logger.info('Starting database migrations...');
  const db = createDatabaseClient({ connectionString });
  
  try {
    const migrationsFolder = path.resolve(__dirname, '../../migrations');
    await migrate(db, { migrationsFolder });
    logger.info('Database migrations applied successfully.');
  } catch (error) {
    logger.error('Error applying database migrations:', error);
    throw error;
  } finally {
    await db.$pool.end();
  }
}

if (process.argv[1] && (process.argv[1].endsWith('migrate.js') || process.argv[1].endsWith('migrate.ts'))) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error('Migration failed:', err);
      process.exit(1);
    });
}
