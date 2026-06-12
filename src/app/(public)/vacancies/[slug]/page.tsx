import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { VacancyDetailBody } from '@/components/public/vacancy-detail-body';
import { VacancyDetailHero } from '@/components/public/vacancy-detail-hero';
import { VacancyRelatedSection } from '@/components/public/vacancy-related-section';
import { ToggleSavedVacancyButton } from '@/components/public/toggle-saved-vacancy-button';
import { VacancyResponseDialog } from '@/components/public/vacancy-application-forms';
import { submitVacancyResponseApplication } from '@/app/(public)/vacancies/actions';
import { VacancyMobileStickyBar } from '@/app/(public)/vacancies/[slug]/vacancy-detail-client';
import { JsonLd } from '@/components/seo/json-ld';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { getPublicApplicationUtm } from '@/lib/applications/public-form-helpers';
import { getCurrentUser } from '@/lib/auth/current-user';
import { getPublishedVacancies } from '@/lib/public/content';
import {
  getPublishedVacancyDetail,
  getVacancyApplicationFormOptions,
  getVacancyUserPrefill
} from '@/modules/content/vacancies/queries';
import { toggleSavedVacancy } from '@/lib/profile/saved-vacancies-actions';
import { buildMissingPublicContentMetadata, buildPublicContentMetadata } from '@/lib/public/metadata';
import { buildBreadcrumbJsonLd, buildPublicContentJsonLd } from '@/lib/public/structured-data';
import { getEnv } from '@/lib/validation/env';

type VacancyDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: VacancyDetailPageProps): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
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

export default async function VacancyDetailPage({ params, searchParams }: VacancyDetailPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const [vacancy, related] = await Promise.all([
    getPublishedVacancyDetail(slug),
    getPublishedVacancies({ pageSize: '4' })
  ]);

  if (!vacancy) {
    notFound();
  }

  const sp = (await searchParams) ?? {};
  const detailPath = `/vacancies/${vacancy.slug}`;
  const relatedItems = related.items.filter((item) => item.slug !== slug).slice(0, 3);
  const env = getEnv();
  const formsEnabled = arePublicApplicationFormsEnabled(env);

  const [options, currentUser] = await Promise.all([
    getVacancyApplicationFormOptions(),
    getCurrentUser()
  ]);

  let profilePrefill: {
    fullName?: string;
    cityId?: string;
    email?: string;
    phone?: string;
    telegram?: string;
  } | undefined;

  let isSaved = false;

  if (currentUser) {
    const result = await getVacancyUserPrefill(currentUser.id, vacancy.id);
    profilePrefill = result.profilePrefill;
    isSaved = result.isSaved;
  }

  const dialogSelectedVacancy = {
    id: vacancy.id,
    slug: vacancy.slug,
    title: vacancy.title,
    companyName: vacancy.companyName ?? '',
    cityName: vacancy.cityName
  };

  const salaryLabel = vacancy.facts.find((f) => f.label === 'Зарплата')?.value;
  const employmentTypeLabel = vacancy.facts.find((f) => f.label === 'График')?.value;
  const experienceLabel = vacancy.facts.find((f) => f.label === 'Опыт')?.value;
  const positionLabel = vacancy.facts.find((f) => f.label === 'Позиция')?.value;

  const showUserActions = !currentUser || currentUser.role === 'USER';

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
      <div className={showUserActions ? 'pb-20 xl:pb-0' : undefined}>
        <VacancyDetailHero
          cityName={vacancy.cityName}
          companyName={vacancy.companyName}
          employmentTypeLabel={employmentTypeLabel}
          experienceLabel={experienceLabel}
          image={vacancy.imageUrl}
          label={vacancy.label}
          positionLabel={positionLabel}
          salaryLabel={salaryLabel}
          summary={vacancy.summary}
          title={vacancy.title}
        />
        <VacancyDetailBody
          applyRail={
            showUserActions ? (
              <div className="space-y-4 p-5 md:p-6">
                <VacancyResponseDialog
                  enabled={formsEnabled}
                  options={options}
                  profile={profilePrefill}
                  selectedVacancy={dialogSelectedVacancy}
                  utm={getPublicApplicationUtm(sp)}
                  submitVacancyResponseApplication={submitVacancyResponseApplication}
                />
                {currentUser?.role === 'USER' ? (
                  <ToggleSavedVacancyButton
                    initialSaved={isSaved}
                    toggleAction={toggleSavedVacancy}
                    vacancyId={vacancy.id}
                  />
                ) : null}
              </div>
            ) : null
          }
          body={vacancy.body}
          facts={vacancy.facts}
        />
        {showUserActions && (
          <VacancyMobileStickyBar
            enabled={formsEnabled}
            options={options}
            profile={profilePrefill}
            selectedVacancy={dialogSelectedVacancy}
            utm={getPublicApplicationUtm(sp)}
            submitVacancyResponseApplication={submitVacancyResponseApplication}
          />
        )}
      </div>
      <VacancyRelatedSection items={relatedItems} />
    </>
  );
}
