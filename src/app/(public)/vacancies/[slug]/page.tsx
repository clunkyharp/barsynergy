import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PublicContentDetailPage } from '@/components/public/public-content-detail-page';
import { PublicRelatedContentSection } from '@/components/public/public-related-content-section';
import { ToggleSavedVacancyButton } from '@/components/public/toggle-saved-vacancy-button';
import { VacancyResponseDialog } from '@/components/public/vacancy-application-forms';
import { JsonLd } from '@/components/seo/json-ld';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { getPublicApplicationUtm } from '@/lib/applications/public-form-helpers';
import { getCurrentUser } from '@/lib/auth/current-user';
import { prisma } from '@/lib/db/prisma';
import { getPublishedVacancies } from '@/lib/public/content';
import { getPublishedVacancyDetail } from '@/lib/public/content-details';
import { getVacancyApplicationFormOptions } from '@/lib/public/content/vacancies';
import { buildMissingPublicContentMetadata, buildPublicContentMetadata } from '@/lib/public/metadata';
import { buildBreadcrumbJsonLd, buildPublicContentJsonLd } from '@/lib/public/structured-data';
import { getEnv } from '@/lib/validation/env';

type VacancyDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
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

export default async function VacancyDetailPage({ params, searchParams }: VacancyDetailPageProps) {
  const { slug } = await params;

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
    const [userWithProfile, savedVacancy] = await Promise.all([
      prisma.user.findUnique({
        where: { id: currentUser.id },
        select: {
          email: true,
          profile: {
            select: { fullName: true, cityId: true, phone: true, telegram: true }
          }
        }
      }),
      prisma.savedVacancy.findUnique({
        where: { userId_vacancyId: { userId: currentUser.id, vacancyId: vacancy.id } },
        select: { id: true }
      })
    ]);

    if (userWithProfile) {
      profilePrefill = {
        fullName: userWithProfile.profile?.fullName ?? undefined,
        cityId: userWithProfile.profile?.cityId ?? undefined,
        email: userWithProfile.email,
        phone: userWithProfile.profile?.phone ?? undefined,
        telegram: userWithProfile.profile?.telegram ?? undefined
      };
    }

    isSaved = Boolean(savedVacancy);
  }

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
        sections={vacancy.sections}
        summary={vacancy.summary}
        title={vacancy.title}
        actionsSlot={
          <VacancyResponseDialog
            enabled={formsEnabled}
            options={options}
            profile={profilePrefill}
            selectedVacancy={{
              id: vacancy.id,
              slug: vacancy.slug,
              title: vacancy.title,
              companyName: vacancy.companyName ?? '',
              cityName: vacancy.cityName
            }}
            utm={getPublicApplicationUtm(sp)}
          />
        }
        actionsBottomSlot={
          currentUser && (
            <ToggleSavedVacancyButton vacancyId={vacancy.id} initialSaved={isSaved} />
          )
        }
      />
      <PublicRelatedContentSection
        basePath="/vacancies"
        items={relatedItems}
        title="Другие вакансии"
      />
    </>
  );
}
