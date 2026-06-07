'use server';

import { redirect } from 'next/navigation';
import { ApplicationType, ContentStatus, ConversationSender, UserRole } from '@prisma/client';
import { z } from 'zod';
import { buildApplicationPayload } from '@/lib/applications/application-payloads';
import { createPublicApplication } from '@/lib/applications/create-public-application';
import {
  baseContactSchema,
  nullableString,
  optionalString,
  PERSONAL_DATA_CONSENT_TEXT,
  getString
} from '@/lib/applications/public-form-helpers';
import {
  assertPublicApplicationFormsEnabled,
  assertPublicApplicationSubmissionAllowed,
  hasHoneypotValue
} from '@/lib/applications/public-submission-guards';
import { prisma } from '@/lib/db/prisma';
import { assertSameOriginServerAction } from '@/lib/security/server-action-origin';
import { assertTurnstilePassed } from '@/lib/security/turnstile';
import { getCurrentUser } from '@/lib/auth/current-user';

const INQUIRY_REDIRECT = '/profile/inquiries';

const supplierInquirySchema = baseContactSchema
  .extend({
    supplierId: z.string().trim().min(1),
    productCategory: z.string().trim().min(2).max(200),
    volumeDetails: z.string().trim().min(10).max(2000),
    contactName: z.string().trim().min(2).max(160),
    consent: z.literal('accepted')
  })
  .refine((data) => data.email || data.phone || data.telegram, { message: 'contact is required' });

export async function submitSupplierInquiryAction(formData: FormData) {
  try {
    await assertSameOriginServerAction();
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      redirect(`${INQUIRY_REDIRECT}?success=supplier-inquiry`);
    }

    await assertTurnstilePassed(getString(formData, 'turnstileToken'));

    const parsed = supplierInquirySchema.parse({
      supplierId: getString(formData, 'supplierId'),
      productCategory: getString(formData, 'productCategory'),
      volumeDetails: getString(formData, 'volumeDetails'),
      contactName: getString(formData, 'contactName'),
      email: optionalString(getString(formData, 'email')),
      phone: optionalString(getString(formData, 'phone')),
      telegram: optionalString(getString(formData, 'telegram')),
      consent: getString(formData, 'consent')
    });

    const supplier = await prisma.supplier.findFirst({
      where: { id: parsed.supplierId, status: ContentStatus.PUBLISHED },
      select: { id: true, title: true }
    });

    if (!supplier) {
      redirect(`${INQUIRY_REDIRECT}?error=supplier-inquiry-invalid`);
    }

    await assertPublicApplicationSubmissionAllowed(ApplicationType.SUPPLIER_INQUIRY);

    const currentUser = await getCurrentUser();

    const application = await createPublicApplication({
      type: ApplicationType.SUPPLIER_INQUIRY,
      userId: currentUser?.role === UserRole.USER ? currentUser.id : null,
      subject: `Запрос поставщику: ${supplier.title}`,
      message: parsed.volumeDetails,
      name: parsed.contactName,
      email: nullableString(parsed.email),
      phone: nullableString(parsed.phone),
      telegram: nullableString(parsed.telegram),
      supplierId: supplier.id,
      consentText: PERSONAL_DATA_CONSENT_TEXT,
      payload: buildApplicationPayload(ApplicationType.SUPPLIER_INQUIRY, {
        supplierTitle: supplier.title,
        productCategory: parsed.productCategory,
        volumeDetails: parsed.volumeDetails,
        contactName: parsed.contactName,
        contactPhone: parsed.phone,
        contactEmail: parsed.email
      })
    });

    await prisma.conversationMessage.create({
      data: {
        applicationId: application.id,
        authorId: currentUser?.role === UserRole.USER ? currentUser.id : null,
        senderRole: ConversationSender.USER,
        body: parsed.volumeDetails
      }
    });

    redirect(`${INQUIRY_REDIRECT}/${application.id}?success=supplier-inquiry`);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('NEXT_REDIRECT')) throw error;
    console.error('[submit-supplier-inquiry]', error);
    redirect(`${INQUIRY_REDIRECT}?error=supplier-inquiry-failed`);
  }
}
