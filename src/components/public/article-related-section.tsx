import { ArrowUpRight } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { getArticleFallbackImage } from '@/components/public/article-grid-card';
import { displayFont } from '@/lib/fonts';
import type { PublishedContentItem } from '@/lib/public/content/shared';

type ArticleRelatedSectionProps = {
  items: PublishedContentItem[];
  title?: string;
  allHref?: string;
  allLabel?: string;
};

function formatDate(dateIso?: string) {
  if (!dateIso) return undefined;
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function RelatedCard({ item }: { item: PublishedContentItem }) {
  const date = formatDate(item.dateIso);
  const imageUrl = item.imageUrl ?? getArticleFallbackImage(item.label);

  return (
    <AppLink
      className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface)] transition-[border-color,background-color] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
      href={`/articles/${item.slug}`}
    >
      <span className="relative block h-[180px] overflow-hidden bg-[var(--surface-muted)]">
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center transition-transform duration-[var(--motion-duration-media)] ease-[var(--motion-ease-move)] group-hover:scale-[1.03] motion-reduce:transition-none"
          style={{ backgroundImage: `url("${imageUrl}")` }}
        />
      </span>
      <span className="flex flex-1 flex-col p-5">
        {item.label ? (
          <span className="inline-flex items-center self-start rounded-[var(--radius-pill)] border border-[var(--border-default)] px-2.5 py-[3px] text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--muted)]">
            {item.label}
          </span>
        ) : null}
        <h3
          className={`${displayFont.className} mt-2.5 text-base font-semibold leading-[1.45] text-[var(--text)] transition-colors group-hover:text-[var(--accent)]`}
        >
          {item.title}
        </h3>
        {date ? <span className="mt-3 text-[13px] text-[var(--muted)]">{date}</span> : null}
      </span>
    </AppLink>
  );
}

export function ArticleRelatedSection({
  items,
  title = 'Читайте также',
  allHref = '/articles',
  allLabel = 'Все статьи'
}: ArticleRelatedSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="background-zone background-zone-graphite border-b border-[var(--line)] py-10 md:py-14">
      <div className="container">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <h2 className={`${displayFont.className} text-[1.6rem] font-semibold leading-none text-[var(--text)] md:text-[2rem]`}>
            {title}
          </h2>
          <AppLink
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
            href={allHref}
          >
            {allLabel}
            <ArrowUpRight size={15} strokeWidth={2} />
          </AppLink>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <RelatedCard item={item} key={item.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
