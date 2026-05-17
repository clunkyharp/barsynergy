import type { HTMLAttributes, ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { AppLink } from '@/components/ui/app-link';
import { displayFont } from '@/lib/fonts';
import { cn } from '@/lib/utils';

export type EditorialAction = {
  href: string;
  label: string;
  ariaLabel?: string;
};

export type PrimitiveShellProps = HTMLAttributes<HTMLElement> & {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
};

type LabeledValue = {
  label: ReactNode;
  value: ReactNode;
};

export type RouteIndexPanelItem = {
  code: ReactNode;
  title: ReactNode;
  useCase: ReactNode;
  href: string;
  ariaLabel?: string;
  actionLabel?: string;
  status?: ReactNode;
  count?: ReactNode;
};

export type EditorialReadingQueueItem = {
  index: ReactNode;
  rubric: ReactNode;
  title: ReactNode;
  description: ReactNode;
  forWhom?: ReactNode;
  willAppear?: ReactNode;
  type?: ReactNode;
  status?: ReactNode;
  action: EditorialAction;
};

export type ProgramFormatMatrixItem = {
  format: ReactNode;
  audience: ReactNode;
  includes: ReactNode;
  result: ReactNode;
  status: ReactNode;
  action: EditorialAction;
};

export type PartnerFormatTableItem = {
  format: ReactNode;
  fit: ReactNode;
  partnerProvides: ReactNode;
  barsynergyProvides: ReactNode;
  nextStep: ReactNode;
  action?: EditorialAction;
};

export type SponsorBenefitSheetItem = {
  area: ReactNode;
  summary: ReactNode;
  detail: ReactNode;
  touchpoint: ReactNode;
};

export type SponsorPackageComparisonItem = {
  packageName: ReactNode;
  scope: ReactNode;
  visibility: ReactNode;
  periodStatus: ReactNode;
  includedPlacements: ReactNode;
  requiredAssets: ReactNode;
  action?: EditorialAction;
  priceStatus?: ReactNode;
  recommended?: boolean;
};

export type ProcessStepInlineItem = {
  title: ReactNode;
  description?: ReactNode;
};

function InlineAction({ action, className }: { action: EditorialAction; className?: string }) {
  return (
    <AppLink
      aria-label={action.ariaLabel}
      className={cn(
        'inline-flex min-h-10 w-fit items-center gap-2 rounded-[var(--radius-sm)] text-sm font-semibold text-[var(--accent)] transition hover:text-[var(--accent-strong)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]',
        'min-h-11 lg:min-h-10',
        className
      )}
      href={action.href}
    >
      <span>{action.label}</span>
      <ArrowUpRight className="shrink-0" size={16} strokeWidth={1.8} />
    </AppLink>
  );
}

function CompactMark({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-8 min-w-8 shrink-0 items-center justify-center border border-[var(--border-default)] px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
      {children}
    </span>
  );
}

function MetaText({ children }: { children: ReactNode }) {
  return <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{children}</span>;
}

function StatusPill({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex w-fit rounded-[var(--radius-sm)] border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]',
        accent
          ? 'border-[var(--accent)]/24 bg-[var(--accent-soft)] text-[var(--accent)]'
          : 'border-[var(--border-default)] bg-transparent text-[var(--muted)]'
      )}
    >
      {children}
    </span>
  );
}

function PrimitiveShell({ eyebrow, title, description, className, children, ...props }: PrimitiveShellProps) {
  const hasDescription = Boolean(description);

  return (
    <section className={cn('border-y border-[var(--line)] py-7', className)} {...props}>
      {(eyebrow || title || description) ? (
        <div className={cn('mb-6 grid gap-4', hasDescription && 'md:grid-cols-[minmax(12rem,0.44fr)_minmax(0,1fr)] md:items-end')}>
          <div>
            {eyebrow ? <PublicEyebrow>{eyebrow}</PublicEyebrow> : null}
            {title ? (
              <PublicDisplayTitle className={cn('mt-3 !text-[clamp(2rem,4vw,3.4rem)]', hasDescription ? 'max-w-xl' : 'max-w-none')} size="section">
                {title}
              </PublicDisplayTitle>
            ) : null}
          </div>
          {description ? (
            <PublicBodyText className="max-w-2xl md:justify-self-end" size="md">
              {description}
            </PublicBodyText>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

function FactList({ items, compact = false }: { items: LabeledValue[]; compact?: boolean }) {
  return (
    <dl className={cn('grid rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 py-1', compact ? 'text-sm' : '')}>
      {items.map((item, index) => (
        <div
          className={cn(
            'py-2.5',
            index > 0 && 'border-t border-[var(--line)]',
            compact ? 'sm:grid sm:grid-cols-[7.5rem_minmax(0,1fr)] sm:gap-3' : ''
          )}
          key={index}
        >
          <dt>
            <MetaText>{item.label}</MetaText>
          </dt>
          <dd className={cn('text-sm leading-6 text-[var(--text)]', compact && 'mt-1 sm:mt-0')}>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function StructuredCard({
  action,
  children,
  className,
  description,
  footer,
  index,
  mark,
  status,
  title
}: {
  action?: EditorialAction;
  children: ReactNode;
  className?: string;
  description?: ReactNode;
  footer?: ReactNode;
  index?: ReactNode;
  mark: ReactNode;
  status?: ReactNode;
  title: ReactNode;
}) {
  return (
    <article
      className={cn(
        'flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[color-mix(in_oklab,var(--surface),white_18%)] p-4 shadow-[0_12px_34px_rgba(20,20,18,0.028)] transition-colors md:p-5',
        'hover:border-[var(--accent)]/24 hover:bg-[color-mix(in_oklab,var(--surface),white_23%)]',
        className
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {index ? <CompactMark>{index}</CompactMark> : null}
          <MetaText>{mark}</MetaText>
        </div>
        {status ? <StatusPill accent>{status}</StatusPill> : null}
      </div>
      <h3 className={`${displayFont.className} mt-4 text-[1.55rem] font-semibold leading-none text-[var(--text)] md:min-h-[4.1rem] md:text-[1.8rem]`}>
        {title}
      </h3>
      {description ? <p className="mt-4 text-sm leading-6 text-[var(--muted)] md:min-h-[4.5rem]">{description}</p> : null}
      {children ? <div className="mt-5 md:min-h-[10.5rem]">{children}</div> : null}
      {footer ? <div className="mt-6 border-t border-[var(--line)] pt-5">{footer}</div> : null}
      {action ? (
        <div className="mt-6 border-t border-[var(--line)] pt-5">
          <InlineAction action={action} />
        </div>
      ) : null}
    </article>
  );
}

export function RouteIndexPanel({ items, className, ...props }: PrimitiveShellProps & { items: RouteIndexPanelItem[] }) {
  return (
    <PrimitiveShell className={className} {...props}>
      <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {items.map((item, index) => (
          <AppLink
            aria-label={item.ariaLabel}
            className="group grid gap-4 py-4 transition hover:bg-[var(--surface-wash)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:ring-inset md:grid-cols-[4.5rem_minmax(0,1fr)_minmax(9rem,0.28fr)] md:px-3"
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
                {item.actionLabel ?? 'Открыть раздел'}
                <ArrowUpRight className="transition group-hover:translate-x-1" size={16} strokeWidth={1.8} />
              </span>
            </div>
          </AppLink>
        ))}
      </div>
    </PrimitiveShell>
  );
}

export function EditorialReadingQueue({
  items,
  className,
  ...props
}: PrimitiveShellProps & { items: EditorialReadingQueueItem[] }) {
  return (
    <PrimitiveShell className={className} {...props}>
      <ol className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <li key={index}>
            <StructuredCard
              action={item.action}
              description={item.description}
              index={item.index}
              mark={item.rubric}
              status={item.status ?? item.type}
              title={item.title}
            >
              <FactList
                items={[
                  item.type ? { label: 'Тип', value: item.type } : undefined,
                  item.forWhom ? { label: 'Для кого', value: item.forWhom } : undefined,
                  item.willAppear ? { label: 'Что будет', value: item.willAppear } : undefined
                ].filter(Boolean) as LabeledValue[]}
              />
            </StructuredCard>
          </li>
        ))}
      </ol>
    </PrimitiveShell>
  );
}

export function ProgramFormatMatrix({
  items,
  className,
  ...props
}: PrimitiveShellProps & { items: ProgramFormatMatrixItem[] }) {
  return (
    <PrimitiveShell className={className} {...props}>
      <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <article
            className="flex h-full min-h-[24rem] flex-col rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[color-mix(in_oklab,var(--surface),white_18%)] p-4 shadow-[0_12px_34px_rgba(20,20,18,0.028)] transition-colors hover:border-[var(--accent)]/24 hover:bg-[color-mix(in_oklab,var(--surface),white_23%)] md:p-5"
            key={index}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <CompactMark>{String(index + 1).padStart(2, '0')}</CompactMark>
                <MetaText>Формат</MetaText>
              </div>
            </div>
            <div className="mt-4 md:min-h-[5rem]">
              <h3 className={`${displayFont.className} text-[1.55rem] font-semibold leading-none text-[var(--text)] md:text-[1.8rem]`}>
                {item.format}
              </h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)] md:min-h-[5.25rem]">{item.includes}</p>
            <div className="mt-4 md:min-h-[8.75rem]">
              <FactList
                compact
                items={[
                  { label: 'Для кого', value: item.audience },
                  { label: 'Результат', value: item.result }
                ]}
              />
            </div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-3">
              <StatusPill accent>{item.status}</StatusPill>
              <InlineAction action={item.action} />
            </div>
          </article>
        ))}
      </div>
    </PrimitiveShell>
  );
}

export function PartnerFormatTable({
  items,
  className,
  ...props
}: PrimitiveShellProps & { items: PartnerFormatTableItem[] }) {
  return (
    <PrimitiveShell className={className} {...props}>
      <div className="grid items-stretch gap-4 lg:grid-cols-2">
        {items.map((item, index) => (
          <article
            className="flex h-full min-h-0 flex-col rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[color-mix(in_oklab,var(--surface),white_18%)] p-4 shadow-[0_12px_34px_rgba(20,20,18,0.028)] transition-colors hover:border-[var(--accent)]/28 hover:bg-[color-mix(in_oklab,var(--surface),white_23%)] md:p-5"
            key={index}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <CompactMark>{String(index + 1).padStart(2, '0')}</CompactMark>
                <MetaText>Партнёрский формат</MetaText>
              </div>
              <StatusPill accent>Выбор</StatusPill>
            </div>
            <h3 className={`${displayFont.className} mt-5 text-[1.75rem] font-semibold leading-none text-[var(--text)] md:text-[2.2rem]`}>
              {item.format}
            </h3>
            <div className="mt-5">
              <FactList
                items={[
                  { label: 'Кому подходит', value: item.fit },
                  { label: 'Что нужно', value: item.partnerProvides },
                  { label: 'Что делаем', value: item.barsynergyProvides },
                  { label: 'Следующий шаг', value: item.nextStep }
                ]}
              />
            </div>
            {item.action ? (
              <div className="mt-6 border-t border-[var(--line)] pt-5">
                <InlineAction action={item.action} />
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </PrimitiveShell>
  );
}

export function SponsorBenefitSheet({
  items,
  className,
  ...props
}: PrimitiveShellProps & { items: readonly SponsorBenefitSheetItem[] }) {
  return (
    <PrimitiveShell className={className} {...props}>
      <div className="grid items-stretch gap-4 md:grid-cols-2">
        {items.map((item, index) => (
          <StructuredCard
            description={item.detail}
            index={String(index + 1).padStart(2, '0')}
            key={index}
            mark="Польза"
            title={item.area}
          >
            <FactList
              items={[
                { label: 'Польза', value: item.summary },
                { label: 'Где контакт', value: item.touchpoint }
              ]}
            />
          </StructuredCard>
        ))}
      </div>
    </PrimitiveShell>
  );
}

export function SponsorPackageComparison({
  items,
  className,
  ...props
}: PrimitiveShellProps & { items: SponsorPackageComparisonItem[] }) {
  return (
    <PrimitiveShell className={className} {...props}>
      <div className="grid items-stretch gap-4 lg:grid-cols-3">
        {items.map((item, index) => (
          <StructuredCard
            action={item.action}
            className={item.recommended ? 'border-[var(--accent)]/35 bg-[linear-gradient(180deg,var(--accent-soft),color-mix(in_oklab,var(--surface),white_18%)_42%)]' : undefined}
            footer={
              item.priceStatus ? (
                <div className="flex flex-wrap items-center gap-2">
                  <MetaText>Стоимость</MetaText>
                  <span className="text-sm text-[var(--muted)]">—</span>
                  <span className="text-sm font-semibold text-[var(--text)]">{item.priceStatus}</span>
                </div>
              ) : undefined
            }
            index={String(index + 1).padStart(2, '0')}
            key={index}
            mark="Пакет"
            status={item.recommended ? 'Основной' : undefined}
            title={item.packageName}
          >
            <FactList
              items={[
                { label: 'Для кого / задача', value: item.scope },
                { label: 'Где виден бренд', value: item.visibility },
                { label: 'Период', value: item.periodStatus },
                { label: 'Что входит', value: item.includedPlacements },
                { label: 'Материалы', value: item.requiredAssets }
              ]}
            />
          </StructuredCard>
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
          <li className="grid grid-cols-[3rem_minmax(0,1fr)] gap-3 py-3.5 lg:block lg:px-4 lg:py-5" key={index}>
            <CompactMark>{String(index + 1).padStart(2, '0')}</CompactMark>
            <div className="min-w-0 lg:mt-5">
              <h3 className={`${displayFont.className} text-[1.55rem] font-semibold leading-none text-[var(--text)]`}>{step.title}</h3>
              {step.description ? <p className="mt-2 text-sm leading-6 text-[var(--muted)] lg:mt-3">{step.description}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </PrimitiveShell>
  );
}
