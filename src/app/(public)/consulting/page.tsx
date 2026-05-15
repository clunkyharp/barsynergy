import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { ConsultingRequestForm } from '@/components/public/consulting-request-form';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { FeatureCard, RoleTaskCard } from '@/components/public/public-card-patterns';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { RequestDisclosureTrigger } from '@/components/public/request-disclosure';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import {
  firstParam,
  getPublicApplicationResult,
  getPublicApplicationUtm
} from '@/lib/applications/public-form-helpers';
import {
  consultingDirectionOptions,
  consultingExpertOptions
} from '@/lib/applications/b2b-request-options';
import type { PublicContentSearchParams } from '@/lib/public/content';
import { getEnv } from '@/lib/validation/env';

type ConsultingPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = {
  title: 'Консалтинг',
  description: 'Консультации BARSYNERGY для запуска, меню, команды, себестоимости, поставщиков и операционной работы заведений.'
};

const consultingRows = [
  {
    label: 'Запуск',
    title: 'Нужно понять, что делать до открытия',
    description: 'Помогаем разобрать формат, меню, команду, закупки и первые операционные решения.'
  },
  {
    label: 'Экономика',
    title: 'Цены и себестоимость не сходятся',
    description: 'Проверяем состав, порции, целевую долю себестоимости, маржу и понятность цены.'
  },
  {
    label: 'Операции',
    title: 'Процессы держатся на ручном контроле',
    description: 'Смотрим смены, закупки, обучение, чек-листы и зоны, где команда теряет время.'
  }
];

const directionDescriptions: Record<(typeof consultingDirectionOptions)[number]['value'], string> = {
  venue_opening: 'Подготовка к запуску: формат, меню, команда, поставщики и первые процессы.',
  bar_menu: 'Структура барной карты, позиции, себестоимость, подача и работа с сезонностью.',
  team_training: 'План обучения, базовые стандарты, роли, чек-листы и контроль качества.',
  cost_pricing: 'Расчёт себестоимости, целевая доля затрат, маржа и цена продажи.',
  suppliers_procurement: 'Список категорий закупок, требования к поставщикам и порядок контроля.',
  operational_audit: 'Разбор текущей работы: смены, запасы, скорость сервиса, ошибки и точки контроля.'
};

const expertFocus: Record<(typeof consultingExpertOptions)[number]['value'], string> = {
  opening_advisor: 'Запуск заведения, структура подготовки, первые процессы и операционная карта.',
  bar_menu_advisor: 'Барная карта, позиции, вкусовая логика, себестоимость и сезонные обновления.',
  training_advisor: 'Обучение команды, стандарты сервиса, роли и проверка навыков.',
  economics_advisor: 'Себестоимость, цены, маржа, закупки и контроль потерь.'
};

export default async function ConsultingPage({ searchParams }: ConsultingPageProps) {
  const params = (await searchParams) ?? {};
  const [cities] = await Promise.all([getApplicationCityOptions()]);
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());
  const consultingDirection = firstParam(params.consultingDirection);
  const preferredExpert = firstParam(params.preferredExpert);

  return (
    <>
      <EditorialPublicPage
        eyebrow="Консалтинг"
        title="Экспертная помощь для баров, кафе и ресторанов"
        description="Разбираем запуск, меню, команду, себестоимость, поставщиков и операционные процессы."
        summary="Оставьте задачу, стадию проекта и направление. Команда подберёт подходящий формат консультации без онлайн-оплаты и календаря на сайте."
        summaryHeading="Практика"
        metrics={[
          { value: '6', label: 'направлений' },
          { value: 'Пилот', label: 'заявка без кабинета' },
          { value: 'Эксперт', label: 'под задачу' }
        ]}
        rows={consultingRows}
        rowsHeading="Когда помогает"
        primaryLink={{ label: 'Оставить заявку', href: '#consulting-request' }}
        secondaryLink={{ label: 'Открыть калькулятор', href: '/tools/cost-calculator' }}
      />

      <section className="background-zone background-zone-gray border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <div className="mb-6 max-w-3xl">
            <PublicEyebrow>Направления</PublicEyebrow>
            <PublicDisplayTitle className="mt-4 max-w-4xl">С какими задачами можно прийти</PublicDisplayTitle>
            <PublicBodyText className="mt-5 max-w-2xl" size="md">
              Направление помогает быстрее передать заявку нужному специалисту. Детали можно уточнить после первого сообщения.
            </PublicBodyText>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {consultingDirectionOptions.map((option, index) => (
              <FeatureCard
                action={{ href: `/consulting?consultingDirection=${encodeURIComponent(option.value)}#consulting-request`, label: 'Выбрать' }}
                code={String(index + 1).padStart(2, '0')}
                description={directionDescriptions[option.value]}
                eyebrow="Консалтинг"
                key={option.value}
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
            <PublicDisplayTitle className="mt-4 max-w-[13ch]">Роли без персональных профилей</PublicDisplayTitle>
            <PublicBodyText className="mt-5 max-w-md" size="md">
              Для пилотного запуска используем роль эксперта, а не публичные личные карточки. Это не создаёт расписание, рейтинг или отдельный кабинет.
            </PublicBodyText>
            <div className="mt-8 flex flex-wrap gap-3">
              <RequestDisclosureTrigger className="min-h-12 rounded-[var(--radius-md)] px-5 tracking-normal" targetId="consulting-request">
                Оставить заявку
                <ArrowUpRight size={16} />
              </RequestDisclosureTrigger>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {consultingExpertOptions.map((expert, index) => (
              <RoleTaskCard
                action={{ href: `/consulting?preferredExpert=${encodeURIComponent(expert.value)}#consulting-request`, label: 'Выбрать роль' }}
                code={String(index + 1).padStart(2, '0')}
                density="compact"
                description={expertFocus[expert.value]}
                eyebrow="Эксперт"
                key={expert.value}
                meta="Статическая карточка"
                metaLabel="Пилот"
                title={expert.label}
              />
            ))}
          </div>
        </div>
      </section>

      <ConsultingRequestForm
        cities={cities}
        defaults={{ consultingDirection, preferredExpert }}
        enabled={applicationFormsEnabled}
        result={getPublicApplicationResult(params)}
        utm={getPublicApplicationUtm(params)}
      />
    </>
  );
}
