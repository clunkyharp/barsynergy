import { FileVisibility, StorageDriver } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { getStorageService } from '@/lib/storage/storage.service';
import { MAX_UPLOAD_FILE_SIZE_BYTES } from '@/lib/storage/storage.types';
import { isAllowedPrivateResumeUpload } from '@/lib/applications/private-resume-file-rules';

export async function uploadPrivateResumeFromFormData(formData: FormData, key: string) {
  const file = formData.get(key);

  if (!(file instanceof File) || file.size === 0) {
    return undefined;
  }

  if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
    throw new Error('private resume file is too large');
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (!isAllowedPrivateResumeUpload({ mimeType: file.type, originalName: file.name, buffer })) {
    throw new Error('unsupported private resume file');
  }

  const upload = await getStorageService().uploadFile({
    buffer,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    visibility: 'private',
    folder: 'private-applications/resumes'
  });

  return prisma.uploadedFile.create({
    data: {
      storageDriver: upload.storageDriver === 's3' ? StorageDriver.S3 : StorageDriver.LOCAL,
      bucket: upload.bucket ?? null,
      fileKey: upload.fileKey,
      originalName: upload.originalName,
      mimeType: upload.mimeType,
      size: upload.size,
      visibility: FileVisibility.PRIVATE
    },
    select: {
      id: true,
      fileKey: true,
      bucket: true,
      originalName: true,
      mimeType: true,
      size: true,
      storageDriver: true
    }
  });
}
