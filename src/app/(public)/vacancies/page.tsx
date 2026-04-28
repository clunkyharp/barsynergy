import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { getPublishedVacancies, type PublicContentSearchParams } from '@/lib/public/content';

type VacanciesPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export default async function VacanciesPage({ searchParams }: VacanciesPageProps) {
  const content = await getPublishedVacancies((await searchParams) ?? {});

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
        primaryLink={{ label: 'Разместить вакансию', href: '/contacts' }}
        secondaryLink={{ label: 'Поставщики', href: '/suppliers' }}
      />
      <PublishedContentSection
        basePath="/vacancies"
        content={content}
        emptyDescription="Опубликованные вакансии появятся здесь после публикации через админку."
        emptyTitle="Пока нет опубликованных вакансий"
        title="Актуальные позиции"
      />
    </>
  );
}
