import { prisma } from '@/lib/db/prisma';
import {
  getPage,
  getPageSize,
  listResult,
  optionalParam,
  optionalParams,
  publicImageUrl,
  type PublicContentSearchParams
} from './shared';

export async function getPublishedResumes(params: PublicContentSearchParams = {}) {
  const page = getPage(params);
  const pageSize = getPageSize(params);
  const q = optionalParam(params, 'q');
  const cityValues = optionalParams(params, 'city');
  const employmentValues = optionalParams(params, 'employmentType');
  const salaryMin = optionalParam(params, 'salaryMin');
  const salaryMax = optionalParam(params, 'salaryMax');
  const jobSearchValues = optionalParams(params, 'jobSearchStatus');
  const categoryValues = optionalParams(params, 'category');

  const where: Record<string, unknown> = {
    isPublic: true,
    publicHandle: { not: null },
  };

  if (q) {
    where.OR = [
      { fullName: { contains: q, mode: 'insensitive' as const } },
      { profession: { contains: q, mode: 'insensitive' as const } },
      { bio: { contains: q, mode: 'insensitive' as const } },
      { headline: { contains: q, mode: 'insensitive' as const } },
      { city: { name: { contains: q, mode: 'insensitive' as const } } },
    ];
  }

  if (cityValues) {
    where.city = { slug: { in: cityValues } };
  }

  if (employmentValues) {
    where.employmentTypes = { hasSome: employmentValues };
  }

  if (jobSearchValues) {
    where.jobSearchStatus = { in: jobSearchValues };
  }

  if (salaryMin) {
    where.desiredSalary = { gte: Number(salaryMin) };
  }

  if (salaryMax) {
    where.desiredSalaryMax = { lte: Number(salaryMax) };
  }

  if (categoryValues) {
    where.profession = { in: categoryValues };
  }

  const [total, profiles] = await Promise.all([
    prisma.profile.count({ where: where as never }),
    prisma.profile.findMany({
      where: where as never,
      orderBy: { publishedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        city: { select: { name: true, slug: true } },
        avatarFile: { select: { fileKey: true, bucket: true, visibility: true } },
      },
    }),
  ]);

  return listResult({
    params,
    page,
    pageSize,
    total,
    searchQuery: q,
    items: profiles.map((profile) => ({
      id: profile.id,
      title: profile.fullName ?? 'Специалист',
      slug: profile.publicHandle!,
      summary: profile.headline ?? profile.bio ?? profile.profession ?? '',
      kind: 'master' as const,
      label: profile.profession ?? undefined,
      subtitle: profile.headline ?? undefined,
      meta: [
        profile.city?.name,
        profile.profession,
        profile.desiredSalary ? `от ${profile.desiredSalary} ₽` : undefined,
      ].filter(Boolean) as string[],
      metaGroups: [
        profile.city?.name ? { label: 'Город', value: profile.city.name } : undefined,
        profile.profession ? { label: 'Профессия', value: profile.profession } : undefined,
        profile.desiredSalary ? { label: 'Зарплата', value: `от ${profile.desiredSalary} ₽${profile.desiredSalaryMax ? ` до ${profile.desiredSalaryMax} ₽` : ''}` } : undefined,
        profile.employmentTypes.length > 0 ? { label: 'Занятость', value: profile.employmentTypes.join(', ') } : undefined,
      ].filter(Boolean) as never[],
      updatedLabel: profile.publishedAt
        ? profile.publishedAt.toLocaleDateString('ru-RU')
        : undefined,
      imageUrl: publicImageUrl(profile.avatarFile),
      isNew: profile.publishedAt
        ? Date.now() - profile.publishedAt.getTime() < 7 * 24 * 60 * 60 * 1000
        : false,
    })),
  });
}

export async function getPublishedResumeDetail(handle: string) {
  const profile = await prisma.profile.findFirst({
    where: { publicHandle: handle, isPublic: true },
    include: {
      city: { select: { name: true } },
      avatarFile: { select: { fileKey: true, bucket: true, visibility: true } },
      workExperiences: { orderBy: { sortOrder: 'asc' } },
      profileSkills: {
        include: { skill: { select: { name: true } } },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!profile) return null;

  return {
    id: profile.id,
    fullName: profile.fullName,
    publicHandle: profile.publicHandle,
    headline: profile.headline,
    profession: profile.profession,
    bio: profile.bio,
    cityName: profile.city?.name,
    phone: profile.phone,
    telegram: profile.telegram,
    website: profile.website,
    jobSearchStatus: profile.jobSearchStatus,
    desiredSalary: profile.desiredSalary,
    desiredSalaryMax: profile.desiredSalaryMax,
    employmentTypes: profile.employmentTypes,
    skills: profile.profileSkills.map((ps) => ps.skill.name),
    workExperiences: profile.workExperiences.map((we) => ({
      companyName: we.companyName,
      position: we.position,
      startDate: we.startDate,
      endDate: we.endDate,
      description: we.description,
    })),
    imageUrl: publicImageUrl(profile.avatarFile),
    publishedAt: profile.publishedAt,
    updatedAt: profile.updatedAt,
  };
}
