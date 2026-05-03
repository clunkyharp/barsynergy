import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { ContactApplicationForm } from '@/components/public/contact-application-form';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import { getPublicApplicationResult, getPublicApplicationUtm } from '@/lib/applications/public-form-helpers';
import { getEnv } from '@/lib/validation/env';

type ContactsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const contactTopicAliases: Record<string, string> = {
  'education-program': 'education-program',
  'education-launch': 'education-program',
  'vacancy-placement': 'vacancy-placement',
  partnership: 'partnership',
  'partnership-format': 'partnership',
  sponsorship: 'sponsorship',
  'sponsorship-presentation': 'sponsorship',
  supplier: 'supplier',
  event: 'event',
  'article-topic': 'article-topic',
  'article-interview': 'article-topic',
  'article-launch': 'article-topic'
};

const contextParamKeys = [
  'companyName',
  'teamSize',
  'topicTitle',
  'position',
  'employmentType',
  'salaryLabel',
  'supplierCategory',
  'serviceArea',
  'websiteUrl',
  'eventTitle',
  'eventDate',
  'venueName',
  'formatLabel',
  'registrationUrl',
  'partnerType'
] as const;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const params = (await searchParams) ?? {};
  const [cities] = await Promise.all([getApplicationCityOptions()]);
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());
  const topicParam = firstParam(params.topic);
  const defaultTopic = topicParam ? contactTopicAliases[topicParam] ?? topicParam : undefined;
  const defaults: Record<string, string | undefined> = Object.fromEntries(
    contextParamKeys.map((key) => [key, firstParam(params[key])]).filter(([, value]) => Boolean(value))
  );

  return (
    <>
      <EditorialPublicPage
        eyebrow="Контакты"
        title="Связь с командой"
        description="Пишите по обучению, событиям, партнёрствам, вакансиям и поставщикам."
        summary="После выбора темы форма покажет нужные поля, чтобы команда сразу получила нормальный рабочий запрос."
        metrics={[
          { value: 'Почта', label: 'основной канал связи' },
          { value: 'Форма', label: 'для рабочих запросов' },
          { value: 'Ответ', label: 'по теме обращения' }
        ]}
        rows={[
          {
            label: 'Запрос',
            title: 'Образование и события',
            description: 'Участие, проведение занятий, мастер-классы и корпоративные программы.'
          },
          {
            label: 'Запрос',
            title: 'Партнерства и размещение',
            description: 'Запросы от брендов, школ, заведений, поставщиков и работодателей.'
          },
          {
            label: 'Документы',
            title: 'Условия и данные',
            description: 'Если запрос связан с регистрацией или персональными данными, нужные документы уже рядом.'
          }
        ]}
        primaryLink={{ label: 'Открыть форму', href: '#applications' }}
        secondaryLink={{ label: 'Политика ПДн', href: '/legal/privacy' }}
      />
      <ContactApplicationForm
        defaultTopic={defaultTopic}
        enabled={applicationFormsEnabled}
        result={getPublicApplicationResult(params)}
        utm={getPublicApplicationUtm(params)}
        defaults={defaults}
        cities={cities}
      />
    </>
  );
}
