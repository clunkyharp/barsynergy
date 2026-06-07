'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ArrowUpRight, BookOpen, BriefcaseBusiness, CalendarDays, Check, Coffee, Handshake, Settings2, Store, User, Users } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';
import type {
  EditorialReadingQueueItem, PartnerFormatTableItem, PrimitiveShellProps,
  ProcessStepInlineItem, ProgramFormatMatrixItem, RouteIndexPanelItem,
  SponsorBenefitSheetItem, SponsorPackageComparisonItem
} from './editorial-display-primitives-types';
import { CompactMark, FactList, InlineAction, MetaText, PrimitiveShell, StatusPill, StructuredCard, textValue } from './editorial-display-primitives-internal';

export function RouteIndexPanel({ items, className, ...props }: PrimitiveShellProps & { items: RouteIndexPanelItem[] }) {
  return (
    <PrimitiveShell className={className} {...props}>
      <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {items.map((item, index) => (
          <AppLink
            aria-label={item.ariaLabel}
            className="group grid gap-4 py-4 transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:bg-[var(--surface-wash)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:ring-inset motion-reduce:transition-none md:grid-cols-[4.5rem_minmax(0,1fr)_minmax(9rem,0.28fr)] md:px-3"
            href={item.href}
            key={index}
          >
            <div className="flex items-start gap-3 md:block">
              <CompactMark>{item.code}</CompactMark>
              <div className="min-w-0 md:hidden">
                <h3 className={`${displayFont.className} text-[1.55rem] font-semibold leading-none text-[var(--text)] group-hover:text-[var(--accent)]`}>
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.useCase}</p>
              </div>
            </div>
            <div className="hidden min-w-0 md:block">
              <h3 className={`${displayFont.className} text-[1.85rem] font-semibold leading-none text-[var(--text)] group-hover:text-[var(--accent)]`}>
                {item.title}
              </h3>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">{item.useCase}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end md:justify-center">
              {item.status ? <StatusPill accent>{item.status}</StatusPill> : null}
              {item.count ? <StatusPill>{item.count}</StatusPill> : null}
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
                {item.actionLabel ?? 'Перейти в раздел'}
                <ArrowUpRight className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] group-hover:translate-x-1 motion-reduce:transition-none" size={16} strokeWidth={1.8} />
              </span>
            </div>
          </AppLink>
        ))}
      </div>
    </PrimitiveShell>
  );
}

export function EditorialReadingQueue({ items, className, ...props }: PrimitiveShellProps & { items: EditorialReadingQueueItem[] }) {
  return (
    <PrimitiveShell className={className} {...props}>
      <ol className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <li key={index}>
            <StructuredCard
              action={item.action} description={item.description} mark={item.rubric
              } status={item.status ?? item.type} title={item.title}
            >
              <FactList
                items={[
                  item.type ? { label: 'Тип', value: item.type } : undefined,
                  item.forWhom ? { label: 'Для кого', value: item.forWhom } : undefined,
                  item.willAppear ? { label: 'Что будет', value: item.willAppear } : undefined
                ].filter(Boolean) as { label: ReactNode; value: ReactNode }[]}
              />
            </StructuredCard>
          </li>
        ))}
      </ol>
    </PrimitiveShell>
  );
}

export function ProgramFormatMatrix({ items, className, ...props }: PrimitiveShellProps & { items: ProgramFormatMatrixItem[] }) {
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'barista' | 'manager' | 'owner'>('all');
  const filters = [
    { id: 'all' as const, label: 'Все' },
    { id: 'barista' as const, label: 'Бариста' },
    { id: 'manager' as const, label: 'Менеджер' },
    { id: 'owner' as const, label: 'Владелец' }
  ];
  const icons = [Coffee, BookOpen, Users, Settings2, Handshake, BriefcaseBusiness, CalendarDays];
  const filteredItems = useMemo(() => {
    if (audienceFilter === 'all') { return items; }
    const matches: Record<Exclude<typeof audienceFilter, 'all'>, RegExp> = {
      barista: /бариста|специалист/i,
      manager: /менеджер|управля|шеф|команд/i,
      owner: /владел|собствен|заведен|команд/i
    };
    return items.filter((item) => matches[audienceFilter].test(textValue(item.audience)));
  }, [audienceFilter, items]);

  return (
    <PrimitiveShell className={className} {...props}>
      <div className="mb-5 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            aria-pressed={audienceFilter === filter.id}
            className={cn(
              'inline-flex min-h-10 items-center rounded-[var(--radius-sm)] border px-3 text-sm font-semibold transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
              audienceFilter === filter.id
                ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)]'
                : 'border-[var(--border-default)] bg-[var(--surface-wash)] text-[var(--text)] hover:border-[var(--accent)]/35'
            )}
            key={filter.id}
            onClick={() => setAudienceFilter(filter.id)}
            type="button"
          >
            {filter.label}
          </button>
        ))}
      </div>
      <div className="grid gap-4">
        {filteredItems.map((item, index) => {
          const Icon = icons[index % icons.length] ?? Coffee;
          return (
            <article className="public-card-shell flex flex-col gap-4 p-4 md:p-5" key={index}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-[var(--accent)]/22 bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <h3 className={`${displayFont.className} text-[1.35rem] font-semibold leading-tight text-[var(--text)] md:text-[1.65rem]`}>
                    {item.format}
                  </h3>
                </div>
                <StatusPill>{item.status}</StatusPill>
              </div>
              <p className="text-sm leading-7 text-[var(--muted)]">{item.includes}</p>
              <div className="grid gap-2 text-sm leading-6">
                <div className="flex items-center gap-2 text-[var(--text)]">
                  <User size={15} strokeWidth={1.8} className="shrink-0 text-[var(--accent)]" />
                  <span>{item.audience}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text)]">
                  <Check size={15} strokeWidth={1.8} className="shrink-0 text-[var(--accent)]" />
                  <span>{item.result}</span>
                </div>
              </div>
              <div className="pt-2"><InlineAction action={item.action} /></div>
            </article>
          );
        })}
      </div>
    </PrimitiveShell>
  );
}

export function PartnerFormatTable({ items, className, ...props }: PrimitiveShellProps & { items: PartnerFormatTableItem[] }) {
  const icons = [CalendarDays, BookOpen, Coffee, Store, Handshake];
  return (
    <PrimitiveShell className={className} {...props}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => {
          const Icon = icons[index % icons.length] ?? Handshake;
          return (
            <article className="public-card-shell flex min-h-[21rem] flex-col p-4 md:p-5" key={index}>
              <div className="flex items-start justify-between gap-4">
                <MetaText>Партнёрский формат</MetaText>
                <span className="grid h-10 w-10 place-items-center rounded-[var(--radius-sm)] border border-[var(--accent)]/22 bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
              </div>
              <h3 className={`${displayFont.className} mt-4 text-[1.65rem] font-semibold leading-none text-[var(--text)] md:text-[2rem]`}>
                {item.format}
              </h3>
              <div className="mt-5 min-w-0">
                <FactList compact items={[
                  { label: 'Кому подходит', value: item.fit },
                  { label: 'Что нужно', value: item.partnerProvides },
                  { label: 'Следующий шаг', value: item.nextStep }
                ]} />
              </div>
              {item.action ? (<div className="mt-auto pt-5"><InlineAction action={item.action} /></div>) : null}
            </article>
          );
        })}
      </div>
    </PrimitiveShell>
  );
}

export function SponsorBenefitSheet({ items, className, ...props }: PrimitiveShellProps & { items: readonly SponsorBenefitSheetItem[] }) {
  return (
    <PrimitiveShell className={className} {...props}>
      <ol className="sponsor-benefit-sheet divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {items.map((item, index) => (
          <li className="grid gap-4 py-4 md:grid-cols-[minmax(9rem,0.34fr)_minmax(0,1fr)_minmax(12rem,0.5fr)] md:px-3 md:py-5" key={index}>
            <div className="min-w-0">
              <MetaText>Выгода</MetaText>
              <h3 className={`${displayFont.className} mt-2 text-[1.55rem] font-semibold leading-none text-[var(--text)] md:text-[1.95rem]`}>
                {item.benefit}
              </h3>
            </div>
            <div className="min-w-0">
              <MetaText>Где бренд виден</MetaText>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.brandVisibility}</p>
            </div>
            <div className="min-w-0">
              <MetaText>Результат</MetaText>
              <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text)]">{item.result}</p>
            </div>
          </li>
        ))}
      </ol>
    </PrimitiveShell>
  );
}

export function SponsorPackageComparison({ items, className, ...props }: PrimitiveShellProps & { items: SponsorPackageComparisonItem[] }) {
  return (
    <PrimitiveShell className={className} {...props}>
      <div className="sponsor-package-table border-y border-[var(--line)]">
        <div aria-hidden="true" className="hidden border-b border-[var(--line)] px-3 py-3 md:grid md:grid-cols-[minmax(10rem,0.82fr)_minmax(8rem,0.52fr)_minmax(11rem,0.82fr)_minmax(12rem,1fr)_minmax(10rem,0.82fr)_minmax(9rem,0.62fr)] md:gap-4">
          <MetaText>Пакет</MetaText><MetaText>Период</MetaText><MetaText>Где виден бренд</MetaText><MetaText>Что входит</MetaText><MetaText>Материалы</MetaText><MetaText>Действие</MetaText>
        </div>
        {items.map((item, index) => (
          <article className="sponsor-package-row grid gap-4 border-b border-[var(--line)] py-4 last:border-b-0 md:grid-cols-[minmax(10rem,0.82fr)_minmax(8rem,0.52fr)_minmax(11rem,0.82fr)_minmax(12rem,1fr)_minmax(10rem,0.82fr)_minmax(9rem,0.62fr)] md:items-start md:gap-4 md:px-3 md:py-5"
            data-recommended={item.recommended || undefined} key={index}>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className={`${displayFont.className} text-[1.45rem] font-semibold leading-none text-[var(--text)] md:text-[1.7rem]`}>
                  {item.packageName}
                </h3>
                {item.recommended ? <StatusPill accent>Основной</StatusPill> : null}
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.scope}</p>
              {item.priceStatus ? (
                <p className="mt-2 text-sm font-semibold leading-5 text-[var(--text)]">
                  <MetaText className="mr-2 inline">Стоимость</MetaText>{item.priceStatus}
                </p>
              ) : null}
            </div>
            <div className="min-w-0">
              <MetaText className="md:hidden">Период</MetaText>
              <p className="mt-1 text-sm leading-6 text-[var(--text)] md:mt-0">{item.periodStatus}</p>
            </div>
            <div className="min-w-0">
              <MetaText className="md:hidden">Где виден бренд</MetaText>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)] md:mt-0">{item.visibility}</p>
            </div>
            <div className="min-w-0">
              <MetaText className="md:hidden">Что входит</MetaText>
              <p className="mt-1 text-sm leading-6 text-[var(--text)] md:mt-0">{item.includedPlacements}</p>
            </div>
            <div className="min-w-0">
              <MetaText className="md:hidden">Материалы</MetaText>
              <p className="mt-1 text-sm leading-6 text-[var(--muted)] md:mt-0">{item.requiredAssets}</p>
            </div>
            {item.action ? (<div className="md:justify-self-end"><InlineAction action={item.action} className="sponsor-package-action" /></div>) : null}
          </article>
        ))}
      </div>
    </PrimitiveShell>
  );
}

export function ProcessStepsInline({ steps, className, ...props }: PrimitiveShellProps & { steps: readonly ProcessStepInlineItem[] }) {
  return (
    <PrimitiveShell className={className} {...props}>
      <ol className="divide-y divide-[var(--line)] border-y border-[var(--line)] lg:grid lg:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] lg:divide-x lg:divide-y-0">
        {steps.map((step, index) => (
          <li className="py-3.5 lg:px-4 lg:py-5" key={index}>
            <div className="min-w-0">
              <h3 className={`${displayFont.className} text-[1.55rem] font-semibold leading-none text-[var(--text)]`}>{step.title}</h3>
              {step.description ? <p className="mt-2 text-sm leading-6 text-[var(--muted)] lg:mt-3">{step.description}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </PrimitiveShell>
  );
}
