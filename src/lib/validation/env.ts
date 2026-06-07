import { z } from 'zod';

const emptyToUndefined = (value: unknown) => (value === '' ? undefined : value);
const optionalString = z.preprocess(emptyToUndefined, z.string().optional());
const optionalEmail = z.preprocess(emptyToUndefined, z.string().email().optional());
const optionalBooleanFlag = z
  .preprocess(emptyToUndefined, z.enum(['true', 'false']).optional())
  .transform((value) => (value === undefined ? undefined : value === 'true'));

const isValidServerActionsEncryptionKey = (value: string) => {
  try {
    const normalized = value.trim();
    const decoded = Buffer.from(normalized, 'base64');

    return [16, 24, 32].includes(decoded.length) && decoded.toString('base64').replace(/=+$/, '') === normalized.replace(/=+$/, '');
  } catch {
    return false;
  }
};

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    APP_URL: z.string().url().default('http://localhost:3000'),
    DATABASE_URL: optionalString,
    SESSION_SECRET: z.preprocess(emptyToUndefined, z.string().min(16).optional()),
    THROTTLE_SECRET: z.preprocess(emptyToUndefined, z.string().min(16).optional()),
    NEXT_SERVER_ACTIONS_ENCRYPTION_KEY: optionalString,
    APP_DEPLOYMENT_ID: optionalString,
    STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
    ALLOW_LOCAL_STORAGE_IN_PRODUCTION: optionalBooleanFlag,
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
    ADMIN_NOTIFICATION_EMAIL: optionalEmail,
    TELEGRAM_BOT_TOKEN: optionalString,
    TELEGRAM_ADMIN_CHAT_ID: optionalString,
    YANDEX_METRIKA_ID: optionalString,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: optionalString,
    TURNSTILE_SECRET_KEY: optionalString,
    LEGAL_OPERATOR_TYPE: z.enum(['legal_entity', 'individual_entrepreneur']).default('legal_entity'),
    LEGAL_OPERATOR_NAME: optionalString,
    LEGAL_OPERATOR_EMAIL: optionalEmail,
    LEGAL_OPERATOR_ADDRESS: optionalString,
    LEGAL_OPERATOR_TAX_ID: optionalString,
    LEGAL_OPERATOR_REGISTRATION_ID: optionalString,
    LEGAL_OPERATOR_CONFIRMED: optionalBooleanFlag,
    PERSONAL_DATA_LEGAL_REVIEW_APPROVED: optionalBooleanFlag,
    PERSONAL_DATA_RKN_NOTIFICATION_CONFIRMED: optionalBooleanFlag,
    PERSONAL_DATA_PROCESSOR_AGREEMENTS_CONFIRMED: optionalBooleanFlag,
    PERSONAL_DATA_RETENTION_RULE_APPROVED: optionalBooleanFlag,
    ALLOW_PUBLIC_FORMS_WITH_PENDING_LEGAL_REVIEW: optionalBooleanFlag,
    APPLICATION_FORMS_ENABLED: optionalBooleanFlag
  })
  .superRefine((env, ctx) => {
    const isProductionBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.npm_lifecycle_event === 'build';
    const isProductionRuntime = env.NODE_ENV === 'production' && !isProductionBuild;

    const allowLocalStorageInProduction = env.ALLOW_LOCAL_STORAGE_IN_PRODUCTION === true;

    if (env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY && !isValidServerActionsEncryptionKey(env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY)) {
      ctx.addIssue({
        code: 'custom',
        path: ['NEXT_SERVER_ACTIONS_ENCRYPTION_KEY'],
        message: 'NEXT_SERVER_ACTIONS_ENCRYPTION_KEY must be a base64-encoded AES key with 16, 24 or 32 bytes.'
      });
    }

    if (isProductionRuntime && env.STORAGE_DRIVER === 'local' && !allowLocalStorageInProduction) {
      ctx.addIssue({
        code: 'custom',
        path: ['STORAGE_DRIVER'],
        message: 'Production must use STORAGE_DRIVER=s3 unless ALLOW_LOCAL_STORAGE_IN_PRODUCTION=true is set explicitly for a single-server fallback.'
      });
    }

    if (isProductionRuntime && env.STORAGE_DRIVER === 's3') {
      const required = [
        'DATABASE_URL',
        'SESSION_SECRET',
        'NEXT_SERVER_ACTIONS_ENCRYPTION_KEY',
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

    if (isProductionRuntime && env.STORAGE_DRIVER === 'local') {
      for (const key of ['DATABASE_URL', 'SESSION_SECRET', 'NEXT_SERVER_ACTIONS_ENCRYPTION_KEY'] as const) {
        if (!env[key]) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `${key} is required in production`
          });
        }
      }
    }

    if (
      isProductionRuntime &&
      env.APPLICATION_FORMS_ENABLED === true &&
      env.ALLOW_PUBLIC_FORMS_WITH_PENDING_LEGAL_REVIEW !== true
    ) {
      for (const key of [
        'LEGAL_OPERATOR_NAME',
        'LEGAL_OPERATOR_EMAIL',
        'LEGAL_OPERATOR_ADDRESS',
        'LEGAL_OPERATOR_TAX_ID',
        'LEGAL_OPERATOR_REGISTRATION_ID',
        'LEGAL_OPERATOR_CONFIRMED',
        'PERSONAL_DATA_LEGAL_REVIEW_APPROVED',
        'PERSONAL_DATA_RKN_NOTIFICATION_CONFIRMED',
        'PERSONAL_DATA_PROCESSOR_AGREEMENTS_CONFIRMED',
        'PERSONAL_DATA_RETENTION_RULE_APPROVED'
      ] as const) {
        if (env[key] !== true && !env[key]) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `${key} is required in production when APPLICATION_FORMS_ENABLED=true`
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
