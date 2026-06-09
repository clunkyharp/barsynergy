import type { Metadata } from 'next';
import { ArrowUpRight, Check } from 'lucide-react';
import { GeneralSponsorCard } from '@/components/public/general-sponsor-card';
import { PublicBreadcrumbs, PublicEyebrow } from '@/components/public/public-primitives';
import { JsonLd } from '@/components/seo/json-ld';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { AppLink } from '@/components/ui/app-link';
import { displayFont } from '@/lib/fonts';
import { getPublishedGeneralSponsors } from '@/lib/public/general-sponsors';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Спонсорство',
  description: 'Спонсорские форматы BARSYNERGY для брендов и компаний.',
  path: '/general-sponsors'
});

export const dynamic = 'force-dynamic';

const sponsorBenefits = [
  {
    benefit: 'Аудитория',
    brandVisibility: 'Сайт, события, материалы и прямые переходы к контакту бренда.',
    result: 'Бармены, владельцы, менеджеры и поставщики СКФО видят бренд рядом с профессиональным контекстом.'
  },
  {
    benefit: 'Размещения',
    brandVisibility: 'Страницы событий, анонсы, социальные сети, рассылка и материалы площадки.',
    result: 'Пакет можно собрать под отдельную встречу, сезонную серию или генеральную позицию на период.'
  },
  {
    benefit: 'Материалы и события',
    brandVisibility: 'Интервью, приветственное слово, совместная тема, образовательная встреча или кейс.',
    result: 'Карточка или материал показывает, чем бренд полезен специалистам, заведениям и партнёрам.'
  },
  {
    benefit: 'Следующий шаг',
    brandVisibility: 'Итоговый разбор, следующий формат, контакт с командой и планирование нового периода.',
    result: 'Подходит брендам, которым нужен план на период, а не разовый логотип.'
  }
] as const;

const packageLevels = [
  {
    packageName: 'Партнёр события',
    scope: 'Поддержка отдельной встречи или проекта.',
    periodLabel: 'Разовый запуск',
    placements: [
      'Логотип на странице события',
      'Упоминание в анонсах',
      'Пост в социальных сетях',
      'Материалы на площадке'
    ],
    requiredAssets: 'Логотип, короткое описание, ссылка, материалы для площадки.',
    recommended: false
  },
  {
    packageName: 'Сезонный партнёр',
    scope: 'Участие в серии событий сезона.',
    periodLabel: 'Сезонная серия',
    placements: [
      'Всё из пакета события',
      'Логотип на событиях сезона',
      '2 публикации в соцсетях',
      'Упоминание в email-рассылке'
    ],
    requiredAssets: 'Логотип, описание бренда, сезонная тема, материалы для анонсов.',
    recommended: false
  },
  {
    packageName: 'Генеральный спонсор',
    scope: 'Главная партнёрская позиция на сезон.',
    periodLabel: 'Сезон / по договорённости',
    placements: [
      'Карточка бренда на сайте',
      'Логотип на площадках',
      'Приветственное слово или интервью',
      'Совместные события и материалы'
    ],
    requiredAssets: 'Логотип, бренд-гайд, контакты, тема размещения и материалы.',
    recommended: true
  }
] as const;

const tickerItems = [
  'ПАРТНЁР СОБЫТИЯ',
  'СЕЗОННЫЙ ПАРТНЁР',
  'ГЕНЕРАЛЬНЫЙ СПОНСОР',
  'BARSYNERGY',
  'БАРНАЯ ИНДУСТРИЯ',
  'СКФО'
];

export default async function GeneralSponsorsPage() {
  const generalSponsors = await getPublishedGeneralSponsors();

  return (
    <>
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/general-sponsors', 'Спонсорство')} />

      {/* ── Hero ── */}
      <section className="background-zone background-zone-hero border-b border-[var(--line)] pb-16 pt-8 md:pb-24 md:pt-10">
        <div className="container">
          <PublicBreadcrumbs current="Спонсорство" />
          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.82fr)]">
            <div className="min-w-0">
              <PublicEyebrow className="mb-5">Спонсорство BARSYNERGY</PublicEyebrow>
              <h1 className={`${displayFont.className} text-[clamp(3rem,6.5vw,6.4rem)] font-semibold leading-[0.94] text-[var(--text)]`}>
                Бренд рядом<br />
                с профессией
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-[var(--muted)]">
                Поддержите события, обучение и материалы для барной индустрии СКФО. Формат, период и места размещения обсуждаем отдельно.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button className="rounded-[var(--radius-md)] px-8" href="/contacts?topic=sponsorship#contact-form" size="lg">
                  Запросить условия сотрудничества
                </Button>
                <Button className="rounded-[var(--radius-md)] px-8" href="/contacts?topic=sponsorship-presentation#contact-form" size="lg" variant="secondary">
                  Получить презентацию
                </Button>
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div
                aria-hidden="true"
                className="aspect-[4/3] rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[url('/images/generated/sponsorship-coffee-bar.jpg')] bg-cover bg-center shadow-[0_24px_60px_rgba(20,20,18,0.08)] grayscale-[0.03]"
              />
              <div className="absolute -bottom-5 -left-5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-elevated)] px-5 py-4 shadow-[0_8px_24px_rgba(20,20,18,0.1)]">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Барная индустрия</p>
                <p className={`${displayFont.className} mt-1 text-[1.55rem] font-semibold leading-none text-[var(--text)]`}>СКФО</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee ticker ── */}
      <div className="overflow-hidden border-b border-[var(--line)] bg-[var(--editorial-dark-surface)] py-3.5">
        <style>{`
          @keyframes sponsors-ticker {
            from { transform: translateX(0); }
            to   { transform: translateX(-50%); }
          }
          .sponsors-ticker-track {
            display: flex;
            width: max-content;
            animation: sponsors-ticker 26s linear infinite;
          }
          .sponsors-ticker-track:hover {
            animation-play-state: paused;
          }
        `}</style>
        <div className="sponsors-ticker-track" aria-hidden="true">
          {[0, 1].map((pass) => (
            <div className="flex shrink-0 items-center" key={pass}>
              {tickerItems.map((item) => (
                <span className="flex items-center" key={item}>
                  <span className="px-7 text-[11px] font-bold uppercase tracking-[0.22em] text-[rgb(245_247_251_/_0.65)]">{item}</span>
                  <span className="text-[var(--accent)] opacity-60">/</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Dark pitch section ── */}
      <section className="background-zone background-zone-sponsor border-b border-[var(--line)] py-14 md:py-20">
        <div className="container">
          <div className="grid items-end gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.56fr)]">
            <h2 className={`${displayFont.className} text-[clamp(2.6rem,5.2vw,5.4rem)] font-semibold leading-[0.96] text-[var(--text)]`}>
              Там, где бармены, владельцы и менеджеры СКФО принимают решения
            </h2>
            <div>
              <p className="text-base leading-7 text-[var(--muted)]">
                Ваш бренд рядом с профессиональным контекстом: события, обучение, материалы и прямой контакт с аудиторией.
              </p>
              <AppLink
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]"
                href="/contacts?topic=sponsorship#contact-form"
              >
                Обсудить размещение
                <ArrowUpRight size={16} strokeWidth={1.8} />
              </AppLink>
            </div>
          </div>

          <div className="mt-14 grid grid-cols-2 gap-px border border-[var(--border-default)] bg-[var(--border-default)] md:grid-cols-4">
            {[
              { num: '1', label: 'Аудитория профессионалов' },
              { num: '2', label: 'Размещения на площадках' },
              { num: '3', label: 'Контент и материалы' },
              { num: '4', label: 'Долгосрочное партнёрство' }
            ].map((item) => (
              <div className="bg-[var(--surface)] px-5 py-6 md:px-7 md:py-8" key={item.num}>
                <p className={`${displayFont.className} text-[2.6rem] font-semibold leading-none text-[var(--accent)] md:text-[3.4rem]`}>
                  {item.num}
                </p>
                <p className="mt-3 text-sm leading-5 text-[var(--muted)]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Benefits ── */}
      <section className="background-zone background-zone-beige border-b border-[var(--line)] py-12 md:py-20">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <PublicEyebrow>Спонсорский лист</PublicEyebrow>
              <h2 className={`${displayFont.className} mt-4 text-[clamp(2.4rem,4.2vw,4.2rem)] font-semibold leading-[0.96] text-[var(--text)]`}>
                Что получает<br />бренд
              </h2>
            </div>
            <div className="divide-y divide-[var(--line)]">
              {sponsorBenefits.map((item, index) => (
                <div
                  className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-0 py-8 md:py-10"
                  key={index}
                >
                  <span className={`${displayFont.className} select-none text-[2.6rem] font-semibold leading-none text-[var(--line)] md:text-[3.2rem]`}>
                    {index + 1}.
                  </span>
                  <div>
                    <h3 className={`${displayFont.className} text-[1.6rem] font-semibold leading-none text-[var(--text)] md:text-[1.9rem]`}>
                      {item.benefit}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.brandVisibility}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--text)]">{item.result}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Packages ── */}
      <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-12 md:py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <PublicEyebrow className="justify-center">Пакеты спонсорства</PublicEyebrow>
            <h2 className={`${displayFont.className} mt-4 text-[clamp(2.4rem,4.2vw,4.2rem)] font-semibold leading-[0.96] text-[var(--text)]`}>
              Выберите формат
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {packageLevels.map((pkg, index) => (
              <article
                className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface-card)] p-6 md:p-7"
                key={index}
              >
                <div>
                  <h3 className={`${displayFont.className} text-[2rem] font-semibold leading-none text-[var(--text)] md:text-[2.2rem]`}>
                    {pkg.packageName}
                  </h3>
                  <p className="mt-2.5 text-sm leading-6 text-[var(--muted)]">{pkg.scope}</p>
                </div>

                <div className="my-5 border-t border-[var(--line)]" />

                <div className="mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--muted)]">Период</p>
                  <p className={`${displayFont.className} mt-1.5 text-[1.6rem] font-semibold leading-[1.1] text-[var(--text)]`}>
                    {pkg.periodLabel}
                  </p>
                </div>

                <div className="my-5 border-t border-[var(--line)]" />

                <div className="flex-1">
                  <ul className="grid gap-3">
                    {pkg.placements.map((item) => (
                      <li className="flex items-start gap-2.5 text-sm leading-[1.5] text-[var(--text)]" key={item}>
                        <Check
                          className="mt-0.5 shrink-0 text-[var(--text)]"
                          size={14}
                          strokeWidth={2.5}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-7">
                  <Button
                    className="w-full rounded-[var(--radius-md)] !border-[var(--text)] !bg-[var(--text)] !text-[var(--background)] hover:opacity-80"
                    href={`/contacts?topic=sponsorship&partnerType=${encodeURIComponent(pkg.packageName)}#contact-form`}
                  >
                    Запросить условия
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── General sponsors ── */}
      <section className="background-zone background-zone-sponsor border-b border-[var(--line)] py-12 md:py-20">
        <div className="container">
          <PublicEyebrow>Генеральный спонсор сезона</PublicEyebrow>
          <div className="mt-6 grid gap-5">
            {generalSponsors.length > 0 ? (
              generalSponsors.map((sponsor, index) => (
                <GeneralSponsorCard key={sponsor.id} priority={index === 0} sponsor={sponsor} />
              ))
            ) : (
              <Panel className="border-[var(--border-default)] bg-[var(--surface-wash)]" padding="lg">
                <h2 className={`${displayFont.className} text-[2rem] font-semibold leading-none text-[var(--text)]`}>
                  Генеральные спонсоры появятся ближе к мероприятию. Хотите стать первым?
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--muted)]">
                  Когда спонсор будет опубликован, карточка появится здесь и на главной странице.
                </p>
                <div className="mt-6">
                  <Button className="rounded-[var(--radius-md)] px-7" href="/contacts?topic=sponsorship#contact-form">
                    Обсудить спонсорство
                  </Button>
                </div>
              </Panel>
            )}
          </div>
        </div>
      </section>

      {/* ── Dark CTA ── */}
      <section className="background-zone background-zone-cta border-b border-[var(--line)] py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <PublicEyebrow className="!text-[rgb(165_168_181_/_0.82)]" tone="muted">Следующий шаг</PublicEyebrow>
            <h2 className={`${displayFont.className} mt-5 text-[clamp(2.8rem,5.5vw,5.6rem)] font-semibold leading-[0.96] text-[var(--text)]`}>
              Стать спонсором BARSYNERGY
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[var(--muted)]">
              Расскажите о задаче бренда, периоде и готовых материалах. Обсудим формат, который работает на ваши цели.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button className="rounded-[var(--radius-md)] px-10" href="/contacts?topic=sponsorship#contact-form" size="lg">
                Обсудить спонсорство
              </Button>
              <Button
                className="rounded-[var(--radius-md)] border-[var(--border-default)] px-10 text-[var(--text)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent-soft)]"
                href="/contacts?topic=sponsorship-presentation#contact-form"
                size="lg"
                variant="secondary"
              >
                Получить презентацию
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
