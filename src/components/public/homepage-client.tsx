'use client';

import { useRef } from 'react';
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

function SpotlightCard({ card, className, tone = 'light' }: SpotlightCardProps) {
  const toneClasses =
    tone === 'dark'
      ? 'border-white/14 bg-[var(--graphite)] text-white'
      : tone === 'accent'
        ? 'border-[var(--accent)]/30 bg-[var(--accent)] text-white'
        : 'border-black/12 bg-[color-mix(in_oklab,var(--surface),white_34%)] text-[var(--text)]';
  const mutedText = tone === 'light' ? 'text-[var(--muted)]' : 'text-white/72';
  const metaTone = tone === 'light' ? 'text-[var(--accent)]' : 'text-white/68';
  const buttonVariant = tone === 'light' ? 'secondary' : 'inverse';

  return (
    <article
      className={cn(
        'group relative flex h-full min-w-0 flex-col overflow-hidden rounded-[var(--radius-xl)] border shadow-[0_24px_80px_rgba(20,20,18,0.08)]',
        toneClasses,
        className
      )}
      data-scale-card
    >
      <div className="relative m-3 aspect-[1.35] overflow-hidden rounded-[24px] border border-current/10 bg-black/12" data-card-media>
        {card.imageUrl ? (
          <Image
            alt={card.title}
            className="h-full w-full object-cover grayscale transition-transform duration-700 ease-out group-hover:scale-105"
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
            className="h-full w-full bg-cover bg-center grayscale opacity-90 transition-transform duration-700 ease-out group-hover:scale-105"
            style={{ backgroundImage: `url(${fallbackCardImages[card.kind]})` }}
          />
        )}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(20,20,18,0.08),rgba(20,20,18,0.48))]" />
        <div className="absolute left-5 top-5">
          <span className="inline-flex min-h-10 items-center rounded-full border border-white/28 bg-[var(--graphite)] px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)]">
            {card.eyebrow}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-5 p-6 md:p-7">
        <div>
          <h3 className={`${displayFont.className} display-tight max-w-3xl text-[30px] md:text-[38px]`}>{card.title}</h3>
          <p className={cn('mt-4 text-sm leading-7 md:text-[15px]', mutedText)}>{card.summary}</p>
        </div>
        <div className="mt-auto flex flex-wrap gap-2">
          {card.meta.map((item) => (
            <span
              className={cn(
                'inline-flex min-h-9 items-center rounded-full border px-3 text-[11px] font-semibold uppercase tracking-[0.12em]',
                tone === 'light' ? 'border-black/12 bg-white/80' : 'border-white/16 bg-white/[0.06]',
                metaTone
              )}
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between gap-4">
          <p className={cn('text-xs font-semibold uppercase tracking-[0.14em]', mutedText)}>
            {card.isFallback ? 'Раздел открыт' : 'Публичный материал'}
          </p>
          <Button
            className="rounded-full px-5"
            href={card.href}
            size="md"
            variant={buttonVariant}
          >
            {card.actionLabel}
            <ArrowUpRight size={18} />
          </Button>
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
              Образование, события, материалы, вакансии, поставщики и партнерские возможности в одном месте,
              где специалист, команда и бизнес быстрее находят следующий рабочий шаг.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button className="rounded-full px-6 text-white" href="/education" size="lg" variant="primary">
                Перейти к программам
                <ArrowUpRight size={18} />
              </Button>
              <Button className="rounded-full px-6 text-white" href="/contacts" size="lg" variant="inverse">
                Связаться с командой
                <ArrowUpRight size={18} />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/12 pt-14 pb-20 md:pt-18 md:pb-24 xl:pt-20 xl:pb-28">
        <div className="container">
          <div className="max-w-3xl">
            <h2 className={`${displayFont.className} display-tight max-w-4xl text-[42px] md:text-[64px] xl:text-[78px]`}>
              Актуальная сводка
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
