import type { AdminContentSearchParams } from '@/lib/admin/content-utils';

type QueryPatchValue = string | string[] | null | undefined;
type QueryPatch = Record<string, QueryPatchValue>;

export function adminQueryHref(basePath: string, params: AdminContentSearchParams, patch: QueryPatch = {}) {
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

  Object.entries(patch).forEach(([key, value]) => {
    query.delete(key);

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

export function adminPageHref(basePath: string, params: AdminContentSearchParams, page: number) {
  return adminQueryHref(basePath, params, { page: page > 1 ? String(page) : null });
}
