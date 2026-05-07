import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { PartnerFormatTable } from '@/components/public/editorial-display-primitives';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PartnerApplicationForm } from '@/components/public/partner-application-form';
import { RoleTaskCard } from '@/components/public/public-card-patterns';
import { PublicBodyText, PublicDisplayTitle, PublicEyebrow } from '@/components/public/public-primitives';
import { RequestDisclosureTrigger } from '@/components/public/request-disclosure';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import {
  getPublicApplicationResult,
  getPublicApplicationUtm
} from '@/lib/applications/public-form-helpers';
import type { PublicContentSearchParams } from '@/lib/public/content';
import { getEnv } from '@/lib/validation/env';

type PartnersPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export const metadata: Metadata = {
  title: 'Партнёры',
  description: 'Партнёрские форматы BARSYNERGY для брендов, школ и заведений.'
};

const partnerFormats = [
  {
    title: 'Событие',
    fit: 'Брендам, школам и площадкам, которым нужна встреча со специалистами и командами заведений.',
    partnerProvides: 'Тема, продукт, эксперт, площадка или команда для события.',
    barsynergyProvides: 'Собрать формат, анонс, страницу события и действие для гостей.',
    nextStep: 'Описать событие и аудиторию.'
  },
  {
    title: 'Обучение',
    fit: 'Брендам, школам и заведениям, которым нужно обучение под команду, запуск или сезон.',
    partnerProvides: 'Тема, эксперт, продуктовая часть, площадка или задача команды.',
    barsynergyProvides: 'Собрать программу, заявку и рабочий формат запуска.',
    nextStep: 'Описать, кого нужно обучить.'
  },
  {
    title: 'Материал',
    fit: 'Компаниям, которым нужен материал, кейс или интервью для специалистов и заведений.',
    partnerProvides: 'Фактура, тема, контакты, изображения и эксперт для комментария.',
    barsynergyProvides: 'Подготовить материал и связать его с нужным разделом сайта.',
    nextStep: 'Предложить тему материала.'
  },
  {
    title: 'Каталог',
    fit: 'Поставщикам, школам, сервисам и площадкам, которым нужна карточка компании на сайте.',
    partnerProvides: 'Профиль компании, контакты, продукты, география работы и короткое описание.',
    barsynergyProvides: 'Разместить карточку и связать её с релевантными разделами.',
    nextStep: 'Передать данные компании.'
  },
  {
    title: 'Спецпроект',
    fit: 'Запускам и сезонным темам, где нужно связать событие, обучение и материалы.',
    partnerProvides: 'Задача, продукты, эксперты, календарь и ответственные со своей стороны.',
    barsynergyProvides: 'Собрать проект из события, материала, обучения или другого рабочего формата.',
    nextStep: 'Описать задачу проекта.'
  }
] as const;

const partnershipStartOptions = [
  {
    label: 'Основной путь',
    title: 'Сначала описать задачу',
    description: 'Подходит, если формат ещё не выбран: команда посмотрит задачу и предложит ближайший вариант.',
    href: '#partner-request',
    action: 'Оставить заявку',
    recommended: true
  },
  {
    label: 'Альтернатива',
    title: 'Обсудить формат до заявки',
    description: 'Полезно, если нужно понять, что лучше: событие, обучение, материал, каталог или спецпроект.',
    href: '#partner-request',
    action: 'Обсудить формат',
    recommended: false
  },
  {
    label: 'Отдельный раздел',
    title: 'Посмотреть спонсорство',
    description: 'Если задача ближе к размещению бренда, лучше перейти на страницу спонсорства.',
    href: '/general-sponsors',
    action: 'Смотреть спонсорство',
    recommended: false
  }
] as const;

function PartnershipStartSequence() {
  return (
    <section className="background-zone background-zone-gray editorial-grid border-b border-[var(--line)] py-10 md:py-14">
      <div className="container grid gap-8 xl:grid-cols-[minmax(16rem,0.58fr)_minmax(0,1.42fr)]">
        <div className="xl:sticky xl:top-24 xl:self-start">
          <PublicEyebrow>Партнёрство</PublicEyebrow>
          <PublicDisplayTitle className="mt-4 max-w-[13ch]">С чего можно начать</PublicDisplayTitle>
          <PublicBodyText className="mt-5 max-w-md" size="md">
            Начните с задачи. Формат можно выбрать сразу или уточнить вместе с командой.
          </PublicBodyText>
          <div className="mt-8 flex flex-wrap gap-3">
            <RequestDisclosureTrigger className="min-h-12 rounded-[var(--radius-md)] px-5 tracking-normal" targetId="partner-request">
              Оставить заявку
              <ArrowUpRight size={16} />
            </RequestDisclosureTrigger>
            <RequestDisclosureTrigger className="min-h-12 rounded-[var(--radius-md)] px-5 tracking-normal" targetId="partner-request" variant="secondary">
              Обсудить формат
              <ArrowUpRight size={16} />
            </RequestDisclosureTrigger>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {partnershipStartOptions.map((option, index) => (
            <RoleTaskCard
              action={{ href: option.href, label: option.action }}
              className={
                option.recommended
                  ? 'border-[var(--accent)]/32 bg-[linear-gradient(180deg,var(--accent-soft),color-mix(in_oklab,var(--surface),white_18%)_54%)]'
                  : undefined
              }
              code={String(index + 1).padStart(2, '0')}
              density="compact"
              description={option.description}
              eyebrow={option.label}
              key={option.title}
              meta={option.recommended ? 'Рекомендуем' : option.href.startsWith('/general-sponsors') ? 'Отдельный раздел' : 'Можно уточнить'}
              metaLabel="Статус"
              title={option.title}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PartnersPage({ searchParams }: PartnersPageProps) {
  const params = (await searchParams) ?? {};
  const [cities] = await Promise.all([getApplicationCityOptions()]);
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());
  const applicationResult = getPublicApplicationResult(params);
  const applicationUtm = getPublicApplicationUtm(params);
  const requestFormat = firstParam(params.requestFormat);

  return (
    <>
      <EditorialPublicPage
        eyebrow="Для партнёров"
        title="Партнёрство для брендов, школ и заведений"
        description="Если у вас есть событие, обучение, запуск или совместный проект, здесь можно сразу написать команде BARSYNERGY."
        summary="Опишите задачу: событие, обучение, материал, каталог или спецпроект. После заявки уточним формат."
        metrics={[
          { value: String(partnerFormats.length), label: 'форматов' },
          { value: 'Контакт', label: 'прямая связь' },
          { value: 'СКФО', label: 'рынок региона' }
        ]}
        rows={[
          {
            label: 'Обучение',
            title: 'Лекции, интенсивы и корпоративные программы',
            description: 'Подходит брендам, школам и заведениям, которым нужно собрать обучение под команду, запуск или сезон.'
          },
          {
            label: 'События',
            title: 'Гостевые смены, дегустации и специальные встречи',
            description: 'Разовые или серийные встречи с понятной темой, площадкой и аудиторией.'
          },
          {
            label: 'Контент',
            title: 'Материалы и карточка на сайте',
            description: 'Интервью, подборки и анонсы, которые остаются на сайте после события.'
          }
        ]}
        primaryLink={{ label: 'Оставить заявку', href: '#partner-request' }}
        secondaryLink={{ label: 'Смотреть спонсорство', href: '/general-sponsors' }}
      />
      <section className="background-zone background-zone-beige editorial-grid border-b border-[var(--line)] py-10 md:py-14">
        <div className="container">
          <PartnerFormatTable
            className="border-0 py-0"
            description="Выберите сценарий: провести событие, собрать обучение, запустить материал, разместить компанию или обсудить спецпроект."
            eyebrow="Форматы"
            items={partnerFormats.map((format) => ({
              format: format.title,
              fit: format.fit,
              partnerProvides: format.partnerProvides,
              barsynergyProvides: format.barsynergyProvides,
              nextStep: format.nextStep,
              action: {
                href: `/partners?requestFormat=${encodeURIComponent(format.title)}#partner-request`,
                label: 'Выбрать формат'
              }
            }))}
            title="Как можно работать вместе"
          />
        </div>
      </section>
      <PartnershipStartSequence />
      <PartnerApplicationForm
        cities={cities}
        defaults={{ partnerType: requestFormat }}
        enabled={applicationFormsEnabled}
        result={applicationResult}
        utm={applicationUtm}
      />
    </>
  );
}
