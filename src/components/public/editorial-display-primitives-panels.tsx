'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ArrowUpRight, Check, User } from 'lucide-react';
import { SectionIcon, type SectionIconType } from '@/components/public/section-icon';
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
      <div className="mb-6 flex flex-nowrap gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {filters.map((filter) => (
          <button
            aria-pressed={audienceFilter === filter.id}
            className={cn(
              'inline-flex shrink-0 min-h-10 items-center rounded-[var(--radius-sm)] border px-3 text-sm font-semibold transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] motion-reduce:transition-none',
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
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredItems.map((item, index) => {
          return (
            <article className="public-card-shell flex h-full flex-col p-4 md:p-5" key={index}>
              {/* Upper zone: title + status + description */}
              <div>
                <div className="flex items-start justify-between gap-3">
                  <h3 className={`${displayFont.className} text-[1.25rem] font-semibold leading-tight text-[var(--text)] md:text-[1.4rem]`}>
                    {item.format}
                  </h3>
                  {item.status ? <StatusPill>{item.status}</StatusPill> : null}
                </div>
                <p className="mt-1.5 text-[13px] leading-5 text-[var(--muted)] line-clamp-2">
                  {item.includes}
                </p>
              </div>

              {/* Middle zone: info boxes — flex-1 fills remaining space, keeps footer at bottom */}
              <div className="mt-5 flex-1">
                <div className="grid h-full gap-2.5 sm:grid-cols-2">
                  <div className="flex flex-col rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-card-muted)] px-3 py-2.5">
                    <span className="flex items-center gap-2">
                      <User size={14} strokeWidth={1.8} className="shrink-0 text-[var(--accent)]" />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Для кого</span>
                    </span>
                    <p className="mt-1 flex-1 text-[13px] leading-5 text-[var(--text)]">{item.audience}</p>
                  </div>
                  <div className="flex flex-col rounded-[var(--radius-sm)] border border-[var(--border-subtle)] bg-[var(--surface-card-muted)] px-3 py-2.5">
                    <span className="flex items-center gap-2">
                      <Check size={14} strokeWidth={1.8} className="shrink-0 text-[var(--accent)]" />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">Что получите</span>
                    </span>
                    <p className="mt-1 flex-1 text-[13px] leading-5 text-[var(--text)]">{item.result}</p>
                  </div>
                </div>
              </div>

              {/* Lower zone: divider + meta + CTA */}
              <div className="mt-6 border-t border-[var(--line)] pt-4">
                <div className="flex items-center justify-between gap-3">
                  {item.meta ? (
                    <span className="text-xs leading-5 text-[var(--muted)]">{item.meta}</span>
                  ) : (
                    <span />
                  )}
                  <InlineAction action={item.action} />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </PrimitiveShell>
  );
}

export function PartnerFormatTable({ items, className, ...props }: PrimitiveShellProps & { items: PartnerFormatTableItem[] }) {
  const sectionIcons: SectionIconType[] = ['events', 'articles', 'coffee', 'building', 'handshake'];
  return (
    <PrimitiveShell className={className} {...props}>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => {
          const iconType = sectionIcons[index % sectionIcons.length] ?? 'handshake';
          return (
            <article className="public-card-shell flex h-full min-h-[21rem] flex-col p-4 md:p-5" key={index}>
              <div className="flex items-start justify-between gap-4">
                <MetaText>Партнёрский формат</MetaText>
                <SectionIcon size={40} type={iconType} />
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
