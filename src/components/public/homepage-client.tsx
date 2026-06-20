import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { HomeHeroRouter } from './homepage-hero';
import { HomeEventsStrip, EditorialFeatured, EditorialSupportCard } from './homepage-current';
import { CommunityChannelRows } from './homepage-community';
import { HomeSponsorLogoStrip } from './homepage-sponsors';

import { HomeCtaFaqSection } from './home-cta-faq-section';
import { Button } from '@/components/ui/button';
import { bodyFont, displayFont } from '@/lib/fonts';
import type { HomepageData, HomepageLiveCard } from '@/lib/public/home';

type HomepageClientProps = {
  data: HomepageData;
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
  const liveSectionCards = [data.vacancy, data.supplier, data.event, data.course, data.article, materialsCard];

  return (
    <div className="overflow-x-hidden">
      <HomeHeroRouter stats={data.stats} />


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
              <p className="text-[10px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--muted)]">Что нового</p>
              <h2 className={`${displayFont.className} mt-2 text-[2rem] font-semibold leading-none text-[var(--text)] md:text-[2.6rem]`}>
                Разделы для работы
              </h2>
            </div>
            <Button className="min-h-11 px-2 text-sm tracking-normal" href="/search" variant="link">
              Открыть поиск
              <ArrowUpRight size={16} />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {liveSectionCards.map((card, index) => {
              return (
                <EditorialSupportCard
                  actionLabel={card.actionLabel}
                  card={card}
                  density="compact"
                  fallbackMeta="Рабочий раздел"
                  key={`${card.kind}-${card.href}-${index}`}
                  label={card.eyebrow}
                />
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
              {data.ctaBlock?.title ?? 'Присоединяйтесь к платформе барной индустрии СКФО'}
            </h2>
            <p className="mt-3 max-w-prose text-sm leading-7 text-[var(--editorial-dark-muted)]">
              {data.ctaBlock?.description ?? 'Обучение, вакансии, поставщики и инструменты для специалистов и заведений Северного Кавказа.'}
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
              href={data.ctaBlock?.primaryHref ?? '/vacancies'}
            >
              {data.ctaBlock?.primaryLabel ?? 'Смотреть вакансии'}
            </Button>
            {(data.ctaBlock?.secondaryHref && data.ctaBlock?.secondaryLabel) ? (
              <Link
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--editorial-dark-border)] px-5 text-sm font-semibold text-[var(--editorial-dark-muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--editorial-dark-text)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] md:w-auto"
                href={data.ctaBlock.secondaryHref}
              >
                {data.ctaBlock.secondaryLabel}
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </Link>
            ) : (
              <Link
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--radius-md)] border border-[var(--editorial-dark-border)] px-5 text-sm font-semibold text-[var(--editorial-dark-muted)] transition hover:border-[var(--accent)]/40 hover:text-[var(--editorial-dark-text)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] md:w-auto"
                href="/contacts"
              >
                Связаться с нами
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </Link>
            )}
          </div>
          {data.socialBlocks.length > 0 ? (
            <div className="md:col-span-2">
              <CommunityChannelRows channels={data.socialBlocks} />
            </div>
          ) : null}
        </div>
      </section>

    </div>
  );
}
