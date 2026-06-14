import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { SectionIcon, type SectionIconType } from '@/components/public/section-icon';
import { BusinessSolutionForm } from '@/components/public/business-solution-form';
import { submitBusinessSolutionRequest } from '@/app/(public)/business/actions';
import { PageHero } from '@/components/public/page-hero';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { JsonLd } from '@/components/seo/json-ld';
import { displayFont } from '@/lib/fonts';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import { firstParam, getPublicApplicationUtm } from '@/lib/applications/public-form-helpers';
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
    description: 'Свяжемся, чтобы уточнить описание, фото и контакты.'
  },
  {
    label: 'Шаг 3',
    title: 'Разместим в каталоге',
    description: 'После согласования карточка появляется в каталоге.'
  }
] as const;

const benefits: { label: string; title: string; description: string; icon: SectionIconType }[] = [
  {
    label: 'Каталог',
    title: 'Вас находят те, кому нужно',
    description: 'Гости, бариста, поставщики и партнёры — все, кто работает в кофейном сегменте региона.',
    icon: 'building'
  },
  {
    label: 'Контекст',
    title: 'Рядом с индустрией',
    description: 'В одном каталоге с вакансиями, событиями и поставщиками. Не среди всего подряд.',
    icon: 'location'
  },
  {
    label: 'Проверка',
    title: 'Карточку собираем вместе',
    description: 'Перед публикацией редакция уточняет описание, контакты и ссылки. Без сюрпризов.',
    icon: 'star'
  },
  {
    label: 'Контакт',
    title: 'Сразу понятно, куда писать',
    description: 'Город, формат, ссылка, контакт — в одной карточке.',
    icon: 'contact'
  }
];

const targetAudiences = [
  { label: 'Кофейни', description: 'Specialty, авторские и третья волна' },
  { label: 'Кофейные бары', description: 'Стойки, концепты, мини-форматы' },
  { label: 'Обжарочные', description: 'Роастеры с розничными продажами' },
  { label: 'Поставщики', description: 'Зерно, молоко, расходники, оборудование' },
] as const;

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
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/business', 'Каталог заведений')} />
      <PageHero
        breadcrumbs={[{ label: 'Каталог заведений' }]}
        eyebrow="Каталог заведений"
        title="Добавить заведение в каталог"
        subtitle="Кофейные бары, кофейни, обжарочные и смежные форматы — в каталоге BARSYNERGY."
        tone="graphite"
        density="compact"
        actions={[
          { label: 'Посмотреть каталог', href: '/suppliers', kind: 'secondary' }
        ]}
      />

      {/* Who it's for */}
      <section className="background-zone background-zone-beige border-b border-[var(--line)] py-10 md:py-12">
        <div className="container">
          <PublicEyebrow>Кому подходит</PublicEyebrow>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
            {targetAudiences.map((audience) => (
              <article
                className="public-card-shell flex flex-col gap-2 px-4 py-4"
                key={audience.label}
              >
                <h3 className="text-[15px] font-semibold leading-tight text-[var(--text)]">{audience.label}</h3>
                <p className="text-[13px] leading-5 text-[var(--muted)]">{audience.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="background-zone background-zone-beige border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <PublicEyebrow>Как это работает</PublicEyebrow>
              <PublicDisplayTitle className="mt-3 max-w-sm">Три шага до карточки</PublicDisplayTitle>
            </div>
          </div>
          <div className="grid gap-px sm:grid-cols-3">
            {processSteps.map((step, i) => (
              <div
                className="relative flex flex-col gap-3 border border-[var(--line)] bg-[var(--surface-card)] px-5 py-6 first:rounded-t-[var(--radius-md)] last:rounded-b-[var(--radius-md)] sm:first:rounded-l-[var(--radius-md)] sm:first:rounded-tr-none sm:last:rounded-r-[var(--radius-md)] sm:last:rounded-bl-none"
                key={step.title}
              >
                <span className={`${displayFont.className} text-[2.2rem] font-bold leading-none text-[var(--accent)] opacity-60 tabular-nums`}>
                  0{i + 1}
                </span>
                <h3 className="text-[1rem] font-semibold leading-tight text-[var(--text)]">{step.title}</h3>
                <p className="text-[13px] leading-5 text-[var(--muted)]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="home-services-section background-zone background-zone-beige border-b border-[var(--line)] py-12 md:py-16">
        <div className="container grid gap-8 xl:grid-cols-[minmax(18rem,0.54fr)_minmax(0,1.46fr)]">
          <div className="min-w-0 xl:self-start">
            <div className="min-w-0">
              <PublicEyebrow>Польза</PublicEyebrow>
              <PublicDisplayTitle className="mt-4 max-w-[13ch]">Что получите</PublicDisplayTitle>
              <PublicBodyText className="mt-5 max-w-md" size="md" tone="default">
                Каталог собирает кофейный сегмент региона: кто и где работает. Без рекламы «для всех».
              </PublicBodyText>
              <Button className="mt-7 rounded-[var(--radius-md)]" href="#business-request" size="lg">
                Перейти к форме
                <ArrowUpRight size={16} />
              </Button>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:mt-0">
            {benefits.map((benefit) => {
              return (
                <article className="public-card-shell p-5 md:p-6" key={benefit.title}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="public-meta-label">{benefit.label}</span>
                    <SectionIcon size={40} type={benefit.icon} />
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
        utm={getPublicApplicationUtm(params)}
        cities={cities}
        action={submitBusinessSolutionRequest}
      />
    </>
  );
}
