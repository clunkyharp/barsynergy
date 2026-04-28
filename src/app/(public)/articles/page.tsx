import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { getPublishedArticles, type PublicContentSearchParams } from '@/lib/public/content';

type ArticlesPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const content = await getPublishedArticles((await searchParams) ?? {});

  return (
    <>
      <EditorialPublicPage
        eyebrow="Знания"
        title="Статьи, интервью и практические материалы"
        description="Контентный раздел для отраслевых знаний: редакционные материалы, интервью, разборы и прикладные гиды."
        summary="Раздел собирает полезные отраслевые материалы в открытом доступе: интервью, разборы, прикладные статьи и тематические подборки."
        metrics={[
          { value: '4', label: 'типа контента' },
          { value: 'Открыто', label: 'доступ к материалам' },
          { value: 'Без оплаты', label: 'публичное чтение' }
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
      <PublishedContentSection
        basePath="/articles"
        content={content}
        emptyDescription="Опубликованные материалы появятся здесь после публикации через админку."
        emptyTitle="Пока нет опубликованных материалов"
        title="Опубликовано"
      />
    </>
  );
}
