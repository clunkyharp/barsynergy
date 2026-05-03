import { notFound } from 'next/navigation';
import { EventApplicationForm } from '@/components/public/event-application-form';
import { PublicContentDetailPage } from '@/components/public/public-content-detail-page';
import { PublicRelatedContentSection } from '@/components/public/public-related-content-section';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { getPublicApplicationResult, getPublicApplicationUtm } from '@/lib/applications/public-form-helpers';
import { getPublishedEvents } from '@/lib/public/content';
import { getPublishedEventDetail } from '@/lib/public/content-details';
import { getEnv } from '@/lib/validation/env';

type EventDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function EventDetailPage({ params, searchParams }: EventDetailPageProps) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const [event, related, cities] = await Promise.all([
    getPublishedEventDetail(slug),
    getPublishedEvents({ pageSize: '4' }),
    getApplicationCityOptions()
  ]);

  if (!event) {
    notFound();
  }
  const relatedItems = related.items.filter((item) => item.slug !== slug).slice(0, 3);
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());

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
        primaryLink={{ href: '#applications', label: 'Подать заявку' }}
        secondaryLink={{ href: '/events', label: 'Вернуться в афишу' }}
        summary={event.summary}
        title={event.title}
      />
      <EventApplicationForm
        cities={cities}
        defaults={{ eventTitle: event.title }}
        enabled={applicationFormsEnabled}
        result={getPublicApplicationResult(query)}
        utm={getPublicApplicationUtm(query)}
      />
      <PublicRelatedContentSection
        basePath="/events"
        items={relatedItems}
        title="Еще события"
      />
    </>
  );
}
