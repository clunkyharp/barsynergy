import { ApplicationType, type Prisma } from '@prisma/client';
import { z } from 'zod';
import { vacancyPositionValues } from '../vacancies/positions.ts';
import { buildApplicationPayload } from './application-payloads.ts';

export const businessApplicationTypes = [
  ApplicationType.VACANCY_SUBMISSION,
  ApplicationType.SUPPLIER_SUBMISSION,
  ApplicationType.PARTNER_APPLICATION,
  ApplicationType.CORPORATE_TRAINING_APPLICATION,
  ApplicationType.CERTIFICATE_ORDER
] as const;

const businessApplicationBaseSchema = z.object({
  applicationId: z.string().trim().optional(),
  title: z.string().trim().min(2).max(180),
  cityId: z.string().trim().optional(),
  details: z.string().trim().min(10).max(4000),
  employmentType: z.string().trim().max(100).optional(),
  salaryLabel: z.string().trim().max(120).optional(),
  experienceLabel: z.string().trim().max(120).optional(),
  serviceArea: z.string().trim().max(160).optional(),
  partnerType: z.string().trim().max(160).optional(),
  teamSize: z.string().trim().max(80).optional(),
  recipientName: z.string().trim().max(160).optional(),
  amountLabel: z.string().trim().max(120).optional(),
  consent: z.literal('accepted')
});

export const businessApplicationSchema = z.discriminatedUnion('type', [
  businessApplicationBaseSchema.extend({
    type: z.literal(ApplicationType.VACANCY_SUBMISSION),
    position: z.enum(vacancyPositionValues),
    shortDescription: z.string().trim().min(10).max(500)
  }),
  businessApplicationBaseSchema.extend({
    type: z.literal(ApplicationType.SUPPLIER_SUBMISSION),
    position: z.enum(vacancyPositionValues).optional(),
    shortDescription: z.string().trim().max(500).optional(),
    serviceArea: z.string().trim().min(2).max(160)
  }),
  businessApplicationBaseSchema.extend({
    type: z.literal(ApplicationType.PARTNER_APPLICATION),
    position: z.enum(vacancyPositionValues).optional(),
    shortDescription: z.string().trim().max(500).optional(),
    partnerType: z.string().trim().min(2).max(160)
  }),
  businessApplicationBaseSchema.extend({
    type: z.literal(ApplicationType.CORPORATE_TRAINING_APPLICATION),
    position: z.enum(vacancyPositionValues).optional(),
    shortDescription: z.string().trim().max(500).optional(),
    teamSize: z.string().trim().min(1).max(80)
  }),
  businessApplicationBaseSchema.extend({
    type: z.literal(ApplicationType.CERTIFICATE_ORDER),
    position: z.enum(vacancyPositionValues).optional(),
    shortDescription: z.string().trim().max(500).optional(),
    recipientName: z.string().trim().min(2).max(160),
    amountLabel: z.string().trim().min(1).max(120)
  })
]);

export type BusinessApplicationInput = z.infer<typeof businessApplicationSchema>;

export function parseBusinessApplicationInput(input: unknown) {
  return businessApplicationSchema.parse(input);
}

export function buildBusinessApplicationPayload(
  input: BusinessApplicationInput & { companyName: string }
): Prisma.InputJsonValue {
  const basePayload = {
    source: 'business_cabinet',
    companyName: input.companyName,
    title: input.title
  } as const;

  switch (input.type) {
    case ApplicationType.VACANCY_SUBMISSION:
      return buildApplicationPayload(input.type, {
        ...basePayload,
        position: input.position,
        employmentType: input.employmentType ?? null,
        salaryLabel: input.salaryLabel ?? null,
        experienceLabel: input.experienceLabel ?? null,
        shortDescription: input.shortDescription
      });
    case ApplicationType.SUPPLIER_SUBMISSION:
      return buildApplicationPayload(input.type, {
        ...basePayload,
        serviceArea: input.serviceArea
      });
    case ApplicationType.PARTNER_APPLICATION:
      return buildApplicationPayload(input.type, {
        ...basePayload,
        partnerType: input.partnerType
      });
    case ApplicationType.CORPORATE_TRAINING_APPLICATION:
      return buildApplicationPayload(input.type, {
        ...basePayload,
        teamSize: input.teamSize
      });
    case ApplicationType.CERTIFICATE_ORDER:
      return buildApplicationPayload(input.type, {
        ...basePayload,
        recipientName: input.recipientName,
        amountLabel: input.amountLabel
      });
  }
}
