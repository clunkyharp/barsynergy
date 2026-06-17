import type { Metadata } from 'next';
import { CategoryType } from '@/modules/content/shared/types';
import { PageHero } from '@/components/public/page-hero';
import { PageInfoSection } from '@/components/public/page-info-section';
import { PublishedContentSectionMaster } from '@/components/public/published-content-section';
import { PublicFilters } from '@/components/public/public-filters';
import { PublicPrelaunchSection } from '@/components/public/public-prelaunch-section';
import { MastersHeroActions } from '@/app/(public)/masters/masters-hero-actions';
import { stripPublicApplicationResultParams } from '@/lib/applications/public-form-helpers';
import { getPublishedMasters, hasActivePublicContentParams, type PublicContentSearchParams } from '@/lib/public/content';
import { getMasterFilterOptions, getPublicCategoryOptions, getPublicCityFilterOptions } from '@/lib/public/filter-options';
import { JsonLd } from '@/components/seo/json-ld';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';

type MastersPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Мастера и сервисные команды для кофеен СКФО',
  description: 'Частные специалисты и сервисные команды для запуска кофеен, обучения команд, аудита сервиса и обслуживания оборудования в Махачкале и СКФО.',
  path: '/masters'
});

const masterSortOptions = [
  { value: 'recent', label: 'Сначала новые' },
  { value: 'verified', label: 'Сначала проверенные' },
  { value: 'experience', label: 'По опыту' },
  { value: 'name', label: 'По названию' }
] as const;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getMasterSortLabel(sort?: string) {
  return masterSortOptions.find((option) => option.value === sort)?.label;
}

export default async function MastersPage({ searchParams }: MastersPageProps) {
  const params = (await searchParams) ?? {};
  const contentParams = stripPublicApplicationResultParams(params);
  const selectedSort = firstParam(contentParams.sort);
  const [content, filterCities, categories, filterOptions] = await Promise.all([
    getPublishedMasters(contentParams),
    getPublicCityFilterOptions(),
    getPublicCategoryOptions(CategoryType.MASTER),
    getMasterFilterOptions()
  ]);
  const hasActiveFilters = hasActivePublicContentParams(contentParams);
  const isPrelaunchEmpty = content.total === 0 && !hasActiveFilters;

  return (
    <>
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/masters', 'Мастера')} />
      <PageHero
        breadcrumbs={[{ href: '/', label: 'Главная' }, { label: 'Мастера' }]}
        title="Мастера"
        subtitle="Частные специалисты и сервисные команды для запуска, обучения, аудита и обслуживания оборудования."
        tone="graphite"
      >
        <MastersHeroActions />
      </PageHero>

      {isPrelaunchEmpty ? (
        <PublicPrelaunchSection
          badges={['Каталог принимает заявки', 'Подходит для частных мастеров и компаний']}
          cards={[
            {
              title: 'Запуск бара',
              description: 'Помощь с процессами, станцией, картой и первыми сменами.'
            },
            {
              title: 'Обучение команды',
              description: 'Практические тренинги для барменов, бариста и менеджеров смены.'
            },
            {
              title: 'Сервис оборудования',
              description: 'Диагностика, настройка и регулярное обслуживание техники.'
            }
          ]}
          description="Добавьте профиль, если помогаете заведениям запускаться, обучать команду или обслуживать оборудование."
          eyebrow="Каталог"
          title="Какие услуги можно добавить"
        />
      ) : (
        <PublishedContentSectionMaster
          basePath="/masters"
          content={content}
          emptyDescription="Каталог пополняется. Добавьте профиль, если работаете с барами, кофейнями или ресторанами."
          emptyTitle="Мастеров пока нет"
          filters={
            <PublicFilters
              activeSummaryLabel="Параметры каталога"
              activeSummaryCountLabel="Фильтры каталога"
              categories={categories}
              categoryAllLabel="Все услуги"
              categoryLabel="Услуга"
              categoryMode="multiple"
              cities={filterCities}
              cityAllLabel="Все города"
              cityLabel="Город"
              cityMode="multiple"
              embedded
              extraFilters={[
                { name: 'entityType', label: 'Тип', allLabel: 'Любой тип', options: filterOptions.entityTypes },
                { name: 'specialization', label: 'Специализация', allLabel: 'Любая', mode: 'multiple', options: filterOptions.specializations },
                { name: 'experience', label: 'Опыт', allLabel: 'Любой опыт', options: filterOptions.experienceBuckets },
                { name: 'verified', label: 'Статус', allLabel: 'Любой статус', options: filterOptions.verified },
                { name: 'sort', label: 'Сортировка', allLabel: 'По умолчанию', options: [...masterSortOptions] }
              ]}
              placeholder="Мастер, компания или услуга…"
              title="Фильтры"
              tone="directory"
              variant="sidebar"
            />
          }
          listLabel="Мастера"
          countLabel="В базе"
          rowActionLabel="Смотреть профиль"
          sectionId="masters-list"
          showSidebarTitle={false}
          sortLabel={getMasterSortLabel(selectedSort)}
          title="Каталог"
        />
      )}

      <PageInfoSection
        eyebrow="Платформа"
        title="Мастера и сервисные команды для кофеен СКФО"
        sidebarLinks={[
          { href: 'https://t.me/barsynergy', label: 'Telegram-канал' },
          { href: '/masters', label: 'Каталог мастеров' },
          { href: 'mailto:barsynergy@gmail.com', label: 'Добавить профиль' },
        ]}
      >
        <p>
          BARSYNERGY объединяет частных специалистов и сервисные команды, которые помогают кофейням, барам и ресторанам Махачкалы, Дагестана
          и Северо-Кавказского региона запускаться, обучать персонал и обслуживать оборудование.
        </p>
        <p>
          Каждый профиль в каталоге содержит описание услуг, специализации, опыт работы и контакт для прямой связи.
        </p>
        <p>
          Если вы работаете с заведениями — добавьте профиль в каталог мастеров бесплатно.
        </p>
      </PageInfoSection>
    </>
  );
}
