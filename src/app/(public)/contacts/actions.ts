'use server';

import { redirect } from 'next/navigation';
import { ApplicationType } from '@prisma/client';
import { z } from 'zod';
import { createPublicApplication } from '@/lib/applications/create-public-application';
import {
  assertActiveCity,
  baseContactSchema,
  getPublicApplicationResultPath,
  getString,
  nullableString,
  optionalString,
  PERSONAL_DATA_CONSENT_TEXT,
  resolvePublicApplicationActionError,
  utmSchema
} from '@/lib/applications/public-form-helpers';
import {
  assertPublicApplicationFormsEnabled,
  assertPublicApplicationSubmissionAllowed,
  hasHoneypotValue
} from '@/lib/applications/public-submission-guards';

const CONTACTS_PATH = '/contacts';
const contactTopicValues = [
  'education-program',
  'event',
  'vacancy-placement',
  'supplier',
  'partnership',
  'sponsorship',
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
  let result: { type: 'success' | 'error'; message: string };

  try {
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      result = { type: 'success', message: 'Сообщение отправлено. Если понадобится, мы свяжемся с вами.' };
      redirectWithContactsResult(result);
    }

    const parsed = contactMessageSchema.parse({
      name: getString(formData, 'name'),
      email: optionalString(getString(formData, 'email')),
      phone: optionalString(getString(formData, 'phone')),
      telegram: optionalString(getString(formData, 'telegram')),
      cityId: optionalString(getString(formData, 'cityId')),
      topic: getString(formData, 'topic'),
      message: getString(formData, 'message'),
      companyName: optionalString(getString(formData, 'companyName')),
      teamSize: optionalString(getString(formData, 'teamSize')),
      topicTitle: optionalString(getString(formData, 'topicTitle')),
      position: optionalString(getString(formData, 'position')),
      employmentType: optionalString(getString(formData, 'employmentType')),
      salaryLabel: optionalString(getString(formData, 'salaryLabel')),
      supplierCategory: optionalString(getString(formData, 'supplierCategory')),
      serviceArea: optionalString(getString(formData, 'serviceArea')),
      websiteUrl: optionalString(getString(formData, 'websiteUrl')),
      eventTitle: optionalString(getString(formData, 'eventTitle')),
      eventDate: optionalString(getString(formData, 'eventDate')),
      venueName: optionalString(getString(formData, 'venueName')),
      formatLabel: optionalString(getString(formData, 'formatLabel')),
      registrationUrl: optionalString(getString(formData, 'registrationUrl')),
      partnerType: optionalString(getString(formData, 'partnerType')),
      consent: getString(formData, 'consent'),
      utmSource: optionalString(getString(formData, 'utmSource')),
      utmMedium: optionalString(getString(formData, 'utmMedium')),
      utmCampaign: optionalString(getString(formData, 'utmCampaign'))
    });
    const topicLabel = contactTopicLabels[parsed.topic];

    const city = await assertActiveCity(parsed.cityId);
    await assertPublicApplicationSubmissionAllowed(ApplicationType.CONTACT_MESSAGE);
    await createPublicApplication({
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
      payload: {
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
      }
    });

    result = { type: 'success', message: 'Сообщение отправлено. Если понадобится, мы свяжемся с вами.' };
  } catch (error) {
    result = { type: 'error', message: resolvePublicApplicationActionError('public:contact-message', error) };
  }

  redirectWithContactsResult(result);
}
