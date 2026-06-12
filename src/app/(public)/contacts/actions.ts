'use server';

import { ApplicationType } from '@prisma/client';
import { z } from 'zod';
import { buildApplicationPayload } from '@/lib/applications/application-payloads';
import {
  assertActiveCity,
  baseContactSchema,
  getString,
  nullableString,
  optionalString,
  PERSONAL_DATA_CONSENT_TEXT,
  type PublicApplicationResult,
  utmSchema
} from '@/lib/applications/public-form-helpers';
import { submitPublicApplicationAction } from '@/lib/applications/submit-public-application-action';

const contactTopicValues = [
  'education-program',
  'education-launch',
  'event',
  'vacancy-placement',
  'partnership',
  'sponsorship',
  'consulting',
  'article-topic',
  'bug-report',
  'supplier',
  'other'
] as const;

type ContactTopic = (typeof contactTopicValues)[number];

function getContactTopicLabel(topic: ContactTopic) {
  switch (topic) {
    case 'education-program':
      return 'Обучение';
    case 'education-launch':
      return 'Хочу предложить программу обучения';
    case 'event':
      return 'Событие';
    case 'vacancy-placement':
      return 'Вакансия';
    case 'partnership':
      return 'Партнёрство';
    case 'sponsorship':
      return 'Спонсорство';
    case 'consulting':
      return 'Консалтинг';
    case 'article-topic':
      return 'Материал или интервью';
    case 'bug-report':
      return 'Что-то сломалось';
    case 'supplier':
      return 'Поставщик';
    case 'other':
      return 'Другое';
  }
}

const contactMessageSchema = baseContactSchema
  .merge(utmSchema)
  .extend({
    name: z.string().trim().min(2).max(160),
    contact: z.string().trim().max(180).optional(),
    cityId: z.string().trim().max(120).optional(),
    topic: z.enum(contactTopicValues).optional().default('other'),
    message: z.string().trim().min(20).max(4000),
    companyName: z.string().trim().max(180).optional(),
    teamSize: z.string().trim().max(80).optional(),
    topicTitle: z.string().trim().max(180).optional(),
    position: z.string().trim().max(160).optional(),
    employmentType: z.string().trim().max(120).optional(),
    salaryLabel: z.string().trim().max(120).optional(),
    websiteUrl: z.string().trim().url().max(500).optional(),
    eventTitle: z.string().trim().max(180).optional(),
    eventDate: z.string().trim().max(40).optional(),
    venueName: z.string().trim().max(180).optional(),
    formatLabel: z.string().trim().max(120).optional(),
    registrationUrl: z.string().trim().url().max(500).optional(),
    partnerType: z.string().trim().max(160).optional(),
    consent: z.literal('accepted')
  })
  .superRefine((data, context) => {
    if (!data.email && !data.phone && !data.telegram && !data.contact) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'contact is required',
        path: ['contact']
      });
    }

    // Topic-specific fields are optional because the public contact form keeps them in the topic section.
  });

function splitContactChannel(contact?: string) {
  const value = contact?.trim();

  if (!value) {
    return {};
  }

  if (value.includes('@') && !value.startsWith('@')) {
    return { email: value };
  }

  if (value.startsWith('@') || value.toLowerCase().includes('t.me/')) {
    return { telegram: value };
  }

  return { phone: value };
}

export async function submitContactMessage(_prevState: PublicApplicationResult | null, formData: FormData): Promise<PublicApplicationResult> {
  return submitPublicApplicationAction({
    actionName: 'public:contact-message',
    applicationType: ApplicationType.CONTACT_MESSAGE,
    formData,
    successMessage: 'Сообщение получено. Мы свяжемся с вами после проверки обращения.',
    parse: async (data) => {
      const contactChannels = splitContactChannel(getString(data, 'contact'));
      const parsed = contactMessageSchema.parse({
        name: getString(data, 'name'),
        contact: optionalString(getString(data, 'contact')),
        email: optionalString(getString(data, 'email')) ?? contactChannels.email,
        phone: optionalString(getString(data, 'phone')) ?? contactChannels.phone,
        telegram: optionalString(getString(data, 'telegram')) ?? contactChannels.telegram,
        cityId: optionalString(getString(data, 'cityId')),
        topic: getString(data, 'topic'),
        message: getString(data, 'message'),
        companyName: optionalString(getString(data, 'companyName')),
        teamSize: optionalString(getString(data, 'teamSize')),
        topicTitle: optionalString(getString(data, 'topicTitle')),
        position: optionalString(getString(data, 'position')),
        employmentType: optionalString(getString(data, 'employmentType')),
        salaryLabel: optionalString(getString(data, 'salaryLabel')),
        websiteUrl: optionalString(getString(data, 'websiteUrl')),
        eventTitle: optionalString(getString(data, 'eventTitle')),
        eventDate: optionalString(getString(data, 'eventDate')),
        venueName: optionalString(getString(data, 'venueName')),
        formatLabel: optionalString(getString(data, 'formatLabel')),
        registrationUrl: optionalString(getString(data, 'registrationUrl')),
        partnerType: optionalString(getString(data, 'partnerType')),
        consent: getString(data, 'consent'),
        utmSource: optionalString(getString(data, 'utmSource')),
        utmMedium: optionalString(getString(data, 'utmMedium')),
        utmCampaign: optionalString(getString(data, 'utmCampaign'))
      });
      const city = await assertActiveCity(parsed.cityId);
      const topicLabel = getContactTopicLabel(parsed.topic);

      return { parsed, city, topicLabel };
    },
    buildApplication: ({ parsed, city, topicLabel }) => ({
      type: ApplicationType.CONTACT_MESSAGE,
      subject: `Контакт: ${topicLabel}`,
      message: parsed.message,
      name: parsed.name,
      email: nullableString(parsed.email),
      phone: nullableString(parsed.phone),
      telegram: nullableString(parsed.telegram),
      cityId: city?.id ?? null,
      cityName: city?.name,
      consentText: PERSONAL_DATA_CONSENT_TEXT,
      utm: {
        source: nullableString(parsed.utmSource),
        medium: nullableString(parsed.utmMedium),
        campaign: nullableString(parsed.utmCampaign)
      },
      payload: buildApplicationPayload(ApplicationType.CONTACT_MESSAGE, {
        topic: parsed.topic,
        topicLabel,
        companyName: parsed.companyName ?? null,
        teamSize: parsed.teamSize ?? null,
        topicTitle: parsed.topicTitle ?? null,
        position: parsed.position ?? null,
        employmentType: parsed.employmentType ?? null,
        salaryLabel: parsed.salaryLabel ?? null,
        websiteUrl: parsed.websiteUrl ?? null,
        eventTitle: parsed.eventTitle ?? null,
        eventDate: parsed.eventDate ?? null,
        venueName: parsed.venueName ?? null,
        formatLabel: parsed.formatLabel ?? null,
        registrationUrl: parsed.registrationUrl ?? null,
        partnerType: parsed.partnerType ?? null
      })
    })
  });
}
