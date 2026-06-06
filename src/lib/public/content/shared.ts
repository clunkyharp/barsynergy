import { FileVisibility } from '@prisma/client';
import { getPublicFileUrl } from '@/lib/storage/public-url';

export const PUBLIC_CONTENT_PAGE_SIZE = 12;
export const PUBLIC_CONTENT_MAX_PAGE_SIZE = 24;

export type PublicContentSearchParams = Record<string, string | string[] | undefined>;

export type PublishedContentMetaGroup = {
  label?: string;
  value: string;
  tone?: 'default' | 'accent' | 'muted';
};

export type PublishedContentItem = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  label?: string;
  meta: string[];
  imageUrl?: string;
  kind?: 'default' | 'vacancy' | 'supplier' | 'partner';
  subtitle?: string;
  dateIso?: string;
  metaGroups?: PublishedContentMetaGroup[];
  statusLabel?: string;
  updatedLabel?: string;
};

export type PublishedContentList = {
  items: PublishedContentItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  searchQuery?: string;
  params: PublicContentSearchParams;
};

export function hasActivePublicContentParams(
  params: PublicContentSearchParams,
  keys: readonly string[] = ['q', 'category', 'city', 'format', 'level', 'period', 'partnerType', 'featured', 'verified', 'employmentType']
) {
  return keys.some((key) => {
    const value = params[key];

    if (Array.isArray(value)) {
      return value.some((item) => item.trim().length > 0);
    }

    return Boolean(value?.trim());
  });
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function optionalParam(params: PublicContentSearchParams, key: string) {
  const value = firstParam(params[key])?.trim();
  return value && value.length > 0 ? value : undefined;
}

export function getPage(params: PublicContentSearchParams) {
  const value = Number.parseInt(firstParam(params.page) ?? '1', 10);
  return Number.isFinite(value) && value > 0 ? value : 1;
}

export function getPageSize(params: PublicContentSearchParams) {
  const value = Number.parseInt(firstParam(params.pageSize) ?? String(PUBLIC_CONTENT_PAGE_SIZE), 10);

  if (!Number.isFinite(value) || value <= 0) {
    return PUBLIC_CONTENT_PAGE_SIZE;
  }

  return Math.min(value, PUBLIC_CONTENT_MAX_PAGE_SIZE);
}

export function publicImageUrl(
  file: { fileKey: string; bucket: string | null; visibility: FileVisibility } | null | undefined
) {
  if (!file || file.visibility !== FileVisibility.PUBLIC) {
    return undefined;
  }

  return getPublicFileUrl({
    fileKey: file.fileKey,
    bucket: file.bucket ?? undefined,
    visibility: 'public'
  });
}

function normalizeParams(params: PublicContentSearchParams) {
  return Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => {
        if (Array.isArray(value)) {
          const values = value.map((item) => item.trim()).filter(Boolean);
          return values.length > 0 ? [key, values] : undefined;
        }

        const normalizedValue = value?.trim();
        return normalizedValue ? [key, normalizedValue] : undefined;
      })
      .filter(Boolean) as [string, string | string[]][]
  );
}

export function listResult(input: {
  items: PublishedContentItem[];
  page: number;
  pageSize: number;
  total: number;
  searchQuery?: string;
  params: PublicContentSearchParams;
}): PublishedContentList {
  return {
    ...input,
    params: normalizeParams(input.params),
    totalPages: Math.max(1, Math.ceil(input.total / input.pageSize))
  };
}

export function textSearch(query?: string) {
  return query
    ? {
        OR: [
          { title: { contains: query, mode: 'insensitive' as const } },
          { summary: { contains: query, mode: 'insensitive' as const } }
        ]
      }
    : {};
}

const relativeTimeFormatter = new Intl.RelativeTimeFormat('ru-RU', { numeric: 'auto' });

export function formatUpdatedLabel(date: Date) {
  const diffMs = date.getTime() - Date.now();
  const hourMs = 1000 * 60 * 60;
  const dayMs = hourMs * 24;
  const weekMs = dayMs * 7;
  const monthMs = dayMs * 30;

  if (Math.abs(diffMs) < dayMs) {
    const hours = Math.floor(diffMs / hourMs) || -1;
    return `обновлено ${relativeTimeFormatter.format(hours, 'hour')}`;
  }

  if (Math.abs(diffMs) < weekMs) {
    const days = Math.floor(diffMs / dayMs);
    return `обновлено ${relativeTimeFormatter.format(days, 'day')}`;
  }

  if (Math.abs(diffMs) < monthMs) {
    const weeks = Math.floor(diffMs / weekMs);
    return `обновлено ${relativeTimeFormatter.format(weeks, 'week')}`;
  }

  return `обновлено ${date.toLocaleDateString('ru-RU')}`;
}

export function formatDateTimeLabel(date: Date) {
  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'short'
  });
}

export function eventPlaceLabel(locationName?: string | null, cityName?: string | null) {
  if (locationName && cityName) {
    return `${locationName}, ${cityName}`;
  }

  return locationName ?? cityName ?? 'Место уточняется';
}

export function compactLabel(value: string, maxLength = 72) {
  const normalized = value.replace(/\s+/g, ' ').trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}
