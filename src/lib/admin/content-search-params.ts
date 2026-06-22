import { ContentStatus } from '@prisma/client';
import { firstParam } from '@/lib/admin/content-ui';

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
