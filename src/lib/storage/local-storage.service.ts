import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { AppEnv } from '@/lib/validation/env';
import type { StorageService, UploadedFileResult, UploadFileInput } from './storage.types';

export class LocalStorageService implements StorageService {
  constructor(private readonly env: AppEnv) {}

  async uploadFile(input: UploadFileInput): Promise<UploadedFileResult> {
    const folder = input.folder ?? input.visibility;
    const extension = path.extname(input.originalName).toLowerCase();
    const fileKey = `${folder}/${randomUUID()}${extension}`;
    const absolutePath = path.join(process.cwd(), this.env.LOCAL_UPLOAD_DIR, fileKey);

    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, input.buffer);

    return {
      storageDriver: 'local',
      fileKey,
      originalName: input.originalName,
      mimeType: input.mimeType,
      size: input.size,
      visibility: input.visibility,
      uploadedById: input.uploadedById
    };
  }

  async deleteFile(fileKey: string) {
    const absolutePath = path.join(process.cwd(), this.env.LOCAL_UPLOAD_DIR, fileKey);
    await rm(absolutePath, { force: true });
  }

  getPublicUrl(fileKey: string) {
    return `/uploads/${fileKey}`;
  }
}
