import { ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import type { PublishedContentItem } from '@/lib/public/content';

type PublicFeaturedContentProps = {
  item?: PublishedContentItem;
  basePath: string;
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
};

function itemHref(basePath: string, slug: string) {
  return `${basePath}/${slug}`;
}

export function PublicFeaturedContent({
  item,
  basePath,
  eyebrow,
  title,
  description,
  actionLabel = 'Подробнее'
}: PublicFeaturedContentProps) {
  if (!item) {
    return null;
  }

  return (
    <section className="border-b border-black/20 bg-[var(--surface)] py-10 md:py-14">
      <div className="container grid gap-8 xl:grid-cols-[0.72fr_1.28fr] xl:items-stretch">
        <div>
          <PublicEyebrow>{eyebrow}</PublicEyebrow>
          <PublicDisplayTitle className="mt-4">{title}</PublicDisplayTitle>
          <PublicBodyText className="mt-5 max-w-md">{description}</PublicBodyText>
        </div>

        <Panel className="grid gap-0 overflow-hidden p-0 md:grid-cols-[0.72fr_1.28fr]" padding="md" tone="elevated">
          {item.imageUrl ? (
            <div
              aria-hidden="true"
              className="min-h-[260px] border-b border-black/10 bg-cover bg-center md:min-h-full md:border-b-0 md:border-r"
              style={{ backgroundImage: `url("${item.imageUrl}")` }}
            />
          ) : (
            <div className="min-h-[220px] border-b border-black/10 bg-[linear-gradient(135deg,var(--surface-muted),white)] md:min-h-full md:border-b-0 md:border-r" />
          )}
          <div className="flex flex-col gap-5 p-5 md:p-7">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                {item.label ?? 'Рекомендуем'}
              </p>
              <h3 className="mt-3 text-2xl font-semibold uppercase leading-8 md:text-3xl">{item.title}</h3>
              <PublicBodyText className="mt-4 max-w-2xl">{item.summary}</PublicBodyText>
            </div>

            {item.meta.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {item.meta.slice(0, 5).map((entry) => (
                  <MetaChip key={entry} variant="filter">
                    {entry}
                  </MetaChip>
                ))}
              </div>
            ) : null}

            <div className="mt-auto">
              <Button className="rounded-full px-6" href={itemHref(basePath, item.slug)}>
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
