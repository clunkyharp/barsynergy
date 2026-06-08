import { redirect } from 'next/navigation';
import { CategoryType, ContentStatus, FileVisibility, Prisma, StorageDriver } from '@prisma/client';
import { hasErrorMessage, resolveServerActionError } from '../actions/server-action-errors';
import { prisma } from '@/lib/db/prisma';
import { firstParam } from '@/lib/admin/content-ui';
import { isAllowedPublicImageUpload } from '@/lib/storage/file-signatures';
import { MAX_UPLOAD_FILE_SIZE_BYTES } from '@/lib/storage/storage.types';

export {
  firstParam,
  PUBLICATION_STATUS_HINT,
  contentStatusLabels
} from '@/lib/admin/content-ui';
export {
  courseFormatOptions,
  courseLevelOptions,
  eventFormatOptions,
  eventRegistrationModeOptions,
  getAdminOptionLabel,
  partnerTypeOptions,
  vacancyEmploymentTypeOptions,
  vacancyExperienceOptions
} from '@/lib/admin/content-labels';

export type AdminContentSearchParams = Record<string, string | string[] | undefined>;

export const ADMIN_CONTENT_PAGE_SIZE = 12;

export const contentStatusValues = [
  ContentStatus.DRAFT,
  ContentStatus.REVIEW,
  ContentStatus.PUBLISHED,
  ContentStatus.ARCHIVED
] as const;

export const contentStatusBadgeVariants: Record<ContentStatus, 'neutral' | 'success' | 'warning' | 'danger' | 'pending'> = {
  [ContentStatus.DRAFT]: 'neutral',
  [ContentStatus.REVIEW]: 'warning',
  [ContentStatus.PUBLISHED]: 'success',
  [ContentStatus.ARCHIVED]: 'neutral'
};

export function getAdminPage(params: AdminContentSearchParams) {
  const value = Number.parseInt(firstParam(params.page) ?? '1', 10);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

export function getAdminSearchQuery(params: AdminContentSearchParams) {
  const value = firstParam(params.q)?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function getAdminStatusFilter(params: AdminContentSearchParams) {
  const value = firstParam(params.status);
  return contentStatusValues.includes(value as ContentStatus) ? (value as ContentStatus) : undefined;
}

export function getAdminStringFilter(params: AdminContentSearchParams, key: string) {
  const value = firstParam(params[key])?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function getAdminBooleanFilter(params: AdminContentSearchParams, key: string) {
  const value = firstParam(params[key])?.trim();

  if (value === 'true') {
    return true;
  }

  if (value === 'false') {
    return false;
  }

  return undefined;
}

export function withCurrentValueOption(
  options: Array<{ value: string; label: string }>,
  currentValue?: string | null
) {
  const value = currentValue?.trim();

  if (!value || options.some((option) => option.value === value)) {
    return options;
  }

  return [{ value, label: value }, ...options];
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

export function getArray(formData: FormData, key: string): string[] {
  const raw = formData.getAll(key);
  return raw.filter((v): v is string => typeof v === 'string' && v.length > 0);
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

export async function findUniqueSlug(baseSlug: string, exists: (candidate: string) => Promise<boolean>) {
  let candidate = baseSlug;
  let suffix = 2;

  while (await exists(candidate)) {
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return candidate;
}

function isSlugUniqueConstraintError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002' &&
    Array.isArray(error.meta?.target) &&
    error.meta.target.some((value) => String(value).toLowerCase().includes('slug'))
  );
}

export async function persistWithUniqueSlugRetry<T>(input: {
  baseSlug: string;
  exists: (candidate: string) => Promise<boolean>;
  persist: (candidate: string) => Promise<T>;
  maxAttempts?: number;
}) {
  const maxAttempts = input.maxAttempts ?? 3;
  let attempt = 0;

  while (attempt < maxAttempts) {
    const candidate = await findUniqueSlug(input.baseSlug, input.exists);

    try {
      return await input.persist(candidate);
    } catch (error) {
      if (!isSlugUniqueConstraintError(error) || attempt === maxAttempts - 1) {
        throw error;
      }
    }

    attempt += 1;
  }

  throw new Error('slug retry limit reached');
}

export async function assertActiveContentRelations(input: {
  entityName: string;
  categoryId?: string;
  categoryType?: CategoryType;
  cityId?: string;
}) {
  const [category, city] = await Promise.all([
    input.categoryId && input.categoryType
      ? prisma.category.findFirst({
          where: { id: input.categoryId, type: input.categoryType, isActive: true },
          select: { id: true }
        })
      : null,
    input.cityId
      ? prisma.city.findFirst({
          where: { id: input.cityId, isActive: true },
          select: { id: true }
        })
      : null
  ]);

  if (input.categoryId && !category) {
    throw new Error(`${input.entityName} category is invalid.`);
  }

  if (input.cityId && !city) {
    throw new Error(`${input.entityName} city is invalid.`);
  }
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

export function safeAdminRedirectPath(formData: FormData, fallbackPath: string, allowedBasePaths: string[] = [fallbackPath]) {
  const value = getString(formData, 'redirectTo');
  return allowedBasePaths.some((basePath) => value === basePath || value.startsWith(`${basePath}?`)) ? value : fallbackPath;
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
  return resolveServerActionError({
    action: 'admin:content',
    error,
    zodMessage: 'Проверьте обязательные поля и формат значений.',
    known: [
      {
        matches: (candidate) => hasErrorMessage(candidate, 'External URL must use http or https'),
        message: 'Укажите корректный внешний адрес с http:// или https://.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'public asset path is invalid'),
        message: 'Укажите путь к публичному файлу от корня сайта, например /brand/logo.png.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'homepage link is invalid'),
        message: 'Укажите внутренний путь от / или внешний адрес с http:// или https://.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'published content cannot be deleted'),
        message: 'Опубликованную запись нельзя удалить. Переведите ее в архив.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'draft is invalid'),
        message: 'Черновик не найден или уже недоступен для удаления.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'record is invalid'),
        message: 'Удалять можно только черновики. Чтобы убрать запись с сайта, переведите её в архив.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'slug is required'),
        message: 'Укажите slug или заголовок, из которого можно создать slug.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'category is invalid'),
        message: 'Выбранная категория недоступна для этого раздела.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'city is invalid'),
        message: 'Выбранный город недоступен.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'tag is invalid'),
        message: 'Выбранный тег недоступен.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'end date cannot be before start date'),
        message: 'Дата окончания не может быть раньше даты начала.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'Unsupported image type'),
        message: 'Загрузите изображение JPEG, PNG, WebP или AVIF.'
      },
      {
        matches: (candidate) => hasErrorMessage(candidate, 'File is too large'),
        message: 'Файл слишком большой для текущего лимита загрузки.'
      }
    ],
    fallbackMessage: 'Не удалось сохранить изменения. Проверьте данные и повторите попытку.'
  });
}

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
