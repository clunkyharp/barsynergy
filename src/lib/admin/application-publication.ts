import { ApplicationStatus, ApplicationType, ContentStatus, type Prisma } from '@prisma/client';
import { normalizeExternalUrlInput } from '../validation/external-url.ts';
import { getVacancyDraftFieldsFromApplication } from './vacancy-application-drafts.ts';
import { parseApplicationPayload } from '../applications/application-payloads.ts';

export const applicationPublicationStatusValues = [
  ApplicationStatus.NEW,
  ApplicationStatus.IN_REVIEW,
  ApplicationStatus.CONTACTED,
  ApplicationStatus.APPROVED
] as const;

type PublishableApplication = {
  type: ApplicationType;
  status: ApplicationStatus;
  vacancyId: string | null;
  supplierId: string | null;
  partnerId: string | null;
  cityId: string | null;
  message: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  telegram: string | null;
  consentAcceptedAt: Date | null;
  payload: Prisma.JsonValue | null;
};

function compactText(value?: string | null) {
  return value?.replace(/\s+/g, ' ').trim();
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 3).trimEnd()}...`;
}

function firstSummary(...candidates: (string | null | undefined)[]) {
  const summary = candidates.map(compactText).find((candidate) => candidate && candidate.length >= 10);

  if (!summary) {
    throw new Error('application publication requires summary');
  }

  return truncateText(summary, 500);
}

function requiredApplicationText(value: string | null | undefined, errorMessage: string) {
  const text = value?.trim();

  if (!text) {
    throw new Error(errorMessage);
  }

  return text;
}

function assertApplicationCanPublish(application: PublishableApplication) {
  if (!applicationPublicationStatusValues.includes(application.status as (typeof applicationPublicationStatusValues)[number])) {
    throw new Error('application publication requires review status');
  }

  if (!application.consentAcceptedAt) {
    throw new Error('application publication requires consent');
  }
}

export function isApplicationPublicationStatusAllowed(status: ApplicationStatus) {
  return applicationPublicationStatusValues.includes(status as (typeof applicationPublicationStatusValues)[number]);
}

export function getVacancyPublicationFieldsFromApplication(application: PublishableApplication) {
  assertApplicationCanPublish(application);

  return {
    ...getVacancyDraftFieldsFromApplication(application),
    status: ContentStatus.PUBLISHED
  };
}

export function getSupplierPublicationFieldsFromApplication(application: PublishableApplication) {
  assertApplicationCanPublish(application);

  if (application.type !== ApplicationType.SUPPLIER_SUBMISSION) {
    throw new Error('supplier publication requires supplier submission application');
  }

  if (application.supplierId) {
    throw new Error('supplier publication already exists for application');
  }

  const payload = parseApplicationPayload(ApplicationType.SUPPLIER_SUBMISSION, application.payload);
  const companyName = requiredApplicationText(payload.companyName, 'supplier publication requires company name');
  const serviceArea = payload.serviceArea ?? null;
  const title = payload.title ?? companyName;
  const description = requiredApplicationText(application.message, 'supplier publication requires description');
  const websiteUrl = normalizeExternalUrlInput(payload.websiteUrl) ?? null;

  return {
    title,
    summary: firstSummary(payload.title, serviceArea ? `${companyName}: ${serviceArea}` : null, description),
    description,
    status: ContentStatus.PUBLISHED,
    cityId: application.cityId,
    categoryId: null,
    companyName,
    websiteUrl,
    contactLabel: null,
    isVerified: false,
    serviceArea
  };
}

export function getPartnerPublicationFieldsFromApplication(application: PublishableApplication) {
  assertApplicationCanPublish(application);

  if (application.type !== ApplicationType.PARTNER_APPLICATION) {
    throw new Error('partner publication requires partner application');
  }

  if (application.partnerId) {
    throw new Error('partner publication already exists for application');
  }

  const payload = parseApplicationPayload(ApplicationType.PARTNER_APPLICATION, application.payload);
  const companyName = requiredApplicationText(payload.companyName, 'partner publication requires company name');
  const partnerType = payload.partnerType ?? null;
  const title = payload.title ?? companyName;
  const description = requiredApplicationText(application.message, 'partner publication requires description');
  const websiteUrl = normalizeExternalUrlInput(payload.websiteUrl) ?? null;

  return {
    title,
    summary: firstSummary(payload.title, partnerType ? `${companyName}: ${partnerType}` : null, description),
    description,
    status: ContentStatus.PUBLISHED,
    categoryId: null,
    companyName,
    websiteUrl,
    partnerType,
    isFeatured: false
  };
}
