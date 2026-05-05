import { S3Client } from '@aws-sdk/client-s3';
import type { AppEnv } from '@/lib/validation/env';

let s3Client: S3Client | null = null;

export function getS3Client(env: AppEnv) {
  if (!s3Client) {
    s3Client = new S3Client({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID ?? '',
        secretAccessKey: env.S3_SECRET_ACCESS_KEY ?? ''
      },
      forcePathStyle: true
    });
  }

  return s3Client;
}
