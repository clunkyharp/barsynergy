import { FileVisibility } from '@prisma/client';
import { getPublicFileUrl } from '@/lib/storage/public-url';

export type PublicContentDetailFact = {
  label: string;
  value: string;
};

export type PublicContentDetailSection = {
  title: string;
  items: string[];
};

export type PublicContentImage = {
  src: string;
  alt: string;
};

export type PublicContentDetail = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  startsAtIso?: string;
  endsAtIso?: string;
  publishedAtIso?: string;
  updatedAtIso?: string;
  label?: string;
  meta: string[];
  body?: string;
  imageUrl?: PublicContentImage;
  facts: PublicContentDetailFact[];
  externalUrl?: string;
  externalUrlLabel?: string;
  companyName?: string;
  cityName?: string;
  locationName?: string;
  address?: string;
  sections?: PublicContentDetailSection[];
};

export function detailImageUrl(
  file: { fileKey: string; bucket: string | null; visibility: FileVisibility } | null | undefined
): string | undefined {
  if (!file || file.visibility !== FileVisibility.PUBLIC) {
    return undefined;
  }

  return getPublicFileUrl({
    fileKey: file.fileKey,
    bucket: file.bucket ?? undefined,
    visibility: 'public'
  });
}

export function detailImage(
  file: { fileKey: string; bucket: string | null; visibility: FileVisibility } | null | undefined,
  alt: string | null | undefined,
  fallbackAlt: string
): PublicContentImage | undefined {
  const src = detailImageUrl(file);

  if (!src) {
    return undefined;
  }

  return {
    src,
    alt: alt?.trim() || fallbackAlt
  };
}

export function compact(values: Array<string | null | undefined>) {
  return values.filter((value): value is string => Boolean(value && value.trim().length > 0));
}

export function cleanPublicDetailText(value: string) {
  return value
    .replace(/(^|\s)[Дд]емо[-\s]+/g, '$1')
    .replace(/^поставщик\b/u, 'Поставщик')
    .replace(/^материал\b/u, 'Материал')
    .replace(/^событие\b/u, 'Событие')
    .replace(/^вакансия\b/u, 'Вакансия')
    .trim();
}

export function formatDate(value: Date | null | undefined) {
  if (!value) {
    return undefined;
  }

  return value.toLocaleDateString('ru-RU');
}

export function formatDateTime(value: Date | null | undefined) {
  if (!value) {
    return undefined;
  }

  return value.toLocaleString('ru-RU', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export function eventPlaceLabel(locationName?: string | null, cityName?: string | null) {
  if (locationName && cityName) {
    return `${locationName}, ${cityName}`;
  }

  return locationName ?? cityName ?? 'место уточняется';
}

export function parseFacts(items: string[]): PublicContentDetailFact[] {
  return items.map((entry) => {
    const [label, ...rest] = entry.split(': ');
    return { label, value: rest.join(': ') };
  });
}
