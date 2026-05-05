'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Calculator,
  CalendarDays,
  GraduationCap,
  Handshake,
  PackageCheck,
  Star,
  Store,
  Users,
  type LucideIcon
} from 'lucide-react';
import { GeneralSponsorCard } from './general-sponsor-card';
import { SocialCard } from './social-card';
import { ToolTeaser } from './platform-ui';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { accentFont, displayFont } from '@/lib/fonts';
import type { HomepageAudienceCardBlock, HomepageData, HomepageLiveCard } from '@/lib/public/home';

type HomepageClientProps = {
  data: HomepageData;
};

type Entry = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const quickEntries: Entry[] = [
  {
    title: 'Учиться',
    description: 'Курсы, лекции и программы для специалистов и команд.',
    href: '/education',
    icon: GraduationCap
  },
  {
    title: 'События',
    description: 'Афиша встреч, дегустаций и событий для индустрии.',
    href: '/events',
    icon: CalendarDays
  },
  {
    title: 'Знания',
    description: 'Статьи, интервью, кейсы и рабочие разборы.',
    href: '/articles',
    icon: BookOpen
  },
  {
    title: 'Вакансии',
    description: 'Работа в барах, ресторанах, кофейнях и дистрибуции.',
    href: '/vacancies',
    icon: BriefcaseBusiness
  },
  {
    title: 'Поставщики',
    description: 'Компании, сервисы и контакты для ежедневной работы.',
    href: '/suppliers',
    icon: PackageCheck
  },
  {
    title: 'Партнёры',
    description: 'Совместные проекты, бренды и региональные инициативы.',
    href: '/partners',
    icon: Handshake
  },
  {
    title: 'Инструменты',
    description: 'Калькуляторы и шаблоны для учёта и меню.',
    href: '/tools/cost-calculator',
    icon: Calculator
  },
  {
    title: 'Спонсорство',
    description: 'Форматы для брендов и партнёров индустрии.',
    href: '/general-sponsors',
    icon: Star
  }
];

const audienceIconByKey: Record<string, LucideIcon> = {
  users: Users,
  store: Store,
  star: Star,
  brand: Star,
  venue: Store,
  specialist: Users
};

function compactMeta(card: HomepageLiveCard) {
  return card.meta.filter(Boolean).slice(0, 2).join(' / ');
}

function InlineIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
      <Icon size={20} strokeWidth={1.8} />
    </span>
  );
}

function getAudienceIcon(card: HomepageAudienceCardBlock) {
  return audienceIconByKey[card.iconKey ?? ''] ?? Users;
}

function NowCard({
  label,
  card,
  href,
  actionLabel,
  icon
}: {
  label: string;
  card?: HomepageLiveCard;
  href: string;
  actionLabel: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      className="group rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4 transition hover:border-[var(--accent)]/34 hover:bg-[var(--surface-wash-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
      href={card?.href ?? href}
    >
      <div className="flex items-start justify-between gap-3">
        <InlineIcon icon={icon} />
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">{label}</span>
      </div>
      <h3 className={`${displayFont.className} mt-5 text-2xl font-semibold leading-none text-[var(--text)] group-hover:text-[var(--accent)]`}>
        {card?.title ?? label}
      </h3>
      <p className="mt-3 min-h-10 text-sm leading-6 text-[var(--muted)]">{card ? compactMeta(card) : 'Открыть инструмент'}</p>
      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
        {actionLabel}
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

function FeaturedNowCard({ card }: { card: HomepageLiveCard }) {
  return (
    <Link
      className="group grid min-h-[360px] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[color-mix(in_oklab,var(--surface),white_20%)] shadow-[0_18px_54px_rgba(20,20,18,0.045)] transition hover:border-[var(--accent)]/30 hover:bg-[color-mix(in_oklab,var(--surface),white_26%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]"
      href={card.href}
    >
      <span
        aria-hidden="true"
        className="min-h-[220px] bg-[linear-gradient(135deg,rgba(153,44,38,0.13),rgba(20,20,18,0.08))] bg-cover bg-center grayscale-[0.08] transition-transform duration-700 group-hover:scale-[1.02] lg:min-h-full"
        style={card.imageUrl ? { backgroundImage: `url("${card.imageUrl}")` } : undefined}
      />
      <span className="flex min-w-0 flex-col justify-between p-6 md:p-8">
        <span>
          <span className="inline-flex w-fit rounded-[var(--radius-sm)] border border-[var(--accent)]/22 bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
            {card.eyebrow}
          </span>
          <span className={`${displayFont.className} mt-6 block text-[2.4rem] font-semibold leading-none text-[var(--text)] md:text-[3.25rem]`}>
            {card.title}
          </span>
          <span className="mt-5 block max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-[15px]">{card.summary}</span>
          {card.meta.length > 0 ? (
            <span className="mt-5 flex flex-wrap gap-2">
              {card.meta.slice(0, 3).map((entry) => (
                <span
                  className="rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"
                  key={entry}
                >
                  {entry}
                </span>
              ))}
            </span>
          ) : null}
        </span>
        <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
          {card.actionLabel}
          <ArrowUpRight className="transition-transform group-hover:translate-x-1" size={16} />
        </span>
      </span>
    </Link>
  );
}

export function HomepageClient({ data }: HomepageClientProps) {
  const hasAudienceCards = data.audienceCards.length > 0;

  return (
    <div className="overflow-x-hidden">
      <section className="background-zone background-zone-hero border-b border-[var(--line)] py-8 md:py-12">
        <div className={`container grid gap-8 xl:items-start ${hasAudienceCards ? 'xl:grid-cols-[minmax(0,0.86fr)_minmax(28rem,0.94fr)]' : ''}`}>
          <div className="min-w-0">
            <p className={`${accentFont.className} text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]`}>
              {data.hero.eyebrow}
            </p>
            <h1 className={`${displayFont.className} mt-6 max-w-5xl text-[clamp(3.1rem,6.6vw,6.7rem)] font-semibold leading-[1.08] text-[var(--text)]`}>
              {data.hero.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--text)] md:text-lg">
              {data.hero.description}
            </p>
            {data.hero.signals.length > 0 ? (
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {data.hero.signals.map((item) => (
                  <div className="border-t border-[var(--line)] pt-4" key={`${item.value}-${item.label}`}>
                    <p className="text-sm font-semibold leading-6 text-[var(--text)]">{item.value}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{item.label}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {hasAudienceCards ? (
            <Panel className="border-[var(--border-default)] bg-[var(--surface-wash)]" padding="lg">
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text)]">Что нужно сделать</p>
              </div>
              <div className="mt-5 grid gap-3">
                {data.audienceCards.map((card) => {
                  const AudienceIcon = getAudienceIcon(card);

                  return (
                    <Link
                      className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4 transition hover:border-[var(--accent)]/34 hover:bg-[var(--surface-wash-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                      href={card.href}
                      key={card.id}
                    >
                      <InlineIcon icon={AudienceIcon} />
                      <span className="min-w-0">
                        <span className={`${displayFont.className} block text-[1.65rem] font-semibold leading-none text-[var(--text)]`}>
                          {card.title}
                        </span>
                        <span className="mt-2 block text-sm leading-6 text-[var(--muted)]">{card.description}</span>
                        {card.proof ? <span className="mt-3 block text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">{card.proof}</span> : null}
                      </span>
                      <span className="text-lg text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)]">→</span>
                    </Link>
                  );
                })}
              </div>
            </Panel>
          ) : null}
        </div>
      </section>

      <section className="background-zone background-zone-beige border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Сейчас на сайте</p>
              <h2 className={`${displayFont.className} mt-3 text-[2.35rem] font-semibold leading-none text-[var(--text)] md:text-[3.2rem]`}>
                Что уже доступно
              </h2>
            </div>
            <Button className="px-0 text-sm tracking-normal" href="/articles" variant="ghost">
              Все материалы
              <ArrowUpRight size={16} />
            </Button>
          </div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.62fr)]">
            <FeaturedNowCard card={data.article} />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <NowCard actionLabel="Подробнее" card={data.event} href="/events" icon={CalendarDays} label="Событие" />
              <NowCard actionLabel="Откликнуться" card={data.vacancy} href="/vacancies" icon={BriefcaseBusiness} label="Вакансия" />
              <NowCard actionLabel="Читать" card={data.article} href="/articles" icon={BookOpen} label="Материал" />
              <NowCard actionLabel="Связаться" card={data.supplier} href="/suppliers" icon={PackageCheck} label="Поставщик" />
            </div>
          </div>
        </div>
      </section>

      <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-10 md:py-14" id="home-actions">
        <div className="container">
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4 shadow-[0_18px_54px_rgba(20,20,18,0.045)] md:p-5">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Разделы</p>
                <h2 className={`${displayFont.className} mt-3 text-[2.1rem] font-semibold leading-[1.04] text-[var(--text)] md:text-[2.8rem]`}>
                  Куда перейти
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
                Перейдите в нужный раздел: обучение, события, материалы, вакансии, поставщики или партнёрство.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {quickEntries.map((entry) => {
                const EntryIcon = entry.icon;

                return (
                  <Link
                    className="group grid min-h-[118px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4 transition hover:border-[var(--accent)]/34 hover:bg-[var(--surface-wash-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)]"
                    href={entry.href}
                    key={entry.title}
                  >
                    <EntryIcon className="text-[var(--accent)]" size={24} strokeWidth={1.75} />
                    <span className="min-w-0">
                      <span className={`${displayFont.className} block text-[1.45rem] font-semibold leading-[1.05] text-[var(--text)]`}>
                        {entry.title}
                      </span>
                      <span className="mt-3 block text-sm leading-6 text-[var(--muted)]">{entry.description}</span>
                    </span>
                    <span className="text-lg text-[var(--muted)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)]">→</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {data.calculatorTeaser ? <ToolTeaser teaser={data.calculatorTeaser} /> : null}

      {hasAudienceCards ? (
        <section className="background-zone background-zone-gray border-b border-[var(--line)] py-10 md:py-14">
          <div className="container">
            <div className="mb-7 flex items-center gap-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text)]">Кому это полезно</p>
              <span className="h-px flex-1 bg-[var(--line)]" />
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {data.audienceCards.map((card) => {
                const AudienceIcon = getAudienceIcon(card);

                return (
                  <Link
                    className="group grid min-h-[220px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] transition hover:border-[var(--accent)]/34 hover:bg-[var(--surface-wash-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] md:grid-cols-[13rem_minmax(0,1fr)] lg:grid-cols-1"
                    href={card.href}
                    key={card.id}
                  >
                    <span className="relative block aspect-[4/3] min-h-44 bg-[var(--surface-muted)] md:aspect-[4/3] lg:aspect-[16/10]">
                      {card.imagePath ? (
                        <Image
                          alt=""
                          className="object-cover"
                          fill
                          loading="eager"
                          sizes="(min-width: 1280px) 13rem, (min-width: 1024px) 31vw, (min-width: 768px) 13rem, 92vw"
                          src={card.imagePath}
                        />
                      ) : null}
                    </span>
                    <span className="flex min-w-0 flex-col justify-between p-5">
                      <span>
                        <AudienceIcon className="text-[var(--accent)]" size={30} strokeWidth={1.7} />
                        <span className={`${displayFont.className} mt-5 block text-[2rem] font-semibold leading-none text-[var(--text)]`}>
                          {card.title}
                        </span>
                        <span className="mt-3 block text-sm leading-6 text-[var(--muted)]">{card.description}</span>
                      </span>
                      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
                        {card.actionLabel} <span aria-hidden="true">→</span>
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {data.generalSponsors.length > 0 ? (
        <section className="background-zone background-zone-sponsor border-b border-[var(--line)] py-10 md:py-14">
          <div className="container">
            <div className="mb-7 flex items-center gap-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text)]">Генеральный спонсор</p>
              <span className="h-px flex-1 bg-[var(--line)]" />
            </div>
            <div className="grid gap-5">
              {data.generalSponsors.map((sponsor) => (
                <GeneralSponsorCard key={sponsor.id} sponsor={sponsor} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {data.socialBlocks.length > 0 ? (
        <section className="background-zone background-zone-social border-b border-[var(--line)] py-10 md:py-14">
          <div className="container">
            <div className="max-w-3xl">
              <p className={`${accentFont.className} text-sm uppercase tracking-[0.24em] text-[var(--accent)]`}>Соцсети</p>
              <h2 className={`${displayFont.className} display-tight mt-5 max-w-5xl text-[38px] md:text-[58px] xl:text-[70px]`}>
                BARSYNERGY в соцсетях
              </h2>
            </div>

            <div className="mx-auto mt-8 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3 xl:gap-5">
              {data.socialBlocks.map((promo) => (
                <SocialCard
                  buttonLabel={promo.actionLabel}
                  description={promo.description}
                  helperText={promo.helperText}
                  href={promo.href}
                  key={promo.id}
                  logoSrc={promo.logoPath}
                  title={promo.title}
                  variant={promo.variant}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {data.ctaBlock ? (
        <section className="background-zone background-zone-cta border-b border-[var(--line)] py-10 md:py-14" id="home-about">
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
                className="w-full max-w-[17rem] rounded-[var(--radius-md)] border-[var(--accent-burgundy)] bg-[var(--accent-burgundy)] text-[var(--accent-burgundy-contrast)] shadow-none hover:border-[var(--accent-burgundy-strong)] hover:bg-[var(--accent-burgundy-strong)]"
                href={data.ctaBlock.primaryHref}
              >
                {data.ctaBlock.primaryLabel}
              </Button>
              {data.ctaBlock.secondaryHref && data.ctaBlock.secondaryLabel ? (
                <Link
                  className="inline-flex min-h-10 items-center gap-2 rounded-[var(--radius-sm)] text-sm font-semibold text-[var(--editorial-dark-muted)] transition hover:text-[var(--editorial-dark-text)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-burgundy)]"
                  href={data.ctaBlock.secondaryHref}
                >
                  {data.ctaBlock.secondaryLabel}
                  <ArrowUpRight size={16} />
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
