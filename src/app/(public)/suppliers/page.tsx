import { CategoryType } from '@prisma/client';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { PublicFilters } from '@/components/public/public-filters';
import { getPublishedSuppliers, type PublicContentSearchParams } from '@/lib/public/content';
import { getPublicCategoryOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';

type SuppliersPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export default async function SuppliersPage({ searchParams }: SuppliersPageProps) {
  const params = (await searchParams) ?? {};
  const [content, filterCities, categories] = await Promise.all([
    getPublishedSuppliers(params),
    getPublicCityFilterOptions(),
    getPublicCategoryOptions(CategoryType.SUPPLIER)
  ]);

  return (
    <>
      <EditorialPublicPage
        eyebrow="Поставщики"
        title="Поставщики, сервисы и полезные контакты"
        description="Каталог компаний и сервисов для закупок, запуска и ежедневной работы баров, кофеен и ресторанных команд."
        summary="Собираем производителей, дистрибьюторов, сервисные команды и локальные контакты, которые реально полезны в работе."
        summaryHeading="В фокусе"
        metrics={[
          { value: 'СКФО', label: 'региональный фокус' },
          { value: 'B2B', label: 'прикладной каталог' },
          { value: 'Контакт', label: 'прямой выход на компанию' }
        ]}
        rows={[
          {
            label: 'Закупки',
            title: 'Ингредиенты, расходники и поставки',
            description: 'Поставщики кофе, сиропов, алкоголя, посуды, упаковки и других расходных позиций.'
          },
          {
            label: 'Оборудование',
            title: 'Техника, инвентарь и оснащение',
            description: 'Барный и кофейный инвентарь, техника, лед, оборудование для запуска и обновления точки.'
          },
          {
            label: 'Сервис',
            title: 'Запуск, обслуживание и поддержка',
            description: 'Монтаж, настройка, сервисное сопровождение и рабочие подрядчики для действующих заведений.'
          }
        ]}
        rowsHeading="По задачам"
        primaryLink={{ label: 'Смотреть каталог', href: '#suppliers-list' }}
        secondaryLink={{ label: 'Партнеры', href: '/partners' }}
      />
      <PublishedContentSection
        basePath="/suppliers"
        content={content}
        emptyDescription="Сейчас каталог пуст. Новые компании и сервисы появятся после публикации командой."
        emptyTitle="Поставщиков пока нет"
        filters={
          <PublicFilters
            categories={categories}
            cities={filterCities}
            embedded
            extraFilters={[{ name: 'verified', label: 'Все статусы', options: [{ value: 'true', label: 'Только проверенные' }] }]}
            placeholder="Поиск по компании, поставке или описанию..."
          />
        }
        sectionId="suppliers-list"
        title="Каталог"
      />
    </>
  );
}
