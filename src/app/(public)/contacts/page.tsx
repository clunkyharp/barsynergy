import { EditorialPublicPage } from '@/components/public/editorial-public-page';
import { ContactApplicationForm } from '@/components/public/contact-application-form';
import { arePublicApplicationFormsEnabled } from '@/lib/applications/public-forms';
import { getApplicationCityOptions } from '@/lib/applications/form-options';
import { getPublicApplicationResult, getPublicApplicationUtm } from '@/lib/applications/public-form-helpers';
import { getEnv } from '@/lib/validation/env';

type ContactsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const params = (await searchParams) ?? {};
  const [cities] = await Promise.all([getApplicationCityOptions()]);
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());

  return (
    <>
      <EditorialPublicPage
        eyebrow="Контакты"
        title="Связь с командой"
        description="Один адрес для вопросов по обучению, событиям, партнерствам, вакансиям и поставщикам."
        summary="Напишите нам, если вам нужен курс, совместный проект, размещение, событие или рабочий контакт."
        metrics={[
          { value: 'Почта', label: 'основной канал связи' },
          { value: 'Право', label: 'работа по российским правилам' },
          { value: 'Ответ', label: 'обратная связь' }
        ]}
        rows={[
          {
            label: 'Запрос',
            title: 'Образование и события',
            description: 'Запросы на участие, проведение занятий, мастер-классы и корпоративные программы.'
          },
          {
            label: 'Запрос',
            title: 'Партнерства и размещение',
            description: 'Обращения от брендов, школ, заведений, поставщиков и работодателей.'
          },
          {
            label: 'Документы',
            title: 'Условия и данные',
            description: 'Если запрос связан с персональными данными или регистрацией, рядом есть все необходимые документы и условия.'
          }
        ]}
        primaryLink={{ label: 'Написать на email', href: '#applications' }}
        secondaryLink={{ label: 'Политика ПДн', href: '/legal/privacy' }}
      />
      <ContactApplicationForm
        enabled={applicationFormsEnabled}
        result={getPublicApplicationResult(params)}
        utm={getPublicApplicationUtm(params)}
        cities={cities}
      />
    </>
  );
}
