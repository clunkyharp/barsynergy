import { ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { InlineLink } from '@/components/ui/inline-link';
import { MetaChip } from '@/components/ui/meta-chip';
import { Panel } from '@/components/ui/panel';
import type { PublishedContentItem } from '@/lib/public/content';

type PublicRelatedContentSectionProps = {
  items: PublishedContentItem[];
  basePath: string;
  eyebrow?: string;
  title?: string;
  description?: string;
};

function itemHref(basePath: string, slug: string) {
  return `${basePath}/${slug}`;
}

export function PublicRelatedContentSection({
  items,
  basePath,
  eyebrow = 'Дальше',
  title = 'Похожие материалы',
  description = 'Еще несколько записей из этого раздела, чтобы пользователь не упирался в тупик после детальной страницы.'
}: PublicRelatedContentSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-black/20 py-10 md:py-14">
      <div className="container grid gap-8 xl:grid-cols-[0.72fr_1.28fr]">
        <div>
          <PublicEyebrow>{eyebrow}</PublicEyebrow>
          <PublicDisplayTitle className="mt-4">{title}</PublicDisplayTitle>
          <PublicBodyText className="mt-5 max-w-md">{description}</PublicBodyText>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {items.map((item) => (
            <Panel className="flex h-full flex-col" key={item.id} padding="md" tone="elevated">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">
                  {item.label ?? 'Запись'}
                </p>
                <h3 className="mt-3 text-lg font-semibold uppercase leading-7">{item.title}</h3>
                <PublicBodyText className="mt-3">{item.summary}</PublicBodyText>
              </div>

              {item.meta.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.meta.slice(0, 3).map((entry) => (
                    <MetaChip key={entry} variant="filter">
                      {entry}
                    </MetaChip>
                  ))}
                </div>
              ) : null}

              <InlineLink className="mt-auto inline-flex items-center gap-2 pt-5" href={itemHref(basePath, item.slug)}>
                Открыть
                <ArrowUpRight size={16} />
              </InlineLink>
            </Panel>
          ))}
        </div>
      </div>
    </section>
  );
}
