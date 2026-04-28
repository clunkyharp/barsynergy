import { getEnv } from '@/lib/validation/env';
import type { PublicFileReference } from './storage.types';

export function getPublicFileUrl(input: PublicFileReference) {
  const env = getEnv();

  if (env.STORAGE_DRIVER === 's3') {
    const bucket = input.bucket ?? env.S3_BUCKET_PUBLIC;

    if (!bucket || !env.S3_ENDPOINT) {
      throw new Error('Missing S3 public file URL configuration');
    }

    return `${env.S3_ENDPOINT}/${bucket}/${input.fileKey}`;
  }

  return `/uploads/${input.fileKey}`;
}
