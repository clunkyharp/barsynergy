import { notFound } from 'next/navigation';
import { PublicContentDetailPage } from '@/components/public/public-content-detail-page';
import { PublicRelatedContentSection } from '@/components/public/public-related-content-section';
import { getPublishedSuppliers } from '@/lib/public/content';
import { getPublishedSupplierDetail } from '@/lib/public/content-details';

type SupplierDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function supplierContactHref(input: { title: string; companyName?: string; label?: string; externalUrl?: string }) {
  const params = new URLSearchParams({
    topic: 'supplier',
    companyName: input.companyName ?? input.title
  });

  if (input.label) {
    params.set('supplierCategory', input.label);
  }

  if (input.externalUrl) {
    params.set('websiteUrl', input.externalUrl);
  }

  return `/contacts?${params.toString()}#contact-form`;
}

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
        primaryLink={{ href: supplierContactHref(supplier), label: 'Написать поставщику' }}
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
        items={relatedItems}
        title="Другие поставщики"
      />
    </>
  );
}
