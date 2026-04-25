import { z } from 'zod';

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().optional());

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    APP_URL: z.string().url().default('http://localhost:3000'),
    DATABASE_URL: optionalString,
    SESSION_SECRET: z.preprocess(emptyToUndefined, z.string().min(16).optional()),
    STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
    LOCAL_UPLOAD_DIR: z.string().default('./uploads'),
    S3_ENDPOINT: z.preprocess(emptyToUndefined, z.string().url().optional()),
    S3_REGION: optionalString,
    S3_BUCKET_PUBLIC: optionalString,
    S3_BUCKET_PRIVATE: optionalString,
    S3_ACCESS_KEY_ID: optionalString,
    S3_SECRET_ACCESS_KEY: optionalString,
    SMTP_HOST: optionalString,
    SMTP_PORT: z.preprocess(emptyToUndefined, z.coerce.number().int().positive().optional()),
    SMTP_USER: optionalString,
    SMTP_PASSWORD: optionalString,
    SMTP_FROM: optionalString,
    TELEGRAM_BOT_TOKEN: optionalString,
    TELEGRAM_ADMIN_CHAT_ID: optionalString,
    YANDEX_METRIKA_ID: optionalString
  })
  .superRefine((env, ctx) => {
    const isProductionBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.npm_lifecycle_event === 'build';
    const isProductionRuntime = env.NODE_ENV === 'production' && !isProductionBuild;

    if (isProductionRuntime && env.STORAGE_DRIVER === 'local') {
      ctx.addIssue({
        code: 'custom',
        path: ['STORAGE_DRIVER'],
        message: 'Production must use STORAGE_DRIVER=s3. Local uploads are allowed only in development.'
      });
    }

    if (isProductionRuntime) {
      const required = [
        'DATABASE_URL',
        'SESSION_SECRET',
        'S3_ENDPOINT',
        'S3_REGION',
        'S3_BUCKET_PUBLIC',
        'S3_BUCKET_PRIVATE',
        'S3_ACCESS_KEY_ID',
        'S3_SECRET_ACCESS_KEY'
      ] as const;

      for (const key of required) {
        if (!env[key]) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `${key} is required in production`
          });
        }
      }
    }
  });

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export function getEnv() {
  if (!cachedEnv) {
    cachedEnv = envSchema.parse(process.env);
  }

  return cachedEnv;
}
