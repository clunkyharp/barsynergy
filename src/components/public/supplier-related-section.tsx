import { DirectoryListRow } from '@/components/public/published-content-row-directory';
import { PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import type { PublishedContentItem } from '@/lib/public/content/shared';

type SupplierRelatedSectionProps = {
  items: PublishedContentItem[];
  title?: string;
};

export function SupplierRelatedSection({
  items,
  title = 'Другие поставщики'
}: SupplierRelatedSectionProps) {
  if (items.length === 0) return null;

  return (
    <section className="background-zone background-zone-graphite border-b border-[var(--line)] py-10 md:py-14">
      <div className="container">
        <PublicEyebrow tone="accent">Дальше</PublicEyebrow>
        <PublicDisplayTitle className="mt-3">{title}</PublicDisplayTitle>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <DirectoryListRow basePath="/suppliers" item={item} key={item.id} primaryActionHash="supplier-contact-rail" />
          ))}
        </div>
      </div>
    </section>
  );
}
