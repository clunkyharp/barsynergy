import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { SectionIcon, type SectionIconType } from '@/components/public/section-icon';
import { BusinessSolutionForm } from '@/components/public/business-solution-form';
import { submitBusinessSolutionRequest } from '@/app/(public)/business/actions';
import { PageHero } from '@/components/public/page-hero';
import { PlacementExample } from '@/components/public/placement-example';
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
  title: 'Для бизнеса — размещение и решения для заведений',
  description: 'Инструменты, размещение и профессиональные решения для компаний и заведений кофейной индустрии СКФО.',
  path: '/business'
});

const BIZ_ACTIONS = [
  { title: 'Добавить заведение в каталог', description: 'Разместите кофейню, бар или обжарку в каталоге BARSYNERGY.', cta: 'Заполнить заявку', href: '#business-request', icon: 'building' as SectionIconType },
  { title: 'Разместить вакансию', description: 'Найдите бариста, управляющего или специалиста в регион.', cta: 'Отправить вакансию', href: '/contacts?topic=vacancy#contact-form', icon: 'search' as SectionIconType },
  { title: 'Добавить событие', description: 'Анонсируйте каппинг, чемпионат или встречу в афише.', cta: 'Предложить событие', href: '/contacts?topic=event#contact-form', icon: 'star' as SectionIconType },
  { title: 'Разместить обучение', description: 'Добавьте курс, интенсив или мастер-класс в каталог.', cta: 'Предложить программу', href: '/contacts?topic=education#contact-form', icon: 'espresso' as SectionIconType },
  { title: 'Стать партнёром', description: 'Сотрудничество и отраслевые проекты с платформой.', cta: 'Узнать о партнёрстве', href: '/partners', icon: 'contact' as SectionIconType },
  { title: 'Получить консультацию', description: 'Экспертная помощь по запуску, меню и экономике.', cta: 'Описать задачу', href: '/consulting', icon: 'location' as SectionIconType }
];

const processSteps: {
  number: string;
  title: string;
  description: string;
  icon: SectionIconType;
  tone: 'search' | 'contact' | 'growth';
}[] = [
  {
    number: '1',
    title: 'Оставьте заявку',
    description: 'Укажите название заведения, город, формат, контакт и ссылку на сайт или соцсети.',
    icon: 'search',
    tone: 'search'
  },
  {
    number: '2',
    title: 'Уточним карточку',
    description: 'Свяжемся, чтобы уточнить описание, фото и контакты.',
    icon: 'contact',
    tone: 'contact'
  },
  {
    number: '3',
    title: 'Разместим в каталоге',
    description: 'После согласования карточка появляется в каталоге.',
    icon: 'building',
    tone: 'growth'
  }
];

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
    description: 'Перед публикацией редакция уточняет описание, контакты и ссылки.',
    icon: 'star'
  },
  {
    label: 'Контакт',
    title: 'Сразу понятно, куда писать',
    description: 'Город, формат, ссылка, контакт — в одной карточке.',
    icon: 'contact'
  }
];

const defaultParamKeys = ['projectName', 'contactName', 'cityId', 'solutionType', 'comment'] as const;

function VenuePlacementMock() {
  return (
    <div aria-hidden="true" className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface)] p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--accent-ink)]">Кофейня</span>
          <p className={`${displayFont.className} mt-2 text-[1.5rem] font-semibold leading-none text-[var(--text)]`}>Заведение «Пример»</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full border border-[var(--accent)]/40 bg-[var(--accent-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--text)]">
          Проверено
        </span>
      </div>

      <p className="text-[13px] leading-[1.5] text-[var(--muted)]">Specialty-кофейня с собственной обжаркой и сезонным меню.</p>

      <div className="flex flex-wrap gap-1.5">
        {['Махачкала', 'Кофейня', 'Обжарка'].map((chip) => (
          <span
            className="rounded-[var(--radius-sm)] border border-[var(--border-default)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-sm)] text-[var(--text)]"
            key={chip}
          >
            {chip}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-4 py-2.5">
        <span className="text-[12px] font-semibold text-[var(--text)]">Связаться с заведением</span>
        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--accent-ink)]">
          Telegram
          <ArrowUpRight size={14} strokeWidth={1.8} />
        </span>
      </div>
    </div>
  );
}

export default async function BusinessPage({ searchParams }: BusinessPageProps) {
  const params = (await searchParams) ?? {};
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());
  const cities = applicationFormsEnabled ? await getApplicationCityOptions() : [];
  const defaults: Record<string, string | undefined> = Object.fromEntries(
    defaultParamKeys.map((key) => [key, firstParam(params[key])]).filter(([, value]) => Boolean(value))
  );

  return (
    <>
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/business', 'Для бизнеса')} />
      <PageHero
        breadcrumbs={[{ label: 'Для бизнеса' }]}
        eyebrow="Для бизнеса"
        title="Для бизнеса"
        subtitle="Инструменты, размещение и профессиональные решения для компаний и заведений индустрии."
        tone="graphite"
        density="compact"
        actions={[
          { label: 'Смотреть поставщиков', href: '/suppliers', kind: 'secondary' }
        ]}
      />

      <section className="background-zone background-zone-beige border-b border-[var(--line)] py-12 md:py-16">
        <div className="container">
          <PublicEyebrow>Действия</PublicEyebrow>
          <PublicDisplayTitle className="mt-3 max-w-2xl" size="compact">Что вы хотите сделать?</PublicDisplayTitle>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BIZ_ACTIONS.map((action) => (
              <a
                className="public-card-shell group flex flex-col gap-3 p-5 transition-[border-color] hover:border-[var(--accent)]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] md:p-6"
                href={action.href}
                key={action.title}
              >
                <SectionIcon size={36} type={action.icon} />
                <h3 className={`${displayFont.className} text-[1.1rem] font-semibold leading-tight text-[var(--text)]`}>{action.title}</h3>
                <p className="flex-1 text-[13px] leading-[1.6] text-[var(--muted)]">{action.description}</p>
                <span className="inline-flex items-center gap-1.5 text-[0.85rem] font-semibold text-[var(--accent-ink)]">
                  {action.cta}
                  <ArrowUpRight size={14} strokeWidth={2} className="transition-transform duration-[var(--motion-duration-fast)] group-hover:translate-x-0.5" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="background-zone background-zone-beige border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <PublicEyebrow>Разместить заведение в каталоге</PublicEyebrow>
          <div className="mb-8 max-w-2xl">
            <PublicEyebrow>Как это работает</PublicEyebrow>
            <PublicDisplayTitle className="mt-3" size="compact">Три шага до карточки</PublicDisplayTitle>
            <PublicBodyText className="mt-4 max-w-xl" size="md">
              Заявка короткая, но карточка собирается как рабочий профиль заведения.
            </PublicBodyText>
          </div>
          <ol className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            {processSteps.map((step, index) => {
              const stepLabel = String(index + 1);

              return (
              <li
                className="home-step-card flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] shadow-[var(--shadow-card)]"
                data-step-tone={step.tone}
                key={step.title}
              >
                <span className="home-step-card-visual flex items-center gap-4 border-b border-[var(--border-default)] p-5">
                  <span className="text-[var(--home-step-accent)]">
                    <SectionIcon size={28} type={step.icon} />
                  </span>
                  <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
                    {stepLabel}
                  </span>
                </span>
                <span className="flex flex-1 flex-col p-5 pt-4">
                  <h3 className={`${displayFont.className} text-[1.25rem] font-semibold leading-tight text-[var(--text)]`}>{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{step.description}</p>
                </span>
              </li>
            );
          })}
          </ol>
        </div>
      </section>

      <section className="home-services-section background-zone background-zone-beige border-b border-[var(--line)] py-12 md:py-16">
        <div className="container grid gap-8 xl:grid-cols-[minmax(18rem,0.54fr)_minmax(0,1.46fr)]">
          <div className="min-w-0 xl:self-center">
            <div className="min-w-0">
              <PublicEyebrow>Польза</PublicEyebrow>
              <PublicDisplayTitle className="mt-4 max-w-[13ch] !text-[clamp(2rem,4.4vw,2.9rem)] [overflow-wrap:break-word]">Что получите</PublicDisplayTitle>
              <PublicBodyText className="mt-5 max-w-md" size="md" tone="default">
                Каталог помогает кофейням, поставщикам, мастерам и партнёрам быстрее находить друг друга внутри региона — без случайного трафика и лишних заявок.
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
                  <h3 className={`${displayFont.className} mt-5 text-xl font-semibold leading-7 text-[var(--text)]`}>{benefit.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{benefit.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <PlacementExample
        eyebrow="Пример размещения"
        title="Как заведение выглядит в каталоге"
        description="После добавления заведение получает карточку, по которой его находят коллеги, поставщики и гости индустрии."
        tone="ivory"
        visual={<VenuePlacementMock />}
        annotations={[
          { title: 'Название и формат', description: 'Понятно, что это за заведение: кофейня, бар, обжарка.' },
          { title: 'Город и направления', description: 'Чипы с городом и специализацией — заведение находят по фильтрам.' },
          { title: 'Проверенный статус', description: 'Отметка проверки повышает доверие к карточке.' },
          { title: 'Прямая связь', description: 'Контакт заведения виден сразу — без посредников.' }
        ]}
      />

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
