'use client';

import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  PackageCheck,
  type LucideIcon
} from 'lucide-react';
import { GeneralSponsorCard } from './general-sponsor-card';
import { ToolTeaser } from './platform-ui';
import { RoleTaskCard } from './public-card-patterns';
import { SocialLinkCard } from './social-card';
import { Button } from '@/components/ui/button';
import { accentFont, displayFont } from '@/lib/fonts';
import type { HomepageAudienceCardBlock, HomepageData, HomepageLiveCard, HomepageSocialBlock } from '@/lib/public/home';

type HomepageClientProps = {
  data: HomepageData;
};

function compactMeta(card: HomepageLiveCard) {
  return card.meta.filter(Boolean).slice(0, 2).join(' / ');
}

function formatHeroEyebrow(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .join(' • ');
}

function InlineIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
      <Icon size={20} strokeWidth={1.8} />
    </span>
  );
}

function pluralizeCount(value: number, forms: [string, string, string]) {
  const absolute = Math.abs(value);
  const mod10 = absolute % 10;
  const mod100 = absolute % 100;
  const form = mod10 === 1 && mod100 !== 11 ? forms[0] : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? forms[1] : forms[2];

  return `${value} ${form}`;
}

function countOrStatus(value: number, forms: [string, string, string], fallback: string) {
  return value > 0 ? pluralizeCount(value, forms) : fallback;
}

function getRouteGroups(data: HomepageData) {
  return [
    {
      group: 'Учиться и читать',
      entries: [
        {
          code: 'Учёба',
          label: 'Обучение',
          title: 'Курсы и программы',
          useCase: 'Подобрать занятие для себя или команды.',
          href: '/education',
          status: countOrStatus(data.stats.courses, ['программа', 'программы', 'программ'], 'заявки открыты'),
          actionLabel: 'Выбрать формат'
        },
        {
          code: 'Тексты',
          label: 'Материалы',
          title: 'Статьи и разборы',
          useCase: 'Найти рабочие тексты по сервису, команде и меню.',
          href: '/articles',
          status: countOrStatus(data.stats.articles, ['материал', 'материала', 'материалов'], 'раздел открыт'),
          actionLabel: 'Читать'
        },
        {
          code: 'Расчёт',
          label: 'Инструмент',
          title: 'Калькулятор себестоимости',
          useCase: 'Быстро проверить стоимость напитка или заготовки.',
          href: '/tools/cost-calculator',
          status: 'доступен',
          actionLabel: 'Открыть калькулятор'
        }
      ]
    },
    {
      group: 'Работа и поставки',
      entries: [
        {
          code: 'Афиша',
          label: 'Афиша',
          title: 'События индустрии',
          useCase: 'Посмотреть встречи, дегустации и гостевые смены.',
          href: '/events',
          status: countOrStatus(data.stats.events, ['событие', 'события', 'событий'], 'афиша открыта'),
          actionLabel: 'Смотреть афишу'
        },
        {
          code: 'Работа',
          label: 'Работа',
          title: 'Вакансии',
          useCase: 'Откликнуться на роль или отправить вакансию компании.',
          href: '/vacancies',
          status: countOrStatus(data.stats.vacancies, ['вакансия', 'вакансии', 'вакансий'], 'можно подать заявку'),
          actionLabel: 'Смотреть вакансии'
        },
        {
          code: 'Поставки',
          label: 'Каталог',
          title: 'Поставщики',
          useCase: 'Найти компании, сервисы и контакты для закупок.',
          href: '/suppliers',
          status: countOrStatus(data.stats.suppliers, ['поставщик', 'поставщика', 'поставщиков'], 'каталог открыт'),
          actionLabel: 'Открыть каталог'
        }
      ]
    },
    {
      group: 'Партнёрство',
      entries: [
        {
          code: 'Партнёры',
          label: 'Проекты',
          title: 'Партнёры',
          useCase: 'Предложить совместный проект, площадку или бренд.',
          href: '/partners',
          status: countOrStatus(data.stats.partners, ['партнёр', 'партнёра', 'партнёров'], 'заявки открыты'),
          actionLabel: 'Обсудить формат'
        },
        {
          code: 'Спонсоры',
          label: 'Спонсорство',
          title: 'Генеральные спонсоры',
          useCase: 'Посмотреть профиль спонсора и форматы участия.',
          href: '/general-sponsors',
          status: data.generalSponsors.length > 0 ? pluralizeCount(data.generalSponsors.length, ['профиль', 'профиля', 'профилей']) : 'профиль готовится',
          actionLabel: 'Смотреть пакеты'
        }
      ]
    }
  ];
}

function RouteIndexPanel({ data }: { data: HomepageData }) {
  return (
    <section className="background-zone background-zone-ivory scroll-mt-28 border-b border-[var(--line)] py-10 md:py-14" id="home-actions">
      <div className="container">
        <div className="border-y border-[var(--line)] py-6 md:py-8">
          <div className="max-w-3xl">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Разделы сайта</p>
              <h2 className={`${displayFont.className} mt-3 text-[2.1rem] font-semibold leading-[1.04] text-[var(--text)] md:text-[2.8rem]`}>
                Куда перейти
              </h2>
            </div>
          </div>

          <div className="mt-7 grid gap-8">
            {getRouteGroups(data).map((group) => (
              <section className="min-w-0" key={group.group}>
                <div className="flex items-center gap-4">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">{group.group}</p>
                  <span className="h-px flex-1 bg-[var(--line)]" />
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {group.entries.map((entry) => (
                    <RoleTaskCard
                      action={{ href: entry.href, label: entry.actionLabel }}
                      code={entry.code}
                      density="compact"
                      description={entry.useCase}
                      eyebrow={entry.label}
                      key={entry.code}
                      meta={entry.status}
                      metaLabel="Статус"
                      title={entry.title}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const audienceActionFallbacks = [
  {
    actionLabel: 'Выбрать формат',
    description: 'Курсы, события, материалы и вакансии по региону.',
    href: '/education',
    id: 'homepage-audience-specialists',
    proof: 'обучение, афиша, вакансии',
    title: 'Для специалиста'
  },
  {
    actionLabel: 'Открыть вакансии',
    description: 'Разместить вакансию, найти поставщика или собрать обучение для команды.',
    href: '/vacancies',
    id: 'homepage-audience-venues',
    proof: 'найм, закупки, команда',
    title: 'Для заведения'
  },
  {
    actionLabel: 'Смотреть форматы',
    description: 'Попасть в каталог, обсудить событие или партнёрский формат.',
    href: '/partners',
    id: 'homepage-audience-brands',
    proof: 'каталог, партнёрство, спонсорство',
    title: 'Для бренда или поставщика'
  }
] satisfies HomepageAudienceCardBlock[];

const audienceQuickLinks = {
  specialist: [
    { href: '/education', label: 'Обучение' },
    { href: '/events', label: 'Афиша' },
    { href: '/vacancies', label: 'Вакансии' }
  ],
  venue: [
    { href: '/vacancies#submit-vacancy', label: 'Вакансия' },
    { href: '/suppliers', label: 'Поставщики' },
    { href: '/education?formType=corporate#education-request', label: 'Команда' }
  ],
  brand: [
    { href: '/partners', label: 'Партнёрство' },
    { href: '/suppliers', label: 'Каталог' },
    { href: '/general-sponsors', label: 'Спонсорство' }
  ]
} as const;

const audienceRoleConfigs = [
  {
    fallback: audienceActionFallbacks[0] as HomepageAudienceCardBlock,
    quickLinks: audienceQuickLinks.specialist,
    actionLabel: 'Выбрать формат',
    roleLabel: 'Специалист',
    roleTitle: 'Найти обучение, события и работу'
  },
  {
    fallback: audienceActionFallbacks[1] as HomepageAudienceCardBlock,
    quickLinks: audienceQuickLinks.venue,
    actionLabel: 'Открыть вакансии',
    roleLabel: 'Заведение',
    roleTitle: 'Закрыть задачу заведения'
  },
  {
    fallback: audienceActionFallbacks[2] as HomepageAudienceCardBlock,
    quickLinks: audienceQuickLinks.brand,
    actionLabel: 'Выбрать формат',
    roleLabel: 'Бренд / поставщик',
    roleTitle: 'Выбрать партнёрский формат'
  }
] as const;

function audienceCardsForDisplay(cards: HomepageAudienceCardBlock[]) {
  return audienceRoleConfigs.map((config, index) => ({
    card: cards[index] ?? config.fallback,
    config
  }));
}

function AudienceActionCards({ cards }: { cards: HomepageAudienceCardBlock[] }) {
  const displayCards = audienceCardsForDisplay(cards);

  return (
    <section className="background-zone background-zone-gray scroll-mt-28 border-b border-[var(--line)] py-10 md:py-14" id="home-next-actions">
      <div className="container">
        <div className="mb-7 max-w-3xl">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--text)]">Роли и задачи</p>
            <h2 className={`${displayFont.className} mt-3 text-[2.1rem] font-semibold leading-[1.04] text-[var(--text)] md:text-[2.75rem]`}>
              Что нужно сделать
            </h2>
          </div>
        </div>

        <div className="grid items-stretch gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayCards.map(({ card, config }, index) => {
            return (
              <RoleTaskCard
                action={{ href: card.href, label: config.actionLabel }}
                code={`A${String(index + 1).padStart(2, '0')}`}
                description={card.description}
                eyebrow={config.roleLabel}
                key={card.id}
                meta={card.proof ?? 'заявка, раздел и контакт с командой'}
                metaLabel="Подходит для"
                quickLinks={config.quickLinks}
                title={config.roleTitle}
              />
            );
          })}
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
    <section className="background-zone background-zone-social scroll-mt-28 border-b border-[var(--line)] py-10 md:py-14" id="home-community">
      <div className="container">
        <div className="max-w-3xl">
          <p className={`${accentFont.className} text-sm uppercase tracking-[0.24em] text-[var(--accent)]`}>Сообщество</p>
          <h2 className={`${displayFont.className} display-tight mt-5 max-w-5xl text-[38px] md:text-[58px] xl:text-[70px]`}>
            Каналы BARSYNERGY
          </h2>
        </div>

        <div className="mx-auto mt-8 grid max-w-4xl items-stretch gap-3 md:grid-cols-3">
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
    </section>
  );
}

function NowCard({
  label,
  card,
  href,
  actionLabel,
  fallbackMeta = 'Открыть раздел',
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
      className="group grid grid-cols-[2.75rem_minmax(0,1fr)] gap-x-3 border-b border-[var(--line)] py-3 transition hover:border-[var(--accent)]/34 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] sm:flex sm:h-full sm:min-h-[13rem] sm:flex-col sm:rounded-[var(--radius-lg)] sm:border sm:border-[var(--border-default)] sm:bg-[var(--surface-wash)] sm:p-4 sm:hover:bg-[var(--surface-wash-strong)]"
      href={card?.href ?? href}
    >
      <span className="row-span-4 sm:flex sm:items-start sm:justify-between sm:gap-3">
        <InlineIcon icon={icon} />
        <span className="hidden text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] sm:inline">{label}</span>
      </span>
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--accent)] sm:hidden">{label}</span>
      <h3 className={`${displayFont.className} mt-1 text-[1.22rem] font-semibold leading-none text-[var(--text)] group-hover:text-[var(--accent)] sm:mt-5 sm:text-2xl`}>
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

function FeaturedNowCard({ card }: { card: HomepageLiveCard }) {
  return (
    <Link
      className="group grid overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[color-mix(in_oklab,var(--surface),white_20%)] shadow-[0_18px_54px_rgba(20,20,18,0.045)] transition hover:border-[var(--accent)]/30 hover:bg-[color-mix(in_oklab,var(--surface),white_26%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] md:rounded-[var(--radius-xl)] lg:min-h-[260px] lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1fr)]"
      href={card.href}
    >
      <span
        aria-hidden="true"
        className="min-h-[118px] bg-[linear-gradient(135deg,rgba(153,44,38,0.13),rgba(20,20,18,0.08))] bg-cover bg-center grayscale-[0.08] transition-transform duration-700 group-hover:scale-[1.02] sm:min-h-[150px] lg:min-h-full"
        style={card.imageUrl ? { backgroundImage: `url("${card.imageUrl}")` } : undefined}
      />
      <span className="flex min-w-0 flex-col justify-between p-4 md:p-6">
        <span>
          <span className="flex flex-wrap gap-2">
            <span className="inline-flex w-fit rounded-[var(--radius-sm)] border border-[var(--accent)]/22 bg-[var(--accent-soft)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--accent)]">
              {card.eyebrow}
            </span>
            {card.meta.slice(0, 3).map((entry) => (
              <span
                className="inline-flex w-fit rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--surface-wash)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]"
                key={entry}
              >
                {entry}
              </span>
            ))}
          </span>
          <span className={`${displayFont.className} mt-3 block text-[1.8rem] font-semibold leading-none text-[var(--text)] md:mt-4 md:text-[2.45rem]`}>
            {card.title}
          </span>
          <span className="mt-3 block max-h-[4.5rem] max-w-2xl overflow-hidden text-sm leading-6 text-[var(--muted)] md:mt-4 md:max-h-[5.2rem] md:leading-7 md:text-[15px]">{card.summary}</span>
        </span>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] md:mt-5">
          {card.actionLabel}
          <ArrowUpRight className="transition-transform group-hover:translate-x-1" size={16} />
        </span>
      </span>
    </Link>
  );
}

export function HomepageClient({ data }: HomepageClientProps) {
  return (
    <div className="overflow-x-hidden">
      <section className="background-zone background-zone-hero border-b border-[var(--line)] py-8 md:py-12">
        <div className="container">
          <div className="min-w-0">
            <p className={`${accentFont.className} text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--accent)]`}>
              {formatHeroEyebrow(data.hero.eyebrow)}
            </p>
            <h1 className={`${displayFont.className} mt-6 max-w-5xl text-[clamp(3.1rem,6.6vw,6.7rem)] font-semibold leading-[1.08] text-[var(--text)]`}>
              {data.hero.title}
            </h1>
            <div className="mt-7 max-w-4xl border-y border-[var(--line)] py-5">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">Что такое BARSYNERGY</p>
              <p className="mt-3 text-base leading-8 text-[var(--text)] md:text-lg">{data.hero.description}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="background-zone background-zone-beige scroll-mt-28 border-b border-[var(--line)] py-8 md:py-14" id="home-current">
        <div className="container">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className={`${displayFont.className} text-[2.35rem] font-semibold leading-none text-[var(--text)] md:text-[3.2rem]`}>
                Актуальное
              </h2>
            </div>
            <Button className="px-0 text-sm tracking-normal" href="/articles" variant="ghost">
              Все материалы
              <ArrowUpRight size={16} />
            </Button>
          </div>
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.62fr)]">
            <FeaturedNowCard card={data.article} />
            <div className="border-y border-[var(--line)] sm:border-y-0 xl:[&>a]:h-full">
              <NowCard actionLabel="Открыть событие" card={data.event} href="/events" icon={CalendarDays} label="Событие" />
            </div>
            <div className="border-y border-[var(--line)] sm:grid sm:grid-cols-2 sm:gap-3 sm:border-y-0 xl:col-span-2 xl:grid-cols-3">
              <NowCard actionLabel="Откликнуться" card={data.vacancy} href="/vacancies" icon={BriefcaseBusiness} label="Вакансия" />
              <NowCard actionLabel="Читать" card={data.secondaryArticle} fallbackMeta="Другие материалы" href="/articles" icon={BookOpen} label="Материал" />
              <NowCard actionLabel="Открыть каталог" card={data.supplier} href="/suppliers" icon={PackageCheck} label="Поставщик" />
            </div>
          </div>
        </div>
      </section>

      <RouteIndexPanel data={data} />

      {data.calculatorTeaser ? <ToolTeaser teaser={data.calculatorTeaser} /> : null}

      <AudienceActionCards cards={data.audienceCards} />

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

      {data.socialBlocks.length > 0 ? <CommunityChannelRows channels={data.socialBlocks} /> : null}

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
