import { notFound } from 'next/navigation';
import { PublicContentDetailPage } from '@/components/public/public-content-detail-page';
import { PublicRelatedContentSection } from '@/components/public/public-related-content-section';
import { getPublishedSuppliers } from '@/lib/public/content';
import { getPublishedSupplierDetail } from '@/lib/public/content-details';

type SupplierDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SupplierDetailPage({ params }: SupplierDetailPageProps) {
  const { slug } = await params;
  const [supplier, related] = await Promise.all([getPublishedSupplierDetail(slug), getPublishedSuppliers({ pageSize: '4' })]);

  if (!supplier) {
    notFound();
  }
  const relatedItems = related.items.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
      <PublicContentDetailPage
        backHref="/suppliers"
        backLabel="Ко всем поставщикам"
        body={supplier.body}
        eyebrow="Поставщики"
        facts={supplier.facts}
        imageUrl={supplier.imageUrl}
        label={supplier.label}
        meta={supplier.meta}
        primaryLink={{ href: '/contacts', label: 'Связаться' }}
        secondaryLink={
          supplier.externalUrl && supplier.externalUrlLabel
            ? { href: supplier.externalUrl, label: supplier.externalUrlLabel, external: true }
            : { href: '/suppliers', label: 'Вернуться в каталог' }
        }
        summary={supplier.summary}
        title={supplier.title}
      />
      <PublicRelatedContentSection
        basePath="/suppliers"
        description="Другие поставщики помогают сравнить компании и не завершать поиск на одной карточке."
        items={relatedItems}
        title="Другие поставщики"
      />
    </>
  );
}
