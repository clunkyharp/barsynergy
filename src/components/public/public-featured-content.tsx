import { ArrowUpRight } from 'lucide-react';
import { PublicBodyText } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import { displayFont } from '@/lib/fonts';
import type { PublishedContentItem } from '@/lib/public/content';

type PublicFeaturedContentProps = {
  item?: PublishedContentItem;
  basePath: string;
  eyebrow: string;
  title: string;
  description?: string;
  actionLabel?: string;
};

function itemHref(basePath: string, slug: string) {
  return `${basePath}/${slug}`;
}

export function PublicFeaturedContent({
  item,
  basePath,
  eyebrow,
  description,
  actionLabel = 'Подробнее'
}: PublicFeaturedContentProps) {
  if (!item) {
    return null;
  }

  return (
    <section className="border-b border-[var(--line)] bg-[var(--surface)] py-8 md:py-14">
      <div className="container">
        <Panel
          className={item.imageUrl ? 'grid gap-0 overflow-hidden p-0 md:grid-cols-[minmax(14rem,0.4fr)_minmax(0,0.6fr)]' : 'overflow-hidden p-0'}
          padding="md"
          tone="elevated"
        >
          {item.imageUrl ? (
            <div
              aria-hidden="true"
              className="min-h-[156px] border-b border-[var(--line)] bg-cover bg-center md:min-h-full md:border-b-0 md:border-r"
              style={{ backgroundImage: `url("${item.imageUrl}")` }}
            />
          ) : null}
          <div className="flex flex-col gap-4 p-4 md:gap-5 md:p-7">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-[var(--radius-sm)] border border-[var(--accent)]/22 bg-[var(--accent-soft)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">
                  {eyebrow}
                </span>
                {item.label ? (
                  <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">
                    {item.label}
                  </span>
                ) : null}
              </div>
              <h3 className={`${displayFont.className} mt-2 text-[1.55rem] font-semibold leading-none md:mt-3 md:text-[2.6rem]`}>{item.title}</h3>
              <PublicBodyText className="mt-3 max-w-2xl leading-6 md:mt-4 md:leading-7">{description ?? item.summary}</PublicBodyText>
            </div>

            {item.meta.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {item.meta.filter((entry) => !/редакция/i.test(entry)).slice(0, 2).map((entry) => (
                  <MetaChip key={entry} variant="filter">
                    {entry}
                  </MetaChip>
                ))}
              </div>
            ) : null}

            <div>
              <Button className="rounded-[var(--radius-md)] px-0" href={itemHref(basePath, item.slug)} variant="link">
                {actionLabel}
                <ArrowUpRight size={18} />
              </Button>
            </div>
          </div>
        </Panel>
      </div>
    </section>
  );
}
