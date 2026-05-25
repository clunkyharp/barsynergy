import { notFound } from 'next/navigation';
import { PublicContentDetailPage } from '@/components/public/public-content-detail-page';
import { PublicRelatedContentSection } from '@/components/public/public-related-content-section';
import { VacancyApplicationForms } from '@/components/public/vacancy-application-forms';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import {
  getPublicApplicationResult,
  getPublicApplicationUtm
} from '@/lib/applications/public-form-helpers';
import { getPublishedVacancies, getVacancyApplicationFormOptions, type PublicContentSearchParams } from '@/lib/public/content';
import { getPublishedVacancyDetail } from '@/lib/public/content-details';
import { getEnv } from '@/lib/validation/env';

type VacancyDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<PublicContentSearchParams>;
};

export default async function VacancyDetailPage({ params, searchParams }: VacancyDetailPageProps) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};
  const [vacancy, related, formOptions] = await Promise.all([
    getPublishedVacancyDetail(slug),
    getPublishedVacancies({ pageSize: '4' }),
    getVacancyApplicationFormOptions()
  ]);

  if (!vacancy) {
    notFound();
  }
  const relatedItems = related.items.filter((item) => item.slug !== slug).slice(0, 3);
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());
  const applicationResult = getPublicApplicationResult(query);
  const applicationUtm = getPublicApplicationUtm(query);

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
        primaryLink={{ href: '#vacancy-response', label: 'Откликнуться' }}
        secondaryLink={{ href: '/vacancies', label: 'Вернуться к списку' }}
        sections={vacancy.sections}
        summary={vacancy.summary}
        title={vacancy.title}
      />
      <VacancyApplicationForms
        enabled={applicationFormsEnabled}
        mode="detail"
        options={formOptions}
        result={applicationResult}
        selectedVacancy={{
          id: vacancy.id,
          slug: vacancy.slug,
          title: vacancy.title,
          companyName: vacancy.companyName ?? '',
          cityName: vacancy.cityName
        }}
        utm={applicationUtm}
      />
      <PublicRelatedContentSection
        basePath="/vacancies"
        items={relatedItems}
        title="Другие вакансии"
      />
    </>
  );
}
