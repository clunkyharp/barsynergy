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
  'education-program': 'Предложить образовательный формат',
  'education-launch': 'Другое',
  'vacancy-placement': 'Разместить вакансию',
  partnership: 'Обсудить партнёрство',
  'partnership-format': 'Обсудить партнёрство',
  sponsorship: 'Обсудить спонсорство',
  supplier: 'Добавить поставщика',
  event: 'Добавить событие'
};

export default async function ContactsPage({ searchParams }: ContactsPageProps) {
  const params = (await searchParams) ?? {};
  const [cities] = await Promise.all([getApplicationCityOptions()]);
  const applicationFormsEnabled = arePublicApplicationFormsEnabled(getEnv());
  const topicParam = Array.isArray(params.topic) ? params.topic[0] : params.topic;
  const defaultTopic = topicParam ? contactTopicAliases[topicParam] ?? topicParam : undefined;

  return (
    <>
      <EditorialPublicPage
        eyebrow="Контакты"
        title="Связь с командой"
        description="Пишите по обучению, событиям, партнёрствам, вакансиям и поставщикам."
        summary="Если нужен курс, совместный проект, размещение или рабочий контакт, напишите через форму."
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
        cities={cities}
      />
    </>
  );
}
