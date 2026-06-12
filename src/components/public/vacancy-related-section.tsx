import { EditorialCard } from '@/components/ui/cards';
import { PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import type { PublishedContentItem } from '@/lib/public/content/shared';

type VacancyRelatedSectionProps = {
  items: PublishedContentItem[];
  title?: string;
};

export function VacancyRelatedSection({
  items,
  title = 'Другие вакансии'
}: VacancyRelatedSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="background-zone background-zone-graphite border-b border-[var(--line)] py-10 md:py-14">
      <div className="container">
        <PublicEyebrow tone="accent">Дальше</PublicEyebrow>
        <PublicDisplayTitle className="mt-3">{title}</PublicDisplayTitle>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const hasImage = Boolean(item.imageUrl);
            const cityMeta = item.metaGroups?.find((g) => g.label === 'Город')?.value;
            const salaryMeta = item.metaGroups?.find((g) => g.label === 'Оплата')?.value;
            const metaParts = [item.subtitle, cityMeta, salaryMeta].filter(Boolean);

            return (
              <EditorialCard
                href={`/vacancies/${item.slug}`}
                key={item.id}
                media={hasImage ? { kind: 'image', src: item.imageUrl, alt: item.title } : undefined}
                meta={metaParts.join(' · ')}
                summary={item.summary}
                tags={item.label ? [item.label] : undefined}
                title={item.title}
                tone="dark"
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
