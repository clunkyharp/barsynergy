import Image from 'next/image';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Coffee,
  PackageCheck,
  Calculator,
  type LucideIcon
} from 'lucide-react';
import { HomeCtaFaqSection } from './home-cta-faq-section';
import { ToolTeaser } from './platform-ui';
import { SocialLinkCard } from './social-card';
import { PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { accentFont, displayFont } from '@/lib/fonts';
import type { HomepageData, HomepageLiveCard, HomepageSocialBlock } from '@/lib/public/home';

type HomepageClientProps = {
  data: HomepageData;
};

function compactMeta(card: HomepageLiveCard) {
  return card.meta.filter(Boolean).slice(0, 2).join(' / ');
}

function InlineIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-sm)] bg-[var(--accent)] text-white">
      <Icon size={20} strokeWidth={1.8} />
    </span>
  );
}

const homeSectionCards = [
  {
    title: 'Обучение',
    description: 'Курсы для бариста и обучение команды: от базовой экстракции до авторских молочных программ.',
    href: '/education',
    status: 'Открыто',
    icon: Coffee
  },
  {
    title: 'Афиша',
    description: 'Каппинги, открытые тренинги, отраслевые встречи и чемпионаты бариста по всему СКФО.',
    href: '/events',
    status: 'Сезон',
    icon: CalendarDays
  },
  {
    title: 'Вакансии',
    description: 'Specialty-кофейни и кофейные бары ищут бариста, управляющих и технологов.',
    href: '/vacancies',
    status: 'Найм',
    icon: BriefcaseBusiness
  },
  {
    title: 'Материалы',
    description: 'Экстракция, обжарка, себестоимость напитка, работа с зерном: читать и применять сразу.',
    href: '/articles',
    status: 'Редакция',
    icon: BookOpen
  },
  {
    title: 'Калькулятор',
    description: 'Считает себестоимость эспрессо, альтернативы или коктейля и показывает рекомендованную цену.',
    href: '/tools/cost-calculator',
    status: 'Инструмент',
    icon: Calculator
  },
  {
    title: 'Поставщики',
    description: 'Обжарщики, дистрибьюторы зерна и оборудования, которые работают с кофейными барами СКФО.',
    href: '/suppliers',
    status: 'Каталог',
    icon: PackageCheck
  }
] as const;

function HomeStatsLine({ stats }: { stats: HomepageData['stats'] }) {
  const statItems = [
    { value: stats.vacancies, label: 'вакансии' },
    { value: stats.suppliers, label: 'поставщика' },
    { value: stats.articles, label: 'материалов' }
  ].filter((item) => item.value > 0);

  if (statItems.length === 0) {
    return null;
  }

  return (
    <dl className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-[13px] text-[rgba(255,253,249,0.66)]">
      {statItems.map((item) => (
        <div className="flex items-baseline gap-2 border-r border-[rgba(255,253,249,0.24)] pr-5 last:border-r-0 last:pr-0" key={item.label}>
          <dt className="order-2 uppercase tracking-[0.08em]">{item.label}</dt>
          <dd aria-label={`${item.value} ${item.label}`} className="order-1 text-[1.55rem] font-bold leading-none tabular-nums text-[var(--accent)]">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function HomeHeroRouter({ stats }: { stats: HomepageData['stats'] }) {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden border-b border-[var(--line)] bg-[var(--editorial-dark-surface)] text-[var(--editorial-dark-text)] md:min-h-[720px] lg:min-h-[760px]"
    >
      <div className="absolute inset-0 z-0">
        <Image
          alt="Кофейный бар с эспрессо-машиной и полками"
          className="object-cover object-[center_52%] saturate-[0.94] contrast-[1.02]"
          fill
          priority
          sizes="100vw"
          src="/images/home/hero-coffee-counter-haberdoedas.jpg"
        />
      </div>
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1]"
        style={{
          background:
            'linear-gradient(90deg, rgba(18,14,12,0.98), rgba(18,14,12,0.83) 43%, rgba(18,14,12,0.32) 74%, rgba(18,14,12,0.14)), linear-gradient(0deg, rgba(18,14,12,0.68), rgba(18,14,12,0.08) 54%), radial-gradient(circle at 18% 34%, rgba(200,132,42,0.16), transparent 24rem)'
        }}
      />
      <div className="container relative z-[2] py-24 md:py-32">
        <div className="max-w-[58rem]">
          <PublicEyebrow className={`${accentFont.className} tracking-[0.18em]`} tone="inverse">
            BARSYNERGY / Барная индустрия СКФО
          </PublicEyebrow>
          <h1 className={`${displayFont.className} mt-4 max-w-[44rem] text-[clamp(2.8rem,5vw,4.8rem)] font-semibold leading-[1.04] text-balance text-[var(--editorial-dark-text)] max-[640px]:max-w-[15ch] max-[640px]:text-[clamp(2.25rem,9.6vw,2.55rem)]`} id="home-hero-title">
            Платформа для кофейных баров СКФО
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[var(--editorial-dark-muted)] md:text-base">
            Обучение, вакансии, поставщики, события и инструменты — всё в одном месте для бариста, команд и заведений региона.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button className="min-h-12 rounded-[var(--radius-sm)] px-8 text-[13px] uppercase tracking-[0.1em]" href="/education">
              Найти обучение
            </Button>
            <Link
              className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-sm)] px-3 text-[13px] font-semibold uppercase tracking-[0.1em] text-[var(--editorial-dark-muted)] transition-colors hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
              href="/events"
            >
              Смотреть афишу
              <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.8} />
            </Link>
          </div>
          <HomeStatsLine stats={stats} />
        </div>
      </div>
    </section>
  );
}

function HomeSectionCards() {
  return (
    <section className="background-zone background-zone-ivory scroll-mt-28 border-b border-[var(--line)] py-10 md:py-14" id="home-sections" style={{ '--zone-surface': 'var(--background-band)' } as CSSProperties}>
      <div className="container">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.48fr)_minmax(0,1.52fr)]">
          <div className="xl:pr-4">
            <PublicEyebrow>Разделы</PublicEyebrow>
            <PublicDisplayTitle className="mt-4 md:text-[44px]">Разделы платформы</PublicDisplayTitle>
          </div>
          <div className="grid gap-5 md:grid-cols-2 md:gap-4 xl:grid-cols-3">
            {homeSectionCards.map((card) => {
              const Icon = card.icon;

              return (
                <Link className="home-section-card group relative min-h-[140px] rounded-[var(--radius-lg)] border border-[var(--border-strong)] bg-[var(--surface-card)] p-5 text-[var(--text)] shadow-[var(--shadow-card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]" href={card.href} key={card.title}>
                  <span className="flex items-start justify-between gap-4">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent)] text-white">
                      <Icon size={18} strokeWidth={1.5} />
                    </span>
                    <span className="rounded-[var(--radius-sm)] border border-[var(--border-default)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                      {card.status}
                    </span>
                  </span>
                  <span className={`${displayFont.className} mt-5 block text-[1.5rem] font-semibold leading-none text-[var(--text)]`}>
                    {card.title}
                  </span>
                  <span className="mt-3 block text-sm leading-6 text-[var(--muted)]">{card.description}</span>
                  <ArrowUpRight aria-hidden="true" className="absolute bottom-5 right-5 text-[var(--accent)]" size={18} strokeWidth={1.5} />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

const channelDetailsByVariant: Record<HomepageSocialBlock['variant'], { platformLabel: string; typeLabel: string }> = {
  telegram: {
    platformLabel: 'Telegram',
    typeLabel: 'Канал'
  },
  whatsapp: {
    platformLabel: 'WhatsApp',
    typeLabel: 'Связь'
  },
  instagram: {
    platformLabel: 'Instagram',
    typeLabel: 'Соцсеть'
  }
};

function CommunityChannelRows({ channels }: { channels: HomepageSocialBlock[] }) {
  return (
    <div className="home-community-panel scroll-mt-28 border-t border-[var(--line)] pt-6 md:pt-7" id="home-community">
      <div>
        <div className="max-w-2xl">
          <p className={`${accentFont.className} text-xs uppercase tracking-[0.2em] text-[var(--accent)]`}>Сообщество</p>
          <h3 className={`${displayFont.className} mt-3 text-[2rem] font-semibold leading-[1.02] text-[var(--editorial-dark-text)] md:text-[2.8rem]`}>
            Каналы BARSYNERGY
          </h3>
        </div>
      </div>

      <div className="mt-6 grid items-stretch gap-3 md:grid-cols-3">
        {channels.map((channel) => {
          const details = channelDetailsByVariant[channel.variant];

          return (
            <SocialLinkCard
              actionLabel={channel.actionLabel}
              description={channel.description}
              helperText={channel.helperText}
              href={channel.href}
              key={channel.id}
              logoSrc={channel.logoPath}
              serviceName={details.platformLabel}
              title={channel.title}
              typeLabel={details.typeLabel}
              variant={channel.variant}
            />
          );
        })}
      </div>
    </div>
  );
}

function HomeSponsorLogoStrip({ sponsors }: { sponsors: HomepageData['generalSponsors'] }) {
  return (
    <section className="background-zone background-zone-sponsor render-deferred-section border-t border-[var(--line)] py-14" aria-labelledby="home-sponsors-title">
      <div className="container">
        <div className="mx-auto max-w-[860px]">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            <span className="h-px bg-[rgba(168,124,56,0.38)]" aria-hidden="true" />
            <h2 className={`${accentFont.className} text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]`} id="home-sponsors-title">
              Генеральные спонсоры сезона
            </h2>
            <span className="h-px bg-[rgba(168,124,56,0.38)]" aria-hidden="true" />
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {sponsors.map((sponsor) => (
              <article
                className="grid min-w-0 justify-items-center rounded-[10px] border border-[var(--editorial-dark-border)] bg-[rgb(255_255_255_/_0.035)] px-5 py-7 text-center"
                key={sponsor.id}
              >
                <div className="flex min-h-[10rem] w-full items-center justify-center">
                  {sponsor.logoSrc ? (
                    <Image
                      alt={sponsor.logoAlt}
                      className="h-auto max-h-36 w-auto max-w-[18rem] object-contain"
                      height={160}
                      sizes="288px"
                      src={sponsor.logoSrc}
                      width={288}
                    />
                  ) : (
                    <span className={`${displayFont.className} text-center text-3xl font-semibold leading-none text-[var(--editorial-dark-text)]`}>
                      {sponsor.name}
                    </span>
                  )}
                </div>
                <div className="mt-5 min-w-0">
                  <h3 className="text-base font-semibold text-[var(--editorial-dark-text)]">{sponsor.name}</h3>
                  <p className="mx-auto mt-2 max-w-[24rem] text-sm leading-6 text-[var(--editorial-dark-muted)]">
                    {sponsor.shortDescription}
                  </p>
                  <Link className="mt-3 inline-flex text-sm font-semibold text-[var(--accent)] hover:text-[var(--accent-strong)]" href={`/general-sponsors#general-sponsor-${sponsor.slug}`}>
                    Смотреть профиль →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function NowCard({
  label,
  card,
  href,
  actionLabel,
  fallbackMeta = 'Раздел платформы',
  icon
}: {
  label: string;
  card?: HomepageLiveCard;
  href: string;
  actionLabel: string;
  fallbackMeta?: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      className="group grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 border-b border-[var(--line)] py-3 transition-[background-color,border-color,color,box-shadow] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[var(--accent)]/34 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] motion-reduce:transition-none sm:flex sm:h-full sm:min-h-[11.5rem] sm:flex-col sm:rounded-[var(--radius-lg)] sm:border sm:border-[var(--card-border)] sm:bg-[var(--surface-card)] sm:p-4 sm:shadow-[var(--shadow-card)] sm:hover:border-[var(--card-border-hover)] sm:hover:bg-[var(--surface-card-hover)]"
      href={card?.href ?? href}
    >
      <span className="row-span-4 sm:flex sm:items-start sm:justify-between sm:gap-3">
        <InlineIcon icon={icon} />
        <span className="hidden text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] sm:inline">{label}</span>
      </span>
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] sm:hidden">{label}</span>
      <h3 className={`${displayFont.className} home-current-support-title mt-1 text-[1.22rem] font-semibold leading-[1.42] text-[var(--text)] group-hover:text-[var(--accent)] sm:mt-5 sm:text-2xl sm:leading-[1.2]`}>
        {card?.title ?? label}
      </h3>
      <p className="mt-1 text-sm leading-5 text-[var(--muted)] sm:mt-3 sm:min-h-10 sm:leading-6">{card ? compactMeta(card) : fallbackMeta}</p>
      <span className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] sm:mt-auto sm:pt-5">
        {actionLabel}
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

function normalizedMetaKey(value: string) {
  return value.trim().toLowerCase();
}

function getVisibleFeaturedMeta(card: HomepageLiveCard) {
  const hiddenMeta = new Set(['Открытый доступ', card.eyebrow].map(normalizedMetaKey));
  const seenMeta = new Set<string>();

  return card.meta
    .map((entry) => entry.trim())
    .filter((entry) => {
      if (!entry) {
        return false;
      }

      const key = normalizedMetaKey(entry);

      if (hiddenMeta.has(key) || seenMeta.has(key)) {
        return false;
      }

      seenMeta.add(key);
      return true;
    })
    .slice(0, 3);
}

const featuredKindConfig: Record<string, { icon: LucideIcon; label: string }> = {
  article: { icon: BookOpen, label: 'Материал' },
  course: { icon: Coffee, label: 'Курс' },
  event: { icon: CalendarDays, label: 'Событие' },
  vacancy: { icon: BriefcaseBusiness, label: 'Вакансия' },
  supplier: { icon: PackageCheck, label: 'Поставщик' }
};

function FeaturedNowCard({ card }: { card: HomepageLiveCard }) {
  const visibleMeta = getVisibleFeaturedMeta(card);
  const supportMeta = card.meta.filter(Boolean).slice(0, 2);
  const kindInfo = featuredKindConfig[card.kind] ?? { icon: BookOpen, label: 'Материал' };
  const KindIcon = kindInfo.icon;

  return (
    <Link
      className="public-card-shell featured-now-card group grid overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] md:rounded-[var(--radius-xl)] lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1fr)]"
      href={card.href}
    >
      <span
        aria-hidden="true"
        className="featured-now-media min-h-[118px] bg-[linear-gradient(135deg,rgba(153,44,38,0.13),rgba(20,20,18,0.08))] bg-cover bg-center grayscale-[0.08] transition-transform duration-[var(--motion-duration-media)] ease-[var(--motion-ease-move)] group-hover:scale-[1.02] motion-reduce:transition-none sm:min-h-[150px] lg:min-h-full"
        style={card.imageUrl ? { backgroundImage: `url("${card.imageUrl}")` } : undefined}
      />
      <span className="featured-now-content flex min-w-0 flex-col p-4 md:p-6">
        <span className="featured-now-meta-row flex flex-wrap gap-2">
          <span className="public-card-label w-fit">
            {card.eyebrow}
          </span>
          {visibleMeta.map((entry) => (
            <span
              className="public-card-meta w-fit text-[var(--muted)]"
              key={entry}
            >
              {entry}
            </span>
          ))}
        </span>
        <span className={`${displayFont.className} featured-now-title mt-3 block text-[1.8rem] font-semibold leading-none text-[var(--text)] md:mt-4 md:text-[2.45rem]`}>
          {card.title}
        </span>
        <span className="featured-now-summary mt-3 block max-h-[4.5rem] max-w-2xl overflow-hidden text-sm leading-6 text-[var(--muted)] md:mt-4 md:max-h-[5.2rem] md:leading-7 md:text-[15px]">{card.summary}</span>
        <span className="featured-now-support mt-4 inline-flex items-center gap-2.5 rounded-[var(--radius-sm)] bg-[var(--surface-card-muted)] px-3 py-2.5 text-xs md:mt-5">
          <KindIcon size={16} strokeWidth={1.5} className="shrink-0 text-[var(--accent)]" />
          <span className="font-semibold text-[var(--text)]">{kindInfo.label}</span>
          {supportMeta.length > 0 && (
            <>
              <span className="h-3 w-px bg-[var(--line)]" aria-hidden="true" />
              <span className="text-[var(--muted)]">{supportMeta.join(' · ')}</span>
            </>
          )}
        </span>
        <span className="featured-now-footer mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] pt-4 md:pt-5">
          <span className="featured-now-action inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
            {card.actionLabel}
            <ArrowUpRight className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] group-hover:translate-x-1 motion-reduce:transition-none" size={16} />
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-[var(--muted)]">
            {kindInfo.label}
          </span>
        </span>
      </span>
    </Link>
  );
}

function HomeEventsStrip({ event }: { event: HomepageLiveCard }) {
  return (
    <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-10 md:py-14" id="home-events">
      <div className="container">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 className={`${displayFont.className} text-[2.35rem] font-semibold leading-none text-[var(--text)] md:text-[3.2rem]`}>
            Ближайшие события
          </h2>
          <Button className="px-0 text-sm tracking-normal" href="/events" variant="link">
            Вся афиша
            <ArrowUpRight size={16} />
          </Button>
        </div>
        <div className="home-events-scroll flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
          {[event, fallbackEventFormats.intensive, fallbackEventFormats.cupping].map((item) => (
            <Link
              className="home-event-card min-w-[18rem] rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] p-5 text-[var(--text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] md:min-w-0"
              href={item.href}
              key={item.title}
            >
              <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{item.eyebrow}</span>
              <span className={`${displayFont.className} mt-4 block text-[1.7rem] font-semibold leading-none text-[var(--text)]`}>{item.title}</span>
              <span className="mt-3 block text-sm leading-6 text-[var(--muted)]">{item.summary}</span>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
                {item.actionLabel}
                <ArrowUpRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const fallbackEventFormats: Record<'intensive' | 'cupping', HomepageLiveCard> = {
  intensive: {
    kind: 'event',
    eyebrow: 'Открытый тренинг',
    title: 'Тренинг по экстракции',
    summary: 'Формат для бариста и команд: помол, рецепт, стабильность эспрессо и работа на смене.',
    meta: ['Формат'],
    href: '/events',
    actionLabel: 'Смотреть событие',
    isFallback: true
  },
  cupping: {
    kind: 'event',
    eyebrow: 'Каппинг',
    title: 'Дегустация зерна',
    summary: 'Встреча с обжарщиками и поставщиками: профиль, обработка, цена и поставки в регионе.',
    meta: ['Формат'],
    href: '/events',
    actionLabel: 'Смотреть событие',
    isFallback: true
  }
};

export function HomepageClient({ data }: HomepageClientProps) {
  return (
    <div className="overflow-x-hidden">
      <HomeHeroRouter stats={data.stats} />

      <HomeSectionCards />

      <HomeEventsStrip event={data.event} />

      <section className="background-zone background-zone-beige scroll-mt-28 border-b border-[var(--line)] py-14 md:py-20" id="home-fresh">
        <div className="container">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className={`${displayFont.className} text-[2.35rem] font-semibold leading-none text-[var(--text)] md:text-[3.2rem]`}>
                Актуальное
              </h2>
            </div>
            <Button className="px-0 text-sm tracking-normal" href="/articles" variant="link">
              Все материалы
              <ArrowUpRight size={16} />
            </Button>
          </div>
          <div className="home-current-layout grid gap-4 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,0.38fr)]">
            <FeaturedNowCard card={data.article} />
            <div className="home-current-support-grid sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-1 [&>a:last-child]:border-b-0">
              <NowCard actionLabel="Откликнуться" card={data.vacancy} href="/vacancies" icon={BriefcaseBusiness} label="Вакансии" />
              <NowCard actionLabel="Читать" card={data.secondaryArticle} fallbackMeta="Другие материалы" href="/articles" icon={BookOpen} label="Материалы" />
              <NowCard actionLabel="Смотреть поставщиков" card={data.supplier} href="/suppliers" icon={PackageCheck} label="Поставщики" />
            </div>
          </div>
        </div>
      </section>

      {data.generalSponsors.length > 0 ? <HomeSponsorLogoStrip sponsors={data.generalSponsors} /> : null}

      {data.calculatorTeaser ? <ToolTeaser teaser={data.calculatorTeaser} /> : null}

      <HomeCtaFaqSection />

      {data.ctaBlock ? (
        <section className="background-zone background-zone-cta render-deferred-section border-b border-[var(--line)] py-10 md:py-14" id="home-about">
          <div className="home-about-panel container rounded-[var(--radius-xl)] border border-[var(--editorial-dark-border)] bg-[var(--editorial-dark-surface)] p-6 shadow-[0_24px_72px_rgba(0,0,0,0.22)] md:grid md:grid-cols-[minmax(0,1fr)_minmax(15rem,0.36fr)] md:items-center md:gap-7 md:p-8">
            <div>
              <h2 className={`${displayFont.className} text-[2.1rem] font-semibold leading-[1.02] text-[var(--editorial-dark-text)] md:text-[3rem]`}>
                {data.ctaBlock.title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--editorial-dark-muted)]">
                {data.ctaBlock.description}
              </p>
            </div>
            <div className="mt-6 flex flex-col items-start gap-3 md:mt-0 md:items-stretch">
              {data.ctaBlock.helperText ? (
                <p className="max-w-[18rem] text-xs font-semibold uppercase tracking-[0.14em] text-[var(--editorial-dark-muted)]">
                  {data.ctaBlock.helperText}
                </p>
              ) : null}
              <Button
                className="w-full max-w-[17rem] rounded-[var(--radius-md)] border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-contrast)] shadow-none hover:border-[var(--accent-strong)] hover:bg-[var(--accent-strong)]"
                href={data.ctaBlock.primaryHref}
              >
                {data.ctaBlock.primaryLabel}
              </Button>
              {data.ctaBlock.secondaryHref && data.ctaBlock.secondaryLabel ? (
                <Link
                  className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-sm)] text-sm font-semibold text-[var(--editorial-dark-muted)] transition hover:text-[var(--editorial-dark-text)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                  href={data.ctaBlock.secondaryHref}
                >
                  {data.ctaBlock.secondaryLabel}
                  <ArrowUpRight size={16} />
                </Link>
              ) : null}
            </div>
            {data.socialBlocks.length > 0 ? (
              <div className="md:col-span-2">
                <CommunityChannelRows channels={data.socialBlocks} />
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

    </div>
  );
}
