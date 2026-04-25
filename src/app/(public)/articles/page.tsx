import { EditorialPublicPage } from '@/components/public/editorial-public-page';

export default function ArticlesPage() {
  return (
    <EditorialPublicPage
      eyebrow="Знания"
      title="Статьи, интервью и практические материалы"
      description="Контентный раздел для отраслевых знаний: редакционные материалы, интервью, разборы и прикладные гиды."
      routeLabel="/articles"
      summary="Раздел собирает полезные отраслевые материалы в открытом доступе: интервью, разборы, прикладные статьи и тематические подборки."
      metrics={[
        { value: '04', label: 'типа контента' },
        { value: 'Open', label: 'открытый доступ' },
        { value: 'free', label: 'без paywall' }
      ]}
      rows={[
        {
          label: 'Материалы',
          title: 'Редакционные статьи',
          description: 'Практические тексты о сервисе, команде, операционной работе, продуктах и региональном рынке.'
        },
        {
          label: 'Материалы',
          title: 'Интервью и кейсы',
          description: 'Истории специалистов, заведений и партнеров с акцентом на опыт, решения и ошибки.'
        },
        {
          label: 'Материалы',
          title: 'Гиды и подборки',
          description: 'Структурированные материалы, которые можно связать с обучением, событиями и каталогами.'
        }
      ]}
      primaryLink={{ label: 'Предложить тему', href: '/contacts' }}
      secondaryLink={{ label: 'О проекте', href: '/about' }}
    />
  );
}
