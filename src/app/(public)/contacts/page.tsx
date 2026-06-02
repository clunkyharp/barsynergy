import type { Metadata } from 'next';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { ContactApplicationForm } from '@/components/public/contact-application-form';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import { getPublicApplicationResult, getPublicApplicationUtm } from '@/lib/applications/public-form-helpers';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { getEnv } from '@/lib/validation/env';

type ContactsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const contactTopicAliases: Record<string, string> = {
  'education-program': 'education-program',
  'education-launch': 'education-program',
  vacancy: 'vacancy-response',
  'vacancy-response': 'vacancy-response',
  'vacancy-placement': 'vacancy-placement',
  partnership: 'partnership',
  'partnership-format': 'partnership',
  sponsorship: 'sponsorship',
  'sponsorship-presentation': 'sponsorship',
  consulting: 'consulting',
  'consulting-request': 'consulting',
  'supplier-contact': 'supplier-contact',
  supplier: 'supplier',
  event: 'event',
  'event-news': 'event-news',
  calculator: 'calculator-question',
  'calculator-question': 'calculator-question',
  bug: 'bug-report',
  'bug-report': 'bug-report',
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

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Контакты',
  description: 'Связь с командой BARSYNERGY по обучению, событиям, партнёрствам, вакансиям, поставщикам и материалам.',
  path: '/contacts'
});

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const params = (await searchParams) ?? {};
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());
  const cities = applicationFormsEnabled ? await getApplicationCityOptions() : [];
  const topicParam = firstParam(params.topic);
  const defaultTopic = topicParam ? contactTopicAliases[topicParam] ?? topicParam : undefined;
  const defaults: Record<string, string | undefined> = Object.fromEntries(
    contextParamKeys.map((key) => [key, firstParam(params[key])]).filter(([, value]) => Boolean(value))
  );

  return (
    <>
      <EditorialPublicPage
        eyebrow="Контакты"
        path="/contacts"
        title="Контакты"
        description="Пишите по любому вопросу — отвечаем в течение рабочего дня."
        summary="Форма — основной способ связаться с командой. Email и Telegram оставили ниже как запасной вариант."
        density="compact"
        summaryHeading="Связь"
        metrics={[]}
        rows={[]}
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
