import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { getPublishedPartners, type PublicContentSearchParams } from '@/lib/public/content';

type PartnersPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export default async function PartnersPage({ searchParams }: PartnersPageProps) {
  const content = await getPublishedPartners((await searchParams) ?? {});

  return (
    <>
      <EditorialPublicPage
        eyebrow="Партнеры"
        title="Партнерские форматы для брендов, школ и заведений"
        description="Раздел описывает форматы сотрудничества для брендов, школ и заведений и помогает быстро связаться с командой."
        summary="Партнерства помогают запускать совместные проекты, образовательные активности и коммуникации внутри отраслевого сообщества."
        metrics={[
          { value: '3', label: 'типа партнерств' },
          { value: 'Контакт', label: 'прямая связь' },
          { value: 'СКФО', label: 'локальный рынок' }
        ]}
        rows={[
          {
            label: 'Формат',
            title: 'Образовательные партнерства',
            description: 'Совместные лекции, интенсивы, дегустации и программы для специалистов и команд.'
          },
          {
            label: 'Формат',
            title: 'Информационные партнерства',
            description: 'Материалы, события и отраслевые проекты, которые полезны аудитории BARSYNERGY.'
          },
          {
            label: 'Формат',
            title: 'Коммерческие заявки',
            description: 'Специальные размещения и совместные кампании согласуются индивидуально по целям и формату взаимодействия.'
          }
        ]}
        primaryLink={{ label: 'Обсудить партнерство', href: '/contacts' }}
        secondaryLink={{ label: 'События', href: '/events' }}
      />
      <PublishedContentSection
        basePath="/partners"
        content={content}
        emptyDescription="Опубликованные партнеры появятся здесь после публикации через админку."
        emptyTitle="Пока нет опубликованных партнеров"
        title="Партнеры"
      />
    </>
  );
}
