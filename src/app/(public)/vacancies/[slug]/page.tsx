import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicContentDetailPage } from '@/components/public/public-content-detail-page';
import { PublicRelatedContentSection } from '@/components/public/public-related-content-section';
import { JsonLd } from '@/components/seo/json-ld';
import { getPublishedVacancies } from '@/lib/public/content';
import { getPublishedVacancyDetail } from '@/lib/public/content-details';
import { buildMissingPublicContentMetadata, buildPublicContentMetadata } from '@/lib/public/metadata';
import { buildBreadcrumbJsonLd, buildPublicContentJsonLd } from '@/lib/public/structured-data';

type VacancyDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: VacancyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const vacancy = await getPublishedVacancyDetail(slug);

  if (!vacancy) {
    return buildMissingPublicContentMetadata({
      title: 'Вакансия не найдена',
      description: 'Вакансия удалена или еще не опубликована.'
    });
  }

  return buildPublicContentMetadata({
    detail: vacancy,
    path: `/vacancies/${vacancy.slug}`
  });
}

export default async function VacancyDetailPage({ params }: VacancyDetailPageProps) {
  const { slug } = await params;
  const [vacancy, related] = await Promise.all([
    getPublishedVacancyDetail(slug),
    getPublishedVacancies({ pageSize: '4' })
  ]);

  if (!vacancy) {
    notFound();
  }
  const detailPath = `/vacancies/${vacancy.slug}`;
  const relatedItems = related.items.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
      <JsonLd
        data={[
          buildBreadcrumbJsonLd([
            { name: 'Главная', path: '/' },
            { name: 'Вакансии', path: '/vacancies' },
            { name: vacancy.title, path: detailPath }
          ]),
          buildPublicContentJsonLd({ detail: vacancy, path: detailPath, kind: 'vacancy' })
        ]}
      />
      <PublicContentDetailPage
        backHref="/vacancies"
        backLabel="Ко всем вакансиям"
        body={vacancy.body}
        eyebrow="Вакансии"
        facts={vacancy.facts}
        imageUrl={vacancy.imageUrl}
        label={vacancy.label}
        meta={vacancy.meta}
        primaryLink={{ href: `/contacts?topic=vacancy-response&position=${encodeURIComponent(vacancy.title)}#contact-form`, label: 'Написать по вакансии' }}
        sections={vacancy.sections}
        summary={vacancy.summary}
        title={vacancy.title}
      />
      <PublicRelatedContentSection
        basePath="/vacancies"
        items={relatedItems}
        title="Другие вакансии"
      />
    </>
  );
}
