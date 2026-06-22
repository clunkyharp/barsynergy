'use client';

import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Panel } from '@/components/ui/panel';
import { StatusBadge } from '@/components/ui/status-badge';
import {
  applicationStatusBadgeVariants,
  applicationStatusLabels,
  applicationTypeLabels
} from '@/lib/admin/application-utils';
import { cn } from '@/lib/utils';
import type {
  QueueItem,
  PublishingRailItem,
  HealthRow,
  DashboardApplication
} from '@/modules/admin/dashboard/types';

const microLabel = 'font-mono text-[10px] font-medium uppercase tracking-[0.22em]';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit'
});

function pluralizeRu(value: number, forms: [string, string, string]) {
  const absValue = Math.abs(value);
  const mod10 = absValue % 10;
  const mod100 = absValue % 100;

  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];

  return forms[2];
}

export function AdminWorkQueue({ className, items }: { className?: string; items: QueueItem[] }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <SectionHeader
        actionHref="/admin/applications"
        actionLabel="Открыть заявки"
        eyebrow="Очередь"
        title="Очередь действий"
      />
      <div className="border-t border-[var(--line)]">
        <div className="hidden grid-cols-[minmax(7rem,1fr)_4.75rem_6rem_minmax(8rem,1fr)_5rem] gap-4 border-b border-[var(--line)] bg-[var(--surface-muted)] px-4 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--muted)] md:grid">
          <span className="whitespace-nowrap">Участок</span>
          <span className="whitespace-nowrap">Кол-во</span>
          <span className="whitespace-nowrap">Ведёт</span>
          <span className="whitespace-nowrap">Следующий шаг</span>
          <span className="whitespace-nowrap text-right">Действие</span>
        </div>
        <div className="divide-y divide-[var(--line)]">
          {items.map((item) => (
            <div
              className={cn(
                'grid gap-3 px-4 py-4 md:grid-cols-[minmax(7rem,1fr)_4.75rem_6rem_minmax(8rem,1fr)_5rem] md:items-center md:gap-4',
                item.count === 0 && 'opacity-50'
              )}
              key={item.label}
            >
              <div>
                <p className="text-sm font-semibold">{item.label}</p>
                <p className="mt-1 text-xs text-[var(--muted)] md:hidden">ответственный: {item.owner}</p>
              </div>
              <div className="flex items-baseline gap-2 md:block">
                <span className="text-lg font-semibold">{item.count}</span>
                <span className="text-xs text-[var(--muted)] md:hidden">в очереди</span>
              </div>
              <div className="hidden text-sm text-[var(--muted)] md:block">{item.owner}</div>
              <p className={cn('text-sm leading-6', item.count > 0 ? 'font-medium' : 'text-[var(--muted)]')}>
                {item.count > 0 ? item.nextStep : 'действий нет'}
              </p>
              <Button
                className="min-h-9 w-full px-2 py-1.5 text-xs md:w-auto"
                href={item.href}
                variant="secondary"
              >
                Перейти
              </Button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function HealthRowContent({ row }: { row: HealthRow }) {
  return (
    <>
      <span className="font-semibold text-[var(--text)]">{row.area}</span>
      <span className="flex items-center gap-2 text-[var(--muted)]">
        <span
          aria-hidden="true"
          className={cn(
            'h-2 w-2 shrink-0 rounded-full',
            row.variant === 'success' && 'bg-[var(--success-text)]',
            row.variant === 'warning' && 'bg-[var(--warning-text)]',
            row.variant === 'danger' && 'bg-[var(--danger-text)]',
            row.variant !== 'success' && row.variant !== 'warning' && row.variant !== 'danger' && 'bg-[var(--muted)]'
          )}
        />
        <span>{row.status}</span>
      </span>
      <span className="text-[var(--muted)] sm:text-right">{row.note}</span>
      <span aria-hidden="true" className="hidden text-[var(--muted)] sm:block">
        →
      </span>
    </>
  );
}

export function ContentHealthTable({ className, rows }: { className?: string; rows: HealthRow[] }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex flex-col gap-3 border-b border-[var(--line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className={cn(microLabel, 'text-[var(--accent)]')}>Контроль контента</p>
        <StatusBadge variant={rows.some((row) => row.variant !== 'success') ? 'warning' : 'success'}>
          {rows.some((row) => row.variant !== 'success') ? 'нужна проверка' : 'в норме'}
        </StatusBadge>
      </div>
      <ul className="divide-y divide-[var(--line)]">
        {rows.map((row) => (
          <li key={row.area}>
            {row.href ? (
              <AppLink
                className="grid gap-2 px-5 py-3 text-sm transition hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring)] sm:grid-cols-[minmax(7rem,1fr)_minmax(12rem,1.4fr)_auto_auto] sm:items-center sm:gap-4"
                href={row.href}
              >
                <HealthRowContent row={row} />
              </AppLink>
            ) : (
              <div className="grid gap-2 px-5 py-3 text-sm opacity-60 sm:grid-cols-[minmax(7rem,1fr)_minmax(12rem,1.4fr)_auto_auto] sm:items-center sm:gap-4">
                <HealthRowContent row={row} />
              </div>
            )}
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function PublishingStatusRail({ className, items }: { className?: string; items: PublishingRailItem[] }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-5 py-4">
        <p className={cn(microLabel, 'text-[var(--accent)]')}>Статус разделов</p>
        <StatusBadge variant={items.some((item) => item.draft > 0) ? 'pending' : 'success'}>
          {items.some((item) => item.draft > 0) ? 'есть черновики' : 'чисто'}
        </StatusBadge>
      </div>
      <div className="divide-y divide-[var(--line)]">
        {items.map((item) => (
          <AppLink
            className="grid gap-2 px-5 py-3 text-sm transition hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring)]"
            href={item.href}
            key={item.label}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="font-semibold text-[var(--text)]">{item.label}</span>
              {item.extra ? <span className="text-xs text-[var(--muted)]">{item.extra}</span> : null}
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--muted)]">
              <span className={cn(item.draft > 0 ? 'font-semibold text-[var(--warning-text)]' : 'text-[var(--muted)]')}>
                {item.draft} {pluralizeRu(item.draft, ['черновик', 'черновика', 'черновиков'])}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-[var(--text)]">
                {item.published} {pluralizeRu(item.published, ['опубликован', 'опубликовано', 'опубликовано'])}
              </span>
              <span aria-hidden="true" className="ml-auto text-[var(--muted)]">
                →
              </span>
            </div>
          </AppLink>
        ))}
      </div>
    </Card>
  );
}

export function ModerationActionLane({ applications, className }: { applications: DashboardApplication[]; className?: string }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex flex-col gap-3 border-b border-[var(--line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className={cn(microLabel, 'text-[var(--accent)]')}>Модерация</p>
        <Button className="min-h-9 px-3 py-1.5 text-xs" href="/admin/applications" variant="secondary">
          Вся очередь
        </Button>
      </div>
      <div className="divide-y divide-[var(--line)]">
        {applications.length > 0 ? (
          applications.map((application) => (
            <AppLink
              className="grid gap-2 px-5 py-3 text-sm transition hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--focus-ring)] lg:grid-cols-[23rem_10rem_minmax(0,1fr)_1rem] lg:items-center lg:gap-4"
              href={`/admin/applications/${application.id}`}
              key={application.id}
            >
              <span className={cn(microLabel, 'text-[var(--muted)] lg:whitespace-nowrap')}>
                {applicationTypeLabels[application.type]} · {dateFormatter.format(application.createdAt)}
              </span>
              <StatusBadge className="w-fit self-start lg:self-center" variant={applicationStatusBadgeVariants[application.status]}>
                {applicationStatusLabels[application.status]}
              </StatusBadge>
              <span className="min-w-0 font-semibold leading-6 text-[var(--text)]">
                {application.subject?.trim() || application.name?.trim() || 'Заявка без названия'}
              </span>
              <span aria-hidden="true" className="hidden text-[var(--muted)] lg:block">
                →
              </span>
            </AppLink>
          ))
        ) : (
          <Panel className="m-5 text-sm leading-6 text-[var(--muted)]" padding="sm">
            Очередь модерации пуста.
          </Panel>
        )}
      </div>
    </Card>
  );
}

function SectionHeader({
  actionHref,
  actionLabel,
  eyebrow,
  title
}: {
  actionHref?: string;
  actionLabel?: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-end">
      <div>
        <p className={cn(microLabel, 'text-[var(--accent)]')}>{eyebrow}</p>
        <h2 className="mt-2 text-lg font-semibold">{title}</h2>
      </div>
      {actionHref && actionLabel ? (
        <Button className="min-h-9 px-3 py-1.5 text-xs" href={actionHref} variant="secondary">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export function KpiTile({
  href,
  label,
  value,
  note,
  tone = 'default'
}: {
  href: string;
  label: string;
  value: number;
  note: string;
  tone?: 'default' | 'warning';
}) {
  return (
    <AppLink
      className="block rounded-[var(--radius-md)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
      href={href}
    >
      <Card
        className={cn(
          'flex h-full items-center justify-between gap-4 px-5 py-4',
          tone === 'warning' && 'border-[var(--warning-border)] bg-[var(--warning-bg)]'
        )}
        elevation="raised"
        interactive
      >
        <div className="min-w-0">
          <p className={cn(microLabel, 'text-[var(--muted)]')}>{label}</p>
          <p className="mt-1 text-xs text-[var(--muted)]">{note}</p>
        </div>
        <span className="font-mono text-[34px] font-semibold leading-none tabular-nums text-[var(--text)]">{value}</span>
      </Card>
    </AppLink>
  );
}
