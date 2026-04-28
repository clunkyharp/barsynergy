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
        title="Связь с командой и входящие запросы"
        description="Контактная точка для образовательных запросов, партнерств, вакансий, поставщиков и общих вопросов."
        summary="Команда принимает обращения по ключевым направлениям: образование, события, партнерства, поставщики и вакансии."
        metrics={[
          { value: 'Почта', label: 'основной канал связи' },
          { value: 'Право', label: 'работа по российским правилам' },
          { value: 'Ответ', label: 'ручная обработка' }
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
            label: 'Правило',
            title: 'Конфиденциальность данных',
            description: 'Любой сбор персональных данных должен идти с прозрачными условиями обработки и ссылкой на юридические документы сайта.'
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
