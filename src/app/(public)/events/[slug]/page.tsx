import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EventApplicationForm } from '@/components/public/event-application-form';
import { submitEventApplication } from '@/app/(public)/events/actions';
import { PublicContentDetailPage } from '@/components/public/public-content-detail-page';
import { PublicRelatedContentSection } from '@/components/public/public-related-content-section';
import { JsonLd } from '@/components/seo/json-ld';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { getPublicApplicationUtm } from '@/lib/applications/public-form-helpers';
import { getPublishedEvents } from '@/lib/public/content';
import { getPublishedEventDetail } from '@/lib/public/content';
import { buildMissingPublicContentMetadata, buildPublicContentMetadata } from '@/lib/public/metadata';
import { buildBreadcrumbJsonLd, buildPublicContentJsonLd } from '@/lib/public/structured-data';
import { getEnv } from '@/lib/validation/env';

type EventDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const event = await getPublishedEventDetail(slug);

  if (!event) {
    return buildMissingPublicContentMetadata({
      title: 'Событие не найдено',
      description: 'Событие удалено или ещё не опубликовано.'
    });
  }

  return buildPublicContentMetadata({
    detail: event,
    path: `/events/${event.slug}`
  });
}

export default async function EventDetailPage({ params, searchParams }: EventDetailPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const query = (await searchParams) ?? {};
  const [event, related, cities] = await Promise.all([
    getPublishedEventDetail(slug),
    getPublishedEvents({ pageSize: '4', period: 'upcoming' }),
    getApplicationCityOptions()
  ]);

  if (!event) {
    notFound();
  }
  const detailPath = `/events/${event.slug}`;
  const eventStart = event.startsAtIso ? new Date(event.startsAtIso) : undefined;
  const isPastEvent = eventStart ? Number.isFinite(eventStart.getTime()) && eventStart.getTime() < Date.now() : false;
  const relatedItems = related.items.filter((item) => item.slug !== slug).slice(0, 3);
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: 'Главная', path: '/' },
            { name: 'События', path: '/events' },
            { name: event.title, path: detailPath }
          ]),
          buildPublicContentJsonLd({ detail: event, path: detailPath, kind: 'event' })
        ]}
      />
      <PublicContentDetailPage
        backHref="/events"
        backLabel="Ко всем событиям"
        eyebrow="События"
        facts={event.facts}
        imageUrl={event.imageUrl}
        label={event.label}
        meta={event.meta}
        primaryLink={
          isPastEvent
            ? { href: '/events', label: 'Смотреть другие события' }
            : event.externalUrl
              ? { href: event.externalUrl, label: event.externalUrlLabel ?? 'Записаться', external: true }
              : { href: '/contacts#contact-form', label: 'Записаться' }
        }
        secondaryLink={{ href: '/events', label: 'Вернуться в афишу' }}
        sections={event.sections}
        summary={event.summary}
        title={event.title}
      />
      {isPastEvent ? null : (
        <EventApplicationForm
          cities={cities}
          defaults={{ eventTitle: event.title }}
          enabled={applicationFormsEnabled}
          utm={getPublicApplicationUtm(query)}
          action={submitEventApplication}
        />
      )}
      <PublicRelatedContentSection
        basePath="/events"
        items={relatedItems}
        title="Еще события"
      />
    </>
  );
}
