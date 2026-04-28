import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import { firstParam } from '@/lib/admin/content-utils';

type AdminActionAlertProps = {
  params: AdminContentSearchParams;
};

type AdminPaginationProps = {
  basePath: string;
  params: AdminContentSearchParams;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
};

type HiddenRedirectProps = {
  value: string;
};

type CoverImageFieldProps = {
  id: string;
  currentName?: string | null;
};

function adminPageHref(basePath: string, params: AdminContentSearchParams, page: number) {
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

  if (page > 1) {
    query.set('page', String(page));
  } else {
    query.delete('page');
  }

  const queryString = query.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

export function AdminActionAlert({ params }: AdminActionAlertProps) {
  const success = firstParam(params.success);
  const error = firstParam(params.error);

  if (!success && !error) {
    return null;
  }

  return (
    <Card
      className={
        error
          ? 'border-[var(--danger)] bg-[var(--danger)]/5 p-4 text-sm text-[var(--danger)]'
          : 'border-[var(--success)] bg-[var(--success)]/5 p-4 text-sm text-[var(--success)]'
      }
    >
      {error ?? success}
    </Card>
  );
}

export function AdminPagination({ basePath, params, page, totalPages, total, pageSize }: AdminPaginationProps) {
  if (totalPages <= 1) {
    return (
      <p className="text-sm text-[var(--muted)]">
        Показано {total} из {total}. Размер страницы: {pageSize}.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--muted)]">
        Показано до {pageSize} записей на странице. Всего: {total}. Страница {page} из {totalPages}.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button disabled={page <= 1} href={adminPageHref(basePath, params, page - 1)} variant="secondary">
          Назад
        </Button>
        <Button disabled={page >= totalPages} href={adminPageHref(basePath, params, page + 1)} variant="secondary">
          Вперед
        </Button>
      </div>
    </div>
  );
}

export function HiddenRedirect({ value }: HiddenRedirectProps) {
  return <input name="redirectTo" type="hidden" value={value} />;
}

export function CoverImageField({ id, currentName }: CoverImageFieldProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold" htmlFor={id}>
        Обложка
      </label>
      {currentName ? <p className="text-xs text-[var(--muted)]">Текущий файл: {currentName}</p> : null}
      <input
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="block w-full text-sm text-[var(--muted)] file:mr-4 file:min-h-11 file:rounded-md file:border file:border-[var(--line)] file:bg-white file:px-4 file:text-sm file:font-semibold file:text-[var(--text)] hover:file:border-[var(--accent)]"
        id={id}
        name="coverImage"
        type="file"
      />
      {currentName ? (
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input className="h-4 w-4 accent-[var(--accent)]" name="removeCoverImage" type="checkbox" value="true" />
          Удалить обложку без замены
        </label>
      ) : null}
      <p className="text-xs text-[var(--muted)]">JPEG, PNG, WebP или AVIF до 8 MB.</p>
    </div>
  );
}
