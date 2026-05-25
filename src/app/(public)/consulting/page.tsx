import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { FeatureCard } from '@/components/public/public-card-patterns';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { firstParam } from '@/lib/applications/public-form-helpers';
import {
  consultingDirectionOptions,
  consultingExpertOptions
} from '@/lib/applications/b2b-request-options';
import type { PublicContentSearchParams } from '@/lib/public/content';

type ConsultingPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = {
  title: 'Консалтинг',
  description: 'Консультации BARSYNERGY для запуска, меню, команды, себестоимости, поставщиков и операционной работы заведений.'
};

const directionDescriptions: Record<(typeof consultingDirectionOptions)[number]['value'], string> = {
  venue_opening: 'Подготовка к запуску: формат, меню, команда, поставщики и первые процессы.',
  bar_menu: 'Структура барной карты, позиции, себестоимость, подача и работа с сезонностью.',
  team_training: 'План обучения, базовые стандарты, роли, чек-листы и контроль качества.',
  cost_pricing: 'Расчёт себестоимости, целевая доля затрат, маржа и цена продажи.',
  suppliers_procurement: 'Список категорий закупок, требования к поставщикам и порядок контроля.',
  operational_audit: 'Разбор смен, запасов, скорости сервиса, ошибок и точек контроля.'
};

const expertFocus: Record<(typeof consultingExpertOptions)[number]['value'], string> = {
  opening_advisor: 'Разберём запуск, оборудование, меню, команду, поставщиков и первые операционные процессы.',
  bar_menu_advisor: 'Поможем собрать карту напитков под концепцию, маржинальность и возможности команды.',
  training_advisor: 'Соберём план обучения, стандарты сервиса, роли и проверку навыков.',
  economics_advisor: 'Проверим расчёты, маржинальность, потери и структуру цены.'
};

const expertDisplayTitles: Record<(typeof consultingExpertOptions)[number]['value'], string> = {
  opening_advisor: 'Открытие заведения',
  bar_menu_advisor: 'Барная карта',
  training_advisor: 'Обучение команды',
  economics_advisor: 'Себестоимость'
};

function getConsultingContactHref(defaults: { consultingDirection?: string; preferredExpert?: string } = {}) {
  const params = new URLSearchParams({ topic: 'consulting' });
  const directionLabel = defaults.consultingDirection
    ? consultingDirectionOptions.find((option) => option.value === defaults.consultingDirection)?.label
    : undefined;
  const expertLabel = defaults.preferredExpert
    ? consultingExpertOptions.find((option) => option.value === defaults.preferredExpert)?.label
    : undefined;
  const topicTitle = directionLabel ?? expertLabel;

  if (topicTitle) {
    params.set('topicTitle', topicTitle);
  }

  return `/contacts?${params.toString()}#contact-form`;
}

export default async function ConsultingPage({ searchParams }: ConsultingPageProps) {
  const params = (await searchParams) ?? {};
  const consultingDirection = firstParam(params.consultingDirection);
  const preferredExpert = firstParam(params.preferredExpert);
  const consultingContactHref = getConsultingContactHref({ consultingDirection, preferredExpert });

  return (
    <>
      <EditorialPublicPage
        eyebrow="Консалтинг"
        title="Экспертная помощь для баров, кафе и ресторанов"
        description="Разбираем запуск, меню, команду, себестоимость, поставщиков и операционные процессы."
        summary="Опишите задачу, стадию проекта и тему консультации. Мы уточним детали и предложим удобный формат."
        summaryHeading="Практика"
        metrics={[]}
        rows={[]}
        primaryLink={{ label: 'Оставить заявку', href: consultingContactHref }}
        secondaryLink={{ label: 'Рассчитать себестоимость', href: '/tools/cost-calculator' }}
      />

      <section className="background-zone background-zone-gray border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <div className="mb-6 max-w-3xl">
            <PublicEyebrow>Направления</PublicEyebrow>
            <PublicDisplayTitle className="mt-4 max-w-4xl">С какими задачами можно прийти</PublicDisplayTitle>
            <PublicBodyText className="mt-5 max-w-2xl" size="md">
              Выберите тему, чтобы заявка сразу попала к человеку, который с ней разберётся.
            </PublicBodyText>
          </div>
          <div className="border-t border-[var(--line)]">
            {consultingDirectionOptions.map((option) => (
              <FeatureCard
                description={directionDescriptions[option.value]}
                eyebrow="Консалтинг"
                key={option.value}
                presentation="row"
                title={option.label}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="background-zone background-zone-beige editorial-grid border-b border-[var(--line)] py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[minmax(16rem,0.58fr)_minmax(0,1.42fr)]">
          <div className="xl:sticky xl:top-24 xl:self-start">
            <PublicEyebrow>Эксперты</PublicEyebrow>
            <PublicDisplayTitle className="mt-4 max-w-sm">Подбор эксперта</PublicDisplayTitle>
            <PublicBodyText className="mt-5 max-w-md" size="md">
              Напишите, что происходит сейчас и где нужна помощь. Мы уточним детали и подберём специалиста под задачу.
            </PublicBodyText>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button className="rounded-[var(--radius-md)]" href={consultingContactHref} size="lg">
                Оставить заявку
                <ArrowUpRight size={16} />
              </Button>
            </div>
          </div>

          <div className="consulting-expert-list border-y border-[var(--line)]">
            {consultingExpertOptions.map((expert) => (
              <article
                className="grid gap-4 border-b border-[var(--line)] py-5 last:border-b-0 md:grid-cols-[minmax(11rem,0.58fr)_minmax(0,1fr)] md:items-center md:gap-5"
                key={expert.value}
              >
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold leading-6 text-[var(--text)] md:text-xl">
                    {expertDisplayTitles[expert.value]}
                  </h3>
                </div>

                <p className="max-w-2xl text-sm leading-6 text-[var(--muted)]">
                  {expertFocus[expert.value]}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
