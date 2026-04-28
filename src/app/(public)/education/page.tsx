import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { EducationApplicationForms } from '@/components/public/education-application-forms';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import {
  getPublicApplicationResult,
  getPublicApplicationUtm,
  stripPublicApplicationResultParams
} from '@/lib/applications/public-form-helpers';
import { getPublishedCourses, type PublicContentSearchParams } from '@/lib/public/content';
import { getEnv } from '@/lib/validation/env';

type EducationPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export default async function EducationPage({ searchParams }: EducationPageProps) {
  const params = (await searchParams) ?? {};
  const [content, cities] = await Promise.all([
    getPublishedCourses(stripPublicApplicationResultParams(params)),
    getApplicationCityOptions()
  ]);
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());

  return (
    <>
      <EditorialPublicPage
        eyebrow="Образование"
        title="Программы, интенсивы и практические занятия"
        description="Раздел собирает образовательные форматы для специалистов и команд: от коротких мастер-классов до корпоративного обучения."
        summary="Раздел показывает образовательные направления и помогает выбрать подходящий формат: очные занятия, онлайн-материалы или корпоративное обучение."
        metrics={[
          { value: '3', label: 'формата обучения' },
          { value: 'СКФО', label: 'региональный фокус' },
          { value: 'Практика', label: 'прикладной формат' }
        ]}
        rows={[
          {
            label: 'Формат',
            title: 'Интенсивы и мастер-классы',
            description: 'Короткие очные события для практики, дегустаций, командной работы и знакомства с экспертами.'
          },
          {
            label: 'Формат',
            title: 'Онлайн-лекции и материалы',
            description: 'Открытые образовательные материалы для самостоятельного изучения и регулярного обновления знаний.'
          },
          {
            label: 'Формат',
            title: 'Корпоративное обучение',
            description: 'Заявки от заведений и партнеров обрабатываются через контактный канал с ручной проверкой.'
          }
        ]}
        primaryLink={{ label: 'Оставить запрос', href: '/contacts' }}
        secondaryLink={{ label: 'События', href: '/events' }}
      />
      <PublishedContentSection
        basePath="/education"
        content={content}
        emptyDescription="Опубликованные образовательные программы появятся здесь после публикации через админку."
        emptyTitle="Пока нет опубликованных курсов"
        title="Программы"
      />
      <EducationApplicationForms
        enabled={applicationFormsEnabled}
        result={getPublicApplicationResult(params)}
        utm={getPublicApplicationUtm(params)}
        cities={cities}
      />
    </>
  );
}
