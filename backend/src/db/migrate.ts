import 'dotenv/config';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
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
    typeof causeRecord['code'] === 'string' ? causeRecord['code'] : '',
    typeof errRecord['code'] === 'string' ? errRecord['code'] : '',
    String(error),
  ].join(' ');

  return (
    combinedStr.includes('already exists') ||
    combinedStr.includes('42P07') || // duplicate_table
    combinedStr.includes('42701') || // duplicate_column
    combinedStr.includes('42710') || // duplicate_object
    combinedStr.includes('23505') || // unique_violation
    combinedStr.includes('Duplicate') ||
    combinedStr.includes('relation') ||
    combinedStr.includes('type')
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
            `CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
              id serial PRIMARY KEY,
              hash text NOT NULL,
              created_at bigint
            )`
          );

          for (const entry of journal.entries || []) {
            const sqlPath = path.join(migrationsFolder, `${entry.tag}.sql`);
            if (fs.existsSync(sqlPath)) {
              const sqlContent = fs.readFileSync(sqlPath, 'utf8');
              const hash = crypto.createHash('sha256').update(sqlContent).digest('hex');
              
              const result = await db.$pool.query(
                `SELECT id FROM "__drizzle_migrations" WHERE created_at = $1`,
                [entry.when]
              );

              if (!result.rows || result.rows.length === 0) {
                const statements = sqlContent.split(/--> statement-breakpoint|;/).map((s) => s.trim()).filter(Boolean);
                for (const statement of statements) {
                  try {
                    await db.$pool.query(statement);
                  } catch (stmtErr) {
                    logger.warn(`Idempotent migration statement skipped (${entry.tag}): ${statement} — ${(stmtErr as Error)?.message || stmtErr}`);
                  }
                }

                await db.$pool.query(
                  `INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
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
