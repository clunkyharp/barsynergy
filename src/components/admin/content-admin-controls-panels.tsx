import { InlineAlert } from '@/components/ui/inline-alert';
import { Button } from '@/components/ui/button';
import { AdminActionRow } from '@/components/ui/admin-table';
import { CoverImageInput } from '@/components/admin/cover-image-input';
import { CheckboxField } from '@/components/ui/checkbox-field';
import { Input } from '@/components/ui/input';
import { FieldHint, FieldLabel, FormField } from '@/components/ui/form-field';
import { firstParam } from '@/lib/admin/content-ui';
import type { AdminActionAlertProps, AdminPaginationProps, HiddenRedirectProps, CoverImageFieldProps } from './content-admin-controls-types';
import { adminPageHref } from './content-admin-controls-utils';

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
