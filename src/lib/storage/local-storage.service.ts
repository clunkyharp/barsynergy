import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { AppEnv } from '@/lib/validation/env';
import type { DeleteFileInput, StorageService, UploadedFileResult, UploadFileInput } from './storage.types';

export class LocalStorageService implements StorageService {
  constructor(private readonly env: AppEnv) {}

  async uploadFile(input: UploadFileInput): Promise<UploadedFileResult> {
    const folder = this.normalizeFolder(input.folder ?? input.visibility);
    const extension = path.extname(input.originalName).toLowerCase();
    const fileKey = `${folder}/${randomUUID()}${extension}`;
    const absolutePath = this.resolveUploadPath(fileKey);

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

  async deleteFile(input: DeleteFileInput) {
    const fileKey = typeof input === 'string' ? input : input.fileKey;
    const absolutePath = this.resolveUploadPath(fileKey);
    await rm(absolutePath, { force: true });
  }

  getPublicUrl(fileKey: string) {
    return `/uploads/${fileKey}`;
  }

  private resolveUploadPath(fileKey: string) {
    const uploadRoot = path.resolve(process.cwd(), this.env.LOCAL_UPLOAD_DIR);
    const absolutePath = path.resolve(uploadRoot, fileKey);
    const relativeToRoot = path.relative(uploadRoot, absolutePath);

    if (relativeToRoot.startsWith('..') || path.isAbsolute(relativeToRoot)) {
      throw new Error('Invalid local storage file path');
    }

    return absolutePath;
  }

  private normalizeFolder(folder: string) {
    const normalized = folder.replace(/\\/g, '/');
    const segments = normalized.split('/').filter(Boolean);

    if (segments.length === 0) {
      throw new Error('Invalid storage folder');
    }

    if (segments.some((segment) => segment === '.' || segment === '..')) {
      throw new Error('Invalid storage folder');
    }

    return segments.join('/');
  }
}
