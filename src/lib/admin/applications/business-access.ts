import { ApplicationStatus, ApplicationType, BusinessAccountStatus, UserRole, UserStatus } from '@prisma/client';
import { persistWithUniqueSlugRetry, slugify } from '@/lib/admin/content-utils';
import { appendApplicationInternalNote } from '@/lib/admin/vacancy-application-drafts';
import {
  buildBusinessAccessActivationUrl,
  createBusinessAccessInviteToken,
  getBusinessAccessInviteExpiresAt,
  hashBusinessAccessInviteToken,
  isBusinessAccessInvitePreparationStatusAllowed,
  parseBusinessAccessRequestPayload
} from '@/lib/auth/business-access';
import { hashPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/db/prisma';

export async function prepareBusinessAccessForApplication(applicationId: string) {
  return prisma.$transaction(async (tx) => {
    const application = await tx.application.findUniqueOrThrow({
      where: { id: applicationId },
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

    if (!isBusinessAccessInvitePreparationStatusAllowed(application.status)) {
      throw new Error('business access request is not eligible for activation');
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

    if (existingUser?.businessAccount?.status === BusinessAccountStatus.ARCHIVED) {
      throw new Error('business access is archived');
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
}
