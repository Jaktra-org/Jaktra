import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),

  DATABASE_URL: z.string().url(),

  JWT_SECRET: z.string().min(32, {
    message: 'JWT_SECRET must be at least 32 characters. Generate with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'base64\'))"'
  }),
  JWT_EXPIRES_IN: z.string().default('7d'),

  CORS_ORIGINS: z
    .string()
    .transform((val) => val.split(',').map((s) => s.trim())),

  FRONTEND_URL: z.string().url().default('http://localhost:5173'),

  SENDGRID_API_KEY: z.string().optional(),
  SENDGRID_WEBHOOK_PUBLIC_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),
  SENDGRID_INBOUND_PARSE_SECRET: z.string().optional(),
  INBOUND_PARSE_DOMAIN: z.string().optional(),

  AI_ML_SERVICE_URL: z.string().url().optional(),
  AI_ML_SERVICE_KEY: z.string().optional(),

  REDIS_URL: z.string().url().optional(),

  AUTH_LOCKOUT_THRESHOLD: z.coerce.number().int().positive().default(5),
  AUTH_LOCKOUT_BASE_MINUTES: z.coerce.number().int().positive().default(15),
  AUTH_LOCKOUT_MAX_MINUTES: z.coerce.number().int().positive().default(1440),
  AUTH_MFA_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),

  DISPUTE_LIMIT_PER_TENANT_HOURLY: z.coerce.number().int().positive().default(100),
  DISPUTE_LIMIT_PER_SENDER_HOURLY: z.coerce.number().int().positive().default(15),

  ENCRYPTION_KEY: z.string().refine((val) => {
    try {
      return Buffer.from(val, 'base64').length === 32;
    } catch {
      return false;
    }
  }, { message: "ENCRYPTION_KEY must be a valid base64 string exactly 32 bytes long." }),
}).refine((data) => {
  if (data.NODE_ENV === 'production') {
    return !!data.SENDGRID_WEBHOOK_PUBLIC_KEY && !!data.RAZORPAY_WEBHOOK_SECRET;
  }
  return true;
}, {
  message: "In production, SENDGRID_WEBHOOK_PUBLIC_KEY and RAZORPAY_WEBHOOK_SECRET are strictly required.",
  path: ["NODE_ENV"]
});

function parseConfig(): z.infer<typeof schema> {
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
