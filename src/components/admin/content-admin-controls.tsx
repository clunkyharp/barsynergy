import { ContentStatus } from '@prisma/client';
import { CoverImageInput } from '@/components/admin/cover-image-input';
import { Button } from '@/components/ui/button';
import {
  AdminActionMenu,
  AdminActionMenuButton,
  AdminActionMenuContent,
  AdminActionMenuLink,
  AdminActionMenuTrigger
} from '@/components/ui/admin-table';
import { Input } from '@/components/ui/input';
import { InlineAlert } from '@/components/ui/inline-alert';
import { Select } from '@/components/ui/select';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import { contentStatusLabels, firstParam } from '@/lib/admin/content-utils';

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
  currentAlt?: string | null;
  inputName?: string;
  label?: string;
  altLabel?: string;
  altName?: string;
  removeName?: string;
};

type AdminListFiltersProps = {
  basePath: string;
  params: AdminContentSearchParams;
  filters?: {
    name: string;
    label: string;
    allLabel: string;
    options: { value: string; label: string }[];
  }[];
  searchPlaceholder?: string;
};

type AdminContentRowActionsProps = {
  currentPath: string;
  deleteAction: (formData: FormData) => Promise<void>;
  editHref: string;
  idName: string;
  idValue: string;
  publicHref?: string;
  status: ContentStatus;
  updateStatusAction: (formData: FormData) => Promise<void>;
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
    <InlineAlert tone={error ? 'error' : 'success'}>
      {error ?? success}
    </InlineAlert>
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

export function CoverImageField({
  id,
  currentName,
  currentAlt,
  inputName = 'coverImage',
  label = 'Обложка',
  altLabel = 'Alt text',
  altName = inputName === 'coverImage' ? 'coverImageAlt' : `${inputName}Alt`,
  removeName = 'removeCoverImage'
}: CoverImageFieldProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold" htmlFor={id}>
        {label}
      </label>
      {currentName ? <p className="text-xs text-[var(--muted)]">Текущий файл: {currentName}</p> : null}
      <CoverImageInput id={id} name={inputName} />
      {currentName ? (
        <label className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <input className="h-4 w-4 accent-[var(--accent)]" name={removeName} type="checkbox" value="true" />
          Удалить обложку без замены
        </label>
      ) : null}
      <p className="text-xs text-[var(--muted)]">JPEG, PNG, WebP или AVIF до 8 МБ.</p>
      <label className="grid gap-2 text-sm font-semibold" htmlFor={`${id}-alt`}>
        {altLabel}
        <Input
          id={`${id}-alt`}
          name={altName}
          maxLength={180}
          defaultValue={currentAlt ?? ''}
          placeholder="Короткое описание изображения"
        />
      </label>
    </div>
  );
}

export function AdminListFilters({ basePath, params, filters = [], searchPlaceholder = 'Поиск по названию или описанию' }: AdminListFiltersProps) {
  const q = firstParam(params.q) ?? '';
  const status = firstParam(params.status) ?? '';

  return (
    <form action={basePath} className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-muted)] p-4 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_repeat(4,minmax(150px,220px))] xl:items-end">
      <label className="grid gap-2 text-sm font-semibold">
        Поиск
        <Input name="q" placeholder={searchPlaceholder} defaultValue={q} />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Статус
        <Select name="status" defaultValue={status}>
          <option value="">Все статусы</option>
          {Object.values(ContentStatus).map((item) => (
            <option key={item} value={item}>
              {contentStatusLabels[item]}
            </option>
          ))}
        </Select>
      </label>
      {filters.map((filter) => (
        <label className="grid gap-2 text-sm font-semibold" key={filter.name}>
          {filter.label}
          <Select name={filter.name} defaultValue={firstParam(params[filter.name]) ?? ''}>
            <option value="">{filter.allLabel}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </label>
      ))}
      <div className="flex items-end gap-3 xl:col-span-full">
        <Button type="submit" variant="secondary">
          Применить
        </Button>
        <Button href={basePath} variant="ghost">
          Сбросить
        </Button>
      </div>
    </form>
  );
}

export function AdminContentRowActions({
  currentPath,
  deleteAction,
  editHref,
  idName,
  idValue,
  publicHref,
  status,
  updateStatusAction
}: AdminContentRowActionsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button className="min-h-9 px-3 py-1.5 text-xs" href={editHref} variant="secondary">
        Изменить
      </Button>
      <AdminActionMenu>
        <AdminActionMenuTrigger />
        <AdminActionMenuContent>
          {publicHref && status === ContentStatus.PUBLISHED ? (
            <AdminActionMenuLink href={publicHref} target="_blank" rel="noreferrer">
              Открыть публичную страницу
            </AdminActionMenuLink>
          ) : null}
          {status !== ContentStatus.PUBLISHED ? (
            <form action={updateStatusAction}>
              <HiddenRedirect value={currentPath} />
              <input name={idName} type="hidden" value={idValue} />
              <input name="status" type="hidden" value={ContentStatus.PUBLISHED} />
              <AdminActionMenuButton>Опубликовать</AdminActionMenuButton>
            </form>
          ) : null}
          {status !== ContentStatus.ARCHIVED ? (
            <form action={updateStatusAction}>
              <HiddenRedirect value={currentPath} />
              <input name={idName} type="hidden" value={idValue} />
              <input name="status" type="hidden" value={ContentStatus.ARCHIVED} />
              <AdminActionMenuButton>В архив</AdminActionMenuButton>
            </form>
          ) : null}
          {status !== ContentStatus.PUBLISHED ? (
            <form action={deleteAction}>
              <HiddenRedirect value={currentPath} />
              <input name={idName} type="hidden" value={idValue} />
              <AdminActionMenuButton tone="danger">Удалить</AdminActionMenuButton>
            </form>
          ) : null}
        </AdminActionMenuContent>
      </AdminActionMenu>
    </div>
  );
}
