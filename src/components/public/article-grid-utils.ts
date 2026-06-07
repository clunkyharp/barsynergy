import type { PublishedContentList } from '@/lib/public/content';

export function pageHref(content: PublishedContentList, basePath: string, page: number) {
  const params = new URLSearchParams();
  Object.entries(content.params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }
    if (value) {
      params.set(key, value);
    }
  });
  if (page > 1) {
    params.set('page', String(page));
  } else {
    params.delete('page');
  }
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

export function listingHref(
  content: PublishedContentList,
  basePath: string,
  patch: Record<string, string | null>
) {
  const params = new URLSearchParams();

  Object.entries(content.params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    if (value) {
      params.set(key, value);
    }
  });

  Object.entries(patch).forEach(([key, value]) => {
    params.delete(key);

    if (value) {
      params.set(key, value);
    }
  });

  params.delete('page');

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}
