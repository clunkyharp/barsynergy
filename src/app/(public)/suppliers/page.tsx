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
        description="Каталог компаний и сервисов для закупок, запуска и повседневной работы заведений."
        summary="Здесь собраны рабочие контакты, категории услуг и краткая информация о поставщиках."
        metrics={[
          { value: 'Каталог', label: 'прикладной b2b-раздел' },
          { value: 'СКФО', label: 'локальный фокус' },
          { value: 'Выбор', label: 'по рабочим задачам' }
        ]}
        rows={[
          {
            label: 'Категории',
            title: 'Продукты, оборудование, сервисы',
            description: 'Категории разделяют поставщиков по продуктам, оборудованию, сервису и другим рабочим задачам.'
          },
          {
            label: 'Карточка',
            title: 'Профиль поставщика',
            description: 'Карточка включает описание, город, категории, контакты и основную информацию о компании.'
          },
          {
            label: 'Выбор',
            title: 'Контакты по задаче',
            description: 'Раздел помогает быстро найти поставщика под запуск, закупку, обслуживание или сервис.'
          }
        ]}
        primaryLink={{ label: 'Добавить поставщика', href: '/contacts' }}
        secondaryLink={{ label: 'Партнеры', href: '/partners' }}
      />
      <PublishedContentSection
        basePath="/suppliers"
        content={content}
        emptyDescription="Когда появятся новые поставщики, они отобразятся здесь."
        emptyTitle="Поставщиков пока нет"
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
