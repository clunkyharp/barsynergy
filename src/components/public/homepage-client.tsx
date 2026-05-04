'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
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
import { ToolTeaser } from './platform-ui';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { accentFont, displayFont } from '@/lib/fonts';
import { GENERAL_SPONSORS } from '@/lib/public/general-sponsors';
import type { HomepageData, HomepageLiveCard } from '@/lib/public/home';
import { cn } from '@/lib/utils';

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
    description: 'Афиша встреч, дегустаций и профессиональных форматов.',
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

const audienceCards = [
  {
    title: 'Для специалистов',
    description: 'Учитесь, находите события и откликайтесь на подходящие роли.',
    href: '/education',
    image: '/images/home/professional-education.webp',
    icon: Users
  },
  {
    title: 'Для заведений',
    description: 'Ищите сотрудников, поставщиков и партнёров для роста сервиса.',
    href: '/suppliers',
    image: '/images/home/project-growth.webp',
    icon: Store
  },
  {
    title: 'Для брендов',
    description: 'Запускайте партнёрства, события и спонсорские форматы в регионе.',
    href: '/partners',
    image: '/images/home/community-region.webp',
    icon: Star
  }
] as const;

const socialPromos = [
  {
    name: 'Telegram',
    title: 'Следить за курсами, событиями и новыми анонсами',
    description: 'Канал для быстрых обновлений: даты, наборы, полезные материалы и новости проекта.',
    actionLabel: 'Перейти в Telegram',
    href: 'https://t.me/barsynergy',
    surfaceClassName: 'bg-[#2a86d9]',
    logoSrc: '/images/social/telegram-logo.png',
    gridClassName: 'md:col-span-1'
  },
  {
    name: 'WhatsApp',
    title: 'Задать вопрос и быстро связаться с командой',
    description: 'Если нужен короткий вопрос, быстрый контакт или вход в сообщество, переходите сразу в чат.',
    actionLabel: 'Перейти в WhatsApp',
    href: 'https://chat.whatsapp.com/GlAY6QDLeAt4jeKsAFkgu4?mode=gi_t',
    surfaceClassName: 'bg-[#238c46]',
    logoSrc: '/images/social/whatsapp-logo.png',
    gridClassName: 'md:col-span-1'
  },
  {
    name: 'Instagram',
    title: 'Смотреть новости проекта, фото и живые обновления',
    description: 'Лента с визуальными анонсами, закулисьем мероприятий и тем, что происходит вокруг BARSYNERGY.',
    actionLabel: 'Перейти в Instagram',
    href: 'https://www.instagram.com/bar.synergy?igsh=MXE3b2hjYjE2MGplcQ==',
    surfaceClassName: 'bg-[linear-gradient(135deg,#d6714f_0%,#c14f7a_48%,#7258d9_100%)]',
    logoSrc: '/images/social/instagram-logo.png',
    gridClassName: 'md:col-span-2 lg:col-span-1'
  }
] as const;

function formatCount(value: number) {
  return new Intl.NumberFormat('ru-RU').format(value);
}

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
        {card?.actionLabel ?? actionLabel}
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

function SocialPromoCard({ promo }: { promo: (typeof socialPromos)[number] }) {
  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-[var(--radius-lg)] border border-white/18 text-white shadow-[0_16px_36px_rgba(20,20,18,0.08)]',
        promo.surfaceClassName,
        promo.gridClassName
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url('/images/grain.svg')] opacity-[0.14]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-white/12 blur-3xl md:h-56 md:w-56"
      />

      <div className="relative grid gap-5 p-5 sm:p-6 lg:min-h-[320px] lg:grid-rows-[auto_1fr_auto]">
        <div className="max-w-[34rem]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">{promo.name}</p>
          <h2 className={`${displayFont.className} display-tight mt-4 max-w-[14ch] text-[28px] sm:text-[32px] lg:text-[34px]`}>
            {promo.title}
          </h2>
          <p className="mt-3 max-w-[28rem] text-sm leading-6 text-white/82 lg:text-[13px]">
            {promo.description}
          </p>
        </div>

        <div className="flex items-end justify-between gap-4 self-end">
          <a
            className="inline-flex min-h-10 items-center justify-center rounded-[var(--radius-md)] border border-white/68 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
            href={promo.href}
            rel="noreferrer"
            target="_blank"
          >
            {promo.actionLabel}
          </a>
          <span className="grid size-14 shrink-0 place-items-center rounded-[var(--radius-md)] bg-white/14 p-3 backdrop-blur-[1.5px] transition-transform duration-300 group-hover:-translate-y-1">
            <Image
              alt=""
              className="h-full w-full object-contain"
              height={64}
              src={promo.logoSrc}
              width={64}
            />
          </span>
        </div>
      </div>
    </article>
  );
}

export function HomepageClient({ data }: HomepageClientProps) {
  const statItems = [
    { value: formatCount(data.stats.vacancies), label: 'вакансий', icon: BriefcaseBusiness },
    { value: formatCount(data.stats.suppliers), label: 'поставщиков', icon: PackageCheck },
    { value: formatCount(data.stats.events), label: 'событий', icon: CalendarDays },
    { value: formatCount(data.stats.articles), label: 'материалов', icon: BookOpen }
  ].filter((item) => item.value !== '0');
  return (
    <div className="overflow-x-hidden">
      <section className="border-b border-[var(--line)] py-8 md:py-12">
        <div className="container grid gap-8 xl:grid-cols-[minmax(0,0.98fr)_minmax(28rem,0.82fr)] xl:items-start">
          <div className="min-w-0">
            <p className={`${accentFont.className} text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]`}>
              Платформа и сообщество
            </p>
            <h1 className={`${displayFont.className} mt-6 max-w-5xl text-[clamp(3.25rem,7vw,7.2rem)] font-semibold leading-[0.98] text-[var(--text)]`}>
              Барная индустрия СКФО в одном месте
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--text)] md:text-lg">
              Обучение, события, знания, вакансии и проверенные поставщики для развития барной культуры и роста вашего бизнеса.
            </p>
            <div className="mt-9 grid gap-3 sm:max-w-xl sm:grid-cols-2">
              <Button className="rounded-[var(--radius-md)]" href="/vacancies" size="lg">
                Смотреть вакансии
              </Button>
              <Button className="rounded-[var(--radius-md)]" href="/contacts?topic=vacancy-placement" size="lg" variant="secondary">
                Разместить вакансию
              </Button>
            </div>
          </div>

          <Panel className="border-[var(--border-default)] bg-[var(--surface-wash)]" padding="lg">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text)]">Сейчас в BARSYNERGY</p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <NowCard actionLabel="Подробнее" card={data.event} href="/events" icon={CalendarDays} label="Ближайшее событие" />
              <NowCard actionLabel="Смотреть" card={data.vacancy} href="/vacancies" icon={BriefcaseBusiness} label="Новые вакансии" />
              <NowCard actionLabel="Читать" card={data.article} href="/articles" icon={BookOpen} label="Новые материалы" />
              <NowCard actionLabel="Открыть" href="/tools/cost-calculator" icon={Calculator} label="Калькулятор" />
            </div>
          </Panel>
        </div>

        {statItems.length > 0 ? (
          <div className="container mt-7 grid gap-0 divide-y divide-[var(--line)] border-t border-[var(--line)] pt-1 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
            {statItems.map((item) => (
              <div className="flex items-center gap-3 py-3 sm:px-4 sm:first:pl-0" key={item.label}>
                <InlineIcon icon={item.icon} />
                <div>
                  <p className="text-2xl font-semibold leading-none text-[var(--text)]">{item.value}</p>
                  <p className="mt-1 text-sm leading-5 text-[var(--muted)]">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="border-b border-[var(--line)] py-10 md:py-14" id="home-actions">
        <div className="container">
          <div className="rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[var(--surface-wash)] p-4 shadow-[0_18px_54px_rgba(20,20,18,0.045)] md:p-5">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-5">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Разделы платформы</p>
                <h2 className={`${displayFont.className} mt-3 text-[2.1rem] font-semibold leading-[1.04] text-[var(--text)] md:text-[2.8rem]`}>
                  Разделы
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-[var(--muted)]">
                Выберите направление: обучение, события, материалы, работа, поставщики или партнёрские форматы.
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

      <ToolTeaser />

      <section className="border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <div className="mb-7 flex items-center gap-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text)]">Для кого BARSYNERGY</p>
            <span className="h-px flex-1 bg-[var(--line)]" />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {audienceCards.map((card) => {
              const AudienceIcon = card.icon;

              return (
                <Link
                  className="group grid min-h-[220px] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)] transition hover:border-[var(--accent)]/34 hover:bg-[var(--surface-wash-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] md:grid-cols-[13rem_minmax(0,1fr)] lg:grid-cols-1"
                  href={card.href}
                  key={card.title}
                >
                  <span className="relative block aspect-[4/3] min-h-44 bg-[var(--surface-muted)] md:aspect-[4/3] lg:aspect-[16/10]">
                    <Image
                      alt=""
                      className="object-cover"
                      fill
                      sizes="(min-width: 1280px) 13rem, (min-width: 1024px) 31vw, (min-width: 768px) 13rem, 92vw"
                      src={card.image}
                    />
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
                      Подробнее <span aria-hidden="true">→</span>
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <div className="mb-7 flex items-center gap-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text)]">Генеральный спонсор BARSYNERGY</p>
            <span className="h-px flex-1 bg-[var(--line)]" />
          </div>
          <div className="grid gap-5">
            {GENERAL_SPONSORS.map((sponsor) => (
              <GeneralSponsorCard key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <div className="max-w-3xl">
            <p className={`${accentFont.className} text-sm uppercase tracking-[0.24em] text-[var(--accent)]`}>Соцсети</p>
            <h2 className={`${displayFont.className} display-tight mt-5 max-w-5xl text-[38px] md:text-[58px] xl:text-[70px]`}>
              Быстрые точки входа в BARSYNERGY
            </h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[var(--muted)] md:text-[15px]">
              Если удобнее следить за анонсами, писать в чат или смотреть обновления в ленте, переходите в нужную
              сеть одним кликом.
            </p>
          </div>

          <div className="mx-auto mt-8 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3 xl:gap-5">
            {socialPromos.map((promo) => (
              <SocialPromoCard key={promo.name} promo={promo} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-[var(--line)] py-10 md:py-14" id="home-about">
        <div className="home-about-panel container rounded-[var(--radius-xl)] border border-[var(--border-default)] bg-[linear-gradient(135deg,rgba(244,231,223,0.8),rgba(255,253,249,0.9))] p-6 md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-7 md:p-8">
          <InlineIcon icon={Handshake} />
          <div className="mt-5 md:mt-0">
            <h2 className={`${displayFont.className} text-[2.1rem] font-semibold leading-[1.02] text-[var(--text)] md:text-[3rem]`}>
              Развивайте барную культуру СКФО вместе с BARSYNERGY
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--muted)]">
              Присоединяйтесь к барному сообществу, обменивайтесь опытом и находите новые рабочие контакты.
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 md:mt-0 md:min-w-72 md:grid-cols-1">
            <Button className="rounded-[var(--radius-md)]" href="/contacts">
              Присоединиться
            </Button>
            <Button className="rounded-[var(--radius-md)]" href="/about" variant="ghost">
              Узнать больше <span aria-hidden="true">→</span>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
