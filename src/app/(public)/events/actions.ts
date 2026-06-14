'use server';

import { ApplicationType } from '@prisma/client';
import { z } from 'zod';
import { buildApplicationPayload } from '@/lib/applications/application-payloads';
import {
  assertActiveCity,
  baseContactSchema,
  formatPublicApplicationActionError,
  getString,
  nullableString,
  optionalString,
  PERSONAL_DATA_CONSENT_TEXT,
  type PublicApplicationResult,
  utmSchema
} from '@/lib/applications/public-form-helpers';
import { submitPublicApplicationAction } from '@/lib/applications/submit-public-application-action';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { assertPublicApplicationFormsEnabled, assertPublicApplicationSubmissionAllowed, hasHoneypotValue } from '@/lib/applications/public-submission-guards';
import { assertTurnstilePassed } from '@/lib/security/turnstile';
import { createPublicApplication } from '@/lib/applications/create-public-application';

type EventLeadActionResult = { type: 'success'; message: string } | { type: 'error'; message: string } | null;

const eventLeadSchema = z.object({
  companyName: z.string().trim().min(2, 'Укажите название компании или имя').max(180),
  city: z.string().trim().max(120).optional(),
  eventTitle: z.string().trim().min(2, 'Укажите название события').max(180),
  contact: z.string().trim().min(2, 'Укажите контакт для связи').max(200),
  comment: z.string().trim().max(4000).optional(),
  consent: z.literal('accepted')
});

export async function submitEventLead(
  _prevState: EventLeadActionResult,
  formData: FormData
): Promise<EventLeadActionResult> {
  try {
    await assertSameOriginServerAction();
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      return { type: 'success', message: 'Заявка на событие отправлена. Команда BARSYNERGY свяжется с вами.' };
    }

    const turnstileToken = getString(formData, 'turnstileToken');
    if (turnstileToken) {
      await assertTurnstilePassed(turnstileToken);
    }
    await assertPublicApplicationSubmissionAllowed(ApplicationType.EVENT_APPLICATION);

    const parsed = eventLeadSchema.parse({
      companyName: getString(formData, 'companyName'),
      city: optionalString(getString(formData, 'city')),
      eventTitle: getString(formData, 'eventTitle'),
      contact: getString(formData, 'contact'),
      comment: optionalString(getString(formData, 'comment')),
      consent: getString(formData, 'consent')
    });

    const cityPart = parsed.city ? ` (${parsed.city})` : '';
    const subject = `Событие: ${parsed.eventTitle}${cityPart} — ${parsed.companyName}`;
    const message = [
      `Компания: ${parsed.companyName}`,
      parsed.city ? `Город: ${parsed.city}` : null,
      `Событие: ${parsed.eventTitle}`,
      `Контакт: ${parsed.contact}`,
      parsed.comment ? `Комментарий: ${parsed.comment}` : null
    ]
      .filter(Boolean)
      .join('\n');

    await createPublicApplication({
      type: ApplicationType.EVENT_APPLICATION,
      subject,
      message,
      name: parsed.companyName,
      consentText: PERSONAL_DATA_CONSENT_TEXT
    });

    return {
      type: 'success',
      message: 'Заявка на событие отправлена. Команда BARSYNERGY свяжется с вами.'
    };
  } catch (error) {
    if (error instanceof Error) {
      return { type: 'error', message: formatPublicApplicationActionError(error) };
    }
    return { type: 'error', message: 'Не удалось отправить заявку. Попробуйте ещё раз.' };
  }
}

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

export async function submitEventApplication(_prevState: PublicApplicationResult | null, formData: FormData): Promise<PublicApplicationResult> {
  return submitPublicApplicationAction({
    actionName: 'public:event-application',
    applicationType: ApplicationType.EVENT_APPLICATION,
    formData,
    successMessage: 'Заявку на событие получили.',
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
