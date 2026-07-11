import { ApplicationStatus, ApplicationType, ConversationSender } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import type { ConversationStatusGroup } from '@/lib/messaging/conversation-status-groups';
import { getConversationStatusFilter } from '@/lib/messaging/conversation-status-groups';
import { getActiveCityOptions } from '@/lib/shared/city-options';

export { ApplicationStatus, ApplicationType, ConversationSender };

export async function getActiveRequestCount(businessAccountId: string) {
  return prisma.application.count({
    where: {
      businessAccountId,
      status: {
        notIn: [ApplicationStatus.DRAFT, ApplicationStatus.COMPLETED, ApplicationStatus.REJECTED, ApplicationStatus.ARCHIVED]
      }
    }
  });
}

export async function getActiveCities() {
  return getActiveCityOptions();
}

export type CitySelect = Awaited<ReturnType<typeof getActiveCities>>[number];

export async function getBusinessDashboardData(businessAccountId: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [cities, requestCount, activeRequestCount, draftRequestCount, closedRequestCount, latestApplications, responseCount, newResponseCount] = await Promise.all([
    getActiveCities(),
    prisma.application.count({ where: { businessAccountId } }),
    prisma.application.count({
      where: {
        businessAccountId,
        status: { notIn: [ApplicationStatus.DRAFT, ApplicationStatus.ARCHIVED] }
      }
    }),
    prisma.application.count({
      where: { businessAccountId, status: ApplicationStatus.DRAFT }
    }),
    prisma.application.count({
      where: {
        businessAccountId,
        status: { in: [ApplicationStatus.COMPLETED, ApplicationStatus.REJECTED, ApplicationStatus.ARCHIVED] }
      }
    }),
    prisma.application.findMany({
      where: { businessAccountId },
      orderBy: [{ updatedAt: 'desc' }],
      take: 5,
      select: { id: true, type: true, subject: true, status: true, businessNotes: true, createdAt: true, updatedAt: true }
    }),
    prisma.application.count({
      where: {
        type: ApplicationType.VACANCY_RESPONSE,
        status: { notIn: [ApplicationStatus.DRAFT, ApplicationStatus.ARCHIVED] },
        vacancy: { businessAccountId }
      }
    }),
    prisma.application.count({
      where: {
        type: ApplicationType.VACANCY_RESPONSE,
        status: { notIn: [ApplicationStatus.DRAFT, ApplicationStatus.ARCHIVED] },
        vacancy: { businessAccountId },
        createdAt: { gte: sevenDaysAgo }
      }
    })
  ]);

  return { cities, requestCount, activeRequestCount, draftRequestCount, closedRequestCount, latestApplications, responseCount, newResponseCount };
}

export async function getBusinessResponses(businessAccountId: string, statusGroup: ConversationStatusGroup) {
  return prisma.application.findMany({
    where: {
      status: getConversationStatusFilter(statusGroup),
      OR: [
        {
          type: ApplicationType.VACANCY_RESPONSE,
          vacancy: { businessAccountId }
        },
        {
          type: ApplicationType.SUPPLIER_INQUIRY,
          businessAccountId
        }
      ]
    },
    select: {
      id: true,
      type: true,
      status: true,
      createdAt: true,
      subject: true,
      name: true,
      message: true,
      vacancy: { select: { title: true, slug: true } },
      supplier: { select: { title: true, slug: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getBusinessResponseDetail(applicationId: string, businessAccountId: string) {
  return prisma.application.findFirst({
    where: {
      id: applicationId,
      status: { notIn: [ApplicationStatus.DRAFT, ApplicationStatus.ARCHIVED] },
      OR: [
        {
          type: ApplicationType.VACANCY_RESPONSE,
          vacancy: { businessAccountId }
        },
        {
          type: ApplicationType.SUPPLIER_INQUIRY,
          businessAccountId
        }
      ]
    },
    select: {
      id: true,
      status: true,
      type: true,
      createdAt: true,
      subject: true,
      name: true,
      email: true,
      phone: true,
      telegram: true,
      message: true,
      city: { select: { name: true } },
      vacancy: {
        select: { id: true, title: true, slug: true, companyName: true }
      },
      supplier: {
        select: { id: true, title: true, slug: true, companyName: true }
      }
    }
  });
}

export async function getBusinessRequestsPage(
  businessAccountId: string,
  statusGroup: ConversationStatusGroup,
  skip: number,
  take: number
) {
  const where = {
    businessAccountId,
    status: getConversationStatusFilter(statusGroup, { includeDraft: true })
  };
  const [cities, totalCount, applications] = await Promise.all([
    getActiveCities(),
    prisma.application.count({ where }),
    prisma.application.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      skip,
      take,
      select: {
        id: true,
        type: true,
        status: true,
        subject: true,
        businessNotes: true,
        createdAt: true
      }
    })
  ]);

  return { cities, totalCount, applications };
}

export async function getBusinessMastersPage(businessAccountId: string) {
  const [cities, masters] = await Promise.all([
    getActiveCities(),
    prisma.master.findMany({
      where: { businessAccountId },
      orderBy: [{ updatedAt: 'desc' }],
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        summary: true,
        city: { select: { name: true } },
        isVerified: true,
        entityType: true,
        publishedAt: true,
        updatedAt: true
      }
    })
  ]);

  return { cities, masters };
}

export type MasterFormData = Awaited<ReturnType<typeof getBusinessMasterById>>;

export async function getBusinessMasterById(masterId: string, businessAccountId: string) {
  return prisma.master.findFirst({
    where: { id: masterId, businessAccountId },
    select: {
      id: true,
      title: true,
      slug: true,
      summary: true,
      description: true,
      status: true,
      entityType: true,
      fullName: true,
      companyName: true,
      cityId: true,
      city: { select: { name: true } },
      specializations: true,
      experienceYears: true,
      rateLabel: true,
      contactLabel: true,
      contactTelegram: true,
      contactPhone: true,
      contactEmail: true,
      serviceArea: true,
      isVerified: true,
      publishedAt: true,
      updatedAt: true,
      createdAt: true
    }
  });
}

export async function getBusinessRequestDetail(businessAccountId: string, applicationId: string) {
  const [cities, application] = await Promise.all([
    getActiveCities(),
    prisma.application.findFirst({
      where: { id: applicationId, businessAccountId },
      include: { city: { select: { name: true } } }
    })
  ]);

  return { cities, application };
}
