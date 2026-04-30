import { notFound } from 'next/navigation';
import { PublicContentDetailPage } from '@/components/public/public-content-detail-page';
import { PublicRelatedContentSection } from '@/components/public/public-related-content-section';
import { getPublishedPartners } from '@/lib/public/content';
import { getPublishedPartnerDetail } from '@/lib/public/content-details';

type PartnerDetailPageProps = {
  params: Promise<{ slug: string }>;
};

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
        backLabel="Ко всем партнерам"
        body={partner.body}
        eyebrow="Партнеры"
        facts={partner.facts}
        imageUrl={partner.imageUrl}
        label={partner.label}
        meta={partner.meta}
        primaryLink={{ href: '/contacts', label: 'Обсудить партнерство' }}
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
        description="Другие партнерские форматы помогают понять, какие варианты сотрудничества уже есть в системе."
        items={relatedItems}
        title="Другие партнеры"
      />
    </>
  );
}
