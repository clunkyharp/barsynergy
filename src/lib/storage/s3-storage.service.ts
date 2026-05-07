import { DeleteObjectCommand, PutObjectCommand, type S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { AppEnv } from '@/lib/validation/env';
import { getS3Client } from './s3-client';
import {
  MAX_UPLOAD_FILE_SIZE_BYTES,
  type DeleteFileInput,
  type PublicFileReference,
  type StorageService,
  type UploadedFileResult,
  type UploadFileInput
} from './storage.types';

export class S3StorageService implements StorageService {
  private readonly client: S3Client;

  constructor(private readonly env: AppEnv) {
    this.client = getS3Client(env);
  }

  async uploadFile(input: UploadFileInput): Promise<UploadedFileResult> {
    this.assertUploadSize(input);

    const bucket = input.visibility === 'public' ? this.env.S3_BUCKET_PUBLIC : this.env.S3_BUCKET_PRIVATE;

    if (!bucket) {
      throw new Error(`Missing S3 bucket for ${input.visibility} file upload`);
    }

    const folder = this.normalizeFolder(input.folder ?? input.visibility);
    const extension = path.extname(input.originalName).toLowerCase();
    const fileKey = `${folder}/${randomUUID()}${extension}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileKey,
        Body: input.buffer,
        ContentType: input.mimeType,
        ServerSideEncryption: 'AES256'
      })
    );

    return {
      storageDriver: 's3',
      bucket,
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
    const exactBucket = typeof input === 'string' ? undefined : input.bucket;

    if (!exactBucket) {
      throw new Error('S3 file deletion requires an exact bucket');
    }

    await Promise.all(
      [exactBucket].map((bucket) =>
        this.client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: fileKey
          })
        )
      )
    );
  }

  getPublicUrl(input: PublicFileReference) {
    const bucket = input.bucket ?? this.env.S3_BUCKET_PUBLIC;

    if (!bucket) {
      throw new Error('Missing S3 public bucket');
    }

    return `${this.env.S3_ENDPOINT}/${bucket}/${input.fileKey}`;
  }

  private assertUploadSize(input: UploadFileInput) {
    if (input.size > MAX_UPLOAD_FILE_SIZE_BYTES || input.buffer.byteLength > MAX_UPLOAD_FILE_SIZE_BYTES) {
      throw new Error('File is too large for current upload limits');
    }
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
