import { ApplicationType, type Prisma } from '@prisma/client';
import { z } from 'zod';

const nullableString = z.string().trim().nullable().optional();
const optionalString = z.string().trim().optional();
const payloadSource = z.enum(['public_form', 'business_cabinet']).optional();

const businessAccountRequestPayloadSchema = z.object({
  companyName: z.string().trim().min(1),
  contactPerson: nullableString,
  websiteUrl: nullableString,
  description: nullableString
});

const courseApplicationPayloadSchema = z.object({
  courseTitle: z.string().trim().min(1)
});

const eventApplicationPayloadSchema = z.object({
  eventTitle: z.string().trim().min(1)
});

const vacancySubmissionPayloadSchema = z.object({
  source: payloadSource,
  companyName: z.string().trim().min(1),
  title: optionalString,
  position: z.string().trim().min(1),
  employmentType: nullableString,
  salaryLabel: nullableString,
  experienceLabel: nullableString,
  shortDescription: z.string().trim().min(1)
});

const vacancyResponsePayloadSchema = z.object({
  roleSummary: z.string().trim().min(1),
  resumeUrl: nullableString,
  employerCompanyName: nullableString
});

const supplierSubmissionPayloadSchema = z.object({
  source: payloadSource,
  companyName: z.string().trim().min(1),
  title: optionalString,
  websiteUrl: nullableString,
  serviceArea: z.string().trim().min(1)
});

const partnerApplicationPayloadSchema = z.object({
  source: payloadSource,
  companyName: z.string().trim().min(1),
  title: optionalString,
  partnerType: z.string().trim().min(1),
  websiteUrl: nullableString
});

const businessSolutionPayloadSchema = z.object({
  source: z.literal('public_form'),
  projectName: z.string().trim().min(1),
  solutionType: z.string().trim().min(1),
  solutionTypeLabel: z.string().trim().min(1)
});

const consultingRequestPayloadSchema = z.object({
  source: z.literal('public_form'),
  businessType: z.string().trim().min(1),
  businessTypeLabel: z.string().trim().min(1),
  projectStage: z.string().trim().min(1),
  projectStageLabel: z.string().trim().min(1),
  consultingDirection: z.string().trim().min(1),
  consultingDirectionLabel: z.string().trim().min(1),
  preferredExpert: nullableString,
  preferredExpertLabel: nullableString
});

const contactMessagePayloadSchema = z.object({
  topic: z.string().trim().min(1),
  topicLabel: z.string().trim().min(1),
  companyName: nullableString,
  teamSize: nullableString,
  topicTitle: nullableString,
  position: nullableString,
  employmentType: nullableString,
  salaryLabel: nullableString,
  supplierCategory: nullableString,
  serviceArea: nullableString,
  websiteUrl: nullableString,
  eventTitle: nullableString,
  eventDate: nullableString,
  venueName: nullableString,
  formatLabel: nullableString,
  registrationUrl: nullableString,
  partnerType: nullableString
});

const corporateTrainingPayloadSchema = z.object({
  source: payloadSource,
  companyName: optionalString,
  title: optionalString,
  teamSize: z.string().trim().min(1)
});

const certificateOrderPayloadSchema = z.object({
  source: payloadSource,
  companyName: optionalString,
  title: optionalString,
  recipientName: z.string().trim().min(1),
  amountLabel: z.string().trim().min(1)
});

export const applicationPayloadSchemas = {
  [ApplicationType.BUSINESS_ACCOUNT_REQUEST]: businessAccountRequestPayloadSchema,
  [ApplicationType.COURSE_APPLICATION]: courseApplicationPayloadSchema,
  [ApplicationType.EVENT_APPLICATION]: eventApplicationPayloadSchema,
  [ApplicationType.VACANCY_SUBMISSION]: vacancySubmissionPayloadSchema,
  [ApplicationType.VACANCY_RESPONSE]: vacancyResponsePayloadSchema,
  [ApplicationType.SUPPLIER_SUBMISSION]: supplierSubmissionPayloadSchema,
  [ApplicationType.PARTNER_APPLICATION]: partnerApplicationPayloadSchema,
  [ApplicationType.BUSINESS_SOLUTION]: businessSolutionPayloadSchema,
  [ApplicationType.CONSULTING_REQUEST]: consultingRequestPayloadSchema,
  [ApplicationType.CONTACT_MESSAGE]: contactMessagePayloadSchema,
  [ApplicationType.CORPORATE_TRAINING_APPLICATION]: corporateTrainingPayloadSchema,
  [ApplicationType.CERTIFICATE_ORDER]: certificateOrderPayloadSchema
} satisfies Record<ApplicationType, z.ZodType>;

export type ApplicationPayloadByType = {
  [ApplicationType.BUSINESS_ACCOUNT_REQUEST]: z.infer<typeof businessAccountRequestPayloadSchema>;
  [ApplicationType.COURSE_APPLICATION]: z.infer<typeof courseApplicationPayloadSchema>;
  [ApplicationType.EVENT_APPLICATION]: z.infer<typeof eventApplicationPayloadSchema>;
  [ApplicationType.VACANCY_SUBMISSION]: z.infer<typeof vacancySubmissionPayloadSchema>;
  [ApplicationType.VACANCY_RESPONSE]: z.infer<typeof vacancyResponsePayloadSchema>;
  [ApplicationType.SUPPLIER_SUBMISSION]: z.infer<typeof supplierSubmissionPayloadSchema>;
  [ApplicationType.PARTNER_APPLICATION]: z.infer<typeof partnerApplicationPayloadSchema>;
  [ApplicationType.BUSINESS_SOLUTION]: z.infer<typeof businessSolutionPayloadSchema>;
  [ApplicationType.CONSULTING_REQUEST]: z.infer<typeof consultingRequestPayloadSchema>;
  [ApplicationType.CONTACT_MESSAGE]: z.infer<typeof contactMessagePayloadSchema>;
  [ApplicationType.CORPORATE_TRAINING_APPLICATION]: z.infer<typeof corporateTrainingPayloadSchema>;
  [ApplicationType.CERTIFICATE_ORDER]: z.infer<typeof certificateOrderPayloadSchema>;
};

export function parseApplicationPayload<TType extends ApplicationType>(
  type: TType,
  payload: unknown
): ApplicationPayloadByType[TType] {
  return applicationPayloadSchemas[type].parse(payload) as ApplicationPayloadByType[TType];
}

export function safeParseApplicationPayload<TType extends ApplicationType>(
  type: TType,
  payload: unknown
): ReturnType<(typeof applicationPayloadSchemas)[TType]['safeParse']> {
  return applicationPayloadSchemas[type].safeParse(payload) as ReturnType<(typeof applicationPayloadSchemas)[TType]['safeParse']>;
}

export function buildApplicationPayload<TType extends ApplicationType>(
  type: TType,
  input: ApplicationPayloadByType[TType]
): Prisma.InputJsonValue {
  return parseApplicationPayload(type, input) as Prisma.InputJsonValue;
}

export function getApplicationPayloadText(
  type: ApplicationType,
  payload: unknown,
  keys: string[]
) {
  const parsed = safeParseApplicationPayload(type, payload);

  if (!parsed.success) {
    return null;
  }

  const values = parsed.data as Record<string, unknown>;

  for (const key of keys) {
    const value = values[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

const applicationPayloadLabels: Partial<Record<ApplicationType, Record<string, string>>> = {
  [ApplicationType.VACANCY_RESPONSE]: {
    roleSummary: 'Опыт и текущая роль',
    resumeUrl: 'Ссылка на резюме',
    employerCompanyName: 'Компания'
  },
  [ApplicationType.VACANCY_SUBMISSION]: {
    companyName: 'Компания',
    position: 'Позиция',
    employmentType: 'Формат',
    salaryLabel: 'Зарплата',
    experienceLabel: 'Опыт',
    shortDescription: 'Описание роли'
  },
  [ApplicationType.CONTACT_MESSAGE]: {
    topic: 'Тема',
    topicLabel: 'Тема',
    companyName: 'Компания',
    teamSize: 'Размер команды',
    topicTitle: 'Название',
    position: 'Позиция',
    employmentType: 'Формат',
    salaryLabel: 'Зарплата',
    supplierCategory: 'Категория поставщика',
    serviceArea: 'Направление',
    websiteUrl: 'Сайт',
    eventTitle: 'Событие',
    eventDate: 'Дата события',
    venueName: 'Площадка',
    formatLabel: 'Формат',
    registrationUrl: 'Ссылка регистрации',
    partnerType: 'Тип партнёрства'
  },
  [ApplicationType.COURSE_APPLICATION]: {
    courseTitle: 'Программа'
  },
  [ApplicationType.EVENT_APPLICATION]: {
    eventTitle: 'Событие'
  }
};

export function getApplicationPayloadEntries(type: ApplicationType, payload: unknown) {
  const parsed = safeParseApplicationPayload(type, payload);

  if (!parsed.success) {
    return [];
  }

  return Object.entries(parsed.data as Record<string, unknown>).filter(
    ([, value]) => value !== null && value !== undefined && value !== ''
  );
}

export function getApplicationPayloadDisplayEntries(type: ApplicationType, payload: unknown) {
  const entries = getApplicationPayloadEntries(type, payload);
  const labels = applicationPayloadLabels[type] ?? {};

  return entries
    .filter(([key]) => key !== 'source')
    .map(([key, value]) => ({
      key,
      label: labels[key] ?? key,
      value: String(value)
    }));
}
