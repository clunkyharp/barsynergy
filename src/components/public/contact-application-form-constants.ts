import { SUPPORT_INSTAGRAM, SUPPORT_TELEGRAM, SUPPORT_WHATSAPP } from '@/lib/contact-info';
import type { ChannelAccentTone } from '@/components/public/channel-accent';

export type ContactMethod = {
  mark: string;
  name: string;
  value: string;
  href: string;
  actionLabel: string;
  tone: ChannelAccentTone;
  descriptor: string;
  helper: string;
  logoPath?: string;
};

export const contactMethods: ContactMethod[] = [
  {
    mark: 'TG',
    name: 'Telegram',
    value: SUPPORT_TELEGRAM,
    href: 'https://t.me/barsynergy',
    actionLabel: 'Написать в Telegram',
    tone: 'telegram',
    descriptor: 'Быстрый ответ по короткому вопросу. Голосовые, документы и ссылки.',
    helper: 'Обычно до 1 рабочего часа'
  },
  {
    mark: 'WA',
    name: 'WhatsApp',
    value: SUPPORT_WHATSAPP,
    href: `https://wa.me/${SUPPORT_WHATSAPP.replace(/[^\d]/g, '')}`,
    actionLabel: 'Написать в WhatsApp',
    tone: 'whatsapp',
    descriptor: 'Если удобнее голосом или для звонка. Скиньте номер — перезвоним.',
    helper: 'Звонок по договорённости'
  },
  {
    mark: 'IG',
    name: 'Instagram',
    value: SUPPORT_INSTAGRAM,
    href: 'https://instagram.com/barsynergy',
    actionLabel: 'Смотреть Instagram',
    tone: 'instagram',
    descriptor: 'Свежие материалы, события и анонсы. Личные сообщения смотрим раз в день.',
    helper: 'Ответ — в течение дня'
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

const contactMessagePlaceholders: Partial<Record<ContactTopicValue, string>> = {
  partnership: 'Например: совместный сезон с локальной обжаркой, нужна площадка и совместный анонс.',
  sponsorship: 'Например: бренд воды хочет войти в сезон событий, бюджет до 300 тыс, интересуют интеграции и амбассадорство.',
  consulting: 'Например: запускаем кофейню в Пятигорске, команда 6 человек, нужна помощь с меню и сервисом.',
  'article-topic': 'Например: история локального бара, готов герой, предлагаем интервью на 40 минут.',
  'bug-report': 'Например: при отправке формы вакансий ошибка 500, шаги воспроизведения, браузер, ссылка.',
  other: 'Опишите запрос: что нужно, к какому сроку, бюджет и ограничения.'
};

const contactMessageHints: Partial<Record<ContactTopicValue, string>> = {
  sponsorship: 'Укажите бренд, цели интеграции и бюджетный ориентир.',
  partnership: 'Опишите формат, ожидания и сроки запуска.',
  consulting: 'Чем точнее задача и сроки, тем быстрее предложим формат работы.',
  'article-topic': 'Назовите тему, героя и желаемый формат материала.',
  'bug-report': 'Опишите шаги, ожидаемое и фактическое поведение, браузер.'
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

export function getContactMessagePlaceholder(topic: ContactTopicSelection) {
  return isContactTopicValue(topic)
    ? (contactMessagePlaceholders[topic] ?? 'Опишите запрос подробнее.')
    : 'Опишите запрос подробнее.';
}

export function getContactMessageHint(topic: ContactTopicSelection) {
  return isContactTopicValue(topic)
    ? (contactMessageHints[topic] ?? 'Чем конкретнее задача, тем быстрее мы поймём, что предложить дальше.')
    : 'Чем конкретнее задача, тем быстрее мы поймём, что предложить дальше.';
}
