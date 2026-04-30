import { CategoryType } from '@prisma/client';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { PublicFilters } from '@/components/public/public-filters';
import { getPublishedPartners, type PublicContentSearchParams } from '@/lib/public/content';
import { getPartnerFilterOptions, getPublicCategoryOptions } from '@/lib/public/filter-options';

type PartnersPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export default async function PartnersPage({ searchParams }: PartnersPageProps) {
  const params = (await searchParams) ?? {};
  const [content, categories, filterOptions] = await Promise.all([
    getPublishedPartners(params),
    getPublicCategoryOptions(CategoryType.PARTNER),
    getPartnerFilterOptions()
  ]);

  return (
    <>
      <EditorialPublicPage
        eyebrow="Партнеры"
        title="Партнерские форматы для брендов, школ и заведений"
        description="Форматы сотрудничества для брендов, школ и заведений: заявки, размещения, события и образовательные проекты."
        summary="Здесь можно обсудить совместные проекты, события, спецформаты и работу с аудиторией BARSYNERGY."
        metrics={[
          { value: '3', label: 'типа партнерств' },
          { value: 'Контакт', label: 'прямая связь' },
          { value: 'СКФО', label: 'локальный рынок' }
        ]}
        rows={[
          {
            label: 'Формат',
            title: 'Образовательные партнерства',
            description: 'Совместные лекции, интенсивы, дегустации и программы для специалистов или команд заведений.'
          },
          {
            label: 'Формат',
            title: 'Информационные партнерства',
            description: 'Совместные материалы, анонсы и события для профессиональной аудитории.'
          },
          {
            label: 'Формат',
            title: 'Спецформаты',
            description: 'Отдельные проекты для брендов и заведений: запуск, серия встреч, обучение или интеграция.'
          }
        ]}
        primaryLink={{ label: 'Смотреть партнеров', href: '#partners-list' }}
        secondaryLink={{ label: 'События', href: '/events' }}
      />
      <PublishedContentSection
        basePath="/partners"
        content={content}
        emptyDescription="Когда появятся новые партнеры, они отобразятся здесь."
        emptyTitle="Партнеров пока нет"
        filters={
          <PublicFilters
            categories={categories}
            embedded
            extraFilters={[
              { name: 'partnerType', label: 'Все форматы', options: filterOptions.partnerTypes },
              { name: 'featured', label: 'Все статусы', options: [{ value: 'true', label: 'Только в подборке' }] }
            ]}
            placeholder="Поиск по партнеру, формату или описанию..."
          />
        }
        sectionId="partners-list"
        title="Партнеры"
      />
    </>
  );
}
