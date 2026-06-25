import { CategoryType, ContentStatus, JobSearchStatus, MasterEntityType } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import {
  courseFormatOptions,
  courseLevelOptions,
  employmentTypeLabels,
  eventFormatOptions,
  getOptionLabel as getAdminOptionLabel,
  jobSearchStatusLabels,
  partnerTypeOptions,
  vacancyEmploymentTypeOptions
} from '@/modules/content/shared/labels';

export type PublicTaxonomyOption = {
  id: string;
  name: string;
  slug: string;
};

export type PublicSelectOption = {
  value: string;
  label: string;
};

function uniqueTextOptions(
  values: Array<string | null | undefined>,
  getLabel: (value: string) => string = (value) => value
): PublicSelectOption[] {
  const uniqueValues = Array.from(
    new Set(
      values
        .map((value) => value?.trim())
        .filter((value): value is string => Boolean(value))
    )
  );

  return uniqueValues
    .map((value) => ({ value, label: getLabel(value) }))
    .sort((left, right) => left.label.localeCompare(right.label, 'ru'));
}

export async function getPublicCategoryOptions(type: CategoryType): Promise<PublicTaxonomyOption[]> {
  return prisma.category.findMany({
    where: { type, isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, slug: true }
  });
}

export async function getPublicCityFilterOptions(): Promise<PublicTaxonomyOption[]> {
  return prisma.city.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, slug: true }
  });
}

export async function getCourseFilterOptions() {
  const [formats, levels] = await Promise.all([
    prisma.course.findMany({
      where: { status: ContentStatus.PUBLISHED, format: { not: null } },
      distinct: ['format'],
      select: { format: true }
    }),
    prisma.course.findMany({
      where: { status: ContentStatus.PUBLISHED, level: { not: null } },
      distinct: ['level'],
      select: { level: true }
    })
  ]);

  return {
    formats: uniqueTextOptions(formats.map((course) => course.format), (value) =>
      getAdminOptionLabel(courseFormatOptions, value, value)
    ),
    levels: uniqueTextOptions(levels.map((course) => course.level), (value) =>
      getAdminOptionLabel(courseLevelOptions, value, value)
    )
  };
}

export async function getEventFilterOptions() {
  const events = await prisma.event.findMany({
    where: { status: ContentStatus.PUBLISHED, format: { not: null } },
    distinct: ['format'],
    select: { format: true }
  });

  return {
    formats: uniqueTextOptions(events.map((event) => event.format), (value) =>
      getAdminOptionLabel(eventFormatOptions, value, value)
    )
  };
}

export async function getVacancyFilterOptions() {
  const vacancies = await prisma.vacancy.findMany({
    where: { status: ContentStatus.PUBLISHED, employmentType: { not: null } },
    distinct: ['employmentType'],
    select: { employmentType: true }
  });

  return {
    employmentTypes: uniqueTextOptions(vacancies.map((vacancy) => vacancy.employmentType), (value) =>
      getAdminOptionLabel(vacancyEmploymentTypeOptions, value, value)
    )
  };
}

export async function getPartnerFilterOptions() {
  const partners = await prisma.partner.findMany({
    where: { status: ContentStatus.PUBLISHED, partnerType: { not: null } },
    distinct: ['partnerType'],
    select: { partnerType: true }
  });

  return {
    partnerTypes: uniqueTextOptions(partners.map((partner) => partner.partnerType), (value) =>
      getAdminOptionLabel(partnerTypeOptions, value, value)
    )
  };
}

const masterSpecializationLabels: Record<string, string> = {
  'bar-setup': 'Настройка бара',
  'team-training': 'Обучение команды',
  'service-audit': 'Аудит сервиса',
  'equipment-service': 'Сервис оборудования',
  'coffee-machine-setup': 'Настройка кофемашин',
  'preventive-maintenance': 'Плановое обслуживание'
};

export async function getMasterFilterOptions() {
  const masters = await prisma.master.findMany({
    where: { status: ContentStatus.PUBLISHED },
    select: { specializations: true }
  });

  return {
    entityTypes: [
      { value: MasterEntityType.INDIVIDUAL, label: 'Частные мастера' },
      { value: MasterEntityType.BUSINESS, label: 'Компании' }
    ],
    specializations: uniqueTextOptions(
      masters.flatMap((master) => master.specializations),
      (value) => masterSpecializationLabels[value] ?? value
    ),
    experienceBuckets: [
      { value: '0-2', label: 'До 2 лет' },
      { value: '3-5', label: '3–5 лет' },
      { value: '6-plus', label: '6+ лет' }
    ],
    verified: [
      { value: 'true', label: 'Проверенные мастера' }
    ]
  };
}

export async function getSpecialistFilterOptions() {
  const [cities, masterCategories, seekingProfessions] = await Promise.all([
    getPublicCityFilterOptions(),
    getPublicCategoryOptions(CategoryType.MASTER),
    prisma.profile.findMany({
      where: { isPublic: true, publicHandle: { not: null }, profession: { not: null } },
      distinct: ['profession'],
      select: { profession: true }
    }),
  ]);

  return {
    cities,
    categories: masterCategories.map((c) => ({ value: c.slug, label: c.name })),
    professions: uniqueTextOptions(seekingProfessions.map((p) => p.profession)),
    employmentTypes: Object.entries(employmentTypeLabels).map(([value, label]) => ({ value, label })),
    jobSearchStatuses: Object.entries(jobSearchStatusLabels)
      .filter(([value]) => value !== JobSearchStatus.NOT_LOOKING)
      .map(([value, label]) => ({ value, label })),
    entityTypes: [
      { value: 'individual', label: 'Частные специалисты' },
      { value: 'business', label: 'Компании' },
    ],
    verified: [
      { value: 'true', label: 'Проверенные' },
    ],
    sortOptions: [
      { value: 'recent', label: 'Новые' },
      { value: 'verified', label: 'По верификации' },
      { value: 'experience', label: 'Опытные' },
    ],
  };
}
