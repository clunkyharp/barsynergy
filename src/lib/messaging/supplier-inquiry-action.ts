'use server';

import { after } from 'next/dist/server/after';
import { redirect } from 'next/navigation';
import { ApplicationNotificationChannel, ApplicationType, ContentStatus, ConversationSender, UserRole } from '@prisma/client';
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
import {
  dispatchMessageNotificationQueue,
  queueMessageNotifications
} from '@/lib/messaging/notifications/message-notification-outbox';

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

type SupplierInquiryTarget = {
  id: string;
  title: string;
  slug: string;
  businessAccount: {
    id: string;
    owner: {
      email: string;
      profile: { fullName: string | null } | null;
    };
  } | null;
};

type ParsedSupplierInquiry = z.infer<typeof supplierInquirySchema>;

async function createSupplierInquiryConversation(input: {
  supplier: SupplierInquiryTarget;
  parsed: ParsedSupplierInquiry;
  currentUserId: string | null;
  isAuthenticatedUser: boolean;
}) {
  const application = await createPublicApplication({
    type: ApplicationType.SUPPLIER_INQUIRY,
    userId: input.isAuthenticatedUser ? input.currentUserId : null,
    subject: `Запрос поставщику: ${input.supplier.title}`,
    message: input.parsed.volumeDetails,
    name: input.parsed.contactName,
    email: nullableString(input.parsed.email),
    phone: nullableString(input.parsed.phone),
    telegram: nullableString(input.parsed.telegram),
    businessAccountId: input.supplier.businessAccount?.id ?? null,
    supplierId: input.supplier.id,
    consentText: PERSONAL_DATA_CONSENT_TEXT,
    payload: buildApplicationPayload(ApplicationType.SUPPLIER_INQUIRY, {
      supplierTitle: input.supplier.title,
      productCategory: input.parsed.productCategory,
      volumeDetails: input.parsed.volumeDetails,
      contactName: input.parsed.contactName,
      contactPhone: input.parsed.phone,
      contactEmail: input.parsed.email
    })
  });

  await prisma.$transaction(async (tx) => {
    await tx.conversationMessage.create({
      data: {
        applicationId: application.id,
        authorId: input.isAuthenticatedUser ? input.currentUserId : null,
        senderRole: ConversationSender.USER,
        body: input.parsed.volumeDetails
      }
    });

    await tx.application.update({
      where: { id: application.id },
      data: {
        hasUnreadForBusiness: Boolean(input.supplier.businessAccount),
        hasUnreadForUser: false,
        lastMessageAt: new Date()
      }
    });

    const owner = input.supplier.businessAccount?.owner;
    if (owner?.email) {
      await queueMessageNotifications(tx, [{
        channel: ApplicationNotificationChannel.BUSINESS_MESSAGE_EMAIL,
        payload: {
          applicationId: application.id,
          senderRole: ConversationSender.USER,
          recipientEmail: owner.email,
          recipientName: owner.profile?.fullName ?? null,
          senderName: input.parsed.contactName,
          contextLabel: input.supplier.title,
          threadUrl: `/business/cabinet/responses/${application.id}`
        }
      }]);
    }
  });

  after(() => {
    dispatchMessageNotificationQueue({ applicationId: application.id });
  });

  return application;
}

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
      select: {
        id: true,
        title: true,
        slug: true,
        businessAccount: {
          select: {
            id: true,
            owner: {
              select: {
                email: true,
                profile: { select: { fullName: true } }
              }
            }
          }
        }
      }
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

    const application = await createSupplierInquiryConversation({
      supplier,
      parsed,
      currentUserId: currentUser?.id ?? null,
      isAuthenticatedUser
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
      select: {
        id: true,
        title: true,
        slug: true,
        businessAccount: {
          select: {
            id: true,
            owner: {
              select: {
                email: true,
                profile: { select: { fullName: true } }
              }
            }
          }
        }
      }
    });

    if (!supplier) {
      return { type: 'error', message: 'Поставщик не найден или больше не публикуется.' };
    }

    await assertPublicApplicationSubmissionAllowed(ApplicationType.SUPPLIER_INQUIRY);

    const currentUser = await getCurrentUser();
    const isAuthenticatedUser = currentUser?.role === UserRole.USER;

    const application = await createSupplierInquiryConversation({
      supplier,
      parsed,
      currentUserId: currentUser?.id ?? null,
      isAuthenticatedUser
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
