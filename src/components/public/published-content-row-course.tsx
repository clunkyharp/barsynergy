import { ArrowUpRight, Clock, MapPin, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AppLink } from '@/components/ui/app-link';
import { MetaChip } from '@/components/ui/meta-chip';
import { displayFont } from '@/lib/fonts';
import type { PublishedContentItem } from '@/lib/public/content';
import { metaGroupValue } from './published-content-section-builders';

function courseMetaChips(item: PublishedContentItem) {
  const format = metaGroupValue(item, 'Формат');
  const level = metaGroupValue(item, 'Уровень');
  const duration = metaGroupValue(item, 'Длительность');

  return (
    <div className="flex flex-wrap gap-2">
      {duration ? (
        <MetaChip variant="filter" className="border-[var(--border-default)] bg-transparent text-[var(--text)]">
          <Clock aria-hidden="true" size={13} strokeWidth={1.8} className="mr-1 inline-block text-[var(--accent)]" />
          {duration}
        </MetaChip>
      ) : null}
      {level ? (
        <MetaChip variant="filter" className="border-[var(--border-default)] bg-transparent text-[var(--text)]">
          <Crosshair aria-hidden="true" size={13} strokeWidth={1.8} className="mr-1 inline-block text-[var(--accent)]" />
          {level}
        </MetaChip>
      ) : null}
      {format ? (
        <MetaChip variant="filter" className="border-[var(--border-default)] bg-transparent text-[var(--text)]">
          <MapPin aria-hidden="true" size={13} strokeWidth={1.8} className="mr-1 inline-block text-[var(--accent)]" />
          {format}
        </MetaChip>
      ) : null}
    </div>
  );
}

export function CourseListRow({
  item,
  basePath,
  actionLabel = 'Записаться'
}: {
  item: PublishedContentItem;
  basePath: string;
  actionLabel?: string;
}) {
  return (
    <article className="public-list-row-shell md:px-4">
      <AppLink
        className="group grid gap-3 rounded-[var(--radius-xl)] py-4 transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:ring-inset motion-reduce:transition-none md:gap-5 md:grid-cols-[0.26fr_0.52fr_0.72fr] px-0"
        href={`${basePath}/${item.slug}`}
      >
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">{item.label ?? 'Программа'}</p>
          {item.imageUrl ? (
            <div className="mt-4 hidden md:block">
              <div
                aria-hidden="true"
                className="aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-cover bg-center transition-transform duration-[var(--motion-duration-media)] ease-[var(--motion-ease-move)] group-hover:scale-[1.02] motion-reduce:transition-none"
                style={{ backgroundImage: `url("${item.imageUrl}")` }}
              />
            </div>
          ) : null}
        </div>
        <div className="min-w-0">
          <h3 className={`${displayFont.className} text-[1.45rem] font-semibold leading-none transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] group-hover:text-[var(--accent)] motion-reduce:transition-none md:text-2xl`}>
            {item.title}
          </h3>
          {item.subtitle ? <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.subtitle}</p> : null}
          {courseMetaChips(item) ? <div className="mt-3">{courseMetaChips(item)}</div> : null}
        </div>
        <div className="flex min-w-0 flex-col justify-between gap-3 md:gap-4">
          <div className="hidden max-w-2xl text-sm leading-7 text-[var(--muted)] sm:block">{item.summary}</div>
          <Button
            className="rounded-[var(--radius-md)] px-5 tracking-normal"
            href={`${basePath}/${item.slug}#course-request`}
            size="sm"
            variant="primary"
          >
            {actionLabel}
            <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.8} />
          </Button>
        </div>
      </AppLink>
    </article>
  );
}
