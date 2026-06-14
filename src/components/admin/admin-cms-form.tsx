'use client';

import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { FormActions } from '@/components/ui/form-field';
import { cn } from '@/lib/utils';
import { useUnsavedChanges } from '@/components/admin/unsaved-changes-guard';

type AdminCmsFormProps = ComponentPropsWithoutRef<'form'>;

type AdminCmsSectionProps = {
  bodyClassName?: string;
  children: ReactNode;
  className?: string;
  description?: string;
  title: string;
};

type AdminCmsAdvancedSectionProps = AdminCmsSectionProps & {
  defaultOpen?: boolean;
};

type AdminCmsGridProps = ComponentPropsWithoutRef<'div'> & {
  columns?: 'two' | 'three' | 'content';
};

type AdminCmsSummaryItem = {
  label: string;
  value: ReactNode;
};

type AdminCmsCompactRecordSummaryProps = {
  items: AdminCmsSummaryItem[];
  status?: ReactNode;
  subtitle?: ReactNode;
  title: ReactNode;
};

type AdminCmsSummaryProps = {
  actions?: ReactNode;
  className?: string;
  items: AdminCmsSummaryItem[];
  title?: string;
};

type AdminCmsPanelProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  title?: string;
};

type AdminCmsActionsProps = Omit<ComponentPropsWithoutRef<'div'>, 'children'> & {
  children: ReactNode;
  stateText?: ReactNode;
};

type AdminCmsInlineEditRecordProps = {
  action: AdminCmsFormProps['action'];
  children: ReactNode;
  className?: string;
  editLabel?: string;
  formClassName?: string;
  groupName: string;
  summary: ReactNode;
};

export function AdminCmsForm({ className, ...props }: AdminCmsFormProps) {
  return <form className={cn('admin-cms-form editorial-form-shell grid gap-6 p-5 sm:p-6', className)} {...props} />;
}

export function AdminCmsSection({ bodyClassName, children, className, description, title }: AdminCmsSectionProps) {
  return (
    <section className={cn('form-section', className)}>
      <div className="form-section-header">
        <h2 className="form-section-title">{title}</h2>
        {description ? <p className="form-section-description">{description}</p> : null}
      </div>
      <div className={cn('form-section-body', bodyClassName)}>{children}</div>
    </section>
  );
}

export function AdminCmsAdvancedSection({
  bodyClassName,
  children,
  className,
  defaultOpen,
  description,
  title
}: AdminCmsAdvancedSectionProps) {
  return (
    <details className={cn('group/admin-advanced form-section', className)} open={defaultOpen}>
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3 transition hover:border-[var(--border-strong)] [&::-webkit-details-marker]:hidden">
        <span>
          <span className="form-section-title block">{title}</span>
          {description ? <span className="mt-1 block max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</span> : null}
        </span>
        <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)] group-open/admin-advanced:hidden">Раскрыть</span>
        <span className="hidden shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)] group-open/admin-advanced:inline">Свернуть</span>
      </summary>
      <div className={cn('form-section-body mt-4', bodyClassName)}>{children}</div>
    </details>
  );
}

export function AdminCmsSummary({ actions, className, items, title = 'Сводка записи' }: AdminCmsSummaryProps) {
  return (
    <section className={cn('border-b border-[var(--line)] pb-5', className)}>
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{title}</h2>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div className="min-w-0" key={item.label}>
            <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{item.label}</dt>
            <dd className="mt-1 min-w-0 text-sm font-medium text-[var(--text)]">{item.value ?? 'Не указано'}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

export function AdminCmsCompactRecordSummary({ items, status, subtitle, title }: AdminCmsCompactRecordSummaryProps) {
  return (
    <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1.6fr)_auto] lg:items-center">
      <div className="min-w-0">
        <p className="truncate text-base font-semibold text-[var(--text)]">{title}</p>
        {subtitle ? <p className="mt-1 truncate text-sm text-[var(--muted)]">{subtitle}</p> : null}
      </div>
      <dl className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div className="min-w-0" key={item.label}>
            <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{item.label}</dt>
            <dd className="mt-1 truncate text-sm font-medium text-[var(--text)]">{item.value ?? 'Не указано'}</dd>
          </div>
        ))}
      </dl>
      {status ? <div className="flex items-center justify-start lg:justify-end">{status}</div> : null}
    </div>
  );
}

export function AdminCmsGrid({ className, columns = 'two', ...props }: AdminCmsGridProps) {
  return (
    <div
      className={cn(
        'grid gap-4',
        columns === 'two' && 'lg:grid-cols-2',
        columns === 'three' && 'md:grid-cols-2 xl:grid-cols-3',
        columns === 'content' && 'xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]',
        className
      )}
      {...props}
    />
  );
}

export function AdminCmsInlineEditRecord({
  action,
  children,
  className,
  editLabel = 'Изменить',
  formClassName,
  groupName,
  summary
}: AdminCmsInlineEditRecordProps) {
  return (
    <details
      name={groupName}
      className={cn(
        'group/admin-inline admin-inline-edit-record admin-surface-shell overflow-hidden rounded-[12px] border border-[var(--line)] bg-[var(--surface)] transition hover:border-[var(--border-strong)]',
        className
      )}
    >
      <summary className="grid cursor-pointer list-none gap-4 p-4 transition hover:bg-[var(--surface-muted)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">{summary}</div>
        <span className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line)] px-4 text-sm font-semibold text-[var(--text)] transition group-hover/admin-inline:border-[var(--border-strong)] group-open/admin-inline:hidden">
          {editLabel}
        </span>
        <span className="hidden min-h-10 w-fit items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line)] px-4 text-sm font-semibold text-[var(--muted)] transition group-open/admin-inline:inline-flex">
          Свернуть
        </span>
      </summary>
      <form action={action} className={cn('admin-inline-edit-form grid gap-4 border-t border-[var(--line)] p-4', formClassName)}>
        {children}
      </form>
    </details>
  );
}

export function AdminCmsActions({ children, className, stateText, ...props }: AdminCmsActionsProps) {
  const { isDirty } = useUnsavedChanges();
  const resolved = stateText !== undefined ? stateText : isDirty ? 'Есть несохранённые изменения' : null;

  return (
    <FormActions
      className={cn(
        'admin-sticky-form-actions admin-surface-shell sticky bottom-3 z-30 rounded-[14px] border border-[var(--line)] bg-[var(--admin-surface)] p-4 sm:bottom-4',
        className
      )}
      {...props}
    >
      {resolved ? <p className="admin-sticky-form-actions-state">{resolved}</p> : null}
      <div className="admin-sticky-form-actions-controls">{children}</div>
    </FormActions>
  );
}

export function AdminCmsPanel({ children, className, description, title }: AdminCmsPanelProps) {
  return (
    <section className={cn('admin-cms-panel editorial-form-shell p-5 sm:p-6', className)}>
      {title ? (
        <div className="mb-5 border-b border-[var(--line)] pb-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

export function AdminCmsRecordForm({ className, ...props }: AdminCmsFormProps) {
  return (
    <form
      className={cn(
        'admin-record-form admin-surface-shell grid gap-4 rounded-[var(--radius-md)] border border-[var(--line)] border-l-[3px] border-l-[var(--accent)] bg-[var(--surface)] p-4 shadow-none',
        className
      )}
      {...props}
    />
  );
}
