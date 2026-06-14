import { z } from 'zod';

export const NEWSLETTER_CONSENT_VERSION = 'v1-2026-06';

export const NEWSLETTER_CONSENT_TEXT =
  'Пользователь согласился с политикой обработки персональных данных и дал согласие на обработку email для еженедельной рассылки BARSYNERGY по выбранным темам.';

export const DEFAULT_NEWSLETTER_TOPICS = ['VACANCIES', 'SUPPLIERS', 'EVENTS'] as const;

export const newsletterTopicOptions = [
  { value: 'VACANCIES', label: 'Вакансии' },
  { value: 'SUPPLIERS', label: 'Поставщики и оборудование' },
  { value: 'EVENTS', label: 'События и каппинги' },
  { value: 'COURSES', label: 'Обучение' },
  { value: 'ARTICLES', label: 'Материалы редакции' }
] as const;

const newsletterTopicValues = newsletterTopicOptions.map((topic) => topic.value) as [
  'VACANCIES',
  'SUPPLIERS',
  'EVENTS',
  'COURSES',
  'ARTICLES'
];

export const newsletterTopicSchema = z.enum(newsletterTopicValues);

export const newsletterSubscriptionSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  topics: z.array(newsletterTopicSchema).min(1).max(newsletterTopicOptions.length),
  consentAccepted: z.literal(true)
});

export type NewsletterSubscriptionInput = z.infer<typeof newsletterSubscriptionSchema>;
