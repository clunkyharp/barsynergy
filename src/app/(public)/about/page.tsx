import type { Metadata } from 'next';
import Image from 'next/image';
import { Briefcase, Calendar, GraduationCap, Handshake, Package, Wrench } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { PageHero } from '@/components/public/page-hero';
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

const insidePlatform: { title: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { title: 'события и профессиональные встречи', icon: Calendar },
  { title: 'программы и интенсивы',              icon: GraduationCap },
  { title: 'вакансии для команд',                icon: Briefcase },
  { title: 'каталог поставщиков',                icon: Package },
  { title: 'партнёрские и спонсорские форматы',  icon: Handshake },
  { title: 'инструменты для заведений',          icon: Wrench },
];

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


export default function AboutPage() {
  const insideMedia = (
    <aside className="w-full max-w-sm rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)] md:p-8">
      <div className="flex items-center gap-3">
        <Image alt="" aria-hidden="true" height={56} priority src="/icons/platform/platform-core.png" width={56} />
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Что внутри</p>
          <h2 className="mt-1 text-2xl font-semibold leading-7 text-[var(--text)]">Платформа для рабочих задач</h2>
        </div>
      </div>
      <ul className="mt-7 grid gap-1">
        {insidePlatform.map((item) => (
          <li className="flex items-center gap-3 border-t border-[var(--line)] py-2.5 text-sm leading-6 text-[var(--text)]" key={item.title}>
            <span className="flex size-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--accent-soft)] text-[var(--accent)]" aria-hidden="true">
              {(() => {
                const Icon = item.icon;
                return <Icon size={18} />;
              })()}
            </span>
            <span>{item.title}</span>
          </li>
        ))}
      </ul>
    </aside>
  );

  return (
    <div className="bg-[var(--background)]">
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/about', 'О проекте')} />
      <PageHero
        breadcrumbs={[{ label: 'О проекте' }]}
        title="BARSYNERGY — платформа для барной индустрии Северного Кавказа"
        subtitle="Здесь собраны события, вакансии, поставщики, партнёрские форматы и инструменты для бариста, кофеен, команд, экспертов и брендов региона."
        tone="light-editorial"
        actions={[
          { label: 'Связаться с командой', href: '/contacts?topic=other#contact-form', kind: 'primary' },
          { label: 'Найти обучение', href: '/education', kind: 'secondary' }
        ]}
        media={{ kind: 'slot' as const, children: insideMedia }}
      />

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
          <div className="rounded-[var(--radius-xl)] border border-[var(--editorial-dark-border)] bg-[var(--editorial-dark-surface)] p-6 text-white md:p-10 xl:p-12" data-theme="dark">
            <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--editorial-dark-label)]">Следующий шаг</p>
                <h2 className={`${displayFont.className} mt-4 max-w-4xl text-[clamp(2.55rem,5vw,4rem)] font-semibold leading-none text-white`}>
                  Хотите добавить событие, компанию, вакансию или партнёрскую идею?
                </h2>
                <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--editorial-dark-muted)] md:text-lg md:leading-9">
                  Напишите команде. Мы уточним задачу и подскажем, какой раздел или формат подходит для первого шага.
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Button className="h-12 rounded-[var(--radius-md)] px-7" href="/contacts?topic=other#contact-form" size="lg">
                    Связаться с командой
                  </Button>
                  <AppLink className="inline-flex items-center gap-1.5 font-medium text-white/70 hover:text-white transition-colors" href="/contacts?topic=event#contact-form">
                    Предложить событие
                  </AppLink>
                  <span className="text-white/30" aria-hidden="true">·</span>
                  <AppLink className="inline-flex items-center gap-1.5 font-medium text-white/70 hover:text-white transition-colors" href="/contacts?topic=partnership#contact-form">
                    Стать партнёром
                  </AppLink>
                </div>
              </div>
          </div>
        </div>
      </section>
    </div>
  );
}
