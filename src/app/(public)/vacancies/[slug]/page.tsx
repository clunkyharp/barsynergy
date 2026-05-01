import { notFound } from 'next/navigation';
import { PublicContentDetailPage } from '@/components/public/public-content-detail-page';
import { PublicRelatedContentSection } from '@/components/public/public-related-content-section';
import { getPublishedVacancies } from '@/lib/public/content';
import { getPublishedVacancyDetail } from '@/lib/public/content-details';

type VacancyDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function VacancyDetailPage({ params }: VacancyDetailPageProps) {
  const { slug } = await params;
  const [vacancy, related] = await Promise.all([getPublishedVacancyDetail(slug), getPublishedVacancies({ pageSize: '4' })]);

  if (!vacancy) {
    notFound();
  }
  const relatedItems = related.items.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <>
      <PublicContentDetailPage
        backHref="/vacancies"
        backLabel="Ко всем вакансиям"
        body={vacancy.body}
        eyebrow="Вакансии"
        facts={vacancy.facts}
        imageUrl={vacancy.imageUrl}
        label={vacancy.label}
        meta={vacancy.meta}
        primaryLink={{ href: '/contacts', label: 'Откликнуться' }}
        secondaryLink={{ href: '/vacancies', label: 'Вернуться к списку' }}
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
