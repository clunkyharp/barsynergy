'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { ApplicationStatus, ApplicationType, BusinessAccountStatus, UserRole, UserStatus } from '@prisma/client';
import { z } from 'zod';
import { getApplicationStatusUpdate } from '@/lib/admin/application-transitions';
import {
  applicationStatusValues,
  formatApplicationActionError
} from '@/lib/admin/application-utils';
import {
  appendApplicationInternalNote,
  getVacancyDraftFieldsFromApplication
} from '@/lib/admin/vacancy-application-drafts';
import {
  buildBusinessAccessActivationUrl,
  BUSINESS_ACCESS_PREVIEW_COOKIE_NAME,
  createBusinessAccessInviteToken,
  getBusinessAccessInviteExpiresAt,
  getBusinessAccessPreviewCookieOptions,
  hashBusinessAccessInviteToken,
  parseBusinessAccessRequestPayload
} from '@/lib/auth/business-access';
import { hashPassword } from '@/lib/auth/password';
import {
  getString,
  optionalString,
  persistWithUniqueSlugRetry,
  redirectWithAdminActionResult,
  safeAdminRedirectPath,
  slugify
} from '@/lib/admin/content-utils';
import { requireAdminSectionAccess } from '@/lib/auth/require-admin-section';
import { canPrepareBusinessAccess } from '@/lib/auth/permissions';
import { prisma } from '@/lib/db/prisma';

const ADMIN_APPLICATIONS_PATH = '/admin/applications';

const statusFormSchema = z.object({
  applicationId: z.string().trim().min(1),
  status: z.enum(applicationStatusValues)
});

const notesFormSchema = z.object({
  applicationId: z.string().trim().min(1),
  internalNotes: z.string().trim().max(4000).optional()
});

const businessNotesFormSchema = z.object({
  applicationId: z.string().trim().min(1),
  businessNotes: z.string().trim().max(2000).optional()
});

const processingFormSchema = z.object({
  applicationId: z.string().trim().min(1),
  status: z.enum(applicationStatusValues),
  businessNotes: z.string().trim().max(2000).optional(),
  internalNotes: z.string().trim().max(4000).optional()
});

const vacancyDraftFormSchema = z.object({
  applicationId: z.string().trim().min(1)
});

const BUSINESS_ACCESS_ADMIN_REQUIRED_ERROR = 'business access requires admin';

const prepareBusinessAccessFormSchema = z.object({
  applicationId: z.string().trim().min(1)
});

function applicationDetailPath(applicationId: string) {
  return `${ADMIN_APPLICATIONS_PATH}/${applicationId}`;
}

export async function updateApplicationStatus(formData: FormData) {
  const fallbackPath = applicationDetailPath(getString(formData, 'applicationId'));
  const redirectTo = safeAdminRedirectPath(formData, fallbackPath);
  let result: { type: 'success' | 'error'; message: string };

  try {
    const user = await requireAdminSectionAccess('applications');
    const parsed = statusFormSchema.parse({
      applicationId: getString(formData, 'applicationId'),
      status: getString(formData, 'status')
    });
    const application = await prisma.application.findUniqueOrThrow({
      where: { id: parsed.applicationId },
      select: {
        type: true,
        status: true,
        vacancyId: true,
        consentAcceptedAt: true
      }
    });

    await prisma.application.update({
      where: { id: parsed.applicationId },
      data: getApplicationStatusUpdate({
        application,
        nextStatus: parsed.status,
        userId: user.id
      })
    });

    revalidatePath(ADMIN_APPLICATIONS_PATH);
    revalidatePath(applicationDetailPath(parsed.applicationId));
    result = { type: 'success', message: 'Статус заявки обновлен.' };
  } catch (error) {
    result = { type: 'error', message: formatApplicationActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updateApplicationInternalNotes(formData: FormData) {
  const fallbackPath = applicationDetailPath(getString(formData, 'applicationId'));
  const redirectTo = safeAdminRedirectPath(formData, fallbackPath);
  let result: { type: 'success' | 'error'; message: string };

  try {
    const parsed = notesFormSchema.parse({
      applicationId: getString(formData, 'applicationId'),
      internalNotes: optionalString(getString(formData, 'internalNotes'))
    });

    await requireAdminSectionAccess('applications');
    await prisma.application.update({
      where: { id: parsed.applicationId },
      data: {
        internalNotes: parsed.internalNotes ?? null
      }
    });

    revalidatePath(ADMIN_APPLICATIONS_PATH);
    revalidatePath(applicationDetailPath(parsed.applicationId));
    result = { type: 'success', message: 'Внутренняя заметка сохранена.' };
  } catch (error) {
    result = { type: 'error', message: formatApplicationActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updateApplicationBusinessNotes(formData: FormData) {
  const fallbackPath = applicationDetailPath(getString(formData, 'applicationId'));
  const redirectTo = safeAdminRedirectPath(formData, fallbackPath);
  let result: { type: 'success' | 'error'; message: string };

  try {
    const parsed = businessNotesFormSchema.parse({
      applicationId: getString(formData, 'applicationId'),
      businessNotes: optionalString(getString(formData, 'businessNotes'))
    });

    await requireAdminSectionAccess('applications');
    await prisma.application.update({
      where: { id: parsed.applicationId },
      data: {
        businessNotes: parsed.businessNotes ?? null
      }
    });

    revalidatePath(ADMIN_APPLICATIONS_PATH);
    revalidatePath(applicationDetailPath(parsed.applicationId));
    revalidatePath('/business');
    revalidatePath('/business/requests');
    result = { type: 'success', message: 'Комментарий для бизнеса сохранен.' };
  } catch (error) {
    result = { type: 'error', message: formatApplicationActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function updateApplicationProcessing(formData: FormData) {
  const fallbackPath = applicationDetailPath(getString(formData, 'applicationId'));
  const redirectTo = safeAdminRedirectPath(formData, fallbackPath);
  let result: { type: 'success' | 'error'; message: string };

  try {
    const user = await requireAdminSectionAccess('applications');
    const parsed = processingFormSchema.parse({
      applicationId: getString(formData, 'applicationId'),
      status: getString(formData, 'status'),
      businessNotes: optionalString(getString(formData, 'businessNotes')),
      internalNotes: optionalString(getString(formData, 'internalNotes'))
    });
    const application = await prisma.application.findUniqueOrThrow({
      where: { id: parsed.applicationId },
      select: {
        type: true,
        status: true,
        vacancyId: true,
        consentAcceptedAt: true
      }
    });

    await prisma.application.update({
      where: { id: parsed.applicationId },
      data: {
        ...getApplicationStatusUpdate({
          application,
          nextStatus: parsed.status,
          userId: user.id
        }),
        businessNotes: parsed.businessNotes ?? null,
        internalNotes: parsed.internalNotes ?? null
      }
    });

    revalidatePath(ADMIN_APPLICATIONS_PATH);
    revalidatePath(applicationDetailPath(parsed.applicationId));
    revalidatePath('/business');
    revalidatePath('/business/requests');
    result = { type: 'success', message: 'Обработка заявки сохранена.' };
  } catch (error) {
    result = { type: 'error', message: formatApplicationActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function createVacancyDraftFromApplication(formData: FormData) {
  const fallbackPath = applicationDetailPath(getString(formData, 'applicationId'));
  const redirectTo = safeAdminRedirectPath(formData, fallbackPath);
  let result: { type: 'success' | 'error'; message: string };

  try {
    const user = await requireAdminSectionAccess('applications');
    const parsed = vacancyDraftFormSchema.parse({
      applicationId: getString(formData, 'applicationId')
    });
    await prisma.$transaction(async (tx) => {
      const application = await tx.application.findUniqueOrThrow({
        where: { id: parsed.applicationId },
        select: {
          type: true,
          vacancyId: true,
          cityId: true,
          message: true,
          name: true,
          email: true,
          phone: true,
          telegram: true,
          consentAcceptedAt: true,
          payload: true,
          internalNotes: true
        }
      });
      const draftFields = getVacancyDraftFieldsFromApplication(application);
      const slug = slugify(`${draftFields.position}-${draftFields.companyName}`);

      if (!slug) {
        throw new Error('vacancy draft requires slug');
      }

      const vacancy = await persistWithUniqueSlugRetry({
        baseSlug: slug,
        exists: async (candidate) =>
          Boolean(
            await tx.vacancy.findFirst({
              where: { slug: candidate },
              select: { id: true }
            })
          ),
        persist: (uniqueSlug) =>
          tx.vacancy.create({
            data: {
              ...draftFields,
              slug: uniqueSlug,
              createdById: user.id,
              updatedById: user.id
            },
            select: { id: true, title: true, slug: true }
          })
      });

      await tx.application.update({
        where: { id: parsed.applicationId },
        data: {
          vacancyId: vacancy.id,
          status: ApplicationStatus.APPROVED,
          internalNotes: appendApplicationInternalNote(
            application.internalNotes,
            `Создан черновик вакансии: ${vacancy.title} (${vacancy.slug}).`
          )
        }
      });
    });

    revalidatePath(ADMIN_APPLICATIONS_PATH);
    revalidatePath(applicationDetailPath(parsed.applicationId));
    revalidatePath('/admin/vacancies');
    result = { type: 'success', message: 'Черновик вакансии создан и связан с заявкой.' };
  } catch (error) {
    result = { type: 'error', message: formatApplicationActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}

export async function prepareBusinessAccessAction(formData: FormData) {
  const fallbackPath = applicationDetailPath(getString(formData, 'applicationId'));
  const redirectTo = safeAdminRedirectPath(formData, fallbackPath);
  let result: { type: 'success' | 'error'; message: string };

  try {
    const user = await requireAdminSectionAccess('applications');

    if (!canPrepareBusinessAccess(user.role)) {
      throw new Error(BUSINESS_ACCESS_ADMIN_REQUIRED_ERROR);
    }

    const parsed = prepareBusinessAccessFormSchema.parse({
      applicationId: getString(formData, 'applicationId')
    });

    const invite = await prisma.$transaction(async (tx) => {
      const application = await tx.application.findUniqueOrThrow({
        where: { id: parsed.applicationId },
        select: {
          id: true,
          type: true,
          status: true,
          name: true,
          email: true,
          phone: true,
          telegram: true,
          cityId: true,
          payload: true,
          internalNotes: true,
          businessAccountId: true,
          businessAccount: {
            select: {
              id: true,
              companyName: true,
              status: true,
              owner: {
                select: {
                  id: true,
                  email: true,
                  status: true,
                  role: true,
                  businessAccount: {
                    select: {
                      id: true,
                      companyName: true,
                      status: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (application.type !== ApplicationType.BUSINESS_ACCOUNT_REQUEST) {
        throw new Error('business access request is invalid');
      }

      if (!application.email) {
        throw new Error('business access email is missing');
      }

      const requestProfile = parseBusinessAccessRequestPayload(application.payload, application.name);
      const linkedOwner = application.businessAccount?.owner;
      const existingUser =
        linkedOwner ??
        (await tx.user.findUnique({
          where: { email: application.email },
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            businessAccount: {
              select: {
                id: true,
                status: true
              }
            }
          }
        }));

      if (existingUser && existingUser.role !== UserRole.BUSINESS) {
        throw new Error('business access role conflict');
      }

      if (
        existingUser?.status === UserStatus.ACTIVE &&
        existingUser.businessAccount?.status === BusinessAccountStatus.ACTIVE
      ) {
        throw new Error('business access already active');
      }

      if (
        existingUser?.status === UserStatus.BLOCKED ||
        existingUser?.businessAccount?.status === BusinessAccountStatus.BLOCKED
      ) {
        throw new Error('business access is blocked');
      }

      const user =
        existingUser ??
        (await tx.user.create({
          data: {
            email: application.email,
            passwordHash: await hashPassword(createBusinessAccessInviteToken()),
            role: UserRole.BUSINESS,
            status: UserStatus.PENDING
          },
          select: {
            id: true,
            email: true,
            role: true,
            status: true
          }
        }));

      if (existingUser && (existingUser.status !== UserStatus.PENDING || existingUser.role !== UserRole.BUSINESS)) {
        await tx.user.update({
          where: { id: existingUser.id },
          data: { role: UserRole.BUSINESS, status: UserStatus.PENDING }
        });
      }

      const businessAccount =
        application.businessAccount ??
        existingUser?.businessAccount ??
        (await persistWithUniqueSlugRetry({
          baseSlug: slugify(requestProfile.companyName) || 'business',
          exists: async (candidate) =>
            Boolean(
              await tx.businessAccount.findFirst({
                where: { slug: candidate },
                select: { id: true }
              })
            ),
          persist: (uniqueSlug) =>
            tx.businessAccount.create({
              data: {
                ownerId: user.id,
                companyName: requestProfile.companyName,
                slug: uniqueSlug,
                status: BusinessAccountStatus.PENDING,
                cityId: application.cityId,
                contactPerson: requestProfile.contactPerson,
                phone: application.phone,
                telegram: application.telegram,
                websiteUrl: requestProfile.websiteUrl,
                description: requestProfile.description
              },
              select: {
                id: true,
                companyName: true,
                status: true
              }
            })
        }));

      if (businessAccount.status === BusinessAccountStatus.ACTIVE && user.status === UserStatus.ACTIVE) {
        throw new Error('business access already active');
      }

      await tx.businessAccount.update({
        where: { id: businessAccount.id },
        data: {
          companyName: requestProfile.companyName,
          status: BusinessAccountStatus.PENDING,
          cityId: application.cityId,
          contactPerson: requestProfile.contactPerson,
          phone: application.phone,
          telegram: application.telegram,
          websiteUrl: requestProfile.websiteUrl,
          description: requestProfile.description
        }
      });

      const rawToken = createBusinessAccessInviteToken();
      const expiresAt = getBusinessAccessInviteExpiresAt();

      await tx.businessAccessInvite.deleteMany({
        where: {
          applicationId: application.id,
          usedAt: null
        }
      });

      await tx.businessAccessInvite.create({
        data: {
          userId: user.id,
          applicationId: application.id,
          tokenHash: hashBusinessAccessInviteToken(rawToken),
          expiresAt
        }
      });

      await tx.application.update({
        where: { id: application.id },
        data: {
          status: ApplicationStatus.APPROVED,
          businessAccountId: businessAccount.id,
          internalNotes: appendApplicationInternalNote(
            application.internalNotes,
            `Подготовлена ссылка активации доступа до ${expiresAt.toISOString()}.`
          )
        }
      });

      return {
        applicationId: application.id,
        activationUrl: buildBusinessAccessActivationUrl(rawToken),
        companyName: requestProfile.companyName,
        email: user.email,
        expiresAt: expiresAt.toISOString()
      };
    });

    const cookieStore = await cookies();
    cookieStore.set(
      BUSINESS_ACCESS_PREVIEW_COOKIE_NAME,
      JSON.stringify(invite),
      getBusinessAccessPreviewCookieOptions()
    );

    revalidatePath(ADMIN_APPLICATIONS_PATH);
    revalidatePath(applicationDetailPath(parsed.applicationId));
    revalidatePath('/admin/users');
    result = {
      type: 'success',
      message: 'Ссылка активации подготовлена. Покажите её владельцу бизнеса безопасным каналом.'
    };
  } catch (error) {
    result =
      error instanceof Error && error.message === BUSINESS_ACCESS_ADMIN_REQUIRED_ERROR
        ? { type: 'error', message: 'Недостаточно прав для подготовки бизнес-доступа.' }
        : { type: 'error', message: formatApplicationActionError(error) };
  }

  redirectWithAdminActionResult(redirectTo, result);
}
