import { EditorialPublicPage } from '@/components/public/editorial-public-page';

export default function EventsPage() {
  return (
    <EditorialPublicPage
      eyebrow="События"
      title="Афиша встреч, лекций и индустриальных событий"
      description="Публичный раздел мероприятий: встречи, лекции и отраслевые форматы для специалистов и команд."
      routeLabel="/events"
      summary="События работают как точка входа в сообщество: здесь можно следить за программой, форматами участия и темами встреч."
      metrics={[
        { value: 'SKFO', label: 'регион событий' },
        { value: 'Open', label: 'открытые форматы' },
        { value: 'SEO', label: 'статичные маршруты' }
      ]}
      rows={[
        {
          label: 'Тип',
          title: 'Открытые встречи',
          description: 'Профессиональные встречи для знакомства, обмена опытом и обсуждения практических задач заведений.'
        },
        {
          label: 'Тип',
          title: 'Лекции и дегустации',
          description: 'События с экспертами, брендами и преподавателями для обмена знаниями и практикой.'
        },
        {
          label: 'Тип',
          title: 'Партнерские мероприятия',
          description: 'Форматы для школ, брендов и заведений с персональной координацией по каждому запросу.'
        }
      ]}
      primaryLink={{ label: 'Предложить событие', href: '/contacts' }}
      secondaryLink={{ label: 'Партнерство', href: '/partners' }}
    />
  );
}
