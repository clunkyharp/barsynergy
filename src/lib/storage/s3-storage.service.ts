import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import type { AppEnv } from '@/lib/validation/env';
import type { StorageService, UploadedFileResult, UploadFileInput } from './storage.types';

export class S3StorageService implements StorageService {
  private readonly client: S3Client;

  constructor(private readonly env: AppEnv) {
    this.client = new S3Client({
      endpoint: env.S3_ENDPOINT,
      region: env.S3_REGION,
      credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID ?? '',
        secretAccessKey: env.S3_SECRET_ACCESS_KEY ?? ''
      },
      forcePathStyle: true
    });
  }

  async uploadFile(input: UploadFileInput): Promise<UploadedFileResult> {
    const bucket = input.visibility === 'public' ? this.env.S3_BUCKET_PUBLIC : this.env.S3_BUCKET_PRIVATE;

    if (!bucket) {
      throw new Error(`Missing S3 bucket for ${input.visibility} file upload`);
    }

    const folder = input.folder ?? input.visibility;
    const extension = path.extname(input.originalName).toLowerCase();
    const fileKey = `${folder}/${randomUUID()}${extension}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: fileKey,
        Body: input.buffer,
        ContentType: input.mimeType
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

  async deleteFile(fileKey: string) {
    const buckets = [this.env.S3_BUCKET_PUBLIC, this.env.S3_BUCKET_PRIVATE].filter(Boolean);

    await Promise.all(
      buckets.map((bucket) =>
        this.client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: fileKey
          })
        )
      )
    );
  }

  getPublicUrl(fileKey: string) {
    return `${this.env.S3_ENDPOINT}/${this.env.S3_BUCKET_PUBLIC}/${fileKey}`;
  }
}
