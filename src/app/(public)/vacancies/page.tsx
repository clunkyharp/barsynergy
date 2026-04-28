import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { VacancyApplicationForms } from '@/components/public/vacancy-application-forms';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { getPublishedVacancies, getVacancyApplicationFormOptions, type PublicContentSearchParams } from '@/lib/public/content';
import { getEnv } from '@/lib/validation/env';

type VacanciesPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function stripApplicationResultParams(params: PublicContentSearchParams) {
  return Object.fromEntries(
    Object.entries(params).filter(([key]) => key !== 'applicationSuccess' && key !== 'applicationError')
  );
}

export default async function VacanciesPage({ searchParams }: VacanciesPageProps) {
  const params = (await searchParams) ?? {};
  const [content, applicationFormOptions] = await Promise.all([
    getPublishedVacancies(stripApplicationResultParams(params)),
    getVacancyApplicationFormOptions()
  ]);
  const applicationSuccess = firstParam(params.applicationSuccess);
  const applicationError = firstParam(params.applicationError);
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());

  return (
    <>
      <EditorialPublicPage
        eyebrow="Вакансии"
        title="Работа, стажировки и команды для заведений"
        description="Вакансии, стажировки и предложения для команд в заведениях региона."
        summary="Здесь можно посмотреть открытые роли, выбрать город и откликнуться на подходящую позицию."
        metrics={[
          { value: 'Работа', label: 'карьера в индустрии' },
          { value: 'Города', label: 'география ролей' },
          { value: 'Команды', label: 'запросы заведений' }
        ]}
        rows={[
          {
            label: 'Для бизнеса',
            title: 'Размещение вакансий',
            description: 'Расскажите о роли, графике, оплате и требованиях, чтобы быстрее собрать отклики.'
          },
          {
            label: 'Для людей',
            title: 'Поиск работы и стажировок',
            description: 'Кандидаты ориентируются по городу, роли, формату и уровню позиции.'
          },
          {
            label: 'Навигация',
            title: 'Города и форматы',
            description: 'В списке можно быстро сориентироваться по городу, позиции и условиям.'
          }
        ]}
        primaryLink={{ label: 'Разместить вакансию', href: '#vacancy-submission' }}
        secondaryLink={{ label: 'Откликнуться', href: '#vacancy-response' }}
      />
      <PublishedContentSection
        basePath="/vacancies"
        content={content}
        emptyDescription="Когда появятся новые вакансии, они отобразятся здесь."
        emptyTitle="Вакансий пока нет"
        title="Актуальные позиции"
      />
      <VacancyApplicationForms
        enabled={applicationFormsEnabled}
        options={applicationFormOptions}
        result={
          applicationError
            ? { type: 'error', message: applicationError }
            : applicationSuccess
              ? { type: 'success', message: applicationSuccess }
              : undefined
        }
        utm={{
          source: firstParam(params.utm_source),
          medium: firstParam(params.utm_medium),
          campaign: firstParam(params.utm_campaign)
        }}
      />
    </>
  );
}
