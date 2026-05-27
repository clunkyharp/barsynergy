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
  await submitPublicApplicationAction({
    actionName: 'public:event-application',
    applicationType: ApplicationType.EVENT_APPLICATION,
    formData,
    successMessage: 'Заявку на событие получили.',
    redirectWithResult: redirectWithEventsResult,
    parse: async (data) => {
      const parsed = eventApplicationSchema.parse({
        name: getString(data, 'name'),
        email: optionalString(getString(data, 'email')),
        phone: optionalString(getString(data, 'phone')),
        telegram: optionalString(getString(data, 'telegram')),
        cityId: optionalString(getString(data, 'cityId')),
        eventTitle: getString(data, 'eventTitle'),
        message: getString(data, 'message'),
        consent: getString(data, 'consent'),
        utmSource: optionalString(getString(data, 'utmSource')),
        utmMedium: optionalString(getString(data, 'utmMedium')),
        utmCampaign: optionalString(getString(data, 'utmCampaign'))
      });
      const city = await assertActiveCity(parsed.cityId);

      return { parsed, city };
    },
    buildApplication: ({ parsed, city }) => ({
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
      payload: buildApplicationPayload(ApplicationType.EVENT_APPLICATION, {
        eventTitle: parsed.eventTitle
      })
    })
  });
}
