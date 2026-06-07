import { SUPPORT_EMAIL } from '@/lib/contact-info';

export const contactMethods: {
  mark: string;
  name: string;
  value: string;
  href: string;
  actionLabel: string;
}[] = [
  {
    mark: 'EM',
    name: 'Основная почта',
    value: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    actionLabel: 'Написать'
  },
  {
    mark: 'TG',
    name: 'Telegram',
    value: '@barsynergy',
    href: 'https://t.me/barsynergy',
    actionLabel: 'Открыть'
  }
];

export const contactTopicOptions = [
  {
    value: 'vacancy-placement',
    label: 'Хочу разместить вакансию',
    description: 'Для размещения роли, поиска сотрудника и получения откликов.'
  },
  {
    value: 'education-program',
    label: 'Интересует обучение',
    description: 'Для команды, темы занятия или заявки на программу.'
  },
  {
    value: 'education-launch',
    label: 'Хочу предложить программу обучения',
    description: 'Для анонса курса, приглашения на интенсив или предложения по формату.'
  },
  {
    value: 'supplier',
    label: 'Предлагаю сотрудничество как поставщик',
    description: 'Для заявки в каталог, компании или сервисной услуги.'
  },
  {
    value: 'supplier-contact',
    label: 'Связаться с поставщиком',
    description: 'Для вопроса по компании, продуктам, условиям или географии работы.'
  },
  {
    value: 'partnership',
    label: 'Хочу стать партнёром',
    description: 'Для совместного проекта, размещения, обучения или материала.'
  },
  {
    value: 'sponsorship',
    label: 'Интересует спонсорство',
    description: 'Для участия бренда в сезоне, событиях или материалах.'
  },
  {
    value: 'bug-report',
    label: 'Что-то сломалось',
    description: 'Для технической ошибки, проблемы с формой или некорректной страницей.'
  },
  {
    value: 'event',
    label: 'Предложить событие',
    description: 'Для участия, добавления события или новой встречи.'
  },
  {
    value: 'consulting',
    label: 'Консалтинг',
    description: 'Для запуска, меню, команды, закупок, экономики или проверки процессов.'
  },
  {
    value: 'article-topic',
    label: 'Материал или интервью',
    description: 'Для темы статьи, героя интервью или кейса.'
  },
  {
    value: 'other',
    label: 'Другое',
    description: 'Если запрос не подходит под другие темы.'
  }
] as const;

export type ContactTopicValue = (typeof contactTopicOptions)[number]['value'];
