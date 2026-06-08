import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicContentDetailPage } from '@/components/public/public-content-detail-page';
import { PublicRelatedContentSection } from '@/components/public/public-related-content-section';
import { JsonLd } from '@/components/seo/json-ld';
import { getPublishedPartners } from '@/lib/public/content';
import { getPublishedPartnerDetail } from '@/lib/public/content';
import { buildMissingPublicContentMetadata, buildPublicContentMetadata } from '@/lib/public/metadata';
import { buildBreadcrumbJsonLd, buildPublicContentJsonLd } from '@/lib/public/structured-data';

type PartnerDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PartnerDetailPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const partner = await getPublishedPartnerDetail(slug);

  if (!partner) {
    return buildMissingPublicContentMetadata({
      title: 'Партнёр не найден',
      description: 'Партнёр удалён или ещё не опубликован.'
    });
  }

  return buildPublicContentMetadata({
    detail: partner,
    path: `/partners/${partner.slug}`
  });
}

function partnerContactHref(input: { title: string; companyName?: string; label?: string; externalUrl?: string }) {
  const params = new URLSearchParams({
    topic: 'partnership',
    companyName: input.companyName ?? input.title
  });

  if (input.label) {
    params.set('partnerType', input.label);
  }

  if (input.externalUrl) {
    params.set('websiteUrl', input.externalUrl);
  }

  return `/contacts?${params.toString()}#contact-form`;
}

export default async function PartnerDetailPage({ params }: PartnerDetailPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const [partner, related] = await Promise.all([getPublishedPartnerDetail(slug), getPublishedPartners({ pageSize: '4' })]);

  if (!partner) {
    notFound();
  }
  const detailPath = `/partners/${partner.slug}`;
  const relatedItems = related.items.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: 'Главная', path: '/' },
            { name: 'Партнёры', path: '/partners' },
            { name: partner.title, path: detailPath }
          ]),
          buildPublicContentJsonLd({ detail: partner, path: detailPath, kind: 'organization' })
        ]}
      />
      <PublicContentDetailPage
        backHref="/partners"
        backLabel="Ко всем партнёрам"
        body={partner.body}
        eyebrow="Партнёры"
        facts={partner.facts}
        imageUrl={partner.imageUrl}
        label={partner.label}
        meta={partner.meta}
        primaryLink={{ href: partnerContactHref(partner), label: 'Обсудить партнёрство' }}
        secondaryLink={
          partner.externalUrl && partner.externalUrlLabel
            ? { href: partner.externalUrl, label: partner.externalUrlLabel, external: true }
            : { href: '/partners', label: 'Вернуться в раздел' }
        }
        sections={partner.sections}
        summary={partner.summary}
        title={partner.title}
      />
      <PublicRelatedContentSection
        basePath="/partners"
        items={relatedItems}
        title="Другие партнёры"
      />
    </>
  );
}
