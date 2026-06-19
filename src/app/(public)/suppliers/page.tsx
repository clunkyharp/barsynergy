import type { Metadata } from 'next';
import { CategoryType } from '@/modules/content/shared/types';
import { PageHero } from '@/components/public/page-hero';
import { PageInfoSection } from '@/components/public/page-info-section';
import { PublishedContentSectionDirectory } from '@/components/public/published-content-section';
import { PublicFilters } from '@/components/public/public-filters';
import { PublicPrelaunchSection } from '@/components/public/public-prelaunch-section';
import { SuppliersHeroActions } from '@/app/(public)/suppliers/suppliers-hero-actions';
import { stripPublicApplicationResultParams } from '@/lib/applications/public-form-helpers';
import { getPublishedSuppliers, hasActivePublicContentParams, type PublicContentSearchParams } from '@/lib/public/content';
import { getPublicCategoryOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';
import { JsonLd } from '@/components/seo/json-ld';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';
import { HowItWorksSection } from '@/components/ui/how-it-works-steps';

type SuppliersPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Поставщики кофе и оборудования для кофеен СКФО',
  description: 'Каталог проверенных поставщиков кофе, какао, сиропов, оборудования и расходников для кофеен и баров Махачкалы, Дагестана и СКФО.',
  path: '/suppliers'
});

const supplierSortOptions = [
  { value: 'recent', label: 'Сначала новые' },
  { value: 'verified', label: 'Сначала проверенные' },
  { value: 'name', label: 'По названию компании' }
] as const;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getSupplierSortLabel(sort?: string) {
  return supplierSortOptions.find((option) => option.value === sort)?.label;
}

export default async function SuppliersPage({ searchParams }: SuppliersPageProps) {
  const params = (await searchParams) ?? {};
  const contentParams = stripPublicApplicationResultParams(params);
  const selectedSort = firstParam(contentParams.sort);
  const [content, filterCities, categories] = await Promise.all([
    getPublishedSuppliers(contentParams),
    getPublicCityFilterOptions(),
    getPublicCategoryOptions(CategoryType.SUPPLIER)
  ]);
  const isEmpty = content.total === 0;
  const hasActiveFilters = hasActivePublicContentParams(contentParams, ['q', 'category', 'city', 'verified']);
  const isPrelaunchEmpty = isEmpty && !hasActiveFilters;

  return (
    <>
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/suppliers', 'Поставщики')} />
      <PageHero
        breadcrumbs={[{ href: '/', label: 'Главная' }, { label: 'Поставщики' }]}
        title="Поставщики"
        subtitle="Проверенные поставщики кофе, оборудования, упаковки и продуктов для вашего бизнеса."
        tone="graphite"
      >
        <SuppliersHeroActions />
      </PageHero>
      {isPrelaunchEmpty ? (
        <HowItWorksSection
          columns={4}
          steps={[
            { title: 'Отправляете данные компании', description: 'Заполните форму с названием, категорией и контактами.' },
            { title: 'Редакция проверяет', description: 'Сверяем данные и связываемся для уточнения.' },
            { title: 'Карточка в каталоге', description: 'После проверки компания становится видна в каталоге.' },
            { title: 'Клиенты связываются', description: 'Потенциальные заказчики видят контакты и пишут напрямую.' },
          ]}
        />
      ) : null}
      {isPrelaunchEmpty ? (
        <PublicPrelaunchSection
          badges={['Каталог уже принимает заявки', 'Подходит для поставок, сервиса и оборудования']}
          cards={[
            {
              title: 'Ингредиенты',
              description: 'Поставки для ежедневной работы бара, кофейни или ресторанной команды.'
            },
            {
              title: 'Оборудование',
              description: 'Техника и оснащение для запуска или обновления точки.'
            },
            {
              title: 'Сервис',
              description: 'Подрядчики и обслуживание там, где нужен прямой контакт.'
            }
          ]}
          description="Добавьте компанию, если она поставляет продукты, оборудование или сервис для заведений."
          eyebrow="Каталог"
          title="Какие компании можно добавить"
        />
      ) : (
        <PublishedContentSectionDirectory
          basePath="/suppliers"
          content={content}
          emptyDescription="Каталог пополняется. Добавьте компанию, если она работает с кофейными барами, зерном, оборудованием или сервисом в регионе."
          emptyTitle="Поставщиков пока нет"
          filters={
            <PublicFilters
              activeSummaryLabel="Параметры каталога"
              activeSummaryCountLabel="Фильтры каталога"
              categories={categories}
              categoryAllLabel="Все направления"
              categoryLabel="Направление"
              categoryMode="multiple"
              cities={filterCities}
              cityAllLabel="Все города работы"
              cityLabel="Город работы"
              cityMode="multiple"
              embedded
              extraFilters={[
                {
                  name: 'verified',
                  label: 'Статус',
                  allLabel: 'Любой статус',
                  options: [{ value: 'true', label: 'Проверенные компании' }]
                },
                {
                  name: 'sort',
                  label: 'Сортировка',
                  allLabel: 'По умолчанию',
                  options: [...supplierSortOptions]
                },
              ]}
              placeholder="Компания или поставка…"
              title="Фильтры"
              tone="directory"
              variant="sidebar"
            />
          }
          listLabel="Поставщики"
          countLabel="В базе"
          rowActionLabel="Смотреть профиль"
          sectionId="suppliers-list"
          showSidebarTitle={false}
          sortLabel={getSupplierSortLabel(selectedSort)}
          title="Каталог"
        />
      )}
      <PageInfoSection
        eyebrow="Платформа"
        title="Поставщики кофе и расходников для кофеен СКФО"
        sidebarLinks={[
          { href: 'https://t.me/barsynergy', label: 'Telegram-канал' },
          { href: '/suppliers', label: 'Каталог поставщиков' },
        ]}
      >
        <p>
          Каталог BARSYNERGY объединяет проверенных поставщиков кофе, какао, сиропов, молочной продукции, упаковки, оборудования и сервисных услуг
          для кофеен, баров и ресторанов Махачкалы, Дагестана и Северо-Кавказского региона.
        </p>
        <p>
          Каждая компания в каталоге содержит описание направлений, города работы и контакты для прямой связи. Вы можете найти
          поставщика по категории, городу или ключевому слову.
        </p>
        <p>
          Если ваша компания поставляет продукты, оборудование или сервис для заведений — добавьте профиль в каталог бесплатно.
        </p>
      </PageInfoSection>
    </>
  );
}
