'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight, Camera, PhoneCall, Send } from 'lucide-react';
import { GeneralSponsorCard } from '@/components/public/general-sponsor-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { accentFont, displayFont } from '@/lib/fonts';
import { GENERAL_SPONSORS } from '@/lib/public/general-sponsors';
import type { HomepageData, HomepageLiveCard } from '@/lib/public/home';

gsap.registerPlugin(ScrollTrigger, useGSAP);

type HomepageClientProps = {
  data: HomepageData;
};

type SpotlightCardProps = {
  card: HomepageLiveCard;
  className?: string;
  tone?: 'light' | 'dark' | 'accent';
};

const homeHeroImage =
  'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=1920&q=80';

const fallbackCardImages: Record<HomepageLiveCard['kind'], string> = {
  course: '/images/home/professional-education.webp',
  event: '/images/generated/program-events.jpg',
  article: '/images/generated/content-guide.jpg',
  vacancy: '/images/generated/content-interview.jpg',
  supplier: '/images/home/project-growth.webp'
};

const audienceGroups = [
  {
    id: '01',
    marker: 'Специалисты',
    badge: 'Карьера',
    title: 'Для специалистов',
    description: 'Курсы, события, вакансии и материалы, которые помогают расти в профессии.',
    items: [
      { label: 'Выбрать обучение', href: '/education' },
      { label: 'Посмотреть события', href: '/events' },
      { label: 'Открыть вакансии', href: '/vacancies' },
      { label: 'Читать практические материалы', href: '/articles' }
    ]
  },
  {
    id: '02',
    marker: 'Заведения',
    badge: 'Операции',
    title: 'Для заведений',
    description: 'Всё, что нужно команде в работе: люди, поставщики, партнёры и обучение.',
    items: [
      { label: 'Разместить вакансию', href: '/vacancies' },
      { label: 'Найти поставщика', href: '/suppliers' },
      { label: 'Предложить событие', href: '/events' },
      { label: 'Собрать обучение для команды', href: '/education' }
    ]
  },
  {
    id: '03',
    marker: 'Партнёры',
    badge: 'Партнёрства',
    title: 'Для брендов и поставщиков',
    description: 'Каталог, партнёрства и заметное присутствие в профессиональной среде региона.',
    items: [
      { label: 'Попасть в каталог', href: '/suppliers' },
      { label: 'Запустить партнёрский формат', href: '/partners' },
      { label: 'Обсудить спонсорство', href: '/general-sponsors' },
      { label: 'Связаться с командой', href: '/contacts' }
    ]
  }
] as const;

const socialPromos = [
  {
    name: 'Telegram',
    title: 'Следить за курсами, событиями и новыми анонсами',
    description: 'Канал для быстрых обновлений: даты, наборы, полезные материалы и новости проекта.',
    actionLabel: 'Перейти в Telegram',
    href: 'https://t.me/barsynergy',
    surfaceClassName: 'bg-[#4696ea]',
    iconWrapClassName:
      'bg-[linear-gradient(180deg,rgba(255,255,255,0.28),rgba(28,108,196,0.28))] shadow-[18px_20px_0_rgba(26,77,142,0.18),0_26px_56px_rgba(20,52,98,0.24)]',
    icon: Send,
    gridClassName: 'md:col-span-1'
  },
  {
    name: 'WhatsApp',
    title: 'Задать вопрос и быстро связаться с командой',
    description: 'Если нужен короткий вопрос, быстрый контакт или вход в сообщество, переходите сразу в чат.',
    actionLabel: 'Перейти в WhatsApp',
    href: 'https://chat.whatsapp.com/GlAY6QDLeAt4jeKsAFkgu4?mode=gi_t',
    surfaceClassName: 'bg-[#6abf5f]',
    iconWrapClassName:
      'bg-[linear-gradient(180deg,rgba(255,255,255,0.3),rgba(46,143,33,0.28))] shadow-[18px_20px_0_rgba(50,104,41,0.16),0_26px_56px_rgba(33,83,29,0.22)]',
    icon: PhoneCall,
    gridClassName: 'md:col-span-1'
  },
  {
    name: 'Instagram',
    title: 'Смотреть новости проекта, фото и живые обновления',
    description: 'Лента с визуальными анонсами, закулисьем мероприятий и тем, что происходит вокруг BARSYNERGY.',
    actionLabel: 'Перейти в Instagram',
    href: 'https://www.instagram.com/bar.synergy?igsh=MXE3b2hjYjE2MGplcQ==',
    surfaceClassName: 'bg-[linear-gradient(135deg,#d6714f_0%,#c14f7a_48%,#7258d9_100%)]',
    iconWrapClassName:
      'bg-[linear-gradient(180deg,rgba(255,255,255,0.26),rgba(119,57,167,0.26))] shadow-[18px_20px_0_rgba(111,49,95,0.14),0_26px_56px_rgba(70,24,76,0.26)]',
    icon: Camera,
    gridClassName: 'md:col-span-2 xl:col-span-1'
  }
] as const;

function resolveSpotlightKicker(card: HomepageLiveCard) {
  switch (card.kind) {
    case 'article':
      return card.isFallback ? 'BARSYNERGY Index / Материалы' : 'Редакционная подборка';
    case 'course':
      return 'Для команды и личного роста';
    case 'event':
      return 'Календарь отраслевых встреч';
    case 'vacancy':
      return 'Найм и карьерные переходы';
    case 'supplier':
      return 'Каталог и рабочие контакты';
    default:
      return card.eyebrow;
  }
}

function resolveSpotlightMetaLine(card: HomepageLiveCard) {
  const compactMeta = card.meta.filter(Boolean).slice(0, 2);

  if (compactMeta.length > 0) {
    return compactMeta.join(' · ');
  }

  return card.kind === 'article' ? 'Открытый доступ · BARSYNERGY' : undefined;
}

function resolveSpotlightFooterMeta(card: HomepageLiveCard) {
  const readTime = card.meta.find((item) => /\bмин\b/.test(item));

  switch (card.kind) {
    case 'article':
      return readTime ? `Материал · ${readTime}` : 'Материал · Открытый доступ';
    case 'course':
      return 'Программа · Подробности';
    case 'event':
      return 'Событие · Подробности';
    case 'vacancy':
      return 'Вакансия · Можно откликнуться';
    case 'supplier':
      return 'Каталог · Контакт компании';
    default:
      return card.isFallback ? 'Раздел доступен' : 'Опубликованный материал';
  }
}

function SpotlightCard({ card, className, tone = 'light' }: SpotlightCardProps) {
  const toneClasses =
    tone === 'dark'
      ? 'border-white/14 bg-[var(--graphite)] text-white'
      : tone === 'accent'
        ? 'border-[var(--accent)]/30 bg-[var(--accent)] text-white'
        : 'border-black/12 bg-[color-mix(in_oklab,var(--surface),white_22%)] text-[var(--text)]';
  const mutedText = tone === 'light' ? 'text-[var(--muted)]' : 'text-white/72';
  const metaTone = tone === 'light' ? 'text-[var(--accent)]' : 'text-white/68';
  const dividerTone = tone === 'light' ? 'border-[rgba(191,168,143,0.42)]' : 'border-white/12';
  const kicker = resolveSpotlightKicker(card);
  const metaLine = resolveSpotlightMetaLine(card);
  const footerMeta = resolveSpotlightFooterMeta(card);

  return (
    <article
      className={cn(
        'group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[30px] border shadow-[0_18px_48px_rgba(20,20,18,0.06)] lg:rounded-[26px] xl:rounded-[30px]',
        toneClasses,
        className
      )}
      data-scale-card
    >
      <div
        className={cn(
          'relative m-3 aspect-[1.24] overflow-hidden rounded-[22px] border bg-black/12 lg:m-2.5 lg:aspect-[1.08] lg:rounded-[18px] xl:m-3 xl:aspect-[1.24] xl:rounded-[22px]',
          tone === 'light' ? 'border-black/10' : 'border-white/10'
        )}
        data-card-media
      >
        {card.imageUrl ? (
          <Image
            alt={card.title}
            className="h-full w-full object-cover grayscale brightness-[0.92] contrast-[1.08] transition-transform duration-700 ease-out group-hover:scale-[1.045]"
            height={900}
            loading="lazy"
            quality={72}
            sizes="(min-width: 1280px) 42vw, (min-width: 768px) 50vw, 100vw"
            src={card.imageUrl}
            width={1400}
          />
        ) : (
          <div
            aria-hidden="true"
            className="h-full w-full bg-cover bg-center grayscale opacity-90 brightness-[0.92] contrast-[1.08] transition-transform duration-700 ease-out group-hover:scale-[1.045]"
            style={{ backgroundImage: `url(${fallbackCardImages[card.kind]})` }}
          />
        )}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(20,20,18,0.16),rgba(20,20,18,0.52))]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url('/images/grain.svg')] opacity-[0.14] mix-blend-soft-light" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-white/18" />
        <div className="absolute left-4 top-4">
          <div className="inline-flex min-h-9 items-center gap-3 rounded-full border border-white/14 bg-[rgba(20,20,18,0.38)] px-3.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90 shadow-[0_10px_24px_rgba(20,20,18,0.18)] backdrop-blur-[3px]">
            <span aria-hidden="true" className="h-px w-5 bg-white/45" />
            <span>{card.eyebrow}</span>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-2 md:px-6 md:pb-6 lg:px-5 lg:pb-5 xl:px-6 xl:pb-6">
        <div className="flex flex-1 flex-col">
          <p className={cn('text-[10px] font-semibold uppercase tracking-[0.16em]', metaTone)}>{kicker}</p>
          <h3
            className={cn(
              `${displayFont.className} display-tight mt-3 break-normal text-balance leading-[0.94] tracking-[0.012em] md:text-[34px] lg:text-[30px] xl:text-[36px]`,
              card.kind === 'article'
                ? 'max-w-none text-[22px] uppercase sm:text-[24px] md:max-w-[13ch] md:text-[34px] lg:max-w-[12ch] lg:text-[30px] xl:text-[36px]'
                : 'max-w-none text-[22px] sm:text-[24px] md:max-w-[14ch] md:text-[34px] lg:max-w-[12ch] lg:text-[30px] xl:max-w-[14ch] xl:text-[36px]'
            )}
            style={{ overflowWrap: 'normal', wordBreak: 'normal' }}
          >
            {card.title}
          </h3>
          <p className={cn('mt-3 max-w-[42ch] text-sm leading-6 md:text-[15px] md:leading-6 lg:text-[14px] lg:leading-5 xl:max-w-[46ch] xl:text-[15px] xl:leading-6', mutedText)}>
            {card.summary}
          </p>
          {metaLine ? (
            <div className={cn('mt-4 flex items-center gap-3 border-t pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] lg:mt-3 lg:pt-2.5', dividerTone, metaTone)}>
              <span aria-hidden="true" className="h-px w-6 bg-current/35" />
              <span>{metaLine}</span>
            </div>
          ) : null}
        </div>

        <div className={cn('mt-5 border-t pt-4 lg:mt-4 lg:pt-3', dividerTone)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className={cn('text-[11px] font-semibold uppercase tracking-[0.16em]', mutedText)}>{footerMeta}</p>
            <Link
              className={cn(
                'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border px-4 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200 sm:w-auto lg:min-h-10 lg:px-3.5',
                tone === 'light'
                  ? 'border-black/12 text-[var(--text)] hover:border-[var(--accent)] hover:bg-[color-mix(in_oklab,var(--surface),var(--accent)_6%)] hover:text-[var(--accent)]'
                  : 'border-white/18 text-white hover:bg-white/[0.08]'
              )}
              href={card.href}
            >
              <span>{card.actionLabel}</span>
              <ArrowUpRight className="shrink-0" size={16} />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function SocialPromoCard({
  promo
}: {
  promo: (typeof socialPromos)[number];
}) {
  const Icon = promo.icon;

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-[28px] border border-black/10 text-white shadow-[0_20px_48px_rgba(20,20,18,0.08)] md:rounded-[30px]',
        promo.surfaceClassName,
        promo.gridClassName
      )}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url('/images/grain.svg')] opacity-[0.14]" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-12 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-white/12 blur-3xl md:h-56 md:w-56"
      />

      <div className="relative grid gap-5 p-5 sm:p-6 md:grid-cols-[minmax(0,1fr)_136px] md:items-center md:gap-5 md:p-5 lg:grid-cols-[minmax(0,1fr)_148px] lg:gap-6 lg:p-6 xl:grid-cols-[minmax(0,1fr)_188px] xl:gap-8 xl:p-8">
        <div className="max-w-[34rem]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">{promo.name}</p>
          <h2
            className={cn(
              `${displayFont.className} display-tight mt-4 max-w-[11ch] text-[30px] leading-[0.94] sm:text-[34px] md:text-[32px] lg:text-[36px] xl:max-w-[12ch] xl:text-[44px]`
            )}
          >
            {promo.title}
          </h2>
          <p className="mt-3 max-w-[28rem] text-sm leading-6 text-white/78 md:text-[13px] md:leading-6 lg:text-[14px] xl:max-w-[30rem] xl:text-[15px] xl:leading-7">
            {promo.description}
          </p>

          <a
            className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-[18px] border border-white/68 px-5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent sm:w-auto sm:min-w-[220px]"
            href={promo.href}
            rel="noreferrer"
            target="_blank"
          >
            {promo.actionLabel}
          </a>
        </div>

        <div className="flex justify-start md:justify-end">
          <div
            className={cn(
              'relative flex aspect-square w-[132px] rotate-[8deg] items-center justify-center rounded-[28px] border border-white/18 backdrop-blur-[1.5px] transition-transform duration-300 group-hover:-translate-y-1 group-hover:rotate-[4deg] sm:w-[144px] md:w-[136px] lg:w-[148px] xl:w-[188px]',
              promo.iconWrapClassName
            )}
            data-card-media
          >
            <div aria-hidden="true" className="absolute inset-[10px] rounded-[28px] border border-white/14 bg-black/8" />
            <div
              aria-hidden="true"
              className="absolute inset-[22px] rounded-[24px] bg-[radial-gradient(circle_at_30%_24%,rgba(255,255,255,0.42),rgba(255,255,255,0.08)_36%,transparent_72%)]"
            />
            <Icon
              className="relative z-10 h-16 w-16 drop-shadow-[0_6px_18px_rgba(20,20,18,0.24)] sm:h-[72px] sm:w-[72px] md:h-[62px] md:w-[62px] lg:h-[68px] lg:w-[68px] xl:h-20 xl:w-20"
              strokeWidth={2.2}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

export function HomepageClient({ data }: HomepageClientProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      const cards = gsap.utils.toArray<HTMLElement>('[data-scale-card]', rootRef.current);

      cards.forEach((card) => {
        const mediaNode = card.querySelector<HTMLElement>('[data-card-media]');

        if (!mediaNode) {
          return;
        }

        gsap.fromTo(
          mediaNode,
          { scale: 0.94, opacity: 0.72 },
          {
            scale: 1,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: card,
              start: 'top 82%',
              end: 'bottom 36%',
              scrub: true
            }
          }
        );
      });
    },
    { dependencies: [data], scope: rootRef }
  );

  return (
    <div className="overflow-x-hidden w-full max-w-full" ref={rootRef}>
      <section className="relative isolate overflow-hidden border-b border-black/12 bg-[var(--graphite)] pt-[98px] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-65 mix-blend-luminosity contrast-125"
          style={{ backgroundImage: `url(${homeHeroImage})` }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.22),transparent_26%),linear-gradient(180deg,rgba(20,20,18,0.36),rgba(20,20,18,0.88))]"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[url('/images/grain.svg')] opacity-25" />

        <div className="container relative py-28 md:py-36 xl:py-44">
          <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
            <p className={`${accentFont.className} text-sm uppercase tracking-[0.42em] text-white/62`}>BARSYNERGY</p>
            <h1 className={`${displayFont.className} display-tight mt-8 max-w-6xl text-[clamp(2.8rem,6.3vw,6.6rem)]`}>
              Барная среда
              <span aria-hidden="true" className="hidden sm:block" />
              <span className="sm:hidden"> </span>
              СКФО в одном месте
            </h1>
            <p className="mt-8 max-w-3xl text-base leading-8 text-white/76 md:text-lg">
              Обучение, события, материалы, вакансии, поставщики и партнёрства для специалистов,
              заведений и брендов региона.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button className="rounded-full px-6 text-white" href="#home-actions" size="lg" variant="primary">
                Открыть разделы
                <ArrowUpRight size={18} />
              </Button>
              <Button className="rounded-full px-6 text-white" href="/contacts" size="lg" variant="inverse">
                Разместить заявку
                <ArrowUpRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/12 py-12 md:py-16" id="home-actions">
        <div className="container grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {audienceGroups.map((group) => (
            <article
              className="group flex h-full min-w-0 flex-col rounded-[var(--radius-xl)] border border-black/10 bg-[color-mix(in_oklab,var(--surface),white_18%)] p-5 transition-[border-color,background-color,box-shadow] duration-300 hover:border-black/16 hover:bg-[var(--surface)] hover:shadow-[0_16px_40px_rgba(20,20,18,0.04)] md:p-6"
              key={group.title}
            >
              <div className="flex items-start justify-between gap-4 border-b border-[rgba(191,168,143,0.34)] pb-4">
                <div>
                  <span className="mb-3 block h-px w-10 bg-[var(--accent)]/45" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                    <span className="text-[var(--accent)]">{group.id}</span>
                    {' / '}
                    {group.marker}
                  </p>
                </div>
                <span className="inline-flex min-h-8 items-center rounded-full border border-black/10 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                  {group.badge}
                </span>
              </div>

              <div className="pt-5">
                <h2 className={`${displayFont.className} display-tight text-[28px] leading-[0.96] md:text-[34px] xl:text-[36px]`}>
                  {group.title}
                </h2>
                <p className="mt-3 max-w-[34ch] text-sm leading-7 text-[var(--muted)] md:text-[15px]">
                  {group.description}
                </p>
              </div>

              <ul className="mt-6 flex-1 border-y border-[rgba(191,168,143,0.34)]">
                {group.items.map((item) => (
                  <li className="border-t border-[rgba(191,168,143,0.3)] first:border-t-0" key={item.label}>
                    <Link
                      className="group/row -mx-2 flex min-h-11 items-center justify-between gap-4 rounded-[18px] px-2 py-3 text-left text-[15px] leading-6 text-[var(--text)] transition-colors duration-200 hover:bg-black/[0.02] hover:text-[var(--accent)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] focus-visible:ring-inset md:min-h-12"
                      href={item.href}
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight
                        className="shrink-0 text-[var(--muted)] transition-colors duration-200 group-hover/row:text-[var(--accent)]"
                        size={16}
                      />
                    </Link>
                  </li>
                ))}
              </ul>

            </article>
          ))}
        </div>
      </section>

      <section className="border-b border-black/12 pt-14 pb-20 md:pt-18 md:pb-24 xl:pt-20 xl:pb-28">
        <div className="container">
          <div className="max-w-3xl">
            <h2 className={`${displayFont.className} display-tight max-w-4xl text-[42px] md:text-[64px] xl:text-[78px]`}>
              Актуальное
            </h2>
          </div>

          <div className="mt-12 grid grid-flow-dense gap-4 lg:grid-cols-2 xl:gap-5 xl:grid-cols-12">
            <SpotlightCard card={data.course} className="xl:col-span-7" tone="dark" />
            <SpotlightCard card={data.event} className="xl:col-span-5" tone="accent" />
            <SpotlightCard card={data.article} className="xl:col-span-4" />
            <SpotlightCard card={data.vacancy} className="xl:col-span-4" />
            <SpotlightCard card={data.supplier} className="xl:col-span-4" />
          </div>
        </div>
      </section>

      <section className="border-b border-black/12 py-14 md:py-18 xl:py-20">
        <div className="container">
          <div className="max-w-4xl">
            <p className={`${accentFont.className} text-sm uppercase tracking-[0.24em] text-[var(--accent)]`}>Генеральные спонсоры</p>
            <h2 className={`${displayFont.className} display-tight mt-5 max-w-5xl text-[38px] md:text-[58px] xl:text-[70px]`}>
              Компании, которые поддерживают BARSYNERGY в работе с индустрией
            </h2>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-[var(--muted)] md:text-[15px]">
              Здесь показываем бренды и команды, с которыми можно работать напрямую по поставкам, событиям,
              обучению и рабочим форматам для заведений.
            </p>
          </div>

          <div className="mt-10 grid gap-5">
            {GENERAL_SPONSORS.map((sponsor) => (
              <GeneralSponsorCard key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-black/12 py-14 md:py-18 xl:py-20">
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

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:gap-5">
            {socialPromos.map((promo) => (
              <SocialPromoCard key={promo.name} promo={promo} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
