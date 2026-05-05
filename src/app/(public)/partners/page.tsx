import type { Metadata } from 'next';
import { CategoryType } from '@prisma/client';
import { BookOpen, CalendarDays, ChartNoAxesColumnIncreasing, Folder, Handshake, MapPin, Newspaper, Star } from 'lucide-react';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PartnerApplicationForm } from '@/components/public/partner-application-form';
import { LogoGrid, PlatformFormatCard } from '@/components/public/platform-ui';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { PublicFilters } from '@/components/public/public-filters';
import { PublicPrelaunchSection } from '@/components/public/public-prelaunch-section';
import { FeatureItem, SectionCtaPanel } from '@/components/public/public-ui-adaptation';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import {
  getPublicApplicationResult,
  getPublicApplicationUtm,
  stripPublicApplicationResultParams
} from '@/lib/applications/public-form-helpers';
import { displayFont } from '@/lib/fonts';
import { getPublishedPartners, hasActivePublicContentParams, type PublicContentSearchParams } from '@/lib/public/content';
import { getPartnerFilterOptions, getPublicCategoryOptions } from '@/lib/public/filter-options';
import { getEnv } from '@/lib/validation/env';

type PartnersPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = {
  title: 'Партнёры',
  description: 'Партнёрские форматы BARSYNERGY для брендов, школ и заведений.'
};

const partnerFormats = [
  {
    label: 'Событие',
    title: 'Совместное событие',
    description: 'Гостевая смена, лекция, дегустация или встреча под общую задачу.',
    icon: CalendarDays,
    meta: ['События', 'Встречи']
  },
  {
    label: 'Обучение',
    title: 'Образовательная программа',
    description: 'Интенсив, мастер-класс или корпоративное обучение для специалистов и команд.',
    icon: BookOpen,
    meta: ['Образование', 'Команды']
  },
  {
    label: 'Редакция',
    title: 'Редакционный материал',
    description: 'Интервью, подборка, материал или кейс с понятной пользой для аудитории.',
    icon: Newspaper,
    meta: ['Материалы', 'Кейсы']
  },
  {
    label: 'Проект',
    title: 'Серия материалов или событий',
    description: 'Несколько материалов или событий вокруг запуска, сезона, продукта или отраслевой темы.',
    icon: Star,
    meta: ['Серия', 'Запуск']
  },
  {
    label: 'Каталог',
    title: 'Каталог',
    description: 'Профиль компании, контакты, продукты и география работы в первой подборке.',
    icon: Folder,
    meta: ['Профиль', 'Контакты']
  },
  {
    label: 'Регион',
    title: 'Региональная инициатива',
    description: 'Формат, который собирает специалистов, заведения и бренды вокруг одной рабочей темы.',
    icon: MapPin,
    meta: ['СКФО', 'Инициатива']
  }
] as const;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PartnersPage({ searchParams }: PartnersPageProps) {
  const params = (await searchParams) ?? {};
  const contentParams = stripPublicApplicationResultParams(params);
  const [content, categories, filterOptions] = await Promise.all([
    getPublishedPartners(contentParams),
    getPublicCategoryOptions(CategoryType.PARTNER),
    getPartnerFilterOptions()
  ]);
  const [cities] = await Promise.all([getApplicationCityOptions()]);
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());
  const applicationResult = getPublicApplicationResult(params);
  const applicationUtm = getPublicApplicationUtm(params);
  const requestFormat = firstParam(params.requestFormat);
  const isEmpty = content.total === 0;
  const hasActiveFilters = hasActivePublicContentParams(contentParams, ['q', 'category', 'partnerType', 'featured']);
  const isPrelaunchEmpty = isEmpty && !hasActiveFilters;
  const logoItems = content.items.map((partner) => ({
    name: partner.title,
    label: partner.label,
    href: `/partners/${partner.slug}`
  }));

  return (
    <>
      <EditorialPublicPage
        eyebrow="Для партнёров"
        title="Партнёрство для брендов, школ и заведений"
        description="Если у вас есть событие, обучение, запуск или совместный проект, здесь можно сразу написать команде BARSYNERGY."
        summary="Помогаем выбрать формат: одно событие, сезонная серия или карточка компании на сайте."
        metrics={[
          { value: '3', label: 'типа партнёрства' },
          { value: 'Контакт', label: 'прямая связь' },
          { value: 'СКФО', label: 'рынок региона' }
        ]}
        rows={[
          {
            label: 'Обучение',
            title: 'Лекции, интенсивы и корпоративные программы',
            description: 'Подходит брендам, школам и заведениям, которым нужно собрать обучение под команду, запуск или сезон.'
          },
          {
            label: 'События',
            title: 'Гостевые смены, дегустации и специальные встречи',
            description: 'Разовые или серийные встречи для нужной аудитории без лишних обещаний.'
          },
          {
            label: 'Контент',
            title: 'Материалы и карточка на сайте',
            description: 'Интервью, подборки и анонсы, которые остаются на сайте после события.'
          }
        ]}
        primaryLink={{ label: 'Оставить заявку', href: '#applications' }}
        secondaryLink={{ label: 'Смотреть спонсорство', href: '/general-sponsors' }}
      />
      <section className="background-zone background-zone-beige editorial-grid border-b border-[var(--line)] py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[minmax(16rem,0.58fr)_minmax(0,1.42fr)]">
          <div className="xl:sticky xl:top-24 xl:self-start">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Форматы</p>
            <h2 className={`${displayFont.className} mt-4 max-w-sm text-[2.8rem] font-semibold leading-none tracking-normal text-[var(--text)]`}>
              Как можно работать вместе
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {partnerFormats.map((format) => (
              <PlatformFormatCard
                key={format.title}
                {...format}
                action={{
                  href: `/partners?requestFormat=${encodeURIComponent(format.title)}#applications`,
                  label: 'Выбрать формат'
                }}
              />
            ))}
          </div>
        </div>
      </section>
      {isPrelaunchEmpty ? (
        <PublicPrelaunchSection
          actions={[
            { href: '#applications', label: 'Оставить заявку' },
            { href: '/contacts?topic=partnership-format', label: 'Обсудить формат', variant: 'secondary' },
            { href: '/general-sponsors', label: 'Смотреть спонсорство', variant: 'ghost' }
          ]}
          badges={['Каталог собирается', 'Заявки уже принимаем']}
          cards={[
            {
              title: 'Совместное событие',
              description: 'Гостевая смена, лекция, дегустация или встреча под общую задачу.'
            },
            {
              title: 'Образовательный формат',
              description: 'Интенсив, мастер-класс или корпоративное обучение для специалистов и команд.'
            },
            {
              title: 'Редакционный проект',
              description: 'Интервью, подборка, материал или спецвыпуск с понятной пользой для аудитории.'
            },
            {
              title: 'Каталог и карточка компании',
              description: 'Профиль компании, контакты, продукты и география работы в первой подборке.'
            }
          ]}
          description="Каталог ещё собирается, но заявку на партнёрство уже можно отправить. Ниже форматы, с которых обычно начинают."
          eyebrow="Партнёрство"
          title="С чего можно начать"
        />
      ) : (
        <PublishedContentSection
          basePath="/partners"
          content={content}
          countLabel="Партнёров в списке"
          emptyDescription="Список пока пуст. Если вы представляете бренд, школу, площадку или сервис, напишите команде BARSYNERGY."
          emptyActions={[
            { href: '/contacts?topic=partnership', label: 'Стать партнёром' },
            { href: '/contacts?topic=partnership-format', label: 'Обсудить формат', variant: 'secondary' }
          ]}
          emptyTitle="Партнёров пока нет"
          filters={
            <PublicFilters
              categories={categories}
              description="Выберите формат партнёрства и посмотрите компании из подборки."
              embedded
              extraFilters={[
                { name: 'partnerType', label: 'Все форматы', options: filterOptions.partnerTypes },
                { name: 'featured', label: 'Все статусы', options: [{ value: 'true', label: 'Только в подборке' }] }
              ]}
              placeholder="Поиск по партнёру, формату или описанию…"
              variant="sidebar"
            />
          }
          rowActionLabel="Открыть профиль"
          sectionId="partners-list"
          title="Партнёры"
        />
      )}
      {logoItems.length > 0 ? (
        <section className="background-zone background-zone-ivory editorial-grid border-b border-[var(--line)] py-10 md:py-14">
          <div className="container grid gap-8 xl:grid-cols-[minmax(16rem,0.58fr)_minmax(0,1.42fr)]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Уже на сайте</p>
              <h2 className={`${displayFont.className} mt-4 max-w-sm text-[2.8rem] font-semibold leading-none tracking-normal text-[var(--text)]`}>
                Компании и форматы
              </h2>
            </div>
            <LogoGrid emptyText="" items={logoItems} />
          </div>
        </section>
      ) : null}
      <section className="background-zone background-zone-cta editorial-grid border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Как это работает</p>
          <div className="mt-5 grid gap-5 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-5 md:grid-cols-3 md:p-7">
            <FeatureItem icon={Handshake} title="Обсуждаем цели" description="Понимаем задачу и подбираем подходящий формат." />
            <FeatureItem icon={CalendarDays} title="Готовим запуск" description="Согласуем формат, сроки, площадку и роли команды." />
            <FeatureItem icon={ChartNoAxesColumnIncreasing} title="Смотрим итоги" description="Разбираем, что сработало и что делать дальше." />
          </div>
          <SectionCtaPanel
            className="mt-7"
            description="Есть идея или предложение? Опишите её, и команда предложит следующий шаг."
            icon={Handshake}
            primary={{ href: '#applications', label: 'Предложить партнёрство' }}
            secondary={{ href: '/general-sponsors', label: 'Смотреть спонсорство' }}
            title="Предложить партнёрство"
          />
        </div>
      </section>
      <PartnerApplicationForm
        cities={cities}
        defaults={{ partnerType: requestFormat }}
        enabled={applicationFormsEnabled}
        result={applicationResult}
        utm={applicationUtm}
      />
    </>
  );
}
