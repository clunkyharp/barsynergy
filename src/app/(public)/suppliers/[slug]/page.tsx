import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { PublicContentDetailPage } from '@/components/public/public-content-detail-page';
import { PublicRelatedContentSection } from '@/components/public/public-related-content-section';
import { JsonLd } from '@/components/seo/json-ld';
import { SupplierInquiryForm } from '@/components/messaging/supplier-inquiry-form';
import { getPublishedSuppliers } from '@/lib/public/content';
import { getPublishedSupplierDetail } from '@/lib/public/content';
import { buildMissingPublicContentMetadata, buildPublicContentMetadata } from '@/lib/public/metadata';
import { buildBreadcrumbJsonLd, buildPublicContentJsonLd } from '@/lib/public/structured-data';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { getPublicApplicationResult, getPublicApplicationUtm } from '@/lib/applications/public-form-helpers';
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
    return (
      <div className="container py-10 md:py-14">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-3xl font-bold leading-tight text-[var(--text)]">Поставщик не найден</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Поставщик удалён, ещё не опубликован или ссылка неправильная.
          </p>
          <Button className="mt-6 rounded-[var(--radius-md)]" href="/suppliers" size="lg">
            Вернуться в каталог поставщиков
          </Button>
        </div>
      </div>
    );
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
        secondaryLink={
          supplier.externalUrl && supplier.externalUrlLabel
            ? { href: supplier.externalUrl, label: supplier.externalUrlLabel, external: true }
            : { href: '/suppliers', label: 'Вернуться в каталог' }
        }
        sections={supplier.sections}
        summary={supplier.summary}
        title={supplier.title}
        actionsSlot={
          <SupplierInquiryForm
            enabled={formsEnabled}
            isAuthenticated={isAuthenticated}
            profile={profile}
            supplierId={supplier.id}
            supplierTitle={supplier.title}
            supplierSlug={supplier.slug}
            utm={getPublicApplicationUtm(sp)}
            result={getPublicApplicationResult(sp)}
          />
        }
      />
      <PublicRelatedContentSection
        basePath="/suppliers"
        items={relatedItems}
        title="Другие поставщики"
      />
    </>
  );
}
