import { EditorialPublicPage } from '@/components/public/editorial-public-page';

export default function ContactsPage() {
  return (
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
      primaryLink={{ label: 'Написать на email', href: 'mailto:hello@barsynergy.ru' }}
      secondaryLink={{ label: 'Политика ПДн', href: '/legal/privacy' }}
    />
  );
}
