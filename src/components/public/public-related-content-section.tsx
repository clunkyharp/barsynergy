import { ArrowUpRight } from 'lucide-react';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { InlineLink } from '@/components/ui/inline-link';
import { MetaChip } from '@/components/ui/meta-chip';
import { displayFont } from '@/lib/fonts';
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

function relatedActionLabel(basePath: string) {
  if (basePath === '/articles') {
    return 'Читать материал';
  }

  if (basePath === '/events') {
    return 'Подробнее о событии';
  }

  if (basePath === '/vacancies') {
    return 'Смотреть вакансию';
  }

  if (basePath === '/suppliers') {
    return 'Смотреть профиль';
  }

  if (basePath === '/education') {
    return 'Смотреть программу';
  }

  if (basePath === '/partners') {
    return 'Смотреть партнёра';
  }

  return 'Подробнее';
}

export function PublicRelatedContentSection({
  items,
  basePath,
  eyebrow = 'Дальше',
  title = 'Похожие материалы',
  description
}: PublicRelatedContentSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-[var(--line)] py-10 md:py-14">
      <div className="container grid gap-8 xl:grid-cols-[0.58fr_1.42fr]">
        <div>
          <PublicEyebrow>{eyebrow}</PublicEyebrow>
          <PublicDisplayTitle className="mt-4">{title}</PublicDisplayTitle>
          {description ? <PublicBodyText className="mt-5 max-w-md">{description}</PublicBodyText> : null}
        </div>

        <div>
          {items.map((item, index) => (
            <article className="grid gap-4 border-b border-[var(--line)] py-5 last:border-b-0 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-start md:gap-6" key={item.id}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                {index + 1}
              </p>

              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  <MetaChip variant="selected">{item.label ?? 'Материал'}</MetaChip>
                  {item.meta.slice(0, 2).map((entry) => (
                    <MetaChip key={entry} variant="filter">
                      {entry}
                    </MetaChip>
                  ))}
                </div>
                <h3 className={`${displayFont.className} mt-3 text-[1.65rem] font-semibold leading-none tracking-normal text-[var(--text)] md:text-[2rem]`}>
                  {item.title}
                </h3>
                <PublicBodyText className="mt-3 max-w-2xl text-[var(--muted)]">{item.summary}</PublicBodyText>
              </div>

              <InlineLink className="inline-flex items-center gap-2 md:mt-1 md:self-start" href={itemHref(basePath, item.slug)}>
                {relatedActionLabel(basePath)}
                <ArrowUpRight size={16} />
              </InlineLink>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
