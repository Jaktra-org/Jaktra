import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

if (!process.env.CORS_ORIGINS) {
  process.env.CORS_ORIGINS = 'http://localhost:5173';
}

if (!process.env.ENCRYPTION_KEY) {
  // Use a fallback 32-byte base64-encoded key for testing
  process.env.ENCRYPTION_KEY = 'Vyqs/4WCpMv/+IJAbUkzI0N5BwknxDABslc1jnI2f80=';
}

