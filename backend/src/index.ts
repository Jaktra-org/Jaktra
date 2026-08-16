import 'dotenv/config';
import { config } from './config/index.js';
import { createApp } from './app.js';
import { createDatabaseClient } from './db/index.js';
import { logger } from './shared/logger.js';
import { runMigrations } from './db/migrate.js';

import { createClient as createRedisClient } from 'redis';

await runMigrations().catch((err) => {
  logger.error('Failed to run database migrations on startup:', err);
  process.exit(1);
});

async function waitForRedis(url?: string, maxAttempts = 5, delayMs = 2000): Promise<void> {
  if (!url || process.env['NODE_ENV'] === 'test') return;
  const client = createRedisClient({ url });
  client.on('error', () => {}); 
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await client.connect();
      await client.ping();
      logger.info('✓ Redis service connected and healthy');
      await client.disconnect();
      return;
    } catch {
      logger.warn(`Waiting for Redis readiness (attempt ${attempt}/${maxAttempts})...`);
      if (attempt === maxAttempts) {
        logger.warn('Redis unavailable after max attempts — starting in fail-open mode');
        return;
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

await waitForRedis(config.REDIS_URL);

const db = createDatabaseClient({ connectionString: config.DATABASE_URL });


const app = createApp({
  corsOrigins: config.CORS_ORIGINS,
  db,
  jwtSecret: config.JWT_SECRET,
  jwtExpiresIn: config.JWT_EXPIRES_IN,
  aimlServiceUrl: config.AI_ML_SERVICE_URL,
  aimlServiceKey: config.AI_ML_SERVICE_KEY,
});

const server = app.listen(config.PORT, () => {
  logger.info(`Jaktra backend running on port ${config.PORT} [${config.NODE_ENV}]`);
  logger.info(`Health → http://localhost:${config.PORT}/api/health`);
});

function shutdown(signal: string): void {
  logger.info(`Received ${signal}. Starting graceful shutdown…`);

  server.close(() => {
    logger.info('No new connections. Waiting for in-flight requests…');
  });

  const agentService = app.locals.agentService;
  const checkInterval = setInterval(() => {
    if (!agentService || !agentService.hasActiveRuns()) {
      clearInterval(checkInterval);
      logger.info('All agent runs complete. Shutting down.');
      process.exit(0);
    }
  }, 1000);

  setTimeout(() => {
    clearInterval(checkInterval);
    logger.error('Forced shutdown after 30s timeout.');
    process.exit(1);
  }, 30_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Optional: exit gracefully depending on severe state, but at least ensure logging happens
});
