'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { accentFont, displayFont } from '@/lib/fonts';
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
        'group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[30px] border shadow-[0_18px_48px_rgba(20,20,18,0.06)]',
        toneClasses,
        className
      )}
      data-scale-card
    >
      <div
        className={cn(
          'relative m-3 aspect-[1.24] overflow-hidden rounded-[22px] border bg-black/12',
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
      <div className="flex flex-1 flex-col px-5 pb-5 pt-2 md:px-6 md:pb-6">
        <div className="flex flex-1 flex-col">
          <p className={cn('text-[10px] font-semibold uppercase tracking-[0.16em]', metaTone)}>{kicker}</p>
          <h3
            className={cn(
              `${displayFont.className} display-tight mt-3 break-normal text-balance leading-[0.94] tracking-[0.012em] md:text-[34px] xl:text-[36px]`,
              card.kind === 'article'
                ? 'max-w-none text-[22px] uppercase sm:text-[24px] md:max-w-[13ch] md:text-[34px]'
                : 'max-w-none text-[22px] sm:text-[24px] md:max-w-[14ch] md:text-[34px]'
            )}
            style={{ overflowWrap: 'normal', wordBreak: 'normal' }}
          >
            {card.title}
          </h3>
          <p className={cn('mt-3 max-w-[46ch] text-sm leading-6 md:text-[15px] md:leading-6', mutedText)}>{card.summary}</p>
          {metaLine ? (
            <div className={cn('mt-4 flex items-center gap-3 border-t pt-3 text-[10px] font-semibold uppercase tracking-[0.14em]', dividerTone, metaTone)}>
              <span aria-hidden="true" className="h-px w-6 bg-current/35" />
              <span>{metaLine}</span>
            </div>
          ) : null}
        </div>

        <div className={cn('mt-5 border-t pt-4', dividerTone)}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className={cn('text-[11px] font-semibold uppercase tracking-[0.16em]', mutedText)}>{footerMeta}</p>
            <Link
              className={cn(
                'inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border px-4 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors duration-200 sm:w-auto',
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
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2" id="home-actions">
              {['Образование', 'События', 'Вакансии', 'Поставщики', 'Знания', 'Партнёрства'].map((item) => (
                <span
                  className="inline-flex min-h-10 items-center rounded-full border border-white/16 bg-white/[0.06] px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/76"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/12 py-12 md:py-16">
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

          <div className="mt-12 grid grid-flow-dense gap-5 xl:grid-cols-12">
            <SpotlightCard card={data.course} className="xl:col-span-7" tone="dark" />
            <SpotlightCard card={data.event} className="xl:col-span-5" tone="accent" />
            <SpotlightCard card={data.article} className="xl:col-span-4" />
            <SpotlightCard card={data.vacancy} className="xl:col-span-4" />
            <SpotlightCard card={data.supplier} className="xl:col-span-4" />
          </div>
        </div>
      </section>
    </div>
  );
}
