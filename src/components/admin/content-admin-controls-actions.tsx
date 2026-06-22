'use client';

import type { ReactNode } from 'react';
import { CONTENT_STATUS, type ContentStatusValue } from '@/lib/admin/content-status';
import { Button } from '@/components/ui/button';
import {
  AdminActionMenu,
  AdminActionMenuButton,
  AdminActionMenuContent,
  AdminActionMenuLink,
  AdminActionRow,
  AdminActionMenuTrigger,
  AdminRowActions
} from '@/components/ui/admin-table';
import { ConfirmSubmitButton } from '@/components/ui/confirm-submit-button';
import { PUBLICATION_STATUS_HINT } from '@/lib/admin/content-ui';
import type { AdminContentRowActionsProps, AdminContentVisibilityPanelProps } from './content-admin-controls-types';
import { HiddenRedirect } from './content-admin-controls-panels';

function AdminContentStatusForm({
  children,
  className,
  currentPath,
  idName,
  idValue,
  status,
  updateStatusAction
}: {
  children: ReactNode;
  className?: string;
  currentPath: string;
  idName: string;
  idValue: string;
  status: ContentStatusValue;
  updateStatusAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={updateStatusAction} className={className}>
      <HiddenRedirect value={currentPath} />
      <input name={idName} type="hidden" value={idValue} />
      <input name="status" type="hidden" value={status} />
      {children}
    </form>
  );
}

export function AdminContentVisibilityPanel({
  currentPath,
  idName,
  idValue,
  publicHref,
  status,
  updateStatusAction
}: AdminContentVisibilityPanelProps) {
  const isPublished = status === CONTENT_STATUS.PUBLISHED;
  const isArchived = status === CONTENT_STATUS.ARCHIVED;

  return (
    <section className="admin-visibility-panel admin-surface-shell rounded-[var(--radius-md)] border border-[var(--line)] border-l-[3px] border-l-[var(--admin-structure-accent)] bg-[var(--surface)] p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--admin-label)]">Видимость на сайте</p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{PUBLICATION_STATUS_HINT}</p>
        </div>
        <AdminActionRow className="justify-start lg:justify-end">
          {publicHref && isPublished ? (
            <Button href={publicHref} size="sm" target="_blank" rel="noreferrer" variant="secondary">
              Публичная страница
            </Button>
          ) : null}
          {isPublished ? (
            <AdminContentStatusForm
              currentPath={currentPath}
              idName={idName}
              idValue={idValue}
              status={CONTENT_STATUS.ARCHIVED}
              updateStatusAction={updateStatusAction}
            >
              <ConfirmSubmitButton
                className="min-h-9 px-3 py-1.5 text-xs"
                confirmActionLabel="Снять с сайта"
                confirmText="Запись останется в админке и пропадёт с публичной страницы."
                confirmTitle="Снять запись с сайта?"
                size="sm"
                type="submit"
                variant="secondary"
              >
                Снять с сайта
              </ConfirmSubmitButton>
            </AdminContentStatusForm>
          ) : (
            <AdminContentStatusForm
              currentPath={currentPath}
              idName={idName}
              idValue={idValue}
              status={CONTENT_STATUS.PUBLISHED}
              updateStatusAction={updateStatusAction}
            >
              <ConfirmSubmitButton
                className="min-h-9 px-3 py-1.5 text-xs"
                confirmActionLabel="Опубликовать"
                confirmText="Запись станет доступна на публичной странице."
                confirmTitle="Опубликовать на сайте?"
                size="sm"
                type="submit"
              >
                Опубликовать
              </ConfirmSubmitButton>
            </AdminContentStatusForm>
          )}
          {isArchived ? (
            <AdminContentStatusForm
              currentPath={currentPath}
              idName={idName}
              idValue={idValue}
              status={CONTENT_STATUS.DRAFT}
              updateStatusAction={updateStatusAction}
            >
              <ConfirmSubmitButton
                className="min-h-9 px-3 py-1.5 text-xs"
                confirmActionLabel="Вернуть в черновик"
                confirmText="Запись пропадёт с публичной страницы, если была опубликована."
                confirmTitle="Вернуть запись в черновик?"
                size="sm"
                type="submit"
                variant="ghost"
              >
                Вернуть в черновик
              </ConfirmSubmitButton>
            </AdminContentStatusForm>
          ) : null}
        </AdminActionRow>
      </div>
    </section>
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
  const isPublished = status === CONTENT_STATUS.PUBLISHED;
  const isArchived = status === CONTENT_STATUS.ARCHIVED;
  const canPublish = !isPublished;
  const canArchive = !isArchived && !isPublished;
  const canDelete = status === CONTENT_STATUS.DRAFT;

  return (
    <AdminRowActions>
      {canPublish ? (
        <AdminContentStatusForm
          currentPath={currentPath}
          idName={idName}
          idValue={idValue}
          status={CONTENT_STATUS.PUBLISHED}
          updateStatusAction={updateStatusAction}
        >
          <ConfirmSubmitButton
            className="min-h-9 px-3 py-1.5 text-xs"
            confirmActionLabel="Опубликовать"
            confirmText="Запись станет доступна на публичной странице."
            confirmTitle="Опубликовать на сайте?"
            type="submit"
          >
            Опубликовать
          </ConfirmSubmitButton>
        </AdminContentStatusForm>
      ) : (
        <AdminContentStatusForm
          currentPath={currentPath}
          idName={idName}
          idValue={idValue}
          status={CONTENT_STATUS.ARCHIVED}
          updateStatusAction={updateStatusAction}
        >
          <ConfirmSubmitButton
            className="min-h-9 px-3 py-1.5 text-xs"
            confirmActionLabel="Снять с сайта"
            confirmText="Запись останется в админке и пропадёт с публичной страницы."
            confirmTitle="Снять запись с сайта?"
            type="submit"
            variant="secondary"
          >
            Снять с сайта
          </ConfirmSubmitButton>
        </AdminContentStatusForm>
      )}
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
              <input name="status" type="hidden" value={CONTENT_STATUS.DRAFT} />
              <AdminActionMenuButton
                confirmActionLabel="Восстановить"
                confirmText="Запись вернётся в черновики."
                confirmTitle="Восстановить запись?"
              >
                Восстановить
              </AdminActionMenuButton>
            </form>
          ) : null}
          {canArchive ? (
            <form action={updateStatusAction}>
              <HiddenRedirect value={currentPath} />
              <input name={idName} type="hidden" value={idValue} />
              <input name="status" type="hidden" value={CONTENT_STATUS.ARCHIVED} />
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
