'use server';

import { redirect } from 'next/navigation';
import { ApplicationType } from '@prisma/client';
import { z } from 'zod';
import { buildApplicationPayload } from '@/lib/applications/application-payloads';
import {
  assertActiveCity,
  baseContactSchema,
  getPublicApplicationResultPath,
  getString,
  nullableString,
  optionalString,
  PERSONAL_DATA_CONSENT_TEXT,
  utmSchema
} from '@/lib/applications/public-form-helpers';
import { submitPublicApplicationAction } from '@/lib/applications/submit-public-application-action';

const CONTACTS_PATH = '/contacts';
const contactTopicValues = [
  'education-program',
  'event',
  'vacancy-placement',
  'supplier',
  'partnership',
  'sponsorship',
  'consulting',
  'article-topic',
  'other'
] as const;

const contactTopicLabels: Record<(typeof contactTopicValues)[number], string> = {
  'education-program': 'Обучение',
  event: 'Событие',
  'vacancy-placement': 'Вакансия',
  supplier: 'Поставщик',
  partnership: 'Партнёрство',
  sponsorship: 'Спонсорство',
  consulting: 'Консалтинг',
  'article-topic': 'Материал или интервью',
  other: 'Другое'
};

const contactMessageSchema = baseContactSchema
  .merge(utmSchema)
  .extend({
    name: z.string().trim().min(2).max(160),
    cityId: z.string().trim().max(120).optional(),
    topic: z.enum(contactTopicValues),
    message: z.string().trim().min(20).max(4000),
    companyName: z.string().trim().max(180).optional(),
    teamSize: z.string().trim().max(80).optional(),
    topicTitle: z.string().trim().max(180).optional(),
    position: z.string().trim().max(160).optional(),
    employmentType: z.string().trim().max(120).optional(),
    salaryLabel: z.string().trim().max(120).optional(),
    supplierCategory: z.string().trim().max(160).optional(),
    serviceArea: z.string().trim().max(160).optional(),
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
    if (!data.email && !data.phone && !data.telegram) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'contact is required',
        path: ['email']
      });
    }

    if (data.topic === 'vacancy-placement') {
      if (!data.companyName) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'required', path: ['companyName'] });
      }
      if (!data.position) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'required', path: ['position'] });
      }
    }

    if (data.topic === 'supplier') {
      if (!data.companyName) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'required', path: ['companyName'] });
      }
      if (!data.serviceArea) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: 'required', path: ['serviceArea'] });
      }
    }

    if (data.topic === 'event' && !data.eventTitle) {
      context.addIssue({ code: z.ZodIssueCode.custom, message: 'required', path: ['eventTitle'] });
    }
  });

function redirectWithContactsResult(result: { type: 'success' | 'error'; message: string }): never {
  redirect(getPublicApplicationResultPath(CONTACTS_PATH, result));
}

export async function submitContactMessage(formData: FormData) {
  await submitPublicApplicationAction({
    actionName: 'public:contact-message',
    applicationType: ApplicationType.CONTACT_MESSAGE,
    formData,
    successMessage: 'Сообщение получено. Мы свяжемся с вами после проверки обращения.',
    redirectWithResult: redirectWithContactsResult,
    parse: async (data) => {
      const parsed = contactMessageSchema.parse({
        name: getString(data, 'name'),
        email: optionalString(getString(data, 'email')),
        phone: optionalString(getString(data, 'phone')),
        telegram: optionalString(getString(data, 'telegram')),
        cityId: optionalString(getString(data, 'cityId')),
        topic: getString(data, 'topic'),
        message: getString(data, 'message'),
        companyName: optionalString(getString(data, 'companyName')),
        teamSize: optionalString(getString(data, 'teamSize')),
        topicTitle: optionalString(getString(data, 'topicTitle')),
        position: optionalString(getString(data, 'position')),
        employmentType: optionalString(getString(data, 'employmentType')),
        salaryLabel: optionalString(getString(data, 'salaryLabel')),
        supplierCategory: optionalString(getString(data, 'supplierCategory')),
        serviceArea: optionalString(getString(data, 'serviceArea')),
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
      const topicLabel = contactTopicLabels[parsed.topic];

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
        supplierCategory: parsed.supplierCategory ?? null,
        serviceArea: parsed.serviceArea ?? null,
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
