import type { Metadata } from 'next';
import { CategoryType } from '@prisma/client';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { PublicFilters } from '@/components/public/public-filters';
import { PublicPrelaunchSection } from '@/components/public/public-prelaunch-section';
import { stripPublicApplicationResultParams } from '@/lib/applications/public-form-helpers';
import { getPublishedSuppliers, hasActivePublicContentParams, type PublicContentSearchParams } from '@/lib/public/content';
import { getPublicCategoryOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';

type SuppliersPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = {
  title: 'Поставщики',
  description: 'Каталог поставщиков, оборудования, сервисов и контактов для заведений.'
};

export default async function SuppliersPage({ searchParams }: SuppliersPageProps) {
  const params = (await searchParams) ?? {};
  const contentParams = stripPublicApplicationResultParams(params);
  const [content, filterCities, categories] = await Promise.all([
    getPublishedSuppliers(contentParams),
    getPublicCityFilterOptions(),
    getPublicCategoryOptions(CategoryType.SUPPLIER)
  ]);
  const supplierContactHref = '/contacts?topic=supplier#contact-form';
  const isEmpty = content.total === 0;
  const hasActiveFilters = hasActivePublicContentParams(contentParams, ['q', 'category', 'city', 'verified']);
  const isPrelaunchEmpty = isEmpty && !hasActiveFilters;

  return (
    <>
      <EditorialPublicPage
        eyebrow="Поставщики"
        title="Поставщики, сервисы и рабочие контакты"
        description="Каталог для заведений: поставки, сервис, оборудование и контакты компаний."
        summary="В карточке видно категорию, географию, статус проверки и контакт компании."
        density="compact"
        summaryHeading="В фокусе"
        metrics={[]}
        rows={[]}
        primaryLink={{ label: 'Добавить компанию', href: supplierContactHref }}
        secondaryLink={isEmpty ? { label: 'Связаться с нами', href: supplierContactHref } : undefined}
      />
      {isPrelaunchEmpty ? (
        <PublicPrelaunchSection
          actions={[
            { href: supplierContactHref, label: 'Добавить компанию' },
            { href: supplierContactHref, label: 'Связаться с нами', variant: 'secondary' }
          ]}
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
        <PublishedContentSection
          basePath="/suppliers"
          content={content}
          emptyDescription="Сейчас каталог пуст. Новые компании и сервисы появятся после публикации."
          emptyTitle="Поставщиков пока нет"
          filters={
            <PublicFilters
              activeSummaryLabel="Параметры каталога"
              categories={categories}
              categoryAllLabel="Все направления"
              categoryLabel="Направление"
              cities={filterCities}
              cityAllLabel="Все города работы"
              cityLabel="Город работы"
              embedded
              extraFilters={[
                {
                  name: 'verified',
                  label: 'Статус',
                  allLabel: 'Любой статус',
                  options: [{ value: 'true', label: 'Проверенные компании' }]
                }
              ]}
              placeholder="Компания или поставка…"
              title="Фильтры"
              tone="directory"
              variant="sidebar"
            />
          }
          listLabel="Поставщики"
          rowActionLabel="Смотреть профиль"
          rowVariant="directory"
          sectionId="suppliers-list"
          title="Каталог"
        />
      )}
    </>
  );
}
