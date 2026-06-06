import type { ComponentType, ReactNode } from 'react';
import { ArrowUpRight, CalendarDays } from 'lucide-react';
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
                  {index + 1}
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
            <Button className="px-0 text-[11px] tracking-[0.14em]" href={action.href} size="sm" variant={action.variant ?? 'link'}>
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
              <span className="flex min-h-[104px] items-center justify-center rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-5 text-center transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:border-[var(--accent)]/25 group-hover:bg-[var(--surface-wash-strong)] motion-reduce:transition-none">
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
    <div className="flex w-16 flex-col self-start rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-2.5 text-left md:justify-center md:text-center">
      <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{weekday}</span>
      <span className="mt-1 block text-[1.45rem] font-semibold leading-none text-[var(--text)] md:text-[1.65rem]">{day}</span>
      {month ? <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">{month}</span> : null}
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
  const description = cleanCalculatorTeaserText(teaser.description);
  const steps = teaser.steps.filter(Boolean).slice(0, 3);

  return (
    <section className="background-zone background-zone-tool editorial-grid scroll-mt-28 border-b border-[var(--line)] py-8 md:py-10" id="home-calculator">
      <div className="container">
        <article className="home-tool-teaser mx-auto max-w-6xl overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-wash)] shadow-[var(--shadow-panel)]">
          <div className="home-tool-teaser-grid grid gap-5 p-5 md:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.48fr)]">
            <div className="min-w-0">
              <PublicEyebrow>{teaser.eyebrow}</PublicEyebrow>
              <PublicDisplayTitle className="max-w-2xl !text-[clamp(2rem,4vw,3.45rem)] [overflow-wrap:normal] [word-break:normal]">
                {teaser.title}
              </PublicDisplayTitle>
              <PublicBodyText className="mt-3 max-w-xl" size="md">
                {description}
              </PublicBodyText>
            </div>
            <div className="home-tool-teaser-rail min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--editorial-dark-muted)]">{teaser.cardEyebrow}</p>
              <p className="mt-3 max-w-sm text-base leading-7 text-[var(--editorial-dark-text)]">{teaser.cardTitle}</p>
              <Button className="mt-5 w-full rounded-[var(--radius-md)] px-6" href={teaser.actionHref}>
                {teaser.actionLabel}
                <ArrowUpRight size={16} />
              </Button>
            </div>
            {steps.length > 0 ? (
              <ol className="home-tool-step-list grid gap-3 border-t border-[var(--line)] pt-5 lg:col-span-2 lg:grid-cols-3">
                {steps.map((step, index) => (
                  <li className="home-tool-step grid min-w-0 grid-cols-[2.25rem_minmax(0,1fr)] gap-3" key={step}>
                    <span className="home-tool-step-index">{index + 1}</span>
                    <span className="pt-0.5 text-sm leading-6 text-[var(--editorial-dark-text)]">{step}</span>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
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
  const now = Date.now();
  const isPastItem = (dateIso?: string) => {
    if (!dateIso) {
      return false;
    }

    const date = new Date(dateIso);

    return Number.isFinite(date.getTime()) && date.getTime() < now;
  };
  const period = Array.isArray(content.params.period) ? content.params.period[0] : content.params.period;
  const isPastArchive = period === 'past';
  const isUpcomingOnly = period === 'upcoming';
  const hasActiveEventFilters = Object.entries(content.params).some(([key, value]) => {
    if (key === 'period') {
      return false;
    }

    if (Array.isArray(value)) {
      return value.some((item) => item.trim().length > 0);
    }

    return Boolean(value?.trim());
  });
  const isTrueUpcomingEmpty = isUpcomingOnly && !hasActiveEventFilters;
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

  const noFilters = !filters;

  return (
    <section className="public-catalog-section background-zone background-zone-ivory editorial-grid border-b border-[var(--line)] py-10 md:py-14" id="events-list">
      <div className={cn('container grid gap-6 md:gap-8 xl:gap-8', noFilters ? 'xl:grid-cols-1' : 'xl:grid-cols-[minmax(16rem,0.48fr)_minmax(0,1.52fr)]')}>
        {noFilters ? null : (
          <aside className="public-catalog-sidebar min-w-0">
            {filters}
          </aside>
        )}

        <Panel className="public-catalog-list-panel min-w-0 overflow-hidden border-[var(--border-default)] bg-[var(--surface-card)]" padding="none">
          {content.items.length > 0 ? (
            <div className="public-catalog-toolbar flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <MetaChip className="border-[var(--border-default)] bg-[var(--accent-soft)] text-[var(--accent)]" variant="filter">
                  Событий: {content.total}
                </MetaChip>
                <MetaChip className="border-[var(--border-default)] bg-transparent text-[var(--muted)]" variant="filter">
                  {isPastArchive ? 'Архив' : 'Афиша'}
                </MetaChip>
                <MetaChip className="border-[var(--border-default)] bg-transparent text-[var(--muted)]" variant="filter">
                  {isPastArchive ? 'Сначала свежие прошедшие' : 'Сначала ближайшие'}
                </MetaChip>
              </div>
            </div>
          ) : null}

          {content.items.length === 0 ? (
            <div className="event-empty-state grid p-5 md:p-6">
              {isTrueUpcomingEmpty ? (
                <div className="mx-auto max-w-sm py-6 text-center md:py-10">
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
                    <CalendarDays size={28} strokeWidth={1.5} />
                  </div>
                  <h3 className={`${displayFont.className} mt-5 text-[1.6rem] font-semibold leading-tight text-[var(--text)]`}>
                    События появятся совсем скоро
                  </h3>
                  <p className="mt-3 text-[15px] leading-7 text-[var(--muted)]">
                    Подпишитесь — пришлём анонс первыми, когда откроем запись на интенсив или каппинг.
                  </p>
                  <Button className="mt-6" href="/contacts#contact-form">
                    Подписаться на анонсы
                  </Button>
                  <div className="mt-4">
                    <AppLink
                      className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
                      href="/contacts?topic=event#contact-form"
                    >
                      Хотите провести своё? <ArrowUpRight size={14} strokeWidth={1.8} />
                    </AppLink>
                  </div>
                </div>
              ) : (
                <div className="min-w-0">
                  <PublicEyebrow tone="muted">Афиша</PublicEyebrow>
                  <h3 className="mt-2 text-xl font-semibold leading-7">
                    {isPastArchive && !hasActiveEventFilters
                      ? 'Архив событий пока пуст'
                      : 'По этим параметрам ничего не найдено'}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                    {isPastArchive && !hasActiveEventFilters
                      ? 'Прошедшие встречи появятся здесь после публикации архива.'
                      : 'Измените параметры поиска или сбросьте фильтры над списком.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="public-catalog-list-rows grid gap-10">
              {groups.map((group) => (
                <div key={group.label}>
                  <div className="mb-4 flex items-center gap-4">
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">{group.label}</h2>
                    <span className="h-px flex-1 bg-[var(--line)]" />
                  </div>

                  <div className="grid gap-4">
                    {group.items.map((item) => {
                      const isPast = isPastItem(item.dateIso);

                      return (
                        <article
                          className="public-card-shell grid gap-3 p-3.5 md:grid-cols-[4.5rem_minmax(0,1fr)_10rem] md:items-start md:p-4"
                          key={item.id}
                        >
                          <DateBlock date={item.dateIso ?? ''} />
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                                {item.label ?? 'Событие'}
                              </p>
                              {isPast ? (
                                <MetaChip className="border-[var(--border-default)] bg-transparent text-[var(--muted)]" variant="filter">
                                  Событие прошло
                                </MetaChip>
                              ) : null}
                            </div>
                            <h3 className={`${displayFont.className} mt-1.5 text-[1.35rem] font-semibold leading-[1.05] text-[var(--text)] sm:text-[1.5rem] md:text-[1.8rem]`}>
                              {item.title}
                            </h3>
                            {item.metaGroups && item.metaGroups.length > 0 ? (
                              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 xl:grid-cols-4">
                                {item.metaGroups.map((entry) => (
                                  <div className="min-w-0 border-t border-[var(--line)] pt-2" key={`${entry.label ?? 'meta'}-${entry.value}`}>
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
                              <div className="mt-2.5 flex flex-wrap gap-2">
                                {(item.meta ?? []).slice(0, 4).map((entry) => (
                                  <MetaChip className="border-[var(--border-default)] bg-transparent text-[var(--muted)]" key={entry} variant="filter">
                                    {entry}
                                  </MetaChip>
                                ))}
                              </div>
                            )}
                            <PublicBodyText className="mt-2.5 max-w-3xl text-sm leading-6">{item.summary}</PublicBodyText>
                          </div>
                          <aside className="flex flex-col border-t border-[var(--line)] pt-3 md:col-span-1 md:min-h-full md:border-l md:border-t-0 md:pl-3 md:pt-0">
                            <div className="grid grid-cols-2 gap-2 md:mt-auto md:grid-cols-1">
                              <Button className="rounded-[var(--radius-md)] px-3" href={`/events/${item.slug}`} size="sm">
                                Подробнее о событии
                              </Button>
                              {isPast ? (
                                <Button className="rounded-[var(--radius-md)] px-3" disabled href={`/events/${item.slug}`} size="sm" variant="secondary">
                                  Событие прошло
                                </Button>
                              ) : (
                                <Button
                                  className="rounded-[var(--radius-md)] px-3"
                                  href={`/events/${item.slug}#event-request`}
                                  size="sm"
                                  variant="secondary"
                                >
                                  Записаться
                                </Button>
                              )}
                            </div>
                          </aside>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className="public-catalog-pagination flex flex-wrap items-center justify-between gap-3">
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
        </Panel>
      </div>
    </section>
  );
}
