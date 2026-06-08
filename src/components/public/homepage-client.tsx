import Link from 'next/link';
import { ArrowUpRight, BookOpen, BriefcaseBusiness, Calculator, GraduationCap, PackageCheck, Users } from 'lucide-react';
import { HomeHeroRouter } from './homepage-hero';
import { HomeEventsStrip, FeaturedNowCard, NowCard } from './homepage-current';
import { CommunityChannelRows } from './homepage-community';
import { HomeSponsorLogoStrip } from './homepage-sponsors';
import { HomeCtaFaqSection } from './home-cta-faq-section';
import { Button } from '@/components/ui/button';
import { displayFont } from '@/lib/fonts';
import type { HomepageData } from '@/lib/public/home';

const platformTools = [
  { href: '/vacancies', label: 'Вакансии', description: 'Открытые позиции в барах и кофейнях СКФО — от бариста до управляющего', icon: BriefcaseBusiness },
  { href: '/education', label: 'Обучение', description: 'Интенсивы и профессиональные курсы для специалистов и команд', icon: GraduationCap },
  { href: '/articles', label: 'Материалы', description: 'Разборы, интервью и практические кейсы по работе с баром', icon: BookOpen },
  { href: '/suppliers', label: 'Поставщики', description: 'Проверенные обжарщики, дистрибьюторы и сервисные компании', icon: PackageCheck },
  { href: '/consulting', label: 'Консалтинг', description: 'Экспертная помощь при открытии, запуске и развитии заведения', icon: Users },
  { href: '/tools/cost-calculator', label: 'Калькулятор', description: 'Себестоимость напитка, наценка и рекомендованная цена', icon: Calculator }
];

type HomepageClientProps = {
  data: HomepageData;
};

export function HomepageClient({ data }: HomepageClientProps) {
  return (
    <div className="overflow-x-hidden">
      <HomeHeroRouter stats={data.stats} />

      <section className="background-zone background-zone-beige scroll-mt-28 border-b border-[var(--line)] py-14 md:py-20" id="home-fresh">
        <div className="container">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className={`${displayFont.className} text-[2.35rem] font-semibold leading-none text-[var(--text)] md:text-[3.2rem]`}>
                Актуальное
              </h2>
            </div>
            <Button className="px-0 text-sm tracking-normal" href="/articles" variant="link">
              Смотреть всё
              <ArrowUpRight size={16} />
            </Button>
          </div>
          <div className="home-current-layout flex flex-col gap-4">
            <FeaturedNowCard card={data.article} />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 [&>a:last-child]:border-b-0 sm:[&>a:last-child]:border-b">
              <NowCard actionLabel={data.vacancy ? 'Откликнуться' : 'Все вакансии'} card={data.vacancy} href="/vacancies" icon={BriefcaseBusiness} label="Вакансии" />
              <NowCard actionLabel="Читать" card={data.secondaryArticle} fallbackMeta="Другие материалы" href="/articles" icon={BookOpen} label="Материалы" />
              <NowCard actionLabel={data.supplier ? 'Открыть' : 'Смотреть поставщиков'} card={data.supplier} href="/suppliers" icon={PackageCheck} label="Поставщики" />
            </div>
          </div>
        </div>
      </section>

      <HomeEventsStrip event={data.event} />

      <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-12 md:py-16" id="home-tools">
        <div className="container">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">Разделы платформы</p>
              <h2 className={`${displayFont.className} mt-2 text-[2rem] font-semibold leading-none text-[var(--text)] md:text-[2.6rem]`}>
                Всё для вашего заведения
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
            {platformTools.map((tool) => (
              <Link
                className="group relative flex flex-col gap-4 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface-card)] p-5 transition-[border-color,background-color,box-shadow] duration-[var(--motion-duration-base)] hover:border-[var(--accent)]/50 hover:bg-[var(--surface-card-hover)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] md:p-6"
                href={tool.href}
                key={tool.href}
              >
                <span className="absolute inset-x-0 top-0 h-[3px] rounded-t-[var(--radius-lg)] bg-[var(--accent)] opacity-0 transition-opacity duration-[var(--motion-duration-base)] group-hover:opacity-100" />
                <span className="flex items-start justify-between gap-2">
                  <span className="grid h-11 w-11 place-items-center rounded-[var(--radius-md)] bg-[var(--accent-soft)] transition-colors duration-[var(--motion-duration-base)] group-hover:bg-[var(--accent)]/15">
                    <tool.icon className="text-[var(--accent)]" size={22} strokeWidth={1.5} />
                  </span>
                  <ArrowUpRight className="mt-1 shrink-0 text-[var(--muted)] transition-[transform,color] duration-[var(--motion-duration-base)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent)]" size={16} strokeWidth={1.8} />
                </span>
                <span className="flex flex-col gap-1.5">
                  <span className="text-base font-semibold text-[var(--text)]">{tool.label}</span>
                  <span className="text-sm leading-[1.55] text-[var(--muted)]">{tool.description}</span>
                </span>
              </Link>
            ))}
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
              {data.ctaBlock?.description ?? 'Обучение, вакансии, поставщики и инструменты — всё в одном месте для специалистов и заведений Северного Кавказа.'}
            </p>
          </div>
          <div className="mt-6 flex flex-col items-start gap-3 md:mt-0 md:items-stretch">
            {data.ctaBlock?.helperText ? (
              <p className="max-w-[18rem] text-xs font-semibold uppercase tracking-[0.14em] text-[var(--editorial-dark-muted)]">
                {data.ctaBlock.helperText}
              </p>
            ) : null}
            <Button
              className="w-full max-w-[17rem] rounded-[var(--radius-md)] border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)] shadow-none hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]"
              href={data.ctaBlock?.primaryHref ?? '/vacancies'}
            >
              {data.ctaBlock?.primaryLabel ?? 'Смотреть вакансии'}
            </Button>
            {(data.ctaBlock?.secondaryHref && data.ctaBlock?.secondaryLabel) ? (
              <Link
                className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-sm)] text-sm font-semibold text-[var(--editorial-dark-muted)] transition hover:text-[var(--editorial-dark-text)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                href={data.ctaBlock.secondaryHref}
              >
                {data.ctaBlock.secondaryLabel}
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </Link>
            ) : (
              <Link
                className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-sm)] text-sm font-semibold text-[var(--editorial-dark-muted)] transition hover:text-[var(--editorial-dark-text)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                href="/contacts"
              >
                Написать команде
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
