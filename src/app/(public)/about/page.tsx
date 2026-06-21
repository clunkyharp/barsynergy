import type { Metadata } from 'next';
import Image from 'next/image';
import { JsonLd } from '@/components/seo/json-ld';
import { Button } from '@/components/ui/button';
import { AppLink } from '@/components/ui/app-link';
import { SectionIcon, type SectionIconType } from '@/components/public/section-icon';
import { displayFont } from '@/lib/fonts';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'О проекте',
  description: 'BARSYNERGY собирает обучение, события, вакансии, поставщиков, партнёрства и инструменты для барной индустрии Северного Кавказа.',
  path: '/about'
});

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

const platformFeatures: { title: string; text: string; href: string; icon: SectionIconType }[] = [
  { title: 'Вакансии', text: 'Позиции для бариста, барменов, управляющих и специалистов индустрии.', href: '/vacancies', icon: 'vacancies' },
  { title: 'Обучение', text: 'Курсы, мастер-классы и практические программы для команд и специалистов.', href: '/education', icon: 'education' },
  { title: 'События', text: 'Каппинги, чемпионаты, лекции и встречи кофейного сообщества.', href: '/events', icon: 'events' },
  { title: 'Поставщики', text: 'Каталог компаний: зерно, оборудование, расходники и сервис.', href: '/suppliers', icon: 'suppliers' },
  { title: 'Мастера', text: 'Профили специалистов по запуску, обучению и обслуживанию.', href: '/masters', icon: 'handshake' },
  { title: 'Калькулятор', text: 'Расчёт себестоимости и розничной цены напитков.', href: '/tools/cost-calculator', icon: 'calculator' }
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/about', 'О проекте')} />

      {/* ── 1. HERO ── */}
      <section className="page-hero">
        <div className="container page-hero-content">
          <p className="section-label">О проекте</p>
          <h1 className={displayFont.className}>
            BARSYNERGY — платформа для барной индустрии Северного Кавказа
          </h1>
          <p>
            Здесь собраны события, вакансии, поставщики, партнёрские форматы и инструменты
            для бариста, кофеен, команд, экспертов и брендов региона.
          </p>
        </div>
      </section>

      {/* ── 2. MISSION ── */}
      <section className="mission">
        <div className="container">
          <div className="mission-grid">

            <div className="mission-visual">
              <Image
                alt="Кофейный бар и рабочая стойка"
                className="object-cover"
                fill
                sizes="(min-width: 960px) 50vw, 100vw"
                src="/images/about/mission-tools-overhead.png"
              />
            </div>

            <div className="mission-text">
              <p className="section-label">Миссия</p>
              <h2 className={`section-title ${displayFont.className}`}>
                Почему мы запустили BARSYNERGY
              </h2>
              <p>
                В разных городах СКФО мы видели одну проблему. Бариста искали обучение в чатах.
                Кофейни находили specialty-поставщиков через личные рекомендации. О каппингах
                и открытых тренингах многие узнавали уже после события.
              </p>
              <blockquote>
                BARSYNERGY собирает обучение, вакансии, поставщиков и события в регионе:
                где учиться, кого звать в команду, к кому идти за зерном и где встретиться
                с коллегами.
              </blockquote>
              <p>
                Стало понятно, что дело не в отсутствии людей или интереса. После очередного
                события, о котором половина профессионального круга узнала уже постфактум, мы
                решили собрать разделы, куда можно быстро отправить событие, вакансию, заявку
                или материал.
              </p>
              <p>
                Сегодня на BARSYNERGY есть обучение, афиша, вакансии, материалы и каталог
                поставщиков. Новые заявки проходят через формы, а редакция постепенно приводит
                разделы к одному понятному формату.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3. TIMELINE ── */}
      <section className="timeline-section">
        <div className="container">

          <div className="timeline-header">
            <p className="section-label">История</p>
            <h2 className={`section-title ${displayFont.className}`}>
              Как развивается платформа
            </h2>
            <p className="section-subtitle">
              Ключевые этапы от идеи до рабочего инструмента для индустрии
            </p>
          </div>

          <ol className="timeline">
            {timeline.map((item) => (
              <li key={item.title} className="milestone">
                <span className="milestone-dot" />
                <div className="milestone-content">
                  <div className="milestone-title">{item.title}</div>
                  <div className="milestone-desc">{item.text}</div>
                </div>
              </li>
            ))}
          </ol>

        </div>
      </section>

      {/* ── PLATFORM FEATURES ── */}
      <section className="features">
        <div className="container">
          <p className="section-label">Возможности</p>
          <h2 className={`section-title ${displayFont.className}`}>Что внутри платформы</h2>
          <p className="section-subtitle">
            Шесть рабочих разделов для специалистов и заведений индустрии.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {platformFeatures.map((feature) => (
              <AppLink
                className="public-card-shell flex flex-col gap-3 p-6"
                href={feature.href}
                key={feature.title}
              >
                <SectionIcon size={40} type={feature.icon} />
                <h3 className={`${displayFont.className} text-[1.15rem] font-semibold leading-tight text-[var(--text)]`}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-[1.6] text-[var(--muted)]">{feature.text}</p>
              </AppLink>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="background-zone background-zone-cta py-14 md:py-20">
        <div className="container">
          <div
            className="rounded-[var(--radius-xl)] border border-[var(--editorial-dark-border)] bg-[var(--editorial-dark-surface)] p-6 text-center md:p-10 xl:p-12"
            data-theme="dark"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--editorial-dark-label)]">
              Следующий шаг
            </p>
            <h2
              className={`${displayFont.className} mx-auto mt-4 max-w-4xl text-[clamp(2.55rem,5vw,4rem)] font-semibold leading-none text-white`}
            >
              Хотите добавить событие, компанию, вакансию или партнёрскую идею?
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-[var(--editorial-dark-muted)] md:text-lg md:leading-9">
              Напишите команде. Мы уточним задачу и подскажем, какой раздел или формат подходит для первого шага.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              <Button
                className="h-12 rounded-[var(--radius-md)] px-7"
                href="/contacts?topic=other#contact-form"
                size="lg"
              >
                Связаться с командой
              </Button>
              <AppLink
                className="inline-flex items-center gap-1.5 font-medium text-white/70 transition-colors hover:text-white"
                href="/contacts?topic=partnership#contact-form"
              >
                Предложить событие
              </AppLink>
              <span className="text-white/30" aria-hidden="true">·</span>
              <AppLink
                className="inline-flex items-center gap-1.5 font-medium text-white/70 transition-colors hover:text-white"
                href="/contacts?topic=partnership#contact-form"
              >
                Стать партнёром
              </AppLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
