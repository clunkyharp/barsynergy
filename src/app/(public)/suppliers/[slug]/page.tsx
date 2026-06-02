import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicContentDetailPage } from '@/components/public/public-content-detail-page';
import { PublicRelatedContentSection } from '@/components/public/public-related-content-section';
import { JsonLd } from '@/components/seo/json-ld';
import { getPublishedSuppliers } from '@/lib/public/content';
import { getPublishedSupplierDetail } from '@/lib/public/content-details';
import { buildMissingPublicContentMetadata, buildPublicContentMetadata } from '@/lib/public/metadata';
import { buildBreadcrumbJsonLd, buildPublicContentJsonLd } from '@/lib/public/structured-data';

type SupplierDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: SupplierDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const supplier = await getPublishedSupplierDetail(slug);

  if (!supplier) {
    return buildMissingPublicContentMetadata({
      title: 'Поставщик не найден',
      description: 'Поставщик удален или еще не опубликован.'
    });
  }

  return buildPublicContentMetadata({
    detail: supplier,
    path: `/suppliers/${supplier.slug}`
  });
}

function supplierContactHref(input: { title: string; companyName?: string; label?: string; externalUrl?: string }) {
  const params = new URLSearchParams({
    topic: 'supplier-contact',
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
  const detailPath = `/suppliers/${supplier.slug}`;
  const relatedItems = related.items.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: 'Главная', path: '/' },
            { name: 'Поставщики', path: '/suppliers' },
            { name: supplier.title, path: detailPath }
          ]),
          buildPublicContentJsonLd({ detail: supplier, path: detailPath, kind: 'organization' })
        ]}
      />
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
        sections={supplier.sections}
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
