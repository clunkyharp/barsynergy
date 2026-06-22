'use server';

import { ApplicationType } from '@prisma/client';
import { z } from 'zod';
import { getString, optionalString } from '@/lib/forms/form-data';
import { submitPublicApplicationAction } from '@/lib/applications/submit-public-application-action';
import { buildApplicationPayload } from '@/lib/applications/application-payloads';

const formSchema = z.object({
  entityType: z.enum(['INDIVIDUAL', 'BUSINESS']),
  fullName: z.string().min(2).optional(),
  companyName: z.string().min(2).optional(),
  title: z.string().min(3).max(200),
  serviceArea: z.string().max(300).optional(),
  specializations: z.string().optional(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5).optional(),
  telegram: z.string().optional(),
  message: z.string().min(20).max(3000),
  consent: z.literal('accepted', { message: 'Необходимо согласие на обработку персональных данных' }),
  turnstileToken: z.string().optional(),
});

export async function submitMasterSubmissionAction(_prevState: unknown, formData: FormData) {
  return submitPublicApplicationAction({
    actionName: 'master-submission',
    applicationType: ApplicationType.MASTER_SUBMISSION,
    formData,
    parse: (data) => formSchema.parse({
      entityType: getString(data, 'entityType') || 'INDIVIDUAL',
      fullName: optionalString(getString(data, 'fullName')),
      companyName: optionalString(getString(data, 'companyName')),
      title: getString(data, 'title'),
      serviceArea: optionalString(getString(data, 'serviceArea')),
      specializations: optionalString(getString(data, 'specializations')),
      name: getString(data, 'name'),
      email: getString(data, 'email'),
      phone: optionalString(getString(data, 'phone')),
      telegram: optionalString(getString(data, 'telegram')),
      message: getString(data, 'message'),
      consent: data.get('consent'),
      turnstileToken: optionalString(getString(data, 'turnstileToken')),
    }),
    buildApplication: (parsed) => ({
      type: ApplicationType.MASTER_SUBMISSION,
      name: parsed.name,
      email: parsed.email,
      phone: parsed.phone ?? null,
      telegram: parsed.telegram ?? null,
      message: parsed.message,
      payload: buildApplicationPayload(ApplicationType.MASTER_SUBMISSION, {
        source: 'public_form',
        entityType: parsed.entityType,
        fullName: parsed.fullName ?? null,
        companyName: parsed.companyName ?? null,
        title: parsed.title,
        serviceArea: parsed.serviceArea ?? null,
        specializations: parsed.specializations
          ? parsed.specializations.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      }),
      consentText: 'Я согласен на обработку персональных данных',
    }),
    successMessage: 'Заявка отправлена. Мы свяжемся с вами после проверки.',
  });
}
