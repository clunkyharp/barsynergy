import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { PublicEyebrow } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { accentFont, displayFont } from '@/lib/fonts';
import type { HomepageData } from '@/lib/public/home';

function pluralRu(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

function HomeStatsLine({ stats }: { stats: HomepageData['stats'] }) {
  const statItems = [
    { value: stats.vacancies, label: pluralRu(stats.vacancies, 'вакансия', 'вакансии', 'вакансий') },
    { value: stats.suppliers, label: pluralRu(stats.suppliers, 'поставщик', 'поставщика', 'поставщиков') },
    { value: stats.articles, label: pluralRu(stats.articles, 'материал', 'материала', 'материалов') }
  ].filter((item) => item.value > 0);

  if (statItems.length === 0) {
    return null;
  }

  return (
    <dl className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-[12px] text-[rgba(255,253,249,0.66)] md:gap-x-12">
      {statItems.map((item) => (
        <div className="flex items-baseline gap-2.5" key={item.label}>
          <dd aria-label={`${item.value} ${item.label}`} className="order-1 text-[2.4rem] font-bold leading-none tabular-nums text-[var(--editorial-dark-text)] md:text-[3rem]">
            {item.value}
          </dd>
          <dt className="order-2 uppercase tracking-[0.1em] text-[var(--editorial-dark-muted)]">{item.label}</dt>
        </div>
      ))}
    </dl>
  );
}

export function HomeHeroRouter({ stats }: { stats: HomepageData['stats'] }) {
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
            <Button className="min-h-12 rounded-[var(--radius-sm)] px-8 text-[13px] uppercase tracking-[0.1em]" href="/vacancies">
              Смотреть вакансии
            </Button>
            <Button className="min-h-12 px-3 text-[13px] uppercase tracking-[0.1em]" href="/education" variant="on-dark">
              Найти обучение
              <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.8} />
            </Button>
          </div>
          <HomeStatsLine stats={stats} />
        </div>
      </div>
    </section>
  );
}
