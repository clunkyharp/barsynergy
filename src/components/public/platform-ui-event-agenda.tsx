import { ArrowUpRight, CalendarDays, Clock, MapPin } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { displayFont } from '@/lib/fonts';
import type { PublishedContentList, PublishedContentItem } from '@/lib/public/content';
import { cn } from '@/lib/utils';

const categoryColors: Record<string, { bg: string; text: string }> = {
  'каппинг': { bg: 'rgba(255,208,47,0.18)', text: '#c89b00' },
  'лекция': { bg: 'rgba(34,197,94,0.15)', text: '#15803d' },
  'чемпионат': { bg: 'rgba(239,68,68,0.15)', text: '#b91c1c' },
  'мастер-класс': { bg: 'rgba(168,85,247,0.15)', text: '#7c3aed' },
  'встреча': { bg: 'rgba(59,130,246,0.15)', text: '#1d4ed8' },
  'обучение': { bg: 'rgba(249,115,22,0.15)', text: '#c2410c' }
};

function getCategoryStyle(label?: string, isDark: boolean = false) {
  const colors = categoryColors[label?.toLowerCase() ?? ''];
  if (colors) return colors;
  return isDark
    ? { bg: 'var(--accent)', text: 'var(--accent-contrast)' }
    : { bg: 'var(--accent-soft)', text: 'var(--accent)' };
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

function dayLabel(dateIso?: string) {
  if (!dateIso) return '';
  const v = new Date(dateIso);
  return Number.isFinite(v.getTime()) ? v.toLocaleDateString('ru-RU', { day: '2-digit' }) : '';
}

function monthLabel(dateIso?: string) {
  if (!dateIso) return '';
  const v = new Date(dateIso);
  return Number.isFinite(v.getTime()) ? v.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '') : '';
}

function weekdayLabel(dateIso?: string) {
  if (!dateIso) return '';
  const v = new Date(dateIso);
  return Number.isFinite(v.getTime()) ? v.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', '') : '';
}

function getMetaValue(item: PublishedContentItem, label: string) {
  return item.metaGroups?.find((g) => g.label === label)?.value;
}

function FeaturedDateBlock({ dateIso }: { dateIso?: string }) {
  const day = dayLabel(dateIso);
  const month = monthLabel(dateIso);
  const weekday = weekdayLabel(dateIso);
  if (!day) return null;
  return (
    <div className="shrink-0 text-center">
      <span className={`${displayFont.className} block text-[3.2rem] font-bold leading-none text-[var(--accent)] md:text-[4rem]`}>{day}</span>
      <span className="mt-1 block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">{month}</span>
      <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--muted)]">{weekday}</span>
    </div>
  );
}

function CompactDateBlock({ dateIso }: { dateIso?: string }) {
  const day = dayLabel(dateIso);
  const month = monthLabel(dateIso);
  const weekday = weekdayLabel(dateIso);
  if (!day) return null;
  return (
    <div className="shrink-0 text-left">
      <span className={`${displayFont.className} block text-[1.6rem] font-bold leading-none text-[var(--accent)]`}>{day}</span>
      <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">{month}</span>
      <span className="block text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">{weekday}</span>
    </div>
  );
}

function FeaturedEventCard({ item }: { item: PublishedContentItem }) {
  const location = getMetaValue(item, 'Место');
  const timeRange = getMetaValue(item, 'Время');
  const isPast = item.dateIso ? new Date(item.dateIso).getTime() < Date.now() : false;
  const catStyle = getCategoryStyle(item.label, true);

  return (
    <article className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--editorial-dark-surface)]">
      <div className="grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
        <div className="flex flex-col gap-5 p-6 md:p-8">
          <div className="flex items-start gap-5">
            <FeaturedDateBlock dateIso={item.dateIso} />
            <div className="min-w-0">
              <span
                className="inline-flex items-center rounded-[var(--radius-sm)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em]"
                style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
              >
                {item.label ?? 'Событие'}
              </span>
              <h2 className={`${displayFont.className} mt-3 text-[1.7rem] font-semibold leading-[1.05] text-[var(--editorial-dark-text)] md:text-[2.2rem]`}>
                {item.title}
              </h2>
              <div className="mt-3 flex flex-col gap-1.5">
                {location ? (
                  <div className="flex items-center gap-2 text-[13px] text-[var(--editorial-dark-muted)]">
                    <MapPin size={13} strokeWidth={2} />
                    <span>{location}</span>
                  </div>
                ) : null}
                {timeRange ? (
                  <div className="flex items-center gap-2 text-[13px] text-[var(--editorial-dark-muted)]">
                    <Clock size={13} strokeWidth={2} />
                    <span>{timeRange}</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {item.summary ? (
            <p className="max-w-lg text-[15px] leading-7 text-[var(--editorial-dark-muted)]">
              {item.summary}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-4">
            {isPast ? (
              <Button disabled href={`/events/${item.slug}`} variant="secondary">
                Событие прошло
              </Button>
            ) : (
              <Button href={`/events/${item.slug}#event-request`}>
                Зарегистрироваться
              </Button>
            )}
            <AppLink
              className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--accent)] transition-opacity hover:opacity-80"
              href={`/events/${item.slug}`}
            >
              Подробнее <ArrowUpRight size={14} strokeWidth={2} />
            </AppLink>
          </div>

          {item.statusLabel ? (
            <span className="text-[13px] text-[var(--editorial-dark-muted)] -mt-2">
              {item.statusLabel}
            </span>
          ) : null}
        </div>

        {item.imageUrl ? (
          <div className="relative hidden min-h-[240px] md:block">
            <img
              alt={item.title}
              className="absolute inset-0 h-full w-full object-cover"
              src={item.imageUrl}
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

function CompactEventCard({ item }: { item: PublishedContentItem }) {
  const location = getMetaValue(item, 'Место');
  const timeRange = getMetaValue(item, 'Время');
  const isPast = item.dateIso ? new Date(item.dateIso).getTime() < Date.now() : false;
  const catStyle = getCategoryStyle(item.label, false);

  return (
    <article className={cn('public-card-shell flex flex-col overflow-hidden', isPast && 'opacity-70')}>
      <div className="flex items-start justify-between gap-2 border-b border-[var(--line)] p-3">
        <CompactDateBlock dateIso={item.dateIso} />
        {item.imageUrl ? (
          <img
            alt=""
            className="h-14 w-20 shrink-0 rounded-[var(--radius-sm)] object-cover"
            src={item.imageUrl}
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <span
          className="inline-flex w-fit items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]"
          style={{ backgroundColor: catStyle.bg, color: catStyle.text }}
        >
          {item.label ?? 'Событие'}
        </span>

        <h3 className={`${displayFont.className} line-clamp-2 text-[1.05rem] font-semibold leading-[1.2] text-[var(--text)]`}>
          {item.title}
        </h3>

        <div className="flex flex-col gap-1 text-[12px] text-[var(--muted)]">
          {location ? (
            <div className="flex items-center gap-1.5">
              <MapPin size={11} strokeWidth={2} />
              <span className="truncate">{location}</span>
            </div>
          ) : null}
          {timeRange ? (
            <div className="flex items-center gap-1.5">
              <Clock size={11} strokeWidth={2} />
              <span className="truncate">{timeRange}</span>
            </div>
          ) : null}
        </div>

        {item.summary ? (
          <p className="line-clamp-2 text-[12px] leading-[1.55] text-[var(--muted)]">{item.summary}</p>
        ) : null}

        <div className="mt-auto pt-2">
          <AppLink
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
            href={`/events/${item.slug}`}
          >
            {isPast ? 'Архив' : 'Подробнее'} <ArrowUpRight size={12} strokeWidth={2} />
          </AppLink>
        </div>
      </div>
    </article>
  );
}

export function EventAgendaSection({ content }: { content: PublishedContentList }) {
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
                    href="/contacts?topic=event#contact-form"
                  >
                    Хотите провести своё? <ArrowUpRight size={14} strokeWidth={1.8} />
                  </AppLink>
                </div>
              </div>
            ) : (
              <div className="min-w-0 py-6">
                <h3 className="text-xl font-semibold leading-7">
                  {isPastArchive && !hasActiveEventFilters
                    ? 'Архив событий пока пуст'
                    : 'По этим параметрам ничего не найдено'}
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  {isPastArchive && !hasActiveEventFilters
                    ? 'Прошедшие встречи появятся здесь после публикации архива.'
                    : 'Измените параметры поиска или сбросьте фильтры выше.'}
                </p>
                <Button className="mt-5" href="/events" variant="secondary">
                  Сбросить фильтры
                </Button>
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
