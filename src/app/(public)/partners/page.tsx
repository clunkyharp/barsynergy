import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { PartnerApplicationForm } from '@/components/public/partner-application-form';
import { PublishedContentSection } from '@/components/public/published-content-section';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import {
  getPublicApplicationResult,
  getPublicApplicationUtm,
  stripPublicApplicationResultParams
} from '@/lib/applications/public-form-helpers';
import { getPublishedPartners, type PublicContentSearchParams } from '@/lib/public/content';
import { getEnv } from '@/lib/validation/env';

type PartnersPageProps = {
  searchParams?: Promise<PublicContentSearchParams>;
};

export default async function PartnersPage({ searchParams }: PartnersPageProps) {
  const params = (await searchParams) ?? {};
  const [content, cities] = await Promise.all([
    getPublishedPartners(stripPublicApplicationResultParams(params)),
    getApplicationCityOptions()
  ]);
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());

  return (
    <>
      <EditorialPublicPage
        eyebrow="Партнеры"
        title="Партнерские форматы для брендов, школ и заведений"
        description="Форматы сотрудничества для брендов, школ и заведений: заявки, размещения, события и образовательные проекты."
        summary="Здесь можно обсудить совместные проекты, события, спецформаты и работу с аудиторией BARSYNERGY."
        metrics={[
          { value: '3', label: 'типа партнерств' },
          { value: 'Контакт', label: 'прямая связь' },
          { value: 'СКФО', label: 'локальный рынок' }
        ]}
        rows={[
          {
            label: 'Формат',
            title: 'Образовательные партнерства',
            description: 'Совместные лекции, интенсивы, дегустации и программы для специалистов или команд заведений.'
          },
          {
            label: 'Формат',
            title: 'Информационные партнерства',
            description: 'Совместные материалы, анонсы и события для профессиональной аудитории.'
          },
          {
            label: 'Формат',
            title: 'Спецформаты',
            description: 'Отдельные проекты для брендов и заведений: запуск, серия встреч, обучение или интеграция.'
          }
        ]}
        primaryLink={{ label: 'Обсудить партнерство', href: '/contacts' }}
        secondaryLink={{ label: 'События', href: '/events' }}
      />
      <PublishedContentSection
        basePath="/partners"
        content={content}
        emptyDescription="Когда появятся новые партнеры, они отобразятся здесь."
        emptyTitle="Партнеров пока нет"
        title="Партнеры"
      />
      <PartnerApplicationForm
        enabled={applicationFormsEnabled}
        result={getPublicApplicationResult(params)}
        utm={getPublicApplicationUtm(params)}
        cities={cities}
      />
    </>
  );
}
