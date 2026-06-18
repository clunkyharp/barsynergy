import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { AdminCmsRecordForm } from '@/components/admin/admin-cms-form';
import { SectionStats, ExternalSectionStats } from './homepage-cms-utils';
import type { ExternalSectionStatus, HomepageFormAction, HomepageSectionId, StatusValue } from './homepage-cms-types';

export function HomepageSectionEditor({
  children,
  defaultOpen,
  description,
  id,
  records,
  status,
  title
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  description: string;
  id: HomepageSectionId;
  records?: StatusValue[];
  status?: ExternalSectionStatus;
  title: string;
}) {
  return (
    <details id={id} className="group/homepage-section editorial-form-shell scroll-mt-24 overflow-visible p-0" open={defaultOpen}>
      <summary className="grid cursor-pointer list-none gap-4 p-5 transition hover:bg-[var(--surface-muted)] sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">Секция главной</p>
          <h2 className="mt-2 text-xl font-semibold text-[var(--text)]">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          {status ? <ExternalSectionStats {...status} /> : <SectionStats records={records ?? []} />}
          <span className="inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-[var(--radius-sm)] border border-[var(--line)] px-4 text-sm font-semibold text-[var(--text)] transition group-hover/homepage-section:border-[var(--border-strong)]">
            Редактировать
            <span aria-hidden className="transition group-open/homepage-section:rotate-180">▾</span>
          </span>
        </div>
      </summary>
      <div className="grid gap-4 border-t border-[var(--line)] p-5 sm:p-6">{children}</div>
    </details>
  );
}

export function ExternalSectionPanel({
  children,
  description,
  href,
  linkLabel,
  title
}: {
  children?: ReactNode;
  description: string;
  href?: string;
  linkLabel?: string;
  title: string;
}) {
  return (
    <div className="grid gap-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
      <div className="min-w-0">
        <StatusBadge tone="subtle" variant="neutral">Только просмотр</StatusBadge>
        <p className="text-base font-semibold text-[var(--text)]">{title}</p>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
        {children ? <div className="mt-4">{children}</div> : null}
      </div>
      {href && linkLabel ? (
        <Button href={href} variant="secondary">
          {linkLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function NewRecordEditor({
  action,
  children,
  description,
  title
}: {
  action: HomepageFormAction;
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <details className="group/homepage-new overflow-hidden rounded-[var(--radius-md)] border border-dashed border-[var(--line)] bg-[var(--surface-muted)]">
      <summary className="grid cursor-pointer list-none gap-3 p-4 transition hover:bg-[var(--surface)] md:grid-cols-[minmax(0,1fr)_auto] md:items-center [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block text-sm font-semibold text-[var(--text)]">{title}</span>
          <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">{description}</span>
        </span>
        <span className="inline-flex min-h-10 w-fit items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line)] px-4 text-sm font-semibold text-[var(--text)] group-open/homepage-new:hidden">
          Добавить
        </span>
        <span className="hidden min-h-10 w-fit items-center justify-center rounded-[var(--radius-sm)] border border-[var(--line)] px-4 text-sm font-semibold text-[var(--muted)] group-open/homepage-new:inline-flex">
          Свернуть
        </span>
      </summary>
      <AdminCmsRecordForm action={action} className="rounded-none border-x-0 border-b-0 border-l-0 border-t border-[var(--line)]">
        {children}
      </AdminCmsRecordForm>
    </details>
  );
}
