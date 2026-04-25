import { EditorialPublicPage } from '@/components/public/editorial-public-page';

export default function VacanciesPage() {
  return (
    <EditorialPublicPage
      eyebrow="Вакансии"
      title="Работа, стажировки и команды для заведений"
      description="Раздел для вакансий, стажировок и командных запросов: заведения могут передать информацию через контактный канал."
      routeLabel="/vacancies"
      summary="Вакансии помогают соединять заведения и специалистов: от первых стажировок до опытных управленческих позиций."
      metrics={[
        { value: 'Jobs', label: 'карьера в индустрии' },
        { value: 'City', label: 'география ролей' },
        { value: 'manual', label: 'ручная обработка' }
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
  );
}
