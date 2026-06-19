import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { ApplicationStatus, ApplicationType } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';
import { StatusBadge, type StatusBadgeVariant } from '@/components/ui/status-badge';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels,
  applicationTypeLabels
} from '@/modules/content/shared/labels';
import { cn } from '@/lib/utils';

export { BusinessProfileSheet } from './business-profile-sheet';

type BusinessProfileAccount = {
  cityId: string | null;
  companyName: string;
  contactPerson: string | null;
  description: string | null;
  phone: string | null;
  telegram: string | null;
  websiteUrl: string | null;
};

type BusinessProfileSummaryProps = {
  account: BusinessProfileAccount;
  editHref?: string;
  missingFields?: string[];
};

type RequestLedgerApplication = {
  businessNotes: string | null;
  createdAt?: Date;
  id: string;
  status: ApplicationStatus;
  subject: string | null;
  type: ApplicationType;
  updatedAt?: Date;
};

type RequestLedgerProps = {
  applications: RequestLedgerApplication[];
  className?: string;
  description?: string;
  emptyAction?: {
    href: string;
    label: string;
  };
  emptyDescription?: string;
  title?: string;
  viewAllHref?: string;
};

type RequestStatusRailItem = {
  detail?: string;
  label: string;
  tone?: StatusBadgeVariant;
  value: number | string;
};

type RequestStatusRailProps = {
  className?: string;
  items: RequestStatusRailItem[];
  title?: string;
};

type NextActionItem = {
  detail: string;
  href?: string;
  label: string;
  status?: string;
};

type NextActionPanelProps = {
  children?: ReactNode;
  className?: string;
  description?: string;
  items?: NextActionItem[];
  primaryAction?: {
    href: string;
    label: string;
  };
  title?: string;
};

const requestDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

function formatRequestDate(application: RequestLedgerApplication) {
  const value = application.updatedAt ?? application.createdAt;
  return value ? requestDateFormatter.format(value) : 'Без даты';
}

export function BusinessProfileSummary({
  account,
  editHref = '/business/cabinet/settings',
  missingFields = []
}: BusinessProfileSummaryProps) {
  const rows = [
    { label: 'Контакт', value: account.contactPerson },
    { label: 'Телефон', value: account.phone },
    { label: 'Telegram', value: account.telegram },
    { label: 'Сайт', value: account.websiteUrl }
  ].filter((row) => Boolean(row.value));

  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-elevated)] p-5 shadow-[var(--shadow-panel)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow>Профиль компании</Eyebrow>
          <h2 className="mt-2 text-xl font-semibold leading-tight tracking-normal">{account.companyName}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
            {account.description || 'Добавьте короткое описание компании, чтобы команда быстрее понимала контекст заявок.'}
          </p>
        </div>
        <Button className="shrink-0 rounded-[var(--radius-md)]" href={editHref} size="sm" variant="secondary">
          Редактировать
        </Button>
      </div>

      {rows.length > 0 ? (
        <dl className="mt-5 grid gap-3 border-t border-[var(--line)] pt-4 text-sm sm:grid-cols-2">
          {rows.map((row) => (
            <div className="min-w-0" key={row.label}>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{row.label}</dt>
              <dd className="mt-1 break-all font-semibold text-[var(--text)]">{row.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {missingFields.length > 0 ? (
        <div className="mt-5 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-wash)] px-4 py-3 text-sm leading-6 text-[var(--muted)]">
          Не заполнено: {missingFields.join(', ')}.
        </div>
      ) : (
        <div className="mt-5 inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface-wash)] px-3 py-2 text-sm font-semibold text-[var(--text)]">
          <CheckCircle2 aria-hidden className="text-[var(--accent)]" size={16} strokeWidth={1.8} />
          Основные данные заполнены
        </div>
      )}
    </section>
  );
}

export function RequestStatusRail({ className, items, title = 'Статус заявок' }: RequestStatusRailProps) {
  return (
    <aside className={cn('rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-elevated)] p-5', className)}>
      <Eyebrow>{title}</Eyebrow>
      <div className="mt-5 grid gap-3">
        {items.map((item) => (
          <div className="border-t border-[var(--line)] pt-3 first:border-t-0 first:pt-0" key={item.label}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                {item.detail ? <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.detail}</p> : null}
              </div>
              <StatusBadge variant={item.tone ?? 'neutral'} showDot={false}>
                {item.value}
              </StatusBadge>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}

export function RequestLedger({
  applications,
  className,
  description = 'Последние записи, статусы и рабочие комментарии по компании.',
  emptyAction,
  emptyDescription = 'Когда компания создаст заявку, здесь появится её статус и рабочий комментарий.',
  title = 'Журнал заявок',
  viewAllHref
}: RequestLedgerProps) {
  return (
    <section className={cn('rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-elevated)]', className)}>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--line)] px-5 py-4">
        <div>
          <Eyebrow>Реестр заявок</Eyebrow>
          <h2 className="mt-2 text-xl font-semibold">{title}</h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
        </div>
        {viewAllHref ? (
          <Button className="shrink-0" href={viewAllHref} size="sm" variant="secondary">
            Смотреть все
          </Button>
        ) : null}
      </div>

      {applications.length > 0 ? (
        <div className="divide-y divide-[var(--line)]">
          {applications.map((application, index) => (
            <article
              className="grid gap-2 px-5 py-3 lg:grid-cols-[3rem_minmax(0,1fr)_auto] lg:items-start"
              key={application.id}
            >
              <div className="font-mono text-xs tabular-nums text-[var(--muted)]">#{index + 1}</div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{applicationTypeLabels[application.type]}</p>
                  <p className="text-xs text-[var(--muted)]">{formatRequestDate(application)}</p>
                </div>
                <h3 className="mt-0.5 text-base font-semibold leading-6">{application.subject ?? applicationTypeLabels[application.type]}</h3>
                {application.businessNotes ? (
                  <p className="mt-0.5 line-clamp-1 text-sm leading-6 text-[var(--muted)]">{application.businessNotes}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <StatusBadge variant={applicationStatusBadgeVariants[application.status] as StatusBadgeVariant}>
                  {applicationStatusLabels[application.status]}
                </StatusBadge>
                <Button href={`/business/cabinet/requests/${application.id}`} size="sm" variant="secondary">
                  Открыть
                </Button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-start gap-4 px-5 py-6">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--accent-soft)] text-[var(--accent)]">
            <FileText aria-hidden="true" size={20} strokeWidth={1.8} />
          </span>
          <p className="text-sm leading-6 text-[var(--muted)]">{emptyDescription}</p>
          {emptyAction ? (
            <Button href={emptyAction.href} size="sm" variant="secondary">
              {emptyAction.label}
            </Button>
          ) : null}
        </div>
      )}
    </section>
  );
}

export function NextActionPanel({
  children,
  className,
  description = 'Короткий список действий, которые помогают держать заявки в рабочем состоянии.',
  items = [],
  primaryAction,
  title = 'Следующее действие'
}: NextActionPanelProps) {
  return (
    <aside className={cn('rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-elevated)] p-5', className)}>
      <Eyebrow>{title}</Eyebrow>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
      {items.length > 0 ? (
        <div className="mt-5 grid gap-3">
          {items.map((item, index) => (
            <div className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 border-t border-[var(--line)] pt-3 first:border-t-0 first:pt-0" key={item.label}>
              <span className="font-mono text-xs tabular-nums text-[var(--muted)]">{index + 1}</span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold">{item.label}</p>
                  {item.status ? (
                    <span className="inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--line)] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
                      {item.status === 'готово' ? (
                        <CheckCircle2 aria-hidden className="text-[var(--accent)]" size={13} strokeWidth={2} />
                      ) : item.status === 'нужно' ? (
                        <AlertTriangle aria-hidden className="text-[var(--warning)]" size={13} strokeWidth={2} />
                      ) : null}
                      {item.status}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{item.detail}</p>
                {item.href ? (
                  <Button className="mt-3" href={item.href} size="sm" variant="secondary">
                    Перейти
                  </Button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {primaryAction ? (
        <Button className="mt-5 w-full rounded-[var(--radius-md)]" href={primaryAction.href} variant="secondary">
          {primaryAction.label}
        </Button>
      ) : null}
      {children ? <div className="mt-5">{children}</div> : null}
    </aside>
  );
}
