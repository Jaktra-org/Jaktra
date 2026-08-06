import { migrate } from 'drizzle-orm/mysql2/migrator';
import { createDatabaseClient } from './client.js';
import { logger } from '../shared/logger.js';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface JournalEntry {
  idx: number;
  version: string;
  when: number;
  tag: string;
  breakpoints?: boolean;
}

interface Journal {
  version: string;
  dialect: string;
  entries: JournalEntry[];
}

function isSchemaAlreadyExistsError(error: unknown): boolean {
  if (!error) return false;

  const errRecord = typeof error === 'object' && error !== null ? (error as Record<string, unknown>) : {};
  const causeRecord = typeof errRecord['cause'] === 'object' && errRecord['cause'] !== null
    ? (errRecord['cause'] as Record<string, unknown>)
    : {};

  const combinedStr = [
    typeof errRecord['message'] === 'string' ? errRecord['message'] : '',
    typeof causeRecord['message'] === 'string' ? causeRecord['message'] : '',
    typeof causeRecord['sqlMessage'] === 'string' ? causeRecord['sqlMessage'] : '',
    typeof causeRecord['code'] === 'string' ? causeRecord['code'] : '',
    String(error),
  ].join(' ');

  return (
    combinedStr.includes('already exists') ||
    combinedStr.includes('Duplicate foreign key constraint') ||
    combinedStr.includes('Duplicate key') ||
    combinedStr.includes('ER_DUP_KEY') ||
    combinedStr.includes('ER_TABLE_EXISTS_ERROR') ||
    combinedStr.includes('ER_FK_DUP_NAME') ||
    combinedStr.includes('ER_DUP_KEYNAME')
  );
}

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
    if (isSchemaAlreadyExistsError(error)) {
      logger.warn('Database schema or constraints already present. Syncing __drizzle_migrations tracking table...');
      try {
        const migrationsFolder = path.resolve(__dirname, '../../migrations');
        const journalPath = path.join(migrationsFolder, 'meta', '_journal.json');
        
        if (fs.existsSync(journalPath)) {
          const journal: Journal = JSON.parse(fs.readFileSync(journalPath, 'utf8'));
          
          await db.$pool.query(
            `CREATE TABLE IF NOT EXISTS \`__drizzle_migrations\` (
              \`id\` serial PRIMARY KEY,
              \`hash\` text NOT NULL,
              \`created_at\` bigint
            )`
          );

          for (const entry of journal.entries || []) {
            const sqlPath = path.join(migrationsFolder, `${entry.tag}.sql`);
            if (fs.existsSync(sqlPath)) {
              const sqlContent = fs.readFileSync(sqlPath, 'utf8');
              const hash = crypto.createHash('sha256').update(sqlContent).digest('hex');
              
              const [rows] = await db.$pool.query(
                `SELECT id FROM \`__drizzle_migrations\` WHERE \`created_at\` = ?`,
                [entry.when]
              );

              if (!Array.isArray(rows) || rows.length === 0) {
                await db.$pool.query(
                  `INSERT INTO \`__drizzle_migrations\` (\`hash\`, \`created_at\`) VALUES (?, ?)`,
                  [hash, entry.when]
                );
              }
            }
          }
          logger.info('Successfully synced existing database schema with __drizzle_migrations.');
          return;
        }
      } catch (recoveryErr) {
        logger.error('Failed to sync __drizzle_migrations tracking table:', recoveryErr);
      }
    } else {
      logger.error('Error applying database migrations:', error);
      throw error;
    }
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
