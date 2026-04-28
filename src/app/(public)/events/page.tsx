import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { EventApplicationForm } from '@/components/public/event-application-form';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import {
  getPublicApplicationResult,
  getPublicApplicationUtm,
  stripPublicApplicationResultParams
} from '@/lib/applications/public-form-helpers';
import { getPublishedEvents, type PublicContentSearchParams } from '@/lib/public/content';
import { getEnv } from '@/lib/validation/env';

type EventsPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = (await searchParams) ?? {};
  const [content, cities] = await Promise.all([
    getPublishedEvents(stripPublicApplicationResultParams(params)),
    getApplicationCityOptions()
  ]);
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());

  return (
    <>
      <EditorialPublicPage
        eyebrow="События"
        title="Афиша встреч, лекций и индустриальных событий"
        description="Публичный раздел мероприятий: встречи, лекции и отраслевые форматы для специалистов и команд."
        summary="Здесь публикуются встречи, лекции, дегустации и партнерские события с понятным форматом участия."
        metrics={[
          { value: 'СКФО', label: 'регион событий' },
          { value: 'Открыто', label: 'форматы участия' },
          { value: 'Афиша', label: 'публичный раздел' }
        ]}
        rows={[
          {
            label: 'Тип',
            title: 'Открытые встречи',
            description: 'Встречи для знакомства, обмена опытом и обсуждения рабочих задач заведений.'
          },
          {
            label: 'Тип',
            title: 'Лекции и дегустации',
            description: 'События с экспертами, брендами и преподавателями, где можно разобрать тему на практике.'
          },
          {
            label: 'Тип',
            title: 'Партнерские мероприятия',
            description: 'Форматы для школ, брендов и заведений с персональной координацией по каждому запросу.'
          }
        ]}
        primaryLink={{ label: 'Предложить событие', href: '/contacts' }}
        secondaryLink={{ label: 'Партнерство', href: '/partners' }}
      />
      <PublishedContentSection
        basePath="/events"
        content={content}
        emptyDescription="Опубликованные события появятся здесь после публикации через админку."
        emptyTitle="Пока нет опубликованных событий"
        title="Афиша"
      />
      <EventApplicationForm
        enabled={applicationFormsEnabled}
        result={getPublicApplicationResult(params)}
        utm={getPublicApplicationUtm(params)}
        cities={cities}
      />
    </>
  );
}
