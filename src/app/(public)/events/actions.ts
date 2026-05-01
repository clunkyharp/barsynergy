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

const EVENTS_PATH = '/events';

const eventApplicationSchema = baseContactSchema
  .merge(utmSchema)
  .extend({
    name: z.string().trim().min(2).max(160),
    cityId: z.string().trim().max(120).optional(),
    eventTitle: z.string().trim().min(2).max(180),
    message: z.string().trim().min(10).max(3000),
    consent: z.literal('accepted')
  })
  .refine((data) => data.email || data.phone || data.telegram, { message: 'contact is required' });

function redirectWithEventsResult(result: { type: 'success' | 'error'; message: string }): never {
  redirect(getPublicApplicationResultPath(EVENTS_PATH, result));
}

export async function submitEventApplication(formData: FormData) {
  let result: { type: 'success' | 'error'; message: string };

  try {
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      result = { type: 'success', message: 'Заявку на событие получили.' };
      redirectWithEventsResult(result);
    }

    const parsed = eventApplicationSchema.parse({
      name: getString(formData, 'name'),
      email: optionalString(getString(formData, 'email')),
      phone: optionalString(getString(formData, 'phone')),
      telegram: optionalString(getString(formData, 'telegram')),
      cityId: optionalString(getString(formData, 'cityId')),
      eventTitle: getString(formData, 'eventTitle'),
      message: getString(formData, 'message'),
      consent: getString(formData, 'consent'),
      utmSource: optionalString(getString(formData, 'utmSource')),
      utmMedium: optionalString(getString(formData, 'utmMedium')),
      utmCampaign: optionalString(getString(formData, 'utmCampaign'))
    });

    const city = await assertActiveCity(parsed.cityId);
    await assertPublicApplicationSubmissionAllowed(ApplicationType.EVENT_APPLICATION);
    await createPublicApplication({
      type: ApplicationType.EVENT_APPLICATION,
      subject: `Событие: ${parsed.eventTitle}`,
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
        eventTitle: parsed.eventTitle
      }
    });

    result = { type: 'success', message: 'Заявку на событие получили.' };
  } catch (error) {
    result = { type: 'error', message: resolvePublicApplicationActionError('public:event-application', error) };
  }

  redirectWithEventsResult(result);
}
