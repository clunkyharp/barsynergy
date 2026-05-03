'use client';

import Link from 'next/link';
import {
  BookOpen,
  BriefcaseBusiness,
  Calculator,
  CalendarDays,
  GraduationCap,
  Handshake,
  MapPin,
  PackageCheck,
  Sparkles,
  Star,
  Store,
  Users
} from 'lucide-react';
import { GeneralSponsorCard } from './general-sponsor-card';
import { IconBadge, SectionCtaPanel } from './public-ui-adaptation';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { accentFont, displayFont } from '@/lib/fonts';
import { GENERAL_SPONSORS } from '@/lib/public/general-sponsors';
import type { HomepageData, HomepageLiveCard } from '@/lib/public/home';

type HomepageClientProps = {
  data: HomepageData;
};

const quickEntries = [
  {
    title: 'Учиться',
    description: 'Курсы, лекции и программы для барменов и управляющих.',
    href: '/education',
    icon: GraduationCap
  },
  {
    title: 'События',
    description: 'Афиша встреч, лекций, дегустаций и профессиональных форматов.',
    href: '/events',
    icon: CalendarDays
  },
  {
    title: 'Знания',
    description: 'Статьи, исследования и практические материалы.',
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
    description: 'Проверенные компании, сервисы и рабочие контакты.',
    href: '/suppliers',
    icon: PackageCheck
  },
  {
    title: 'Партнёры',
    description: 'Партнёрские компании и совместные проекты.',
    href: '/partners',
    icon: Handshake
  },
  {
    title: 'Инструменты',
    description: 'Калькуляторы и шаблоны для работы и учёта.',
    href: '/tools/cost-calculator',
    icon: Calculator
  },
  {
    title: 'Спонсорство',
    description: 'Возможности для брендов и партнёров индустрии.',
    href: '/general-sponsors',
    icon: Star
  }
] as const;

const audienceCards = [
  {
    title: 'Для специалистов',
    description: 'Развивайтесь, находите обучение, события и вакансии в профессиональном сообществе.',
    href: '/education',
    image: '/images/generated/program-intensive.jpg',
    icon: Users
  },
  {
    title: 'Для заведений',
    description: 'Ищите сотрудников, поставщиков и инструменты для роста сервиса.',
    href: '/suppliers',
    image: '/images/home/project-growth.webp',
    icon: Store
  },
  {
    title: 'Для брендов',
    description: 'Запускайте партнёрства, события и спонсорские форматы в регионе.',
    href: '/partners',
    image: '/images/generated/hustle-brew-lineup-v1.png',
    icon: Sparkles
  }
] as const;

function compactMeta(card: HomepageLiveCard) {
  return card.meta.filter(Boolean).slice(0, 2).join(' / ');
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
  icon: typeof CalendarDays;
}) {
  return (
    <Link
      className="group rounded-[22px] border border-black/10 bg-[rgba(255,252,248,0.78)] p-4 transition hover:border-[var(--accent)]/28 hover:bg-white/72 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
      href={card?.href ?? href}
    >
      <div className="flex items-start justify-between gap-3">
        <IconBadge icon={icon} size="sm" tone="soft" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">{label}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold leading-6 text-[var(--text)] group-hover:text-[var(--accent)]">
        {card?.title ?? label}
      </h3>
      <p className="mt-2 min-h-10 text-sm leading-6 text-[var(--muted)]">{card ? compactMeta(card) : 'Открыть инструмент'}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
        {card?.actionLabel ?? actionLabel}
        <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

export function HomepageClient({ data }: HomepageClientProps) {
  return (
    <div className="overflow-x-hidden">
      <section className="border-b border-black/20 pt-[118px] md:pt-[132px]">
        <div className="container grid gap-10 pb-10 pt-8 md:pb-14 xl:grid-cols-[minmax(0,1.1fr)_minmax(23rem,0.72fr)] xl:items-start">
          <div className="min-w-0">
            <p className={`${accentFont.className} text-sm uppercase tracking-[0.26em] text-[var(--accent)]`}>
              Платформа и сообщество
            </p>
            <h1 className={`${displayFont.className} display-tight mt-6 max-w-5xl text-[clamp(3.2rem,6vw,6.8rem)]`}>
              Барная индустрия СКФО в одном месте
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-[var(--muted)] md:text-lg">
              Обучение, события, материалы, вакансии, поставщики и партнёрства для барного сообщества региона.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button className="rounded-full px-7" href="#home-actions" size="lg">
                Стать участником
              </Button>
              <Button className="rounded-full px-7" href="/contacts" size="lg" variant="secondary">
                Для заведений и брендов
              </Button>
            </div>
          </div>

          <Panel className="border-black/10 bg-[rgba(255,250,244,0.82)]" padding="lg">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text)]">Сейчас в BARSYNERGY</p>
              <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
                Онлайн
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <NowCard actionLabel="Подробнее" card={data.event} href="/events" icon={CalendarDays} label="Ближайшее событие" />
              <NowCard actionLabel="Смотреть" card={data.vacancy} href="/vacancies" icon={BriefcaseBusiness} label="Новые вакансии" />
              <NowCard actionLabel="Читать" card={data.article} href="/articles" icon={BookOpen} label="Новые материалы" />
              <NowCard actionLabel="Открыть" href="/tools/cost-calculator" icon={Calculator} label="Калькулятор себестоимости" />
            </div>
          </Panel>
        </div>

        <div className="container border-t border-black/10 py-5">
          <div className="grid gap-4 text-sm leading-6 text-[var(--muted)] md:grid-cols-4">
            <div className="flex items-center gap-3">
              <IconBadge icon={Users} size="sm" tone="soft" />
              <span>Участники сообщества и команды заведений</span>
            </div>
            <div className="flex items-center gap-3">
              <IconBadge icon={MapPin} size="sm" tone="soft" />
              <span>Региональный фокус СКФО</span>
            </div>
            <div className="flex items-center gap-3">
              <IconBadge icon={GraduationCap} size="sm" tone="soft" />
              <span>Обучение, события и материалы</span>
            </div>
            <div className="flex items-center gap-3">
              <IconBadge icon={CalendarDays} size="sm" tone="soft" />
              <span>Публичные разделы уже открыты</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/20 py-10 md:py-14" id="home-actions">
        <div className="container">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickEntries.map((entry) => (
              <Link
                className="group flex min-h-[178px] flex-col justify-between rounded-[24px] border border-black/10 bg-[rgba(255,250,244,0.76)] p-5 transition hover:border-[var(--accent)]/28 hover:bg-white/72 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)]"
                href={entry.href}
                key={entry.title}
              >
                <IconBadge icon={entry.icon} size="md" tone="accent" />
                <div className="mt-7">
                  <h2 className={`${displayFont.className} display-tight text-[28px] leading-none text-[var(--text)]`}>
                    {entry.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{entry.description}</p>
                </div>
                <span className="mt-5 self-end text-xl text-[var(--text)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)]">
                  →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-black/20 py-10 md:py-14">
        <div className="container">
          <div className="mb-7 flex items-center gap-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text)]">Для кого BARSYNERGY</p>
            <span className="h-px flex-1 bg-black/12" />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {audienceCards.map((card) => (
              <Link
                className="group grid min-h-[220px] overflow-hidden rounded-[24px] border border-black/10 bg-[rgba(255,250,244,0.76)] transition hover:border-[var(--accent)]/28 hover:bg-white/72 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] sm:grid-cols-[11rem_minmax(0,1fr)] lg:grid-cols-1 xl:grid-cols-[11rem_minmax(0,1fr)]"
                href={card.href}
                key={card.title}
              >
                <span className="min-h-40 bg-cover bg-center grayscale-[0.15]" style={{ backgroundImage: `url("${card.image}")` }} />
                <span className="flex min-w-0 flex-col justify-between p-5">
                  <span>
                    <IconBadge icon={card.icon} size="sm" tone="soft" />
                    <span className={`${displayFont.className} display-tight mt-5 block text-[28px] leading-none text-[var(--text)]`}>
                      {card.title}
                    </span>
                    <span className="mt-3 block text-sm leading-6 text-[var(--muted)]">{card.description}</span>
                  </span>
                  <span className="mt-5 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
                    Подробнее <span aria-hidden="true">→</span>
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-black/20 py-10 md:py-14">
        <div className="container">
          <div className="mb-8 flex items-center gap-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--text)]">Генеральный спонсор BARSYNERGY</p>
            <span className="h-px flex-1 bg-black/12" />
          </div>
          <div className="grid gap-5">
            {GENERAL_SPONSORS.map((sponsor) => (
              <GeneralSponsorCard key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>
          <div className="mt-7 text-center">
            <Button className="rounded-full px-6" href="/general-sponsors" variant="ghost">
              Стать партнёром <span aria-hidden="true">→</span>
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-black/20 py-10 md:py-14">
        <div className="container">
          <SectionCtaPanel
            description="Присоединяйтесь к сообществу профессионалов, обменивайтесь опытом и находите новые возможности для роста."
            icon={Handshake}
            primary={{ href: '/contacts', label: 'Присоединиться' }}
            secondary={{ href: '/about', label: 'Узнать больше о платформе' }}
            title="Развивайте барную культуру СКФО вместе с BARSYNERGY"
          />
        </div>
      </section>
    </div>
  );
}
