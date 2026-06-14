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
export type ContactTopicSelection = ContactTopicValue | '';

export const contactTopicDetailValues: readonly ContactTopicValue[] = [
  'partnership',
  'sponsorship',
  'consulting',
  'article-topic'
] satisfies ContactTopicValue[];

const contactMessageLabels: Partial<Record<ContactTopicValue, string>> = {
  'article-topic': 'О чём должен быть материал',
  'bug-report': 'Что сломалось',
  consulting: 'Опишите задачу для консультации',
  partnership: 'Какой формат партнёрства хотите обсудить',
  sponsorship: 'Какие условия спонсорства нужны'
};

const contactTopicDetailTitles: Partial<Record<ContactTopicValue, string>> = {
  'article-topic': 'Детали материала',
  consulting: 'Детали задачи',
  partnership: 'Детали сотрудничества',
  sponsorship: 'Детали сотрудничества'
};

const contactTopicDetailHints: Partial<Record<ContactTopicValue, string>> = {
  'article-topic': 'Добавили поля: тема и формат материала.',
  consulting: 'Добавили поля: компания и направление консультации.',
  partnership: 'Добавили поля: формат и сайт или соцсеть.',
  sponsorship: 'Добавили поля: формат и сайт или соцсеть.'
};

function isContactTopicValue(topic: ContactTopicSelection): topic is ContactTopicValue {
  return topic !== '';
}

export function getContactMessageLabel(topic: ContactTopicSelection) {
  return isContactTopicValue(topic) ? (contactMessageLabels[topic] ?? 'Сообщение') : 'Сообщение';
}

export function shouldShowContactTopicDetails(topic: ContactTopicSelection) {
  return isContactTopicValue(topic) && contactTopicDetailValues.includes(topic);
}

export function getContactTopicDetailsTitle(topic: ContactTopicSelection) {
  return isContactTopicValue(topic) ? (contactTopicDetailTitles[topic] ?? 'Детали по теме') : 'Детали по теме';
}

export function getContactTopicDetailsHint(topic: ContactTopicSelection) {
  return isContactTopicValue(topic) ? (contactTopicDetailHints[topic] ?? '') : '';
}
