import { redirect } from 'next/navigation';
import { ContentStatus, FileVisibility, StorageDriver } from '@prisma/client';
import { ZodError } from 'zod';
import { prisma } from '@/lib/db/prisma';
import { MAX_UPLOAD_FILE_SIZE_BYTES } from '@/lib/storage/storage.types';

export type AdminContentSearchParams = Record<string, string | string[] | undefined>;

export const ADMIN_CONTENT_PAGE_SIZE = 12;

const ALLOWED_PUBLIC_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

export const contentStatusValues = [
  ContentStatus.DRAFT,
  ContentStatus.REVIEW,
  ContentStatus.PUBLISHED,
  ContentStatus.ARCHIVED
] as const;

export const contentStatusLabels: Record<ContentStatus, string> = {
  [ContentStatus.DRAFT]: 'Черновик',
  [ContentStatus.REVIEW]: 'На проверке',
  [ContentStatus.PUBLISHED]: 'Опубликовано',
  [ContentStatus.ARCHIVED]: 'Архив'
};

export const contentStatusBadgeVariants: Record<ContentStatus, 'neutral' | 'success' | 'warning' | 'danger'> = {
  [ContentStatus.DRAFT]: 'neutral',
  [ContentStatus.REVIEW]: 'warning',
  [ContentStatus.PUBLISHED]: 'success',
  [ContentStatus.ARCHIVED]: 'danger'
};

export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function getAdminPage(params: AdminContentSearchParams) {
  const value = Number.parseInt(firstParam(params.page) ?? '1', 10);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

export function getAdminTotalPages(total: number) {
  return Math.max(1, Math.ceil(total / ADMIN_CONTENT_PAGE_SIZE));
}

export function getAdminCurrentPath(basePath: string, params: AdminContentSearchParams) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (key === 'success' || key === 'error') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) {
          query.append(key, item);
        }
      });
      return;
    }

    if (value) {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export function optionalString(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

export function nullableString(value?: string) {
  return value && value.length > 0 ? value : null;
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

export function initialPublicationDates(status: ContentStatus) {
  const now = new Date();

  return {
    publishedAt: status === ContentStatus.PUBLISHED ? now : null,
    archivedAt: status === ContentStatus.ARCHIVED ? now : null
  };
}

export function statusTransitionDates(status: ContentStatus, currentPublishedAt: Date | null) {
  const now = new Date();

  if (status === ContentStatus.PUBLISHED) {
    return {
      publishedAt: currentPublishedAt ?? now,
      archivedAt: null
    };
  }

  if (status === ContentStatus.ARCHIVED) {
    return {
      archivedAt: now
    };
  }

  return {
    publishedAt: null,
    archivedAt: null
  };
}

export function safeAdminRedirectPath(formData: FormData, fallbackPath: string) {
  const value = getString(formData, 'redirectTo');
  return value === fallbackPath || value.startsWith(`${fallbackPath}?`) ? value : fallbackPath;
}

export function adminActionResultPath(
  targetPath: string,
  result: { type: 'success' | 'error'; message: string }
) {
  const url = new URL(targetPath, 'http://localhost');
  url.searchParams.delete('success');
  url.searchParams.delete('error');
  url.searchParams.set(result.type, result.message);
  return `${url.pathname}${url.search}`;
}

export function redirectWithAdminActionResult(
  targetPath: string,
  result: { type: 'success' | 'error'; message: string }
): never {
  redirect(adminActionResultPath(targetPath, result));
}

export function formatAdminActionError(error: unknown) {
  if (error instanceof ZodError) {
    return 'Проверьте обязательные поля и формат значений.';
  }

  if (error instanceof Error) {
    if (error.message.includes('slug is required')) {
      return 'Укажите slug или заголовок, из которого можно создать slug.';
    }

    if (error.message.includes('category is invalid')) {
      return 'Выбранная категория недоступна для этого раздела.';
    }

    if (error.message.includes('city is invalid')) {
      return 'Выбранный город недоступен.';
    }

    if (error.message.includes('end date cannot be before start date')) {
      return 'Дата окончания не может быть раньше даты начала.';
    }

    if (error.message.includes('Unsupported image type')) {
      return 'Загрузите изображение JPEG, PNG, WebP или AVIF.';
    }

    if (error.message.includes('File is too large')) {
      return 'Файл слишком большой для текущего лимита загрузки.';
    }
  }

  return 'Не удалось сохранить изменения. Проверьте данные и повторите попытку.';
}

export async function uploadPublicContentImageFromFormData(formData: FormData, key: string, userId: string) {
  const file = formData.get(key);

  if (!(file instanceof File) || file.size === 0) {
    return undefined;
  }

  if (!ALLOWED_PUBLIC_IMAGE_TYPES.has(file.type)) {
    throw new Error('Unsupported image type.');
  }

  if (file.size > MAX_UPLOAD_FILE_SIZE_BYTES) {
    throw new Error('File is too large.');
  }

  const buffer = Buffer.from(await file.arrayBuffer());
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
}) {
  const uploadedImage = await uploadPublicContentImageFromFormData(input.formData, 'coverImage', input.userId);

  if (uploadedImage) {
    return uploadedImage.file.id;
  }

  if (getString(input.formData, 'removeCoverImage') === 'true') {
    return null;
  }

  return input.currentCoverImageId ?? null;
}
