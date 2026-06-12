import { UserRole, ContentStatus, EmploymentType, JobSearchStatus, ApplicationStatus, ApplicationType, ConversationSender, Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';

export { UserRole, ContentStatus, EmploymentType, JobSearchStatus, ApplicationStatus, ApplicationType, ConversationSender };

export const profileResponseType = ApplicationType.VACANCY_RESPONSE;

export const profileResponseStatusValues: readonly ApplicationStatus[] = [
  ApplicationStatus.NEW,
  ApplicationStatus.IN_REVIEW,
  ApplicationStatus.CONTACTED,
  ApplicationStatus.FORWARDED_TO_EMPLOYER,
  ApplicationStatus.APPROVED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.COMPLETED,
  ApplicationStatus.ARCHIVED
] as const;

export type ProfileResponseFilters = {
  userId: string;
  type: ApplicationType;
  status: { not: ApplicationStatus } | ApplicationStatus;
  OR?: Array<{ subject: { contains: string; mode: 'insensitive' } } | { message: { contains: string; mode: 'insensitive' } }>;
};

export async function getFullUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: {
        include: {
          city: true,
          avatarFile: { select: { fileKey: true, bucket: true, storageDriver: true } },
          workExperiences: { orderBy: { sortOrder: 'asc' } },
          profileSkills: { include: { skill: { select: { name: true, slug: true } } } }
        }
      }
    }
  });
}

export async function getProfileSettingsData(userId: string) {
  return Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            city: true,
            avatarFile: { select: { fileKey: true, bucket: true } },
            workExperiences: { orderBy: { sortOrder: 'asc' } },
            profileSkills: { include: { skill: true } }
          }
        }
      }
    }),
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true }
    }),
    prisma.skill.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    })
  ]);
}

export async function getSavedVacancies(userId: string) {
  return prisma.savedVacancy.findMany({
    where: {
      userId,
      vacancy: { status: ContentStatus.PUBLISHED }
    },
    include: {
      vacancy: {
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          companyName: true,
          salaryLabel: true,
          employmentType: true,
          city: { select: { name: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getUserApplication(applicationId: string, userId: string) {
  return prisma.application.findFirst({
    where: {
      id: applicationId,
      userId,
      type: profileResponseType,
      status: { not: ApplicationStatus.DRAFT }
    },
    include: {
      vacancy: { select: { title: true } },
      city: { select: { name: true } },
      businessAccount: { select: { companyName: true } }
    }
  });
}

export type ResponseRow = {
  id: string;
  type: ApplicationType;
  status: ApplicationStatus;
  createdAt: Date;
  subject: string | null;
  message: string | null;
  vacancy: { title: string; slug: string } | null;
};

export async function getUserResponses(
  where: Prisma.ApplicationWhereInput,
  sort: string,
  page: number,
  pageSize: number
) {
  return Promise.all([
    prisma.application.findMany({
      where,
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
        subject: true,
        message: true,
        vacancy: {
          select: { title: true, slug: true }
        }
      },
      orderBy: { createdAt: sort === 'asc' ? 'asc' : 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    }) as Promise<ResponseRow[]>,
    prisma.application.count({ where })
  ]);
}

export const inquiryResponseType = ApplicationType.SUPPLIER_INQUIRY;

export const inquiryResponseStatusValues: readonly ApplicationStatus[] = [
  ApplicationStatus.NEW,
  ApplicationStatus.IN_REVIEW,
  ApplicationStatus.CONTACTED,
  ApplicationStatus.APPROVED,
  ApplicationStatus.REJECTED,
  ApplicationStatus.COMPLETED,
  ApplicationStatus.ARCHIVED
] as const;

export type InquiryRow = {
  id: string;
  status: ApplicationStatus;
  createdAt: Date;
  subject: string | null;
  message: string | null;
  supplier: { title: string; slug: string } | null;
};

export async function getUserInquiries(
  userId: string,
  sort: string,
  page: number,
  pageSize: number
) {
  const where = {
    userId,
    type: inquiryResponseType,
    status: { not: ApplicationStatus.DRAFT }
  };

  return Promise.all([
    prisma.application.findMany({
      where,
      select: {
        id: true,
        status: true,
        createdAt: true,
        subject: true,
        message: true,
        supplier: { select: { title: true, slug: true } }
      },
      orderBy: { createdAt: sort === 'asc' ? 'asc' : 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    }) as Promise<InquiryRow[]>,
    prisma.application.count({ where })
  ]);
}

export async function getUserInquiry(applicationId: string, userId: string) {
  return prisma.application.findFirst({
    where: {
      id: applicationId,
      userId,
      type: inquiryResponseType,
      status: { not: ApplicationStatus.DRAFT }
    },
    include: {
      supplier: { select: { title: true, slug: true } }
    }
  });
}
