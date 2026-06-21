import { DirectoryListRow } from '@/components/public/published-content-row-directory';
import { PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import type { PublishedContentItem } from '@/lib/public/content/shared';

type MasterRelatedSectionProps = {
  items: PublishedContentItem[];
  title?: string;
};

export function MasterRelatedSection({ items, title = 'Другие мастера' }: MasterRelatedSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="background-zone background-zone-graphite border-b border-[var(--line)] py-10 md:py-14">
      <div className="container">
        <PublicEyebrow tone="accent">Дальше</PublicEyebrow>
        <PublicDisplayTitle className="mt-3">{title}</PublicDisplayTitle>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <DirectoryListRow actionLabel="Смотреть профиль" basePath="/masters" item={item} key={item.id} />
          ))}
        </div>
      </div>
    </section>
  );
}
