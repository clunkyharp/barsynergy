import type { Metadata } from 'next';

import { GeneralSponsorCard } from '@/components/public/general-sponsor-card';
import { PageHero } from '@/components/public/page-hero';
import { PlacementExample } from '@/components/public/placement-example';
import { SponsorPackageCard } from '@/components/public/sponsor-package-card';
import { SponsorPlacementMock } from '@/components/public/sponsor-placement-mock';
import { PublicEyebrow } from '@/components/public/public-primitives';
import { JsonLd } from '@/components/seo/json-ld';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { AppLink } from '@/components/ui/app-link';
import { displayFont } from '@/lib/fonts';
import { getPublishedGeneralSponsors } from '@/lib/public/general-sponsors';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';
import {
  sponsorBenefits,
  packageLevels,
  tickerItems
} from '@/lib/public/general-sponsors-page-data';

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Спонсорство',
  description: 'Спонсорские форматы BARSYNERGY для брендов и компаний.',
  path: '/general-sponsors'
});

export const dynamic = 'force-dynamic';

function SponsorsMediaSlot() {
  return (
    <div className="relative hidden w-80 lg:block">
      <div
        aria-hidden="true"
        className="aspect-[4/3] rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[url('/images/generated/sponsorship-coffee-bar.jpg')] bg-cover bg-center shadow-[0_24px_60px_rgba(20,20,18,0.08)] grayscale-[0.03]"
      />
      <div className="absolute -bottom-5 -left-5 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--surface-elevated)] px-5 py-4 shadow-[0_8px_24px_rgba(20,20,18,0.1)]">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Барная индустрия</p>
        <p className={`${displayFont.className} mt-1 text-[1.55rem] font-semibold leading-none text-[var(--text)]`}>СКФО</p>
      </div>
    </div>
  );
}

function TickerMarquee() {
  return (
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
  );
}

export default async function GeneralSponsorsPage() {
  const generalSponsors = await getPublishedGeneralSponsors();

  return (
    <>
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/general-sponsors', 'Спонсорство')} />

      <PageHero
        breadcrumbs={[{ label: 'Спонсорство' }]}
        eyebrow="Спонсорство BARSYNERGY"
        title="Бренд рядом с профессией"
        subtitle="Присутствие бренда внутри профессиональной среды: на страницах событий, в материалах, Telegram-анонсах, карточках партнёров и сезонных проектах. Формат и период обсуждаем отдельно."
        tone="graphite"
        actions={[
          { label: 'Запросить условия сотрудничества', href: '/contacts?topic=sponsorship#contact-form', kind: 'primary' },
          { label: 'Получить презентацию', href: '/contacts?topic=sponsorship-presentation#contact-form', kind: 'secondary' }
        ]}
        media={{ kind: 'slot', children: <SponsorsMediaSlot /> }}
      />

      <TickerMarquee />

      <section className="background-zone background-zone-sponsor border-b border-[var(--line)] py-14 md:py-20">
        <div className="container">
          <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.56fr)]">
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

      <section className="background-zone background-zone-beige border-b border-[var(--line)] py-12 md:py-20">
        <div className="container">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-16">
            <div className="lg:self-center">
              <PublicEyebrow>Спонсорский лист</PublicEyebrow>
              <h2 className={`${displayFont.className} mt-4 text-[clamp(2.4rem,4.2vw,4.2rem)] font-semibold leading-[0.96] text-[var(--text)]`}>
                Что получает<br />бренд
              </h2>
            </div>
            <div className="divide-y divide-[var(--line)]">
              {sponsorBenefits.map((item, index) => (
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-0 py-8 md:py-10" key={index}>
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

      <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-12 md:py-20">
        <div className="container">
          <div className="mb-12 text-center">
            <PublicEyebrow className="justify-center">Пакеты спонсорства</PublicEyebrow>
            <h2 className={`${displayFont.className} mt-4 text-[clamp(2.4rem,4.2vw,4.2rem)] font-semibold leading-[0.96] text-[var(--text)]`}>
              Выберите формат
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[var(--muted)]">
              Три уровня присутствия бренда — от поддержки отдельного события до главной партнёрской позиции на сезон. Формат и период обсуждаем индивидуально.
            </p>
          </div>

          <div className="grid items-stretch gap-4 md:grid-cols-3">
            {packageLevels.map((pkg, index) => (
              <SponsorPackageCard key={index} pkg={pkg} index={index} />
            ))}
          </div>
        </div>
      </section>
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
      <PlacementExample
        eyebrow="Пример размещения"
        title="Как бренд выглядит на платформе"
        description="Спонсор получает не строчку в списке, а карточку, которую видят профессионалы индустрии — с логотипом, направлениями и прямым контактом."
        visual={<SponsorPlacementMock />}
        annotations={[
          { title: 'Логотип бренда', description: 'Виден на карточке спонсора и в общей ленте брендов платформы.' },
          { title: 'Категории и продукты', description: 'Чипы с направлениями: кофе, оборудование, упаковка, сервис.' },
          { title: 'Прямой контакт', description: 'Кнопки связи — Telegram, сайт, телефон — без посредников.' },
          { title: 'Где показывается', description: 'Главная, каталог, материалы и Telegram-канал индустрии СКФО.' }
        ]}
      />
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
