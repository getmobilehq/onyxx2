import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const configSchema = z.object({
  nodeEnv: z.enum(['development', 'production', 'test']).default('development'),
  port: z.coerce.number().default(3001),
  webUrl: z.string().url().default('http://localhost:5173'),
  apiUrl: z.string().url().default('http://localhost:3001'),
  databaseUrl: z.string().min(1),
  redisUrl: z.string().optional(),
  jwtSecret: z.string().min(32),
  auth0Domain: z.string().optional(),
  auth0ClientId: z.string().optional(),
  auth0ClientSecret: z.string().optional(),
  auth0Audience: z.string().optional(),
  supabaseUrl: z.string().url().optional(),
  supabaseAnonKey: z.string().optional(),
  supabaseServiceRoleKey: z.string().optional(),
  supabaseStorageBucket: z.string().default('onyx-photos'),
  awsRegion: z.string().optional(),
  awsAccessKeyId: z.string().optional(),
  awsSecretAccessKey: z.string().optional(),
  s3Bucket: z.string().optional(),
  s3Region: z.string().optional(),
  cloudfrontUrl: z.string().optional(),
  sendgridApiKey: z.string().optional(),
  fromEmail: z.string().email().optional(),
  sentryDsn: z.string().optional(),
});

const envConfig = {
  nodeEnv: process.env.NODE_ENV,
  port: process.env.PORT,
  webUrl: process.env.WEB_URL,
  apiUrl: process.env.API_URL,
  databaseUrl: process.env.DATABASE_URL || 'postgresql://onyx:onyx@localhost:5432/onyx_dev',
  redisUrl: process.env.REDIS_URL,
  jwtSecret: process.env.JWT_SECRET,
  auth0Domain: process.env.AUTH0_DOMAIN,
  auth0ClientId: process.env.AUTH0_CLIENT_ID,
  auth0ClientSecret: process.env.AUTH0_CLIENT_SECRET,
  auth0Audience: process.env.AUTH0_AUDIENCE,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET,
  awsRegion: process.env.AWS_REGION,
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  s3Bucket: process.env.S3_BUCKET,
  s3Region: process.env.S3_REGION,
  cloudfrontUrl: process.env.CLOUDFRONT_URL,
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  fromEmail: process.env.FROM_EMAIL,
  sentryDsn: process.env.SENTRY_DSN,
};

export const config = configSchema.parse(envConfig);
