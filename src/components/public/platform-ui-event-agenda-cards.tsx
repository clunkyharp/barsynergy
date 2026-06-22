import { ArrowUpRight, Clock, MapPin } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { displayFont } from '@/lib/fonts';
import type { PublishedContentItem } from '@/lib/public/content';
import { getCategoryStyle } from '@/lib/public/event-category-styles';
import { cn } from '@/lib/utils';
import { CompactDateBlock, FeaturedDateBlock, getMetaValue } from './platform-ui-event-agenda-helpers';

export function FeaturedEventCard({ item }: { item: PublishedContentItem }) {
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
                className="inline-flex items-center rounded-[var(--radius-sm)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[var(--tracking-eyebrow-md)]"
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

export function CompactEventCard({ item }: { item: PublishedContentItem }) {
  const location = getMetaValue(item, 'Место');
  const timeRange = getMetaValue(item, 'Время');
  const isPast = item.dateIso ? new Date(item.dateIso).getTime() < Date.now() : false;
  const catStyle = getCategoryStyle(item.label, false);

  return (
    <article className={cn('public-card-shell flex h-full flex-col overflow-hidden', isPast && 'opacity-70')}>
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
          className="inline-flex w-fit items-center rounded-[var(--radius-sm)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[var(--tracking-marker)]"
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

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
          {!isPast ? (
            <Button
              className="rounded-[var(--radius-sm)] px-3 text-[12px]"
              href={`/events/${item.slug}#event-request`}
              size="sm"
            >
              Зарегистрироваться
            </Button>
          ) : null}
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
