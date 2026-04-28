import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { getPublishedEvents, type PublicContentSearchParams } from '@/lib/public/content';

type EventsPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const content = await getPublishedEvents((await searchParams) ?? {});

  return (
    <>
      <EditorialPublicPage
        eyebrow="События"
        title="Афиша встреч, лекций и индустриальных событий"
        description="Публичный раздел мероприятий: встречи, лекции и отраслевые форматы для специалистов и команд."
        summary="События работают как точка входа в сообщество: здесь можно следить за программой, форматами участия и темами встреч."
        metrics={[
          { value: 'СКФО', label: 'регион событий' },
          { value: 'Открыто', label: 'форматы участия' },
          { value: 'Афиша', label: 'публичный раздел' }
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
      <PublishedContentSection
        basePath="/events"
        content={content}
        emptyDescription="Опубликованные события появятся здесь после публикации через админку."
        emptyTitle="Пока нет опубликованных событий"
        title="Афиша"
      />
    </>
  );
}
