import { ContentStatus } from '@prisma/client';

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
