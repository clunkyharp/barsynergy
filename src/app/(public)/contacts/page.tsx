import type { Metadata } from 'next';
import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { ContactApplicationForm } from '@/components/public/contact-application-form';
import { submitContactMessage } from '@/app/(public)/contacts/actions';
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
  'education-launch': 'education-launch',
  vacancy: 'vacancy-placement',
  'vacancy-placement': 'vacancy-placement',
  partnership: 'partnership',
  'partnership-format': 'partnership',
  sponsorship: 'sponsorship',
  'sponsorship-presentation': 'sponsorship',
  consulting: 'consulting',
  'consulting-request': 'consulting',
  event: 'event',
  bug: 'bug-report',
  'bug-report': 'bug-report',
  'article-topic': 'article-topic',
  'article-interview': 'article-topic',
  'article-launch': 'article-topic',
  supplier: 'other'
};

const contextParamKeys = [
  'companyName',
  'teamSize',
  'topicTitle',
  'position',
  'employmentType',
  'salaryLabel',
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
        eyebrow="Команда"
        path="/contacts"
        title="Напишите нам"
        description="Отвечаем в течение рабочего дня. Выберите тему — форма подстроится."
        summary="Форма — основной способ связаться с командой. Email и Telegram оставили ниже как запасной вариант."
        density="compact"
        summaryHeading="Связь"
        accentGradient="radial-gradient(ellipse 90% 60% at 60% 40%, rgba(180,120,60,0.08), transparent)"
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
        action={submitContactMessage}
      />
    </>
  );
}
