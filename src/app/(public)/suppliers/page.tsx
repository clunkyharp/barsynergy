import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { SupplierApplicationForm } from '@/components/public/supplier-application-form';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import {
  getPublicApplicationResult,
  getPublicApplicationUtm,
  stripPublicApplicationResultParams
} from '@/lib/applications/public-form-helpers';
import { getPublishedSuppliers, type PublicContentSearchParams } from '@/lib/public/content';
import { getEnv } from '@/lib/validation/env';

type SuppliersPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export default async function SuppliersPage({ searchParams }: SuppliersPageProps) {
  const params = (await searchParams) ?? {};
  const [content, cities] = await Promise.all([
    getPublishedSuppliers(stripPublicApplicationResultParams(params)),
    getApplicationCityOptions()
  ]);
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());

  return (
    <>
      <EditorialPublicPage
        eyebrow="Поставщики"
        title="Поставщики, сервисы и полезные контакты"
        description="Каталог компаний и специалистов, которые помогают барам закупать, запускать, обслуживать и развивать проекты."
        summary="Каталог поставщиков должен быть практичным B2B-разделом: с понятными категориями, контактами и проверенной информацией."
        metrics={[
          { value: 'Каталог', label: 'прикладной b2b-раздел' },
          { value: 'СКФО', label: 'локальный фокус' },
          { value: 'Проверка', label: 'ручная модерация' }
        ]}
        rows={[
          {
            label: 'Категории',
            title: 'Продукты, оборудование, сервисы',
            description: 'Структура покрывает ключевые категории поставщиков и помогает быстро находить нужный тип партнера.'
          },
          {
            label: 'Карточка',
            title: 'Профиль поставщика',
            description: 'Профиль включает описание, город, категории, контакты, логотип и статус публикации.'
          },
          {
            label: 'Качество',
            title: 'Проверка перед публикацией',
            description: 'Публичный каталог должен показывать только проверенные записи, чтобы не превращаться в случайный список контактов.'
          }
        ]}
        primaryLink={{ label: 'Добавить поставщика', href: '/contacts' }}
        secondaryLink={{ label: 'Партнеры', href: '/partners' }}
      />
      <PublishedContentSection
        basePath="/suppliers"
        content={content}
        emptyDescription="Опубликованные поставщики появятся здесь после публикации через админку."
        emptyTitle="Пока нет опубликованных поставщиков"
        title="Каталог"
      />
      <SupplierApplicationForm
        enabled={applicationFormsEnabled}
        result={getPublicApplicationResult(params)}
        utm={getPublicApplicationUtm(params)}
        cities={cities}
      />
    </>
  );
}
