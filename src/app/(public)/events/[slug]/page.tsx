import { notFound } from 'next/navigation';
import { PublicContentDetailPage } from '@/components/public/public-content-detail-page';
import { PublicRelatedContentSection } from '@/components/public/public-related-content-section';
import { getPublishedEvents } from '@/lib/public/content';
import { getPublishedEventDetail } from '@/lib/public/content-details';

type EventDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const [event, related] = await Promise.all([getPublishedEventDetail(slug), getPublishedEvents({ pageSize: '4' })]);

  if (!event) {
    notFound();
  }
  const relatedItems = related.items.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
      <PublicContentDetailPage
        backHref="/events"
        backLabel="Ко всем событиям"
        eyebrow="События"
        facts={event.facts}
        imageUrl={event.imageUrl}
        label={event.label}
        meta={event.meta}
        primaryLink={{ href: '/contacts', label: 'Подать заявку' }}
        secondaryLink={{ href: '/events', label: 'Вернуться в афишу' }}
        summary={event.summary}
        title={event.title}
      />
      <PublicRelatedContentSection
        basePath="/events"
        description="Следующие события удерживают пользователя в афише и дают альтернативу, если текущий формат не подходит."
        items={relatedItems}
        title="Еще события"
      />
    </>
  );
}
