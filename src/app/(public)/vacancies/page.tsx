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
        description="Раздел для вакансий, стажировок и командных запросов: заведения могут передать информацию через контактный канал."
        summary="Вакансии помогают соединять заведения и специалистов: от первых стажировок до опытных управленческих позиций."
        metrics={[
          { value: 'Работа', label: 'карьера в индустрии' },
          { value: 'Города', label: 'география ролей' },
          { value: 'Проверка', label: 'ручная обработка' }
        ]}
        rows={[
          {
            label: 'Для бизнеса',
            title: 'Размещение вакансий',
            description: 'Заведения передают вакансии через заявку, а команда публикует проверенные позиции.'
          },
          {
            label: 'Для людей',
            title: 'Поиск работы и стажировок',
            description: 'Кандидаты ориентируются по городу, роли, формату и уровню позиции.'
          },
          {
            label: 'Модерация',
            title: 'Качество и публикационные статусы',
            description: 'Публичная выдача должна показывать только опубликованные и актуальные вакансии.'
          }
        ]}
        primaryLink={{ label: 'Разместить вакансию', href: '#vacancy-submission' }}
        secondaryLink={{ label: 'Откликнуться', href: '#vacancy-response' }}
      />
      <PublishedContentSection
        basePath="/vacancies"
        content={content}
        emptyDescription="Опубликованные вакансии появятся здесь после публикации через админку."
        emptyTitle="Пока нет опубликованных вакансий"
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
