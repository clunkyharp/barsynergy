import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { ContentSubscribeForm } from '@/components/public/content-subscribe-form';
import { displayFont } from '@/lib/fonts';
import type { PublishedContentList } from '@/lib/public/content';
import { CompactEventCard, FeaturedEventCard } from './platform-ui-event-agenda-cards';

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

export function EventAgendaSection({ cityName, content }: { cityName?: string; content: PublishedContentList }) {
  const period = Array.isArray(content.params.period) ? content.params.period[0] : content.params.period;
  const isPastArchive = period === 'past';
  const hasActiveEventFilters = Object.entries(content.params).some(([key, value]) => {
    if (key === 'period') return false;
    if (Array.isArray(value)) return value.some((item) => item.trim().length > 0);
    return Boolean(value?.trim());
  });
  const isTrueUpcomingEmpty = !isPastArchive && !hasActiveEventFilters;

  const [featured, ...rest] = content.items;

  const sectionLabel = isPastArchive ? 'Архив событий' : 'Ближайшие события';
  const showViewAll = period && period !== 'upcoming';
  const hasCityFilter = Boolean(cityName);

  return (
    <section className="background-zone background-zone-graphite border-b border-[var(--line)] py-10 md:py-14" id="events-list">
      <div className="container flex flex-col gap-6 md:gap-8">
        {content.items.length > 0 ? (
          <>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-[18px] font-semibold text-[var(--text)]">{sectionLabel}</h2>
                <MetaChip className="border-[var(--border-default)] bg-[var(--accent-soft)] text-[var(--accent)]" variant="filter">
                  {content.total}
                </MetaChip>
              </div>
              {showViewAll ? (
                <AppLink
                  className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)] whitespace-nowrap"
                  href="/events"
                >
                  Смотреть все <ArrowUpRight size={14} strokeWidth={2} />
                </AppLink>
              ) : null}
            </div>

            {featured ? <FeaturedEventCard item={featured} /> : null}

            {rest.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 md:gap-5">
                {rest.map((item) => (
                  <CompactEventCard item={item} key={item.id} />
                ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="grid p-5 md:p-6">
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
                    href="/contacts?topic=partnership#contact-form"
                  >
                    Хотите провести своё? <ArrowUpRight size={14} strokeWidth={1.8} />
                  </AppLink>
                </div>
              </div>
            ) : (
              <div className="min-w-0 py-6">
                <h3 className="text-xl font-semibold leading-7">
                  {hasCityFilter && !isPastArchive
                    ? `В ${cityName} пока нет событий`
                    : isPastArchive && !hasActiveEventFilters
                    ? 'Архив событий пока пуст'
                    : 'По этим параметрам ничего не найдено'}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  {hasCityFilter && !isPastArchive
                    ? 'Можно предложить событие для афиши или подписаться на новые анонсы по региону.'
                    : isPastArchive && !hasActiveEventFilters
                    ? 'Прошедшие встречи появятся здесь после публикации архива.'
                    : 'Измените параметры поиска или сбросьте фильтры выше.'}
                </p>
                {hasCityFilter && !isPastArchive ? (
                  <div className="mt-5 grid gap-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)] p-4 md:grid-cols-[minmax(0,0.42fr)_minmax(0,0.58fr)] md:items-end">
                    <div>
                      <Button href="/contacts?topic=event#contact-form" variant="secondary">
                        Предложить событие
                      </Button>
                    </div>
                    <ContentSubscribeForm topic="EVENTS" label="Получить уведомление" />
                  </div>
                ) : (
                  <Button className="mt-5" href="/events" variant="secondary">
                    Сбросить фильтры
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {content.items.length > 0 && content.totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-6">
            <MetaChip className="border-[var(--border-default)] bg-transparent text-[var(--muted)]" variant="default">
              Страница {content.page} из {content.totalPages}
            </MetaChip>
            <div className="flex flex-wrap gap-3">
              <Button disabled={content.page <= 1} href={pageHref(content, '/events', content.page - 1)} variant="secondary">
                Назад
              </Button>
              <Button disabled={content.page >= content.totalPages} href={pageHref(content, '/events', content.page + 1)} variant="secondary">
                Дальше
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
