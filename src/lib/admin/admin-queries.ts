import { prisma } from '@/lib/db/prisma';
import type { Prisma } from '@prisma/client';
import { ApplicationStatus, BusinessAccountStatus, CategoryType, ContentStatus } from '@prisma/client';

// ─── Dashboard queries ───────────────────────────────────────────────

export async function getDashboardStats() {
  return Promise.all([
    prisma.application.count({ where: { status: ApplicationStatus.NEW } }),
    prisma.application.count({ where: { status: ApplicationStatus.IN_REVIEW } }),
    prisma.application.count({ where: { status: ApplicationStatus.PAYMENT_PENDING } }),
    prisma.businessAccount.count({ where: { status: BusinessAccountStatus.PENDING } }),
    prisma.article.count({ where: { status: ContentStatus.DRAFT } }),
    prisma.event.count({ where: { status: ContentStatus.DRAFT } }),
    prisma.vacancy.count({ where: { status: ContentStatus.DRAFT } }),
    prisma.supplier.count({ where: { status: ContentStatus.DRAFT } }),
    prisma.generalSponsor.count({ where: { status: ContentStatus.DRAFT } }),
    prisma.article.count({ where: { status: ContentStatus.PUBLISHED } }),
    prisma.article.count({ where: { status: ContentStatus.ARCHIVED } }),
    prisma.event.count({ where: { status: ContentStatus.PUBLISHED } }),
    prisma.vacancy.count({ where: { status: ContentStatus.PUBLISHED } }),
    prisma.course.count({ where: { status: ContentStatus.PUBLISHED } }),
    prisma.partner.count({ where: { status: ContentStatus.PUBLISHED } }),
    prisma.supplier.count({ where: { status: ContentStatus.PUBLISHED } }),
    prisma.generalSponsor.count({ where: { status: ContentStatus.PUBLISHED } }),
    prisma.supplier.count({ where: { status: ContentStatus.PUBLISHED, cityId: null } }),
    prisma.category.count({ where: { isActive: true } }),
    prisma.city.count({ where: { isActive: true } }),
    prisma.tag.count({ where: { isActive: true } }),
    prisma.application.findMany({
      where: {
        status: { in: [ApplicationStatus.NEW, ApplicationStatus.IN_REVIEW, ApplicationStatus.PAYMENT_PENDING, ApplicationStatus.APPROVED] }
      },
      orderBy: [{ createdAt: 'desc' }],
      take: 8,
      select: { id: true, type: true, status: true, subject: true, name: true, createdAt: true }
    })
  ]);
}

export async function getNewApplicationCount() {
  return prisma.application.count({ where: { status: ApplicationStatus.NEW } });
}

// ─── Common selectors ────────────────────────────────────────────────

export async function getActiveCategories(type?: CategoryType) {
  return prisma.category.findMany({
    where: { ...(type ? { type } : {}), isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true }
  });
}

export async function getActiveCities() {
  return prisma.city.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true }
  });
}

export async function getActiveTags(type?: CategoryType) {
  return prisma.tag.findMany({
    where: { ...(type ? { type } : {}), isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true }
  });
}

export async function getActiveSkills() {
  return prisma.skill.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });
}

// ─── Application queries ─────────────────────────────────────────────

export async function getApplicationById(id: string) {
  return prisma.application.findUnique({
    where: { id },
    include: {
      city: { select: { name: true } },
      vacancy: { select: { id: true, title: true, slug: true, companyName: true } },
      supplier: { select: { id: true, title: true, slug: true, companyName: true } },
      partner: { select: { id: true, title: true, slug: true, companyName: true } },
      businessAccount: { select: { companyName: true, id: true, status: true, owner: { select: { email: true, id: true, status: true } } } },
      resumeFile: { select: { originalName: true, fileKey: true, bucket: true, storageDriver: true, mimeType: true, size: true } },
      user: { select: { email: true, role: true, status: true } },
      forwardedBy: { select: { email: true } },
      notifications: {
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { channel: true, status: true, createdAt: true }
      }
    }
  });
}

export async function getApplicationList(
  where: Prisma.ApplicationWhereInput,
  orderBy: Prisma.ApplicationOrderByWithRelationInput,
  skip: number,
  take: number
) {
  return Promise.all([
    prisma.application.findMany({
      where,
      orderBy,
      skip,
      take,
      select: {
        id: true,
        type: true,
        status: true,
        subject: true,
        name: true,
        email: true,
        phone: true,
        telegram: true,
        createdAt: true,
        updatedAt: true,
        city: { select: { name: true } },
        businessAccount: { select: { companyName: true } },
        vacancy: { select: { title: true, slug: true } },
        supplier: { select: { title: true, slug: true } },
        partner: { select: { title: true, slug: true } },
        resumeFileId: true,
        consentAcceptedAt: true,
        payload: true,
        businessNotes: true
      }
    }),
    prisma.application.count({ where })
  ]);
}

// ─── Article queries ─────────────────────────────────────────────────

export async function getArticleById(id: string) {
  return prisma.article.findUnique({
    where: { id },
    include: {
      coverImage: { select: { originalName: true } },
      tags: { select: { tagId: true } }
    }
  });
}

export async function getArticleList(
  where: Prisma.ArticleWhereInput,
  skip: number,
  take: number
) {
  return Promise.all([
    prisma.article.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      skip,
      take,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        category: { select: { name: true } },
        city: { select: { name: true } },
        coverImage: { select: { originalName: true } },
        tags: {
          where: { tag: { isActive: true } },
          orderBy: { tag: { sortOrder: 'asc' } },
          select: { tag: { select: { name: true } } }
        },
        updatedBy: { select: { email: true } }
      }
    }),
    prisma.article.count({ where })
  ]);
}

// ─── Event queries ───────────────────────────────────────────────────

export async function getEventById(id: string) {
  return prisma.event.findUnique({
    where: { id },
    include: {
      coverImage: { select: { originalName: true } }
    }
  });
}

export async function getEventList(
  where: Prisma.EventWhereInput,
  skip: number,
  take: number
) {
  return Promise.all([
    prisma.event.findMany({
      where,
      orderBy: [{ startsAt: 'desc' }, { createdAt: 'desc' }],
      skip,
      take,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        startsAt: true,
        endsAt: true,
        updatedAt: true,
        locationName: true,
        city: { select: { name: true } },
        category: { select: { name: true } },
        coverImage: { select: { originalName: true } },
        updatedBy: { select: { email: true } }
      }
    }),
    prisma.event.count({ where })
  ]);
}

// ─── Course queries ──────────────────────────────────────────────────

export async function getCourseById(id: string) {
  return prisma.course.findUnique({
    where: { id },
    include: {
      coverImage: { select: { originalName: true } }
    }
  });
}

export async function getCourseList(
  where: Prisma.CourseWhereInput,
  skip: number,
  take: number
) {
  return Promise.all([
    prisma.course.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      skip,
      take,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        format: true,
        durationLabel: true,
        level: true,
        priceLabel: true,
        category: { select: { name: true } },
        city: { select: { name: true } },
        coverImage: { select: { originalName: true } },
        updatedBy: { select: { email: true } }
      }
    }),
    prisma.course.count({ where })
  ]);
}

// ─── Vacancy queries ─────────────────────────────────────────────────

export async function getVacancyById(id: string) {
  return prisma.vacancy.findUnique({
    where: { id },
    include: {
      coverImage: { select: { originalName: true } },
      _count: { select: { applications: true } }
    }
  });
}

export async function getVacancyList(
  where: Prisma.VacancyWhereInput,
  skip: number,
  take: number
) {
  return Promise.all([
    prisma.vacancy.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      skip,
      take,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        companyName: true,
        position: true,
        salaryLabel: true,
        city: { select: { name: true } },
        category: { select: { name: true } },
        coverImage: { select: { originalName: true } },
        updatedBy: { select: { email: true } }
      }
    }),
    prisma.vacancy.count({ where })
  ]);
}

// ─── Supplier queries ────────────────────────────────────────────────

export async function getSupplierById(id: string) {
  return prisma.supplier.findUnique({
    where: { id },
    include: {
      coverImage: { select: { originalName: true } }
    }
  });
}

export async function getSupplierList(
  where: Prisma.SupplierWhereInput,
  skip: number,
  take: number
) {
  return Promise.all([
    prisma.supplier.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      skip,
      take,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        companyName: true,
        serviceArea: true,
        contactLabel: true,
        isVerified: true,
        city: { select: { name: true } },
        category: { select: { name: true } },
        coverImage: { select: { originalName: true } },
        updatedBy: { select: { email: true } }
      }
    }),
    prisma.supplier.count({ where })
  ]);
}

// ─── Partner queries ─────────────────────────────────────────────────

export async function getPartnerById(id: string) {
  return prisma.partner.findUnique({
    where: { id },
    include: {
      coverImage: { select: { originalName: true } }
    }
  });
}

export async function getPartnerList(
  where: Prisma.PartnerWhereInput,
  skip: number,
  take: number
) {
  return Promise.all([
    prisma.partner.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      skip,
      take,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        companyName: true,
        partnerType: true,
        isFeatured: true,
        category: { select: { name: true } },
        coverImage: { select: { originalName: true } },
        updatedBy: { select: { email: true } }
      }
    }),
    prisma.partner.count({ where })
  ]);
}

// ─── General Sponsor queries ─────────────────────────────────────────

export async function getGeneralSponsorList(where: Prisma.GeneralSponsorWhereInput, skip: number, take: number) {
  return Promise.all([
    prisma.generalSponsor.findMany({
      where,
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
      skip,
      take,
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        updatedAt: true,
        seasonLabel: true,
        isFeatured: true,
        logoPath: true,
        city: { select: { name: true } },
        logoImage: { select: { originalName: true } },
        coverImage: { select: { originalName: true } },
        updatedBy: { select: { email: true } }
      }
    }),
    prisma.generalSponsor.count({ where })
  ]);
}

export async function getGeneralSponsorById(id: string) {
  return prisma.generalSponsor.findUnique({
    where: { id },
    include: { coverImage: { select: { originalName: true } } }
  });
}

// ─── Category queries ────────────────────────────────────────────────

export async function getCategoryList() {
  return prisma.category.findMany({
    orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }, { name: 'asc' }]
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({ where: { id } });
}

// ─── City queries ────────────────────────────────────────────────────

export async function getCityList() {
  return prisma.city.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
  });
}

export async function getCityById(id: string) {
  return prisma.city.findUnique({ where: { id } });
}

// ─── Tag queries ─────────────────────────────────────────────────────

export async function getTagList(where?: Prisma.TagWhereInput) {
  return prisma.tag.findMany({
    where,
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { articleTags: true } } }
  });
}

export async function getTagById(id: string) {
  return prisma.tag.findUnique({ where: { id } });
}

// ─── Skill queries ───────────────────────────────────────────────────

export async function getSkillList(where?: Prisma.SkillWhereInput) {
  return prisma.skill.findMany({
    where,
    orderBy: { name: 'asc' },
    include: { _count: { select: { profileSkills: true } } }
  });
}

export async function getSkillById(id: string) {
  return prisma.skill.findUnique({ where: { id } });
}

// ─── User queries ────────────────────────────────────────────────────

export async function getUserList(
  where: Prisma.UserWhereInput,
  skip: number,
  take: number
) {
  return Promise.all([
    prisma.user.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      skip,
      take,
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        profile: { select: { fullName: true, city: { select: { name: true } } } },
        businessAccount: { select: { companyName: true, status: true, phone: true, telegram: true, contactPerson: true, city: { select: { name: true } }, applications: { take: 1, orderBy: { createdAt: 'desc' as const }, select: { id: true, type: true, status: true } } } },
        _count: { select: { applications: true } }
      }
    }),
    prisma.user.count({ where })
  ]);
}

// ─── Homepage CMS queries ────────────────────────────────────────────

export async function getHomepageCmsData() {
  return Promise.all([
    prisma.homepageHero.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.homepageAudienceCard.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.homepageSocialBlock.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.homepageCtaBlock.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.homepageCalculatorTeaser.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }] }),
    prisma.generalSponsor.findMany({ orderBy: [{ priority: 'asc' }, { updatedAt: 'desc' }], take: 6 })
  ]);
}

// ─── Business account queries ────────────────────────────────────────

export async function getActiveBusinessAccounts() {
  return prisma.businessAccount.findMany({
    where: { status: BusinessAccountStatus.ACTIVE },
    orderBy: { companyName: 'asc' },
    select: { id: true, companyName: true }
  });
}

export async function getVacancyStatusCounts(where: Prisma.VacancyWhereInput) {
  return prisma.vacancy.groupBy({
    by: ['status'],
    where,
    _count: { id: true }
  });
}

export async function getSupplierStatusCounts(where: Prisma.SupplierWhereInput) {
  return prisma.supplier.groupBy({
    by: ['status'],
    where,
    _count: { id: true }
  });
}
