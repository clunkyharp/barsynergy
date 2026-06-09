import { ArrowUpRight, BarChart2, Clock, Monitor, User } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { Button } from '@/components/ui/button';
import { displayFont } from '@/lib/fonts';
import type { PublishedContentItem } from '@/lib/public/content';
import { cn } from '@/lib/utils';
import { metaGroupValue } from './published-content-section-builders';

export function CourseGridCard({
  item,
  basePath,
  isFeatured = false,
  actionLabel = 'Подробнее'
}: {
  item: PublishedContentItem;
  basePath: string;
  isFeatured?: boolean;
  actionLabel?: string;
}) {
  const href = `${basePath}/${item.slug}`;
  const instructor = metaGroupValue(item, 'Преподаватель');
  const duration = metaGroupValue(item, 'Длительность');
  const level = metaGroupValue(item, 'Уровень');
  const format = metaGroupValue(item, 'Формат');
  const price = metaGroupValue(item, 'Стоимость');

  return (
    <article className="group flex flex-col overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-card)] transition-shadow duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:shadow-[var(--shadow-card)] motion-reduce:transition-none">
      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--surface-muted)]">
        {item.imageUrl ? (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
            style={{ backgroundImage: `url("${item.imageUrl}")` }}
          />
        ) : null}
        {isFeatured ? (
          <span className="absolute left-3 top-3 rounded-[var(--radius-sm)] bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-black">
            Рекомендуем
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4 md:p-5">
        {item.label ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
            {item.label}
          </p>
        ) : null}

        <AppLink
          className={cn(
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2',
            item.label ? 'mt-1.5' : 'mt-0'
          )}
          href={href}
        >
          <h3
            className={cn(
              displayFont.className,
              'line-clamp-3 text-[1.1rem] font-semibold leading-[1.2] text-[var(--text)] transition-colors duration-[var(--motion-duration-base)] group-hover:text-[var(--accent)] motion-reduce:transition-none md:text-[1.2rem]'
            )}
          >
            {item.title}
          </h3>
        </AppLink>

        {item.summary ? (
          <p className="mt-2 line-clamp-2 text-[13px] leading-5 text-[var(--muted)]">
            {item.summary}
          </p>
        ) : null}

        {(instructor || duration || level || format) ? (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-[var(--muted)]">
            {instructor ? (
              <span className="flex items-center gap-1">
                <User aria-hidden="true" className="shrink-0 text-[var(--accent)]" size={12} />
                {instructor}
              </span>
            ) : null}
            {duration ? (
              <span className="flex items-center gap-1">
                <Clock aria-hidden="true" className="shrink-0 text-[var(--accent)]" size={12} />
                {duration}
              </span>
            ) : null}
            {level ? (
              <span className="flex items-center gap-1">
                <BarChart2 aria-hidden="true" className="shrink-0 text-[var(--accent)]" size={12} />
                {level}
              </span>
            ) : null}
            {format ? (
              <span className="flex items-center gap-1">
                <Monitor aria-hidden="true" className="shrink-0 text-[var(--accent)]" size={12} />
                {format}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          {price ? (
            <span className={cn(displayFont.className, 'text-[1.05rem] font-semibold text-[var(--accent)]')}>
              {price}
            </span>
          ) : (
            <span />
          )}
          <Button
            className="shrink-0 rounded-[var(--radius-md)] px-4"
            href={`${href}#course-request`}
            size="sm"
            variant="secondary"
          >
            {actionLabel}
            <ArrowUpRight aria-hidden="true" size={14} strokeWidth={1.8} />
          </Button>
        </div>
      </div>
    </article>
  );
}
