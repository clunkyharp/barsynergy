import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { FeatureCard, RoleTaskCard } from '@/components/public/public-card-patterns';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { Button } from '@/components/ui/button';
import { businessSolutionTypeOptions } from '@/lib/applications/b2b-request-options';

export const metadata: Metadata = {
  title: 'Для бизнеса',
  description: 'Цифровые решения BARSYNERGY для заведений: сайт, Telegram-бот, вакансии, внутренние формы и уведомления.'
};

function getBusinessContactHref(topicTitle?: string) {
  const params = new URLSearchParams({ topic: 'other' });

  if (topicTitle) {
    params.set('topicTitle', topicTitle);
  }

  return `/contacts?${params.toString()}#contact-form`;
}

const processSteps = [
  {
    label: 'Шаг 1',
    title: 'Разобрать задачу',
    description: 'Записываем процесс, пользователей, обязательные поля и получателя заявки.'
  },
  {
    label: 'Шаг 2',
    title: 'Собрать короткий сценарий',
    description: 'Выбираем экраны, статусы, уведомления и данные, без которых запуск не получится.'
  },
  {
    label: 'Шаг 3',
    title: 'Запустить первую версию',
    description: 'Запускаем рабочую версию, проверяем её на заявках и решаем, что добавить дальше.'
  }
] as const;

export default function BusinessPage() {
  return (
    <>
      <EditorialPublicPage
        eyebrow="Для бизнеса"
        title="Цифровые решения для заведений и команд"
        description="Соберём сайт, Telegram-бот или простую внутреннюю систему под ваш рабочий процесс."
        summary="Напишите, что нужно запустить: заявки, вакансии, уведомления, внутреннюю форму или сайт. После заявки уточним сценарий и объём первого запуска."
        summaryHeading="B2B"
        metrics={[]}
        rows={[]}
        primaryLink={{ label: 'Оставить заявку', href: getBusinessContactHref('Бизнес-решение') }}
        secondaryLink={{ label: 'Войти в кабинет', href: '/business/cabinet' }}
      />

      <section className="background-zone background-zone-gray border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <div className="mb-6 max-w-3xl">
            <PublicEyebrow>Решения</PublicEyebrow>
            <PublicDisplayTitle className="mt-4 max-w-4xl">Услуги, которые мы предоставляем</PublicDisplayTitle>
            <PublicBodyText className="mt-5 max-w-2xl" size="md">
              Начинаем с одной понятной задачи. Сложные интеграции, оплаты и личные кабинеты лучше выносить во второй этап.
            </PublicBodyText>
          </div>
          <div className="border-t border-[var(--line)]">
            {businessSolutionTypeOptions.map((option) => (
              <FeatureCard
                description={option.description}
                eyebrow="Сервис"
                key={option.value}
                presentation="row"
                title={option.label}
              />
            ))}
          </div>
          <Button className="mt-6 min-h-12 rounded-[var(--radius-md)] px-6 tracking-normal" href={getBusinessContactHref('Бизнес-решение')}>
            Оставить заявку
            <ArrowUpRight size={18} />
          </Button>
        </div>
      </section>

      <section className="background-zone background-zone-beige editorial-grid border-b border-[var(--line)] py-10 md:py-14">
        <div className="container grid gap-8 xl:grid-cols-[minmax(32rem,0.72fr)_minmax(0,1.28fr)]">
          <div className="xl:sticky xl:top-24 xl:self-start">
            <PublicEyebrow>Процесс</PublicEyebrow>
            <PublicDisplayTitle
              className="mt-4 max-w-[12ch] !text-[clamp(2.9rem,3.7vw,4rem)]"
              style={{ hyphens: 'none', overflowWrap: 'normal', wordBreak: 'normal' }}
            >
              Как начинается работа
            </PublicDisplayTitle>
            <PublicBodyText className="mt-5 max-w-md" size="md">
              Не нужно готовить ТЗ. Достаточно описать процесс, который сейчас отнимает время.
            </PublicBodyText>
          </div>

          <div className="border-t border-[var(--line)]">
            {processSteps.map((step) => (
              <RoleTaskCard
                density="compact"
                description={step.description}
                eyebrow={step.label}
                key={step.title}
                presentation="row"
                title={step.title}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
