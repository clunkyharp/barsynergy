import type { ComponentType, ReactNode } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { CardActionRow, IconBadge } from '@/components/public/public-ui-adaptation';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import { displayFont } from '@/lib/fonts';
import type { PublishedContentList } from '@/lib/public/content';
import { cn } from '@/lib/utils';

type LinkAction = {
  href: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'inverse';
};

export type PlatformActionCardProps = {
  eyebrow: string;
  title: string;
  description?: string;
  steps: string[];
  action: LinkAction;
  secondaryAction?: LinkAction;
  className?: string;
};

export function PlatformActionCard({
  eyebrow,
  title,
  description,
  steps,
  action,
  secondaryAction,
  className
}: PlatformActionCardProps) {
  return (
    <Panel className={cn('overflow-hidden border-[var(--border-default)] bg-[var(--surface-wash)] p-0', className)}>
      <div className="grid gap-6 p-5 md:p-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(18rem,0.58fr)] xl:p-7">
        <div className="min-w-0">
          <PublicEyebrow>{eyebrow}</PublicEyebrow>
          <h3 className={`${displayFont.className} mt-4 max-w-2xl text-[2rem] font-semibold leading-none text-[var(--text)] md:text-[2.6rem]`}>
            {title}
          </h3>
          {description ? (
            <PublicBodyText className="mt-4 max-w-xl" size="md">
              {description}
            </PublicBodyText>
          ) : null}
        </div>

        <div className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Шаги</p>
          <ol className="mt-4 grid gap-0">
            {steps.map((step, index) => (
              <li className="grid min-h-[3.7rem] grid-cols-[2rem_minmax(0,1fr)] gap-3" key={step}>
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--accent)]/20 bg-[var(--accent)]/8 text-[11px] font-semibold tabular-nums text-[var(--accent)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="pt-1 text-sm leading-6 text-[var(--text)]">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button className="rounded-[var(--radius-md)] px-5" href={action.href} size="sm" variant={action.variant ?? 'primary'}>
              {action.label}
              <ArrowUpRight size={16} />
            </Button>
            {secondaryAction ? (
              <Button
                className="rounded-[var(--radius-md)] px-5"
                href={secondaryAction.href}
                size="sm"
                variant={secondaryAction.variant ?? 'secondary'}
              >
                {secondaryAction.label}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </Panel>
  );
}

export type PlatformFormatCardProps = {
  label: string;
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  audience?: string;
  outcome?: string;
  status?: string;
  meta?: readonly string[];
  action?: LinkAction;
  className?: string;
};

export function PlatformFormatCard({
  label,
  title,
  description,
  icon,
  audience,
  outcome,
  status,
  meta = [],
  action,
  className
}: PlatformFormatCardProps) {
  return (
    <Panel
      className={cn('flex min-h-[236px] flex-col justify-between border-[var(--border-default)] bg-[var(--surface-wash)]', className)}
      padding="lg"
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <PublicEyebrow>{label}</PublicEyebrow>
          {icon ? <IconBadge icon={icon} size="sm" tone="soft" /> : null}
        </div>
        <h3 className={`${displayFont.className} mt-5 text-[1.7rem] font-semibold leading-none text-[var(--text)]`}>{title}</h3>
        <PublicBodyText className="mt-4 max-w-[34ch]">{description}</PublicBodyText>
        {(audience || outcome) ? (
          <div className="mt-5 grid gap-3">
            {audience ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Для кого</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text)]">{audience}</p>
              </div>
            ) : null}
            {outcome ? (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">Что даёт</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text)]">{outcome}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="mt-7">
        {meta.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {meta.map((item) => (
              <MetaChip className="border-[var(--border-default)] bg-transparent text-[var(--muted)]" key={item} variant="filter">
                {item}
              </MetaChip>
            ))}
          </div>
        ) : null}
        {action ? (
          <CardActionRow className="mt-5 pt-4">
            <span className="rounded-[var(--radius-sm)] border border-[var(--accent)]/20 bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
              {status ?? 'Заявки принимаются'}
            </span>
            <Button className="px-0 text-[11px] tracking-[0.14em]" href={action.href} size="sm" variant={action.variant ?? 'ghost'}>
              {action.label}
              <ArrowUpRight size={14} />
            </Button>
          </CardActionRow>
        ) : null}
      </div>
    </Panel>
  );
}

export type LogoGridItem = {
  name: string;
  label?: string;
  href?: string;
};

export function LogoGrid({ items, emptyText }: { items: LogoGridItem[]; emptyText: string }) {
  if (items.length === 0) {
    return (
      <Panel className="border-dashed border-[var(--border-default)] bg-[var(--surface-wash)]" padding="lg">
        <PublicBodyText>{emptyText}</PublicBodyText>
      </Panel>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => {
        const content = (
              <span className="flex min-h-[104px] items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-5 text-center transition-colors duration-200 group-hover:border-[var(--accent)]/25 group-hover:bg-[var(--surface-wash-strong)]">
            <span>
              <span className="block text-lg font-semibold tracking-normal text-[var(--text)]">{item.name}</span>
              {item.label ? <span className="mt-2 block text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{item.label}</span> : null}
            </span>
          </span>
        );

        return item.href ? (
          <AppLink className="group rounded-[var(--radius-md)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]" href={item.href} key={item.name}>
            {content}
          </AppLink>
        ) : (
          <div key={item.name}>{content}</div>
        );
      })}
    </div>
  );
}

export function DateBlock({ date }: { date: string }) {
  const value = new Date(date);
  const isValid = Number.isFinite(value.getTime());
  const day = isValid ? value.toLocaleDateString('ru-RU', { day: '2-digit' }) : date;
  const month = isValid ? value.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '') : '';
  const weekday = isValid ? value.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', '') : '';

  return (
    <div className="flex w-20 flex-col self-start rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-3 text-left md:justify-center md:text-center">
      <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">{weekday}</span>
      <span className="mt-1 block text-[1.65rem] font-semibold leading-none text-[var(--text)] md:text-[2rem]">{day}</span>
      {month ? <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{month}</span> : null}
    </div>
  );
}

export type ToolTeaserContent = {
  eyebrow: string;
  title: string;
  cardEyebrow: string;
  cardTitle: string;
  description: string;
  steps: string[];
  actionLabel: string;
  actionHref: string;
};

function cleanCalculatorTeaserText(value: string) {
  return value
    .replace(/\s*без регистрации и сохранения данных/giu, '')
    .replace(/\s*без регистрации/giu, '')
    .replace(/\s*и сохранения данных/giu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function ToolTeaser({ teaser }: { teaser: ToolTeaserContent }) {
  const steps = teaser.steps.slice(0, 3);
  const description = cleanCalculatorTeaserText(teaser.description);

  return (
    <section className="background-zone background-zone-tool editorial-grid scroll-mt-28 border-b border-[var(--line)] py-10 md:py-14" id="home-calculator">
      <div className="container">
        <article className="mx-auto max-w-6xl overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-wash)] shadow-[var(--shadow-panel)]">
          <div className="grid gap-6 p-5 md:p-7 xl:grid-cols-[minmax(0,0.82fr)_minmax(18rem,0.46fr)] xl:items-center">
            <div className="min-w-0">
              <PublicDisplayTitle className="max-w-3xl !text-[clamp(2.2rem,4.8vw,4.6rem)] [overflow-wrap:normal] [word-break:normal]">
                {teaser.title}
              </PublicDisplayTitle>
              <PublicBodyText className="mt-4 max-w-2xl" size="md">
                {description}
              </PublicBodyText>
            </div>
            <div className="min-w-0 rounded-[var(--radius-lg)] border border-[var(--border-inverse-soft)] bg-[var(--surface-inverse-card)] p-4 md:p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--editorial-dark-muted)]">Практическая польза</p>
              <p className="mt-3 text-sm leading-6 text-[var(--editorial-dark-text)]">{teaser.cardTitle}</p>
              <Button className="mt-5 w-full rounded-[var(--radius-md)] px-5 sm:w-fit" href={teaser.actionHref}>
                {teaser.actionLabel}
                <ArrowUpRight size={16} />
              </Button>
            </div>
          </div>
          {steps.length > 0 ? (
            <div className="border-t border-[var(--line)] px-5 py-4 md:px-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">Как считать</p>
              <ol className="mt-4 grid divide-y divide-[var(--line)] border-y border-[var(--line)] md:grid-cols-3 md:divide-x md:divide-y-0">
                {steps.map((step, index) => (
                  <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 py-3 md:px-4 md:first:pl-0 md:last:pr-0" key={step}>
                    <span className="flex size-8 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--accent)]/22 bg-[var(--accent-soft)] text-[11px] font-semibold tabular-nums text-[var(--accent)]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="pt-1 text-sm leading-6 text-[var(--text)]">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </article>
      </div>
    </section>
  );
}

function pageHref(content: PublishedContentList, basePath: string, page: number) {
  const params = new URLSearchParams();

  Object.entries(content.params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    if (value) {
      params.set(key, value);
    }
  });

  if (page > 1) {
    params.set('page', String(page));
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

function monthLabel(dateIso?: string) {
  if (!dateIso) {
    return 'Без даты';
  }

  const value = new Date(dateIso);

  if (!Number.isFinite(value.getTime())) {
    return 'Без даты';
  }

  return value.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
}

export function EventAgendaSection({
  content,
  filters
}: {
  content: PublishedContentList;
  filters: ReactNode;
}) {
  const groups = content.items.reduce<Array<{ label: string; items: typeof content.items }>>((acc, item) => {
    const label = monthLabel(item.dateIso);
    const currentGroup = acc.find((group) => group.label === label);

    if (currentGroup) {
      currentGroup.items.push(item);
      return acc;
    }

    acc.push({ label, items: [item] });
    return acc;
  }, []);

  return (
    <section className="background-zone background-zone-ivory editorial-grid border-b border-[var(--line)] py-10 md:py-14" id="events-list">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <PublicDisplayTitle className="max-w-sm">Афиша</PublicDisplayTitle>
            <div className="mt-4 flex flex-wrap gap-2">
              <MetaChip className="border-[var(--border-default)] bg-[var(--surface-wash)] text-[var(--text)]" variant="filter">
                Найдено событий: {content.total}
              </MetaChip>
            </div>
          </div>
          <p className="text-sm font-medium text-[var(--muted)]">Сначала ближайшие</p>
        </div>

        <div className="mt-6">{filters}</div>

        {content.items.length === 0 ? (
          <Panel className="mt-8 space-y-4 border-[var(--border-default)] bg-[var(--surface-wash)]" padding="lg">
            <PublicEyebrow tone="muted">Афиша</PublicEyebrow>
            <h3 className="text-2xl font-semibold leading-8">По этим параметрам ничего не найдено</h3>
            <PublicBodyText>Сбросьте фильтры или предложите событие через форму ниже.</PublicBodyText>
            <div className="flex flex-wrap gap-3">
              <Button href="/events" variant="secondary">
                Сбросить фильтры
              </Button>
              <Button href="/events?intent=proposal#event-request">Предложить событие</Button>
            </div>
          </Panel>
        ) : (
          <div className="mt-8 grid gap-10">
            {groups.map((group) => (
              <div key={group.label}>
                <div className="mb-4 flex items-center gap-4">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{group.label}</h2>
                  <span className="h-px flex-1 bg-[var(--line)]" />
                </div>

                <div className="grid gap-4">
                  {group.items.map((item) => (
                    <article
                      className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[color-mix(in_oklab,var(--surface),white_18%)] p-4 shadow-[0_12px_34px_rgba(20,20,18,0.03)] transition hover:border-[var(--accent)]/28 hover:bg-[color-mix(in_oklab,var(--surface),white_24%)] md:grid-cols-[5.5rem_minmax(0,1fr)_minmax(12rem,0.32fr)] md:p-5"
                      key={item.id}
                    >
                      <DateBlock date={item.dateIso ?? ''} />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                            {item.label ?? 'Событие'}
                          </p>
                        </div>
                        <h3 className={`${displayFont.className} mt-2 text-[1.45rem] font-semibold leading-none text-[var(--text)] sm:text-[1.65rem] md:text-[2.2rem]`}>
                          {item.title}
                        </h3>
                        {item.metaGroups && item.metaGroups.length > 0 ? (
                          <dl className="mt-4 grid gap-x-4 gap-y-2 sm:grid-cols-2">
                            {item.metaGroups.map((entry) => (
                              <div className="min-w-0 border-t border-[var(--line)] pt-2.5" key={`${entry.label ?? 'meta'}-${entry.value}`}>
                                {entry.label ? (
                                  <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{entry.label}</dt>
                                ) : null}
                                <dd className={cn('mt-1 text-sm leading-5 text-[var(--text)]', entry.tone === 'accent' && 'font-semibold text-[var(--accent)]')}>
                                  {entry.value}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        ) : (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {(item.meta ?? []).slice(0, 4).map((entry) => (
                              <MetaChip className="border-[var(--border-default)] bg-transparent text-[var(--muted)]" key={entry} variant="filter">
                                {entry}
                              </MetaChip>
                            ))}
                          </div>
                        )}
                        <PublicBodyText className="mt-3 max-w-2xl">{item.summary}</PublicBodyText>
                      </div>
                      <aside className="flex flex-col border-t border-[var(--line)] pt-4 md:col-span-1 md:min-h-full md:border-l md:border-t-0 md:pl-4 md:pt-0">
                        <div className="grid gap-3">
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">Следующий шаг</p>
                            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                              Детали, регистрация и контакт организатора открываются на странице события.
                            </p>
                          </div>
                          {item.metaGroups?.[2] ? (
                            <dl className="border-t border-[var(--line)] pt-3">
                              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                                {item.metaGroups[2].label}
                              </dt>
                              <dd className="mt-1 text-sm font-semibold leading-5 text-[var(--text)]">{item.metaGroups[2].value}</dd>
                            </dl>
                          ) : null}
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 md:mt-auto md:grid-cols-1 md:pt-5">
                          <Button className="rounded-[var(--radius-md)] px-4 md:px-5" href={`/events/${item.slug}`} size="sm">
                            Открыть событие
                          </Button>
                          <Button
                            className="rounded-[var(--radius-md)] px-4 md:px-5"
                            href={`/events/${item.slug}#event-request`}
                            size="sm"
                            variant="secondary"
                          >
                            Записаться
                          </Button>
                        </div>
                      </aside>
                    </article>
                  ))}
                </div>
              </div>
            ))}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
              <MetaChip className="border-[var(--border-default)] bg-transparent text-[var(--muted)]" variant="default">
                Страница {content.page} из {content.totalPages}
              </MetaChip>
              {content.totalPages > 1 ? (
                <div className="flex flex-wrap gap-3">
                  <Button disabled={content.page <= 1} href={pageHref(content, '/events', content.page - 1)} variant="secondary">
                    Назад
                  </Button>
                  <Button disabled={content.page >= content.totalPages} href={pageHref(content, '/events', content.page + 1)} variant="secondary">
                    Дальше
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
