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
  getString,
  resolvePublicApplicationActionError,
  type PublicApplicationResult
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
import { isRedirectError } from '@/lib/actions/server-action-errors';

const PROTECTED_INQUIRY_PATH = '/profile/inquiries';

function supplierSuccessPath(slug: string) {
  return `/suppliers/${slug}?applicationSuccess=${encodeURIComponent('Запрос отправлен. Команда BARSYNERGY передаст его поставщику.')}`;
}

function supplierErrorPath(slug: string, error: string) {
  return `/suppliers/${slug}?applicationError=${encodeURIComponent(error)}`;
}

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
  let supplierSlug = optionalString(getString(formData, 'supplierSlug'));

  try {
    await assertSameOriginServerAction();
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      if (supplierSlug) {
        redirect(supplierSuccessPath(supplierSlug));
      }
      redirect(`${PROTECTED_INQUIRY_PATH}?applicationSuccess=${encodeURIComponent('Запрос отправлен.')}`);
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
      select: { id: true, title: true, slug: true }
    });

    if (!supplier) {
      if (supplierSlug) {
        redirect(supplierErrorPath(supplierSlug, 'Поставщик не найден или больше не публикуется.'));
      }
      redirect(`${PROTECTED_INQUIRY_PATH}?error=${encodeURIComponent('Поставщик не найден.')}`);
    }

    supplierSlug = supplier.slug;

    await assertPublicApplicationSubmissionAllowed(ApplicationType.SUPPLIER_INQUIRY);

    const currentUser = await getCurrentUser();
    const isAuthenticatedUser = currentUser?.role === UserRole.USER;

    const application = await createPublicApplication({
      type: ApplicationType.SUPPLIER_INQUIRY,
      userId: isAuthenticatedUser ? currentUser.id : null,
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
        authorId: isAuthenticatedUser ? currentUser.id : null,
        senderRole: ConversationSender.USER,
        body: parsed.volumeDetails
      }
    });

    if (isAuthenticatedUser) {
      redirect(`${PROTECTED_INQUIRY_PATH}/${application.id}?success=supplier-inquiry`);
    }

    redirect(supplierSuccessPath(supplier.slug));
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error('[submit-supplier-inquiry]', error);
    if (supplierSlug) {
      redirect(supplierErrorPath(supplierSlug, 'Не удалось отправить запрос. Попробуйте позже.'));
    }
    redirect(`${PROTECTED_INQUIRY_PATH}?error=${encodeURIComponent('Не удалось отправить запрос.')}`);
  }
}

export async function submitSupplierInquiryFormAction(
  _prevState: PublicApplicationResult | null,
  formData: FormData
): Promise<PublicApplicationResult | null> {
  try {
    await assertSameOriginServerAction();
    assertPublicApplicationFormsEnabled();

    if (hasHoneypotValue(getString(formData, 'website'))) {
      return { type: 'success', message: 'Запрос отправлен.' };
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
      select: { id: true, title: true, slug: true }
    });

    if (!supplier) {
      return { type: 'error', message: 'Поставщик не найден или больше не публикуется.' };
    }

    await assertPublicApplicationSubmissionAllowed(ApplicationType.SUPPLIER_INQUIRY);

    const currentUser = await getCurrentUser();
    const isAuthenticatedUser = currentUser?.role === UserRole.USER;

    const application = await createPublicApplication({
      type: ApplicationType.SUPPLIER_INQUIRY,
      userId: isAuthenticatedUser ? currentUser.id : null,
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
        authorId: isAuthenticatedUser ? currentUser.id : null,
        senderRole: ConversationSender.USER,
        body: parsed.volumeDetails
      }
    });

    if (isAuthenticatedUser) {
      redirect(`${PROTECTED_INQUIRY_PATH}/${application.id}?success=supplier-inquiry`);
    }

    return { type: 'success', message: 'Запрос отправлен. Команда BARSYNERGY передаст его поставщику.' };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    console.error('[submit-supplier-inquiry-form]', error);
    return { type: 'error', message: resolvePublicApplicationActionError('[submit-supplier-inquiry-form]', error) };
  }
}
