import { notFound } from 'next/navigation';
import { PublicContentDetailPage } from '@/components/public/public-content-detail-page';
import { PublicRelatedContentSection } from '@/components/public/public-related-content-section';
import { getPublishedPartners } from '@/lib/public/content';
import { getPublishedPartnerDetail } from '@/lib/public/content-details';

type PartnerDetailPageProps = {
  params: Promise<{ slug: string }>;
};

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
  const { slug } = await params;
  const [partner, related] = await Promise.all([getPublishedPartnerDetail(slug), getPublishedPartners({ pageSize: '4' })]);

  if (!partner) {
    notFound();
  }
  const relatedItems = related.items.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
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
