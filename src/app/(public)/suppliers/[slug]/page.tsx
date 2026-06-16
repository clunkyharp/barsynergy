import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SupplierDetailBody } from '@/components/public/supplier-detail-body';
import { SupplierDetailHero } from '@/components/public/supplier-detail-hero';
import { SupplierRelatedSection } from '@/components/public/supplier-related-section';
import { JsonLd } from '@/components/seo/json-ld';
import { SupplierInquiryForm } from '@/components/messaging/supplier-inquiry-form';
import { getPublishedSuppliers } from '@/lib/public/content';
import { getPublishedSupplierDetail } from '@/lib/public/content';
import { buildMissingPublicContentMetadata, buildPublicContentMetadata } from '@/lib/public/metadata';
import { buildBreadcrumbJsonLd, buildPublicContentJsonLd } from '@/lib/public/structured-data';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { getPublicApplicationUtm } from '@/lib/applications/public-form-helpers';
import { submitSupplierInquiryFormAction } from '@/lib/messaging/supplier-inquiry-action';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getEnv } from '@/lib/validation/env';

type SupplierDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: SupplierDetailPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const supplier = await getPublishedSupplierDetail(slug);

  if (!supplier) {
    return buildMissingPublicContentMetadata({
      title: 'Поставщик не найден',
      description: 'Поставщик удалён или ещё не опубликован.'
    });
  }

  return buildPublicContentMetadata({
    detail: supplier,
    path: `/suppliers/${supplier.slug}`
  });
}

export default async function SupplierDetailPage({ params, searchParams }: SupplierDetailPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const [supplier, related] = await Promise.all([getPublishedSupplierDetail(slug), getPublishedSuppliers({ pageSize: '4' })]);

  if (!supplier) {
    notFound();
  }

  const sp = (await searchParams) ?? {};
  const detailPath = `/suppliers/${supplier.slug}`;
  const relatedItems = related.items.filter((item) => item.slug !== slug).slice(0, 3);
  const env = getEnv();
  const formsEnabled = arePublicApplicationFormsEnabled(env);

  const currentUser = await getCurrentUser();
  const isAuthenticated = currentUser?.role === 'USER';
  const profile = currentUser ? {
    fullName: currentUser.profile?.fullName ?? undefined,
    email: currentUser.email ?? undefined
  } : undefined;

  const isVerified = supplier.isVerified ?? false;
  const serviceArea = supplier.facts.find((f) => f.label === 'География')?.value;
  const contactLabel = supplier.facts.find((f) => f.label === 'Контакты')?.value;
  const contactTelegram = supplier.contactTelegram;
  const contactPhone = supplier.contactPhone;
  const contactWhatsapp = supplier.contactWhatsapp;

  const showUserActions = !currentUser || currentUser.role === 'USER';

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
      <SupplierDetailHero
        cityName={supplier.cityName}
        companyName={supplier.companyName}
        contactLabel={contactLabel}
        contactTelegram={contactTelegram}
        contactPhone={contactPhone}
        contactWhatsapp={contactWhatsapp}
        externalUrl={supplier.externalUrl}
        externalUrlLabel={supplier.externalUrlLabel}
        image={supplier.imageUrl}
        isVerified={isVerified}
        label={supplier.label}
        serviceArea={serviceArea}
        summary={supplier.summary}
        title={supplier.title}
      />
      <SupplierDetailBody
        body={supplier.body}
        contactRail={
          showUserActions ? (
            <SupplierInquiryForm
              enabled={formsEnabled}
              isAuthenticated={isAuthenticated}
              profile={profile}
              supplierId={supplier.id}
              supplierTitle={supplier.title}
              supplierSlug={supplier.slug}
              utm={getPublicApplicationUtm(sp)}
              submitAction={submitSupplierInquiryFormAction}
            />
          ) : null
        }
        facts={supplier.facts}
      />
      <SupplierRelatedSection items={relatedItems} />
    </>
  );
}
