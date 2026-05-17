import type { FormHTMLAttributes, ReactNode } from 'react';
import { ContentStatus } from '@prisma/client';
import { AdminFilterForm } from '@/components/admin/admin-filter-form';
import { CoverImageInput } from '@/components/admin/cover-image-input';
import { Button } from '@/components/ui/button';
import { CheckboxField } from '@/components/ui/checkbox-field';
import {
  AdminActionMenu,
  AdminActionMenuButton,
  AdminActionMenuContent,
  AdminActionMenuLink,
  AdminActionRow,
  AdminActionMenuTrigger,
  AdminRowActions
} from '@/components/ui/admin-table';
import { Input } from '@/components/ui/input';
import { InlineAlert } from '@/components/ui/inline-alert';
import { FieldHint, FieldLabel, FormField } from '@/components/ui/form-field';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import type { AdminContentSearchParams } from '@/lib/admin/content-utils';
import { contentStatusLabels, firstParam } from '@/lib/admin/content-utils';
import { cn } from '@/lib/utils';

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

type AdminFilterBarProps = Omit<FormHTMLAttributes<HTMLFormElement>, 'action' | 'method'> & {
  action: string;
  children: ReactNode;
  method?: 'get' | 'post';
  summary?: string;
  title?: string;
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
      <p className="rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)]">
        Записей: {total}. Размер страницы: {pageSize}.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--surface)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-[var(--muted)]">
        Записей: {total}. Страница {page} из {totalPages}. На странице до {pageSize}.
      </p>
      <AdminActionRow className="justify-start sm:justify-end">
        <Button disabled={page <= 1} href={adminPageHref(basePath, params, page - 1)} variant="secondary">
          Назад
        </Button>
        <Button disabled={page >= totalPages} href={adminPageHref(basePath, params, page + 1)} variant="secondary">
          Вперед
        </Button>
      </AdminActionRow>
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
      <FieldLabel htmlFor={id}>
        {label}
      </FieldLabel>
      {currentName ? <p className="text-xs text-[var(--muted)]">Текущий файл: {currentName}</p> : null}
      <CoverImageInput id={id} name={inputName} />
      {currentName ? (
        <CheckboxField name={removeName} value="true">
          Удалить обложку без замены
        </CheckboxField>
      ) : null}
      <FieldHint>JPEG, PNG, WebP или AVIF до 8 МБ.</FieldHint>
      <FormField htmlFor={`${id}-alt`} label={altLabel}>
        <Input
          id={`${id}-alt`}
          name={altName}
          maxLength={180}
          defaultValue={currentAlt ?? ''}
          placeholder="Короткое описание изображения"
        />
      </FormField>
    </div>
  );
}

export function AdminFilterBar({
  action,
  children,
  className,
  method = 'get',
  summary = 'Поиск и отбор записей без изменения данных.',
  title = 'Фильтр списка',
  ...props
}: AdminFilterBarProps) {
  const classNames = cn(
    'rounded-[var(--radius-md)] border border-[var(--line)] border-l-[3px] border-l-[var(--admin-structure-accent)] bg-[var(--surface)] p-4 shadow-none',
    className
  );
  const content = (
    <>
      <div className="grid gap-1 border-b border-[var(--line)] pb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--admin-label)]">{title}</p>
        <p className="text-xs leading-5 text-[var(--muted)]">{summary}</p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_repeat(4,minmax(150px,220px))] xl:items-end">
        {children}
      </div>
    </>
  );

  if (method === 'get') {
    return (
      <AdminFilterForm action={action} className={classNames} {...props}>
        {content}
      </AdminFilterForm>
    );
  }

  return (
    <form
      action={action}
      className={classNames}
      method={method}
      {...props}
    >
      {content}
    </form>
  );
}

export function AdminListFilters({ basePath, params, filters = [], searchPlaceholder = 'Поиск по названию' }: AdminListFiltersProps) {
  const q = firstParam(params.q) ?? '';
  const status = firstParam(params.status) ?? '';

  return (
    <AdminFilterBar action={basePath}>
      <FormField htmlFor="admin-filter-q" label="Поиск">
        <SearchInput id="admin-filter-q" name="q" placeholder={searchPlaceholder} defaultValue={q} />
      </FormField>
      <FormField htmlFor="admin-filter-status" label="Статус">
        <Select id="admin-filter-status" name="status" defaultValue={status}>
          <option value="">Все статусы</option>
          {Object.values(ContentStatus).map((item) => (
            <option key={item} value={item}>
              {contentStatusLabels[item]}
            </option>
          ))}
        </Select>
      </FormField>
      {filters.map((filter) => (
        <FormField htmlFor={`admin-filter-${filter.name}`} label={filter.label} key={filter.name}>
          <Select id={`admin-filter-${filter.name}`} name={filter.name} defaultValue={firstParam(params[filter.name]) ?? ''}>
            <option value="">{filter.allLabel}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormField>
      ))}
      <AdminActionRow className="justify-start xl:col-span-full">
        <Button type="submit" variant="secondary">
          Применить
        </Button>
        <Button href={basePath} variant="ghost">
          Сбросить
        </Button>
      </AdminActionRow>
    </AdminFilterBar>
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
  const isPublished = status === ContentStatus.PUBLISHED;
  const isArchived = status === ContentStatus.ARCHIVED;
  const canPublish = status === ContentStatus.DRAFT || status === ContentStatus.REVIEW;
  const canArchive = !isArchived;
  const canDelete = !isPublished;

  return (
    <AdminRowActions>
      <Button className="min-h-9 px-3 py-1.5 text-xs" href={editHref} variant="secondary">
        Изменить
      </Button>
      <AdminActionMenu>
        <AdminActionMenuTrigger />
        <AdminActionMenuContent>
          {publicHref && isPublished ? (
            <AdminActionMenuLink href={publicHref} target="_blank" rel="noreferrer">
              Открыть публичную страницу
            </AdminActionMenuLink>
          ) : null}
          {isArchived ? (
            <form action={updateStatusAction}>
              <HiddenRedirect value={currentPath} />
              <input name={idName} type="hidden" value={idValue} />
              <input name="status" type="hidden" value={ContentStatus.DRAFT} />
              <AdminActionMenuButton>Восстановить</AdminActionMenuButton>
            </form>
          ) : null}
          {canPublish ? (
            <form action={updateStatusAction}>
              <HiddenRedirect value={currentPath} />
              <input name={idName} type="hidden" value={idValue} />
              <input name="status" type="hidden" value={ContentStatus.PUBLISHED} />
              <AdminActionMenuButton>Опубликовать</AdminActionMenuButton>
            </form>
          ) : null}
          {canArchive ? (
            <form action={updateStatusAction}>
              <HiddenRedirect value={currentPath} />
              <input name={idName} type="hidden" value={idValue} />
              <input name="status" type="hidden" value={ContentStatus.ARCHIVED} />
              <AdminActionMenuButton
                confirmActionLabel="В архив"
                confirmText={isPublished ? 'Она пропадёт с публичной страницы.' : undefined}
                confirmTitle={isPublished ? 'Перенести запись в архив?' : undefined}
              >
                В архив
              </AdminActionMenuButton>
            </form>
          ) : null}
          {canDelete ? (
            <form action={deleteAction}>
              <HiddenRedirect value={currentPath} />
              <input name={idName} type="hidden" value={idValue} />
              <AdminActionMenuButton
                confirmActionLabel="Удалить"
                confirmText="Это действие нельзя отменить."
                confirmTitle="Удалить запись?"
                tone="danger"
              >
                Удалить
              </AdminActionMenuButton>
            </form>
          ) : null}
        </AdminActionMenuContent>
      </AdminActionMenu>
    </AdminRowActions>
  );
}
