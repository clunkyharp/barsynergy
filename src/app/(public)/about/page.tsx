import type { Metadata } from 'next';
import Image from 'next/image';
import { AppLink } from '@/components/ui/app-link';
import {
  BadgeCheck,
  PanelsTopLeft,
  Store,
  type LucideIcon
} from 'lucide-react';
import { PublicBreadcrumbs } from '@/components/public/public-primitives';
import { JsonLd } from '@/components/seo/json-ld';
import { Button } from '@/components/ui/button';
import { displayFont } from '@/lib/fonts';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'О проекте',
  description: 'BARSYNERGY собирает обучение, события, вакансии, поставщиков, партнёрства и инструменты для барной индустрии Северного Кавказа.',
  path: '/about'
});

const insidePlatform = [
  'события и профессиональные встречи',
  'программы и интенсивы',
  'вакансии для команд',
  'каталог поставщиков',
  'партнёрские и спонсорские форматы',
  'инструменты для заведений'
] as const;

const timeline = [
  {
    title: 'Идея',
    text: 'Собрать обучение, события, вакансии и поставщиков в одном месте.'
  },
  {
    title: 'Пилот',
    text: 'Проверить первые разделы на реальных сценариях бариста, кофеен и брендов.'
  },
  {
    title: 'Развитие',
    text: 'Довести каталог заведений, поставщиков и событий до ежедневного рабочего инструмента.'
  }
] as const;

const facts = [
  ['6+', 'публичных разделов в MVP'],
  ['СКФО', 'региональный фокус'],
  ['1', 'точка входа для заявок']
] as const;

function SectionTitle({
  eyebrow,
  title,
  text,
  className
}: {
  eyebrow?: string;
  title: string;
  text?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      {eyebrow ? <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--accent)]">{eyebrow}</p> : null}
      <h2 className={`${displayFont.className} mt-3 max-w-4xl text-[clamp(2.35rem,4.5vw,3.4rem)] font-semibold leading-none text-[var(--text)]`}>
        {title}
      </h2>
      {text ? <p className="mt-5 max-w-3xl text-base leading-7 text-[var(--muted)] md:text-lg md:leading-8">{text}</p> : null}
    </div>
  );
}

function DirectionIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-pill)] border border-[var(--border-default)] bg-[var(--surface-wash-strong)] text-[var(--accent)]">
      <Icon size={20} strokeWidth={1.8} />
    </span>
  );
}

export default function AboutPage() {
  return (
    <div className="bg-[var(--background)]">
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/about', 'О проекте')} />
      <section className="background-zone background-zone-hero border-b border-[var(--line)] py-12 md:py-16">
        <div className="mx-auto grid max-w-[1240px] gap-8 px-5 md:min-h-[520px] md:px-12 xl:grid-cols-[minmax(0,0.58fr)_minmax(0,0.42fr)] xl:items-center">
          <div className="min-w-0">
            <PublicBreadcrumbs current="О проекте" />
            <h1 className={`${displayFont.className} mt-5 max-w-4xl text-[clamp(2.5rem,5.6vw,4.25rem)] font-semibold leading-[0.96] text-[var(--text)]`}>
              BARSYNERGY — платформа для барной индустрии Северного Кавказа
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-7 text-[var(--muted)] md:text-lg md:leading-8">
              Здесь собраны события, вакансии, поставщики, партнёрские форматы и инструменты для бариста, кофеен, команд, экспертов и брендов региона.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button className="h-12 rounded-[var(--radius-md)] px-7" href="/contacts?topic=other#contact-form" size="lg">
                Связаться с командой
              </Button>
              <Button className="h-12 rounded-[var(--radius-md)] px-7" href="/education" size="lg" variant="secondary">
                Найти обучение
              </Button>
            </div>
          </div>

          <aside className="rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)] md:p-8">
            <div className="flex items-center gap-3">
              <DirectionIcon icon={PanelsTopLeft} />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Что внутри</p>
                <h2 className="mt-1 text-2xl font-semibold leading-7 text-[var(--text)]">Платформа для рабочих задач</h2>
              </div>
            </div>
            <ul className="mt-7 grid gap-3">
              {insidePlatform.map((item) => (
                <li className="flex gap-3 border-t border-[var(--line)] pt-3 text-sm leading-6 text-[var(--text)]" key={item}>
                  <BadgeCheck className="mt-0.5 shrink-0 text-[var(--accent)]" size={18} strokeWidth={1.8} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-14 md:py-20">
        <div className="mx-auto grid max-w-[1240px] gap-9 px-5 md:px-12 xl:grid-cols-[minmax(0,0.62fr)_minmax(18rem,0.38fr)]">
          <div>
            <SectionTitle title="Почему мы запустили BARSYNERGY" />
            <div className="mt-8 grid gap-5 text-base leading-8 text-[var(--muted)] md:text-lg md:leading-9">
              <p>
                В разных городах СКФО мы видели одну проблему. Бариста искали обучение в чатах. Кофейни находили specialty-поставщиков через личные рекомендации. О каппингах и открытых тренингах многие узнавали уже после события.
              </p>
              <blockquote className="border-l-2 border-[var(--accent)] pl-5 text-[var(--text)]">
                BARSYNERGY собирает обучение, вакансии, поставщиков и события в регионе: где учиться, кого звать в команду, к кому идти за зерном и где встретиться с коллегами.
              </blockquote>
              <p>
                Стало понятно, что дело не в отсутствии людей или интереса. После очередного события, о котором половина профессионального круга узнала уже постфактум, мы решили сделать единый сайт с понятными разделами и формами заявок.
              </p>
              <p>
                Сегодня на BARSYNERGY есть обучение, афиша, вакансии, материалы и каталог поставщиков. На главной видны счётчики вакансий, поставщиков и материалов, а новые заявки проходят через общие формы.
              </p>
              <p>
                Ближайшее направление развития — сделать каталог кофеен и поставщиков полезным для ежедневной работы: по городам, категориям, условиям и понятным контактам без лишней переписки.
              </p>
            </div>
            <dl className="mt-8 grid gap-3 sm:grid-cols-3">
              {facts.map(([value, label]) => (
                <div className="rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-card)] p-4" key={label}>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--muted)]">{label}</dt>
                  <dd className="mt-2 text-2xl font-semibold leading-none text-[var(--accent)]">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <aside className="grid gap-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-wash)]">
              <Image alt="Кофейный бар и рабочая стойка" className="object-cover" fill sizes="(min-width: 1024px) 38vw, 100vw" src="/images/home/hero-coffee-counter-haberdoedas.jpg" />
            </div>
            <ol className="about-timeline grid gap-4 py-2">
              {timeline.map((item, index) => (
                <li className="about-timeline-item relative grid gap-3 py-3 md:grid-cols-[2.25rem_minmax(0,1fr)]" key={item.title}>
                  <span className="about-timeline-dot flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--accent)] text-sm font-semibold tabular-nums text-[var(--accent-contrast)]">
                    {index + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      <section className="background-zone background-zone-cta py-14 md:py-20">
        <div className="mx-auto max-w-[1240px] px-5 md:px-12">
          <div className="rounded-[var(--radius-xl)] border border-[var(--editorial-dark-border)] bg-[var(--editorial-dark-surface)] p-6 text-white md:p-10 xl:p-12">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,0.55fr)_minmax(16rem,0.38fr)] xl:items-start">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--editorial-dark-label)]">Следующий шаг</p>
                <h2 className={`${displayFont.className} mt-4 max-w-4xl text-[clamp(2.55rem,5vw,4rem)] font-semibold leading-none text-white`}>
                  Хотите добавить событие, компанию, вакансию или партнёрскую идею?
                </h2>
                <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--editorial-dark-muted)] md:text-lg md:leading-9">
                  Напишите команде. Мы уточним задачу и подскажем, какой раздел или формат подходит для первого шага.
                </p>
              </div>
              <div className="flex flex-col gap-3 items-start xl:items-stretch">
                <Button className="h-12 w-full rounded-[var(--radius-md)] px-7 self-stretch" href="/contacts?topic=other#contact-form" size="lg">
                  Связаться с командой
                </Button>
                <div className="mt-3 flex gap-4 text-sm text-white/60">
                  <AppLink className="hover:text-white transition-colors" href="/contacts?topic=event#contact-form">
                    Предложить событие
                  </AppLink>
                  <AppLink className="hover:text-white transition-colors" href="/contacts?topic=partnership#contact-form">
                    Стать партнёром
                  </AppLink>
                </div>
              </div>
            </div>
            <div className="mt-8 flex items-center gap-3 border-t border-white/15 pt-5 text-sm leading-6 text-white/68">
              <Store className="shrink-0" size={18} strokeWidth={1.8} />
              <p>Платформа развивается: добавляем разделы и функции по запросам пользователей и партнёров.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
