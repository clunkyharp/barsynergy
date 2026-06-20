import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { ArrowUpRight } from 'lucide-react';
import { AppLink } from '@/components/ui/app-link';
import { PageHero } from '@/components/public/page-hero';
import { ContactChannels } from '@/components/public/contact-channels';
import { ContactPlatformDisclosure } from '@/components/public/contact-platform-disclosure';
import { ContactApplicationForm } from '@/components/public/contact-application-form';
import { submitContactMessage } from '@/app/(public)/contacts/actions';
import { JsonLd } from '@/components/seo/json-ld';
import { buildStaticPageBreadcrumbJsonLd } from '@/lib/public/structured-data';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import { getPublicApplicationUtm } from '@/lib/applications/public-form-helpers';
import { buildPublicPageMetadata } from '@/lib/public/metadata';
import { displayFont } from '@/lib/fonts';
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
  supplier: 'supplier'
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

const alternativeRoutes = [
  {
    title: 'Хочу разместить вакансию',
    description: 'Заполните карточку вакансии — она появится в каталоге и попадёт в подборку для специалистов.',
    href: '/vacancies/new',
    actionLabel: 'Разместить вакансию',
    accent: 'var(--accent)'
  },
  {
    title: 'Хочу попасть в каталог поставщиков',
    description: 'Карточка компании с продуктами, географией и контактами появляется в каталоге BARSYNERGY.',
    href: '/suppliers?action=join',
    actionLabel: 'Разместить компанию',
    accent: 'var(--accent)'
  },
  {
    title: 'Хочу подписаться на материалы',
    description: 'Подписка на еженедельную рассылку: события, обучение, кейсы и обновления каталога.',
    href: '/articles',
    actionLabel: 'Перейти в материалы',
    accent: 'var(--accent)'
  }
] as const;

export const metadata: Metadata = buildPublicPageMetadata({
  title: 'Контакты BARSYNERGY — связаться с командой',
  description: 'Напишите команде BARSYNERGY: вопросы по обучению, событиям, партнёрствам, вакансиям, поставщикам и публикациям кофейной индустрии СКФО.',
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
      <JsonLd data={buildStaticPageBreadcrumbJsonLd('/contacts', 'Контакты')} />
      <PageHero
        breadcrumbs={[{ label: 'Контакты' }]}
        eyebrow="Контакты"
        title="Связь с командой BARSYNERGY"
        subtitle="Пишите по любой задаче: партнёрство, обучение, события, материалы или вопросы по платформе. В будни отвечаем за 4 часа, в выходные — на следующий рабочий день."
        tone="graphite"
        density="compact"
      />
      <ContactChannels />

      <section className="border-b border-[var(--line)] bg-[var(--surface)] py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className={`${displayFont.className} text-[1.9rem] font-semibold leading-[1.1] text-[var(--text)] md:text-[2.4rem]`}>
              Напишите нам
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--muted)] md:text-base">
              Вопросы, обратная связь, партнёрства и сотрудничество — заполните форму ниже, и мы ответим в течение рабочего дня.
            </p>
          </div>
        </div>
      </section>

      <ContactPlatformDisclosure defaultOpen={Boolean(defaultTopic)}>
        <ContactApplicationForm
          defaultTopic={defaultTopic}
          enabled={applicationFormsEnabled}
          utm={getPublicApplicationUtm(params)}
          defaults={defaults}
          cities={cities}
          action={submitContactMessage}
        />
      </ContactPlatformDisclosure>

      <section className="bg-[var(--surface-muted)] py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-5xl">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[var(--tracking-eyebrow-md)] text-[var(--accent)]">
                  Быстрые разделы
                </p>
                <h2 className={`${displayFont.className} mt-2 text-[1.7rem] font-semibold leading-[1.1] text-[var(--text)] md:text-[2.1rem]`}>
                  Не нашли свой случай?
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-[var(--muted)]">
                Эти запросы быстрее решаются через специальные формы и разделы — без переписки.
              </p>
            </div>

            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {alternativeRoutes.map((route) => {
                return (
                  <AppLink
                    className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--surface)] transition-[border-color,box-shadow] duration-[var(--motion-duration-base)] ease-[var(--motion-ease-standard)] hover:border-[color-mix(in_oklab,var(--route-accent)_45%,var(--border-default))] hover:shadow-[var(--shadow-card)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--route-accent)] motion-reduce:transition-none"
                    href={route.href}
                    key={route.title}
                    style={{ '--route-accent': route.accent } as CSSProperties}
                  >
                    <span className="flex flex-1 flex-col p-6">
                      <h3 className="text-base font-semibold leading-6 text-[var(--text)]">{route.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{route.description}</p>
                      <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-[var(--route-accent)]">
                        {route.actionLabel}
                        <ArrowUpRight aria-hidden="true" className="transition-transform duration-[var(--motion-duration-base)] ease-[var(--motion-ease-move)] group-hover:translate-x-1 motion-reduce:transition-none" size={16} strokeWidth={1.8} />
                      </span>
                    </span>
                  </AppLink>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
