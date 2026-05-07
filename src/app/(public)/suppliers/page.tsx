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
        title="Поставщики, сервисы и рабочие контакты"
        description="Каталог для заведений: поставки, сервис, оборудование и контакты компаний, с которыми можно обсудить рабочие условия."
        summary="Карточка поставщика показывает категорию, географию, статус проверки и прямой контакт компании."
        summaryHeading="В фокусе"
        metrics={[
          { value: 'СКФО', label: 'региональный фокус' },
          { value: 'Каталог', label: 'для заведений' },
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
            description: 'Барный и кофейный инвентарь, техника, лёд и оборудование для запуска или обновления точки.'
          },
          {
            label: 'Сервис',
            title: 'Запуск, обслуживание и поддержка',
            description: 'Монтаж, настройка, сервисное сопровождение и рабочие подрядчики для действующих заведений.'
          }
        ]}
        rowsHeading="По задачам"
        primaryLink={{ label: isEmpty ? 'Добавить компанию' : 'Найти поставщика', href: isEmpty ? '#supplier-request' : '#suppliers-list' }}
        secondaryLink={{ label: isEmpty ? 'Написать команде' : 'Добавить компанию', href: isEmpty ? '/contacts?topic=supplier#contact-form' : '#supplier-request' }}
      />
      {isPrelaunchEmpty ? (
        <PublicPrelaunchSection
          actions={[
            { href: '#supplier-request', label: 'Добавить компанию' },
            { href: '/contacts?topic=supplier#contact-form', label: 'Написать команде', variant: 'secondary' }
          ]}
          badges={['Каталог уже принимает заявки', 'Подходит для поставок, сервиса и оборудования']}
          cards={[
            {
              title: 'Ингредиенты',
              description: 'Поставки для ежедневной работы бара, кофейни или ресторанной команды.'
            },
            {
              title: 'Оборудование',
              description: 'Техника, оснащение и рабочие решения для запуска и обновления точки.'
            },
            {
              title: 'Сервис',
              description: 'Подрядчики, обслуживание и поддержка там, где нужен прямой контакт.'
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
              contextItems={[
                { label: 'Каталог', value: 'поставки, сервис, оборудование' },
                { label: 'Для кого', value: 'заведения и бар-команды' }
              ]}
              description="Соберите список по направлению, городу работы и статусу проверки."
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
              title="Фильтр каталога"
              tone="directory"
              variant="sidebar"
            />
          }
          listAction={{ href: '#supplier-request', label: 'Добавить компанию', variant: 'ghost' }}
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
