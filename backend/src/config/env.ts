import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),

  DATABASE_URL: z.string().url(),

  JWT_SECRET: z.string().min(12),
  JWT_EXPIRES_IN: z.string().default('7d'),

  CORS_ORIGINS: z
    .string()
    .transform((val) => val.split(',').map((s) => s.trim())),

  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_WEBHOOK_PUBLIC_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  AI_ML_SERVICE_URL: z.string().url().optional(),

  REDIS_URL: z.string().url().optional(),
});

function parseConfig() {
  const result = schema.safeParse(process.env);

  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }

  return result.data;
}


export const config = parseConfig();

export type Config = typeof config;
