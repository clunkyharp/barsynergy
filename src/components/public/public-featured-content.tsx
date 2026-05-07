import { ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
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
  title,
  description,
  actionLabel = 'Открыть запись'
}: PublicFeaturedContentProps) {
  if (!item) {
    return null;
  }

  return (
    <section className="border-b border-[var(--line)] bg-[var(--surface)] py-8 md:py-14">
      <div className="container grid gap-6 md:gap-8 xl:grid-cols-[0.72fr_1.28fr] xl:items-stretch">
        <div>
          <PublicEyebrow>{eyebrow}</PublicEyebrow>
          <PublicDisplayTitle className="mt-4">{title}</PublicDisplayTitle>
          {description ? <PublicBodyText className="mt-5 max-w-md">{description}</PublicBodyText> : null}
        </div>

        <Panel className="grid gap-0 overflow-hidden p-0 md:grid-cols-[0.72fr_1.28fr]" padding="md" tone="elevated">
          {item.imageUrl ? (
            <div
              aria-hidden="true"
              className="min-h-[128px] border-b border-[var(--line)] bg-cover bg-center md:min-h-full md:border-b-0 md:border-r"
              style={{ backgroundImage: `url("${item.imageUrl}")` }}
            />
          ) : (
            <div className="min-h-[112px] border-b border-[var(--line)] bg-[linear-gradient(135deg,var(--surface-muted),var(--surface-wash))] md:min-h-full md:border-b-0 md:border-r" />
          )}
          <div className="flex flex-col gap-4 p-4 md:gap-5 md:p-7">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                {item.label ?? 'Рекомендуем'}
              </p>
              <h3 className={`${displayFont.className} mt-2 text-[1.55rem] font-semibold leading-none md:mt-3 md:text-[2.6rem]`}>{item.title}</h3>
              <PublicBodyText className="mt-3 max-w-2xl leading-6 md:mt-4 md:leading-7">{item.summary}</PublicBodyText>
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
              <Button className="rounded-[var(--radius-md)] px-6" href={itemHref(basePath, item.slug)}>
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
