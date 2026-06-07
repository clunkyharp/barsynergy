import { ApplicationStatus, ApplicationType, ConversationSender } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

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
  return prisma.city.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true }
  });
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
        vacancy: { businessAccountId }
      }
    }),
    prisma.application.count({
      where: {
        type: ApplicationType.VACANCY_RESPONSE,
        status: { not: ApplicationStatus.DRAFT },
        vacancy: { businessAccountId },
        createdAt: { gte: sevenDaysAgo }
      }
    })
  ]);

  return { cities, requestCount, activeRequestCount, draftRequestCount, closedRequestCount, latestApplications, responseCount, newResponseCount };
}

export async function getBusinessVacancySlugs(businessAccountId: string) {
  return prisma.vacancy.findMany({
    where: { businessAccountId },
    select: { id: true, title: true, slug: true }
  });
}

export async function getBusinessResponses(vacancyIds: string[]) {
  if (vacancyIds.length === 0) return [];
  return prisma.application.findMany({
    where: {
      vacancyId: { in: vacancyIds },
      type: ApplicationType.VACANCY_RESPONSE,
      status: { not: ApplicationStatus.DRAFT }
    },
    select: {
      id: true,
      status: true,
      createdAt: true,
      name: true,
      message: true,
      vacancy: { select: { title: true, slug: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getBusinessResponseDetail(applicationId: string, userId: string) {
  return prisma.application.findFirst({
    where: {
      id: applicationId,
      type: ApplicationType.VACANCY_RESPONSE,
      status: { not: ApplicationStatus.DRAFT },
      vacancy: { createdById: userId }
    },
    select: {
      id: true,
      status: true,
      type: true,
      createdAt: true,
      name: true,
      email: true,
      phone: true,
      telegram: true,
      message: true,
      city: { select: { name: true } },
      vacancy: {
        select: { id: true, title: true, slug: true, companyName: true }
      }
    }
  });
}

export async function getBusinessRequestsPage(businessAccountId: string, skip: number, take: number) {
  const [cities, totalCount, applications] = await Promise.all([
    getActiveCities(),
    prisma.application.count({ where: { businessAccountId } }),
    prisma.application.findMany({
      where: { businessAccountId },
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
