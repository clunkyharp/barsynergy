import type { Metadata } from 'next';
import { SponsorBenefitSheet, SponsorPackageComparison } from '@/components/public/editorial-display-primitives';
import { GeneralSponsorCard } from '@/components/public/general-sponsor-card';
import { PublicBodyText, PublicBreadcrumbs, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { SectionCtaPanel } from '@/components/public/public-ui-adaptation';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/ui/panel';
import { displayFont } from '@/lib/fonts';
import { getPublishedGeneralSponsors } from '@/lib/public/general-sponsors';

export const metadata: Metadata = {
  title: 'Спонсорство',
  description: 'Спонсорские форматы BARSYNERGY для брендов и компаний.'
};

export const dynamic = 'force-dynamic';

const sponsorBenefits = [
  {
    area: 'Аудитория',
    summary: 'Бармены, владельцы, менеджеры и поставщики СКФО видят бренд рядом с событиями, обучением и материалами.',
    detail: 'Сначала фиксируются места размещения: сайт, события, материалы и контакты.',
    touchpoint: 'События, материалы сайта и прямые переходы к контакту.'
  },
  {
    area: 'Размещения',
    summary: 'Упоминания появляются на страницах событий, в материалах сайта, рассылках и анонсах.',
    detail: 'Пакет можно собрать под отдельную встречу, сезонную серию или генеральную позицию на период.',
    touchpoint: 'Страница события, анонсы, соцсети, рассылка.'
  },
  {
    area: 'Материалы и события',
    summary: 'Бренд можно связать с продуктом, экспертом, кейсом, обучением или встречей.',
    detail: 'Карточка или материал показывает, чем бренд полезен специалистам, заведениям и партнёрам.',
    touchpoint: 'Интервью, приветственное слово, материал или совместная тема.'
  },
  {
    area: 'Следующий шаг',
    summary: 'После размещения можно выбрать следующий материал, событие или контакт с аудиторией.',
    detail: 'Подходит брендам, которым нужен план на период, а не разовый логотип.',
    touchpoint: 'Итоговый разбор, следующий формат, контакт с командой.'
  }
] as const;

const packageLevels = [
  {
    packageName: 'Партнёр события',
    scope: 'Поддержка отдельной встречи или проекта.',
    visibility: 'Размещение на странице события, в анонсах и материалах площадки.',
    periodStatus: 'Разовый запуск.',
    includedPlacements: 'Логотип на странице события, упоминание в анонсах, пост в социальных сетях, материалы на площадке.',
    requiredAssets: 'Логотип, короткое описание, ссылка, материалы для площадки.',
    recommended: false
  },
  {
    packageName: 'Сезонный партнёр',
    scope: 'Участие в серии событий сезона.',
    visibility: 'Размещение в нескольких событиях и анонсах сезона.',
    periodStatus: 'Сезонная серия.',
    includedPlacements: 'Всё из пакета события, логотип на событиях сезона, 2 публикации в социальных сетях, упоминание в email-рассылке.',
    requiredAssets: 'Логотип, описание бренда, сезонная тема, материалы для анонсов.',
    recommended: false
  },
  {
    packageName: 'Генеральный спонсор',
    scope: 'Главная партнёрская позиция на сезон.',
    visibility: 'Карточка бренда в разделе спонсоров и выбранных публичных разделах сайта.',
    periodStatus: 'Сезон / категория согласуется отдельно.',
    includedPlacements: 'Категория и период согласуются отдельно, логотип на площадках, приветственное слово или интервью, совместные события и материалы.',
    requiredAssets: 'Логотип, бренд-гайд, контакты, тема размещения и материалы для редакции или площадки.',
    recommended: true
  }
] as const;

export default async function GeneralSponsorsPage() {
  const generalSponsors = await getPublishedGeneralSponsors();

  return (
    <>
      <section className="background-zone background-zone-hero border-b border-[var(--line)] py-7 md:py-10">
        <div className="container grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(20rem,0.72fr)] lg:items-center">
          <div className="min-w-0">
            <PublicBreadcrumbs current="Спонсорство" />
            <PublicEyebrow className="mt-6">Спонсорство</PublicEyebrow>
            <PublicDisplayTitle as="h1" className="mt-4 max-w-5xl text-[32px] sm:text-[42px] md:text-[50px] xl:text-[56px]" size="section">
              Спонсорство BARSYNERGY
            </PublicDisplayTitle>
            <PublicBodyText className="mt-4 max-w-2xl" size="md">
              Бренд может поддержать события, обучение и материалы для барной индустрии СКФО. Формат, период и места размещения обсуждаем отдельно.
            </PublicBodyText>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button className="rounded-[var(--radius-md)] px-7" href="/contacts?topic=sponsorship#contact-form" size="lg">
                Запросить условия сотрудничества
              </Button>
              <Button className="rounded-[var(--radius-md)] px-7" href="/contacts?topic=sponsorship-presentation#contact-form" size="lg" variant="secondary">
                Получить презентацию
              </Button>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="min-h-[300px] rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[url('/images/generated/sponsorship-coffee-bar.jpg')] bg-cover bg-center grayscale-[0.03] shadow-[0_24px_60px_rgba(20,20,18,0.08)]"
          />
        </div>
      </section>

      <section className="background-zone background-zone-beige border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <SponsorBenefitSheet
            className="border-0 py-0"
            eyebrow="Спонсорский лист"
            items={sponsorBenefits}
            title="Что получает бренд"
          />
        </div>
      </section>

      <section className="background-zone background-zone-ivory border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <SponsorPackageComparison
            className="border-0 py-0"
            description="Выберите уровень участия по задаче бренда: отдельное событие, сезонная серия или генеральная позиция."
            eyebrow="Пакеты спонсорства"
            items={packageLevels.map((level) => ({
              packageName: level.packageName,
              scope: level.scope,
              visibility: level.visibility,
              periodStatus: level.periodStatus,
              includedPlacements: level.includedPlacements,
              requiredAssets: level.requiredAssets,
              recommended: level.recommended,
              priceStatus: 'по запросу',
              action: {
                href: `/contacts?topic=sponsorship&partnerType=${encodeURIComponent(level.packageName)}#contact-form`,
                label: 'Запросить условия сотрудничества'
              }
            }))}
            title="Пакеты спонсорства"
          />
        </div>
      </section>

      <section className="background-zone background-zone-sponsor border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <PublicEyebrow>Генеральный спонсор сезона</PublicEyebrow>
          <div className="mt-6 grid gap-5">
            {generalSponsors.length > 0 ? (
              generalSponsors.map((sponsor, index) => <GeneralSponsorCard key={sponsor.id} priority={index === 0} sponsor={sponsor} />)
            ) : (
              <Panel className="border-[var(--border-default)] bg-[var(--surface-wash)]" padding="lg">
                <h2 className={`${displayFont.className} text-[2rem] font-semibold leading-none text-[var(--text)]`}>
                  Опубликованного генерального спонсора пока нет
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

      <section className="background-zone background-zone-cta border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <SectionCtaPanel
            brandGlyph="partnership-route"
            brandIconVariant="dark"
            description="Расскажите, какая задача стоит перед брендом, на какой период планируете размещение и какие материалы уже готовы."
            primary={{ href: '/contacts?topic=sponsorship#contact-form', label: 'Оставить заявку' }}
            title="Стать спонсором"
          />
        </div>
      </section>
    </>
  );
}
