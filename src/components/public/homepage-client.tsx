'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  ChevronUp,
  Handshake,
  PackageCheck,
  Search,
  School,
  Store,
  type LucideIcon
} from 'lucide-react';
import { GeneralSponsorCard } from './general-sponsor-card';
import { ToolTeaser } from './platform-ui';
import { SocialLinkCard } from './social-card';
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
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
      <Icon size={20} strokeWidth={1.8} />
    </span>
  );
}

const roleRouterCards = [
  {
    title: 'Я специалист',
    description: 'Найдите обучение, события, вакансии и материалы.',
    href: '/education',
    icon: School
  },
  {
    title: 'Я представляю заведение',
    description: 'Подберите поставщиков, вакансии, консультацию или цифровой инструмент.',
    href: '/business',
    icon: Store
  },
  {
    title: 'Я поставщик',
    description: 'Добавьте компанию в каталог и получайте заявки от заведений.',
    href: '/suppliers',
    icon: PackageCheck
  },
  {
    title: 'Я бренд / партнёр',
    description: 'Обсудите спонсорство, событие, материал или спецпроект.',
    href: '/partners',
    icon: Handshake
  }
] as const;

const heroQuickLinks = [
  { label: 'Обучение', href: '/education' },
  { label: 'События', href: '/events' },
  { label: 'Вакансии', href: '/vacancies' },
  { label: 'Поставщики', href: '/suppliers' },
  { label: 'Партнёры', href: '/partners' }
] as const;

function HomeHeroRouter() {
  return (
    <section
      aria-labelledby="home-hero-title"
      className="relative isolate flex min-h-[680px] items-center overflow-hidden border-b border-[var(--line)] bg-[#15110e] text-[#fffdf9] md:min-h-[720px] lg:min-h-[760px]"
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
            'linear-gradient(90deg, rgba(18,14,12,0.98), rgba(18,14,12,0.83) 43%, rgba(18,14,12,0.32) 74%, rgba(18,14,12,0.14)), linear-gradient(0deg, rgba(18,14,12,0.68), rgba(18,14,12,0.08) 54%), radial-gradient(circle at 18% 34%, rgba(157,9,14,0.18), transparent 24rem)'
        }}
      />
      <div className="container relative z-[2] py-16 md:py-24">
        <div className="max-w-[58rem]">
          <p className={`${accentFont.className} text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f2b0a8]`}>
            BARSYNERGY / Барная индустрия СКФО
          </p>
          <h1 className={`${displayFont.className} mt-4 max-w-[55rem] text-[clamp(2.8rem,5vw,4.8rem)] font-semibold leading-[1.04] text-balance text-[#fffdf9] max-[640px]:max-w-[15ch] max-[640px]:text-[clamp(2.25rem,9.6vw,2.55rem)]`} id="home-hero-title">
            Платформа, которая объединяет людей индустрии кофе и бара
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-[rgba(255,253,249,0.78)] md:text-base">
            Обучение, события, вакансии, поставщики, расчёты и партнёрские заявки для баров, кофеен, команд и брендов региона.
          </p>
          <form
            action="/articles"
            aria-label="Поиск по материалам BARSYNERGY"
            className="home-hero-search mt-8 grid min-h-16 w-full max-w-[43rem] grid-cols-[2.75rem_minmax(0,1fr)_auto] items-center border-b border-[rgba(255,253,249,0.46)] text-[rgba(255,253,249,0.9)] max-[640px]:grid-cols-[2.35rem_minmax(0,1fr)] max-[640px]:gap-y-3 max-[640px]:pb-4"
            method="get"
            role="search"
          >
            <Search aria-hidden="true" size={24} strokeWidth={1.8} />
            <input
              aria-label="Поиск по материалам"
              className="home-hero-search-input min-w-0 bg-transparent text-[clamp(1.05rem,2vw,1.45rem)] leading-[1.4] text-[rgba(255,253,249,0.92)] outline-none placeholder:text-[rgba(255,253,249,0.56)]"
              name="q"
              placeholder="Поиск по платформе"
              type="search"
            />
            <button
              className="min-h-11 rounded-[var(--radius-md)] border border-[var(--accent-burgundy)] bg-[var(--accent-burgundy)] px-4 text-sm font-bold text-[var(--accent-burgundy-contrast)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-[var(--accent-burgundy-strong)] hover:bg-[var(--accent-burgundy-strong)] focus-visible:border-[var(--accent-burgundy-strong)] focus-visible:bg-[var(--accent-burgundy-strong)] motion-reduce:transition-none max-[640px]:col-span-2 max-[640px]:w-full"
              type="submit"
            >
              Искать
            </button>
          </form>
          <nav aria-label="Быстрые направления" className="mt-5 flex flex-wrap gap-2.5">
            {heroQuickLinks.map((link) => (
              <Link
                className="inline-flex min-h-10 items-center rounded-[var(--radius-pill)] border border-[rgba(255,253,249,0.3)] px-3 py-1.5 text-[13px] font-bold text-[rgba(255,253,249,0.8)] transition-colors duration-[var(--motion-duration-fast)] ease-[var(--motion-ease-standard)] hover:border-[rgba(255,253,249,0.68)] hover:bg-[rgba(255,253,249,0.08)] hover:text-[#fffdf9] focus-visible:border-[rgba(255,253,249,0.68)] focus-visible:bg-[rgba(255,253,249,0.08)] focus-visible:text-[#fffdf9] motion-reduce:transition-none"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}

function HomeRoleRouter() {
  return (
    <section className="background-zone background-zone-ivory scroll-mt-28 border-b border-[var(--line)] py-8 md:py-12" id="home-role-router">
      <div className="container">
        <div className="mb-6">
          <p className={`${accentFont.className} text-[11px] uppercase tracking-[0.18em] text-[var(--accent)]`}>Разделы</p>
          <h2 className={`${displayFont.className} mt-2 text-[2.3rem] font-semibold leading-none text-[var(--text)] md:text-[3.1rem]`}>
            Выберите свое направление
          </h2>
        </div>
        <ul className="home-role-list border-t border-[var(--line)]">
          {roleRouterCards.map((card) => {
            const Icon = card.icon;

            return (
              <li className="min-w-0" key={card.title}>
                <Link
                  aria-label={`Перейти в раздел: ${card.title}`}
                  className="home-role-row group grid grid-cols-[minmax(0,1fr)_2.75rem] items-center gap-x-3 gap-y-2 border-b border-[var(--line)] py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] md:grid-cols-[minmax(0,0.58fr)_minmax(0,1fr)_auto] md:gap-5"
                  href={card.href}
                >
                  <span className="flex min-w-0 items-center gap-3 max-md:col-start-1 max-md:row-start-1">
                    <span className="home-role-row-icon" aria-hidden="true">
                      <Icon size={18} strokeWidth={1.8} />
                    </span>
                    <h3 className={`${displayFont.className} text-[1.45rem] font-semibold leading-[1.05] text-[var(--text)] md:text-[1.8rem]`}>
                      {card.title}
                    </h3>
                  </span>
                  <span className="min-w-0 text-sm leading-6 text-[var(--muted)] max-md:col-start-1 max-md:row-start-2">{card.description}</span>
                  <span className="flex items-center justify-end gap-3 max-md:col-start-2 max-md:row-span-2 max-md:row-start-1 max-md:self-center md:justify-end">
                    <span className="home-role-card-nav" aria-hidden="true">
                      <ArrowUpRight size={15} strokeWidth={1.8} />
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

const businessDigitalServices = [
  {
    label: 'Сайты и лендинги',
    pain: 'Нужно быстро показать событие, набор, партнёрский проект или новое меню.',
    result: 'Страница с понятной структурой, формой заявки, аналитикой и базовой SEO-настройкой.'
  },
  {
    label: 'Telegram-боты',
    pain: 'Заявки, записи и напоминания сейчас собираются вручную в личных чатах.',
    result: 'Бот задаёт нужные вопросы и передаёт ответы команде.'
  },
  {
    label: 'Mini Apps',
    pain: 'Гостю, участнику или партнёру нужен короткий путь внутри Telegram без отдельной регистрации.',
    result: 'Мини-приложение для записи, каталога, анкеты или программы события.'
  },
  {
    label: 'Автоматизация процессов',
    pain: 'Команда тратит время на проверки, таблицы, пересылки и ручные статусы.',
    result: 'Формы, уведомления, таблицы или внутренняя панель в одном рабочем сценарии.'
  }
] as const;

const businessDigitalProcessSteps = [
  {
    value: '1',
    title: 'Задача',
    description: 'Фиксируем сценарий: заявка, запись, каталог, партнёрская страница или внутренняя форма.'
  },
  {
    value: '2',
    title: 'Сборка',
    description: 'Собираем рабочий экран, вопросы, уведомления и точки передачи заявки команде.'
  },
  {
    value: '3',
    title: 'Запуск',
    description: 'Передаём ссылку, проверяем путь пользователя и оставляем понятный процесс обработки.'
  }
] as const;

function BusinessDigitalSolutionsSection() {
  return (
    <section className="background-zone background-zone-ivory render-deferred-section scroll-mt-28 border-b border-[var(--line)] py-10 md:py-14" id="home-digital-solutions">
      <div className="container">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:items-stretch">
          <div className="home-digital-intro flex min-w-0 flex-col">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Цифровые решения</p>
            <h2 className={`${displayFont.className} mt-3 text-[2.1rem] font-semibold leading-[1.04] text-[var(--text)] md:text-[2.85rem]`}>
              Сайты, боты и автоматизация для бизнеса
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)] md:text-[15px]">
              Соберём страницу, Telegram-бот, Mini App или внутреннюю форму под задачу бара, школы, поставщика или партнёра.
            </p>
            <Button className="mt-7 w-full max-w-[17rem] rounded-[var(--radius-md)]" href="/contacts?topic=other#contact-form">
              Оставить заявку
              <ArrowUpRight size={16} />
            </Button>
            <div className="home-digital-process mt-9 border-t border-[var(--line)] pt-5 lg:mt-10 lg:pt-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">От задачи к запуску</p>
              <ol className="mt-4 grid gap-3">
                {businessDigitalProcessSteps.map((step) => (
                  <li className="home-digital-process-step grid grid-cols-[2.4rem_minmax(0,1fr)] gap-3" key={step.value}>
                    <span className="home-digital-process-index">{step.value}</span>
                    <span>
                      <span className="block text-sm font-semibold leading-5 text-[var(--text)]">{step.title}</span>
                      <span className="mt-1 block text-sm leading-6 text-[var(--muted)]">{step.description}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {businessDigitalServices.map((service) => (
              <article
                className="public-card-shell flex min-h-[16rem] flex-col p-4 md:p-5"
                key={service.label}
              >
                <h3 className={`${displayFont.className} text-[1.55rem] font-semibold leading-[1.04] text-[var(--text)]`}>
                  {service.label}
                </h3>
                <dl className="mt-4 grid gap-3 border-t border-[var(--line)] pt-4">
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Задача</dt>
                    <dd className="mt-1 text-sm leading-6 text-[var(--text)]">{service.pain}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">Результат</dt>
                    <dd className="mt-1 text-sm leading-6 text-[var(--muted)]">{service.result}</dd>
                  </div>
                </dl>
              </article>
            ))}
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

function FeaturedNowCard({ card }: { card: HomepageLiveCard }) {
  const visibleMeta = getVisibleFeaturedMeta(card);

  return (
    <Link
      className="public-card-shell featured-now-card group grid overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] md:rounded-[var(--radius-xl)] lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)] xl:self-start"
      href={card.href}
    >
      <span
        aria-hidden="true"
        className="featured-now-media min-h-[118px] bg-[linear-gradient(135deg,rgba(153,44,38,0.13),rgba(20,20,18,0.08))] bg-cover bg-center grayscale-[0.08] transition-transform duration-[var(--motion-duration-media)] ease-[var(--motion-ease-move)] group-hover:scale-[1.02] motion-reduce:transition-none sm:min-h-[150px] lg:min-h-full"
        style={card.imageUrl ? { backgroundImage: `url("${card.imageUrl}")` } : undefined}
      />
      <span className="featured-now-content flex min-w-0 flex-col p-4 md:p-6">
        <span>
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
        </span>
        <span className="featured-now-footer mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--line)] pt-4 md:mt-6">
          <span className="featured-now-action inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
            {card.actionLabel}
            <ArrowUpRight className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] group-hover:translate-x-1 motion-reduce:transition-none" size={16} />
          </span>
        </span>
      </span>
    </Link>
  );
}

const homepageFaqItems = [
  {
    question: 'Что уже можно сделать на платформе?',
    answer: 'Можно читать материалы, смотреть образовательные форматы, проверять вакансии, находить поставщиков и оставлять заявки на партнёрские задачи.'
  },
  {
    question: 'Кому подходит BARSYNERGY?',
    answer: 'Платформа рассчитана на барменов, управляющих, владельцев заведений, поставщиков, бренды и специалистов, которые работают с HoReCa в СКФО.'
  },
  {
    question: 'Можно ли предложить своё событие или материал?',
    answer: 'Да. Через раздел контактов можно отправить идею события, партнёрского проекта, обучающего формата или публикации.'
  },
  {
    question: 'Есть ли инструменты для бизнеса?',
    answer: 'Да. На главной уже есть калькулятор себестоимости, а для заведений доступны заявки по цифровым решениям, вакансиям, поставщикам и консалтингу.'
  },
  {
    question: 'Как связаться с командой?',
    answer: 'Откройте форму в контактах и выберите тему обращения. Так заявка сразу попадёт в правильный рабочий сценарий.'
  }
] as const;

function HomeCtaFaqSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setActiveIndex((currentIndex) => (currentIndex === index ? null : index));
  };

  return (
    <section
      className="background-zone background-zone-ivory render-deferred-section border-b border-[var(--line)] py-16 text-[var(--text)] max-[900px]:py-[60px]"
      id="home-platform-help"
    >
      <div className="mx-auto w-full max-w-[1100px] px-5">
        <div className="grid grid-cols-[1.6fr_1fr] items-stretch gap-[30px] max-[900px]:grid-cols-1 max-[900px]:gap-[60px]">
          <div
            className="bars-home-gradient flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-[var(--editorial-dark-border)] px-10 py-20 text-center text-[var(--editorial-dark-text)] max-[640px]:px-6 max-[640px]:py-14"
            style={{ boxShadow: 'var(--shadow-panel)' }}
          >
            <h2
              className={`${displayFont.className} mb-[15px] text-[3.35rem] font-semibold leading-[1.04] max-[640px]:text-[2.45rem]`}
            >
              Напишите команде
              <br />
              BARSYNERGY
            </h2>
            <p className="mb-[30px] max-w-[34rem] text-[0.95rem] font-medium leading-7 text-[var(--editorial-dark-muted)]">
              Ответим на вопрос, примем идею события или поможем выбрать нужный раздел.
            </p>
          </div>

          <div className="home-help-faq-list flex flex-col gap-3">
            {homepageFaqItems.map((item, index) => {
              const isActive = activeIndex === index;

              return (
                <button
                  aria-expanded={isActive}
                  aria-controls={`home-faq-answer-${index}`}
                  className="home-help-faq-item cursor-pointer rounded-[var(--radius-md)] border bg-[var(--surface-card)] px-5 py-[18px] text-left transition-[background-color,border-color,box-shadow,color] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[var(--card-border-hover)] hover:bg-[var(--surface-card-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] motion-reduce:transition-none"
                  data-active={isActive ? 'true' : 'false'}
                  key={item.question}
                  onClick={() => toggleFaq(index)}
                  style={{
                    borderColor: isActive ? 'var(--card-border-hover)' : 'var(--card-border)',
                    boxShadow: isActive ? 'var(--shadow-card)' : 'none'
                  }}
                  type="button"
                >
                  <span className="flex items-center justify-between gap-4 text-[0.9rem] font-semibold text-[var(--text)]">
                    <span>{item.question}</span>
                    {isActive ? <ChevronUp aria-hidden="true" size={20} /> : <ChevronDown aria-hidden="true" size={20} />}
                  </span>
                  {isActive ? (
                    <span className="home-help-faq-answer mt-3 block text-[0.9rem] leading-[1.6] text-[var(--muted)]" id={`home-faq-answer-${index}`}>
                      {item.answer}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function HomepageClient({ data }: HomepageClientProps) {
  return (
    <div className="overflow-x-hidden">
      <HomeHeroRouter />

      <HomeRoleRouter />

      <section className="background-zone background-zone-beige scroll-mt-28 border-b border-[var(--line)] py-8 md:py-14" id="home-current">
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
          <div className="home-current-layout grid gap-4">
            <FeaturedNowCard card={data.article} />
            <div className="home-current-support-grid border-y border-[var(--line)] sm:grid sm:grid-cols-2 sm:gap-3 sm:border-y-0 xl:grid-cols-3">
              <NowCard actionLabel="Откликнуться" card={data.vacancy} href="/vacancies" icon={BriefcaseBusiness} label="Вакансии" />
              <NowCard actionLabel="Читать" card={data.secondaryArticle} fallbackMeta="Другие материалы" href="/articles" icon={BookOpen} label="Материалы" />
              <NowCard actionLabel="Перейти в каталог" card={data.supplier} href="/suppliers" icon={PackageCheck} label="Поставщики" />
            </div>
          </div>
        </div>
      </section>

      {data.calculatorTeaser ? <ToolTeaser teaser={data.calculatorTeaser} /> : null}

      {data.generalSponsors.length > 0 ? (
        <section className="background-zone background-zone-sponsor render-deferred-section border-b border-[var(--line)] py-10 md:py-14">
          <div className="container">
            <div className="mb-7 flex items-center gap-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text)]">Генеральный спонсор</p>
              <span className="h-px flex-1 bg-[var(--line)]" />
            </div>
            <div className="grid gap-5">
              {data.generalSponsors.map((sponsor, index) => (
                <GeneralSponsorCard key={sponsor.id} priority={index === 0} sponsor={sponsor} variant="home" />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <BusinessDigitalSolutionsSection />

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
