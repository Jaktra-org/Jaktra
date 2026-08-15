
import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env['DATABASE_URL'];

if (!databaseUrl) {
  throw new Error(
    '[drizzle.config.ts] DATABASE_URL environment variable is not set.\n' +
      'Copy .env.example to .env and fill in your PostgreSQL connection string.'
  );
}

export default defineConfig({
  schema: './src/db/schema.ts',

  out: './migrations',

  dialect: 'postgresql',

  dbCredentials: {
    url: databaseUrl,
  },

  verbose: true,
   
  strict: false,
});
