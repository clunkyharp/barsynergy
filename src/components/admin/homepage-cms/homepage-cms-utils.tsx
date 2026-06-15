import type { ReactNode } from 'react';
import { ContentStatus } from '@/modules/admin/queries';
import { ConfirmSubmitButton } from '@/components/ui/confirm-submit-button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { AppLink } from '@/components/ui/app-link';
import { HiddenRedirect } from '@/components/admin/content-admin-controls';
import {
  contentStatusBadgeVariants,
  contentStatusLabels,
  firstParam,
  type AdminContentSearchParams
} from '@/lib/admin/content-utils';
import { AdminCmsActions } from '@/components/admin/admin-cms-form';
import {
  ADMIN_HOMEPAGE_PATH,
  homepageSectionIds,
  type ExternalSectionStatus,
  type HomepageFormAction,
  type HomepageSectionId,
  type StatusValue
} from './homepage-cms-types';
import { HomepageSaveButton } from './homepage-save-button';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

export function formatDate(value?: Date | null) {
  return value ? dateFormatter.format(value) : 'Нет изменений';
}

export function lineCount(value?: string | null) {
  return value?.split('\n').filter((line) => line.trim().length > 0).length ?? 0;
}

export function getActiveHomepageSection(params: AdminContentSearchParams): HomepageSectionId | undefined {
  const value = firstParam(params.section);
  return homepageSectionIds.includes(value as HomepageSectionId) ? (value as HomepageSectionId) : undefined;
}

export function homepageSectionPath(sectionId: HomepageSectionId) {
  return `${ADMIN_HOMEPAGE_PATH}?section=${sectionId}`;
}

export function SectionRedirect({ sectionId }: { sectionId: HomepageSectionId }) {
  return <HiddenRedirect value={homepageSectionPath(sectionId)} />;
}

export function StatusSelect({ defaultValue, id }: { defaultValue?: ContentStatus; id: string }) {
  return (
    <Select id={id} name="status" defaultValue={defaultValue ?? ContentStatus.DRAFT}>
      {Object.values(ContentStatus).map((status) => (
        <option key={status} value={status}>
          {contentStatusLabels[status]}
        </option>
      ))}
    </Select>
  );
}

export function RecordStatus({ record }: { record: { status: ContentStatus } }) {
  return <StatusBadge variant={contentStatusBadgeVariants[record.status]}>{contentStatusLabels[record.status]}</StatusBadge>;
}

export function PriorityField({ defaultValue = 0, id }: { defaultValue?: number; id: string }) {
  return (
    <FormField label="Порядок" htmlFor={id} hint="Меньше = выше.">
      <Input id={id} name="priority" min={0} max={100} type="number" defaultValue={defaultValue} />
    </FormField>
  );
}

export function SubmitRow({ children }: { children?: ReactNode; record?: { status: ContentStatus } }) {
  return (
    <AdminCmsActions>
      <HomepageSaveButton />
      {children}
    </AdminCmsActions>
  );
}

export function DeleteButton({ action, id }: { action: HomepageFormAction; id: string }) {
  return (
    <>
      <input name="id" type="hidden" value={id} />
      <ConfirmSubmitButton
        confirmActionLabel="Удалить"
        confirmText="Это действие нельзя отменить."
        confirmTitle="Удалить черновик?"
        formAction={action}
        type="submit"
        variant="secondary"
      >
        Удалить черновик
      </ConfirmSubmitButton>
    </>
  );
}

export function recordStateSummary(records: StatusValue[]) {
  if (records.length === 0) {
    return 'Нет записей';
  }

  const published = records.filter((record) => record.status === ContentStatus.PUBLISHED).length;
  return `${published} опубликовано из ${records.length}`;
}

function sectionBadgeVariant(records: StatusValue[]) {
  if (records.length === 0) {
    return 'neutral' as const;
  }

  if (records.some((record) => record.status === ContentStatus.PUBLISHED)) {
    return 'success' as const;
  }

  if (records.some((record) => record.status === ContentStatus.REVIEW)) {
    return 'pending' as const;
  }

  if (records.every((record) => record.status === ContentStatus.ARCHIVED)) {
    return 'danger' as const;
  }

  return 'neutral' as const;
}

export function prioritySummary(records: StatusValue[]) {
  if (records.length === 0) {
    return 'Порядок не задан';
  }

  const priorities = records.map((record) => record.priority);
  const min = Math.min(...priorities);
  const max = Math.max(...priorities);
  return min === max ? `Порядок ${min}` : `Порядок ${min}-${max}`;
}

export function SectionStats({ records }: { records: StatusValue[] }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge showDot={records.length > 0} variant={sectionBadgeVariant(records)}>
        {recordStateSummary(records)}
      </StatusBadge>
    </div>
  );
}

export function ExternalSectionStats({ details, label, variant = 'neutral' }: ExternalSectionStatus) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge variant={variant}>{label}</StatusBadge>
      {details ? (
        <span className="rounded-[var(--radius-sm)] border border-[var(--line)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
          {details}
        </span>
      ) : null}
    </div>
  );
}

export function HomepageOverviewCard({
  description,
  id,
  records,
  status,
  title
}: {
  description: string;
  id: HomepageSectionId;
  records?: StatusValue[];
  status?: ExternalSectionStatus;
  title: string;
}) {
  return (
    <AppLink
      className="group grid gap-4 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] p-4 transition hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)]"
      href={`${homepageSectionPath(id)}#${id}`}
    >
      <div className="min-w-0">
        <p className="text-base font-semibold text-[var(--text)]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>
      {status ? <ExternalSectionStats {...status} /> : <SectionStats records={records ?? []} />}
      <span className="text-sm font-semibold text-[var(--accent)] transition group-hover:text-[var(--accent-strong)]">Открыть секцию</span>
    </AppLink>
  );
}
