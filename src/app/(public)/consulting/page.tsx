import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowUpRight,
  Calculator,
  ClipboardCheck,
  GraduationCap,
  PackageCheck,
  Utensils,
  Wine,
  type LucideIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConsultingTabs } from '@/components/public/consulting-tabs';
import { ConsultingRequestForm } from '@/components/public/consulting-request-form';
import { submitConsultingRequest } from '@/app/(public)/consulting/actions';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import { firstParam, getPublicApplicationResult, getPublicApplicationUtm } from '@/lib/applications/public-form-helpers';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import {
  consultingDirectionOptions,
  consultingExpertOptions
} from '@/lib/applications/b2b-request-options';
import { displayFont } from '@/lib/fonts';
import type { PublicContentSearchParams } from '@/lib/public/content';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { getEnv } from '@/lib/validation/env';

type ConsultingPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Консалтинг',
  description: 'Консультации BARSYNERGY для запуска, меню, команды, себестоимости, поставщиков и операционной работы заведений.',
  path: '/consulting'
});

const directionDescriptions: Record<(typeof consultingDirectionOptions)[number]['value'], string> = {
  venue_opening: 'Подготовка к запуску: формат, меню, команда, поставщики и первые процессы.',
  bar_menu: 'Структура барной карты, позиции, себестоимость, подача и работа с сезонностью.',
  team_training: 'План обучения, базовые стандарты, роли, чек-листы и контроль качества.',
  cost_pricing: 'Расчёт себестоимости, целевая доля затрат, маржа и цена продажи.',
  suppliers_procurement: 'Список категорий закупок, требования к поставщикам и порядок контроля.',
  operational_audit: 'Разбор смен, запасов, скорости сервиса, ошибок и точек контроля.'
};

const directionActionLabels: Record<(typeof consultingDirectionOptions)[number]['value'], string> = {
  venue_opening: 'Обсудить открытие',
  bar_menu: 'Разобрать меню',
  team_training: 'Описать задачу команды',
  cost_pricing: 'Проверить расчёт',
  suppliers_procurement: 'Навести порядок в закупках',
  operational_audit: 'Заказать аудит'
};

const directionMeta: Record<
  (typeof consultingDirectionOptions)[number]['value'],
  {
    kind: string;
    result: string;
  }
> = {
  venue_opening: {
    kind: 'Запуск',
    result: 'Для команды, которая готовит открытие или меняет формат заведения.'
  },
  bar_menu: {
    kind: 'Меню',
    result: 'Для заведений, которым нужна рабочая карта напитков и понятная маржинальность.'
  },
  team_training: {
    kind: 'Команда',
    result: 'Для менеджеров, которые хотят выровнять сервис и навыки смены.'
  },
  cost_pricing: {
    kind: 'Экономика',
    result: 'Для собственников и управляющих, которым нужно проверить цену и прибыль.'
  },
  suppliers_procurement: {
    kind: 'Закупки',
    result: 'Для проектов, которым нужен порядок в поставщиках, остатках и требованиях.'
  },
  operational_audit: {
    kind: 'Аудит',
    result: 'Для работающих заведений, где нужно найти узкие места в сменах и процессах.'
  }
};

const consultingDirectionCards: {
  code: string;
  description: string;
  icon: LucideIcon;
  imagePath: string;
  result: string;
  tags: string[];
  title: string;
  tone: 'consulting-launch' | 'consulting-menu' | 'consulting-team' | 'consulting-cost' | 'consulting-procurement' | 'consulting-audit';
  value: (typeof consultingDirectionOptions)[number]['value'];
}[] = [
  {
    value: 'venue_opening',
    code: '01',
    title: 'Открытие заведения',
    description: directionDescriptions.venue_opening,
    result: directionMeta.venue_opening.result,
    tags: ['Запуск', 'Процессы'],
    imagePath: '/images/home/hero-bar-counter-bundo.jpg',
    tone: 'consulting-launch',
    icon: Utensils
  },
  {
    value: 'bar_menu',
    code: '02',
    title: 'Барная карта',
    description: directionDescriptions.bar_menu,
    result: directionMeta.bar_menu.result,
    tags: ['Меню', 'Подача'],
    imagePath: '/images/generated/program-intensive.jpg',
    tone: 'consulting-menu',
    icon: Wine
  },
  {
    value: 'team_training',
    code: '03',
    title: 'Обучение команды',
    description: directionDescriptions.team_training,
    result: directionMeta.team_training.result,
    tags: ['Сервис', 'Навыки'],
    imagePath: '/images/home/professional-education.webp',
    tone: 'consulting-team',
    icon: GraduationCap
  },
  {
    value: 'cost_pricing',
    code: '04',
    title: 'Себестоимость и цены',
    description: directionDescriptions.cost_pricing,
    result: directionMeta.cost_pricing.result,
    tags: ['Экономика', 'Маржа'],
    imagePath: '/images/generated/content-guide.jpg',
    tone: 'consulting-cost',
    icon: Calculator
  },
  {
    value: 'suppliers_procurement',
    code: '05',
    title: 'Поставщики и закупки',
    description: directionDescriptions.suppliers_procurement,
    result: directionMeta.suppliers_procurement.result,
    tags: ['Закупки', 'Контроль'],
    imagePath: '/images/generated/sponsorship-coffee-bar.jpg',
    tone: 'consulting-procurement',
    icon: PackageCheck
  },
  {
    value: 'operational_audit',
    code: '06',
    title: 'Операционный аудит',
    description: directionDescriptions.operational_audit,
    result: directionMeta.operational_audit.result,
    tags: ['Смены', 'Аудит'],
    imagePath: '/images/home/audience-venues-coffee-bar.jpg',
    tone: 'consulting-audit',
    icon: ClipboardCheck
  }
];

const expertFocus: Record<(typeof consultingExpertOptions)[number]['value'], string> = {
  opening_advisor: 'Разберём запуск, оборудование, меню, команду, поставщиков и первые операционные процессы.',
  bar_menu_advisor: 'Поможем собрать карту напитков под концепцию, маржинальность и возможности команды.',
  training_advisor: 'Соберём план обучения, стандарты сервиса, роли и проверку навыков.',
  economics_advisor: 'Проверим расчёты, маржинальность, потери и структуру цены.'
};

const expertMeta: Record<
  (typeof consultingExpertOptions)[number]['value'],
  {
    kind: string;
    result: string;
  }
> = {
  opening_advisor: {
    kind: 'Запуск',
    result: 'Формат, оборудование, поставщики и первые процессы.'
  },
  bar_menu_advisor: {
    kind: 'Меню',
    result: 'Карта напитков, сезонность, себестоимость и подача.'
  },
  training_advisor: {
    kind: 'Команда',
    result: 'План обучения, стандарты, роли и проверка навыков.'
  },
  economics_advisor: {
    kind: 'Экономика',
    result: 'Маржинальность, потери и структура цены.'
  }
};

const expertDisplayTitles: Record<(typeof consultingExpertOptions)[number]['value'], string> = {
  opening_advisor: 'Открытие заведения',
  bar_menu_advisor: 'Барная карта',
  training_advisor: 'Обучение команды',
  economics_advisor: 'Себестоимость'
};

const consultingCases = [
  {
    image: '/images/home/hero-bar-counter-bundo.jpg',
    title: 'Запуск кофейного бара',
    task: 'Разложить формат, оборудование, стартовое меню и список закупок до открытия.',
    result: 'Команда получает короткий запусковой план, чек-лист поставщиков и порядок первых смен.'
  },
  {
    image: '/images/generated/program-intensive.jpg',
    title: 'Пересборка барной карты',
    task: 'Убрать слабые позиции, проверить себестоимость и собрать понятную сезонную структуру.',
    result: 'В карте остаются позиции с ясной ролью, ценой и технологией приготовления.'
  },
  {
    image: '/images/home/professional-education.webp',
    title: 'Обучение смены',
    task: 'Выровнять базовые навыки команды, стандарты сервиса и контроль качества напитков.',
    result: 'Появляется план обучения, роли наставников и проверочные листы для управляющего.'
  },
  {
    image: '/images/home/audience-venues-coffee-bar.jpg',
    title: 'Операционный аудит',
    task: 'Найти потери времени, ошибки в запасах и слабые места в ежедневных процессах.',
    result: 'Собирается список быстрых правок и отдельный план для системных изменений.'
  }
] as const;

const consultingPriceItems = [
  {
    title: 'Экспресс-разбор',
    price: 'от 15 000 ₽',
    description: 'Одна задача, короткая подготовка и итоговые рекомендации после консультации.'
  },
  {
    title: 'Проектный разбор',
    price: 'от 45 000 ₽',
    description: 'Несколько встреч, разбор материалов, расчётов, меню, команды или запуска.'
  },
  {
    title: 'Операционный аудит',
    price: 'от 75 000 ₽',
    description: 'Проверка процессов заведения, фиксация проблем и план внедрения изменений.'
  }
] as const;

const defaultParamKeys = [
  'contactName',
  'cityId',
  'businessType',
  'projectStage',
  'consultingDirection',
  'preferredExpert',
  'taskDescription'
] as const;

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

function ConsultingDirectionCards() {
  return (
    <div className="home-services-grid consulting-services-grid mt-8">
      {consultingDirectionCards.map((direction) => {
        const Icon = direction.icon;

        return (
          <article className={`home-service-card home-service-card--${direction.tone}`} key={direction.value}>
            <div className="home-service-card-top">
              <span className="home-service-tags">
                {direction.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </span>
              <span className="home-service-code">{direction.code}</span>
            </div>
            <div className="home-service-card-body">
              <span className="home-service-icon" aria-hidden="true">
                <Icon size={18} strokeWidth={1.8} />
              </span>
              <span className="home-service-eyebrow">{directionMeta[direction.value].kind}</span>
              <h3 className={`${displayFont.className} home-service-title`}>{direction.title}</h3>
              <p className="home-service-description">{direction.description}</p>
            </div>
            <div className="home-service-result">
              <span>Для кого</span>
              <p>{direction.result}</p>
            </div>
            <Link className="home-service-card-action" href={getConsultingContactHref({ consultingDirection: direction.value })}>
              <span>{directionActionLabels[direction.value]}</span>
              <span className="home-service-card-action-icon" aria-hidden="true">
                <ArrowUpRight size={15} strokeWidth={1.9} />
              </span>
            </Link>
          </article>
        );
      })}
    </div>
  );
}

export default async function ConsultingPage({ searchParams }: ConsultingPageProps) {
  const params = (await searchParams) ?? {};
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());
  const cities = applicationFormsEnabled ? await getApplicationCityOptions() : [];
  const defaults: Record<string, string | undefined> = Object.fromEntries(
    defaultParamKeys.map((key) => [key, firstParam(params[key])]).filter(([, value]) => Boolean(value))
  );

  return (
    <>
      <EditorialPublicPage
        eyebrow="Консалтинг"
        path="/consulting"
        title="Экспертная помощь для кофейных баров и заведений"
        description="Разбираем запуск, меню, команду, себестоимость, поставщиков и операционные процессы."
        summary="Опишите задачу, стадию проекта и тему консультации. Мы уточним детали и предложим удобный формат."
        summaryHeading="Практика"
        heroVariant="cover"
        metrics={[]}
        rows={[]}
        primaryLink={{ label: 'Описать задачу', href: '#consulting-request' }}
        secondaryLink={{ label: 'Рассчитать себестоимость', href: '/tools/cost-calculator' }}
      />

      <section className="background-zone background-zone-beige editorial-grid border-b border-[var(--line)] py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[minmax(16rem,0.58fr)_minmax(0,1.42fr)]">
          <div className="xl:self-start">
            <PublicEyebrow>Эксперты</PublicEyebrow>
            <PublicDisplayTitle className="mt-4 max-w-sm">Подбор эксперта</PublicDisplayTitle>
            <PublicBodyText className="mt-5 max-w-md" size="md">
              Напишите, что происходит сейчас и где нужна помощь. Мы уточним детали и подберём специалиста под задачу.
            </PublicBodyText>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button className="rounded-[var(--radius-md)]" href="#consulting-request" size="lg">
                Описать задачу
                <ArrowUpRight size={16} />
              </Button>
            </div>
          </div>

          <div className="consulting-expert-list border-y border-[var(--line)]">
            {consultingExpertOptions.map((expert, index) => (
              <article
                className="grid gap-3 border-b border-[var(--line)] py-5 transition-colors duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] last:border-b-0 hover:bg-[var(--surface-wash)] focus-within:bg-[var(--surface-wash)] motion-reduce:transition-none md:grid-cols-[minmax(7rem,0.28fr)_minmax(0,1fr)_minmax(12rem,0.46fr)] md:items-start md:gap-5 md:px-3"
                key={expert.value}
              >
                <div className="flex min-w-0 flex-wrap items-center gap-2 md:flex-col md:items-start md:gap-3">
                  <span className="public-route-label">{index + 1}</span>
                  <span className="public-meta-label">{expertMeta[expert.value].kind}</span>
                </div>

                <div className="min-w-0">
                  <h3 className={`${displayFont.className} text-[1.45rem] font-semibold leading-[1.08] text-[var(--text)] md:text-[1.75rem]`}>
                    {expertDisplayTitles[expert.value]}
                  </h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
                    {expertFocus[expert.value]}
                  </p>
                </div>

                <div className="min-w-0">
                  <span className="public-meta-label">Результат</span>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[var(--text)]">
                    {expertMeta[expert.value].result}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="public-contrast-services-section home-services-section background-zone background-zone-graphite border-b border-[var(--line)] py-12 md:py-16">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(18rem,0.5fr)] lg:items-end">
            <div className="min-w-0">
              <PublicEyebrow>Направления</PublicEyebrow>
              <h2 className="mt-4 max-w-xl text-[2rem] font-semibold leading-tight text-[var(--text)] md:text-[2.25rem]">
                Задачи для консультации
              </h2>
            </div>
            <PublicBodyText className="max-w-2xl lg:justify-self-end" size="md">
              Выберите тему, чтобы заявка сразу попала к человеку, который с ней разберётся.
            </PublicBodyText>
          </div>
          <ConsultingDirectionCards />
        </div>
      </section>

      <ConsultingTabs cases={consultingCases} prices={consultingPriceItems} />

      <section className="background-zone background-zone-cta border-b border-[var(--line)] py-10 md:py-14">
        <div className="container grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
          <div>
            <PublicEyebrow tone="inverse">Финальный шаг</PublicEyebrow>
            <PublicDisplayTitle className="mt-3 max-w-3xl text-[var(--editorial-dark-text)]">
              Есть задача для команды BARSYNERGY?
            </PublicDisplayTitle>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button href="#consulting-request">
              Описать задачу
            </Button>
            <Button href="/business" variant="secondary">
              Посмотреть каталог заведений
            </Button>
          </div>
        </div>
      </section>

      <ConsultingRequestForm
        direct
        defaults={defaults}
        enabled={applicationFormsEnabled}
        result={getPublicApplicationResult(params)}
        utm={getPublicApplicationUtm(params)}
        cities={cities}
        action={submitConsultingRequest}
      />
    </>
  );
}
