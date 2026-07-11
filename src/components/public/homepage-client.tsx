import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Briefcase, Building2, Coffee, GraduationCap } from 'lucide-react';
import { HomeHeroRouter } from './homepage-hero';
import { HomeEventsStrip, EditorialFeatured, EditorialSupportCard } from './homepage-current';
import { HomeSponsorLogoStrip } from './homepage-sponsors';

import { HomeCtaFaqSection } from './home-cta-faq-section';
import { Button } from '@/components/ui/button';
import { bodyFont, displayFont } from '@/lib/fonts';
import type { HomepageData, HomepageLiveCard } from '@/lib/public/home';

type HomepageClientProps = {
  data: HomepageData;
};

const SCENARIO_CARDS = [
  {
    icon: 'briefcase',
    title: 'Я специалист',
    description: 'Вакансии, обучение, события и профессиональные материалы.',
    cta: 'Найти работу',
    href: '/specialists?mode=job',
    accent: 'accent'
  },
  {
    icon: 'building',
    title: 'Я управляю заведением',
    description: 'Поставщики, сотрудники, калькулятор и помощь с развитием бизнеса.',
    cta: 'Найти поставщиков',
    href: '/suppliers',
    accent: 'default'
  },
  {
    icon: 'coffee',
    title: 'Я представляю компанию',
    description: 'Каталог, партнёрства и отраслевые проекты.',
    cta: 'Для бизнеса',
    href: '/business',
    accent: 'default'
  },
  {
    icon: 'graduation',
    title: 'Развиваюсь в индустрии',
    description: 'Материалы, мероприятия и образовательные программы.',
    cta: 'Читать материалы',
    href: '/articles',
    accent: 'default'
  }
] as const;

const SCENARIO_ICONS: Record<string, typeof Briefcase> = {
  briefcase: Briefcase,
  building: Building2,
  coffee: Coffee,
  graduation: GraduationCap
};

export function HomepageClient({ data }: HomepageClientProps) {
  const materialsCard: HomepageLiveCard = data.secondaryArticle ?? {
    kind: 'article',
    eyebrow: 'Материал',
    title: 'Материалы',
    summary: 'Другие материалы',
    meta: [],
    href: '/articles',
    actionLabel: 'Читать',
    imageUrl: '/images/home/current-event-card.png',
    isFallback: true
  };
  const workSections: { title: string; summary: string; href: string; image: string }[] = [
    { title: 'Вакансии', summary: 'Открытые позиции для бариста, барменов и специалистов индустрии.', href: '/vacancies', image: '/images/home/sections/vacancies.png' },
    { title: 'Специалисты', summary: 'Резюме, услуги и сервисные команды для кофеен и баров.', href: '/specialists', image: '/images/home/sections/masters.png' },
    { title: 'Поставщики', summary: 'Каталог поставок: зерно, оборудование, упаковка и сервис.', href: '/suppliers', image: '/images/home/sections/suppliers.png' },
    { title: 'События', summary: 'Афиша встреч, чемпионатов и отраслевых событий региона.', href: '/events', image: '/images/home/sections/events.png' },
    { title: 'Обучение', summary: 'Курсы и интенсивы для команд и специалистов кофеен и баров.', href: '/education', image: '/images/home/sections/education.png' },
    { title: 'Материалы', summary: 'Статьи, гайды и разборы по работе бара и кофейни.', href: '/articles', image: '/images/home/sections/materials.png' }
  ];

  return (
    <div className="homepage-surface overflow-x-hidden">
      <HomeHeroRouter stats={data.stats} />

      <section className="border-b border-[var(--line)] py-12 md:py-16" id="home-scenarios">
        <div className="container">
          <div className="mb-8 max-w-2xl">
            <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">С чего начать</p>
            <h2 className={`${displayFont.className} mt-2 text-[2rem] font-semibold leading-[1.05] text-[var(--text)] md:text-[2.6rem]`}>
              Выберите свой сценарий
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SCENARIO_CARDS.map((card, index) => {
              const Icon = SCENARIO_ICONS[card.icon] ?? Briefcase;
              const isPrimary = index === 0;
              return (
                <Link
                  className={`group flex flex-col rounded-[var(--radius-lg)] border p-6 transition-[border-color,background-color] duration-[var(--motion-duration-base)] hover:border-[var(--accent)]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] ${
                    isPrimary
                      ? 'border-[var(--accent)]/30 bg-[var(--accent-soft)]'
                      : 'border-[var(--border-default)] bg-[var(--surface)] hover:bg-[var(--surface-muted)]'
                  }`}
                  href={card.href}
                  key={card.href}
                >
                  <span className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] ${
                    isPrimary ? 'bg-[var(--accent)] text-[var(--accent-contrast)]' : 'bg-[var(--surface-muted)] text-[var(--muted)]'
                  }`}>
                    <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
                  </span>
                  <h3 className={`${displayFont.className} text-[1.25rem] font-semibold leading-[1.15] text-[var(--text)]`}>
                    {card.title}
                  </h3>
                  <p className={`${bodyFont.className} mt-2 flex-1 text-[0.9rem] leading-[1.55] text-[var(--muted)]`}>
                    {card.description}
                  </p>
                  <span className={`mt-4 inline-flex items-center gap-1.5 text-[0.85rem] font-semibold ${
                    isPrimary ? 'text-[var(--accent-strong)]' : 'text-[var(--text)]'
                  }`}>
                    {card.cta}
                    <ArrowUpRight size={14} strokeWidth={2} className="transition-transform duration-[var(--motion-duration-fast)] group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="editorial-current-section scroll-mt-28 border-b border-white/8 py-12 md:py-20" data-theme="dark" id="home-fresh">
        <div className="container">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4 md:mb-9">
            <h2 className={`${displayFont.className} text-[2.35rem] font-semibold leading-none text-[var(--editorial-dark-text)] md:text-[3.2rem]`}>
              Актуальное
            </h2>
            <Link
              className={`${bodyFont.className} inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--editorial-dark-muted)] transition-colors hover:text-[var(--accent)]`}
              href="/articles"
            >
              Смотреть всё
              <ArrowUpRight size={15} strokeWidth={2} />
            </Link>
          </div>
          <div className="editorial-current-layout flex flex-col gap-5 md:gap-6">
            <EditorialFeatured card={data.article} />
            <div className="editorial-current-support-row grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-5">
              <EditorialSupportCard actionLabel={data.vacancy ? 'Откликнуться' : 'Все вакансии'} card={data.vacancy} label="Вакансии" />
              <EditorialSupportCard actionLabel="Читать" card={materialsCard} fallbackMeta="Другие материалы" label="Материалы" />
              <EditorialSupportCard actionLabel={data.supplier ? 'Смотреть поставщика' : 'Смотреть поставщиков'} card={data.supplier} label="Поставщики" />
            </div>
          </div>
        </div>
      </section>

      <HomeEventsStrip event={data.event} />

      <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-10 md:py-14" id="home-tools">
        <div className="container">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">Инструмент</p>
              <h2 className={`${displayFont.className} mt-2 text-[2rem] font-semibold leading-none text-[var(--text)] md:text-[2.6rem]`}>
                Калькулятор себестоимости
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_minmax(20rem,0.5fr)] lg:items-center lg:gap-8">
            <div>
              <p className={`${bodyFont.className} max-w-prose text-[0.95rem] leading-7 text-[var(--muted)]`}>
                Рассчитайте себестоимость напитков, определите food cost, оцените маржинальность и сохраните результат.
                Калькулятор работает прямо в браузере и помогает принимать решения по pricing.
              </p>
              <ul className="mt-5 grid gap-2 text-[0.9rem] text-[var(--text)]">
                <li className="flex items-center gap-2"><span className="text-[var(--accent)]">&#9632;</span> Себестоимость напитка по ингредиентам</li>
                <li className="flex items-center gap-2"><span className="text-[var(--accent)]">&#9632;</span> Food cost и маржинальность</li>
                <li className="flex items-center gap-2"><span className="text-[var(--accent)]">&#9632;</span> Сравнение цен и объёмов</li>
              </ul>
              <div className="mt-6">
                <Button href="/tools/cost-calculator" variant="primary">
                  Рассчитать себестоимость
                  <ArrowUpRight size={16} />
                </Button>
              </div>
            </div>
            <div className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface)] p-6">
              <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">Для чего подходит</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Кофейни', 'Бары', 'Обжарка', 'Доставка', 'Рестораны'].map((tag) => (
                  <span key={tag} className="rounded-[var(--radius-pill)] border border-[var(--border-default)] bg-[var(--surface-muted)] px-3 py-1 text-[0.8rem] font-medium text-[var(--text)]">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-10 md:py-14" id="home-sections">
        <div className="container">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">Разделы</p>
              <h2 className={`${displayFont.className} mt-2 text-[2rem] font-semibold leading-none text-[var(--text)] md:text-[2.6rem]`}>
                Платформа для работы
              </h2>
            </div>
            <Button className="min-h-11 px-2 text-sm tracking-normal" href="/search" variant="link">
              Открыть поиск
              <ArrowUpRight size={16} />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {workSections.map((section) => {
              return (
                <Link
                  aria-label={`${section.title} — открыть раздел`}
                  className="work-section-card group flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-white/8 bg-[var(--editorial-dark-surface-muted)] transition-[border-color,box-shadow] duration-[var(--motion-duration-base)] hover:border-[var(--accent)]/40 hover:shadow-[0_4px_24px_rgba(0,0,0,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  href={section.href}
                  key={section.href}
                >
                  <span className="relative block aspect-[16/7] overflow-hidden bg-[var(--editorial-dark-surface)]">
                    <Image
                      alt=""
                      aria-hidden="true"
                      className="object-cover transition-transform duration-[var(--motion-duration-media)] ease-[var(--motion-ease-move)] group-hover:scale-[1.04] motion-reduce:transition-none"
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      src={section.image}
                    />
                  </span>
                  <span className="flex flex-1 flex-col gap-1.5 p-4">
                    <p className={`${bodyFont.className} text-[13px] leading-[1.5] text-[var(--editorial-dark-muted)]`}>
                      {section.summary}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-[13px] font-semibold text-[var(--accent)] transition-colors duration-[var(--motion-duration-fast)] group-hover:text-[var(--accent-strong)]">
                      Открыть раздел
                      <ArrowUpRight size={13} strokeWidth={2} />
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {data.generalSponsors.length > 0 ? <HomeSponsorLogoStrip sponsors={data.generalSponsors} /> : null}

      <HomeCtaFaqSection />

      <section className="background-zone background-zone-cta render-deferred-section border-b border-[var(--line)] py-10 md:py-14" id="home-about">
        <div className="home-about-panel container rounded-[var(--radius-xl)] border border-[var(--editorial-dark-border)] bg-[var(--editorial-dark-surface)] p-6 shadow-[0_24px_72px_rgba(0,0,0,0.22)] md:grid md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.36fr)] md:items-center md:gap-7 md:p-8" data-theme="dark">
          <div>
            <h2 className={`${displayFont.className} text-[2.1rem] font-semibold leading-[1.02] text-[var(--editorial-dark-text)] md:text-[3rem]`}>
              {data.ctaBlock?.title ?? 'Хотите добавить событие, вакансию или компанию?'}
            </h2>
            <p className="mt-3 max-w-prose text-sm leading-7 text-[var(--editorial-dark-muted)]">
              {data.ctaBlock?.description ?? 'Расскажите о задаче — команда поможет выбрать подходящий формат размещения на BARSYNERGY.'}
            </p>
          </div>
          <div className="mt-6 flex flex-col items-start gap-3 md:mt-0 md:items-stretch">
            {data.ctaBlock?.helperText ? (
              <p className="max-w-[18rem] text-xs font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--editorial-dark-muted)]">
                {data.ctaBlock.helperText}
              </p>
            ) : null}
            <Button
              className="w-full rounded-[var(--radius-md)] border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)] shadow-none hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]"
              href={data.ctaBlock?.primaryHref ?? '/contacts'}
            >
              {data.ctaBlock?.primaryLabel ?? 'Связаться с командой'}
            </Button>
            {(data.ctaBlock?.secondaryHref && data.ctaBlock?.secondaryLabel) ? (
              <Link
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--editorial-dark-border)] px-5 text-sm font-semibold text-[var(--editorial-dark-muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--editorial-dark-text)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] md:w-auto"
                href={data.ctaBlock.secondaryHref}
              >
                {data.ctaBlock.secondaryLabel}
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </Link>
            ) : null}
          </div>
        </div>
      </section>

    </div>
  );
}
