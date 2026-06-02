import type { Metadata } from 'next';
import { ArrowUpRight, BadgeCheck, MapPinned, SearchCheck, Store } from 'lucide-react';
import { BusinessSolutionForm } from '@/components/public/business-solution-form';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { RoleTaskCard } from '@/components/public/public-card-patterns';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import { firstParam, getPublicApplicationResult, getPublicApplicationUtm } from '@/lib/applications/public-form-helpers';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { getEnv } from '@/lib/validation/env';

type BusinessPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Каталог заведений',
  description: 'Добавление кофейных баров, кофеен, обжарочных и близких форматов в каталог BARSYNERGY по СКФО.',
  path: '/business'
});

const processSteps = [
  {
    label: 'Шаг 1',
    title: 'Оставьте заявку',
    description: 'Укажите название заведения, город, формат, контакт и ссылку на сайт или соцсети.'
  },
  {
    label: 'Шаг 2',
    title: 'Уточним карточку',
    description: 'Проверим данные, категорию, описание, фото и контактную информацию перед публикацией.'
  },
  {
    label: 'Шаг 3',
    title: 'Разместим в каталоге',
    description: 'После согласования заведению появится понятная карточка для гостей, партнёров и команды платформы.'
  }
] as const;

const benefits = [
  {
    label: 'Каталог',
    title: 'Видимость в профильной среде',
    description: 'Карточка помогает гостям, поставщикам, кандидатам и партнёрам быстрее найти ваше заведение.'
  },
  {
    label: 'Контекст',
    title: 'Фокус на СКФО',
    description: 'Платформа собирает локальные бары, кофейни, поставщиков, события и образовательные форматы региона.'
  },
  {
    label: 'Проверка',
    title: 'Без случайных карточек',
    description: 'Команда вручную сверяет базовые данные, чтобы каталог оставался аккуратным и полезным.'
  },
  {
    label: 'Контакт',
    title: 'Понятный первый контакт',
    description: 'Гость, кандидат или партнёр быстро видит ссылку, город и формат заведения и понимает, куда писать дальше.'
  }
] as const;

const heroMetrics = [
  { label: 'Форматы', value: '4' },
  { label: 'Регион', value: 'СКФО' },
  { label: 'Проверка', value: 'ручная' }
];

const defaultParamKeys = ['projectName', 'contactName', 'cityId', 'solutionType', 'comment'] as const;

export default async function BusinessPage({ searchParams }: BusinessPageProps) {
  const params = (await searchParams) ?? {};
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());
  const cities = applicationFormsEnabled ? await getApplicationCityOptions() : [];
  const defaults: Record<string, string | undefined> = Object.fromEntries(
    defaultParamKeys.map((key) => [key, firstParam(params[key])]).filter(([, value]) => Boolean(value))
  );

  return (
    <>
      <EditorialPublicPage
        eyebrow="Каталог заведений"
        path="/business"
        title="Каталог заведений СКФО"
        description="Добавляем кофейные бары, кофейни, обжарочные и близкие форматы в профильный каталог BARSYNERGY."
        summary="Заполните карточку заведения — команда проверит данные и подготовит публикацию в каталоге BARSYNERGY."
        summaryHeading="Каталог"
        heroVariant="split"
        metrics={heroMetrics}
        rows={[]}
        primaryLink={{ label: 'Заполнить заявку', href: '#business-request' }}
        secondaryLink={{ label: 'Посмотреть каталог', href: '/suppliers' }}
      />

      <section className="background-zone background-zone-beige border-b border-[var(--line)] py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[minmax(18rem,0.54fr)_minmax(0,1.46fr)]">
          <div className="xl:sticky xl:top-24 xl:self-start">
            <PublicEyebrow>Как это работает</PublicEyebrow>
            <PublicDisplayTitle className="mt-4 max-w-sm">Три шага до карточки</PublicDisplayTitle>
            <PublicBodyText className="mt-5 max-w-md" size="md">
              Нужна короткая заявка. Сложные анкеты, тарифы и оплату на этой странице не собираем.
            </PublicBodyText>
            <Button className="mt-7 rounded-[var(--radius-md)]" href="#business-request" size="lg">
              Перейти к форме
              <ArrowUpRight size={16} />
            </Button>
          </div>

          <div className="[&>article:last-child]:border-b-0">
            {processSteps.map((step) => (
              <RoleTaskCard
                density="compact"
                description={step.description}
                eyebrow={step.label}
                key={step.title}
                presentation="row"
                title={step.title}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="home-services-section background-zone background-zone-beige border-b border-[var(--line)] py-12 md:py-16">
        <div className="container grid gap-8 xl:grid-cols-[minmax(18rem,0.54fr)_minmax(0,1.46fr)]">
          <div className="min-w-0 xl:sticky xl:top-24 xl:self-start">
            <div className="min-w-0">
              <PublicEyebrow tone="muted">Польза</PublicEyebrow>
              <PublicDisplayTitle className="mt-4 max-w-[13ch]">Что получает заведение</PublicDisplayTitle>
              <PublicBodyText className="mt-5 max-w-md" size="md" tone="default">
                Каталог нужен не для рекламы «обо всём», а для аккуратной отраслевой навигации по местам и командам региона.
              </PublicBodyText>
              <Button className="mt-7 rounded-[var(--radius-md)]" href="#business-request" size="lg">
                Перейти к форме
                <ArrowUpRight size={16} />
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:mt-0">
            {benefits.map((benefit, index) => {
              const Icon = [Store, MapPinned, SearchCheck, BadgeCheck][index] ?? BadgeCheck;

              return (
                <article className="public-card-shell p-5 md:p-6" key={benefit.title}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="public-meta-label">{benefit.label}</span>
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] text-white">
                      <Icon size={18} strokeWidth={1.8} />
                    </span>
                  </div>
                  <h3 className="mt-5 text-xl font-semibold leading-7 text-[var(--text)]">{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{benefit.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <BusinessSolutionForm
        direct
        defaults={defaults}
        enabled={applicationFormsEnabled}
        result={getPublicApplicationResult(params)}
        utm={getPublicApplicationUtm(params)}
        cities={cities}
      />
    </>
  );
}
