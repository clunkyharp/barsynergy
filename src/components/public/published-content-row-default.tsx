import { ArrowUpRight } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { MetaChip } from '@/components/ui/meta-chip';
import { displayFont } from '@/lib/fonts';
import type { PublishedContentItem } from '@/lib/public/content';

function defaultLabel(item: PublishedContentItem) {
  return <p className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent)]">{item.label ?? 'Материал'}</p>;
}

function defaultMeta(item: PublishedContentItem) {
  if (item.meta.length === 0) {
    return null;
  }
  return (
    <div className="mt-1 flex flex-wrap gap-2">
      {item.meta.map((entry) => (
        <MetaChip key={entry} variant="filter">
          {entry}
        </MetaChip>
      ))}
    </div>
  );
}

function defaultDescription(item: PublishedContentItem) {
  return item.summary;
}

export function DefaultListRow({ item, href, actionLabel = 'Подробнее' }: { item: PublishedContentItem; href: string; actionLabel?: string }) {
  return (
    <article className="public-list-row-shell md:px-4">
      <AppLink
        className="group grid gap-3 rounded-[var(--radius-xl)] py-4 transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:ring-inset motion-reduce:transition-none md:gap-5 md:py-7 md:grid-cols-[0.26fr_0.52fr_0.72fr] px-0"
        href={href}
      >
        <div className="min-w-0">
          <div>{defaultLabel(item)}</div>
          {item.imageUrl ? (
            <div className="mt-4 hidden md:block">
              <div
                aria-hidden="true"
                className="gpu aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-cover bg-center transition-transform duration-[var(--motion-duration-media)] ease-[var(--motion-ease-move)] group-hover:scale-[1.02] motion-reduce:transition-none"
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
          {defaultMeta(item) ? <div className="mt-3">{defaultMeta(item)}</div> : null}
        </div>
        <div className="flex min-w-0 flex-col justify-between gap-3 md:gap-4">
          <div className="hidden max-w-2xl text-sm leading-7 text-[var(--muted)] sm:block">{defaultDescription(item)}</div>
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
            <span>{actionLabel}</span>
            <ArrowUpRight className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] group-hover:translate-x-1 motion-reduce:transition-none" size={16} />
          </div>
        </div>
      </AppLink>
    </article>
  );
}
