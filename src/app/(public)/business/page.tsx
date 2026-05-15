import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { BusinessSolutionForm } from '@/components/public/business-solution-form';
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
import { businessSolutionTypeOptions } from '@/lib/applications/b2b-request-options';
import type { PublicContentSearchParams } from '@/lib/public/content';
import { getEnv } from '@/lib/validation/env';

type BusinessPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = {
  title: 'Для бизнеса',
  description: 'Цифровые решения BARSYNERGY для заведений: сайт, Telegram-бот, вакансии, внутренние формы и уведомления.'
};

const businessProblems = [
  {
    label: 'Сайт',
    title: 'Гости не видят меню, события и контакты в одном месте',
    description: 'Подходит заведению, которому нужна понятная страница с меню, событиями, адресом и заявками.'
  },
  {
    label: 'Заявки',
    title: 'Запросы приходят в разные чаты и теряются',
    description: 'Telegram-бот собирает заявки по одинаковому сценарию и передаёт их ответственному человеку.'
  },
  {
    label: 'Команда',
    title: 'Вакансии и отклики трудно разбирать вручную',
    description: 'Бот задаёт первичные вопросы кандидату и помогает быстрее отделить релевантные отклики.'
  }
];

const processSteps = [
  {
    label: 'Шаг 1',
    title: 'Разобрать задачу',
    description: 'Фиксируем процесс, пользователей, обязательные поля и кто получает результат.',
    action: 'Оставить заявку',
    href: '#business-request'
  },
  {
    label: 'Шаг 2',
    title: 'Собрать короткий сценарий',
    description: 'Определяем экраны, статусы, уведомления и минимальный набор данных без лишних функций.',
    action: 'Описать процесс',
    href: '#business-request'
  },
  {
    label: 'Шаг 3',
    title: 'Запустить первую версию',
    description: 'Готовим рабочую версию, проверяем форму или бот на реальных заявках и уточняем следующий шаг.',
    action: 'Начать первый запуск',
    href: '#business-request'
  }
] as const;

export default async function BusinessPage({ searchParams }: BusinessPageProps) {
  const params = (await searchParams) ?? {};
  const [cities] = await Promise.all([getApplicationCityOptions()]);
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());
  const solutionType = firstParam(params.solutionType);

  return (
    <>
      <EditorialPublicPage
        eyebrow="Для бизнеса"
        title="Цифровые решения для заведений и команд"
        description="BARSYNERGY помогает собрать сайт, Telegram-бот или простую внутреннюю систему под конкретный рабочий процесс."
        summary="Начните с задачи: заявки, вакансии, уведомления, внутренняя форма или сайт. После заявки команда уточнит сценарий и объём первого запуска."
        summaryHeading="B2B"
        metrics={[
          { value: '5', label: 'типов решений' },
          { value: 'Старт', label: 'первый запуск' },
          { value: 'Заявка', label: 'старт работы' }
        ]}
        rows={businessProblems}
        rowsHeading="Рабочие проблемы"
        primaryLink={{ label: 'Оставить заявку', href: '#business-request' }}
        secondaryLink={{ label: 'Войти в кабинет', href: '/business/cabinet' }}
      />

      <section className="background-zone background-zone-gray border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <div className="mb-6 max-w-3xl">
            <PublicEyebrow>Решения</PublicEyebrow>
            <PublicDisplayTitle className="mt-4 max-w-4xl">Что можно собрать</PublicDisplayTitle>
            <PublicBodyText className="mt-5 max-w-2xl" size="md">
              Каждая заявка привязана к одной практической задаче. Сложные интеграции, оплаты и личные кабинеты не входят в первый запуск.
            </PublicBodyText>
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {businessSolutionTypeOptions.map((option, index) => (
              <FeatureCard
                action={{ href: `/business?solutionType=${encodeURIComponent(option.value)}#business-request`, label: 'Выбрать' }}
                code={String(index + 1).padStart(2, '0')}
                description={option.description}
                eyebrow="Сервис"
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
            <PublicEyebrow>Процесс</PublicEyebrow>
            <PublicDisplayTitle className="mt-4 max-w-[13ch]">Как начинается работа</PublicDisplayTitle>
            <PublicBodyText className="mt-5 max-w-md" size="md">
              Первый шаг не требует ТЗ. Достаточно описать, какой процесс нужно сделать понятнее и быстрее.
            </PublicBodyText>
            <div className="mt-8 flex flex-wrap gap-3">
              <RequestDisclosureTrigger className="min-h-12 rounded-[var(--radius-md)] px-5 tracking-normal" targetId="business-request">
                Оставить заявку
                <ArrowUpRight size={16} />
              </RequestDisclosureTrigger>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {processSteps.map((step, index) => (
              <RoleTaskCard
                action={{ href: step.href, label: step.action }}
                code={String(index + 1).padStart(2, '0')}
                density="compact"
                description={step.description}
                eyebrow={step.label}
                key={step.title}
                meta={index === 0 ? 'Старт' : index === 1 ? 'Сценарий' : 'Первый запуск'}
                metaLabel="Этап"
                title={step.title}
              />
            ))}
          </div>
        </div>
      </section>

      <BusinessSolutionForm
        cities={cities}
        defaults={{ solutionType }}
        enabled={applicationFormsEnabled}
        result={getPublicApplicationResult(params)}
        utm={getPublicApplicationUtm(params)}
      />
    </>
  );
}
