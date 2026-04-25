import { getEnv } from '@/lib/validation/env';
import { LocalStorageService } from './local-storage.service';
import { S3StorageService } from './s3-storage.service';
import type { StorageService } from './storage.types';

let storageService: StorageService | null = null;

export function getStorageService() {
  if (storageService) {
    return storageService;
  }

  const env = getEnv();
  storageService = env.STORAGE_DRIVER === 's3' ? new S3StorageService(env) : new LocalStorageService(env);

  return storageService;
}
