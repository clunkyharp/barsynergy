import { FileVisibility, StorageDriver } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { getString } from '@/lib/forms/form-data';
import { isAllowedPublicImageUpload } from '@/lib/storage/file-signatures';
import { MAX_UPLOAD_FILE_SIZE_BYTES } from '@/lib/storage/storage.types';

export async function uploadPublicContentImageFromFormData(formData: FormData, key: string, userId: string) {
  const file = formData.get(key);

  if (!(file instanceof File) || file.size === 0) {
    return undefined;
  }

  if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
    throw new Error('File is too large.');
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  if (!isAllowedPublicImageUpload({ mimeType: file.type, originalName: file.name, buffer })) {
    throw new Error('Unsupported image type.');
  }

  const { getStorageService } = await import('@/lib/storage/storage.service');
  const storageService = getStorageService();
  const upload = await storageService.uploadFile({
    buffer,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    visibility: 'public',
    uploadedById: userId,
    folder: 'public-content'
  });

  const uploadedFile = await prisma.uploadedFile.create({
    data: {
      storageDriver: upload.storageDriver === 's3' ? StorageDriver.S3 : StorageDriver.LOCAL,
      bucket: upload.bucket ?? null,
      fileKey: upload.fileKey,
      originalName: upload.originalName,
      mimeType: upload.mimeType,
      size: upload.size,
      visibility: FileVisibility.PUBLIC,
      uploadedById: userId
    },
    select: {
      id: true,
      fileKey: true,
      bucket: true,
      originalName: true,
      mimeType: true,
      size: true,
      visibility: true
    }
  });

  const publicUrl = storageService.getPublicUrl({
    fileKey: uploadedFile.fileKey,
    bucket: uploadedFile.bucket ?? undefined,
    visibility: 'public'
  });

  return {
    file: uploadedFile,
    publicUrl
  };
}

export async function resolveCoverImageId(input: {
  formData: FormData;
  userId: string;
  currentCoverImageId?: string | null;
  formDataKey?: string;
  removeFormDataKey?: string;
  onUploadedImageId?: (fileId: string) => void;
}) {
  const uploadedImage = await uploadPublicContentImageFromFormData(input.formData, input.formDataKey ?? 'coverImage', input.userId);

  if (uploadedImage) {
    input.onUploadedImageId?.(uploadedImage.file.id);
    return uploadedImage.file.id;
  }

  if (getString(input.formData, input.removeFormDataKey ?? 'removeCoverImage') === 'true') {
    return null;
  }

  return input.currentCoverImageId ?? null;
}

async function getUploadedFileReferenceCount(fileId: string) {
  const [
    articleCount,
    eventCount,
    courseCount,
    vacancyCount,
    supplierCount,
    partnerCount,
    generalSponsorLogoCount,
    generalSponsorCoverCount,
    resumeApplicationCount
  ] = await Promise.all([
    prisma.article.count({ where: { coverImageId: fileId } }),
    prisma.event.count({ where: { coverImageId: fileId } }),
    prisma.course.count({ where: { coverImageId: fileId } }),
    prisma.vacancy.count({ where: { coverImageId: fileId } }),
    prisma.supplier.count({ where: { coverImageId: fileId } }),
    prisma.partner.count({ where: { coverImageId: fileId } }),
    prisma.generalSponsor.count({ where: { logoImageId: fileId } }),
    prisma.generalSponsor.count({ where: { coverImageId: fileId } }),
    prisma.application.count({ where: { resumeFileId: fileId } })
  ]);

  return (
    articleCount +
    eventCount +
    courseCount +
    vacancyCount +
    supplierCount +
    partnerCount +
    generalSponsorLogoCount +
    generalSponsorCoverCount +
    resumeApplicationCount
  );
}

export async function deleteUploadedFileIfUnused(fileId: string | null | undefined) {
  if (!fileId) {
    return;
  }

  const file = await prisma.uploadedFile.findUnique({
    where: { id: fileId },
    select: { id: true, fileKey: true, bucket: true }
  });

  if (!file || (await getUploadedFileReferenceCount(file.id)) > 0) {
    return;
  }

  const { getStorageService } = await import('@/lib/storage/storage.service');
  try {
    await getStorageService().deleteFile({
      fileKey: file.fileKey,
      bucket: file.bucket ?? undefined
    });
    await prisma.uploadedFile.deleteMany({ where: { id: file.id } });
  } catch (error) {
    console.error('Failed to delete unused uploaded file.', error);
  }
}
