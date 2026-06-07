import type { ReactNode } from 'react';
import { CalendarDays, ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicEyebrow } from '@/components/public/public-primitives';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import { displayFont } from '@/lib/fonts';
import type { PublishedContentList } from '@/lib/public/content';
import { cn } from '@/lib/utils';
import { DateBlock } from './platform-ui-date-block';

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
