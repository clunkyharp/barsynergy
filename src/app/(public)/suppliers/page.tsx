import type { Metadata } from 'next';
import { CategoryType } from '@prisma/client';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { PublicFilters } from '@/components/public/public-filters';
import { PublicPrelaunchSection } from '@/components/public/public-prelaunch-section';
import { SupplierApplicationForm } from '@/components/public/supplier-application-form';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import {
  getPublicApplicationResult,
  getPublicApplicationUtm,
  stripPublicApplicationResultParams
} from '@/lib/applications/public-form-helpers';
import { getPublishedSuppliers, hasActivePublicContentParams, type PublicContentSearchParams } from '@/lib/public/content';
import { getPublicCategoryOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';
import { getEnv } from '@/lib/validation/env';

type SuppliersPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = {
  title: 'Поставщики',
  description: 'Каталог поставщиков, сервисов и полезных контактов BARSYNERGY.'
};

export default async function SuppliersPage({ searchParams }: SuppliersPageProps) {
  const params = (await searchParams) ?? {};
  const contentParams = stripPublicApplicationResultParams(params);
  const [content, filterCities, categories] = await Promise.all([
    getPublishedSuppliers(contentParams),
    getPublicCityFilterOptions(),
    getPublicCategoryOptions(CategoryType.SUPPLIER)
  ]);
  const [cities] = await Promise.all([getApplicationCityOptions()]);
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());
  const applicationResult = getPublicApplicationResult(params);
  const applicationUtm = getPublicApplicationUtm(params);
  const isEmpty = content.total === 0;
  const hasActiveFilters = hasActivePublicContentParams(contentParams, ['q', 'category', 'city', 'verified']);
  const isPrelaunchEmpty = isEmpty && !hasActiveFilters;

  return (
    <>
      <EditorialPublicPage
        eyebrow="Поставщики"
        title="Поставщики, сервисы и полезные контакты"
        description="Каталог компаний и сервисов для закупок, запуска и повседневной работы баров, кофеен и ресторанных команд."
        summary="Здесь собраны производители, дистрибьюторы, сервисные команды и локальные контакты, которые правда помогают в работе."
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
        primaryLink={{ label: isEmpty ? 'Добавить компанию' : 'Найти поставщика', href: isEmpty ? '#applications' : '#suppliers-list' }}
        secondaryLink={{ label: isEmpty ? 'Написать команде' : 'Добавить компанию', href: isEmpty ? '/contacts?topic=supplier' : '#applications' }}
      />
      {isPrelaunchEmpty ? (
        <PublicPrelaunchSection
          actions={[
            { href: '#applications', label: 'Добавить компанию' },
            { href: '/contacts?topic=supplier', label: 'Написать команде', variant: 'secondary' }
          ]}
          badges={['Каталог уже принимает заявки', 'Подходит для поставок, сервиса и оборудования']}
          cards={[
            {
              title: 'Ингредиенты и расходники',
              description: 'Поставки для ежедневной работы бара, кофейни или ресторанной команды.'
            },
            {
              title: 'Оборудование и инвентарь',
              description: 'Техника, оснащение и рабочие решения для запуска и обновления точки.'
            },
            {
              title: 'Сервисные команды',
              description: 'Подрядчики, обслуживание и поддержка там, где нужен понятный рабочий контакт.'
            }
          ]}
          description="Каталог формируется, но заявки на добавление компаний уже открыты. Можно сразу оставить контакты и описание работы."
          eyebrow="Раздел готовится"
          title="Сейчас мы собираем первую подборку"
        />
      ) : (
        <PublishedContentSection
          basePath="/suppliers"
          content={content}
          emptyDescription="Сейчас каталог пуст. Новые компании и сервисы появятся после публикации."
          emptyTitle="Поставщиков пока нет"
          filters={
            <PublicFilters
              categories={categories}
              cities={filterCities}
              description="Выберите категорию поставок, город работы и статус компании."
              embedded
              extraFilters={[{ name: 'verified', label: 'Все статусы', options: [{ value: 'true', label: 'Только проверенные' }] }]}
              placeholder="Поиск по компании, поставке или описанию…"
              variant="sidebar"
            />
          }
          listAction={{ href: '#applications', label: 'Добавить компанию', variant: 'ghost' }}
          listLabel="Поставщики"
          rowVariant="directory"
          rowActionLabel="Открыть профиль"
          sectionId="suppliers-list"
          title="Каталог"
        />
      )}
      <SupplierApplicationForm
        cities={cities}
        enabled={applicationFormsEnabled}
        result={applicationResult}
        utm={applicationUtm}
      />
    </>
  );
}
