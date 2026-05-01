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
        description="Форматы сотрудничества для брендов, школ и заведений: события, размещение и образовательные проекты."
        summary="Можно обсудить совместный проект и выбрать подходящий формат партнёрства."
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
            description: 'Совместные материалы, анонсы и события для профессионального сообщества.'
          },
          {
            label: 'Формат',
            title: 'Спецформаты',
            description: 'Отдельные проекты для брендов и заведений: запуск, серия встреч, обучение или интеграция.'
          }
        ]}
        primaryLink={{ label: 'Обсудить партнерство', href: '/contacts?topic=partnership' }}
        secondaryLink={{ label: 'Смотреть спонсорство', href: '/general-sponsors' }}
      />
      <PublishedContentSection
        basePath="/partners"
        content={content}
        countLabel="Партнеров в списке"
        emptyDescription="Список пока пуст. Если вы представляете бренд, школу, площадку или сервис, напишите команде BARSYNERGY."
        emptyActions={[
          { href: '/contacts?topic=partnership', label: 'Стать партнером' },
          { href: '/contacts?topic=partnership-format', label: 'Обсудить формат', variant: 'secondary' }
        ]}
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
